import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests',
  testMatch: 'landing.spec.ts',
  fullyParallel: false,
  workers: 1,
  retries: 0,
  timeout: 30_000,
  expect: { timeout: 8_000 },
  reporter: [['list'], ['html', { open: 'never' }]],
  use: {
    baseURL: 'http://127.0.0.1:4322',
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'off',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'], channel: process.env.PLAYWRIGHT_CHANNEL || undefined },
    },
  ],
  webServer: [
    {
      command: 'node tests/fixtures/mock-webhook.mjs',
      url: 'http://127.0.0.1:4399/health',
      reuseExistingServer: false,
      timeout: 20_000,
    },
    {
      command: 'node dist/server/entry.mjs',
      url: 'http://127.0.0.1:4322',
      env: {
        HOST: '127.0.0.1',
        PORT: '4322',
        LEAD_WEBHOOK_URL: 'http://127.0.0.1:4399/leads',
      },
      reuseExistingServer: false,
      timeout: 30_000,
    },
    {
      command: 'node dist/server/entry.mjs',
      url: 'http://127.0.0.1:4323',
      env: { HOST: '127.0.0.1', PORT: '4323', LEAD_WEBHOOK_URL: '' },
      reuseExistingServer: false,
      timeout: 30_000,
    },
  ],
});
