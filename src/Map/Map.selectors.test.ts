import { mapStoreToProps } from './Map.selectors';

const defaultStore = {
  mainMap: {
    lat: 48.5,
    lng: 14.2,
    zoom: 10,
    bounds: { _southWest: { lat: 48, lng: 14 }, _northEast: { lat: 49, lng: 15 } },
    baseLayerId: 'osm',
    enabledOverlaysId: [] as string[],
    is3D: false,
    quicklookOverlays: [] as unknown[],
    filteredQuicklookOverlays: [] as unknown[],
  },
  searchResults: {
    displayingSearchResults: false,
    searchResult: { allResults: [] as unknown[] } as { allResults: unknown[] } | null,
    highlightedTile: null as unknown,
  },
  resultsSection: {
    results: [] as unknown[],
    currentPage: 1,
    sortState: null as unknown,
    filterState: null as unknown,
    highlightedResult: null as unknown,
  },
  aoi: { geometry: null as unknown, bounds: null as unknown, lastEdited: null as unknown },
  loi: { geometry: null as unknown, lastEdited: null as unknown },
  poi: { position: null as unknown, lastEdited: null as unknown },
  timelapse: { displayTimelapseAreaPreview: false },
  visualization: {
    datasetId: 'S2L2A',
    visibleOnMap: true,
    layerId: 'TRUE-COLOR',
    visualizationUrl: 'https://example.com',
    fromTime: '2024-01-01T00:00:00Z',
    toTime: '2024-01-01T23:59:59Z',
    customSelected: false,
    evalscript: '',
    dataFusion: null as unknown,
    cloudCoverage: 100,
    selectedProcessing: null as unknown,
    processGraph: null as unknown,
    gainEffect: 1,
    gammaEffect: 1,
    redRangeEffect: [0, 1],
    greenRangeEffect: [0, 1],
    blueRangeEffect: [0, 1],
    minQa: null as unknown,
    mosaickingOrder: null as unknown,
    upsampling: null as unknown,
    downsampling: null as unknown,
    speckleFilter: null as unknown,
    orthorectification: null as unknown,
    backscatterCoeff: null as unknown,
    demSource3D: null as unknown,
    orbitDirection: [] as string[],
    error: null as unknown,
  },
  themes: { dataSourcesInitialized: true, selectedThemeId: 'default', selectedModeId: null as unknown },
  tabs: { selectedTabIndex: 1, selectedTabSearchPanelIndex: 0 },
  language: { selectedLanguage: 'en' },
  compare: {
    comparedLayers: [] as unknown[],
    comparedOpacity: [] as unknown[],
    comparedClipping: [] as unknown[],
  },
  auth: { user: null as unknown, token: null as unknown },
  commercialData: {
    searchResults: [] as unknown[],
    highlightedResult: null as unknown,
    displaySearchResults: false,
    selectedOrder: null as unknown,
  },
  elevationProfile: { highlightedPoint: null as unknown },
} as const;

type StoreShape = typeof defaultStore;

// Note: overrides are shallow-merged at the top level. To override nested fields,
// spread the full slice: e.g. { visualization: { ...makeStore().visualization, orbitDirection: [] } }
const makeStore = (overrides: Partial<StoreShape> = {}): StoreShape => ({
  ...defaultStore,
  ...overrides,
});

describe('mapStoreToProps', () => {
  it('maps mainMap fields correctly', () => {
    const store = makeStore();
    const props = mapStoreToProps(store);

    expect(props.lat).toBe(48.5);
    expect(props.lng).toBe(14.2);
    expect(props.zoom).toBe(10);
    expect(props.mapBounds).toBe(store.mainMap.bounds);
    expect(props.baseLayerId).toBe('osm');
    expect(props.enabledOverlaysId).toEqual([]);
    expect(props.quicklookOverlays).toEqual([]);
    expect(props.filteredQuicklookOverlays).toEqual([]);
    expect(props.is3D).toBe(false);
  });

  it('maps visualization fields correctly', () => {
    const store = makeStore();
    const props = mapStoreToProps(store);

    expect(props.datasetId).toBe('S2L2A');
    expect(props.visualizationLayerId).toBe('TRUE-COLOR');
    expect(props.visualizationUrl).toBe('https://example.com');
    expect(props.visibleOnMap).toBe(true);
    expect(props.fromTime).toBe('2024-01-01T00:00:00Z');
    expect(props.toTime).toBe('2024-01-01T23:59:59Z');
    expect(props.evalscript).toBe('');
    expect(props.cloudCoverage).toBe(100);
    expect(props.selectedProcessing).toBeNull();
    expect(props.processGraph).toBeNull();
    expect(props.error).toBeNull();
  });

  it('spreads visualization effects from store', () => {
    const store = makeStore();
    const props = mapStoreToProps(store);

    expect(props.gainEffect).toBe(1);
    expect(props.gammaEffect).toBe(1);
    expect(props.redRangeEffect).toEqual([0, 1]);
    expect(props.greenRangeEffect).toEqual([0, 1]);
    expect(props.blueRangeEffect).toEqual([0, 1]);
    expect(props.minQa).toBeNull();
    expect(props.mosaickingOrder).toBeNull();
    expect(props.upsampling).toBeNull();
    expect(props.downsampling).toBeNull();
    expect(props.speckleFilter).toBeNull();
    expect(props.orthorectification).toBeNull();
    expect(props.backscatterCoeff).toBeNull();
    expect(props.demSource3D).toBeNull();
  });

  it('resolves orbitDirection to null when list is empty', () => {
    const props = mapStoreToProps(makeStore());
    expect(props.orbitDirection).toBeNull();
  });

  it('resolves orbitDirection to the single value when list has one entry', () => {
    const store = makeStore({
      visualization: { ...defaultStore.visualization, orbitDirection: ['ASCENDING'] },
    });
    const props = mapStoreToProps(store);
    expect(props.orbitDirection).toBe('ASCENDING');
  });

  it('maps auth slice', () => {
    const store = makeStore();
    const props = mapStoreToProps(store);
    expect(props.auth).toBe(store.auth);
  });

  it('maps compare fields', () => {
    const store = makeStore();
    const props = mapStoreToProps(store);
    expect(props.comparedLayers).toEqual([]);
    expect(props.comparedOpacity).toEqual([]);
    expect(props.comparedClipping).toEqual([]);
  });

  it('returns undefined for searchResults when searchResult is null', () => {
    const store = makeStore({
      searchResults: { displayingSearchResults: false, searchResult: null, highlightedTile: null },
    });
    const props = mapStoreToProps(store);
    expect(props.searchResults).toBeUndefined();
  });

  it('resolves orbitDirection to null when list has more than one entry', () => {
    const store = makeStore({
      visualization: { ...defaultStore.visualization, orbitDirection: ['ASCENDING', 'DESCENDING'] },
    });
    const props = mapStoreToProps(store);
    expect(props.orbitDirection).toBeNull();
  });

  it('maps commercialData fields correctly', () => {
    const store = makeStore();
    const props = mapStoreToProps(store);
    expect(props.commercialDataSearchResults).toEqual([]);
    expect(props.commercialDataHighlightedResult).toBeNull();
    expect(props.commercialDataDisplaySearchResults).toBe(false);
    expect(props.commercialDataSelectedOrder).toBeNull();
  });

  it('maps remaining slices correctly', () => {
    const store = makeStore();
    const props = mapStoreToProps(store);

    // resultsSection
    expect(props.RRDResults).toEqual([]);
    expect(props.currentPage).toBe(1);
    expect(props.highlightedRRDResult).toBeNull();
    expect(props.RRDSortStateResultsSection).toBeNull();
    expect(props.RRDFilterStateResultsSection).toBeNull();

    // aoi / loi / poi
    expect(props.aoiGeometry).toBeNull();
    expect(props.aoiBounds).toBeNull();
    expect(props.aoiLastEdited).toBeNull();
    expect(props.loiGeometry).toBeNull();
    expect(props.loiLastEdited).toBeNull();
    expect(props.poiPosition).toBeNull();
    expect(props.poiLastEdited).toBeNull();

    // themes
    expect(props.dataSourcesInitialized).toBe(true);
    expect(props.selectedThemeId).toBe('default');
    expect(props.selectedModeId).toBeNull();

    // tabs / language
    expect(props.selectedTabIndex).toBe(1);
    expect(props.selectedTabSearchPanelIndex).toBe(0);
    expect(props.selectedLanguage).toBe('en');

    // elevationProfile
    expect(props.elevationProfileHighlightedPoint).toBeNull();

    // timelapse
    expect(props.displayTimelapseAreaPreview).toBe(false);
  });
});
