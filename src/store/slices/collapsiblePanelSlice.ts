import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { panelSlice } from './panelSlice';
import { PANEL } from '../../const';

interface CollapsiblePanelState {
  datePanelExpanded: boolean;
  themePanelExpanded: boolean;
  collectionPanelExpanded: boolean;
  highlightsPanelExpanded: boolean;
  areaTimeExpanded: boolean;
  providerExpanded: boolean;
  advancedExpanded: boolean;
  resultsExpanded: boolean;
  projectDetailsExpanded: boolean;
}

const initialState: CollapsiblePanelState = {
  datePanelExpanded: true,
  themePanelExpanded: true,
  collectionPanelExpanded: true,
  highlightsPanelExpanded: true,
  areaTimeExpanded: true,
  providerExpanded: true,
  advancedExpanded: false,
  resultsExpanded: true,
  projectDetailsExpanded: true,
};

export const collapsiblePanelSlice = createSlice({
  name: 'collapsiblePanel',
  initialState,
  reducers: {
    setDatePanelExpanded: (state, action: PayloadAction<boolean>) => {
      state.datePanelExpanded = action.payload;
    },
    setThemePanelExpanded: (state, action: PayloadAction<boolean>) => {
      state.themePanelExpanded = action.payload;
    },
    setCollectionPanelExpanded: (state, action: PayloadAction<boolean>) => {
      state.collectionPanelExpanded = action.payload;
    },
    setHighlightsPanelExpanded: (state, action: PayloadAction<boolean>) => {
      state.highlightsPanelExpanded = action.payload;
    },
    setAreaTimeExpanded: (state, action: PayloadAction<boolean>) => {
      state.areaTimeExpanded = action.payload;
    },
    setProviderExpanded: (state, action: PayloadAction<boolean>) => {
      state.providerExpanded = action.payload;
    },
    setAdvancedExpanded: (state, action: PayloadAction<boolean>) => {
      state.advancedExpanded = action.payload;
    },
    setResultsExpanded: (state, action: PayloadAction<boolean>) => {
      state.resultsExpanded = action.payload;
    },
    setprojectDetailsExpanded: (state, action: PayloadAction<boolean>) => {
      state.projectDetailsExpanded = action.payload;
    },
    setOrderPanels: (state, action: PayloadAction<boolean>) => {
      state.areaTimeExpanded = action.payload;
      state.providerExpanded = action.payload;
      if (!action.payload) {
        state.advancedExpanded = action.payload;
      }
    },
    reset: (_state) => initialState,
  },
  // Data collections (CollectionSelection) renders across all five Visualize sub-panels, so its
  // expanded state has to be driven from one place shared by every caller of panelSlice.openPanel,
  // rather than duplicated at each button handler. Per the finalized rule (issue #1246): Layers and
  // WMS carry the collection-selection content themselves, so opening either always force-expands;
  // Highlights/Pins/Compare don't, so opening any of them always force-collapses — regardless of
  // the previously open panel, including hops between Highlights/Pins/Compare themselves.
  extraReducers: (builder) => {
    builder.addCase(panelSlice.actions.openPanel, (state, action) => {
      state.collectionPanelExpanded = action.payload === PANEL.LAYERS || action.payload === PANEL.WMS;
    });
  },
});
