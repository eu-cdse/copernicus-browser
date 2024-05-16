import {
  ApiType,
  isCancelled,
  MimeTypes,
  drawBlobOnCanvas,
  canvasToBlob,
  BBox,
  CRS_EPSG3857,
  DEMInstanceType,
} from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';
import L from 'leaflet';
import proj4 from 'proj4';

import { addImageOverlays, getTitle } from '../Controls/ImgDownload/ImageDownload.utils';
import { TERRAIN_VIEWER_IDS, setTerrainViewerId, IS_3D_MODULE_ENABLED } from './TerrainViewer.const';
import {
  checkIfCustom,
  getDataSourceHandler,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { findMatchingLayerMetadata } from '../Tools/VisualizationPanel/legendUtils';
import store, { mainMapSlice, terrainViewerSlice } from '../store';
import { wgs84ToMercator } from '../junk/EOBCommon/utils/coords';
import { getBoundsZoomLevel } from '../utils/coords';
import { DEFAULT_DEM_SOURCE, DEM_3D_MAX_ZOOM, EQUATOR_LENGTH } from '../const';
import { addLabelsAndLogos, dateTimeDisplayFormat } from '../Controls/Timelapse/Timelapse.utils';

let mapTileRequestDelay = 1;
const mapTileRequestList = [];
let mapTileRequestTimerId = null;
const maxDelayBeforeSwitch = 500;

function mapTileRequestExecutor() {
  mapTileRequestTimerId = null;

  if (mapTileRequestList.length > 0) {
    const exec = mapTileRequestList.shift();
    exec();

    mapTileRequestTimerId = setTimeout(mapTileRequestExecutor, mapTileRequestDelay);
  }
}

function getMapTileUrl({
  layer,
  params,
  minX,
  minY,
  maxX,
  maxY,
  width,
  height,
  callback,
  reqConfig,
  onTileError,
}) {
  mapTileRequestList.push(() => {
    getMapTileUrlInternal({
      layer,
      params,
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      callback,
      reqConfig,
      onTileError,
    });
  });

  if (mapTileRequestTimerId == null) {
    mapTileRequestTimerId = setTimeout(mapTileRequestExecutor, mapTileRequestDelay);
  }
}

export function getMapTile({
  layer,
  params,
  minX,
  minY,
  maxX,
  maxY,
  width,
  height,
  callback,
  reqConfig,
  onTileError,
}) {
  mapTileRequestList.push(() => {
    getMapTileUrlInternal({
      layer,
      params,
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      callback,
      reqConfig,
      onTileError,
    });
  });

  if (mapTileRequestTimerId == null) {
    mapTileRequestTimerId = setTimeout(mapTileRequestExecutor, mapTileRequestDelay);
  }
}

function getMapTileUrlInternal({
  layer,
  params,
  minX,
  minY,
  maxX,
  maxY,
  width,
  height,
  callback,
  reqConfig,
  onTileError,
}) {
  const apiType = layer.supportsApiType(ApiType.PROCESSING)
    ? ApiType.PROCESSING
    : layer.supportsApiType(ApiType.WMTS)
    ? ApiType.WMTS
    : ApiType.WMS;
  layer
    .getMap(params, apiType, reqConfig)
    .then(async (blob) => {
      mapTileRequestDelay = Math.max(1, 0.5 * mapTileRequestDelay); // reduce the delay
      let url = URL.createObjectURL(blob);
      callback(url);
    })
    .catch((error) => {
      const httpStatus = error.response && error.response.status ? error.response.status : 0;
      if (httpStatus === 429) {
        // too many requests, must wait a little and retry
        mapTileRequestDelay = Math.min(5000, mapTileRequestDelay / 0.8);
        if (mapTileRequestDelay > maxDelayBeforeSwitch) {
          reqConfig.authToken = null;
        }
        getMapTileUrl({
          layer,
          params,
          minX,
          minY,
          maxX,
          maxY,
          width,
          height,
          callback,
          reqConfig,
          onTileError,
        });
      } else {
        if (!isCancelled(error)) {
          onTileError(error);
        }
        callback(null);
      }
    });
}

export function getHeightFromZoom(zoom) {
  const starting = 20026376;
  return starting / Math.pow(2, zoom - 1);
}

export async function getTerrainViewerImage({
  fromTime,
  toTime,
  datasetId,
  layerId,
  customSelected,
  selectedThemeId,
  terrainViewerId,
  width,
  height,
  showCaptions,
  imageFormat,
  userDescription,
  showLegend,
}) {
  const imageUrl = await new Promise((resolve) =>
    setTimeout(async () => {
      resolve(window.print3D(terrainViewerId, width, height));
    }, 500),
  );
  const blob = await fetch(imageUrl).then((res) => res.blob());
  const title = showCaptions ? getTitle(fromTime, toTime, datasetId, layerId, customSelected) : null;

  const dsh = getDataSourceHandler(datasetId);
  const drawCopernicusLogo = dsh.isCopernicus();
  const addLogos = drawCopernicusLogo;

  let legendDefinition;

  if (showLegend) {
    const predefinedLayerMetadata = findMatchingLayerMetadata(datasetId, layerId, selectedThemeId, toTime);
    if (predefinedLayerMetadata && predefinedLayerMetadata.legend) {
      legendDefinition = predefinedLayerMetadata.legend;
    }
  }

  let imageWithOverlays = await addImageOverlays(
    blob,
    width,
    height,
    imageFormat.mimeType,
    null,
    null,
    null,
    showLegend,
    showCaptions,
    false,
    false,
    userDescription,
    null,
    legendDefinition,
    null,
    showCaptions ? dsh.getCopyrightText(datasetId) : null,
    title,
    false,
    addLogos,
    drawCopernicusLogo,
  );

  if (!showLegend && !showCaptions && imageFormat.mimeType === MimeTypes.JPEG) {
    // If we haven't added any overlays, the image was never converted from PNG to JPEG
    imageWithOverlays = await convertImageToMimeType(imageWithOverlays, imageFormat.mimeType, width, height);
  }

  return imageWithOverlays;
}

async function convertImageToMimeType(blob, mimeType, width, height) {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  await drawBlobOnCanvas(ctx, blob, 0, 0);
  return await canvasToBlob(canvas, mimeType);
}

function formatDistance(distance) {
  if (distance >= 1000) {
    return Number(distance / 1000).toFixed(2) + ' km';
  }
  return Number(distance).toFixed(2) + ' m';
}

export function getPositionString(latitude, longitude, z) {
  const magnitude = Math.floor(Math.log10(Math.max(1, z)));
  const numDecimals = 8 - Math.min(8, magnitude);
  return (
    'Lat: ' +
    Number(latitude).toFixed(numDecimals) +
    ', Lng: ' +
    Number(longitude).toFixed(numDecimals) +
    ', ' +
    t`Eye height` +
    ': ' +
    formatDistance(z)
  );
}

export function getEyeHeightFromBounds(bounds) {
  try {
    const { lat } = bounds.getCenter();
    const minLng = bounds.getWest();
    const maxLng = bounds.getEast();
    const width = getLngDistanceInMeters({ minLng, maxLng, lat });
    return width / 2;
  } catch (err) {
    return 8000;
  }
}

function getPreviewCreationSize(width, height, rotV) {
  let nPixelsInPreviews = 3000;
  if (rotV < 30) {
    nPixelsInPreviews = Math.tan((30 - rotV) * 0.0174532925) * 100000;
  }
  const ratio = width / height;
  let creationHeight = Math.sqrt(nPixelsInPreviews / ratio);
  let creationWidth = Math.round(creationHeight * ratio);
  creationHeight = Math.round(creationHeight);
  return { creationWidth: creationWidth, creationHeight: creationHeight };
}

export async function getTimelapsePreviewsFromTerrainViewer({
  containerId,
  z,
  rotV,
  sunTime,
  settings,
  images,
  getMapParams,
  width,
  height,
  reqConfig = {},
  progress,
  callback = () => {},
  timelapseTerrainViewerId,
}) {
  const { creationWidth, creationHeight } = getPreviewCreationSize(width, height, rotV);

  await getTimelapseImagesFromTerrainViewer({
    containerId: containerId,
    z: z,
    sunTime: sunTime,
    settings: settings,
    images: images,
    getMapParams: getMapParams,
    outputWidth: width,
    outputHeight: height,
    creationWidth: creationWidth,
    creationHeight: creationHeight,
    reqConfig: reqConfig,
    progress: progress,
    callback: callback,
    timelapseTerrainViewerId: timelapseTerrainViewerId,
  });
}

function getAppropriateSupportedUnderzoom(z) {
  // Sentinel Hub has meters/pixel limits. In small previews smaller images are requested. This means higher meters/pixel and if our eye height is large enough, so we could fail to load any SH textures
  // We avoid making requests over the limit that would fail by having minZoom for every collection and returning mapTiler image if requested zoom is lower
  // To avoid that, we allow "underzoom", and we will fetch images of size 512*underzoom x  512*underzoom instead of required 512x512 and then resize them afterwards
  return z > 12000 ? Math.min(Math.ceil((z - 12000) / 10000), 4) : 0;
}

export const GENERATION_CANCELLED = 'Generation cancelled';

export async function getTimelapseImagesFromTerrainViewer({
  containerId,
  z,
  sunTime,
  settings,
  images,
  getMapParams,
  outputWidth,
  outputHeight,
  creationWidth,
  creationHeight,
  reqConfig = {},
  progress,
  timelapseTerrainViewerId,
  isGenerationCancelled,
  callback,
}) {
  progress(0);

  setTerrainViewerId(TERRAIN_VIEWER_IDS.TIMELAPSE);

  document
    .getElementById(containerId)
    .setAttribute('style', `width:${creationWidth}px;height:${creationHeight}px;`);

  window.set3DSunTime(timelapseTerrainViewerId, sunTime);
  window.set3DSettings(timelapseTerrainViewerId, settings);

  const supportUnderzoomBy = getAppropriateSupportedUnderzoom(z);

  const outputImages = [];

  for (const [index, image] of images.entries()) {
    if (isGenerationCancelled && isGenerationCancelled()) {
      throw new Error(GENERATION_CANCELLED);
    }

    const imageUrl = await getImageFromTerrainViewer({
      terrainViewerId: timelapseTerrainViewerId,
      layer: image.layer,
      datasetId: image.datasetId,
      getMapParams: { ...getMapParams, fromTime: image.fromTime, toTime: image.toTime },
      width: outputWidth,
      height: outputHeight,
      reqConfig: reqConfig,
      supportUnderzoomBy: supportUnderzoomBy,
    });

    const dsh = getDataSourceHandler(image.datasetId);

    const objectURL = await addLabelsAndLogos(
      dateTimeDisplayFormat(image.fromTime),
      imageUrl,
      outputWidth,
      outputHeight,
      null,
      dsh?.isCopernicus(),
      dsh?.isSentinelHub() || checkIfCustom(image.datasetId),
    );

    outputImages.push(objectURL);

    if (callback) {
      callback(objectURL, image.origFlyover);
    }

    progress((index + 1) / images.length);
  }

  return outputImages;
}

function getZoomAdjustmentForLatitude(minX, minY, maxX, maxY) {
  // minZoom set for the collection is based on the zoom level at equator
  // Higher latitudes are more stretched, so meters/pixel is lower
  const coords = proj4('EPSG:3857', 'EPSG:4326', [(minX + maxX) / 2, (minY + maxY) / 2]);
  const lat = (Math.PI * Math.abs(coords[1])) / 180;
  const metersPerPixelRatio = getEarthCircumferenceAtLat(lat) / EQUATOR_LENGTH;
  return Math.log2(metersPerPixelRatio);
}

async function getImageFromTerrainViewer({
  terrainViewerId,
  layer,
  datasetId,
  getMapParams,
  width: imageWidth,
  height: imageHeight,
  reqConfig,
  supportUnderzoomBy,
}) {
  window.get3DMapTileUrlFunctions[TERRAIN_VIEWER_IDS.TIMELAPSE] = (
    minX,
    minY,
    maxX,
    maxY,
    width,
    height,
    callback,
  ) => {
    let minZoom = 7;
    if (datasetId) {
      minZoom = getDataSourceHandler(datasetId).getLeafletZoomConfig(datasetId).min;
    }
    const tileCoord = getTileCoord(minX, minY, maxX, maxY);
    const mapTilerUrl = getMaptilerUrl(tileCoord);

    let scaling = 1;
    const minZoomDiff = getZoomAdjustmentForLatitude(minX, minY, maxX, maxY);

    if (tileCoord.zoomLevel <= minZoom + minZoomDiff) {
      if (
        supportUnderzoomBy &&
        minZoom - tileCoord.zoomLevel >= 0 &&
        minZoom - tileCoord.zoomLevel < supportUnderzoomBy
      ) {
        scaling = minZoom - tileCoord.zoomLevel + 1;
      } else {
        callback(mapTilerUrl);
        return;
      }
    }

    const getMapParams2 = {
      bbox: new BBox(CRS_EPSG3857, minX, minY, maxX, maxY),
      format: MimeTypes.JPEG,
      width: scaling * width,
      height: scaling * height,
      fromTime: getMapParams.fromTime.toDate(),
      toTime: getMapParams.toTime.toDate(),
      preview: 2,
    };
    getMapTile({
      layer,
      params: getMapParams2,
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      callback,
      reqConfig,
      onTileError: (err) => console.error(err),
    });
  };

  await new Promise((resolve) => {
    window.on3DLoadingStateChangedFunctions[TERRAIN_VIEWER_IDS.TIMELAPSE] = (isLoading, type) => {
      if (type === 'OVERALL' && !isLoading) {
        resolve();
      }
    };
    window.reload3DTextures(terrainViewerId);
  });
  const imageUrl = await window.print3D(terrainViewerId, imageWidth, imageHeight);
  return imageUrl;
}

export function getTileCoord(minX, minY, maxX, maxY) {
  const zoomLevel = Math.max(
    0,
    Math.min(19, 1 + Math.floor(Math.log(EQUATOR_LENGTH / ((maxX - minX) * 1.001)) / Math.log(2))),
  );
  const numTiles = 1 << zoomLevel;
  const tileX = Math.floor(((minX + maxX + EQUATOR_LENGTH) * numTiles) / (2 * EQUATOR_LENGTH));
  const tileY = numTiles - 1 - Math.floor(((minY + maxY + EQUATOR_LENGTH) * numTiles) / (2 * EQUATOR_LENGTH));

  return { tileX, tileY, zoomLevel };
}

export function getMaptilerUrl({ tileX, tileY, zoomLevel }) {
  return `https://api.maptiler.com/maps/streets/256/${zoomLevel}/${tileX}/${tileY}.png?key=${
    import.meta.env.VITE_MAPTILER_KEY
  }`;
}

function getEarthCircumferenceAtLat(lat) {
  const equatorialRadius = 6378137.0;
  const polarRadius = 6356752.314;
  var f1 = Math.pow(Math.pow(equatorialRadius, 2) * Math.cos(lat), 2);
  var f2 = Math.pow(Math.pow(polarRadius, 2) * Math.sin(lat), 2);
  var f3 = Math.pow(equatorialRadius * Math.cos(lat), 2);
  var f4 = Math.pow(polarRadius * Math.sin(lat), 2);

  var radius = Math.sqrt((f1 + f2) / (f3 + f4));
  const horizontalRadius = Math.cos(lat) * radius;
  return 2 * Math.PI * horizontalRadius;
}

function getLngDistanceInMeters({ minLng, maxLng, lat }) {
  lat = (Math.PI * lat) / 180;
  const circumference = getEarthCircumferenceAtLat(lat);
  const distance = ((maxLng - minLng) * circumference) / 360;
  return distance;
}

export function setTerrainViewerFromPin({ terrainViewerSettings, is3D, lat, lng, zoom, terrainViewerId }) {
  if (!IS_3D_MODULE_ENABLED) {
    return;
  }

  if (terrainViewerSettings && Object.keys(terrainViewerSettings).length > 0) {
    if (is3D) {
      const { x, y, z, rotH, rotV, sunTime, settings } = terrainViewerSettings;
      window.set3DPosition(terrainViewerId, x, y, z, rotH, rotV);
      window.set3DSunTime(terrainViewerId, sunTime);
      window.set3DSettings(terrainViewerId, settings);
    } else {
      store.dispatch(terrainViewerSlice.actions.setTerrainViewerSettings(terrainViewerSettings));
      store.dispatch(mainMapSlice.actions.setIs3D(true));
    }
  } else {
    if (is3D) {
      const { x, y } = wgs84ToMercator({ lat: lat, lng: lng });
      const z = getHeightFromZoom(zoom);
      window.set3DPosition(terrainViewerId, x, y, z, 0, 0);
    }
  }
}

export function getBoundsFrom3DPosition({ x, y, z, rotH, rotV, width, height }) {
  const N = Math.ceil(Math.min(Math.tan(Math.min(Math.PI / 4 + toRad(rotV), Math.PI / 2)), 10));
  const closeX = x - N * z;
  const closeY = y - N * z;
  const farX = x + N * z;
  const farY = y + N * z;

  const [closeLng, closeLat] = proj4('EPSG:3857', 'EPSG:4326', [closeX, closeY]);
  const [farLng, farLat] = proj4('EPSG:3857', 'EPSG:4326', [farX, farY]);

  const bounds = L.latLngBounds(L.latLng(closeLat, closeLng), L.latLng(farLat, farLng));
  const pixelBounds = L.bounds(L.point(0, 0), L.point(width, height));
  return { pixelBounds: pixelBounds, bounds: bounds };
}

export function getZoomFromEyeHeight(x, y, z) {
  const [lng, lat] = proj4('EPSG:3857', 'EPSG:4326', [x, y]);
  const circumference = getEarthCircumferenceAtLat((Math.PI * lat) / 180);
  const halfEyeHeightDegreesLng = (180 * z) / circumference;
  const minLng = lng - halfEyeHeightDegreesLng;
  const maxLng = lng + halfEyeHeightDegreesLng;
  const bounds = L.latLngBounds(L.latLng(lat, minLng), L.latLng(lat, maxLng));
  return Math.max(getBoundsZoomLevel(bounds) - 1, 0);
}

export function getEyeHeightFromZoom(lat, zoom, width) {
  const fullPixelWidth = Math.pow(2, zoom) * 256;
  const circumference = getEarthCircumferenceAtLat((Math.PI * lat) / 180);
  const widthMeters = (circumference * width) / fullPixelWidth;
  return widthMeters / 2;
}

function toRad(degree) {
  return (degree * Math.PI) / 180;
}

export function getTileXAndTileY(zoomLevel, minX, minY, maxX, maxY) {
  const numTiles = 1 << zoomLevel;
  const tileX = Math.floor(((minX + maxX + EQUATOR_LENGTH) * numTiles) / (2 * EQUATOR_LENGTH));
  const tileY = numTiles - 1 - Math.floor(((minY + maxY + EQUATOR_LENGTH) * numTiles) / (2 * EQUATOR_LENGTH));

  return { tileX: tileX, tileY: tileY };
}

export function is3DDemSourceCustom(demSource3D) {
  return demSource3D === DEMInstanceType.COPERNICUS_30 || demSource3D === DEMInstanceType.COPERNICUS_90;
}

export function getDem3DMaxZoomLevel(demSource3D) {
  return DEM_3D_MAX_ZOOM[demSource3D || DEFAULT_DEM_SOURCE];
}

export function getDemProviderType(demSource3D) {
  return demSource3D ? (is3DDemSourceCustom(demSource3D) ? 'CUSTOM' : demSource3D) : DEFAULT_DEM_SOURCE;
}
