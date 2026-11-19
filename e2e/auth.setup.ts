import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';
import { requireSsoCredentials, performKeycloakLogin } from './fixtures/helpers';
import { OPENEO_API_URL, SH_PROCESS_API_URL } from './fixtures/urls';
import { BACKEND_PROBE_TIMEOUT } from './fixtures/timeouts';

const __dirname = dirname(fileURLToPath(import.meta.url));
const authDir = path.join(__dirname, '.auth');
const authFile = path.join(authDir, 'user.json');

// Ensure the .auth directory and a valid (empty) storage state file exist
// so that storageState in playwright.config.ts never hits ENOENT.
fs.mkdirSync(authDir, { recursive: true });
if (!fs.existsSync(authFile)) {
  fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }));
}

// Fail fast when the live backend is down: the authenticated specs all depend on Sentinel Hub
// and/or openEO, so if either is unreachable they would each time out instead of testing anything.
// A failing setup test makes Playwright skip every dependent `chromium` test.
// The requests are unauthenticated on purpose: a 4xx (e.g. 401) still proves the service is up;
// only a network error, a timeout or a 5xx counts as down.
setup('backend availability', async ({ request }) => {
  const probes: Array<{ name: string; send: () => ReturnType<typeof request.get> }> = [
    {
      name: 'openEO',
      send: () => request.get(OPENEO_API_URL, { timeout: BACKEND_PROBE_TIMEOUT, failOnStatusCode: false }),
    },
    {
      name: 'Sentinel Hub Processing API',
      send: () =>
        request.post(SH_PROCESS_API_URL, {
          data: {},
          timeout: BACKEND_PROBE_TIMEOUT,
          failOnStatusCode: false,
        }),
    },
  ];

  // Probe in parallel so the worst case (both hanging) is one BACKEND_PROBE_TIMEOUT, not two.
  const results = await Promise.all(
    probes.map(async (probe): Promise<string | null> => {
      try {
        const response = await probe.send();
        return response.status() >= 500 ? `${probe.name} (HTTP ${response.status()})` : null;
      } catch (error) {
        return `${probe.name} (${(error as Error).message.split('\n')[0]})`;
      }
    }),
  );
  const down = results.filter((result): result is string => result !== null);

  expect(down, `Backend unavailable: ${down.join(', ')} — skipping authenticated e2e tests`).toEqual([]);
});

setup('authenticate via SSO', async ({ page }) => {
  const { username, password } = requireSsoCredentials();

  // Step 1: Go to the app and trigger login
  await page.goto('/');

  await page.getByText('Log in', { exact: true }).first().click();
  // Clicking "Log in" hands off to Keycloak via a full-page redirect. Assert the
  // redirect actually happens before interacting with the Keycloak form, so a
  // non-navigating click fails here with a clear message instead of timing out
  // later on the Email field.
  await page.waitForURL(/identity\.dataspace\.copernicus\.eu/, { timeout: 60_000 });
  await performKeycloakLogin(page, { username, password });

  // Authoritative login-success signal (the consent click above is best-effort).
  await expect(page.getByText('FE-Team Test Account')).toBeVisible({ timeout: 30_000 });

  // Turn the onboarding tour off in the saved state explicitly. Otherwise it is only turned off if
  // the best-effort "Don't show again" click in performKeycloakLogin happens to land within its
  // 3s window; when it doesn't (slow CI), every authenticated test inherits a state without this
  // flag and the Joyride overlay intercepts all of its clicks. Same key/value as
  // dismissAnonymousSession (SHOW_TUTORIAL_LC in src/const.ts).
  await page.evaluate(() => localStorage.setItem('cdsebrowser_show_tutorial', 'false'));

  // Step 5: Save the authenticated browser state
  await page.context().storageState({ path: authFile });
});
