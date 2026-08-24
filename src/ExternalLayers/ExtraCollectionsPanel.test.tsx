import React from 'react';
import { act, fireEvent, render, screen, waitFor } from '@testing-library/react';
import { Provider } from 'react-redux';
import { t } from 'ttag';

import store, { authSlice, externalLayersSlice, notificationSlice } from '../store';
import { ExternalServer } from '../store/slices/externalLayersSlice';
import ExtraCollectionsPanel from './ExtraCollectionsPanel';
import { saveExternalServersToServer } from './externalServicesBackend';
import { fetchWmsCapabilities } from './externalLayers.utils';

// The per-page dropdown / other unrelated widgets aren't under test; only saveExternalServersToServer
// (the one call whose rejection status this test exercises) needs to be mocked.
jest.mock('./externalServicesBackend', () => ({
  saveExternalServersToServer: jest.fn(),
}));

// Keep the real URL/validation helpers (validateWmsUrl, getServiceEndpoint, isMeaningful) so the
// component's own guard clauses behave normally; only stub the network-calling capabilities fetchers.
jest.mock('./externalLayers.utils', () => {
  const actual = jest.requireActual('./externalLayers.utils');
  return {
    ...actual,
    fetchWmsCapabilities: jest.fn(),
    fetchWmtsCapabilities: jest.fn(),
  };
});

// The checkmark icon (shown on the active server) isn't a valid component under jest's svg
// transform (see Sentinel1Collection.test.tsx for the same workaround); stub it to a no-op.
jest.mock('../Tools/VisualizationPanel/CollectionSelection/checkmark.svg?react', () => ({
  __esModule: true,
  default: () => null,
}));

const mockedSave = saveExternalServersToServer as jest.Mock;
const mockedFetchWmsCapabilities = fetchWmsCapabilities as jest.Mock;

const WMS_URL = 'https://example.com/wms';

// Minimal-but-valid CapabilitiesResult shape (see CapabilitiesResult in externalLayers.utils.ts).
// version must be '1.1.1' for the WMS version check in handleLoad to pass.
const CAPABILITIES = {
  version: '1.1.1',
  serviceTitle: 'Example WMS',
  format: 'image/png',
  infoFormat: 'text/html',
  serviceAbstract: 'An example WMS service',
  accessConstraints: undefined,
  fees: undefined,
  layers: [{ id: 'layer1', name: 'layer1', title: 'Layer One' }],
};

const EXISTING_SERVER: ExternalServer = {
  id: 'existing-server',
  name: 'Existing Server',
  url: 'https://existing.example/wms',
  type: 'WMS',
  layers: [{ id: 'layer1', name: 'layer1', title: 'Layer One' }],
};

const AUTH_401 = { response: { status: 401 } };
const AUTH_500 = { response: { status: 500 } };

const logIn = () =>
  act(() => {
    store.dispatch(
      authSlice.actions.setUser({
        userdata: { sub: 'user-1' } as unknown as ReturnType<
          typeof authSlice.actions.setUser
        >['payload']['userdata'],
        access_token: 'token-abc',
        token_expiration: Date.now() + 3600_000,
      }),
    );
  });

const renderPanel = () =>
  render(
    <Provider store={store}>
      <ExtraCollectionsPanel />
    </Provider>,
  );

const dispatchedTypes = (spy: jest.SpyInstance) =>
  spy.mock.calls.map(([action]) => (action as { type?: string })?.type);

const loadService = async (url: string) => {
  const input = screen.getByPlaceholderText('Enter a WMS or WMTS URL');
  fireEvent.change(input, { target: { value: url } });
  fireEvent.click(screen.getByRole('button', { name: 'Load' }));
};

describe('ExtraCollectionsPanel backend save error handling', () => {
  beforeEach(() => {
    logIn();
    mockedFetchWmsCapabilities.mockReset().mockResolvedValue(CAPABILITIES);
    mockedSave.mockReset();
  });

  afterEach(() => {
    // Reset auth and any servers this test's flow may have added, so the next test in this file
    // starts from the same clean, logged-out, server-less state (the store singleton is shared
    // across tests within this file).
    act(() => {
      store.dispatch(authSlice.actions.resetUser());
      store.dispatch(notificationSlice.actions.reset());
      store.getState().externalLayers.servers.forEach((s) => {
        store.dispatch(externalLayersSlice.actions.removeExternalServer(s.id));
      });
    });
    jest.restoreAllMocks();
  });

  it('add flow: dispatches setUserAuthError (not displayError) on a 401 and does not add the server', async () => {
    mockedSave.mockRejectedValueOnce(AUTH_401);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    renderPanel();
    await loadService(WMS_URL);

    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(1));

    expect(dispatchSpy).toHaveBeenCalledWith(
      authSlice.actions.setUserAuthError(t`Your authentication has expired`),
    );
    expect(dispatchedTypes(dispatchSpy)).not.toContain(notificationSlice.actions.displayError.type);
    expect(dispatchedTypes(dispatchSpy)).not.toContain(externalLayersSlice.actions.addExternalServer.type);
    expect(screen.queryByText('Example WMS')).not.toBeInTheDocument();
  });

  it('add flow: dispatches displayError (not setUserAuthError) on a non-401 and does not add the server', async () => {
    mockedSave.mockRejectedValueOnce(AUTH_500);
    const dispatchSpy = jest.spyOn(store, 'dispatch');

    renderPanel();
    await loadService(WMS_URL);

    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(1));

    expect(dispatchSpy).toHaveBeenCalledWith(
      notificationSlice.actions.displayError(t`Unable to load the external service.`),
    );
    expect(dispatchedTypes(dispatchSpy)).not.toContain(authSlice.actions.setUserAuthError.type);
    expect(dispatchedTypes(dispatchSpy)).not.toContain(externalLayersSlice.actions.addExternalServer.type);
    expect(screen.queryByText('Example WMS')).not.toBeInTheDocument();
  });

  it('delete flow: dispatches setUserAuthError (not displayError) on a 401 and keeps the server listed', async () => {
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(EXISTING_SERVER));
    });
    mockedSave.mockRejectedValueOnce(AUTH_401);

    const dispatchSpy = jest.spyOn(store, 'dispatch');
    renderPanel();

    fireEvent.click(screen.getByTitle('Remove collection'));

    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(1));

    expect(dispatchSpy).toHaveBeenCalledWith(
      authSlice.actions.setUserAuthError(t`Your authentication has expired`),
    );
    expect(dispatchedTypes(dispatchSpy)).not.toContain(notificationSlice.actions.displayError.type);
    expect(dispatchedTypes(dispatchSpy)).not.toContain(externalLayersSlice.actions.removeExternalServer.type);
    expect(screen.getByText(EXISTING_SERVER.name)).toBeInTheDocument();
  });

  it('delete flow: dispatches displayError (not setUserAuthError) on a non-401 and keeps the server listed', async () => {
    act(() => {
      store.dispatch(externalLayersSlice.actions.addExternalServer(EXISTING_SERVER));
    });
    mockedSave.mockRejectedValueOnce(AUTH_500);

    const dispatchSpy = jest.spyOn(store, 'dispatch');
    renderPanel();

    fireEvent.click(screen.getByTitle('Remove collection'));

    await waitFor(() => expect(mockedSave).toHaveBeenCalledTimes(1));

    expect(dispatchSpy).toHaveBeenCalledWith(
      notificationSlice.actions.displayError(t`Unable to remove the external service.`),
    );
    expect(dispatchedTypes(dispatchSpy)).not.toContain(authSlice.actions.setUserAuthError.type);
    expect(dispatchedTypes(dispatchSpy)).not.toContain(externalLayersSlice.actions.removeExternalServer.type);
    expect(screen.getByText(EXISTING_SERVER.name)).toBeInTheDocument();
  });
});

describe('ExtraCollectionsPanel loading state', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('disables the URL input and swaps the Load button for a spinner while a fetch is in flight', async () => {
    // A never-resolving-until-we-say-so promise lets us assert on the in-between "loading" render,
    // rather than only the before/after states.
    let resolveFetch: (value: typeof CAPABILITIES) => void = () => {};
    const pending = new Promise<typeof CAPABILITIES>((resolve) => {
      resolveFetch = resolve;
    });
    mockedFetchWmsCapabilities.mockReset().mockReturnValueOnce(pending);

    renderPanel();
    await loadService(WMS_URL);

    const input = screen.getByPlaceholderText('Enter a WMS or WMTS URL');
    const loadButton = screen.getByRole('button', { name: 'Load' });
    await waitFor(() => expect(input).toBeDisabled());
    expect(loadButton).not.toHaveTextContent('+');
    expect(loadButton.querySelector('i.fa-spinner.fa-spin')).toBeTruthy();

    await act(async () => {
      resolveFetch(CAPABILITIES);
      await pending;
    });

    await waitFor(() => expect(input).not.toBeDisabled());
    expect(loadButton.querySelector('i.fa-spinner.fa-spin')).toBeFalsy();
    expect(loadButton).toHaveTextContent('+');
  });
});
