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

  return (
    <>
      {/* Header */}
      <header className="app-header">
        <div className="logo-text">Lake Daydance</div>
      </header>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-subtitle">Daydance am See</p>
            <h1 className="hero-title">
              Daydance <span>Frastanz</span>
            </h1>
            <p className="hero-meta">
              📍 Untere Au, Frastanz &nbsp;·&nbsp; ⏰ 18:00 bis 24:00 &nbsp;·&nbsp; 🌅 Open Air
            </p>
            
            <div className="hero-buttons">
              <a
                href="https://eventfrog.ch"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-primary"
              >
                Tickets sichern 🎟️
              </a>
              <button
                onClick={() => scrollToSection('game-section')}
                className="btn btn-secondary"
              >
                Lake Challenge spielen 🕹️
              </button>
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
        <p>© 2026 Lake Daydance Challenge Frastanz. Alle Rechte vorbehalten.</p>
        <p>
          Daydance Untere Au - Musik, See & Gemeinschaft.
        </p>
      </footer>
    </>
  );
}
