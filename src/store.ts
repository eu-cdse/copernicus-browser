import { configureStore, combineReducers } from '@reduxjs/toolkit';
import { aoiSlice } from './store/slices/aoiSlice';
import { notificationSlice } from './store/slices/notificationSlice';
import { floatingPanelNotificationSlice } from './store/slices/floatingPanelNotificationSlice';
import { tabsSlice } from './store/slices/tabsSlice';
import { languageSlice } from './store/slices/languageSlice';
import { collapsiblePanelSlice } from './store/slices/collapsiblePanelSlice';
import { mainMapSlice } from './store/slices/mainMapSlice';
import { modalSlice } from './store/slices/modalSlice';
import { loginPromptSlice } from './store/slices/loginPromptSlice';
import { authSlice } from './store/slices/authSlice';
import { externalLayersSlice, externalLayersPersistenceMiddleware } from './store/slices/externalLayersSlice';
import { poiSlice } from './store/slices/poiSlice';
import { loiSlice } from './store/slices/loiSlice';
import { compareLayersSlice } from './store/slices/compareLayersSlice';
import { spectralExplorerSlice } from './store/slices/spectralExplorerSlice';
import { indexSlice } from './store/slices/indexSlice';
import { timelapseSlice } from './store/slices/timelapseSlice';
import { elevationProfileSlice } from './store/slices/elevationProfileSlice';
import { pinsSlice } from './store/slices/pinsSlice';
import { terrainViewerSlice } from './store/slices/terrainViewerSlice';
import { productDownloadSlice } from './store/slices/productDownloadSlice';
import { toolsSlice } from './store/slices/toolsSlice';
import { searchResultsSlice } from './store/slices/searchResultsSlice';
import { clmsSlice } from './store/slices/clmsSlice';
import { workspaceSlice } from './store/slices/workspaceSlice';
import { visualizationSlice } from './store/slices/visualizationSlice';
import { themesSlice } from './store/slices/themesSlice';
import { areaAndTimeSectionSlice } from './store/slices/areaAndTimeSectionSlice';
import { imageQualityAndProviderSectionSlice } from './store/slices/imageQualityAndProviderSectionSlice';
import { advancedSectionSlice } from './store/slices/advancedSectionSlice';
import { resultsSectionSlice } from './store/slices/resultsSectionSlice';

export { poiSlice };

export { loiSlice };

export { compareLayersSlice };

export { spectralExplorerSlice };

export { indexSlice };

export { aoiSlice };

export { mainMapSlice };

export { toolsSlice };

export { searchResultsSlice };

export { clmsSlice };

export { workspaceSlice };

export { notificationSlice };

export { floatingPanelNotificationSlice };

export { tabsSlice };

export { languageSlice };

export { collapsiblePanelSlice };

export { modalSlice };

export { loginPromptSlice };

export { authSlice };

export { externalLayersSlice };

export { timelapseSlice };

export { elevationProfileSlice };

export { pinsSlice };

export { terrainViewerSlice };

export { productDownloadSlice };

export { visualizationSlice };

export { themesSlice };

export { imageQualityAndProviderSectionSlice };

export { areaAndTimeSectionSlice };

export { advancedSectionSlice };

export { resultsSectionSlice };

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
  loginPrompt: loginPromptSlice.reducer,
  visualization: visualizationSlice.reducer,
  tabs: tabsSlice.reducer,
  compare: compareLayersSlice.reducer,
  language: languageSlice.reducer,
  pins: pinsSlice.reducer,
  timelapse: timelapseSlice.reducer,
  index: indexSlice.reducer,
  terrainViewer: terrainViewerSlice.reducer,
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
  externalLayers: externalLayersSlice.reducer,
  workspace: workspaceSlice.reducer,
});

const store = configureStore({
  reducer: reducers,
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware({ serializableCheck: false }).concat(externalLayersPersistenceMiddleware.middleware),
}); // Due to "A non-serializable value was detected in an action" => https://github.com/rt2zz/redux-persist/issues/988

export default store;
