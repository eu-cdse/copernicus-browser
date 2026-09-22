import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import { Provider } from 'react-redux';
import { configureStore } from '@reduxjs/toolkit';

import CollectionSelection from './CollectionSelection';
import { visualizationSlice } from '../../../store/slices/visualizationSlice';
import { clmsSlice } from '../../../store/slices/clmsSlice';
import { externalLayersSlice } from '../../../store/slices/externalLayersSlice';
import { panelSlice } from '../../../store/slices/panelSlice';
import { getDataSourceHandler } from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
} from '../../SearchPanel/dataSourceHandlers/dataSourceConstants';
import {
  ALL_COLLECTIONS_HINT_VALUE,
  DATASOURCES,
  DEFAULT_THEME_ID,
  MODE_THEMES_LIST,
  URL_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
} from '../../../const';

// A JWT whose realm_access.roles includes a CCM role (public-ccm), decodable client-side by
// jwtDecode without signature verification — same pattern as e2e's fake anon JWT.
const CCM_ROLE_ACCESS_TOKEN = [
  Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ realm_access: { roles: ['public-ccm'] } })).toString('base64url'),
  '',
].join('.');
const NO_CCM_ROLE_ACCESS_TOKEN = [
  Buffer.from(JSON.stringify({ alg: 'none', typ: 'JWT' })).toString('base64url'),
  Buffer.from(JSON.stringify({ realm_access: { roles: [] } })).toString('base64url'),
  '',
].join('.');

let mockCurrentTestStore;
jest.mock('../../../store', () => {
  const actual = jest.requireActual('../../../store');
  return {
    __esModule: true,
    ...actual,
    get default() {
      return mockCurrentTestStore;
    },
  };
});

const mockCollectionGroups = [
  {
    datasource: 'S2',
    title: 'Sentinel-2',
    preselectedDataset: 'S2L2A',
    collections: [
      {
        dataset: 'S2L2A',
        title: 'Collection A',
        datasource: 'S2',
        getDescription: () => '',
      },
    ],
  },
];

const mockDemCollectionGroups = [
  {
    datasource: 'DEM CDAS',
    title: 'Copernicus DEM',
    preselectedDataset: 'DEM_COPERNICUS_30_CDAS',
    collections: [
      {
        dataset: 'DEM_COPERNICUS_30_CDAS',
        title: 'Copernicus 30',
        datasource: 'DEM CDAS',
        getDescription: () => '',
      },
      {
        dataset: 'DEM_COPERNICUS_90_CDAS',
        title: 'Copernicus 90',
        datasource: 'DEM CDAS',
        getDescription: () => '',
      },
    ],
  },
];

const mockClmsCollectionGroups = [
  {
    datasource: DATASOURCES.CLMS,
    title: 'CLMS',
    preselectedDataset: undefined,
    collections: [
      {
        dataset: COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
        title: 'clms_global_dmp_300m_v1_10daily_geotiff_RT0',
        datasource: DATASOURCES.CLMS,
        getDescription: () => '',
      },
    ],
  },
];

let mockCreateCollectionGroupsFromDataSourceHandlers = jest.fn(() => mockCollectionGroups);

jest.mock('./CollectionSelection.utils', () => ({
  createCollectionGroupsFromDataSourceHandlers: jest.fn((...args) =>
    mockCreateCollectionGroupsFromDataSourceHandlers(...args),
  ),
  getSelectedCollectionTitle: jest.fn(() => ''),
  displayLatestDateOnSelect: jest.fn(),
}));

jest.mock('../../SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  getDataSourceHandler: jest.fn(() => undefined),
}));

jest.mock('./CollectionSearch', () => ({
  CollectionSearch: () => <div>CollectionSearch</div>,
  CollectionSearchTools: () => <div>CollectionSearchTools</div>,
}));

// Renders as a native <select> so tests can drive `onChange` (i.e. CollectionSelection.jsx's
// `setValue`) with a real option object ({ value, type, parentDataset }), which is what's needed
// to exercise the datasource-level (group header) selection path.
jest.mock('../../../components/SearchableSelect/SearchableSelect', () => ({
  SearchableSelect: ({ options, value, onChange }) => (
    <select
      aria-label="collection-select"
      value={value?.value ?? ''}
      onChange={(e) => {
        const selectedOption = options.find((o) => o.value === e.target.value);
        if (selectedOption) {
          onChange(selectedOption);
        }
      }}
    >
      <option value="" />
      {options.map((o) => (
        // Text content is the raw value, not `o.label` — the label duplicates text already
        // rendered by the (unmocked) collection buttons below, and getByText('Copernicus 30')
        // must resolve to a single element.
        <option key={`${o.type}-${o.value}`} value={o.value} disabled={!!o.isDisabled}>
          {o.value}
        </option>
      ))}
    </select>
  ),
}));

// EOBButton's `text` prop can include a `<CheckmarkSvg/>` child for the selected collection.
// Real (non-virtual) svg imports go through fileTransform.cjs, and the project's jest config
// maps every `.svg`/`.svg?react` specifier to that SAME physical module, so mocking a specific
// svg import here would leak into unrelated svg imports in other test files run in this worker.
// Mocking EOBButton instead (a normal, non-collapsed module) avoids ever creating/reconciling
// that element, sidestepping the issue entirely while keeping the rendered label text intact.
jest.mock('../../../junk/EOBCommon/EOBButton/EOBButton', () => ({
  EOBButton: ({ title, onClick, className }) => (
    <button onClick={onClick} className={className}>
      {title}
    </button>
  ),
}));

function makeStore({
  dataSourcesInitialized,
  dataSourcesReadyVersion,
  dataSourcesLoading,
  datasetId,
  toTime,
  user,
  collectionPanelExpanded,
  useRealClmsReducer,
  useRealExternalLayersReducer,
  externalLayers,
  selectedThemeId = 'theme1',
  selectedThemesListId = MODE_THEMES_LIST,
  urlThemesList = [],
  panel,
}) {
  mockCurrentTestStore = configureStore({
    reducer: {
      themes: (state = { selectedThemeId: 'theme1' }) => state,
      visualization: visualizationSlice.reducer,
      mainMap: (state = {}) => state,
      collapsiblePanel: (state = {}) => state,
      auth: (state = {}) => state,
      clms: useRealClmsReducer ? clmsSlice.reducer : (state = {}) => state,
      externalLayers: useRealExternalLayersReducer ? externalLayersSlice.reducer : (state = {}) => state,
      panel: panelSlice.reducer,
    },
    preloadedState: {
      themes: {
        selectedThemeId,
        selectedThemesListId,
        themesLists: { [URL_THEMES_LIST]: urlThemesList },
        dataSourcesInitialized,
        dataSourcesReadyVersion,
        dataSourcesLoading,
      },
      visualization: { ...visualizationSlice.getInitialState(), datasetId, toTime, cloudCoverage: 0.3 },
      mainMap: { bounds: undefined, pixelBounds: undefined },
      collapsiblePanel: { collectionPanelExpanded: collectionPanelExpanded ?? false },
      auth: { user: user ?? {} },
      clms: useRealClmsReducer ? clmsSlice.getInitialState() : {},
      externalLayers: useRealExternalLayersReducer
        ? { ...externalLayersSlice.getInitialState(), ...externalLayers }
        : {
            servers: [],
            activeServerId: null,
            activeLayerName: null,
            activeLayerId: null,
            activeLayerTime: null,
            lastActiveServerId: null,
            lastActiveLayerName: null,
            lastActiveLayerId: null,
            lastActiveLayerTime: null,
            ...externalLayers,
          },
      panel: { ...panelSlice.getInitialState(), ...panel },
    },
  });
  return mockCurrentTestStore;
}

function renderComponent(preloadedThemesState) {
  const store = makeStore(preloadedThemesState);
  return {
    store,
    ...render(
      <Provider store={store}>
        <CollectionSelection />
      </Provider>,
    ),
  };
}

describe('CollectionSelection', () => {
  it('populates the collection title once dataSourcesReadyVersion advances, even before dataSourcesInitialized', () => {
    renderComponent({
      dataSourcesInitialized: false,
      dataSourcesReadyVersion: 1,
      dataSourcesLoading: false,
      datasetId: 'S2L2A',
    });

    expect(screen.getByText('Collection A')).toBeInTheDocument();
  });

  it('does not populate the collection title while neither readiness signal has fired', () => {
    renderComponent({
      dataSourcesInitialized: false,
      dataSourcesReadyVersion: 0,
      dataSourcesLoading: false,
      datasetId: 'S2L2A',
    });

    expect(screen.queryByText('Collection A')).not.toBeInTheDocument();
  });

  describe('DEM collection - COP DEM 30m CCM gating (issue #1185)', () => {
    beforeEach(() => {
      mockCreateCollectionGroupsFromDataSourceHandlers = jest.fn(() => mockDemCollectionGroups);
      getDataSourceHandler.mockReset();
      getDataSourceHandler.mockReturnValue(undefined);
    });

    afterEach(() => {
      mockCreateCollectionGroupsFromDataSourceHandlers = jest.fn(() => mockCollectionGroups);
    });

    it('hides Copernicus 30 and shows Copernicus 90 in the expanded group for a non-CCM user', () => {
      renderComponent({
        dataSourcesInitialized: true,
        dataSourcesReadyVersion: 0,
        dataSourcesLoading: false,
        datasetId: DEM_COPERNICUS_90_CDAS,
        collectionPanelExpanded: true,
        user: { access_token: NO_CCM_ROLE_ACCESS_TOKEN },
      });

      expect(screen.queryByText('Copernicus 30')).not.toBeInTheDocument();
      expect(screen.getByText('Copernicus 90')).toBeInTheDocument();
    });

    it('shows both Copernicus 30 and Copernicus 90 in the expanded group for a CCM-role user', () => {
      renderComponent({
        dataSourcesInitialized: true,
        dataSourcesReadyVersion: 0,
        dataSourcesLoading: false,
        datasetId: DEM_COPERNICUS_30_CDAS,
        collectionPanelExpanded: true,
        user: { access_token: CCM_ROLE_ACCESS_TOKEN },
      });

      expect(screen.getByText('Copernicus 30')).toBeInTheDocument();
      expect(screen.getByText('Copernicus 90')).toBeInTheDocument();
    });

    it('redirects a non-CCM user viewing Copernicus 30 to Copernicus 90 without wiping the existing date', () => {
      getDataSourceHandler.mockImplementation((datasetId) =>
        datasetId === DEM_COPERNICUS_90_CDAS
          ? { getSibling: () => ({ siblingId: DEM_COPERNICUS_30_CDAS }) }
          : undefined,
      );

      const { store } = renderComponent({
        dataSourcesInitialized: true,
        dataSourcesReadyVersion: 0,
        dataSourcesLoading: false,
        datasetId: DEM_COPERNICUS_30_CDAS,
        toTime: '2024-01-01T00:00:00.000Z',
        user: { access_token: NO_CCM_ROLE_ACCESS_TOKEN },
      });

      const state = store.getState().visualization;
      expect(state.datasetId).toBe(DEM_COPERNICUS_90_CDAS);
      expect(state.toTime).toBe('2024-01-01T00:00:00.000Z');
    });

    it('falls back to Copernicus 90 for a non-CCM user selecting the DEM group header', () => {
      getDataSourceHandler.mockImplementation((datasetId) =>
        datasetId === DEM_COPERNICUS_90_CDAS
          ? {
              getSibling: () => ({ siblingId: DEM_COPERNICUS_30_CDAS }),
              supportsDisplayLatestDateOnSelect: () => false,
            }
          : undefined,
      );

      // Start on an unrelated dataset so the mount-time redirect (tested above) doesn't fire and
      // selecting the group header is the only thing that can change datasetId.
      const { store } = renderComponent({
        dataSourcesInitialized: true,
        dataSourcesReadyVersion: 0,
        dataSourcesLoading: false,
        datasetId: 'S2L2A',
        collectionPanelExpanded: true,
        user: { access_token: NO_CCM_ROLE_ACCESS_TOKEN },
      });

      // mockDemCollectionGroups.preselectedDataset is DEM_COPERNICUS_30_CDAS; selecting the group
      // header (type: 'datasource') should fall back to 90m instead of stranding a non-CCM user
      // on the hidden 30m dataset.
      fireEvent.change(screen.getByLabelText('collection-select'), {
        target: { value: DATASOURCES.DEM_CDAS },
      });

      expect(store.getState().visualization.datasetId).toBe(DEM_COPERNICUS_90_CDAS);
    });
  });

  describe('CLMS category search results (#1170)', () => {
    beforeEach(() => {
      mockCreateCollectionGroupsFromDataSourceHandlers = jest.fn(() => mockClmsCollectionGroups);
    });

    afterEach(() => {
      mockCreateCollectionGroupsFromDataSourceHandlers = jest.fn(() => mockCollectionGroups);
    });

    it('lists an intermediate CLMS category node as a selectable search result', () => {
      renderComponent({
        dataSourcesInitialized: true,
        dataSourcesReadyVersion: 0,
        dataSourcesLoading: false,
        datasetId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
        collectionPanelExpanded: true,
        useRealClmsReducer: true,
      });

      expect(screen.getByText('Dry/Gross Dry Matter Productivity')).toBeInTheDocument();
    });

    it('navigates the CLMS breadcrumb to the category node without loading a layer, when a category result is selected', () => {
      const { store } = renderComponent({
        dataSourcesInitialized: true,
        dataSourcesReadyVersion: 0,
        dataSourcesLoading: false,
        datasetId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
        collectionPanelExpanded: true,
        useRealClmsReducer: true,
      });

      fireEvent.change(screen.getByLabelText('collection-select'), {
        target: { value: 'Dry/Gross Dry Matter Productivity' },
      });

      expect(store.getState().clms.selected).toBe(true);
      expect(store.getState().clms.selectedPath).toBe('Dry/Gross Dry Matter Productivity');
      expect(store.getState().clms.selectedCollection).toBeNull();
      // No concrete leaf dataset is loaded as a result of selecting a category.
      expect(store.getState().visualization.datasetId).toBeUndefined();
    });
  });

  describe('external WMS/WMTS multi-server restore effect (#1236)', () => {
    function renderExternalLayersPanel(externalLayers) {
      return renderComponent({
        dataSourcesInitialized: true,
        dataSourcesReadyVersion: 0,
        dataSourcesLoading: false,
        datasetId: 'S2L2A',
        useRealExternalLayersReducer: true,
        externalLayers,
        panel: { layers: false, wms: true },
      });
    }

    it('switching to a second server while a different server is still remembered does not crash and selects the new server`s own layer', () => {
      // Server A is the previously-remembered one and hasn't had its layers fetched this session
      // yet; server B is the one the user just clicked in ExtraCollectionsPanel and already has its
      // layers loaded. Before the fix, `remembered.layers.find(...)` threw because `remembered` (A)
      // has no `layers` even though `server` (B, the active one) does.
      const { store } = renderExternalLayersPanel({
        servers: [
          { id: 'A', name: 'Server A', url: 'https://a.example/wms', type: 'WMS' },
          {
            id: 'B',
            name: 'Server B',
            url: 'https://b.example/wms',
            type: 'WMS',
            layers: [{ id: 'b-layer1', name: 'b-layer1', title: 'B Layer One' }],
          },
        ],
        activeServerId: 'B',
        lastActiveServerId: 'A',
        lastActiveLayerName: 'a-layer1',
      });

      const state = store.getState().externalLayers;
      expect(state.activeServerId).toBe('B');
      // Falls back to B's own first layer instead of inheriting A's remembered layer name.
      expect(state.activeLayerName).toBe('b-layer1');
    });

    it('completes the restore once the remembered server`s layers load after activation', () => {
      const { store, rerender } = renderExternalLayersPanel({
        servers: [{ id: 'A', name: 'Server A', url: 'https://a.example/wms', type: 'WMS' }],
        activeServerId: null,
        lastActiveServerId: 'A',
        lastActiveLayerName: 'layer1',
        lastActiveLayerTime: '2024-01-01T00:00:00.000Z',
        lastActiveLayerStyle: 'blue',
      });

      // First pass: A's layers aren't loaded yet, so the effect only activates the server.
      expect(store.getState().externalLayers.activeServerId).toBe('A');
      expect(store.getState().externalLayers.activeLayerName).toBeNull();

      // The lazy fetch resolves and the layers land in the store.
      act(() => {
        store.dispatch(
          externalLayersSlice.actions.updateServerLayers({
            serverId: 'A',
            layers: [{ id: 'layer1', name: 'layer1', title: 'Layer One' }],
          }),
        );
      });
      rerender(
        <Provider store={store}>
          <CollectionSelection />
        </Provider>,
      );

      const state = store.getState().externalLayers;
      expect(state.activeLayerName).toBe('layer1');
      expect(state.activeLayerTime).toBe('2024-01-01T00:00:00.000Z');
      expect(state.activeLayerStyle).toBe('blue');
    });

    it('falls back to the server`s first layer when the remembered layer was removed/renamed, without applying the old time/style', () => {
      const { store } = renderExternalLayersPanel({
        servers: [
          {
            id: 'A',
            name: 'Server A',
            url: 'https://a.example/wms',
            type: 'WMS',
            layers: [{ id: 'newLayer', name: 'newLayer', title: 'New Layer' }],
          },
        ],
        activeServerId: null,
        lastActiveServerId: 'A',
        lastActiveLayerName: 'oldLayer',
        lastActiveLayerTime: '2024-01-01T00:00:00.000Z',
        lastActiveLayerStyle: 'blue',
      });

      const state = store.getState().externalLayers;
      expect(state.activeServerId).toBe('A');
      expect(state.activeLayerName).toBe('newLayer');
      // Not the restored layer, so the remembered time/style must not carry over to it.
      expect(state.activeLayerTime).toBeNull();
      expect(state.activeLayerStyle).toBeNull();
    });
  });

  describe('curated collections hint (issue #1221)', () => {
    const renderExpanded = (themesState) =>
      renderComponent({
        dataSourcesInitialized: true,
        dataSourcesReadyVersion: 1,
        dataSourcesLoading: false,
        datasetId: 'S2L2A',
        collectionPanelExpanded: true,
        ...themesState,
      });

    const hintOption = (container) =>
      container.querySelector(`option[value="${ALL_COLLECTIONS_HINT_VALUE}"]`);

    it('appends a disabled hint option for a non-default configuration', () => {
      const { container } = renderExpanded({
        selectedThemeId: 'theme1',
        selectedThemesListId: MODE_THEMES_LIST,
      });

      expect(hintOption(container)).toBeInTheDocument();
      expect(hintOption(container)).toBeDisabled();
    });

    it('renders the hint as the last option', () => {
      const { container } = renderExpanded({
        selectedThemeId: 'theme1',
        selectedThemesListId: MODE_THEMES_LIST,
      });

      const values = [...container.querySelectorAll('option')].map((o) => o.value);
      expect(values[values.length - 1]).toBe(ALL_COLLECTIONS_HINT_VALUE);
    });

    it('omits the hint on the default configuration', () => {
      const { container } = renderExpanded({
        selectedThemeId: DEFAULT_THEME_ID,
        selectedThemesListId: MODE_THEMES_LIST,
      });

      expect(hintOption(container)).not.toBeInTheDocument();
    });

    it('shows the hint for a user instance whose id happens to equal the default theme id', () => {
      const { container } = renderExpanded({
        selectedThemeId: DEFAULT_THEME_ID,
        selectedThemesListId: USER_INSTANCES_THEMES_LIST,
      });

      expect(hintOption(container)).toBeInTheDocument();
    });

    it('omits the hint when a themesUrl replaced the mode themes list', () => {
      const { container } = renderExpanded({
        selectedThemeId: 'theme1',
        selectedThemesListId: URL_THEMES_LIST,
        urlThemesList: [{ id: 'theme1', name: 'Url theme' }],
      });

      expect(hintOption(container)).not.toBeInTheDocument();
    });

    it('omits the hint when no configuration is selected', () => {
      const { container } = renderExpanded({
        selectedThemeId: null,
        selectedThemesListId: MODE_THEMES_LIST,
      });

      expect(hintOption(container)).not.toBeInTheDocument();
    });

    it('omits the hint while the collection panel is collapsed', () => {
      const { container } = renderComponent({
        dataSourcesInitialized: true,
        dataSourcesReadyVersion: 1,
        dataSourcesLoading: false,
        datasetId: 'S2L2A',
        collectionPanelExpanded: false,
        selectedThemeId: 'theme1',
        selectedThemesListId: MODE_THEMES_LIST,
      });

      expect(hintOption(container)).not.toBeInTheDocument();
    });

    it('does not change the selection when the hint is chosen', () => {
      const { container, store } = renderExpanded({
        selectedThemeId: 'theme1',
        selectedThemesListId: MODE_THEMES_LIST,
      });

      const datasetIdBefore = store.getState().visualization.datasetId;
      fireEvent.change(screen.getByLabelText('collection-select'), {
        target: { value: ALL_COLLECTIONS_HINT_VALUE },
      });

      expect(store.getState().visualization.datasetId).toBe(datasetIdBefore);
      expect(hintOption(container)).toBeInTheDocument();
    });
  });
});
