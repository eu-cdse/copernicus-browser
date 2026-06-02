import { test, expect } from '@playwright/test';
import { dismissAnonymousSession } from './fixtures/helpers';
import { CODE_EDITOR_URLS } from './fixtures/urls';

const NDSI_URL = CODE_EDITOR_URLS.s2L2aNDSIKranjskaGora;

test('NDSI layer over Kranjska Gora — image download dialog opens with a clickable Download button', async ({
  page,
}) => {
  await dismissAnonymousSession(page);
  await page.goto(NDSI_URL);

  // Wait for the Download image button to be enabled (not just visible) before clicking —
  // under suite load the toolbar can render before the visualisation is ready and the click
  // would land on a disabled button.
  const downloadImageBtn = page.getByTitle(/Download image/);
  await expect(downloadImageBtn).toBeVisible();
  await expect(downloadImageBtn).toBeEnabled();
  await downloadImageBtn.click();

  await expect(page.locator('.image-download')).toBeVisible({ timeout: 10000 });

  // UI-only verification: the Download button is present and enabled. The fake anon token
  // used by dismissAnonymousSession would get a 401 from the SentinelHub process API, so we
  // do not assert on the network response — see the helper's JSDoc.
  const downloadBtn = page.getByText('Download', { exact: true });
  await expect(downloadBtn).toBeVisible();
  await expect(downloadBtn).toBeEnabled();
});
