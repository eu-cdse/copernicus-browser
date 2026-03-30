import moment from 'moment';
import turfBuffer from '@turf/buffer';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import booleanIntersects from '@turf/boolean-intersects';
import intersect from '@turf/intersect';
import { Position } from 'geojson';

import { calculateShapeIndex } from '../utils/geojson.utils';
import { TABS } from '../const';
import { reprojectGeometry } from '../utils/reproject';

const COMPACTNESS_THRESHOLD = 0.005;

//calculate buffer radius as geometric sequence with a common ratio of 0.5 and first term of maxBufferRadius
export const getBufferRadius = (
  zoom: number,
  minZoom = 3,
  maxZoom = 12,
  maxBufferRadius = 20000, //meters
  defaultBufferRadius = 10, //meters
): number => {
  if (zoom <= minZoom) {
    return maxBufferRadius;
  }

  if (zoom > maxZoom) {
    return defaultBufferRadius;
  }

  const radius = maxBufferRadius * Math.pow(0.5, zoom - minZoom);
  return radius;
};

const createBuffer = (feature: GeoJSON.Feature, zoom: number) => {
  return turfBuffer(feature.geometry, getBufferRadius(zoom), {
    units: 'meters',
  });
};

export const getIntersectingFeatures = (
  point: GeoJSON.Feature,
  features: GeoJSON.Feature[],
  { zoom }: { zoom: number },
) => {
  const results = features.filter((feature) => {
    if (!feature?.geometry) {
      return false;
    }

    let bufferedPoint = point;
    let intersectFunction = booleanPointInPolygon as (
      a: GeoJSON.Feature | GeoJSON.Geometry,
      b: GeoJSON.Feature | GeoJSON.Geometry,
    ) => boolean | GeoJSON.Feature<GeoJSON.Polygon | GeoJSON.MultiPolygon> | null;

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

      // Check if reprojected geometries contain invalid values (null/NaN)
      // This happens when coordinates are outside EPSG:3857 valid range (e.g., poles at ±90°)
      const hasValidReprojection = (geometry: GeoJSON.Geometry): boolean => {
        if (!('coordinates' in geometry) || !geometry.coordinates) {
          return false;
        }

        const checkCoords = (coords: Position | Position[] | Position[][] | Position[][][]): boolean => {
          if (Array.isArray(coords[0])) {
            return (coords as Array<Position | Position[] | Position[][]>).every(checkCoords);
          }

          return (coords as Position).every((c) => c !== null && !isNaN(c) && isFinite(c));
        };

        return checkCoords(geometry.coordinates);
      };

      const reprojectedPointValid =
        reprojectedBufferedPoint && hasValidReprojection(reprojectedBufferedPoint);
      const reprojectedGeometryValid = reprojectedGeometry && hasValidReprojection(reprojectedGeometry);

      if (reprojectedPointValid && reprojectedGeometryValid) {
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

export const createClickedPoint = (latlng: { lat: number; lng: number }): GeoJSON.Feature<GeoJSON.Point> => ({
  type: 'Feature',
  properties: null,
  geometry: {
    type: 'Point',
    coordinates: [latlng.lng, latlng.lat],
  },
});

type SingleShLayerParams = {
  authenticated: boolean;
  dataSourcesInitialized: boolean;
  selectedTabIndex: number;
  displayingSearchResults: boolean;
  showComparePanel: boolean;
  visualizationLayerId: string | null;
  customSelected: boolean;
  datasetId: string | null;
  visualizationUrl: string | null;
};

export const shouldShowSingleShLayer = ({
  authenticated,
  dataSourcesInitialized,
  selectedTabIndex,
  displayingSearchResults,
  showComparePanel,
  visualizationLayerId,
  customSelected,
  datasetId,
  visualizationUrl,
}: SingleShLayerParams): boolean =>
  !!(
    authenticated &&
    dataSourcesInitialized &&
    selectedTabIndex === TABS.VISUALIZE_TAB &&
    !displayingSearchResults &&
    !showComparePanel &&
    (visualizationLayerId || customSelected) &&
    datasetId &&
    visualizationUrl
  );

export const shouldShowCompareShLayers = ({
  comparedLayers,
  selectedTabIndex,
  showComparePanel,
}: {
  comparedLayers: unknown[]; // compareLayersSlice is untyped legacy JS; only .length is accessed here
  selectedTabIndex: number;
  showComparePanel: boolean;
}): boolean => !!(comparedLayers.length && selectedTabIndex === TABS.VISUALIZE_TAB && showComparePanel);

export const shouldShowS2MosaicTransparency = (
  showSingleShLayer: boolean,
  visibleOnMap: boolean,
  showCompareShLayers: boolean,
): boolean => !!((showSingleShLayer && visibleOnMap) || showCompareShLayers);

export const getPinTimes = (
  fromTime: string | null | undefined,
  toTime: string,
  supportsTimeRange: boolean,
): { pinTimeFrom: Date | undefined; pinTimeTo: Date } => {
  if (supportsTimeRange) {
    if (fromTime) {
      return {
        pinTimeFrom: moment.utc(fromTime).toDate(),
        pinTimeTo: moment.utc(toTime).toDate(),
      };
    }
    return {
      pinTimeFrom: moment.utc(toTime).startOf('day').toDate(),
      pinTimeTo: moment.utc(toTime).endOf('day').toDate(),
    };
  }
  // pinTimeFrom is intentionally null (not undefined) when time range is unsupported
  return {
    pinTimeFrom: undefined,
    pinTimeTo: moment.utc(toTime).endOf('day').toDate(),
  };
};
