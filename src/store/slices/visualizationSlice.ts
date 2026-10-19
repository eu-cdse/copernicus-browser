import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { Moment } from 'moment';
import { DEMInstanceType } from '@sentinel-hub/sentinelhub-js';
import { DEFAULT_CLOUD_COVER_PERCENT, DATE_MODES, PROCESSING_OPTIONS } from '../../const';
import { isValidMosaickingOrder } from '../../utils/mosaickingOrder.utils';

export interface VisualizationState {
  fromTime?: Moment | null;
  toTime?: Moment | null;
  datasetId?: string;
  visualizationUrl?: string | null;
  visibleOnMap: boolean;
  layerId?: string;
  customSelected: boolean;
  evalscript?: string;
  evalscriptUrl?: string | null;
  dataFusion: Record<string, unknown>[];
  gainEffect: number;
  gammaEffect: number;
  redRangeEffect: [number, number];
  greenRangeEffect: [number, number];
  blueRangeEffect: [number, number];
  minQa?: number;
  mosaickingOrder?: string;
  upsampling?: string;
  downsampling?: string;
  speckleFilter?: string;
  orthorectification?: string;
  backscatterCoeff?: string;
  demSource3D?: DEMInstanceType;
  error?: string | null;
  resolutionTooLow: boolean;
  orbitDirection?: string;
  cloudCoverage: number;
  dateMode: string;
  selectedProcessing: string;
  processGraph?: string;
  processGraphUrl?: string | null;
  isProcessGraphModified: boolean;
  // One-shot flag set from the URL (see URLParamsParser): a silent "show latest date" lookup is
  // still due. Map bounds are not known at URL-parse time, so VisualizationTimeSelect resolves it
  // once they are, and always clears it afterwards.
  pendingLatestDate: boolean;
}

interface SetVisualizationTimePayload {
  fromTime?: Moment | null;
  toTime?: Moment | null;
}

interface SetNewDatasetIdPayload {
  datasetId?: string;
  resetDates?: boolean;
  orbitDirection?: string;
}

interface SetEffectsPayload {
  gainEffect?: number;
  gammaEffect?: number;
  redRangeEffect?: [number, number];
  greenRangeEffect?: [number, number];
  blueRangeEffect?: [number, number];
  minQa?: number;
  mosaickingOrder?: string;
  upsampling?: string;
  downsampling?: string;
  speckleFilter?: string;
  orthorectification?: string;
  demSource3D?: DEMInstanceType;
}

const initialState: VisualizationState = {
  fromTime: undefined,
  toTime: undefined,
  datasetId: undefined,
  visualizationUrl: undefined,
  visibleOnMap: false,
  layerId: undefined,
  customSelected: false,
  evalscript: undefined,
  evalscriptUrl: undefined,
  dataFusion: [],
  gainEffect: 1,
  gammaEffect: 1,
  redRangeEffect: [0, 1],
  greenRangeEffect: [0, 1],
  blueRangeEffect: [0, 1],
  minQa: undefined,
  mosaickingOrder: undefined,
  upsampling: undefined,
  downsampling: undefined,
  speckleFilter: undefined,
  orthorectification: undefined,
  backscatterCoeff: undefined,
  demSource3D: DEMInstanceType.MAPZEN,
  error: undefined,
  resolutionTooLow: false,
  orbitDirection: undefined,
  cloudCoverage: DEFAULT_CLOUD_COVER_PERCENT,
  dateMode: DATE_MODES.SINGLE.value,
  selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
  processGraph: '',
  processGraphUrl: undefined,
  isProcessGraphModified: false,
  pendingLatestDate: false,
};

export const visualizationSlice = createSlice({
  name: 'visualization',
  initialState,
  reducers: {
    setVisualizationTime: (state, action: PayloadAction<SetVisualizationTimePayload>) => {
      state.fromTime = action.payload.fromTime;
      state.toTime = action.payload.toTime;
      // Any explicit date choice (manual or from the latest-date lookup itself) settles it.
      state.pendingLatestDate = false;
    },
    setPendingLatestDate: (state, action: PayloadAction<boolean>) => {
      state.pendingLatestDate = action.payload;
    },
    setNewDatasetId: (state, action: PayloadAction<SetNewDatasetIdPayload>) => {
      const { datasetId, resetDates = true, orbitDirection } = action.payload;
      state.datasetId = datasetId;
      // A different dataset means the URL's "latest" request no longer applies.
      state.pendingLatestDate = false;
      if (resetDates) {
        state.fromTime = null;
        state.toTime = null;
      }
      state.visualizationUrl = undefined;
      state.visibleOnMap = false;
      state.layerId = undefined;
      state.customSelected = false;
      state.evalscript = undefined;
      state.dataFusion = [];
      state.evalscriptUrl = undefined;
      state.processGraph = undefined;
      state.processGraphUrl = undefined;
      state.isProcessGraphModified = false;
      state.resolutionTooLow = false;
      if (orbitDirection) {
        state.orbitDirection = orbitDirection;
      } else {
        state.orbitDirection = undefined;
      }
      if (state.mosaickingOrder && !isValidMosaickingOrder(state.mosaickingOrder)) {
        state.mosaickingOrder = undefined;
      }
    },
    setLayerId: (state, action: PayloadAction<string | undefined>) => {
      state.layerId = action.payload;
    },
    setVisualizationUrl: (state, action: PayloadAction<string | null | undefined>) => {
      state.visualizationUrl = action.payload;
    },
    setCustomSelected: (state, action: PayloadAction<boolean>) => {
      state.customSelected = action.payload;
    },
    setEvalscript: (state, action: PayloadAction<string | undefined>) => {
      state.evalscript = action.payload;
    },
    setEvalscriptUrl: (state, action: PayloadAction<string | undefined>) => {
      state.evalscriptUrl = action.payload;
    },
    setProcessGraphUrl: (state, action: PayloadAction<string | undefined>) => {
      state.processGraphUrl = action.payload;
    },
    setDataFusion: (state, action: PayloadAction<Record<string, unknown>[]>) => {
      state.dataFusion = action.payload;
    },
    setVisibleOnMap: (state, action: PayloadAction<boolean>) => {
      state.visibleOnMap = action.payload;
    },
    setGainEffect: (state, action: PayloadAction<number | undefined>) => {
      if (action.payload !== undefined) {
        state.gainEffect = action.payload;
      }
    },
    setGammaEffect: (state, action: PayloadAction<number | undefined>) => {
      if (action.payload !== undefined) {
        state.gammaEffect = action.payload;
      }
    },
    setRedRangeEffect: (state, action: PayloadAction<[number, number] | undefined>) => {
      if (action.payload !== undefined) {
        state.redRangeEffect = action.payload;
      }
    },
    setGreenRangeEffect: (state, action: PayloadAction<[number, number] | undefined>) => {
      if (action.payload !== undefined) {
        state.greenRangeEffect = action.payload;
      }
    },
    setBlueRangeEffect: (state, action: PayloadAction<[number, number] | undefined>) => {
      if (action.payload !== undefined) {
        state.blueRangeEffect = action.payload;
      }
    },
    setMinQa: (state, action: PayloadAction<number | undefined>) => {
      if (action.payload !== undefined) {
        state.minQa = action.payload;
      }
    },
    setMosaickingOrder: (state, action: PayloadAction<string | undefined>) => {
      state.mosaickingOrder = action.payload;
    },
    setUpsampling: (state, action: PayloadAction<string | undefined>) => {
      state.upsampling = action.payload;
    },
    setDownsampling: (state, action: PayloadAction<string | undefined>) => {
      state.downsampling = action.payload;
    },
    setSpeckleFilter: (state, action: PayloadAction<string | undefined>) => {
      state.speckleFilter = action.payload;
    },
    setOrthorectification: (state, action: PayloadAction<string | undefined>) => {
      state.orthorectification = action.payload;
    },
    setBackScatterCoeff: (state, action: PayloadAction<string | undefined>) => {
      state.backscatterCoeff = action.payload;
    },
    setDemSource3D: (state, action: PayloadAction<DEMInstanceType | undefined>) => {
      state.demSource3D = action.payload;
    },
    setOrbitDirection: (state, action: PayloadAction<string | undefined>) => {
      state.orbitDirection = action.payload;
    },
    setCloudCoverage: (state, action: PayloadAction<number>) => {
      state.cloudCoverage = action.payload;
    },
    setEffects: (state, action: PayloadAction<SetEffectsPayload>) => {
      if (action.payload.gainEffect !== undefined) {
        state.gainEffect = action.payload.gainEffect;
      }
      if (action.payload.gammaEffect !== undefined) {
        state.gammaEffect = action.payload.gammaEffect;
      }
      if (action.payload.redRangeEffect !== undefined) {
        state.redRangeEffect = action.payload.redRangeEffect;
      }
      if (action.payload.greenRangeEffect !== undefined) {
        state.greenRangeEffect = action.payload.greenRangeEffect;
      }
      if (action.payload.blueRangeEffect !== undefined) {
        state.blueRangeEffect = action.payload.blueRangeEffect;
      }
      if (action.payload.minQa !== undefined) {
        state.minQa = action.payload.minQa;
      }
      if (action.payload.mosaickingOrder !== undefined) {
        state.mosaickingOrder = action.payload.mosaickingOrder;
      }
      if (action.payload.upsampling !== undefined) {
        state.upsampling = action.payload.upsampling;
      }
      if (action.payload.downsampling !== undefined) {
        state.downsampling = action.payload.downsampling;
      }
      if (action.payload.speckleFilter !== undefined) {
        state.speckleFilter = action.payload.speckleFilter;
      }
      if (action.payload.orthorectification !== undefined) {
        state.orthorectification = action.payload.orthorectification;
      }
      if (action.payload.demSource3D !== undefined) {
        state.demSource3D = action.payload.demSource3D;
      }
    },
    setError: (state, action: PayloadAction<string | null | undefined>) => {
      state.error = action.payload;
    },
    setResolutionTooLow: (state, action: PayloadAction<boolean>) => {
      state.resolutionTooLow = action.payload;
    },
    resetEffects: (state) => {
      state.gainEffect = 1;
      state.gammaEffect = 1;
      state.redRangeEffect = [0, 1];
      state.greenRangeEffect = [0, 1];
      state.blueRangeEffect = [0, 1];
      state.minQa = undefined;
      state.mosaickingOrder = undefined;
      state.upsampling = undefined;
      state.downsampling = undefined;
      state.speckleFilter = undefined;
      state.orthorectification = undefined;
      state.backscatterCoeff = undefined;
      state.demSource3D = DEMInstanceType.MAPZEN;
    },
    resetRgbEffects: (state) => {
      state.redRangeEffect = [0, 1];
      state.greenRangeEffect = [0, 1];
      state.blueRangeEffect = [0, 1];
    },
    setDateMode: (state, action: PayloadAction<string>) => {
      state.dateMode = action.payload;
    },
    setVisualizationParams: (state, action: PayloadAction<Partial<VisualizationState>>) => {
      if (action.payload.fromTime !== undefined) {
        state.fromTime = action.payload.fromTime;
      }
      if (action.payload.toTime !== undefined) {
        state.toTime = action.payload.toTime;
      }
      if (action.payload.datasetId !== undefined) {
        state.datasetId = action.payload.datasetId;
      }
      if (action.payload.layerId !== undefined) {
        state.layerId = action.payload.layerId;
      }
      if (action.payload.visualizationUrl !== undefined) {
        state.visualizationUrl = action.payload.visualizationUrl;
      } else if (action.payload.datasetId !== undefined) {
        state.visualizationUrl = null;
      }
      if (action.payload.customSelected !== undefined) {
        state.customSelected = action.payload.customSelected;
      }
      if (action.payload.evalscript !== undefined) {
        state.evalscript = action.payload.evalscript;
      }
      if (action.payload.evalscriptUrl !== undefined) {
        state.evalscriptUrl = action.payload.evalscriptUrl;
      }
      if (action.payload.dataFusion !== undefined) {
        state.dataFusion = action.payload.dataFusion;
      }
      if (action.payload.visibleOnMap !== undefined) {
        state.visibleOnMap = action.payload.visibleOnMap;
      }
      if (action.payload.gainEffect !== undefined) {
        state.gainEffect = action.payload.gainEffect;
      }
      if (action.payload.gammaEffect !== undefined) {
        state.gammaEffect = action.payload.gammaEffect;
      }
      if (action.payload.redRangeEffect !== undefined) {
        state.redRangeEffect = action.payload.redRangeEffect;
      }
      if (action.payload.greenRangeEffect !== undefined) {
        state.greenRangeEffect = action.payload.greenRangeEffect;
      }
      if (action.payload.blueRangeEffect !== undefined) {
        state.blueRangeEffect = action.payload.blueRangeEffect;
      }
      if (action.payload.minQa !== undefined) {
        state.minQa = action.payload.minQa;
      }
      if (action.payload.mosaickingOrder !== undefined) {
        state.mosaickingOrder = action.payload.mosaickingOrder;
      }
      if (action.payload.upsampling !== undefined) {
        state.upsampling = action.payload.upsampling;
      }
      if (action.payload.downsampling !== undefined) {
        state.downsampling = action.payload.downsampling;
      }
      if (action.payload.speckleFilter !== undefined) {
        state.speckleFilter = action.payload.speckleFilter;
      }
      if (action.payload.orthorectification !== undefined) {
        state.orthorectification = action.payload.orthorectification;
      }
      if (action.payload.demSource3D !== undefined) {
        state.demSource3D = action.payload.demSource3D;
      }
      if (action.payload.backscatterCoeff !== undefined) {
        state.backscatterCoeff = action.payload.backscatterCoeff;
      }
      if (action.payload.orbitDirection !== undefined) {
        state.orbitDirection = action.payload.orbitDirection;
      }
      if (action.payload.cloudCoverage !== undefined) {
        state.cloudCoverage = action.payload.cloudCoverage;
      }
      if (state.mosaickingOrder && !isValidMosaickingOrder(state.mosaickingOrder)) {
        state.mosaickingOrder = undefined;
      }
      if (action.payload.dateMode !== undefined) {
        state.dateMode = action.payload.dateMode;
      }
      if (action.payload.selectedProcessing !== undefined) {
        state.selectedProcessing = action.payload.selectedProcessing;
      }
      if (action.payload.processGraph !== undefined) {
        state.processGraph = action.payload.processGraph;
      }
      if (action.payload.processGraphUrl !== undefined) {
        state.processGraphUrl = action.payload.processGraphUrl;
      }
      if (action.payload.isProcessGraphModified !== undefined) {
        state.isProcessGraphModified = action.payload.isProcessGraphModified;
      }
      if (action.payload.pendingLatestDate !== undefined) {
        state.pendingLatestDate = action.payload.pendingLatestDate;
      }
    },
    reset: (state) => {
      state.pendingLatestDate = false;
      state.fromTime = undefined;
      state.toTime = undefined;
      state.datasetId = undefined;
      state.visualizationUrl = undefined;
      state.layerId = undefined;
      state.customSelected = false;
      state.evalscript = undefined;
      state.evalscriptUrl = undefined;
      state.processGraphUrl = undefined;
      state.dataFusion = [];
      state.visibleOnMap = false;
      state.gainEffect = 1;
      state.gammaEffect = 1;
      state.redRangeEffect = [0, 1];
      state.greenRangeEffect = [0, 1];
      state.blueRangeEffect = [0, 1];
      state.minQa = undefined;
      state.mosaickingOrder = undefined;
      state.upsampling = undefined;
      state.downsampling = undefined;
      state.speckleFilter = undefined;
      state.orthorectification = undefined;
      state.backscatterCoeff = undefined;
      state.demSource3D = DEMInstanceType.MAPZEN;
      state.orbitDirection = undefined;
      state.cloudCoverage = DEFAULT_CLOUD_COVER_PERCENT;
      state.dateMode = DATE_MODES.SINGLE.value;
      state.processGraph = '';
      state.isProcessGraphModified = false;
      state.selectedProcessing = PROCESSING_OPTIONS.PROCESS_API;
      state.resolutionTooLow = false;
    },
  },
});
