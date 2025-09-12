import type { GameNote } from './RhythemGame';
import { Game, type IFretboard } from './Game';

export class Fretboard2D implements IFretboard {
  private ctx: CanvasRenderingContext2D;
  private game: Game;
  private readonly LANE_COUNT = 8;
  private readonly KEY_LABELS = ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'];

  constructor(ctx: CanvasRenderingContext2D, game: Game) {
    this.ctx = ctx;
    this.game = game;
  }

  public render(notes: GameNote[], frequencyData: Uint8Array, canvasWidth: number, canvasHeight: number, currentTime: number): void {
    // Update shared game state
    this.game.updateHitEffects();
    this.game.updateLanePresses();

    // Render 2D components
    this.renderLanes(canvasWidth, canvasHeight);
    this.renderHitZone(canvasWidth, canvasHeight);
    this.renderNotes(notes, canvasWidth, canvasHeight, currentTime);
    this.renderAudioVisualization(frequencyData, canvasWidth, canvasHeight);
    this.renderHitEffects(canvasWidth, canvasHeight);
  }

  public handleLanePress(lane: number): void {
    this.game.trackLanePress(lane);
  }

  public showHitEffect(lane: number, accuracy: number): void {
    this.game.addHitEffect(lane, accuracy);
  }

  public checkNoteHits(notes: GameNote[], currentTime: number, lanePressed?: number): GameNote[] {
    const hitNotes: GameNote[] = [];
    
    if (lanePressed === undefined) return hitNotes;

    for (const note of notes) {
      if (note.hit || note.lane !== lanePressed) continue;
      
      if (this.game.isNoteHittable(note.timestamp, currentTime)) {
        const accuracy = this.game.calculateHitAccuracy(note.timestamp, currentTime);
        if (accuracy > 0) {
          note.hit = true;
          hitNotes.push(note);
          this.showHitEffect(lanePressed, accuracy);
        }
      }
    }

    return hitNotes;
  }

  private renderLanes(canvasWidth: number, canvasHeight: number): void {
    const laneWidth = this.game.getLaneWidth(canvasWidth, this.LANE_COUNT);
    
    // Draw lane backgrounds with expansion effect for pressed lanes
    for (let i = 0; i < this.LANE_COUNT; i++) {
      const isPressed = this.game.isLanePressed(i);
      const baseX = this.game.getLaneX(i, laneWidth);
      
      if (isPressed) {
        const presses = this.game.getLanePresses().filter(press => press.lane === i);
        if (presses.length > 0) {
          const recentPress = presses.sort((a, b) => b.time - a.time)[0];
          const timeSincePress = Date.now() - recentPress.time;
          const progress = Math.min(timeSincePress / 200, 1); // 200ms animation
          const expansion = (1 - progress) * 10; // Maximum 10px expansion
          
          // Draw expanded lane background
          this.ctx.fillStyle = `rgba(255, 255, 255, ${0.1 * (1 - progress)})`;
          this.ctx.fillRect(baseX - expansion, 0, laneWidth + (expansion * 2), canvasHeight);
        }
      }
    }
    
    // Draw lane dividers
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    
    for (let i = 1; i < this.LANE_COUNT; i++) {
      const x = this.game.getLaneX(i, laneWidth);
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, canvasHeight);
      this.ctx.stroke();
    }
    
    // Draw lane indicators (key labels) with press effect
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    
    for (let i = 0; i < this.LANE_COUNT; i++) {
      const x = (i + 0.5) * laneWidth;
      const y = canvasHeight - 40;
      const isPressed = this.game.isLanePressed(i);
      
      if (isPressed) {
        // Brighter and slightly larger text when pressed
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.9)';
        this.ctx.font = '26px Arial';
      } else {
        this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
        this.ctx.font = '24px Arial';
      }
      
      this.ctx.fillText(this.KEY_LABELS[i], x, y);
    }
  }

  private renderNotes(notes: GameNote[], canvasWidth: number, canvasHeight: number, currentTime: number): void {
    const laneWidth = this.game.getLaneWidth(canvasWidth, this.LANE_COUNT);
    const noteHeight = 20;
    
    for (const note of notes) {
      if (note.hit) continue;
      
      // Calculate note position
      note.y = this.game.calculateNoteY(note.timestamp, currentTime, canvasHeight);
      
      const x = this.game.getLaneX(note.lane, laneWidth) + 10;
      const width = laneWidth - 20;
      
      // Color based on lane for visual variety
      const hue = (note.lane * 45) % 360;
      this.ctx.fillStyle = `hsl(${hue}, 70%, 60%)`;
      
      // Add glow effect
      this.ctx.shadowColor = this.ctx.fillStyle;
      this.ctx.shadowBlur = 10;
      
      // Draw note
      this.ctx.fillRect(x, note.y, width, noteHeight);
      
      // Reset shadow
      this.ctx.shadowBlur = 0;
      
      // Add inner highlight
      this.ctx.fillStyle = `hsl(${hue}, 70%, 80%)`;
      this.ctx.fillRect(x + 2, note.y + 2, width - 4, 4);
    }
  }

  private renderHitZone(canvasWidth: number, canvasHeight: number): void {
    const laneWidth = this.game.getLaneWidth(canvasWidth, this.LANE_COUNT);
    const hitZoneY = this.game.getHitZoneY(canvasHeight);
    const hitZoneHeight = 6;
    
    // Draw hit zone line
    this.ctx.strokeStyle = '#ff6b6b';
    this.ctx.lineWidth = hitZoneHeight;
    this.ctx.shadowColor = '#ff6b6b';
    this.ctx.shadowBlur = 15;
    
    this.ctx.beginPath();
    this.ctx.moveTo(0, hitZoneY);
    this.ctx.lineTo(canvasWidth, hitZoneY);
    this.ctx.stroke();
    
    this.ctx.shadowBlur = 0;
    
    // Draw lane hit areas
    for (let i = 0; i < this.LANE_COUNT; i++) {
      const x = this.game.getLaneX(i, laneWidth) + 5;
      const width = laneWidth - 10;
      
      this.ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
      this.ctx.fillRect(x, hitZoneY - 15, width, 30);
      
      // Add subtle border
      this.ctx.strokeStyle = 'rgba(255, 107, 107, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, hitZoneY - 15, width, 30);
    }
  }

  private renderAudioVisualization(frequencyData: Uint8Array, canvasWidth: number, canvasHeight: number): void {
    if (!frequencyData || frequencyData.length === 0) return;
    
    const barCount = 64;
    const barWidth = canvasWidth / barCount;
    const dataStep = Math.floor(frequencyData.length / barCount);
    
    for (let i = 0; i < barCount; i++) {
      const dataIndex = i * dataStep;
      const amplitude = frequencyData[dataIndex] / 255;
      const barHeight = amplitude * canvasHeight * 0.3;
      
      const x = i * barWidth;
      const y = canvasHeight - barHeight;
      
      // Create gradient for visualizer
      const gradient = this.ctx.createLinearGradient(0, y, 0, canvasHeight);
      gradient.addColorStop(0, `hsl(${200 + amplitude * 160}, 70%, 60%)`);
      gradient.addColorStop(1, `hsl(${200 + amplitude * 160}, 70%, 30%)`);
      
      this.ctx.fillStyle = gradient;
      this.ctx.fillRect(x, y, barWidth - 1, barHeight);
    }
  }

  private renderHitEffects(canvasWidth: number, canvasHeight: number): void {
    const laneWidth = this.game.getLaneWidth(canvasWidth, this.LANE_COUNT);
    const hitZoneY = this.game.getHitZoneY(canvasHeight);
    const currentTime = Date.now();
    
    for (const effect of this.game.getHitEffects()) {
      const progress = (currentTime - effect.time) / 300;
      const alpha = 1 - progress;
      const scale = 1 + progress * 2;
      
      const x = (effect.lane + 0.5) * laneWidth;
      
      // Color based on accuracy
      const hue = effect.accuracy > 0.8 ? 120 : effect.accuracy > 0.5 ? 60 : 0;
      
      this.ctx.save();
      this.ctx.globalAlpha = alpha;
      this.ctx.strokeStyle = `hsl(${hue}, 70%, 60%)`;
      this.ctx.lineWidth = 3;
      
      // Draw expanding circle
      this.ctx.beginPath();
      this.ctx.arc(x, hitZoneY, 20 * scale, 0, Math.PI * 2);
      this.ctx.stroke();
      
      this.ctx.restore();
    }
  }

  public destroy(): void {
    // No specific cleanup needed for 2D fretboard
  }
}
