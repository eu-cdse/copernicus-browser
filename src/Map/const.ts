import styles from '../variables.module.scss';
import { COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

const { warningColor } = styles;

// Map pane IDs and z-indices
export const BASE_PANE_ID = 'baseMapPane';
export const BASE_PANE_ZINDEX = 5;
export const BASE_S2_MOSAIC_PANE_ID = 'baseS2MosaicMapPane';
export const BASE_S2_MOSAIC_PANE_ZINDEX = BASE_PANE_ZINDEX;
export const SENTINELHUB_LAYER_PANE_ID = 'sentinelhubPane';
export const SENTINELHUB_LAYER_PANE_ZINDEX = 6;
export const HIGHLIGHT_PANE_ID = 'highlightPane';
export const HIGHLIGHT_PANE_ZINDEX = 500; // above overlayPane (400), below markerPane (600)

// Compare layers defaults
export const DEFAULT_COMPARED_LAYERS_MAX_ZOOM = 25;
export const DEFAULT_COMPARED_LAYERS_OVERZOOM = 0;

// S2 Quarterly Mosaic
export const S2_QUARTERLY_MOSAIC_DATASET_ID = COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC;
export const S2_QUARTERLY_MOSAIC_LAYER_ID = 'TRUE-COLOR-CLOUDLESS';

// Map loading
export const MAX_MAP_LOADING_TIME = 5 * 1000;
export const TILE_REQUEST_DEBOUNCE_MS = 300;

type PathStyle = {
  weight?: number;
  color?: string;
  opacity?: number;
  fillColor?: string;
  fillOpacity?: number;
  dashArray?: string;
};

export const highlightedTileStyle: PathStyle = {
  weight: 2,
  color: '#57de71',
  opacity: 1,
  fillColor: '#57de71',
  fillOpacity: 0.3,
};

// Style for dataset location polygons
export const datasetLocationPolygonStyle: PathStyle = {
  weight: 2,
  color: '#4285f4',
  opacity: 0.8,
  fillColor: '#4285f4',
  fillOpacity: 0.15,
  dashArray: '5, 5',
};

// Style for AOI (Area of Interest) polygons
export const aoiStyle: PathStyle = {
  color: warningColor,
  weight: 3,
  opacity: 1,
  fillColor: warningColor,
  fillOpacity: 0.2,
};

// Style for LOI (Line of Interest)
export const loiStyle: PathStyle = {
  color: warningColor,
  weight: 3,
  opacity: 1,
};
