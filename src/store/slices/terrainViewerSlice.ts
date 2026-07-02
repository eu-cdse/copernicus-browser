import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface TerrainViewerSettings {
  x: number;
  y: number;
  z: number;
  rotH: number;
  rotV: number;
  sunTime?: number;
  // TODO: replace unknown with a typed shape once the third-party 3D-viewer global API is typed
  settings?: unknown;
}

export interface TerrainViewerState {
  settings: TerrainViewerSettings | null;
  id: string | number | null;
}

const initialState: TerrainViewerState = {
  settings: null,
  id: null,
};

export const terrainViewerSlice = createSlice({
  name: 'terrainViewer',
  initialState,
  reducers: {
    setTerrainViewerSettings: (state, action: PayloadAction<TerrainViewerSettings>) => {
      state.settings = action.payload;
    },
    resetTerrainViewerSettings: (state) => {
      state.settings = null;
    },
    setTerrainViewerId: (state, action: PayloadAction<string | number | null>) => {
      state.id = action.payload;
    },
    reset: () => initialState,
  },
});
