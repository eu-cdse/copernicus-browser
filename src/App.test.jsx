import { App } from './App';
import store, { compareLayersSlice } from './store';
import * as PinUtils from './Tools/Pins/Pin.utils';

jest.mock('./Tools/Pins/Pin.utils', () => ({
  ...jest.requireActual('./Tools/Pins/Pin.utils'),
  saveSharedPinsToServer: jest.fn(),
}));

const baseProps = (overrides = {}) => ({
  comparedLayers: [],
  ...overrides,
});

// Regression tests for issue #1270: compareSharedPinsId used to only be kept in sync with
// comparedLayers by an effect inside ComparePanel.jsx, so a layer added to compare from any other
// panel (Pins, Layers, Highlights — see createLayerActions.js, Pin.jsx, Highlight.jsx) while
// Compare wasn't mounted never reached the backend. App is always mounted, so the sync now lives
// here instead, keyed off the comparedLayers prop directly.
describe('App.componentDidUpdate — keeps compareSharedPinsId in sync with comparedLayers (#1270)', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    store.dispatch(compareLayersSlice.actions.reset());
  });

  it('POSTs comparedLayers to the backend when they change to a non-empty array', async () => {
    PinUtils.saveSharedPinsToServer.mockResolvedValue('new-shared-id');
    const app = new App(baseProps({ comparedLayers: [{ title: 'layer-1' }] }));

    await app.componentDidUpdate(baseProps({ comparedLayers: [] }), {});

    expect(PinUtils.saveSharedPinsToServer).toHaveBeenCalledWith([{ title: 'layer-1' }]);
    expect(store.getState().compare.compareSharedPinsId).toBe('new-shared-id');
  });

  it('clears compareSharedPinsId when comparedLayers becomes empty', async () => {
    store.dispatch(compareLayersSlice.actions.setCompareSharedPinsId('stale-id'));
    const app = new App(baseProps({ comparedLayers: [] }));

    await app.componentDidUpdate(baseProps({ comparedLayers: [{ title: 'layer-1' }] }), {});

    expect(store.getState().compare.compareSharedPinsId).toBeNull();
    expect(PinUtils.saveSharedPinsToServer).not.toHaveBeenCalled();
  });

  it('does nothing when the comparedLayers reference is unchanged', async () => {
    const layers = [{ title: 'layer-1' }];
    const app = new App(baseProps({ comparedLayers: layers }));

    await app.componentDidUpdate(baseProps({ comparedLayers: layers }), {});

    expect(PinUtils.saveSharedPinsToServer).not.toHaveBeenCalled();
  });

  it('does not clear compareSharedPinsId on a failed POST', async () => {
    store.dispatch(compareLayersSlice.actions.setCompareSharedPinsId('previous-id'));
    PinUtils.saveSharedPinsToServer.mockRejectedValue(new Error('backend rejected'));
    const warn = jest.spyOn(console, 'warn').mockImplementation(() => {});
    const app = new App(baseProps({ comparedLayers: [{ title: 'layer-1' }] }));

    await app.componentDidUpdate(baseProps({ comparedLayers: [] }), {});

    expect(store.getState().compare.compareSharedPinsId).toBe('previous-id');
    warn.mockRestore();
  });

  // Regression test for the review-round-3 finding on !1259: a slower POST fired by an earlier
  // comparedLayers change resolving after a faster, later one must not clobber compareSharedPinsId
  // with a stale snapshot's id.
  it('ignores a slower response from an earlier sync once a later one has already resolved', async () => {
    const layer1 = { title: 'layer-1' };
    const layer2 = { title: 'layer-2' };
    let resolveFirst;
    const firstResponse = new Promise((resolve) => {
      resolveFirst = resolve;
    });
    PinUtils.saveSharedPinsToServer
      .mockImplementationOnce(() => firstResponse)
      .mockImplementationOnce(() => Promise.resolve('id-B'));

    const app = new App(baseProps({ comparedLayers: [layer1] }));
    const firstUpdate = app.componentDidUpdate(baseProps({ comparedLayers: [] }), {});

    app.props = baseProps({ comparedLayers: [layer1, layer2] });
    const secondUpdate = app.componentDidUpdate(baseProps({ comparedLayers: [layer1] }), {});
    await secondUpdate;

    expect(store.getState().compare.compareSharedPinsId).toBe('id-B');

    resolveFirst('id-A');
    await firstUpdate;

    expect(store.getState().compare.compareSharedPinsId).toBe('id-B');
  });
});
