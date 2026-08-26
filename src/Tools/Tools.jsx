import React, { Component } from 'react';
import { useSelector, shallowEqual } from 'react-redux';
import center from '@turf/center';
import moment from 'moment';
import { t } from 'ttag';

import HeaderWithLogin from './Header/Header';
import VisualizationPanel from './VisualizationPanel/VisualizationPanel';
import { Tabs, Tab } from '../junk/Tabs/Tabs';
import ToolsFooter from './ToolsFooter/ToolsFooter';
import AdvancedSearch from './VisualizationPanel/CollectionSelection/AdvancedSearch/AdvancedSearch';
import store, { notificationSlice, visualizationSlice, tabsSlice, pinsSlice, mainMapSlice } from '../store';
import { selectActiveExternalLayer } from '../store/slices/externalLayersSlice';
import {
  savePinsToServer,
  saveLocalPins,
  constructPinFromProps,
  buildExternalWmsPayload,
  shouldUsePinsBackend,
} from './Pins/Pin.utils';
import { getOrbitDirectionFromList } from './VisualizationPanel/VisualizationPanel.utils';
import { checkIfCustom } from './SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY,
  FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG,
  FATHOM_TRACK_EVENT_LIST,
} from '../const';

import './Tools.scss';
import { TABS } from '../const';
import { getVisualizationEffectsFromStore } from '../utils/effectsUtils';
import { persistSearchConfig } from '../utils/searchConfigPersistence';
import RapidResponseDesk from './RapidResponseDesk/RapidResponseDesk';
import { isInGroup } from '../Auth/authHelpers';
import { RRD_GROUP } from '../api/RRD/assets/rrd.utils';
import { handleFathomTrackEvent } from '../utils/fathom';

export class Tools extends Component {
  state = {
    selectedPin: null,
    selectedResult: null,
  };

  setTimeSpanExpanded = (isExpanded) => {
    this.setState({
      timespanExpanded: isExpanded,
    });
  };

  setShowEffects = (showEffects) => {
    this.setState({ showEffects: showEffects });
  };

  componentDidMount() {
    const showRapidResponseDeskTab = this.props.user && isInGroup(RRD_GROUP) && !this.props.layerId;
    if (showRapidResponseDeskTab) {
      store.dispatch(tabsSlice.actions.setTabIndex(TABS.RAPID_RESPONSE_DESK));
    }

    // Restore the persisted tab on page refresh. URLParamsParser gates rendering of
    // its children (App, Tools) until its async componentDidMount completes — its
    // render() returns null until params is set via setState, which happens right after
    // setStore() dispatches the URL-derived tab. So this mount always runs after that
    // tab dispatch (not because of parent-before-child mount order — React mounts
    // children first), letting us override to the Search tab when the user's last
    // session ended there. Kept out of componentDidUpdate so it doesn't fight
    // programmatic switches to the Visualise tab (pins, RRD, etc.).
    //
    // Note: this uses sessionStorage, which is cleared when the tab/session ends, so
    // the flag only ever reflects the current session. A datasetId in the URL therefore
    // does NOT mean "fresh shared link" here — when the flag is set the user genuinely
    // switched to Search in this session, and Search must win on refresh (issue #1065).
    //
    // The RRD tab override above takes precedence: when it fires, skip the Search restore
    // so an RRD user isn't bounced off their tab on refresh.
    if (!showRapidResponseDeskTab) {
      let searchConfigFromSession = null;
      try {
        searchConfigFromSession = JSON.parse(
          sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY),
        );
      } catch {
        // Corrupted sessionStorage entry — treat as absent.
      }
      if (searchConfigFromSession?.shouldShowAdvancedSearchTab) {
        store.dispatch(tabsSlice.actions.setTabIndex(TABS.SEARCH_TAB));
      }
    }
  }

  async componentDidUpdate(prevProps) {
    if (prevProps.user !== this.props.user && !prevProps.user.access_token && isInGroup(RRD_GROUP)) {
      if (!this.props.layerId) {
        store.dispatch(tabsSlice.actions.setTabIndex(TABS.RAPID_RESPONSE_DESK));
      }
    }

    if (
      prevProps.selectedModeId !== this.props.selectedModeId ||
      prevProps.selectedThemeId !== this.props.selectedThemeId
    ) {
      this.resetSearch();
    }
  }

  onSearchFinished = (query) => {
    this.setState({
      resultsAvailable: true,
      showEffects: false,
    });
    this.props.setQuery(query);
  };

  resetSearch = () => {
    this.setState({
      resultsAvailable: false,
      showEffects: false,
    });
  };

  setSelectedDate = (date) => {
    const fromTime = moment(date).utc().startOf('day');
    const toTime = moment(date).utc().endOf('day');

    store.dispatch(
      visualizationSlice.actions.setVisualizationTime({
        fromTime: fromTime,
        toTime: toTime,
      }),
    );
  };

  setActiveTabIndex = (index) => {
    store.dispatch(tabsSlice.actions.setTabIndex(index));
    store.dispatch(mainMapSlice.actions.clearQuicklookOverlays());

    if (index !== TABS.VISUALIZE_TAB) {
      store.dispatch(mainMapSlice.actions.setIs3D(false));
    }

    const searchConfigFromSession = JSON.parse(
      sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY),
    );
    persistSearchConfig({
      ...searchConfigFromSession,
      shouldShowAdvancedSearchTab: index === TABS.SEARCH_TAB,
    });
  };

  savePin = async () => {
    const { zoom, lat, lng, selectedThemeId, newPinsCount } = this.props;
    if (!import.meta.env.VITE_CDSE_BACKEND) {
      store.dispatch(notificationSlice.actions.displayError(FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG));
      return;
    }

    const activeExternalLayer = selectActiveExternalLayer(store.getState());
    if (activeExternalLayer) {
      const pin = {
        title: activeExternalLayer.layerTitle,
        lat,
        lng,
        zoom,
        themeId: selectedThemeId,
        datasetId: null,
        visualizationUrl: null,
        externalWms: buildExternalWmsPayload(activeExternalLayer),
      };
      // Logged-in users' WMS/WMTS pins are saved to the backend like native pins; anonymous users
      // keep them in per-user localStorage. The externalWms field is a companion backend change
      // (see #1076) that may not be deployed yet, so fall back to local storage on failure instead
      // of losing the pin. WMS/WMTS pins were always-local before this change.
      const uniqueId = await this.savePinToServerOrLocal(pin, { fallbackToLocalOnError: true });
      if (!uniqueId) {
        return;
      }
      handleFathomTrackEvent(
        FATHOM_TRACK_EVENT_LIST.EXTERNAL_LAYER_ADD_TO_PINS,
        activeExternalLayer.server.type,
      );
      this.setLastAddedPin(uniqueId);
      store.dispatch(pinsSlice.actions.setNewPinsCount(newPinsCount + 1));
      return;
    }

    const {
      datasetId,
      layerId,
      visualizationUrl,
      evalscript,
      customSelected,
      evalscriptUrl,
      processGraph,
      processGraphUrl,
    } = this.props;
    if (
      !(
        datasetId &&
        selectedThemeId &&
        visualizationUrl &&
        (layerId || (customSelected && (evalscript || evalscriptUrl || processGraph || processGraphUrl)))
      )
    ) {
      return null;
    }
    let pin = await constructPinFromProps(this.props);
    const uniqueId = await this.savePinToServerOrLocal(pin);
    if (!uniqueId) {
      return;
    }
    this.setLastAddedPin(uniqueId);
    store.dispatch(pinsSlice.actions.setNewPinsCount(newPinsCount + 1));
  };

  // Saves a pin to the backend for logged-in users, or to per-user
  // localStorage otherwise. On a backend failure, either falls back to local storage (used for
  // WMS/WMTS pins, which were always-local before #1076) or surfaces an error notification and
  // returns null so the caller can bail out without incrementing the pins count.
  // shouldUsePinsBackend(user) is the same gate duplicated, without this fallback/notify safety, in
  // PinTools.jsx (onImportPins), Highlights.jsx (savePin) and Pin.utils.js (importSharedPins) —
  // intentionally left as-is, extending those sites is out of scope for #1076.
  savePinToServerOrLocal = async (pin, { fallbackToLocalOnError = false } = {}) => {
    if (shouldUsePinsBackend(this.props.user.userdata)) {
      try {
        const { uniqueId } = await savePinsToServer([pin]);
        return uniqueId;
      } catch (e) {
        if (fallbackToLocalOnError) {
          console.warn('Falling back to local pin storage after backend save failed:', e);
          return saveLocalPins([pin]);
        }
        store.dispatch(notificationSlice.actions.displayError(t`Unable to save pin.`));
        return null;
      }
    }
    return saveLocalPins([pin]);
  };

  saveLocalPinsOnLogin = async (pins) => {
    return await savePinsToServer(pins);
  };

  setLastAddedPin = (id) => {
    this.props.setLastAddedPin(id);
  };

  setSelectedPin = (pin) => {
    this.setState({
      selectedPin: pin,
      selectedResult: null,
      showEffects: false,
    });
  };

  // returns an object with the correct lng, lat and zoom based on selected pin or selected search result
  // returns null when a search result or a pin are not selected
  getZoomToTileConfig = () => {
    const { selectedResult, selectedPin } = this.state;
    const isBYOC = !!checkIfCustom(this.props.datasetId);

    if (selectedResult && selectedResult.geometry) {
      const tileCenterPoint = center({
        type: 'Feature',
        geometry: selectedResult.geometry,
      });
      return {
        lng: parseFloat(tileCenterPoint.geometry.coordinates[0]),
        lat: parseFloat(tileCenterPoint.geometry.coordinates[1]),
        zoom: isBYOC ? undefined : 10, // We shouldn't have a predefined zoom for BYOC, because the areas with data can be very small. Ideally we would calculate optimal zoom from tile geometry, but that can wait for now.
      };
    }
    if (selectedPin) {
      return {
        lng: selectedPin.lng,
        lat: selectedPin.lat,
        zoom: selectedPin.zoom,
      };
    }
    return null;
  };

  setDefaultStateLandingPage = () => {
    window.location.href = import.meta.env.VITE_ROOT_URL;
  };

  render() {
    const {
      toolsOpen,
      toggleTools,
      showLayerPanel,
      setShowLayerPanel,
      showHighlightPanel,
      setShowHighlightPanel,
      showPinPanel,
      setShowPinPanel,
      showComparePanel,
      setShowComparePanel,
      setLastAddedPin,
      compareShare,
    } = this.props;

    return (
      <div className="tools-wrapper" style={{ width: toolsOpen ? '100%' : '0' }}>
        <div className="open-tools" onClick={toggleTools} style={{ display: toolsOpen ? 'none ' : 'block' }}>
          <i className="fa fa-bars" />
        </div>
        <div className="tools-container" style={{ display: toolsOpen ? 'flex' : 'none' }}>
          <HeaderWithLogin
            toggleTools={toggleTools}
            setDefaultStateLandingPage={this.setDefaultStateLandingPage}
          />
          <Tabs
            activeIndex={this.props.selectedTabIndex}
            onErrorMessage={(msg) => store.dispatch(notificationSlice.actions.displayError(msg))}
            onSelect={this.setActiveTabIndex}
            isLoggedIn={!!this.props.user?.userdata}
          >
            <Tab id="visualization-tab" title={t`Visualise`} renderKey={TABS.VISUALIZE_TAB}>
              <VisualizationPanel
                savePin={this.savePin}
                showLayerPanel={showLayerPanel}
                setShowLayerPanel={setShowLayerPanel}
                showHighlightPanel={showHighlightPanel}
                setShowHighlightPanel={setShowHighlightPanel}
                showPinPanel={showPinPanel}
                setShowPinPanel={setShowPinPanel}
                showComparePanel={showComparePanel}
                setShowComparePanel={setShowComparePanel}
                setLastAddedPin={setLastAddedPin}
                saveLocalPinsOnLogin={this.saveLocalPinsOnLogin}
                compareShare={compareShare}
              />
            </Tab>
            <Tab id="search-tab" title={t`Search`} renderKey={TABS.SEARCH_TAB}>
              <div className="advanced-search-wrapper">
                <AdvancedSearch
                  showLayerPanel={showLayerPanel}
                  setShowLayerPanel={setShowLayerPanel}
                  isExpanded={true}
                />
              </div>
            </Tab>
            {isInGroup(RRD_GROUP) && (
              <Tab id="rapid-response-desk-tab" title={t`Order`} renderKey={TABS.RAPID_RESPONSE_DESK}>
                <div className="rapid-response-desk-wrapper">
                  <RapidResponseDesk />
                </div>
              </Tab>
            )}
          </Tabs>
          <ToolsFooter selectedLanguage={this.props.selectedLanguage} />
        </div>
      </div>
    );
  }
}

function ToolsConnector(ownProps) {
  const reduxProps = useSelector(
    (state) => ({
      user: state.auth.user,
      access_token: state.auth.user.access_token,
      zoom: state.mainMap.zoom,
      lat: state.mainMap.lat,
      lng: state.mainMap.lng,
      fromTime: state.visualization.fromTime,
      toTime: state.visualization.toTime,
      dateMode: state.visualization.dateMode,
      datasetId: state.visualization.datasetId,
      visualizationUrl: state.visualization.visualizationUrl,
      layerId: state.visualization.layerId,
      customSelected: state.visualization.customSelected,
      evalscript: state.visualization.evalscript,
      evalscriptUrl: state.visualization.evalscriptUrl,
      dataFusion: state.visualization.dataFusion,
      cloudCoverage: state.visualization.cloudCoverage,
      selectedTabIndex: state.tabs.selectedTabIndex,
      selectedLanguage: state.language.selectedLanguage,
      ...getVisualizationEffectsFromStore(state),
      orbitDirection: getOrbitDirectionFromList(state.visualization.orbitDirection),
      demSource3D: state.visualization.demSource3D,
      selectedThemesListId: state.themes.selectedThemesListId,
      themesLists: state.themes.themesLists,
      selectedThemeId: state.themes.selectedThemeId,
      selectedModeId: state.themes.selectedModeId,
      newCompareLayersCount: state.compare.newCompareLayersCount,
      terrainViewerSettings: state.terrainViewer.settings,
      is3D: state.mainMap.is3D,
      searchResults: state.searchResults.searchResults,
      newPinsCount: state.pins.newPinsCount,
      selectedProcessing: state.visualization.selectedProcessing,
      processGraph: state.visualization.processGraph,
      processGraphUrl: state.visualization.processGraphUrl,
    }),
    shallowEqual,
  );
  return <Tools {...ownProps} {...reduxProps} />;
}

export default ToolsConnector;
