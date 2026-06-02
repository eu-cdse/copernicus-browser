import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import type { Geometry } from 'geojson';
import type { LatLngBounds, Bounds } from 'leaflet';
import { DEFAULT_LAT_LNG, DEFAULT_ZOOM } from '../../const';
import { getInitialBaseLayerId } from '../../Map/Layers';

interface QuicklookAsset {
  href?: string;
  type?: string;
}

interface QuicklookOverlay {
  _internalId: string;
  bbox?: [number, number, number, number];
  geometry?: Geometry;
  source?: string;
  assets?: {
    quicklook?: QuicklookAsset;
    'quicklook-png'?: QuicklookAsset;
    thumbnail?: QuicklookAsset;
  };
  imageUrl?: string;
  imageType?: string;
  isTaskingEnabled?: boolean;
}

export interface MainMapState {
  lat: number;
  lng: number;
  zoom: number;
  baseLayerId: string;
  enabledOverlaysId: string[];
  is3D: boolean;
  loadingMessage: string | null;
  quicklookOverlays: QuicklookOverlay[];
  filteredQuicklookOverlays: QuicklookOverlay[];
  bounds: LatLngBounds | null;
  pixelBounds: Bounds | null;
}

interface SetPositionPayload {
  lat?: number;
  lng?: number;
  zoom?: number;
}

interface SetViewportPayload {
  center: [number, number];
  zoom: number;
}

interface SetBoundsPayload {
  bounds: LatLngBounds;
  pixelBounds: Bounds;
}

const initialState: MainMapState = {
  lat: DEFAULT_LAT_LNG.lat,
  lng: DEFAULT_LAT_LNG.lng,
  zoom: DEFAULT_ZOOM,
  baseLayerId: getInitialBaseLayerId() ?? '',
  enabledOverlaysId: ['labels'],
  is3D: false,
  loadingMessage: null,
  quicklookOverlays: [],
  filteredQuicklookOverlays: [],
  bounds: null,
  pixelBounds: null,
};

export const mainMapSlice = createSlice({
  name: 'mainMap',
  initialState,
  reducers: {
    setPosition: (state, action: PayloadAction<SetPositionPayload>) => {
      const { lat, lng, zoom } = action.payload;
      if (lat !== undefined && lng !== undefined) {
        state.lat = lat;
        state.lng = lng;
      }
      if (zoom !== undefined) {
        state.zoom = zoom;
      }
    },
    setViewport: (state, action: PayloadAction<SetViewportPayload>) => {
      const {
        center: [lat, lng],
        zoom,
      } = action.payload;
      state.lat = lat;
      state.lng = lng;
      state.zoom = zoom;
    },
    setBounds: (state, action: PayloadAction<SetBoundsPayload>) => {
      const { bounds, pixelBounds } = action.payload;
      state.bounds = bounds;
      state.pixelBounds = pixelBounds;
    },
    setBaseLayerId: (state, action: PayloadAction<string>) => {
      state.baseLayerId = action.payload;
    },
    addOverlay: (state, action: PayloadAction<string>) => {
      state.enabledOverlaysId.push(action.payload);
    },
    removeOverlay: (state, action: PayloadAction<string>) => {
      const overlayIndex = state.enabledOverlaysId.indexOf(action.payload);
      if (overlayIndex !== -1) {
        state.enabledOverlaysId.splice(overlayIndex, 1);
      }
    },
    setIs3D: (state, action: PayloadAction<boolean>) => {
      state.is3D = action.payload;
    },
    setLoadingMessage: (state, action: PayloadAction<string | null>) => {
      state.loadingMessage = action.payload;
    },
    addQuicklookOverlay: (state, action: PayloadAction<QuicklookOverlay>) => {
      if (!state.quicklookOverlays.some((o) => o._internalId === action.payload._internalId)) {
        state.quicklookOverlays.push(action.payload);
      }
    },
    removeQuicklookOverlay: (state, action: PayloadAction<string>) => {
      state.quicklookOverlays = state.quicklookOverlays.filter((o) => o._internalId !== action.payload);
    },
    clearQuicklookOverlays: (state) => {
      state.quicklookOverlays = [];
    },
    setFilteredQuicklookOverlays: (state, action: PayloadAction<QuicklookOverlay[]>) => {
      state.filteredQuicklookOverlays = action.payload;
    },
    clearFilteredQuicklookOverlays: (state) => {
      state.filteredQuicklookOverlays = [];
    },
    reset: (_state) => initialState,
  },
});
