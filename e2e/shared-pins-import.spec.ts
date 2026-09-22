import { test, expect } from '@playwright/test';
import { mockUserPinsBackend } from './fixtures/helpers';
import {
  SHARED_PINS_LIST_ID,
  stubSharedPinsBackend,
  runSharedPinsImportAssertions,
} from './fixtures/sharedPins';

// Authenticated counterpart to shared-pins-import.noauth.spec.ts. Runs under the `chromium`
// project with the stored SSO session, so the user is already logged in when the app mounts.
// EnsureAuth's modal condition (`!(anonToken || user || tokenRefreshInProgress)`) is false from
// the very first paint, so — unlike the anonymous flow — there is no consent modal to click
// through: opening a shared-pins link while logged in must land directly on the Pins panel.
//
// The logged-in path saves imported pins via savePinsToServer (userpins backend), so that backend
// is mocked with mockUserPinsBackend the same way userexternalservers is mocked in
// external-wms-backend-sync.spec.ts — deterministic, and it doesn't leave test data behind on the
// real FE-Team Test Account.

test('opening a shared-pins link while logged in lands directly on the Pins panel (#1184)', async ({
  page,
}) => {
  await mockUserPinsBackend(page, []);
  await stubSharedPinsBackend(page);

  await page.goto(`/?sharedPinsListId=${SHARED_PINS_LIST_ID}`);

  // No consent modal for an already-authenticated session — the import runs immediately, with
  // nothing in front of it to click through first.
  await expect(
    page.getByText('To continue browsing, please log in or continue anonymously.'),
  ).not.toBeVisible();

  await runSharedPinsImportAssertions(page);
});
