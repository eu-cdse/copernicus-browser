import { test, expect, Page } from '@playwright/test';
import { dismissAnonymousSession } from './fixtures/helpers';
import { CODE_EDITOR_URLS } from './fixtures/urls';

// s2L2aTrueColor URL with dateMode overridden to TIME RANGE and a 180-day window as starting point
const TIME_RANGE_URL = CODE_EDITOR_URLS.s2L2aTrueColor
  .replace('dateMode=SINGLE', 'dateMode=TIME%20RANGE')
  .replace(/fromTime=[^&]+/, 'fromTime=2023-01-01T00%3A00%3A00.000Z')
  .replace(/toTime=[^&]+/, 'toTime=2023-07-01T23%3A59%3A59.999Z');

async function openVisualisationInTimeRangeMode(page: Page) {
  // Use a tall viewport so the date panel stays expanded (auto-collapses below 1080px)
  await page.setViewportSize({ width: 1280, height: 1080 });

  // Navigate directly to a known S2-L2A visualisation in TIME RANGE mode — no search needed
  await page.goto(TIME_RANGE_URL);
  await dismissAnonymousSession(page);

  // Wait for the visualisation to be fully ready (Download image confirms full app load)
  await page.getByTitle(/Download image/).waitFor({ state: 'visible', timeout: 15000 });

  // Wait for the TimespanPicker to appear inside the time select panel
  await expect(page.locator('.visualization-time-select').getByText('From:', { exact: true })).toBeVisible({
    timeout: 10000,
  });
}

test('From can be set freely; Until is clamped to From + 180 days', async ({ page }) => {
  await openVisualisationInTimeRangeMode(page);

  const vizTab = page.locator('.visualization-time-select');
  const fromInput = vizTab
    .locator('.date-time-input')
    .filter({ hasText: 'From:' })
    .locator('input.date-picker-input');
  const untilInput = vizTab
    .locator('.date-time-input')
    .filter({ hasText: 'Until:' })
    .locator('input.date-picker-input');

  // Set From to a date well in the past — From has no upper-bound restriction
  await fromInput.fill('2021-01-01');
  await fromInput.press('Enter');
  await expect(fromInput).toHaveValue('2021-01-01');

  // Until must be clamped to From + 180 days = 2021-07-01
  await expect(untilInput).toHaveValue('2021-07-01');
});

test('typing an Until date more than 180 days after From reverts on blur', async ({ page }) => {
  await openVisualisationInTimeRangeMode(page);

  const vizTab = page.locator('.visualization-time-select');
  const fromInput = vizTab
    .locator('.date-time-input')
    .filter({ hasText: 'From:' })
    .locator('input.date-picker-input');
  const untilInput = vizTab
    .locator('.date-time-input')
    .filter({ hasText: 'Until:' })
    .locator('input.date-picker-input');

  // Set a known From date
  await fromInput.fill('2023-01-01');
  await fromInput.press('Enter');
  await expect(fromInput).toHaveValue('2023-01-01');

  // Wait for Until to reflect the Redux round-trip (From=2023-01-01, so Until ≤ 2023-07-01)
  await expect(untilInput).toHaveValue(/^2023-/);
  const validUntilValue = await untilInput.inputValue();

  // Try to set Until more than 180 days after From — maxDate is 2023-07-01
  await untilInput.fill('2025-06-01');
  await untilInput.press('Tab'); // trigger blur

  // Until must revert to the last valid value (out-of-range date is rejected)
  await expect(untilInput).not.toHaveValue('2025-06-01');
  await expect(untilInput).toHaveValue(validUntilValue);
});
