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
          style={{ position: 'relative', overflow: 'hidden' }}
        >
          <span className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
              <circle cx="12" cy="10" r="3" />
            </svg>
          </span>
          <h3 className="card-title" style={{ position: 'relative', zIndex: 1 }}>Ort</h3>
          <p className="card-value" style={{ position: 'relative', zIndex: 1 }}>Untere Au, Frastanz</p>
          <p className="card-desc" style={{ position: 'relative', zIndex: 1 }}>Daydance direkt am malerischen Badesee. Parkplätze vor Ort vorhanden.</p>
          
          {/* Animated Train/Bus Background */}
          <div className="card-bg-anim location-bg">
            <svg viewBox="0 0 150 100" fill="none" stroke="currentColor" strokeWidth="1.0">
              <line x1="0" y1="85" x2="150" y2="85" />
              <circle cx="20" cy="55" r="5" />
              <line x1="20" y1="60" x2="20" y2="85" />
              <rect x="25" y="70" width="18" height="15" rx="1" />
              <circle cx="28" cy="85" r="2" fill="currentColor" />
              <circle cx="40" cy="85" r="2" fill="currentColor" />
              <g className="train-loop">
                <rect x="0" y="55" width="28" height="12" rx="2" fill="rgba(255,255,255,0.02)" />
                <rect x="30" y="55" width="25" height="12" rx="2" fill="rgba(255,255,255,0.02)" />
                <rect x="4" y="58" width="5" height="4" stroke="currentColor" strokeWidth="0.8" />
                <rect x="12" y="58" width="5" height="4" stroke="currentColor" strokeWidth="0.8" />
                <rect x="20" y="58" width="5" height="4" stroke="currentColor" strokeWidth="0.8" />
                <rect x="34" y="58" width="5" height="4" stroke="currentColor" strokeWidth="0.8" />
                <rect x="42" y="58" width="5" height="4" stroke="currentColor" strokeWidth="0.8" />
                <circle cx="6" cy="69" r="2" fill="currentColor" />
                <circle cx="22" cy="69" r="2" fill="currentColor" />
                <circle cx="36" cy="69" r="2" fill="currentColor" />
                <circle cx="49" cy="69" r="2" fill="currentColor" />
              </g>
            </svg>
          </div>
        </a>

        {/* Zeit */}
        <div className="glass-panel basic-card interactive reveal reveal-delay-2" onClick={downloadICS} style={{ position: 'relative', overflow: 'hidden' }}>
          <span className="card-icon">
            <svg className="clock-icon-svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10" />
              <polyline points="12 6 12 12 16 14" className="clock-hands" />
            </svg>
          </span>
          <h3 className="card-title" style={{ position: 'relative', zIndex: 1 }}>Zeit</h3>
          <p className="card-value" style={{ position: 'relative', zIndex: 1 }}>18:00 - 24:00 Uhr</p>
          <p className="card-desc" style={{ position: 'relative', zIndex: 1 }}>Einlass ab 18:00 Uhr. Klicke hier, um den Termin im Kalender zu speichern.</p>
          
          {/* Animated Big Clock Background */}
          <div className="card-bg-anim time-bg">
            <svg viewBox="0 0 120 120" fill="none" stroke="currentColor" strokeWidth="0.8">
              <circle cx="60" cy="60" r="50" strokeDasharray="2 4" />
              <text x="56" y="24" fontSize="9" fontFamily="var(--font-heading)" fill="currentColor" stroke="none" fontWeight="bold">12</text>
              <text x="96" y="63" fontSize="9" fontFamily="var(--font-heading)" fill="currentColor" stroke="none" fontWeight="bold">3</text>
              <text x="58" y="102" fontSize="9" fontFamily="var(--font-heading)" fill="currentColor" stroke="none" fontWeight="bold">6</text>
              <text x="18" y="63" fontSize="9" fontFamily="var(--font-heading)" fill="currentColor" stroke="none" fontWeight="bold">9</text>
              <line className="clock-bg-hour" x1="60" y1="60" x2="60" y2="38" strokeWidth="1.6" strokeLinecap="round" />
              <line className="clock-bg-min" x1="60" y1="60" x2="82" y2="60" strokeWidth="1" strokeLinecap="round" />
              <circle cx="60" cy="60" r="3" fill="currentColor" />
            </svg>
          </div>
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
        <div className="glass-panel basic-card interactive reveal reveal-delay-4" onClick={scrollToLineup} style={{ position: 'relative', overflow: 'hidden' }}>
          <span className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2M4.22 4.22l1.42 1.42M1 12h2M21 12h2M18.36 5.64l1.42-1.42" />
              <path d="M17 12a5 5 0 0 0-10 0" fill="rgba(255,255,255,0.05)" />
              <path d="M2 16c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" />
              <path d="M2 20c2 0 3-1 5-1s3 1 5 1 3-1 5-1 3 1 5 1" opacity="0.6" />
            </svg>
          </span>
          <h3 className="card-title" style={{ position: 'relative', zIndex: 1 }}>Vibe</h3>
          <p className="card-value" style={{ position: 'relative', zIndex: 1 }}>Open Air & Sonnenuntergang</p>
          <p className="card-desc" style={{ position: 'relative', zIndex: 1 }}>Sommerliche Deko, kühle Drinks, Seezugang und erstklassige Soundanlage.</p>
          
          {/* Animated Swimmer & Cheers Background */}
          <div className="card-bg-anim vibe-bg">
            <svg viewBox="0 0 140 120" fill="none" stroke="currentColor" strokeWidth="1.0">
              <g className="swimmer-group">
                <path d="M10 95 C20 92, 25 98, 35 95 C45 92, 50 98, 60 95" strokeDasharray="1 2" />
                <circle cx="35" cy="82" r="4" fill="rgba(255,255,255,0.02)" />
                <path d="M25 87 Q35 75 42 87" strokeLinecap="round" />
              </g>
              <g className="clink-left">
                <rect x="75" y="45" width="14" height="20" rx="2" fill="rgba(255,255,255,0.02)" />
                <path d="M89 50 H93 V60 H89" />
                <path d="M62 58 L75 58" strokeWidth="1.8" />
              </g>
              <g className="clink-right">
                <rect x="105" y="45" width="14" height="20" rx="2" fill="rgba(255,255,255,0.02)" />
                <path d="M105 50 H101 V60 H105" />
                <path d="M132 58 L119 58" strokeWidth="1.8" />
              </g>
              <g className="clink-sparks">
                <line x1="97" y1="40" x2="97" y2="34" />
                <line x1="93" y1="42" x2="88" y2="38" />
                <line x1="101" y1="42" x2="106" y2="38" />
              </g>
            </svg>
          </div>
        </div>

        {/* Wetter */}
        <div className="glass-panel basic-card interactive reveal reveal-delay-5" onClick={openWeather} style={{ position: 'relative', overflow: 'hidden' }}>
          <span className="card-icon">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
              <path d="M12 2v2M4.93 4.93l1.41 1.41M20 12h2M17.66 6.34l1.41-1.41" className="weather-sun-rays" />
              <path d="M16 12a4 4 0 0 0-7.8-1.35H8a4 4 0 0 0 0 8h8a4 4 0 0 0 0-8z" fill="rgba(255,255,255,0.05)" />
            </svg>
          </span>
          <h3 className="card-title" style={{ position: 'relative', zIndex: 1 }}>Wetter</h3>
          <p className="card-value" style={{ position: 'relative', zIndex: 1 }}>Ausweichtermin vorhanden</p>
          <p className="card-desc" style={{ position: 'relative', zIndex: 1 }}>Klicke hier für das aktuelle Wetter in Frastanz. Bei Regen gibt es einen Ausweichtermin.</p>
          
          {/* Animated Rising Sun Background */}
          <div className="card-bg-anim weather-bg">
            <svg viewBox="0 0 130 110" fill="none" stroke="currentColor" strokeWidth="1.0">
              <line x1="15" y1="90" x2="115" y2="90" />
              <g className="sun-rise-group">
                <circle cx="65" cy="90" r="24" fill="rgba(255,255,255,0.02)" />
                <g className="sun-rays-rotate">
                  <line x1="65" y1="58" x2="65" y2="48" />
                  <line x1="65" y1="122" x2="65" y2="132" />
                  <line x1="33" y1="90" x2="23" y2="90" />
                  <line x1="97" y1="90" x2="107" y2="90" />
                  <line x1="42" y1="67" x2="35" y2="60" />
                  <line x1="88" y1="113" x2="95" y2="120" />
                  <line x1="88" y1="67" x2="95" y2="60" />
                  <line x1="42" y1="113" x2="35" y2="120" />
                </g>
              </g>
            </svg>
          </div>
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
