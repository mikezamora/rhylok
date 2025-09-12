import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { InputHandler } from '../game/InputHandler'

// Mock the document object for testing
Object.defineProperty(window, 'document', {
  value: {
    addEventListener: vi.fn(),
    removeEventListener: vi.fn()
  },
  writable: true
})

describe('InputHandler', () => {
  let inputHandler: InputHandler
  let mockAddEventListener: ReturnType<typeof vi.fn>
  let mockRemoveEventListener: ReturnType<typeof vi.fn>

  beforeEach(() => {
    // Reset mocks
    mockAddEventListener = vi.fn()
    mockRemoveEventListener = vi.fn()
    
    // Mock document methods
    vi.stubGlobal('document', {
      addEventListener: mockAddEventListener,
      removeEventListener: mockRemoveEventListener
    })
    
    inputHandler = new InputHandler()
  })

  afterEach(() => {
    vi.unstubAllGlobals()
  })

  describe('initialization', () => {
    it('should set up event listeners on construction', () => {
      expect(mockAddEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should initialize callbacks as null', () => {
      expect(inputHandler.onKeyPress).toBeNull()
      expect(inputHandler.onSpacePress).toBeNull()
      expect(inputHandler.onEscapePress).toBeNull()
    })
  })

  describe('key mapping', () => {
    it('should return correct lane for valid keys', () => {
      expect(inputHandler.getLaneForKey('KeyA')).toBe(0)
      expect(inputHandler.getLaneForKey('KeyS')).toBe(1)
      expect(inputHandler.getLaneForKey('KeyD')).toBe(2)
      expect(inputHandler.getLaneForKey('KeyF')).toBe(3)
      expect(inputHandler.getLaneForKey('KeyJ')).toBe(4)
      expect(inputHandler.getLaneForKey('KeyK')).toBe(5)
      expect(inputHandler.getLaneForKey('KeyL')).toBe(6)
      expect(inputHandler.getLaneForKey('Semicolon')).toBe(7)
    })

    it('should return null for invalid keys', () => {
      expect(inputHandler.getLaneForKey('KeyQ')).toBeNull()
      expect(inputHandler.getLaneForKey('Space')).toBeNull()
      expect(inputHandler.getLaneForKey('InvalidKey')).toBeNull()
      expect(inputHandler.getLaneForKey('')).toBeNull()
    })

    it('should return correct key for valid lanes', () => {
      expect(inputHandler.getKeyForLane(0)).toBe('KeyA')
      expect(inputHandler.getKeyForLane(1)).toBe('KeyS')
      expect(inputHandler.getKeyForLane(2)).toBe('KeyD')
      expect(inputHandler.getKeyForLane(3)).toBe('KeyF')
      expect(inputHandler.getKeyForLane(4)).toBe('KeyJ')
      expect(inputHandler.getKeyForLane(5)).toBe('KeyK')
      expect(inputHandler.getKeyForLane(6)).toBe('KeyL')
      expect(inputHandler.getKeyForLane(7)).toBe('Semicolon')
    })

    it('should return null for invalid lanes', () => {
      expect(inputHandler.getKeyForLane(-1)).toBeNull()
      expect(inputHandler.getKeyForLane(8)).toBeNull()
      expect(inputHandler.getKeyForLane(100)).toBeNull()
    })
  })

  describe('key event handling', () => {
    let keyDownHandler: (event: KeyboardEvent) => void

    beforeEach(() => {
      // Get the actual handler that was registered
      keyDownHandler = mockAddEventListener.mock.calls[0][1]
    })

    const createMockEvent = (code: string) => {
      const mockPreventDefault = vi.fn()
      return {
        code,
        preventDefault: mockPreventDefault
      } as unknown as KeyboardEvent
    }

    describe('space key handling', () => {
      it('should call onSpacePress when space is pressed and callback is set', () => {
        const mockSpaceCallback = vi.fn()
        inputHandler.onSpacePress = mockSpaceCallback
        
        const mockEvent = createMockEvent('Space')
        keyDownHandler(mockEvent)
        
        expect(mockEvent.preventDefault).toHaveBeenCalled()
        expect(mockSpaceCallback).toHaveBeenCalled()
      })

      it('should not throw when space is pressed and callback is null', () => {
        inputHandler.onSpacePress = null
        
        const mockEvent = createMockEvent('Space')
        
        expect(() => keyDownHandler(mockEvent)).not.toThrow()
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })
    })

    describe('escape key handling', () => {
      it('should call onEscapePress when escape is pressed and callback is set', () => {
        const mockEscapeCallback = vi.fn()
        inputHandler.onEscapePress = mockEscapeCallback
        
        const mockEvent = createMockEvent('Escape')
        keyDownHandler(mockEvent)
        
        expect(mockEvent.preventDefault).toHaveBeenCalled()
        expect(mockEscapeCallback).toHaveBeenCalled()
      })

      it('should not throw when escape is pressed and callback is null', () => {
        inputHandler.onEscapePress = null
        
        const mockEvent = createMockEvent('Escape')
        
        expect(() => keyDownHandler(mockEvent)).not.toThrow()
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })
    })

    describe('game key handling', () => {
      it('should call onKeyPress with correct lane for valid game keys', () => {
        const mockKeyCallback = vi.fn()
        inputHandler.onKeyPress = mockKeyCallback
        
        const mockEvent = createMockEvent('KeyA')
        keyDownHandler(mockEvent)
        
        expect(mockEvent.preventDefault).toHaveBeenCalled()
        expect(mockKeyCallback).toHaveBeenCalledWith(0)
      })

      it('should handle all game keys correctly', () => {
        const mockKeyCallback = vi.fn()
        inputHandler.onKeyPress = mockKeyCallback
        
        const testKeys = [
          { code: 'KeyA', lane: 0 },
          { code: 'KeyS', lane: 1 },
          { code: 'KeyD', lane: 2 },
          { code: 'KeyF', lane: 3 },
          { code: 'KeyJ', lane: 4 },
          { code: 'KeyK', lane: 5 },
          { code: 'KeyL', lane: 6 },
          { code: 'Semicolon', lane: 7 }
        ]
        
        testKeys.forEach(({ code, lane }) => {
          const mockEvent = createMockEvent(code)
          keyDownHandler(mockEvent)
          expect(mockKeyCallback).toHaveBeenCalledWith(lane)
        })
        
        expect(mockKeyCallback).toHaveBeenCalledTimes(8)
      })

      it('should not throw when game key is pressed and callback is null', () => {
        inputHandler.onKeyPress = null
        
        const mockEvent = createMockEvent('KeyA')
        
        expect(() => keyDownHandler(mockEvent)).not.toThrow()
        expect(mockEvent.preventDefault).toHaveBeenCalled()
      })

      it('should not call preventDefault for non-game keys', () => {
        const mockEvent = createMockEvent('KeyQ') // Not a game key
        keyDownHandler(mockEvent)
        
        expect(mockEvent.preventDefault).not.toHaveBeenCalled()
      })

      it('should not call callbacks for non-game keys', () => {
        const mockKeyCallback = vi.fn()
        const mockSpaceCallback = vi.fn()
        const mockEscapeCallback = vi.fn()
        
        inputHandler.onKeyPress = mockKeyCallback
        inputHandler.onSpacePress = mockSpaceCallback
        inputHandler.onEscapePress = mockEscapeCallback
        
        const mockEvent = createMockEvent('KeyQ') // Not a game key
        keyDownHandler(mockEvent)
        
        expect(mockKeyCallback).not.toHaveBeenCalled()
        expect(mockSpaceCallback).not.toHaveBeenCalled()
        expect(mockEscapeCallback).not.toHaveBeenCalled()
      })
    })
  })

  describe('destroy', () => {
    it('should remove event listeners when destroyed', () => {
      inputHandler.destroy()
      
      expect(mockRemoveEventListener).toHaveBeenCalledWith('keydown', expect.any(Function))
    })

    it('should not throw when called multiple times', () => {
      expect(() => {
        inputHandler.destroy()
        inputHandler.destroy()
        inputHandler.destroy()
      }).not.toThrow()
    })
  })

  describe('edge cases', () => {
    it('should handle undefined keycode gracefully', () => {
      const keyDownHandler = mockAddEventListener.mock.calls[0][1]
      const mockEvent = {
        code: undefined,
        preventDefault: vi.fn()
      } as unknown as KeyboardEvent
      
      expect(() => keyDownHandler(mockEvent)).not.toThrow()
    })

    it('should handle empty string keycode gracefully', () => {
      const keyDownHandler = mockAddEventListener.mock.calls[0][1]
      const mockEvent = {
        code: '',
        preventDefault: vi.fn()
      } as unknown as KeyboardEvent
      
      expect(() => keyDownHandler(mockEvent)).not.toThrow()
    })
  })
})