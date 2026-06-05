import React from 'react';

export const EventBasics: React.FC = () => {
  const downloadICS = (e: React.MouseEvent) => {
    e.preventDefault();
    const icsData = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//Lake Daydance//DE',
      'BEGIN:VEVENT',
      'UID:daydance-frastanz-2026',
      'DTSTAMP:20260604T180000Z',
      'DTSTART:20260815T160000Z', // Saturday, August 15, 2026 from 18:00 (16:00 UTC)
      'DTEND:20260815T220000Z',   // to 24:00 (22:00 UTC)
      'SUMMARY:Lake Daydance Frastanz',
      'DESCRIPTION:Daydance direkt am malerischen Badesee Untere Au. Techno\\, Psy-Techno\\, Dark Prog.',
      'LOCATION:Badesee Untere Au\\, Frastanz',
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsData], { type: 'text/calendar;charset=utf-8' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', 'daydance.ics');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const scrollToLineup = () => {
    document.getElementById('lineup')?.scrollIntoView({ behavior: 'smooth' });
  };

  const openWeather = () => {
    window.open('https://www.google.com/search?q=wetter+frastanz', '_blank');
  };

  return (
    <section className="section-container" id="details">
      <h2 className="section-title reveal">Event Infos</h2>
      <div className="basics-grid">
        {/* Ort */}
        <a
          href="https://maps.google.com/?q=Badesee+Untere+Au,+Frastanz"
          target="_blank"
          rel="noopener noreferrer"
          className="glass-panel basic-card interactive reveal reveal-delay-1"
        >
          <span className="card-icon">📍</span>
          <h3 className="card-title">Ort</h3>
          <p className="card-value">Untere Au, Frastanz</p>
          <p className="card-desc">Daydance direkt am malerischen Badesee. Parkplätze vor Ort vorhanden.</p>
        </a>

        {/* Zeit */}
        <div className="glass-panel basic-card interactive reveal reveal-delay-2" onClick={downloadICS}>
          <span className="card-icon">⏰</span>
          <h3 className="card-title">Zeit</h3>
          <p className="card-value">18:00 - 24:00 Uhr</p>
          <p className="card-desc">Einlass ab 18:00 Uhr. Klicke hier, um den Termin im Kalender zu speichern.</p>
        </div>

        {/* Musik */}
        <div className="glass-panel basic-card interactive reveal reveal-delay-3" onClick={scrollToLineup}>
          <span className="card-icon">🔊</span>
          <h3 className="card-title">Musik & Lineup</h3>
          <p className="card-value">Techno / Psy-Techno / Dark Prog</p>
          <p className="card-desc">Treibende elektronische Bässe von regionalen & nationalen Acts. Klicke hier zum Lineup.</p>
        </div>

        {/* Stimmung */}
        <div className="glass-panel basic-card reveal reveal-delay-4">
          <span className="card-icon">🌅</span>
          <h3 className="card-title">Vibe</h3>
          <p className="card-value">Open Air & Sonnenuntergang</p>
          <p className="card-desc">Sommerliche Deko, kühle Drinks, Seezugang und erstklassige Soundanlage.</p>
        </div>

        {/* Wetter */}
        <div className="glass-panel basic-card interactive reveal reveal-delay-5" onClick={openWeather}>
          <span className="card-icon">🌦️</span>
          <h3 className="card-title">Wetter</h3>
          <p className="card-value">Ausweichtermin vorhanden</p>
          <p className="card-desc">Klicke hier für das aktuelle Wetter in Frastanz. Bei Regen gibt es einen Ausweichtermin.</p>
        </div>

        {/* Ticket-Hinweis */}
        <div className="glass-panel ticket-notice-card reveal">
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
