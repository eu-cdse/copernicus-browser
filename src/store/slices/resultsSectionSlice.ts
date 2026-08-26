import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Geometry } from 'geojson';

import type { RRDFeature } from '../../api/RRD/result.utils';
import {
  getResultsSectionFilterDefaultValue,
  ResultsSectionSortProperties,
} from '../../Tools/RapidResponseDesk/rapidResponseProperties';

type ResultsSectionSortState = (results: RRDFeature[]) => RRDFeature[];

export interface QuicklookImage {
  url: string;
  isFallback: boolean;
}

// Shape produced by RRDQueryBuilder.createSearchRequestBody() (one entry per search timespan).
export interface RRDSearchRequestBody {
  collections: number[];
  filter: { op: string; args: unknown[] };
  intersects: Geometry;
  datetime: string;
}

// TODO: replace with dedicated RRD cart-response interface once the RapidResponseDesk cart
// response shape is typed; out of scope for this single-slice extraction.
export interface ResultsSectionState {
  filtersForSearch: (RRDSearchRequestBody | null)[] | undefined;
  sortState: ResultsSectionSortState;
  filterState: string;
  results: RRDFeature[] | undefined;
  highlightedResult: string | undefined;
  cartResults: Record<string, unknown> | undefined;
  currentPage: number;
  quicklookImages: Record<string, QuicklookImage>;
}

const initialState: ResultsSectionState = {
  filtersForSearch: undefined,
  sortState: ResultsSectionSortProperties[0].value,
  filterState: getResultsSectionFilterDefaultValue(),
  results: undefined,
  highlightedResult: undefined,
  cartResults: undefined,
  currentPage: 1,
  quicklookImages: {},
};

export const resultsSectionSlice = createSlice({
  name: 'resultsSection',
  initialState,
  reducers: {
    setFiltersForSearch: (state, action: PayloadAction<(RRDSearchRequestBody | null)[] | undefined>) => {
      state.filtersForSearch = action.payload;
    },
    setSortState: (state, action: PayloadAction<ResultsSectionSortState>) => {
      state.sortState = action.payload;
    },
    setFilterState: (state, action: PayloadAction<string>) => {
      state.filterState = action.payload;
    },
    setResults: (state, action: PayloadAction<RRDFeature[] | undefined>) => {
      state.results = action.payload;
    },
    setHighlightedResult: (state, action: PayloadAction<string | undefined>) => {
      state.highlightedResult = action.payload;
    },
    setCartResults: (state, action: PayloadAction<Record<string, unknown> | undefined>) => {
      state.cartResults = action.payload;
    },
    setCurrentPage: (state, action: PayloadAction<number>) => {
      state.currentPage = action.payload;
    },
    addQuicklookImage: (state, action: PayloadAction<{ id: string; url: string; isFallback: boolean }>) => {
      const { id, url, isFallback } = action.payload;
      state.quicklookImages[id] = { url, isFallback };
    },
  },
});
