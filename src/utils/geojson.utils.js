import bboxPolygon from '@turf/bbox-polygon';
import bbox from '@turf/bbox';
import area from '@turf/area';
import L from 'leaflet';
import turfArea from '@turf/area';
import turfLength from '@turf/length';
import union from '@turf/union';
import booleanIntersects from '@turf/boolean-intersects';

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

/**
 * Simplifies a geometry by converting each polygon to its bounding box,
 * then unioning any overlapping bboxes to avoid self-intersections.
 * For Polygon: returns a single bounding box polygon
 * For MultiPolygon: returns a Polygon or MultiPolygon of merged bounding boxes
 * This is useful for reducing URL length in GET requests while still covering the same area.
 * @param {Object} geometry - GeoJSON geometry (Polygon or MultiPolygon)
 * @returns {Object} - Simplified GeoJSON geometry (Polygon or MultiPolygon)
 */
export const geometryToBBoxGeometry = (geometry) => {
  if (!geometry) {
    return null;
  }

  if (geometry.type === 'Polygon') {
    // Convert single polygon to its bounding box
    const bb = bbox(geometry);
    return bboxPolygon(bb).geometry;
  }

  if (geometry.type === 'MultiPolygon') {
    // Convert each polygon to its bounding box
    const bboxFeatures = geometry.coordinates.map((polygonCoords) => {
      const singlePolygon = {
        type: 'Polygon',
        coordinates: polygonCoords,
      };
      const bb = bbox(singlePolygon);
      return bboxPolygon(bb);
    });

    // Merge overlapping bboxes using union to avoid self-intersections
    const mergedFeatures = mergeOverlappingFeatures(bboxFeatures);

    if (mergedFeatures.length === 1) {
      return mergedFeatures[0].geometry;
    }

    // Return as MultiPolygon if multiple non-overlapping groups remain
    return {
      type: 'MultiPolygon',
      coordinates: mergedFeatures.map((f) => f.geometry.coordinates),
    };
  }

  // Return as-is for other geometry types (Point, LineString, etc.)
  return geometry;
};

/**
 * Merges overlapping polygon features using union.
 * Groups features that intersect and unions each group into a single feature.
 * @param {Array} features - Array of GeoJSON Feature objects with Polygon geometries
 * @returns {Array} - Array of merged Feature objects
 */
const mergeOverlappingFeatures = (features) => {
  if (features.length <= 1) {
    return features;
  }

  // Track which features have been merged
  const merged = new Array(features.length).fill(false);
  const result = [];

  for (let i = 0; i < features.length; i++) {
    if (merged[i]) {
      continue;
    }

    let current = features[i];
    merged[i] = true;

    // Keep trying to merge with other features until no more merges happen
    let didMerge = true;
    while (didMerge) {
      didMerge = false;
      for (let j = 0; j < features.length; j++) {
        if (merged[j]) {
          continue;
        }

        if (booleanIntersects(current, features[j])) {
          try {
            const unionResult = union(current, features[j]);
            if (unionResult) {
              current = unionResult;
              merged[j] = true;
              didMerge = true;
            }
          } catch (e) {
            // If union fails, skip this merge
            console.warn('Union failed for overlapping geometries:', e);
          }
        }
      }
    }

    result.push(current);
  }

  return result;
};

/**
 * Counts the total number of vertices in a GeoJSON geometry.
 * @param {Object} geometry - GeoJSON geometry (Polygon, MultiPolygon, etc.)
 * @returns {number} - Total number of vertices
 */
export const countGeometryVertices = (geometry) => {
  if (!geometry || !geometry.coordinates) {
    return 0;
  }

  if (geometry.type === 'Polygon') {
    // Polygon coordinates: [[[x,y], [x,y], ...], [...holes...]]
    return geometry.coordinates.reduce((total, ring) => total + ring.length, 0);
  }

  if (geometry.type === 'MultiPolygon') {
    // MultiPolygon coordinates: [[[[x,y], ...]], [[[x,y], ...]]]
    return geometry.coordinates.reduce((total, polygon) => {
      return total + polygon.reduce((polyTotal, ring) => polyTotal + ring.length, 0);
    }, 0);
  }

  if (geometry.type === 'LineString') {
    return geometry.coordinates.length;
  }

  if (geometry.type === 'MultiLineString') {
    return geometry.coordinates.reduce((total, line) => total + line.length, 0);
  }

  if (geometry.type === 'Point') {
    return 1;
  }

  if (geometry.type === 'MultiPoint') {
    return geometry.coordinates.length;
  }

  return 0;
};

// Default maximum characters for geometry in WKT format per occurrence in the URL
// This accounts for browser URL limits (~8000 chars) and the fact that geometry
// may be repeated multiple times in OData queries (once per collection/productType)
// A bbox typically takes ~50-80 chars, leaving room for multiple repetitions
export const DEFAULT_MAX_GEOMETRY_CHARS = 500;

/**
 * Estimates the WKT (Well-Known Text) string length for a geometry.
 * This is useful for determining if a geometry needs to be simplified
 * to fit within URL length limits for GET requests.
 *
 * The estimation assumes coordinates are rounded to 3 decimal places
 * (as done by roundGeometryValues in ODataHelpers) and is based on:
 * - Each coordinate pair takes approximately: "-12.345 -12.345, " ≈ 18 chars
 * - Polygon wrapper: "POLYGON (())" = ~12 chars
 * - MultiPolygon wrapper: "MULTIPOLYGON ()" = ~15 chars per polygon
 *
 * @param {Object} geometry - GeoJSON geometry (Polygon or MultiPolygon)
 * @returns {number} - Estimated character count for WKT representation
 */
export const estimateWktLength = (geometry) => {
  if (!geometry) {
    return 0;
  }

  const vertexCount = countGeometryVertices(geometry);

  // Average chars per coordinate with 3 decimal precision: "-12.345 -12.345, " ≈ 18 chars
  // This is conservative to account for variation in coordinate values
  const CHARS_PER_VERTEX = 18;
  // Base overhead for POLYGON (()) wrapper
  const POLYGON_OVERHEAD = 12;
  // Additional overhead per polygon in MULTIPOLYGON
  const MULTIPOLYGON_PER_POLYGON_OVERHEAD = 4;
  // Base overhead for MULTIPOLYGON wrapper
  const MULTIPOLYGON_OVERHEAD = 15;

  if (geometry.type === 'Polygon') {
    return POLYGON_OVERHEAD + vertexCount * CHARS_PER_VERTEX;
  }

  if (geometry.type === 'MultiPolygon') {
    const polygonCount = geometry.coordinates.length;
    return (
      MULTIPOLYGON_OVERHEAD +
      polygonCount * MULTIPOLYGON_PER_POLYGON_OVERHEAD +
      vertexCount * CHARS_PER_VERTEX
    );
  }

  // Fallback for other geometry types
  return vertexCount * CHARS_PER_VERTEX;
};

/**
 * Builds a search geometry from available bounds and geometry sources.
 * Prioritizes AOI geometry (uses original if estimated WKT length is within limit,
 * otherwise simplified to bbox), then combines AOI/POI bounds, then falls back to map bounds.
 *
 * @param {Object} options - Options object
 * @param {Object} options.mapBounds - Leaflet bounds from the map viewport
 * @param {Object} options.aoiBounds - Leaflet bounds from Area of Interest
 * @param {Object} options.poiBounds - Leaflet bounds from Point of Interest
 * @param {Object} options.aoiGeometry - GeoJSON geometry from Area of Interest (can be complex polygon)
 * @param {number} options.maxGeometryChars - Maximum allowed characters for WKT representation.
 *   This should account for how many times the geometry will be repeated in the query.
 *   For OData queries, geometry is repeated per collection/productType, so lower values
 *   may be needed when many collections are selected.
 *   Default: 500 chars (allows ~5-10 repetitions within typical URL limits)
 * @returns {Object} - Object with:
 *   - geometry: GeoJSON Polygon or MultiPolygon geometry for search queries
 *   - wasSimplified: boolean indicating if geometry was simplified to bbox
 */
export const buildSearchGeometry = ({
  mapBounds,
  aoiBounds,
  poiBounds,
  aoiGeometry,
  maxGeometryChars = DEFAULT_MAX_GEOMETRY_CHARS,
}) => {
  // If we have an AOI geometry, use it directly if simple enough, otherwise simplify to bbox
  if (aoiGeometry) {
    const estimatedLength = estimateWktLength(aoiGeometry);
    if (estimatedLength <= maxGeometryChars) {
      // Use original geometry for simple shapes
      return { geometry: aoiGeometry, wasSimplified: false };
    }
    // Simplify complex geometries to bounding box(es) to keep URL length manageable
    return { geometry: geometryToBBoxGeometry(aoiGeometry), wasSimplified: true };
  }

  // Combine AOI and POI bounds if both exist
  if (aoiBounds && poiBounds) {
    return {
      geometry: appendPolygon(boundsToPolygon(aoiBounds), boundsToPolygon(poiBounds)),
      wasSimplified: false,
    };
  }

  // Use AOI bounds if available
  if (aoiBounds) {
    return { geometry: boundsToPolygon(aoiBounds), wasSimplified: false };
  }

  // Use POI bounds if available
  if (poiBounds) {
    return { geometry: boundsToPolygon(poiBounds), wasSimplified: false };
  }

  // Fall back to map bounds
  if (mapBounds) {
    return { geometry: boundsToPolygon(mapBounds), wasSimplified: false };
  }

  return { geometry: null, wasSimplified: false };
};
