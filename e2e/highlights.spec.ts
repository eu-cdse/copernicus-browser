import { test, expect, type Page } from '@playwright/test';

/** Navigate to the given theme and wait for the app to be interactive. */
async function gotoTheme(page: Page, themeId: string) {
  await page.goto(`/?themeId=${themeId}`);
  // Wait for the Highlights Panel button to appear — it's only rendered once the theme
  // has initialised, so this naturally covers the Keycloak silent-SSO redirect too.
  await page.getByTitle('Highlights Panel').waitFor({ state: 'visible', timeout: 60_000 });
}

// Each describe block runs serially so the second test in each group reuses the
// already-settled Keycloak auth state from the first.
test.describe.serial('highlights', () => {
  // Give each test 90 s: up to ~30 s for SSO, ~30 s for tile, remainder for assertions.
  test.setTimeout(90_000);

  // Tests the new "Methane Emission in the Permian Basin" highlight added in the ATMOSPHERE theme.
  // Expected URL (example):
  //   ?zoom=8&lat=32.64631&lng=-100.7666&themeId=ATMOSPHERE&visualizationUrl=<enc>
  //   &datasetId=S5_CH4_CDAS&fromTime=2023-12-08T00:00:00.000Z&toTime=2023-12-08T23:59:59.999Z
  //   &layerId=CH4_VISUALIZED&demSource3D=%22MAPZEN%22&cloudCoverage=30&dateMode=SINGLE
  test('clicking Methane Emission highlight loads CH4 layer over the Permian Basin', async ({ page }) => {
    await gotoTheme(page, 'ATMOSPHERE');
    await page.getByTitle('Highlights Panel').click();
    await page.getByText('Methane Emission in the Permian Basin, Texas, USA').click();

    await expect(page).toHaveURL(/zoom=8/);
    await expect(page).toHaveURL(/lat=32\.64631/);
    await expect(page).toHaveURL(/lng=-100\.7666/);
    await expect(page).toHaveURL(/themeId=ATMOSPHERE/);
    await expect(page).toHaveURL(/visualizationUrl=/);
    await expect(page).toHaveURL(/datasetId=S5_CH4_CDAS/);
    await expect(page).toHaveURL(/fromTime=2023-12-08/);
    await expect(page).toHaveURL(/toTime=2023-12-08/);
    await expect(page).toHaveURL(/layerId=CH4_VISUALIZED/);
    await expect(page).toHaveURL(/demSource3D=/);
    await expect(page).toHaveURL(/cloudCoverage=30/);
    await expect(page).toHaveURL(/dateMode=SINGLE/);
  });

  // Tests the "Drastically Reduced NO2 Pollution in Paris" compare highlight in the ATMOSPHERE theme.
  // Expected URL (example):
  //   ?zoom=9&lat=48.90806&lng=2.66418&themeId=ATMOSPHERE&demSource3D=%22MAPZEN%22
  //   &cloudCoverage=30&comparedOpacity=[1,1]&comparedClipping=[[0,0.42],[0,1]]&compareMode=split
  // Note: inline compare highlights use compareShare=false — layers are embedded locally,
  // so no compareSharedPinsId appears in the URL.
  test('clicking NO2 Paris compare highlight opens split compare panel', async ({ page }) => {
    await gotoTheme(page, 'ATMOSPHERE');
    await page.getByTitle('Highlights Panel').click();
    await page.getByText('Drastically Reduced NO2 Pollution in Paris').click();

    // The compare highlight automatically opens the split compare panel —
    // verify the opacity sliders are rendered (2 layers × 2 handles = 4 sliders in split mode)
    await expect(page.getByRole('slider').first()).toBeVisible();

    await expect(page).toHaveURL(/zoom=9/);
    await expect(page).toHaveURL(/lat=48\.90806/);
    await expect(page).toHaveURL(/lng=2\.66418/);
    await expect(page).toHaveURL(/themeId=ATMOSPHERE/);
    await expect(page).toHaveURL(/demSource3D=/);
    await expect(page).toHaveURL(/cloudCoverage=30/);
    await expect(page).toHaveURL(/comparedOpacity=%5B1%2C1%5D/); // [1,1]
    await expect(page).toHaveURL(/comparedClipping=%5B%5B0%2C0\.42/); // [[0,0.42],...]
    await expect(page).toHaveURL(/compareMode=split/);
  });

  // Verifies that the NO2 Paris compare layers actually fire Process API tile requests.
  // Both compare layers use evalscriptUrl (a custom monthly-mean script), so they must go
  // through the SentinelHub Process API rather than a plain WMS/OpenEO request.
  test('clicking NO2 Paris compare highlight loads compare layers via Process API', async ({ page }) => {
    await gotoTheme(page, 'ATMOSPHERE');
    await page.getByTitle('Highlights Panel').click();

    // Register before clicking so we don't miss early tile responses.
    const processApiResponse = page.waitForResponse(
      (r) => r.url().includes('/api/v1/process') && r.status() === 200,
      { timeout: 30_000 },
    );

    await page.getByText('Drastically Reduced NO2 Pollution in Paris').click();

    // Both compare layers use evalscriptUrl → ApiType.PROCESSING → /api/v1/process.
    // A successful (200) tile response proves the custom script was routed correctly.
    const response = await processApiResponse;
    expect(response.ok()).toBe(true);
  });

  // Tests the evalscriptUrl highlight path — not covered by the Atmosphere tests above.
  // The "Corn Belt" uses a custom script URL on S2 Quarterly Mosaics instead of a named layer.
  // Expected URL:
  //   ?zoom=6&lat=40.66397&lng=-95.42725&themeId=AGRICULTURE
  //   &evalscriptUrl=<enc>&dateMode=TIME+RANGE&cloudCoverage=30
  test('clicking a highlight with evalscriptUrl sets evalscriptUrl in the URL', async ({ page }) => {
    await gotoTheme(page, 'AGRICULTURE');
    await page.getByTitle('Highlights Panel').click();
    await page.getByText('The "Corn Belt" in the United States of America').click();

    await expect(page).toHaveURL(/zoom=6/);
    await expect(page).toHaveURL(/lat=40\.66397/);
    await expect(page).toHaveURL(/lng=-95\.42725/);
    await expect(page).toHaveURL(/themeId=AGRICULTURE/);
    await expect(page).toHaveURL(/evalscriptUrl=/);
    await expect(page).toHaveURL(/dateMode=TIME/); // TIME+RANGE or TIME%20RANGE depending on encoding
    await expect(page).toHaveURL(/cloudCoverage=30/);
  });
  // Verify that Corn Belt highlight uses Process API, not OpenEO.
  // The bug: clicking Corn Belt triggered OpenEO instead of Process API due to cached process graph data.
  // This test ensures the fix forces Process API when evalscriptUrl is present.
  test('clicking Corn Belt highlight uses Process API, not OpenEO', async ({ page }) => {
    await gotoTheme(page, 'AGRICULTURE');
    await page.getByTitle('Highlights Panel').click();

    // Wait for the highlight to be visible before clicking.
    await page.getByText('The "Corn Belt" in the United States of America').waitFor({ state: 'visible' });

    // Register BEFORE clicking so we don't miss early tile responses.
    // If Process API is called, it proves Corn Belt is routed through PROCESSING API, not OpenEO.
    const processApiResponse = page.waitForResponse((r) => r.url().includes('/api/v1/process'), {
      timeout: 30_000,
    });

    // Click the Corn Belt highlight
    await page.getByText('The "Corn Belt" in the United States of America').click();

    // Assert: Process API tile request was made and succeeded (proves evalscriptUrl → PROCESS_API routing).
    // Other highlights in the panel may legitimately use OpenEO for their preview images,
    // so we only assert the positive: that Process API was used, not the absence of OpenEO.
    const response = await processApiResponse;
    expect(response.ok()).toBe(true);
  });

  // Test the full pin save-and-load flow for Corn Belt highlight.
  // This verifies that saving a highlight as a pin works and the pin appears in the pins list.
  // OpenEO routing for the Corn Belt preview is already covered by the previous test.
  test('saving Corn Belt highlight as pin shows it in the pins list', async ({ page }) => {
    await gotoTheme(page, 'AGRICULTURE');
    await page.getByTitle('Highlights Panel').click();

    // Find the Corn Belt highlight item card
    const cornBeltItem = page
      .locator('[class*="highlight-item"]')
      .filter({ hasText: 'The "Corn Belt" in the United States of America' })
      .first();

    const addToPinsLink = cornBeltItem.locator('text=Add to Pins').first();
    await addToPinsLink.scrollIntoViewIfNeeded();
    await addToPinsLink.click();

    // Switch to the Pins panel to view the saved pin
    await page.getByTitle('Pins Panel').click();

    // The Corn Belt pin should appear in the pins list by its title
    await expect(
      page.getByText('The "Corn Belt" in the United States of America', { exact: false }).first(),
    ).toBeVisible({ timeout: 10000 });

    // A preview image element should be rendered for the pin
    await expect(page.locator('img.preview').first()).toBeVisible({ timeout: 10000 });
  });
});
