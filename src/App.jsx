import React, { Component } from 'react';
import { connect } from 'react-redux';
import { setAuthToken, registerHostnameReplacing } from '@sentinel-hub/sentinelhub-js';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';
import { isMobile } from 'react-device-detect';
import { t } from 'ttag';

import store, {
  notificationSlice,
  visualizationSlice,
  themesSlice,
  toolsSlice,
  tabsSlice,
  panelSlice,
} from './store';
import { externalLayersSlice } from './store/slices/externalLayersSlice';
import { markExternalLayersHydrated } from './ExternalLayers/externalLayersPersistence';
import { resolveHydratedExternalLayers } from './ExternalLayers/hydrateExternalServers';
import Map from './Map/Map';
import Notification from './Notification/Notification';
import LoginPrompt from './Auth/LoginPrompt/LoginPrompt';
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
import { PANEL } from './const';

// All five Visualize sub-panels — Layers, Highlights, Pins, Compare and WMS — live in one Redux
// slice (panelSlice): `openPanel` enforces "only one open at a time" in a single place, instead of
// the previous split where Layers/Highlights/Pins/Compare were local React state here and WMS alone
// lived in Redux, which forced every call site that opened WMS to also remember to manually close
// the other four (see MR !1226 review, tracked as issue #1275). Highlights/Pins are seeded from the
// `panel` URL param by URLParamsParser.js before App ever mounts; Layers is panelSlice's default
// initial state. Compare and WMS are opened here in componentDidMount below, since both depend on
// data that isn't available synchronously at store-creation time.

class App extends Component {
  state = {
    lastAddedPin: null,
    hasSwitchedFrom3D: false,
    // Synchronously true from the first render whenever a shared-pins link is being opened, and
    // flipped false once componentDidMount's import below settles (success, cancel, or error) —
    // lets Tools.jsx suppress its RRD-tab auto-switch while the import is still in flight (see
    // hasPendingSharedPinsImport below and Tools.jsx's componentDidMount/componentDidUpdate).
    sharedPinsImportPending: !!this.props.sharedPinsListIdFromUrlParams,
  };

  // Rehydrates the user's persisted external WMS/WMTS servers (per user) on app mount. App renders
  // only after AuthProvider has resolved auth, so the store holds the correct user here. Not
  // awaited by componentDidMount (see below) so a slow/hung backend can't delay unrelated startup
  // steps; resolveHydratedExternalLayers has its own try/catch, so this never rejects.
  // markExternalLayersHydrated() is called last so the persistence middleware's write-gate keeps it
  // from saving empty initial state to the backend while this is in flight.
  hydrateExternalServers = async () => {
    const state = store.getState();
    const accessToken = state.auth?.user?.access_token;
    const isLoggedIn = !!state.auth?.user?.userdata && !!accessToken;

    const hydrated = await resolveHydratedExternalLayers(isLoggedIn, accessToken);
    if (hydrated) {
      store.dispatch(externalLayersSlice.actions.hydrateExternalLayers(hydrated));
    }
    markExternalLayersHydrated();
  };

  async componentDidMount() {
    // Not awaited: rehydrating external WMS/WMTS servers is unrelated to the steps below, and a
    // slow/hung backend must not delay them (mobile panel collapse, hostname override, etc.).
    // When the page was refreshed while the WMS panel was open (panel=wms in the URL, written live
    // by updatePath), reopen it once hydration resolves so CollectionSelection's own restore effect
    // (keyed off panelSlice's `wms` flag + lastActiveServerId) picks the last active server/layer
    // back up.
    // A hand-crafted URL can combine panel=wms with sharedPinsListId below, which independently
    // opens the Pins panel once the import resolves. Both now live in the same panelSlice, so they
    // can no longer both end up "open" at once the way local-state showPinPanel + Redux panelOpen
    // could before — whichever of these two async chains dispatches last would otherwise win. The
    // guard below keeps Pins winning regardless of ordering, matching the pre-refactor behaviour.
    const hydrateExternalServersDone = this.hydrateExternalServers();
    if (this.props.panelFromUrlParams === PANEL.WMS) {
      hydrateExternalServersDone
        .then(() => {
          // Don't override an already-open (or concurrently resolving) shared-pins import — Pins
          // must always win over a hand-crafted `panel=wms&sharedPinsListId=...` URL.
          if (!store.getState().panel.pins) {
            store.dispatch(panelSlice.actions.openPanel(PANEL.WMS));
          }
        })
        // hydrateExternalServers() itself never rejects (resolveHydratedExternalLayers has its own
        // try/catch), but this chain guards against an unhandled-rejection warning regardless.
        .catch(() => {});
    }

    // Tracks what showLayerPanel/showHighlightPanel will be once the dispatches below are applied.
    // A Redux dispatch updates the store synchronously, but this.props (derived via `connect`) only
    // catches up on the next render, so reading it directly after a dispatch here would still see
    // the pre-update value.
    let showLayerPanel = this.props.showLayerPanel;
    const showHighlightPanel = this.props.showHighlightPanel;

    const { sharedPinsListIdFromUrlParams, compareShareInit } = this.props;
    if (sharedPinsListIdFromUrlParams) {
      if (import.meta.env.VITE_CDSE_BACKEND) {
        try {
          const pins = await importSharedPins(sharedPinsListIdFromUrlParams);
          if (pins) {
            this.setLastAddedPin(pins.uniqueId);
            this.setShowPinPanel(true);
            showLayerPanel = false;
          }
        } catch (e) {
          console.error(e);
          store.dispatch(
            notificationSlice.actions.displayError(
              t`We could not load the shared pins. Please try opening the link again.`,
            ),
          );
        }
      } else {
        store.dispatch(
          notificationSlice.actions.displayError(
            t`Accessing shared pins is temporarily unavailable due to updates. Please try again later.`,
          ),
        );
      }
      this.setState({ sharedPinsImportPending: false });
    }

    if (compareShareInit) {
      this.setShowComparePanel(true);
      // setShowComparePanel(true) is a no-op on showLayerPanel when is3D (it shows an error
      // notification instead of switching panels) — see setShowComparePanel below.
      if (!this.props.is3D) {
        showLayerPanel = false;
      }
    }

    // this allows using an alternative hostname for SH services, which is useful for testing purposes:
    if (global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL) {
      const newHostname = global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL.replace('https://', '');
      registerHostnameReplacing('sh.dataspace.copernicus.eu', newHostname);
      registerHostnameReplacing('services.sentinel-hub.com', newHostname);
    }

    if (!!isMobile) {
      store.dispatch(toolsSlice.actions.setOpen(false));
    }

    store.dispatch(tabsSlice.actions.setIsVisualizingLayer(showLayerPanel || showHighlightPanel));
  }

  async componentDidUpdate(prevProps, _prevState) {
    if (this.props.handlePositions === prevProps.handlePositions) {
      updatePath({ ...this.props, ...this.state });
    } else {
      updatePath({ ...this.props, ...this.state }, false);
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

    // Keep the Redux mirror in sync (used by the AOI/POI Spectral Explorer & Statistical Info
    // buttons to disable outside the Layers/Highlights panels).
    const next = this.props.showLayerPanel || this.props.showHighlightPanel;
    const prev = prevProps.showLayerPanel || prevProps.showHighlightPanel;
    if (next !== prev) {
      store.dispatch(tabsSlice.actions.setIsVisualizingLayer(next));
    }
  }

  setShowLayerPanel = (showLayerPanel) => {
    store.dispatch(
      showLayerPanel
        ? panelSlice.actions.openPanel(PANEL.LAYERS)
        : panelSlice.actions.closePanel(PANEL.LAYERS),
    );
  };

  setShowHighlightPanel = (showHighlightPanel) => {
    store.dispatch(
      showHighlightPanel
        ? panelSlice.actions.openPanel(PANEL.HIGHLIGHTS)
        : panelSlice.actions.closePanel(PANEL.HIGHLIGHTS),
    );
  };

  setShowPinPanel = (showPinPanel) => {
    store.dispatch(
      showPinPanel ? panelSlice.actions.openPanel(PANEL.PINS) : panelSlice.actions.closePanel(PANEL.PINS),
    );
  };

  setShowComparePanel = (showComparePanel) => {
    if (showComparePanel) {
      if (this.props.is3D) {
        store.dispatch(notificationSlice.actions.displayError(getNotSupportedIn3DMsg()));
      } else {
        store.dispatch(panelSlice.actions.openPanel(PANEL.COMPARE));
      }
    } else {
      store.dispatch(panelSlice.actions.closePanel(PANEL.COMPARE));
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
    const {
      modalId,
      modalParams,
      authToken,
      googleAPI,
      loadGoogleApi,
      isGoogleApiLoading,
      is3D,
      terrainViewerId,
      datasetId,
      layerId,
    } = this.props;
    const authenticated = Boolean(authToken);
    const zoomConfig = getZoomConfiguration(datasetId, layerId);
    const hasPendingSharedPinsImport = this.state.sharedPinsImportPending;
    return (
      <div id="app">
        <Tools
          setLastAddedPin={this.setLastAddedPin}
          lastAddedPin={this.state.lastAddedPin}
          getThemeAndSetMode={this.getThemeAndSetMode}
          toolsOpen={this.props.toolsOpen}
          toggleTools={this.toggleTools}
          showLayerPanel={this.props.showLayerPanel}
          setShowLayerPanel={this.setShowLayerPanel}
          showHighlightPanel={this.props.showHighlightPanel}
          setShowHighlightPanel={this.setShowHighlightPanel}
          showPinPanel={this.props.showPinPanel}
          setShowPinPanel={this.setShowPinPanel}
          showComparePanel={this.props.showComparePanel}
          setShowComparePanel={this.setShowComparePanel}
          compareShare={this.props.compareShare}
          panelFromUrlParams={this.props.panelFromUrlParams}
          hasPendingSharedPinsImport={hasPendingSharedPinsImport}
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
              loadGoogleApi={loadGoogleApi}
              isGoogleApiLoading={isGoogleApiLoading}
              shouldAnimateControls={this.state.hasSwitchedFrom3D}
              toolsOpen={this.props.toolsOpen}
              showComparePanel={this.props.showComparePanel}
            />
            <FloatingNotificationPanel />
            <FloatingWorkspaceNotificationPanel />
          </>
        )}
        {modalId &&
          propsSufficientToRender(this.props) &&
          Modals[modalId]({
            setLastAddedPin: this.setLastAddedPin,
            showComparePanel: this.props.showComparePanel,
            ...(modalParams ? modalParams : null),
          })}
        <Notification />
        <LoginPrompt />
        {!is3D && !terrainViewerId && authenticated && (
          <Tutorial selectedLanguage={this.props.selectedLanguage} />
        )}
        {is3D && (
          <SearchBox
            googleAPI={googleAPI}
            loadGoogleApi={loadGoogleApi}
            isGoogleApiLoading={isGoogleApiLoading}
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
  evalscriptUrl: store.visualization.evalscriptUrl,
  processGraph: store.visualization.processGraph,
  processGraphUrl: store.visualization.processGraphUrl,
  selectedProcessing: store.visualization.selectedProcessing,
  cloudCoverage: store.visualization.cloudCoverage,
  themesUrl: store.themes.themesUrl,
  authToken: getAppropriateAuthToken(store.auth, store.themes.selectedThemeId),
  user: store.auth.user.userdata,
  anonToken: store.auth.anonToken,
  access_token: store.auth.user.access_token,
  selectedTabIndex: store.tabs.selectedTabIndex,
  selectedLanguage: store.language.selectedLanguage,
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
  termsPrivacyAccepted: store.auth.termsPrivacyAccepted,
  tokenRefreshInProgress: store.auth.tokenRefreshInProgress,
  toolsOpen: store.tools.open,
  clmsSelectedPath: store.clms.selectedPath,
  clmsSelectedCollection: store.clms.selectedCollection,
  clmsSelectedConsolidationPeriodIndex: store.clms.selectedConsolidationPeriodIndex,
  compareShare: store.compare.compareShare,
  compareMode: store.compare.compareMode,
  compareSharedPinsId: store.compare.compareSharedPinsId,
  comparedOpacity: store.compare.comparedOpacity,
  comparedClipping: store.compare.comparedClipping,
  useEvoland: store.themes.useEvoland,
  showLayerPanel: store.panel.layers,
  showHighlightPanel: store.panel.highlights,
  showPinPanel: store.panel.pins,
  showComparePanel: store.panel.compare,
  wmsPanelOpen: store.panel.wms,
});

export default connect(mapStoreToProps, null)(App);
