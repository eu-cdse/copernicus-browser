import proj4 from 'proj4';
import round from 'lodash.round';

import { AVAILABLE_CRS } from '../Controls/ImgDownload/consts';

/**
 * A FromToCrs object
 * @typedef {Object} FromToCrs
 * @property {fromCrs=} CRS[authId] authId
 * @property {toCrs} CRS[authId] authId
 */

/**
 * Function reprojecting geometry to a different crs
 *
 * @param {Geometry} geometry - Geojson geometry
 * @param {FromToCrs} fromToCrsObj - Object containg fromCrs and toCrs. Optional fromCrs where default is 'EPSG:4326'
 * @return {Geometry} Reproject geometry
 *
 * @example
 *
 *    reprojectGeometry(geometry, {fromCrs: 'EPSG:4326', toCrs: 'EPSG3857' })
 */
export const reprojectGeometry = (geometry, { fromCrs, toCrs }) => {
  if (!geometry) {
    return null;
  }
  try {
    if (!fromCrs) {
      if (geometry && geometry.crs && geometry.crs.properties.name) {
        fromCrs = getCrsIdFromUrn(geometry.crs.properties.name);
      } else {
        fromCrs = 'EPSG:4326';
      }
    }
    const fromProjection = getProjectionFromCrsId(fromCrs);
    const toProjection = getProjectionFromCrsId(toCrs);
    if (geometry.type === 'Polygon') {
      return reprojectPolygon(geometry, fromProjection, toProjection);
    } else if (geometry.type === 'MultiPolygon') {
      return reprojectMultiPolygon(geometry, fromProjection, toProjection);
    } else if (geometry.type === 'Point') {
      return reprojectPoint(geometry, fromProjection, toProjection);
    } else if (geometry.type === 'LineString') {
      return reprojectLine(geometry, fromProjection, toProjection);
    } else if (geometry.type === 'MultiLineString') {
      return reprojectMultiLine(geometry, fromProjection, toProjection);
    }
  } catch (err) {
    console.error('Invalid geometry', err);
  }
};

// coords [x,y]
export const reprojectCoordPoint = (coords, fromProj, toProj) => proj4(fromProj, toProj, coords);

const reprojectPoint = (point, fromProj, toProj) => {
  const transformedCoords = reprojectCoordPoint(point.coordinates, fromProj, toProj);
  const resultPoint = {
    type: 'Point',
    coordinates: transformedCoords,
  };
  return resultPoint;
};

// coords [[[x,y],[x,y]]]
const reprojectArrayOfCoordinates = (coords, fromProj, toProj) => {
  if (isGlobalPolygon(coords[0], fromProj)) {
    return createGlobalPolygonInWebMercator(coords[0], fromProj, toProj);
  }

  return [
    coords[0]
      .map((coord) => proj4(fromProj, toProj, coord))
      .map((pair) => [round(pair[0], 6), round(pair[1], 6)]),
  ];
};

const isGlobalPolygon = (ring, fromProj) => {
  if (fromProj.getCode && fromProj.getCode() !== 'EPSG:4326') {
    return false;
  }

  const longitudes = ring.map((p) => p[0]);
  const minLon = Math.min(...longitudes);
  const maxLon = Math.max(...longitudes);

  // If the polygon spans more than 359°, it's a global polygon
  return maxLon - minLon > 359;
};

const createGlobalPolygonInWebMercator = (ring, fromProj, toProj) => {
  const latitudes = ring.map((p) => p[1]);
  const minLat = Math.min(...latitudes);
  const maxLat = Math.max(...latitudes);

  const southWest = proj4(fromProj, toProj, [-180, minLat]);
  const northWest = proj4(fromProj, toProj, [-180, maxLat]);

  const EARTH_RADIUS = 6378137;
  const MAX_MERCATOR_X = Math.PI * EARTH_RADIUS;

  return [
    [
      [-MAX_MERCATOR_X, southWest[1]],
      [-MAX_MERCATOR_X, northWest[1]],
      [MAX_MERCATOR_X, northWest[1]],
      [MAX_MERCATOR_X, southWest[1]],
      [-MAX_MERCATOR_X, southWest[1]],
    ],
  ];
};

export const reprojectPolygon = (polygonToTransform, fromProj, toProj) => {
  const transformedCoords = reprojectArrayOfCoordinates(polygonToTransform.coordinates, fromProj, toProj);
  const polygon = {
    type: 'Polygon',
    coordinates: transformedCoords,
  };
  return polygon;
};

const reprojectCoordMultiPolygon = (coords, fromProj, toProj) =>
  coords.map((polyCoords) => reprojectArrayOfCoordinates(polyCoords, fromProj, toProj));

const reprojectMultiPolygon = (multiPolygon, fromProj, toProj) => {
  const transformedCoords = reprojectCoordMultiPolygon(multiPolygon.coordinates, fromProj, toProj);
  const resultMultiPolygon = {
    type: 'MultiPolygon',
    coordinates: transformedCoords,
  };
  return resultMultiPolygon;
};

export const reprojectLine = (lineToTransform, fromProj, toProj) => {
  const transformedCoords = lineToTransform.coordinates.map(([first, second]) =>
    reprojectCoordPoint([first, second], fromProj, toProj),
  );

  return {
    type: 'LineString',
    coordinates: transformedCoords,
  };
};

export const reprojectMultiLine = (lineToTransform, fromProj, toProj) => {
  const transformedCoords = lineToTransform.coordinates.map((line) =>
    reprojectLine({ coordinates: line }, fromProj, toProj),
  );

  return {
    type: 'MultiLineString',
    coordinates: transformedCoords,
  };
};

const getCrsIdFromUrn = (urn) => {
  const split = urn.split(':');
  return split[split.length - 3] + ':' + split[split.length - 1];
};

const getProjectionFromCrsId = (crsId) => {
  const crs = AVAILABLE_CRS[crsId];
  if (!crs) {
    throw new Error(`${crsId} is not a supported crs`);
  }
  return crs.projection;
};
