import { test, expect } from '@playwright/test';
import { mockUserPinsBackend } from './fixtures/helpers';
import { CODE_EDITOR_URLS } from './fixtures/urls';
import { HEAVY_TEST_TIMEOUT, LIVE_REQUEST_TIMEOUT, UI_ASSERTION_TIMEOUT } from './fixtures/timeouts';

test.use({
  launchOptions: {
    args: [
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
      '--ignore-gpu-blocklist',
    ],
  },
});

// Regression test for #1279: opening the 3D view after selecting a saved pin that carries a custom
// (Process API) evalscript — right after a predefined layer was active — used to race two effects
// in TerrainViewer.jsx (the `changeLayer` layer-swap effect and the 3D-init effect) and get stuck
// rendering only background tiles, never issuing a single `/api/v1/process` request.
//
// The mock pin below still carries a `layerId` field (a real saved pin may keep one from whichever
// predefined layer it was derived from), but that value never reaches Redux: `PinPanel.onPinSelect`
// only forwards `layerId` into `visualizationParams` for non-custom pins — for an evalscript pin it
// is omitted entirely, and the preceding `visualizationSlice.actions.reset()` has already cleared any
// previous value to `undefined`. So `TerrainViewer`'s `props.layerId` is `undefined` regardless of
// this field, and `getLayerFromParams` (ImageDownload.utils.js) takes its `LayersFactory.makeLayers`
// (no-layerId) lookup branch rather than the `makeLayer(layerId)` fast path — this is the real-world
// path the race condition affects.
//
// The pin's `visualizationUrl` is the real (decrypted) Sentinel Hub WMS instance URL that backs
// CODE_EDITOR_URLS.s2L2aTrueColor (S2_L2A_CDAS) — `getLayerFromParams` hits it for real to fetch the
// layer, so it has to be a live, valid endpoint, not a placeholder.

const PIN_TITLE = 'Custom evalscript regression pin (#1279)';

const CUSTOM_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: ["B02", "B03", "B04"],
    output: { bands: 3 }
  };
}
function evaluatePixel(sample) {
  return [sample.B04, sample.B03, sample.B02];
}`;

const CUSTOM_EVALSCRIPT_PIN = {
  _id: 'test-pin-1279',
  title: PIN_TITLE,
  themeId: 'DEFAULT-THEME',
  datasetId: 'S2_L2A_CDAS',
  // Present on the raw pin (as a real saved pin might be), but ignored by the app for evalscript
  // pins — see the file-level comment above.
  layerId: '1_TRUE_COLOR',
  visualizationUrl: 'https://sh.dataspace.copernicus.eu/ogc/wms/a91f72b5-f393-4320-bc0f-990129bd9e63',
  lat: 45.35625,
  lng: 8.45879,
  zoom: 11,
  fromTime: '2026-01-03T00:00:00.000Z',
  toTime: '2026-01-03T23:59:59.999Z',
  dateMode: 'SINGLE',
  customSelected: true,
  selectedProcessing: 'Process API',
  evalscript: CUSTOM_EVALSCRIPT,
};

test('3D view sends a Process API request after selecting a custom-evalscript pin right after a predefined layer was active (#1279)', async ({
  page,
}) => {
  test.setTimeout(HEAVY_TEST_TIMEOUT);

  await mockUserPinsBackend(page, [CUSTOM_EVALSCRIPT_PIN]);

  // Collected from page load, so we can tell apart requests the 3D viewer itself issues from ones
  // already in flight from earlier interactions (2D map tile reload, pin thumbnail — see
  // PinPreviewImage.jsx) by comparing counts before/after the click below, instead of relying on
  // `page.waitForLoadState('networkidle')` — unreliable in a SPA, since it resolves immediately if
  // the page already reached that load state, so it wouldn't reliably drain those pending requests.
  const processApiRequestUrls: string[] = [];
  page.on('request', (r) => {
    if (r.url().includes('/api/v1/process')) {
      processApiRequestUrls.push(r.url());
    }
  });

  // Step 3 of the repro: a predefined (non-custom) S2L2A layer is active just before the pin with
  // the custom evalscript is selected.
  await page.goto(CODE_EDITOR_URLS.s2L2aTrueColor);

  await page.getByTitle('Pins Panel').click();

  const pinTitle = page.getByText(PIN_TITLE, { exact: true });
  await expect(pinTitle).toBeVisible({ timeout: UI_ASSERTION_TIMEOUT });
  await pinTitle.click();

  const terrainViewerButton = page.getByTitle('Visualise terrain in 3D');
  await expect(terrainViewerButton).toBeVisible({ timeout: UI_ASSERTION_TIMEOUT });

  const requestCountBeforeClick = processApiRequestUrls.length;

  await terrainViewerButton.click();

  // Routing-only check: confirm a request was issued after the click, without coupling the test to
  // the live backend's response/latency.
  await expect
    .poll(() => processApiRequestUrls.length > requestCountBeforeClick, { timeout: LIVE_REQUEST_TIMEOUT })
    .toBe(true);
});
