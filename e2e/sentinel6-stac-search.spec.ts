import { test, expect, Page } from '@playwright/test';
import { HEAVY_TEST_TIMEOUT } from './fixtures/timeouts';
import { selectSearchCheckboxPath, waitForStacSearch, waitForStacSearchResponse } from './fixtures/helpers';
import { ODATA_PRODUCTS_URL } from './fixtures/urls';

const selectAuxProductType = (page: Page, productType: string) =>
  selectSearchCheckboxPath(page, ['SENTINEL-6', 'Auxiliary Data File', productType]);

// Nav + Keycloak SSO settle + a live STAC request/response chain exceed the default 30s budget.
test.describe.configure({ timeout: HEAVY_TEST_TIMEOUT });

test.describe('Sentinel-6 aux search is routed to STAC', () => {
  test("searches only the ticked product type's collection, without a geometry filter", async ({ page }) => {
    await selectAuxProductType(page, 'AX____POE__AX');

    const stacRequest = waitForStacSearch(page);
    const stacResponse = waitForStacSearchResponse(page);
    await page.getByTitle('Search').click();
    const payload = (await stacRequest).postDataJSON();

    // Each aux product type lives in its own STAC collection; only the ticked one is queried.
    expect(payload.collections).toEqual(['sentinel-6-aux-poe']);
    const filter = JSON.stringify(payload.filter);
    expect(filter).toContain('AX____POE__AX');
    // Aux items are indexed with geometry: null, which never matches a spatial filter.
    expect(filter).not.toContain('s_intersects');

    // The backend returns aux products for this payload...
    const body = await (await stacResponse).json();
    expect(body.features.length).toBeGreaterThan(0);
    // ...and the results list renders them despite their null geometry.
    await expect(page.getByText(body.features[0].id).first()).toBeVisible();
  });

  test('Sentinel-6 aux no longer falls back to the OData Products endpoint', async ({ page }) => {
    await selectAuxProductType(page, 'AX____POE__AX');

    const odataRequests: string[] = [];
    page.on('request', (req) => {
      if (req.url().includes(ODATA_PRODUCTS_URL)) {
        odataRequests.push(req.url());
      }
    });

    const stacRequest = waitForStacSearch(page);
    await page.getByTitle('Search').click();
    await stacRequest;

    expect(odataRequests).toEqual([]);
  });
});
