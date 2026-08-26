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
  panelOpen: true,
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
      sessionStorage.setItem(KEY, JSON.stringify({ panelOpen: true }));
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
          panelOpen: true,
        }),
      );
      const loaded = loadPersistedExternalLayers();
      expect(loaded?.servers).toHaveLength(1);
      expect(loaded?.lastActiveServerId).toBe('s1');
      // transient / live fields come from initialState, not from storage
      expect(loaded?.panelOpen).toBe(false);
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
      expect(stored).not.toHaveProperty('panelOpen');
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
      sessionStorage.setItem(KEY, JSON.stringify({ panelOpen: true }));
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
