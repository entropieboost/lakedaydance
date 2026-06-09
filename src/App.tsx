import React from 'react';
import { EventBasics } from './components/EventBasics';
import { Lineup } from './components/Lineup';
import { GameContainer } from './components/GameContainer';
import { Leaderboard } from './components/Leaderboard';

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

    // 2. Custom Inertia Cursor Trailing Loop
    let targetX = -100;
    let targetY = -100;
    let cursorX = -100;
    let cursorY = -100;
    let hasMoved = false;

    const onMouseMove = (e: MouseEvent) => {
      targetX = e.clientX;
      targetY = e.clientY;
      if (!hasMoved) {
        cursorX = targetX;
        cursorY = targetY;
        hasMoved = true;
      }
    };

    window.addEventListener('mousemove', onMouseMove);

    const cursor = document.getElementById('custom-cursor');
    const dot = document.getElementById('custom-cursor-dot');
    let cursorRAF: number;

    const updateCursor = () => {
      if (hasMoved) {
        cursorX += (targetX - cursorX) * 0.15;
        cursorY += (targetY - cursorY) * 0.15;

        if (cursor) {
          cursor.style.transform = `translate3d(${cursorX}px, ${cursorY}px, 0) translate(-50%, -50%)`;
        }
        if (dot) {
          dot.style.transform = `translate3d(${targetX}px, ${targetY}px, 0) translate(-50%, -50%)`;
        }
      }
      cursorRAF = requestAnimationFrame(updateCursor);
    };
    updateCursor();

    // Hover states for cursor
    const hoverElements = document.querySelectorAll('a, button, [role="button"], .interactive, .btn');
    const hoverListenersEnter = new Map<Element, () => void>();
    const hoverListenersLeave = new Map<Element, () => void>();

    hoverElements.forEach((el) => {
      const enter = () => cursor?.classList.add('hovering');
      const leave = () => cursor?.classList.remove('hovering');
      el.addEventListener('mouseenter', enter);
      el.addEventListener('mouseleave', leave);
      hoverListenersEnter.set(el, enter);
      hoverListenersLeave.set(el, leave);
    });

    // Minigame morph state
    const gameWrapper = document.querySelector('.game-canvas');
    let gameEnter: (() => void) | undefined;
    let gameLeave: (() => void) | undefined;
    if (gameWrapper) {
      gameEnter = () => cursor?.classList.add('play-mode');
      gameLeave = () => cursor?.classList.remove('play-mode');
      gameWrapper.addEventListener('mouseenter', gameEnter);
      gameWrapper.addEventListener('mouseleave', gameLeave);
    }

    // Info cards morph state
    const infoCards = document.querySelectorAll('.basic-card.interactive');
    const infoListenersEnter = new Map<Element, () => void>();
    const infoListenersLeave = new Map<Element, () => void>();
    infoCards.forEach((card) => {
      const enter = () => cursor?.classList.add('info-mode');
      const leave = () => cursor?.classList.remove('info-mode');
      card.addEventListener('mouseenter', enter);
      card.addEventListener('mouseleave', leave);
      infoListenersEnter.set(card, enter);
      infoListenersLeave.set(card, leave);
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

        parent.addEventListener('mousemove', onCanvasMouseMove);
        parent.addEventListener('mouseleave', onCanvasMouseLeave);

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
          parent.removeEventListener('mousemove', onCanvasMouseMove);
          parent.removeEventListener('mouseleave', onCanvasMouseLeave);
          window.removeEventListener('resize', resize);
        };
      }
    }

    return () => {
      observer.disconnect();
      scrambleListeners.forEach((listener, el) => {
        el.removeEventListener('mouseenter', listener);
      });
      window.removeEventListener('mousemove', onMouseMove);
      cancelAnimationFrame(cursorRAF);

      hoverListenersEnter.forEach((enter, el) => el.removeEventListener('mouseenter', enter));
      hoverListenersLeave.forEach((leave, el) => el.removeEventListener('mouseleave', leave));
      if (gameWrapper) {
        if (gameEnter) gameWrapper.removeEventListener('mouseenter', gameEnter);
        if (gameLeave) gameWrapper.removeEventListener('mouseleave', gameLeave);
      }
      infoListenersEnter.forEach((enter, el) => el.removeEventListener('mouseenter', enter));
      infoListenersLeave.forEach((leave, el) => el.removeEventListener('mouseleave', leave));

      cleanupWaves();
    };
  }, []);

  return (
    <>
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

      {/* Custom Inertia Cursor */}
      <div className="custom-cursor" id="custom-cursor"></div>
      <div className="custom-cursor-dot" id="custom-cursor-dot"></div>

      <main>
        {/* Hero Section */}
        <section className="hero-section">
          <div className="hero-content">
            <p className="hero-subtitle reveal reveal-delay-1" data-char-swap="true">lose ur ground</p>
            <h1 className="hero-title reveal reveal-delay-2" data-char-swap="true">
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
              <div className="cta-wrapper">
                <button
                  onClick={() => scrollToSection('game-section')}
                  className="btn btn-primary"
                >
                  Spielen & Tickets gewinnen 🎮
                </button>
                {/* Rotating Badge SVG */}
                <div className="rotating-badge-container">
                  <svg className="rotating-badge-svg" viewBox="0 0 100 100">
                    <defs>
                      <path id="heroBadgePath" d="M 50,50 m -38,0 a 38,38 0 1,1 76,0 a 38,38 0 1,1 -76,0" />
                    </defs>
                    <text>
                      <textPath href="#heroBadgePath">SPIELEN & GEWINNEN • FLOAT JUMP CHALLENGE •</textPath>
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

        {/* Interactive Wave Canvas Background */}
        <div className="wave-canvas-container">
          <canvas id="waveCanvas" className="wave-canvas"></canvas>
          <div className="wave-canvas-overlay"></div>
        </div>
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
