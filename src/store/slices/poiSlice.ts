import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Geometry } from 'geojson';
import type { LatLng, LatLngBounds } from 'leaflet';

export interface PoiState {
  position: LatLng | null;
  geometry: Geometry | null;
  bounds: LatLngBounds | null;
  lastEdited: string | null;
}

interface SetPoiPayload {
  position: LatLng;
  geometry: Geometry;
  bounds: LatLngBounds;
}

const initialState: PoiState = {
  position: null,
  geometry: null,
  bounds: null,
  lastEdited: null,
};

export const poiSlice = createSlice({
  name: 'poi',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<SetPoiPayload>) => {
      state.position = action.payload.position;
      state.geometry = action.payload.geometry;
      state.bounds = action.payload.bounds;
      state.lastEdited = new Date().toISOString();
    },
    reset: (state) => {
      state.position = null;
      state.geometry = null;
      state.bounds = null;
      // Bump lastEdited so the map marker is force-remounted on reset.
      state.lastEdited = new Date().toISOString();
    },
  },
});
