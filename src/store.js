import { configureStore, combineReducers, createSlice, getDefaultMiddleware } from '@reduxjs/toolkit';
import { v4 as uuid } from 'uuid';
import moment from 'moment';

import {
  MODES,
  MODE_THEMES_LIST,
  USER_INSTANCES_THEMES_LIST,
  URL_THEMES_LIST,
  EDUCATION_MODE,
  DEFAULT_LAT_LNG,
  DEFAULT_ZOOM,
  TABS,
  EXPORT_FORMAT,
  DEFAULT_CLOUD_COVER_PERCENT,
  COMPARE_OPTIONS,
  DEFAULT_THEME_ID,
  DATE_MODES,
} from './const';
import { DEMInstanceType } from '@sentinel-hub/sentinelhub-js';
import { baseLayers } from './Map/Layers';
import { isValidMosaickingOrder } from './utils/mosaickingOrder.utils';

export const aoiSlice = createSlice({
  name: 'aoi',
  initialState: {},
  reducers: {
    set: (state, action) => {
      state.geometry = action.payload.geometry;
      state.bounds = action.payload.bounds;
      state.lastEdited = new Date().toISOString();
      state.isPlacingVertex = action.payload.isPlacingVertex;
    },
    setisPlacingVertex: (state, action) => {
      state.isPlacingVertex = action.payload;
    },
    reset: (state) => {
      state.geometry = null;
      state.bounds = null;
      state.lastEdited = new Date().toISOString();
      state.isDrawing = false;
      state.shape = null;
      state.isPlacingVertex = false;
    },
    startDrawing: (state, action) => {
      state.isDrawing = action.payload.isDrawing;
      state.shape = action.payload.shape;
      state.isPlacingVertex = action.payload;
    },
    clearMap: (state, action) => {
      state.clearMap = action.payload;
    },
  },
});

export const loiSlice = createSlice({
  name: 'loi',
  initialState: {
    geometry: null,
    bounds: null,
    lastEdited: null,
  },
  reducers: {
    set: (state, action) => {
      state.geometry = action.payload.geometry;
      state.bounds = action.payload.bounds;
      state.lastEdited = new Date().toISOString();
    },
    reset: (state) => {
      state.geometry = null;
      state.bounds = null;
      state.lastEdited = null;
    },
  },
});

export const poiSlice = createSlice({
  name: 'poi',
  initialState: {},
  reducers: {
    set: (state, action) => {
      state.position = action.payload.position;
      state.geometry = action.payload.geometry;
      state.bounds = action.payload.bounds;
      state.lastEdited = new Date().toISOString();
    },
    reset: (state) => {
      state.position = null;
      state.geometry = null;
      state.bounds = null;
      state.lastEdited = new Date().toISOString();
    },
  },
});

export const mainMapSlice = createSlice({
  name: 'mainMap',
  initialState: {
    lat: DEFAULT_LAT_LNG.lat,
    lng: DEFAULT_LAT_LNG.lng,
    zoom: DEFAULT_ZOOM,
    baseLayerId: baseLayers.find((baseLayer) => baseLayer.checked).id,
    enabledOverlaysId: ['labels'],
    is3D: false,
    loadingMessage: null,
  },
  reducers: {
    setPosition: (state, action) => {
      const { lat, lng, zoom } = action.payload;
      if (lat !== undefined && lng !== undefined) {
        state.lat = lat;
        state.lng = lng;
      }
      if (zoom !== undefined) {
        state.zoom = zoom;
      }
    },
    setViewport: (state, action) => {
      const {
        center: [lat, lng],
        zoom,
      } = action.payload;
      state.lat = lat;
      state.lng = lng;
      state.zoom = zoom;
    },
    setBounds: (state, action) => {
      const { bounds, pixelBounds } = action.payload;
      state.bounds = bounds;
      state.pixelBounds = pixelBounds;
    },
    setBaseLayerId: (state, action) => {
      state.baseLayerId = action.payload;
    },
    addOverlay: (state, action) => {
      state.enabledOverlaysId.push(action.payload);
    },
    removeOverlay: (state, action) => {
      const overlayIndex = state.enabledOverlaysId.indexOf(action.payload);
      if (overlayIndex !== -1) {
        state.enabledOverlaysId.splice(overlayIndex, 1);
      }
    },
    setIs3D: (state, action) => {
      state.is3D = action.payload;
    },
    setLoadingMessage: (state, action) => {
      state.loadingMessage = action.payload;
    },
    reset: (state) => {
      state.lat = DEFAULT_LAT_LNG.lat;
      state.lng = DEFAULT_LAT_LNG.lng;
      state.zoom = DEFAULT_ZOOM;
      state.enabledOverlaysId = ['labels'];
      state.is3D = false;
      state.loadingMessage = null;
    },
  },
});

export const notificationSlice = createSlice({
  name: 'notification',
  initialState: {
    type: null,
    msg: null,
    panelError: null,
  },
  reducers: {
    displayPanelError: (state, action) => {
      state.panelError = action.payload;
    },
    displayError: (state, action) => {
      state.type = 'error';
      state.msg = action.payload;
    },
    displayWarning: (state, action) => {
      state.type = 'warning';
      state.msg = action.payload;
    },
    displayInfo: (state, action) => {
      state.type = 'info';
      state.msg = action.payload;
    },
    removeNotification: (state, action) => {
      state.type = null;
      state.msg = null;
    },

    reset: (state) => {
      state.type = null;
      state.msg = null;
      state.panelError = null;
    },
  },
});

export const floatingPanelNotificationSlice = createSlice({
  name: 'floatingPanelNotification',
  initialState: {
    notificationUniqueId: null,
    notificationAlertType: null,
    notificationMsg: null,
  },
  reducers: {
    setFloatingPanelNotification: (state, action) => {
      state.notificationUniqueId = action.payload.notificationUniqueId;
      state.notificationAlertType = action.payload.notificationAlertType;
      state.notificationMsg = action.payload.notificationMsg;
    },

    reset: (state) => {
      state.notificationUniqueId = null;
      state.notificationAlertType = null;
      state.notificationMsg = null;
    },
  },
});

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    user: {
      userdata: null,
      token_expiration: null,
      access_token: null,
      terms_privacy_accepted: false,
      error: null,
    },
    anonToken: null,
    tokenRefreshInProgress: false,
  },
  reducers: {
    setUser: (state, action) => {
      state.user.userdata = action.payload.userdata;
      state.user.access_token = action.payload.access_token;
      state.user.token_expiration = action.payload.token_expiration;
      state.user.error = null;
    },
    resetUser: (state, action) => {
      state.user.userdata = null;
      state.user.access_token = null;
      state.user.token_expiration = null;
      state.user.error = null;
    },
    setAnonToken: (state, action) => {
      state.anonToken = action.payload;
    },
    setTermsPrivacyAccepted: (state, action) => {
      state.terms_privacy_accepted = action.payload;
    },
    setTokenRefreshInProgress: (state, action) => {
      state.tokenRefreshInProgress = action.payload;
    },
    setUserAuthError: (state, action) => {
      state.user.error = action.payload;
    },
  },
});

export const themesSlice = createSlice({
  name: 'themes',
  initialState: {
    themesUrl: null,
    themesLists: {
      [MODE_THEMES_LIST]: [],
      [USER_INSTANCES_THEMES_LIST]: [],
      [URL_THEMES_LIST]: [],
    },
    selectedThemesListId: null,
    dataSourcesInitialized: false,
    selectedThemeId: undefined,
    selectedModeId: undefined,
    failedThemeParts: [],
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
    reset: (state) => {
      state.themesUrl = null;
      state.selectedThemesListId = 'mode';
      state.dataSourcesInitialized = true;
      state.selectedThemeId = DEFAULT_THEME_ID;
      state.selectedModeId = 'default';
      state.failedThemeParts = [];
    },
  },
});

export const modalSlice = createSlice({
  name: 'modal',
  initialState: {
    id: null,
  },
  reducers: {
    addModal: (state, action) => {
      state.id = action.payload.modal;
      state.params = action.payload.params;
    },
    removeModal: (state, action) => {
      state.id = null;
      state.params = null;
    },
    reset: (state) => {
      state.id = null;
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
    visibleOnMap: true,
    layerId: undefined,
    customSelected: false,
    evalscript: undefined,
    evalscripturl: undefined,
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
    orbitDirection: undefined,
    cloudCoverage: DEFAULT_CLOUD_COVER_PERCENT,
    dateMode: DATE_MODES.SINGLE.value,
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
      state.layerId = undefined;
      state.customSelected = false;
      state.evalscript = undefined;
      state.evalscripturl = undefined;
      state.dataFusion = [];
      if (orbitDirection) {
        state.orbitDirection = orbitDirection;
      } else {
        state.orbitDirection = undefined;
      }
      if (state.mosaickingOrder && !isValidMosaickingOrder(datasetId, state.mosaickingOrder)) {
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

    setEvalscripturl: (state, action) => {
      state.evalscripturl = action.payload;
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
      if (action.payload.evalscripturl !== undefined) {
        state.evalscripturl = action.payload.evalscripturl;
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
      if (state.mosaickingOrder && !isValidMosaickingOrder(state.datasetId, state.mosaickingOrder)) {
        state.mosaickingOrder = undefined;
      }
      if (action.payload.dateMode !== undefined) {
        state.dateMode = action.payload.dateMode;
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
      state.evalscripturl = undefined;
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
    },
  },
});

export const tabsSlice = createSlice({
  name: 'tabs',
  initialState: {
    selectedTabIndex: TABS.VISUALIZE_TAB,
    scrollTop: null,
  },
  reducers: {
    setTabIndex: (state, action) => {
      state.selectedTabIndex = action.payload;
    },
    setScrollTop: (state, action) => {
      state.scrollTop = action.payload;
    },
    reset: (state) => {
      state.selectedTabIndex = TABS.VISUALIZE_TAB;
      state.scrollTop = null;
    },
  },
});

export const compareLayersSlice = createSlice({
  name: 'compare',
  initialState: {
    compareMode: COMPARE_OPTIONS.COMPARE_SPLIT,
    comparedLayers: [],
    comparedOpacity: [],
    comparedClipping: [],
    newCompareLayersCount: 0,
  },
  reducers: {
    addToCompare: (state, action) => {
      const newLayer = { id: uuid(), ...action.payload };
      state.comparedLayers = [newLayer, ...state.comparedLayers];
      state.newCompareLayersCount = state.newCompareLayersCount + 1;
      state.comparedOpacity = [1.0, ...state.comparedOpacity];
      state.comparedClipping = [[0, 1], ...state.comparedClipping];
    },
    setCompareMode: (state, action) => {
      state.compareMode = action.payload;
    },
    setComparedLayers: (state, action) => {
      state.comparedLayers = action.payload;
      state.comparedOpacity = new Array(action.payload.length).fill(1.0);
      state.comparedClipping = new Array(action.payload.length).fill([0, 1]);
    },
    addComparedLayers: (state, action) => {
      const layers = action.payload.map((l) => ({ id: uuid(), ...l }));
      state.comparedLayers = [...layers, ...state.comparedLayers];
      state.comparedOpacity = [...new Array(action.payload.length).fill(1.0), ...state.comparedOpacity];
      state.comparedClipping = [...new Array(action.payload.length).fill([0, 1]), ...state.comparedClipping];
    },
    setNewCompareLayersCount: (state, action) => {
      state.newCompareLayersCount = action.payload;
    },
    updateOpacity: (state, action) => {
      const { index, value } = action.payload;
      const newState = [...state.comparedOpacity];
      newState[index] = value;
      state.comparedOpacity = newState;
    },
    updateClipping: (state, action) => {
      const { index, value } = action.payload;
      const newState = [...state.comparedClipping];
      newState[index] = value;
      state.comparedClipping[index] = value;
    },
    resetOpacityAndClipping: (state, action) => {
      state.comparedOpacity = new Array(state.comparedLayers.length).fill(1.0);
      state.comparedClipping = new Array(state.comparedLayers.length).fill([0, 1]);
    },
    updateOrder: (state, action) => {
      const { oldIndex, newIndex } = action.payload;

      const newComparedLayers = [...state.comparedLayers];
      const layer = newComparedLayers.splice(oldIndex, 1)[0];
      newComparedLayers.splice(newIndex, 0, layer);
      state.comparedLayers = newComparedLayers;

      const newComparedOpacity = [...state.comparedOpacity];
      const opacity = newComparedOpacity.splice(oldIndex, 1)[0];
      newComparedOpacity.splice(newIndex, 0, opacity);
      state.comparedOpacity = newComparedOpacity;

      const newComparedClipping = [...state.comparedClipping];
      const clipping = newComparedClipping.splice(oldIndex, 1)[0];
      newComparedClipping.splice(newIndex, 0, clipping);
      state.comparedClipping = newComparedClipping;
    },
    removeFromCompare: (state, action) => {
      const index = action.payload;
      const newComparedLayers = [...state.comparedLayers];
      newComparedLayers.splice(index, 1);
      state.comparedLayers = newComparedLayers;

      const newComparedOpacity = [...state.comparedOpacity];
      newComparedOpacity.splice(index, 1);
      state.comparedOpacity = newComparedOpacity;

      const newComparedClipping = [...state.comparedClipping];
      newComparedClipping.splice(index, 1);
      state.comparedClipping = newComparedClipping;
    },
    reset: (state) => {
      state.compareMode = COMPARE_OPTIONS.COMPARE_SPLIT;
      state.comparedLayers = [];
      state.comparedOpacity = [];
      state.comparedClipping = [];
      state.newCompareLayersCount = 0;
    },
    restoreComparedLayers: (state, action) => {
      state.comparedLayers = action.payload.layers.map((l) => ({ id: uuid(), ...l }));
      state.compareMode = action.payload.compareMode;
      state.comparedOpacity = action.payload.comparedOpacity;
      state.comparedClipping = action.payload.comparedClipping;
    },
  },
});

export const languageSlice = createSlice({
  name: 'language',
  initialState: {
    selectedLanguage: null,
  },
  reducers: {
    setLanguage: (state, action) => {
      state.selectedLanguage = action.payload;
    },
    reset: (state) => {
      state.selectedLanguage = null;
    },
  },
});

export const modeSlice = createSlice({
  name: 'modes',
  initialState: {
    selectedMode: undefined,
  },
  reducers: {
    setMode: (state, action) => {
      state.selectedMode = action.payload;
    },
    reset: (state) => {
      state.selectedMode = undefined;
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

export const timelapseSlice = createSlice({
  name: 'timelapse',
  initialState: {
    displayTimelapseAreaPreview: false,
    fromTime: null,
    toTime: null,
    filterMonths: null,
    selectedPeriod: 'day',
    minCoverageAllowed: 0,
    maxCCPercentAllowed: 100,
    isSelectAllChecked: true,
    showBorders: false,
    timelapseFPS: 1,
    transition: 'none',
    pins: [],
    timelapseSharePreviewMode: false,
    previewFileUrl: null,
    size: null,
    format: EXPORT_FORMAT.gif,
    fadeDuration: 0.5,
    delayLastFrame: false,
    newLayersCount: 0,
  },
  reducers: {
    set: (state, action) => {
      Object.keys(action.payload).forEach((key) => {
        state[key] = ['fromTime', 'toTime'].includes(key)
          ? moment.utc(action.payload[key])
          : action.payload[key];
      });
    },
    reset: (state) => {
      state.displayTimelapseAreaPreview = false;
      state.fromTime = null;
      state.toTime = null;
      state.filterMonths = null;
      state.selectedPeriod = 'day';
      state.minCoverageAllowed = 0;
      state.maxCCPercentAllowed = 100;
      state.isSelectAllChecked = true;
      state.showBorders = false;
      state.timelapseFPS = 1;
      state.transition = 'none';
      state.pins = [];
      state.timelapseSharePreviewMode = false;
      state.previewFileUrl = null;
      state.size = null;
      state.format = EXPORT_FORMAT.gif;
      state.fadeDuration = 0.5;
      state.delayLastFrame = false;
      state.newLayersCount = 0;
    },
    toggleTimelapseAreaPreview: (state) => {
      state.displayTimelapseAreaPreview = !state.displayTimelapseAreaPreview;
    },
    setTimelapseAreaPreview: (state, action) => {
      state.displayTimelapseAreaPreview = action.payload;
    },
    setInitialTime: (state, action) => {
      state.fromTime = action.payload.time.clone().subtract(1, action.payload.interval);
      state.toTime = action.payload.time.clone();
    },
    setFromTime: (state, action) => {
      state.fromTime = action.payload;
    },
    setToTime: (state, action) => {
      state.toTime = action.payload;
    },
    setFilterMonths: (state, action) => {
      state.filterMonths = action.payload;
    },
    setSelectedPeriod: (state, action) => {
      state.selectedPeriod = action.payload;
    },
    setMinCoverageAllowed: (state, action) => {
      state.minCoverageAllowed = action.payload;
    },
    setMaxCCPercentAllowed: (state, action) => {
      state.maxCCPercentAllowed = action.payload;
    },
    setIsSelectAllChecked: (state, action) => {
      state.isSelectAllChecked = action.payload;
    },
    setShowBorders: (state, action) => {
      state.showBorders = action.payload;
    },
    setTimelapseSharePreviewMode: (state, action) => {
      state.timelapseSharePreviewMode = action.payload;
    },
    setPreviewFileUrl: (state, action) => {
      state.previewFileUrl = action.payload;
    },
    setTimelapseFPS: (state, action) => {
      state.timelapseFPS = action.payload;
    },
    setTransition: (state, action) => {
      state.transition = action.payload;
    },
    addPin: (state, action) => {
      state.pins = [...state.pins, action.payload];
      state.newLayersCount = state.newLayersCount + 1;
    },
    removePin: (state, action) => {
      if (action.payload > -1) {
        state.pins = state.pins.filter((p, i) => i !== action.payload);
      }
    },
    setSize: (state, action) => {
      state.size = action.payload;
    },
    setFormat: (state, action) => {
      state.format = action.payload;
    },
    setFadeDuration: (state, action) => {
      state.fadeDuration = action.payload;
    },
    setDelayLastFrame: (state, action) => {
      state.delayLastFrame = action.payload;
    },
    setNewLayersCount: (state, action) => {
      state.newLayersCount = action.payload;
    },
  },
});

export const indexSlice = createSlice({
  name: 'index',
  initialState: {
    handlePositions: null,
    gradient: null,
  },
  reducers: {
    setHandlePositions: (state, action) => {
      state.handlePositions = action.payload;
    },
    setGradient: (state, action) => {
      state.gradient = action.payload;
    },
    reset: (state) => {
      state.handlePositions = null;
      state.gradient = null;
    },
  },
});

export const terrainViewerSlice = createSlice({
  name: 'terrainViewer',
  initialState: {
    settings: null,
    id: null,
  },
  reducers: {
    setTerrainViewerSettings: (state, action) => {
      state.settings = action.payload;
    },
    resetTerrainViewerSettings: (state, action) => {
      state.settings = null;
    },
    setTerrainViewerId: (state, action) => {
      state.id = action.payload;
    },
    reset: (state) => {
      state.settings = null;
      state.id = null;
    },
  },
});

export const collapsiblePanelSlice = createSlice({
  name: 'collapsiblePanel',
  initialState: {
    datePanelExpanded: true,
    themePanelExpanded: true,
    collectionPanelExpanded: true,
    highlightsPanelExpanded: true,
    areaTimeExpanded: true,
    providerExpanded: true,
    advancedExpanded: true,
  },
  reducers: {
    setDatePanelExpanded: (state, action) => {
      state.datePanelExpanded = action.payload;
    },
    setThemePanelExpanded: (state, action) => {
      state.themePanelExpanded = action.payload;
    },
    setCollectionPanelExpanded: (state, action) => {
      state.collectionPanelExpanded = action.payload;
    },
    setHighlightsPanelExpanded: (state, action) => {
      state.highlightsPanelExpanded = action.payload;
    },
    setAreaTimeExpanded: (state, action) => {
      state.areaTimeExpanded = action.payload;
    },
    setProviderExpanded: (state, action) => {
      state.providerExpanded = action.payload;
    },
    setAdvancedExpanded: (state, action) => {
      state.advancedExpanded = action.payload;
    },
    reset: (state) => {
      state.datePanelExpanded = true;
      state.themePanelExpanded = true;
      state.collectionPanelExpanded = true;
      state.highlightsPanelExpanded = true;
      state.areaTimeExpanded = true;
      state.providerExpanded = true;
      state.advancedExpanded = true;
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

export const spectralExplorerSlice = createSlice({
  name: 'spectralExplorer',
  initialState: {
    selectedSeries: {},
  },
  reducers: {
    setSelectedSeries: (state, action) => {
      const { datasetId, series } = action.payload;
      state.selectedSeries = { ...state.selectedSeries, [datasetId]: series };
    },
    reset: (state) => {
      state.series = {};
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
  modes: modeSlice.reducer,
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
  tools: toolsSlice.reducer,
});

const store = configureStore({
  reducer: reducers,
  middleware: getDefaultMiddleware({
    serializableCheck: false,
  }),
}); // Due to "A non-serializable value was detected in an action" => https://github.com/rt2zz/redux-persist/issues/988
export default store;
