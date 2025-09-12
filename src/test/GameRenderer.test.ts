import { describe, it, expect, beforeEach, vi } from 'vitest'
import { GameRenderer } from '../game/GameRenderer'
import type { GameNote } from '../game/RhythemGame'

describe('GameRenderer', () => {
  let renderer: GameRenderer
  let mockCtx: any

  beforeEach(() => {
    // Create comprehensive mock for CanvasRenderingContext2D
    mockCtx = {
      clearRect: vi.fn(),
      fillRect: vi.fn(),
      strokeRect: vi.fn(),
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      fill: vi.fn(),
      arc: vi.fn(),
      fillText: vi.fn(),
      measureText: vi.fn().mockReturnValue({ width: 50 }),
      createLinearGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn()
      }),
      createRadialGradient: vi.fn().mockReturnValue({
        addColorStop: vi.fn()
      }),
      save: vi.fn(),
      restore: vi.fn(),
      translate: vi.fn(),
      rotate: vi.fn(),
      scale: vi.fn(),
      setTransform: vi.fn(),
      transform: vi.fn(),
      clip: vi.fn(),
      isPointInPath: vi.fn(),
      drawImage: vi.fn(),
      createImageData: vi.fn(),
      getImageData: vi.fn(),
      putImageData: vi.fn(),
      globalAlpha: 1,
      globalCompositeOperation: 'source-over',
      fillStyle: '#000000',
      strokeStyle: '#000000',
      lineWidth: 1,
      lineCap: 'butt',
      lineJoin: 'miter',
      miterLimit: 10,
      font: '10px sans-serif',
      textAlign: 'start',
      textBaseline: 'alphabetic',
      shadowColor: 'rgba(0, 0, 0, 0)',
      shadowBlur: 0,
      shadowOffsetX: 0,
      shadowOffsetY: 0
    }

    renderer = new GameRenderer(mockCtx)
  })

  describe('renderLanes', () => {
    it('should render lanes with correct dimensions', () => {
      const canvasWidth = 800
      const canvasHeight = 600
      const laneCount = 8

      renderer.renderLanes(canvasWidth, canvasHeight, laneCount)

      // Should call stroke for lane dividers and fillText for labels
      expect(mockCtx.stroke).toHaveBeenCalled()
      expect(mockCtx.fillText).toHaveBeenCalled()
    })

    it('should handle different lane counts', () => {
      const testCases = [4, 6, 8, 10]
      
      testCases.forEach(laneCount => {
        mockCtx.stroke.mockClear()
        mockCtx.fillText.mockClear()
        renderer.renderLanes(800, 600, laneCount)
        expect(mockCtx.stroke).toHaveBeenCalled()
        expect(mockCtx.fillText).toHaveBeenCalled()
      })
    })

    it('should handle zero lane count gracefully', () => {
      expect(() => {
        renderer.renderLanes(800, 600, 0)
      }).not.toThrow()
    })

    it('should handle very small canvas dimensions', () => {
      expect(() => {
        renderer.renderLanes(1, 1, 8)
      }).not.toThrow()
    })

    it('should show pressed lane effects', () => {
      // Simulate a lane press
      renderer.showLanePress(3)
      
      mockCtx.fillRect.mockClear()
      renderer.renderLanes(800, 600, 8)
      
      // Should render with visual effect for pressed lane
      expect(mockCtx.fillRect).toHaveBeenCalled()
    })
  })

  describe('renderNotes', () => {
    it('should render notes correctly', () => {
      const notes: GameNote[] = [
        { lane: 0, timestamp: 1000, hit: false, y: 100 },
        { lane: 2, timestamp: 2000, hit: false, y: 200 },
        { lane: 5, timestamp: 3000, hit: false, y: 300 }
      ]

      renderer.renderNotes(notes, 800, 8)

      // Should call fillRect for each unhit note
      expect(mockCtx.fillRect).toHaveBeenCalled()
    })

    it('should handle empty notes array', () => {
      expect(() => {
        renderer.renderNotes([], 800, 8)
      }).not.toThrow()
    })

    it('should skip hit notes', () => {
      const notes: GameNote[] = [
        { lane: 0, timestamp: 1000, hit: false, y: 100 },
        { lane: 1, timestamp: 2000, hit: true, y: 200 }  // This should be skipped
      ]

      mockCtx.fillRect.mockClear()
      renderer.renderNotes(notes, 800, 8)

      // Should only render the unhit note
      expect(mockCtx.fillRect).toHaveBeenCalled()
    })

    it('should handle notes outside lane bounds', () => {
      const notes: GameNote[] = [
        { lane: -1, timestamp: 1000, hit: false, y: 100 },
        { lane: 10, timestamp: 2000, hit: false, y: 200 }
      ]

      expect(() => {
        renderer.renderNotes(notes, 800, 8)
      }).not.toThrow()
    })

    it('should apply different colors based on lane', () => {
      const notes: GameNote[] = [
        { lane: 0, timestamp: 1000, hit: false, y: 100 },
        { lane: 3, timestamp: 2000, hit: false, y: 200 },
        { lane: 7, timestamp: 3000, hit: false, y: 300 }
      ]

      renderer.renderNotes(notes, 800, 8)

      // Should set fillStyle for each note
      expect(mockCtx.fillStyle).toContain('hsl')
    })
  })

  describe('renderHitZone', () => {
    it('should render hit zone with proper styling', () => {
      renderer.renderHitZone(800, 600, 8)

      // Should draw the hit zone line and lane areas
      expect(mockCtx.stroke).toHaveBeenCalled()
      expect(mockCtx.fillRect).toHaveBeenCalled()
      expect(mockCtx.strokeRect).toHaveBeenCalled()
    })

    it('should handle different lane counts', () => {
      const testCases = [4, 6, 8, 10]
      
      testCases.forEach(laneCount => {
        mockCtx.fillRect.mockClear()
        renderer.renderHitZone(800, 600, laneCount)
        expect(mockCtx.fillRect).toHaveBeenCalled()
      })
    })

    it('should handle zero lanes gracefully', () => {
      expect(() => {
        renderer.renderHitZone(800, 600, 0)
      }).not.toThrow()
    })
  })

  describe('renderAudioVisualization', () => {
    it('should render frequency visualization', () => {
      const frequencyData = new Uint8Array(256)
      // Fill with sample data
      for (let i = 0; i < frequencyData.length; i++) {
        frequencyData[i] = Math.floor(Math.random() * 255)
      }

      renderer.renderAudioVisualization(frequencyData, 800, 600)

      // Should draw frequency bars and create gradients
      expect(mockCtx.fillRect).toHaveBeenCalled()
      expect(mockCtx.createLinearGradient).toHaveBeenCalled()
    })

    it('should handle empty frequency data', () => {
      const frequencyData = new Uint8Array(256)
      // All zeros

      expect(() => {
        renderer.renderAudioVisualization(frequencyData, 800, 600)
      }).not.toThrow()
    })

    it('should handle null frequency data', () => {
      expect(() => {
        renderer.renderAudioVisualization(null as any, 800, 600)
      }).not.toThrow()
    })

    it('should handle different frequency data sizes', () => {
      const sizes = [64, 128, 256, 512, 1024]
      
      sizes.forEach(size => {
        const frequencyData = new Uint8Array(size)
        for (let i = 0; i < size; i++) {
          frequencyData[i] = 128 // Mid-range value
        }
        
        mockCtx.fillRect.mockClear()
        
        expect(() => {
          renderer.renderAudioVisualization(frequencyData, 800, 600)
        }).not.toThrow()
      })
    })

    it('should handle maximum frequency values', () => {
      const frequencyData = new Uint8Array(256)
      frequencyData.fill(255) // All maximum values

      expect(() => {
        renderer.renderAudioVisualization(frequencyData, 800, 600)
      }).not.toThrow()
    })
  })

  describe('renderHitEffects', () => {
    it('should render hit effects with accuracy indicators', () => {
      // Add some hit effects
      renderer.showHitEffect(2, 0.95) // Excellent hit
      renderer.showHitEffect(5, 0.7)  // Good hit
      renderer.showHitEffect(1, 0.3)  // Poor hit

      mockCtx.arc.mockClear()
      
      renderer.renderHitEffects(800, 600, 8)

      // Should draw circles for hit effects
      expect(mockCtx.arc).toHaveBeenCalled()
    })

    it('should fade out old hit effects', () => {
      renderer.showHitEffect(3, 0.8)
      
      // Render multiple times to test fade effect
      for (let i = 0; i < 5; i++) {
        renderer.renderHitEffects(800, 600, 8)
      }
      
      expect(mockCtx.arc).toHaveBeenCalled()
    })

    it('should handle no hit effects gracefully', () => {
      expect(() => {
        renderer.renderHitEffects(800, 600, 8)
      }).not.toThrow()
    })

    it('should use different colors based on accuracy', () => {
      renderer.showHitEffect(0, 0.9)  // High accuracy - should be green
      renderer.showHitEffect(1, 0.6)  // Medium accuracy - should be yellow
      renderer.showHitEffect(2, 0.2)  // Low accuracy - should be red

      renderer.renderHitEffects(800, 600, 8)

      // Should set different stroke styles for different accuracies
      expect(mockCtx.strokeStyle).toContain('hsl')
    })
  })

  describe('lane press effects', () => {
    it('should add lane press effects', () => {
      renderer.showLanePress(3)
      renderer.showLanePress(7)
      
      // Render to trigger lane press visualization
      renderer.renderLanes(800, 600, 8)
      
      expect(mockCtx.fillRect).toHaveBeenCalled()
    })

    it('should handle multiple rapid presses on same lane', () => {
      renderer.showLanePress(2)
      renderer.showLanePress(2)
      renderer.showLanePress(2)
      
      expect(() => {
        renderer.renderLanes(800, 600, 8)
      }).not.toThrow()
    })

    it('should handle invalid lane numbers', () => {
      expect(() => {
        renderer.showLanePress(-1)
        renderer.showLanePress(999)
        renderer.renderLanes(800, 600, 8)
      }).not.toThrow()
    })
  })

  describe('hit effects', () => {
    it('should add hit effects with different accuracy levels', () => {
      const accuracyLevels = [0.1, 0.3, 0.5, 0.7, 0.9, 1.0]
      
      accuracyLevels.forEach((accuracy, index) => {
        renderer.showHitEffect(index % 8, accuracy)
      })
      
      renderer.renderHitEffects(800, 600, 8)
      
      expect(mockCtx.arc).toHaveBeenCalled()
    })

    it('should handle extreme accuracy values', () => {
      expect(() => {
        renderer.showHitEffect(0, -0.5)  // Below 0
        renderer.showHitEffect(1, 1.5)   // Above 1
        renderer.showHitEffect(2, 0)     // Exactly 0
        renderer.showHitEffect(3, 1)     // Exactly 1
        renderer.renderHitEffects(800, 600, 8)
      }).not.toThrow()
    })
  })

  describe('context state management', () => {
    it('should save and restore context state properly', () => {
      // Many rendering operations should save/restore context
      renderer.renderLanes(800, 600, 8)
      renderer.showHitEffect(0, 0.8)
      renderer.renderHitEffects(800, 600, 8)
      
      // Context save/restore should be called
      expect(mockCtx.save).toHaveBeenCalled()
      expect(mockCtx.restore).toHaveBeenCalled()
    })
  })

  describe('edge cases and error handling', () => {
    it('should handle null or undefined context gracefully', () => {
      expect(() => {
        new GameRenderer(null as any)
      }).not.toThrow()
    })

    it('should handle very large canvas dimensions', () => {
      expect(() => {
        renderer.renderLanes(10000, 10000, 8)
      }).not.toThrow()
    })

    it('should handle zero canvas dimensions', () => {
      expect(() => {
        renderer.renderLanes(0, 0, 8)
        renderer.renderNotes([], 0, 8)
        renderer.renderHitZone(0, 0, 8)
        renderer.renderAudioVisualization(new Uint8Array(256), 0, 0)
        renderer.renderHitEffects(0, 0, 8)
      }).not.toThrow()
    })

    it('should handle negative canvas dimensions', () => {
      expect(() => {
        renderer.renderLanes(-100, -100, 8)
      }).not.toThrow()
    })
  })
})