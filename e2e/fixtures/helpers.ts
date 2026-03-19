import { Page } from '@playwright/test';

export async function dismissAnonymousSession(page: Page) {
  await page.getByText('Anonymously', { exact: true }).waitFor({ state: 'visible' });
  await page.getByText('Anonymously', { exact: true }).click();
  await page.locator('.ensure-auth').waitFor({ state: 'hidden' });

  try {
    const tourButton = page.getByRole('button', { name: "Don't show again" });
    await tourButton.waitFor({ state: 'visible', timeout: 3000 });
    await tourButton.click();
  } catch {
    // tour already dismissed or not shown in this session
  }
}
