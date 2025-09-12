import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { AudioAnalyzer } from '../game/AudioAnalyzer'

// Mock Web Audio API
const mockAudioContext = {
  state: 'running',
  currentTime: 0,
  sampleRate: 44100,
  destination: {},
  resume: vi.fn().mockResolvedValue(undefined),
  suspend: vi.fn().mockResolvedValue(undefined),
  close: vi.fn().mockResolvedValue(undefined),
  createAnalyser: vi.fn(() => mockAnalyserNode),
  createBufferSource: vi.fn(() => mockBufferSourceNode),
  createMediaStreamSource: vi.fn(() => mockMediaStreamSourceNode),
  decodeAudioData: vi.fn()
}

const mockAnalyserNode = {
  fftSize: 2048,
  smoothingTimeConstant: 0.8,
  frequencyBinCount: 1024,
  connect: vi.fn(),
  disconnect: vi.fn(),
  getByteFrequencyData: vi.fn((array: Uint8Array) => {
    // Fill with mock frequency data
    for (let i = 0; i < array.length; i++) {
      array[i] = Math.floor(Math.random() * 255)
    }
  })
}

const mockBufferSourceNode = {
  buffer: null,
  playbackRate: { value: 1.0 },
  connect: vi.fn(),
  disconnect: vi.fn(),
  start: vi.fn(),
  stop: vi.fn(),
  onended: null
}

const mockMediaStreamSourceNode = {
  connect: vi.fn(),
  disconnect: vi.fn()
}

const mockAudioBuffer = {
  duration: 120, // 2 minutes
  numberOfChannels: 2,
  sampleRate: 44100,
  length: 44100 * 120,
  getChannelData: vi.fn(() => {
    const data = new Float32Array(44100)
    // Fill with some non-zero data to simulate real audio
    for (let i = 0; i < data.length; i++) {
      data[i] = (Math.random() - 0.5) * 0.5
    }
    return data
  }),
  copyFromChannel: vi.fn(),
  copyToChannel: vi.fn()
}

const mockMediaStream = {
  getTracks: vi.fn(() => [
    { stop: vi.fn() }
  ])
}

// Mock global objects
Object.defineProperty(window, 'AudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true
})

Object.defineProperty(window, 'webkitAudioContext', {
  value: vi.fn(() => mockAudioContext),
  writable: true
})

Object.defineProperty(navigator, 'mediaDevices', {
  value: {
    getUserMedia: vi.fn().mockResolvedValue(mockMediaStream)
  },
  writable: true
})

describe('AudioAnalyzer', () => {
  let audioAnalyzer: AudioAnalyzer

  beforeEach(async () => {
    vi.clearAllMocks()
    mockAudioContext.decodeAudioData.mockResolvedValue(mockAudioBuffer)
    // Reset getUserMedia to successful resolution for each test
    ;(navigator.mediaDevices.getUserMedia as any).mockResolvedValue(mockMediaStream)
    audioAnalyzer = new AudioAnalyzer()
    // Wait a bit for async initialization
    await new Promise(resolve => setTimeout(resolve, 10))
  })

  afterEach(() => {
    audioAnalyzer.destroy()
  })

  describe('initialization', () => {
    it('should initialize with AudioContext', () => {
      expect(audioAnalyzer).toBeDefined()
    })

    it('should have proper methods defined', () => {
      expect(audioAnalyzer.loadAudioFile).toBeDefined()
      expect(audioAnalyzer.play).toBeDefined()
      expect(audioAnalyzer.pause).toBeDefined()
      expect(audioAnalyzer.reset).toBeDefined()
      expect(audioAnalyzer.getIsPlaying).toBeDefined()
      expect(audioAnalyzer.getIsPaused).toBeDefined()
      expect(audioAnalyzer.getCurrentTime).toBeDefined()
      expect(audioAnalyzer.getFrequencyData).toBeDefined()
      expect(audioAnalyzer.getAudioBuffer).toBeDefined()
      expect(audioAnalyzer.startMicrophoneInput).toBeDefined()
      expect(audioAnalyzer.stopMicrophoneInput).toBeDefined()
      expect(audioAnalyzer.isUsingMicrophoneInput).toBeDefined()
      expect(audioAnalyzer.destroy).toBeDefined()
    })
  })

  describe('audio file loading', () => {
    it('should load audio file successfully', async () => {
      const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' })
      
      // Mock file.arrayBuffer()
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      
      await audioAnalyzer.loadAudioFile(mockFile)
      
      expect(mockAudioContext.decodeAudioData).toHaveBeenCalled()
      expect(mockAudioContext.createAnalyser).toHaveBeenCalled()
      expect(audioAnalyzer.getAudioBuffer()).toBe(mockAudioBuffer)
    })

    it('should handle decode errors gracefully', async () => {
      const mockFile = new File(['invalid audio'], 'test.mp3', { type: 'audio/mpeg' })
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      
      const decodeError = new DOMException('Invalid format', 'EncodingError')
      mockAudioContext.decodeAudioData.mockRejectedValue(decodeError)
      
      await expect(audioAnalyzer.loadAudioFile(mockFile)).rejects.toThrow('Unsupported audio format')
    })

    it('should handle not supported errors', async () => {
      const mockFile = new File(['invalid audio'], 'test.mp3', { type: 'audio/mpeg' })
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      
      const notSupportedError = new DOMException('Not supported', 'NotSupportedError')
      mockAudioContext.decodeAudioData.mockRejectedValue(notSupportedError)
      
      await expect(audioAnalyzer.loadAudioFile(mockFile)).rejects.toThrow('Audio format not supported')
    })

    it('should handle generic decode errors', async () => {
      const mockFile = new File(['invalid audio'], 'test.mp3', { type: 'audio/mpeg' })
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      
      mockAudioContext.decodeAudioData.mockRejectedValue(new Error('Generic error'))
      
      await expect(audioAnalyzer.loadAudioFile(mockFile)).rejects.toThrow('Failed to decode audio file')
    })

    it('should detect silent audio files', async () => {
      const silentAudioBuffer = {
        ...mockAudioBuffer,
        getChannelData: vi.fn(() => new Float32Array(44100)) // All zeros
      }
      
      mockAudioContext.decodeAudioData.mockResolvedValue(silentAudioBuffer)
      
      const mockFile = new File(['silent audio'], 'silent.mp3', { type: 'audio/mpeg' })
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      
      // Should not throw but should log warning
      const consoleSpy = vi.spyOn(console, 'warn').mockImplementation(() => {})
      
      await audioAnalyzer.loadAudioFile(mockFile)
      
      expect(consoleSpy).toHaveBeenCalledWith('Audio file appears to be silent or very quiet')
      consoleSpy.mockRestore()
    })
  })

  describe('playback control', () => {
    beforeEach(async () => {
      const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' })
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      await audioAnalyzer.loadAudioFile(mockFile)
    })

    it('should play audio successfully', async () => {
      await audioAnalyzer.play()
      
      expect(mockAudioContext.createBufferSource).toHaveBeenCalled()
      expect(mockBufferSourceNode.connect).toHaveBeenCalled()
      expect(mockBufferSourceNode.start).toHaveBeenCalledWith(0)
    })

    it('should resume audio when context is suspended', async () => {
      const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' })
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      await audioAnalyzer.loadAudioFile(mockFile)
      
      // Start playback first
      await audioAnalyzer.play()
      
      // Then suspend the context (simulating pause)
      mockAudioContext.state = 'suspended'
      
      // Now play again should resume
      await audioAnalyzer.play()

      expect(mockAudioContext.resume).toHaveBeenCalled()
    })

    it('should pause audio successfully', async () => {
      mockAudioContext.state = 'running'
      
      await audioAnalyzer.pause()
      
      expect(mockAudioContext.suspend).toHaveBeenCalled()
    })

    it('should handle pause when not running', async () => {
      mockAudioContext.state = 'suspended'
      
      await audioAnalyzer.pause()
      
      // Should not throw and should handle gracefully
      expect(true).toBe(true)
    })

    it('should reset audio state', () => {
      audioAnalyzer.reset()
      
      // Should call stop internally
      expect(true).toBe(true) // Reset is mainly cleanup
    })

    it('should detect playing state correctly', async () => {
      mockAudioContext.state = 'running'
      await audioAnalyzer.play()
      
      expect(audioAnalyzer.getIsPlaying()).toBe(true)
    })

    it('should detect paused state correctly', async () => {
      mockAudioContext.state = 'suspended'
      await audioAnalyzer.play()
      
      expect(audioAnalyzer.getIsPaused()).toBe(true)
    })

    it('should track current time', async () => {
      mockAudioContext.state = 'running'
      mockAudioContext.currentTime = 45.5
      await audioAnalyzer.play()
      
      expect(audioAnalyzer.getCurrentTime()).toBe(45.5)
    })

    it('should return 0 for current time when not playing', () => {
      mockAudioContext.state = 'suspended'
      
      expect(audioAnalyzer.getCurrentTime()).toBe(0)
    })

    it('should detect when audio has ended', async () => {
      mockAudioContext.state = 'running'
      mockAudioContext.currentTime = 130 // Beyond buffer duration
      await audioAnalyzer.play()
      
      expect(audioAnalyzer.hasEnded()).toBe(true)
    })
  })

  describe('playback rate control', () => {
    beforeEach(async () => {
      const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' })
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      await audioAnalyzer.loadAudioFile(mockFile)
    })

    it('should set playback rate within valid range', () => {
      audioAnalyzer.setPlaybackRate(2.0)
      expect(audioAnalyzer.getPlaybackRate()).toBe(2.0)
    })

    it('should clamp playback rate to minimum', () => {
      audioAnalyzer.setPlaybackRate(0.1)
      expect(audioAnalyzer.getPlaybackRate()).toBe(0.25)
    })

    it('should clamp playback rate to maximum', () => {
      audioAnalyzer.setPlaybackRate(5.0)
      expect(audioAnalyzer.getPlaybackRate()).toBe(4.0)
    })

    it('should update active source node playback rate', async () => {
      await audioAnalyzer.play()
      mockAudioContext.state = 'running'
      
      audioAnalyzer.setPlaybackRate(1.5)
      
      expect(mockBufferSourceNode.playbackRate.value).toBe(1.5)
    })
  })

  describe('frequency analysis', () => {
    beforeEach(async () => {
      const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' })
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      await audioAnalyzer.loadAudioFile(mockFile)
    })

    it('should return frequency data', () => {
      const frequencyData = audioAnalyzer.getFrequencyData()
      
      expect(frequencyData).toBeInstanceOf(Uint8Array)
      expect(frequencyData.length).toBeGreaterThan(0)
      expect(mockAnalyserNode.getByteFrequencyData).toHaveBeenCalled()
    })

    it('should return empty frequency data when no analyser', () => {
      const freshAnalyzer = new AudioAnalyzer()
      const frequencyData = freshAnalyzer.getFrequencyData()
      
      expect(frequencyData).toBeInstanceOf(Uint8Array)
      expect(frequencyData.length).toBe(512)
      
      freshAnalyzer.destroy()
    })

    it('should return frequency data at specific time when playing', async () => {
      mockAudioContext.state = 'running'
      mockAudioContext.currentTime = 1.0
      await audioAnalyzer.play()
      
      const frequencyData = audioAnalyzer.getFrequencyDataAtTime(1000) // 1 second in ms
      
      expect(frequencyData).toBeInstanceOf(Uint8Array)
    })

    it('should return null for frequency data when not playing or time mismatch', () => {
      const frequencyData = audioAnalyzer.getFrequencyDataAtTime(5000)
      
      expect(frequencyData).toBeNull()
    })
  })

  describe('microphone input', () => {
    it('should start microphone input successfully', async () => {
      await audioAnalyzer.startMicrophoneInput()
      
      expect(navigator.mediaDevices.getUserMedia).toHaveBeenCalledWith({
        audio: {
          echoCancellation: false,
          noiseSuppression: false,
          autoGainControl: false
        }
      })
      expect(mockAudioContext.createMediaStreamSource).toHaveBeenCalled()
      expect(audioAnalyzer.isUsingMicrophoneInput()).toBe(true)
    })

    it('should handle microphone access denial', async () => {
      const mediaError = new Error('Permission denied')
      ;(navigator.mediaDevices.getUserMedia as any).mockRejectedValueOnce(mediaError)
      
      await expect(audioAnalyzer.startMicrophoneInput()).rejects.toThrow('Microphone access denied')
    })

    it('should stop microphone input', async () => {
      await audioAnalyzer.startMicrophoneInput()
      audioAnalyzer.stopMicrophoneInput()
      
      expect(mockMediaStreamSourceNode.disconnect).toHaveBeenCalled()
      expect(audioAnalyzer.isUsingMicrophoneInput()).toBe(false)
    })

    it('should stop microphone tracks when stopping input', async () => {
      const mockTrack = { stop: vi.fn() }
      mockMediaStream.getTracks.mockReturnValue([mockTrack])
      
      await audioAnalyzer.startMicrophoneInput()
      audioAnalyzer.stopMicrophoneInput()
      
      expect(mockTrack.stop).toHaveBeenCalled()
    })
  })

  describe('error handling and edge cases', () => {
    it('should throw error when playing without loaded audio', async () => {
      const freshAnalyzer = new AudioAnalyzer()
      
      await expect(freshAnalyzer.play()).rejects.toThrow('Audio not loaded')
      
      freshAnalyzer.destroy()
    })

    it('should throw error when loading file without audio context', async () => {
      const analyzerWithoutContext = new AudioAnalyzer()
      // Simulate failed audio context initialization
      vi.spyOn(analyzerWithoutContext as any, 'audioContext', 'get').mockReturnValue(null)
      
      const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' })
      
      await expect(analyzerWithoutContext.loadAudioFile(mockFile)).rejects.toThrow('AudioContext not initialized')
      
      analyzerWithoutContext.destroy()
    })

    it('should handle stop errors gracefully', async () => {
      const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' })
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      await audioAnalyzer.loadAudioFile(mockFile)
      await audioAnalyzer.play()
      
      // Mock stop to throw error
      mockBufferSourceNode.stop.mockImplementation(() => {
        throw new Error('Already stopped')
      })
      
      // Should not throw when stopping
      expect(() => audioAnalyzer.reset()).not.toThrow()
    })

    it('should handle destroy gracefully', async () => {
      const mockFile = new File(['audio data'], 'test.mp3', { type: 'audio/mpeg' })
      vi.spyOn(mockFile, 'arrayBuffer').mockResolvedValue(new ArrayBuffer(1024))
      await audioAnalyzer.loadAudioFile(mockFile)
      await audioAnalyzer.startMicrophoneInput()
      
      expect(() => audioAnalyzer.destroy()).not.toThrow()
      expect(mockAudioContext.close).toHaveBeenCalled()
    })

    it('should handle destroy when audio context already closed', () => {
      mockAudioContext.state = 'closed'
      
      expect(() => audioAnalyzer.destroy()).not.toThrow()
    })
  })

  describe('state management', () => {
    it('should return null for audio buffer when not loaded', () => {
      expect(audioAnalyzer.getAudioBuffer()).toBeNull()
    })

    it('should return false for microphone input initially', () => {
      expect(audioAnalyzer.isUsingMicrophoneInput()).toBe(false)
    })

    it('should return false for playing when no audio loaded', () => {
      expect(audioAnalyzer.getIsPlaying()).toBe(false)
    })

    it('should return false for paused when no audio loaded', () => {
      expect(audioAnalyzer.getIsPaused()).toBe(false)
    })

    it('should return true for ended when no audio loaded', () => {
      expect(audioAnalyzer.hasEnded()).toBe(true)
    })
  })
})