import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Geometry } from 'geojson';
import type { LatLngBounds } from 'leaflet';

export interface LoiState {
  geometry: Geometry | null;
  bounds: LatLngBounds | null;
  lastEdited: string | null;
}

interface SetLoiPayload {
  geometry: Geometry;
  bounds: LatLngBounds;
}

const initialState: LoiState = {
  geometry: null,
  bounds: null,
  lastEdited: null,
};

export const loiSlice = createSlice({
  name: 'loi',
  initialState,
  reducers: {
    set: (state, action: PayloadAction<SetLoiPayload>) => {
      state.geometry = action.payload.geometry;
      state.bounds = action.payload.bounds;
      state.lastEdited = new Date().toISOString();
    },
    reset: (state) => {
      state.geometry = null;
      state.bounds = null;
      state.lastEdited = null;
    },
  },
});
