export interface InstrumentFocus {
  type: 'all' | 'bass' | 'drums' | 'vocals' | 'treble' | 'custom';
  minFreq?: number;
  maxFreq?: number;
}

export interface DifficultySettings {
  mode: 'normal' | 'hard' | 'extreme' | 'intensity';
  sensitivityMultiplier: number;
  noteFrequencyMultiplier: number;
  complexityBoost: number;
}

export class BeatDetector {
  private sensitivity = 1.0;
  private minTimeBetweenBeats = 100; // ms
  private instrumentFocus: InstrumentFocus = { type: 'all' };
  private difficultySettings: DifficultySettings = {
    mode: 'normal',
    sensitivityMultiplier: 1.0,
    noteFrequencyMultiplier: 1.0,
    complexityBoost: 0.0
  };
  private followTimeSignature = false;
  
  constructor() {}
  
  public setSensitivity(sensitivity: number): void {
    this.sensitivity = Math.max(0.1, Math.min(5.0, sensitivity));
  }
  
  public setInstrumentFocus(focus: InstrumentFocus): void {
    this.instrumentFocus = focus;
  }
  
  public setDifficultyMode(mode: DifficultySettings['mode']): void {
    const difficultyMap: Record<DifficultySettings['mode'], DifficultySettings> = {
      normal: { mode: 'normal', sensitivityMultiplier: 1.0, noteFrequencyMultiplier: 1.0, complexityBoost: 0.0 },
      hard: { mode: 'hard', sensitivityMultiplier: 1.3, noteFrequencyMultiplier: 1.4, complexityBoost: 0.2 },
      extreme: { mode: 'extreme', sensitivityMultiplier: 1.8, noteFrequencyMultiplier: 2.0, complexityBoost: 0.5 },
      intensity: { mode: 'intensity', sensitivityMultiplier: 2.5, noteFrequencyMultiplier: 3.0, complexityBoost: 1.0 }
    };
    
    this.difficultySettings = difficultyMap[mode];
  }
  
  public setFollowTimeSignature(follow: boolean): void {
    this.followTimeSignature = follow;
  }
  
  public async detectBeats(audioBuffer: AudioBuffer | null, sensitivity: number): Promise<number[]> {
    if (!audioBuffer) {
      return [];
    }
    
    this.sensitivity = sensitivity;
    const effectiveSensitivity = this.sensitivity * this.difficultySettings.sensitivityMultiplier;
    
    console.log(`Starting beat detection with sensitivity: ${effectiveSensitivity.toFixed(2)}, mode: ${this.difficultySettings.mode}`);
    
    // Get audio channel data
    const channelData = audioBuffer.getChannelData(0); // Use first channel
    const sampleRate = audioBuffer.sampleRate;
    
    // Adjust window size based on difficulty and instrument focus
    let windowSize = Math.floor(sampleRate * 0.1); // 100ms windows
    if (this.difficultySettings.mode === 'intensity') {
      windowSize = Math.floor(sampleRate * 0.05); // 50ms for ultra-responsive detection
    }
    
    const hopSize = Math.floor(windowSize / 4); // 75% overlap
    
    const beats: number[] = [];
    const energyHistory: number[] = [];
    const energyVarianceHistory: number[] = [];
    const intensityHistory: number[] = []; // For intensity master mode
    
    let totalWindows = 0;
    let detectedBeats = 0;
    
    // Calculate energy for each window
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      totalWindows++;
      const energy = this.calculateTargetedEnergy(channelData, i, windowSize, sampleRate);
      const intensity = this.calculateIntensity(channelData, i, windowSize);
      
      energyHistory.push(energy);
      intensityHistory.push(intensity);
      
      // Calculate local variance (measure of how much energy changes)
      if (energyHistory.length >= 10) {
        const recentEnergies = energyHistory.slice(-10);
        const variance = this.calculateVariance(recentEnergies);
        energyVarianceHistory.push(variance);
        
        // Enhanced beat detection with intensity tracking
        if (this.isEnhancedBeat(energy, energyHistory, variance, intensity, intensityHistory, effectiveSensitivity)) {
          const timeStamp = (i / sampleRate) * 1000; // Convert to milliseconds
          
          // Avoid beats that are too close together
          if (beats.length === 0 || timeStamp - beats[beats.length - 1] >= this.minTimeBetweenBeats) {
            beats.push(timeStamp);
            detectedBeats++;
          }
        }
      }
    }
    
    console.log(`Processed ${totalWindows} windows, detected ${detectedBeats} raw beats`);
    
    // Apply additional filtering based on musical structure
    const filteredBeats = this.filterBeats(beats);
    console.log(`After filtering: ${filteredBeats.length} beats`);
    
    // Apply time signature awareness if enabled
    let finalBeats = filteredBeats;
    if (this.followTimeSignature) {
      finalBeats = this.applyTimeSignatureFiltering(filteredBeats);
      console.log(`After time signature filtering: ${finalBeats.length} beats`);
    }
    
    // Fallback: if we have too few beats, use a simpler detection method
    if (finalBeats.length < 10) {
      console.log('Too few beats detected, using fallback method');
      finalBeats = this.fallbackBeatDetection(channelData, sampleRate, effectiveSensitivity);
    }
    
    console.log(`Final beat count: ${finalBeats.length}`);
    return finalBeats;
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
  
  private calculateTargetedEnergy(data: Float32Array, start: number, length: number, _sampleRate: number): number {
    if (this.instrumentFocus.type === 'all') {
      return this.calculateEnergy(data, start, length);
    }
    
    // For frequency-specific analysis, we'd need FFT
    // For now, apply simple filtering based on known frequency characteristics
    let energy = 0;
    const filterStrength = this.getFilterStrength();
    
    for (let i = start; i < start + length && i < data.length; i++) {
      let sample = data[i];
      
      // Apply frequency-based filtering (simplified)
      if (this.instrumentFocus.type === 'bass' || this.instrumentFocus.type === 'drums') {
        // Enhance low frequencies (bass/drums typically have more energy in lower frequencies)
        sample = sample * (1 + filterStrength * 0.5);
      } else if (this.instrumentFocus.type === 'vocals' || this.instrumentFocus.type === 'treble') {
        // For vocals/treble, we look for more variation rather than raw energy
        const variation = i > start ? Math.abs(sample - data[i-1]) : 0;
        sample = sample + variation * filterStrength;
      }
      
      energy += sample * sample;
    }
    
    return energy / length;
  }
  
  private calculateIntensity(data: Float32Array, start: number, length: number): number {
    // Calculate the intensity by looking at energy changes and peaks
    let peakCount = 0;
    let energyVariation = 0;
    let maxSample = 0;
    
    for (let i = start + 1; i < start + length - 1 && i < data.length - 1; i++) {
      const current = Math.abs(data[i]);
      const prev = Math.abs(data[i - 1]);
      const next = Math.abs(data[i + 1]);
      
      // Count local peaks
      if (current > prev && current > next && current > 0.1) {
        peakCount++;
      }
      
      // Track energy variation
      energyVariation += Math.abs(current - prev);
      
      // Track maximum amplitude
      if (current > maxSample) {
        maxSample = current;
      }
    }
    
    // Combine metrics for intensity score
    const normalizedPeaks = peakCount / (length / 100); // peaks per 100 samples
    const normalizedVariation = energyVariation / length;
    
    return (normalizedPeaks * 0.4 + normalizedVariation * 0.4 + maxSample * 0.2);
  }
  
  private isEnhancedBeat(
    currentEnergy: number,
    energyHistory: number[],
    currentVariance: number,
    currentIntensity: number,
    intensityHistory: number[],
    effectiveSensitivity: number
  ): boolean {
    if (energyHistory.length < 10) return false;
    
    // Get recent history (excluding current)
    const recentEnergy = energyHistory.slice(-11, -1);
    const recentIntensity = intensityHistory.slice(-11, -1);
    
    const averageEnergy = recentEnergy.reduce((sum: number, val: number) => sum + val, 0) / recentEnergy.length;
    const averageIntensity = recentIntensity.reduce((sum: number, val: number) => sum + val, 0) / recentIntensity.length;
    
    // More permissive base thresholds to ensure beat detection works
    let energyThreshold = averageEnergy * (0.8 + (effectiveSensitivity - 1.0) * 0.4);
    let intensityThreshold = averageIntensity * (0.7 + effectiveSensitivity * 0.3);
    let varianceThreshold = Math.max(0.0001, 0.001 * effectiveSensitivity);
    
    // Ensure minimum thresholds to catch quiet sections
    energyThreshold = Math.max(energyThreshold, 0.001);
    intensityThreshold = Math.max(intensityThreshold, 0.01);
    
    // Difficulty-specific adjustments
    if (this.difficultySettings.mode === 'intensity') {
      // In intensity mode, prioritize the most intense moments
      const intensityBoost = currentIntensity > averageIntensity * 1.2; // More permissive
      const energySpike = currentEnergy > averageEnergy * 1.1; // More permissive
      
      return intensityBoost && energySpike && currentVariance > varianceThreshold * 0.3;
    } else if (this.difficultySettings.mode === 'extreme') {
      // More sensitive to smaller changes
      energyThreshold *= 0.9;
      intensityThreshold *= 0.8;
    } else if (this.difficultySettings.mode === 'hard') {
      // Slightly more permissive than extreme
      energyThreshold *= 0.95;
      intensityThreshold *= 0.9;
    }
    
    // Standard beat detection with enhancements
    const energyCondition = currentEnergy > energyThreshold;
    const intensityCondition = currentIntensity > intensityThreshold;
    const varianceCondition = currentVariance > varianceThreshold;
    
    // For normal mode, be more permissive - use OR logic for fallback
    if (this.difficultySettings.mode === 'normal') {
      return (energyCondition && varianceCondition) || 
             (energyCondition && currentEnergy > averageEnergy * 1.5) ||
             (intensityCondition && currentIntensity > averageIntensity * 1.8);
    } else {
      // For higher difficulties, require multiple conditions but with fallbacks
      const primaryCondition = energyCondition && intensityCondition && varianceCondition;
      const fallbackCondition = energyCondition && (intensityCondition || varianceCondition);
      
      return primaryCondition || (fallbackCondition && Math.random() < 0.7);
    }
  }
  
  private getFilterStrength(): number {
    // Strength based on how specific the instrument focus is
    const strengthMap = {
      all: 0,
      bass: 0.7,
      drums: 0.8,
      vocals: 0.6,
      treble: 0.5,
      custom: 0.9
    };
    
    return strengthMap[this.instrumentFocus.type] || 0;
  }
  
  private applyTimeSignatureFiltering(beats: number[]): number[] {
    if (beats.length < 8) return beats; // Need enough beats to analyze
    
    // Analyze the beat intervals to detect time signature patterns
    const intervals: number[] = [];
    for (let i = 1; i < beats.length; i++) {
      intervals.push(beats[i] - beats[i - 1]);
    }
    
    // Find the most common interval (quarter note equivalent)
    const intervalCounts: Map<number, number> = new Map();
    intervals.forEach(interval => {
      const rounded = Math.round(interval / 50) * 50; // Round to nearest 50ms
      intervalCounts.set(rounded, (intervalCounts.get(rounded) || 0) + 1);
    });
    
    // Find the dominant interval
    let dominantInterval = 0;
    let maxCount = 0;
    intervalCounts.forEach((count, interval) => {
      if (count > maxCount) {
        maxCount = count;
        dominantInterval = interval;
      }
    });
    
    // Filter beats to emphasize time signature patterns
    const filteredBeats: number[] = [beats[0]]; // Keep first beat
    
    for (let i = 1; i < beats.length; i++) {
      const interval = beats[i] - beats[i - 1];
      const ratio = interval / dominantInterval;
      
      // Keep beats that align with time signature (1/4, 1/2, 1, 2 times the dominant interval)
      if (ratio >= 0.25 && ratio <= 2.0 && (ratio <= 0.6 || ratio >= 0.8)) {
        filteredBeats.push(beats[i]);
      }
    }
    
    return filteredBeats;
  }
  
  private fallbackBeatDetection(channelData: Float32Array, sampleRate: number, sensitivity: number): number[] {
    console.log('Using fallback beat detection method');
    
    const beats: number[] = [];
    const windowSize = Math.floor(sampleRate * 0.2); // Larger 200ms windows for simpler detection
    const hopSize = Math.floor(windowSize / 2); // 50% overlap
    
    const energies: number[] = [];
    
    // Calculate energy for each window
    for (let i = 0; i < channelData.length - windowSize; i += hopSize) {
      const energy = this.calculateEnergy(channelData, i, windowSize);
      energies.push(energy);
    }
    
    if (energies.length < 5) {
      // If still too short, generate beats at regular intervals
      const duration = channelData.length / sampleRate * 1000; // Duration in ms
      const interval = Math.max(300, 600 / sensitivity); // Beats every 300-600ms depending on sensitivity
      
      for (let time = 1000; time < duration - 1000; time += interval) {
        beats.push(time);
      }
      
      console.log(`Generated ${beats.length} fallback beats at regular intervals`);
      return beats;
    }
    
    // Simple threshold-based detection
    const averageEnergy = energies.reduce((sum: number, val: number) => sum + val, 0) / energies.length;
    const threshold = averageEnergy * (0.7 + sensitivity * 0.3);
    
    for (let i = 1; i < energies.length - 1; i++) {
      const current = energies[i];
      const prev = energies[i - 1];
      const next = energies[i + 1];
      
      // Look for local peaks above threshold
      if (current > threshold && current > prev && current > next) {
        const timeStamp = (i * hopSize / sampleRate) * 1000;
        
        // Avoid beats too close together
        if (beats.length === 0 || timeStamp - beats[beats.length - 1] >= this.minTimeBetweenBeats) {
          beats.push(timeStamp);
        }
      }
    }
    
    console.log(`Fallback method detected ${beats.length} beats`);
    return beats;
  }
}
