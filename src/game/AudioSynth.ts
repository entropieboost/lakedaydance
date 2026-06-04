/**
 * Web Audio API procedurally synthesized sound effects.
 * Avoids loading large external audio files, which keeps
 * mobile load times extremely low.
 */
export class AudioSynth {
  private ctx: AudioContext | null = null;
  private isMuted: boolean = false;

  constructor() {
    // AudioContext will be initialized on first user interaction due to browser autoplay policies
  }

  private init() {
    if (!this.ctx) {
      const AudioContextClass = window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        this.ctx = new AudioContextClass();
      }
    }
    if (this.ctx && this.ctx.state === 'suspended') {
      this.ctx.resume();
    }
    // Force context activation on iOS/Safari by playing a micro-buffer of silence
    if (this.ctx) {
      try {
        const buffer = this.ctx.createBuffer(1, 1, 22050);
        const source = this.ctx.createBufferSource();
        source.buffer = buffer;
        source.connect(this.ctx.destination);
        source.start(0);
      } catch (e) {
        // Ignore silent playback errors
      }
    }
  }

  public setMute(muted: boolean) {
    this.isMuted = muted;
    if (!muted) {
      this.init();
    }
  }

  public toggleMute(): boolean {
    this.setMute(!this.isMuted);
    return this.isMuted;
  }

  public getMutedState(): boolean {
    return this.isMuted;
  }

  /**
   * Synthesize a springy jump sound (frequency sweeping up)
   */
  public playJump() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const osc = this.ctx.createOscillator();
      const gain = this.ctx.createGain();

      osc.connect(gain);
      gain.connect(this.ctx.destination);

      // Cute square wave sweep
      osc.type = 'triangle';
      
      const now = this.ctx.currentTime;
      
      // Sweep frequency from 180Hz to 600Hz in 0.12 seconds
      osc.frequency.setValueAtTime(180, now);
      osc.frequency.exponentialRampToValueAtTime(600, now + 0.12);

      // Volume envelope: quickly fades out
      gain.gain.setValueAtTime(0.15, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.15);

      osc.start(now);
      osc.stop(now + 0.16);
    } catch (e) {
      console.warn('Failed to play synthesized audio:', e);
    }
  }

  /**
   * Synthesize a water splash sound (white noise sweep down)
   */
  public playSplash() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // We generate a noise buffer for splash
      const bufferSize = this.ctx.sampleRate * 0.35; // 0.35 seconds
      const buffer = this.ctx.createBuffer(1, bufferSize, this.ctx.sampleRate);
      const data = buffer.getChannelData(0);
      
      // Populate with white noise
      for (let i = 0; i < bufferSize; i++) {
        data[i] = Math.random() * 2 - 1;
      }

      const noiseNode = this.ctx.createBufferSource();
      noiseNode.buffer = buffer;

      // Add a lowpass filter to make it sound like splash/water
      const filter = this.ctx.createBiquadFilter();
      filter.type = 'lowpass';
      // Sweep filter cutoff down
      filter.frequency.setValueAtTime(1000, now);
      filter.frequency.exponentialRampToValueAtTime(80, now + 0.3);

      const gain = this.ctx.createGain();
      gain.gain.setValueAtTime(0.25, now);
      gain.gain.linearRampToValueAtTime(0.01, now + 0.32);

      noiseNode.connect(filter);
      filter.connect(gain);
      gain.connect(this.ctx.destination);

      noiseNode.start(now);
      noiseNode.stop(now + 0.35);
    } catch (e) {
      console.warn('Failed to play synthesized audio:', e);
    }
  }

  /**
   * Synthesize a clean synth alert when game speed increases
   */
  public playLevelUp() {
    if (this.isMuted) return;
    this.init();
    if (!this.ctx) return;

    try {
      const now = this.ctx.currentTime;
      
      // Synthesize a double chime (fifths)
      const playNote = (freq: number, delay: number, dur: number) => {
        if (!this.ctx) return;
        const osc = this.ctx.createOscillator();
        const gain = this.ctx.createGain();

        osc.type = 'sine';
        osc.connect(gain);
        gain.connect(this.ctx.destination);

        osc.frequency.setValueAtTime(freq, now + delay);
        gain.gain.setValueAtTime(0.0, now + delay);
        gain.gain.linearRampToValueAtTime(0.12, now + delay + 0.02);
        gain.gain.exponentialRampToValueAtTime(0.001, now + delay + dur);

        osc.start(now + delay);
        osc.stop(now + delay + dur);
      };

      playNote(440, 0, 0.25);      // A4
      playNote(659.25, 0.08, 0.3); // E5
    } catch (e) {
      console.warn('Failed to play synthesized audio:', e);
    }
  }
}
