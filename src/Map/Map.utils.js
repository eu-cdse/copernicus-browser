import turfBuffer from '@turf/buffer';

import { calculateShapeIndex } from '../utils/geojson.utils';
import { reprojectGeometry } from '../utils/reproject';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import booleanIntersects from '@turf/boolean-intersects';
import intersect from '@turf/intersect';

const COMPACTNESS_THRESHOLD = 0.005;

//calculate buffer radius as geometric sequence with a common ratio of 0.5 and first term of maxBufferRadius
const getBufferRadius = (
  zoom,
  minZoom = 3,
  maxZoom = 12,
  maxBufferRadius = 20000, //meters
  defaultBufferRadius = 10, //meters
) => {
  if (zoom <= minZoom) {
    return maxBufferRadius;
  }

  if (zoom > maxZoom) {
    return defaultBufferRadius;
  }

  const radius = maxBufferRadius * Math.pow(0.5, zoom - minZoom);
  return radius;
};

const createBuffer = (feature, zoom) => {
  return turfBuffer(feature.geometry, getBufferRadius(zoom), {
    units: 'meters',
  });
};

const getIntersectingFeatures = (point, features, { zoom }) => {
  const results = features.filter((feature) => {
    if (!feature?.geometry) {
      return false;
    }

    let bufferedPoint = point;
    let intersectFunction = booleanPointInPolygon;

    const shapeIndex = calculateShapeIndex(feature);

    if (shapeIndex < COMPACTNESS_THRESHOLD) {
      bufferedPoint = createBuffer(point, zoom);

      if (feature.geometry.type === 'Polygon' || feature.geometry.type === 'MultiPolygon') {
        intersectFunction = intersect;
      } else {
        intersectFunction = booleanIntersects;
      }
    }

    let hasIntersection;

    try {
      const reprojectedBufferedPoint = reprojectGeometry(bufferedPoint.geometry, {
        fromCrs: 'EPSG:4326',
        toCrs: 'EPSG:3857',
      });

      const reprojectedGeometry = reprojectGeometry(feature.geometry, {
        fromCrs: 'EPSG:4326',
        toCrs: 'EPSG:3857',
      });

      if (reprojectedBufferedPoint && reprojectedGeometry) {
        hasIntersection = intersectFunction(reprojectedBufferedPoint, reprojectedGeometry);
      } else {
        hasIntersection = intersectFunction(bufferedPoint.geometry, feature.geometry);
      }
    } catch (e) {
      console.error('Unable to calculate intersection', e.message);
      hasIntersection = false;
    }

    return hasIntersection;
  });
  return results;
};

export { getIntersectingFeatures, getBufferRadius };
