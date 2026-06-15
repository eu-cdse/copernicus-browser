import { test, expect } from '@playwright/test';
import { CODE_EDITOR_URLS } from './fixtures/urls';

const OPENEO_RESULT_URL = 'openeosh.dataspace.copernicus.eu/1.2/result';

/**
 * Verifies that downloads for two different openEO layers each fire a fresh
 * network request and carry distinct process graphs. Guards against accidental
 * request-body caching that would serve a stale image for a different layer.
 */
test('downloads for two different openEO layers each fire a fresh network request with distinct process graphs', async ({
  page,
}) => {
  test.setTimeout(90000);

  // --- Layer A: True Color, Northern Italy, January 2026 ---
  const tilesA = page.waitForResponse((r) => r.url().includes(OPENEO_RESULT_URL) && r.status() === 200);
  await page.goto(CODE_EDITOR_URLS.s2L2aTrueColor);
  await tilesA;

  await page.getByTitle(/Download image/).click();
  await expect(page.locator('.image-download')).toBeVisible({ timeout: 10000 });

  const [reqA] = await Promise.all([
    page.waitForRequest((r) => r.method() === 'POST' && r.url().includes(OPENEO_RESULT_URL), { timeout: 30000 }),
    page.getByText('Download', { exact: true }).click(),
  ]);
  await page.waitForLoadState('networkidle');
  const graphA = reqA.postDataJSON().process.process_graph;

  // --- Layer B: NDSI, Kranjska Gora, March 2026 ---
  // Tiles for this layer are cached at a different url+hash key than layer A.
  // waitForRequest below verifies a fresh network request is fired (not served from cache).
  const tilesB = page.waitForResponse((r) => r.url().includes(OPENEO_RESULT_URL) && r.status() === 200);
  await page.goto(CODE_EDITOR_URLS.s2L2aNDSIKranjskaGora);
  await tilesB;

  await page.getByTitle(/Download image/).click();
  await expect(page.locator('.image-download')).toBeVisible({ timeout: 10000 });

  const [reqB] = await Promise.all([
    page.waitForRequest((r) => r.method() === 'POST' && r.url().includes(OPENEO_RESULT_URL), { timeout: 30000 }),
    page.getByText('Download', { exact: true }).click(),
  ]);
  const graphB = reqB.postDataJSON().process.process_graph;

  // Both downloads must fire real network requests (waitForRequest above would time out
  // if either was served from cache) and carry distinct process graphs.
  expect(JSON.stringify(graphA)).not.toBe(JSON.stringify(graphB));
});
