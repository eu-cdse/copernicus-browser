import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TABS } from '../../const';

interface TabsState {
  selectedTabIndex: (typeof TABS)[keyof typeof TABS];
  scrollTop: number | null;
  // True while a Sentinel Hub layer is being visualized (the Layers or Highlights panel is active).
  // Mirrors App.jsx's mutually-exclusive panel state into Redux so map controls (the AOI/POI
  // Spectral Explorer, Statistical Info and Histogram buttons) can disable themselves outside those
  // panels (Compare, Pin, external WMS/WMTS).
  isVisualizingLayer: boolean;
}

const initialState: TabsState = {
  selectedTabIndex: TABS.VISUALIZE_TAB,
  scrollTop: null,
  // Defaults to false (buttons gated on it start disabled) until App's mount dispatch sets the real
  // value from the active panels, so they can't briefly appear enabled before that runs.
  isVisualizingLayer: false,
};

export const tabsSlice = createSlice({
  name: 'tabs',
  initialState,
  reducers: {
    setTabIndex: (state, action: PayloadAction<TabsState['selectedTabIndex']>) => {
      state.selectedTabIndex = action.payload;
    },
    setScrollTop: (state, action: PayloadAction<number | null>) => {
      state.scrollTop = action.payload;
    },
    setIsVisualizingLayer: (state, action: PayloadAction<boolean>) => {
      state.isVisualizingLayer = action.payload;
    },
  },
});
