import moment from 'moment';
import turfBuffer from '@turf/buffer';
import booleanPointInPolygon from '@turf/boolean-point-in-polygon';
import booleanIntersects from '@turf/boolean-intersects';
import intersect from '@turf/intersect';
import { Position } from 'geojson';

import { calculateShapeIndex } from '../utils/geojson.utils';
import { TABS } from '../const';
import { DEFAULT_EXTERNAL_LAYER_MAX_ZOOM, OSM_MAX_NATIVE_ZOOM } from './const';
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
  activeExternalLayer?: unknown;
  wmsPanelOpen?: boolean;
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
  activeExternalLayer,
  wmsPanelOpen,
}: SingleShLayerParams): boolean =>
  !!(
    !activeExternalLayer &&
    !wmsPanelOpen &&
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

// Leaflet resolves the map's max zoom as the MAXIMUM over every zoom-bound layer
// (Map#getMaxZoom -> _layersMaxZoom), so a per-layer maxZoom can only raise the ceiling — it can
// never cap it. An external WMS/WMTS layer capped at DEFAULT_EXTERNAL_LAYER_MAX_ZOOM therefore
// still lets the user zoom further whenever any other layer on the map declares a higher max
// (e.g. a compared dataset falling back to DEFAULT_COMPARED_LAYERS_MAX_ZOOM = 25). Whenever an
// external layer is actually rendered we pin the map's own options.maxZoom instead, which does
// take precedence over the per-layer values.
export const isExternalLayerRendered = ({
  activeExternalLayer,
  showCompareShLayers,
  comparedLayers,
  selectedTabIndex,
}: {
  activeExternalLayer?: unknown;
  showCompareShLayers: boolean;
  comparedLayers: { externalWms?: unknown }[];
  selectedTabIndex: number;
}): boolean => {
  if (selectedTabIndex !== TABS.VISUALIZE_TAB) {
    return false;
  }
  if (showCompareShLayers) {
    return comparedLayers.some((layer) => !!layer?.externalWms);
  }
  return !!activeExternalLayer;
};

// The OSM basemap is deliberately given a maxZoom far above GISCO's z18 native cap (see
// OSM_LAYER_MAX_ZOOM in const.ts) so it keeps rendering upscaled tiles instead of blanking out
// above z18. But per the note above, Leaflet derives the map ceiling from the MAXIMUM maxZoom
// across all zoom-bound layers — so that inflated value would otherwise let the user zoom to z25
// over any dataset, including ones that only support z18. The basemap must therefore never decide
// the ceiling: it is computed here from the DATA layers alone and pinned on the map, which wins
// over the per-layer maximum.
export const getMapMaxZoom = ({
  externalLayerRendered,
  s2MosaicMaxZoom,
  singleLayerMaxZoom,
  comparedLayerMaxZooms = [],
}: {
  externalLayerRendered: boolean;
  s2MosaicMaxZoom?: number | null;
  singleLayerMaxZoom?: number | null;
  comparedLayerMaxZooms?: (number | null | undefined)[];
}): number => {
  // External WMS/WMTS layers cap the map rather than raise it — see isExternalLayerRendered above.
  if (externalLayerRendered) {
    return DEFAULT_EXTERNAL_LAYER_MAX_ZOOM;
  }

  const dataLayerMaxZooms = [s2MosaicMaxZoom, singleLayerMaxZoom, ...comparedLayerMaxZooms].filter(
    (zoom): zoom is number => typeof zoom === 'number' && Number.isFinite(zoom),
  );

  // Floored at the OSM native cap: with no data layer on the map, the basemap alone decides how far
  // it is useful to zoom, and z18 is exactly what GISCO serves.
  return Math.max(OSM_MAX_NATIVE_ZOOM, ...dataLayerMaxZooms);
};

export const shouldShowS2MosaicTransparency = (
  showSingleShLayer: boolean,
  visibleOnMap: boolean,
  showCompareShLayers: boolean,
): boolean => !!((showSingleShLayer && visibleOnMap) || showCompareShLayers);

// Depends only on render position i, not on comparedLayers.length/index: appending a
// layer at the top is index-stable, but reordering/removing mid-list shifts zIndex
// for every layer between the old and new position.
export const getCompareLayerZIndex = (i: number): number => i + 1;

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
