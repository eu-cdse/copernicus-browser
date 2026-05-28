import {
  getImageDimensionFromBoundsWithCap,
  getRawBandsScalingFactor,
  constructRawBandEvalscript,
  addImageOverlays,
} from './ImageDownload.utils';
import { dataSourceHandlers } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { DATASOURCES } from '../../const';

import { BBox, CRS_EPSG3857 } from '@sentinel-hub/sentinelhub-js';
import { getPixelCoordinates } from './ImageDownload.utils';
import { reprojectGeometry } from '../../utils/reproject';
import { latLngBounds } from 'leaflet';
import {
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  BAND_UNIT,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { IMAGE_FORMATS } from './consts';

const TESTING_BYOC_ID = 'test-byoc_id';

function setupTestBYOC() {
  const byocDsh = dataSourceHandlers.find((d) => d.datasource === DATASOURCES.CUSTOM);
  byocDsh.datasets.push(TESTING_BYOC_ID);
  dataSourceHandlers.push(byocDsh);
}

setupTestBYOC();

describe('Test getRawBandsScalingFactor function', () => {
  test.each([
    [TESTING_BYOC_ID, 'FLOAT32', [{ name: 'B01', sampleType: 'UINT16' }], undefined],
    [TESTING_BYOC_ID, 'UINT16', [{ name: 'B01', sampleType: 'UINT16' }], 1],
    [TESTING_BYOC_ID, 'UINT8', [{ name: 'B01', sampleType: 'UINT16' }], 1 / 257], // (2**16 - 1) / 257 = 255
    [TESTING_BYOC_ID, 'FLOAT32', [{ name: 'B01', sampleType: 'UINT8' }], undefined],
    [TESTING_BYOC_ID, 'UINT16', [{ name: 'B01', sampleType: 'UINT8' }], 257],
    [TESTING_BYOC_ID, 'UINT8', [{ name: 'B01', sampleType: 'UINT8' }], 1],
    [S2_L1C_CDAS, 'FLOAT32', [], undefined],
    [S2_L1C_CDAS, 'UINT16', [], 65535],
    [S2_L1C_CDAS, 'UINT8', [], 255],
  ])('raw bands scaling factor', (datasetId, imageSampleType, bandsInfo, expectedFactor) => {
    const factor = getRawBandsScalingFactor({
      datasetId: datasetId,
      imageSampleType: imageSampleType,
      bandsInfo: bandsInfo,
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
