import { test, expect, Page } from '@playwright/test';
import { mockJsonBackend } from './fixtures/helpers';
import { LIVE_REQUEST_TIMEOUT } from './fixtures/timeouts';

// Authenticated spec (no .noauth suffix) — runs under the `chromium` project with the stored SSO
// session, so the app treats the user as logged in (userdata + access_token present). That is the
// gate the backend-sync feature (MR 1167) is built on: logged-in users hydrate their external
// WMS/WMTS servers from `userexternalservers` on mount and full-array-PUT them back on every mutation.
//
// The real `userexternalservers` backend is mocked with page.route so the test asserts the exact GET/PUT
// contract deterministically, independent of whether the local backend is running.
//
// See #1236: `layers` is a runtime-only Redux cache, never persisted to the backend (nor sent in the
// PUT body). The backend GET only ever returns service metadata (id/name/url/type/...); a server's
// layers are fetched lazily via GetCapabilities by useExternalServerLayers, once that server becomes
// active — which happens either when the WMS/WMTS panel is opened (for the last-used/only server) or
// when the user clicks another server in the list. These tests mock GetCapabilities too, so the lazy
// fetch is deterministic and never hits a real server.

const WMS_CAPABILITIES_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Test WMS Service</Title></Service>
  <Capability>
    <Layer>
      <Title>Root Layer</Title>
      <Layer><Name>cities</Name><Title>Cities</Title></Layer>
      <Layer><Name>borders</Name><Title>Borders</Title></Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// Distinct capabilities document for BACKEND_SEEDED_SERVER, returned from a mocked GetCapabilities
// endpoint — the fixture no longer carries a `layers` array (see below), so this is the only source
// the "Seeded Layer" name/title come from, proving the lazy on-demand fetch actually happened.
const SEEDED_WMS_CAPABILITIES_XML = `<?xml version="1.0" encoding="UTF-8"?>
<WMT_MS_Capabilities version="1.1.1">
  <Service><Title>Backend Seeded WMS</Title></Service>
  <Capability>
    <Layer>
      <Title>Root Layer</Title>
      <Layer><Name>seeded</Name><Title>Seeded Layer</Title></Layer>
    </Layer>
  </Capability>
</WMT_MS_Capabilities>`;

// A server the UI never adds in-session; used to prove the panel is populated from the backend GET
// (not from localStorage). Shape mirrors ExternalServer well enough for the slice to render a button.
// Metadata-only, matching the real `userexternalservers` GET contract post-#1236: `layers` is never
// persisted, so it's never present on a fetched server either (see getExternalServersFromServer /
// stripServerLayers in src/ExternalLayers/externalServicesBackend.ts).
const BACKEND_SEEDED_SERVER = {
  id: 'seeded-server-id',
  name: 'Backend Seeded WMS',
  url: 'https://seeded-wms.example/wms',
  type: 'WMS',
  version: '1.1.1',
  format: 'image/png',
  infoFormat: 'text/html',
};

// Installs a stateful mock of the userexternalservers backend. `servers` is the durable list held
// "server-side"; GET returns it, PUT replaces it. Returns handles to inspect PUT traffic.
function mockUserServicesBackend(page: Page, initial: unknown[] = []) {
  return mockJsonBackend(page, '**/userexternalservers**', initial, (items) => ({ items }));
}

async function openWmsPanel(page: Page) {
  const wmsButton = page.getByTitle('WMS/WMTS Panel');
  await wmsButton.waitFor({ state: 'visible', timeout: 30000 });
  await wmsButton.click();
}

test('hydrates external servers from the backend GET on mount, lazily fetching layers only once the panel is opened', async ({
  page,
}) => {
  await mockUserServicesBackend(page, [BACKEND_SEEDED_SERVER]);
  await page.route(`${BACKEND_SEEDED_SERVER.url}**`, (route) => {
    route.fulfill({ status: 200, contentType: 'application/xml', body: SEEDED_WMS_CAPABILITIES_XML });
  });

  await page.goto('/');

  // The backend GET response never carries `layers` (see BACKEND_SEEDED_SERVER above), and the panel
  // hasn't been opened yet, so nothing should have triggered the lazy GetCapabilities fetch — no
  // layer name from it should be anywhere on the page.
  await expect(page.getByText('Seeded Layer', { exact: true })).toHaveCount(0);

  // Registered before the triggering action per this repo's e2e conventions: opening the panel makes
  // the hydrated (and only) server active, mounting ExternalWmsLayerContainer, which triggers
  // useExternalServerLayers's on-demand GetCapabilities request.
  const capabilitiesRequest = page.waitForRequest(
    (r) => r.url().includes('seeded-wms.example') && r.url().includes('GetCapabilities'),
    { timeout: LIVE_REQUEST_TIMEOUT },
  );

  await openWmsPanel(page);

  // The server was only ever returned by the backend GET, never added through the UI, so seeing it
  // proves backend hydration drives the panel. Scope to the collection button — the active-layer
  // title label also carries the same title text once the hydrated server is auto-selected.
  await expect(page.locator('a.collection-button', { hasText: 'Backend Seeded WMS' })).toBeVisible({
    timeout: 20000,
  });

  await capabilitiesRequest;

  // Now that GetCapabilities has resolved, the layer it describes should be rendered.
  const layerList = page.getByRole('listbox');
  await expect(layerList.getByText('Seeded Layer', { exact: true })).toBeVisible({ timeout: 20000 });
});

test('adding a server PUTs the full server array to the backend without layers, and transient actions do not PUT', async ({
  page,
}) => {
  const backend = await mockUserServicesBackend(page, []);
  await page.route('https://test-wms.example/**', (route) => {
    route.fulfill({ status: 200, contentType: 'application/xml', body: WMS_CAPABILITIES_XML });
  });

  await page.goto('/');
  await openWmsPanel(page);

  const putBefore = backend.putCount;

  await page.getByPlaceholder('Enter a WMS or WMTS URL').fill('https://test-wms.example/wms');
  await page.getByRole('button', { name: 'Load' }).click();

  // The layer list appears once capabilities load, confirming the add succeeded.
  const layerList = page.getByRole('listbox');
  await expect(layerList.getByText('Cities', { exact: true })).toBeVisible({ timeout: 20000 });

  // The add (addExternalServer) must have triggered exactly one PUT carrying the new server.
  await expect.poll(() => backend.putCount, { timeout: 15000 }).toBeGreaterThan(putBefore);
  expect(Array.isArray(backend.lastPutBody?.items)).toBe(true);
  expect(backend.lastPutBody.items).toHaveLength(1);
  expect(backend.lastPutBody.items[0]).toMatchObject({ type: 'WMS' });
  expect(backend.lastPutBody.items[0].url).toContain('test-wms.example');
  // Regression (#1236): `layers` is a runtime-only Redux cache and must never be sent to the backend,
  // even though the layer list was fetched and is already visible in the UI by this point.
  for (const item of backend.lastPutBody.items) {
    expect(item).not.toHaveProperty('layers');
  }

  // Regression: selecting a layer is transient UI state (setActiveExternalLayer) and must NOT PUT.
  const putAfterAdd = backend.putCount;
  await layerList.getByText('Borders', { exact: true }).click();
  // Selection and any fire-and-forget save are dispatched in the same middleware tick, so once
  // the layer is marked selected, an erroneous PUT (if any) is already recorded.
  await expect(layerList.getByRole('option', { name: 'Borders', selected: true })).toBeVisible({
    timeout: 15000,
  });
  expect(backend.putCount).toBe(putAfterAdd);
});
