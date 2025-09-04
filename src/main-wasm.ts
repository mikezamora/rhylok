// AssemblyScript WASM entry point for the rhythm game
// This file is specifically written for AssemblyScript compilation

// Extism host function declarations
declare function log(message: string): void
declare function playSound(soundName: string, volume: f32): i32
declare function getTime(): f64
declare function httpRequest(method: string, url: string): string

// Game state interface
interface GameState {
  score: i32
  level: i32
  isPlaying: bool
  currentTime: f64
}

// Global game state
let gameState: GameState = {
  score: 0,
  level: 1,
  isPlaying: false,
  currentTime: 0.0
}

// Beat detection state
class BeatDetector {
  private threshold: f32
  private lastBeatTime: f64
  
  constructor(threshold: f32 = 0.5) {
    this.threshold = threshold
    this.lastBeatTime = 0.0
  }
  
  detectBeat(audioLevel: f32): bool {
    const currentTime = getTime()
    const timeSinceLastBeat = currentTime - this.lastBeatTime
    
    if (audioLevel > this.threshold && timeSinceLastBeat > 100.0) {
      this.lastBeatTime = currentTime
      return true
    }
    
    return false
  }
  
  setThreshold(newThreshold: f32): void {
    this.threshold = newThreshold
  }
}

// Score management
class ScoreManager {
  private multiplier: i32
  
  constructor() {
    this.multiplier = 1
  }
  
  addScore(points: i32): void {
    gameState.score += points * this.multiplier
    log(`Score: ${gameState.score} (+${points * this.multiplier})`)
  }
  
  getScore(): i32 {
    return gameState.score
  }
  
  resetScore(): void {
    gameState.score = 0
    this.multiplier = 1
  }
  
  increaseMultiplier(): void {
    if (this.multiplier < 10) {
      this.multiplier++
    }
  }
  
  resetMultiplier(): void {
    this.multiplier = 1
  }
}

// Global instances
const beatDetector = new BeatDetector()
const scoreManager = new ScoreManager()

// Exported functions that can be called from the host

/**
 * Initialize the game
 */
export function initGame(): void {
  log("Initializing Rhylok Game WASM module...")
  gameState.score = 0
  gameState.level = 1
  gameState.isPlaying = false
  gameState.currentTime = getTime()
  log("Game initialized successfully")
}

/**
 * Start a new game
 */
export function startGame(): void {
  log("Starting new game...")
  gameState.isPlaying = true
  gameState.currentTime = getTime()
  scoreManager.resetScore()
  playSound("game_start", 0.8)
}

/**
 * Stop the current game
 */
export function stopGame(): void {
  log("Stopping game...")
  gameState.isPlaying = false
  playSound("game_stop", 0.6)
}

/**
 * Process audio input for beat detection
 * @param audioLevel - Current audio level (0.0 to 1.0)
 * @param frequency - Dominant frequency in Hz
 */
export function processAudio(audioLevel: f32, frequency: f32): i32 {
  if (!gameState.isPlaying) {
    return 0
  }
  
  gameState.currentTime = getTime()
  
  // Detect beat
  if (beatDetector.detectBeat(audioLevel)) {
    // Beat detected - add score based on timing and accuracy
    const baseScore = 100
    let accuracyBonus = 0
    
    // Frequency-based accuracy bonus
    if (frequency >= 60.0 && frequency <= 250.0) {
      accuracyBonus = 50 // Good frequency range for rhythm
    }
    
    const totalScore = baseScore + accuracyBonus
    scoreManager.addScore(totalScore)
    scoreManager.increaseMultiplier()
    
    playSound("beat_hit", 0.7)
    return 1 // Beat detected
  }
  
  return 0 // No beat
}

/**
 * Handle user input (keyboard/controller)
 * @param inputType - Type of input (1=key, 2=controller)
 * @param inputValue - Input value/key code
 */
export function handleInput(inputType: i32, inputValue: i32): void {
  if (!gameState.isPlaying) {
    return
  }
  
  log(`Input received: type=${inputType}, value=${inputValue}`)
  
  // Handle different input types
  if (inputType == 1) { // Keyboard
    switch (inputValue) {
      case 32: // Spacebar
        scoreManager.addScore(50)
        playSound("key_hit", 0.5)
        break
      case 13: // Enter
        // Pause/unpause
        gameState.isPlaying = !gameState.isPlaying
        playSound("pause", 0.4)
        break
    }
  }
}

/**
 * Update game state
 * @param deltaTime - Time since last update in milliseconds
 */
export function updateGame(deltaTime: f32): void {
  if (!gameState.isPlaying) {
    return
  }
  
  gameState.currentTime = getTime()
  
  // Check for level progression
  if (gameState.score > gameState.level * 1000) {
    gameState.level++
    log(`Level up! Now at level ${gameState.level}`)
    playSound("level_up", 0.9)
    
    // Increase beat detection sensitivity
    const newThreshold = 0.5 - (gameState.level * 0.05)
    if (newThreshold > 0.1) {
      beatDetector.setThreshold(newThreshold)
    }
  }
}

/**
 * Get current game state as JSON string
 */
export function getGameState(): string {
  const stateObj = {
    score: gameState.score,
    level: gameState.level,
    isPlaying: gameState.isPlaying,
    currentTime: gameState.currentTime
  }
  
  // Simple JSON serialization (AssemblyScript doesn't have JSON.stringify)
  return `{
    "score": ${stateObj.score},
    "level": ${stateObj.level},
    "isPlaying": ${stateObj.isPlaying},
    "currentTime": ${stateObj.currentTime}
  }`
}

/**
 * Set game configuration from host
 * @param configJson - JSON configuration string
 */
export function configure(configJson: string): void {
  log(`Configuring game with: ${configJson}`)
  // Parse basic configuration
  // Note: AssemblyScript doesn't have built-in JSON parsing,
  // so this would need a custom parser or be handled by the host
}

/**
 * Get the current score
 */
export function getScore(): i32 {
  return scoreManager.getScore()
}

/**
 * Get the current level
 */
export function getLevel(): i32 {
  return gameState.level
}

/**
 * Check if game is currently playing
 */
export function isGamePlaying(): bool {
  return gameState.isPlaying
}
