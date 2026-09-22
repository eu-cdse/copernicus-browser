import moment from 'moment';
import {
  addImageOverlays,
  constructRawBandEvalscript,
  fetchImage,
  getImageDimensionFromBoundsWithCap,
  getLayerFromParams,
  getNicename,
  getPixelCoordinates,
  getRawBandsScalingFactor,
  isSimpleImageFormat,
  overrideEvalscriptIfNeeded,
  resolveComparedLayerTitle,
} from './ImageDownload.utils';
import { BBox, CRS_EPSG3857, ApiType, LayersFactory } from '@sentinel-hub/sentinelhub-js';
import { latLngBounds } from 'leaflet';
import { constructDataFusionLayer } from '../../junk/EOBCommon/utils/dataFusion';

import {
  BAND_UNIT,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

import { reprojectGeometry } from '../../utils/reproject';
import { IMAGE_FORMATS } from './consts';
import { getEvalscriptSetup, setEvalscriptOutputScale } from '../../utils/parseEvalscript';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { isOpenEoSupported, getProcessGraph } from '../../api/openEO/openEOHelpers';
import openEOApi from '../../api/openEO/openEO.api';
import { metersPerPixel } from '../../utils/coords';

jest.mock('../../utils/parseEvalscript', () => ({
  ...jest.requireActual('../../utils/parseEvalscript'),
  getEvalscriptSetup: jest.fn(),
  setEvalscriptSampleType: jest.fn((evalscript) => evalscript),
  setEvalscriptOutputScale: jest.fn((evalscript) => evalscript),
}));

// getDataSourceHandler's default implementation delegates to the real (unmocked) function so
// existing tests relying on real data-source lookups (e.g. getImageDimensionFromBoundsWithCap)
// keep working; individual tests below override the return value only for their fake datasetId.
const actualDataSourceHandlers = jest.requireActual(
  '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers',
);
// getDatasetLabel's real implementation resolves the handler for the dataset id and calls its
// getDatasetLabel method, which (via DataSourceHandler.js) imports `datasetLabels` back from this
// same module — a circular import that resolves to undefined while this factory is still being
// evaluated. Read the label straight off the actual module's plain `datasetLabels` map instead, so
// real dataset labels (e.g. S2_L2A_CDAS -> 'Sentinel-2 L2A') still resolve without hitting the cycle.
jest.mock('../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers', () => ({
  ...jest.requireActual('../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers'),
  getDataSourceHandler: jest.fn(
    jest.requireActual('../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers').getDataSourceHandler,
  ),
  getDatasetLabel: jest.fn(
    (datasetId) =>
      jest.requireActual('../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers').datasetLabels[
        datasetId
      ],
  ),
}));

jest.mock('../../api/openEO/openEOHelpers', () => ({
  ...jest.requireActual('../../api/openEO/openEOHelpers'),
  isOpenEoSupported: jest.fn(),
  getProcessGraph: jest.fn(),
}));

jest.mock('../../api/openEO/openEO.api', () => ({
  __esModule: true,
  default: { getResult: jest.fn() },
}));

jest.mock('../../utils/coords', () => ({
  ...jest.requireActual('../../utils/coords'),
  metersPerPixel: jest.fn(),
}));

// Partial mock: keep BBox, CRS_EPSG3857, ApiType, Interpolator, canvasToBlob, drawBlobOnCanvas etc.
// as the real implementations (relied upon by other describes above/below), only stub LayersFactory.
jest.mock('@sentinel-hub/sentinelhub-js', () => ({
  ...jest.requireActual('@sentinel-hub/sentinelhub-js'),
  LayersFactory: { makeLayer: jest.fn(), makeLayers: jest.fn() },
}));

jest.mock('../../junk/EOBCommon/utils/dataFusion', () => ({
  ...jest.requireActual('../../junk/EOBCommon/utils/dataFusion'),
  constructDataFusionLayer: jest.fn(),
}));

describe('Test getRawBandsScalingFactor function', () => {
  test.each([
    // No bandName — float-reflectance fallback returns a factor
    ['FLOAT32', [], undefined, undefined],
    ['UINT16', [], undefined, 65535],
    ['UINT8', [], undefined, 255],
    // Native UINT8 DN band
    ['UINT8', [{ name: 'B01', sampleType: 'UINT8' }], 'B01', undefined],
    ['UINT16', [{ name: 'B01', sampleType: 'UINT8' }], 'B01', 255], // stretch into UINT16 range
    // Native UINT16 DN band — no scaling regardless of output format
    ['UINT16', [{ name: 'B01', sampleType: 'UINT16' }], 'B01', undefined],
    ['UINT8', [{ name: 'B01', sampleType: 'UINT16' }], 'B01', undefined],
  ])('raw bands scaling factor', (imageSampleType, bandsInfo, bandName, expectedFactor) => {
    const factor = getRawBandsScalingFactor({
      imageSampleType: imageSampleType,
      bandsInfo: bandsInfo,
      bandName: bandName,
    });
    expect(factor).toEqual(expectedFactor);
  });
});

const mercatorToWGS84 = (lng, lat) => {
  const midPointCords = { type: 'Point', coordinates: [lng, lat] };
  return reprojectGeometry(midPointCords, { fromCrs: 'EPSG:3857', toCrs: 'EPSG:4326' });
};

const fixtures = [
  [new BBox(CRS_EPSG3857, 100, 0, 200, 100), mercatorToWGS84(150, 50), 512, 512, { x: 256, y: 256 }],
  [new BBox(CRS_EPSG3857, 40, 0, 50, 10), mercatorToWGS84(40, 10), 512, 512, { x: 0, y: 0 }],
  [new BBox(CRS_EPSG3857, -15, 0, 50, 10), mercatorToWGS84(-20, 5), 2500, 2500, { x: -192, y: 1250 }],
  [new BBox(CRS_EPSG3857, -15, 0, 50, 10), mercatorToWGS84(-15, 10), 2500, 2500, { x: -0, y: 0 }],
  [new BBox(CRS_EPSG3857, -190, 61, -181, 63), mercatorToWGS84(-184.5, 62), 300, 300, { x: 183, y: 150 }],
  [new BBox(CRS_EPSG3857, -15, 0, 50, 10), mercatorToWGS84(22, 5), 500, 500, { x: 285, y: 250 }],
  [new BBox(CRS_EPSG3857, 0, 6709563, 4348, 6712163), mercatorToWGS84(369, 6710642), 43, 26, { x: 4, y: 15 }],
  [
    new BBox(CRS_EPSG3857, 0, 6709563, 4348, 6712163),
    mercatorToWGS84(1558, 6711003),
    43,
    26,
    { x: 15, y: 12 },
  ],
];

describe('Test getPixelCoordinates function', () => {
  test.each(fixtures)('Fixtures', (bbox, point, width, height, expexctedResult) => {
    const lng = point.coordinates[0];
    const lat = point.coordinates[1];

    const pixelCoords = getPixelCoordinates(lng, lat, bbox, width, height);
    expect(pixelCoords).toEqual(expexctedResult);
  });
});

const imageDimensionsFixtures = [
  [latLngBounds([0, 2], [1, 5]), S2_L2A_CDAS, { width: 2500, height: 833.4081925979159 }],
  [latLngBounds([2, 0], [5, 1]), S2_L2A_CDAS, { width: 831.6896778435239, height: 2500 }],
  [latLngBounds([0, 2], [0.1, 2.3]), S2_L2A_CDAS, { width: 2500, height: 833.0838323353292 }],
  [latLngBounds([0, 2], [0.3, 2.1]), S2_L2A_CDAS, { width: 833.0838323353294, height: 2500 }],
  [
    latLngBounds([42.45011889843056, 11.840642269235106], [42.568183944519795, 12.055390651803465]),
    S2_L2A_CDAS,
    { width: 2391, height: 1783 },
  ],
];

describe('Test imageDimensions with 2500px cap', () => {
  test.each(imageDimensionsFixtures)('Fixtures', (bounds, datasetId, expectedResults) => {
    const results = getImageDimensionFromBoundsWithCap(bounds, datasetId);
    expect(results).toEqual(expectedResults);
  });
});

describe('isSimpleImageFormat', () => {
  test.each([
    [IMAGE_FORMATS.JPG, true],
    [IMAGE_FORMATS.PNG, true],
    [IMAGE_FORMATS.WEBP, true],
    [IMAGE_FORMATS.KMZ_JPG, false],
    [IMAGE_FORMATS.KMZ_PNG, false],
    [IMAGE_FORMATS.TIFF_UINT8, false],
    [IMAGE_FORMATS.TIFF_UINT16, false],
    [IMAGE_FORMATS.TIFF_FLOAT32, false],
  ])('%s → %s', (format, expected) => {
    expect(isSimpleImageFormat(format)).toBe(expected);
  });
});

describe('constructRawBandEvalscript', () => {
  const kelvinBand = 'B10';
  const kelvinBands = [{ name: kelvinBand, unit: BAND_UNIT.KELVIN }];

  const reflectanceBand = 'B04';
  const reflectanceBands = [{ name: reflectanceBand, unit: BAND_UNIT.REFLECTANCE }];

  test('Kelvin band with UINT8 uses HighlightCompressVisualizer for visual mapping', () => {
    const result = constructRawBandEvalscript(kelvinBand, S2_L1C_CDAS, IMAGE_FORMATS.TIFF_UINT8, kelvinBands);
    expect(result).toContain('HighlightCompressVisualizer(200, 375)');
    expect(result).toContain(`255 * visualizer.process(sample.${kelvinBand})`);
    expect(result).toContain('sampleType: "UINT8"');
  });

  test('Kelvin band with UINT16 multiplies by 100 for 0.01 K precision', () => {
    const result = constructRawBandEvalscript(
      kelvinBand,
      S2_L1C_CDAS,
      IMAGE_FORMATS.TIFF_UINT16,
      kelvinBands,
    );
    expect(result).not.toContain('HighlightCompressVisualizer');
    expect(result).toContain(`Math.round(100 * sample.${kelvinBand})`);
    expect(result).toContain('sampleType: "UINT16"');
  });

  test('Kelvin band with FLOAT32 does not use HighlightCompressVisualizer', () => {
    const result = constructRawBandEvalscript(
      kelvinBand,
      S2_L1C_CDAS,
      IMAGE_FORMATS.TIFF_FLOAT32,
      kelvinBands,
    );
    expect(result).not.toContain('HighlightCompressVisualizer');
    expect(result).toContain(`sample.${kelvinBand}`);
    expect(result).toContain('sampleType: "FLOAT32"');
  });

  test('Non-Kelvin band does not use HighlightCompressVisualizer', () => {
    const result = constructRawBandEvalscript(
      reflectanceBand,
      S2_L1C_CDAS,
      IMAGE_FORMATS.TIFF_UINT16,
      reflectanceBands,
    );
    expect(result).not.toContain('HighlightCompressVisualizer');
    expect(result).toContain(`sample.${reflectanceBand}`);
  });

  test('Kelvin band with UINT8 and addDataMask includes dataMask in evalscript', () => {
    const result = constructRawBandEvalscript(
      kelvinBand,
      S2_L1C_CDAS,
      IMAGE_FORMATS.TIFF_UINT8,
      kelvinBands,
      true,
    );
    expect(result).toContain('"dataMask"');
    expect(result).toContain('sample.dataMask');
    expect(result).toContain('bands: 2');
    expect(result).toContain(`255 * visualizer.process(sample.${kelvinBand})`);
  });

  test('native integer DN band (UINT8) with UINT16 output stretches into the UINT16 range', () => {
    const dnBand = 'B01';
    const dnBands = [{ name: dnBand, sampleType: 'UINT8' }];
    const result = constructRawBandEvalscript(dnBand, S2_L1C_CDAS, IMAGE_FORMATS.TIFF_UINT16, dnBands);
    expect(result).toContain(`return [255 * sample.${dnBand}]`);
    expect(result).not.toContain('65535 *');
  });

  test('native integer DN band (UINT16) with UINT16 output has no scale factor prefix', () => {
    const dnBand = 'B01';
    const dnBands = [{ name: dnBand, sampleType: 'UINT16' }];
    const result = constructRawBandEvalscript(dnBand, S2_L1C_CDAS, IMAGE_FORMATS.TIFF_UINT16, dnBands);
    expect(result).toContain(`return [sample.${dnBand}]`);
    expect(result).not.toContain('65535 *');
  });
});

// ---------------------------------------------------------------------------
// addImageOverlays / drawLogo — logoVariant tests
// ---------------------------------------------------------------------------

describe('addImageOverlays — early-return path (showLogo: false)', () => {
  test('returns the original blob unchanged when no overlay flags are set', async () => {
    const blob = new Blob(['fake-image'], { type: 'image/png' });
    const result = await addImageOverlays(
      blob,
      200,
      100,
      'image/png',
      46,
      14,
      10,
      false,
      false,
      false,
      false,
      '',
      [],
      null,
      null,
      '',
      '',
      true,
      true,
      true,
      false,
      [],
      null,
      null,
      null,
      true,
    );
    expect(result).toBe(blob);
  });

  test('returns the original blob when logoVariant is light but showLogo is false', async () => {
    const blob = new Blob(['fake-image'], { type: 'image/png' });
    const result = await addImageOverlays(
      blob,
      200,
      100,
      'image/png',
      46,
      14,
      10,
      false,
      false,
      false,
      false,
      '',
      [],
      null,
      null,
      '',
      '',
      true,
      true,
      true,
      false,
      [],
      null,
      null,
      null,
      true,
      'light',
    );
    expect(result).toBe(blob);
  });

  test('returns the original blob when logoVariant is dark but showLogo is false', async () => {
    const blob = new Blob(['fake-image'], { type: 'image/png' });
    const result = await addImageOverlays(
      blob,
      200,
      100,
      'image/png',
      46,
      14,
      10,
      false,
      false,
      false,
      false,
      '',
      [],
      null,
      null,
      '',
      '',
      true,
      true,
      true,
      false,
      [],
      null,
      null,
      null,
      true,
      'dark',
    );
    expect(result).toBe(blob);
  });
});

describe('getNicename', () => {
  const fromTime = moment.utc('2024-03-15T10:30:00Z');
  const toTime = moment.utc('2024-03-15T10:45:00Z');

  test('builds a correct filename from dates, dataset label and layer title', () => {
    expect(getNicename(fromTime, toTime, S2_L2A_CDAS, 'True Color', false, false)).toBe(
      '2024-03-15-10_30_2024-03-15-10_45_Sentinel-2_L2A_True_Color',
    );
  });

  test('replaces forbidden Windows characters in layer title with underscores', () => {
    expect(getNicename(fromTime, toTime, S2_L2A_CDAS, 'ratio: B04/B03', false, false)).toBe(
      '2024-03-15-10_30_2024-03-15-10_45_Sentinel-2_L2A_ratio__B04_B03',
    );
  });

  test('appends (Raw) suffix for raw band downloads', () => {
    expect(getNicename(fromTime, toTime, S2_L2A_CDAS, null, false, true, 'B04')).toBe(
      '2024-03-15-10_30_2024-03-15-10_45_Sentinel-2_L2A_B04_(Raw)',
    );
  });

  test('uses "custom" as layer name when customSelected is true', () => {
    expect(getNicename(fromTime, toTime, S2_L2A_CDAS, 'True Color', true, false)).toBe(
      '2024-03-15-10_30_2024-03-15-10_45_Sentinel-2_L2A_custom',
    );
  });

  test('omits the from-date prefix when fromTime is null', () => {
    expect(getNicename(null, toTime, S2_L2A_CDAS, 'True Color', false, false)).toBe(
      '2024-03-15-10_45_Sentinel-2_L2A_True_Color',
    );
  });
});

describe('addImageOverlays — drawLogo variant smoke tests (showLogo: true)', () => {
  let OriginalImage;
  let origCreateElement;

  beforeEach(() => {
    // URL.createObjectURL is mocked in setupTests.js; define revokeObjectURL too
    // so that drawBlobOnCanvas's finally-block doesn't throw.
    global.URL.revokeObjectURL = jest.fn();

    // Intercept ALL img element creation (both via new Image() and
    // document.createElement('img')) so that setting src immediately fires
    // onload — without a real network request.  This covers:
    //   - drawBlobOnCanvas (sentinelhub-js) which uses new Image()
    //   - loadImage (ImageDownload.utils.js) which uses document.createElement
    origCreateElement = document.createElement.bind(document);
    document.createElement = function (tag, ...args) {
      const el = origCreateElement(tag, ...args);
      if (tag === 'img') {
        Object.defineProperty(el, 'src', {
          set(_value) {
            setTimeout(() => {
              if (el.onload) {
                el.onload();
              }
            }, 0);
          },
          get() {
            return '';
          },
          configurable: true,
        });
      }
      return el;
    };

    OriginalImage = global.Image;
    global.Image = function MockImageConstructor() {
      return document.createElement('img');
    };
  });

  afterEach(() => {
    global.Image = OriginalImage;
    document.createElement = origCreateElement;
    jest.restoreAllMocks();
  });

  test('completes without error when logoVariant is "light"', async () => {
    const blob = new Blob(['fake-image'], { type: 'image/png' });
    await expect(
      addImageOverlays(
        blob,
        200,
        100,
        'image/png',
        46,
        14,
        10,
        false,
        false,
        false,
        true,
        '',
        [],
        null,
        null,
        '',
        '',
        true,
        true,
        true,
        false,
        [],
        null,
        null,
        null,
        true,
        'light',
      ),
    ).resolves.toBeDefined();
  });

  test('completes without error when logoVariant is "dark"', async () => {
    const blob = new Blob(['fake-image'], { type: 'image/png' });
    await expect(
      addImageOverlays(
        blob,
        200,
        100,
        'image/png',
        46,
        14,
        10,
        false,
        false,
        false,
        true,
        '',
        [],
        null,
        null,
        '',
        '',
        true,
        true,
        true,
        false,
        [],
        null,
        null,
        null,
        true,
        'dark',
      ),
    ).resolves.toBeDefined();
  });

  test('defaults to "light" behavior when logoVariant is omitted', async () => {
    const blob = new Blob(['fake-image'], { type: 'image/png' });
    // Call without the logoVariant argument — the default 'light' should apply.
    await expect(
      addImageOverlays(
        blob,
        200,
        100,
        'image/png',
        46,
        14,
        10,
        false,
        false,
        false,
        true,
        '',
        [],
        null,
        null,
        '',
        '',
        true,
        true,
        true,
        false,
        [],
        null,
        null,
        null,
        true,
        // logoVariant intentionally omitted
      ),
    ).resolves.toBeDefined();
  });

  test('returns a Blob result when showLogo is true', async () => {
    const blob = new Blob(['fake-image'], { type: 'image/png' });
    const result = await addImageOverlays(
      blob,
      200,
      100,
      'image/png',
      46,
      14,
      10,
      false,
      false,
      false,
      true,
      '',
      [],
      null,
      null,
      '',
      '',
      true,
      true,
      true,
      false,
      [],
      null,
      null,
      null,
      true,
      'light',
    );
    expect(result).toBeInstanceOf(Blob);
  });
});

describe('overrideEvalscriptIfNeeded', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    // setEvalscriptSampleType and setEvalscriptOutputScale return the evalscript
    // unchanged by default (implementations set in jest.mock factory are preserved).
  });

  test('applies scale factor for visualization layer with normalized evalscript downloading as UINT8 (regression: #1106)', async () => {
    // Visualization evalscripts (AUTO/FLOAT32 output) need ×256 applied to avoid an all-black TIFF.
    // This was broken when hasIntegerNativeBands incorrectly blocked the scale factor for collections
    // with integer native bands (e.g. S2 Quarterly Cloudless Mosaic).
    getEvalscriptSetup.mockReturnValue({ sampleType: 'AUTO', bands: ['B02', 'B03', 'B04'], nBands: 3 });
    const layer = { collectionId: 'mosaic-collection', evalscript: 'mock-evalscript' };

    await overrideEvalscriptIfNeeded(
      ApiType.PROCESSING,
      IMAGE_FORMATS.TIFF_UINT8,
      layer,
      false,
      null,
      jest.fn(),
      false,
    );

    expect(setEvalscriptOutputScale).toHaveBeenCalledTimes(1);
    expect(setEvalscriptOutputScale).toHaveBeenCalledWith(expect.anything(), 256);
  });

  test('does not apply scale factor when evalscript declares UINT8 output and target is UINT8', async () => {
    // sampleType already matches — the block is skipped entirely.
    getEvalscriptSetup.mockReturnValue({ sampleType: 'UINT8', bands: ['FSCOG'], nBands: 1 });
    const layer = { collectionId: 'my-collection', evalscript: 'mock-evalscript' };

    await overrideEvalscriptIfNeeded(
      ApiType.PROCESSING,
      IMAGE_FORMATS.TIFF_UINT8,
      layer,
      false,
      null,
      jest.fn(),
      false,
    );

    expect(setEvalscriptOutputScale).not.toHaveBeenCalled();
  });

  test('applies 255x stretch when evalscript declares UINT8 output and target is UINT16', async () => {
    // UINT8 DN output (e.g. FSC OG, 0–100 range) converting to UINT16: stretch into the UINT16
    // range without saturating. Applying the full ×65536 factor would overflow.
    getEvalscriptSetup.mockReturnValue({ sampleType: 'UINT8', bands: ['FSCOG'], nBands: 1 });
    const layer = { collectionId: 'my-collection', evalscript: 'mock-evalscript' };

    await overrideEvalscriptIfNeeded(
      ApiType.PROCESSING,
      IMAGE_FORMATS.TIFF_UINT16,
      layer,
      false,
      null,
      jest.fn(),
      false,
    );

    expect(setEvalscriptOutputScale).toHaveBeenCalledTimes(1);
    expect(setEvalscriptOutputScale).toHaveBeenCalledWith(expect.anything(), 255);
  });

  test('does not apply scale factor when evalscript sampleType already matches target (UINT16)', async () => {
    getEvalscriptSetup.mockReturnValue({ sampleType: 'UINT16', bands: ['SCD', 'SCO'], nBands: 2 });
    const layer = { collectionId: 'my-collection', evalscript: 'mock-evalscript' };

    await overrideEvalscriptIfNeeded(
      ApiType.PROCESSING,
      IMAGE_FORMATS.TIFF_UINT16,
      layer,
      false,
      null,
      jest.fn(),
      false,
    );

    expect(setEvalscriptOutputScale).not.toHaveBeenCalled();
  });

  test('applies full scale factor for normalized evalscript downloading as UINT16', async () => {
    getEvalscriptSetup.mockReturnValue({ sampleType: 'FLOAT32', bands: ['B01', 'B02'], nBands: 2 });
    const layer = { collectionId: null, evalscript: 'mock-evalscript' };

    await overrideEvalscriptIfNeeded(
      ApiType.PROCESSING,
      IMAGE_FORMATS.TIFF_UINT16,
      layer,
      false,
      null,
      jest.fn(),
      false,
    );

    expect(setEvalscriptOutputScale).toHaveBeenCalledTimes(1);
    expect(setEvalscriptOutputScale).toHaveBeenCalledWith(expect.anything(), 65536);
  });
});

describe('fetchImage — low-resolution BYOC collection swap (regression #1154)', () => {
  // Mirrors real CLMS VLCC/byLayer datasets where the layer's collectionId differs from the
  // dataset id — the low-resolution helpers must be keyed by collectionId, not datasetId.
  const collectionId = 'byoc-collection-uuid-123';
  const datasetId = 'COPERNICUS_CLMS_SOME_DATASET_ID';
  const lowResolutionCollectionId = 'low-res-collection-uuid-456';
  const lowResolutionThreshold = 300;

  const processGraphFixture = () => ({
    load_collection: { process_id: 'load_collection', arguments: {} },
    save_result: { process_id: 'save_result', arguments: {} },
  });

  let dsh;

  beforeEach(() => {
    dsh = {
      supportsTimeRange: jest.fn(() => true),
      supportsLowResolutionAlternativeCollection: jest.fn((id) => id === collectionId),
      getLowResolutionCollectionId: jest.fn((id) =>
        id === collectionId ? lowResolutionCollectionId : undefined,
      ),
      getLowResolutionMetersPerPixelThreshold: jest.fn((id) =>
        id === collectionId ? lowResolutionThreshold : undefined,
      ),
    };
    getDataSourceHandler.mockImplementation((id) =>
      id === datasetId ? dsh : actualDataSourceHandlers.getDataSourceHandler(id),
    );
    isOpenEoSupported.mockReturnValue(true);
    getProcessGraph.mockImplementation(() => processGraphFixture());
    openEOApi.getResult.mockResolvedValue(new Blob(['result'], { type: 'image/png' }));
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  const buildLayer = () => ({
    instanceId: 'instance-1',
    layerId: 'LAYER_1',
    collectionId,
  });

  const buildOptions = () => ({
    datasetId,
    bounds: latLngBounds([45, 14], [46, 15]),
    fromTime: null,
    toTime: null,
    width: 100,
    height: 100,
    imageFormat: IMAGE_FORMATS.PNG,
    apiType: ApiType.PROCESSING,
    mimeType: 'image/png',
    customSelected: false,
    selectedProcessing: undefined,
    processGraph: undefined,
  });

  test('calls the low-resolution collection helpers with the layer collectionId (not the dataset id) and swaps to the low-res BYOC collection when resolution is coarser than the threshold', async () => {
    metersPerPixel.mockReturnValue(lowResolutionThreshold + 100); // coarser than threshold -> triggers swap

    await fetchImage(buildLayer(), buildOptions());

    expect(dsh.supportsLowResolutionAlternativeCollection).toHaveBeenCalledWith(collectionId);
    expect(dsh.supportsLowResolutionAlternativeCollection).not.toHaveBeenCalledWith(datasetId);
    expect(dsh.getLowResolutionCollectionId).toHaveBeenCalledWith(collectionId);
    expect(dsh.getLowResolutionCollectionId).not.toHaveBeenCalledWith(datasetId);
    expect(dsh.getLowResolutionMetersPerPixelThreshold).toHaveBeenCalledWith(collectionId);
    expect(dsh.getLowResolutionMetersPerPixelThreshold).not.toHaveBeenCalledWith(datasetId);

    expect(openEOApi.getResult).toHaveBeenCalledTimes(1);
    const [sentProcessGraph] = openEOApi.getResult.mock.calls[0];
    expect(sentProcessGraph.load_collection.arguments.id).toBe(`byoc-${lowResolutionCollectionId}`);
  });

  test('does not swap to the low-resolution collection when resolution is finer than the threshold', async () => {
    metersPerPixel.mockReturnValue(lowResolutionThreshold - 100); // finer than threshold -> no swap

    await fetchImage(buildLayer(), buildOptions());

    expect(dsh.getLowResolutionCollectionId).toHaveBeenCalledWith(collectionId);

    expect(openEOApi.getResult).toHaveBeenCalledTimes(1);
    const [sentProcessGraph] = openEOApi.getResult.mock.calls[0];
    expect(sentProcessGraph.load_collection.arguments.id).toBeUndefined();
  });
});

describe('getLayerFromParams — data fusion takes precedence over layerId (regression #1198)', () => {
  const datasetId = 'FAKE_DATA_FUSION_DATASET_ID';
  const dataFusionSettings = [{ id: 'S2L2A', evalscriptName: 'S2L2A' }];
  const fromTime = moment.utc('2024-03-15T10:30:00Z');
  const toTime = moment.utc('2024-03-15T10:45:00Z');

  let dsh;
  let fusionLayer;
  let madeLayer;

  const buildParams = (overrides = {}) => ({
    visualizationUrl: 'https://example.com',
    layerId: 'LAYER_1',
    datasetId,
    fromTime,
    toTime,
    ...overrides,
  });

  beforeEach(() => {
    dsh = { supportsLowResolutionAlternativeCollection: jest.fn(() => false) };
    getDataSourceHandler.mockImplementation((id) =>
      id === datasetId ? dsh : actualDataSourceHandlers.getDataSourceHandler(id),
    );

    fusionLayer = { collectionId: undefined };
    constructDataFusionLayer.mockResolvedValue(fusionLayer);

    madeLayer = { collectionId: undefined, updateLayerFromServiceIfNeeded: jest.fn() };
    LayersFactory.makeLayer.mockResolvedValue(madeLayer);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  test('customSelected + dataFusion + truthy layerId -> builds the data fusion layer, does not call makeLayer', async () => {
    const params = buildParams({ dataFusion: dataFusionSettings, customSelected: true });

    const layer = await getLayerFromParams(params, null);

    expect(constructDataFusionLayer).toHaveBeenCalledWith(
      dataFusionSettings,
      params.evalscript,
      params.evalscriptUrl,
      fromTime,
      toTime,
    );
    expect(LayersFactory.makeLayer).not.toHaveBeenCalled();
    expect(layer).toBe(fusionLayer);
  });

  test('evalscript-only (pin/compare-layer shape, no customSelected) + dataFusion + truthy layerId -> builds the data fusion layer, does not call makeLayer', async () => {
    const params = buildParams({ dataFusion: dataFusionSettings, evalscript: 'mock-evalscript' });

    const layer = await getLayerFromParams(params, null);

    expect(constructDataFusionLayer).toHaveBeenCalledWith(
      dataFusionSettings,
      'mock-evalscript',
      params.evalscriptUrl,
      fromTime,
      toTime,
    );
    expect(LayersFactory.makeLayer).not.toHaveBeenCalled();
    expect(layer).toBe(fusionLayer);
  });

  test('truthy layerId and no dataFusion -> calls makeLayer, does not build a data fusion layer', async () => {
    const params = buildParams();

    const layer = await getLayerFromParams(params, null);

    expect(LayersFactory.makeLayer).toHaveBeenCalledWith(
      params.visualizationUrl,
      params.layerId,
      null,
      expect.anything(),
    );
    expect(constructDataFusionLayer).not.toHaveBeenCalled();
    expect(layer).toBe(madeLayer);
  });

  test('raw-band shape: truthy layerId + customSelected + generated evalscript + no dataFusion -> calls makeLayer, does not build a data fusion layer', async () => {
    const params = buildParams({ customSelected: true, evalscript: 'raw-band-evalscript' });

    const layer = await getLayerFromParams(params, null);

    expect(LayersFactory.makeLayer).toHaveBeenCalledWith(
      params.visualizationUrl,
      params.layerId,
      null,
      expect.anything(),
    );
    expect(constructDataFusionLayer).not.toHaveBeenCalled();
    expect(layer).toBe(madeLayer);
  });

  test('dataFusion present but not a custom visualization + truthy layerId -> calls makeLayer (pre-existing behaviour, e.g. legend-only lookup)', async () => {
    const params = buildParams({ dataFusion: dataFusionSettings });

    const layer = await getLayerFromParams(params, null);

    expect(LayersFactory.makeLayer).toHaveBeenCalledWith(
      params.visualizationUrl,
      params.layerId,
      null,
      expect.anything(),
    );
    expect(constructDataFusionLayer).not.toHaveBeenCalled();
    expect(layer).toBe(madeLayer);
  });
});

describe('resolveComparedLayerTitle — rebuilds legacy layerId-as-title compare captions (regression #1202)', () => {
  const layerId = '2_TONEMAPPED_NATURAL_COLOR';
  const resolvedLayerTitle = 'Highlight Optimized Natural Color';

  test('legacy shape (title ends with ": " + layerId) is rewritten using the resolved layer title', () => {
    const cLayer = {
      title: `Sentinel-2 L2A: ${layerId}`,
      layerId,
      datasetId: S2_L2A_CDAS,
    };

    expect(resolveComparedLayerTitle(cLayer, resolvedLayerTitle)).toBe(
      'Sentinel-2 L2A: Highlight Optimized Natural Color',
    );
  });

  test('pin-sourced title is returned verbatim (does not end with ": " + layerId)', () => {
    const cLayer = {
      title: 'Sentinel-2 L2A: Highlight Optimized Natural Color (Default)',
      layerId,
      datasetId: S2_L2A_CDAS,
    };

    expect(resolveComparedLayerTitle(cLayer, resolvedLayerTitle)).toBe(
      'Sentinel-2 L2A: Highlight Optimized Natural Color (Default)',
    );
  });

  test('custom title is returned verbatim regardless of resolvedLayerTitle', () => {
    const cLayer = {
      title: 'Sentinel-2 L2A: Custom',
      layerId: 'someLayerId',
      datasetId: S2_L2A_CDAS,
    };

    expect(resolveComparedLayerTitle(cLayer, resolvedLayerTitle)).toBe('Sentinel-2 L2A: Custom');
  });

  test('missing resolvedLayerTitle keeps the stored title unchanged', () => {
    const cLayer = {
      title: `Sentinel-2 L2A: ${layerId}`,
      layerId,
      datasetId: S2_L2A_CDAS,
    };

    expect(resolveComparedLayerTitle(cLayer, undefined)).toBe(`Sentinel-2 L2A: ${layerId}`);
  });

  test('missing layerId keeps the stored title unchanged', () => {
    const cLayer = {
      title: `Sentinel-2 L2A: ${layerId}`,
      datasetId: S2_L2A_CDAS,
    };

    expect(resolveComparedLayerTitle(cLayer, resolvedLayerTitle)).toBe(`Sentinel-2 L2A: ${layerId}`);
  });

  test('missing stored title falls back to the resolved layer title', () => {
    const cLayer = {
      layerId,
      datasetId: S2_L2A_CDAS,
    };

    expect(resolveComparedLayerTitle(cLayer, resolvedLayerTitle)).toBe(resolvedLayerTitle);
  });

  test('missing stored title and missing resolvedLayerTitle falls back to an empty string', () => {
    const cLayer = {
      layerId,
      datasetId: S2_L2A_CDAS,
    };

    expect(resolveComparedLayerTitle(cLayer, undefined)).toBe('');
  });
});
