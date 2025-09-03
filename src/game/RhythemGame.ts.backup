import { AudioAnalyzer } from './AudioAnalyzer';
import { GameRenderer } from './GameRenderer';
import { BeatDetector } from './BeatDetector';
import { InputHandler } from './InputHandler';
import { ScoreManager } from './ScoreManager';

export interface GameNote {
  lane: number;
  timestamp: number;
  hit: boolean;
  y: number;
}

export class RhythemGame {
  private canvas: HTMLCanvasElement;
  private ctx: CanvasRenderingContext2D;
  private audioAnalyzer: AudioAnalyzer;
  private gameRenderer: GameRenderer;
  private beatDetector: BeatDetector;
  private inputHandler: InputHandler;
  private scoreManager: ScoreManager;
  
  private isPlaying = false;
  private notes: GameNote[] = [];
  private animationId: number | null = null;
  
  // Game settings
  private sensitivity = 1.0;
  private noteSpeed = 300; // pixels per second
  private laneCount = 8; // A S D F - J K L ;
  
  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    this.audioAnalyzer = new AudioAnalyzer();
    this.gameRenderer = new GameRenderer(this.ctx);
    this.beatDetector = new BeatDetector();
    this.inputHandler = new InputHandler();
    this.scoreManager = new ScoreManager();
  }

  public async init(): Promise<void> {
    this.setupCanvas();
    this.setupEventListeners();
    this.setupUI();
    
    // Start the game loop
    this.gameLoop();
  }

  private setupCanvas(): void {
    const resizeCanvas = () => {
      this.canvas.width = window.innerWidth;
      this.canvas.height = window.innerHeight - 120; // Account for control panel
    };
    
    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);
  }

  private setupEventListeners(): void {
    // File input for audio
    const audioFileInput = document.getElementById('audio-file') as HTMLInputElement;
    audioFileInput.addEventListener('change', this.handleAudioFile.bind(this));
    
    // Play/pause button
    const playPauseBtn = document.getElementById('play-pause') as HTMLButtonElement;
    playPauseBtn.addEventListener('click', this.togglePlayPause.bind(this));
    
    // Sensitivity slider
    const sensitivitySlider = document.getElementById('sensitivity') as HTMLInputElement;
    const sensitivityValue = document.getElementById('sensitivity-value') as HTMLSpanElement;
    
    sensitivitySlider.addEventListener('input', (e) => {
      this.sensitivity = parseFloat((e.target as HTMLInputElement).value);
      sensitivityValue.textContent = this.sensitivity.toFixed(1);
      this.beatDetector.setSensitivity(this.sensitivity);
    });
    
    // Keyboard input for rhythm game
    this.inputHandler.onKeyPress = this.handleKeyPress.bind(this);
  }

  private setupUI(): void {
    this.scoreManager.onScoreUpdate = (score: number, combo: number) => {
      const scoreElement = document.getElementById('score') as HTMLSpanElement;
      const comboElement = document.getElementById('combo') as HTMLSpanElement;
      
      scoreElement.textContent = score.toString();
      comboElement.textContent = combo.toString();
    };
  }

  private async handleAudioFile(event: Event): Promise<void> {
    const file = (event.target as HTMLInputElement).files?.[0];
    if (!file) return;
    
    try {
      await this.audioAnalyzer.loadAudioFile(file);
      
      // Generate beats from audio analysis
      const beats = await this.beatDetector.detectBeats(
        this.audioAnalyzer.getAudioBuffer(),
        this.sensitivity
      );
      
      // Convert beats to game notes
      this.generateNotesFromBeats(beats);
      
      console.log(`Generated ${this.notes.length} notes from ${beats.length} detected beats`);
    } catch (error) {
      console.error('Error loading audio file:', error);
      alert('Error loading audio file. Please try a different file.');
    }
  }

  private generateNotesFromBeats(beats: number[]): void {
    this.notes = [];
    
    beats.forEach((beatTime, index) => {
      // Distribute notes across lanes based on beat intensity and pattern
      const lane = this.calculateLaneForBeat(beatTime, index);
      
      this.notes.push({
        lane,
        timestamp: beatTime,
        hit: false,
        y: -50 // Start above the screen
      });
    });
    
    // Sort notes by timestamp
    this.notes.sort((a, b) => a.timestamp - b.timestamp);
  }

  private calculateLaneForBeat(beatTime: number, index: number): number {
    // Use a combination of beat timing and frequency analysis to determine lane
    // This creates a more interesting and varied note pattern
    const frequencyData = this.audioAnalyzer.getFrequencyDataAtTime(beatTime);
    
    if (frequencyData) {
      // Map different frequency ranges to different lanes
      const bassRange = frequencyData.slice(0, 32).reduce((a: number, b: number) => a + b, 0);
      const midRange = frequencyData.slice(32, 128).reduce((a: number, b: number) => a + b, 0);
      const highRange = frequencyData.slice(128, 256).reduce((a: number, b: number) => a + b, 0);
      
      // Determine lane based on dominant frequency range
      if (bassRange > midRange && bassRange > highRange) {
        return index % 2; // Left side for bass (A, S)
      } else if (midRange > highRange) {
        return 2 + (index % 2); // Center-left for mids (D, F)
      } else {
        return 4 + (index % 4); // Right side for highs (J, K, L, ;)
      }
    }
    
    // Fallback: distribute evenly
    return index % this.laneCount;
  }

  private togglePlayPause(): void {
    if (this.isPlaying) {
      this.pause();
    } else {
      this.play();
    }
  }

  private async play(): Promise<void> {
    if (this.notes.length === 0) {
      alert('Please load an audio file first!');
      return;
    }
    
    this.isPlaying = true;
    
    try {
      await this.audioAnalyzer.play();
    } catch (error) {
      console.error('Error playing audio:', error);
      this.isPlaying = false;
    }
  }

  private pause(): void {
    this.isPlaying = false;
    this.audioAnalyzer.pause();
  }

  private handleKeyPress(lane: number): void {
    if (!this.isPlaying) return;
    
    // Check for notes in this lane that can be hit
    const hitWindow = 150; // ms tolerance
    const currentTime = this.audioAnalyzer.getCurrentTime() * 1000;
    
    let hitNote = false;
    
    for (const note of this.notes) {
      if (note.lane === lane && !note.hit) {
        const timeDiff = Math.abs(note.timestamp - currentTime);
        
        if (timeDiff <= hitWindow) {
          note.hit = true;
          hitNote = true;
          
          // Calculate score based on timing accuracy
          const accuracy = 1 - (timeDiff / hitWindow);
          this.scoreManager.addHit(accuracy);
          
          // Visual feedback
          this.gameRenderer.showHitEffect(lane, accuracy);
          break;
        }
      }
    }
    
    if (!hitNote) {
      this.scoreManager.addMiss();
    }
  }

  private gameLoop(): void {
    this.update();
    this.render();
    
    this.animationId = requestAnimationFrame(() => this.gameLoop());
  }

  private update(): void {
    if (!this.isPlaying) return;
    
    const currentTime = this.audioAnalyzer.getCurrentTime() * 1000;
    
    // Update note positions
    for (const note of this.notes) {
      if (!note.hit) {
        const noteAge = currentTime - note.timestamp;
        note.y = (noteAge / 1000) * this.noteSpeed + this.canvas.height * 0.8;
      }
    }
    
    // Remove notes that have passed the bottom
    this.notes = this.notes.filter(note => {
      if (note.y > this.canvas.height + 50 && !note.hit) {
        this.scoreManager.addMiss();
        return false;
      }
      return true;
    });
    
    // Check if song has ended
    if (this.audioAnalyzer.hasEnded()) {
      this.isPlaying = false;
    }
  }

  private render(): void {
    // Clear canvas
    this.ctx.fillStyle = 'rgba(15, 15, 35, 0.3)';
    this.ctx.fillRect(0, 0, this.canvas.width, this.canvas.height);
    
    // Render game elements
    this.gameRenderer.renderLanes(this.canvas.width, this.canvas.height, this.laneCount);
    this.gameRenderer.renderNotes(this.notes, this.canvas.width, this.laneCount);
    this.gameRenderer.renderHitZone(this.canvas.width, this.canvas.height, this.laneCount);
    this.gameRenderer.renderHitEffects(this.canvas.width, this.canvas.height, this.laneCount);
    
    if (this.isPlaying) {
      this.gameRenderer.renderAudioVisualization(
        this.audioAnalyzer.getFrequencyData(),
        this.canvas.width,
        this.canvas.height
      );
    }
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.audioAnalyzer.destroy();
    this.inputHandler.destroy();
  }
}
