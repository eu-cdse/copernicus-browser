import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Geometry } from 'geojson';
import type { LatLngBounds } from 'leaflet';

export interface AoiState {
  geometry: Geometry | null;
  bounds: LatLngBounds | null;
  lastEdited: string | null;
  isPlacingVertex: boolean;
  isDrawing: boolean;
  shape: string | null;
  editMode: boolean;
  clearMap: boolean;
}

interface SetAoiPayload {
  geometry: Geometry | null;
  bounds: LatLngBounds | null;
  isPlacingVertex?: boolean;
}

interface StartDrawingPayload {
  isDrawing: boolean;
  shape?: string | null;
  isPlacingVertex?: boolean;
}

const initialState: AoiState = {
  geometry: null,
  bounds: null,
  lastEdited: null,
  isPlacingVertex: false,
  isDrawing: false,
  shape: null,
  editMode: false,
  clearMap: false,
};

export const aoiSlice = createSlice({
  name: 'aoi',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<SetAoiPayload>) => {
      state.geometry = action.payload.geometry;
      state.bounds = action.payload.bounds;
      state.lastEdited = new Date().toISOString();
      state.isPlacingVertex = action.payload.isPlacingVertex ?? false;
    },
    setisPlacingVertex: (state, action: PayloadAction<boolean>) => {
      state.isPlacingVertex = action.payload;
    },
    reset: (state) => {
      state.geometry = null;
      state.bounds = null;
      state.lastEdited = new Date().toISOString();
      state.isDrawing = false;
      state.shape = null;
      state.isPlacingVertex = false;
      state.editMode = false;
      state.clearMap = false;
    },
    startDrawing: (state, action: PayloadAction<StartDrawingPayload>) => {
      state.isDrawing = action.payload.isDrawing;
      state.shape = action.payload.shape ?? null;
      state.isPlacingVertex = action.payload.isPlacingVertex ?? false;
    },
    clearMap: (state, action: PayloadAction<boolean>) => {
      state.clearMap = action.payload;
    },
    setEditMode: (state, action: PayloadAction<boolean>) => {
      state.editMode = action.payload;
    },
  },
});
