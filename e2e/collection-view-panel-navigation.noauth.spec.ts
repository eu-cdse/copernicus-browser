import { test, expect, type Page, type Locator } from '@playwright/test';
import { dismissAnonymousSession } from './fixtures/helpers';

// The data collections view (`collectionPanelExpanded`) must behave consistently as the user
// hops between the Visualize sub-panels (issue #1246): opening Layers or WMS always force-expands
// it (they carry the collection-selection content themselves), while opening any of
// Highlights/Pins/Compare always force-collapses it, regardless of a prior manual expand or which
// panel was open before.
function collectionViewTitle(page: Page): Locator {
  return page.locator('.collection-selection-container .title');
}

async function expectCollectionViewExpanded(page: Page, expanded: boolean) {
  if (expanded) {
    await expect(collectionViewTitle(page)).toHaveClass(/expanded/);
  } else {
    await expect(collectionViewTitle(page)).not.toHaveClass(/expanded/);
  }
}

test('data collections view always force-collapses on Highlights/Pins/Compare and force-expands on Layers/WMS', async ({
  page,
}) => {
  await dismissAnonymousSession(page);
  // ATMOSPHERE has highlights configured, so the Highlights Panel button is enabled.
  await page.goto('/?themeId=ATMOSPHERE');

  const pinsButton = page.getByTitle('Pins Panel');
  await pinsButton.waitFor({ state: 'visible', timeout: 30000 });

  // Layers -> Pins force-collapses the view.
  await pinsButton.click();
  await expectCollectionViewExpanded(page, false);

  // Manually expand while on Pins.
  await page.locator('.collection-selection-container .title-arrow-wrapper').click();
  await expectCollectionViewExpanded(page, true);

  // Pins -> Compare still force-collapses, even though Compare is in the same "group" as Pins:
  // the manual expand does not survive.
  await page.getByTitle('Compare Panel').click();
  await expectCollectionViewExpanded(page, false);

  // Compare -> WMS/WMTS force-expands.
  await page.getByTitle('WMS/WMTS Panel').click();
  await expectCollectionViewExpanded(page, true);

  // WMS -> Highlights force-collapses again.
  await page.getByTitle('Highlights Panel').click();
  await expectCollectionViewExpanded(page, false);

  // Highlights -> Layers force-expands.
  await page.getByTitle('Layers Panel').click();
  await expectCollectionViewExpanded(page, true);
});
