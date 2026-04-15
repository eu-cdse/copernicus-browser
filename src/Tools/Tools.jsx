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
import { savePinsToServer, savePinsToSessionStorage, constructPinFromProps } from './Pins/Pin.utils';
import { getOrbitDirectionFromList } from './VisualizationPanel/VisualizationPanel.utils';
import { checkIfCustom } from './SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY,
  FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG,
} from '../const';

import './Tools.scss';
import { TABS } from '../const';
import { getVisualizationEffectsFromStore } from '../utils/effectsUtils';
import { USE_PINS_BACKEND } from './Pins/const';
import { checkUserAccount } from './CommercialDataPanel/commercialData.utils';
import RapidResponseDesk from './RapidResponseDesk/RapidResponseDesk';
import { isInGroup } from '../Auth/authHelpers';
import { RRD_GROUP } from '../api/RRD/assets/rrd.utils';

// const COMMERCIAL_DATA_ENABLED = false;

class Tools extends Component {
  state = {
    selectedPin: null,
    selectedResult: null,
    userAccountInfo: null,
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
    if (this.props.user && isInGroup(RRD_GROUP) && !this.props.layerId) {
      store.dispatch(tabsSlice.actions.setTabIndex(TABS.RAPID_RESPONSE_DESK));
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
    if (this.props?.user?.access_token && !prevProps.user?.access_token) {
      let userAccountInfo;
      try {
        userAccountInfo = await checkUserAccount(this.props.user);
      } catch (err) {
        console.error(err);
      } finally {
        this.setState({ userAccountInfo: userAccountInfo });
      }
    }

    if (!this.props?.user?.access_token && prevProps.user?.access_token) {
      this.setState({ userAccountInfo: null });
      if (this.props.selectedTabIndex === TABS.COMMERCIAL_TAB) {
        store.dispatch(tabsSlice.actions.setTabIndex(TABS.VISUALIZE_TAB));
      }
    }

    const searchConfigFromSession = JSON.parse(
      sessionStorage.getItem(ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY),
    );
    if (searchConfigFromSession?.shouldShowAdvancedSearchTab) {
      store.dispatch(tabsSlice.actions.setTabIndex(TABS.SEARCH_TAB));
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
    sessionStorage.setItem(
      ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY,
      JSON.stringify({
        ...searchConfigFromSession,
        shouldShowAdvancedSearchTab: index === TABS.SEARCH_TAB,
      }),
    );
  };

  savePin = async () => {
    const {
      datasetId,
      layerId,
      visualizationUrl,
      evalscript,
      customSelected,
      selectedThemeId,
      newPinsCount,
      evalscriptUrl,
      processGraph,
      processGraphUrl,
    } = this.props;
    if (!import.meta.env.VITE_CDSE_BACKEND) {
      store.dispatch(notificationSlice.actions.displayError(FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG));
      return;
    }
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
    if (USE_PINS_BACKEND && this.props.user.userdata) {
      const { uniqueId } = await savePinsToServer([pin]);
      this.setLastAddedPin(uniqueId);
    } else {
      const uniqueId = savePinsToSessionStorage([pin]);
      this.setLastAddedPin(uniqueId);
    }
    store.dispatch(pinsSlice.actions.setNewPinsCount(newPinsCount + 1));
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
            {/*This check disabled for now. Waiting on role check response from API*/}
            {isInGroup(RRD_GROUP) && (
              <Tab
                id="rapid-response-desk-tab"
                title={t`Order`}
                /*This check disabled for now. Waiting on role check response from API*/
                // enabled={userAccountInfo?.payingAccount}
                renderKey={TABS.RAPID_RESPONSE_DESK}
              >
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
      mode: state.modes.selectedMode,
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
