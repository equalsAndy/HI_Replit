/// <reference types="vitest" />
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'path'
import { fileURLToPath } from 'url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: ['./src/test/setup.ts'],
    css: true,
    // Mock external services
    mockReset: true,
    clearMocks: true,
    restoreMocks: true,
    // Test coverage configuration
    coverage: {
      reporter: ['text', 'json', 'html'],
      exclude: [
        'node_modules/',
        'dist/',
        '**/*.d.ts',
        '**/*.config.*',
        '**/coverage/**',
        '**/.{idea,git,cache,output,temp}/**',
        'server/vite.ts',
        'server/dev-server.js'
      ],
      thresholds: {
        global: {
          branches: 70,
          functions: 70,
          lines: 70,
          statements: 70
        }
      }
    },
    // Environment variables for testing
    env: {
      NODE_ENV: 'test',
      VITE_API_URL: 'http://localhost:8080',
      DATABASE_URL: 'postgresql://test:test@localhost:5432/hi_test'
    }
  },
  resolve: {
    alias: {
      '@client': path.resolve(__dirname, 'client/src'),
      '@': path.resolve(__dirname, 'client/src'),
      '@shared': path.resolve(__dirname, 'shared'),
      '@assets': path.resolve(__dirname, 'attached_assets'),
      '@server': path.resolve(__dirname, 'server')
    }
  },
  // Optimize for testing
  esbuild: {
    target: 'node14'
  }
})
