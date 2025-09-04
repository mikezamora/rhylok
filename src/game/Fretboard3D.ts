import { animate } from 'animejs';
import type { GameNote } from './RhythemGame';
import { Game, type IFretboard } from './Game';

export interface Vector3D {
  x: number;
  y: number;
  z: number;
}

export interface OscilloscopePoint {
  x: number;
  y: number;
  frequency: number;
  intensity: number;
  age: number;
}

export class Fretboard3D implements IFretboard {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private game: Game;
  private oscilloscopePoints: OscilloscopePoint[] = [];
  private cameraZ: number = 500;
  private rotationX: number = 0;
  private rotationY: number = 0;
  private animationTarget: any = { rotationX: 0, rotationY: 0 };
  private readonly HIT_ZONE_Z = 0; // Z-coordinate where notes should be hit
  private readonly HIT_ZONE_RANGE = 50; // Z-range for hit detection
  private readonly FREQUENCY_COLORS = [
    '#00ffff', // Cyan base
    '#0099ff', // Blue
    '#6600ff', // Purple  
    '#ff0099', // Pink
    '#ff6600', // Orange
    '#ffff00', // Yellow
  ];

  constructor(canvas: HTMLCanvasElement, game: Game) {
    this.canvas = canvas;
    this.ctx = canvas.getContext('2d')!;
    this.game = game;
    this.setupAnimations();
  }

  private setupAnimations(): void {
    // Animate camera rotation for dynamic feel
    animate(this.animationTarget, {
      rotationX: [0, Math.PI * 2],
      rotationY: [0, Math.PI * 1.5],
      duration: 30000,
      easing: 'linear',
      loop: true,
      update: () => {
        this.rotationX = this.animationTarget.rotationX;
        this.rotationY = this.animationTarget.rotationY;
      }
    });
  }

  public updateFrequencyData(frequencyData: Uint8Array, highIntensity: boolean): void {
    const now = Date.now();
    
    // Clear old points for clean circular pattern
    this.oscilloscopePoints = this.oscilloscopePoints.filter(
      point => now - point.age < 100 // Very short lifetime for clean pattern
    );
    
    // Create stable circular oscilloscope pattern
    const numSegments = 64; // Fixed number of segments for clean circle
    const stepSize = Math.floor(frequencyData.length / numSegments);
    
    for (let i = 0; i < numSegments; i++) {
      const dataIndex = i * stepSize;
      if (dataIndex >= frequencyData.length) break;
      
      const intensity = frequencyData[dataIndex] / 255;
      const frequency = (dataIndex / frequencyData.length) * 22050;
      
      // Create perfect circle based on segment position
      const angle = (i / numSegments) * Math.PI * 2;
      const baseRadius = 120; // Base radius for circle
      const radius = baseRadius + (intensity * 80); // Add intensity variation
      
      const point: OscilloscopePoint = {
        x: Math.cos(angle) * radius,
        y: Math.sin(angle) * radius, // Keep circular (no flattening)
        frequency,
        intensity: Math.max(0.1, intensity), // Minimum intensity for visibility
        age: now
      };
      
      this.oscilloscopePoints.push(point);
    }

    // Add chaos during high intensity (but controlled)
    if (highIntensity) {
      this.addIntensityEffects(now);
    }
  }

  private addIntensityEffects(_now: number): void {
    // Disabled for cleaner oscilloscope pattern
    // Only add very subtle camera movement
    if (Math.random() < 0.1) { // Only 10% chance
      animate(this.animationTarget, {
        rotationX: this.rotationX + (Math.random() - 0.5) * Math.PI * 0.02,
        rotationY: this.rotationY + (Math.random() - 0.5) * Math.PI * 0.02,
        duration: 1000, // Very slow, gentle movement
        easing: 'outQuart'
      });
    }
  }

  public render(notes: GameNote[], frequencyData: Uint8Array, _canvasWidth: number, _canvasHeight: number, currentTime: number): void {
    // Update shared game state
    this.game.updateHitEffects();
    this.game.updateLanePresses();

    const { width, height } = this.canvas;
    
    // Clear with dark background
    this.ctx.fillStyle = 'rgba(0, 0, 0, 0.1)';
    this.ctx.fillRect(0, 0, width, height);

    // Calculate high intensity for 3D effects
    const totalEnergy = frequencyData.reduce((sum, val) => sum + val, 0);
    const avgEnergy = totalEnergy / frequencyData.length;
    const highIntensity = avgEnergy > 100;

    this.updateFrequencyData(frequencyData, highIntensity);

    // Draw 3D components
    this.drawFretboard3D();
    this.drawHitZone3D();
    this.drawOscilloscope();
    this.drawVectorEdges();
    this.draw3DNotes(notes, currentTime);
    this.drawHitEffects3D();
    this.drawLanePressEffects3D();
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
      
      // Calculate note's position in the oscilloscope pattern
      const noteZ = (note.timestamp - currentTime) * 0.1;
      
      // Check if note is in hit zone range (closer range for oscilloscope precision)
      if (Math.abs(noteZ - this.HIT_ZONE_Z) <= this.HIT_ZONE_RANGE * 2) {
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

  private drawFretboard3D(): void {

  }

  private drawOscilloscope(): void {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;

    // Draw circular oscilloscope pattern
    this.ctx.save();
    
    // Connect points to form smooth circular pattern
    if (this.oscilloscopePoints.length > 2) {
      this.ctx.strokeStyle = 'rgba(0, 255, 255, 0.8)';
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      
      // Sort points by angle for smooth circle
      const sortedPoints = [...this.oscilloscopePoints].sort((a, b) => {
        const angleA = Math.atan2(a.y, a.x);
        const angleB = Math.atan2(b.y, b.x);
        return angleA - angleB;
      });
      
      // Draw the circular oscilloscope
      for (let i = 0; i < sortedPoints.length; i++) {
        const point = sortedPoints[i];
        const projected = this.project3D(point.x, point.y, -50);
        const scale = this.cameraZ / (this.cameraZ - 50);
        
        if (scale > 0) {
          const screenX = centerX + projected.x;
          const screenY = centerY + projected.y;
          
          if (i === 0) {
            this.ctx.moveTo(screenX, screenY);
          } else {
            this.ctx.lineTo(screenX, screenY);
          }
        }
      }
      
      // Close the circle
      if (sortedPoints.length > 0) {
        const firstPoint = sortedPoints[0];
        const projected = this.project3D(firstPoint.x, firstPoint.y, -50);
        const screenX = centerX + projected.x;
        const screenY = centerY + projected.y;
        this.ctx.lineTo(screenX, screenY);
      }
      
      this.ctx.stroke();
    }

    // Draw individual frequency points
    this.oscilloscopePoints.forEach((point) => {
      const projected = this.project3D(point.x, point.y, -50);
      const scale = this.cameraZ / (this.cameraZ - 50);
      
      if (scale <= 0) return;

      const screenX = centerX + projected.x;
      const screenY = centerY + projected.y;

      // Choose color based on frequency
      const colorIndex = Math.floor((point.frequency / 22050) * this.FREQUENCY_COLORS.length);
      const color = this.FREQUENCY_COLORS[Math.min(colorIndex, this.FREQUENCY_COLORS.length - 1)];
      
      // Draw frequency point
      this.ctx.fillStyle = `${color}${Math.floor(point.intensity * 255).toString(16).padStart(2, '0')}`;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, 2 + point.intensity * 3, 0, Math.PI * 2);
      this.ctx.fill();

      // Add subtle glow
      this.ctx.shadowColor = color;
      this.ctx.shadowBlur = 5 * point.intensity;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
    });
    
    this.ctx.restore();
  }

  private drawVectorEdges(): void {
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const now = Date.now();

    // Draw connecting lines between nearby points to create vector graph feel
    for (let i = 0; i < this.oscilloscopePoints.length; i++) {
      const point1 = this.oscilloscopePoints[i];
      const age1 = now - point1.age;
      
      for (let j = i + 1; j < Math.min(i + 5, this.oscilloscopePoints.length); j++) {
        const point2 = this.oscilloscopePoints[j];
        const age2 = now - point2.age;
        
        const distance = Math.sqrt(
          Math.pow(point1.x - point2.x, 2) + 
          Math.pow(point1.y - point2.y, 2)
        );
        
        if (distance < 150) { // Only connect nearby points
          const projected1 = this.project3D(point1.x, point1.y, age1 * 0.1 - 200);
          const projected2 = this.project3D(point2.x, point2.y, age2 * 0.1 - 200);
          
          const scale1 = this.cameraZ / (this.cameraZ + age1 * 0.1 - 200);
          const scale2 = this.cameraZ / (this.cameraZ + age2 * 0.1 - 200);
          
          if (scale1 > 0 && scale2 > 0) {
            const fadeAmount = Math.min(1 - age1 / 3000, 1 - age2 / 3000);
            
            this.ctx.strokeStyle = `rgba(0, 255, 255, ${fadeAmount * 0.3})`;
            this.ctx.lineWidth = 1;
            this.ctx.beginPath();
            this.ctx.moveTo(centerX + projected1.x, centerY + projected1.y);
            this.ctx.lineTo(centerX + projected2.x, centerY + projected2.y);
            this.ctx.stroke();
          }
        }
      }
    }
  }

  private draw3DNotes(notes: GameNote[], currentTime: number): void {
    this.ctx.save();
    
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    
    notes.forEach(note => {
      if (note.hit) return;
      
      // Calculate 3D position - notes follow stable circular pattern
      const noteZ = (note.timestamp - currentTime) * 0.1;
      
      // Skip notes that are too far
      if (noteZ < -50 || noteZ > 20) return;
      
      // Position notes in stable circular pattern (same as oscilloscope)
      const angle = (note.lane / 8) * Math.PI * 2; // Distribute lanes around circle
      const baseRadius = 120; // Same as oscilloscope base radius
      
      // Much more subtle oscillation that syncs with music timing
      const musicSync = Math.sin((currentTime + note.timestamp) * 0.005) * 10;
      const radius = baseRadius + musicSync;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius; // Keep perfectly circular
      
      // Project to screen coordinates
      const projected = this.project3D(x, y, noteZ);
      const screenX = centerX + projected.x;
      const screenY = centerY + projected.y;
      
      // Scale and alpha based on distance
      const scale = Math.max(0.3, 1 - Math.abs(noteZ) / 30);
      const alpha = Math.max(0.4, 1 - Math.abs(noteZ) / 25);
      
      // Draw note as part of the oscilloscope pattern
      this.ctx.globalAlpha = alpha;
      const noteColor = this.FREQUENCY_COLORS[note.lane % this.FREQUENCY_COLORS.length];
      this.ctx.fillStyle = noteColor;
      
      // Draw stable note that integrates with oscilloscope
      const noteSize = 8 * scale;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, noteSize, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add vector-style glow that matches oscilloscope
      this.ctx.shadowColor = noteColor;
      this.ctx.shadowBlur = 15 * scale * alpha;
      this.ctx.fill();
      this.ctx.shadowBlur = 0;
      
      // Draw connecting line to center (vector edge style)
      this.ctx.strokeStyle = `${noteColor}${Math.floor(alpha * 0.4 * 255).toString(16).padStart(2, '0')}`;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(screenX, screenY);
      this.ctx.stroke();
    });
    
    this.ctx.restore();
  }

  private project3D(x: number, y: number, z: number): Vector3D {
    // Apply rotations
    const cosX = Math.cos(this.rotationX);
    const sinX = Math.sin(this.rotationX);
    const cosY = Math.cos(this.rotationY);
    const sinY = Math.sin(this.rotationY);

    // Rotate around Y axis
    const x1 = x * cosY - z * sinY;
    const z1 = x * sinY + z * cosY;

    // Rotate around X axis
    const y1 = y * cosX - z1 * sinX;
    const z2 = y * sinX + z1 * cosX;

    // Perspective projection
    const scale = this.cameraZ / (this.cameraZ + z2);
    
    return {
      x: x1 * scale,
      y: y1 * scale,
      z: z2
    };
  }

  private drawHitZone3D(): void {
    this.ctx.save();
    
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Draw hit zone as stable circular markers (same as oscilloscope)
    const hitZoneRadius = 120; // Same as oscilloscope and notes base radius
    const segments = 8; // One for each lane
    
    for (let i = 0; i < segments; i++) {
      const angle = (i / segments) * Math.PI * 2;
      
      // Stable hit zone markers with minimal animation
      const radius = hitZoneRadius;
      
      const x = Math.cos(angle) * radius;
      const y = Math.sin(angle) * radius;
      
      // Project to screen coordinates
      const projected = this.project3D(x, y, this.HIT_ZONE_Z);
      const screenX = centerX + projected.x;
      const screenY = centerY + projected.y;
      
      // Draw hit zone marker as part of oscilloscope
      const zoneColor = this.FREQUENCY_COLORS[i % this.FREQUENCY_COLORS.length];
      this.ctx.fillStyle = `${zoneColor}44`; // Semi-transparent
      this.ctx.strokeStyle = `${zoneColor}88`;
      this.ctx.lineWidth = 2;
      
      // Draw hit zone circle
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, 15, 0, Math.PI * 2);
      this.ctx.fill();
      this.ctx.stroke();
      
      // Draw lane indicator line from center
      this.ctx.strokeStyle = `${zoneColor}33`;
      this.ctx.lineWidth = 1;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(screenX, screenY);
      this.ctx.stroke();
    }
    
    this.ctx.restore();
  }

  private drawHitEffects3D(): void {
    this.ctx.save();
    
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const currentTime = Date.now();
    
    this.game.getHitEffects().forEach(effect => {
      const elapsed = currentTime - effect.time;
      const opacity = Math.max(0, 1 - elapsed / 300); // 300ms fade
      
      if (opacity <= 0) return;
      
      // Position effect along oscilloscope pattern
      const angle = (effect.lane / 8) * Math.PI * 2;
      const baseRadius = 150;
      const x = Math.cos(angle) * baseRadius;
      const y = Math.sin(angle) * baseRadius * 0.6;
      
      const projected = this.project3D(x, y, this.HIT_ZONE_Z);
      const screenX = centerX + projected.x;
      const screenY = centerY + projected.y;
      
      this.ctx.globalAlpha = opacity;
      
      // Color based on accuracy
      let color: string;
      if (effect.accuracy > 0.9) color = '#00ff00';
      else if (effect.accuracy > 0.7) color = '#ffff00';
      else color = '#ff6600';
      
      // Calculate expanding size with oscilloscope integration
      const baseSize = 15 + (elapsed / 300) * 30;
      const oscillation = Math.sin(currentTime * 0.02 + effect.lane) * 5;
      const size = baseSize + oscillation;
      
      // Draw expanding effect that pulses with oscilloscope
      this.ctx.strokeStyle = color;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, size, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Add radiating lines (vector burst effect)
      for (let i = 0; i < 6; i++) {
        const rayAngle = (i / 6) * Math.PI * 2;
        const rayLength = size * 1.5;
        const rayX = screenX + Math.cos(rayAngle) * rayLength;
        const rayY = screenY + Math.sin(rayAngle) * rayLength;
        
        this.ctx.strokeStyle = `${color}${Math.floor(opacity * 0.7 * 255).toString(16).padStart(2, '0')}`;
        this.ctx.lineWidth = 1;
        this.ctx.beginPath();
        this.ctx.moveTo(screenX, screenY);
        this.ctx.lineTo(rayX, rayY);
        this.ctx.stroke();
      }
    });
    
    this.ctx.restore();
  }

  private drawLanePressEffects3D(): void {
    this.ctx.save();
    
    const { width, height } = this.canvas;
    const centerX = width / 2;
    const centerY = height / 2;
    const currentTime = Date.now();
    
    this.game.getLanePresses().forEach(press => {
      const elapsed = currentTime - press.time;
      const opacity = Math.max(0, 1 - elapsed / 200); // 200ms fade
      
      if (opacity <= 0) return;
      
      // Position press effect along oscilloscope pattern
      const angle = (press.lane / 8) * Math.PI * 2;
      const baseRadius = 150;
      
      // Add press animation that ripples outward
      const pressRadius = baseRadius + (elapsed / 200) * 50;
      const x = Math.cos(angle) * pressRadius;
      const y = Math.sin(angle) * pressRadius * 0.6;
      
      const projected = this.project3D(x, y, this.HIT_ZONE_Z);
      const screenX = centerX + projected.x;
      const screenY = centerY + projected.y;
      
      this.ctx.globalAlpha = opacity;
      const pressColor = this.FREQUENCY_COLORS[press.lane % this.FREQUENCY_COLORS.length];
      
      // Draw press ripple effect
      this.ctx.strokeStyle = pressColor;
      this.ctx.lineWidth = 2;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, 20, 0, Math.PI * 2);
      this.ctx.stroke();
      
      // Draw inner pulse
      this.ctx.fillStyle = `${pressColor}${Math.floor(opacity * 0.4 * 255).toString(16).padStart(2, '0')}`;
      this.ctx.beginPath();
      this.ctx.arc(screenX, screenY, 10, 0, Math.PI * 2);
      this.ctx.fill();
      
      // Add vector trail back to center
      this.ctx.strokeStyle = `${pressColor}${Math.floor(opacity * 0.6 * 255).toString(16).padStart(2, '0')}`;
      this.ctx.lineWidth = 3;
      this.ctx.beginPath();
      this.ctx.moveTo(centerX, centerY);
      this.ctx.lineTo(screenX, screenY);
      this.ctx.stroke();
    });
    
    this.ctx.restore();
  }

  public destroy(): void {
    // Clean up any animations
    this.oscilloscopePoints = [];
  }
}
