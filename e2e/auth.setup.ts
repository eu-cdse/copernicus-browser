import { test as setup, expect } from '@playwright/test';
import path from 'path';
import fs from 'fs';
import { fileURLToPath } from 'node:url';
import { dirname } from 'node:path';

const __dirname = dirname(fileURLToPath(import.meta.url));
const authDir = path.join(__dirname, '.auth');
const authFile = path.join(authDir, 'user.json');

// Ensure the .auth directory and a valid (empty) storage state file exist
// so that storageState in playwright.config.ts never hits ENOENT.
fs.mkdirSync(authDir, { recursive: true });
if (!fs.existsSync(authFile)) {
  fs.writeFileSync(authFile, JSON.stringify({ cookies: [], origins: [] }));
}

setup('authenticate via SSO', async ({ page }) => {
  // Step 1: Go to the app and trigger login
  await page.goto('/');

  await page.getByText('Log in', { exact: true }).first().click();
  // Clicking "Log in" hands off to Keycloak via a full-page redirect. Assert the
  // redirect actually happens before interacting with the Keycloak form, so a
  // non-navigating click fails here with a clear message instead of timing out
  // later on the Email field.
  await page.waitForURL(/identity\.dataspace\.copernicus\.eu/, { timeout: 60_000 });
  await page.getByRole('textbox', { name: 'Email' }).click();
  await page.getByRole('textbox', { name: 'Email' }).fill(process.env.E2E_SSO_USERNAME ?? '');
  await page.getByRole('textbox', { name: 'Password' }).click();
  await page.getByRole('textbox', { name: 'Password' }).fill(process.env.E2E_SSO_PASSWORD ?? '');
  await page.getByRole('button', { name: 'LOGIN' }).click();
  await page.getByRole('button', { name: "Don't show again" }).click();
  await expect(page.getByText('FE-Team Test Account')).toBeVisible();

  // Step 5: Save the authenticated browser state
  await page.context().storageState({ path: authFile });
});
