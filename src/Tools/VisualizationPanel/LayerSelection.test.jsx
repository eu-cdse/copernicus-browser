import React from 'react';
import { render, screen, waitFor, act, fireEvent } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import LayerSelection from './LayerSelection';
import { visualizationSlice, notificationSlice } from '../../store';
import { loadEvalscriptParsers } from '../../utils/evalscriptParsers';
import { CUSTOM_COMPOSITE_ROUTE } from '../../junk/EOBAdvancedHolder/EOBAdvancedHolder';

let mockCurrentTestStore;
jest.mock('../../store', () => {
  const actual = jest.requireActual('../../store');
  return {
    __esModule: true,
    ...actual,
    get default() {
      return mockCurrentTestStore;
    },
  };
});

jest.mock('@sentinel-hub/sentinelhub-js', () => {
  const actual = jest.requireActual('@sentinel-hub/sentinelhub-js');
  return {
    ...actual,
    LayersFactory: { makeLayers: jest.fn().mockResolvedValue([]) },
  };
});

jest.mock('./Visualizations', () => (props) => (
  <div data-testid="visualizations">
    {props.visualizations.map((layer) => (
      <span key={layer.layerId}>{layer.layerId}</span>
    ))}
    <button onClick={props.setCustomVisualization}>Custom</button>
  </div>
));

// Real loader by default; individual tests override it to simulate a failed chunk load.
jest.mock('../../utils/evalscriptParsers', () => {
  const actual = jest.requireActual('../../utils/evalscriptParsers');
  return { ...actual, loadEvalscriptParsers: jest.fn(actual.loadEvalscriptParsers) };
});

jest.mock('./VisualizationLayer/CustomVisualizationLayer', () => () => <div>CustomVisualizationLayer</div>);

jest.mock('../../Loader/Loader', () => () => <div>Loader</div>);

const mockGetDataSourceHandler = jest.fn();
const mockIsDataSourceReadyForDataset = jest.fn();
jest.mock('../SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  getDataSourceHandler: (...args) => mockGetDataSourceHandler(...args),
  isDataSourceReadyForDataset: (...args) => mockIsDataSourceReadyForDataset(...args),
}));

jest.mock('./VisualizationPanel.utils', () => ({
  sortLayers: (layers) => layers,
}));

jest.mock('./LayerSelection.utils', () => ({
  generateFallbackEvalscript: jest.fn(),
  getDefaultBandNames: jest.fn(),
  getLayerProcessingInfo: jest.fn(() => ({ supportsOpenEO: false, processGraphValue: '' })),
  validateEvalscript: jest.fn(),
  validateProcessGraph: jest.fn(),
}));

jest.mock('../../api/openEO/openEOHelpers', () => ({
  getProcessGraphString: jest.fn(),
  isOpenEoSupported: jest.fn(() => false),
}));

const THEME_ID = 'theme1';
const THEMES_LIST_ID = 'modeThemesList';

const datasourceHandlerA = {
  getUrlsForDataset: () => ['urlA'],
  getSentinelHubDataset: () => null,
  updateLayersOnVisualization: () => false,
  getLayers: () => [{ layerId: 'layerA', url: 'urlA', title: 'Layer A' }],
  supportsCustomLayer: () => false,
};

function makeThemesState() {
  return {
    selectedThemeId: THEME_ID,
    selectedThemesListId: THEMES_LIST_ID,
    themesLists: {
      [THEMES_LIST_ID]: [
        {
          id: THEME_ID,
          content: [{ url: 'urlA', layersExclude: [], layersInclude: [], name: 'ThemeA' }],
        },
      ],
    },
    dataSourcesInitialized: false,
    dataSourcesReadyVersion: 0,
  };
}

function makeStore(preloadedVisualizationState = {}) {
  const initialVisualizationState = visualizationSlice.reducer(undefined, { type: '@@INIT' });
  mockCurrentTestStore = configureStore({
    reducer: {
      visualization: visualizationSlice.reducer,
      themes: (state = makeThemesState()) => state,
      language: (state = { selectedLanguage: 'en' }) => state,
      notification: notificationSlice.reducer,
    },
    preloadedState: {
      visualization: { ...initialVisualizationState, ...preloadedVisualizationState },
    },
  });
  return mockCurrentTestStore;
}

function renderComponent(preloadedVisualizationState) {
  const store = makeStore(preloadedVisualizationState);
  const setLocationHash = jest.fn();
  const utils = render(
    <Provider store={store}>
      <LayerSelection
        displayEffects={false}
        locationHash=""
        setLocationHash={setLocationHash}
        onBackToLayerList={jest.fn()}
        toggleLayerActions={jest.fn()}
        layerActionsOpen={false}
        savePin={jest.fn()}
      />
    </Provider>,
  );
  return { store, setLocationHash, ...utils };
}

describe('LayerSelection', () => {
  beforeEach(() => {
    mockGetDataSourceHandler.mockReset();
    mockIsDataSourceReadyForDataset.mockReset();
  });

  it('does not flash the previous dataset layers when switching to a not-yet-ready dataset', async () => {
    mockGetDataSourceHandler.mockImplementation((id) => (id === 'A' ? datasourceHandlerA : undefined));
    mockIsDataSourceReadyForDataset.mockImplementation((id) => id === 'A');

    const { store } = renderComponent({ datasetId: 'A' });

    await waitFor(() => {
      expect(screen.getByText('layerA')).toBeInTheDocument();
    });

    act(() => {
      store.dispatch(visualizationSlice.actions.setNewDatasetId({ datasetId: 'B' }));
    });

    expect(screen.queryByText('layerA')).not.toBeInTheDocument();
  });

  describe('selecting the custom visualization with an existing evalscript', () => {
    const COMPOSITE_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: ["B04", "B03", "B02", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02, sample.dataMask];
}`;

    // layerA already selected, so the auto-select effect doesn't replace the evalscript
    const SELECTED_LAYER_WITH_EVALSCRIPT = {
      datasetId: 'A',
      layerId: 'layerA',
      visualizationUrl: 'urlA',
      evalscript: COMPOSITE_EVALSCRIPT,
    };

    beforeEach(() => {
      mockGetDataSourceHandler.mockImplementation((id) => (id === 'A' ? datasourceHandlerA : undefined));
      mockIsDataSourceReadyForDataset.mockImplementation((id) => id === 'A');
    });

    it('routes to the composite tab once the parsers are loaded', async () => {
      const { setLocationHash } = renderComponent(SELECTED_LAYER_WITH_EVALSCRIPT);
      await waitFor(() => {
        expect(screen.getByText('layerA')).toBeInTheDocument();
      });

      fireEvent.click(screen.getByText('Custom'));

      await waitFor(() => {
        expect(setLocationHash).toHaveBeenCalledWith(CUSTOM_COMPOSITE_ROUTE);
      });
    });

    it('stays on the layer list and shows an error when the parsers fail to load', async () => {
      const consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
      loadEvalscriptParsers.mockRejectedValueOnce(new Error('chunk load failed'));
      const { store, setLocationHash } = renderComponent(SELECTED_LAYER_WITH_EVALSCRIPT);
      await waitFor(() => {
        expect(screen.getByText('layerA')).toBeInTheDocument();
      });
      setLocationHash.mockClear();

      fireEvent.click(screen.getByText('Custom'));

      await waitFor(() => {
        expect(store.getState().notification.type).toBe('error');
      });
      expect(store.getState().notification.msg).toBe('An unknown error occurred');
      expect(setLocationHash).not.toHaveBeenCalled();
      consoleError.mockRestore();
    });
  });
});
