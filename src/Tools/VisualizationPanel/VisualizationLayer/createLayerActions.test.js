import { createLayerActions } from './createLayerActions';
import store, { compareLayersSlice, timelapseSlice } from '../../../store';
import { S2_L2A_CDAS } from '../../SearchPanel/dataSourceHandlers/dataSourceConstants';

// notifyAddedToCompare only dispatches a floating-panel-notification action, but mocking it keeps
// this test focused on the #1202 title/layerId regression rather than that unrelated slice.
jest.mock('../../../utils/floatingPanelNotification', () => ({
  notifyAddedToCompare: jest.fn(),
}));

// window.fathom is a deferred third-party script that's never loaded in the test environment;
// handleFathomTrackEvent already no-ops safely, but mocking it (as ExtraCollectionsPanel.test.tsx
// does) keeps this test from depending on that implementation detail.
jest.mock('../../../utils/fathom', () => ({
  handleFathomTrackEvent: jest.fn(),
}));

const baseProps = (overrides = {}) => ({
  zoom: 5,
  lat: 10,
  lng: 20,
  fromTime: '2024-01-01',
  toTime: '2024-01-01',
  datasetId: S2_L2A_CDAS,
  selectedVisualizationId: '2_TONEMAPPED_NATURAL_COLOR',
  customSelected: false,
  selectedThemeId: 'theme-1',
  ...overrides,
});

const findAction = (props, id) => createLayerActions(props).find((action) => action.id === id);

describe('createLayerActions — #1202 layer title regression', () => {
  beforeEach(() => {
    store.dispatch(compareLayersSlice.actions.reset());
    store.dispatch(timelapseSlice.actions.reset());
  });

  it('addToCompare uses the human-readable layerTitle for the title but keeps the raw layerId', () => {
    const props = baseProps({
      layerTitle: 'Highlight Optimized Natural Color',
      selectedVisualizationId: '2_TONEMAPPED_NATURAL_COLOR',
    });

    findAction(props, 'addToCompare').onClick();

    const [comparedLayer] = store.getState().compare.comparedLayers;
    expect(comparedLayer.title).toBe('Sentinel-2 L2A: Highlight Optimized Natural Color');
    expect(comparedLayer.layerId).toBe('2_TONEMAPPED_NATURAL_COLOR');
  });

  it('falls back to the raw selectedVisualizationId when layerTitle is undefined (e.g. CustomVisualizationLayer)', () => {
    const props = baseProps({
      layerTitle: undefined,
      selectedVisualizationId: '2_TONEMAPPED_NATURAL_COLOR',
    });

    findAction(props, 'addToCompare').onClick();

    const [comparedLayer] = store.getState().compare.comparedLayers;
    expect(comparedLayer.title).toBe('Sentinel-2 L2A: 2_TONEMAPPED_NATURAL_COLOR');
    expect(comparedLayer.layerId).toBe('2_TONEMAPPED_NATURAL_COLOR');
  });

  it('ignores layerTitle and uses "Custom" when customSelected is true', () => {
    const props = baseProps({
      layerTitle: 'Highlight Optimized Natural Color',
      customSelected: true,
    });

    findAction(props, 'addToCompare').onClick();

    const [comparedLayer] = store.getState().compare.comparedLayers;
    expect(comparedLayer.title).toBe('Sentinel-2 L2A: Custom');
    expect(comparedLayer.layerId).toBe('2_TONEMAPPED_NATURAL_COLOR');
  });

  it('addToTimelapse uses the same corrected title as addToCompare', () => {
    const props = baseProps({
      layerTitle: 'Highlight Optimized Natural Color',
      selectedVisualizationId: '2_TONEMAPPED_NATURAL_COLOR',
    });

    findAction(props, 'addToTimelapse').onClick();

    const [pin] = store.getState().timelapse.pins;
    expect(pin.title).toBe('Sentinel-2 L2A: Highlight Optimized Natural Color');
    expect(pin.layerId).toBe('2_TONEMAPPED_NATURAL_COLOR');
  });
});
