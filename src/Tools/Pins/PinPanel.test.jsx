import React from 'react';
import { Provider } from 'react-redux';
import { render, screen, waitFor, fireEvent, act } from '@testing-library/react';

import PinPanel from './PinPanel';
import store, { authSlice, pinsSlice, externalLayersSlice } from '../../store';
import { SAVED_PINS, UNSAVED_PINS } from './const';
import * as PinUtils from './Pin.utils';
import { fetchWmtsCapabilities } from '../../ExternalLayers/externalLayers.utils';

// The order-by dropdown (react-select) is not under test and its icons don't render in jsdom.
// Capture the props it receives so tests can trigger onChange with a real ordering option.
let mockLastSelectProps = null;
jest.mock('react-select', () => (props) => {
  mockLastSelectProps = props;
  return null;
});

// The real Pin row pulls in drag-and-drop, preview-image fetching, and several svg icons that are
// unrelated to the remove/removeAll logic under test here (and don't render cleanly in jsdom).
// Stub it with a minimal row exposing just what these tests interact with.
jest.mock('./Pin', () => (props) => (
  <div>
    <span>{props.item.title}</span>
    <button title="Remove pin" onClick={() => props.onRemovePin(props.index)} />
    <button title="Select pin" onClick={() => props.onPinSelect()} />
  </div>
));

jest.mock('./Pin.utils', () => {
  const actual = jest.requireActual('./Pin.utils');
  return {
    ...actual,
    getPinsFromServer: jest.fn().mockResolvedValue([]),
    removePinsFromServer: jest.fn().mockResolvedValue([]),
    savePinsToServer: jest.fn().mockResolvedValue({ pins: [] }),
    getLocalPins: jest.fn().mockReturnValue([]),
    clearLocalPins: jest.fn(),
    writeLocalPins: jest.fn(),
    saveLocalPins: jest.fn(),
  };
});

jest.mock('../../ExternalLayers/externalLayers.utils', () => ({
  fetchWmtsCapabilities: jest.fn(),
  fetchWmsCapabilities: jest.fn(),
}));

const renderPinPanel = (ownProps = {}) =>
  render(
    <Provider store={store}>
      <PinPanel
        showPinPanel={true}
        setShowPinPanel={jest.fn()}
        lastAddedPin={null}
        setLastAddedPin={jest.fn()}
        resetSearch={jest.fn()}
        setSelectedPin={jest.fn()}
        {...ownProps}
      />
    </Provider>,
  );

const setLoggedInUser = () => {
  act(() => {
    store.dispatch(
      authSlice.actions.setUser({
        userdata: { sub: 'user-1' },
        access_token: 'test-token',
        token_expiration: Date.now() + 100000,
      }),
    );
  });
};

const setPins = (pins, pinType) => {
  act(() => {
    store.dispatch(pinsSlice.actions.updatePinsByType({ pins, pinType }));
  });
};

describe('PinPanel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    PinUtils.getPinsFromServer.mockResolvedValue([]);
    PinUtils.removePinsFromServer.mockResolvedValue([]);
    PinUtils.getLocalPins.mockReturnValue([]);
    store.dispatch(pinsSlice.actions.reset());
    store.dispatch(authSlice.actions.resetUser());
    // No bulk reset action exists for externalLayers — remove any servers added by a previous test
    // so `existingServer` lookups by url don't leak across tests.
    store
      .getState()
      .externalLayers.servers.forEach((s) =>
        store.dispatch(externalLayersSlice.actions.removeExternalServer(s.id)),
      );
    window.confirm = jest.fn(() => true);
  });

  describe('onRemoveAllPins', () => {
    it('clears the local pin bucket for logged-in users, not just the backend (regression guard)', async () => {
      setLoggedInUser();
      renderPinPanel();

      await waitFor(() => expect(PinUtils.getPinsFromServer).toHaveBeenCalled());

      // Simulate a saved (backend) pin already loaded, as would happen after a successful fetch.
      setPins([{ _id: 'pin-1', title: 'Backend pin' }], SAVED_PINS);

      await screen.findByTitle('Delete all pins');
      fireEvent.click(screen.getByTitle('Delete all pins'));

      await waitFor(() => expect(PinUtils.removePinsFromServer).toHaveBeenCalledWith(['pin-1']));
      await waitFor(() => expect(PinUtils.clearLocalPins).toHaveBeenCalledWith());
      await waitFor(() => expect(store.getState().pins.items).toHaveLength(0));
    });

    it('clears local pins (WMS pins with no _id) even when there is nothing to delete on the backend', async () => {
      setLoggedInUser();
      renderPinPanel();

      await waitFor(() => expect(PinUtils.getPinsFromServer).toHaveBeenCalled());

      // A pin without a backend _id (e.g. a local WMS pin surfaced under SAVED_PINS) has no id to
      // send to the backend, so onRemoveAllPins takes the "nothing to delete" branch — it must
      // still clear localStorage instead of skipping straight to updateItems([]).
      setPins([{ title: 'Local-only pin' }], SAVED_PINS);

      await screen.findByTitle('Delete all pins');
      fireEvent.click(screen.getByTitle('Delete all pins'));

      expect(PinUtils.removePinsFromServer).not.toHaveBeenCalled();
      await waitFor(() => expect(PinUtils.clearLocalPins).toHaveBeenCalledWith());
      await waitFor(() => expect(store.getState().pins.items).toHaveLength(0));
    });

    it('does not clear local pins or the store when the backend delete fails', async () => {
      setLoggedInUser();
      PinUtils.removePinsFromServer.mockRejectedValue(new Error('delete failed'));
      renderPinPanel();

      await waitFor(() => expect(PinUtils.getPinsFromServer).toHaveBeenCalled());

      setPins([{ _id: 'pin-1', title: 'Backend pin' }], SAVED_PINS);

      await screen.findByTitle('Delete all pins');
      fireEvent.click(screen.getByTitle('Delete all pins'));

      await waitFor(() => expect(PinUtils.removePinsFromServer).toHaveBeenCalledWith(['pin-1']));
      expect(PinUtils.clearLocalPins).not.toHaveBeenCalled();
      expect(store.getState().pins.items).toHaveLength(1);
    });

    it('does nothing when the confirmation dialog is dismissed', async () => {
      setLoggedInUser();
      window.confirm = jest.fn(() => false);
      renderPinPanel();

      await waitFor(() => expect(PinUtils.getPinsFromServer).toHaveBeenCalled());

      setPins([{ _id: 'pin-1', title: 'Backend pin' }], SAVED_PINS);

      await screen.findByTitle('Delete all pins');
      fireEvent.click(screen.getByTitle('Delete all pins'));

      expect(PinUtils.removePinsFromServer).not.toHaveBeenCalled();
      expect(PinUtils.clearLocalPins).not.toHaveBeenCalled();
      expect(store.getState().pins.items).toHaveLength(1);
    });
  });

  describe('onRemovePin', () => {
    it('removes an unsaved (local) pin from localStorage with no backend call', async () => {
      renderPinPanel();

      await waitFor(() => expect(PinUtils.getLocalPins).toHaveBeenCalled());

      setPins([{ _id: 'local-1', title: 'Local pin' }], UNSAVED_PINS);

      await screen.findByTitle('Remove pin');
      fireEvent.click(screen.getByTitle('Remove pin'));

      expect(PinUtils.writeLocalPins).toHaveBeenCalledWith([]);
      expect(PinUtils.removePinsFromServer).not.toHaveBeenCalled();
      await waitFor(() => expect(store.getState().pins.items).toHaveLength(0));
    });

    it('deletes a saved (backend) pin via removePinsFromServer', async () => {
      setLoggedInUser();
      renderPinPanel();

      await waitFor(() => expect(PinUtils.getPinsFromServer).toHaveBeenCalled());

      setPins([{ _id: 'pin-1', title: 'Backend pin' }], SAVED_PINS);

      await screen.findByTitle('Remove pin');
      fireEvent.click(screen.getByTitle('Remove pin'));

      await waitFor(() => expect(PinUtils.removePinsFromServer).toHaveBeenCalledWith(['pin-1']));
      await waitFor(() => expect(store.getState().pins.items).toHaveLength(0));
    });
  });

  describe('componentDidUpdate — login migration', () => {
    it('only clears the anonymous local bucket once the backend save succeeds', async () => {
      PinUtils.getLocalPins.mockReturnValue([{ title: 'Anon pin' }]);
      const saveLocalPinsOnLogin = jest.fn().mockResolvedValue({ pins: [] });
      renderPinPanel({ saveLocalPinsOnLogin });

      await waitFor(() => expect(PinUtils.getLocalPins).toHaveBeenCalled());

      setLoggedInUser();

      await waitFor(() => expect(saveLocalPinsOnLogin).toHaveBeenCalledWith([{ title: 'Anon pin' }]));
      await waitFor(() => expect(PinUtils.clearLocalPins).toHaveBeenCalledWith());
    });

    it('does not clear the anonymous local bucket when the backend save fails', async () => {
      PinUtils.getLocalPins.mockReturnValue([{ title: 'Anon pin' }]);
      const saveLocalPinsOnLogin = jest.fn().mockRejectedValue(new Error('save failed'));
      renderPinPanel({ saveLocalPinsOnLogin });

      await waitFor(() => expect(PinUtils.getLocalPins).toHaveBeenCalled());

      setLoggedInUser();

      await waitFor(() => expect(saveLocalPinsOnLogin).toHaveBeenCalledWith([{ title: 'Anon pin' }]));
      expect(PinUtils.clearLocalPins).not.toHaveBeenCalled();
    });
  });

  describe('componentDidMount — login migration', () => {
    it('migrates anon pins when user already set at mount', async () => {
      PinUtils.getLocalPins.mockReturnValue([{ title: 'Anon pin' }]);
      const saveLocalPinsOnLogin = jest.fn().mockResolvedValue({ pins: [] });
      setLoggedInUser();
      renderPinPanel({ saveLocalPinsOnLogin });

      await waitFor(() => expect(saveLocalPinsOnLogin).toHaveBeenCalledWith([{ title: 'Anon pin' }]));
      await waitFor(() => expect(PinUtils.clearLocalPins).toHaveBeenCalledWith());
    });

    it('clears the UNSAVED array after migrating so migrated pins are not shown twice', async () => {
      PinUtils.getLocalPins.mockReturnValue([{ _id: 'a1', title: 'Anon pin' }]);
      const saveLocalPinsOnLogin = jest.fn().mockResolvedValue({ pins: [{ _id: 'a1', title: 'Anon pin' }] });
      setLoggedInUser();
      renderPinPanel({ saveLocalPinsOnLogin });

      await waitFor(() => expect(saveLocalPinsOnLogin).toHaveBeenCalled());
      // After migration the anon pins live only in SAVED_PINS — not duplicated in UNSAVED_PINS.
      await waitFor(() => {
        const items = store.getState().pins.items;
        expect(items.filter((p) => p.type === UNSAVED_PINS)).toHaveLength(0);
        expect(items.filter((p) => p.type === SAVED_PINS)).toHaveLength(1);
      });
    });

    it('does not clear anon bucket when backend save fails', async () => {
      PinUtils.getLocalPins.mockReturnValue([{ title: 'Anon pin' }]);
      const saveLocalPinsOnLogin = jest.fn().mockRejectedValue(new Error('save failed'));
      setLoggedInUser();
      renderPinPanel({ saveLocalPinsOnLogin });

      await waitFor(() => expect(saveLocalPinsOnLogin).toHaveBeenCalledWith([{ title: 'Anon pin' }]));
      expect(PinUtils.clearLocalPins).not.toHaveBeenCalled();
    });

    it('falls back to fetching existing backend pins when the migration save fails', async () => {
      // User has anon pins to migrate AND already has pins on the backend. If the migration save
      // fails we must still surface the existing backend pins instead of showing nothing (#1166).
      PinUtils.getLocalPins.mockReturnValue([{ title: 'Anon pin' }]);
      PinUtils.getPinsFromServer.mockResolvedValue([{ _id: 'backend-1', title: 'Backend pin' }]);
      const saveLocalPinsOnLogin = jest.fn().mockRejectedValue(new Error('save failed'));
      setLoggedInUser();
      renderPinPanel({ saveLocalPinsOnLogin });

      await waitFor(() => expect(saveLocalPinsOnLogin).toHaveBeenCalledWith([{ title: 'Anon pin' }]));
      // Anon bucket stays intact for a later retry; the existing backend pins are loaded into SAVED_PINS.
      expect(PinUtils.clearLocalPins).not.toHaveBeenCalled();
      await waitFor(() => expect(PinUtils.getPinsFromServer).toHaveBeenCalled());
      await waitFor(() => {
        const savedPins = store.getState().pins.items.filter((p) => p.type === SAVED_PINS);
        expect(savedPins).toHaveLength(1);
        expect(savedPins[0].item.title).toBe('Backend pin');
      });
    });

    it('does not migrate twice when mount and update both fire', async () => {
      PinUtils.getLocalPins.mockReturnValue([{ title: 'Anon pin' }]);
      const saveLocalPinsOnLogin = jest.fn().mockResolvedValue({ pins: [] });
      setLoggedInUser();
      renderPinPanel({ saveLocalPinsOnLogin });

      // Force a second, distinct-reference `user` prop before the mount-time migration's async
      // save has resolved, so componentDidUpdate's login branch also invokes migrateAnonymousPins.
      // The `_anonMigrationDone` guard should prevent this from re-triggering the backend save.
      act(() => {
        store.dispatch(
          authSlice.actions.setUser({
            userdata: { sub: 'user-1' },
            access_token: 'test-token-2',
            token_expiration: Date.now() + 100000,
          }),
        );
      });

      await waitFor(() => expect(saveLocalPinsOnLogin).toHaveBeenCalledWith([{ title: 'Anon pin' }]));
      await waitFor(() => expect(PinUtils.clearLocalPins).toHaveBeenCalledWith());
      expect(saveLocalPinsOnLogin).toHaveBeenCalledTimes(1);
    });

    it('migrates again after logout and a later login with new anon pins', async () => {
      PinUtils.getLocalPins.mockReturnValue([{ title: 'Anon pin 1' }]);
      const saveLocalPinsOnLogin = jest.fn().mockResolvedValue({ pins: [] });
      setLoggedInUser();
      renderPinPanel({ saveLocalPinsOnLogin });

      await waitFor(() => expect(saveLocalPinsOnLogin).toHaveBeenCalledWith([{ title: 'Anon pin 1' }]));
      await waitFor(() => expect(PinUtils.clearLocalPins).toHaveBeenCalledWith());
      expect(saveLocalPinsOnLogin).toHaveBeenCalledTimes(1);

      // Logout resets the `_anonMigrationDone` guard (componentDidUpdate) so a later login can
      // migrate again.
      act(() => {
        store.dispatch(authSlice.actions.resetUser());
      });

      // New anon pins accumulate while logged out, then a different user logs in.
      PinUtils.getLocalPins.mockReturnValue([{ title: 'Anon pin 2' }]);
      act(() => {
        store.dispatch(
          authSlice.actions.setUser({
            userdata: { sub: 'user-2' },
            access_token: 'test-token-3',
            token_expiration: Date.now() + 100000,
          }),
        );
      });

      await waitFor(() => expect(saveLocalPinsOnLogin).toHaveBeenCalledWith([{ title: 'Anon pin 2' }]));
      expect(saveLocalPinsOnLogin).toHaveBeenCalledTimes(2);
    });
  });

  describe('componentDidUpdate — lastAddedPin', () => {
    it('moves the just-added pin to the top when the backend returns it out of order', async () => {
      setLoggedInUser();
      const { rerender } = renderPinPanel({ lastAddedPin: null });

      await waitFor(() => expect(PinUtils.getPinsFromServer).toHaveBeenCalled());

      // Backend GET order is not guaranteed; the newly added pin ("pin-2") comes back last.
      PinUtils.getPinsFromServer.mockResolvedValue([
        { _id: 'pin-1', title: 'Older pin' },
        { _id: 'pin-2', title: 'Just added pin' },
      ]);

      rerender(
        <Provider store={store}>
          <PinPanel
            showPinPanel={true}
            setShowPinPanel={jest.fn()}
            lastAddedPin={'pin-2'}
            setLastAddedPin={jest.fn()}
            resetSearch={jest.fn()}
            setSelectedPin={jest.fn()}
          />
        </Provider>,
      );

      await waitFor(() =>
        expect(store.getState().pins.items.map((pinItem) => pinItem.item._id)).toEqual(['pin-2', 'pin-1']),
      );
    });
  });

  describe('order by Dataset ID', () => {
    it('sorts a mixed list of native and external WMS/WMTS pins without throwing (regression guard)', async () => {
      // External WMS/WMTS pins carry datasetId: null/undefined once persisted (see #1076).
      PinUtils.getLocalPins.mockReturnValue([{ _id: 'pin-3', title: 'External WMS', datasetId: null }]);
      setLoggedInUser();
      renderPinPanel();

      // The user is already set at mount, so componentDidMount attempts anon-pin migration
      // (getLocalPins also returns the mocked pin for the anonymous key here) instead of the
      // plain fetchUserPins fallback.
      await waitFor(() => expect(PinUtils.getLocalPins).toHaveBeenCalled());
      setPins(
        [
          { _id: 'pin-1', title: 'Native B', datasetId: 'B' },
          { _id: 'pin-2', title: 'Native A', datasetId: 'A' },
        ],
        SAVED_PINS,
      );

      await waitFor(() => expect(mockLastSelectProps).not.toBeNull());
      const datasetIdAscending = mockLastSelectProps.options.find(
        (option) => option.value === 'Dataset ID ascending',
      );

      expect(() =>
        act(() => {
          mockLastSelectProps.onChange(datasetIdAscending);
        }),
      ).not.toThrow();

      await waitFor(() =>
        expect(store.getState().pins.items.map((pinItem) => pinItem.item.title)).toEqual([
          'External WMS',
          'Native A',
          'Native B',
        ]),
      );
    });
  });

  describe('onPinSelect — external WMTS pin restore', () => {
    const wmtsPin = {
      _id: 'pin-wmts-1',
      title: 'WMTS pin',
      externalWms: {
        url: 'https://example.com/wmts',
        layerName: 'layer1',
        layerTitle: 'Layer 1',
        tileUrl: 'https://example.com/wmts/{z}/{x}/{y}.png',
        tileSize: 512,
        type: 'WMTS',
        serverName: 'Example WMTS',
        version: '1.0.0',
        format: 'image/png',
        queryable: false,
      },
    };

    it('restores the service description/access constraints/fees dropped when a removed service is re-added (#1205)', async () => {
      fetchWmtsCapabilities.mockResolvedValue({
        layers: [{ id: 'l1', name: 'layer1', title: 'Layer 1' }],
        serviceAbstract: 'Refreshed description',
        accessConstraints: 'none',
        fees: 'none',
      });

      renderPinPanel();
      await waitFor(() => expect(PinUtils.getLocalPins).toHaveBeenCalled());

      setPins([wmtsPin], UNSAVED_PINS);

      await screen.findByTitle('Select pin');
      act(() => {
        fireEvent.click(screen.getByTitle('Select pin'));
      });

      await waitFor(() => expect(fetchWmtsCapabilities).toHaveBeenCalledWith('https://example.com/wmts'));

      await waitFor(() => {
        const server = store
          .getState()
          .externalLayers.servers.find((s) => s.url === 'https://example.com/wmts');
        expect(server?.serviceAbstract).toBe('Refreshed description');
        expect(server?.accessConstraints).toBe('none');
        expect(server?.fees).toBe('none');
      });
    });
  });
});
