import type { GameNote } from './RhythemGame';

export class GameRenderer {
  private ctx: CanvasRenderingContext2D;
  private hitEffects: Array<{
    lane: number;
    time: number;
    accuracy: number;
  }> = [];
  
  constructor(ctx: CanvasRenderingContext2D) {
    this.ctx = ctx;
  }
  
  public renderLanes(canvasWidth: number, canvasHeight: number, laneCount: number): void {
    const laneWidth = canvasWidth / laneCount;
    
    // Draw lane dividers
    this.ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    this.ctx.lineWidth = 1;
    
    for (let i = 1; i < laneCount; i++) {
      const x = i * laneWidth;
      this.ctx.beginPath();
      this.ctx.moveTo(x, 0);
      this.ctx.lineTo(x, canvasHeight);
      this.ctx.stroke();
    }
    
    // Draw lane indicators (key labels)
    const keyLabels = ['A', 'S', 'D', 'F', 'J', 'K', 'L', ';'];
    this.ctx.fillStyle = 'rgba(255, 255, 255, 0.6)';
    this.ctx.font = '24px Arial';
    this.ctx.textAlign = 'center';
    
    for (let i = 0; i < laneCount; i++) {
      const x = (i + 0.5) * laneWidth;
      const y = canvasHeight - 40;
      this.ctx.fillText(keyLabels[i], x, y);
    }
  }
  
  public renderNotes(notes: GameNote[], canvasWidth: number, laneCount: number): void {
    const laneWidth = canvasWidth / laneCount;
    const noteHeight = 20;
    
    for (const note of notes) {
      if (note.hit) continue;
      
      const x = note.lane * laneWidth + 10;
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
  
  public renderHitZone(canvasWidth: number, canvasHeight: number, laneCount: number): void {
    const laneWidth = canvasWidth / laneCount;
    const hitZoneY = canvasHeight * 0.8;
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
    for (let i = 0; i < laneCount; i++) {
      const x = i * laneWidth + 5;
      const width = laneWidth - 10;
      
      this.ctx.fillStyle = 'rgba(255, 107, 107, 0.2)';
      this.ctx.fillRect(x, hitZoneY - 15, width, 30);
      
      // Add subtle border
      this.ctx.strokeStyle = 'rgba(255, 107, 107, 0.4)';
      this.ctx.lineWidth = 1;
      this.ctx.strokeRect(x, hitZoneY - 15, width, 30);
    }
  }
  
  public renderAudioVisualization(frequencyData: Uint8Array, canvasWidth: number, canvasHeight: number): void {
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
  
  public showHitEffect(lane: number, accuracy: number): void {
    this.hitEffects.push({
      lane,
      time: Date.now(),
      accuracy
    });
  }
  
  public renderHitEffects(canvasWidth: number, canvasHeight: number, laneCount: number): void {
    const laneWidth = canvasWidth / laneCount;
    const hitZoneY = canvasHeight * 0.8;
    const currentTime = Date.now();
    
    // Remove old effects
    this.hitEffects = this.hitEffects.filter(effect => currentTime - effect.time < 300);
    
    for (const effect of this.hitEffects) {
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
}
