export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private frequencyData: Uint8Array | null = null;
  private startTime = 0;
  private isPlaying = false;

  constructor() {
    this.initAudioContext();
  }

  private async initAudioContext(): Promise<void> {
    try {
      this.audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      
      if (this.audioContext.state === 'suspended') {
        await this.audioContext.resume();
      }
    } catch (error) {
      console.error('Failed to initialize AudioContext:', error);
      throw new Error('Web Audio API not supported');
    }
  }

  public async loadAudioFile(file: File): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      const arrayBuffer = await file.arrayBuffer();
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Setup analyser
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;
      
      this.frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);
      
      console.log(`Loaded audio: ${this.audioBuffer.duration.toFixed(2)}s, ${this.audioBuffer.sampleRate}Hz`);
    } catch (error) {
      console.error('Error decoding audio file:', error);
      throw new Error('Failed to decode audio file. Please try a different format.');
    }
  }

  public async play(): Promise<void> {
    if (!this.audioContext || !this.audioBuffer || !this.analyserNode) {
      throw new Error('Audio not loaded');
    }

    // Stop previous playback if exists
    this.stop();

    // Create new source node
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    
    // Connect audio graph
    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
    
    // Start playback
    this.sourceNode.start();
    this.startTime = this.audioContext.currentTime;
    this.isPlaying = true;
    
    // Handle ended event
    this.sourceNode.onended = () => {
      this.isPlaying = false;
    };
  }

  public pause(): void {
    this.stop();
  }

  private stop(): void {
    if (this.sourceNode) {
      try {
        this.sourceNode.stop();
      } catch (error) {
        // Source might already be stopped
      }
      this.sourceNode = null;
    }
    this.isPlaying = false;
  }

  public getCurrentTime(): number {
    if (!this.audioContext || !this.isPlaying) {
      return 0;
    }
    
    return this.audioContext.currentTime - this.startTime;
  }

  public getFrequencyData(): Uint8Array {
    if (!this.analyserNode || !this.frequencyData) {
      return new Uint8Array(512);
    }
    
    const data = new Uint8Array(this.analyserNode.frequencyBinCount);
    this.analyserNode.getByteFrequencyData(data);
    return data;
  }

  public getFrequencyDataAtTime(time: number): Uint8Array | null {
    // For real-time analysis, we'll use current frequency data
    // In a more advanced implementation, you could pre-analyze the entire track
    if (!this.isPlaying || Math.abs(this.getCurrentTime() * 1000 - time) > 100) {
      return null;
    }
    
    return this.getFrequencyData();
  }

  public getAudioBuffer(): AudioBuffer | null {
    return this.audioBuffer;
  }

  public hasEnded(): boolean {
    if (!this.audioBuffer || !this.isPlaying) {
      return true;
    }
    
    return this.getCurrentTime() >= this.audioBuffer.duration;
  }

  public destroy(): void {
    this.stop();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
