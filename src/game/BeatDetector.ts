export class BeatDetector {
  private sensitivity = 1.0;
  private minTimeBetweenBeats = 100; // ms
  
  constructor() {}
  
  public setSensitivity(sensitivity: number): void {
    this.sensitivity = Math.max(0.1, Math.min(2.0, sensitivity));
  }
  
  public async detectBeats(audioBuffer: AudioBuffer | null, sensitivity: number): Promise<number[]> {
    if (!audioBuffer) {
      return [];
    }
    
    this.sensitivity = sensitivity;
    
    // Get audio channel data
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const sampleRate = audioBuffer.sampleRate;
    const windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
    const hopSize = Math.floor(windowSize / 4); // 75% overlap
    
    const beats: number[] = [];
    const energyHistory: number[] = [];
    const energyVarianceHistory: number[] = [];
    
    // Calculate energy for each window
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const energy = this.calculateEnergy(channelData, i, windowSize);
      energyHistory.push(energy);
      
      // Calculate local variance (measure of how much energy changes)
      if (energyHistory.length >= 10) {
        const recentEnergies = energyHistory.slice(-10);
        const variance = this.calculateVariance(recentEnergies);
        energyVarianceHistory.push(variance);
        
        // Beat detection algorithm
        if (this.isBeat(energy, energyHistory, variance)) {
          const timeStamp = (i / sampleRate) * 1000; // Convert to milliseconds
          
          // Avoid beats that are too close together
          if (beats.length === 0 || timeStamp - beats[beats.length - 1] >= this.minTimeBetweenBeats) {
            beats.push(timeStamp);
          }
        }
      }
    }
    
    // Apply additional filtering based on musical structure
    return this.filterBeats(beats);
  }
  
  private calculateEnergy(data: Float32Array, start: number, length: number): number {
    let energy = 0;
    for (let i = start; i < start + length && i < data.length; i++) {
      energy += data[i] * data[i];
    }
    return energy / length;
  }
  
  private calculateVariance(values: number[]): number {
    if (values.length < 2) return 0;
    
    const mean = values.reduce((sum: number, val: number) => sum + val, 0) / values.length;
    const squaredDiffs = values.map((val: number) => (val - mean) * (val - mean));
    return squaredDiffs.reduce((sum: number, val: number) => sum + val, 0) / values.length;
  }
  
  private isBeat(
    currentEnergy: number, 
    energyHistory: number[], 
    currentVariance: number
  ): boolean {
    if (energyHistory.length < 10) return false;
    
    // Get recent energy average (excluding current)
    const recentHistory = energyHistory.slice(-11, -1);
    const averageEnergy = recentHistory.reduce((sum: number, val: number) => sum + val, 0) / recentHistory.length;
    
    // Energy threshold (adaptive based on recent history)
    const energyThreshold = averageEnergy * (1.1 + (this.sensitivity - 1.0) * 0.5);
    
    // Variance threshold (more sensitive when there's more variation)
    const varianceThreshold = 0.001 * this.sensitivity;
    
    // A beat occurs when:
    // 1. Current energy is significantly higher than recent average
    // 2. There's enough variance to indicate rhythmic activity
    return currentEnergy > energyThreshold && 
           currentVariance > varianceThreshold;
  }
  
  private filterBeats(beats: number[]): number[] {
    if (beats.length < 4) return beats;
    
    // Calculate average time between beats
    const intervals: number[] = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i] - beats[i - 1]);
    }
    
    const averageInterval = intervals.reduce((sum: number, val: number) => sum + val, 0) / intervals.length;
    
    // Filter out beats that don't fit the general rhythm pattern
    const filteredBeats: number[] = [beats[0]]; // Always keep first beat
    
    for (let i = 1; i < beats.length; i++) {
      const interval = beats[i] - beats[i - 1];
      
      // Keep beats that are within reasonable range of average interval
      if (interval >= averageInterval * 0.5 && interval <= averageInterval * 2.0) {
        filteredBeats.push(beats[i]);
      }
      // Also keep beats that create interesting syncopation
      else if (interval >= averageInterval * 0.25 && interval <= averageInterval * 0.5) {
        // Occasionally keep syncopated beats for variety
        if (Math.random() < 0.3 * this.sensitivity) {
          filteredBeats.push(beats[i]);
        }
      }
    }
    
    return filteredBeats;
  }
}
