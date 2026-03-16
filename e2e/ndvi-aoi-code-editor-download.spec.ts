import { test, expect } from '@playwright/test';
import { CODE_EDITOR_URLS } from './fixtures/urls';

declare const monaco: {
  editor: {
    getModels: () => Array<{
      getValue: () => string;
      setValue: (value: string) => void;
    }>;
  };
};

test('NDVI layer → AOI → code editor process graph edit → download format routing', async ({ page }) => {
  // Navigate to the app and wait for initial tiles.
  // S2_L2A_CDAS True Color uses the openEO endpoint (confirmed by visualization-service-routing spec).
  const initialTiles = page.waitForResponse(
    (r) => r.url().includes('openeosh.dataspace.copernicus.eu') && r.status() === 200,
  );
  await page.goto(CODE_EDITOR_URLS.s2l2aNDVI);
  await initialTiles;

  // Switch to NDVI layer
  await page.getByText('NDVI').click();

  // Open AOI tools and activate rectangular drawing mode
  await page.getByTitle('Create an area of interest', { exact: true }).click();
  await page.getByTitle('Draw rectangular area of interest for image downloads and timelapse').click();

  // Draw a small rectangle by clicking two corners (Leaflet Geoman two-click style)
  const map = page.locator('.leaflet-container');
  const box = await map.boundingBox();
  if (!box) {
    throw new Error('Leaflet map container not visible — cannot draw AOI');
  }
  const cx = box.x + box.width / 2;
  const cy = box.y + box.height / 2;
  await page.mouse.click(cx - 60, cy - 60);
  await page.mouse.click(cx + 60, cy + 60);

  // Verify AOI was drawn and Statistical Info button is enabled
  await expect(page.getByTitle('Remove area of interest')).toBeVisible();
  await expect(page.getByTitle('Statistical Info chart')).toBeVisible();

  // Open the code editor
  await page.getByTitle('Show custom option').click();

  // Verify OpenEO process graph radio is selected by default
  await expect(page.getByRole('radio', { name: 'OpenEO process graph' })).toBeChecked();

  // Statistical Info button remains accessible while the code editor is open
  await expect(page.getByTitle('Statistical Info chart')).toBeVisible();

  // Wait for Monaco to initialise before interacting with it
  await page.getByRole('textbox', { name: /Editor content/ }).waitFor({ state: 'visible' });

  // Edit the process graph: replace B04 with B03 using the Monaco editor API
  const modifiedGraph = await page.evaluate(() => {
    const models = monaco.editor.getModels();
    if (models.length === 0) {
      throw new Error('Monaco has no models — editor may not have initialised');
    }
    const model = models[0];
    const modified = model.getValue().replace(/"B04"/g, '"B03"');
    model.setValue(modified);
    // Trigger React's onChange by dispatching an input event on the hidden textarea
    const textarea = document.querySelector<HTMLTextAreaElement>('textarea[role="textbox"]');
    if (textarea) {
      const setter = Object.getOwnPropertyDescriptor(window.HTMLTextAreaElement.prototype, 'value')!.set!;
      setter.call(textarea, modified);
      textarea.dispatchEvent(new Event('input', { bubbles: true }));
    }
    return modified;
  });
  expect(modifiedGraph).toContain('"B03"');
  expect(modifiedGraph).not.toContain('"B04"');

  // Apply changes and wait for new tiles to load
  const newTiles = page.waitForResponse(
    (r) => r.url().includes('openeosh.dataspace.copernicus.eu') && r.status() === 200,
  );
  await page.getByRole('button', { name: 'Apply' }).click();
  await newTiles;

  // Statistical Info is now disabled — custom process graphs are not supported by FIS
  await expect(page.getByTitle('Statistical Info chart (not available for Custom).')).toBeVisible();

  // Open the download panel
  await page.getByTitle(/Download image/).click();

  // Switch to Analytical tab
  await page.getByText('Analytical').click();

  // Pick the format select: the one that contains TIFF options
  const formatSelect = page
    .locator('select')
    .filter({ has: page.locator('option', { hasText: 'TIFF (32-bit float)' }) });

  // --- TIFF 32-bit: analytical download should go to openEO /result ---
  await formatSelect.selectOption('TIFF (32-bit float)');
  // Wait for any preview requests triggered by the format change to settle
  await page.waitForLoadState('networkidle');

  // Register listener and click together so we can't miss the request
  const [tiff32] = await Promise.all([
    page.waitForRequest((r) => r.method() === 'POST' && r.url().includes('openeosh.dataspace.copernicus.eu')),
    page.getByText('Download', { exact: true }).click(),
  ]);

  expect(tiff32.url()).toContain('openeosh.dataspace.copernicus.eu/1.2/result');

  const body = tiff32.postDataJSON();
  const saveNode = Object.values(
    body.process.process_graph as Record<string, { process_id: string; arguments: { format: string } }>,
  ).find((n) => n.process_id === 'save_result');
  expect(saveNode?.arguments?.format).toBe('gtiff');

  // --- TIFF 8-bit: should route to the SentinelHub process API, not openEO ---
  await formatSelect.selectOption('TIFF (8-bit)');
  await page.waitForLoadState('networkidle');

  // TIFF 8-bit download must use the SentinelHub process API — never openEO
  const [tiff8] = await Promise.all([
    page.waitForRequest((r) => r.method() === 'POST' && r.url().includes('/api/v1/process')),
    page.getByText('Download', { exact: true }).click(),
  ]);

  expect(tiff8.url()).toContain('/api/v1/process');
  expect(tiff8.url()).not.toContain('openeosh');
});
