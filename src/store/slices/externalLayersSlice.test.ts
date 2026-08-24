import { configureStore } from '@reduxjs/toolkit';
import {
  externalLayersSlice,
  externalLayersPersistenceMiddleware,
  ExternalLayersState,
} from './externalLayersSlice';
import { saveExternalServersToServer } from '../../ExternalLayers/externalServicesBackend';
import {
  markExternalLayersHydrated,
  resetExternalLayersHydratedForTests,
} from '../../ExternalLayers/externalLayersPersistence';

jest.mock('../../ExternalLayers/externalServicesBackend', () => {
  const actual = jest.requireActual('../../ExternalLayers/externalServicesBackend');
  return {
    ...actual,
    saveExternalServersToServer: jest.fn().mockResolvedValue(undefined),
  };
});

const {
  hydrateExternalLayers,
  addExternalServer,
  removeExternalServer,
  setActiveExternalLayer,
  setActiveExternalLayerTime,
  clearActiveExternalLayer,
  updateServerLayers,
  setWmsPanelOpen,
} = externalLayersSlice.actions;

const server = (id: string, layerNames: string[] = []) => ({
  id,
  name: `Server ${id}`,
  url: `https://wms.example/${id}`,
  type: 'WMS' as const,
  layers: layerNames.map((n) => ({ id: `${id}-${n}`, name: n, title: n })),
});

describe('externalLayersSlice reducers (external services)', () => {
  it('addExternalServer adds the server and makes it + its first layer active', () => {
    const state = externalLayersSlice.reducer(
      externalLayersSlice.getInitialState(),
      addExternalServer(server('s1', ['cities', 'borders'])),
    );
    expect(state.servers).toHaveLength(1);
    expect(state.activeServerId).toBe('s1');
    expect(state.activeLayerName).toBe('cities');
    expect(state.lastActiveServerId).toBe('s1');
  });

  it('removeExternalServer removes it and clears the active selection when it was active', () => {
    let state = externalLayersSlice.reducer(
      externalLayersSlice.getInitialState(),
      addExternalServer(server('s1', ['cities'])),
    );
    state = externalLayersSlice.reducer(state, removeExternalServer('s1'));
    expect(state.servers).toHaveLength(0);
    expect(state.activeServerId).toBeNull();
    expect(state.activeLayerName).toBeNull();
    expect(state.lastActiveServerId).toBeNull();
  });

  it('setActiveExternalLayer marks the chosen layer active and resolves its id', () => {
    let state = externalLayersSlice.reducer(
      externalLayersSlice.getInitialState(),
      addExternalServer(server('s1', ['cities', 'borders'])),
    );
    state = externalLayersSlice.reducer(
      state,
      setActiveExternalLayer({ serverId: 's1', layerName: 'borders' }),
    );
    expect(state.activeLayerName).toBe('borders');
    expect(state.activeLayerId).toBe('s1-borders');
  });

  it('updateServerLayers applies service metadata when provided (background capabilities refresh)', () => {
    let state = externalLayersSlice.reducer(
      externalLayersSlice.getInitialState(),
      addExternalServer(server('s1', ['cities'])),
    );
    state = externalLayersSlice.reducer(
      state,
      updateServerLayers({
        serverId: 's1',
        layers: [{ id: 's1-cities', name: 'cities', title: 'cities' }],
        serviceAbstract: 'A refreshed description',
        accessConstraints: 'none',
        fees: 'none',
      }),
    );
    const updatedServer = state.servers.find((s) => s.id === 's1');
    expect(updatedServer?.serviceAbstract).toBe('A refreshed description');
    expect(updatedServer?.accessConstraints).toBe('none');
    expect(updatedServer?.fees).toBe('none');
  });

  it('updateServerLayers leaves existing service metadata untouched when not provided (plain layer merge)', () => {
    let state = externalLayersSlice.reducer(
      externalLayersSlice.getInitialState(),
      addExternalServer({ ...server('s1', ['cities']), serviceAbstract: 'Original description' }),
    );
    state = externalLayersSlice.reducer(
      state,
      updateServerLayers({ serverId: 's1', layers: [{ id: 's1-cities', name: 'cities', title: 'cities' }] }),
    );
    expect(state.servers.find((s) => s.id === 's1')?.serviceAbstract).toBe('Original description');
  });
});

describe('externalLayersSlice — selected time persistence', () => {
  const withActiveLayerAndTime = () => {
    let state = externalLayersSlice.reducer(
      externalLayersSlice.getInitialState(),
      addExternalServer(server('s1', ['cities', 'borders'])),
    );
    state = externalLayersSlice.reducer(
      state,
      setActiveExternalLayer({ serverId: 's1', layerName: 'cities' }),
    );
    return externalLayersSlice.reducer(state, setActiveExternalLayerTime('2024-03-15'));
  };

  it('setActiveExternalLayerTime sets both the active and remembered time', () => {
    const state = withActiveLayerAndTime();
    expect(state.activeLayerTime).toBe('2024-03-15');
    expect(state.lastActiveLayerTime).toBe('2024-03-15');
  });

  it('re-selecting the same layer keeps the chosen time', () => {
    let state = withActiveLayerAndTime();
    state = externalLayersSlice.reducer(
      state,
      setActiveExternalLayer({ serverId: 's1', layerName: 'cities' }),
    );
    expect(state.activeLayerTime).toBe('2024-03-15');
    expect(state.lastActiveLayerTime).toBe('2024-03-15');
  });

  it('selecting a different layer resets the time', () => {
    let state = withActiveLayerAndTime();
    state = externalLayersSlice.reducer(
      state,
      setActiveExternalLayer({ serverId: 's1', layerName: 'borders' }),
    );
    expect(state.activeLayerTime).toBeNull();
    expect(state.lastActiveLayerTime).toBeNull();
  });

  it('clearActiveExternalLayer clears the active time but remembers it for restore', () => {
    const state = externalLayersSlice.reducer(withActiveLayerAndTime(), clearActiveExternalLayer());
    expect(state.activeServerId).toBeNull();
    expect(state.activeLayerTime).toBeNull();
    expect(state.lastActiveLayerTime).toBe('2024-03-15');
  });
});

describe('externalLayersSlice.hydrateExternalLayers', () => {
  it('restores durable fields and leaves live-render / panel fields at defaults', () => {
    const initial = externalLayersSlice.getInitialState();
    const payload: ExternalLayersState = {
      ...initial,
      servers: [{ id: 's1', name: 'S', url: 'https://w/wms', type: 'WMS', layers: [] }],
      lastActiveServerId: 's1',
      lastActiveLayerName: 'l',
      lastActiveLayerId: 'lid',
      lastActiveLayerTime: '2024-03-15',
      // these must NOT be restored
      panelOpen: true,
      activeServerId: 's1',
      activeLayerName: 'l',
      activeLayerId: 'lid',
      activeLayerTime: '2024-01-01',
    };

    const next = externalLayersSlice.reducer(initial, hydrateExternalLayers(payload));

    expect(next.servers).toHaveLength(1);
    expect(next.lastActiveServerId).toBe('s1');
    expect(next.lastActiveLayerName).toBe('l');
    expect(next.lastActiveLayerId).toBe('lid');
    expect(next.lastActiveLayerTime).toBe('2024-03-15');
    // transient / live fields stay at their initial defaults
    expect(next.panelOpen).toBe(false);
    expect(next.activeServerId).toBeNull();
    expect(next.activeLayerTime).toBeNull();
  });

  it('defaults missing durable fields safely', () => {
    const initial = externalLayersSlice.getInitialState();
    const next = externalLayersSlice.reducer(
      initial,
      hydrateExternalLayers({ servers: [] } as unknown as ExternalLayersState),
    );
    expect(next.servers).toEqual([]);
    expect(next.lastActiveServerId).toBeNull();
  });
});

describe('externalLayersPersistenceMiddleware — backend save gating', () => {
  const flush = () => new Promise((resolve) => setTimeout(resolve, 0));

  const buildStore = (authState: unknown) =>
    configureStore({
      reducer: {
        externalLayers: externalLayersSlice.reducer,
        auth: () => authState,
      },
      middleware: (getDefaultMiddleware) =>
        getDefaultMiddleware({ serializableCheck: false }).concat(
          externalLayersPersistenceMiddleware.middleware,
        ),
    });

  const loggedInAuth = { user: { userdata: { sub: 'user-1' }, access_token: 'token-123' } };
  const anonymousAuth = { user: null };

  beforeEach(() => {
    (saveExternalServersToServer as jest.Mock).mockClear();
    (saveExternalServersToServer as jest.Mock).mockResolvedValue(undefined);
    markExternalLayersHydrated();
  });

  afterEach(() => {
    resetExternalLayersHydratedForTests();
  });

  it('does not save to the backend before the store has been hydrated, even when logged in', async () => {
    resetExternalLayersHydratedForTests();
    const store = buildStore(loggedInAuth);
    store.dispatch(addExternalServer(server('s1', ['cities'])));
    await flush();
    expect(saveExternalServersToServer).not.toHaveBeenCalled();
  });

  it('saves to the backend when addExternalServer is dispatched while logged in', async () => {
    const store = buildStore(loggedInAuth);
    store.dispatch(addExternalServer(server('s1', ['cities'])));
    await flush();
    expect(saveExternalServersToServer).toHaveBeenCalledTimes(1);
    expect(saveExternalServersToServer).toHaveBeenCalledWith(
      store.getState().externalLayers.servers,
      'token-123',
    );
  });

  it('saves to the backend when removeExternalServer is dispatched while logged in', async () => {
    const store = buildStore(loggedInAuth);
    store.dispatch(addExternalServer(server('s1', ['cities'])));
    await flush();
    (saveExternalServersToServer as jest.Mock).mockClear();

    store.dispatch(removeExternalServer('s1'));
    await flush();
    expect(saveExternalServersToServer).toHaveBeenCalledTimes(1);
  });

  it('saves to the backend when updateServerLayers is dispatched while logged in', async () => {
    const store = buildStore(loggedInAuth);
    store.dispatch(addExternalServer(server('s1', ['cities'])));
    await flush();
    (saveExternalServersToServer as jest.Mock).mockClear();

    store.dispatch(updateServerLayers({ serverId: 's1', layers: [] }));
    await flush();
    expect(saveExternalServersToServer).toHaveBeenCalledTimes(1);
  });

  it('does not save to the backend for a non-mutating action like setActiveExternalLayerTime', async () => {
    const store = buildStore(loggedInAuth);
    store.dispatch(addExternalServer(server('s1', ['cities'])));
    await flush();
    (saveExternalServersToServer as jest.Mock).mockClear();

    store.dispatch(setActiveExternalLayerTime('2024-03-15'));
    await flush();
    expect(saveExternalServersToServer).not.toHaveBeenCalled();
  });

  it('does not save to the backend for setWmsPanelOpen', async () => {
    const store = buildStore(loggedInAuth);
    store.dispatch(setWmsPanelOpen(true));
    await flush();
    expect(saveExternalServersToServer).not.toHaveBeenCalled();
  });

  it('does not save to the backend when the user is anonymous', async () => {
    const store = buildStore(anonymousAuth);
    store.dispatch(addExternalServer(server('s1', ['cities'])));
    await flush();
    expect(saveExternalServersToServer).not.toHaveBeenCalled();
  });

  it('does not save to the backend when the action is tagged meta.skipBackendSave', async () => {
    // ExtraCollectionsPanel persists the backend save itself (pessimistically, before dispatching)
    // and tags the action so the middleware does not issue a redundant PUT.
    const store = buildStore(loggedInAuth);
    store.dispatch({
      ...addExternalServer(server('s1', ['cities'])),
      meta: { skipBackendSave: true },
    });
    await flush();
    expect(saveExternalServersToServer).not.toHaveBeenCalled();
  });

  it('does not throw or crash the dispatch when the backend save rejects', async () => {
    (saveExternalServersToServer as jest.Mock).mockRejectedValue(new Error('network error'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const store = buildStore(loggedInAuth);

    expect(() => store.dispatch(addExternalServer(server('s1', ['cities'])))).not.toThrow();
    await flush();
    expect(warn).toHaveBeenCalled();
    warn.mockRestore();
  });
});
