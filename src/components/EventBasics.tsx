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
          <span className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <h3 className="card-title">Ort</h3>
          <p className="card-value">Untere Au, Frastanz</p>
          <p className="card-desc">Daydance direkt am malerischen Badesee. Parkplätze vor Ort vorhanden.</p>
        </a>

        {/* Zeit */}
        <div className="glass-panel basic-card interactive reveal reveal-delay-2" onClick={downloadICS}>
          <span className="card-icon">
            <svg className="clock-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" className="clock-hands" />
            </svg>
          </span>
          <h3 className="card-title">Zeit</h3>
          <p className="card-value">18:00 - 24:00 Uhr</p>
          <p className="card-desc">Einlass ab 18:00 Uhr. Klicke hier, um den Termin im Kalender zu speichern.</p>
        </div>

        {/* Musik */}
        <div className="glass-panel basic-card interactive reveal reveal-delay-3" onClick={scrollToLineup} style={{ position: 'relative', overflow: 'hidden' }}>
          <span className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <rect x="4" y="2" width="16" height="20" rx="2" ry="2" />
              <circle cx="12" cy="14" r="4" className="bass-cone" />
              <circle cx="12" cy="14" r="1" />
              <circle cx="12" cy="6" r="2.5" />
            </svg>
          </span>
          <h3 className="card-title" style={{ position: 'relative', zIndex: 1 }}>Musik & Lineup</h3>
          <p className="card-value" style={{ position: 'relative', zIndex: 1 }}>Techno / Psy-Techno / Dark Prog</p>
          <p className="card-desc" style={{ position: 'relative', zIndex: 1 }}>Treibende elektronische Bässe von regionalen & nationalen Acts. Klicke hier zum Lineup.</p>
          
          {/* Animated Funktion-One Background Speaker Stack */}
          <div className="f1-speaker-bg">
            <svg viewBox="0 0 100 150" fill="none" stroke="currentColor" strokeWidth="1.2">
              <rect x="25" y="10" width="50" height="38" rx="2" fill="rgba(255,255,255,0.02)"/>
              <path className="f1-axehead" d="M50 14 L32 28 L44 32 L44 42 L56 42 L56 32 L68 28 Z" fill="rgba(255,255,255,0.08)" strokeWidth="1"/>
              
              <rect x="20" y="52" width="60" height="42" rx="2" fill="rgba(255,255,255,0.02)"/>
              <circle className="f1-cone-mid" cx="50" cy="73" r="16" fill="rgba(255,255,255,0.03)"/>
              <circle cx="50" cy="73" r="5" fill="currentColor"/>
              
              <rect x="14" y="98" width="72" height="46" rx="2" fill="rgba(255,255,255,0.02)"/>
              <circle className="f1-cone-bass" cx="34" cy="121" r="14" fill="rgba(255,255,255,0.03)"/>
              <circle className="f1-cone-bass" cx="66" cy="121" r="14" fill="rgba(255,255,255,0.03)"/>
              <circle cx="34" cy="121" r="4" fill="currentColor"/>
              <circle cx="66" cy="121" r="4" fill="currentColor"/>
            </svg>
          </div>
        </div>

        {/* Stimmung */}
        <div className="glass-panel basic-card reveal reveal-delay-4">
          <span className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2M4.22 4.22l1.42 1.42M1 12h2M21 12h2M18.36 5.64l1.42-1.42" />
              <path d="M17 12a5 5 0 0 0-10 0" fill="rgba(255,255,255,0.05)" />
              <path d="M2 16c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
              <path d="M2 20c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" opacity="0.6" />
            </svg>
          </span>
          <h3 className="card-title">Vibe</h3>
          <p className="card-value">Open Air & Sonnenuntergang</p>
          <p className="card-desc">Sommerliche Deko, kühle Drinks, Seezugang und erstklassige Soundanlage.</p>
        </div>

        {/* Wetter */}
        <div className="glass-panel basic-card interactive reveal reveal-delay-5" onClick={openWeather}>
          <span className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M17.66 6.34l1.41-1.41" className="weather-sun-rays" />
              <path d="M16 12a4 4 0 0 0-7.8-1.35H8a4 4 0 0 0 0 8h8a4 4 0 0 0 0-8z" fill="rgba(255,255,255,0.05)" />
            </svg>
          </span>
          <h3 className="card-title">Wetter</h3>
          <p className="card-value">Ausweichtermin vorhanden</p>
          <p className="card-desc">Klicke hier für das aktuelle Wetter in Frastanz. Bei Regen gibt es einen Ausweichtermin.</p>
        </div>

        {/* Ticket-Hinweis */}
        <div className="glass-panel ticket-notice-card reveal">
          <span className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M2 9a3 3 0 0 1 0 6v2a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2v-2a3 3 0 0 1 0-6V7a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v2z" fill="rgba(255,255,255,0.05)" />
              <line x1="12" y1="5" x2="12" y2="19" strokeDasharray="3 3" />
            </svg>
          </span>
          <h3 className="card-title">Tickets & Eintritt</h3>
          <p className="card-value" style={{ margin: '0.25rem 0 0.5rem', fontSize: '1.4rem' }}>
            Sichere dir dein Ticket im Vorverkauf!
          </p>
          <p className="card-desc" style={{ marginBottom: '1rem', color: 'var(--text-primary)' }}>
            Der Vorverkauf über Event Frog ist deutlich günstiger als die Abendkassa vor Ort. Kontingent ist limitiert!
          </p>
          <a
            href="https://eventfrog.at/de/p/partys/house-techno/daydance-am-see-7468717015454245477.html"
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
