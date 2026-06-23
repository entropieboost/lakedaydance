import { PlatformManager, Platform } from './PlatformManager';
import { AudioSynth } from './AudioSynth';

export interface JumpEvent {
  t: number;      // timestamp offset in ms since game start
  pIdx: number;   // platform index the player jumped from
  pX: number;     // platform X coordinate
  pY: number;     // platform Y coordinate
  x: number;      // player X coordinate at jump
  y: number;      // player Y coordinate at jump
}

export interface GameCallbacks {
  onScoreUpdate: (score: number) => void;
  onGameOver: (gameData: {
    score: number;
    durationMs: number;
    finalDistance: number;
    jumpEvents: JumpEvent[];
  }) => void;
}

export class GameEngine {
  // Canvas configuration
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private dpr: number = 1;
  
  // Game dimensions (logical coordinate system)
  private readonly logicalWidth = 360;
  private readonly logicalHeight = 640;

  // Game components
  private platformManager: PlatformManager;
  private audio: AudioSynth;
  private callbacks: GameCallbacks;

  // Physics constants
  private readonly GRAVITY = 0.55;
  private readonly JUMP_FORCE = -11.0;
  private readonly START_SPEED = 2.6;
  private readonly MAX_SPEED = 5.2;
  private readonly PLAYER_WIDTH = 26;
  private readonly PLAYER_HEIGHT = 46;

  // Game state
  private playerX = 50;
  private playerY = 0;
  private playerVy = 0;
  private grounded = false;
  private standingPlatformIdx = 0;
  
  private speed = 2.6;
  private score = 0;
  private isRunning = false;
  private isPaused = false;
  private startTimestamp = 0;
  private pauseStartedAt = 0;
  private totalPausedDurationMs = 0;
  private animationFrameId: number | null = null;
  private lastFrameTime = 0;

  // Jump tracking
  private jumpEvents: JumpEvent[] = [];

  // Aesthetics & Animation state
  private legCycle = 0;
  private waterOffset = 0;
  private splashParticles: { x: number; y: number; vx: number; vy: number; radius: number; color: string; alpha: number }[] = [];
  private speedNotificationTimer = 0;

  constructor(canvas: HTMLCanvasElement, seed: number, callbacks: GameCallbacks, audio: AudioSynth) {
    this.canvas = canvas;
    const context = canvas.getContext('2d');
    if (!context) throw new Error('Could not get 2D context');
    this.ctx = context;
    this.platformManager = new PlatformManager(seed);
    this.callbacks = callbacks;
    this.audio = audio;

    // Set player starting height on top of first platform
    const startPlatform = this.platformManager.getPlatform(0);
    this.playerY = startPlatform.y - this.PLAYER_HEIGHT;
    this.grounded = true;

    this.setupResize();
    this.setupVisibilityAPI();
  }

  private setupResize() {
    this.resizeCanvas();
    window.addEventListener('resize', this.resizeCanvas);
  }

  private resizeCanvas = () => {
    // Get rendering resolution modifier
    this.dpr = window.devicePixelRatio || 1;
    
    // Fit canvas in CSS dimensions, but make coordinate buffer match DPR
    const rect = this.canvas.getBoundingClientRect();
    this.canvas.width = rect.width * this.dpr;
    this.canvas.height = rect.height * this.dpr;
    
    // Adjust scale so logical coordinates (360x640) map correctly
    this.ctx.resetTransform();
    this.ctx.scale(
      (this.canvas.width / this.logicalWidth),
      (this.canvas.height / this.logicalHeight)
    );
  };

  private setupVisibilityAPI() {
    document.addEventListener('visibilitychange', this.handleVisibilityChange);
  }

  private handleVisibilityChange = () => {
    if (document.hidden && this.isRunning && !this.isPaused) {
      this.pause();
    }
  };

  public destroy() {
    window.removeEventListener('resize', this.resizeCanvas);
    document.removeEventListener('visibilitychange', this.handleVisibilityChange);
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
    }
  }

  public start() {
    if (this.isRunning) return;
    this.isRunning = true;
    this.isPaused = false;
    this.startTimestamp = Date.now();
    this.totalPausedDurationMs = 0;
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  public pause() {
    if (!this.isRunning || this.isPaused) return;
    this.isPaused = true;
    this.pauseStartedAt = Date.now();
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }
    this.draw(); // Render a dimmed paused overlay
  }

  public resume() {
    if (!this.isRunning || !this.isPaused) return;
    this.isPaused = false;
    this.totalPausedDurationMs += (Date.now() - this.pauseStartedAt);
    this.lastFrameTime = performance.now();
    this.animationFrameId = requestAnimationFrame(this.gameLoop);
  }

  public jump() {
    if (!this.isRunning || this.isPaused) return;

    if (this.grounded) {
      this.playerVy = this.JUMP_FORCE;
      this.grounded = false;
      this.audio.playJump();

      // Record jump event for validation
      const standingPlatform = this.platformManager.getPlatform(this.standingPlatformIdx);
      this.jumpEvents.push({
        t: Date.now() - this.startTimestamp - this.totalPausedDurationMs,
        pIdx: this.standingPlatformIdx,
        pX: standingPlatform.x,
        pY: standingPlatform.y,
        x: this.playerX,
        y: this.playerY,
      });
    }
  }

  private triggerGameOver() {
    this.isRunning = false;
    if (this.animationFrameId) {
      cancelAnimationFrame(this.animationFrameId);
      this.animationFrameId = null;
    }

    this.audio.playSplash();
    this.createSplashParticles(this.playerX + this.PLAYER_WIDTH / 2, this.playerY + this.PLAYER_HEIGHT);

    // Run short death splash animation before final callback
    let splashFrames = 0;
    const animateSplash = () => {
      splashFrames++;
      this.updateParticles();
      this.draw();

      if (splashFrames < 45) {
        requestAnimationFrame(animateSplash);
      } else {
        const durationMs = Date.now() - this.startTimestamp - this.totalPausedDurationMs;
        this.callbacks.onGameOver({
          score: this.score,
          durationMs,
          finalDistance: Math.floor(this.playerX),
          jumpEvents: this.jumpEvents,
        });
      }
    };
    
    animateSplash();
  }

  private gameLoop = (timestamp: number) => {
    if (!this.isRunning || this.isPaused) return;

    const elapsed = timestamp - this.lastFrameTime;
    this.lastFrameTime = timestamp;

    // Prevent giant jumps in physics if tab drops frames
    const dt = Math.min(elapsed / 16.666, 3);

    this.update(dt);
    this.draw();

    if (this.isRunning) {
      this.animationFrameId = requestAnimationFrame(this.gameLoop);
    }
  };

  private update(dt: number) {
    // 1. Horizontal movement & speed formula
    // Speed increases slowly with distance traveled
    this.speed = this.START_SPEED + Math.min(this.playerX / 3500, this.MAX_SPEED - this.START_SPEED);
    const oldScore = this.score;
    this.playerX += this.speed * dt;
    this.score = Math.floor(this.playerX / 15);

    if (this.score !== oldScore) {
      this.callbacks.onScoreUpdate(this.score);
      // Trigger speed up sound chime every 300 points
      if (this.score > 0 && this.score % 300 === 0) {
        this.audio.playLevelUp();
        this.speedNotificationTimer = 40; // draw "SPEED UP!" for 40 frames
      }
    }

    // 2. Vertical movement (Physics)
    if (!this.grounded) {
      this.playerVy += this.GRAVITY * dt;
      this.playerY += this.playerVy * dt;
    }

    // 3. Platform collisions
    const activePlatforms = this.platformManager.getPlatformsInRange(
      this.playerX - 100,
      this.playerX + 150
    );

    let foundLanding = false;
    
    for (const p of activePlatforms) {
      // Check if player is horizontally above the stone
      const overlapLeft = this.playerX + this.PLAYER_WIDTH > p.x;
      const overlapRight = this.playerX < p.x + p.width;

      if (overlapLeft && overlapRight) {
        // Player is falling down onto the stone
        if (this.playerVy >= 0) {
          const feetY = this.playerY + this.PLAYER_HEIGHT;
          // Tolerance zone for landing
          if (feetY >= p.y && feetY <= p.y + 12 + this.playerVy * dt) {
            this.playerY = p.y - this.PLAYER_HEIGHT;
            this.playerVy = 0;
            this.grounded = true;
            this.standingPlatformIdx = p.index;
            foundLanding = true;
            break;
          }
        }
      }
    }

    if (this.grounded && !foundLanding) {
      // Walked off the edge of the stone
      this.grounded = false;
    }

    // 4. Fall in water (Game Over boundary)
    if (this.playerY + this.PLAYER_HEIGHT > 510) {
      this.triggerGameOver();
      return;
    }

    // 5. Aesthetic updates (Leg cycling rate based on running speed)
    if (this.grounded) {
      this.legCycle += 0.15 * this.speed * dt;
    }
    this.waterOffset += 0.04 * dt;
    
    if (this.speedNotificationTimer > 0) {
      this.speedNotificationTimer -= dt;
    }

    this.updateParticles();
  }

  private createSplashParticles(x: number, y: number) {
    for (let i = 0; i < 24; i++) {
      const angle = Math.random() * Math.PI - Math.PI; // Upwards hemisphere
      const speed = Math.random() * 5 + 3;
      this.splashParticles.push({
        x,
        y,
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        radius: Math.random() * 3 + 2,
        color: i % 2 === 0 ? '#00f0ff' : '#00b4d8', // Neon cyan and turquoise
        alpha: 1.0,
      });
    }
  }

  private updateParticles() {
    for (let i = this.splashParticles.length - 1; i >= 0; i--) {
      const p = this.splashParticles[i];
      p.x += p.vx;
      p.y += p.vy;
      p.vy += 0.2; // gravity on droplets
      p.alpha -= 0.02;
      if (p.alpha <= 0) {
        this.splashParticles.splice(i, 1);
      }
    }
  }

  private draw() {
    this.ctx.clearRect(0, 0, this.logicalWidth, this.logicalHeight);

    // 1. Draw Linear Sunset Background (Gradient matches theme description)
    const bgGrad = this.ctx.createLinearGradient(0, 0, 0, 500);
    bgGrad.addColorStop(0, '#060d13'); // Deep Navy top
    bgGrad.addColorStop(0.5, '#1b122e'); // Deep Purple sunset mid
    bgGrad.addColorStop(0.75, '#ff477e'); // Techno Pink sunset horizon
    bgGrad.addColorStop(0.9, '#feb47b'); // Warm Sunset Coral bottom
    this.ctx.fillStyle = bgGrad;
    this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

    // 2. Draw Sun
    this.ctx.fillStyle = '#ff7e5f';
    this.ctx.shadowColor = '#ff007f';
    this.ctx.shadowBlur = 30;
    this.ctx.beginPath();
    this.ctx.arc(this.logicalWidth / 2, 380, 50, 0, Math.PI, true); // Sun half-submerged
    this.ctx.fill();
    
    // Reset shadow
    this.ctx.shadowBlur = 0;

    // 3. Draw Background Mountain Silhouettes (Purple outlines)
    this.ctx.fillStyle = '#160f26';
    this.ctx.beginPath();
    this.ctx.moveTo(0, 480);
    this.ctx.lineTo(0, 390);
    this.ctx.quadraticCurveTo(80, 340, 160, 370);
    this.ctx.quadraticCurveTo(240, 320, 360, 400);
    this.ctx.lineTo(360, 480);
    this.ctx.fill();

    // 4. Draw stylized Central Tree-Island (from second photo) in background
    // Island coordinate is fixed relative to world camera scroll, repeat or place periodically
    const cameraX = this.playerX - 60;
    const islandX = 300 - (cameraX * 0.15) % 450; // Parallax background movement
    
    this.ctx.fillStyle = '#0f2214'; // Dark forest green
    this.ctx.beginPath();
    // Round grassy base
    this.ctx.ellipse(islandX, 440, 45, 12, 0, 0, Math.PI * 2);
    this.ctx.fill();
    // Tree Trunk
    this.ctx.fillStyle = '#1e1107';
    this.ctx.fillRect(islandX - 3, 415, 6, 20);
    // Tree Foliage
    this.ctx.fillStyle = '#22543d';
    this.ctx.beginPath();
    this.ctx.arc(islandX, 405, 18, 0, Math.PI * 2);
    this.ctx.arc(islandX - 10, 400, 14, 0, Math.PI * 2);
    this.ctx.arc(islandX + 10, 400, 14, 0, Math.PI * 2);
    this.ctx.fill();

    // 5. Draw Platforms (Rocky Stones)
    const activePlatforms = this.platformManager.getPlatformsInRange(
      cameraX - 100,
      cameraX + this.logicalWidth + 100
    );

    for (const p of activePlatforms) {
      const renderX = p.x - cameraX;
      
      this.ctx.save();
      // Stone base gradient (Slate gray rock)
      const rockGrad = this.ctx.createLinearGradient(renderX, p.y, renderX, p.y + 60);
      rockGrad.addColorStop(0, '#5a6268');
      rockGrad.addColorStop(0.3, '#343a40');
      rockGrad.addColorStop(1, '#1b1e21');
      
      this.ctx.fillStyle = rockGrad;
      
      // Draw a rounded organic stone shape
      this.ctx.beginPath();
      const r = 10; // corner radius
      this.ctx.moveTo(renderX + r, p.y);
      this.ctx.lineTo(renderX + p.width - r, p.y);
      this.ctx.quadraticCurveTo(renderX + p.width, p.y, renderX + p.width, p.y + r);
      this.ctx.lineTo(renderX + p.width - 2, p.y + p.height);
      this.ctx.lineTo(renderX + 2, p.y + p.height);
      this.ctx.quadraticCurveTo(renderX, p.y + p.height, renderX, p.y + r);
      this.ctx.quadraticCurveTo(renderX, p.y, renderX + r, p.y);
      this.ctx.closePath();
      this.ctx.fill();

      // Top highlighted moss/neon green line on stones
      this.ctx.strokeStyle = '#00f0ff'; // glowing edge
      this.ctx.lineWidth = 2.5;
      this.ctx.beginPath();
      this.ctx.moveTo(renderX + 6, p.y + 1);
      this.ctx.lineTo(renderX + p.width - 6, p.y + 1);
      this.ctx.stroke();

      // Platform text (index indicator)
      this.ctx.fillStyle = '#6c757d';
      this.ctx.font = '9px BDOGrotesk, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText(`${p.index}`, renderX + p.width / 2, p.y + 18);

      this.ctx.restore();
    }

    // 6. Draw Player (Techno Raver Character)
    if (this.isRunning || !this.grounded) {
      const renderPlayerX = this.playerX - cameraX;
      const renderPlayerY = this.playerY;

      this.ctx.save();

      // Simple running raver drawing
      // Body (Neon hoodie)
      this.ctx.fillStyle = '#39ff14'; // Bright neon green hoodie
      this.ctx.fillRect(renderPlayerX + 4, renderPlayerY + 12, 18, 22);

      // Pants (Black shorts)
      this.ctx.fillStyle = '#111';
      this.ctx.fillRect(renderPlayerX + 4, renderPlayerY + 32, 18, 6);

      // Head (Face)
      this.ctx.fillStyle = '#ffd1a9'; // Peach skin
      this.ctx.beginPath();
      this.ctx.arc(renderPlayerX + 13, renderPlayerY + 7, 7, 0, Math.PI * 2);
      this.ctx.fill();

      // Rave pink sunglasses (Neon Pink)
      this.ctx.fillStyle = '#ff007f';
      this.ctx.fillRect(renderPlayerX + 11, renderPlayerY + 4, 11, 4);
      // Glowing frame line
      this.ctx.strokeStyle = '#fff';
      this.ctx.lineWidth = 0.8;
      this.ctx.strokeRect(renderPlayerX + 11, renderPlayerY + 4, 11, 4);

      // Hair / Cap (Dark hoodie hood)
      this.ctx.fillStyle = '#39ff14';
      this.ctx.beginPath();
      this.ctx.arc(renderPlayerX + 12, renderPlayerY + 7, 7, Math.PI, 0); // Hood top
      this.ctx.fill();

      // Draw animated limbs
      this.ctx.lineWidth = 3.5;
      this.ctx.strokeStyle = '#222';
      
      const leftLegAngle = Math.sin(this.legCycle) * 0.7;
      const rightLegAngle = -Math.sin(this.legCycle) * 0.7;

      if (this.grounded) {
        // Run Leg 1
        this.ctx.beginPath();
        this.ctx.moveTo(renderPlayerX + 8, renderPlayerY + 38);
        this.ctx.lineTo(renderPlayerX + 8 + Math.sin(leftLegAngle) * 10, renderPlayerY + 46);
        this.ctx.stroke();

        // Run Leg 2
        this.ctx.beginPath();
        this.ctx.moveTo(renderPlayerX + 18, renderPlayerY + 38);
        this.ctx.lineTo(renderPlayerX + 18 + Math.sin(rightLegAngle) * 10, renderPlayerY + 46);
        this.ctx.stroke();

        // Arms swinging
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.beginPath();
        this.ctx.moveTo(renderPlayerX + 6, renderPlayerY + 16);
        this.ctx.lineTo(renderPlayerX + 1 + Math.sin(rightLegAngle) * 8, renderPlayerY + 24);
        this.ctx.stroke();
      } else {
        // Jump pose (Legs bent)
        this.ctx.beginPath();
        this.ctx.moveTo(renderPlayerX + 8, renderPlayerY + 38);
        this.ctx.lineTo(renderPlayerX + 5, renderPlayerY + 42);
        this.ctx.lineTo(renderPlayerX + 9, renderPlayerY + 44);
        this.ctx.stroke();

        this.ctx.beginPath();
        this.ctx.moveTo(renderPlayerX + 18, renderPlayerY + 38);
        this.ctx.lineTo(renderPlayerX + 21, renderPlayerY + 42);
        this.ctx.lineTo(renderPlayerX + 17, renderPlayerY + 44);
        this.ctx.stroke();

        // Arms up/tucked
        this.ctx.strokeStyle = '#39ff14';
        this.ctx.beginPath();
        this.ctx.moveTo(renderPlayerX + 6, renderPlayerY + 16);
        this.ctx.lineTo(renderPlayerX + 2, renderPlayerY + 10);
        this.ctx.stroke();
      }

      this.ctx.restore();
    }

    // 7. Draw Splash Particles
    for (const p of this.splashParticles) {
      this.ctx.save();
      this.ctx.globalAlpha = p.alpha;
      this.ctx.fillStyle = p.color;
      this.ctx.beginPath();
      this.ctx.arc(p.x - cameraX, p.y, p.radius, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.restore();
    }

    // 8. Draw Water Foreground (Turquoise Waves)
    // Water level top is Y = 480
    const waterBaseY = 480;
    
    // Draw 3 layers of translucent wave patterns
    const waves = [
      { color: 'rgba(0, 180, 216, 0.4)', speed: 0.8, amp: 6, freq: 0.015 },  // Base turquoise
      { color: 'rgba(0, 240, 255, 0.35)', speed: -1.2, amp: 4, freq: 0.025 }, // Neon cyan
      { color: 'rgba(5, 78, 102, 0.8)', speed: 0.4, amp: 8, freq: 0.01 }     // Deep dark teal front
    ];

    for (const w of waves) {
      this.ctx.fillStyle = w.color;
      this.ctx.beginPath();
      this.ctx.moveTo(0, this.logicalHeight);
      this.ctx.lineTo(0, waterBaseY);

      for (let tx = 0; tx <= this.logicalWidth; tx++) {
        // Dynamic sine wave height calculation
        const angle = (tx * w.freq) + (this.waterOffset * w.speed);
        const ty = waterBaseY + Math.sin(angle) * w.amp;
        this.ctx.lineTo(tx, ty);
      }

      this.ctx.lineTo(this.logicalWidth, this.logicalHeight);
      this.ctx.closePath();
      this.ctx.fill();
    }

    // 9. HUD Text Overlay (Score and Speed indicator)
    this.ctx.fillStyle = '#ffffff';
    this.ctx.font = '800 20px BDOGrotesk, sans-serif';
    this.ctx.textAlign = 'left';
    this.ctx.fillText(`${this.score}`, 18, 38);

    // Muted HUD text for current speed factor
    this.ctx.fillStyle = '#00f0ff';
    this.ctx.font = '800 11px BDOGrotesk, sans-serif';
    this.ctx.textAlign = 'right';
    const speedFact = (this.speed * 10).toFixed(0);
    this.ctx.fillText(`KMN/H: ${speedFact}`, this.logicalWidth - 18, 34);

    // SPEED UP Notification Text Animation
    if (this.speedNotificationTimer > 0) {
      this.ctx.save();
      this.ctx.fillStyle = '#ff007f';
      this.ctx.font = '900 16px BDOGrotesk, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.shadowColor = '#ff007f';
      this.ctx.shadowBlur = 8;
      // Fade in/out based on timer
      const alpha = Math.min(1.0, this.speedNotificationTimer / 10);
      this.ctx.globalAlpha = alpha;
      this.ctx.fillText('SPEED UP! ⚡', this.logicalWidth / 2, 100);
      this.ctx.restore();
    }

    // 10. Pause Overlay
    if (this.isPaused) {
      this.ctx.fillStyle = 'rgba(6, 13, 19, 0.75)';
      this.ctx.fillRect(0, 0, this.logicalWidth, this.logicalHeight);

      this.ctx.fillStyle = '#ffffff';
      this.ctx.font = '800 24px BDOGrotesk, sans-serif';
      this.ctx.textAlign = 'center';
      this.ctx.fillText('PAUSE', this.logicalWidth / 2, this.logicalHeight / 2 - 10);
      
      this.ctx.fillStyle = '#a9d6e5';
      this.ctx.font = '12px BDOGrotesk, sans-serif';
      this.ctx.fillText('Hier tippen zum Weiterspielen', this.logicalWidth / 2, this.logicalHeight / 2 + 15);
    }
  }
}
