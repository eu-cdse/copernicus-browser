import { createSlice, PayloadAction } from '@reduxjs/toolkit';

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
});
