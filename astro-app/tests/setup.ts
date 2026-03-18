import '@testing-library/jest-dom'
import { vi } from 'vitest'

// Mock localStorage
const localStorageMock = {
  getItem: vi.fn(),
  setItem: vi.fn(),
  removeItem: vi.fn(),
  clear: vi.fn(),
}
Object.defineProperty(window, 'localStorage', { value: localStorageMock })

// Mock AudioContext
class AudioContextMock {
  createOscillator() {
    return {
      connect: vi.fn(),
      frequency: { value: 0 },
      type: '',
      start: vi.fn(),
      stop: vi.fn(),
    }
  }
  createGain() {
    return {
      connect: vi.fn(),
      gain: {
        setValueAtTime: vi.fn(),
        exponentialRampToValueAtTime: vi.fn(),
      },
    }
  }
  get currentTime() {
    return 0
  }
  get destination() {
    return {}
  }
}
Object.defineProperty(window, 'AudioContext', { value: AudioContextMock })

// Mock ResizeObserver
class ResizeObserverMock {
  observe() {}
  unobserve() {}
  disconnect() {}
}
Object.defineProperty(window, 'ResizeObserver', { value: ResizeObserverMock })
