import { AdvancedSearch } from './AdvancedSearch';
import { ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY } from '../../../../const';
import { recursiveCollections } from './collectionFormConfig';
import { getCollectionFormConfig } from './collectionFormConfig.utils';

// Regression test for issue #1270's review round 2: dispatchSearchResult used to persist a
// brand-new session-config object with no spread of the existing entry, unlike its sibling call
// sites (backToSearch, ResultItem.jsx). Since AdvancedSearch stays mounted (but hidden) while
// another tab is active, and dispatchSearchResult can fire reactively on a fresh login with a
// cached search result regardless of the visible tab, this could silently clobber
// Tools.jsx's shouldShowRapidResponseDeskTab session record from anywhere.
describe('AdvancedSearch.dispatchSearchResult — does not clobber the shared session record (#1270)', () => {
  beforeEach(() => {
    sessionStorage.clear();
  });

  it('preserves an unrelated field already persisted by another tab', () => {
    sessionStorage.setItem(
      ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY,
      JSON.stringify({ shouldShowRapidResponseDeskTab: true }),
    );
    const advancedSearch = new AdvancedSearch({});

    advancedSearch.dispatchSearchResult({ allResults: [], totalCount: 0, hasMore: false });

    const persisted = JSON.parse(sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY));
    expect(persisted.shouldShowRapidResponseDeskTab).toBe(true);
    expect(persisted.resultsAvailable).toBe(true);
  });
});

describe('AdvancedSearch.partitionCollectionsByApiSupport - CLMS SWI time series (#1324)', () => {
  const CLMS = 'CLMS_BIOGEOPHYSICAL_PARAMETERS';
  const V3 = 'swi-timeseries_global_12.5km_daily_v3';
  const V4 = 'swi-timeseries_global_12.5km_daily_v4';
  const OTHER = 'swi_europe_1km_daily_v1';
  const formConfig = getCollectionFormConfig(recursiveCollections, {});
  const partition = (selectedCollections) =>
    new AdvancedSearch({}).partitionCollectionsByApiSupport(formConfig, selectedCollections);
  const soilWaterIndex = (...productTypeIds) => ({
    [CLMS]: {
      type: 'collection',
      SOIL_MOISTURE: {
        type: 'group',
        SOIL_WATER_INDEX: {
          type: 'instrument',
          ...Object.fromEntries(productTypeIds.map((id) => [id, { type: 'productType' }])),
        },
      },
    },
  });

  it('routes ticked V3 and V4 to STAC only', () => {
    const { stacCollections, odataCollections } = partition(soilWaterIndex(V3, V4));
    expect(Object.keys(stacCollections[CLMS].SOIL_MOISTURE.SOIL_WATER_INDEX)).toEqual(
      expect.arrayContaining([V3, V4]),
    );
    expect(odataCollections[CLMS]).toBeUndefined();
  });

  it('keeps the other Soil Water Index product types on OData', () => {
    const { stacCollections, odataCollections } = partition(soilWaterIndex(V4, OTHER));
    expect(stacCollections[CLMS].SOIL_MOISTURE.SOIL_WATER_INDEX[V4]).toBeDefined();
    expect(stacCollections[CLMS].SOIL_MOISTURE.SOIL_WATER_INDEX[OTHER]).toBeUndefined();
    expect(odataCollections[CLMS].SOIL_MOISTURE.SOIL_WATER_INDEX[OTHER]).toBeDefined();
    expect(odataCollections[CLMS].SOIL_MOISTURE.SOIL_WATER_INDEX[V4]).toBeUndefined();
  });

  it('keeps the whole instrument on OData when no product type is ticked', () => {
    const { stacCollections, odataCollections } = partition(soilWaterIndex());
    expect(stacCollections[CLMS]).toBeUndefined();
    expect(odataCollections[CLMS].SOIL_MOISTURE.SOIL_WATER_INDEX).toEqual({ type: 'instrument' });
  });
});
