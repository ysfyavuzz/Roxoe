import { defineConfig, devices } from '@playwright/test'

export default defineConfig({
  testDir: './e2e',
  timeout: 30 * 1000,
  expect: { timeout: 5000 },
  use: {
    baseURL: 'http://localhost:4173',
    trace: 'on-first-retry',
    video: 'retain-on-failure'
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'], browserName: 'chromium' } }
  ],
  webServer: {
    command: 'npm run preview',
    url: 'http://localhost:4173',
    reuseExistingServer: true,
    cwd: process.cwd(),
    timeout: 120 * 1000,
    env: {
      NODE_ENV: 'test',
      VITE_LICENSE_BYPASS: 'true',
      VITE_ADMIN_MODE: 'true',
      VITE_E2E_MODE: 'true',
    },
  }
})

