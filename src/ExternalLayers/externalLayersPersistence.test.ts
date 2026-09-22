import {
  loadPersistedExternalLayers,
  persistExternalLayers,
  loadPersistedServers,
  clearPersistedExternalLayers,
  markExternalLayersHydrated,
  resetExternalLayersHydratedForTests,
} from './externalLayersPersistence';
import { externalLayersSlice, ExternalLayersState } from '../store/slices/externalLayersSlice';

// Anonymous servers live in a single, non-user-suffixed sessionStorage bucket (logged-in servers
// live in the backend). No per-user isolation to test any more.
const KEY = 'browser_external_services';
const DATE_KEY = 'browser_external_wms_date';
const STYLE_KEY = 'browser_external_wms_style';

const sampleState = (): ExternalLayersState => ({
  ...externalLayersSlice.getInitialState(),
  servers: [{ id: 's1', name: 'Test', url: 'https://wms.example/wms', type: 'WMS', layers: [] }],
  lastActiveServerId: 's1',
  lastActiveLayerName: 'layerA',
  lastActiveLayerId: 'l1',
  lastActiveLayerTime: '2024-03-15',
  lastActiveLayerStyle: 'ndvi',
  // transient / live fields that must NOT be persisted
  activeServerId: 's1',
  activeLayerName: 'layerA',
  activeLayerId: 'l1',
  activeLayerTime: '2024-01-01',
  activeLayerStyle: 'ndvi',
});

describe('externalLayersPersistence (sessionStorage, single anonymous bucket)', () => {
  beforeEach(() => {
    sessionStorage.clear();
    resetExternalLayersHydratedForTests();
  });

  describe('loadPersistedExternalLayers', () => {
    test('returns undefined when nothing is stored', () => {
      expect(loadPersistedExternalLayers()).toBeUndefined();
    });

    test('returns undefined for corrupt JSON', () => {
      sessionStorage.setItem(KEY, '{not valid json');
      expect(loadPersistedExternalLayers()).toBeUndefined();
    });

    test('returns undefined when the stored payload has no servers array', () => {
      sessionStorage.setItem(KEY, JSON.stringify({ foo: true }));
      expect(loadPersistedExternalLayers()).toBeUndefined();
    });

    test('restores the durable fields and leaves live-render fields at defaults', () => {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          servers: [{ id: 's1', name: 'Test', url: 'https://wms.example/wms', type: 'WMS', layers: [] }],
          lastActiveServerId: 's1',
          lastActiveLayerName: 'layerA',
          lastActiveLayerId: 'l1',
        }),
      );
      const loaded = loadPersistedExternalLayers();
      expect(loaded?.servers).toHaveLength(1);
      expect(loaded?.lastActiveServerId).toBe('s1');
      // transient / live fields come from initialState, not from storage
      expect(loaded?.activeServerId).toBeNull();
      expect(loaded?.activeLayerTime).toBeNull();
      expect(loaded?.activeLayerStyle).toBeNull();
    });

    test('restores the selected style from its own key', () => {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          servers: [{ id: 's1', name: 'Test', url: 'https://wms.example/wms', type: 'WMS', layers: [] }],
        }),
      );
      sessionStorage.setItem(STYLE_KEY, 'ndvi');
      expect(loadPersistedExternalLayers()?.lastActiveLayerStyle).toBe('ndvi');
    });

    test('leaves the style null when nothing is stored under the style key', () => {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          servers: [{ id: 's1', name: 'Test', url: 'https://wms.example/wms', type: 'WMS', layers: [] }],
        }),
      );
      expect(loadPersistedExternalLayers()?.lastActiveLayerStyle).toBeNull();
    });

    // Regression (#1236): a bucket written by an older app version (before layers were stripped on
    // write) may still have a populated `layers` array on its servers. Hydration must strip it too —
    // otherwise useExternalServerLayers would treat the stale array as already-fetched and never
    // refresh it for the rest of the session.
    test('strips a legacy stored bucket whose servers still carry a `layers` array', () => {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          servers: [
            {
              id: 's1',
              name: 'Legacy Test',
              url: 'https://wms.example/wms',
              type: 'WMS',
              addedAt: '2023-01-01T00:00:00.000Z',
              layers: [{ id: 'l1', name: 'layerA', title: 'Layer A' }],
            },
          ],
          lastActiveServerId: 's1',
          lastActiveLayerName: 'layerA',
          lastActiveLayerId: 'l1',
        }),
      );
      const loaded = loadPersistedExternalLayers();
      expect(loaded?.servers).toHaveLength(1);
      expect(loaded?.lastActiveServerId).toBe('s1');
      // The legacy `layers` array is stripped on read, same as on write, so the server is treated
      // as not-yet-fetched and useExternalServerLayers refreshes it.
      expect(loaded?.servers[0]).toEqual({
        id: 's1',
        name: 'Legacy Test',
        url: 'https://wms.example/wms',
        type: 'WMS',
        addedAt: '2023-01-01T00:00:00.000Z',
      });
    });
  });

  describe('persistExternalLayers', () => {
    test('does nothing before hydration (so it cannot clobber a saved bucket on startup)', () => {
      persistExternalLayers(sampleState());
      expect(sessionStorage.getItem(KEY)).toBeNull();
    });

    test('persists only durable fields after hydration', () => {
      markExternalLayersHydrated();
      persistExternalLayers(sampleState());
      const stored = JSON.parse(sessionStorage.getItem(KEY) || '{}');
      expect(stored.servers).toHaveLength(1);
      expect(stored.lastActiveServerId).toBe('s1');
      // transient / live fields are not written
      expect(stored).not.toHaveProperty('activeServerId');
      expect(stored).not.toHaveProperty('activeLayerTime');
      // the date is NOT kept in the bucket — it lives in its own key
      expect(stored).not.toHaveProperty('lastActiveLayerTime');
      // same for the style
      expect(stored).not.toHaveProperty('lastActiveLayerStyle');
    });

    test('removes the key when the last server is removed', () => {
      markExternalLayersHydrated();
      persistExternalLayers(sampleState());
      expect(sessionStorage.getItem(KEY)).not.toBeNull();
      // Removing all servers must not leave a stray `{servers:[]}` entry behind.
      persistExternalLayers({ ...sampleState(), servers: [] });
      expect(sessionStorage.getItem(KEY)).toBeNull();
    });

    test('stores the selected date under a separate key', () => {
      markExternalLayersHydrated();
      persistExternalLayers(sampleState());
      expect(sessionStorage.getItem(DATE_KEY)).toBe('2024-03-15');
    });

    test('clears the stored date when there is no selected date', () => {
      markExternalLayersHydrated();
      sessionStorage.setItem(DATE_KEY, '2024-03-15');
      persistExternalLayers({ ...sampleState(), lastActiveLayerTime: null });
      expect(sessionStorage.getItem(DATE_KEY)).toBeNull();
    });

    test('stores the selected style under a separate key', () => {
      markExternalLayersHydrated();
      persistExternalLayers(sampleState());
      expect(sessionStorage.getItem(STYLE_KEY)).toBe('ndvi');
    });

    test('clears the stored style when there is no selected style', () => {
      markExternalLayersHydrated();
      sessionStorage.setItem(STYLE_KEY, 'ndvi');
      persistExternalLayers({ ...sampleState(), lastActiveLayerStyle: null });
      expect(sessionStorage.getItem(STYLE_KEY)).toBeNull();
    });

    test('round-trips through load', () => {
      markExternalLayersHydrated();
      persistExternalLayers(sampleState());
      const loaded = loadPersistedExternalLayers();
      expect(loaded?.servers[0].url).toBe('https://wms.example/wms');
      expect(loaded?.lastActiveLayerTime).toBe('2024-03-15');
      // Regression (#1162): the chosen style must survive a reload/login redirect too, instead of
      // silently reverting to the server's default style.
      expect(loaded?.lastActiveLayerStyle).toBe('ndvi');
    });

    test('degrades gracefully when storage throws', () => {
      markExternalLayersHydrated();
      const spy = jest.spyOn(Storage.prototype, 'setItem').mockImplementation(() => {
        throw new Error('QuotaExceededError');
      });
      const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
      expect(() => persistExternalLayers(sampleState())).not.toThrow();
      expect(warn).toHaveBeenCalled();
      spy.mockRestore();
      warn.mockRestore();
    });

    // Regression (#1236): `layers` is a runtime-only cache fetched from GetCapabilities on demand
    // and must never be written to storage, but every other durable server field must survive as-is.
    test('strips the runtime `layers` cache from each server, preserving all other fields', () => {
      markExternalLayersHydrated();
      const stateWithLayers: ExternalLayersState = {
        ...sampleState(),
        servers: [
          {
            id: 's1',
            name: 'Test WMS',
            url: 'https://wms.example/wms',
            type: 'WMS',
            addedAt: '2024-01-01T00:00:00.000Z',
            layers: [
              { id: 'l1', name: 'layerA', title: 'Layer A' },
              { id: 'l2', name: 'layerB', title: 'Layer B' },
            ],
          },
          {
            id: 's2',
            name: 'Test WMTS',
            url: 'https://wmts.example/wmts',
            type: 'WMTS',
            addedAt: '2024-02-02T00:00:00.000Z',
            layers: [{ id: 'l3', name: 'layerC', title: 'Layer C' }],
          },
        ],
      };
      persistExternalLayers(stateWithLayers);
      const stored = JSON.parse(sessionStorage.getItem(KEY) || '{}');
      expect(stored.servers).toHaveLength(2);
      // Assert via `in` (not just an empty array) so a bug that writes `layers: []` instead of
      // omitting the key entirely would still fail this test.
      stored.servers.forEach((server: Record<string, unknown>) => {
        expect('layers' in server).toBe(false);
      });
      expect(stored.servers[0]).toEqual({
        id: 's1',
        name: 'Test WMS',
        url: 'https://wms.example/wms',
        type: 'WMS',
        addedAt: '2024-01-01T00:00:00.000Z',
      });
      expect(stored.servers[1]).toEqual({
        id: 's2',
        name: 'Test WMTS',
        url: 'https://wmts.example/wmts',
        type: 'WMTS',
        addedAt: '2024-02-02T00:00:00.000Z',
      });
    });
  });

  describe('loadPersistedServers', () => {
    test('returns [] when nothing is stored', () => {
      expect(loadPersistedServers()).toEqual([]);
    });

    test('returns [] for corrupt JSON', () => {
      sessionStorage.setItem(KEY, '{not valid json');
      expect(loadPersistedServers()).toEqual([]);
    });

    test('returns [] when the stored payload has no servers array', () => {
      sessionStorage.setItem(KEY, JSON.stringify({ foo: true }));
      expect(loadPersistedServers()).toEqual([]);
    });

    test('returns the stored servers without requiring hydration to be marked', () => {
      sessionStorage.setItem(
        KEY,
        JSON.stringify({
          servers: [{ id: 's1', name: 'Test', url: 'https://wms.example/wms', type: 'WMS', layers: [] }],
        }),
      );
      expect(loadPersistedServers()).toHaveLength(1);
      expect(loadPersistedServers()[0].url).toBe('https://wms.example/wms');
    });
  });

  describe('clearPersistedExternalLayers', () => {
    test('removes the bucket', () => {
      markExternalLayersHydrated();
      persistExternalLayers(sampleState());
      clearPersistedExternalLayers();
      expect(sessionStorage.getItem(KEY)).toBeNull();
      expect(loadPersistedServers()).toEqual([]);
    });

    test('is a no-op when nothing was stored', () => {
      expect(() => clearPersistedExternalLayers()).not.toThrow();
    });
  });
});
