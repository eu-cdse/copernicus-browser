import { Page, expect } from '@playwright/test';
import { UI_ASSERTION_TIMEOUT } from './timeouts';

// Shared fixtures for the #1184 shared-pins-import regression specs (shared-pins-import.spec.ts,
// shared-pins-import.noauth.spec.ts, shared-pins-login-redirect.spec.ts).

export function createSharedPinsPayload(pinId: string, title: string) {
  return {
    items: [
      {
        _id: pinId,
        title,
        themeId: 'theme-1',
        datasetId: '',
        visualizationUrl: '',
        lat: 1,
        lng: 2,
        zoom: 3,
      },
    ],
  };
}

export const SHARED_PINS_LIST_ID = 'test-list';
export const SHARED_PINS_PIN_TITLE = 'Shared Pin One';
export const SHARED_PINS_PAYLOAD = createSharedPinsPayload('shared-pin-1', SHARED_PINS_PIN_TITLE);

/**
 * Routes the sharedpins GET and auto-accepts the import confirm dialog. Shared by the simulated
 * redirect specs; the real-Keycloak-redirect spec passes its own payload with a distinct
 * sharedPinsListId/pin id to avoid colliding with the other two.
 */
export async function stubSharedPinsBackend(page: Page, payload: unknown = SHARED_PINS_PAYLOAD) {
  await page.route('**/sharedpins/**', (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(payload),
    }),
  );
  page.on('dialog', (dialog) => dialog.accept());
}

/**
 * Shared assertion sequence for shared-pins-import.spec.ts and shared-pins-import.noauth.spec.ts:
 * the import landed on the Pins panel and stripped sharedPinsListId from the URL in favour of the
 * `panel` URL param (see updatePath in src/utils/index.js), which survives an arbitrary number of
 * reloads — this is `updatePath`'s ordinary query-string rebuild on every render, not anything
 * shared-pins-specific, and it removes `sharedPinsListId` from the visible URL well before a
 * reload or a login redirect could ever carry it back (verified directly: the real Keycloak
 * redirect_uri never contains it). There is deliberately no consume-once guard any more — see
 * shared-pins-reimport.noauth.spec.ts for the re-navigation behaviour that guard used to suppress.
 */
export async function runSharedPinsImportAssertions(page: Page) {
  await expect(page.getByText(SHARED_PINS_PIN_TITLE, { exact: false })).toBeVisible({
    timeout: UI_ASSERTION_TIMEOUT,
  });

  await expect(page.getByTitle('Pins Panel')).toHaveClass(/active/);
  await expect(page.getByTitle('Layers Panel')).not.toHaveClass(/active/);

  expect(new URL(page.url()).searchParams.has('sharedPinsListId')).toBe(false);
  expect(new URL(page.url()).searchParams.get('panel')).toBe('pins');

  // The panel choice is re-derived from the `panel` URL param on every mount (not consumed once
  // like the old sessionStorage flag), so it must survive reloading more than once.
  await page.reload();
  await expect(page.getByTitle('Pins Panel')).toHaveClass(/active/, { timeout: UI_ASSERTION_TIMEOUT });

  await page.reload();
  await expect(page.getByTitle('Pins Panel')).toHaveClass(/active/, { timeout: UI_ASSERTION_TIMEOUT });

  await expect(page.locator('.pin-item')).toHaveCount(1);
}
