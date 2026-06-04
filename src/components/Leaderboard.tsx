import React, { useEffect, useState } from 'react';
import { db } from '../lib/firebase';
import { collection, query, orderBy, limit, onSnapshot } from 'firebase/firestore';

export interface LeaderboardEntry {
  id: string;
  displayName: string;
  instagramHandle: string;
  score: number;
  timestamp: any;
}

const MOCK_LEADERBOARD: LeaderboardEntry[] = [];

export const Leaderboard: React.FC = () => {
  const [entries, setEntries] = useState<LeaderboardEntry[]>([]);
  const [loading, setLoading] = useState(true);
  const [usingMock, setUsingMock] = useState(false);

  useEffect(() => {
    // Check if Firebase configurations are available
    const isFirebaseConfigured = process.env.NEXT_PUBLIC_FIREBASE_PROJECT_ID;

    if (!isFirebaseConfigured) {
      setEntries(MOCK_LEADERBOARD);
      setLoading(false);
      setUsingMock(true);
      return;
    }

    try {
      const q = query(
        collection(db, 'leaderboard'),
        orderBy('score', 'desc'),
        limit(10)
      );

      const unsubscribe = onSnapshot(
        q,
        (snapshot) => {
          const list: LeaderboardEntry[] = [];
          snapshot.forEach((doc) => {
            const data = doc.data();
            list.push({
              id: doc.id,
              displayName: data.displayName || 'Unbekannt',
              instagramHandle: data.instagramHandle || '',
              score: data.score || 0,
              timestamp: data.timestamp,
            });
          });

          // If database is empty, show mocks to keep UI populated and attractive
          if (list.length === 0) {
            setEntries(MOCK_LEADERBOARD);
          } else {
            setEntries(list);
          }
          setLoading(false);
          setUsingMock(false);
        },
        (error) => {
          console.warn('Firestore subscription failed, falling back to mock data:', error);
          setEntries(MOCK_LEADERBOARD);
          setLoading(false);
          setUsingMock(true);
        }
      );

      return () => unsubscribe();
    } catch (e) {
      console.warn('Firebase init failed, falling back to mock data:', e);
      setEntries(MOCK_LEADERBOARD);
      setLoading(false);
      setUsingMock(true);
    }
  }, []);

  return (
    <section className="section-container" id="leaderboard">
      <h2 className="section-title">Leaderboard</h2>
      
      <div className="glass-panel leaderboard-container">
        {loading ? (
          <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
            Lade Highscores...
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="leaderboard-table">
              <thead>
                <tr>
                  <th className="rank-cell">Rang</th>
                  <th>Raver</th>
                  <th style={{ textAlign: 'right' }}>Score</th>
                </tr>
              </thead>
              <tbody>
                {entries.length === 0 ? (
                  <tr>
                    <td colSpan={3} style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-muted)' }}>
                      Noch keine Highscores eingetragen. Sei der Erste! 🚀
                    </td>
                  </tr>
                ) : (
                  entries.map((entry, index) => {
                    const rank = index + 1;
                    let rowClass = 'leaderboard-row';
                    if (rank === 1) rowClass += ' leaderboard-row-top-1';
                    if (rank === 2) rowClass += ' leaderboard-row-top-2';
                    if (rank === 3) rowClass += ' leaderboard-row-top-3';

                    return (
                      <tr key={entry.id || index} className={rowClass}>
                        <td className="rank-cell">
                          {rank === 1 ? '🥇' : rank === 2 ? '🥈' : rank === 3 ? '🥉' : rank}
                        </td>
                        <td>
                          <div className="name-cell">
                            <span>{entry.displayName}</span>
                            {entry.instagramHandle && (
                              <a
                                href={`https://instagram.com/${entry.instagramHandle.replace('@', '')}`}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="ig-handle"
                              >
                                @{entry.instagramHandle.replace('@', '')}
                              </a>
                            )}
                            {rank <= 3 && (
                              <span className="badge-tag">🏆 Free Entry + Goodie</span>
                            )}
                          </div>
                        </td>
                        <td className="score-cell">{entry.score} pts</td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        )}

        {usingMock && (
          <div
            style={{
              padding: '0.5rem',
              background: 'rgba(255, 0, 127, 0.1)',
              borderRadius: '8px',
              border: '1px solid rgba(255, 0, 127, 0.25)',
              textAlign: 'center',
              fontSize: '0.8rem',
              color: 'var(--text-primary)',
            }}
          >
            ℹ️ <strong>Entwicklungsmodus:</strong> Aktuell werden Demo-Highscores angezeigt, da Firebase noch nicht fertig verbunden ist.
          </div>
        )}

        <div className="leaderboard-disclaimer">
          🔒 <strong>Fairplay & Info:</strong> Verdächtige oder manipulierte Scores werden automatisch gefiltert und gelöscht. Pro Person zählt nur der beste gültige Score. Wer bei Auslosung 24h vor Eventstart ganz oben steht, gewinnt!
        </div>

        <div className="glass-panel rules-box">
          <h3 className="rules-title">Gewinnspiel-Regeln</h3>
          <p className="rules-text">
            Die Top 3 gültigen Scores gewinnen je 1 Free-Entry-Ticket + Goodie. Pro Person zählt nur der beste gültige Score.
            Mehrfach-Accounts, Fake-Daten oder manipulierte Scores können entfernt werden. Die Gewinner werden über Instagram oder E-Mail kontaktiert.
            Der Rechtsweg ist ausgeschlossen.
          </p>
        </div>
      </div>
    </section>
  );
};
