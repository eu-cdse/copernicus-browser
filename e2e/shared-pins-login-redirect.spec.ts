import { test, expect } from '@playwright/test';
import { requireSsoCredentials, performKeycloakLogin } from './fixtures/helpers';
import { createSharedPinsPayload, stubSharedPinsBackend } from './fixtures/sharedPins';
import { HEAVY_TEST_TIMEOUT } from './fixtures/timeouts';

// Forces a genuinely fresh, unauthenticated context for this file only — overriding the
// `chromium` project's stored SSO storageState — while still being picked up by that project
// (and hence by CI's `npx playwright test --project=chromium`, see .gitlab/ci/main.yml). A
// `*.noauth.spec.ts` file would give the same fresh context, but is excluded from the `chromium`
// project (playwright.config.ts's `testIgnore`) and CI never runs `--project=chromium-no-auth`,
// so it would never actually execute. This is the only way to get real EnsureAuth + real
// Keycloak coverage running in CI.
test.use({ storageState: { cookies: [], origins: [] } });

// Regression coverage for the login-redirect case of #1184: shared-pins-import.spec.ts and
// shared-pins-import.noauth.spec.ts both only *simulate* "the Keycloak redirect round trip" with
// a same-origin page.goto() — neither drives a real Keycloak navigation. That gap is what let a
// real bug reach an account with RRD group membership: Tools.jsx unconditionally bounces such
// users to the "Order" tab on mount whenever no layerId is selected, which raced ahead of (and
// overrode) the Pins-panel switch — a completely different code path than the one this test
// exercises. This test's real Keycloak login account has no RRD rights (checked directly, no
// Order tab in the UI for it), so it can't reproduce the RRD case, but it still guards the
// original #1184 mechanism directly: does the `panel` URL param (see updatePath in utils/index.js
// and URLParamsParser's setStore, which dispatches panelSlice.actions.openPanel from it) actually
// survive a real, interactive Keycloak login redirect, not just a simulated one. It's a short param
// (unlike evalscript/processGraph/
// visualizationUrl), so openLogin/initKeycloak's long-param strip-and-restore dance in
// authHelpers.js never touches it — it round-trips natively via Keycloak's redirectUri.
//
// Login (unlike "Continue Anonymously") doesn't need reCAPTCHA, so — unlike the anonymous-consent
// path (see #1051, referenced in fixtures/helpers.ts) — a real click-through is automatable here.

const LOGIN_REDIRECT_LIST_ID = 'test-login-redirect-list';

const LOGIN_REDIRECT_PAYLOAD = createSharedPinsPayload('shared-pin-login-redirect', 'Login Redirect Pin');

test('accepting a shared-pins import then clicking Login lands on the Pins panel after the real Keycloak redirect (#1184)', async ({
  page,
}) => {
  test.setTimeout(HEAVY_TEST_TIMEOUT);

  const { username, password } = requireSsoCredentials();

  await stubSharedPinsBackend(page, LOGIN_REDIRECT_PAYLOAD);

  await page.goto(`/?sharedPinsListId=${LOGIN_REDIRECT_LIST_ID}`);

  // Scoped to the EnsureAuth modal specifically — a bare page.getByText('Log in', { exact: true })
  // ambiguously matches both this button and the always-visible header link (same component,
  // Auth/UserAuth.jsx, rendered twice), and picking the wrong one can hang the test.
  const loginButton = page.locator('.ensure-auth').getByText('Log in', { exact: true });
  await loginButton.waitFor({ state: 'visible', timeout: 15_000 });
  await loginButton.click();

  await page.waitForURL(/identity\.dataspace\.copernicus\.eu/, { timeout: 60_000 });
  await performKeycloakLogin(page, { username, password });

  await page.waitForURL(/localhost:3000/, { timeout: 30_000 });

  await expect(page.getByTitle('Pins Panel')).toHaveClass(/active/, { timeout: 30_000 });
  await expect(page.getByTitle('Layers Panel')).not.toHaveClass(/active/);
});
