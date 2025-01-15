import bboxPolygon from '@turf/bbox-polygon';
import { round } from '@turf/helpers';
import { coordEach } from '@turf/meta';
import { getMgrsBounds } from '../mgrs';

// results verified from https://legallandconverter.com/p50.html, where one can search and find bounds from "overlay" results
const getMgrsBoundsFixtures = [
  ['18UUB', bboxPolygon([-77.821311, 50.517741, -76.438877, 51.442352])],
  ['4QFJ15', bboxPolygon([-157.939865, 21.248328, -157.842796, 21.338029])],
];

describe('Test: mgrs bounds', () => {
  test.each(getMgrsBoundsFixtures)('given %p as argument, returns %p', (mgrsId, expectedResult) => {
    const polygon = getMgrsBounds(mgrsId);
    coordEach(polygon, (currentCoord, coordIndex, featureIndex, multiFeatureIndex, geometryIndex) => {
      polygon.geometry.coordinates[geometryIndex][coordIndex] = [
        round(currentCoord[0], 6),
        round(currentCoord[1], 6),
      ];
    });
    expect(polygon.geometry).toEqual(expectedResult.geometry);
  });
});
