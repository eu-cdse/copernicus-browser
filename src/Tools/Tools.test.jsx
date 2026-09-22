import { Tools } from './Tools';
import store, { externalLayersSlice, pinsSlice, notificationSlice, tabsSlice } from '../store';
import * as PinUtils from './Pins/Pin.utils';
import { notifyAddedToPins } from '../utils/floatingPanelNotification';
import { isInGroup } from '../Auth/authHelpers';
import { TABS } from '../const';

jest.mock('../utils/floatingPanelNotification', () => ({
  notifyFloatingPanel: jest.fn(),
  notifyAddedToCompare: jest.fn(),
  notifyAddedToPins: jest.fn(),
}));

// Only the backend/local persistence calls are mocked; buildExternalWmsPayload runs for real so the
// pin sent to savePinsToServer/saveLocalPins reflects the actual active external layer.
jest.mock('./Pins/Pin.utils', () => {
  const actual = jest.requireActual('./Pins/Pin.utils');
  return {
    ...actual,
    savePinsToServer: jest.fn(),
    saveLocalPins: jest.fn(),
  };
});

jest.mock('../Auth/authHelpers', () => ({
  ...jest.requireActual('../Auth/authHelpers'),
  isInGroup: jest.fn(),
}));

const addActiveExternalLayer = () => {
  store.dispatch(
    externalLayersSlice.actions.addExternalServer({
      name: 'Test WMS server',
      url: 'https://example.com/wms',
      type: 'WMS',
      layers: [{ id: 'layer-1', name: 'layer', title: 'Layer title' }],
    }),
  );
  return store.getState().externalLayers.activeServerId;
};

const baseProps = (overrides = {}) => ({
  zoom: 5,
  lat: 10,
  lng: 20,
  selectedThemeId: 'theme-1',
  user: { userdata: { sub: 'user-1' } },
  setLastAddedPin: jest.fn(),
  ...overrides,
});

describe('Tools.savePin — external WMS/WMTS pin', () => {
  let serverId;

  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(pinsSlice.actions.reset());
    store.dispatch(notificationSlice.actions.reset());
    serverId = addActiveExternalLayer();
  });

  afterEach(() => {
    store.dispatch(externalLayersSlice.actions.removeExternalServer(serverId));
  });

  it('saves the pin to the backend and sets lastAddedPin on success', async () => {
    PinUtils.savePinsToServer.mockResolvedValue({ uniqueId: 'server-pin-1' });
    const props = baseProps();
    const tools = new Tools(props);

    await tools.savePin();

    expect(PinUtils.savePinsToServer).toHaveBeenCalledWith([
      expect.objectContaining({ externalWms: expect.objectContaining({ layerName: 'layer' }) }),
    ]);
    expect(PinUtils.saveLocalPins).not.toHaveBeenCalled();
    expect(props.setLastAddedPin).toHaveBeenCalledWith('server-pin-1');
    expect(notifyAddedToPins).toHaveBeenCalledTimes(1);
  });

  it('falls back to local storage (without an error notification) when the backend save fails', async () => {
    PinUtils.savePinsToServer.mockRejectedValue(new Error('backend rejected'));
    PinUtils.saveLocalPins.mockReturnValue('local-pin-1');
    const props = baseProps();
    const tools = new Tools(props);

    await tools.savePin();

    expect(PinUtils.saveLocalPins).toHaveBeenCalledWith([
      expect.objectContaining({ externalWms: expect.objectContaining({ layerName: 'layer' }) }),
    ]);
    expect(props.setLastAddedPin).toHaveBeenCalledWith('local-pin-1');
    expect(notifyAddedToPins).toHaveBeenCalledTimes(1);
    expect(store.getState().notification.type).toBeNull();
  });
});

// Covers #1184 F3: showPinPanel (or a not-yet-resolved shared-pins import) must suppress the
// RRD-tab auto-switch on mount so a Pins panel restored from the `panel` URL param, or one about
// to open once a fresh shared-pins import resolves, isn't overridden.
describe('Tools.componentDidMount — RRD tab auto-switch vs. pending Pins-panel switch (#1184 F3)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(tabsSlice.actions.setTabIndex(TABS.SEARCH_TAB));
    isInGroup.mockReturnValue(true);
  });

  it('switches to the Rapid Response Desk tab for an RRD user when the Pins panel is not showing', () => {
    const tools = new Tools(baseProps({ layerId: undefined, showPinPanel: false }));

    tools.componentDidMount();

    expect(store.getState().tabs.selectedTabIndex).toBe(TABS.RAPID_RESPONSE_DESK);
  });

  it('does not switch to the Rapid Response Desk tab when the Pins panel is showing', () => {
    const tools = new Tools(baseProps({ layerId: undefined, showPinPanel: true }));

    tools.componentDidMount();

    expect(store.getState().tabs.selectedTabIndex).toBe(TABS.SEARCH_TAB);
  });

  // Tools.componentDidMount runs, and completes, before App.componentDidMount's async shared-pins
  // import even starts (children mount before their parent), so showPinPanel is still false at
  // this exact point for a *fresh* import — only hasPendingSharedPinsImport (computed synchronously
  // from props in App.jsx's render, independent of that async import) is available in time.
  it('does not switch to the Rapid Response Desk tab while a fresh shared-pins import is pending', () => {
    const tools = new Tools(
      baseProps({ layerId: undefined, showPinPanel: false, hasPendingSharedPinsImport: true }),
    );

    tools.componentDidMount();

    expect(store.getState().tabs.selectedTabIndex).toBe(TABS.SEARCH_TAB);
  });
});

// Covers the reviewer-reported bug: an RRD-group user refreshing while on any Visualize sub-panel
// other than Pins (Layers, Highlights, Compare, WMS) was bounced straight to the Order tab, because
// this guard only ever checked showPinPanel as its "already on Visualize" signal — not the other
// three PANEL values or compareShare, which by then were also explicit/live in the URL.
describe('Tools.componentDidMount — RRD tab auto-switch vs. any explicit Visualize sub-panel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(tabsSlice.actions.setTabIndex(TABS.SEARCH_TAB));
    isInGroup.mockReturnValue(true);
  });

  it.each(['layers', 'highlights', 'wms'])(
    'does not switch to the Rapid Response Desk tab when panel=%s was explicit in the URL',
    (panel) => {
      const tools = new Tools(
        baseProps({ layerId: undefined, showPinPanel: false, panelFromUrlParams: panel }),
      );

      tools.componentDidMount();

      expect(store.getState().tabs.selectedTabIndex).toBe(TABS.SEARCH_TAB);
    },
  );

  it('does not switch to the Rapid Response Desk tab when compareShare is set', () => {
    const tools = new Tools(baseProps({ layerId: undefined, showPinPanel: false, compareShare: true }));

    tools.componentDidMount();

    expect(store.getState().tabs.selectedTabIndex).toBe(TABS.SEARCH_TAB);
  });
});

// A shared-pins import pending at mount correctly suppresses the RRD-tab auto-switch there (see
// above), but if the import settles without opening the Pins panel — cancelled, empty list, or a
// backend error — nothing re-ran that check, permanently stranding an RRD-group user off the tab.
describe('Tools.componentDidUpdate — RRD tab auto-switch once a pending shared-pins import settles', () => {
  // Reused as both prevProps.user and this.props.user so these tests exercise only the
  // hasPendingSharedPinsImport transition, not the unrelated login-transition branch above it
  // (which triggers on `prevProps.user !== this.props.user` — baseProps() builds a new object
  // literal on every call, so two separate calls would otherwise always look like a login).
  const sameUser = { userdata: { sub: 'user-1' }, access_token: 'token' };

  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(tabsSlice.actions.setTabIndex(TABS.SEARCH_TAB));
    isInGroup.mockReturnValue(true);
  });

  it('switches to the Rapid Response Desk tab once a pending shared-pins import settles without showing the Pins panel', () => {
    const tools = new Tools(
      baseProps({
        user: sameUser,
        layerId: undefined,
        showPinPanel: false,
        hasPendingSharedPinsImport: false,
      }),
    );

    tools.componentDidUpdate(
      baseProps({
        user: sameUser,
        layerId: undefined,
        showPinPanel: false,
        hasPendingSharedPinsImport: true,
      }),
    );

    expect(store.getState().tabs.selectedTabIndex).toBe(TABS.RAPID_RESPONSE_DESK);
  });

  it('does not switch to the Rapid Response Desk tab if the settled import opened the Pins panel', () => {
    const tools = new Tools(
      baseProps({
        user: sameUser,
        layerId: undefined,
        showPinPanel: true,
        hasPendingSharedPinsImport: false,
      }),
    );

    tools.componentDidUpdate(
      baseProps({
        user: sameUser,
        layerId: undefined,
        showPinPanel: false,
        hasPendingSharedPinsImport: true,
      }),
    );

    expect(store.getState().tabs.selectedTabIndex).toBe(TABS.SEARCH_TAB);
  });

  it('does not switch tabs when hasPendingSharedPinsImport was already false (no transition)', () => {
    const tools = new Tools(
      baseProps({
        user: sameUser,
        layerId: undefined,
        showPinPanel: false,
        hasPendingSharedPinsImport: false,
      }),
    );

    tools.componentDidUpdate(
      baseProps({
        user: sameUser,
        layerId: undefined,
        showPinPanel: false,
        hasPendingSharedPinsImport: false,
      }),
    );

    expect(store.getState().tabs.selectedTabIndex).toBe(TABS.SEARCH_TAB);
  });
});
