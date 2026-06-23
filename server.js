const express = require('express');
const cors = require('cors');
const crypto = require('crypto');
const admin = require('firebase-admin');
const path = require('path');

// Load environment variables
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3001;

app.use(cors());
app.use(express.json());

// Silence favicon 404 console errors
app.get('/favicon.ico', (req, res) => res.status(204).end());

// Serve the static files from the public folder
app.use(express.static(path.join(__dirname, 'public')));

// =========================================================================
// Deterministic Platform Verification Logic
// =========================================================================

class ServerPRNG {
  constructor(seed) {
    this.state = (seed ^ 0xDEADBEEF) >>> 0;
  }
  next() {
    let t = (this.state += 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }
  nextRange(min, max) {
    return min + this.next() * (max - min);
  }
}

class ServerPlatformManager {
  constructor(seed) {
    this.prng = new ServerPRNG(seed);
    this.generatedPlatforms = [
      {
        index: 0,
        x: 0,
        y: 460,
        width: 500,
        height: 200,
      }
    ];
  }

  getPlatform(index) {
    while (this.generatedPlatforms.length <= index) {
      const prev = this.generatedPlatforms[this.generatedPlatforms.length - 1];
      const i = this.generatedPlatforms.length;
      const difficulty = Math.min(i / 60, 1.0);

      const minGap = 75 + difficulty * 15;
      const maxGap = 120 + difficulty * 40;
      const gap = this.prng.nextRange(minGap, maxGap);

      const minWidth = Math.max(65, 100 - difficulty * 20);
      const maxWidth = Math.max(90, 140 - difficulty * 35);
      const width = this.prng.nextRange(minWidth, maxWidth);

      const yOffset = this.prng.nextRange(-25, 20);
      const y = Math.max(420, Math.min(480, 460 + yOffset));

      const x = prev.x + prev.width + gap;

      this.generatedPlatforms.push({
        index: i,
        x,
        y,
        width,
        height: 250,
      });
    }
    return this.generatedPlatforms[index];
  }
}

// =========================================================================
// Firebase Initialization & Fallback Dev Database (DX Bridge)
// =========================================================================

let db = null;
let isFirebaseConfigured = false;

// Mock database storage arrays for offline development fallback
const mockSessions = new Map();
const mockLeaderboard = [];
const mockFlaggedScores = [];

const serviceAccountJson = process.env.FIREBASE_SERVICE_ACCOUNT;
const projectId = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID || process.env.FIREBASE_PROJECT_ID;

if (serviceAccountJson || projectId) {
  try {
    if (serviceAccountJson) {
      const serviceAccount = JSON.parse(serviceAccountJson);
      admin.initializeApp({
        credential: admin.credential.cert(serviceAccount)
      });
    } else {
      admin.initializeApp({
        projectId: projectId
      });
    }
    db = admin.firestore();
    isFirebaseConfigured = true;
    console.log('🚀 Firebase Admin SDK initialized successfully with Firestore database connection.');
  } catch (err) {
    console.error('❌ Failed to initialize Firebase Admin SDK. Falling back to Local Mock Mode:', err.message);
  }
} else {
  console.warn('⚠️ No FIREBASE_SERVICE_ACCOUNT or NEXT_PUBLIC_FIREBASE_PROJECT_ID set in .env.');
  console.warn('⚠️ Express server is starting in LOCAL MOCK MODE. DB actions are simulated in-memory.');
}

// Helper to SHA-256 hash emails
function hashEmail(email) {
  return crypto.createHash('sha256').update(email).digest('hex');
}

// =========================================================================
// Express Endpoint Router
// =========================================================================

// Endpoint: Start Game Session
app.post('/api/session/start', async (req, res) => {
  try {
    const sessionId = crypto.randomUUID();
    const seed = Math.floor(Math.random() * 1000000);
    const now = Date.now();
    const expiresAt = now + 10 * 60 * 1000; // 10m lifespan

    const sessionPayload = {
      sessionId,
      seed,
      startTimestamp: now,
      expiresAt,
      used: false,
      userAgent: req.headers['user-agent'] || 'unknown',
    };

    if (isFirebaseConfigured) {
      await db.collection('gameSessions').doc(sessionId).set({
        sessionId,
        seed,
        startTimestamp: admin.firestore.Timestamp.fromMillis(now),
        expiresAt: admin.firestore.Timestamp.fromMillis(expiresAt),
        used: false,
        userAgent: sessionPayload.userAgent
      });
    } else {
      mockSessions.set(sessionId, sessionPayload);
    }

    return res.json({
      sessionId,
      seed,
      startTimestamp: now,
    });
  } catch (error) {
    console.error('Error starting session:', error);
    return res.status(500).json({ error: 'Serverfehler beim Erstellen der Spielsitzung.' });
  }
});

// Endpoint: Submit Score & Validate (Anti-Cheat Engine)
app.post('/api/session/submit', async (req, res) => {
  try {
    const {
      sessionId,
      score,
      durationMs,
      finalDistance,
      jumpEvents,
      deviceInfo,
      displayName,
      email,
      instagramHandle,
    } = req.body;

    // Normalizations
    const normalizedDisplayName = (displayName || '').trim().substring(0, 16);
    const normalizedEmail = (email || '').trim().toLowerCase();
    const normalizedInstagram = (instagramHandle || '')
      .trim()
      .toLowerCase()
      .replace(/^@/, '');

    if (!normalizedDisplayName || !normalizedEmail || !normalizedInstagram) {
      return res.status(400).json({ error: 'Name, E-Mail und Instagram-Handle sind Pflichtfelder.' });
    }

    const emailHash = hashEmail(normalizedEmail);

    let sessionData = null;

    // Resolve session
    if (isFirebaseConfigured) {
      const sessionDoc = await db.collection('gameSessions').doc(sessionId).get();
      if (sessionDoc.exists) {
        const d = sessionDoc.data();
        sessionData = {
          ...d,
          startTimestamp: d.startTimestamp.toMillis(),
          expiresAt: d.expiresAt.toMillis()
        };
      }
    } else {
      sessionData = mockSessions.get(sessionId);
    }

    // 1. Session Verification
    if (!sessionData) {
      return await recordFlagged(
        normalizedDisplayName,
        normalizedEmail,
        normalizedInstagram,
        score,
        durationMs,
        'Session ID not found on server',
        req.body,
        res
      );
    }

    if (sessionData.used) {
      return await recordFlagged(
        normalizedDisplayName,
        normalizedEmail,
        normalizedInstagram,
        score,
        durationMs,
        'Session already used (replay attempt)',
        req.body,
        res
      );
    }

    // Expiry Check
    const now = Date.now();
    if (now > sessionData.expiresAt) {
      return await recordFlagged(
        normalizedDisplayName,
        normalizedEmail,
        normalizedInstagram,
        score,
        durationMs,
        'Session expired (exceeded 10 minutes)',
        req.body,
        res
      );
    }

    // 2. Play Duration vs Server Time
    const actualElapsed = now - sessionData.startTimestamp;
    if (durationMs > actualElapsed + 2500) {
      return await recordFlagged(
        normalizedDisplayName,
        normalizedEmail,
        normalizedInstagram,
        score,
        durationMs,
        `Duration anomaly. Client reported: ${durationMs}ms, Server elapsed: ${actualElapsed}ms`,
        req.body,
        res
      );
    }

    // 3. Score Rate feasibility limit check
    // Max score increase is capped around 36 pts/s, safety buffer is set to 45 pts/s
    const scoreRate = score / (durationMs / 1000 || 1);
    if (score > 10 && scoreRate > 45) {
      return await recordFlagged(
        normalizedDisplayName,
        normalizedEmail,
        normalizedInstagram,
        score,
        durationMs,
        `Score rate impossible: ${scoreRate.toFixed(2)} pts/s`,
        req.body,
        res
      );
    }

    // 4. Deterministic platform positions check
    const seed = sessionData.seed;
    const platformManager = new ServerPlatformManager(seed);

    if (Array.isArray(jumpEvents)) {
      let lastJumpTime = -1000;
      
      for (const event of jumpEvents) {
        const { t, pIdx, pX, pY } = event;
        const expected = platformManager.getPlatform(pIdx);

        const coordsMatch = 
          Math.abs(expected.x - pX) < 1.0 && 
          Math.abs(expected.y - pY) < 1.0;

        if (!coordsMatch) {
          return await recordFlagged(
            normalizedDisplayName,
            normalizedEmail,
            normalizedInstagram,
            score,
            durationMs,
            `Platform coordinates mismatch at index ${pIdx}. Client: (${pX},${pY}), Server: (${expected.x},${expected.y})`,
            req.body,
            res
          );
        }

        // Check jump event interval density: minimum airtime threshold = 450ms
        const interval = t - lastJumpTime;
        if (interval < 450) {
          return await recordFlagged(
            normalizedDisplayName,
            normalizedEmail,
            normalizedInstagram,
            score,
            durationMs,
            `Jump events too dense. Interval: ${interval}ms`,
            req.body,
            res
          );
        }
        lastJumpTime = t;
      }
    }

    // 5. Score vs Distance ratio check
    const expectedScore = Math.floor(finalDistance / 15);
    if (Math.abs(score - expectedScore) > 3) {
      return await recordFlagged(
        normalizedDisplayName,
        normalizedEmail,
        normalizedInstagram,
        score,
        durationMs,
        `Distance/Score ratio mismatch. Score: ${score}, Expected: ${expectedScore} (Distance: ${finalDistance})`,
        req.body,
        res
      );
    }

    // 6. Validation passed: Mark session as used
    if (isFirebaseConfigured) {
      await db.collection('gameSessions').doc(sessionId).update({ used: true });
    } else {
      sessionData.used = true;
    }

    // =========================================================================
    // Firestore Write logic
    // =========================================================================
    if (isFirebaseConfigured) {
      const leaderboard = db.collection('leaderboard');
      
      // Look for duplicate records by emailHash or Instagram
      const dupEmail = await leaderboard.where('emailHash', '==', emailHash).get();
      const dupIg = await leaderboard.where('normalizedInstagram', '==', normalizedInstagram).get();

      let existingDoc = null;
      if (!dupEmail.empty) {
        existingDoc = dupEmail.docs[0];
      } else if (!dupIg.empty) {
        existingDoc = dupIg.docs[0];
      }

      if (existingDoc) {
        const existingData = existingDoc.data();
        const priorScore = existingData.score || 0;

        if (score > priorScore) {
          await existingDoc.ref.update({
            displayName: normalizedDisplayName,
            instagramHandle: instagramHandle.trim().replace(/^@/, ''),
            score: score,
            durationMs: durationMs,
            timestamp: admin.firestore.FieldValue.serverTimestamp(),
            bestRunData: {
              finalDistance,
              durationMs,
              deviceInfo,
            }
          });
          return res.json({
            success: true,
            isNewBest: true,
            message: `Neuer persönlicher Highscore! Dein Score wurde von ${priorScore} auf ${score} Punkte aktualisiert.`
          });
        } else {
          return res.json({
            success: true,
            isNewBest: false,
            message: `Dein vorheriger Score von ${priorScore} Punkten war besser. Wir haben deinen alten Score behalten.`
          });
        }
      }

      // Create new record
      const docId = crypto.randomUUID();
      await leaderboard.doc(docId).set({
        displayName: normalizedDisplayName,
        emailHash: emailHash,
        normalizedInstagram,
        instagramHandle: instagramHandle.trim().replace(/^@/, ''),
        score,
        durationMs,
        timestamp: admin.firestore.FieldValue.serverTimestamp(),
        validationStatus: 'valid',
        bestRunData: {
          finalDistance,
          durationMs,
          deviceInfo
        }
      });

      return res.json({
        success: true,
        isNewBest: true,
        message: `Dein Score von ${score} Punkten wurde erfolgreich eingetragen!`
      });

    } else {
      // IN-MEMORY MOCK DATABASE SIMULATIONS
      // Look for duplicate records by emailHash or Instagram
      const dupIndex = mockLeaderboard.findIndex(
        entry => entry.emailHash === emailHash || entry.normalizedInstagram === normalizedInstagram
      );

      if (dupIndex !== -1) {
        const existing = mockLeaderboard[dupIndex];
        const priorScore = existing.score;

        if (score > priorScore) {
          mockLeaderboard[dupIndex] = {
            ...existing,
            displayName: normalizedDisplayName,
            instagramHandle: instagramHandle.trim().replace(/^@/, ''),
            score,
            durationMs,
            timestamp: new Date()
          };

          // Resort mock database
          mockLeaderboard.sort((a, b) => b.score - a.score);

          return res.json({
            success: true,
            isNewBest: true,
            message: `[LOCAL MOCK] Neuer Highscore! Dein Score wurde von ${priorScore} auf ${score} Punkte aktualisiert.`
          });
        } else {
          return res.json({
            success: true,
            isNewBest: false,
            message: `[LOCAL MOCK] Dein vorheriger Score von ${priorScore} Punkten war besser! Altes Score behalten.`
          });
        }
      }

      // Add new mock entry
      mockLeaderboard.push({
        id: crypto.randomUUID(),
        displayName: normalizedDisplayName,
        emailHash,
        normalizedInstagram,
        instagramHandle: instagramHandle.trim().replace(/^@/, ''),
        score,
        durationMs,
        timestamp: new Date()
      });

      mockLeaderboard.sort((a, b) => b.score - a.score);

      return res.json({
        success: true,
        isNewBest: true,
        message: `[LOCAL MOCK] Dein Score von ${score} Punkten wurde erfolgreich eingetragen!`
      });
    }

  } catch (error) {
    console.error('Error submitting score:', error);
    return res.status(500).json({ error: 'Serverfehler beim Verifizieren der Spielerpunkte.' });
  }
});

// Endpoint: Fetch Leaderboard Rankings (Top 10)
app.get('/api/leaderboard', async (req, res) => {
  try {
    if (isFirebaseConfigured) {
      const snapshot = await db.collection('leaderboard').orderBy('score', 'desc').limit(10).get();
      const list = [];
      snapshot.forEach(doc => {
        const data = doc.data();
        list.push({
          id: doc.id,
          displayName: data.displayName || 'Unbekannt',
          instagramHandle: data.instagramHandle || '',
          score: data.score || 0,
        });
      });
      // Fallback to mocks if DB collection is completely empty
      if (list.length === 0) {
        return res.json(mockLeaderboard.map(e => ({ id: e.id, displayName: e.displayName, instagramHandle: e.instagramHandle, score: e.score })));
      }
      return res.json(list);
    } else {
      // Offline mock list
      return res.json(mockLeaderboard.map(e => ({ id: e.id, displayName: e.displayName, instagramHandle: e.instagramHandle, score: e.score })));
    }
  } catch (error) {
    console.error('Error fetching leaderboard:', error);
    return res.status(500).json({ error: 'Serverfehler beim Laden des Leaderboards.' });
  }
});

// Helper for flagged scores
async function recordFlagged(displayName, email, instagram, score, durationMs, reason, fullPayload, res) {
  const loggedFlag = {
    displayName,
    normalizedEmail: email,
    normalizedInstagram: instagram,
    score,
    durationMs,
    reason,
    timestamp: new Date(),
    payload: fullPayload,
  };

  if (isFirebaseConfigured) {
    try {
      await db.collection('flaggedScores').add({
        ...loggedFlag,
        timestamp: admin.firestore.FieldValue.serverTimestamp()
      });
    } catch (err) {
      console.error('Failed to log flagged score to db:', err);
    }
  } else {
    mockFlaggedScores.push(loggedFlag);
    console.warn(`🚨 [FLAGGED SCORE LOCAL] User "${displayName}" flagged. Reason: ${reason}`);
  }

  return res.status(400).json({
    error: 'Dein Score konnte nicht validiert werden. Verdacht auf unregelmäßiges Gameplay.'
  });
}

// Start Server
app.listen(PORT, () => {
  console.log(`================================================================`);
  console.log(`🟢 Express Validation API server is running on http://localhost:${PORT}`);
  console.log(`================================================================`);
});
