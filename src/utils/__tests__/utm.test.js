import { BBox, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';
import { getUtmEpsgCode, getUtmZoneFromBbox, getUtmZoneLabel, isAuthIdUtm } from '../utm';

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

// Regression: world-wrapped longitudes outside [-180, 180] (e.g. after panning across
// the antimeridian) must normalize to a valid 1-60 zone instead of throwing
// "Found zone -2, which is not a valid UTM zone".
const getUtmZoneOutOfRangeFixtures = [
  [new BBox(CRS_EPSG4326, -196, 36, -194, 41), { zone: 58, hemisphere: 'N' }], // center lng -195
  [new BBox(CRS_EPSG4326, -187, 36, -185, 41), { zone: 60, hemisphere: 'N' }], // center lng -186
  [new BBox(CRS_EPSG4326, 199, -36, 201, -30), { zone: 4, hemisphere: 'S' }], // center lng 200
];
describe('Test: getUtmZone with out-of-range longitudes', () => {
  test.each(getUtmZoneOutOfRangeFixtures)('given %p as argument, returns %p', (geometry, expectedResult) => {
    const zone = getUtmZoneFromBbox(geometry);
    expect(zone).toEqual(expectedResult);
    expect(() => getUtmEpsgCode(zone)).not.toThrow();
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

const getUtmZoneLabelFixtures = [
  [new BBox(CRS_EPSG4326, 1, 41, 2, 42), 'UTM 31N (EPSG:32631)'],
  [new BBox(CRS_EPSG4326, -88, 36, -81, 41), 'UTM 16N (EPSG:32616)'],
  [new BBox(CRS_EPSG4326, 174.737, -36.852, 174.789, -36.813), 'UTM 60S (EPSG:32760)'],
];
describe('Test: getUtmZoneLabel', () => {
  test.each(getUtmZoneLabelFixtures)('given %p as argument, returns %p', (bbox, expectedResult) => {
    const label = getUtmZoneLabel(bbox);
    expect(label).toEqual(expectedResult);
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
