import { test, expect } from '@playwright/test';
import { dismissAnonymousSession } from './fixtures/helpers';
import {
  SHARED_PINS_LIST_ID,
  stubSharedPinsBackend,
  runSharedPinsImportAssertions,
} from './fixtures/sharedPins';

// Documents an intentional behaviour change made while investigating #1184: a per-tab
// sessionStorage guard (IMPORTED_SHARED_PINS_KEY/hasImportedSharedPins) was added to stop a shared
// pins list from being re-imported, on the assumption that sharedPinsListId could reappear in the
// URL via a page reload or a post-login Keycloak redirect. Direct testing disproved both: App.jsx's
// updatePath (src/utils/index.js) rewrites the entire query string from known state fields on every
// render, which strips sharedPinsListId from the visible URL within ~1ms of the initial mount — long
// before a reload or a real Keycloak redirect_uri could ever carry it. The only way sharedPinsListId
// reappears in the URL is a genuinely fresh navigation to the original share link (e.g. clicking the
// same message/email link a second time), which is a deliberate user action, not an accidental
// re-trigger. The guard was removed; re-clicking the link now shows the confirm dialog again, same
// as the first time, and importing it again is treated like any other intentional "add these pins"
// action (no dedup against existing pins, matching every other import path in Pin.utils.js).

test('re-navigating to the same shared-pins link asks again and imports a second copy', async ({ page }) => {
  await dismissAnonymousSession(page);
  await stubSharedPinsBackend(page);

  await page.goto(`/?sharedPinsListId=${SHARED_PINS_LIST_ID}`);
  await runSharedPinsImportAssertions(page);

  // Re-navigate to the exact same share link, as if the user clicked it again from the same chat
  // or email message. stubSharedPinsBackend's dialog listener (page.on, not page.once) is still
  // registered, so the confirm dialog fires again and is auto-accepted.
  await page.goto(`/?sharedPinsListId=${SHARED_PINS_LIST_ID}`);

  await expect(page.getByTitle('Pins Panel')).toHaveClass(/active/);
  await expect(page.locator('.pin-item')).toHaveCount(2);
});
