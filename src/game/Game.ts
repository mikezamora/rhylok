import type { GameNote } from './RhythemGame';

export interface IFretboard {
  render(notes: GameNote[], frequencyData: Uint8Array, canvasWidth: number, canvasHeight: number, currentTime: number): void;
  handleLanePress(lane: number): void;
  showHitEffect(lane: number, accuracy: number): void;
  checkNoteHits(notes: GameNote[], currentTime: number, lanePressed?: number): GameNote[];
  destroy(): void;
}

export interface HitEffect {
  lane: number;
  time: number;
  accuracy: number;
}

export interface LanePress {
  lane: number;
  time: number;
}

export class Game {
  private hitEffects: HitEffect[] = [];
  private lanePressed: LanePress[] = [];
  private readonly HIT_WINDOW_PERFECT = 50; // ms
  private readonly HIT_WINDOW_GOOD = 100; // ms
  private readonly HIT_WINDOW_MISS = 150; // ms

  constructor() {}

  public updateHitEffects(): void {
    const currentTime = Date.now();
    // Remove old effects (300ms duration)
    this.hitEffects = this.hitEffects.filter(effect => currentTime - effect.time < 300);
  }

  public updateLanePresses(): void {
    const currentTime = Date.now();
    // Clean up old lane presses (200ms duration)
    this.lanePressed = this.lanePressed.filter(press => currentTime - press.time < 200);
  }

  public trackLanePress(lane: number): void {
    this.lanePressed.push({
      lane,
      time: Date.now()
    });
  }

  public addHitEffect(lane: number, accuracy: number): void {
    this.hitEffects.push({
      lane,
      time: Date.now(),
      accuracy
    });
  }

  public getHitEffects(): HitEffect[] {
    return this.hitEffects;
  }

  public getLanePresses(): LanePress[] {
    return this.lanePressed;
  }

  public isLanePressed(lane: number): boolean {
    const currentTime = Date.now();
    return this.lanePressed.some(press => 
      press.lane === lane && currentTime - press.time < 200
    );
  }

  public calculateHitAccuracy(noteTime: number, currentTime: number): number {
    const timeDiff = Math.abs(noteTime - currentTime);
    
    if (timeDiff <= this.HIT_WINDOW_PERFECT) {
      return 1.0; // Perfect hit
    } else if (timeDiff <= this.HIT_WINDOW_GOOD) {
      return 0.8; // Good hit
    } else if (timeDiff <= this.HIT_WINDOW_MISS) {
      return 0.5; // Okay hit
    } else {
      return 0.0; // Miss
    }
  }

  public isNoteHittable(noteTime: number, currentTime: number): boolean {
    const timeDiff = Math.abs(noteTime - currentTime);
    return timeDiff <= this.HIT_WINDOW_MISS;
  }

  public calculateNoteY(noteTime: number, currentTime: number, canvasHeight: number, noteSpeed: number = 300): number {
    const noteAge = currentTime - noteTime;
    return (noteAge / 1000) * noteSpeed + canvasHeight * 0.8;
  }

  public getHitZoneY(canvasHeight: number): number {
    return canvasHeight * 0.8;
  }

  public getLaneWidth(canvasWidth: number, laneCount: number = 8): number {
    return canvasWidth / laneCount;
  }

  public getLaneX(lane: number, laneWidth: number): number {
    return lane * laneWidth;
  }

  public destroy(): void {
    this.hitEffects = [];
    this.lanePressed = [];
  }
}
