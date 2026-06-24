import React from 'react';
import { Language, translate } from '../lib/translations';

interface LabelLink {
  text: string;
  url: string;
}

interface DJ {
  name: string;
  origin: string;
  labels: LabelLink[];
  instagram: string;
  soundcloud: string;
  image: string;
  objectPosition?: string;
}

interface LineupProps {
  lang: Language;
}

export const Lineup: React.FC<LineupProps> = ({ lang }) => {
  const djs: DJ[] = [
    {
      name: 'Falzar',
      origin: translate(lang, 'origin_france'),
      labels: [
        { text: 'Zenon Records', url: 'https://www.instagram.com/zenonrecords/' }
      ],
      instagram: 'https://www.instagram.com/falzaroparadise/',
      soundcloud: 'https://soundcloud.com/user-612695582',
      image: '/falzar.jpg',
    },
    {
      name: 'Rico',
      origin: translate(lang, 'origin_france'),
      labels: [
        { text: 'AlpaKa MuziK', url: 'https://www.instagram.com/alpaka_muzik/' },
        { text: 'Frequency Squad Rec.', url: 'https://www.instagram.com/frequencysquad/' }
      ],
      instagram: 'https://www.instagram.com/rico_utr/',
      soundcloud: 'https://soundcloud.com/rico-chiraque',
      image: '/rico.jpg',
    },
    {
      name: 'Medved',
      origin: translate(lang, 'origin_feldkirch'),
      labels: [
        { text: 'Sektor Techno', url: 'https://www.instagram.com/sektor.techno/' }
      ],
      instagram: 'https://www.instagram.com/medved_music/',
      soundcloud: 'https://soundcloud.com/medved_198',
      image: '/medved.jpg',
      objectPosition: 'top',
    },
    {
      name: "Play'N'Error",
      origin: translate(lang, 'origin_lindau'),
      labels: [
        { text: 'Kultur Lindau e.V.', url: 'https://www.instagram.com/kultur.lindau/' }
      ],
      instagram: 'https://www.instagram.com/play_n_error/',
      soundcloud: 'https://soundcloud.com/playnerror',
      image: '/playnerror.jpg',
    },
  ];

  return (
    <section className="lineup-section" id="lineup">
      <h2 className="section-title reveal" data-char-swap="true">{translate(lang, 'lineup_title')}</h2>
      <p className="section-subtitle" style={{ color: 'var(--text-muted)', marginBottom: '2rem' }}>
        {translate(lang, 'lineup_subtitle')}
      </p>

      <div className="lineup-grid">
        {djs.map((dj, index) => (
          <div key={index} className={`glass-panel dj-card reveal reveal-delay-${(index % 4) + 1}`}>
            <span className="dj-origin">{dj.origin}</span>
            
            {/* Profile Image */}
            <img 
              src={dj.image} 
              alt={dj.name} 
              className="dj-image" 
              style={dj.objectPosition ? { objectPosition: dj.objectPosition } : undefined}
            />

            <h3 className="dj-name">{dj.name}</h3>
            <p className="dj-label">
              {dj.labels.map((lbl, idx) => (
                <React.Fragment key={idx}>
                  {idx > 0 && ' / '}
                  <a
                    href={lbl.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="dj-label-link"
                  >
                    {lbl.text}
                  </a>
                </React.Fragment>
              ))}
            </p>
            
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
      <div className="glass-panel cooperation-box reveal" style={{ marginTop: '3rem' }}>
        <div className="cooperation-logos-container">
          <div className="cooperation-logos-track">
            {/* Set 1 */}
            <a
              href="https://www.instagram.com/frequencysquad/"
              target="_blank"
              rel="noopener noreferrer"
              className="cooperation-logo-link"
            >
              <img src="/frequency-squad.png" alt="Frequency Squad Logo" className="cooperation-logo-img" />
            </a>
            <a
              href="https://www.instagram.com/kultur.lindau/"
              target="_blank"
              rel="noopener noreferrer"
              className="cooperation-logo-link"
            >
              <img src="/kultur-lindau.png" alt="Kultur Lindau Logo" className="cooperation-logo-img white-bg" />
            </a>
            <a
              href="https://www.instagram.com/braincandysoundsystem/"
              target="_blank"
              rel="noopener noreferrer"
              className="cooperation-logo-link"
            >
              <img src="/braincandy-logo.jpg" alt="Braincandy Soundsystem Logo" className="cooperation-logo-img" />
            </a>
            <a
              href="https://maps.google.com/?q=Badesee+Untere+Au,+Frastanz"
              target="_blank"
              rel="noopener noreferrer"
              className="cooperation-logo-link"
            >
              <img src="/untere-au-logo.png" alt="Wirtschaft Untere Au Logo" className="cooperation-logo-img" />
            </a>

            {/* Set 2 (Duplicated for seamless looping) */}
            <a
              href="https://www.instagram.com/frequencysquad/"
              target="_blank"
              rel="noopener noreferrer"
              className="cooperation-logo-link"
            >
              <img src="/frequency-squad.png" alt="Frequency Squad Logo" className="cooperation-logo-img" />
            </a>
            <a
              href="https://www.instagram.com/kultur.lindau/"
              target="_blank"
              rel="noopener noreferrer"
              className="cooperation-logo-link"
            >
              <img src="/kultur-lindau.png" alt="Kultur Lindau Logo" className="cooperation-logo-img white-bg" />
            </a>
            <a
              href="https://www.instagram.com/braincandysoundsystem/"
              target="_blank"
              rel="noopener noreferrer"
              className="cooperation-logo-link"
            >
              <img src="/braincandy-logo.jpg" alt="Braincandy Soundsystem Logo" className="cooperation-logo-img" />
            </a>
            <a
              href="https://maps.google.com/?q=Badesee+Untere+Au,+Frastanz"
              target="_blank"
              rel="noopener noreferrer"
              className="cooperation-logo-link"
            >
              <img src="/untere-au-logo.png" alt="Wirtschaft Untere Au Logo" className="cooperation-logo-img" />
            </a>
          </div>
        </div>
        <p className="cooperation-text">
          🤝 {translate(lang, 'cooperation_text_1')}{' '}
          <a
            href="https://www.instagram.com/frequencysquad/"
            target="_blank"
            rel="noopener noreferrer"
            className="cooperation-link"
          >
            Frequency Squad
          </a>{' '}
          {translate(lang, 'cooperation_text_2')}{' '}
          <a
            href="https://www.instagram.com/kultur.lindau/"
            target="_blank"
            rel="noopener noreferrer"
            className="cooperation-link"
          >
            Kultur Lindau e.V.
          </a>{' '}
          {translate(lang, 'cooperation_text_3')}{' '}
          <a
            href="https://www.instagram.com/braincandysoundsystem/"
            target="_blank"
            rel="noopener noreferrer"
            className="cooperation-link"
          >
            Braincandy Soundsystem
          </a>
          {translate(lang, 'cooperation_text_4')}{' '}
          <a
            href="https://maps.google.com/?q=Badesee+Untere+Au,+Frastanz"
            target="_blank"
            rel="noopener noreferrer"
            className="cooperation-link"
          >
            Wirtschaft Untere Au
          </a>{' '}
          {translate(lang, 'cooperation_text_5')}
        </p>
      </div>
    </section>
  );
};
