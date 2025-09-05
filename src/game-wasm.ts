// WASM-compatible entry point for the Rhylok rhythm game
// This adapts the existing game classes to work with AssemblyScript and Extism

// Host function declarations for Extism
declare function log(message: string): void
declare function playSound(soundName: string, volume: f32): i32
declare function getTime(): f64
declare function httpRequest(method: string, url: string): string

// Simplified game state for WASM
class GameState {
  score: i32 = 0
  combo: i32 = 0
  maxCombo: i32 = 0
  level: i32 = 1
  isPlaying: bool = false
  currentTime: f64 = 0.0
  totalNotes: i32 = 0
  hitNotes: i32 = 0
  missedNotes: i32 = 0
}

// Simplified beat detector for WASM
class WASMBeatDetector {
  private sensitivity: f32 = 1.0
  private threshold: f32 = 0.5
  private lastBeatTime: f64 = 0.0
  private minTimeBetweenBeats: f64 = 100.0
  
  setSensitivity(sensitivity: f32): void {
    this.sensitivity = Mathf.max(0.1, Mathf.min(5.0, sensitivity))
    this.threshold = 0.5 / this.sensitivity
  }
  
  detectBeat(audioLevel: f32, frequency: f32): bool {
    const currentTime = getTime()
    const timeSinceLastBeat = currentTime - this.lastBeatTime
    
    // Frequency-based filtering (focus on rhythm frequencies)
    const isRhythmFreq = frequency >= 60.0 && frequency <= 250.0
    const hasEnoughTime = timeSinceLastBeat > this.minTimeBetweenBeats
    const isAboveThreshold = audioLevel > this.threshold
    
    if (isAboveThreshold && isRhythmFreq && hasEnoughTime) {
      this.lastBeatTime = currentTime
      return true
    }
    
    return false
  }
  
  setDifficulty(mode: string): void {
    if (mode == "easy") {
      this.setSensitivity(0.8)
      this.minTimeBetweenBeats = 200.0
    } else if (mode == "normal") {
      this.setSensitivity(1.0)
      this.minTimeBetweenBeats = 150.0
    } else if (mode == "hard") {
      this.setSensitivity(1.3)
      this.minTimeBetweenBeats = 100.0
    } else if (mode == "extreme") {
      this.setSensitivity(1.8)
      this.minTimeBetweenBeats = 80.0
    }
  }
}

// Simplified score manager for WASM
class WASMScoreManager {
  private multiplier: i32 = 1
  
  addHit(accuracy: f32, gameState: GameState): void {
    // Calculate score based on accuracy (0.0 to 1.0)
    const baseScore: i32 = 100
    const accuracyBonus: i32 = i32(accuracy * 50.0)
    const comboBonus: i32 = Mathf.min(gameState.combo * 2, 100)
    
    const noteScore = baseScore + accuracyBonus + comboBonus
    gameState.score += noteScore * this.multiplier
    
    gameState.combo++
    gameState.hitNotes++
    gameState.totalNotes++
    
    if (gameState.combo > gameState.maxCombo) {
      gameState.maxCombo = gameState.combo
    }
    
    // Increase multiplier every 10 hits
    if (gameState.combo % 10 == 0 && this.multiplier < 4) {
      this.multiplier++
      log(`Multiplier increased to ${this.multiplier}x!`)
    }
    
    log(`Hit! Score: ${gameState.score} (+${noteScore * this.multiplier}), Combo: ${gameState.combo}`)
  }
  
  addMiss(gameState: GameState): void {
    gameState.combo = 0
    gameState.missedNotes++
    gameState.totalNotes++
    this.multiplier = 1
    
    log(`Miss! Score: ${gameState.score}, Combo reset`)
  }
  
  getAccuracy(gameState: GameState): f32 {
    if (gameState.totalNotes == 0) return 0.0
    return f32(gameState.hitNotes) / f32(gameState.totalNotes)
  }
}

// Global game instances
const gameState = new GameState()
const beatDetector = new WASMBeatDetector()
const scoreManager = new WASMScoreManager()

// Exported functions for Extism

/**
 * Initialize the rhythm game
 */
export function initGame(): void {
  log("🎮 Initializing Rhylok Rhythm Game WASM module...")
  
  gameState.score = 0
  gameState.combo = 0
  gameState.maxCombo = 0
  gameState.level = 1
  gameState.isPlaying = false
  gameState.totalNotes = 0
  gameState.hitNotes = 0
  gameState.missedNotes = 0
  gameState.currentTime = getTime()
  
  beatDetector.setSensitivity(1.0)
  
  log("✅ Game initialized successfully")
}

/**
 * Start a new game session
 */
export function startGame(): void {
  log("🚀 Starting new game session...")
  gameState.isPlaying = true
  gameState.currentTime = getTime()
  scoreManager.addMiss(gameState) // Reset score
  gameState.score = 0
  playSound("game_start", 0.8)
}

/**
 * Stop the current game session
 */
export function stopGame(): void {
  log("⏹️ Stopping game session...")
  gameState.isPlaying = false
  playSound("game_stop", 0.6)
}

/**
 * Process audio input for beat detection
 * @param audioLevel - Current audio level (0.0 to 1.0)
 * @param frequency - Dominant frequency in Hz
 * @param timestamp - Current timestamp
 */
export function processAudio(audioLevel: f32, frequency: f32, timestamp: f64): i32 {
  if (!gameState.isPlaying) {
    return 0
  }
  
  gameState.currentTime = timestamp
  
  // Detect beat
  if (beatDetector.detectBeat(audioLevel, frequency)) {
    // Calculate accuracy based on timing and frequency
    let accuracy: f32 = 0.8 // Base accuracy
    
    // Frequency accuracy bonus
    if (frequency >= 80.0 && frequency <= 200.0) {
      accuracy += 0.2 // Perfect frequency range
    } else if (frequency >= 60.0 && frequency <= 250.0) {
      accuracy += 0.1 // Good frequency range
    }
    
    // Audio level accuracy bonus
    if (audioLevel >= 0.7) {
      accuracy += 0.1 // Strong beat
    }
    
    accuracy = Mathf.min(accuracy, 1.0)
    
    scoreManager.addHit(accuracy, gameState)
    playSound("beat_hit", 0.7)
    
    // Check for level progression
    if (gameState.score > gameState.level * 1000) {
      gameState.level++
      log(`🎊 Level up! Now at level ${gameState.level}`)
      playSound("level_up", 0.9)
      
      // Increase difficulty
      const newSensitivity = 1.0 + (f32(gameState.level - 1) * 0.1)
      beatDetector.setSensitivity(newSensitivity)
    }
    
    return 1 // Beat detected
  }
  
  return 0 // No beat
}

/**
 * Handle user input (keyboard/controller)
 * @param inputType - Type of input (1=key, 2=controller)
 * @param inputValue - Input value/key code
 * @param timestamp - Current timestamp
 */
export function handleInput(inputType: i32, inputValue: i32, timestamp: f64): void {
  if (!gameState.isPlaying) {
    return
  }
  
  gameState.currentTime = timestamp
  
  // Handle different input types
  if (inputType == 1) { // Keyboard
    switch (inputValue) {
      case 32: // Spacebar - manual beat hit
        scoreManager.addHit(0.6, gameState) // Lower accuracy for manual hits
        playSound("key_hit", 0.5)
        break
      case 13: // Enter - pause/unpause
        gameState.isPlaying = !gameState.isPlaying
        playSound("pause", 0.4)
        log(gameState.isPlaying ? "▶️ Resumed" : "⏸️ Paused")
        break
      case 27: // Escape - stop game
        stopGame()
        break
    }
  } else if (inputType == 2) { // Controller
    switch (inputValue) {
      case 0: // A button
        scoreManager.addHit(0.7, gameState)
        playSound("controller_hit", 0.6)
        break
      case 1: // B button
        gameState.isPlaying = !gameState.isPlaying
        playSound("pause", 0.4)
        break
    }
  }
}

/**
 * Update game state (called regularly by host)
 * @param deltaTime - Time since last update in milliseconds
 */
export function updateGame(deltaTime: f32): void {
  if (!gameState.isPlaying) {
    return
  }
  
  gameState.currentTime = getTime()
  
  // Auto-miss detection for too long without hits
  const timeSinceLastHit = gameState.currentTime - beatDetector.lastBeatTime
  if (timeSinceLastHit > 2000.0 && gameState.combo > 0) {
    // Only auto-miss if we had a combo going
    if (Mathf.random() > 0.8) { // 20% chance to miss when too long
      scoreManager.addMiss(gameState)
      playSound("miss", 0.3)
    }
  }
}

/**
 * Set game difficulty
 * @param difficulty - Difficulty level: "easy", "normal", "hard", "extreme"
 */
export function setDifficulty(difficulty: string): void {
  beatDetector.setDifficulty(difficulty)
  log(`🎯 Difficulty set to: ${difficulty}`)
}

/**
 * Get current game state as JSON string
 */
export function getGameState(): string {
  const accuracy = scoreManager.getAccuracy(gameState)
  
  return `{
    "score": ${gameState.score},
    "combo": ${gameState.combo},
    "maxCombo": ${gameState.maxCombo},
    "level": ${gameState.level},
    "isPlaying": ${gameState.isPlaying},
    "accuracy": ${accuracy},
    "totalNotes": ${gameState.totalNotes},
    "hitNotes": ${gameState.hitNotes},
    "missedNotes": ${gameState.missedNotes},
    "currentTime": ${gameState.currentTime}
  }`
}

/**
 * Get the current score
 */
export function getScore(): i32 {
  return gameState.score
}

/**
 * Get the current combo
 */
export function getCombo(): i32 {
  return gameState.combo
}

/**
 * Get the current level
 */
export function getLevel(): i32 {
  return gameState.level
}

/**
 * Get the current accuracy
 */
export function getAccuracy(): f32 {
  return scoreManager.getAccuracy(gameState)
}

/**
 * Check if game is currently playing
 */
export function isGamePlaying(): bool {
  return gameState.isPlaying
}

/**
 * Configure the game with JSON settings
 * @param configJson - JSON configuration string
 */
export function configure(configJson: string): void {
  log(`⚙️ Configuring game with: ${configJson}`)
  // Basic configuration parsing
  // In a real implementation, you'd parse the JSON and apply settings
}
