import { test, expect } from '@playwright/test';
import { dismissAnonymousSession } from './fixtures/helpers';
import { CODE_EDITOR_URLS } from './fixtures/urls';

const NDSI_URL = CODE_EDITOR_URLS.s2L2aNDSIKranjskaGora;

// Issue #993: a login-gated feature must offer an actionable login instead of a dead-end warning.
// The Analytical tab of the image download dialog is the cheapest anonymous entry point to it.
test('anonymous user clicking a login-gated feature gets an actionable login prompt', async ({ page }) => {
  await dismissAnonymousSession(page);
  await page.goto(NDSI_URL);

  const downloadImageBtn = page.getByTitle(/Download image/);
  await expect(downloadImageBtn).toBeVisible();
  await expect(downloadImageBtn).toBeEnabled();
  await downloadImageBtn.click();

  const imageDownloadDialog = page.locator('.image-download');
  await expect(imageDownloadDialog).toBeVisible({ timeout: 10000 });

  // The Analytical tab is disabled for anonymous users; clicking it opens the login prompt.
  await page.getByText('Analytical', { exact: true }).click();

  const loginPrompt = page.getByRole('alertdialog');
  await expect(loginPrompt).toBeVisible();
  await expect(loginPrompt).toContainText('Authentication Required');
  await expect(loginPrompt).toContainText('You need to log in to use this function.');

  const loginButton = loginPrompt.getByRole('button', { name: 'Log in' });
  await expect(loginButton).toBeVisible();
  // Deliberately not clicked — it redirects to Keycloak, which is out of scope for a UI-shell test.

  // Dismissing the prompt must leave the image download dialog it was opened from intact.
  await loginPrompt.getByRole('button', { name: 'Continue without logging in' }).click();
  await expect(loginPrompt).toBeHidden();
  await expect(imageDownloadDialog).toBeVisible();
});
