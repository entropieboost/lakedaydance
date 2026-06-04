import React from 'react';

interface DJ {
  name: string;
  origin: string;
  label: string;
  badge: 'International' | 'Local Support';
  instagram: string;
  soundcloud: string;
}

export const Lineup: React.FC = () => {
  const djs: DJ[] = [
    {
      name: 'Falzar',
      origin: 'Frankreich 🇫🇷',
      label: 'Zenon Records',
      badge: 'International',
      instagram: 'https://www.instagram.com/zenonrecords/',
      soundcloud: 'https://soundcloud.com/zenon-records',
    },
    {
      name: 'Rico',
      origin: 'Frankreich 🇫🇷',
      label: 'AlpaKa MuziK / Frequency Squad Rec.',
      badge: 'International',
      instagram: 'https://www.instagram.com/frequencysquad/',
      soundcloud: 'https://soundcloud.com/fqsqd',
    },
    {
      name: 'Medved',
      origin: 'Feldkirch 🇦🇹',
      label: 'Sektor Kollektiv',
      badge: 'Local Support',
      instagram: 'https://www.instagram.com/sektorkollektiv/', // Fallback, commonly sektorkollektiv
      soundcloud: 'https://soundcloud.com/tinkosektor', // Tinko Sektor collective soundcloud reference
    },
    {
      name: "Play'N'Error",
      origin: 'Lindau (DE) 🇩🇪',
      label: 'Kultur Lindau e.V.',
      badge: 'Local Support',
      instagram: 'https://www.instagram.com/kultur.lindau/',
      soundcloud: 'https://soundcloud.com/hoerklangsoundsystem',
    },
  ];

  return (
    <section className="lineup-section" id="lineup">
      <h2 className="section-title">Line-Up</h2>
      <p className="section-subtitle" style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        Ein internationales Aufgebot der Extraklasse trifft auf regionalen Support.
      </p>

      <div className="lineup-grid">
        {djs.map((dj, index) => (
          <div key={index} className="glass-panel dj-card">
            <span className={`dj-badge ${dj.badge === 'Local Support' ? 'local' : ''}`}>
              {dj.badge}
            </span>
            <span className="dj-origin">{dj.origin}</span>
            
            {/* Profile Image */}
            <img src="/dj-placeholder.png" alt={dj.name} className="dj-image" />

            <h3 className="dj-name">{dj.name}</h3>
            <p className="dj-label">{dj.label}</p>
            
            <div className="dj-social-icons">
              <a
                href={dj.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                className="dj-icon-link soundcloud"
                title="SoundCloud"
              >
                <svg viewBox="0 0 24 24" fill="currentColor">
                  <path d="M13 18h7.5c1.93 0 3.5-1.57 3.5-3.5S22.43 11 20.5 11c-.17 0-.33.02-.5.05v-.05c0-1.66-1.34-3-3-3-.34 0-.67.04-.99.11C15.22 6.5 13.06 5.5 11 5.5c-2.42 0-4.44 1.7-4.9 4H6c-.55 0-1 .45-1 1v6.5c0 .55.45 1 1 1h7zm-8-5.5h1v4.5H5v-4.5zm-2 1h1v3H3v-3zm-2 1h1v1H1v-1zm12-7h1v10.5h-1V7.5zm-2 1h1v9.5h-1V8.5zm-2 1.5h1v8h-1v-8z" />
                </svg>
              </a>
              <a
                href={dj.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="dj-icon-link instagram"
                title="Instagram"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <rect x="2" y="2" width="20" height="20" rx="5" ry="5"></rect>
                  <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"></path>
                  <line x1="17.5" y1="6.5" x2="17.51" y2="6.5"></line>
                </svg>
              </a>
            </div>
          </div>
        ))}
      </div>

      {/* Cooperation Box */}
      <div className="glass-panel cooperation-box" style={{ marginTop: '3rem' }}>
        <p className="cooperation-text">
          🤝 Dieses Event wird in enger Freundschaft und Kooperation von den Vereinen 
          <strong> Frequency Squad</strong> und <strong>Kultur Lindau e.V.</strong> veranstaltet, 
          um die elektronische Musikkultur in der Region Bodensee-Vorarlberg zu stärken.
        </p>
      </div>
    </section>
  );
};
