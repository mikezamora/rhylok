import type { GameNote } from './RhythemGame';
import { Fretboard3D } from './Fretboard3D';
import { Fretboard2D } from './Fretboard2D';
import { Game, type IFretboard } from './Game';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private game: Game;
  private fretboard: IFretboard;
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
    this.game = new Game();
    this.fretboard = new Fretboard2D(ctx, this.game);
  }

  public set3DMode(enabled: boolean): void {    
    // Clean up current fretboard
    this.fretboard.destroy();
    
    // Create new fretboard based on mode
    if (enabled) {
      this.fretboard = new Fretboard3D(this.ctx.canvas, this.game);
    } else {
      this.fretboard = new Fretboard2D(this.ctx, this.game);
    }
  }

  public render(notes: GameNote[], frequencyData: Uint8Array, canvasWidth: number, canvasHeight: number, _laneCount: number, currentTime: number): void {
    this.fretboard.render(notes, frequencyData, canvasWidth, canvasHeight, currentTime);
  }

  public handleLanePress(lane: number): void {
    this.fretboard.handleLanePress(lane);
  }

  public showLanePress(lane: number): void {
    this.fretboard.handleLanePress(lane);
  }

  public showHitEffect(lane: number, accuracy: number): void {
    this.fretboard.showHitEffect(lane, accuracy);
  }

  public checkNoteHits(notes: GameNote[], currentTime: number, lanePressed?: number): GameNote[] {
    return this.fretboard.checkNoteHits(notes, currentTime, lanePressed);
  }

  public destroy(): void {
    this.fretboard.destroy();
  }
}
