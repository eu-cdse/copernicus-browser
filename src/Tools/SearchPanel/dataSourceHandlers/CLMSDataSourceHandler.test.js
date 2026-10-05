// Importing dataSourceHandlers first avoids a circular-import ordering issue between
// DataSourceHandler.js and Sentinel1DataSourceHandler.jsx that otherwise surfaces when
// CLMSDataSourceHandler is the first module in the test file to pull in DataSourceHandler.js.
import './dataSourceHandlers';
import CLMSDataSourceHandler from './CLMSDataSourceHandler';
import {
  COPERNICUS_CLMS_LCM_10M_YEARLY_V1,
  COPERNICUS_CLMS_TCD_10M_YEARLY_V1,
  COPERNICUS_CLMS_UA_BUILDING_HEIGHT_EUROPE_10M_3YEARLY_V1_2021,
  COPERNICUS_CLMS_UA_BUILDING_HEIGHT_EUROPE_10M_3YEARLY_V1_2021_COLLECTION_ID,
  COPERNICUS_CLMS_CLCPLUS_LULUCF_INSTANCE_EUROPE_100M_YEARLY_V1,
  COPERNICUS_CLMS_CLCPLUS_LULUCF_INSTANCE_EUROPE_100M_YEARLY_V1_COLLECTION_IDS,
  COPERNICUS_CLMS_DLT_10M_YEARLY_V1,
  COPERNICUS_CLMS_CPMCD_10M_YEARLY_V1,
  COPERNICUS_CLMS_VLCC_CROP_TYPES_EUROPE_10M_YEARLY_V1,
  COPERNICUS_CLMS_VLCC_TCPC_20M_3YEARLY_V1,
  COPERNICUS_CLMS_VLCC_PLOUGHING_INDICATOR_EUROPE_10M_YEARLY_V1,
  COPERNICUS_CLMS_VLCC_CONIFEROUS_COVER_DENSITY_EUROPE_100M_YEARLY_V1,
  COPERNICUS_CLMS_VLCC_BROADLEAVED_COVER_DENSITY_EUROPE_100M_YEARLY_V1,
  COPERNICUS_CLMS_VLCC_FOREST_TYPE_EUROPE_100M_3YEARLY_V1,
  COPERNICUS_CLMS_VLCC_GRASSLAND_EUROPE_100M_YEARLY_V1,
  COPERNICUS_CLMS_VLCC_TREE_COVER_DENSITY_EUROPE_100M_YEARLY_V1,
} from './dataSourceConstants';
import {
  COPERNICUS_CLMS_DLT_10M_YEARLY_V1_COLLECTION_IDS,
  COPERNICUS_CLMS_DLT_10M_YEARLY_V1_LAYER_IDS,
  COPERNICUS_CLMS_VLCC_CROP_TYPES_EUROPE_10M_YEARLY_V1_COLLECTION_IDS,
  COPERNICUS_CLMS_VLCC_CROP_TYPES_EUROPE_10M_YEARLY_V1_LAYER_IDS,
  COPERNICUS_CLMS_CPMCD_10M_YEARLY_V1_COLLECTION_IDS,
  COPERNICUS_CLMS_CPMCD_10M_YEARLY_V1_LAYER_IDS,
  COPERNICUS_CLMS_VLCC_BROADLEAVED_COVER_DENSITY_EUROPE_100M_YEARLY_V1_COLLECTION_ID,
  COPERNICUS_CLMS_VLCC_CONIFEROUS_COVER_DENSITY_EUROPE_100M_YEARLY_V1_COLLECTION_ID,
  COPERNICUS_CLMS_VLCC_FOREST_TYPE_EUROPE_100M_3YEARLY_V1_COLLECTION_ID,
  COPERNICUS_CLMS_VLCC_GRASSLAND_EUROPE_100M_YEARLY_V1_COLLECTION_ID,
  COPERNICUS_CLMS_VLCC_TREE_COVER_DENSITY_EUROPE_100M_YEARLY_V1_COLLECTION_ID,
} from './CLMSVLCCSpecificConst';

describe('CLMSDataSourceHandler getLowResolutionMetersPerPixelThreshold', () => {
  let handler;

  beforeEach(() => {
    handler = new CLMSDataSourceHandler();
  });

  // Regression coverage for issue #1260: these thresholds previously exceeded the
  // Sentinel Hub backend's actual enforced resolution ceiling, causing a "dead zone"
  // where the client requested a resolution the backend rejected with a 400 before
  // ever falling back to the low-resolution collection. A 10% safety margin is applied
  // below the probed ceiling to guard against edge cases at the exact boundary.
  it.each([
    [
      'Building Height (was 650)',
      COPERNICUS_CLMS_UA_BUILDING_HEIGHT_EUROPE_10M_3YEARLY_V1_2021_COLLECTION_ID.ACTUAL,
      450,
    ],
    [
      'CLC+ LULUCF (was 1300)',
      COPERNICUS_CLMS_CLCPLUS_LULUCF_INSTANCE_EUROPE_100M_YEARLY_V1_COLLECTION_IDS.ACTUAL,
      1440,
    ],
    [
      'Broadleaved Cover Density (originally reported bug, was 1300)',
      COPERNICUS_CLMS_VLCC_BROADLEAVED_COVER_DENSITY_EUROPE_100M_YEARLY_V1_COLLECTION_ID,
      900,
    ],
    [
      'Coniferous Cover Density (was 1300)',
      COPERNICUS_CLMS_VLCC_CONIFEROUS_COVER_DENSITY_EUROPE_100M_YEARLY_V1_COLLECTION_ID,
      900,
    ],
    [
      'Forest Type 100m (was 1300)',
      COPERNICUS_CLMS_VLCC_FOREST_TYPE_EUROPE_100M_3YEARLY_V1_COLLECTION_ID,
      900,
    ],
    ['Grassland 100m (was 1300)', COPERNICUS_CLMS_VLCC_GRASSLAND_EUROPE_100M_YEARLY_V1_COLLECTION_ID, 900],
    [
      'Tree Cover Density 100m (was 1300)',
      COPERNICUS_CLMS_VLCC_TREE_COVER_DENSITY_EUROPE_100M_YEARLY_V1_COLLECTION_ID,
      900,
    ],
    ['CPMCD (was 1300)', COPERNICUS_CLMS_CPMCD_10M_YEARLY_V1_COLLECTION_IDS.CPMCD, 1440],
    ['DLT (was 1300)', COPERNICUS_CLMS_DLT_10M_YEARLY_V1_COLLECTION_IDS.DLT, 1440],
    ['Crop Types (was 1300)', COPERNICUS_CLMS_VLCC_CROP_TYPES_EUROPE_10M_YEARLY_V1_COLLECTION_IDS.CTY, 1440],
  ])('returns the corrected threshold for %s', (_description, collectionId, expectedThreshold) => {
    expect(handler.getLowResolutionMetersPerPixelThreshold(collectionId)).toBe(expectedThreshold);
  });

  // Regression guard: these were already correct and must not be touched by future changes.
  it.each([
    ['LCM 10m Yearly V1', COPERNICUS_CLMS_LCM_10M_YEARLY_V1, 2300],
    ['TCD 10m Yearly V1', COPERNICUS_CLMS_TCD_10M_YEARLY_V1, 2800],
  ])('keeps the unchanged threshold for %s', (_description, collectionId, expectedThreshold) => {
    expect(handler.getLowResolutionMetersPerPixelThreshold(collectionId)).toBe(expectedThreshold);
  });

  it('configures a positive numeric threshold for every entry in the low-resolution alternatives map', () => {
    const entries = Object.values(handler.LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS);

    expect(entries.length).toBeGreaterThan(0);

    entries.forEach(({ lowResolutionMetersPerPixelThreshold }) => {
      expect(typeof lowResolutionMetersPerPixelThreshold).toBe('number');
      expect(lowResolutionMetersPerPixelThreshold).toBeGreaterThan(0);
    });
  });
});

describe('CLMSDataSourceHandler getLeafletZoomConfig', () => {
  let handler;

  beforeEach(() => {
    handler = new CLMSDataSourceHandler();
  });

  // Regression coverage for issue #1287: VLCC collections previously started rendering at
  // zoom 4; they should now start at zoom 2, like most other CLMS entries. Goes through the
  // public getter (not the internal leafletZoomConfig object directly), so each case also
  // exercises the datasetId/layerId -> collectionId resolution the app actually relies on.
  it.each([
    // Single-collection datasets: resolved by datasetId alone, no layerId needed.
    ['VLCC Ploughing Indicator', COPERNICUS_CLMS_VLCC_PLOUGHING_INDICATOR_EUROPE_10M_YEARLY_V1, undefined],
    [
      'VLCC Broadleaved Cover Density',
      COPERNICUS_CLMS_VLCC_BROADLEAVED_COVER_DENSITY_EUROPE_100M_YEARLY_V1,
      undefined,
    ],
    [
      'VLCC Coniferous Cover Density',
      COPERNICUS_CLMS_VLCC_CONIFEROUS_COVER_DENSITY_EUROPE_100M_YEARLY_V1,
      undefined,
    ],
    ['VLCC Forest Type 100m', COPERNICUS_CLMS_VLCC_FOREST_TYPE_EUROPE_100M_3YEARLY_V1, undefined],
    ['VLCC Grassland 100m', COPERNICUS_CLMS_VLCC_GRASSLAND_EUROPE_100M_YEARLY_V1, undefined],
    [
      'VLCC Tree Cover Density 100m',
      COPERNICUS_CLMS_VLCC_TREE_COVER_DENSITY_EUROPE_100M_YEARLY_V1,
      undefined,
    ],
    // Multi-collection datasets: resolved via datasetId + layerId -> BYOC sub-collection id.
    ['DLT', COPERNICUS_CLMS_DLT_10M_YEARLY_V1, COPERNICUS_CLMS_DLT_10M_YEARLY_V1_LAYER_IDS.DLT],
    ['DLT confidence', COPERNICUS_CLMS_DLT_10M_YEARLY_V1, COPERNICUS_CLMS_DLT_10M_YEARLY_V1_LAYER_IDS.DLTCL],
    ['CPMCD', COPERNICUS_CLMS_CPMCD_10M_YEARLY_V1, COPERNICUS_CLMS_CPMCD_10M_YEARLY_V1_LAYER_IDS.CPMCD],
    [
      'VLCC Crop Types',
      COPERNICUS_CLMS_VLCC_CROP_TYPES_EUROPE_10M_YEARLY_V1,
      COPERNICUS_CLMS_VLCC_CROP_TYPES_EUROPE_10M_YEARLY_V1_LAYER_IDS.CTY,
    ],
    // Multi-collection dataset with no layerId: falls back to the dataset-level key.
    ['VLCC TCPC (no layerId, dataset-level fallback)', COPERNICUS_CLMS_VLCC_TCPC_20M_3YEARLY_V1, undefined],
  ])('returns { min: 2, max: 25 } for %s', (_description, datasetId, layerId) => {
    expect(handler.getLeafletZoomConfig(datasetId, layerId)).toEqual({ min: 2, max: 25 });
  });

  // UA Building Height is not a VLCC product and must stay at its previous zoom config.
  it('keeps { min: 4, max: 25 } for UA Building Height', () => {
    expect(
      handler.getLeafletZoomConfig(COPERNICUS_CLMS_UA_BUILDING_HEIGHT_EUROPE_10M_3YEARLY_V1_2021, undefined),
    ).toEqual({ min: 4, max: 25 });
  });

  // Regression guard: an unrelated CLMS entry that was already at min: 2 must not be touched.
  it('keeps { min: 2, max: 25 } for an unrelated, already-correct CLC+ LULUCF entry', () => {
    expect(
      handler.getLeafletZoomConfig(COPERNICUS_CLMS_CLCPLUS_LULUCF_INSTANCE_EUROPE_100M_YEARLY_V1, undefined),
    ).toEqual({ min: 2, max: 25 });
  });

  // Invariant covering every entry in leafletZoomConfig, not just the sampled cases above: the
  // only key still allowed to have min: 4 is UA Building Height, which is not a VLCC product.
  it('has no entry at min: 4 other than UA Building Height', () => {
    const entriesAtMinFour = Object.entries(handler.leafletZoomConfig).filter(([, { min }]) => min === 4);

    expect(entriesAtMinFour).toEqual([
      [COPERNICUS_CLMS_UA_BUILDING_HEIGHT_EUROPE_10M_3YEARLY_V1_2021, { min: 4, max: 25 }],
    ]);
  });
});
