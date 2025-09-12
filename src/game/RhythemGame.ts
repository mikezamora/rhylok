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
  private notes: GameNote[] = [];
  private isPlaying = false;
  private sensitivity = 1.0;
  private noteSpeed = 300;
  private animationId: number | null = null;
  private realtimeBeatDetectionInterval: number | null = null;
  private lastBeatTime = 0;
  private controlsVisible = true;

  constructor() {
    this.canvas = document.getElementById('game-canvas') as HTMLCanvasElement;
    this.ctx = this.canvas.getContext('2d')!;
    
    // Set canvas size
    this.canvas.width = window.innerWidth;
    this.canvas.height = window.innerHeight;
    
    // Initialize game components
    this.audioAnalyzer = new AudioAnalyzer();
    this.gameRenderer = new GameRenderer(this.ctx);
    this.beatDetector = new BeatDetector();
    this.inputHandler = new InputHandler();
    this.scoreManager = new ScoreManager();
    
    this.setupEventListeners();
    this.gameLoop();
  }

  private setupEventListeners(): void {
    // Audio file input
    const audioFileInput = document.getElementById('audio-file') as HTMLInputElement;
    audioFileInput.addEventListener('change', this.handleAudioFile.bind(this));
    
    // Play/pause button
    const playPauseBtn = document.getElementById('play-pause') as HTMLButtonElement;
    playPauseBtn.addEventListener('click', this.togglePlayPause.bind(this));
    
    // Microphone toggle button
    const microphoneBtn = document.getElementById('microphone-toggle') as HTMLButtonElement;
    microphoneBtn.addEventListener('click', this.toggleMicrophone.bind(this));
    
    // Hide controls button
    const hideControlsBtn = document.getElementById('hide-controls-btn') as HTMLButtonElement;
    hideControlsBtn.addEventListener('click', this.toggleControlsVisibility.bind(this));
    
    // Sensitivity slider
    const sensitivitySlider = document.getElementById('sensitivity') as HTMLInputElement;
    const sensitivityValue = document.getElementById('sensitivity-value') as HTMLSpanElement;
    
    sensitivitySlider.addEventListener('input', (e) => {
      this.sensitivity = parseFloat((e.target as HTMLInputElement).value);
      sensitivityValue.textContent = this.sensitivity.toFixed(1);
      this.beatDetector.setSensitivity(this.sensitivity);
      this.rescanCurrentAudio();
    });
    
    // Auto-detect sensitivity button
    const autoDetectBtn = document.createElement('button');
    autoDetectBtn.textContent = 'Auto-Detect Sensitivity';
    autoDetectBtn.id = 'auto-detect-sensitivity';
    autoDetectBtn.style.cssText = `
      background: #4CAF50;
      border: none;
      color: white;
      padding: 8px 16px;
      margin-left: 10px;
      border-radius: 4px;
      cursor: pointer;
      font-size: 14px;
    `;
    autoDetectBtn.addEventListener('click', this.autoDetectSensitivity.bind(this));
    
    // Add the button next to the sensitivity slider
    const sensitivityGroup = sensitivitySlider.parentElement;
    if (sensitivityGroup) {
      sensitivityGroup.appendChild(autoDetectBtn);
    }
    
    // Playback speed slider
    const playbackSpeedSlider = document.getElementById('playback-speed') as HTMLInputElement;
    const playbackSpeedValue = document.getElementById('playback-speed-value') as HTMLSpanElement;
    
    playbackSpeedSlider.addEventListener('input', (e) => {
      const speed = parseFloat((e.target as HTMLInputElement).value);
      playbackSpeedValue.textContent = speed.toFixed(1) + 'x';
      this.audioAnalyzer.setPlaybackRate(speed);
      
      // Adjust note speed to match playback speed
      this.noteSpeed = 300 * speed;
    });
    
    // Instrument focus selector
    const instrumentFocus = document.getElementById('instrument-focus') as HTMLSelectElement;
    const customFreqGroup = document.getElementById('custom-freq-group') as HTMLDivElement;
    
    instrumentFocus.addEventListener('change', (e) => {
      const value = (e.target as HTMLSelectElement).value;
      
      if (value === 'custom') {
        customFreqGroup.style.display = 'block';
      } else {
        customFreqGroup.style.display = 'none';
      }
      
      this.updateInstrumentFocus();
    });
    
    // Custom frequency inputs
    const customFreqMin = document.getElementById('custom-freq-min') as HTMLInputElement;
    const customFreqMax = document.getElementById('custom-freq-max') as HTMLInputElement;
    
    customFreqMin.addEventListener('input', () => this.updateInstrumentFocus());
    customFreqMax.addEventListener('input', () => this.updateInstrumentFocus());
    
    // Difficulty mode selector
    const difficultyMode = document.getElementById('difficulty-mode') as HTMLSelectElement;
    difficultyMode.addEventListener('change', (e) => {
      const difficulty = (e.target as HTMLSelectElement).value as 'normal' | 'hard' | 'extreme' | 'intensity';
      this.beatDetector.setDifficultyMode(difficulty);
      this.rescanCurrentAudio();
    });
    
    // Time signature follow checkbox
    const timeSignatureCheck = document.getElementById('time-signature-follow') as HTMLInputElement;
    timeSignatureCheck.addEventListener('change', (e) => {
      this.beatDetector.setFollowTimeSignature((e.target as HTMLInputElement).checked);
      this.rescanCurrentAudio();
    });
    
    // Keyboard input for rhythm game
    this.inputHandler.onKeyPress = this.handleKeyPress.bind(this);
    this.inputHandler.onSpacePress = this.togglePlayPause.bind(this);
    this.inputHandler.onEscapePress = this.toggleSettings.bind(this);
  }
  
  private updateInstrumentFocus(): void {
    const instrumentFocus = document.getElementById('instrument-focus') as HTMLSelectElement;
    const minFreq = parseInt((document.getElementById('custom-freq-min') as HTMLInputElement).value);
    const maxFreq = parseInt((document.getElementById('custom-freq-max') as HTMLInputElement).value);
    
    const focusType = instrumentFocus.value as 'all' | 'bass' | 'drums' | 'vocals' | 'treble' | 'custom';
    
    if (focusType === 'custom') {
      this.beatDetector.setInstrumentFocus({
        type: 'custom',
        minFreq: minFreq,
        maxFreq: maxFreq
      });
    } else {
      this.beatDetector.setInstrumentFocus({ type: focusType });
    }
    
    this.rescanCurrentAudio();
  }
  
  private async rescanCurrentAudio(): Promise<void> {
    // Only rescan if we have an audio file loaded and not using microphone
    if (!this.audioAnalyzer.getAudioBuffer() || this.audioAnalyzer.isUsingMicrophoneInput()) {
      return;
    }
    
    console.log('Rescanning audio with new settings...');
    
    try {
      // Generate beats from audio analysis with current settings
      const beats = await this.beatDetector.detectBeats(
        this.audioAnalyzer.getAudioBuffer(),
        this.sensitivity
      );
      
      // Convert beats to game notes
      this.generateNotesFromBeats(beats);
      
      console.log(`Rescan complete: ${this.notes.length} notes from ${beats.length} detected beats`);
      
      // Show user feedback
      this.showRescanFeedback(beats.length);
    } catch (error) {
      console.error('Error rescanning audio:', error);
    }
  }
  
  private showRescanFeedback(beatCount: number): void {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: #ff6b6b;
      padding: 15px 25px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      z-index: 1000;
      pointer-events: none;
      animation: fadeInOut 2s ease-in-out;
    `;
    notification.textContent = `Rescanned: ${beatCount} beats detected`;
    
    // Add CSS animation
    const style = document.createElement('style');
    style.textContent = `
      @keyframes fadeInOut {
        0% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
        30% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        70% { opacity: 1; transform: translate(-50%, -50%) scale(1); }
        100% { opacity: 0; transform: translate(-50%, -50%) scale(0.8); }
      }
    `;
    
    document.head.appendChild(style);
    document.body.appendChild(notification);
    
    // Remove notification after animation
    setTimeout(() => {
      document.body.removeChild(notification);
      document.head.removeChild(style);
    }, 2000);
  }

  private async handleAudioFile(event: Event): Promise<void> {
    const input = event.target as HTMLInputElement;
    const file = input.files?.[0];
    
    if (!file) return;
    
    try {
      // Load audio file
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
      alert('Failed to load audio file. Please try a different format.');
    }
  }

  private generateNotesFromBeats(beats: number[]): void {
    this.notes = [];
    
    const difficultyMode = (document.getElementById('difficulty-mode') as HTMLSelectElement).value;
    
    for (const beatTime of beats) {
      // Generate intensity based on position in song for difficulty modes
      const intensity = Math.random() * 100; // Simple random intensity for now
      
      // Determine number of notes based on difficulty and intensity
      let noteCount = 1;
      
      switch (difficultyMode) {
        case 'hard':
          noteCount = intensity > 80 ? 2 : 1;
          break;
        case 'extreme':
          noteCount = intensity > 90 ? 3 : intensity > 70 ? 2 : 1;
          break;
        case 'intensity':
          // Intensity Master mode: more notes during intense parts
          if (intensity > 95) {
            noteCount = Math.min(4, Math.floor(intensity / 25));
          } else if (intensity > 80) {
            noteCount = 2;
          } else {
            noteCount = 1;
          }
          break;
      }
      
      // Generate notes for this beat
      const usedLanes = new Set<number>();
      
      for (let i = 0; i < noteCount; i++) {
        let lane: number;
        
        // Ensure no duplicate lanes for the same beat
        do {
          lane = Math.floor(Math.random() * 8);
        } while (usedLanes.has(lane) && usedLanes.size < 8);
        
        usedLanes.add(lane);
        
        const note: GameNote = {
          lane: lane,
          timestamp: beatTime,
          hit: false,
          y: -50 // Start above the screen
        };
        
        this.notes.push(note);
      }
    }
    
    // Sort notes by timestamp
    this.notes.sort((a, b) => a.timestamp - b.timestamp);
  }

  private async togglePlayPause(): Promise<void> {
    if (this.isPlaying) {
      await this.pause();
    } else {
      await this.play();
    }
  }

  private async toggleMicrophone(): Promise<void> {
    const microphoneBtn = document.getElementById('microphone-toggle') as HTMLButtonElement;
    
    try {
      if (this.audioAnalyzer.isUsingMicrophoneInput()) {
        // Stop microphone input
        this.audioAnalyzer.stopMicrophoneInput();
        this.isPlaying = false;
        this.notes = [];
        this.stopRealtimeBeatDetection();
        microphoneBtn.textContent = 'MIC: Use Microphone';
        microphoneBtn.style.backgroundColor = '';
        console.log('Microphone input stopped');
      } else {
        // Start microphone input
        await this.audioAnalyzer.startMicrophoneInput();
        this.isPlaying = true;
        
        // Start real-time beat detection
        this.startRealtimeBeatDetection();
        
        microphoneBtn.textContent = 'MIC: Stop Microphone';
        microphoneBtn.style.backgroundColor = '#ff4444';
        console.log('Microphone input started - real-time beat detection active');
      }
    } catch (error) {
      console.error('Error toggling microphone:', error);
      alert('Failed to access microphone. Please check permissions.');
    }
  }

  private startRealtimeBeatDetection(): void {
    // Clear any existing interval
    this.stopRealtimeBeatDetection();
    
    // Start detecting beats in real-time
    this.realtimeBeatDetectionInterval = window.setInterval(() => {
      this.detectRealtimeBeat();
    }, 50); // Check for beats every 50ms
  }

  private stopRealtimeBeatDetection(): void {
    if (this.realtimeBeatDetectionInterval !== null) {
      clearInterval(this.realtimeBeatDetectionInterval);
      this.realtimeBeatDetectionInterval = null;
    }
  }

  private detectRealtimeBeat(): void {
    const frequencyData = this.audioAnalyzer.getFrequencyData();
    if (!frequencyData) return;

    // Calculate energy from frequency data
    let energy = 0;
    for (let i = 0; i < frequencyData.length; i++) {
      energy += frequencyData[i] * frequencyData[i];
    }
    energy = Math.sqrt(energy / frequencyData.length);

    // Simple beat detection based on energy threshold
    const threshold = 30 * this.sensitivity; // Adjustable threshold
    const currentTime = Date.now();
    
    // Prevent beats too close together (minimum 100ms apart)
    if (energy > threshold && (currentTime - this.lastBeatTime) > 100) {
      this.generateRealtimeNote();
      this.lastBeatTime = currentTime;
    }
  }

  private generateRealtimeNote(): void {
    // Generate a note immediately for real-time play
    const lane = Math.floor(Math.random() * 8); // Random lane
    const note: GameNote = {
      timestamp: Date.now(),
      lane: lane,
      hit: false,
      y: 0 // Start at top of screen
    };
    
    // Add note to current notes for immediate gameplay
    this.notes.push(note);
    
    // Keep only recent notes to prevent memory issues
    const cutoffTime = Date.now() - 10000; // Keep last 10 seconds
    this.notes = this.notes.filter(note => note.timestamp > cutoffTime);
  }

  private toggleControlsVisibility(): void {
    const controlPanel = document.getElementById('control-panel') as HTMLDivElement;
    const hideControlsBtn = document.getElementById('hide-controls-btn') as HTMLButtonElement;
    
    if (this.controlsVisible) {
      // Hide controls
      controlPanel.style.display = 'none';
      hideControlsBtn.textContent = '[PLAY]';
      hideControlsBtn.title = 'Show Controls';
      this.controlsVisible = false;
    } else {
      // Show controls
      controlPanel.style.display = 'block';
      hideControlsBtn.textContent = '[SETTINGS]';
      hideControlsBtn.title = 'Hide Controls';
      this.controlsVisible = true;
    }
  }

  private toggleSettings(): void {
    // Use the same logic as toggleControlsVisibility
    this.toggleControlsVisibility();
  }

  private async autoDetectSensitivity(): Promise<void> {
    // Only work with uploaded files, not microphone input
    if (!this.audioAnalyzer.getAudioBuffer() || this.audioAnalyzer.isUsingMicrophoneInput()) {
      alert('Please upload an audio file first to auto-detect sensitivity.');
      return;
    }

    const autoDetectBtn = document.getElementById('auto-detect-sensitivity') as HTMLButtonElement;
    const originalText = autoDetectBtn.textContent;
    autoDetectBtn.textContent = 'Analyzing...';
    autoDetectBtn.disabled = true;

    try {
      console.log('Starting auto-detection of optimal sensitivity...');
      
      // Test different sensitivity levels
      const testSensitivities = [0.3, 0.5, 0.8, 1.0, 1.3, 1.6, 2.0, 2.5, 3.0];
      const results: Array<{sensitivity: number, beatCount: number, score: number}> = [];

      for (const testSensitivity of testSensitivities) {
        console.log(`Testing sensitivity: ${testSensitivity}`);
        
        // Temporarily set sensitivity
        this.beatDetector.setSensitivity(testSensitivity);
        
        // Detect beats with this sensitivity
        const beats = await this.beatDetector.detectBeats(
          this.audioAnalyzer.getAudioBuffer(),
          testSensitivity
        );

        // Calculate a score based on beat count and distribution
        const score = this.calculateSensitivityScore(beats);
        
        results.push({
          sensitivity: testSensitivity,
          beatCount: beats.length,
          score: score
        });

        console.log(`Sensitivity ${testSensitivity}: ${beats.length} beats, score: ${score.toFixed(2)}`);
      }

      // Find the best sensitivity
      const bestResult = results.reduce((best, current) => 
        current.score > best.score ? current : best
      );

      console.log(`Optimal sensitivity: ${bestResult.sensitivity} (${bestResult.beatCount} beats, score: ${bestResult.score.toFixed(2)})`);

      // Apply the optimal sensitivity
      this.sensitivity = bestResult.sensitivity;
      this.beatDetector.setSensitivity(this.sensitivity);

      // Update UI
      const sensitivitySlider = document.getElementById('sensitivity') as HTMLInputElement;
      const sensitivityValue = document.getElementById('sensitivity-value') as HTMLSpanElement;
      sensitivitySlider.value = this.sensitivity.toString();
      sensitivityValue.textContent = this.sensitivity.toFixed(1);

      // Regenerate notes with optimal sensitivity
      await this.rescanCurrentAudio();

      // Show result to user
      this.showAutoDetectResult(bestResult);

    } catch (error) {
      console.error('Error during auto-detection:', error);
      alert('Failed to auto-detect sensitivity. Please try manually adjusting the slider.');
    } finally {
      autoDetectBtn.textContent = originalText || 'Auto-Detect Sensitivity';
      autoDetectBtn.disabled = false;
    }
  }

  private calculateSensitivityScore(beats: number[]): number {
    if (beats.length === 0) return 0;

    const duration = this.audioAnalyzer.getAudioBuffer()?.duration || 1;
    const beatsPerSecond = beats.length / duration;
    
    // Ideal range: 1-4 beats per second for most music
    const idealRange = { min: 1, max: 4 };
    let frequencyScore = 0;
    
    if (beatsPerSecond >= idealRange.min && beatsPerSecond <= idealRange.max) {
      frequencyScore = 1.0; // Perfect frequency
    } else if (beatsPerSecond < idealRange.min) {
      frequencyScore = beatsPerSecond / idealRange.min; // Too few beats
    } else {
      frequencyScore = Math.max(0, 1 - (beatsPerSecond - idealRange.max) / idealRange.max); // Too many beats
    }

    // Calculate distribution score (beats should be reasonably distributed)
    const timeGaps = [];
    for (let i = 1; i < beats.length; i++) {
      timeGaps.push(beats[i] - beats[i-1]);
    }
    const avgGap = timeGaps.reduce((sum, gap) => sum + gap, 0) / timeGaps.length;
    const gapVariance = timeGaps.reduce((sum, gap) => sum + Math.pow(gap - avgGap, 2), 0) / timeGaps.length;
    const distributionScore = Math.max(0, 1 - (gapVariance / (avgGap * avgGap))); // Lower variance = better distribution

    // Combined score (weighted) - simplified since we don't have intensity data
    return (frequencyScore * 0.7) + (distributionScore * 0.3);
  }

  private showAutoDetectResult(result: {sensitivity: number, beatCount: number, score: number}): void {
    // Create a temporary notification
    const notification = document.createElement('div');
    notification.style.cssText = `
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background: rgba(0, 0, 0, 0.9);
      color: #4CAF50;
      padding: 20px 30px;
      border-radius: 8px;
      font-size: 16px;
      font-weight: bold;
      z-index: 1000;
      pointer-events: none;
      animation: fadeInOut 3s ease-in-out;
      text-align: center;
    `;
    notification.innerHTML = `
      <div>Optimal Sensitivity Found!</div>
      <div style="margin-top: 10px; font-size: 14px; color: #888;">
        Sensitivity: ${result.sensitivity} | Beats: ${result.beatCount} | Score: ${result.score.toFixed(2)}
      </div>
    `;
    
    document.body.appendChild(notification);
    
    // Remove notification after animation
    setTimeout(() => {
      document.body.removeChild(notification);
    }, 3000);
  }

  private async play(): Promise<void> {
    if (!this.audioAnalyzer.getAudioBuffer() && !this.audioAnalyzer.isUsingMicrophoneInput()) {
      alert('Please upload an audio file first or enable microphone input.');
      return;
    }
    
    await this.audioAnalyzer.play();
    this.isPlaying = this.audioAnalyzer.getIsPlaying();
  }

  private async pause(): Promise<void> {
    await this.audioAnalyzer.pause();
    this.isPlaying = this.audioAnalyzer.getIsPlaying();
  }

  private handleKeyPress(lane: number): void {
    // Always show lane press feedback, even when not playing
    this.gameRenderer.showLanePress(lane);
    
    if (!this.isPlaying) return;
    
    // Check for notes in this lane that can be hit
    const hitWindow = 150; // ms tolerance
    let currentTime: number;
    
    if (this.audioAnalyzer.isUsingMicrophoneInput()) {
      // For microphone input, use actual current time
      currentTime = Date.now();
    } else {
      // For file input, use audio playback time
      currentTime = this.audioAnalyzer.getCurrentTime() * 1000;
    }
    
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
          
          // Show visual hit effect
          this.gameRenderer.showHitEffect(lane, accuracy);
          
          break; // Only hit one note per keypress
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
    
    let currentTime: number;
    
    if (this.audioAnalyzer.isUsingMicrophoneInput()) {
      // For microphone input, use actual current time
      currentTime = Date.now();
    } else {
      // For file input, use audio playback time
      currentTime = this.audioAnalyzer.getCurrentTime() * 1000;
    }
    
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
    
    // Render game components using GameRenderer
    const laneCount = 8;
    this.gameRenderer.renderLanes(this.canvas.width, this.canvas.height, laneCount);
    this.gameRenderer.renderHitZone(this.canvas.width, this.canvas.height, laneCount);
    this.gameRenderer.renderNotes(this.notes, this.canvas.width, laneCount);
    this.gameRenderer.renderAudioVisualization(this.audioAnalyzer.getFrequencyData(), this.canvas.width, this.canvas.height);
    this.gameRenderer.renderHitEffects(this.canvas.width, this.canvas.height, laneCount);
    
    // Update score display
    document.getElementById('score')!.textContent = this.scoreManager.getScore().toString();
    document.getElementById('combo')!.textContent = this.scoreManager.getCombo().toString();
  }

  public destroy(): void {
    if (this.animationId) {
      cancelAnimationFrame(this.animationId);
    }
    
    this.stopRealtimeBeatDetection();
    this.audioAnalyzer.destroy();
  }
}
