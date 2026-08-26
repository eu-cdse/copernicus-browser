import { test, expect, Page } from '@playwright/test';
import { HEAVY_TEST_TIMEOUT } from './fixtures/timeouts';
import { waitForStacSearch, waitForStacSearchResponse } from './fixtures/helpers';
import { ODATA_PRODUCTS_URL } from './fixtures/urls';

// Navigates via the Search tab rather than a `visualizationUrl` deep link (as
// landsat-mosaic-find-products.spec.ts does): each mosaic layer has its own WMS instance id,
// so a deep link would need three separate AES ciphertexts encrypted with the app's own
// VITE_CDAS_ENCRYPT_SECRET. The Search tab reaches the same STAC search path through the
// Advanced Search form, using stable, human-readable labels instead.
async function selectMosaicProductType(page: Page, instrument: string, productType: string) {
  await page.goto('/');
  await page.getByRole('tab', { name: 'Search' }).click();
  await page.getByRole('checkbox', { name: 'Sentinel Mosaics', exact: true }).check();
  await page.getByRole('checkbox', { name: instrument, exact: true }).check();
  await page.getByRole('checkbox', { name: productType, exact: true }).check();
}

// Nav + Keycloak SSO settle + a live STAC request/response chain exceed the default 30s budget.
test.describe.configure({ timeout: HEAVY_TEST_TIMEOUT });

test.describe('Sentinel Mosaics search is routed to STAC', () => {
  test('Sentinel-1 IW searches the S1 mosaics collection, filtered to that product type', async ({
    page,
  }) => {
    await selectMosaicProductType(page, 'Sentinel-1', 'IW Monthly Mosaics');

    const stacRequest = waitForStacSearch(page);
    await page.getByTitle('Search').click();
    const payload = (await stacRequest).postDataJSON();

    expect(payload.collections).toEqual(['sentinel-1-global-mosaics']);
    // IW and DH mosaics share one STAC collection, so without the product:type filter an
    // IW search would also return DH products.
    const filter = JSON.stringify(payload.filter);
    expect(filter).toContain('S1SAR_L3_IW_MCM');
    expect(filter).not.toContain('S1SAR_L3_DH_MCM');
  });

  test('Sentinel-1 DH searches the same collection, filtered to the DH product type', async ({ page }) => {
    await selectMosaicProductType(page, 'Sentinel-1', 'DH Monthly Mosaics');

    const stacRequest = waitForStacSearch(page);
    await page.getByTitle('Search').click();
    const payload = (await stacRequest).postDataJSON();

    expect(payload.collections).toEqual(['sentinel-1-global-mosaics']);
    const filter = JSON.stringify(payload.filter);
    expect(filter).toContain('S1SAR_L3_DH_MCM');
    expect(filter).not.toContain('S1SAR_L3_IW_MCM');
  });

  test('Sentinel-2 quarterly mosaics search the S2 mosaics collection', async ({ page }) => {
    await selectMosaicProductType(page, 'Sentinel-2', 'Quarterly Mosaics');

    const stacRequest = waitForStacSearch(page);
    const stacResponse = waitForStacSearchResponse(page);
    await page.getByTitle('Search').click();
    const payload = (await stacRequest).postDataJSON();

    expect(payload.collections).toEqual(['sentinel-2-global-mosaics']);
    expect(JSON.stringify(payload.filter)).toContain('S2MSI_L3__MCQ');

    // The STAC backend accepts the payload the new config produces.
    await stacResponse;
  });

  test('Sentinel Mosaics no longer falls back to the OData Products endpoint', async ({ page }) => {
    await selectMosaicProductType(page, 'Sentinel-1', 'IW Monthly Mosaics');

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
