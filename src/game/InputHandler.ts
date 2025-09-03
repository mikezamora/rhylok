export class InputHandler {
  private keyMap: Map<string, number> = new Map();
  public onKeyPress: ((lane: number) => void) | null = null;
  
  constructor() {
    this.setupKeyMap();
    this.setupEventListeners();
  }
  
  private setupKeyMap(): void {
    // Ergonomic layout: Left hand on ASDF, right hand on JKL;
    // This feels natural for rhythm games
    this.keyMap.set('KeyA', 0);
    this.keyMap.set('KeyS', 1);
    this.keyMap.set('KeyD', 2);
    this.keyMap.set('KeyF', 3);
    this.keyMap.set('KeyJ', 4);
    this.keyMap.set('KeyK', 5);
    this.keyMap.set('KeyL', 6);
    this.keyMap.set('Semicolon', 7);
  }
  
  private setupEventListeners(): void {
    document.addEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  private handleKeyDown(event: KeyboardEvent): void {
    // Prevent default behavior for game keys
    if (this.keyMap.has(event.code)) {
      event.preventDefault();
      
      const lane = this.keyMap.get(event.code);
      if (lane !== undefined && this.onKeyPress) {
        this.onKeyPress(lane);
      }
    }
  }
  
  public destroy(): void {
    document.removeEventListener('keydown', this.handleKeyDown.bind(this));
  }
  
  public getLaneForKey(keyCode: string): number | null {
    return this.keyMap.get(keyCode) ?? null;
  }
  
  public getKeyForLane(lane: number): string | null {
    for (const [key, laneIndex] of this.keyMap.entries()) {
      if (laneIndex === lane) {
        return key;
      }
    }
    return null;
  }
}
