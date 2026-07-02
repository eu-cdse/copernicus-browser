import { configureStore, combineReducers, createSlice } from '@reduxjs/toolkit';
import { aoiSlice } from './store/slices/aoiSlice';
import { notificationSlice } from './store/slices/notificationSlice';
import { floatingPanelNotificationSlice } from './store/slices/floatingPanelNotificationSlice';
import { tabsSlice } from './store/slices/tabsSlice';
import { languageSlice } from './store/slices/languageSlice';
import { collapsiblePanelSlice } from './store/slices/collapsiblePanelSlice';
import { mainMapSlice } from './store/slices/mainMapSlice';
import { modalSlice } from './store/slices/modalSlice';
import { authSlice } from './store/slices/authSlice';
import { poiSlice } from './store/slices/poiSlice';
import { loiSlice } from './store/slices/loiSlice';
import { compareLayersSlice } from './store/slices/compareLayersSlice';
import { spectralExplorerSlice } from './store/slices/spectralExplorerSlice';
import { indexSlice } from './store/slices/indexSlice';
import { timelapseSlice } from './store/slices/timelapseSlice';
import { terrainViewerSlice } from './store/slices/terrainViewerSlice';

import {
  MODES,
  MODE_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  URL_THEMES_LIST,
  EDUCATION_MODE,
  DEFAULT_CLOUD_COVER_PERCENT,
  DEFAULT_THEME_ID,
  DATE_MODES,
  RRD_INSTANCES_THEMES_LIST,
  PROCESSING_OPTIONS,
} from './const';
import { DEMInstanceType } from '@sentinel-hub/sentinelhub-js';
import { isValidMosaickingOrder } from './utils/mosaickingOrder.utils';
import {
  getResultsSectionFilterDefaultValue,
  ProcessorModesProperties,
  ProviderImageTypes,
  SensorModesProperties,
  ResultsSectionSortProperties,
} from './Tools/RapidResponseDesk/rapidResponseProperties';
import { DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX } from './Tools/VisualizationPanel/CollectionSelection/CLMSCollectionSelection.utils';

export { poiSlice };

export { loiSlice };

export { compareLayersSlice };

export { spectralExplorerSlice };

export { indexSlice };

export { aoiSlice };

export { mainMapSlice };

export { notificationSlice };

export { floatingPanelNotificationSlice };

export { tabsSlice };

export { languageSlice };

export { collapsiblePanelSlice };

export { modalSlice };

export { authSlice };

export { timelapseSlice };

export { terrainViewerSlice };

export const themesSlice = createSlice({
  name: 'themes',
  initialState: {
    themesUrl: null,
    themesLists: {
      [MODE_THEMES_LIST]: [],
      [USER_INSTANCES_THEMES_LIST]: [],
      [URL_THEMES_LIST]: [],
      [RRD_INSTANCES_THEMES_LIST]: [],
    },
    selectedThemesListId: null,
    dataSourcesInitialized: false,
    selectedThemeId: undefined,
    selectedModeId: undefined,
    failedThemeParts: [],
    useEvoland: false,
  },
  reducers: {
    setSelectedModeId: (state, action) => {
      state.selectedModeId = action.payload;
    },
    setSelectedModeIdAndDefaultTheme: (state, action) => {
      state.selectedModeId = action.payload;
      const modeThemes = MODES.find((mode) => mode.id === state.selectedModeId).themes;
      state.themesLists[MODE_THEMES_LIST] = modeThemes;

      if (state.selectedModeId === EDUCATION_MODE.id) {
        state.selectedThemeId = null;
        state.selectedThemesListId = MODE_THEMES_LIST;
      } else if (state.themesLists[URL_THEMES_LIST].length > 0) {
        const firstThemeIdInList = state.themesLists[URL_THEMES_LIST][0].id;
        state.selectedThemeId = firstThemeIdInList;
        state.selectedThemesListId = URL_THEMES_LIST;
      } else {
        const firstThemeIdInList = modeThemes[0].id;
        state.selectedThemeId = firstThemeIdInList;
        state.selectedThemesListId = MODE_THEMES_LIST;
      }
    },
    setDataSourcesInitialized: (state, action) => {
      state.dataSourcesInitialized = action.payload;
    },
    setThemesUrl: (state, action) => {
      state.themesUrl = action.payload;
    },
    setModeThemesList: (state, action) => {
      state.themesLists[MODE_THEMES_LIST] = action.payload;
    },
    setUserInstancesThemesList: (state, action) => {
      state.themesLists[USER_INSTANCES_THEMES_LIST] = action.payload;
    },
    setUrlThemesList: (state, action) => {
      state.themesLists[URL_THEMES_LIST] = action.payload;
    },
    setRRDThemesList: (state, action) => {
      state.themesLists[RRD_INSTANCES_THEMES_LIST] = action.payload;
    },
    setSelectedThemeId: (state, action) => {
      // - if selectedThemesList is supplied, check the combination and set both selectedThemesList and selectedThemeId
      // - else, find the theme with themeId and set selectedTheme according to this
      const { selectedThemeId, selectedThemesListId } = action.payload;

      if (selectedThemesListId) {
        state.selectedThemeId = selectedThemeId;
        state.selectedThemesListId = selectedThemesListId;
      } else {
        if (state.themesLists[USER_INSTANCES_THEMES_LIST].find((t) => t.id === selectedThemeId)) {
          state.selectedThemesListId = USER_INSTANCES_THEMES_LIST;
          state.selectedThemeId = selectedThemeId;
        } else {
          const isThemeInUrlThemesList = !!state.themesLists[URL_THEMES_LIST].find(
            (t) => t.id === selectedThemeId,
          );
          const isThemeInModeThemesList = !!state.themesLists[MODE_THEMES_LIST].find(
            (t) => t.id === selectedThemeId,
          );
          const isEducationMode = state.selectedModeId === EDUCATION_MODE.id;

          if (state.themesLists[URL_THEMES_LIST].length && !isEducationMode) {
            if (isThemeInUrlThemesList) {
              state.selectedThemesListId = URL_THEMES_LIST;
              state.selectedThemeId = selectedThemeId;
            } else {
              state.selectedThemesListId = URL_THEMES_LIST;
              state.selectedThemeId = null;
            }
          } else if (isThemeInModeThemesList) {
            state.selectedThemesListId = MODE_THEMES_LIST;
            state.selectedThemeId = selectedThemeId;
          } else {
            state.selectedThemesListId = MODE_THEMES_LIST;
            state.selectedThemeId = null;
          }
        }
      }
      state.failedThemeParts = [];
    },
    setFailedThemeParts: (state, action) => {
      state.failedThemeParts = action.payload;
    },
    setSelectedThemeIdAndModeId: (state, action) => {
      const { selectedThemeId, selectedModeId, selectedThemesListId } = action.payload;
      state.dataSourcesInitialized =
        selectedModeId === state.selectedModeId && selectedThemeId === state.selectedThemeId;
      state.selectedThemeId = selectedThemeId;
      const modeThemes = MODES.find((mode) => mode.id === selectedModeId).themes;
      state.themesLists[MODE_THEMES_LIST] = modeThemes;
      state.selectedModeId = selectedModeId;
      state.selectedThemesListId = selectedThemesListId;
    },
    setCurrentProjectName(state, action) {
      state.currentProjectName = action.payload;
    },
    setUseEvoland: (state, action) => {
      state.useEvoland = action.payload;
    },
    reset: (state) => {
      state.themesUrl = null;
      state.selectedThemesListId = 'mode';
      state.dataSourcesInitialized = true;
      state.selectedThemeId = DEFAULT_THEME_ID;
      state.selectedModeId = 'default';
      state.failedThemeParts = [];
      state.currentProjectName = null;
      state.useEvoland = false;
    },
  },
});

export const productDownloadSlice = createSlice({
  name: 'productDownload',
  initialState: {
    progress: {},
    cancelTokens: {},
  },
  reducers: {
    setProgress: (state, action) => {
      const { productId, value } = action.payload;
      state.progress[productId] = value;
    },
    setCancelToken: (state, action) => {
      const { productId, cancelToken } = action.payload;
      state.cancelTokens[productId] = cancelToken;
    },
    reset: (state) => {
      state.progress = {};
      state.cancelTokens = {};
    },
  },
});

export const visualizationSlice = createSlice({
  name: 'visualization',
  initialState: {
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
  },
  reducers: {
    setVisualizationTime: (state, action) => {
      state.fromTime = action.payload.fromTime;
      state.toTime = action.payload.toTime;
    },
    setNewDatasetId: (state, action) => {
      const { datasetId, resetDates = true, orbitDirection } = action.payload;
      state.datasetId = datasetId;
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
    setLayerId: (state, action) => {
      state.layerId = action.payload;
    },
    setVisualizationUrl: (state, action) => {
      state.visualizationUrl = action.payload;
    },
    setCustomSelected: (state, action) => {
      state.customSelected = action.payload;
    },
    setEvalscript: (state, action) => {
      state.evalscript = action.payload;
    },
    setEvalscriptUrl: (state, action) => {
      state.evalscriptUrl = action.payload;
    },
    setProcessGraphUrl: (state, action) => {
      state.processGraphUrl = action.payload;
    },
    setDataFusion: (state, action) => {
      state.dataFusion = action.payload;
    },
    setVisibleOnMap: (state, action) => {
      state.visibleOnMap = action.payload;
    },
    setGainEffect: (state, action) => {
      if (action.payload !== undefined) {
        state.gainEffect = action.payload;
      }
    },
    setGammaEffect: (state, action) => {
      if (action.payload !== undefined) {
        state.gammaEffect = action.payload;
      }
    },
    setRedRangeEffect: (state, action) => {
      if (action.payload !== undefined) {
        state.redRangeEffect = action.payload;
      }
    },
    setGreenRangeEffect: (state, action) => {
      if (action.payload !== undefined) {
        state.greenRangeEffect = action.payload;
      }
    },
    setBlueRangeEffect: (state, action) => {
      if (action.payload !== undefined) {
        state.blueRangeEffect = action.payload;
      }
    },
    setMinQa: (state, action) => {
      if (action.payload !== undefined) {
        state.minQa = action.payload;
      }
    },
    setMosaickingOrder: (state, action) => {
      state.mosaickingOrder = action.payload;
    },
    setUpsampling: (state, action) => {
      state.upsampling = action.payload;
    },
    setDownsampling: (state, action) => {
      state.downsampling = action.payload;
    },
    setSpeckleFilter: (state, action) => {
      state.speckleFilter = action.payload;
    },
    setOrthorectification: (state, action) => {
      state.orthorectification = action.payload;
    },
    setBackScatterCoeff: (state, action) => {
      state.backscatterCoeff = action.payload;
    },
    setDemSource3D: (state, action) => {
      state.demSource3D = action.payload;
    },
    setOrbitDirection: (state, action) => {
      state.orbitDirection = action.payload;
    },
    setCloudCoverage: (state, action) => {
      state.cloudCoverage = action.payload;
    },
    setEffects: (state, action) => {
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
    setError: (state, action) => {
      state.error = action.payload;
    },
    setResolutionTooLow: (state, action) => {
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
    setDateMode: (state, action) => {
      state.dateMode = action.payload;
    },
    setVisualizationParams: (state, action) => {
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
    },
    reset: (state) => {
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

export const pinsSlice = createSlice({
  name: 'pins',
  initialState: {
    items: [],
    newPinsCount: 0,
  },
  reducers: {
    updateItems: (state, action) => {
      state.items = action.payload;
    },
    updatePinsByType: (state, action) => {
      const { pins, pinType } = action.payload;
      state.items = [
        // remove any existing pin items of this type:
        ...state.items.filter((item) => item.type !== pinType),
        // add the pin items for each of the pins:
        ...pins.map((pin) => ({
          type: pinType,
          item: pin, // misnomer - instead of "item" it should be "pin"
          opacity: 1.0,
          clipping: [0, 1],
        })),
      ];
    },
    clearByType: (state, action) => {
      const pinType = action.payload;
      state.items = state.items.filter((item) => item.type !== pinType);
    },
    setNewPinsCount: (state, action) => {
      state.newPinsCount = action.payload;
    },
    removeItem: (state, action) => {
      const index = action.payload;
      const pinItems = [...state.items];
      pinItems.splice(index, 1);
      state.items = pinItems;
    },
    reset: (state) => {
      state.items = [];
      state.newPinsCount = 0;
    },
  },
});

export const areaAndTimeSectionSlice = createSlice({
  name: 'areaAndTimeSection',
  initialState: {
    timespanArray: [],
    overlappedRanges: [],
    isTaskingEnabled: false,
    isArchiveEnabled: true,
  },
  reducers: {
    setTimespanArray: (state, action) => {
      state.timespanArray = action.payload;
    },

    setRangesOverlapped: (state, action) => {
      state.overlappedRanges = action.payload;
    },

    setIsTaskingEnabled: (state, action) => {
      state.isTaskingEnabled = action.payload;
    },

    setIsArchiveEnabled: (state, action) => {
      state.isArchiveEnabled = action.payload;
    },
  },
});

export const imageQualityAndProviderSectionSlice = createSlice({
  name: 'imageQualityAndProviderSection',
  initialState: {
    imageType: ProviderImageTypes.optical,
    imageResolution: [0, 20],
    cloudCoverage: 0.3,
    selectedOpticalProvidersAndMissions: [],
    selectedRadarProvidersAndMissions: [],
    selectedAtmosProvidersAndMissions: [],
    radarPolarizationFilterArray: [],
    radarInstrumentFilterArray: [],
    radarOrbitDirectionArray: [],
    radarSensorMode: SensorModesProperties[0].value,
    radarProcessorMode: ProcessorModesProperties[0].value,
  },
  reducers: {
    setImageType: (state, action) => {
      state.imageType = action.payload;
    },

    setImageResolution: (state, action) => {
      state.imageResolution = action.payload;
    },

    setCloudCoverage: (state, action) => {
      state.cloudCoverage = action.payload;
    },

    setSelectedOpticalProvidersAndMissions: (state, action) => {
      state.selectedOpticalProvidersAndMissions = action.payload;
    },

    resetOpticalSection: (state) => {
      state.selectedOpticalProvidersAndMissions = [];
      state.cloudCoverage = 0.3;
    },

    setSelectedRadarProvidersAndMissions: (state, action) => {
      state.selectedRadarProvidersAndMissions = action.payload;
    },

    resetRadarSection: (state) => {
      state.selectedRadarProvidersAndMissions = [];
      state.radarPolarizationFilterArray = [];
      state.radarInstrumentFilterArray = [];
      state.radarOrbitDirectionArray = [];
    },

    setRadarPolarizationFilterArray: (state, action) => {
      state.radarPolarizationFilterArray = action.payload;
    },

    setRadarInstrumentFilterArray: (state, action) => {
      state.radarInstrumentFilterArray = action.payload;
    },

    setOrbitDirectionArray: (state, action) => {
      state.radarOrbitDirectionArray = action.payload;
    },

    setRadarSensorMode: (state, action) => {
      state.radarSensorMode = action.payload;
    },

    setRadarProcessorMode: (state, action) => {
      state.radarProcessorMode = action.payload;
    },

    setSelectedAtmosProvidersAndMissions: (state, action) => {
      state.selectedAtmosProvidersAndMissions = action.payload;
    },

    resetAtmosSection: (state) => {
      state.selectedAtmosProvidersAndMissions = [];
    },

    resetProvidersAndMissions: (state) => {
      state.selectedOpticalProvidersAndMissions = [];
      state.selectedRadarProvidersAndMissions = [];
      state.selectedAtmosProvidersAndMissions = [];
    },
  },
});

export const advancedSectionSlice = createSlice({
  name: 'advancedSection',
  initialState: {
    aoiCoverage: 1,
    satelliteAzimuth: [0, 360],
    azimuth: [0, 360],
    sunAzimuth: [0, 360],
    sunElevation: [0, 90],
    productType: [],
    incidenceAngle: [0, 90],
  },
  reducers: {
    setAoiCoverage: (state, action) => {
      state.aoiCoverage = action.payload;
    },
    setSatelliteAzimuth: (state, action) => {
      state.satelliteAzimuth = action.payload;
    },
    setAzimuth: (state, action) => {
      state.azimuth = action.payload;
    },
    setSunAzimuth: (state, action) => {
      state.sunAzimuth = action.payload;
    },
    setSunElevation: (state, action) => {
      state.sunElevation = action.payload;
    },
    setProductType: (state, action) => {
      state.productType = action.payload;
    },
    setIncidenceAngle: (state, action) => {
      state.incidenceAngle = action.payload;
    },
  },
});

export const resultsSectionSlice = createSlice({
  name: 'resultsSection',
  initialState: {
    filtersForSearch: undefined,
    sortState: ResultsSectionSortProperties[0].value,
    filterState: getResultsSectionFilterDefaultValue(),
    results: undefined,
    highlightedResult: undefined,
    cartResults: undefined,
    currentPage: 1,
    quicklookImages: {},
  },
  reducers: {
    setFiltersForSearch: (state, action) => {
      state.filtersForSearch = action.payload;
    },
    setSortState: (state, action) => {
      state.sortState = action.payload;
    },
    setFilterState: (state, action) => {
      state.filterState = action.payload;
    },
    setResults: (state, action) => {
      state.results = action.payload;
    },
    setHighlightedResult: (state, action) => {
      state.highlightedResult = action.payload;
    },
    setCartResults: (state, action) => {
      state.cartResults = action.payload;
    },
    setCurrentPage: (state, action) => {
      state.currentPage = action.payload;
    },
    addQuicklookImage: (state, action) => {
      const { id, url } = action.payload;
      state.quicklookImages[id] = url;
    },
  },
});

export const commercialDataSlice = createSlice({
  name: 'commercialData',
  initialState: {
    searchResults: [],
    displaySearchResults: false,
    location: null,
    highlightedResult: null,
    selectedOrder: null,
  },
  reducers: {
    setSearchResults: (state, action) => {
      state.searchResults = action.payload;
      state.displaySearchResults = action.payload.length > 0;
    },
    setLocation: (state, action) => {
      state.location = action.payload;
    },
    setHighlightedResult: (state, action) => {
      state.highlightedResult = action.payload;
    },
    setDisplaySearchResults: (state, action) => {
      state.displaySearchResults = action.payload;
    },
    setSelectedOrder: (state, action) => {
      state.selectedOrder = action.payload;
    },
    reset: (state) => {
      state.highlightedResult = null;
      state.searchResults = [];
      state.location = null;
      state.displaySearchResults = false;
      state.selectedOrder = null;
    },
  },
});

export const searchResultsSlice = createSlice({
  name: 'searchResults',
  initialState: {
    displayingSearchResults: false,
    searchResult: null,
    selectedTiles: null,
    highlightedTile: null,
    selectedResult: null,
    resultsAvailable: false,
    resultsPanelSelected: false,
    searchFormData: null,
  },
  reducers: {
    setDisplayingSearchResults: (state, action) => {
      state.displayingSearchResults = action.payload;
    },
    setSearchResult: (state, action) => {
      state.searchResult = action.payload;
      state.resultsAvailable = true;
      state.resultsPanelSelected = true;
    },
    setSearchFormData: (state, action) => {
      state.searchFormData = action.payload;
    },
    setSelectedTiles: (state, action) => {
      state.selectedTiles = action.payload;
    },
    setHighlightedTile: (state, action) => {
      state.highlightedTile = action.payload;
    },
    setSelectedResult: (state, action) => {
      state.selectedResult = action.payload;
    },
    reset: (state) => {
      state.displayingSearchResults = false;
      state.searchResult = null;
      state.selectedTiles = null;
      state.highlightedTile = null;
      state.selectedResult = null;
      state.resultsAvailable = false;
      state.resultsPanelSelected = false;
    },
  },
});

export const elevationProfileSlice = createSlice({
  name: 'elevationProfile',
  initialState: {
    highlightedPoint: null,
  },
  reducers: {
    setHighlightedPoint: (state, action) => {
      state.highlightedPoint = action.payload.geometry;
    },
    reset: (state) => {
      state.highlightedPoint = null;
    },
  },
});

export const toolsSlice = createSlice({
  name: 'tools',
  initialState: {
    open: true,
  },
  reducers: {
    setOpen: (state, action) => {
      state.open = action.payload;
    },
    reset: (state) => {
      state.open = true;
    },
  },
});

export const clmsSlice = createSlice({
  name: 'clms',
  initialState: {
    selected: false,
    selectedPath: null,
    selectedCollection: null,
    selectedConsolidationPeriodIndex: DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX,
  },
  reducers: {
    setSelected: (state, action) => {
      state.selected = action.payload;
    },
    setSelectedPath: (state, action) => {
      state.selectedPath = action.payload;
    },
    setSelectedCollection: (state, action) => {
      state.selectedCollection = action.payload;
    },
    setSelectedConsolidationPeriodIndex: (state, action) => {
      state.selectedConsolidationPeriodIndex = action.payload;
    },
    reset: (state) => {
      state.selected = false;
      state.selectedPath = null;
      state.selectedCollection = null;
      state.selectedConsolidationPeriodIndex = DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX;
    },
  },
});

const reducers = combineReducers({
  aoi: aoiSlice.reducer,
  loi: loiSlice.reducer,
  poi: poiSlice.reducer,
  mainMap: mainMapSlice.reducer,
  notification: notificationSlice.reducer,
  floatingPanelNotification: floatingPanelNotificationSlice.reducer,
  auth: authSlice.reducer,
  themes: themesSlice.reducer,
  modal: modalSlice.reducer,
  visualization: visualizationSlice.reducer,
  tabs: tabsSlice.reducer,
  compare: compareLayersSlice.reducer,
  language: languageSlice.reducer,
  pins: pinsSlice.reducer,
  timelapse: timelapseSlice.reducer,
  index: indexSlice.reducer,
  terrainViewer: terrainViewerSlice.reducer,
  commercialData: commercialDataSlice.reducer,
  searchResults: searchResultsSlice.reducer,
  collapsiblePanel: collapsiblePanelSlice.reducer,
  productDownload: productDownloadSlice.reducer,
  spectralExplorer: spectralExplorerSlice.reducer,
  elevationProfile: elevationProfileSlice.reducer,
  areaAndTimeSection: areaAndTimeSectionSlice.reducer,
  imageQualityAndProviderSection: imageQualityAndProviderSectionSlice.reducer,
  advancedSection: advancedSectionSlice.reducer,
  resultsSection: resultsSectionSlice.reducer,
  tools: toolsSlice.reducer,
  clms: clmsSlice.reducer,
});

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) => getDefaultMiddleware({ serializableCheck: false }),
}); // Due to "A non-serializable value was detected in an action" => https://github.com/rt2zz/redux-persist/issues/988
export default store;
