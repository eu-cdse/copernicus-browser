import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';

import { COMPARE_OPTIONS } from '../../const';

export type CompareMode = { value: string; label: () => string };

// TODO: replace with a typed Layer/Pin interface once one is defined
// The compared layer shape is currently untyped across the codebase; a dedicated interface is out of scope for this MR.
export type CompareLayerItem = Record<string, unknown> & { id: string };

export interface CompareLayersState {
  compareShare: boolean | null;
  compareSharedPinsId: string | null;
  compareMode: CompareMode;
  comparedLayers: CompareLayerItem[];
  comparedOpacity: number[];
  comparedClipping: [number, number][];
  newCompareLayersCount: number;
}

interface UpdateOpacityPayload {
  index: number;
  value: number;
}

interface UpdateClippingPayload {
  index: number;
  value: [number, number];
}

interface UpdateOrderPayload {
  oldIndex: number;
  newIndex: number;
}

interface RestoreComparedLayersPayload {
  compareShare: boolean | null;
  compareSharedPinsId: string | null;
  layers: Record<string, unknown>[];
  compareMode: CompareMode;
  comparedOpacity: number[];
  comparedClipping: [number, number][];
}

const initialState: CompareLayersState = {
  compareShare: null,
  compareSharedPinsId: null,
  compareMode: COMPARE_OPTIONS.COMPARE_SPLIT,
  comparedLayers: [],
  comparedOpacity: [],
  comparedClipping: [],
  newCompareLayersCount: 0,
};

export const compareLayersSlice = createSlice({
  name: 'compare',
  initialState,
  reducers: {
    addToCompare: (state, action: PayloadAction<Record<string, unknown>>) => {
      const newLayer = { id: uuid(), ...action.payload };
      state.comparedLayers = [newLayer, ...state.comparedLayers];
      state.newCompareLayersCount = state.newCompareLayersCount + 1;
      state.comparedOpacity = [1.0, ...state.comparedOpacity];
      state.comparedClipping = [[0, 1], ...state.comparedClipping];
    },
    setCompareShare: (state, action: PayloadAction<boolean | null>) => {
      state.compareShare = action.payload;
    },
    setCompareSharedPinsId: (state, action: PayloadAction<string | null>) => {
      state.compareSharedPinsId = action.payload;
    },
    setCompareMode: (state, action: PayloadAction<CompareMode>) => {
      state.compareMode = action.payload;
    },
    resetComparedLayers: (state) => {
      state.comparedLayers = [];
      state.comparedOpacity = [];
      state.comparedClipping = [];
    },
    addComparedLayers: (state, action: PayloadAction<Record<string, unknown>[]>) => {
      const layers = action.payload.map((l) => ({ id: uuid(), ...l }));
      state.comparedLayers = [...layers, ...state.comparedLayers];
      state.comparedOpacity = [...new Array(action.payload.length).fill(1.0), ...state.comparedOpacity];
      state.comparedClipping = [...new Array(action.payload.length).fill([0, 1]), ...state.comparedClipping];
    },
    setNewCompareLayersCount: (state, action: PayloadAction<number>) => {
      state.newCompareLayersCount = action.payload;
    },
    updateOpacity: (state, action: PayloadAction<UpdateOpacityPayload>) => {
      const { index, value } = action.payload;
      const newState = [...state.comparedOpacity];
      newState[index] = value;
      state.comparedOpacity = newState;
    },
    updateClipping: (state, action: PayloadAction<UpdateClippingPayload>) => {
      const { index, value } = action.payload;
      const newState = [...state.comparedClipping];
      newState[index] = value;
      state.comparedClipping = newState;
    },
    resetOpacityAndClipping: (state) => {
      state.comparedOpacity = new Array(state.comparedLayers.length).fill(1.0);
      state.comparedClipping = new Array(state.comparedLayers.length).fill([0, 1]);
    },
    updateOrder: (state, action: PayloadAction<UpdateOrderPayload>) => {
      const { oldIndex, newIndex } = action.payload;

      const newComparedLayers = [...state.comparedLayers];
      const layer = newComparedLayers.splice(oldIndex, 1)[0];
      newComparedLayers.splice(newIndex, 0, layer);
      state.comparedLayers = newComparedLayers;

      const newComparedOpacity = [...state.comparedOpacity];
      const opacity = newComparedOpacity.splice(oldIndex, 1)[0];
      newComparedOpacity.splice(newIndex, 0, opacity);
      state.comparedOpacity = newComparedOpacity;

      const newComparedClipping = [...state.comparedClipping];
      const clipping = newComparedClipping.splice(oldIndex, 1)[0];
      newComparedClipping.splice(newIndex, 0, clipping);
      state.comparedClipping = newComparedClipping;
    },
    removeFromCompare: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const newComparedLayers = [...state.comparedLayers];
      newComparedLayers.splice(index, 1);
      state.comparedLayers = newComparedLayers;

      const newComparedOpacity = [...state.comparedOpacity];
      newComparedOpacity.splice(index, 1);
      state.comparedOpacity = newComparedOpacity;

      const newComparedClipping = [...state.comparedClipping];
      newComparedClipping.splice(index, 1);
      state.comparedClipping = newComparedClipping;
    },
    // Intentionally resets compareShare and compareSharedPinsId (previously left untouched) — no callers today.
    reset: () => initialState,
    restoreComparedLayers: (state, action: PayloadAction<RestoreComparedLayersPayload>) => {
      state.compareShare = action.payload.compareShare;
      state.compareSharedPinsId = action.payload.compareSharedPinsId;
      state.comparedLayers = action.payload.layers.map((l) => ({ id: uuid(), ...l }));
      state.compareMode = action.payload.compareMode;
      state.comparedOpacity = action.payload.comparedOpacity;
      state.comparedClipping = action.payload.comparedClipping;
    },
  },
});
