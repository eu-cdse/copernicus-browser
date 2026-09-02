import { Tools } from './Tools';
import store, { externalLayersSlice, pinsSlice, notificationSlice } from '../store';
import * as PinUtils from './Pins/Pin.utils';
import { notifyAddedToPins } from '../utils/floatingPanelNotification';

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
