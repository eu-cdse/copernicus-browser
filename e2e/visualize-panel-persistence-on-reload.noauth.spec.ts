import { test, expect, type Page } from '@playwright/test';
import { dismissAnonymousSession } from './fixtures/helpers';
import { CODE_EDITOR_URLS } from './fixtures/urls';
import { UI_ASSERTION_TIMEOUT } from './fixtures/timeouts';

// Regression coverage for issue #1270: refreshing while a Visualize sub-panel (Compare, WMS,
// Pins, Highlights) was open used to jump back to the Layers panel, because several mount-time
// effects (Tools.jsx's RRD-tab switch, ThemeSelect.jsx's/VisualizationTimeSelect.jsx's
// highlights/layers auto-open) raced the async signal that panel restore relies on
// (compareShare/wmsPanelOpen in Redux, only set once URLParamsParser's restore or App.jsx's
// external-server hydration resolves) and ran before it. The fix threads the URL-parsed
// compareShareInit/panelFromUrlParams flags (already correct at the very first render) through
// those guards instead of relying solely on the async Redux flags.
//
// A URL carrying a datasetId + layerId + toTime, so a date is already selected on mount — this is
// exactly the condition that made VisualizationTimeSelect.jsx's mount-time date effect
// (updateSelectedDates -> updateDate -> openLayerPanel) run synchronously and force Layers open
// before the WMS/Compare restore could land.
const VISUALIZE_URL = CODE_EDITOR_URLS.s2L2aTrueColor;

const panelButton = (page: Page, title: string) => page.getByTitle(title, { exact: true });

async function expectPanelActive(page: Page, title: string) {
  await expect(panelButton(page, title)).toHaveClass(/active/, { timeout: UI_ASSERTION_TIMEOUT });
}

test('WMS panel stays open on refresh instead of jumping to Layers (#1270)', async ({ page }) => {
  await dismissAnonymousSession(page);
  await page.goto(VISUALIZE_URL);

  const wmsButton = panelButton(page, 'WMS/WMTS Panel');
  await wmsButton.waitFor({ state: 'visible', timeout: 30000 });
  await wmsButton.click();
  await expectPanelActive(page, 'WMS/WMTS Panel');
  await expect(page.getByPlaceholder('Enter a WMS or WMTS URL')).toBeVisible();

  await page.reload();

  // Before the fix, this landed back on Layers (the Sentinel-2 collection list) instead.
  await expectPanelActive(page, 'WMS/WMTS Panel');
  await expect(page.getByPlaceholder('Enter a WMS or WMTS URL')).toBeVisible({
    timeout: UI_ASSERTION_TIMEOUT,
  });
  await expect(panelButton(page, 'Layers Panel')).not.toHaveClass(/active/);
});

test('Pins panel stays open on refresh (baseline, shares the same restore mechanism)', async ({ page }) => {
  await dismissAnonymousSession(page);
  await page.goto(VISUALIZE_URL);

  const pinsButton = panelButton(page, 'Pins Panel');
  await pinsButton.waitFor({ state: 'visible', timeout: 30000 });
  await pinsButton.click();
  await expectPanelActive(page, 'Pins Panel');

  await page.reload();

  await expectPanelActive(page, 'Pins Panel');
  await expect(panelButton(page, 'Layers Panel')).not.toHaveClass(/active/);
});

test('Highlights panel stays open on refresh (baseline, shares the same restore mechanism)', async ({
  page,
}) => {
  await dismissAnonymousSession(page);
  // ATMOSPHERE has highlights configured, so the Highlights Panel button is enabled.
  await page.goto('/?themeId=ATMOSPHERE');

  const highlightsButton = panelButton(page, 'Highlights Panel');
  await highlightsButton.waitFor({ state: 'visible', timeout: 30000 });
  await highlightsButton.click();
  await expectPanelActive(page, 'Highlights Panel');

  await page.reload();

  await expectPanelActive(page, 'Highlights Panel');
  await expect(panelButton(page, 'Layers Panel')).not.toHaveClass(/active/);
});

test('Compare session survives a refresh even after navigating back to Layers first (#1270)', async ({
  page,
}) => {
  const COMPARE_SHARED_PINS_ID = 'test-compare-id';
  const COMPARE_LAYER_TITLE = 'Sentinel-2 L2A: True color';

  await dismissAnonymousSession(page);

  // Mirrors saveSharedPinsToServer's POST (Pin.utils.js) — App.jsx now issues this regardless of
  // which panel is active, keyed only off comparedLayers changing (issue #1270).
  await page.route('**/sharedpins', (route) => {
    if (route.request().method() !== 'POST') {
      return route.fallback();
    }
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ id: COMPARE_SHARED_PINS_ID }),
    });
  });
  // Mirrors getSharedPins's GET (Pin.utils.js) — the restore fetch URLParamsParser issues on load.
  await page.route(`**/sharedpins/${COMPARE_SHARED_PINS_ID}`, (route) =>
    route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        items: [
          {
            _id: 'compare-pin-1',
            title: COMPARE_LAYER_TITLE,
            themeId: 'theme-1',
            datasetId: 'S2_L2A_CDAS',
            visualizationUrl: '',
            lat: 1,
            lng: 2,
            zoom: 3,
          },
        ],
      }),
    }),
  );

  await page.goto(VISUALIZE_URL);

  // Add the active layer to Compare without ever opening the Compare panel — this is the gap
  // issue #1270's deeper fix closes: compareSharedPinsId used to only sync while ComparePanel.jsx
  // was mounted, so a layer added from Layers/Pins/Highlights was silently lost on refresh.
  await page.getByTitle('Add to', { exact: true }).click();
  await page.getByTitle('Add to Compare', { exact: false }).click();

  await expect
    .poll(() => new URL(page.url()).searchParams.get('compareSharedPinsId'), {
      timeout: UI_ASSERTION_TIMEOUT,
    })
    .toBe(COMPARE_SHARED_PINS_ID);
  // Still on Layers — adding to Compare must not switch the active panel by itself.
  await expectPanelActive(page, 'Layers Panel');

  await page.reload();

  // Still on Layers after reload too (compareSharedPinsId alone doesn't reopen Compare — only a
  // compareShare=true URL, written while Compare itself is the active panel, does).
  await expectPanelActive(page, 'Layers Panel');

  await panelButton(page, 'Compare Panel').click();
  await expect(page.getByText(COMPARE_LAYER_TITLE, { exact: false })).toBeVisible({
    timeout: UI_ASSERTION_TIMEOUT,
  });
  await expect(page.getByText('No layers to compare.')).not.toBeVisible();
});
