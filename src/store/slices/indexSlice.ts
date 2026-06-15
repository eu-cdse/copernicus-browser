import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface IndexState {
  handlePositions: number[] | null;
  gradient: string[] | null;
}

const initialState: IndexState = {
  handlePositions: null,
  gradient: null,
};

export const indexSlice = createSlice({
  name: 'index',
  initialState,
  reducers: {
    setHandlePositions: (state, action: PayloadAction<number[]>) => {
      state.handlePositions = action.payload;
    },
    setGradient: (state, action: PayloadAction<string[]>) => {
      state.gradient = action.payload;
    },
    reset: () => initialState,
  },
});
