/**
 * Vitest Test Setup
 * ================
 * Global test configuration and mocks
 */

import '@testing-library/jest-dom'
import { expect, afterEach, vi } from 'vitest'
import { cleanup } from '@testing-library/react'

// Cleanup after each test case (e.g. clearing jsdom)
afterEach(() => {
  cleanup()
})

// Mock environment variables
process.env.NODE_ENV = 'test'
process.env.DATABASE_URL = 'postgresql://test:test@localhost:5432/hi_test'
process.env.SESSION_SECRET = 'test-secret-key'

// Mock external services
vi.mock('node-fetch', () => ({
  default: vi.fn()
}))

// Mock Claude API
vi.mock('@server/services/claude-api-service', () => ({
  generateClaudeCoachingResponse: vi.fn(),
  isClaudeAPIAvailable: vi.fn(() => false),
  getClaudeAPIStatus: vi.fn(() => ({
    enabled: false,
    hasApiKey: false,
    isAvailable: false
  }))
}))

// Mock database connections
vi.mock('pg', () => ({
  Pool: vi.fn(() => ({
    query: vi.fn(),
    connect: vi.fn(),
    end: vi.fn()
  }))
}))

// Mock file system operations
vi.mock('fs/promises', () => ({
  readFile: vi.fn(),
  writeFile: vi.fn(),
  mkdir: vi.fn(),
  access: vi.fn(),
  unlink: vi.fn(),
  copyFile: vi.fn()
}))

// Mock multer for file uploads
vi.mock('multer', () => ({
  default: vi.fn(() => ({
    single: vi.fn(() => (req: any, res: any, next: any) => next()),
    array: vi.fn(() => (req: any, res: any, next: any) => next())
  }))
}))

// Mock session middleware
vi.mock('express-session', () => ({
  default: vi.fn(() => (req: any, res: any, next: any) => {
    req.session = {
      userId: null,
      save: vi.fn((cb) => cb()),
      destroy: vi.fn((cb) => cb())
    }
    next()
  })
}))

// Mock window.location for navigation tests
Object.defineProperty(window, 'location', {
  value: {
    href: 'http://localhost:8080',
    origin: 'http://localhost:8080',
    pathname: '/',
    search: '',
    hash: '',
    assign: vi.fn(),
    replace: vi.fn(),
    reload: vi.fn()
  },
  writable: true
})

// Mock IntersectionObserver for component tests
global.IntersectionObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn()
}))

// Mock ResizeObserver for component tests
global.ResizeObserver = vi.fn(() => ({
  disconnect: vi.fn(),
  observe: vi.fn(),
  unobserve: vi.fn()
}))

// Mock canvas for StarCard image generation tests  
HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
  fillRect: vi.fn(),
  clearRect: vi.fn(),
  getImageData: vi.fn(),
  putImageData: vi.fn(),
  createImageData: vi.fn(() => []),
  setTransform: vi.fn(),
  drawImage: vi.fn(),
  save: vi.fn(),
  fillText: vi.fn(),
  restore: vi.fn(),
  beginPath: vi.fn(),
  moveTo: vi.fn(),
  lineTo: vi.fn(),
  closePath: vi.fn(),
  stroke: vi.fn(),
  translate: vi.fn(),
  scale: vi.fn(),
  rotate: vi.fn(),
  arc: vi.fn(),
  fill: vi.fn(),
  measureText: vi.fn(() => ({ width: 0 })),
  transform: vi.fn(),
  rect: vi.fn(),
  clip: vi.fn(),
}))

// Mock CSS Media Queries
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: vi.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // deprecated
    removeListener: vi.fn(), // deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
})

// Add custom matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling
    if (pass) {
      return {
        message: () => `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      }
    } else {
      return {
        message: () => `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      }
    }
  },
})

// Global test utilities
export const createMockUser = (overrides = {}) => ({
  id: 1,
  username: 'testuser',
  name: 'Test User',
  email: 'test@example.com',
  role: 'participant',
  isAdmin: false,
  createdAt: new Date().toISOString(),
  ...overrides
})

export const createMockStarCard = (overrides = {}) => ({
  id: 1,
  userId: 1,
  thinking: 25,
  acting: 25,
  feeling: 25,
  planning: 25,
  state: 'completed',
  createdAt: new Date().toISOString(),
  imageUrl: null,
  ...overrides
})

export const createMockWorkshopData = (type: 'ast' | 'ia' = 'ast', overrides = {}) => ({
  id: 1,
  userId: 1,
  workshopType: type,
  stepId: type === 'ast' ? '1-1' : 'ia-1-1',
  data: {},
  completed: false,
  createdAt: new Date().toISOString(),
  updatedAt: new Date().toISOString(),
  ...overrides
})

// Export commonly used testing utilities
export * from '@testing-library/react'
export * from '@testing-library/user-event'
export { vi, expect } from 'vitest'