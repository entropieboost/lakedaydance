import React, { useRef, useEffect, useState } from 'react';
import { GameEngine, JumpEvent } from '../game/GameEngine';
import { AudioSynth } from '../game/AudioSynth';

type GameState = 'START' | 'PLAYING' | 'GAMEOVER' | 'SUBMITTING' | 'SUBMITTED' | 'ERROR';

export const GameContainer: React.FC = () => {
  const canvasRef = useRef<HTMLCanvasElement | null>(null);
  const engineRef = useRef<GameEngine | null>(null);
  const audioRef = useRef<AudioSynth>(new AudioSynth());
  
  // Game React States
  const [gameState, setGameState] = useState<GameState>('START');
  const [score, setScore] = useState(0);
  const [isMuted, setIsMuted] = useState(false);
  const [errorMsg, setErrorMsg] = useState('');
  
  // Session metadata
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [runData, setRunData] = useState<{
    score: number;
    durationMs: number;
    finalDistance: number;
    jumpEvents: JumpEvent[];
  } | null>(null);

  // Form Fields
  const [displayName, setDisplayName] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('game_displayName') || '';
    }
    return '';
  });
  const [email, setEmail] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('game_email') || '';
    }
    return '';
  });
  const [instagram, setInstagram] = useState(() => {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('game_instagram') || '';
    }
    return '';
  });
  const [consentDisplay, setConsentDisplay] = useState(false);
  const [consentRules, setConsentRules] = useState(false);
  const [submitResult, setSubmitResult] = useState<{ success: boolean; message: string; isNewBest?: boolean } | null>(null);

  // Toggle Mute handler
  const handleToggleMute = () => {
    const muted = audioRef.current.toggleMute();
    setIsMuted(muted);
  };

  // Scroll to game container and handle page scroll lock
  const scrollToGame = () => {
    if (canvasRef.current) {
      canvasRef.current.scrollIntoView({ behavior: 'auto', block: 'center' });
    }
  };

  // Prevent browser scrolling on Arrow Keys & Space while playing
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (gameState === 'PLAYING') {
        if (['Space', ' ', 'ArrowUp'].includes(e.code) || e.key === ' ') {
          e.preventDefault();
          engineRef.current?.jump();
        }
      } else if (gameState === 'START' || gameState === 'GAMEOVER') {
        if (e.key === 'Enter') {
          e.preventDefault();
          if (gameState === 'START') startGame();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [gameState]);

  // Prevent scrolling while game is active on mobile touchscreens
  useEffect(() => {
    const handleTouchMove = (e: TouchEvent) => {
      if (gameState === 'PLAYING') {
        e.preventDefault();
      }
    };

    window.addEventListener('touchmove', handleTouchMove, { passive: false });
    return () => window.removeEventListener('touchmove', handleTouchMove);
  }, [gameState]);

  // Touch listener on the canvas wrapper for mobile
  const handleCanvasInteraction = (e: React.MouseEvent | React.TouchEvent) => {
    if (gameState === 'PLAYING') {
      e.preventDefault();
      engineRef.current?.jump();
    }
  };

  // Start Session API call + Game Launch
  const startGame = async () => {
    // Unlock Web Audio Context synchronously inside user click event before any async calls
    audioRef.current.init();

    setGameState('PLAYING');
    setScore(0);
    setRunData(null);
    setSubmitResult(null);
    scrollToGame();

    // Lock page scroll on mobile during gameplay
    document.body.classList.add('game-active');

    let seed = Math.floor(Math.random() * 1000000);
    let sId = null;

    // Fetch session seed from server API
    try {
      const response = await fetch('/api/session/start', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.ok) {
        const data = await response.json();
        seed = data.seed;
        sId = data.sessionId;
        setSessionId(sId);
      } else {
        console.warn('Backend session start failed. Falling back to local offline mode.');
      }
    } catch (err) {
      console.warn('Backend start error, continuing offline:', err);
    }

    if (canvasRef.current) {
      // Re-instantiate engine
      if (engineRef.current) {
        engineRef.current.destroy();
      }

      engineRef.current = new GameEngine(
        canvasRef.current,
        seed,
        {
          onScoreUpdate: (s) => setScore(s),
          onGameOver: (data) => {
            setRunData(data);
            setGameState('GAMEOVER');
            document.body.classList.remove('game-active');
          },
        },
        audioRef.current
      );

      // Play initial jump sound to resume audio context
      audioRef.current.setMute(isMuted);
      engineRef.current.start();
    }
  };

  // Submit highscore form to API
  const handleSubmitScore = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!runData) return;
    if (!consentDisplay || !consentRules) {
      alert('Bitte stimme den Bedingungen und Regeln zu.');
      return;
    }

    setGameState('SUBMITTING');

    const payload = {
      sessionId,
      score: runData.score,
      durationMs: runData.durationMs,
      finalDistance: runData.finalDistance,
      jumpEvents: runData.jumpEvents,
      deviceInfo: {
        userAgent: navigator.userAgent,
        screenWidth: window.innerWidth,
        screenHeight: window.innerHeight,
      },
      displayName,
      email,
      instagramHandle: instagram,
    };

    // If sessionId is null, we are running in local/offline development fallback
    if (!sessionId) {
      setTimeout(() => {
        if (typeof window !== 'undefined') {
          localStorage.setItem('game_displayName', displayName);
          localStorage.setItem('game_email', email);
          localStorage.setItem('game_instagram', instagram);
        }
        setSubmitResult({
          success: true,
          message: 'Offline-Modus: Dein Score von ' + runData.score + ' Punkten wurde lokal simuliert eingetragen!',
          isNewBest: true
        });
        setGameState('SUBMITTED');
      }, 1000);
      return;
    }

    try {
      const response = await fetch('/api/session/submit', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const resData = await response.json();

      if (response.ok) {
        if (typeof window !== 'undefined') {
          localStorage.setItem('game_displayName', displayName);
          localStorage.setItem('game_email', email);
          localStorage.setItem('game_instagram', instagram);
        }
        setSubmitResult({
          success: true,
          message: resData.message || 'Score erfolgreich eingetragen!',
          isNewBest: resData.isNewBest
        });
        setGameState('SUBMITTED');
      } else {
        setSubmitResult({
          success: false,
          message: resData.error || 'Fehler beim Eintragen des Scores.',
        });
        setGameState('SUBMITTED');
      }
    } catch (err) {
      console.error('Submit API error:', err);
      setSubmitResult({
        success: false,
        message: 'Netzwerkfehler beim Eintragen deines Scores.',
      });
      setGameState('SUBMITTED');
    }
  };

  // Cleanup engine on component unmount
  useEffect(() => {
    return () => {
      if (engineRef.current) {
        engineRef.current.destroy();
      }
      document.body.classList.remove('game-active');
    };
  }, []);

  return (
    <section className="game-section" id="game-section">
      <h2 className="section-title reveal" data-char-swap="true">FLOAT Jump Challenge</h2>
      
      <div className="game-console reveal">
        {/* Aspect Ratio Viewport */}
        <div 
          className="canvas-wrapper"
          onClick={handleCanvasInteraction}
          onTouchStart={handleCanvasInteraction}
        >
          <canvas ref={canvasRef} className="game-canvas" />

          {/* START Overlay */}
          {gameState === 'START' && (
            <div className="game-overlay">
              <h3 className="game-overlay-title">FLOAT Jump</h3>
              <p className="game-overlay-desc">
                Springe von Stein zu Stein und fall nicht ins Wasser! Die Top 3 gewinnen Free Entry + Goodies.
              </p>
              <button className="btn btn-primary" onClick={startGame}>
                Spiel Starten
              </button>
              <div className="game-controls-hint">
                Desktop: Leertaste / Klick<br/>
                Mobile: Tippen auf Display
              </div>
            </div>
          )}

          {/* GAME OVER Screen */}
          {gameState === 'GAMEOVER' && runData && (
            <div className="game-overlay" style={{ overflowY: 'auto', justifyContent: 'flex-start', padding: '1.5rem 1rem' }}>
              <h3 className="game-overlay-title" style={{ color: 'var(--neon-pink)', marginTop: '0.5rem' }}>Game Over</h3>
              <p style={{ fontSize: '1.5rem', fontWeight: 800, color: '#fff', margin: '0.25rem 0' }}>
                {runData.score} Punkte
              </p>
              <p style={{ fontSize: '0.8rem', color: 'var(--text-muted)', marginBottom: '1rem' }}>
                Distanz: {runData.finalDistance}m · Zeit: {(runData.durationMs / 1000).toFixed(1)}s
              </p>

              {/* Submit Form */}
              <form className="submit-form" onSubmit={handleSubmitScore}>
                <div className="form-group">
                  <label className="form-label">Anzeigename</label>
                  <input
                    type="text"
                    required
                    maxLength={16}
                    placeholder="z.B. TechnoRaver"
                    className="form-input"
                    value={displayName}
                    onChange={(e) => setDisplayName(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">E-Mail (Privat für Gewinnbenachrichtigung)</label>
                  <input
                    type="email"
                    required
                    placeholder="name@domain.com"
                    className="form-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
                <div className="form-group">
                  <label className="form-label">Instagram Handle (Für Verifizierung)</label>
                  <input
                    type="text"
                    required
                    placeholder="z.B. @dein.name"
                    className="form-input"
                    value={instagram}
                    onChange={(e) => setInstagram(e.target.value)}
                  />
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', margin: '0.25rem 0' }}>
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      required
                      checked={consentDisplay}
                      onChange={(e) => setConsentDisplay(e.target.checked)}
                    />
                    <span>Ich bin einverstanden, dass mein Name & Instagram-Handle im Leaderboard angezeigt werden.</span>
                  </label>
                  <label className="form-checkbox-label">
                    <input
                      type="checkbox"
                      required
                      checked={consentRules}
                      onChange={(e) => setConsentRules(e.target.checked)}
                    />
                    <span>Ich akzeptiere die Gewinnspielregeln.</span>
                  </label>
                </div>

                <button type="submit" className="btn btn-primary" style={{ width: '100%', padding: '0.7rem' }}>
                  Score Eintragen
                </button>
              </form>

              <button 
                className="btn btn-secondary" 
                onClick={startGame} 
                style={{ width: '100%', padding: '0.6rem', marginTop: '0.5rem', fontSize: '0.85rem' }}
              >
                Direkt noch einmal spielen
              </button>

              <p className="privacy-disclaimer" style={{ marginTop: '0.75rem' }}>
                Deine E-Mail Adresse wird niemals öffentlich angezeigt. Wir kontaktieren dich ausschließlich im Falle eines Gewinns.
              </p>
            </div>
          )}

          {/* SUBMITTING STATE */}
          {gameState === 'SUBMITTING' && (
            <div className="game-overlay">
              <h3 className="game-overlay-title">Verifiziere Score...</h3>
              <p className="game-overlay-desc">Anti-Cheat Analyse läuft...</p>
              <div style={{
                width: '40px',
                height: '40px',
                border: '4px solid var(--border-card)',
                borderTopColor: 'var(--neon-cyan)',
                borderRadius: '50%',
                animation: 'spin 1s linear infinite'
              }}></div>
            </div>
          )}

          {/* SUBMITTED Result Screen */}
          {gameState === 'SUBMITTED' && submitResult && (
            <div className="game-overlay">
              <h3 className="game-overlay-title" style={{ color: submitResult.success ? 'var(--neon-cyan)' : 'var(--neon-pink)' }}>
                {submitResult.success ? 'Erfolgreich!' : 'Upps!'}
              </h3>
              <p className="game-overlay-desc" style={{ color: '#fff', marginBottom: '1.5rem' }}>
                {submitResult.message}
              </p>
              <button 
                className="btn btn-primary" 
                onClick={() => {
                  setGameState('START');
                  // Smoothly scroll down to Leaderboard so they can see their entry
                  const lb = document.getElementById('leaderboard');
                  if (lb) lb.scrollIntoView({ behavior: 'smooth' });
                }}
              >
                Leaderboard ansehen
              </button>
              <button 
                className="btn btn-secondary" 
                onClick={startGame}
                style={{ marginTop: '0.5rem', fontSize: '0.85rem', padding: '0.6rem 1.5rem' }}
              >
                Nochmal spielen
              </button>
            </div>
          )}
        </div>

        {/* Audio / Pause Panel underneath canvas wrapper */}
        <div className="console-hud">
          <button className="hud-button" onClick={handleToggleMute}>
            {isMuted ? '🔇 Mute: An' : '🔊 Sound: An'}
          </button>
          
          {gameState === 'PLAYING' && (
            <button className="hud-button" onClick={() => engineRef.current?.pause()}>
              ⏸️ Pause
            </button>
          )}

          {gameState === 'PLAYING' && engineRef.current?.pause && (
            <div style={{ display: 'none' }}></div> // Spacer
          )}
        </div>
      </div>
    </section>
  );
};
