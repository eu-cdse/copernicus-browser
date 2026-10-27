// Importing dataSourceHandlers first avoids a circular-import ordering issue between
// DataSourceHandler.js and Sentinel1DataSourceHandler.jsx that otherwise surfaces when a
// BYOC handler subclass is the first module to pull in DataSourceHandler.js.
import './dataSourceHandlers';
import CCMDataSourceHandler from './CCMDataSourceHandler';
import {
  CDSE_CCM_MR_THERMAL_LST_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
  CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION,
} from './dataSourceConstants';

const COLLECTION_IDS = {
  [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: '4ab2c8-YOUR-INSTANCEID-HERE',
  [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: '0c9659-YOUR-INSTANCEID-HERE',
  [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: 'b016cf-YOUR-INSTANCEID-HERE',
  [CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION]: 'e68d01-YOUR-INSTANCEID-HERE',
  [CDSE_CCM_MR_THERMAL_LST_COLLECTION]: '182c96-YOUR-INSTANCEID-HERE',
};

const makeLayer = (datasetId) => ({
  layerId: `TEST_LAYER_${datasetId}`,
  collectionId: COLLECTION_IDS[datasetId],
});

describe('AbstractBYOCDataSourceHandler willHandle', () => {
  let handler;

  beforeEach(() => {
    handler = new CCMDataSourceHandler();
  });

  it('keeps datasets sorted by KNOWN_COLLECTIONS declared order regardless of resolution order', () => {
    // Simulate network responses resolving out of declared order: Mosaic 2024, then 2018, then 2021, then 2024.
    handler.willHandle('WMS', 'url-1', 'part-1', [makeLayer(CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION)]);
    handler.willHandle('WMS', 'url-2', 'part-2', [makeLayer(CDSE_CCM_VHR_IMAGE_2018_COLLECTION)]);
    handler.willHandle('WMS', 'url-3', 'part-3', [makeLayer(CDSE_CCM_VHR_IMAGE_2021_COLLECTION)]);
    handler.willHandle('WMS', 'url-4', 'part-4', [makeLayer(CDSE_CCM_VHR_IMAGE_2024_COLLECTION)]);
    handler.willHandle('WMS', 'url-5', 'part-5', [makeLayer(CDSE_CCM_MR_THERMAL_LST_COLLECTION)]);

    expect(handler.datasets).toEqual(Object.keys(handler.KNOWN_COLLECTIONS));
  });

  it('keeps the correct order when willHandle is called in the already-declared order', () => {
    const knownOrder = Object.keys(handler.KNOWN_COLLECTIONS);

    knownOrder.forEach((datasetId, index) => {
      handler.willHandle('WMS', `url-${index}`, `part-${index}`, [makeLayer(datasetId)]);
    });

    expect(handler.datasets).toEqual(knownOrder);
  });

  it('does not add duplicate datasetIds when the same dataset resolves across multiple calls', () => {
    handler.willHandle('WMS', 'url-1', 'part-1', [makeLayer(CDSE_CCM_VHR_IMAGE_2018_COLLECTION)]);
    handler.willHandle('WMS', 'url-2', 'part-2', [makeLayer(CDSE_CCM_VHR_IMAGE_2018_COLLECTION)]);
    handler.willHandle('WMS', 'url-3', 'part-3', [makeLayer(CDSE_CCM_VHR_IMAGE_2021_COLLECTION)]);
    handler.willHandle('WMS', 'url-4', 'part-4', [makeLayer(CDSE_CCM_VHR_IMAGE_2018_COLLECTION)]);

    expect(handler.datasets).toEqual([
      CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
      CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
    ]);
  });
});
