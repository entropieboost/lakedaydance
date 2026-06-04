import React from 'react';

export const EventBasics: React.FC = () => {
  return (
    <section className="section-container" id="details">
      <h2 className="section-title">Event Infos</h2>
      <div className="basics-grid">
        {/* Ort */}
        <div className="glass-panel basic-card">
          <span className="card-icon">📍</span>
          <h3 className="card-title">Ort</h3>
          <p className="card-value">Untere Au, Frastanz</p>
          <p className="card-desc">Daydance direkt am malerischen Badesee. Parkplätze vor Ort vorhanden.</p>
        </div>

        {/* Zeit */}
        <div className="glass-panel basic-card">
          <span className="card-icon">⏰</span>
          <h3 className="card-title">Zeit</h3>
          <p className="card-value">18:00 - 24:00 Uhr</p>
          <p className="card-desc">Einlass ab 18:00 Uhr. Tanzen bis Mitternacht direkt unter freiem Himmel.</p>
        </div>

        {/* Musik */}
        <div className="glass-panel basic-card">
          <span className="card-icon">🔊</span>
          <h3 className="card-title">Musik & Lineup</h3>
          <p className="card-value">Techno / Psy-Techno / Dark Prog</p>
          <p className="card-desc">Treibende elektronische Bässe von regionalen & nationalen Acts.</p>
        </div>

        {/* Stimmung */}
        <div className="glass-panel basic-card">
          <span className="card-icon">🌅</span>
          <h3 className="card-title">Vibe</h3>
          <p className="card-value">Open Air & Sonnenuntergang</p>
          <p className="card-desc">Sommerliche Deko, kühle Drinks, Seezugang und erstklassige Soundanlage.</p>
        </div>

        {/* Ticket-Hinweis */}
        <div className="glass-panel ticket-notice-card">
          <span className="card-icon">🎟️</span>
          <h3 className="card-title">Tickets & Eintritt</h3>
          <p className="card-value" style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.4rem' }}>
            Sichere dir dein Ticket im Vorverkauf!
          </p>
          <p className="card-desc" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Der Vorverkauf über Event Frog ist deutlich günstiger als die Abendkassa vor Ort. Kontingent ist limitiert!
          </p>
          <a
            href="https://eventfrog.ch"
            target="_blank"
            rel="noopener noreferrer"
            className="btn btn-primary"
            style={{ fontSize: '0.9rem', padding: '0.75rem 1.75rem' }}
          >
            Tickets bei Event Frog kaufen
          </a>
        </div>
      </div>
    </section>
  );
};
