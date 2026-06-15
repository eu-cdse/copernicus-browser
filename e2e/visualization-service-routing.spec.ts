import { test, expect } from '@playwright/test';
import { CODE_EDITOR_URLS } from './fixtures/urls';

const OPENEO_RESULT_URL = 'openeosh.dataspace.copernicus.eu/1.2/result';
const SH_PROCESS_URL = '/api/v1/process';

// this tests will load a Sentinel-2 image and check if openEO results requests are made
// we then switch to custom script and check if the correct request is made, then we test the compare view and check if process api is used
// following this we add 2 layers to compare and check if the compare view is rendered correctly with a screenshot
test('test correct service is used with compare', async ({ page }) => {
  // Heavy multi-step test (nav + two API waits + 2 compare layers + slider + screenshot).
  // The default 30s budget is too tight under single-worker CI, so give it headroom.
  test.setTimeout(60_000);

  // Register listener before navigation so we don't miss the response
  const openEOResponse = page.waitForResponse(
    (resp) => resp.url().includes(OPENEO_RESULT_URL) && resp.status() === 200,
  );
  await page.goto(CODE_EDITOR_URLS.s2L2aTrueColor);
  // Assert default requests are using openEO
  await openEOResponse;

  await page.getByTitle('Show custom option').click();

  // Register listener before the action that triggers the request
  const evalscriptResponse = page.waitForResponse(
    (resp) => resp.url().includes(SH_PROCESS_URL) && resp.status() === 200,
  );
  await page.getByRole('radio', { name: 'Custom script' }).check();
  await evalscriptResponse;

  await page.getByText('Back', { exact: true }).click();
  await page.getByText('True color').click();
  await page.getByTitle('Add to').click();
  await page.getByText('Add to Compare').click();
  await page.getByText('False color', { exact: true }).click();
  await page.getByText('Add to Compare').click();
  await expect(page.getByText('2', { exact: true })).toBeVisible();

  // Register listener before the compare panel opens so we don't miss the tile response
  const compareTiles = page.waitForResponse(
    (resp) => resp.url().includes(OPENEO_RESULT_URL) && resp.status() === 200,
  );
  await page.getByTitle('Compare Panel').click();

  // Move the sliders to create a visible split for the screenshot.
  // With 2 layers in split mode there are 4 handles (2 per layer):
  //   nth(0) = layer 1 left handle, nth(1) = layer 1 right handle
  //   nth(2) = layer 2 left handle, nth(3) = layer 2 right handle
  // The slider is an rc-slider controlled via Redux with no window-exposed store,
  // so value injection via JS is not available — keyboard stepping is the deterministic anchor.
  const layer1LeftHandle = page.getByRole('slider').nth(0);
  await layer1LeftHandle.focus();
  // Send keys via page.keyboard rather than layer1LeftHandle.press(...): the handle
  // keeps focus, so we skip per-iteration locator resolution + actionability checks
  // (which are slow while the compare view re-renders tiles after each step).
  for (let i = 0; i < 50; i++) {
    await page.keyboard.press('ArrowRight'); // move to ~0.80
  }

  await compareTiles;
  await expect(page.locator('.leaflet-container')).toHaveScreenshot('compare-view.png', {
    maxDiffPixelRatio: 0.02,
    animations: 'disabled',
    timeout: 15000,
  });
});
