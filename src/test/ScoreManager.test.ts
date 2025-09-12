import { describe, it, expect, beforeEach, vi } from 'vitest'
import { ScoreManager } from '../game/ScoreManager'

describe('ScoreManager', () => {
  let scoreManager: ScoreManager

  beforeEach(() => {
    scoreManager = new ScoreManager()
  })

  describe('initialization', () => {
    it('should initialize with default values', () => {
      expect(scoreManager.getScore()).toBe(0)
      expect(scoreManager.getCombo()).toBe(0)
      expect(scoreManager.getMaxCombo()).toBe(0)
      expect(scoreManager.getAccuracy()).toBe(0)
      
      const stats = scoreManager.getStats()
      expect(stats.score).toBe(0)
      expect(stats.combo).toBe(0)
      expect(stats.maxCombo).toBe(0)
      expect(stats.accuracy).toBe(0)
      expect(stats.hitNotes).toBe(0)
      expect(stats.missedNotes).toBe(0)
      expect(stats.totalNotes).toBe(0)
    })
  })

  describe('addHit', () => {
    it('should add score based on perfect accuracy', () => {
      scoreManager.addHit(1.0) // Perfect accuracy
      
      // Base score (100) + accuracy bonus (50) + combo bonus (0 for first hit)
      expect(scoreManager.getScore()).toBe(150)
      expect(scoreManager.getCombo()).toBe(1)
      expect(scoreManager.getMaxCombo()).toBe(1)
      expect(scoreManager.getAccuracy()).toBe(1.0)
    })

    it('should add score based on partial accuracy', () => {
      scoreManager.addHit(0.5) // 50% accuracy
      
      // Base score (100) + accuracy bonus (25) + combo bonus (0)
      expect(scoreManager.getScore()).toBe(125)
      expect(scoreManager.getCombo()).toBe(1)
    })

    it('should add score with zero accuracy', () => {
      scoreManager.addHit(0.0) // No accuracy
      
      // Base score (100) + accuracy bonus (0) + combo bonus (0)
      expect(scoreManager.getScore()).toBe(100)
      expect(scoreManager.getCombo()).toBe(1)
    })

    it('should increase combo bonus with consecutive hits', () => {
      scoreManager.addHit(1.0) // First hit: 100 + 50 + 0 = 150
      scoreManager.addHit(1.0) // Second hit: 100 + 50 + 2 = 152
      scoreManager.addHit(1.0) // Third hit: 100 + 50 + 4 = 154
      
      expect(scoreManager.getScore()).toBe(456) // 150 + 152 + 154
      expect(scoreManager.getCombo()).toBe(3)
      expect(scoreManager.getMaxCombo()).toBe(3)
    })

    it('should cap combo bonus at 100', () => {
      // Build up a large combo
      for (let i = 0; i < 60; i++) {
        scoreManager.addHit(1.0)
      }
      
      const scoreBefore = scoreManager.getScore()
      scoreManager.addHit(1.0) // This should have max combo bonus of 100
      
      const expectedScoreIncrease = 100 + 50 + 100 // base + accuracy + capped combo
      expect(scoreManager.getScore()).toBe(scoreBefore + expectedScoreIncrease)
    })

    it('should update max combo correctly', () => {
      scoreManager.addHit(1.0)
      scoreManager.addHit(1.0)
      scoreManager.addHit(1.0)
      expect(scoreManager.getMaxCombo()).toBe(3)
      
      scoreManager.addMiss() // Reset combo
      expect(scoreManager.getCombo()).toBe(0)
      expect(scoreManager.getMaxCombo()).toBe(3) // Max combo should remain
      
      scoreManager.addHit(1.0)
      scoreManager.addHit(1.0)
      expect(scoreManager.getMaxCombo()).toBe(3) // Still the previous max
      
      scoreManager.addHit(1.0)
      scoreManager.addHit(1.0)
      expect(scoreManager.getMaxCombo()).toBe(4) // New max combo
    })

    it('should call onScoreUpdate callback when set', () => {
      const mockCallback = vi.fn()
      scoreManager.onScoreUpdate = mockCallback
      
      scoreManager.addHit(1.0)
      
      expect(mockCallback).toHaveBeenCalledWith(150, 1)
    })

    it('should update total and hit note counts', () => {
      scoreManager.addHit(1.0)
      scoreManager.addHit(0.5)
      
      const stats = scoreManager.getStats()
      expect(stats.totalNotes).toBe(2)
      expect(stats.hitNotes).toBe(2)
      expect(stats.missedNotes).toBe(0)
    })
  })

  describe('addMiss', () => {
    it('should reset combo and not add score', () => {
      scoreManager.addHit(1.0)
      scoreManager.addHit(1.0)
      const scoreBefore = scoreManager.getScore()
      
      scoreManager.addMiss()
      
      expect(scoreManager.getScore()).toBe(scoreBefore) // No score added
      expect(scoreManager.getCombo()).toBe(0) // Combo reset
      expect(scoreManager.getMaxCombo()).toBe(2) // Max combo preserved
    })

    it('should update total and missed note counts', () => {
      scoreManager.addHit(1.0)
      scoreManager.addMiss()
      scoreManager.addMiss()
      
      const stats = scoreManager.getStats()
      expect(stats.totalNotes).toBe(3)
      expect(stats.hitNotes).toBe(1)
      expect(stats.missedNotes).toBe(2)
    })

    it('should call onScoreUpdate callback when set', () => {
      const mockCallback = vi.fn()
      scoreManager.onScoreUpdate = mockCallback
      
      scoreManager.addMiss()
      
      expect(mockCallback).toHaveBeenCalledWith(0, 0)
    })
  })

  describe('getAccuracy', () => {
    it('should return 0 when no notes have been played', () => {
      expect(scoreManager.getAccuracy()).toBe(0)
    })

    it('should calculate accuracy correctly', () => {
      scoreManager.addHit(1.0)
      scoreManager.addHit(1.0)
      scoreManager.addMiss()
      
      expect(scoreManager.getAccuracy()).toBe(2/3) // 2 hits out of 3 total
    })

    it('should return 1.0 for perfect accuracy', () => {
      scoreManager.addHit(1.0)
      scoreManager.addHit(0.5)
      scoreManager.addHit(0.8)
      
      expect(scoreManager.getAccuracy()).toBe(1.0) // All notes hit
    })

    it('should return 0.0 for all misses', () => {
      scoreManager.addMiss()
      scoreManager.addMiss()
      scoreManager.addMiss()
      
      expect(scoreManager.getAccuracy()).toBe(0.0)
    })
  })

  describe('getStats', () => {
    it('should return complete statistics object', () => {
      scoreManager.addHit(1.0)
      scoreManager.addHit(0.5)
      scoreManager.addMiss()
      scoreManager.addHit(0.8)
      
      const stats = scoreManager.getStats()
      
      expect(stats).toEqual({
        score: expect.any(Number),
        combo: 1, // Current combo after miss and one hit
        maxCombo: 2, // Max was 2 before the miss
        accuracy: 0.75, // 3 hits out of 4 total
        hitNotes: 3,
        missedNotes: 1,
        totalNotes: 4
      })
    })
  })

  describe('reset', () => {
    it('should reset all values to initial state', () => {
      // Build up some state
      scoreManager.addHit(1.0)
      scoreManager.addHit(1.0)
      scoreManager.addMiss()
      scoreManager.addHit(0.5)
      
      // Reset
      scoreManager.reset()
      
      // Check all values are reset
      expect(scoreManager.getScore()).toBe(0)
      expect(scoreManager.getCombo()).toBe(0)
      expect(scoreManager.getMaxCombo()).toBe(0)
      expect(scoreManager.getAccuracy()).toBe(0)
      
      const stats = scoreManager.getStats()
      expect(stats.score).toBe(0)
      expect(stats.combo).toBe(0)
      expect(stats.maxCombo).toBe(0)
      expect(stats.accuracy).toBe(0)
      expect(stats.hitNotes).toBe(0)
      expect(stats.missedNotes).toBe(0)
      expect(stats.totalNotes).toBe(0)
    })

    it('should call onScoreUpdate callback when reset', () => {
      const mockCallback = vi.fn()
      scoreManager.onScoreUpdate = mockCallback
      
      scoreManager.addHit(1.0) // This will call callback once
      mockCallback.mockClear() // Clear previous calls
      
      scoreManager.reset()
      
      expect(mockCallback).toHaveBeenCalledWith(0, 0)
    })
  })

  describe('onScoreUpdate callback', () => {
    it('should not throw error when callback is null', () => {
      scoreManager.onScoreUpdate = null
      
      expect(() => {
        scoreManager.addHit(1.0)
        scoreManager.addMiss()
        scoreManager.reset()
      }).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle negative accuracy gracefully', () => {
      scoreManager.addHit(-0.5)
      
      // Should clamp accuracy to 0, so 100 base + 0 accuracy bonus + 0 combo
      expect(scoreManager.getScore()).toBe(100)
      expect(scoreManager.getCombo()).toBe(1)
    })

    it('should handle accuracy greater than 1.0', () => {
      scoreManager.addHit(2.0)
      
      // Should clamp accuracy to 1.0, so 100 base + 50 accuracy bonus + 0 combo
      expect(scoreManager.getScore()).toBe(150)
      expect(scoreManager.getCombo()).toBe(1)
    })
  })
})