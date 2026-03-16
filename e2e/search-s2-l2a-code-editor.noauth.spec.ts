import { test, expect } from '@playwright/test';

test('search latest S2 L2A image and verify process graph is selected in code editor', async ({ page }) => {
  await page.goto('/');

  // Dismiss consent modal — wait for it to appear first (Keycloak silent SSO redirect may delay it)
  await page.getByText('Anonymously', { exact: true }).waitFor({ state: 'visible' });
  await page.getByText('Anonymously', { exact: true }).click();
  await page.getByText('Anonymously', { exact: true }).waitFor({ state: 'hidden' });

  // Dismiss onboarding tour if present — use waitFor so we don't race against mount
  try {
    const tourButton = page.getByRole('button', { name: "Don't show again" });
    await tourButton.waitFor({ state: 'visible', timeout: 3000 });
    await tourButton.click();
  } catch {
    // tour already dismissed or not shown in this session
  }

  // Switch to Search tab
  await page.locator('.tab-list').getByText('Search', { exact: true }).click();

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
