import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['src/performance/**/*.test.ts', 'src/test/performance/**/*.test.ts'],
    exclude: [],
    setupFiles: [],
  },
})

