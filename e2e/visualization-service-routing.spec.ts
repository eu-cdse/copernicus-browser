import { test, expect } from '@playwright/test';
import { CODE_EDITOR_URLS } from './fixtures/urls';

// this tests will load a Sentinel-2 image and check if openEO results requests are made
// we then switch to custom script and check if the correct request is made, then we test the compare view and check if process api is used
// following this we add 2 layers to compare and check if the compare view is rendered correctly with a screenshot
test('test correct service is used with compare', async ({ page }) => {
  // Register listener before navigation so we don't miss the response
  const openEOResponse = page.waitForResponse(
    (resp) =>
      resp.url().includes('https://openeosh.dataspace.copernicus.eu/1.2/result') && resp.status() === 200,
  );
  await page.goto(CODE_EDITOR_URLS.s2L2aTrueColor);
  // Assert default requests are using openEO
  await openEOResponse;

  await page.getByTitle('Show custom option').click();

  // Register listener before the action that triggers the request
  const evalscriptResponse = page.waitForResponse(
    (resp) => resp.url().includes('/api/v1/process') && resp.status() === 200,
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
  await page.getByTitle('Compare Panel').click();

  // Move the sliders to create a visible split for the screenshot.
  // With 2 layers in split mode there are 4 handles (2 per layer):
  //   nth(0) = layer 1 left handle, nth(1) = layer 1 right handle
  //   nth(2) = layer 2 left handle, nth(3) = layer 2 right handle
  const layer1LeftHandle = page.getByRole('slider').nth(0);
  await layer1LeftHandle.focus();
  for (let i = 0; i < 50; i++) {
    await layer1LeftHandle.press('ArrowRight'); // move to ~0.80
  }

  await page.waitForLoadState('networkidle');
  await expect(page.locator('.leaflet-container')).toHaveScreenshot('compare-view.png', {
    maxDiffPixelRatio: 0.02,
  });
});
