import { test, expect } from '@playwright/test';
import { dismissAnonymousSession } from './fixtures/helpers';
import { CODE_EDITOR_URLS } from './fixtures/urls';

const NDSI_URL = CODE_EDITOR_URLS.s2L2aNDSIKranjskaGora;

test('NDSI layer over Kranjska Gora — open image download dialog and download image', async ({
  page,
}) => {
  await page.goto(NDSI_URL);

  try {
    await dismissAnonymousSession(page);
  } catch {
    // Authenticated session — modal not shown.
  }

  // Wait for the Download image button to be visible — this confirms the app has fully
  // loaded and the visualization is active.
  await page.getByTitle(/Download image/).waitFor({ state: 'visible' });
  await page.getByTitle(/Download image/).click();

  await expect(page.locator('.image-download')).toBeVisible({ timeout: 10000 });

  // Register the download request listener before clicking Download.
  const downloadBtn = page.getByText('Download', { exact: true });
  const [downloadRequest] = await Promise.all([
    page.waitForRequest(
      (r) =>
        r.method() === 'POST' &&
        (r.url().includes('sh.dataspace.copernicus.eu') ||
          r.url().includes('openeosh.dataspace.copernicus.eu') ||
          r.url().includes('/api/v1/process')),
      { timeout: 30000 },
    ),
    downloadBtn.click(),
  ]);

  const downloadResponse = await downloadRequest.response();
  expect(downloadResponse).not.toBeNull();
  expect(downloadResponse!.status()).toBe(200);
});
