import { getImageDimensionFromBoundsWithCap, getRawBandsScalingFactor } from './ImageDownload.utils';
import { dataSourceHandlers, S2L1C } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { DATASOURCES } from '../../const';

import { BBox, CRS_EPSG3857 } from '@sentinel-hub/sentinelhub-js';
import { getPixelCoordinates } from './ImageDownload.utils';
import { reprojectGeometry } from '../../utils/reproject';
import { latLngBounds } from 'leaflet';

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
    [S2L1C, 'FLOAT32', [], undefined],
    [S2L1C, 'UINT16', [], 65535],
    [S2L1C, 'UINT8', [], 255],
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
  [latLngBounds([0, 2], [1, 5]), 'S2L2A', { width: 2500, height: 833.4081925979159 }],
  [latLngBounds([2, 0], [5, 1]), 'S2L2A', { width: 831.6896778435239, height: 2500 }],
  [latLngBounds([0, 2], [0.1, 2.3]), 'S2L2A', { width: 2500, height: 833.0838323353292 }],
  [latLngBounds([0, 2], [0.3, 2.1]), 'S2L2A', { width: 833.0838323353294, height: 2500 }],
  [
    latLngBounds([42.45011889843056, 11.840642269235106], [42.568183944519795, 12.055390651803465]),
    'S2L2A',
    { width: 2391, height: 1783 },
  ],
];

describe('Test imageDimensions with 2500px cap', () => {
  test.each(imageDimensionsFixtures)('Fixtures', (bounds, datasetId, expectedResults) => {
    const results = getImageDimensionFromBoundsWithCap(bounds, datasetId);
    expect(results).toEqual(expectedResults);
  });
});
