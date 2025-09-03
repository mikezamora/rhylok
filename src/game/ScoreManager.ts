export class ScoreManager {
  private score = 0;
  private combo = 0;
  private maxCombo = 0;
  private totalNotes = 0;
  private hitNotes = 0;
  private missedNotes = 0;
  
  public onScoreUpdate: ((score: number, combo: number) => void) | null = null;
  
  constructor() {}
  
  public addHit(accuracy: number): void {
    // Score based on accuracy (0.0 to 1.0)
    const baseScore = 100;
    const accuracyBonus = Math.floor(accuracy * 50);
    const comboBonus = Math.min(this.combo * 2, 100);
    
    const noteScore = baseScore + accuracyBonus + comboBonus;
    this.score += noteScore;
    
    this.combo++;
    this.hitNotes++;
    this.totalNotes++;
    
    if (this.combo > this.maxCombo) {
      this.maxCombo = this.combo;
    }
    
    this.updateUI();
  }
  
  public addMiss(): void {
    this.combo = 0;
    this.missedNotes++;
    this.totalNotes++;
    
    this.updateUI();
  }
  
  private updateUI(): void {
    if (this.onScoreUpdate) {
      this.onScoreUpdate(this.score, this.combo);
    }
  }
  
  public getAccuracy(): number {
    if (this.totalNotes === 0) return 0;
    return this.hitNotes / this.totalNotes;
  }
  
  public getScore(): number {
    return this.score;
  }
  
  public getCombo(): number {
    return this.combo;
  }
  
  public getMaxCombo(): number {
    return this.maxCombo;
  }
  
  public getStats(): {
    score: number;
    combo: number;
    maxCombo: number;
    accuracy: number;
    hitNotes: number;
    missedNotes: number;
    totalNotes: number;
  } {
    return {
      score: this.score,
      combo: this.combo,
      maxCombo: this.maxCombo,
      accuracy: this.getAccuracy(),
      hitNotes: this.hitNotes,
      missedNotes: this.missedNotes,
      totalNotes: this.totalNotes
    };
  }
  
  public reset(): void {
    this.score = 0;
    this.combo = 0;
    this.maxCombo = 0;
    this.totalNotes = 0;
    this.hitNotes = 0;
    this.missedNotes = 0;
    
    this.updateUI();
  }
}
