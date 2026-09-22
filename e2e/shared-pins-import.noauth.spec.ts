import { test } from '@playwright/test';
import { dismissAnonymousSession } from './fixtures/helpers';
import {
  SHARED_PINS_LIST_ID,
  stubSharedPinsBackend,
  runSharedPinsImportAssertions,
} from './fixtures/sharedPins';

// Regression coverage for #1184: opening a shared-pins link imported the pins correctly, but the
// app landed on the Visualise layer panel instead of the Pins panel. Root cause was two-fold:
// App.jsx called a bare `this.setState({ showPinPanel: true })` instead of `setShowPinPanel(true)`
// (the only setter that clears the other panel flags), and ThemeSelect.jsx ran an unconditional
// effect on mount that force-switched back to the Layers panel, racing the async pins import.
//
// The anonymous path uses saveLocalPins (sessionStorage), so this test never depends on the live
// VITE_CDSE_BACKEND — only the `sharedpins` GET is stubbed.

test('accepting a shared-pins import shows the Pins panel, not the layer panel (#1184)', async ({ page }) => {
  await dismissAnonymousSession(page);
  await stubSharedPinsBackend(page);

  await page.goto(`/?sharedPinsListId=${SHARED_PINS_LIST_ID}`);

  await runSharedPinsImportAssertions(page);
});
