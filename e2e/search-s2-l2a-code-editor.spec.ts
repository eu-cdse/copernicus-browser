import { test, expect } from '@playwright/test';
import { LIVE_REQUEST_TIMEOUT } from './fixtures/timeouts';
import { ODATA_PRODUCTS_URL } from './fixtures/urls';

const OPENEO_RESULT_URL = 'openeosh.dataspace.copernicus.eu/1.2/result';

test('search latest S2 L2A image and verify process graph is selected in code editor', async ({ page }) => {
  // Cold openEO tile load under single-worker CI; the default 30s budget is too tight.
  test.setTimeout(60_000);

  await page.goto('/');

  // Switch to Search tab
  await page.getByRole('tab', { name: 'Search' }).click();

  // Select SENTINEL-2 and L2A sub-filter
  await page.getByRole('checkbox', { name: 'SENTINEL-2' }).check();
  await page.getByRole('checkbox', { name: 'L2A' }).check();

  // Register listener before triggering search
  const searchResponse = page.waitForResponse(
    (r) => r.url().includes(ODATA_PRODUCTS_URL) && r.status() === 200,
    { timeout: LIVE_REQUEST_TIMEOUT },
  );
  await page.getByTitle('Search').click();
  await searchResponse;

  // Visualise the first (latest) result and wait for tiles to load before interacting further
  const tileResponse = page.waitForResponse(
    (r) => r.url().includes(OPENEO_RESULT_URL) && r.status() === 200,
    {
      timeout: LIVE_REQUEST_TIMEOUT,
    },
  );
  await page.getByTitle('Visualise the latest acquisition for this day/location').first().click();
  await tileResponse;

  // Open the code editor
  await page.getByTitle('Show custom option').click();

  // Verify OpenEO process graph is selected by default
  await expect(page.getByRole('radio', { name: 'OpenEO process graph' })).toBeChecked();
});
