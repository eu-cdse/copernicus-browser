import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import moment, { Moment, DurationInputArg2 } from 'moment';

export type TimelapseSize = { width: number; height: number; ratio: number };

export interface TimelapseState {
  displayTimelapseAreaPreview: boolean;
  fromTime: Moment | null;
  toTime: Moment | null;
  filterMonths: number[] | null;
  selectedPeriod: string;
  minCoverageAllowed: number;
  maxCCPercentAllowed: number | null;
  isSelectAllChecked: boolean;
  showBorders: boolean;
  timelapseFPS: number;
  transition: 'none' | 'fade';
  // TODO: replace unknown[] with a typed Pin interface once it is defined
  pins: unknown[];
  timelapseSharePreviewMode: boolean;
  previewFileUrl: string | null;
  size: TimelapseSize | null;
  format: 'GIF' | 'MPEG4';
  fadeDuration: number;
  delayLastFrame: boolean;
  newLayersCount: number;
}

interface SetTimelapsePayload {
  displayTimelapseAreaPreview?: boolean;
  fromTime?: string | Moment | null;
  toTime?: string | Moment | null;
  filterMonths?: number[] | null;
  selectedPeriod?: string;
  minCoverageAllowed?: number;
  maxCCPercentAllowed?: number | null;
  isSelectAllChecked?: boolean;
  showBorders?: boolean;
  timelapseFPS?: number;
  transition?: 'none' | 'fade';
  pins?: unknown[];
  timelapseSharePreviewMode?: boolean;
  previewFileUrl?: string | null;
  size?: TimelapseSize | null;
  format?: 'GIF' | 'MPEG4';
  fadeDuration?: number;
  delayLastFrame?: boolean;
  newLayersCount?: number;
}

interface SetInitialTimePayload {
  time: Moment;
  interval: DurationInputArg2;
}

const initialState: TimelapseState = {
  displayTimelapseAreaPreview: false,
  fromTime: null,
  toTime: null,
  filterMonths: null,
  selectedPeriod: 'day',
  minCoverageAllowed: 0,
  maxCCPercentAllowed: null,
  isSelectAllChecked: true,
  showBorders: false,
  timelapseFPS: 1,
  transition: 'none',
  pins: [],
  timelapseSharePreviewMode: false,
  previewFileUrl: null,
  size: null,
  format: 'GIF',
  fadeDuration: 0.5,
  delayLastFrame: false,
  newLayersCount: 0,
};

export const timelapseSlice = createSlice({
  name: 'timelapse',
  initialState,
  reducers: {
    // TODO: remove once all callers migrate to the typed reducers (setFromTime, setFilterMonths, etc.)
    set: (state, action: PayloadAction<SetTimelapsePayload>) => {
      const payload = action.payload as Record<string, unknown>;
      Object.keys(payload).forEach((key) => {
        const value = payload[key];
        if (['fromTime', 'toTime'].includes(key)) {
          (state as Record<string, unknown>)[key] = moment.isMoment(value)
            ? value
            : moment.utc(value as string);
        } else {
          (state as Record<string, unknown>)[key] = value;
        }
      });
    },
    reset: () => initialState,
    toggleTimelapseAreaPreview: (state) => {
      state.displayTimelapseAreaPreview = !state.displayTimelapseAreaPreview;
    },
    setTimelapseAreaPreview: (state, action: PayloadAction<boolean>) => {
      state.displayTimelapseAreaPreview = action.payload;
    },
    setInitialTime: (state, action: PayloadAction<SetInitialTimePayload>) => {
      state.fromTime = action.payload.time.clone().subtract(1, action.payload.interval);
      state.toTime = action.payload.time.clone();
    },
    setFromTime: (state, action: PayloadAction<Moment | null>) => {
      state.fromTime = action.payload;
    },
    setToTime: (state, action: PayloadAction<Moment | null>) => {
      state.toTime = action.payload;
    },
    setFilterMonths: (state, action: PayloadAction<number[] | null>) => {
      state.filterMonths = action.payload;
    },
    setSelectedPeriod: (state, action: PayloadAction<string>) => {
      state.selectedPeriod = action.payload;
    },
    setMinCoverageAllowed: (state, action: PayloadAction<number>) => {
      state.minCoverageAllowed = action.payload;
    },
    setMaxCCPercentAllowed: (state, action: PayloadAction<number | null>) => {
      state.maxCCPercentAllowed = action.payload;
    },
    setIsSelectAllChecked: (state, action: PayloadAction<boolean>) => {
      state.isSelectAllChecked = action.payload;
    },
    setShowBorders: (state, action: PayloadAction<boolean>) => {
      state.showBorders = action.payload;
    },
    setTimelapseSharePreviewMode: (state, action: PayloadAction<boolean>) => {
      state.timelapseSharePreviewMode = action.payload;
    },
    setPreviewFileUrl: (state, action: PayloadAction<string | null>) => {
      state.previewFileUrl = action.payload;
    },
    setTimelapseFPS: (state, action: PayloadAction<number>) => {
      state.timelapseFPS = action.payload;
    },
    setTransition: (state, action: PayloadAction<'none' | 'fade'>) => {
      state.transition = action.payload;
    },
    addPin: (state, action: PayloadAction<unknown>) => {
      state.pins.push(action.payload);
      state.newLayersCount = state.newLayersCount + 1;
    },
    removePin: (state, action: PayloadAction<number>) => {
      if (action.payload > -1) {
        state.pins = state.pins.filter((_, i) => i !== action.payload);
      }
    },
    setSize: (state, action: PayloadAction<TimelapseSize | null>) => {
      state.size = action.payload;
    },
    setFormat: (state, action: PayloadAction<'GIF' | 'MPEG4'>) => {
      state.format = action.payload;
    },
    setFadeDuration: (state, action: PayloadAction<number>) => {
      state.fadeDuration = action.payload;
    },
    setDelayLastFrame: (state, action: PayloadAction<boolean>) => {
      state.delayLastFrame = action.payload;
    },
    setNewLayersCount: (state, action: PayloadAction<number>) => {
      state.newLayersCount = action.payload;
    },
  },
});
