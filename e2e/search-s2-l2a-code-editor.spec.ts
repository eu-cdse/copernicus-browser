import { test, expect } from '@playwright/test';
import { HEAVY_TEST_TIMEOUT, LIVE_REQUEST_TIMEOUT } from './fixtures/timeouts';
import { ODATA_PRODUCTS_URL } from './fixtures/urls';

const OPENEO_RESULT_URL = 'openeosh.dataspace.copernicus.eu/1.2/result';

// Fresh products show up in OData search hours before they are ingested into Sentinel Hub. Visualising
// one of those is refused by the app ("not possible yet due to ingestion delay") and no tile request is
// ever issued, so the search is capped a few days back where every product is fully ingested.
const SEARCH_UNTIL_DAYS_AGO = 3;

test('search latest S2 L2A image and verify process graph is selected in code editor', async ({ page }) => {
  // Chains two live waits (OData search + openEO tile request), each with a 45s budget, so the
  // default test timeout could expire mid-way through the second one.
  test.setTimeout(HEAVY_TEST_TIMEOUT);

  await page.goto('/');

  // Switch to Search tab
  await page.getByRole('tab', { name: 'Search' }).click();

  // Select SENTINEL-2 and L2A sub-filter
  await page.getByRole('checkbox', { name: 'SENTINEL-2' }).check();
  await page.getByRole('checkbox', { name: 'L2A' }).check();

  // Move the end of the search time range back so the latest result is already ingested
  const searchUntil = new Date(Date.now() - SEARCH_UNTIL_DAYS_AGO * 24 * 60 * 60 * 1000)
    .toISOString()
    .slice(0, 10);
  const untilInput = page
    .locator('.select-time-range .date-time-input')
    .filter({ hasText: 'Until:' })
    .locator('input.date-picker-input');
  await untilInput.fill(searchUntil);
  await untilInput.press('Tab');
  await expect(untilInput).toHaveValue(searchUntil);

  // Register listener before triggering search
  const searchResponse = page.waitForResponse(
    (r) => r.url().includes(ODATA_PRODUCTS_URL) && r.status() === 200,
    { timeout: LIVE_REQUEST_TIMEOUT },
  );
  await page.getByTitle('Search').click();
  await searchResponse;

  // Visualise the first (latest) result. Only the routing matters here (the code editor default is
  // asserted below), so wait for the openEO tile request to be issued rather than for a 200. If the
  // app refuses to visualise the product it shows a notification and never issues the request, so
  // race against that notification to fail fast with a clear message instead of a 45s timeout.
  const tileRequest = page.waitForRequest((r) => r.url().includes(OPENEO_RESULT_URL), {
    timeout: LIVE_REQUEST_TIMEOUT,
  });
  const visualisationRefused = page.getByText(/Visualisation for this product is not possible/);
  await page.getByTitle('Visualise the latest acquisition for this day/location').first().click();
  const outcome = await Promise.race([
    tileRequest.then(
      () => 'requested',
      () => 'timeout',
    ),
    visualisationRefused.waitFor({ state: 'visible', timeout: LIVE_REQUEST_TIMEOUT }).then(
      () => 'refused',
      () => 'timeout',
    ),
  ]);
  expect(
    outcome,
    outcome === 'refused'
      ? `App refused to visualise the product: ${await visualisationRefused.textContent()}`
      : 'No openEO tile request was issued after clicking Visualise',
  ).toBe('requested');

  // Open the code editor
  await page.getByTitle('Show custom option').click();

  // Verify OpenEO process graph is selected by default
  await expect(page.getByRole('radio', { name: 'OpenEO process graph' })).toBeChecked();
});
