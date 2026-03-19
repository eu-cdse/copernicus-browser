import { test, expect, Page } from '@playwright/test';
import { dismissAnonymousSession } from './fixtures/helpers';

async function setupSearchTab(page: Page) {
  await page.goto('/');
  await dismissAnonymousSession(page);
  await page.getByRole('listitem').getByText('Search', { exact: true }).click();
  await page.getByRole('checkbox', { name: 'Complementary Data' }).check();
}

test('TERRA MODIS product types are available in search tab', async ({ page }) => {
  await setupSearchTab(page);

  // TERRA collection should be visible under Complementary Data
  await expect(page.getByRole('checkbox', { name: 'TERRA', exact: true })).toBeVisible();

  // Expand TERRA
  await page.getByRole('checkbox', { name: 'TERRA', exact: true }).check();

  // MODIS instrument should appear
  await expect(page.getByRole('checkbox', { name: 'MODIS' })).toBeVisible();

  // Expand MODIS instrument
  await page.getByRole('checkbox', { name: 'MODIS' }).check();

  // Verify TERRA product types are visible
  await expect(
    page.getByRole('checkbox', { name: 'Gross Primary Productivity 8-Day Global 500m' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Gross Primary Productivity Gap-Filled 8-Day Global 500m' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Land Surface Temperature/Emissivity Daily Global 1km' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Land Surface Temperature/Emissivity 8-Day Global 1km' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Land Surface Temperature/3-Band Emissivity 8-Day Global 1km' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Leaf Area Index/FPAR 8-Day Global 500m', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Net Evapotranspiration Gap-Filled 8-Day Global 500m' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Net Evapotranspiration Gap-Filled Yearly Global 500m' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Net Primary Production Gap-Filled Yearly Global 500m' }),
  ).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Snow Cover Daily Global 500m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Snow Cover 8-Day Global 500m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Surface Reflectance 8-Day Global 250m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Surface Reflectance 8-Day Global 500m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Thermal Anomalies/Fire Daily Global 1km' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Thermal Anomalies/Fire 8-Day Global 1km' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Vegetation Indices 16-Day Global 250m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Vegetation Indices 16-Day Global 500m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Vegetation Indices 16-Day Global 1km' })).toBeVisible();
});

test('AQUA MODIS product types are available in search tab', async ({ page }) => {
  await setupSearchTab(page);

  // AQUA collection should be visible under Complementary Data
  await expect(page.getByRole('checkbox', { name: 'AQUA', exact: true })).toBeVisible();

  // Expand AQUA
  await page.getByRole('checkbox', { name: 'AQUA', exact: true }).check();

  // MODIS instrument should appear
  await expect(page.getByRole('checkbox', { name: 'MODIS' })).toBeVisible();

  // Expand MODIS instrument
  await page.getByRole('checkbox', { name: 'MODIS' }).check();

  // Verify AQUA product types are visible
  await expect(
    page.getByRole('checkbox', { name: 'Gross Primary Productivity 8-Day Global 500m' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Gross Primary Productivity Gap-Filled 8-Day Global 500m' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Land Surface Temperature/Emissivity Daily Global 1km' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Land Surface Temperature/Emissivity 8-Day Global 1km' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Land Surface Temperature/3-Band Emissivity 8-Day Global 1km' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Leaf Area Index/FPAR 8-Day Global 500m', exact: true }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Net Evapotranspiration Gap-Filled Yearly Global 500m' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Net Primary Production Gap-Filled Yearly Global 500m' }),
  ).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Snow Cover Daily Global 500m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Snow Cover 8-Day Global 500m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Surface Reflectance 8-Day Global 250m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Surface Reflectance 8-Day Global 500m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Thermal Anomalies/Fire Daily Global 1km' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Thermal Anomalies/Fire 8-Day Global 1km' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Vegetation Indices 16-Day Global 250m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Vegetation Indices 16-Day Global 500m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Vegetation Indices 16-Day Global 1km' })).toBeVisible();
});

test('TERRAAQUA MODIS product types are available in search tab', async ({ page }) => {
  await setupSearchTab(page);

  // TERRAAQUA collection should be visible under Complementary Data
  await expect(page.getByRole('checkbox', { name: 'TERRAAQUA', exact: true })).toBeVisible();

  // Expand TERRAAQUA
  await page.getByRole('checkbox', { name: 'TERRAAQUA', exact: true }).check();

  // MODIS instrument should appear
  await expect(page.getByRole('checkbox', { name: 'MODIS' })).toBeVisible();

  // Expand MODIS instrument
  await page.getByRole('checkbox', { name: 'MODIS' }).check();

  // Verify TERRAAQUA product types are visible (all 5)
  await expect(
    page.getByRole('checkbox', { name: 'BRDF/Albedo Nadir BRDF-Adjusted Daily Global 500m' }),
  ).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Direct Broadcast Burned Area Monthly Global 500m' }),
  ).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Land Cover Type Yearly Global 500m' })).toBeVisible();
  await expect(page.getByRole('checkbox', { name: 'Leaf Area Index/FPAR 4-Day Global 500m' })).toBeVisible();
  await expect(
    page.getByRole('checkbox', { name: 'Leaf Area Index/FPAR 8-Day Global 500m', exact: true }),
  ).toBeVisible();
});

test('searching TERRA MODIS products sends correct OData request', async ({ page }) => {
  await setupSearchTab(page);

  // Select TERRA → MODIS → first product type
  await page.getByRole('checkbox', { name: 'TERRA', exact: true }).check();
  await page.getByRole('checkbox', { name: 'MODIS' }).check();
  await page.getByRole('checkbox', { name: 'Gross Primary Productivity 8-Day Global 500m' }).check();

  // Register listener before triggering search
  const searchResponse = page.waitForResponse(
    (r) => r.url().includes('catalogue.dataspace.copernicus.eu/odata/v1/Products') && r.status() === 200,
  );
  await page.getByTitle('Search').click();
  const response = await searchResponse;

  // Verify the OData request targets the TERRA collection with the correct product type filter
  const url = decodeURIComponent(response.url());
  expect(url).toContain('TERRA');
  expect(url).toContain('MOD17A2H.061');
});
