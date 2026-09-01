import { getDataSourceHandler } from './dataSourceHandlers';
import { DEFAULT_COMPARED_LAYERS_MAX_ZOOM, DEFAULT_COMPARED_LAYERS_OVERZOOM } from '../../../Map/const';

export const DEFAULT_ZOOM_CONFIGURATION = {
  min: undefined,
  max: undefined,
};

export const DEFAULT_TILES_SIZE_CONFIG = 512;

export const getZoomConfiguration = (datasetId, layerId) => {
  try {
    const dataSourceHandler = getDataSourceHandler(datasetId);
    const zoomConfiguration = dataSourceHandler.getLeafletZoomConfig(datasetId, layerId);
    return zoomConfiguration ? zoomConfiguration : DEFAULT_ZOOM_CONFIGURATION;
  } catch (e) {
    // this catches a race condition where datasetId is not defined when rendering the component
    return DEFAULT_ZOOM_CONFIGURATION;
  }
};

// Zoom configuration for a COMPARED layer, with the compare-specific fallbacks already applied.
// Not every data source handler declares a max (DEM, for one), and the fallback has to resolve
// identically everywhere it is read: the map's own ceiling is computed from these values (see
// getMapMaxZoom in src/Map/Map.utils.ts) and then pinned on the map, so if the ceiling and the
// layer disagree the user can zoom to a level the layer will not render.
export const getComparedLayerZoomConfiguration = (datasetId, layerId) => {
  const {
    min,
    max = DEFAULT_COMPARED_LAYERS_MAX_ZOOM,
    allowOverZoomBy = DEFAULT_COMPARED_LAYERS_OVERZOOM,
  } = getZoomConfiguration(datasetId, layerId);
  return { min, max, allowOverZoomBy };
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
