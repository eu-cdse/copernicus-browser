import {
  LayersFactory,
  CRS_EPSG4326,
  CRS_EPSG3857,
  BBox,
  canvasToBlob,
  drawBlobOnCanvas,
  ApiType,
  ProcessingDataFusionLayer,
  DEMLayer,
  Interpolator,
} from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';
import { point as turfPoint } from '@turf/helpers';
import L from 'leaflet';
import JSZip from 'jszip';
import {
  getDataSourceHandler,
  datasetLabels,
  checkIfCustom,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  CUSTOM,
  COPERNICUS_CORINE_LAND_COVER,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { isDataFusionEnabled } from '../../utils';
import { overlayTileLayers } from '../../Map/Layers';
import { createGradients } from '../../Tools/VisualizationPanel/legendUtils';
import { b64EncodeUnicode } from '../../utils/base64MDN';
import { findMatchingLayerMetadata } from '../../Tools/VisualizationPanel/legendUtils';
import { isTimespanModeSelected } from '../../Tools/VisualizationPanel/VisualizationPanel.utils';
import { IMAGE_FORMATS, IMAGE_FORMATS_INFO } from './consts';

import { constructDataFusionLayer } from '../../junk/EOBCommon/utils/dataFusion';
import { getMapDOMSize, wgs84ToMercator } from '../../junk/EOBCommon/utils/coords';
import { getMapOverlayXYZ, getGlOverlay } from '../../junk/EOBCommon/utils/getMapOverlayXYZ';
import {
  getEvalscriptSetup,
  setEvalscriptSampleType,
  setEvalscriptOutputScale,
  setEvalscriptOutputBandNumber,
} from '../../utils/parseEvalscript';
import { WARNINGS } from './ImageDownloadWarningPanel';
import { refetchWithDefaultToken } from '../../utils/fetching.utils';
import {
  reqConfigMemoryCache,
  MAX_SH_IMAGE_SIZE,
  DISABLED_ORTHORECTIFICATION,
  PROCESSING_OPTIONS,
} from '../../const';

import copernicus from '../../junk/EOBCommon/assets/cdse-logo.png';
import { isAuthIdUtm } from '../../utils/utm';
import { reprojectGeometry } from '../../utils/reproject';
import { getBboxFromCoords } from '../../utils/geojson.utils';
import {
  multiPolygonCoordinatesNormalization,
  normalizeBoundingBox,
  normalizeLongitude,
  polygonCoordinatesNormalization,
  splitPolygonOnAntimeridian,
} from '../../utils/handelAntimeridianCoord.utils';
import {
  getProcessGraph,
  isOpenEoSupported,
  MIMETYPE_TO_OPENEO_FORMAT,
} from '../../api/openEO/openEOHelpers';
import processGraphBuilder from '../../api/openEO/processGraphBuilder';
import openEOApi from '../../api/openEO/openEO.api';
import { ensureMercatorBBox, metersPerPixel } from '../../utils/coords';
import { isVisualizationEffectsApplied } from '../../utils/effectsUtils';

const PARTITION_PADDING = 5;
const SCALEBAR_LEFT_PADDING = 10;

const FONT_FAMILY = 'Helvetica, Arial, sans-serif';
const FONT_BASE = 960;
const FONT_SIZES = {
  normal: { base: 6.5016, min: 11 },
  copyright: { base: 5, min: 9 },
};

const DEGREE_TO_METER_SCALE = 111139;

export function getMapDimensions(pixelBounds, resolutionDivisor = 1) {
  const width = pixelBounds.max.x - pixelBounds.min.x;
  const height = pixelBounds.max.y - pixelBounds.min.y;
  return { width: Math.floor(width / resolutionDivisor), height: Math.floor(height / resolutionDivisor) };
}

export function getDimensionsInMeters(bounds, targetCrs = CRS_EPSG3857.authId) {
  const scaleFactor = targetCrs === CRS_EPSG4326.authId ? DEGREE_TO_METER_SCALE : 1;
  const bbox = constructBBoxFromBounds(bounds);
  const transformedGeometry = reprojectGeometry(bbox.toGeoJSON(), {
    fromCrs: bbox.crs.authId,
    toCrs: targetCrs,
  });
  const [minX, minY, maxX, maxY] = getBboxFromCoords(transformedGeometry.coordinates);
  const width = (maxX - minX) * scaleFactor;
  const height = (maxY - minY) * scaleFactor;
  return { width: width, height: height };
}

export function getImageDimensions(bounds, resolution, targetCrs) {
  const { width, height } = getDimensionsInMeters(bounds, targetCrs);

  return {
    width: Math.round(width / resolution[0]),
    height: Math.round(height / resolution[1]),
  };
}

export function getImageDimensionFromBoundsWithCap(bounds, datasetId) {
  /*
    Accepts latLngBounds and converts them to Mercator (to use meters)
    Gets datasource max resolution (in meters per pixel)
    Calculates the image size at that resolution and dimension, caps it at IMAGE_SIZE_LIMIT
  */
  const dsh = getDataSourceHandler(datasetId);
  let resolution;
  if (dsh) {
    resolution = dsh.getResolutionLimits(datasetId).resolution;
  }
  const maxResolution = resolution || 0.5;
  const separatedBoundsAndPolygons = getSeparateBoundsAndPolygonsIfCrossingAntimeridian(bounds);

  let tempWidth = 0;
  let tempHeight = 0;

  if (separatedBoundsAndPolygons.length > 1) {
    for (let tempSeparatedBoundsAndPolygons of separatedBoundsAndPolygons) {
      const { width, height } = getImageDimensions(
        tempSeparatedBoundsAndPolygons.bounds,
        [maxResolution, maxResolution],
        CRS_EPSG3857.authId,
      );
      tempWidth += width;
      tempHeight = height;
    }
  } else {
    const normalizedBounds = normalizeBoundingBox(bounds);
    const { width, height } = getImageDimensions(
      normalizedBounds,
      [maxResolution, maxResolution],
      CRS_EPSG3857.authId,
    );
    tempWidth = width;
    tempHeight = height;
  }

  const ratio = tempHeight / tempWidth;
  const isLandscape = tempWidth >= tempHeight;

  let newImgWidth;
  let newImgHeight;
  if (isLandscape) {
    newImgWidth = Math.min(tempWidth, MAX_SH_IMAGE_SIZE);
    newImgHeight = newImgWidth * ratio;
  } else {
    newImgHeight = Math.min(tempHeight, MAX_SH_IMAGE_SIZE);
    newImgWidth = newImgHeight / ratio;
  }

  return { width: newImgWidth, height: newImgHeight };
}

export async function fetchImage(layer, options) {
  const {
    datasetId,
    bounds,
    fromTime,
    toTime,
    width,
    height,
    imageFormat,
    apiType,
    cancelToken,
    selectedCrs,
    geometry,
    effects,
    getMapAuthToken,
    mimeType,
    isEffectsAndOptionsSelected,
    customSelected,
    selectedProcessing,
  } = options;

  const dsh = getDataSourceHandler(datasetId);
  const supportsTimeRange = dsh ? dsh.supportsTimeRange() : true; //We can only check if a datasetId is BYOC when the datasource handler for it is instantiated (thus, we are on the user instance which includes that BYOC collection), so we set default to `true` to cover that case.
  const bbox = constructBBoxFromBounds(bounds, selectedCrs);
  const getMapParams = {
    bbox: bbox,
    geometry: geometry,
    fromTime: supportsTimeRange ? fromTime : null,
    toTime: toTime,
    width: width,
    height: height,
    format: mimeType,
    preview: 2,
    showlogo: false,
    effects: effects,
  };
  const reqConfig = {
    cancelToken: cancelToken,
    retries: 5,
  };

  if (getMapAuthToken) {
    reqConfig.authToken = getMapAuthToken;
  }

  if (width > MAX_SH_IMAGE_SIZE || height > MAX_SH_IMAGE_SIZE) {
    return refetchWithDefaultToken(
      (reqConfig) => layer.getHugeMap(getMapParams, apiType, reqConfig),
      reqConfig,
    );
  } else {
    if (
      isOpenEoSupported(
        layer.instanceId,
        layer.layerId,
        imageFormat,
        isEffectsAndOptionsSelected,
        customSelected && selectedProcessing !== PROCESSING_OPTIONS.OPENEO,
      )
    ) {
      const isRawBand = options.bandName != null;
      const processGraph = getProcessGraph(layer.instanceId, isRawBand ? 'RAW_BAND' : layer.layerId);
      const spatialExtent =
        geometry == null
          ? {
              west: getMapParams.bbox.minX,
              east: getMapParams.bbox.maxX,
              south: getMapParams.bbox.minY,
              north: getMapParams.bbox.maxY,
              height: getMapParams.height,
              width: getMapParams.width,
              crs: bbox.crs.authId,
            }
          : { ...geometry, height: getMapParams.height, width: getMapParams.width, crs: bbox.crs.authId };

      let collectionId;
      if (dsh.supportsLowResolutionAlternativeCollection(datasetId)) {
        const lowResolutionCollectionId = dsh.getLowResolutionCollectionId(datasetId);
        const lowResolutionMetersPerPixelThreshold = dsh.getLowResolutionMetersPerPixelThreshold(datasetId);

        const mPerPixel = metersPerPixel(getMapParams.bbox, getMapParams.width);
        if (mPerPixel > lowResolutionMetersPerPixelThreshold) {
          collectionId = `byoc-${lowResolutionCollectionId}`;
        }
      }

      const newProcessGraph = processGraphBuilder.saveResult(
        processGraphBuilder.loadCollection(processGraph, {
          id: collectionId,
          spatial_extent: spatialExtent,
          temporal_extent: [getMapParams.fromTime, getMapParams.toTime],
          bands: isRawBand ? [options.bandName] : null,
        }),
        { format: MIMETYPE_TO_OPENEO_FORMAT[mimeType] },
      );

      return openEOApi.getResult(newProcessGraph, getMapAuthToken);
    }
    return refetchWithDefaultToken((reqConfig) => layer.getMap(getMapParams, apiType, reqConfig), reqConfig);
  }
}

/**
 * This function is used only for downloading images in the compare mode (patching them together)
 */
export async function fetchAndPatchImagesFromParams(params, setWarnings, setError, setLoadingImages) {
  const {
    imageFormat,
    width,
    height,
    comparedLayers,
    comparedOpacity,
    comparedClipping,
    cancelToken,
    lat,
    lng,
    zoom,
    showLegend,
    showCaptions,
    showLogo,
    addMapOverlays,
    userDescription,
    enabledOverlaysId,
    toTime,
    drawGeoToImg,
    aoiGeometry,
    loiGeometry,
    bounds,
    aoiWidthInMeters,
    mapWidthInMeters,
    cropToAoi,
  } = params;

  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');

  let imageTitles = [];
  let legendUrl, legendDefinition;
  let drawCopernicusLogo = false;
  let addLogos = false;
  const copyrightTexts = new Set();

  for (let idx = comparedLayers.length - 1; idx >= 0; idx--) {
    let cLayer = comparedLayers[idx];
    let image;
    let imgObjectUrl;
    try {
      image = await fetchImageFromParams(
        {
          ...params,
          ...cLayer,
          imageFormat: IMAGE_FORMATS.PNG, // each of the compared layers has to be a PNG because of its transparent background
          showCaptions: false,
          showLegend: false,
          showLogo: false,
          addMapOverlays: false,
        },
        setWarnings,
      );

      const dsh = getDataSourceHandler(cLayer.datasetId);
      if (dsh) {
        drawCopernicusLogo = dsh.isCopernicus() || drawCopernicusLogo;
        addLogos = drawCopernicusLogo || addLogos;
      }

      if (showLegend) {
        const l = await getLayerFromParams(
          { ...params, layerId: cLayer.layerId, visualizationUrl: cLayer.visualizationUrl },
          cancelToken,
        );
        legendUrl = l.legendUrl;
        const predefinedLayerMetadata = findMatchingLayerMetadata(
          cLayer.datasetId,
          cLayer.layerId,
          cLayer.themeId,
          toTime,
        );
        legendDefinition =
          predefinedLayerMetadata && predefinedLayerMetadata.legend
            ? predefinedLayerMetadata.legend
            : l.legend;
      }
      if (showCaptions) {
        let cText;
        if (dsh) {
          cText = dsh.getCopyrightText(cLayer.datasetId);
          copyrightTexts.add(cText);
        }
      }

      imageTitles.push(cLayer.title);

      imgObjectUrl = window.URL.createObjectURL(image.blob);
      const imgDrawn = await new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = imgObjectUrl;
      });

      ctx.globalAlpha = comparedOpacity[idx];
      ctx.drawImage(
        imgDrawn,
        comparedClipping[idx][0] * width,
        0,
        (comparedClipping[idx][1] - comparedClipping[idx][0]) * width,
        height,
        comparedClipping[idx][0] * width,
        0,
        (comparedClipping[idx][1] - comparedClipping[idx][0]) * width,
        height,
      );
      ctx.globalAlpha = 1;
    } catch (err) {
      setError(err);
      setLoadingImages(false);
      return;
    } finally {
      if (imgObjectUrl) {
        window.URL.revokeObjectURL(imgObjectUrl);
      }
    }
  }

  const mimeType = IMAGE_FORMATS_INFO[imageFormat].mimeType;
  const title = `${imageTitles.slice().reverse().join(', ')}`;
  const copyrightText = [...copyrightTexts].join(', ');
  const geometriesToDraw = [aoiGeometry, loiGeometry].filter((geo) => !!geo);
  const finalBlob = await addImageOverlays(
    await canvasToBlob(canvas, mimeType),
    width,
    height,
    mimeType,
    lat,
    lng,
    zoom,
    showLegend,
    showCaptions,
    addMapOverlays,
    showLogo,
    userDescription,
    enabledOverlaysId,
    legendDefinition,
    legendUrl,
    copyrightText,
    title,
    true,
    addLogos,
    drawCopernicusLogo,
    drawGeoToImg,
    geometriesToDraw,
    bounds,
    aoiWidthInMeters,
    mapWidthInMeters,
    cropToAoi,
  );
  return {
    finalImage: finalBlob,
    finalFileName: imageTitles
      .map((imgTit) => imgTit.split(' ').join('_'))
      .slice()
      .reverse()
      .join('_'),
  };
}

export async function fetchImageFromParams(params, raiseWarning) {
  const {
    layer: layerFromParams,
    fromTime,
    toTime,
    datasetId,
    customSelected,
    isRawBand,
    bandName,
    showLegend,
    showCaptions,
    addMapOverlays,
    showLogo,
    layerId,
    selectedThemeId,
    lat,
    lng,
    zoom,
    width,
    height,
    imageFormat,
    userDescription,
    enabledOverlaysId,
    cancelToken,
    shouldClipExtraBands,
    getMapAuthToken,
    drawGeoToImg,
    aoiGeometry,
    loiGeometry,
    bounds,
    aoiWidthInMeters,
    mapWidthInMeters,
    selectedCrs,
    baseLayerUrl,
    cropToAoi,
  } = params;
  const isEffectsAndOptionsSelected = isVisualizationEffectsApplied(params);
  const layer = layerFromParams ?? (await getLayerFromParams(params, cancelToken));

  if (!layer) {
    throw Error('No applicable layer found');
  }

  const apiType = await getAppropriateApiType(layer, imageFormat, isRawBand, cancelToken);
  const mimeType =
    apiType === ApiType.PROCESSING
      ? IMAGE_FORMATS_INFO[imageFormat].mimeTypeProcessing
      : IMAGE_FORMATS_INFO[imageFormat].mimeType;

  await overrideEvalscriptIfNeeded(
    apiType,
    imageFormat,
    layer,
    customSelected,
    cancelToken,
    raiseWarning,
    shouldClipExtraBands,
  );

  if (
    !(imageFormat === IMAGE_FORMATS.JPG || imageFormat === IMAGE_FORMATS.PNG) &&
    (width > MAX_SH_IMAGE_SIZE || height > MAX_SH_IMAGE_SIZE)
  ) {
    throw Error(
      `Can't download images with mimetype '${mimeType}' having any dimension greater than ${MAX_SH_IMAGE_SIZE} pixels.`,
    );
  }

  let blobArray = [];
  let blob;

  // There is a different usage. Sometimes is geometry sometimes aoiGeometry. I think only one would be enough.
  let currentGeometry = aoiGeometry ? aoiGeometry : params.geometry;

  const separatedBoundingBoxesAndPolygons = getSeparateBoundsAndPolygonsIfCrossingAntimeridian(
    bounds,
    width,
    currentGeometry,
  );

  if (separatedBoundingBoxesAndPolygons.length > 1) {
    for (let tempBbAndPolygons of separatedBoundingBoxesAndPolygons) {
      let tempGeometry;
      if (tempBbAndPolygons.coordinates.length > 0) {
        tempGeometry = !tempBbAndPolygons.hasMultiPolygons
          ? { type: 'Polygon', coordinates: tempBbAndPolygons.coordinates }
          : { type: 'MultiPolygon', coordinates: tempBbAndPolygons.coordinates };
      }

      const reprojectedGeom = reprojectGeometry(tempGeometry, {
        toCrs: selectedCrs,
        fromCrs: CRS_EPSG4326.authId,
      });

      const options = {
        ...params,
        width: tempBbAndPolygons.width,
        geometry: reprojectedGeom,
        bounds: tempBbAndPolygons.bounds,
        apiType: apiType,
        mimeType: mimeType,
        getMapAuthToken: getMapAuthToken,
        isEffectsAndOptionsSelected,
        customSelected,
      };

      const blob = await fetchImage(layer, options).catch((err) => {
        throw err;
      });

      blobArray.push(blob);
    }
  } else {
    const normalizedBounds = normalizeBoundingBox(bounds);
    let tempGeometry;
    if (params.geometry) {
      tempGeometry = {
        type: params.geometry.type,
        coordinates:
          params.geometry.type === 'MultiPolygon'
            ? multiPolygonCoordinatesNormalization(params.geometry.coordinates)
            : polygonCoordinatesNormalization(params.geometry.coordinates),
      };
    }

    const reprojectedGeom = reprojectGeometry(tempGeometry, {
      toCrs: selectedCrs,
      fromCrs: CRS_EPSG4326.authId,
    });

    const options = {
      ...params,
      bounds: normalizedBounds,
      geometry: reprojectedGeom,
      apiType: apiType,
      mimeType: mimeType,
      getMapAuthToken: getMapAuthToken,
      isEffectsAndOptionsSelected,
    };

    blob = await fetchImage(layer, options).catch((err) => {
      throw err;
    });
  }

  if (blobArray.length > 1 && (params.mergeImages || params.mergeImages === undefined)) {
    await mergeFetchedImages(blobArray).then((mergedBlob) => {
      blob = mergedBlob;
      blobArray = [];
    });
  }

  let legendUrl, legendDefinition, copyrightText, title;

  if (showLegend) {
    legendUrl = layer.legendUrl;
    const predefinedLayerMetadata = findMatchingLayerMetadata(datasetId, layerId, selectedThemeId, toTime);
    legendDefinition =
      predefinedLayerMetadata && predefinedLayerMetadata.legend
        ? predefinedLayerMetadata.legend
        : layer.legend;
  }

  const dsh = getDataSourceHandler(datasetId);

  if (showCaptions) {
    copyrightText = dsh.getCopyrightText(datasetId);
    title = getTitle(fromTime, toTime, datasetId, layer.title, customSelected);
  }

  let drawCopernicusLogo = false;
  let addLogos = false;
  if (dsh) {
    drawCopernicusLogo = dsh.isCopernicus();
    addLogos = drawCopernicusLogo;
  }

  const geometriesToDraw = [aoiGeometry, loiGeometry].filter((geo) => !!geo);

  async function getReturnValueWithMultipleBlobs() {
    return await Promise.all(
      blobArray.map(async (tempBlob, index) => {
        const imageWithOverlays = await addImageOverlays(
          tempBlob,
          separatedBoundingBoxesAndPolygons[index].width,
          height,
          mimeType,
          lat,
          lng,
          zoom,
          showLegend,
          showCaptions,
          addMapOverlays,
          showLogo,
          userDescription,
          enabledOverlaysId,
          legendDefinition,
          legendUrl,
          copyrightText,
          title,
          true,
          addLogos,
          drawCopernicusLogo,
          drawGeoToImg,
          geometriesToDraw,
          bounds,
          aoiWidthInMeters,
          mapWidthInMeters,
          cropToAoi,
        );

        const nicename = getNicename(
          fromTime,
          toTime,
          datasetId,
          layer.title,
          customSelected,
          isRawBand,
          bandName,
        );
        return {
          blob: imageWithOverlays,
          nicename: nicename,
          bbAndPolygons: separatedBoundingBoxesAndPolygons[index],
        };
      }),
    );
  }

  async function getReturnValueSingleBlob() {
    let finalBlob = blob;

    if (baseLayerUrl) {
      const mergeCanvas = document.createElement('canvas');
      mergeCanvas.width = width;
      mergeCanvas.height = height;
      const mergeCtx = mergeCanvas.getContext('2d');

      const baseCanvas = await getMapOverlayXYZ(baseLayerUrl, bounds, zoom, width, height);
      mergeCtx.drawImage(baseCanvas, 0, 0, width, height);

      const sentinelUrl = URL.createObjectURL(blob);
      const sentinelImg = await new Promise((resolve, reject) => {
        const i = new Image();
        i.onload = () => resolve(i);
        i.onerror = reject;
        i.src = sentinelUrl;
      });
      mergeCtx.drawImage(sentinelImg, 0, 0, width, height);
      URL.revokeObjectURL(sentinelUrl);

      finalBlob = await canvasToBlob(mergeCanvas, mimeType);
    }

    const imageWithOverlays = await addImageOverlays(
      finalBlob,
      width,
      height,
      mimeType,
      lat,
      lng,
      zoom,
      showLegend,
      showCaptions,
      addMapOverlays,
      showLogo,
      userDescription,
      enabledOverlaysId,
      legendDefinition,
      legendUrl,
      copyrightText,
      title,
      true,
      addLogos,
      drawCopernicusLogo,
      drawGeoToImg,
      geometriesToDraw,
      bounds,
      aoiWidthInMeters,
      mapWidthInMeters,
      cropToAoi,
    );

    const nicename = getNicename(
      fromTime,
      toTime,
      datasetId,
      layer.title,
      customSelected,
      isRawBand,
      bandName,
    );
    return { blob: imageWithOverlays, nicename: nicename };
  }

  if (blobArray.length > 1 && params.mergeImages === false) {
    return { multipleImages: await getReturnValueWithMultipleBlobs() };
  } else {
    return await getReturnValueSingleBlob();
  }
}

async function overrideEvalscriptIfNeeded(
  apiType,
  imageFormat,
  layer,
  customSelected,
  cancelToken,
  raiseWarning,
  shouldClipExtraBands,
) {
  if (apiType !== ApiType.PROCESSING) {
    return;
  }
  if (!isTiff(imageFormat)) {
    return;
  }
  const { sampleType, scaleFactor } = IMAGE_FORMATS_INFO[imageFormat];
  const layerName = customSelected ? 'Custom' : layer.title;
  if (!layer.evalscript && !layer.evalscriptUrl) {
    await layer.updateLayerFromServiceIfNeeded({ cancelToken: cancelToken, ...reqConfigMemoryCache });
    if (!layer.evalscript) {
      raiseWarning(WARNINGS.NO_EVALSCRIPT, layerName);
      return;
    }
  }

  const setupInfo = getEvalscriptSetup(layer.evalscript);
  if (!setupInfo) {
    raiseWarning(WARNINGS.PARSING_UNSUCCESSFUL, layerName);
    return;
  }
  if (setupInfo.sampleType !== sampleType) {
    layer.evalscript = setEvalscriptSampleType(layer.evalscript, sampleType);
    if (scaleFactor && !(layer instanceof DEMLayer)) {
      layer.evalscript = setEvalscriptOutputScale(layer.evalscript, scaleFactor);
    }
  }
  if (shouldClipExtraBands && setupInfo.nBands > 3) {
    layer.evalscript = setEvalscriptOutputBandNumber(layer.evalscript, 3);
  }
}

export async function getAppropriateApiType(layer, imageFormat, isRawBand, cancelToken) {
  if (layer instanceof ProcessingDataFusionLayer) {
    return ApiType.PROCESSING;
  }
  if (layer.supportsApiType(ApiType.PROCESSING)) {
    const isKMZ = imageFormat === IMAGE_FORMATS.KMZ_JPG || imageFormat === IMAGE_FORMATS.KMZ_PNG;
    if (isRawBand) {
      if (isKMZ) {
        return ApiType.WMS;
      }
      return ApiType.PROCESSING;
    }
    if (!isKMZ) {
      if (!layer.evalscript && !layer.evalscriptUrl) {
        await layer.updateLayerFromServiceIfNeeded({ cancelToken: cancelToken, ...reqConfigMemoryCache });
      }
      return layer.supportsApiType(ApiType.PROCESSING) ? ApiType.PROCESSING : ApiType.WMS;
    }
  }
  if (layer.supportsApiType(ApiType.WMTS)) {
    return ApiType.WMTS;
  }
  return ApiType.WMS;
}

export function getTitle(fromTime, toTime, datasetId, layerTitle, customSelected) {
  const format = 'YYYY-MM-DD HH:mm';
  const datasetLabel = checkIfCustom(datasetId) ? datasetLabels[CUSTOM] : datasetLabels[datasetId];
  return `${fromTime ? fromTime.clone().utc().format(format) + ' - ' : ''}${toTime
    .clone()
    .utc()
    .format(format)}, ${datasetLabel}, ${customSelected ? 'custom' : layerTitle}`;
}

export function getNicename(fromTime, toTime, datasetId, layerTitle, customSelected, isRawBand, bandName) {
  const format = 'YYYY-MM-DD-HH:mm';
  let layerName;

  if (isRawBand) {
    layerName = `${bandName}_(Raw)`;
  } else if (customSelected) {
    layerName = 'custom';
  } else {
    layerName = layerTitle?.replace(/ /gi, '_');
  }

  const datasetLabel = checkIfCustom(datasetId) ? datasetLabels[CUSTOM] : datasetLabels[datasetId];

  return `${fromTime ? fromTime.clone().utc().format(format) + '_' : ''}${toTime
    .clone()
    .utc()
    .format(format)}_${datasetLabel ? datasetLabel.replace(/ /gi, '_') + '_' : ''}${layerName}`;
}

export async function getLayerFromParams(params, cancelToken, authToken) {
  /// Check if BYOC works!!!!!!!
  const {
    visualizationUrl,
    layerId,
    datasetId,
    dataFusion,
    evalscript,
    evalscripturl,
    fromTime,
    toTime,
    minQa,
    mosaickingOrder,
    upsampling,
    downsampling,
    speckleFilter,
    orthorectification,
    backscatterCoeff,
    orbitDirection,
    cloudCoverage,
  } = params;
  const isTimeRange = isTimespanModeSelected(fromTime, toTime);
  let layer;

  const reqConfig = {
    cancelToken: cancelToken,
    ...reqConfigMemoryCache,
    ...(authToken ? { authToken } : {}),
  };
  const dsh = getDataSourceHandler(datasetId);

  if (layerId) {
    layer = await LayersFactory.makeLayer(visualizationUrl, layerId, null, reqConfig);
    if (evalscript) {
      layer.evalscript = evalscript;
    }
    if (evalscripturl) {
      layer.evalscriptUrl = evalscripturl;
    }
    await layer.updateLayerFromServiceIfNeeded(reqConfig);
  } else if (isDataFusionEnabled(dataFusion)) {
    layer = await constructDataFusionLayer(dataFusion, evalscript, evalscripturl, fromTime, toTime);
  } else {
    const shJsDataset = dsh ? dsh.getSentinelHubDataset(datasetId) : null;
    let layers = await LayersFactory.makeLayers(
      visualizationUrl,
      (_, dataset) => (!shJsDataset ? true : dataset.id === shJsDataset.id),
      null,
      reqConfig,
    );
    const isBYOC = checkIfCustom(datasetId);
    if (isBYOC) {
      await Promise.all(layers.map((l) => l.updateLayerFromServiceIfNeeded(reqConfig)));
      layers = layers.filter((l) => l.collectionId === datasetId);
    }
    if (layers.length > 0) {
      layer = layers[0];
      await layer.updateLayerFromServiceIfNeeded(reqConfig);
      layer.evalscript = evalscript;
      layer.evalscriptUrl = evalscripturl;
      layer.layerId = layerId;
    }
  }
  if (layer) {
    if (dsh && dsh.getAdditionalParamsForGetMap) {
      const additionalDatasetParams = dsh.getAdditionalParamsForGetMap(datasetId);
      if (additionalDatasetParams) {
        Object.keys(additionalDatasetParams).forEach((key) => {
          layer[key] = additionalDatasetParams[key];
        });
      }
    }

    if (layer.maxCloudCoverPercent !== undefined) {
      layer.maxCloudCoverPercent = 100;

      if (cloudCoverage !== undefined) {
        layer.maxCloudCoverPercent = isTimeRange ? cloudCoverage : layer.maxCloudCoverPercent;
      }
    }
    if (minQa !== undefined) {
      layer.minQa = minQa;
    }
    if (mosaickingOrder) {
      layer.mosaickingOrder = mosaickingOrder;
    }
    if (upsampling) {
      layer.upsampling = upsampling;
    } else if (!layer.upsampling) {
      layer.upsampling = Interpolator.NEAREST;
    }
    if (downsampling) {
      layer.downsampling = downsampling;
    } else if (!layer.downsampling) {
      layer.downsampling = Interpolator.NEAREST;
    }
    if (speckleFilter) {
      layer.speckleFilter = speckleFilter;
    }
    if (orthorectification) {
      if (orthorectification === DISABLED_ORTHORECTIFICATION) {
        layer.orthorectify = false;
      } else {
        layer.orthorectify = true;
        layer.demInstanceType = orthorectification;
      }
    }
    if (backscatterCoeff) {
      layer.backscatterCoeff = backscatterCoeff;
    }
    if (orbitDirection) {
      layer.orbitDirection = orbitDirection;
    }

    if (dsh?.supportsLowResolutionAlternativeCollection(layer.collectionId)) {
      layer.lowResolutionCollectionId = dsh.getLowResolutionCollectionId(layer.collectionId);
      layer.lowResolutionMetersPerPixelThreshold = dsh.getLowResolutionMetersPerPixelThreshold(
        layer.collectionId,
      );
    }
  }
  return layer;
}

export function constructBBoxFromBounds(bounds, crs = CRS_EPSG4326.authId) {
  if (crs === CRS_EPSG4326.authId) {
    return new BBox(CRS_EPSG4326, bounds.getWest(), bounds.getSouth(), bounds.getEast(), bounds.getNorth());
  }
  if (crs === CRS_EPSG3857.authId) {
    const { x: maxX, y: maxY } = wgs84ToMercator(bounds.getNorthEast());
    const { x: minX, y: minY } = wgs84ToMercator(bounds.getSouthWest());
    return new BBox(CRS_EPSG3857, minX, minY, maxX, maxY);
  }
  if (isAuthIdUtm(crs)) {
    const epsgCode = crs.split('EPSG:')[1];
    // last 2 values in epsgCode is the zone
    // numbers with leading 0, for example 01 to 1
    const mockedCrsObject = {
      authId: crs,
      auth: 'EPSG',
      srid: crs,
      urn: undefined,
      opengisUrl: `http://www.opengis.net/def/crs/EPSG/0/${epsgCode}`,
    };
    const bbox4326 = new BBox(
      CRS_EPSG4326,
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    );
    const transformedGeometry = reprojectGeometry(bbox4326.toGeoJSON(), {
      fromCrs: CRS_EPSG4326.authId,
      toCrs: crs,
    });
    const [minX, minY, maxX, maxY] = getBboxFromCoords(transformedGeometry.coordinates);
    return new BBox(mockedCrsObject, minX, minY, maxX, maxY);
  }
}

export async function addImageOverlays(
  blob,
  width,
  height,
  mimeType,
  lat,
  lng,
  zoom,
  showLegend,
  showCaptions,
  addMapOverlays,
  showLogo,
  userDescription,
  enabledOverlaysId,
  legendDefinition,
  legendUrl,
  copyrightText,
  title,
  showScaleBar = true,
  logos = true,
  drawCopernicusLogo = true,
  drawGeoToImg,
  geometriesToDraw,
  bounds,
  aoiWidthInMeters,
  mapWidthInMeters,
  cropToAoi = true,
) {
  if (!(showLegend || showCaptions || addMapOverlays || showLogo || drawGeoToImg)) {
    return blob;
  }
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  await drawBlobOnCanvas(ctx, blob, 0, 0);

  if (addMapOverlays) {
    await drawMapOverlaysOnCanvas(ctx, bounds, zoom, width, enabledOverlaysId);
  }
  if (showCaptions) {
    let scalebar;
    if (showScaleBar) {
      scalebar = getScaleBarInfo(cropToAoi ? aoiWidthInMeters : null, cropToAoi ? mapWidthInMeters : null);
    }
    await drawCaptions(ctx, userDescription, title, copyrightText, scalebar, logos, drawCopernicusLogo);
  }
  if (showLegend) {
    const legendImageUrl = legendDefinition
      ? 'data:image/svg+xml;base64,' + b64EncodeUnicode(createSVGLegend(legendDefinition))
      : legendUrl
      ? legendUrl
      : null;
    if (legendImageUrl !== null) {
      const legendImage = await loadImage(legendImageUrl);
      drawLegendImage(ctx, legendImage, true, showCaptions);
    }
  }
  if (showLogo) {
    const logoPartitionWidth = ctx.canvas.width * 0.4 - PARTITION_PADDING;
    await drawLogo(ctx, logoPartitionWidth, getLowerYAxis(ctx), drawCopernicusLogo);
  }
  if (drawGeoToImg) {
    geometriesToDraw.forEach((geometry) => drawGeometryOnImg(ctx, geometry, bounds));
  }

  return await canvasToBlob(canvas, mimeType);
}

export function getAllBands(datasetId) {
  const dsh = getDataSourceHandler(datasetId);
  return dsh ? dsh.getBands(datasetId) : [];
}

export async function getAllLayers(url, datasetId, selectedTheme, selectedDate) {
  const dsh = getDataSourceHandler(datasetId);
  const shJsDataset = dsh ? dsh.getSentinelHubDataset(datasetId) : null;
  const { layersExclude, layersInclude } = selectedTheme.content.find((t) => t.url === url);
  const allLayers = await LayersFactory.makeLayers(
    url,
    (layerId, dataset) => (!shJsDataset ? true : dataset.id === shJsDataset.id),
    null,
    reqConfigMemoryCache,
  );
  await Promise.all(
    allLayers.map(async (l) => {
      await l.updateLayerFromServiceIfNeeded(reqConfigMemoryCache);
    }),
  );
  return dsh.getLayers(allLayers, datasetId, url, layersExclude, layersInclude, selectedDate);
}

export function getSupportedImageFormats(datasetId) {
  return getDataSourceHandler(datasetId).getSupportedImageFormats(datasetId);
}

export function getRawBandsScalingFactor({ datasetId, imageSampleType, bandsInfo }) {
  if (imageSampleType === 'FLOAT32') {
    // Scaling is not needed as FLOAT32 can handle any number
    return;
  }

  let factor;
  if (imageSampleType) {
    if (imageSampleType === 'UINT8') {
      factor = 255;
    }
    if (imageSampleType === 'UINT16') {
      factor = 65535;
    }
  }
  const isBYOC = checkIfCustom(datasetId);
  if (isBYOC) {
    // This is a hack to make raw bands for BYOC layers display anything
    // Service stretches values from 0-1 to 0-255, but if our BYOC bands can be UINT8 or UINT16
    // https://docs.sentinel-hub.com/api/latest/#/Evalscript/V3/README?id=sampletype
    const sampleType = bandsInfo[0].sampleType;
    const orig = factor ? factor : 1.0;
    if (sampleType === 'UINT8') {
      factor = orig / 255;
    }
    if (sampleType === 'UINT16') {
      factor = orig / 65535;
    }
  }
  return factor;
}

export function constructV3Evalscript(layer, datasetId, imageFormat, bands, addDataMask = false) {
  const sampleType = IMAGE_FORMATS_INFO[imageFormat].sampleType;

  let factor = getRawBandsScalingFactor({
    datasetId: datasetId,
    imageSampleType: sampleType,
    bandsInfo: bands,
  });
  factor = factor ? `${factor} *` : '';

  if (datasetId === COPERNICUS_CORINE_LAND_COVER) {
    return `//VERSION=3
function setup() {
  return {
    input: ["CLC"${addDataMask ? ', "dataMask"' : ''}],
    output: { bands: ${addDataMask ? 2 : 1}, sampleType: "${sampleType}" }
  };
}

function evaluatePixel(sample) {
  return [${`${factor} (sample.CLC === ${layer})`}${addDataMask ? ', sample.dataMask' : ''} ];}`;
  }

  return `//VERSION=3
function setup() {
  return {
    input: ["${layer}"${addDataMask ? ', "dataMask"' : ''}],
    output: { bands: ${addDataMask ? 2 : 1}, sampleType: "${sampleType}" }
  };
}

function evaluatePixel(sample) {
  return [${`${factor} sample.` + layer}${addDataMask ? ', sample.dataMask' : ''} ];}`;
}

export function constructBasicEvalscript(band) {
  return `return [${band}]`;
}

export function isTiff(imageFormat) {
  return (
    imageFormat === IMAGE_FORMATS.TIFF_UINT8 ||
    imageFormat === IMAGE_FORMATS.TIFF_UINT16 ||
    imageFormat === IMAGE_FORMATS.TIFF_FLOAT32
  );
}

/*

  METHODS BELOW ARE VIRTUALLY UNCHANGED FROM EOB3IMAGEDOWNLOADPANEL

*/

export const drawMapOverlaysOnCanvas = async (ctx, bounds, zoom, width, enabledOverlaysId) => {
  const enabledOverlays = overlayTileLayers().filter((overlayTileLayer) =>
    enabledOverlaysId.includes(overlayTileLayer.id),
  );
  enabledOverlays.sort((a, b) => a.zIndex - b.zIndex);
  const canvasWidth = ctx.canvas.width;
  const canvasHeight = ctx.canvas.height;
  // currently we have two types of overlays
  // One served as images and the other as vector tiles
  // Vector tiles are drawn by mapbox-gl on to a canvas element
  for (const overlay of enabledOverlays) {
    let overlayCanvas;
    if (overlay.urlType === 'VECTOR') {
      overlayCanvas = await getGlOverlay(overlay.pane);
    } else {
      overlayCanvas = await getMapOverlayXYZ(
        overlay.url,
        bounds,
        zoom,
        canvasWidth,
        canvasHeight,
        overlay.tileSize,
        overlay.makeReadable,
        overlay.zoomOffset,
      );
    }
    ctx.drawImage(overlayCanvas, 0, 0, canvasWidth, canvasHeight);
  }
};

const roundScaleValue = (val) => {
  if (val >= 1000) {
    return Math.round(val / 1000);
  } else if (val >= 100) {
    return Math.round(val / 100) * 100;
  } else if (val >= 10) {
    return Math.round(val / 10) * 10;
  } else if (val >= 5) {
    return 5;
  }
  return 1;
};

export const getScaleBarInfo = (aoiWidthInMeters = null, mapWidthInMeters = null) => {
  const scaleBarEl = document.querySelector('.leaflet-control-scale-line');
  if (!scaleBarEl) {
    return null;
  }

  if (aoiWidthInMeters !== null && mapWidthInMeters !== null) {
    // get ratio between scale and actual width of map
    // mapBounds in m === currentScale in m
    // aoiBounds in m === x in m
    // x = currentScale * aoiBounds / mapBounds
    const [val, unit] = scaleBarEl.innerHTML.split(' ');
    const x = (val * (unit === 'km' ? 1000 : 1) * aoiWidthInMeters) / mapWidthInMeters;
    const newUnit = x >= 1000 ? 'km' : 'm';
    const newValue = roundScaleValue(x);
    return {
      text: `${newValue} ${newUnit}`,
      width: scaleBarEl.offsetWidth,
    };
  } else {
    return {
      text: scaleBarEl.innerHTML,
      width: scaleBarEl.offsetWidth,
    };
  }
};

export const drawCaptions = async (
  ctx,
  userDescription,
  title,
  copyrightText,
  scaleBar,
  logos = true,
  drawCopernicusLogo = true,
) => {
  const { width: mapWidth } = getMapDOMSize();
  const scalebarPartitionWidth = scaleBar
    ? Math.max(getScalebarWidth(ctx, scaleBar, mapWidth), ctx.canvas.width * 0.33)
    : ctx.canvas.width * 0.33;
  const copyrightPartitionWidth = (ctx.canvas.width - scalebarPartitionWidth) * 0.6 - PARTITION_PADDING;
  const logoPartitionWidth = (ctx.canvas.width - scalebarPartitionWidth) * 0.4 - PARTITION_PADDING;
  const bottomYAxis = getLowerYAxis(ctx);
  const copyrightPartitionXCoords = scalebarPartitionWidth + PARTITION_PADDING;

  if (title || userDescription) {
    const TOP_RECT_SIZE = { width: ctx.canvas.width, height: ctx.canvas.height * 0.04 };
    drawTextBoxBackground(ctx, TOP_RECT_SIZE.width, TOP_RECT_SIZE.height);
    drawDescription(ctx, TOP_RECT_SIZE.width, TOP_RECT_SIZE.height, title, userDescription);
  }
  if (scaleBar) {
    drawScalebar(ctx, scaleBar, mapWidth);
  }
  if (logos) {
    await drawLogo(ctx, logoPartitionWidth, bottomYAxis, drawCopernicusLogo);
  }
  if (copyrightText) {
    drawCopyrightText(ctx, copyrightText, copyrightPartitionXCoords, copyrightPartitionWidth, bottomYAxis);
  }
};

function drawDescription(ctx, containerWidth, containerHeight, title, userDescription) {
  ctx.fillStyle = '#fff';
  ctx.textBaseline = 'middle';
  ctx.textAlign = 'left';
  const userDescriptionWithSpace = userDescription ? userDescription + ` ` : userDescription;
  const normalFont = getFont(ctx.canvas.width, { font: 'normal', bold: false });
  const userDescriptionFont = getFont(ctx.canvas.width, { font: 'normal', bold: true });
  const titleWidth = title !== null ? getTextWidth(ctx, title, normalFont) : 0;
  const userDescriptionWidth =
    userDescriptionWithSpace !== null ? getTextWidth(ctx, userDescriptionWithSpace, userDescriptionFont) : 0;
  const totalTextWidth = titleWidth + userDescriptionWidth;
  const x = containerWidth / 2 - totalTextWidth / 2;
  const y = containerHeight / 2;

  if (userDescriptionWithSpace !== null) {
    ctx.font = userDescriptionFont;
    ctx.fillText(userDescriptionWithSpace, x, y);
  }
  if (title !== null) {
    ctx.font = normalFont;
    ctx.fillText(title, x + userDescriptionWidth, y);
  }
}

function getLowerYAxis(ctx) {
  return ctx.canvas.height * 0.99;
}

function getScalebarWidth(ctx, scaleBar, mapWidth) {
  const width = (scaleBar.width * ctx.canvas.width) / mapWidth;
  const textWidth = ctx.measureText(scaleBar.text);
  return width + textWidth.width + SCALEBAR_LEFT_PADDING + 20;
}

function getScalebarHeight(ctx) {
  return ctx.canvas.height * 0.016;
}

function drawScalebar(ctx, scaleBar, mapWidth) {
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  ctx.strokeStyle = '#fff';
  ctx.fillStyle = '#fff';
  const strokeRatio = 1 / 900;
  ctx.lineWidth = Math.round(Math.max(ctx.canvas.width * strokeRatio, 1));
  ctx.beginPath();
  const width = (scaleBar.width * ctx.canvas.width) / mapWidth;
  const yAxisLineLength = getScalebarHeight(ctx);
  const baseLine = getLowerYAxis(ctx);
  ctx.moveTo(SCALEBAR_LEFT_PADDING, baseLine - yAxisLineLength);
  ctx.lineTo(SCALEBAR_LEFT_PADDING, baseLine);
  ctx.lineTo(width + SCALEBAR_LEFT_PADDING, baseLine);
  ctx.lineTo(width + SCALEBAR_LEFT_PADDING, baseLine - yAxisLineLength);
  //halfway mark
  ctx.moveTo(width / 2 + SCALEBAR_LEFT_PADDING, baseLine);
  ctx.lineTo(width / 2 + SCALEBAR_LEFT_PADDING, baseLine - yAxisLineLength / 2);
  ctx.stroke();
  //scalebar text
  ctx.textAlign = 'left';
  ctx.textBaseline = 'alphabetic';
  ctx.font = getFont(ctx.canvas.width, { font: 'normal', bold: false });
  ctx.fillText(scaleBar.text, width + 20, baseLine);
}

function drawTextBoxBackground(ctx, width, height) {
  ctx.fillStyle = 'rgba(44,48,51,0.7)';
  ctx.fillRect(0, 0, width, height);
}

function drawCopyrightText(ctx, text, copyrightPartitionX, copyrightPartitionWidth, baselineY) {
  ctx.fillStyle = '#fff';
  const x = copyrightPartitionX + copyrightPartitionWidth / 2;
  const fontSize = getFontSize(ctx.canvas.width, 'copyright');
  const lineHeight = fontSize;
  ctx.font = getFont(ctx.canvas.width, { font: 'copyright', bold: false });
  ctx.textAlign = 'center';
  ctx.shadowColor = 'black';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;
  const lines = getWrappedLines(ctx, text, copyrightPartitionWidth);
  lines.forEach((line, index) => {
    const y = baselineY - (lines.length - index - 1) * lineHeight;
    ctx.fillText(line, x, y);
  });
}

function calculateXYScale(imageWidth, imageHeight, realWorldWidth, realWorldHeight) {
  return {
    xScale: imageWidth / realWorldWidth,
    yScale: imageHeight / realWorldHeight,
  };
}

const lineStyle = {
  strokeColor: '#3388ff',
  lineWidth: 3,
};

function drawGeometryOnImg(ctx, geometryToDraw, leafletBounds) {
  const bbox = constructBBoxFromBounds(leafletBounds);
  const mercatorBBox = ensureMercatorBBox(bbox);
  const imageWidth = ctx.canvas.width;
  const imageHeight = ctx.canvas.height;

  handleDrawGeometryOnImg(ctx, geometryToDraw, mercatorBBox, imageWidth, imageHeight);
}

function handleDrawGeometryOnImg(ctx, geometryToDraw, mercatorBBox, imageWidth, imageHeight) {
  switch (geometryToDraw.type) {
    case 'LineString':
      drawLine(ctx, geometryToDraw, mercatorBBox, imageWidth, imageHeight, lineStyle);
      break;
    case 'Polygon':
      drawPolygon(ctx, geometryToDraw, mercatorBBox, imageWidth, imageHeight, lineStyle);
      break;
    case 'MultiPolygon':
      drawMultiPolygon(ctx, geometryToDraw, mercatorBBox, imageWidth, imageHeight, lineStyle);
      break;

    default:
      throw new Error(
        `${geometryToDraw.type} not supported. Only LineString, Polygon or MultiPolygon are supported`,
      );
  }
}

function drawPathSections(ctx, coords, mercatorBBox, imageWidth, imageHeight, lineStyle) {
  ctx.strokeStyle = lineStyle.strokeColor;
  ctx.lineWidth = lineStyle.lineWidth;
  for (let i = 0; i < coords.length; i++) {
    const lng = coords[i][0];
    const lat = coords[i][1];
    const pixelCoords = getPixelCoordinates(lng, lat, mercatorBBox, imageWidth, imageHeight);
    if (i === 0) {
      ctx.beginPath();
      ctx.moveTo(pixelCoords.x, pixelCoords.y);
    } else {
      ctx.lineTo(pixelCoords.x, pixelCoords.y);
    }
  }
  ctx.stroke();
}

function drawLine(ctx, geometry, mercatorBBox, imageWidth, imageHeight, lineStyle) {
  drawPathSections(ctx, geometry.coordinates, mercatorBBox, imageWidth, imageHeight, lineStyle);
}

function drawPolygon(ctx, geometry, mercatorBBox, imageWidth, imageHeight, lineStyle) {
  for (const polygonCoords of geometry.coordinates) {
    drawPathSections(ctx, polygonCoords, mercatorBBox, imageWidth, imageHeight, lineStyle);
  }
}

function drawMultiPolygon(ctx, geometry, mercatorBBox, imageWidth, imageHeight, lineStyle) {
  for (const polygonCoords of geometry.coordinates) {
    for (const coords of polygonCoords) {
      drawPathSections(ctx, coords, mercatorBBox, imageWidth, imageHeight, lineStyle);
    }
  }
}

export function getPixelCoordinates(lng, lat, mercatorBBox, imageWidth, imageHeight) {
  const tPoint = turfPoint([lng, lat]);
  const mercatorPoint = reprojectGeometry(tPoint.geometry, { fromCrs: 'EPSG:4326', toCrs: 'EPSG:3857' });

  const realWorldWidth = Math.abs(mercatorBBox.maxX - mercatorBBox.minX);
  const realWorldHeight = Math.abs(mercatorBBox.maxY - mercatorBBox.minY);

  const { xScale, yScale } = calculateXYScale(imageWidth, imageHeight, realWorldWidth, realWorldHeight);

  return {
    x: Math.round((mercatorPoint.coordinates[0] - mercatorBBox.minX) * xScale),
    y: Math.round((mercatorBBox.maxY - mercatorPoint.coordinates[1]) * yScale),
  };
}

async function drawLogo(ctx, logoPartitionWidth, bottomY, drawCopernicusLogo) {
  if (!drawCopernicusLogo) {
    return;
  }

  let copernicusLogo;
  if (drawCopernicusLogo) {
    copernicusLogo = await loadImage(copernicus);
  }

  const proposedWidth = Math.max(ctx.canvas.width * 0.05, 50);
  const imagePadding = 10;
  const ratio = proposedWidth / copernicusLogo.width;

  const copernicusLogoWidth = drawCopernicusLogo ? copernicusLogo.width * ratio : 0;
  const copernicusLogoHeight = drawCopernicusLogo ? copernicusLogo.height * ratio : 0;

  const imageWidth = copernicusLogoWidth;

  let copernicusLogoX;
  let copernicusLogoY;

  if (imageWidth > logoPartitionWidth) {
    copernicusLogoX = ctx.canvas.width - copernicusLogoWidth - imagePadding;
    copernicusLogoY = bottomY - copernicusLogoHeight - 2;
  } else {
    copernicusLogoX = ctx.canvas.width - imageWidth - imagePadding * 2;
    copernicusLogoY = bottomY - copernicusLogoHeight * 0.9; // Capital letter in image is large, so offset image y postition
  }

  ctx.shadowColor = 'black';
  ctx.shadowBlur = 2;
  ctx.shadowOffsetX = 0;
  ctx.shadowOffsetY = 0;

  if (drawCopernicusLogo) {
    ctx.drawImage(
      copernicusLogo,
      copernicusLogoX,
      copernicusLogoY,
      copernicusLogoWidth,
      copernicusLogoHeight,
    );
  }
}

function getFontSize(width, font) {
  // y = 0.0048x + 6.5016
  const size = Math.max((4.4 / FONT_BASE) * width + FONT_SIZES[font].base, FONT_SIZES[font].min);
  return size;
}

function getFont(width, { font, bold }) {
  const size = getFontSize(width, font);
  return ` ${bold ? 'Bold' : ''} ${Math.round(size)}px  ${FONT_FAMILY}`;
}

function getTextWidth(ctx, text, font) {
  ctx.font = font;
  const widthObj = ctx.measureText(text);
  return widthObj.width;
}

function getWrappedLines(ctx, text, maxWidth) {
  let lines = [];
  let line = '';
  let lineTest = '';
  let words = text.split(' ');
  for (let word of words) {
    lineTest = line + word + ' ';

    if (ctx.measureText(lineTest).width > maxWidth) {
      lines.push(line);
      line = word + ' ';
    } else {
      line = lineTest;
    }
  }

  if (line.length > 0) {
    lines.push(line.trim());
  }

  return lines;
}

export async function loadImage(url) {
  return new Promise((resolve, reject) => {
    if (!url) {
      reject(t`Error fetching image: url is empty!`);
      return;
    }
    const img = document.createElement('img');
    img.crossOrigin = 'Anonymous';
    img.onload = () => resolve(img);
    img.onerror = (e) => {
      reject(t`Error fetching image:` + ` ${url} ${e}`);
    };
    img.src = url;
  });
}

export function drawLegendImage(ctx, legendImage, left, showCaptions) {
  if (legendImage === null || legendImage === undefined) {
    return;
  }
  const initialWidth = ctx.canvas.width * 0.05; //5%
  let ratio = initialWidth / legendImage.width;
  if (ratio < 0.6) {
    ratio = 0.6;
  }
  if (ratio > 1) {
    ratio = 1;
  }

  const legendWidth = Math.round(legendImage.width * ratio);
  const legendHeight = Math.round(legendImage.height * ratio);
  let legendX;
  let legendY;
  if (left) {
    legendX = SCALEBAR_LEFT_PADDING;
  } else {
    legendX = ctx.canvas.width - legendWidth - SCALEBAR_LEFT_PADDING;
  }
  legendY =
    (showCaptions ? getLowerYAxis(ctx) : ctx.canvas.height) -
    legendHeight -
    (showCaptions ? getScalebarHeight(ctx) + 10 : 10);

  ctx.lineJoin = 'round';
  ctx.lineWidth = '1';
  ctx.strokeStyle = 'black';
  ctx.strokeRect(legendX - 1, legendY - 1, legendWidth + 2, legendHeight + 2);

  ctx.drawImage(
    legendImage,
    0,
    0,
    legendImage.width,
    legendImage.height,
    legendX,
    legendY,
    legendWidth,
    legendHeight,
  );
}

// METHODS IN THIS FILE ARE ALMOST UNCHANGED FROM EOB2

/*
create SVG for discrete legend
*/

function createSVGLegendDiscrete(legend) {
  const MARGIN_LEFT = 5;
  const MARGIN_TOP = 5;
  const LEGEND_ITEM_HEIGHT = 30;
  const LEGEND_ITEM_BORDER = 'rgb(119,119,119);';
  const LEGEND_ITEM_WIDTH = '3px';
  const FONT_COLOR = 'black';
  const FONT_SIZE = '18px';
  const FONT_FAMILY = 'Arial';
  const BACKGROUND_COLOR = 'white';

  const { items } = legend;

  const svg = createSVGElement('svg');
  setSVGElementAttributes(svg, {
    height: `${items.length * LEGEND_ITEM_HEIGHT + 2 * MARGIN_TOP}px`,
    style: `background-color: ${BACKGROUND_COLOR}`,
  });

  items.forEach((item, index) => {
    let circle = createSVGElement('circle');
    setSVGElementAttributes(circle, {
      cx: MARGIN_LEFT + LEGEND_ITEM_HEIGHT / 2,
      cy: MARGIN_TOP + LEGEND_ITEM_HEIGHT / 2 + index * LEGEND_ITEM_HEIGHT,
      r: LEGEND_ITEM_HEIGHT / 2 - 4,
      style: `fill: ${item.color}; stroke: ${LEGEND_ITEM_BORDER}; stroke-width: ${LEGEND_ITEM_WIDTH};`,
    });
    svg.appendChild(circle);

    let text = createSVGElement('text');
    setSVGElementAttributes(text, {
      x: MARGIN_LEFT + LEGEND_ITEM_HEIGHT + 5,
      y: MARGIN_TOP + LEGEND_ITEM_HEIGHT / 2 + index * LEGEND_ITEM_HEIGHT,
      'alignment-baseline': 'central',
      style: `fill:${FONT_COLOR}; font-family:${FONT_FAMILY}; font-size:${FONT_SIZE}`,
    });

    text.textContent = item.label;
    svg.appendChild(text);
  });

  let maxLabelWidth = 0;
  maxLabelWidth = Math.max(
    ...items
      .filter((item) => item.label)
      .map((item) => getLabelWidth(item.label, FONT_SIZE, FONT_FAMILY) + 5),
    maxLabelWidth,
  );
  svg.setAttribute('width', `${maxLabelWidth + 2 * MARGIN_LEFT + LEGEND_ITEM_HEIGHT}px`);

  return svg;
}

function getLabelWidth(txt, fontSize, fontFamily) {
  if (!txt) {
    return 0;
  }
  let element = document.createElement('canvas');
  let context = element.getContext('2d');
  context.font = `${fontSize} ${fontFamily}`;
  return context.measureText(txt).width;
}

/*
create SVG element
*/
const createSVGElement = (elem) => document.createElementNS('http://www.w3.org/2000/svg', elem);

/*
set SVG element attributes.
*/

const setSVGElementAttributes = (elem, attributes) => {
  Object.keys(attributes).forEach((key) => elem.setAttributeNS(null, key, attributes[key]));
};

/*
create SVG for continous legend
*/

function createSVGLegendContinous(legend) {
  const MARGIN_LEFT = 15;
  const MARGIN_TOP = 15;
  const HEIGHT = 320;
  const LEGEND_WIDTH = 50;
  const LEGEND_HEIGHT = HEIGHT - 2 * MARGIN_TOP;
  const LEGEND_BORDER_COLOR = 'black';
  const LEGEND_BORDER_WIDTH = '2px';
  const FONT_COLOR = 'black';
  const FONT_SIZE = '18px';
  const FONT_FAMILY = 'Arial';
  const BACKGROUND_COLOR = 'white';

  const { gradients, minPosition, maxPosition } = createGradients(legend);
  let items = [];
  Object.assign(items, gradients);

  let ticks = [];
  Object.assign(ticks, legend.gradients);

  //svg container
  const svg = createSVGElement('svg');
  setSVGElementAttributes(svg, {
    height: `${HEIGHT}px`,
    style: `background-color: ${BACKGROUND_COLOR}`,
  });

  //add border
  const border = createSVGElement('rect');
  setSVGElementAttributes(border, {
    x: MARGIN_LEFT,
    y: MARGIN_TOP,
    width: LEGEND_WIDTH,
    height: LEGEND_HEIGHT + 1,
    style: `fill:none;stroke:${LEGEND_BORDER_COLOR}; stroke-width:${LEGEND_BORDER_WIDTH}`,
  });
  svg.appendChild(border);

  //gradient definitions
  const defs = createSVGElement('defs');
  svg.appendChild(defs);

  items.forEach((item, index) => {
    const itemHeight = LEGEND_HEIGHT * item.size;
    let linearGradient = createSVGElement('linearGradient');
    setSVGElementAttributes(linearGradient, {
      x1: '0%',
      y1: '0%',
      x2: '0%',
      y2: '100%',
      id: `id${index}`,
    });
    //add stops to gradient
    const stops = [
      {
        color: item.endColor,
        offset: '0%',
      },
      {
        color: item.startColor,
        offset: '100%',
      },
    ];

    stops.forEach((s) => {
      let stop = createSVGElement('stop');
      setSVGElementAttributes(stop, {
        offset: s.offset,
        'stop-color': s.color,
      });
      linearGradient.appendChild(stop);
    });
    //add gradient to definiton
    defs.appendChild(linearGradient);

    let rect = createSVGElement('rect');
    setSVGElementAttributes(rect, {
      x: MARGIN_LEFT,
      y: MARGIN_TOP + LEGEND_HEIGHT * (1 - item.pos - item.size),
      width: LEGEND_WIDTH,
      height: itemHeight + 1,
      style: `fill:url(#id${index});stroke:none`,
    });

    svg.appendChild(rect);
  });

  //add ticks
  ticks.forEach((line) => {
    if (line.label !== undefined && line.label !== null && line.label !== '') {
      let l = createSVGElement('line');
      const pos = (1 - (line.position - minPosition) / (maxPosition - minPosition)) * LEGEND_HEIGHT;
      setSVGElementAttributes(l, {
        x1: MARGIN_LEFT + LEGEND_WIDTH,
        x2: MARGIN_LEFT + LEGEND_WIDTH + 5,
        y1: MARGIN_TOP + pos,
        y2: MARGIN_TOP + pos,
        style: `stroke: ${FONT_COLOR}`,
      });
      svg.appendChild(l);
    }
  });

  //add labels
  ticks.forEach((item) => {
    if (item.label !== undefined && item.label !== null && item.label !== '') {
      let text = createSVGElement('text');
      const pos = (1 - (item.position - minPosition) / (maxPosition - minPosition)) * LEGEND_HEIGHT;
      setSVGElementAttributes(text, {
        x: MARGIN_LEFT + LEGEND_WIDTH + 10,
        y: MARGIN_TOP + pos + 5,
        style: `fill: ${FONT_COLOR}; font-family: ${FONT_FAMILY}; font-size  : ${FONT_SIZE};`,
      });
      text.textContent = item.label;
      svg.appendChild(text);
    }
  });
  //calculate max label width
  let maxLabelWidth = 0;
  maxLabelWidth = Math.max(
    ...ticks.filter((t) => t.label).map((val) => getLegendTextWidth(val.label, FONT_SIZE, FONT_FAMILY) + 10),
    maxLabelWidth,
  );

  //set svg width
  setSVGElementAttributes(svg, {
    width: `${maxLabelWidth + 2 * MARGIN_LEFT + LEGEND_WIDTH}px`,
  });
  return svg;
}

export const createSVGLegend = (legendSpec) => {
  let legendImage;
  if (Array.isArray(legendSpec)) {
    for (let legend of legendSpec) {
      let l;
      if (legend.type === 'continuous') {
        l = createSVGLegendContinous(legend);
      } else {
        l = createSVGLegendDiscrete(legend);
      }
      if (legendImage) {
        const currentHeight = legendImage.height.baseVal.value;
        const newPartHeight = l.height.baseVal.value;
        setSVGElementAttributes(legendImage, {
          height: `${currentHeight + newPartHeight}px`,
        });
        setSVGElementAttributes(l, {
          y: currentHeight,
        });
        legendImage.append(l);
      } else {
        legendImage = l;
      }
    }
  } else {
    legendImage =
      legendSpec.type === 'discrete'
        ? createSVGLegendDiscrete(legendSpec)
        : createSVGLegendContinous(legendSpec);
  }
  return new XMLSerializer().serializeToString(legendImage);
};

function getLegendTextWidth(txt, fontSize, fontFamily) {
  if (!txt) {
    return 0;
  }
  let element = document.createElement('canvas');
  let context = element.getContext('2d');
  context.font = `${fontSize} ${fontFamily}`;
  return context.measureText(txt).width;
}

function createGroundOverlay(bounds, imageFormat, index = undefined) {
  const north = bounds.getNorthEast().lat;
  const south = bounds.getSouthWest().lat;
  const east = bounds.getNorthEast().lng;
  const west = bounds.getSouthWest().lng;

  const centerLatitude = (north + south) / 2;
  const centerLongitude = (east + west) / 2;

  return `<GroundOverlay>
        <name>Sentinel-Hub overlay</name>
        <Icon>
          <href>image${index !== undefined ? `_${index}` : ''}.${imageFormat}</href>
        </Icon>
        <LatLonBox>
          <north>${north}</north>
          <south>${south}</south>
          <east>${east}</east>
          <west>${west}</west>
        </LatLonBox>
        <LookAt>
    
            <longitude>${centerLongitude}</longitude>
    
            <latitude>${centerLatitude}</latitude>
    
            <altitudeMode>clampToGround</altitudeMode>
    
        </LookAt>
      </GroundOverlay>`;
}

export function generateKmlFile(bounds, imageFormat) {
  let groundOverlays = [];
  if (Array.isArray(bounds)) {
    bounds.forEach((tempBounds, index) => {
      groundOverlays.push(createGroundOverlay(tempBounds, imageFormat, index));
    });
  } else {
    groundOverlays.push(createGroundOverlay(bounds, imageFormat));
  }

  if (groundOverlays.length === 2) {
    return `<?xml version='1.0' encoding='UTF-8'?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
    <Folder>
      <name>Sentinel-Hub Overlays</name>
      <description>Ground overlays</description>
      ${groundOverlays[0]}
      ${groundOverlays[1]}
    </Folder>
  </kml>`;
  } else {
    return `<?xml version='1.0' encoding='UTF-8'?>
  <kml xmlns="http://www.opengis.net/kml/2.2">
    <Folder>
      <name>Sentinel-Hub Overlays</name>
      <description>Ground overlays</description>
      ${groundOverlays[0]}
    </Folder>
  </kml>`;
  }
}

export async function prepareKmzFile(kmlContent, imageBlobs, imageFormat) {
  const zip = new JSZip();

  zip.file('doc.kml', kmlContent);

  if (Array.isArray(imageBlobs)) {
    imageBlobs.forEach((image, index) => {
      zip.file(`image_${index}.${imageFormat}`, image.blob);
    });
  } else {
    zip.file(`image.${imageFormat}`, imageBlobs.blob);
  }

  return await zip.generateAsync({ type: 'blob' });
}

function calculateSplitWidths(minLng, maxLng, width) {
  let westRange, eastRange, totalRange;

  // calculate split widths
  if (minLng > 0) {
    eastRange = 180 - minLng;
    westRange = maxLng - 180;
    totalRange = westRange + eastRange;
  } else {
    eastRange = Math.abs(minLng + 180);
    westRange = Math.abs(180 + maxLng);
    totalRange = westRange + eastRange;
  }

  const westWidth = Math.floor((westRange / totalRange) * width);
  const eastWidth = Math.floor((eastRange / totalRange) * width);

  return { westWidth, eastWidth };
}

function getSeparateBoundsAndPolygonsIfCrossingAntimeridian(bounds, width, geometry = null) {
  const minLng = bounds.getWest();
  const maxLng = bounds.getEast();
  const minLat = bounds.getSouth();
  const maxLat = bounds.getNorth();

  if ((maxLng > 180 && minLng > 180) || (maxLng < -180 && maxLng < -180)) {
    return [];
  }

  let westPolygons = [];
  let eastPolygons = [];
  let hasWestMultiPolygons = false;
  let hasEastMultiPolygons = false;

  function setWestAndEastPolygons(eastPolygon, westPolygon) {
    if (westPolygon.length > 0) {
      // is MultiPolygon
      if (westPolygons.length === 1) {
        westPolygons = [[westPolygons[0]], [westPolygon]];
        hasWestMultiPolygons = true;
      } else if (westPolygons.length >= 2) {
        westPolygons.push([westPolygon]);
      } else {
        westPolygons.push(westPolygon);
      }
    }

    if (eastPolygon.length > 0) {
      // is MultiPolygon
      if (eastPolygons.length === 1) {
        eastPolygons = [[eastPolygons[0]], [eastPolygon]];
        hasEastMultiPolygons = true;
      } else if (eastPolygons.length >= 2) {
        eastPolygons.push([eastPolygon]);
      } else {
        eastPolygons.push(eastPolygon);
      }
    }
  }

  if (maxLng > 180 || minLng < -180) {
    const boxEast = L.latLngBounds(L.latLng(minLat, normalizeLongitude(minLng)), L.latLng(maxLat, 180));

    const boxWest = L.latLngBounds(L.latLng(minLat, -180), L.latLng(maxLat, normalizeLongitude(maxLng)));

    const { westWidth, eastWidth } = calculateSplitWidths(minLng, maxLng, width);

    geometry?.coordinates.forEach((ring) => {
      if (geometry.type === 'MultiPolygon') {
        ring.forEach((coordinate) => {
          const { eastPolygon, westPolygon } = splitPolygonOnAntimeridian(coordinate);

          setWestAndEastPolygons(eastPolygon, westPolygon);
        });
      } else {
        const { eastPolygon, westPolygon } = splitPolygonOnAntimeridian(ring);
        setWestAndEastPolygons(eastPolygon, westPolygon);
      }
    });

    return [
      {
        bounds: boxEast,
        width: eastWidth,
        coordinates: eastPolygons,
        hasMultiPolygons: hasEastMultiPolygons,
      },
      {
        bounds: boxWest,
        width: westWidth,
        coordinates: westPolygons,
        hasMultiPolygons: hasWestMultiPolygons,
      },
    ];
  } else {
    return [];
  }
}

export async function mergeFetchedImages(blobArray) {
  return new Promise((resolve, reject) => {
    const images = [];
    let loadedImages = 0;

    blobArray.forEach((blob, index) => {
      const img = new Image();
      img.src = window.URL.createObjectURL(blob);
      images.push(img);

      img.onload = function () {
        loadedImages++;
        if (loadedImages === blobArray.length) {
          resolve(mergeImages(images));
        }
      };
      img.onerror = () => reject(new Error(`Failed to load image at index ${index}`));
    });
  });

  function mergeImages(images) {
    const totalWidth = images.reduce((sum, img) => sum + img.width, 0);
    const maxHeight = Math.max(...images.map((img) => img.height));

    const canvas = document.createElement('canvas');
    canvas.width = totalWidth;
    canvas.height = maxHeight;

    const ctx = canvas.getContext('2d');

    let currentX = 0;
    images.forEach((img) => {
      ctx.drawImage(img, currentX, 0);
      currentX += img.width;
    });

    return new Promise((resolve) => {
      canvas.toBlob(function (mergedBlob) {
        resolve(mergedBlob);
      });
    });
  }
}

/**
 * Adjusts clipping coordinates proportionally to the Area of Interest (AOI).
 */

export const adjustClippingForAoi = (clipping, aoiBounds, mapBounds) => {
  const { _southWest: aoiSW, _northEast: aoiNE } = aoiBounds;
  const { _southWest: mapSW, _northEast: mapNE } = mapBounds;

  const mapWidth = mapNE.lng - mapSW.lng;

  const aoiStartX = (aoiSW.lng - mapSW.lng) / mapWidth;
  const aoiEndX = (aoiNE.lng - mapSW.lng) / mapWidth;

  const adjustedClipping = clipping.map(([start, end]) => {
    let startAdjustedX = (start - aoiStartX) / (aoiEndX - aoiStartX);
    let endAdjustedX = (end - aoiStartX) / (aoiEndX - aoiStartX);

    startAdjustedX = Math.max(0, Math.min(1, startAdjustedX));
    endAdjustedX = Math.max(0, Math.min(1, endAdjustedX));

    startAdjustedX = parseFloat(startAdjustedX.toFixed(2));
    endAdjustedX = parseFloat(endAdjustedX.toFixed(2));
    return [startAdjustedX, endAdjustedX];
  });

  return adjustedClipping;
};

export function isKMZ(imageFormat) {
  return imageFormat === IMAGE_FORMATS.KMZ_JPG || imageFormat === IMAGE_FORMATS.KMZ_PNG;
}

export function isJPGorPNG(imageFormat) {
  return imageFormat === IMAGE_FORMATS.JPG || imageFormat === IMAGE_FORMATS.PNG;
}
