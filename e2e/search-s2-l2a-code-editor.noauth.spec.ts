import { test, expect } from '@playwright/test';
import { dismissAnonymousSession } from './fixtures/helpers';

test('search latest S2 L2A image and verify process graph is selected in code editor', async ({ page }) => {
  await page.goto('/');
  await dismissAnonymousSession(page);

  // Switch to Search tab
  await page.getByRole('listitem').getByText('Search', { exact: true }).click();

  // Select SENTINEL-2 and L2A sub-filter
  await page.getByRole('checkbox', { name: 'SENTINEL-2' }).check();
  await page.getByRole('checkbox', { name: 'L2A' }).check();

  // Register listener before triggering search
  const searchResponse = page.waitForResponse(
    (r) => r.url().includes('catalogue.dataspace.copernicus.eu/odata/v1/Products') && r.status() === 200,
  );
  await page.getByTitle('Search').click();
  await searchResponse;

  // Visualise the first (latest) result and wait for tiles to load before interacting further
  const tileResponse = page.waitForResponse(
    (r) => r.url().includes('openeosh.dataspace.copernicus.eu') && r.status() === 200,
  );
  await page.getByTitle('Visualise the latest acquisition for this day/location').first().click();
  await tileResponse;

  // Open the code editor
  await page.getByTitle('Show custom option').click();

  // Verify OpenEO process graph is selected by default
  await expect(page.getByRole('radio', { name: 'OpenEO process graph' })).toBeChecked();
});
