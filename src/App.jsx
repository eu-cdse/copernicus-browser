import React, { Component } from 'react';
import { connect } from 'react-redux';
import {
  setAuthToken,
  registerHostnameReplacing,
  setDefaultRequestsConfig,
} from '@sentinel-hub/sentinelhub-js';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';
import { isMobile } from 'react-device-detect';

import store, { notificationSlice, visualizationSlice, themesSlice, toolsSlice } from './store';
import Map from './Map/Map';
import Notification from './Notification/Notification';
import Tools from './Tools/Tools';
import { Modals, propsSufficientToRender } from './Modals/Utils';
import { updatePath } from './utils/';
import { importSharedPins } from './Tools/Pins/Pin.utils';
import TerrainViewerScriptProvider from './TerrainViewer/TerrainViewerScriptProvider';
import TerrainViewer from './TerrainViewer/TerrainViewer';
import Tutorial from './Tutorial/Tutorial';
import SearchBox from './SearchBox/SearchBox';
import { getZoomConfiguration } from './Tools/SearchPanel/dataSourceHandlers/helper';

import './App.scss';
import FloatingNotificationPanel from './Notification/FloatingNotificationPanel';
import { FloatingWorkspaceNotificationPanel } from './Notification/FloatingWorkspaceNotificationPanel';
import { getVisualizationEffectsFromStore } from './utils/effectsUtils';
import { getNotSupportedIn3DMsg } from './junk/ConstMessages';

class App extends Component {
  state = {
    lastAddedPin: null,
    hasSwitchedFrom3D: false,
    showLayerPanel: true,
    showHighlightPanel: false,
    showPinPanel: false,
    showComparePanel: false,
  };

  async componentDidMount() {
    const { sharedPinsListIdFromUrlParams, compareShare } = this.props;
    if (sharedPinsListIdFromUrlParams) {
      if (import.meta.env.VITE_CDSE_BACKEND) {
        const pins = await importSharedPins(sharedPinsListIdFromUrlParams);
        if (pins) {
          this.setLastAddedPin(pins.uniqueId);
        }
      } else {
        store.dispatch(
          notificationSlice.actions.displayError(
            'Accessing shared pins is temporarily unavailable due to updates. Please try again later.',
          ),
        );
      }
      this.setState({ showPinPanel: true });
    }

    if (compareShare) {
      this.setShowComparePanel(true);
    }

    // this allows using an alternative hostname for SH services, which is useful for testing purposes:
    if (window.API_ENDPOINT_CONFIG.SH_SERVICES_URL) {
      const newHostname = window.API_ENDPOINT_CONFIG.SH_SERVICES_URL.replace('https://', '');
      registerHostnameReplacing('sh.dataspace.copernicus.eu', newHostname);
      registerHostnameReplacing('services.sentinel-hub.com', newHostname);
    }

    setDefaultRequestsConfig({
      rewriteUrlFunc: (url) => {
        // performance optimization: instead of original GetCapabilities requests, use
        // the proxied ones: (gzipped)
        if (
          url.startsWith('https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi?') &&
          url.includes('request=GetCapabilities')
        ) {
          return 'https://eob-getcapabilities-cache-prod.s3.eu-central-1.amazonaws.com/gibs.xml';
        }
        if (
          url.startsWith('https://services.terrascope.be/wms/v2') &&
          url.includes('request=GetCapabilities')
        ) {
          return 'https://eob-getcapabilities-cache-prod.s3.eu-central-1.amazonaws.com/probav.xml';
        }
        return url;
      },
    });

    if (!!isMobile) {
      store.dispatch(toolsSlice.actions.setOpen(false));
    }
  }

  async componentDidUpdate(prevProps) {
    if (this.props.handlePositions === prevProps.handlePositions) {
      updatePath({ ...this.props });
    } else {
      updatePath({ ...this.props }, false);
    }

    if (this.props.authToken && this.props.authToken !== prevProps.authToken) {
      setAuthToken(this.props.authToken);
    }

    if (prevProps.is3D && !this.props.is3D) {
      this.setState({ hasSwitchedFrom3D: true });
    }
    if (!prevProps.is3D && this.props.is3D) {
      this.setState({ hasSwitchedFrom3D: false });
    }
  }

  setShowLayerPanel = (showLayerPanel) => {
    if (showLayerPanel) {
      this.setState({
        showLayerPanel,
        showHighlightPanel: false,
        showComparePanel: false,
        showPinPanel: false,
      });
    } else {
      this.setState({ showLayerPanel });
    }
  };

  setShowHighlightPanel = (showHighlightPanel) => {
    if (showHighlightPanel) {
      this.setState({
        showHighlightPanel,
        showLayerPanel: false,
        showComparePanel: false,
        showPinPanel: false,
      });
    } else {
      this.setState({ showHighlightPanel });
    }
  };

  setShowPinPanel = (showPinPanel) => {
    if (showPinPanel) {
      this.setState({
        showPinPanel,
        showHighlightPanel: false,
        showComparePanel: false,
        showLayerPanel: false,
      });
    } else {
      this.setState({ showPinPanel });
    }
  };

  setShowComparePanel = (showComparePanel) => {
    if (showComparePanel) {
      if (this.props.is3D) {
        store.dispatch(notificationSlice.actions.displayError(getNotSupportedIn3DMsg()));
      } else {
        this.setState({
          showComparePanel,
          showHighlightPanel: false,
          showPinPanel: false,
          showLayerPanel: false,
        });
      }
    } else {
      this.setState({ showComparePanel });
    }
  };

  setLastAddedPin = (lastAddedPin) => this.setState({ lastAddedPin: lastAddedPin });

  onSelectMode = (modeId) => {
    store.dispatch(visualizationSlice.actions.reset());
    store.dispatch(themesSlice.actions.setSelectedModeIdAndDefaultTheme(modeId));
  };

  toggleTools = () => {
    store.dispatch(toolsSlice.actions.setOpen(!this.props.toolsOpen));
  };

  shouldDisplayTileGeometries = (shouldDisplay) => {
    this.setState({
      displayingTileGeometries: shouldDisplay,
    });
  };

  render() {
    const { modalId, modalParams, authToken, googleAPI, is3D, terrainViewerId, datasetId } = this.props;
    const authenticated = Boolean(authToken);
    const zoomConfig = getZoomConfiguration(datasetId);
    return (
      <div id="app">
        <Tools
          setLastAddedPin={this.setLastAddedPin}
          lastAddedPin={this.state.lastAddedPin}
          getThemeAndSetMode={this.getThemeAndSetMode}
          toolsOpen={this.props.toolsOpen}
          toggleTools={this.toggleTools}
          showLayerPanel={this.state.showLayerPanel}
          setShowLayerPanel={this.setShowLayerPanel}
          showHighlightPanel={this.state.showHighlightPanel}
          setShowHighlightPanel={this.setShowHighlightPanel}
          showPinPanel={this.state.showPinPanel}
          setShowPinPanel={this.setShowPinPanel}
          showComparePanel={this.state.showComparePanel}
          setShowComparePanel={this.setShowComparePanel}
          compareShare={this.props.compareShare}
        />
        <TerrainViewerScriptProvider>
          <TerrainViewer setLastAddedPin={this.setLastAddedPin} toolsOpen={this.props.toolsOpen} />
        </TerrainViewerScriptProvider>
        {!is3D && (
          <>
            <Map
              authenticated={authenticated}
              histogramContainer={this.histogramHolder}
              googleAPI={googleAPI}
              shouldAnimateControls={this.state.hasSwitchedFrom3D}
              toolsOpen={this.props.toolsOpen}
              showComparePanel={this.state.showComparePanel}
            />
            <FloatingNotificationPanel googleAPI={googleAPI} />
            <FloatingWorkspaceNotificationPanel />
          </>
        )}
        {modalId &&
          propsSufficientToRender(this.props) &&
          Modals[modalId]({
            setLastAddedPin: this.setLastAddedPin,
            showComparePanel: this.state.showComparePanel,
            ...(modalParams ? modalParams : null),
          })}
        <Notification />
        {!is3D && !terrainViewerId && authenticated && (
          <Tutorial selectedLanguage={this.props.selectedLanguage} />
        )}
        {is3D && (
          <SearchBox
            googleAPI={googleAPI}
            giscoAPI={true}
            is3D={true}
            minZoom={zoomConfig.min}
            maxZoom={zoomConfig.max}
            zoom={this.props.zoom}
          />
        )}
        <div className="histogram-holder" ref={(e) => (this.histogramHolder = e)} />
      </div>
    );
  }
}

export const getAppropriateAuthToken = (auth, selectedThemeId) => {
  if (!selectedThemeId) {
    return null;
  }

  return auth.user.access_token ?? auth.anonToken;
};

export const getGetMapAuthToken = (auth) => {
  if (auth.user) {
    const now = new Date().valueOf();
    const isTokenExpired = auth.user.token_expiration < now;

    if (!isTokenExpired) {
      return auth.user.access_token;
    }
  }
  return auth.anonToken;
};

const mapStoreToProps = (store) => ({
  handlePositions: store.index.handlePositions,
  gradient: store.index.gradient,
  modalId: store.modal.id,
  modalParams: store.modal.params,
  currentZoom: store.mainMap.zoom,
  currentLat: store.mainMap.lat,
  currentLng: store.mainMap.lng,
  is3D: store.mainMap.is3D,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  dateMode: store.visualization.dateMode,
  datasetId: store.visualization.datasetId,
  visualizationUrl: store.visualization.visualizationUrl,
  layerId: store.visualization.layerId,
  customSelected: store.visualization.customSelected,
  evalscript: store.visualization.evalscript,
  evalscripturl: store.visualization.evalscripturl,
  cloudCoverage: store.visualization.cloudCoverage,
  themesUrl: store.themes.themesUrl,
  authToken: getAppropriateAuthToken(store.auth, store.themes.selectedThemeId),
  user: store.auth.user.userdata,
  anonToken: store.auth.anonToken,
  access_token: store.auth.user.access_token,
  selectedTabIndex: store.tabs.selectedTabIndex,
  selectedLanguage: store.language.selectedLanguage,
  mode: store.modes.selectedMode,
  ...getVisualizationEffectsFromStore(store),
  demSource3D: store.visualization.demSource3D,
  orbitDirection: store.visualization.orbitDirection,
  dataFusion: store.visualization.dataFusion,
  selectedThemeId: store.themes.selectedThemeId,
  selectedModeId: store.themes.selectedModeId,
  pixelBounds: store.mainMap.pixelBounds,
  terrainViewerSettings: store.terrainViewer.settings,
  timelapse: store.timelapse,
  terrainViewerId: store.terrainViewer.id,
  timelapseSharePreviewMode: store.timelapse.timelapseSharePreviewMode,
  termsPrivacyAccepted: store.auth.terms_privacy_accepted,
  tokenRefreshInProgress: store.auth.tokenRefreshInProgress,
  toolsOpen: store.tools.open,
});

export default connect(mapStoreToProps, null)(App);
