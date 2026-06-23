import moment from 'moment';
import {
  addImageOverlays,
  constructRawBandEvalscript,
  getImageDimensionFromBoundsWithCap,
  getNicename,
  getPixelCoordinates,
  getRawBandsScalingFactor,
  isSimpleImageFormat,
  overrideEvalscriptIfNeeded,
} from './ImageDownload.utils';
import { BBox, CRS_EPSG3857, ApiType } from '@sentinel-hub/sentinelhub-js';
import { latLngBounds } from 'leaflet';

import {
  BAND_UNIT,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

import { reprojectGeometry } from '../../utils/reproject';
import { IMAGE_FORMATS } from './consts';
import { getEvalscriptSetup, setEvalscriptOutputScale } from '../../utils/parseEvalscript';

jest.mock('../../utils/parseEvalscript', () => ({
  ...jest.requireActual('../../utils/parseEvalscript'),
  getEvalscriptSetup: jest.fn(),
  setEvalscriptSampleType: jest.fn((evalscript) => evalscript),
  setEvalscriptOutputScale: jest.fn((evalscript) => evalscript),
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
