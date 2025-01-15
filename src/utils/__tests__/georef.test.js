import bboxPolygon from '@turf/bbox-polygon';
import { getGeoRefBounds } from '../georef';

const getMgrsBoundsFixtures = [
  ['AA', bboxPolygon([-180, -90, -165, -75])],
  ['GJPJ', bboxPolygon([-77, 38, -76, 39])],
];

describe('Test: georef bounds', () => {
  test.each(getMgrsBoundsFixtures)('given %p as argument, returns %p', (geoRefId, expectedResult) => {
    const polygon = getGeoRefBounds(geoRefId);
    expect(polygon.geometry).toEqual(expectedResult.geometry);
  });
});
