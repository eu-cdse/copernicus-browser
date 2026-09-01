import styles from '../variables.module.scss';
import { COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { MimeTypes } from '@sentinel-hub/sentinelhub-js';

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
export const EXTERNAL_LAYER_PANE_ID = 'externalLayerPane';
export const EXTERNAL_LAYER_PANE_ZINDEX = 6; // same z-index as SH pane; mutually exclusive with it
export const COMPARE_LAYER_PANE_ID = 'compareLayerPane';
export const COMPARE_LAYER_PANE_ZINDEX = 6;

// External (WMS/WMTS) layer max zoom. Without an explicit value Leaflet's GridLayer default
// of 18 would silently cap how far external layers can be zoomed in.
export const DEFAULT_EXTERNAL_LAYER_MAX_ZOOM = 20;

// Compare layers defaults. Applies to any compared dataset whose data source handler does not
// declare its own max (e.g. DEM) — keep separate from the external-layer limit above so changing
// one does not silently move the other.
export const DEFAULT_COMPARED_LAYERS_MAX_ZOOM = 25;
export const DEFAULT_COMPARED_LAYERS_OVERZOOM = 0;

// GISCO's OSM tile services (OSMCartoBackground / OSMCartoLabelsEN / OSMCartoCompositeEN) only
// serve tiles up to z18 — z19+ returns 404. Both options below are required together:
//   - maxNativeZoom stops the layer requesting tiles that don't exist and upscales the z18 tile.
//   - maxZoom keeps the layer alive above z18. Without it L.TileLayer's own default of 18 applies,
//     and GridLayer._setView sets tileZoom = undefined whenever tileZoom > maxZoom, which drops
//     every tile — the white background this fixes. maxNativeZoom is only consulted after that
//     check passes, so setting it alone changes nothing.
export const OSM_MAX_NATIVE_ZOOM = 18;
// Matched to the highest ceiling the map can reach (compared layers), so the OSM background never
// blanks out under any layer combination. See the Leaflet max-zoom note in Map.utils.ts: the map's
// ceiling is the MAXIMUM over all zoom-bound layers, so this also lets an OSM-only map zoom past
// z18 on upscaled tiles instead of stopping at 18.
export const OSM_LAYER_MAX_ZOOM = DEFAULT_COMPARED_LAYERS_MAX_ZOOM;

// S2 Quarterly Mosaic
export const S2_QUARTERLY_MOSAIC_DATASET_ID = COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC;
export const S2_QUARTERLY_MOSAIC_LAYER_ID = 'TRUE-COLOR-CLOUDLESS';

// Map loading
export const MAX_MAP_LOADING_TIME = 5 * 1000;
export const TILE_REQUEST_DEBOUNCE_MS = 300;
export const SERVER_ERROR_THRESHOLD = 3;

// MimeTypes key used as the format prop for SH Processing API tile layers (resolved via MimeTypes[format] in sentinelhubLeafletLayer)
export const VISUALIZATION_TILE_FORMAT: keyof typeof MimeTypes = 'WEBP';
export const FALLBACK_TILE_FORMAT: keyof typeof MimeTypes = 'PNG';

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
