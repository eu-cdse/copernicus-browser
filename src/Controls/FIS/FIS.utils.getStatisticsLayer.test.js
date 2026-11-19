import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

import { getStatisticsLayer } from './FIS.utils';
import { loadEvalscriptParsers } from '../../utils/evalscriptParsers';

jest.mock('@sentinel-hub/sentinelhub-js', () => {
  const actual = jest.requireActual('@sentinel-hub/sentinelhub-js');
  return {
    ...actual,
    LayersFactory: { makeLayer: jest.fn(), makeLayers: jest.fn() },
  };
});

jest.mock('../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  getDataSourceHandler: () => ({
    getFISLayer: () => null,
    getSentinelHubDataset: () => ({ id: 'S2L2A' }),
  }),
}));

// Real loader by default; individual tests override it to simulate a failed chunk load.
jest.mock('../../utils/evalscriptParsers', () => {
  const actual = jest.requireActual('../../utils/evalscriptParsers');
  return { ...actual, loadEvalscriptParsers: jest.fn(actual.loadEvalscriptParsers) };
});

const STATS_EVALSCRIPT = `//VERSION=3
function setup() {
  return {
    input: ["B04", "B08", "dataMask"],
    output: [
      { id: "default", bands: 4 },
      { id: "browserStats", bands: 1, sampleType: "FLOAT32" },
      { id: "dataMask", bands: 1 },
    ],
  };
}
function evaluatePixel(s) {
  return { default: [1, 1, 1, 1], browserStats: [0], dataMask: [s.dataMask] };
}`;

const CUSTOM_PARAMS = {
  customSelected: true,
  datasetId: 'S2L2A',
  evalscript: STATS_EVALSCRIPT,
  layerId: null,
  visualizationUrl: 'https://example.com/wms',
};

describe('getStatisticsLayer', () => {
  beforeEach(() => {
    LayersFactory.makeLayers.mockResolvedValue([{ title: 'Custom' }]);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('loads the parsers before parsing, so support and the stats output name are resolved', async () => {
    const result = await getStatisticsLayer(CUSTOM_PARAMS);

    expect(loadEvalscriptParsers).toHaveBeenCalled();
    expect(result.supportStatisticalApi).toBe(true);
    expect(result.statsOutputName).toBe('browserStats');
    expect(result.statisticsLayer.evalscript).toBe(STATS_EVALSCRIPT);
  });

  it('rejects without creating a layer when the parsers fail to load', async () => {
    loadEvalscriptParsers.mockRejectedValueOnce(new Error('chunk load failed'));

    await expect(getStatisticsLayer(CUSTOM_PARAMS)).rejects.toThrow('chunk load failed');
    expect(LayersFactory.makeLayers).not.toHaveBeenCalled();
  });
});
