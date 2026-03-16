# E2E Tests (Playwright)

## Prerequisites

- Node.js 18+
- Playwright browsers installed:
  ```bash
  npx playwright install chromium
  ```
- Dev server running on `http://localhost:3000` (started automatically by Playwright, or manually with `npm run start`)

## Project structure

```
e2e/
├── .auth/              # Saved auth state (git-ignored)
│   └── user.json
├── auth.setup.ts       # SSO login setup – runs once before authenticated tests
├── code-editor.spec.ts
├── openEo.backend.spec.ts
└── README.md
```

## Authentication

Tests use a **shared authentication** setup. The `auth.setup.ts` file logs in via SSO once and saves the browser state (cookies, local storage) to `e2e/.auth/user.json`. All tests in the `chromium` project automatically load this state, so they start already logged in.

### Playwright projects

| Project | Description |
|---------|-------------|
| `setup` | Runs `auth.setup.ts` to perform SSO login and save state |
| `chromium` | Authenticated tests – depends on `setup`, loads saved state |
| `chromium-no-auth` | Tests without auth – matches `*.noauth.spec.ts` files |

### Credentials

The SSO credentials are read from environment variables `E2E_SSO_USERNAME` and `E2E_SSO_PASSWORD`. Set these in your `.env` file for local development. 

## Running tests

### Run all tests (headless)

```bash
npm run test:e2e
```

This runs the `setup` project first (logs in), then all `chromium` tests.

### Run all tests (headed – see the browser)

```bash
npm run test:e2e:headed
```

### Run with interactive UI

```bash
npm run test:e2e:ui
```

### Run a specific test file

```bash
npx playwright test code-editor.spec.ts
```

### Run a specific test by name

```bash
npx playwright test -g "test if processGraph is selected"
```

### Run only the auth setup

```bash
npx playwright test --project=setup --headed
```

### Run tests without auth (anonymous flows)

```bash
npx playwright test --project=chromium-no-auth
```

## Recording new tests

### 1. Generate the auth state

Before recording, you need a valid `e2e/.auth/user.json`. Run the auth setup once:

```bash
npx playwright test --project=setup
```

### 2. Record with authentication

Open the recorder with the saved auth state pre-loaded:

```bash
npx playwright codegen --load-storage=./e2e/.auth/user.json http://localhost:3000
```

This opens a browser already logged in. Interact with the app, and Playwright generates test code in real time. Copy the generated code into a new `.spec.ts` file in the `e2e/` directory.

### 3. Record without authentication

```bash
npx playwright codegen http://localhost:3000
```

Save the output as a `*.noauth.spec.ts` file so it runs under the `chromium-no-auth` project.

### Tips for recording

- Use the **Pick locator** button (crosshair icon) in the recorder to inspect elements
- Prefer role-based selectors (`getByRole`, `getByText`, `getByLabel`) over CSS selectors
- After recording, review and clean up the generated code – remove redundant clicks and add meaningful assertions

## Writing tests manually

Create a new file like `e2e/my-feature.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('my authenticated test', async ({ page }) => {
  await page.goto('/');
  // The browser is already logged in via shared auth
  await expect(page.getByText('FE-Team Test Account')).toBeVisible();
});
```

For tests that should run **without** authentication, name the file `*.noauth.spec.ts`:

```typescript
import { test, expect } from '@playwright/test';

test('anonymous flow', async ({ page }) => {
  await page.goto('/');
  await expect(page.getByText('Login')).toBeVisible();
});
```

## Debugging

### Run in debug mode (step through with inspector)

```bash
npx playwright test --debug
```

### View traces from failed tests

```bash
npx playwright show-trace test-results/<test-folder>/trace.zip
```

### View the last HTML report

```bash
npx playwright show-report
```

## Visual snapshot tests

Some tests use `toHaveScreenshot()` to do pixel-perfect visual regression checks. The baseline `.png` files are committed to the repo under `e2e/`.

### macOS vs Linux

Playwright screenshots are OS-specific due to differences in font rendering and antialiasing. The CI runner is Linux, so **baselines must be generated on Linux** — not on macOS — otherwise CI will always report diffs.

Use this Docker command to generate or update snapshots locally using the same Linux image as CI:

```bash
docker run --rm \
  -v $(pwd):/work \
  -w /work \
  mcr.microsoft.com/playwright:v1.58.2-noble \
  npx playwright test --project=chromium --update-snapshots
```

Then commit the updated `.png` files.

> **Note:** Keep the Docker image version in this command in sync with the `image:` in the `e2e_tests` CI job in `.gitlab-ci.yml`.

### Running snapshot tests locally on macOS

You can still run the tests locally — visual snapshot assertions will fail due to the OS difference, but all functional assertions (network requests, visibility, etc.) will still work. Use the HTML report to inspect visual diffs:

```bash
npx playwright show-report
```

## CI

In CI, the dev server starts automatically (configured in `playwright.config.ts` under `webServer`). Tests run headless with 1 worker and 2 retries.
