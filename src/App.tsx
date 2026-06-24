import React from 'react';
import { EventBasics } from './components/EventBasics';
import { Lineup } from './components/Lineup';
import { GameContainer } from './components/GameContainer';
import { Leaderboard } from './components/Leaderboard';
import { Language, translate } from './lib/translations';

// Character Scrambler effect (matrix/cyber decode feel)
const scrambleText = (el: HTMLElement) => {
  const original = el.getAttribute('data-original') || el.innerText;
  if (!el.getAttribute('data-original')) {
    el.setAttribute('data-original', original);
  }
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789/@#$+-*%';
  let frame = 0;
  const queue = original.split('').map((to, i) => {
    const start = Math.floor(Math.random() * 12);
    const end = start + Math.floor(Math.random() * 12);
    return { to, start, end, char: '' };
  });

  let rAF: number;
  const tick = () => {
    let output = '';
    let done = 0;
    for (let i = 0; i < queue.length; i++) {
      const q = queue[i];
      if (original[i] === ' ' || original[i] === '\n') {
        output += original[i];
        done++;
      } else if (frame >= q.end) {
        output += q.to;
        done++;
      } else if (frame >= q.start) {
        if (!q.char || Math.random() < 0.38) {
          q.char = chars[Math.floor(Math.random() * chars.length)];
        }
        output += q.char;
      } else {
        output += original[i];
      }
    }
    el.innerText = output;
    if (done === queue.length) {
      cancelAnimationFrame(rAF);
    } else {
      frame++;
      rAF = requestAnimationFrame(tick);
    }
  };
  tick();
};

export default function App() {
  const [lang, setLang] = React.useState<Language>(() => {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('float-lang');
      if (saved === 'de' || saved === 'en') return saved as Language;
    }
    return 'de';
  });

  const handleLangChange = (newLang: Language) => {
    setLang(newLang);
    localStorage.setItem('float-lang', newLang);
    // Clear scrambled text cache so new language texts can be scrambled correctly
    document.querySelectorAll('[data-char-swap]').forEach((el) => {
      el.removeAttribute('data-original');
    });
  };

  const scrollToSection = (id: string) => {
    const el = document.getElementById(id);
    if (el) {
      if ((window as any).lenis) {
        (window as any).lenis.scrollTo(el);
      } else {
        el.scrollIntoView({ behavior: 'smooth' });
      }
    }
  };

  React.useEffect(() => {
    // 1. Scroll Reveal Observer
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('reveal-visible');
            // Trigger character scramble on reveal
            if (entry.target.hasAttribute('data-char-swap')) {
              scrambleText(entry.target as HTMLElement);
            }
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    );

    const revealElements = document.querySelectorAll('.reveal, .reveal-left, .reveal-right');
    revealElements.forEach((el) => observer.observe(el));

    // Scramble on hover
    const scrambleElements = document.querySelectorAll('[data-char-swap]');
    const scrambleListeners = new Map<Element, () => void>();
    scrambleElements.forEach((el) => {
      const listener = () => scrambleText(el as HTMLElement);
      el.addEventListener('mouseenter', listener);
      scrambleListeners.set(el, listener);
    });



    // 3. Interactive Liquid Wave Canvas Background
    const canvas = document.getElementById('waveCanvas') as HTMLCanvasElement;
    let cleanupWaves = () => {};

    if (canvas) {
      const ctx = canvas.getContext('2d');
      const parent = canvas.parentElement;

      if (ctx && parent) {
        let canvasMouseX = -1000;
        let canvasMouseY = -1000;
        let canvasTargetMouseX = -1000;
        let canvasTargetMouseY = -1000;

        const onCanvasMouseMove = (e: MouseEvent) => {
          const rect = canvas.getBoundingClientRect();
          canvasTargetMouseX = e.clientX - rect.left;
          canvasTargetMouseY = e.clientY - rect.top;
        };

        const onCanvasMouseLeave = () => {
          canvasTargetMouseX = -1000;
          canvasTargetMouseY = -1000;
        };

        window.addEventListener('mousemove', onCanvasMouseMove);

        const resize = () => {
          canvas.width = parent.clientWidth;
          canvas.height = parent.clientHeight;
        };
        window.addEventListener('resize', resize);
        resize();

        const lineCount = 12;
        const pointsPerLine = 40;
        const lines: { x: number; baseY: number; y: number; vy: number }[][] = [];

        const spacing = canvas.height / (lineCount + 1);
        for (let i = 0; i < lineCount; i++) {
          const baseY = spacing * (i + 1);
          const pts = [];
          for (let j = 0; j <= pointsPerLine; j++) {
            const x = (j / pointsPerLine) * canvas.width;
            pts.push({ x, baseY, y: baseY, vy: 0 });
          }
          lines.push(pts);
        }

        let waveRAF: number;
        const loop = () => {
          ctx.clearRect(0, 0, canvas.width, canvas.height);

          canvasMouseX += (canvasTargetMouseX - canvasMouseX) * 0.1;
          canvasMouseY += (canvasTargetMouseY - canvasMouseY) * 0.1;

          ctx.strokeStyle = 'rgba(255, 255, 255, 0.05)';
          ctx.lineWidth = 1;

          for (let i = 0; i < lines.length; i++) {
            const pts = lines[i];
            ctx.beginPath();
            ctx.moveTo(pts[0].x, pts[0].y);

            for (let j = 0; j < pts.length; j++) {
              const p = pts[j];
              const dx = canvasMouseX - p.x;
              const dy = canvasMouseY - p.y;
              const dist = Math.sqrt(dx * dx + dy * dy);
              const radius = 120;

              if (dist < radius) {
                const force = (1 - dist / radius) * 10;
                p.vy += force * (canvasMouseY > p.baseY ? 0.25 : -0.25);
              }

              const diff = p.baseY - p.y;
              p.vy += diff * 0.03;
              p.vy *= 0.86;
              p.y += p.vy;
            }

            for (let j = 1; j < pts.length - 1; j++) {
              const xc = (pts[j].x + pts[j + 1].x) / 2;
              const yc = (pts[j].y + pts[j + 1].y) / 2;
              ctx.quadraticCurveTo(pts[j].x, pts[j].y, xc, yc);
            }
            ctx.lineTo(pts[pts.length - 1].x, pts[pts.length - 1].y);
            ctx.stroke();
          }

          waveRAF = requestAnimationFrame(loop);
        };
        loop();

        cleanupWaves = () => {
          cancelAnimationFrame(waveRAF);
          window.removeEventListener('mousemove', onCanvasMouseMove);
          window.removeEventListener('resize', resize);
        };
      }
    }

    return () => {
      observer.disconnect();
      scrambleListeners.forEach((listener, el) => {
        el.removeEventListener('mouseenter', listener);
      });


      cleanupWaves();
    };
  }, []);

  return (
    <>
      {/* Language Switcher Pill */}
      <div className="lang-switcher-container">
        <button
          className={`lang-btn ${lang === 'de' ? 'active' : ''}`}
          onClick={() => handleLangChange('de')}
        >
          DE
        </button>
        <button
          className={`lang-btn ${lang === 'en' ? 'active' : ''}`}
          onClick={() => handleLangChange('en')}
        >
          EN
        </button>
      </div>

      {/* Background Grid Lines */}
      <div className="grid-background">
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
        <div className="line"></div>
      </div>

      {/* Interactive Wave Canvas Background */}
      <div className="wave-canvas-container">
        <canvas id="waveCanvas" className="wave-canvas"></canvas>
      </div>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <h1 className="hero-title reveal reveal-delay-1" data-char-swap="true">
              FLOAT
            </h1>
            <p className="hero-slogan reveal reveal-delay-2" data-char-swap="true">
              Lose Your Ground
            </p>
            <p className="hero-subtitle reveal reveal-delay-3" data-char-swap="true">
              {translate(lang, 'hero_subtitle')}
            </p>
            <div className="hero-meta-container reveal reveal-delay-3">
              <span className="meta-item">📍 Untere Au, Frastanz</span>
              <span className="meta-item-separator">·</span>
              <span className="meta-item">⏰ {translate(lang, 'hero_date')}</span>
              <span className="meta-item-separator">·</span>
              <span className="meta-item">🌅 {translate(lang, 'hero_open_air')}</span>
            </div>
            
            <div className="hero-buttons reveal reveal-delay-4">
              <div className="cta-wrapper">
                <button
                  onClick={() => scrollToSection('game-section')}
                  className="btn btn-primary"
                >
                  {translate(lang, 'hero_btn_play')}
                </button>
                {/* Rotating Badge SVG */}
                <div className="rotating-badge-container">
                  <svg className="rotating-badge-svg" viewBox="0 0 100 100">
                    <defs>
                      <path id="heroBadgePath" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                    </defs>
                    <text>
                      <textPath href="#heroBadgePath">{translate(lang, 'hero_badge')}</textPath>
                    </text>
                  </svg>
                </div>
              </div>
              <a
                href="https://eventfrog.at/de/p/partys/house-techno/daydance-am-see-7468717015454245477.html"
                target="_blank"
                rel="noopener noreferrer"
                className="btn btn-secondary"
              >
                {translate(lang, 'hero_btn_buy')}
              </a>
            </div>
          </div>
        </section>

        {/* Event Basics Section */}
        <EventBasics lang={lang} />

        {/* Lineup Section */}
        <Lineup lang={lang} />

        {/* Game Console Section */}
        <GameContainer lang={lang} />

        {/* Highscore Leaderboard Section */}
        <Leaderboard lang={lang} />


      </main>

      {/* Footer */}
      <footer className="app-footer">
        <p>{translate(lang, 'footer_copyright')}</p>
        <p>
          {translate(lang, 'footer_desc')}
        </p>
      </footer>
    </>
  );
}
