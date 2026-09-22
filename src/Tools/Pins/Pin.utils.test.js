import axios from 'axios';

import store, { authSlice } from '../../store';
import { isUserAuthenticated } from '../../Auth/authHelpers';
import {
  isOnEqualDate,
  constructTimespanString,
  constructCompareTimespanString,
  constructExternalWmsDateString,
  normalizePin,
  saveLocalPins,
  getLocalPins,
  writeLocalPins,
  clearLocalPins,
  saveSharedPinsToServer,
  importSharedPins,
  layerFromPin,
  shouldUsePinsBackend,
} from './Pin.utils';
import { LayersFactory } from '@sentinel-hub/sentinelhub-js';
import { getDataSourceHandler } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';

jest.mock('@sentinel-hub/sentinelhub-js', () => ({
  ...jest.requireActual('@sentinel-hub/sentinelhub-js'),
  LayersFactory: { makeLayers: jest.fn() },
}));

jest.mock('../SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  ...jest.requireActual('../SearchPanel/dataSourceHandlers/dataSourceHandlers'),
  getDataSourceHandler: jest.fn(),
}));

jest.mock('../../Auth/authHelpers', () => ({
  ...jest.requireActual('../../Auth/authHelpers'),
  isUserAuthenticated: jest.fn(),
}));

jest.mock('axios');

describe('isOnEqualDate', () => {
  it('should return true when both dates are on the same date', () => {
    const date1 = '2019-08-17T00:00:00.000Z';
    const date2 = '2019-08-17T23:59:59.999Z';
    const isEqualDate = isOnEqualDate(date1, date2);
    expect(isEqualDate).toBe(true);
  });

  it('should return false when both dates have the same day but different months and years', () => {
    const date1 = '2019-08-17T00:00:00.000Z';
    const date2 = '2020-10-17T23:59:59.999Z';
    const isEqualDate = isOnEqualDate(date1, date2);
    expect(isEqualDate).toBe(false);
  });

  it('should return false when both dates have the same day and month but different years', () => {
    const date1 = '2019-08-17T00:00:00.000Z';
    const date2 = '2020-08-17T23:59:59.999Z';
    const isEqualDate = isOnEqualDate(date1, date2);
    expect(isEqualDate).toBe(false);
  });
});

describe('constructTimespanString', () => {
  it('should return a string with timespan of dates when fromTime and toTime are not on the same date', () => {
    const testPin = {
      fromTime: '2019-08-17T00:00:00.000Z',
      toTime: '2019-08-18T23:59:59.999Z',
    };

    const date = constructTimespanString(testPin);
    expect(date).toEqual('2019-08-17 - 2019-08-18');
  });

  it('should return a single date string when the dates are on the same day', () => {
    const testPin = {
      fromTime: '2019-08-18T00:00:00.000Z',
      toTime: '2019-08-18T23:59:59.999Z',
    };
    const date = constructTimespanString(testPin);
    expect(date).toEqual('2019-08-18');
  });

  it('should return a single date string when only toTime is passed', () => {
    const testPin = {
      toTime: '2019-08-18T23:59:59.999Z',
    };
    const date = constructTimespanString(testPin);
    expect(date).toEqual('2019-08-18');
  });

  it('should return null when fromTime and toTime are not defined', () => {
    const testPin = {};
    const date = constructTimespanString(testPin);
    expect(date).toEqual(null);
  });

  it('should return null when a pin is not passed', () => {
    const date = constructTimespanString();
    expect(date).toBe(null);
  });
});

describe('constructExternalWmsDateString', () => {
  it('returns null when there is no time (timeless layer)', () => {
    expect(constructExternalWmsDateString(null)).toBeNull();
    expect(constructExternalWmsDateString(undefined)).toBeNull();
  });

  it('returns the day for a date-only value', () => {
    expect(constructExternalWmsDateString('2024-03-15')).toBe('2024-03-15');
  });

  it('returns the day for a midnight datetime value', () => {
    expect(constructExternalWmsDateString('2024-04-15T00:00:00Z')).toBe('2024-04-15');
  });

  it('includes the time-of-day for a sub-daily value', () => {
    expect(constructExternalWmsDateString('2024-05-15T13:30:00Z')).toBe('2024-05-15 13:30 UTC');
  });

  it('returns null for an invalid value', () => {
    expect(constructExternalWmsDateString('not-a-date')).toBeNull();
  });
});

describe('constructCompareTimespanString', () => {
  it('returns min fromTime / max toTime across layers with / separator', () => {
    const comparedLayers = [
      { fromTime: '2019-08-17T00:00:00.000Z', toTime: '2019-08-17T23:59:59.999Z' },
      { fromTime: '2022-04-01T00:00:00.000Z', toTime: '2022-04-01T23:59:59.999Z' },
    ];
    expect(constructCompareTimespanString(comparedLayers)).toEqual('2019-08-17 / 2022-04-01');
  });

  it('returns a single date when all layers fall on the same day', () => {
    const comparedLayers = [
      { fromTime: '2019-08-18T00:00:00.000Z', toTime: '2019-08-18T23:59:59.999Z' },
      { fromTime: '2019-08-18T06:00:00.000Z', toTime: '2019-08-18T23:59:59.999Z' },
    ];
    expect(constructCompareTimespanString(comparedLayers)).toEqual('2019-08-18');
  });

  it('returns null when comparedLayers is empty', () => {
    expect(constructCompareTimespanString([])).toBeNull();
  });

  it('returns null when called without arguments', () => {
    expect(constructCompareTimespanString()).toBeNull();
  });
});

describe('normalizePin', () => {
  it('preserves evalscriptUrl when already present', () => {
    const pin = { evalscriptUrl: 'https://example.com/eval' };
    const result = normalizePin(pin);
    expect(result.evalscriptUrl).toBe('https://example.com/eval');
  });

  it('preserves processGraphUrl when already present', () => {
    const pin = { processGraphUrl: 'https://example.com/pg' };
    const result = normalizePin(pin);
    expect(result.processGraphUrl).toBe('https://example.com/pg');
  });

  it('promotes legacy lowercase evalscripturl to evalscriptUrl', () => {
    const pin = { evalscripturl: 'https://example.com/eval' };
    const result = normalizePin(pin);
    expect(result.evalscriptUrl).toBe('https://example.com/eval');
  });

  it('promotes legacy lowercase processgraphurl to processGraphUrl', () => {
    const pin = { processgraphurl: 'https://example.com/pg' };
    const result = normalizePin(pin);
    expect(result.processGraphUrl).toBe('https://example.com/pg');
  });

  it('prefers camelCase evalscriptUrl over legacy lowercase evalscripturl', () => {
    const pin = { evalscriptUrl: 'new', evalscripturl: 'old' };
    const result = normalizePin(pin);
    expect(result.evalscriptUrl).toBe('new');
  });

  it('prefers camelCase processGraphUrl over legacy lowercase processgraphurl', () => {
    const pin = { processGraphUrl: 'new-pg', processgraphurl: 'old-pg' };
    const result = normalizePin(pin);
    expect(result.processGraphUrl).toBe('new-pg');
  });

  it('leaves evalscriptUrl undefined when neither key is present', () => {
    const pin = { someOtherProp: 'value' };
    const result = normalizePin(pin);
    expect(result.evalscriptUrl).toBeUndefined();
    expect(result.processGraphUrl).toBeUndefined();
  });

  it('clears processGraph and processGraphUrl when evalscriptUrl is present', () => {
    const pin = {
      evalscriptUrl: 'https://example.com/eval',
      processGraph: '{"some":"graph"}',
      processGraphUrl: 'https://example.com/pg',
    };
    const result = normalizePin(pin);
    expect(result.evalscriptUrl).toBe('https://example.com/eval');
    expect(result.processGraph).toBeUndefined();
    expect(result.processGraphUrl).toBeUndefined();
  });

  it('clears evalscript when processGraphUrl is present and no evalscriptUrl', () => {
    const pin = {
      processGraphUrl: 'https://example.com/pg',
      evalscript: 'return [1,1,1]',
    };
    const result = normalizePin(pin);
    expect(result.processGraphUrl).toBe('https://example.com/pg');
    expect(result.evalscript).toBeUndefined();
    expect(result.evalscriptUrl).toBeUndefined();
  });

  it('evalscriptUrl takes precedence over processGraphUrl when both are present', () => {
    const pin = {
      evalscriptUrl: 'https://example.com/eval',
      processGraphUrl: 'https://example.com/pg',
    };
    const result = normalizePin(pin);
    expect(result.evalscriptUrl).toBe('https://example.com/eval');
    expect(result.processGraphUrl).toBeUndefined();
  });

  it('removes legacy lowercase evalscripturl and processgraphurl keys from the result', () => {
    const pin = {
      evalscripturl: 'https://example.com/eval',
      processgraphurl: 'https://example.com/pg',
    };
    const result = normalizePin(pin);
    expect(result.evalscriptUrl).toBe('https://example.com/eval');
    expect('evalscripturl' in result).toBe(false);
    expect('processgraphurl' in result).toBe(false);
  });
});

describe('shouldUsePinsBackend', () => {
  it.each([
    ['a non-empty object', { id: '1' }],
    ['true', true],
  ])('returns true when isLoggedIn is %s', (_description, isLoggedIn) => {
    expect(shouldUsePinsBackend(isLoggedIn)).toBe(true);
  });

  it.each([
    ['null', null],
    ['undefined', undefined],
    ['false', false],
  ])('returns false when isLoggedIn is %s', (_description, isLoggedIn) => {
    expect(shouldUsePinsBackend(isLoggedIn)).toBe(false);
  });
});

describe('local pins storage (single sessionStorage bucket)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('writes and reads anonymous pins from the eob-pins session bucket', () => {
    writeLocalPins([{ _id: 'p1', title: 'A' }]);
    const pins = getLocalPins();
    expect(pins).toHaveLength(1);
    expect(pins[0]._id).toBe('p1');
    // Same store + key production has always used, so anonymous pins survive a deploy.
    expect(sessionStorage.getItem('eob-pins')).not.toBeNull();
    expect(localStorage.getItem('eob-pins')).toBeNull();
  });

  it('clearLocalPins removes the bucket key entirely (no leftover empty array)', () => {
    writeLocalPins([{ _id: 'p1' }]);
    clearLocalPins();
    expect(getLocalPins()).toHaveLength(0);
    // The key is removed, not left as "[]", matching clearPersistedExternalLayers.
    expect(sessionStorage.getItem('eob-pins')).toBeNull();
  });

  it('writeLocalPins removes the key when the last pin is removed', () => {
    writeLocalPins([{ _id: 'p1' }]);
    expect(sessionStorage.getItem('eob-pins')).not.toBeNull();
    // Removing the last pin (e.g. via onRemovePin rewriting the filtered list) must not leave "[]".
    writeLocalPins([]);
    expect(sessionStorage.getItem('eob-pins')).toBeNull();
  });

  it('saveLocalPins assigns an id, returns it, and stores it', () => {
    const id = saveLocalPins([{ title: 'New' }], true);
    expect(id).toMatch(/-pin$/);
    const stored = getLocalPins();
    expect(stored).toHaveLength(1);
    expect(stored[0]._id).toBe(id);
  });

  it('saveLocalPins with replace=false prepends to existing pins', () => {
    writeLocalPins([{ _id: 'old-pin', title: 'Old' }]);
    saveLocalPins([{ _id: 'new-pin', title: 'New' }], false);
    const stored = getLocalPins();
    expect(stored.map((p) => p._id)).toEqual(['new-pin', 'old-pin']);
  });

  it('supports deleting a local pin by filtering and rewriting', () => {
    writeLocalPins([{ _id: 'a', externalWms: { url: 'x' } }, { _id: 'b' }]);
    const remaining = getLocalPins().filter((p) => p._id !== 'a');
    writeLocalPins(remaining);
    const stored = getLocalPins();
    expect(stored).toHaveLength(1);
    expect(stored[0]._id).toBe('b');
  });

  it('stores external WMS pins whole, with externalWms inline', () => {
    saveLocalPins([{ title: 'WMS', externalWms: { url: 'https://w', layerName: 'l' } }], true);
    const stored = getLocalPins();
    expect(stored[0].externalWms).toEqual({ url: 'https://w', layerName: 'l' });
  });
});

describe('toServerPin (via saveSharedPinsToServer)', () => {
  beforeEach(() => {
    axios.post.mockReset();
  });

  it('forwards the externalWms payload verbatim to the backend, unchanged by serialisation', async () => {
    axios.post.mockResolvedValue({ data: { id: 'shared-id' } });
    const externalWms = {
      url: 'https://example.com/wms',
      layerName: 'layer-1',
      layerTitle: 'Layer 1',
      time: null,
    };
    const pin = { _id: 'p1', title: 'WMS pin', externalWms };

    await saveSharedPinsToServer([pin]);

    const [, body] = axios.post.mock.calls[0];
    expect(body.items[0].externalWms).toEqual(externalWms);
  });
});

describe('importSharedPins (all shared pins are imported, no dedup)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    axios.get.mockReset();
    window.confirm = jest.fn(() => true);
    window.history.pushState(null, '', '/');
  });

  afterEach(() => {
    window.history.pushState(null, '', '/');
  });

  it('imports all shared pins, including an exact duplicate and a distinct external-WMS pin at the same location', async () => {
    const existingWmsPin = {
      _id: 'local-1',
      title: 'External WMS',
      themeId: 'theme-1',
      // Legacy FE-local rows store "" rather than null/undefined for unset dataset fields.
      datasetId: '',
      visualizationUrl: '',
      lat: 1,
      lng: 2,
      zoom: 3,
      externalWms: { url: 'https://example.com/wms', layerName: 'layer-1' },
    };
    saveLocalPins([existingWmsPin], true);

    // Same pin coming back from a share link, but with null/undefined instead of "".
    const sharedDuplicate = {
      ...existingWmsPin,
      _id: 'shared-1',
      datasetId: null,
      visualizationUrl: undefined,
    };
    const sharedNew = {
      _id: 'shared-2',
      title: 'Different external WMS',
      themeId: 'theme-1',
      datasetId: undefined,
      visualizationUrl: null,
      lat: 10,
      lng: 20,
      zoom: 5,
      externalWms: { url: 'https://example.com/other-wms', layerName: 'layer-2' },
    };
    axios.get.mockResolvedValue({ data: { items: [sharedDuplicate, sharedNew] } });

    const result = await importSharedPins('shared-list-id');

    expect(result).toBeTruthy();
    const stored = getLocalPins();
    expect(stored.map((p) => p._id).sort()).toEqual(['local-1', 'shared-1', 'shared-2']);
  });

  it("returns { uniqueId } for the anonymous (local) path, matching savePinsToServer's shape (#1184 F1)", async () => {
    axios.get.mockResolvedValue({ data: { items: [{ _id: 'shared-1', title: 'Shared pin' }] } });

    const result = await importSharedPins('shared-list-id');

    expect(result).toEqual({ uniqueId: 'shared-1' });
  });

  it('returns null and imports nothing when the user cancels the confirm dialog', async () => {
    window.confirm = jest.fn(() => false);
    axios.get.mockResolvedValue({ data: { items: [{ _id: 'shared-1', title: 'Shared pin' }] } });

    const result = await importSharedPins('shared-list-id');

    expect(result).toBeNull();
    expect(getLocalPins()).toHaveLength(0);
  });

  it('returns null when the shared pins list has zero items', async () => {
    axios.get.mockResolvedValue({ data: { items: [] } });

    const result = await importSharedPins('shared-list-id');

    expect(result).toBeNull();
  });
});

describe('importSharedPins — error propagation', () => {
  beforeEach(() => {
    sessionStorage.clear();
    axios.get.mockReset();
    axios.put.mockReset();
    window.confirm = jest.fn(() => true);
    window.history.pushState(null, '', '/');
    isUserAuthenticated.mockReturnValue(true);
    store.dispatch(
      authSlice.actions.setUser({ access_token: 'test-token', userdata: {}, token_expiration: 1 }),
    );
  });

  afterEach(() => {
    window.history.pushState(null, '', '/');
    isUserAuthenticated.mockReset();
    store.dispatch(authSlice.actions.resetUser());
  });

  it('propagates a backend save failure', async () => {
    axios.get.mockImplementation((url) =>
      url.includes('sharedpins')
        ? Promise.resolve({ data: { items: [{ _id: 'shared-1', title: 'Shared pin' }] } })
        : Promise.resolve({ data: [] }),
    );
    axios.put.mockRejectedValue(new Error('backend down'));

    await expect(importSharedPins('shared-list-id')).rejects.toThrow('backend down');
  });
});

describe('layerFromPin — low-resolution BYOC collection lookup (regression #1154)', () => {
  // Mirrors real CLMS VLCC/byLayer datasets where the WMS layer's collectionId differs
  // from the pin's datasetId — the low-resolution helpers must be keyed by collectionId.
  const collectionId = 'byoc-collection-uuid-123';
  const datasetId = 'COPERNICUS_CLMS_SOME_DATASET_ID';
  const layerId = 'SOME_LAYER';

  let dsh;
  let mockLayer;

  beforeEach(() => {
    mockLayer = {
      layerId,
      collectionId,
      updateLayerFromServiceIfNeeded: jest.fn().mockResolvedValue(undefined),
    };
    dsh = {
      getSentinelHubDataset: jest.fn(() => null),
      supportsLowResolutionAlternativeCollection: jest.fn((id) => id === collectionId),
      getLowResolutionCollectionId: jest.fn((id) =>
        id === collectionId ? 'low-res-collection-uuid-456' : undefined,
      ),
      getLowResolutionMetersPerPixelThreshold: jest.fn((id) => (id === collectionId ? 300 : undefined)),
    };
    getDataSourceHandler.mockReturnValue(dsh);
    LayersFactory.makeLayers.mockResolvedValue([mockLayer]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('calls the low-resolution collection helpers with the layer collectionId, not the dataset id, and applies the low-res values to the layer', async () => {
    const pin = { datasetId, layerId, visualizationUrl: 'https://example.com/wms' };

    const layer = await layerFromPin(pin, {});

    expect(dsh.supportsLowResolutionAlternativeCollection).toHaveBeenCalledWith(collectionId);
    expect(dsh.supportsLowResolutionAlternativeCollection).not.toHaveBeenCalledWith(datasetId);
    expect(dsh.getLowResolutionCollectionId).toHaveBeenCalledWith(collectionId);
    expect(dsh.getLowResolutionCollectionId).not.toHaveBeenCalledWith(datasetId);
    expect(dsh.getLowResolutionMetersPerPixelThreshold).toHaveBeenCalledWith(collectionId);
    expect(dsh.getLowResolutionMetersPerPixelThreshold).not.toHaveBeenCalledWith(datasetId);

    expect(layer.lowResolutionCollectionId).toBe('low-res-collection-uuid-456');
    expect(layer.lowResolutionMetersPerPixelThreshold).toBe(300);
  });

  it('does not set low-resolution fields when the handler does not support a low-res alternative for the collectionId', async () => {
    dsh.supportsLowResolutionAlternativeCollection.mockReturnValue(false);
    const pin = { datasetId, layerId, visualizationUrl: 'https://example.com/wms' };

    const layer = await layerFromPin(pin, {});

    expect(dsh.supportsLowResolutionAlternativeCollection).toHaveBeenCalledWith(collectionId);
    expect(layer.lowResolutionCollectionId).toBeUndefined();
    expect(layer.lowResolutionMetersPerPixelThreshold).toBeUndefined();
  });
});
