import { describe, it, expect, beforeEach, vi } from 'vitest'
import { setupCounter } from '../counter'

describe('setupCounter', () => {
  let mockButton: HTMLButtonElement
  let mockAddEventListener: any

  beforeEach(() => {
    mockAddEventListener = vi.fn()
    mockButton = {
      innerHTML: '',
      addEventListener: mockAddEventListener
    } as any
  })

  it('should initialize counter with count 0', () => {
    setupCounter(mockButton)
    
    expect(mockButton.innerHTML).toBe('count is 0')
  })

  it('should setup click event listener', () => {
    setupCounter(mockButton)
    
    expect(mockAddEventListener).toHaveBeenCalledWith('click', expect.any(Function))
    expect(mockAddEventListener).toHaveBeenCalledTimes(1)
  })

  it('should increment counter when button is clicked', () => {
    setupCounter(mockButton)
    
    // Get the click handler that was registered
    const clickHandler = mockAddEventListener.mock.calls[0][1]
    
    // Simulate clicking the button
    clickHandler()
    expect(mockButton.innerHTML).toBe('count is 1')
    
    // Click again
    clickHandler()
    expect(mockButton.innerHTML).toBe('count is 2')
    
    // Click multiple times
    clickHandler()
    clickHandler()
    clickHandler()
    expect(mockButton.innerHTML).toBe('count is 5')
  })

  it('should handle multiple rapid clicks', () => {
    setupCounter(mockButton)
    
    const clickHandler = mockAddEventListener.mock.calls[0][1]
    
    // Simulate rapid clicking
    for (let i = 0; i < 10; i++) {
      clickHandler()
    }
    
    expect(mockButton.innerHTML).toBe('count is 10')
  })

  it('should start from 0 after setup regardless of previous state', () => {
    mockButton.innerHTML = 'some previous content'
    
    setupCounter(mockButton)
    
    expect(mockButton.innerHTML).toBe('count is 0')
  })
})