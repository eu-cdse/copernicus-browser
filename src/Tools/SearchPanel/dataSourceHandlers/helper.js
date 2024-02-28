import { getDataSourceHandler } from './dataSourceHandlers';

export const DEFAULT_ZOOM_CONFIGURATION = {
  min: undefined,
  max: undefined,
};

export const DEFAULT_TILES_SIZE_CONFIG = 512;

export const getZoomConfiguration = (datasetId) => {
  try {
    const dataSourceHandler = getDataSourceHandler(datasetId);
    const zoomConfiguration = dataSourceHandler.getLeafletZoomConfig(datasetId);
    return zoomConfiguration ? zoomConfiguration : DEFAULT_ZOOM_CONFIGURATION;
  } catch (e) {
    // this catches a race condition where datasetId is not defined when rendering the component
    return DEFAULT_ZOOM_CONFIGURATION;
  }
};

export const getTileSizeConfiguration = (datasetId) => {
  try {
    const dataSourceHandler = getDataSourceHandler(datasetId);
    const tileSize = dataSourceHandler.getLeafletTileSizeConfig(datasetId);
    return tileSize ? tileSize : DEFAULT_TILES_SIZE_CONFIG;
  } catch (e) {
    // this catches a race condition where datasetId is not defined when rendering the component
    return DEFAULT_TILES_SIZE_CONFIG;
  }
};
