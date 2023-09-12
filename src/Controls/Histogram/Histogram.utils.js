import { t } from 'ttag';
import { fromBlob } from 'geotiff';
import { LayersFactory, ApiType, BBox } from '@sentinel-hub/sentinelhub-js';

import {
  getMapDimensions,
  getImageDimensionFromBoundsWithCap,
  constructBBoxFromBounds,
} from '../../Controls/ImgDownload/ImageDownload.utils.js';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { constructErrorMessage } from '../../utils';
import { checkIfIndexOutputInEvalscript } from '../../utils/parseEvalscript';
import { reqConfigMemoryCache, MAX_SH_IMAGE_SIZE } from '../../const';
import { refetchWithDefaultToken } from '../../utils/fetching.utils';

export const getMissingIndexOutputError = () =>
  t`The setup function in the evalscript does not contain the correct output. The output needs to include:` +
  `\n\n` +
  `{ id: "index", bands: 1, sampleType: "FLOAT32" }`;

export const getNoIndexLayerOutputError = () =>
  t`You are visualising a layer that doesn't represent an index. The histogram feature currently only works for index layers (e.g. NDVI).\n\n Please select an index layer to use this feature.`;

export async function getLayerName(visualizationUrl, layerId, cancelToken) {
  try {
    let layer = await LayersFactory.makeLayer(visualizationUrl, layerId, null, {
      ...reqConfigMemoryCache,
      cancelToken: cancelToken,
    });
    return layer.title;
  } catch (e) {
    return layerId;
  }
}

// This function receives props for requesting tiff images from Sentinel Hub and returns an array of blobs.
// The width or height may exceed the Sentinel Hub's limit of 2500px.
// In that case, the function calculates the width, height and bboxes for requesting smaller chunks.
// When width and height do not exceed the limit, the function requests 1 image and
// returns an array with 1 element for the sake of consistency.
async function getTiffImages(layer, props, cancelToken) {
  const { bounds, fromTime, toTime, pixelBounds, aoiGeometry, datasetId } = props;

  const { width: defaultWidth, height: defaultHeight } = getImageDimensionFromBoundsWithCap(
    bounds,
    datasetId,
  );
  const originalBBox = constructBBoxFromBounds(bounds);
  let { width, height } = getMapDimensions(pixelBounds);

  // code copied from ImageDownload.js
  if (aoiGeometry) {
    // defaultWidth and defaultHeight are in this case referring to bounds of the geometry
    // We keep one of the map dimensions and scale the other
    const ratio = defaultWidth / defaultHeight;

    if (ratio >= 1) {
      height = Math.floor(width / ratio);
    } else {
      width = Math.floor(ratio * height);
    }
  }

  const getMapParams = {
    fromTime,
    toTime,
    bbox: originalBBox,
    format: 'image/tiff',
    outputResponseId: 'index',
    width: width,
    height: height,
    geometry: aoiGeometry,
  };

  const reqConfig = {
    cancelToken: cancelToken,
    cache: { expiresIn: 0 },
  };

  if (width <= MAX_SH_IMAGE_SIZE && height <= MAX_SH_IMAGE_SIZE) {
    const blob = await refetchWithDefaultToken(
      (reqConfig) => layer.getMap(getMapParams, ApiType.PROCESSING, reqConfig),
      reqConfig,
    );
    return [blob];
  }

  let blobPromises = [];

  const xSplitBy = Math.ceil(width / MAX_SH_IMAGE_SIZE);
  const chunkWidth = Math.ceil(width / xSplitBy);
  const ySplitBy = Math.ceil(height / MAX_SH_IMAGE_SIZE);
  const chunkHeight = Math.ceil(height / ySplitBy);

  const { minX: lng0, minY: lat0, maxX: lng1, maxY: lat1 } = originalBBox;
  const xToLng = (x) => Math.min(lng0, lng1) + (x / width) * Math.abs(lng1 - lng0);
  const yToLat = (y) => Math.max(lat0, lat1) - (y / height) * Math.abs(lat1 - lat0);

  for (let x = 0; x < width; x += chunkWidth) {
    const xTo = Math.min(x + chunkWidth, width);
    for (let y = 0; y < height; y += chunkHeight) {
      const yTo = Math.min(y + chunkHeight, height);
      const paramsChunk = {
        ...getMapParams,
        width: xTo - x,
        height: yTo - y,
        bbox: new BBox(originalBBox.crs, xToLng(x), yToLat(yTo), xToLng(xTo), yToLat(y)),
      };
      const blobPromise = refetchWithDefaultToken(
        (reqConfig) => layer.getMap(paramsChunk, ApiType.PROCESSING, reqConfig),
        reqConfig,
      );
      blobPromises.push(blobPromise);
    }
  }

  const resolvedBlobs = await Promise.all(blobPromises);
  return resolvedBlobs;
}

export async function getDataForLayer(props, cancelToken) {
  try {
    const { visualizationUrl, layerId } = props;
    let layer = await LayersFactory.makeLayer(visualizationUrl, layerId, null, {
      cancelToken: cancelToken,
      ...reqConfigMemoryCache,
    });
    await layer.updateLayerFromServiceIfNeeded({ cancelToken: cancelToken, ...reqConfigMemoryCache });
    // add minQa, upsampling, downsampling, but no effects (they are only for visualization)

    const isIndexOutputPresent = checkIfIndexOutputPresent(props);
    if (!isIndexOutputPresent) {
      throw new Error(getNoIndexLayerOutputError());
    }

    const blobs = await getTiffImages(layer, props, cancelToken);
    const histogram = await getHistogramFromTiffs(blobs);
    return { histogram: histogram };
  } catch (e) {
    const errMessage = await constructErrorMessage(e);
    console.error(e);
    return { error: errMessage };
  }
}

export async function getDataForIndex(props, cancelToken) {
  try {
    const { visualizationUrl, datasetId, evalscript } = props;

    const isIndexOutputPresent = checkIfIndexOutputPresent(props);
    if (!isIndexOutputPresent) {
      throw new Error(getMissingIndexOutputError());
    }

    const dsh = getDataSourceHandler(datasetId);
    const shJsDataset = dsh ? dsh.getSentinelHubDataset(datasetId) : null;
    let layers = await LayersFactory.makeLayers(
      visualizationUrl,
      (_, dataset) => (!shJsDataset ? true : dataset.id === shJsDataset.id),
      null,
      { ...reqConfigMemoryCache, cancelToken: cancelToken },
    );
    let layer;
    if (layers.length > 0) {
      layer = layers[0];
      layer.evalscript = evalscript;
    }
    // add minQa, upsampling, downsampling, but no effects (they are only for visualization)

    const blobs = await getTiffImages(layer, props, cancelToken);
    const histogram = await getHistogramFromTiffs(blobs);
    return { histogram: histogram };
  } catch (e) {
    const errMessage = await constructErrorMessage(e);
    console.error(e);
    return { error: errMessage };
  }
}

async function getHistogramFromTiffs(blobs) {
  const numOfDigits = 3;
  let combinedData = [];

  for (const blob of blobs) {
    const tiffData = await fromBlob(blob);
    const imageData = await tiffData.getImage();
    const [data] = await imageData.readRasters();
    combinedData = [...combinedData, ...data];
  }

  let min = Number.POSITIVE_INFINITY;
  let max = Number.NEGATIVE_INFINITY;
  for (let v of combinedData) {
    if (v < min) {
      min = v;
    }
    if (v > max) {
      max = v;
    }
  }

  const nBins = 10000;
  const step = (max - min) / nBins;

  let histogramArray = new Array(nBins);
  for (let i = 0; i < nBins; i++) {
    histogramArray[i] = { value: parseFloat((min + i * step).toFixed(numOfDigits)), occurrences: 0 };
  }

  for (let v of combinedData) {
    if (isNaN(v)) {
      continue;
    }
    let histogramArrayIndex = Math.floor((v - min) / step);
    if (histogramArrayIndex >= nBins) {
      histogramArrayIndex--;
    }
    histogramArray[histogramArrayIndex].occurrences++;
  }

  return histogramArray;
}

export async function checkIfIndexOutputPresent(props, cancelToken) {
  const { customSelected, evalscript, layerId, visualizationUrl } = props;

  if ((!customSelected && !layerId) || (customSelected && !evalscript)) {
    return false;
  }

  if (customSelected) {
    return checkIfIndexOutputInEvalscript(evalscript);
  }

  let layer = null;
  try {
    layer = await LayersFactory.makeLayer(visualizationUrl, layerId, null, {
      cancelToken: cancelToken,
      ...reqConfigMemoryCache,
    });
  } catch (e) {
    return false;
  }

  if (layer.evalscript) {
    return checkIfIndexOutputInEvalscript(layer.evalscript);
  }

  try {
    await layer.updateLayerFromServiceIfNeeded({ ...reqConfigMemoryCache, cancelToken: cancelToken });
    return checkIfIndexOutputInEvalscript(layer.evalscript);
  } catch (e) {
    return false;
  }
}
