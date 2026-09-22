import { test, expect } from '@playwright/test';
import { HEAVY_TEST_TIMEOUT, LIVE_REQUEST_TIMEOUT } from './fixtures/timeouts';
import { waitForStacSearch, waitForStacSearchResponse } from './fixtures/helpers';

// visualizationUrl is AES-encrypted (VITE_CDAS_ENCRYPT_SECRET) and points to the
// Sentinel Hub BYOC process API base URL. Decrypt with the app's secret to update.
const LANDSAT_MOSAIC_EUROPE_URL =
  '/?zoom=10&lat=48.85&lng=2.35&themeId=DEFAULT-THEME' +
  '&visualizationUrl=U2FsdGVkX1%2BZ%2BwqAJ%2B4Ni6PP0BxIJrFC2mz9vDUlnE9IPXYIXeZH1iWskVlgHK97GJohAOAgErY59cIgSsB%2BnGuK%2FbHUobv3itujVEgfW4Zu%2BxsDa1O8Ps%2BYl1gHQo3k' +
  '&datasetId=CDAS_LANDSAT_MOSAIC' +
  '&fromTime=2024-07-01T00%3A00%3A00.000Z&toTime=2024-07-31T23%3A59%3A59.999Z' +
  '&demSource3D=%22MAPZEN%22&cloudCoverage=30&dateMode=SINGLE';

test('Landsat Mosaic find products uses STAC and returns results', async ({ page }) => {
  // Nav + Keycloak SSO settle + STAC request/response chain can exceed the default 30s budget.
  test.setTimeout(HEAVY_TEST_TIMEOUT);

  await page.goto(LANDSAT_MOSAIC_EUROPE_URL);
  // The app performs a real Keycloak check-sso redirect through identity.dataspace.copernicus.eu
  // before anything renders, which combined with BYOC dataset bootstrap can exceed the default
  // 5s timeout under CI load even though the app always reaches this state.
  // Scoped to #visualization-tab because Leaflet's own layers-control also renders a
  // "Landsat Mosaics" label span inside #map, which would otherwise make the locator ambiguous.
  await expect(page.locator('#visualization-tab').getByText('Landsat Mosaics')).toBeVisible({
    timeout: 15000,
  });

  // The date panel is collapsed by default; expand it to reveal the Find Products button.
  // Best-effort: under some viewport/CI timing the panel may already be expanded, in which
  // case the toggle arrow isn't visible — only click it when it legitimately is.
  const dateToggle = page.locator('.visualization-time-select .title-arrow-wrapper');
  if (await dateToggle.isVisible().catch(() => false)) {
    await dateToggle.click();
  }

  // Register interceptors before the action that triggers the request.
  const stacRequest = waitForStacSearch(page);
  const stacResponse = waitForStacSearchResponse(page);

  await page.getByText('Find products for current view').click();

  await stacRequest;
  const resp = await stacResponse;
  const body = await resp.json();

  expect(body.features).toBeDefined();
  expect(body.features.length).toBeGreaterThan(0);

  // Thumbnails are referenced from the items' assets and served by
  // thumbnails.dataspace.copernicus.eu as public WMS GetMap requests.
  expect(body.features[0].assets?.thumbnail?.href).toBeTruthy();

  // The href is used directly as an <img src>, so a thumbnail must render in the results
  // list instead of the "No preview available" placeholder. Images are lazy-loaded, so
  // assert on the first result item only. The preview's alt text is the product name,
  // which the app derives from the STAC item's properties.title (falling back to its id).
  const firstProductName = body.features[0].properties?.title ?? body.features[0].id;
  const firstPreview = page.getByRole('img', { name: firstProductName });
  await expect(firstPreview).toBeVisible({ timeout: LIVE_REQUEST_TIMEOUT });
  await expect(firstPreview).toHaveAttribute('src', /thumbnails\.dataspace\.copernicus\.eu/);
});
