import { defineConfig, devices } from '@playwright/test';
import 'dotenv/config';

const authFile = './e2e/.auth/user.json';

export default defineConfig({
  testDir: './e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  // Tests must pass on the first attempt: retries only hide flakiness and multiply the cost of
  // every failure (each retry runs to the full live-backend timeout again).
  retries: 0,
  workers: process.env.CI ? 2 : undefined,
  // Stop a CI run that is clearly broken (e.g. a backend outage that the setup availability
  // check didn't catch) instead of letting every remaining test time out.
  maxFailures: process.env.CI ? 10 : undefined,
  reporter: 'html',
  updateSnapshots: 'missing',

  use: {
    baseURL: 'http://localhost:3000',
    // 'on-first-retry' would never record anything now that retries are off.
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
  },

  projects: [
    // Setup project: checks the live backend is reachable, runs auth once and saves state.
    // If any setup test fails, Playwright skips the dependent `chromium` tests.
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
    // CI serves a production build: the dev server (`npm run start`) serves ~900 unbundled modules
    // per page load, which takes ~4s per goto/reload on the CI runner (vs <1s locally) and made
    // tests that reload a few times overrun their timeouts. A build loads a handful of bundles.
    // `--strictPort` makes a busy port fail loudly instead of silently moving off :3000, which
    // VITE_ROOT_URL points at. Locally the dev server is kept (and reused if already running).
    command: process.env.CI ? 'npm run build && npx vite preview --strictPort' : 'npm run start',
    url: 'http://localhost:3000',
    reuseExistingServer: !process.env.CI,
    // The production build runs before the server starts, so allow for it in CI.
    timeout: process.env.CI ? 300_000 : 120_000,
  },
});
