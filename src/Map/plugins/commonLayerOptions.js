export function getCommonLayerOptions(params) {
  const options = {};

  if (params.datasetId) {
    options.datasetId = params.datasetId;
  }

  if (params.toTime) {
    options.toTime = params.toTime;
  }

  if (params.pane) {
    options.pane = params.pane;
  }

  if (params.minZoom) {
    options.minZoom = params.minZoom;
  }

  if (params.maxZoom && params.allowOverZoomBy) {
    options.maxNativeZoom = params.maxZoom;
    options.maxZoom = params.maxZoom + params.allowOverZoomBy;
  } else if (params.maxZoom) {
    options.maxNativeZoom = params.maxZoom;
    options.maxZoom = params.maxZoom;
  }

  options.minQa = params.minQa ?? null;
  options.mosaickingOrder = params.mosaickingOrder ?? null;
  options.upsampling = params.upsampling ?? null;
  options.downsampling = params.downsampling ?? null;
  options.speckleFilter = params.speckleFilter ?? null;
  options.orthorectification = params.orthorectification ?? null;
  options.backscatterCoeff = params.backscatterCoeff ?? null;
  options.orbitDirection = params.orbitDirection ?? null;

  if (params.getMapAuthToken) {
    options.getMapAuthToken = params.getMapAuthToken;
  }

  if (params.onTileImageError) {
    options.onTileImageError = params.onTileImageError;
  }

  if (params.onTileImageLoad) {
    options.onTileImageLoad = params.onTileImageLoad;
  }

  return options;
}
