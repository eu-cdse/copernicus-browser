import { test, expect, Page } from '@playwright/test';
import { dismissAnonymousSession, seedSearchConfig } from './fixtures/helpers';
import { CODE_EDITOR_URLS } from './fixtures/urls';

// Regression coverage for issue #1065: the selected sidebar tab must survive a page
// refresh. On load, URLParamsParser derives a tab from the URL (Visualise when a
// datasetId/layerId is present), then Tools.componentDidMount overrides it to Search
// when the persisted session flag says the user's last active tab was Search. These
// tests seed that flag both ways and assert the right tab wins — the exact two cases
// the two-commit fix had to get right.
//
// UI-only: the fake anon token from dismissAnonymousSession gets 401s from the catalog
// and visualisation APIs, but the tab-restore logic is pure client state and needs no
// network. We assert on each tab's aria-selected state (role="tab" in junk/Tabs/Tabs.jsx),
// not on any rendered results.

// A URL carrying a datasetId + layerId, so URLParamsParser dispatches the Visualise tab.
const VISUALISE_URL = CODE_EDITOR_URLS.s2L2aTrueColor;

const searchTab = (page: Page) => page.getByRole('tab', { name: 'Search' });
const visualiseTab = (page: Page) => page.getByRole('tab', { name: 'Visualise' });

test('persists the Search tab on refresh even when the URL carries a datasetId (#1065)', async ({ page }) => {
  await dismissAnonymousSession(page);
  // Simulate a prior session that ended on the Search tab.
  await seedSearchConfig(page, { shouldShowAdvancedSearchTab: true });
  await page.goto(VISUALISE_URL);

  // Search must win: the persisted flag overrides the URL-derived Visualise tab.
  await expect(searchTab(page)).toBeVisible();
  await expect(searchTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(visualiseTab(page)).toHaveAttribute('aria-selected', 'false');
});

test('keeps the URL-derived Visualise tab on refresh when the session did not end on Search', async ({
  page,
}) => {
  await dismissAnonymousSession(page);
  // Prior session ended on Visualise (flag explicitly false).
  await seedSearchConfig(page, { shouldShowAdvancedSearchTab: false });
  await page.goto(VISUALISE_URL);

  // No override: the URL-derived Visualise tab is preserved.
  await expect(visualiseTab(page)).toBeVisible();
  await expect(visualiseTab(page)).toHaveAttribute('aria-selected', 'true');
  await expect(searchTab(page)).toHaveAttribute('aria-selected', 'false');
});
