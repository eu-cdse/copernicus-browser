import React from 'react';
import { act, renderHook, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';

import store, { externalLayersSlice } from '../store';
import { ExternalServer } from '../store/slices/externalLayersSlice';
import { fetchWmsCapabilities, fetchWmtsCapabilities } from './externalLayers.utils';
import { makeExternalServer } from './testFixtures/externalServer';
import { useExternalServerLayers } from './useExternalServerLayers';

// Keep the real URL/helpers (not exercised here); only stub the network-calling capabilities
// fetchers, same as ExtraCollectionsPanel.test.tsx. `fetchCapabilities` is a thin same-module
// dispatch over the two below (see externalLayers.utils.ts) — it must be re-mocked here too,
// delegating to the mocks, since a same-module call bypasses jest's mock of its sibling exports.
jest.mock('./externalLayers.utils', () => {
  const fetchWmsCapabilities = jest.fn();
  const fetchWmtsCapabilities = jest.fn();
  return {
    ...jest.requireActual('./externalLayers.utils'),
    fetchWmsCapabilities,
    fetchWmtsCapabilities,
    fetchCapabilities: jest.fn((type: 'WMS' | 'WMTS', url: string) =>
      type === 'WMTS' ? fetchWmtsCapabilities(url) : fetchWmsCapabilities(url),
    ),
  };
});

const mockedFetchWmsCapabilities = fetchWmsCapabilities as jest.Mock;
const mockedFetchWmtsCapabilities = fetchWmtsCapabilities as jest.Mock;

const wrapper = ({ children }: { children: React.ReactNode }) => (
  <Provider store={store}>{children}</Provider>
);

const makeServer = (overrides: Partial<ExternalServer> & Pick<ExternalServer, 'id'>): ExternalServer =>
  makeExternalServer(overrides.id, overrides);

const CAPABILITIES = {
  layers: [{ id: 'layer1', name: 'layer1', title: 'Layer One' }],
  version: '1.3.0',
  format: 'image/png',
  serviceTitle: 'Example WMS',
  serviceAbstract: 'An example WMS service',
  accessConstraints: undefined,
  fees: undefined,
};

describe('useExternalServerLayers', () => {
  afterEach(() => {
    // The store singleton is shared across tests in this file; remove any servers a test added so
    // the next one starts clean.
    act(() => {
      store.getState().externalLayers.servers.forEach((s) => {
        store.dispatch(externalLayersSlice.actions.removeExternalServer(s.id));
      });
    });
    jest.clearAllMocks();
  });

  it('fetches capabilities and dispatches updateServerLayers when the server has no layers yet', async () => {
    const server = makeServer({ id: 'srv-no-layers' });
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(server));
    });
    mockedFetchWmsCapabilities.mockResolvedValueOnce(CAPABILITIES);

    const { result } = renderHook(() => useExternalServerLayers(server), { wrapper });

    expect(result.current.loading).toBe(true);

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(mockedFetchWmsCapabilities).toHaveBeenCalledTimes(1);
    expect(mockedFetchWmsCapabilities).toHaveBeenCalledWith(server.url);
    expect(mockedFetchWmtsCapabilities).not.toHaveBeenCalled();
    expect(store.getState().externalLayers.servers.find((s) => s.id === 'srv-no-layers')?.layers).toEqual(
      CAPABILITIES.layers,
    );
  });

  it('does not fetch when server.layers is already populated', async () => {
    const server = makeServer({
      id: 'srv-has-layers',
      layers: [{ id: 'layer1', name: 'layer1', title: 'Layer One' }],
    });

    const { result } = renderHook(() => useExternalServerLayers(server), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockedFetchWmsCapabilities).not.toHaveBeenCalled();
    expect(mockedFetchWmtsCapabilities).not.toHaveBeenCalled();
  });

  it('does nothing when server is undefined', () => {
    const { result } = renderHook(() => useExternalServerLayers(undefined), { wrapper });

    expect(result.current.loading).toBe(false);
    expect(result.current.error).toBeNull();
    expect(mockedFetchWmsCapabilities).not.toHaveBeenCalled();
    expect(mockedFetchWmtsCapabilities).not.toHaveBeenCalled();
  });

  it('dedupes concurrent fetches for the same server id across hook instances', async () => {
    const server = makeServer({ id: 'srv-concurrent' });
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(server));
    });

    let resolveFetch: (value: typeof CAPABILITIES) => void = () => {};
    const pending = new Promise<typeof CAPABILITIES>((resolve) => {
      resolveFetch = resolve;
    });
    mockedFetchWmsCapabilities.mockReturnValueOnce(pending);

    const { result: result1 } = renderHook(() => useExternalServerLayers(server), { wrapper });
    const { result: result2 } = renderHook(() => useExternalServerLayers(server), { wrapper });

    expect(result1.current.loading).toBe(true);
    expect(result2.current.loading).toBe(true);
    expect(mockedFetchWmsCapabilities).toHaveBeenCalledTimes(1);

    await act(async () => {
      resolveFetch(CAPABILITIES);
      await pending;
    });

    await waitFor(() => expect(result1.current.loading).toBe(false));
    await waitFor(() => expect(result2.current.loading).toBe(false));

    expect(result1.current.error).toBeNull();
    expect(result2.current.error).toBeNull();
    expect(mockedFetchWmsCapabilities).toHaveBeenCalledTimes(1);
  });

  it('surfaces a classified error string when the fetch rejects, without throwing', async () => {
    const server = makeServer({ id: 'srv-rejects' });
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(server));
    });
    mockedFetchWmsCapabilities.mockRejectedValueOnce(new Error('network down'));

    const { result } = renderHook(() => useExternalServerLayers(server), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(
      'Could not reach the server. It may be offline or may not allow cross-origin (CORS) access.',
    );
  });

  it('classifies an HttpError rejection with its status code', async () => {
    const server = makeServer({ id: 'srv-http-error' });
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(server));
    });
    const httpError = new Error('bad gateway') as Error & { status?: number };
    httpError.name = 'HttpError';
    httpError.status = 502;
    mockedFetchWmsCapabilities.mockRejectedValueOnce(httpError);

    const { result } = renderHook(() => useExternalServerLayers(server), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBe(
      'The server returned an error (HTTP 502). Check the URL and try again.',
    );
  });

  it('retry() triggers a fresh fetch after a failure', async () => {
    const server = makeServer({ id: 'srv-retry' });
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(server));
    });
    mockedFetchWmsCapabilities.mockRejectedValueOnce(new Error('boom'));

    const { result } = renderHook(() => useExternalServerLayers(server), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).not.toBeNull();
    expect(mockedFetchWmsCapabilities).toHaveBeenCalledTimes(1);

    mockedFetchWmsCapabilities.mockResolvedValueOnce(CAPABILITIES);

    act(() => {
      result.current.retry();
    });

    await waitFor(() => expect(mockedFetchWmsCapabilities).toHaveBeenCalledTimes(2));
    await waitFor(() => expect(result.current.loading).toBe(false));
    expect(result.current.error).toBeNull();
  });

  it('calls fetchWmtsCapabilities (not fetchWmsCapabilities) for a WMTS server', async () => {
    const server = makeServer({ id: 'srv-wmts', type: 'WMTS' });
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(server));
    });
    mockedFetchWmtsCapabilities.mockResolvedValueOnce(CAPABILITIES);

    const { result } = renderHook(() => useExternalServerLayers(server), { wrapper });

    await waitFor(() => expect(result.current.loading).toBe(false));

    expect(result.current.error).toBeNull();
    expect(mockedFetchWmtsCapabilities).toHaveBeenCalledWith(server.url);
    expect(mockedFetchWmsCapabilities).not.toHaveBeenCalled();
  });
});
