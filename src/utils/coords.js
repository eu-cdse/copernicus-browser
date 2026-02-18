import { coordEach } from '@turf/meta';
import { featureCollection, point as turfPoint } from '@turf/helpers';
import geo_area from '@mapbox/geojson-area';
import { reprojectGeometry } from './reproject';
import { BBox, CRS_EPSG3857, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';
import { BBOX_PADDING } from '../const';

export const EQUATOR_RADIUS = 6378137.0;

export function isCoordsEmpty(geojsonFeature) {
  let coordsEmpty = false;
  coordEach(geojsonFeature, (currentCoord) => {
    if (!currentCoord) {
      coordsEmpty = true;
    }
  });

  return coordsEmpty;
}

// Accepts a geojson, where we look if one of the features has any coordinate that is undefined.
// If the feature has a non valid coordinate, we remove that feature, or we return null when the FeatureCollection has no valid feature(coordinates)
export function removeAoiWithEmptyCoords(geojson) {
  switch (geojson.type) {
    case 'Feature':
      if (isCoordsEmpty(geojson)) {
        return null;
      }
      return geojson;
    case 'FeatureCollection':
      const features = geojson.features.filter((feature) => !isCoordsEmpty(feature));
      return features.length > 0
        ? featureCollection(
            geojson.features.filter((feature) => {
              return !isCoordsEmpty(feature);
            }),
          )
        : null;
    default:
      return geojson;
  }
}

export function getRecommendedResolution(boundsGeojson, resolution, fisResolutionCeiling) {
  const areaM2 = geo_area.geometry(boundsGeojson);
  const recommendedResolution = Math.max(
    resolution || 10, // resolution of the layer is a minimal allowed value
    Math.min(fisResolutionCeiling || 2000, Math.ceil(Math.sqrt(areaM2 / 1000))), // we would like to get a bit more than 1000 points
  );
  return recommendedResolution;
}

//calculate zoom level for leaflet bounds
export function getBoundsZoomLevel(bounds) {
  const WORLD_DIM = { height: 256, width: 256 };
  const ZOOM_MAX = 21;

  function latRad(lat) {
    const sin = Math.sin((lat * Math.PI) / 180);
    const radX2 = Math.log((1 + sin) / (1 - sin)) / 2;
    return Math.max(Math.min(radX2, Math.PI), -Math.PI) / 2;
  }

  function zoom(mapPx, worldPx, fraction) {
    return Math.floor(Math.log(mapPx / worldPx / fraction) / Math.LN2);
  }

  const ne = bounds.getNorthEast();
  const sw = bounds.getSouthWest();

  const latFraction = (latRad(ne.lat) - latRad(sw.lat)) / Math.PI;

  const lngDiff = ne.lng - sw.lng;
  const lngFraction = (lngDiff < 0 ? lngDiff + 360 : lngDiff) / 360;

  const latZoom = zoom(window.innerHeight, WORLD_DIM.height, latFraction);
  const lngZoom = zoom(window.innerWidth, WORLD_DIM.width, lngFraction);

  return Math.min(latZoom, lngZoom, ZOOM_MAX);
}

export function switchGeometryCoordinates(geometry) {
  // getStats makes request with ESPG:4326, but geojson is in WGS:84.
  const switchCoordinates = (coordsGroup) => [coordsGroup[0].map((coord) => [coord[1], coord[0]])];

  return {
    type: geometry.type,
    coordinates:
      geometry.type === 'Polygon'
        ? switchCoordinates(geometry.coordinates)
        : geometry.coordinates.map((subPolygonCoords) => switchCoordinates(subPolygonCoords)),
  };
}
export function ensureMercatorBBox(bbox) {
  if (bbox.crs.authId === CRS_EPSG3857.authId) {
    return bbox;
  }
  const minPoint = turfPoint([bbox.minX, bbox.minY]);
  const maxPoint = turfPoint([bbox.maxX, bbox.maxY]);

  const minPointMercator = reprojectGeometry(minPoint.geometry, { fromCrs: 'EPSG:4326', toCrs: 'EPSG:3857' });
  const maxPointMercator = reprojectGeometry(maxPoint.geometry, { fromCrs: 'EPSG:4326', toCrs: 'EPSG:3857' });

  return new BBox(
    CRS_EPSG3857,
    minPointMercator.coordinates[0],
    minPointMercator.coordinates[1],
    maxPointMercator.coordinates[0],
    maxPointMercator.coordinates[1],
  );
}

function lat(y) {
  return 2 * (Math.PI / 4 - Math.atan(Math.exp(-y / EQUATOR_RADIUS)));
}

export function metersPerPixel(bbox, width) {
  const newBBox = ensureMercatorBBox(bbox);

  const widthInMeters = Math.abs(newBBox.maxX - newBBox.minX);
  const latitude = (newBBox.minY + newBBox.maxY) / 2;

  return (widthInMeters / width) * Math.cos(lat(latitude));
}

export function generateAppropriateSearchBBox(bounds) {
  const minLng = bounds.getWest() + BBOX_PADDING * (bounds.getEast() - bounds.getWest());
  const maxLng = bounds.getEast() - BBOX_PADDING * (bounds.getEast() - bounds.getWest());

  // The following two are not correct  because resolution is not constant along a meridian, but I think it's good enough.
  // On a 1000 pixel screen at zoom 3 the top padding is then effectively ~130px
  const minLat = bounds.getSouth() + BBOX_PADDING * (bounds.getNorth() - bounds.getSouth());
  const maxLat = bounds.getNorth() - BBOX_PADDING * (bounds.getNorth() - bounds.getSouth());
  return new BBox(CRS_EPSG4326, minLng, minLat, maxLng, maxLat);
}
