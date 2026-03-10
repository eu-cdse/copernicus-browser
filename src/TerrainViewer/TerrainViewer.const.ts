export const TERRAIN_VIEWER_IDS = {
  MAIN: 'main-terrain-viewer',
  TIMELAPSE_PREVIEWS: 'timelapse-terrain-viewer-previews',
  TIMELAPSE: 'timelapse-terrain-viewer',
} as const;

export let CURRENT_TERRAIN_VIEWER_ID: string = TERRAIN_VIEWER_IDS.MAIN;

export function setTerrainViewerId(terrainViewerId: string): void {
  CURRENT_TERRAIN_VIEWER_ID = terrainViewerId;
}

export const TIMELAPSE_3D_MIN_EYE_HEIGHT = 50000;

export const DEFAULT_TERRAIN_VIEWER_TEXTURE_SIZE = 512;

export const IS_3D_MODULE_ENABLED = true;
