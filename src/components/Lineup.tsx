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
            <h3 className="dj-name">{dj.name}</h3>
            <p className="dj-label">{dj.label}</p>
            
            <div className="dj-links">
              <a
                href={dj.instagram}
                target="_blank"
                rel="noopener noreferrer"
                className="dj-link-btn instagram"
              >
                <span>📸 Instagram</span>
              </a>
              <a
                href={dj.soundcloud}
                target="_blank"
                rel="noopener noreferrer"
                className="dj-link-btn"
              >
                <span>🎵 SoundCloud</span>
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
