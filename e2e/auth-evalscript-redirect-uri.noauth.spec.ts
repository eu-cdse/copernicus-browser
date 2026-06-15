import { test, expect, type Page } from '@playwright/test';
import { CODE_EDITOR_URLS } from './fixtures/urls';

// TRUE-COLOR-CLOUDLESS process graph from src/assets/cache/processGraphs/65330d33-2294-4a71-83a9-7428fdc4157b.json
// encoded with b64EncodeUnicode (the same encoding the app uses when writing the URL param).
const PROCESS_GRAPH_B64 =
  'eyJsb2FkY29sbGVjdGlvbiI6eyJwcm9jZXNzX2lkIjoibG9hZF9jb2xsZWN0aW9uIiwiYXJndW1lbnRzIjp7ImlkIjoiYnlvYy02NWQ0YWY4OS01Y2U1LTQ2OGUtYmJiZS04YTJmZDllZmFjY2MiLCJzcGF0aWFsX2V4dGVudCI6e30sInRlbXBvcmFsX2V4dGVudCI6bnVsbCwiYmFuZHMiOlsiQjA0IiwiQjAzIiwiQjAyIl0sInVwc2FtcGxpbmciOiJCSUNVQklDIiwiZG93bnNhbXBsaW5nIjoiQklDVUJJQyJ9fSwic2F2ZSI6eyJwcm9jZXNzX2lkIjoic2F2ZV9yZXN1bHQiLCJhcmd1bWVudHMiOnsiZGF0YSI6eyJmcm9tX25vZGUiOiJ0cnVlQ29sb3IifSwiZm9ybWF0IjoicG5nIn0sInJlc3VsdCI6dHJ1ZX0sImFwcGx5MSI6eyJwcm9jZXNzX2lkIjoiYXBwbHkiLCJhcmd1bWVudHMiOnsiZGF0YSI6eyJmcm9tX25vZGUiOiJsb2FkY29sbGVjdGlvbiJ9LCJwcm9jZXNzIjp7InByb2Nlc3NfZ3JhcGgiOnsiZGl2aWRlMSI6eyJwcm9jZXNzX2lkIjoiZGl2aWRlIiwiYXJndW1lbnRzIjp7IngiOnsiZnJvbV9wYXJhbWV0ZXIiOiJ4In0sInkiOjEwMDAwfSwicmVzdWx0Ijp0cnVlfX19fX0sInRydWVDb2xvciI6eyJwcm9jZXNzX2lkIjoidHJ1ZV9jb2xvciIsImFyZ3VtZW50cyI6eyJkYXRhIjp7ImZyb21fbm9kZSI6ImFwcGx5MSJ9LCJtYXhSIjozLCJtaWRSIjowLjEzLCJzYXQiOjEuMiwiZ2FtbWEiOjEuOCwiZ09mZiI6MC4wMSwicmVkIjoiQjA0IiwiZ3JlZW4iOiJCMDMiLCJibHVlIjoiQjAyIn19fQ==';

function waitForKeycloakAuthRequest(page: Page) {
  return page.waitForRequest(
    (req) =>
      req.url().includes('identity.dataspace.copernicus.eu') &&
      req.url().includes('protocol/openid-connect/auth'),
    { timeout: 15000 },
  );
}

test('evalscript and visualizationUrl are stripped from Keycloak redirect_uri on page load', async ({
  page,
}) => {
  const keycloakAuthRequest = waitForKeycloakAuthRequest(page);
  await page.goto(CODE_EDITOR_URLS.customScript);

  const redirectUri = new URL((await keycloakAuthRequest).url()).searchParams.get('redirect_uri');
  expect(redirectUri).not.toBeNull();
  expect(redirectUri).not.toContain('evalscript');
  expect(redirectUri).not.toContain('visualizationUrl');

  // dismissAnonymousSession is intentionally omitted — the Keycloak auth request fires during
  // initKeycloak(), before AuthProvider unblocks the UI, so there is no consent modal to dismiss
  // yet. Calling it here would introduce a race against the Keycloak redirect itself.
  await expect(page.getByText('Anonymously', { exact: true })).toBeVisible({ timeout: 15000 });
});

test('evalscript and visualizationUrl are stripped from Keycloak redirect_uri on login', async ({ page }) => {
  await page.goto(CODE_EDITOR_URLS.customScript);
  await expect(page.getByText('Anonymously', { exact: true })).toBeVisible({ timeout: 15000 });

  const loginAuthRequest = waitForKeycloakAuthRequest(page);
  await page.locator('.ensure-auth').getByText('Log in', { exact: true }).click();

  const redirectUri = new URL((await loginAuthRequest).url()).searchParams.get('redirect_uri');
  expect(redirectUri).not.toBeNull();
  expect(redirectUri).not.toContain('evalscript');
  expect(redirectUri).not.toContain('visualizationUrl');
});

test('processGraph is stripped from Keycloak redirect_uri on page load', async ({ page }) => {
  // Append a processGraph param to an existing URL — the content doesn't matter,
  // we only check that the param is absent from the redirect_uri sent to Keycloak.
  // dismissAnonymousSession is intentionally omitted — see the evalscript page-load test above.
  const url = `${CODE_EDITOR_URLS.s2L2aTrueColor}&processGraph=${PROCESS_GRAPH_B64}`;

  const keycloakAuthRequest = waitForKeycloakAuthRequest(page);
  await page.goto(url);

  const redirectUri = new URL((await keycloakAuthRequest).url()).searchParams.get('redirect_uri');
  expect(redirectUri).not.toBeNull();
  expect(redirectUri).not.toContain('processGraph');

  await expect(page.getByText('Anonymously', { exact: true })).toBeVisible({ timeout: 15000 });
});

test('processGraph is stripped from Keycloak redirect_uri on login', async ({ page }) => {
  const url = `${CODE_EDITOR_URLS.s2L2aTrueColor}&processGraph=${PROCESS_GRAPH_B64}`;

  await page.goto(url);
  await expect(page.getByText('Anonymously', { exact: true })).toBeVisible({ timeout: 15000 });

  const loginAuthRequest = waitForKeycloakAuthRequest(page);
  await page.locator('.ensure-auth').getByText('Log in', { exact: true }).click();

  const redirectUri = new URL((await loginAuthRequest).url()).searchParams.get('redirect_uri');
  expect(redirectUri).not.toBeNull();
  expect(redirectUri).not.toContain('processGraph');
});
