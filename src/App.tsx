import React from 'react';
import { EventBasics } from './components/EventBasics';
import { Lineup } from './components/Lineup';
import { GameContainer } from './components/GameContainer';
import { Leaderboard } from './components/Leaderboard';

export default function App() {
  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    }
  };

  React.useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    revealElements.forEach((el) => observer.observe(el));

    return () => {
      revealElements.forEach((el) => observer.unobserve(el));
    };
  }, []);

  return (
    <>
      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-subtitle reveal reveal-delay-1">lose ur ground</p>
            <h1 className="hero-title reveal reveal-delay-2">
              FLOAT <span>Techno am See</span>
            </h1>
            <div className="hero-meta-container reveal reveal-delay-3">
              <span className="meta-item">📍 Untere Au, Frastanz</span>
              <span className="meta-item-separator">·</span>
              <span className="meta-item">⏰ 18:00 bis 24:00 Uhr</span>
              <span className="meta-item-separator">·</span>
              <span className="meta-item">🌅 Open Air</span>
            </div>
            
            <div className="hero-buttons reveal reveal-delay-4">
              <button
                onClick={() => scrollToSection('game-section')}
                className="btn btn-primary"
              >
                Spielen & Tickets gewinnen 🎮
              </button>
              <a
                href="https://eventfrog.at/de/p/partys/house-techno/daydance-am-see-7468717015454245477.html"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                Tickets kaufen 🎟️
              </a>
            </div>
          </div>
        </section>

        {/* Event Basics Section */}
        <EventBasics />

        {/* Lineup Section */}
        <Lineup />

        {/* Game Console Section */}
        <GameContainer />

        {/* Highscore Leaderboard Section */}
        <Leaderboard />
      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>© 2026 FLOAT Techno am See. Alle Rechte vorbehalten.</p>
        <p>
          FLOAT Techno am See Untere Au - Musik, See & Gemeinschaft.
        </p>
      </footer>
    </>
  );
}
