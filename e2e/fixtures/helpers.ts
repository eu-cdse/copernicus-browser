import { Page } from '@playwright/test';

export async function dismissAnonymousSession(page: Page) {
  const anonymouslyBtn = page.getByText('Anonymously', { exact: true });
  await anonymouslyBtn.waitFor({ state: 'visible' });
  await anonymouslyBtn.click();
  await anonymouslyBtn.waitFor({ state: 'hidden' });

  try {
    const tourButton = page.getByRole('button', { name: "Don't show again" });
    await tourButton.waitFor({ state: 'visible', timeout: 3000 });
    await tourButton.click();
  } catch {
    // tour already dismissed or not shown in this session
  }
}
