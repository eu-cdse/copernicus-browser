import { ODataCollections } from '../api/OData/ODataTypes';
import {
  CCM_COLLECTION_NAME,
  STAC_COLLECTIONS,
  STAC_FILTER_TOKEN_LITERAL,
  getCcmAvailabilityLabels,
  getCcmCollectionsFromDatasetValues,
  getClmsAvailabilityLabels,
  getCollectionNames,
  getDatasetFullValues,
  getDemCollectionsFromDatasetValues,
  getStacBaseId,
} from './stac.utils';

// Helpers to build realistic OData filter fragments
const productTypeFragment = (value) =>
  `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'productType' and att/OData.CSC.StringAttribute/Value eq '${value}')`;
const datasetIdentifierFragment = (value) =>
  `Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetIdentifier' and att/OData.CSC.StringAttribute/Value eq '${value}')`;
const collectionFragment = (name) => `Collection/Name eq '${name}'`;

describe('stac.utils', () => {
  describe('getCollectionNames', () => {
    it('extracts all collection names from filter string', () => {
      const filter =
        "(Collection/Name eq 'SENTINEL-1') and (Collection/Name eq 'SENTINEL-2') and (Collection/Name eq 'CCM')";

      expect(getCollectionNames(filter)).toEqual(['SENTINEL-1', 'SENTINEL-2', 'CCM']);
    });

    it('returns empty array for empty or non-matching filter', () => {
      expect(getCollectionNames('')).toEqual([]);
      expect(getCollectionNames(null)).toEqual([]);
      expect(getCollectionNames("Attributes/OData.CSC.StringAttribute/Value eq 'foo'")).toEqual([]);
    });
  });

  describe('getDatasetFullValues', () => {
    it('extracts datasetFull values from filter string', () => {
      const filter =
        "Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'DWH_MG1_CORE_11') and Attributes/OData.CSC.StringAttribute/any(att:att/Name eq 'datasetFull' and att/OData.CSC.StringAttribute/Value eq 'COP-DEM_GLO-90-DGED')";

      expect(getDatasetFullValues(filter)).toEqual(['DWH_MG1_CORE_11', 'COP-DEM_GLO-90-DGED']);
    });

    it('returns empty array for empty or non-matching filter', () => {
      expect(getDatasetFullValues('')).toEqual([]);
      expect(getDatasetFullValues(undefined)).toEqual([]);
      expect(getDatasetFullValues("Collection/Name eq 'SENTINEL-2'")).toEqual([]);
    });
  });

  describe('getStacBaseId', () => {
    it('removes processing/timeliness suffix from STAC IDs', () => {
      expect(getStacBaseId(STAC_COLLECTIONS.SENTINEL_6_P4_1B_NRT)).toBe('sentinel-6-p4-1b');
      expect(getStacBaseId(STAC_COLLECTIONS.SENTINEL_5P_L2_NO2_OFFL)).toBe('sentinel-5p-l2-no2');
    });
  });

  describe('CCM helpers', () => {
    it('maps optical and SAR datasetFull values to CCM STAC collections', () => {
      expect(getCcmCollectionsFromDatasetValues(['VHR_IMAGE_2018_ENHANCED'])).toEqual([
        STAC_COLLECTIONS.CCM_OPTICAL,
      ]);

      expect(getCcmCollectionsFromDatasetValues(['DWH_MG1_CORE_11'])).toEqual([STAC_COLLECTIONS.CCM_SAR]);
    });

    it('builds availability labels using dataset labels first, then fallbackLabel', () => {
      const opticalLabelResult = getCcmAvailabilityLabels({
        datasetFullValues: ['VHR_IMAGE_2018_ENHANCED'],
        collectionId: ODataCollections.OPTICAL.id,
        fallbackLabel: ODataCollections.OPTICAL.label,
      });
      expect(opticalLabelResult).toEqual(['VHR Europe (2017–2019)']);

      const fallbackResult = getCcmAvailabilityLabels({
        datasetFullValues: [],
        collectionId: ODataCollections.CCM_SAR.id,
        fallbackLabel: ODataCollections.CCM_SAR.label,
      });
      expect(fallbackResult).toEqual([ODataCollections.CCM_SAR.label]);
    });

    it('falls back to fallbackLabel when no dataset match and no allLabels provided', () => {
      const opticalFallback = getCcmAvailabilityLabels({
        datasetFullValues: [],
        collectionId: ODataCollections.OPTICAL.id,
        fallbackLabel: ODataCollections.OPTICAL.label,
      });
      expect(opticalFallback).toEqual([ODataCollections.OPTICAL.label]);

      const sarFallback = getCcmAvailabilityLabels({
        datasetFullValues: [],
        collectionId: ODataCollections.CCM_SAR.id,
        fallbackLabel: ODataCollections.CCM_SAR.label,
      });
      expect(sarFallback).toEqual([ODataCollections.CCM_SAR.label]);
    });

    it('exposes CCM umbrella collection name from OPTICAL collection key', () => {
      expect(CCM_COLLECTION_NAME).toBe(ODataCollections.OPTICAL.collection);
    });
  });

  describe('DEM helper', () => {
    it('maps specific DEM datasets to corresponding STAC collections', () => {
      expect(getDemCollectionsFromDatasetValues(['COP-DEM_GLO-90-DGED'])).toEqual([
        STAC_COLLECTIONS.COP_DEM_GLO_90_DGED_COG,
      ]);

      expect(getDemCollectionsFromDatasetValues(['COP-DEM_EEA-10-DGED'])).toEqual([
        STAC_COLLECTIONS.COP_DEM_EEA_10_LAEA_TIF,
      ]);
    });

    it('returns all DEM STAC collections for generic COP-DEM dataset values', () => {
      expect(getDemCollectionsFromDatasetValues(['COP-DEM_UNKNOWN'])).toEqual([
        STAC_COLLECTIONS.COP_DEM_EEA_10_LAEA_TIF,
        STAC_COLLECTIONS.COP_DEM_GLO_30_DGED_COG,
        STAC_COLLECTIONS.COP_DEM_GLO_90_DGED_COG,
      ]);
    });

    it('returns empty array when no DEM dataset is present', () => {
      expect(getDemCollectionsFromDatasetValues(['VHR_IMAGE_2024'])).toEqual([]);
    });
  });

  describe('filter token literals', () => {
    it('exports quoted filter token values used by parser checks', () => {
      expect(STAC_FILTER_TOKEN_LITERAL.NRTI).toBe("'NRTI'");
      expect(STAC_FILTER_TOKEN_LITERAL.NR).toBe("'NR'");
    });
  });

  describe('getCcmAvailabilityLabels', () => {
    it('returns the matched product label for a specific selection', () => {
      const labels = getCcmAvailabilityLabels({
        datasetFullValues: ['VHR_IMAGE_2018_ENHANCED'],
        collectionId: ODataCollections.OPTICAL.id,
        fallbackLabel: ODataCollections.OPTICAL.label,
      });
      expect(labels).toEqual(['VHR Europe (2017–2019)']);
    });

    it('does not return labels from a different collection', () => {
      const labels = getCcmAvailabilityLabels({
        datasetFullValues: ['DWH_MG1_CORE_11'],
        collectionId: ODataCollections.CCM_SAR.id,
        fallbackLabel: ODataCollections.CCM_SAR.label,
      });
      expect(labels).toEqual(['HR-MR Sea Ice Monitoring (2011–2014)']);
    });

    it('returns only the matched labels, not unselected siblings', () => {
      const labels = getCcmAvailabilityLabels({
        datasetFullValues: ['VHR_IMAGE_2018_ENHANCED', 'VHR_IMAGE_2021'],
        collectionId: ODataCollections.OPTICAL.id,
        fallbackLabel: ODataCollections.OPTICAL.label,
      });
      expect(labels).toContain('VHR Europe (2017–2019)');
      expect(labels).toContain('VHR Europe (2020–2022)');
      expect(labels).not.toContain('VHR Europe (2014–2016)');
      expect(labels).not.toContain('VHR Europe (2023–2025)');
    });

    it('returns the fallback label when no specific product is selected', () => {
      const labels = getCcmAvailabilityLabels({
        datasetFullValues: [],
        collectionId: ODataCollections.OPTICAL.id,
        fallbackLabel: ODataCollections.OPTICAL.label,
      });
      expect(labels).toEqual([ODataCollections.OPTICAL.label]);
    });

    it('returns allLabels when provided and no dataset matched', () => {
      const allOpticalLabels = ['VHR Europe (2017–2019)', 'VHR Europe (2020–2022)'];
      const labels = getCcmAvailabilityLabels({
        datasetFullValues: [],
        collectionId: ODataCollections.OPTICAL.id,
        fallbackLabel: ODataCollections.OPTICAL.label,
        allLabels: allOpticalLabels,
      });
      expect(labels).toEqual(allOpticalLabels);
    });
  });

  describe('getClmsAvailabilityLabels', () => {
    const SNOW_COVER_EXTENT_LEAVES = [
      'Europe, Daily, 500m, (2017–present), V1',
      'Northern Hemisphere, Daily, 1km, (2018–present), V1',
      'Global, Daily, 1km, (2025–present), V1',
    ];
    const SNOW_WATER_EQUIVALENT_LEAVES = [
      'Northern Hemisphere, Daily, 5km, (2006–2024), V1',
      'Northern Hemisphere, Daily, 5km, (2024–present), V2',
    ];
    const EVAPOTRANSPIRATION_LEAVES = [
      'ETA, Global, 10-daily, 300m, (2025–present), V1',
      'HF, Global, Daily, 300m, (2025–present), V1',
    ];
    const DYNAMIC_LAND_COVER_LEAVES = [
      'Global, Yearly, 100m, (2015–2019), V3',
      'LCM Global, Yearly, 10m, 2020, V1',
      'TCD Pan-tropical, Yearly, 10m, 2020, V1',
    ];

    it('shows only selected instrument leaves, not sibling instrument leaves', () => {
      const filter = [collectionFragment('CLMS'), productTypeFragment('snow_cover_extent')].join(' and ');
      const labels = getClmsAvailabilityLabels(filter);
      SNOW_COVER_EXTENT_LEAVES.forEach((label) => expect(labels).toContain(label));
      SNOW_WATER_EQUIVALENT_LEAVES.forEach((label) => expect(labels).not.toContain(label));
    });

    it('shows only the other instrument leaves when the other sibling is selected', () => {
      const filter = [collectionFragment('CLMS'), productTypeFragment('snow_water_equivalent')].join(' and ');
      const labels = getClmsAvailabilityLabels(filter);
      SNOW_WATER_EQUIVALENT_LEAVES.forEach((label) => expect(labels).toContain(label));
      SNOW_COVER_EXTENT_LEAVES.forEach((label) => expect(labels).not.toContain(label));
    });

    it('shows all group leaves when a parent group is selected, not leaves from other groups', () => {
      const filter = [
        collectionFragment('CLMS'),
        productTypeFragment('snow_cover_extent'),
        productTypeFragment('snow_water_equivalent'),
      ].join(' and ');
      const labels = getClmsAvailabilityLabels(filter);
      SNOW_COVER_EXTENT_LEAVES.forEach((label) => expect(labels).toContain(label));
      SNOW_WATER_EQUIVALENT_LEAVES.forEach((label) => expect(labels).toContain(label));
      EVAPOTRANSPIRATION_LEAVES.forEach((label) => expect(labels).not.toContain(label));
    });

    it('shows only the selected leaf when a specific product type is selected', () => {
      const filter = [
        collectionFragment('CLMS'),
        productTypeFragment('snow_cover_extent'),
        datasetIdentifierFragment('sce_europe_500m_daily_v1'),
      ].join(' and ');
      const labels = getClmsAvailabilityLabels(filter);
      expect(labels).toEqual(['Europe, Daily, 500m, (2017–present), V1']);
    });

    it('shows Evapotranspiration leaves when the instrument has no productType filter', () => {
      const filter = [
        collectionFragment('CLMS'),
        datasetIdentifierFragment('eta_global_300m_10daily_v1'),
        datasetIdentifierFragment('hf_global_300m_daily_v1'),
      ].join(' and ');
      const labels = getClmsAvailabilityLabels(filter);
      EVAPOTRANSPIRATION_LEAVES.forEach((label) => expect(labels).toContain(label));
      SNOW_COVER_EXTENT_LEAVES.forEach((label) => expect(labels).not.toContain(label));
    });

    it('falls back to collection labels when filter has no productType or datasetIdentifier', () => {
      const labels = getClmsAvailabilityLabels(collectionFragment('CLMS'));
      expect(labels).toContain('CLMS Bio-geophysical Parameters');
      expect(labels).toContain('CLMS Land Cover and Land Use Mapping');
    });

    it('shows leaves for both a group-level parent and a specific leaf from another instrument', () => {
      // SNOW parent (no children) + DynamicLandCover parent + one specific leaf
      // Bug: Case A used to return early with only the DynamicLandCover leaf, ignoring SNOW
      const filter = [
        collectionFragment('CLMS'),
        productTypeFragment('snow_cover_extent'),
        productTypeFragment('snow_water_equivalent'),
        productTypeFragment('dynamic_land_cover'),
        datasetIdentifierFragment('lc_global_100m_yearly_v3'),
      ].join(' and ');
      const labels = getClmsAvailabilityLabels(filter);
      // SNOW parent → all its leaves
      SNOW_COVER_EXTENT_LEAVES.forEach((label) => expect(labels).toContain(label));
      SNOW_WATER_EQUIVALENT_LEAVES.forEach((label) => expect(labels).toContain(label));
      // DynamicLandCover specific leaf
      expect(labels).toContain('Global, Yearly, 100m, (2015–2019), V3');
      // Other DynamicLandCover leaves NOT selected
      expect(labels).not.toContain('LCM Global, Yearly, 10m, 2020, V1');
    });

    describe('CLMS Land Cover parent – regression', () => {
      it('shows Dynamic Land Cover leaves when parent is selected with geometry', () => {
        const filter = [collectionFragment('CLMS'), productTypeFragment('dynamic_land_cover')].join(' and ');
        const labels = getClmsAvailabilityLabels(filter);
        DYNAMIC_LAND_COVER_LEAVES.forEach((label) => expect(labels).toContain(label));
        expect(labels).not.toContain('CLMS Land Cover and Land Use Mapping');
        expect(labels).not.toContain('CLMS Bio-geophysical Parameters');
      });

      it('shows Dynamic Land Cover leaves when parent is selected without geometry', () => {
        const filter = [
          collectionFragment('CLMS'),
          productTypeFragment('dynamic_land_cover'),
          datasetIdentifierFragment('lc_global_100m_yearly_v3'),
          datasetIdentifierFragment('lcm_global_10m_yearly_v1'),
          datasetIdentifierFragment('tcd_pantropical_10m_yearly_v1'),
        ].join(' and ');
        const labels = getClmsAvailabilityLabels(filter);
        DYNAMIC_LAND_COVER_LEAVES.forEach((label) => expect(labels).toContain(label));
        expect(labels).not.toContain('CLMS Land Cover and Land Use Mapping');
        expect(labels).not.toContain('CLMS Bio-geophysical Parameters');
      });

      it('shows only the selected leaf when a specific product is selected', () => {
        const filter = [
          collectionFragment('CLMS'),
          productTypeFragment('dynamic_land_cover'),
          datasetIdentifierFragment('lc_global_100m_yearly_v3'),
        ].join(' and ');
        const labels = getClmsAvailabilityLabels(filter);
        expect(labels).toEqual(['Global, Yearly, 100m, (2015–2019), V3']);
      });
    });
  });
});
