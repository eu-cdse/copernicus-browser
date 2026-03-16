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
