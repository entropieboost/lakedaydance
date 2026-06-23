import { PRNG } from './PRNG';

export interface Platform {
  index: number;
  x: number;
  y: number;
  width: number;
  height: number;
}

export class PlatformManager {
  private prng: PRNG;
  private generatedPlatforms: Platform[] = [];

  constructor(seed: number) {
    this.prng = new PRNG(seed);
    this.generateInitialPlatforms();
  }

  private generateInitialPlatforms() {
    // Platform 0: Starting shoreline platform
    this.generatedPlatforms.push({
      index: 0,
      x: 0,
      y: 460,
      width: 500,
      height: 200, // Deep enough to draw off the bottom of the canvas
    });
  }

  /**
   * Returns the platform at a specific index, generating it if it hasn't been generated yet.
   * This is fully deterministic based on the initial seed.
   */
  public getPlatform(index: number): Platform {
    while (this.generatedPlatforms.length <= index) {
      const prev = this.generatedPlatforms[this.generatedPlatforms.length - 1];
      const i = this.generatedPlatforms.length;

      // Difficulty factor: ranges from 0 to 1, capping at platform index 60
      const difficulty = Math.min(i / 60, 1.0);

      // Gaps between stones increase with difficulty
      const minGap = 75 + difficulty * 15;  // 75 -> 90 px
      const maxGap = 120 + difficulty * 40; // 120 -> 160 px
      const gap = this.prng.nextRange(minGap, maxGap);

      // Width of stones decreases with difficulty (making them smaller targets)
      const minWidth = Math.max(65, 100 - difficulty * 20);  // 100 -> 80 px
      const maxWidth = Math.max(90, 140 - difficulty * 35); // 140 -> 105 px
      const width = this.prng.nextRange(minWidth, maxWidth);

      // Vertical height of the stones varies slightly to create ups/downs
      // Base water line is around Y = 460.
      const yOffset = this.prng.nextRange(-25, 20);
      const y = Math.max(420, Math.min(480, 460 + yOffset));

      const x = prev.x + prev.width + gap;

      this.generatedPlatforms.push({
        index: i,
        x,
        y,
        width,
        height: 250, // extends to the bottom
      });
    }
    return this.generatedPlatforms[index];
  }

  /**
   * Retrieves all platforms within a certain horizontal X bounds.
   */
  public getPlatformsInRange(startX: number, endX: number): Platform[] {
    const list: Platform[] = [];
    let idx = 0;
    
    // Scan platforms until we exceed the end boundary
    while (true) {
      const p = this.getPlatform(idx);
      if (p.x + p.width < startX) {
        idx++;
        continue;
      }
      if (p.x > endX) {
        break;
      }
      list.push(p);
      idx++;
    }
    return list;
  }
}
