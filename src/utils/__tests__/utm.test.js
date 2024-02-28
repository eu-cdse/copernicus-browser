import { BBox, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';
import { getUtmEpsgCode, getUtmZoneFromBbox, isAuthIdUtm } from '../utm';

const getUtmZoneFixtures = [
  [new BBox(CRS_EPSG4326, 175.933943, 65.379248, 180.505886, 66.548298), { zone: 60, hemisphere: 'N' }],
  [new BBox(CRS_EPSG4326, -88, 36, -81, 41), { zone: 16, hemisphere: 'N' }],
  [new BBox(CRS_EPSG4326, 180.496445, 65.379248, 184.583359, 66.803643), { zone: 1, hemisphere: 'N' }],
  [new BBox(CRS_EPSG4326, 174.737, -36.852, 174.789, -36.813), { zone: 60, hemisphere: 'S' }],
];

describe('Test: getUtmZone', () => {
  test.each(getUtmZoneFixtures)('given %p as argument, returns %p', (geometry, expectedResult) => {
    const zone = getUtmZoneFromBbox(geometry);
    expect(zone).toEqual(expectedResult);
  });
});

const getEpsgCodeFixtures = [
  [{ zone: 60, hemisphere: 'N' }, '32660'],
  [{ zone: 1, hemisphere: 'N' }, '32601'],
  [{ zone: 1, hemisphere: 'S' }, '32701'],
  [{ zone: 12, hemisphere: 'S' }, '32712'],
];
describe('Test: getUtmEpsgFromUtmZone', () => {
  test.each(getEpsgCodeFixtures)('given %p as argument, returns %p', (utmZoneObject, expectedResult) => {
    const zone = getUtmEpsgCode(utmZoneObject);
    expect(zone).toEqual(expectedResult);
  });
});

const isUtmFixtures = [
  ['EPSG:4326', false],
  ['EPSG:32633', true],
];
describe('Test: isAuthIdUtm', () => {
  test.each(isUtmFixtures)('given %p as argument, returns %p', (utmZoneObject, expectedResult) => {
    const isUtm = isAuthIdUtm(utmZoneObject);
    expect(isUtm).toEqual(expectedResult);
  });
});
