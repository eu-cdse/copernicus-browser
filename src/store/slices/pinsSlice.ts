import { createSlice, PayloadAction } from '@reduxjs/toolkit';

// TODO: replace with a typed Pin interface once one is defined
// The raw pin shape is currently untyped across the codebase; a dedicated interface is out of scope for this MR.
export interface PinItem {
  type: string;
  item: Record<string, unknown>; // misnomer - instead of "item" it should be "pin"
  opacity: number;
  clipping: [number, number];
}

export interface PinsState {
  items: PinItem[];
}

interface UpdatePinsByTypePayload {
  pins: Record<string, unknown>[];
  pinType: string;
}

const initialState: PinsState = {
  items: [],
};

export const pinsSlice = createSlice({
  name: 'pins',
  initialState,
  reducers: {
    updateItems: (state, action: PayloadAction<PinItem[]>) => {
      state.items = action.payload;
    },
    updatePinsByType: (state, action: PayloadAction<UpdatePinsByTypePayload>) => {
      const { pins, pinType } = action.payload;
      state.items = [
        // remove any existing pin items of this type:
        ...state.items.filter((item) => item.type !== pinType),
        // add the pin items for each of the pins:
        ...pins.map((pin) => ({
          type: pinType,
          item: pin, // misnomer - instead of "item" it should be "pin"
          opacity: 1.0,
          clipping: [0, 1] as [number, number],
        })),
      ];
    },
    clearByType: (state, action: PayloadAction<string>) => {
      const pinType = action.payload;
      state.items = state.items.filter((item) => item.type !== pinType);
    },
    removeItem: (state, action: PayloadAction<number>) => {
      const index = action.payload;
      const pinItems = [...state.items];
      pinItems.splice(index, 1);
      state.items = pinItems;
    },
    reset: (state) => {
      state.items = initialState.items;
    },
  },
});
