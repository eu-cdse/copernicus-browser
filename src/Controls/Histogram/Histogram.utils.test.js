import moment from 'moment';
import { LayersFactory } from '@sentinel-hub/sentinelhub-js';
import { fromBlob } from 'geotiff';

import {
  getDataForLayer,
  getDataForIndex,
  getMissingIndexOutputError,
  getNoIndexLayerOutputError,
} from './Histogram.utils';
import { constructDataFusionLayer } from '../../junk/EOBCommon/utils/dataFusion';
import {
  getImageDimensionFromBoundsWithCap,
  constructBBoxFromBounds,
} from '../../Controls/ImgDownload/ImageDownload.utils.js';

// Partial mock: keep ApiType, BBox etc. as real implementations, only stub LayersFactory
// (mirrors ImageDownload.utils.test.js's getLayerFromParams regression suite).
jest.mock('@sentinel-hub/sentinelhub-js', () => ({
  ...jest.requireActual('@sentinel-hub/sentinelhub-js'),
  LayersFactory: { makeLayer: jest.fn(), makeLayers: jest.fn() },
}));

jest.mock('../../junk/EOBCommon/utils/dataFusion', () => ({
  ...jest.requireActual('../../junk/EOBCommon/utils/dataFusion'),
  constructDataFusionLayer: jest.fn(),
}));

// buildLayer/getTiffImages delegate image-size and bbox computation to ImageDownload.utils.js.
// Stubbing both here lets every test use trivial `bounds`/`datasetId` values that never exceed
// MAX_SH_IMAGE_SIZE, so a single getMap call is made per test (no bbox-chunking branch).
jest.mock('../../Controls/ImgDownload/ImageDownload.utils.js', () => ({
  ...jest.requireActual('../../Controls/ImgDownload/ImageDownload.utils.js'),
  getImageDimensionFromBoundsWithCap: jest.fn(),
  constructBBoxFromBounds: jest.fn(),
}));

jest.mock('geotiff', () => ({
  fromBlob: jest.fn(),
}));

// An evalscript whose setup() output matches the required { id: "index", bands: 1, sampleType:
// "FLOAT32" } shape, so checkIfIndexOutputInEvalscript (real implementation, unmocked) resolves it
// as present.
const INDEX_OUTPUT_EVALSCRIPT = `
//VERSION=3
function setup() {
  return {
    input: ["B04"],
    output: { id: "index", bands: 1, sampleType: "FLOAT32" }
  };
}
function evaluatePixel(sample) {
  return [sample.B04];
}
`;

// An evalscript with a plain RGB-style output — no "index" output present.
const NO_INDEX_OUTPUT_EVALSCRIPT = `
//VERSION=3
function setup() {
  return {
    input: ["B04", "B03", "B02"],
    output: { id: "default", bands: 3, sampleType: "AUTO" }
  };
}
function evaluatePixel(sample) {
  return [sample.B04, sample.B03, sample.B02];
}
`;

function createLayerMock(evalscript) {
  return {
    evalscript,
    updateLayerFromServiceIfNeeded: jest.fn().mockResolvedValue(undefined),
    getMap: jest.fn().mockResolvedValue(new Blob(['fake-tiff'], { type: 'image/tiff' })),
  };
}

function createFusionLayerMock() {
  return {
    getMap: jest.fn().mockResolvedValue(new Blob(['fake-fusion-tiff'], { type: 'image/tiff' })),
  };
}

describe('Histogram.utils — getDataForLayer / getDataForIndex', () => {
  const visualizationUrl = 'https://example.com';
  const datasetId = 'FAKE_DATASET_ID';
  const dataFusionSettings = [{ id: 'S2L2A', evalscriptName: 'S2L2A' }];
  const fromTime = moment.utc('2024-03-15T10:30:00Z');
  const toTime = moment.utc('2024-03-15T10:45:00Z');

  const buildProps = (overrides = {}) => ({
    visualizationUrl,
    layerId: 'LAYER_1',
    datasetId,
    fromTime,
    toTime,
    bounds: {},
    aoiGeometry: undefined,
    ...overrides,
  });

  beforeEach(() => {
    getImageDimensionFromBoundsWithCap.mockReturnValue({ width: 100, height: 100 });
    constructBBoxFromBounds.mockReturnValue({});
    fromBlob.mockResolvedValue({
      getImage: jest.fn().mockResolvedValue({
        readRasters: jest.fn().mockResolvedValue([[1, 2, 3, 4, 5]]),
      }),
    });
    // Silence expected console.error noise in error-path tests.
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.clearAllMocks();
    jest.restoreAllMocks();
  });

  test('getDataForLayer: data fusion + customSelected + truthy layerId builds the fusion layer, not LayersFactory.makeLayer (regression #1284)', async () => {
    const fusionLayer = createFusionLayerMock();
    constructDataFusionLayer.mockResolvedValue(fusionLayer);

    const props = buildProps({
      dataFusion: dataFusionSettings,
      customSelected: true,
      evalscript: INDEX_OUTPUT_EVALSCRIPT,
    });

    const result = await getDataForLayer(props, null);

    expect(constructDataFusionLayer).toHaveBeenCalledWith(
      dataFusionSettings,
      INDEX_OUTPUT_EVALSCRIPT,
      null,
      fromTime,
      toTime,
    );
    expect(LayersFactory.makeLayer).not.toHaveBeenCalled();
    expect(fusionLayer.getMap).toHaveBeenCalledTimes(1);
    expect(result.error).toBeUndefined();
    expect(result.histogram).toBeDefined();
  });

  test('getDataForIndex: data fusion + customSelected + no layerId builds the fusion layer, not LayersFactory.makeLayers (regression #1284)', async () => {
    const fusionLayer = createFusionLayerMock();
    constructDataFusionLayer.mockResolvedValue(fusionLayer);

    const props = buildProps({
      layerId: undefined,
      dataFusion: dataFusionSettings,
      customSelected: true,
      evalscript: INDEX_OUTPUT_EVALSCRIPT,
    });

    const result = await getDataForIndex(props, null);

    expect(constructDataFusionLayer).toHaveBeenCalledWith(
      dataFusionSettings,
      INDEX_OUTPUT_EVALSCRIPT,
      null,
      fromTime,
      toTime,
    );
    expect(LayersFactory.makeLayers).not.toHaveBeenCalled();
    expect(fusionLayer.getMap).toHaveBeenCalledTimes(1);
    expect(result.error).toBeUndefined();
    expect(result.histogram).toBeDefined();
  });

  test.each([
    ['undefined', undefined],
    ['empty array', []],
  ])(
    'getDataForLayer: no data fusion (%s) + layerId + customSelected uses LayersFactory.makeLayer, not the fusion path',
    async (_label, dataFusion) => {
      const madeLayer = createLayerMock(INDEX_OUTPUT_EVALSCRIPT);
      LayersFactory.makeLayer.mockResolvedValue(madeLayer);

      const props = buildProps({
        dataFusion,
        customSelected: true,
        evalscript: INDEX_OUTPUT_EVALSCRIPT,
      });

      const result = await getDataForLayer(props, null);

      expect(LayersFactory.makeLayer).toHaveBeenCalled();
      expect(constructDataFusionLayer).not.toHaveBeenCalled();
      expect(result.error).toBeUndefined();
      expect(result.histogram).toBeDefined();
    },
  );

  test('getDataForLayer: data fusion populated but customSelected false + truthy layerId takes the makeLayer path, not fusion', async () => {
    const madeLayer = createLayerMock(INDEX_OUTPUT_EVALSCRIPT);
    LayersFactory.makeLayer.mockResolvedValue(madeLayer);

    const props = buildProps({
      dataFusion: dataFusionSettings,
      customSelected: false,
    });

    const result = await getDataForLayer(props, null);

    expect(LayersFactory.makeLayer).toHaveBeenCalled();
    expect(constructDataFusionLayer).not.toHaveBeenCalled();
    expect(madeLayer.getMap).toHaveBeenCalledTimes(1);
    expect(result.error).toBeUndefined();
    expect(result.histogram).toBeDefined();
  });

  test('getDataForLayer: customSelected + evalscript without index output returns the missing-index error, not the no-index-layer error', async () => {
    const props = buildProps({
      customSelected: true,
      evalscript: NO_INDEX_OUTPUT_EVALSCRIPT,
    });

    const result = await getDataForLayer(props, null);

    expect(result.error).toBe(getMissingIndexOutputError());
    expect(result.error).not.toBe(getNoIndexLayerOutputError());
    expect(fromBlob).not.toHaveBeenCalled();
  });

  test('getDataForIndex: customSelected + evalscript without index output short-circuits before building any layer or fetching tiles (missing-await regression)', async () => {
    const props = buildProps({
      customSelected: true,
      evalscript: NO_INDEX_OUTPUT_EVALSCRIPT,
    });

    const result = await getDataForIndex(props, null);

    expect(result.error).toBe(getMissingIndexOutputError());
    expect(constructDataFusionLayer).not.toHaveBeenCalled();
    expect(LayersFactory.makeLayers).not.toHaveBeenCalled();
    expect(LayersFactory.makeLayer).not.toHaveBeenCalled();
    expect(fromBlob).not.toHaveBeenCalled();
  });
});
