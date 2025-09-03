export class AudioAnalyzer {
  private audioContext: AudioContext | null = null;
  private audioBuffer: AudioBuffer | null = null;
  private sourceNode: AudioBufferSourceNode | null = null;
  private analyserNode: AnalyserNode | null = null;
  private frequencyData: Uint8Array | null = null;
  private playbackRate = 1.0;
  private microphoneSource: MediaStreamAudioSourceNode | null = null;
  private microphoneStream: MediaStream | null = null;
  private isUsingMicrophone = false;

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

    console.log(`Loading audio file: ${file.name} (${(file.size / 1024 / 1024).toFixed(2)} MB)`);

    // Reset any previous playback state
    this.reset();

    try {
      const arrayBuffer = await file.arrayBuffer();
      console.log('File loaded, decoding audio...');
      
      this.audioBuffer = await this.audioContext.decodeAudioData(arrayBuffer);
      
      // Setup analyser
      this.analyserNode = this.audioContext.createAnalyser();
      this.analyserNode.fftSize = 2048;
      this.analyserNode.smoothingTimeConstant = 0.8;
      
      this.frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);
      
      console.log(`Audio decoded successfully: ${this.audioBuffer.duration.toFixed(2)}s, ${this.audioBuffer.sampleRate}Hz, ${this.audioBuffer.numberOfChannels} channels`);
      
      // Check if audio has content
      const channelData = this.audioBuffer.getChannelData(0);
      const hasContent = channelData.some(sample => Math.abs(sample) > 0.001);
      
      if (!hasContent) {
        console.warn('Audio file appears to be silent or very quiet');
      }
      
    } catch (error) {
      console.error('Error decoding audio file:', error);
      
      if (error instanceof DOMException) {
        if (error.name === 'EncodingError') {
          throw new Error('Unsupported audio format. Please try MP3, WAV, or OGG files.');
        } else if (error.name === 'NotSupportedError') {
          throw new Error('Audio format not supported by your browser. Please try a different file.');
        }
      }
      
      throw new Error('Failed to decode audio file. Please try a different format or file.');
    }
  }

  public async play(): Promise<void> {
    if (!this.audioContext || !this.audioBuffer || !this.analyserNode) {
      throw new Error('Audio not loaded');
    }

    // If audio context is suspended (paused), resume it
    if (this.audioContext.state === 'suspended' && this.sourceNode) {
      await this.audioContext.resume();
      console.log('▶️ Resumed playback');
      return;
    }

    // Stop previous playback if exists
    this.stop();

    // Create new source node
    this.sourceNode = this.audioContext.createBufferSource();
    this.sourceNode.buffer = this.audioBuffer;
    this.sourceNode.playbackRate.value = this.playbackRate;
    
    // Connect audio graph
    this.sourceNode.connect(this.analyserNode);
    this.analyserNode.connect(this.audioContext.destination);
    
    // Start playback from the beginning
    this.sourceNode.start(0);
    
    console.log('▶️ Started new playback');
    
    // Handle ended event
    this.sourceNode.onended = () => {
      console.log('🏁 Song ended');
    };
  }

  public setPlaybackRate(rate: number): void {
    this.playbackRate = Math.max(0.25, Math.min(4.0, rate));
    
    // If we have an active source node and audio is running, update its playback rate
    if (this.sourceNode && this.getIsPlaying()) {
      this.sourceNode.playbackRate.value = this.playbackRate;
    }
  }

  public getPlaybackRate(): number {
    return this.playbackRate;
  }

  public async pause(): Promise<void> {
    if (!this.audioContext || this.audioContext.state !== 'running') {
      return;
    }

    // Suspend the audio context to pause all audio processing
    await this.audioContext.suspend();
    
    console.log('⏸️ Paused playback');
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
  }

  public reset(): void {
    this.stop();
  }

  public getIsPlaying(): boolean {
    return this.audioContext?.state === 'running' && this.sourceNode !== null;
  }

  public getIsPaused(): boolean {
    return this.audioContext?.state === 'suspended' && this.sourceNode !== null;
  }

  public getCurrentTime(): number {
    if (!this.audioContext || !this.getIsPlaying()) {
      return 0;
    }
    
    return this.audioContext.currentTime;
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
    if (!this.getIsPlaying() || Math.abs(this.getCurrentTime() * 1000 - time) > 100) {
      return null;
    }
    
    return this.getFrequencyData();
  }

  public getAudioBuffer(): AudioBuffer | null {
    return this.audioBuffer;
  }

  public async startMicrophoneInput(): Promise<void> {
    if (!this.audioContext) {
      throw new Error('AudioContext not initialized');
    }

    try {
      // Stop any current audio playback
      this.stop();
      
      // Request microphone access
      this.microphoneStream = await navigator.mediaDevices.getUserMedia({ 
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        } 
      });
      
      // Create microphone source node
      this.microphoneSource = this.audioContext.createMediaStreamSource(this.microphoneStream);
      
      // Setup or reuse analyser
      if (!this.analyserNode) {
        this.analyserNode = this.audioContext.createAnalyser();
        this.analyserNode.fftSize = 2048;
        this.analyserNode.smoothingTimeConstant = 0.3; // More responsive for real-time
        this.frequencyData = new Uint8Array(this.analyserNode.frequencyBinCount);
      }
      
      // Connect microphone to analyser (but not to speakers to avoid feedback)
      this.microphoneSource.connect(this.analyserNode);
      
      this.isUsingMicrophone = true;
      
      console.log('Microphone input started successfully');
    } catch (error) {
      console.error('Failed to start microphone input:', error);
      throw new Error('Microphone access denied or not available');
    }
  }

  public stopMicrophoneInput(): void {
    if (this.microphoneSource) {
      this.microphoneSource.disconnect();
      this.microphoneSource = null;
    }
    
    if (this.microphoneStream) {
      this.microphoneStream.getTracks().forEach(track => track.stop());
      this.microphoneStream = null;
    }
    
    this.isUsingMicrophone = false;
    
    console.log('Microphone input stopped');
  }

  public isUsingMicrophoneInput(): boolean {
    return this.isUsingMicrophone;
  }

  public hasEnded(): boolean {
    if (!this.audioBuffer || !this.getIsPlaying()) {
      return true;
    }
    
    return this.getCurrentTime() >= this.audioBuffer.duration;
  }

  public destroy(): void {
    this.stop();
    this.stopMicrophoneInput();
    
    if (this.audioContext && this.audioContext.state !== 'closed') {
      this.audioContext.close();
    }
  }
}
