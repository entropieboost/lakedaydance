/**
 * Mulberry32 seedable pseudo-random number generator.
 * This is used to ensure deterministic platform generation
 * for both client rendering and server-side validation.
 */
export class PRNG {
  private state: number;

  constructor(seed: number) {
    // Ensure the seed is a positive 32-bit integer
    this.state = (seed ^ 0xDEADBEEF) >>> 0;
  }

  /**
   * Generates the next random float between 0 (inclusive) and 1 (exclusive).
   */
  public next(): number {
    let t = (this.state += 0x6d2b79f5) | 0;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  /**
   * Generates a random float in the range [min, max).
   */
  public nextRange(min: number, max: number): number {
    return min + this.next() * (max - min);
  }

  /**
   * Generates a random integer in the range [min, max] (inclusive).
   */
  public nextInt(min: number, max: number): number {
    return Math.floor(this.nextRange(min, max + 1));
  }
}
