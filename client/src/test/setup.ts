import '@testing-library/jest-dom'
import { cleanup } from '@testing-library/react'
import { expect, afterEach, vi, beforeEach, afterAll } from 'vitest'

// Her test sonrası temizlik yap
afterEach(() => {
  cleanup()
})

// Global mocks
global.ResizeObserver = vi.fn().mockImplementation(() => ({
  observe: vi.fn(),
  unobserve: vi.fn(),
  disconnect: vi.fn(),
}))

// Window mocks for Electron
Object.defineProperty(window, 'ipcRenderer', {
  value: {
    invoke: vi.fn(),
    send: vi.fn(),
    on: vi.fn(),
    removeListener: vi.fn(),
  },
  writable: true,
})

// LocalStorage mock
Object.defineProperty(window, 'localStorage', {
  value: {
    getItem: vi.fn(),
    setItem: vi.fn(),
    removeItem: vi.fn(),
    clear: vi.fn(),
  },
  writable: true,
})

// IndexedDB mock (basit)
Object.defineProperty(window, 'indexedDB', {
  value: {
    open: vi.fn(),
    deleteDatabase: vi.fn(),
  },
  writable: true,
})

// Console uyarılarını sessizleştir
const originalConsoleError = console.error
beforeEach(() => {
  console.error = (...args: unknown[]) => {
    if (
      typeof args[0] === 'string' &&
      args[0].includes('Warning: ReactDOM.render is deprecated')
    ) {
      return
    }
    originalConsoleError.call(console, ...(args as unknown[]))
  }
})

afterAll(() => {
  console.error = originalConsoleError
})