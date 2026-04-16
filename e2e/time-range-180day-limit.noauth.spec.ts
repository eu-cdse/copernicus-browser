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

test('From text input: typing a date within the window is accepted; typing outside auto-adjusts Until', async ({
  page,
}) => {
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

  // URL loads with From=2023-01-01, Until=2023-07-01 (181+ days apart).
  // URLParamsParser clamps fromTime to toTime - 180 days = 2023-01-02 on load.
  await expect(fromInput).toHaveValue('2023-01-02');

  // Typing a date within the window (Jan 15) must be accepted; Until stays unchanged
  // because Jan 15 + 180 days = Jul 14, which is after the current Until (Jul 1).
  await fromInput.fill('2023-01-15');
  await fromInput.press('Enter');
  await expect(fromInput).toHaveValue('2023-01-15');
  await expect(untilInput).toHaveValue('2023-07-01');

  // Typing a From date more than 180 days before Until must be accepted and auto-adjust Until
  // to From + 180 days (not revert). 2022-01-01 + 180 days = 2022-06-30.
  await fromInput.fill('2022-01-01');
  await fromInput.press('Tab');
  await expect(fromInput).toHaveValue('2022-01-01');
  await expect(untilInput).toHaveValue('2022-06-30');
});

test('selecting a From date via the calendar sets it without jumping back', async ({ page }) => {
  await openVisualisationInTimeRangeMode(page);

  const vizTab = page.locator('.visualization-time-select');
  const fromInput = vizTab
    .locator('.date-time-input')
    .filter({ hasText: 'From:' })
    .locator('input.date-picker-input');

  // Record the initial From value
  const initialFrom = await fromInput.inputValue();

  // Open the From calendar — portal renders into .timespan-calendar-holder, not inside .date-time-input
  await fromInput.click();
  const fromCalendar = vizTab.locator('.calendar-wrapper');
  await fromCalendar.waitFor({ state: 'visible' });

  // Navigate forward one month from whatever month is currently shown
  await fromCalendar.locator('.date-nav-button.right').click();

  // Click day 15 — always in the middle of the month, never an outside day
  await fromCalendar.locator('.DayPicker-Day:not(.DayPicker-Day--outside)').filter({ hasText: /^15$/ }).click();

  // From must have changed to the 15th of the new month — must not revert to the initial value
  await expect(fromInput).not.toHaveValue(initialFrom);
  const newFrom = await fromInput.inputValue();
  expect(newFrom).toMatch(/^\d{4}-\d{2}-15$/);
});

test('clicking an Until date more than 180 days from From in the calendar auto-advances From', async ({ page }) => {
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

  // URL loads with From=2023-01-01, Until=2023-07-01. Because 2023-07-01 - 2023-01-01 > 180 days,
  // URLParamsParser already clamps fromTime to toTime - 180 days = 2023-01-02 on load.
  await expect(fromInput).toHaveValue('2023-01-02');

  // Open the Until calendar — showing July 2023 (Until=2023-07-01)
  await untilInput.click();
  const calendar = vizTab.locator('.calendar-wrapper');
  await calendar.waitFor({ state: 'visible' });

  // Navigate forward 3 months to October 2023 (Jul → Aug → Sep → Oct)
  const nextMonthBtn = calendar.locator('.date-nav-button.right');
  for (let i = 0; i < 3; i++) {
    await nextMonthBtn.click();
  }

  // Click Oct 1 — 273 days after From=Jan 1, well beyond the 180-day window
  await calendar.getByRole('gridcell', { name: 'Sun Oct 01 2023' }).click();

  // Until should update to the clicked date
  await expect(untilInput).toHaveValue('2023-10-01');

  // From must auto-advance to Oct 1 − 180 days = 2023-04-04 to maintain the constraint
  await expect(fromInput).toHaveValue('2023-04-04');
});

test('Until text input: typing a date outside the window auto-adjusts From', async ({ page }) => {
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

  // URL loads with From=2023-01-02 (clamped), Until=2023-07-01.
  await expect(fromInput).toHaveValue('2023-01-02');

  // Typing an Until date more than 180 days after From must be accepted and auto-adjust From
  // to approximately Until - 180 days. The exact result depends on the browser timezone
  // (toTime carries a 23:59:59.999Z time component), so we match the month rather than a fixed date.
  await untilInput.fill('2025-06-01');
  await untilInput.press('Tab');
  await expect(untilInput).toHaveValue('2025-06-01');
  // From must have changed — expect it somewhere in December 2024 (≈180 days before June 2025)
  await expect(fromInput).toHaveValue(/^2024-12-/);
});
