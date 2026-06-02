import { test, expect } from '@playwright/test';
import { CODE_EDITOR_URLS } from './fixtures/urls';

test('test if processGraph is selected with flow from clicking on code editor', async ({ page }) => {
  await page.goto(CODE_EDITOR_URLS.s2L2aTrueColor);

  await page.getByTitle('Show custom option').click();
  await page.getByText('OpenEO process graph').click();
  await expect(page.getByRole('radio', { name: 'OpenEO process graph' })).toBeChecked();
});

test('test if custom script is selected from url', async ({ page }) => {
  await page.goto(CODE_EDITOR_URLS.customScript);
  await page.getByText('Custom script').click();
  await expect(page.getByRole('radio', { name: 'Custom script' })).toBeChecked();
});

test('evalscript URL params are preserved and custom script is auto-selected after page load', async ({
  page,
}) => {
  await page.goto(CODE_EDITOR_URLS.customScript);

  // Wait for the Custom script radio first — this guarantees Keycloak's check-sso redirect has
  // fully settled and the sessionStorage restore has run before we assert on the URL. Checking
  // the URL before this point could race against the transient strip window.
  await expect(page.getByRole('radio', { name: 'Custom script' })).toBeChecked({ timeout: 15000 });

  // evalscript and visualizationUrl must survive the Keycloak check-sso redirect — the fix
  // strips them only for the redirect_uri, then restores them via sessionStorage.
  await expect(page).toHaveURL(/evalscript=/);
  await expect(page).toHaveURL(/visualizationUrl=/);
});
