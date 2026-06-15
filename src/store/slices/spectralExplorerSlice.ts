import { createSlice, PayloadAction } from '@reduxjs/toolkit';

export interface SpectralExplorerState {
  selectedSeries: Record<string, string[]>;
}

interface SetSelectedSeriesPayload {
  datasetId: string;
  series: string[];
}

const initialState: SpectralExplorerState = {
  selectedSeries: {},
};

export const spectralExplorerSlice = createSlice({
  name: 'spectralExplorer',
  initialState,
  reducers: {
    setSelectedSeries: (state, action: PayloadAction<SetSelectedSeriesPayload>) => {
      const { datasetId, series } = action.payload;
      state.selectedSeries[datasetId] = series;
    },
    reset: (state) => {
      state.selectedSeries = {};
    },
  },
});
