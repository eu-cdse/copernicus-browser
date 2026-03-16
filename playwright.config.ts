import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const authFile = './e2e/.auth/user.json';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  updateSnapshots: 'missing',

  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project: runs auth once and saves state
    {
      name: 'setup',
      testMatch: /auth\.setup\.ts/,
    },

    // Tests that require authentication
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        storageState: authFile,
      },
      dependencies: ['setup'],
      testIgnore: [/auth\.setup\.ts/, /.*\.noauth\.spec\.ts/],
    },

    // Tests that run without authentication (e.g. anonymous flows)
    {
      name: 'chromium-no-auth',
      use: { ...devices['Desktop Chrome'] },
      testMatch: /.*\.noauth\.spec\.ts/,
    },
  ],

  webServer: {
    command: 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
});
