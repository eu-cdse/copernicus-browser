import React, { Component } from 'react';
import { connect } from 'react-redux';
import center from '@turf/center';
import moment from 'moment';
import { t } from 'ttag';

import HeaderWithLogin from './Header/Header';
import VisualizationPanel from './VisualizationPanel/VisualizationPanel';
import { Tabs, Tab } from '../junk/Tabs/Tabs';
import ToolsFooter from './ToolsFooter/ToolsFooter';
import AdvancedSearch from './VisualizationPanel/CollectionSelection/AdvancedSearch/AdvancedSearch';
import store, { notificationSlice, visualizationSlice, tabsSlice, pinsSlice } from '../store';
import { savePinsToServer, savePinsToSessionStorage, constructPinFromProps } from './Pins/Pin.utils';
import { getOrbitDirectionFromList } from './VisualizationPanel/VisualizationPanel.utils';
import { checkIfCustom } from './SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG } from '../const';

import './Tools.scss';
import { TABS } from '../const';
import { getVisualizationEffectsFromStore } from '../utils/effectsUtils';
import { USE_PINS_BACKEND } from './Pins/PinPanel';

class Tools extends Component {
  state = {
    selectedPin: null,
    selectedResult: null,
    showHighlights: false,
  };

  setTimeSpanExpanded = (isExpanded) => {
    this.setState({
      timespanExpanded: isExpanded,
    });
  };

  setShowEffects = (showEffects) => {
    this.setState({ showEffects: showEffects });
  };

  setShowHighlights = (shouldShowHighlights) => {
    this.setState({ showHighlights: shouldShowHighlights });
  };

  componentDidUpdate(prevProps) {
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
  };

  savePin = async () => {
    const {
      datasetId,
      layerId,
      visualizationUrl,
      evalscript,
      evalscripturl,
      customSelected,
      selectedThemeId,
      newPinsCount,
    } = this.props;
    if (!process.env.REACT_APP_EOB_BACKEND) {
      store.dispatch(notificationSlice.actions.displayError(FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG));
      return;
    }
    if (
      !(
        datasetId &&
        selectedThemeId &&
        visualizationUrl &&
        (layerId || (customSelected && (evalscript || evalscripturl)))
      )
    ) {
      return null;
    }
    let pin = await constructPinFromProps(this.props);
    if (USE_PINS_BACKEND && this.props.user) {
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
    window.location.href = process.env.REACT_APP_ROOT_URL;
  };

  render() {
    const {
      googleAPI,
      toolsOpen,
      toggleTools,
      showLayerPanel,
      setShowLayerPanel,
      showPinPanel,
      setShowPinPanel,
      showComparePanel,
      setShowComparePanel,
      setLastAddedPin,
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
          >
            <Tab id="visualization-tab" title={t`Visualize`} renderKey={TABS.VISUALIZE_TAB}>
              <VisualizationPanel
                googleAPI={googleAPI}
                savePin={this.savePin}
                showLayerPanel={showLayerPanel}
                setShowLayerPanel={setShowLayerPanel}
                showPinPanel={showPinPanel}
                setShowPinPanel={setShowPinPanel}
                showComparePanel={showComparePanel}
                setShowComparePanel={setShowComparePanel}
                setLastAddedPin={setLastAddedPin}
                saveLocalPinsOnLogin={this.saveLocalPinsOnLogin}
                showHighlights={this.state.showHighlights}
                setShowHighlights={this.setShowHighlights}
              />
            </Tab>
            <Tab id="visualization-tab" title={t`Search`} renderKey={TABS.SEARCH_TAB}>
              <div className="advanced-search-wrapper">
                <AdvancedSearch
                  showLayerPanel={showLayerPanel}
                  setShowLayerPanel={setShowLayerPanel}
                  isExpanded={true}
                />
              </div>
            </Tab>
          </Tabs>
          <ToolsFooter selectedLanguage={this.props.selectedLanguage} />
        </div>
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  user: store.auth.user.userdata,
  access_token: store.auth.user.access_token,
  zoom: store.mainMap.zoom,
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  datasetId: store.visualization.datasetId,
  visualizationUrl: store.visualization.visualizationUrl,
  layerId: store.visualization.layerId,
  customSelected: store.visualization.customSelected,
  evalscript: store.visualization.evalscript,
  evalscripturl: store.visualization.evalscripturl,
  dataFusion: store.visualization.dataFusion,
  cloudCoverage: store.visualization.cloudCoverage,
  selectedTabIndex: store.tabs.selectedTabIndex,
  selectedLanguage: store.language.selectedLanguage,
  mode: store.modes.selectedMode,
  ...getVisualizationEffectsFromStore(store),
  orbitDirection: getOrbitDirectionFromList(store.visualization.orbitDirection),
  demSource3D: store.visualization.demSource3D,
  selectedThemesListId: store.themes.selectedThemesListId,
  themesLists: store.themes.themesLists,
  selectedThemeId: store.themes.selectedThemeId,
  selectedModeId: store.themes.selectedModeId,
  newCompareLayersCount: store.compare.newCompareLayersCount,
  terrainViewerSettings: store.terrainViewer.settings,
  is3D: store.mainMap.is3D,
  searchResults: store.searchResults.searchResults,
  newPinsCount: store.pins.newPinsCount,
});

export default connect(mapStoreToProps, null)(Tools);
