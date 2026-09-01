import { getComparedLayerZoomConfiguration } from './helper';
import { getDataSourceHandler } from './dataSourceHandlers';
import { DEFAULT_COMPARED_LAYERS_MAX_ZOOM, DEFAULT_COMPARED_LAYERS_OVERZOOM } from '../../../Map/const';

jest.mock('./dataSourceHandlers');

const withZoomConfig = (zoomConfig) => {
  getDataSourceHandler.mockReturnValue({ getLeafletZoomConfig: () => zoomConfig });
};

describe('getComparedLayerZoomConfiguration', () => {
  afterEach(() => {
    jest.resetAllMocks();
  });

  test("passes through the handler's own zoom config when it declares one", () => {
    withZoomConfig({ min: 6, max: 14, allowOverZoomBy: 2 });

    expect(getComparedLayerZoomConfiguration('DATASET', 'LAYER')).toEqual({
      min: 6,
      max: 14,
      allowOverZoomBy: 2,
    });
  });

  // The reason this helper exists: the map's ceiling is computed from these values (getMapMaxZoom)
  // and then pinned on the map, so a compared layer resolving its fallback differently from the
  // ceiling would let the user zoom to a level the layer refuses to render.
  test.each([
    ['no max is declared', { min: 6 }],
    ['max is undefined', { min: 6, max: undefined }],
  ])('falls back to the compare defaults when %s', (_label, zoomConfig) => {
    withZoomConfig(zoomConfig);

    expect(getComparedLayerZoomConfiguration('DEM', 'LAYER')).toEqual({
      min: 6,
      max: DEFAULT_COMPARED_LAYERS_MAX_ZOOM,
      allowOverZoomBy: DEFAULT_COMPARED_LAYERS_OVERZOOM,
    });
    expect(DEFAULT_COMPARED_LAYERS_MAX_ZOOM).toBe(25);
  });

  test('a max of 0 is kept rather than treated as missing', () => {
    withZoomConfig({ min: 0, max: 0, allowOverZoomBy: 0 });

    expect(getComparedLayerZoomConfiguration('DATASET', 'LAYER').max).toBe(0);
  });

  // getZoomConfiguration swallows the race where datasetId is not yet defined during render.
  test('falls back to the defaults when the handler cannot be resolved', () => {
    getDataSourceHandler.mockImplementation(() => {
      throw new Error('no handler yet');
    });

    expect(getComparedLayerZoomConfiguration(undefined, undefined)).toEqual({
      min: undefined,
      max: DEFAULT_COMPARED_LAYERS_MAX_ZOOM,
      allowOverZoomBy: DEFAULT_COMPARED_LAYERS_OVERZOOM,
    });
  });
});
