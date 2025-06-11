import bboxPolygon from '@turf/bbox-polygon';
import bbox from '@turf/bbox';
import area from '@turf/area';
import L from 'leaflet';
import turfArea from '@turf/area';
import turfLength from '@turf/length';

export const getLatLngFromBbox = (bbox) => {
  const [minX, minY, maxX, maxY] = bbox;
  return [
    [minY, minX],
    [maxY, maxX],
  ];
};

export const getCoordsFromBbox = (bbox) => {
  if (bbox.length !== 4) {
    throw Error('Not valid bbox');
  }
  const polygonFromBbox = bboxPolygon(bbox);
  return polygonFromBbox.geometry.coordinates;
};

export const getBboxFromCoords = (coords) => {
  const actualCoords = coords[0];
  //bbox = min Longitude , min Latitude , max Longitude , max Latitude
  return [actualCoords[0][0], actualCoords[0][1], actualCoords[1][0], actualCoords[2][1]];
};

export const convertLatLngBoundsToBBox = (bounds) => {
  if (bounds) {
    const sw = bounds.getSouthWest();
    const ne = bounds.getNorthEast();

    return [
      sw.lng, // west
      sw.lat, // south
      ne.lng, // east
      ne.lat, // north
    ];
  }
  return null;
};

export const boundsToPolygon = (bounds) => {
  return {
    type: 'Polygon',
    coordinates: [
      [
        [bounds._southWest.lng, bounds._southWest.lat],
        [bounds._northEast.lng, bounds._southWest.lat],
        [bounds._northEast.lng, bounds._northEast.lat],
        [bounds._southWest.lng, bounds._northEast.lat],
        [bounds._southWest.lng, bounds._southWest.lat],
      ],
    ],
  };
};

export const isPolygon = (geometry) => geometry?.type === 'Polygon' ?? false;

export const isRectangle = (geometry) => {
  if (!isPolygon(geometry)) {
    return false;
  }

  const geometryArea = area(geometry);
  const boundsArea = area(boundsToPolygon(getLeafletBoundsFromBBox(bbox(geometry))));

  return Math.round(geometryArea) === Math.round(boundsArea);
};

export const appendPolygon = (currentGeometry, newPolygon) => {
  if (isPolygon(currentGeometry)) {
    return {
      type: 'MultiPolygon',
      coordinates: [currentGeometry.coordinates, newPolygon.coordinates],
    };
  }
  // multiPolygon
  if (isPolygon(newPolygon)) {
    return {
      type: 'MultiPolygon',
      coordinates: currentGeometry.coordinates.concat([newPolygon.coordinates]),
    };
  }
  return {
    type: 'MultiPolygon',
    coordinates: currentGeometry.coordinates.concat(newPolygon.coordinates),
  };
};

const getLeafletBoundsFromBBox = (bbox) => {
  return L.latLngBounds(L.latLng(bbox[1], bbox[0]), L.latLng(bbox[3], bbox[2]));
};

export const getLeafletBoundsFromGeoJSON = (geometry) => {
  const bb = bbox(geometry);
  return getLeafletBoundsFromBBox(bb);
};

/*
Shape Index is a geometric property used to describe the compactness or circularity of a shape or feature. 
It is calculated by dividing the area of a feature by the square of its perimeter. Multiplying the 
shape index by 4 PI helps to normalize the value and bring it within a specific range.
A perfect circle would have a Shape Index of 1, while a long, skinny shape would have a Shape Index close to 0. 
The Shape Index can be used to identify features with irregular or elongated shapes
*/

export const calculateShapeIndex = ({ geometry }) => {
  const area = turfArea(geometry);
  const length = turfLength(geometry, { units: 'meters' });

  let shapeIndex = 0;
  if (length) {
    shapeIndex = (4 * Math.PI * area) / (length * length);
  }
  return shapeIndex;
};
