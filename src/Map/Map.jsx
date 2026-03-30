import React from 'react';
import { Map as LeafletMap, Pane, LayersControl, TileLayer, LayerGroup } from 'react-leaflet';

import { connect } from 'react-redux';
import 'nprogress/nprogress.css';

import store, { mainMapSlice, themesSlice, visualizationSlice, searchResultsSlice } from '../store';
import 'leaflet/dist/leaflet.css';
import './Map.scss';
import L from 'leaflet';
import moment from 'moment';
import { PROCESSING_OPTIONS, SELECTED_BASE_LAYER_KEY, TABS } from '../const';
import Controls from '../Controls/Controls';
import LeafletControls from './LeafletControls/LeafletControls';
import SentinelHubLayerComponent from './plugins/sentinelhubLeafletLayer';
import OpenEoLayerComponent from './plugins/openEOLeafletLayer';
import GlTileLayer from './plugins/GlTileLayer';
import { baseLayers, overlayTileLayers, getDefaultBaseLayer } from './Layers';
import { S2QuarterlyCloudlessMosaicsBaseLayerTheme } from '../assets/default_themes';
import {
  getDatasetLabel,
  getDataSourceHandler,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getAppropriateAuthToken, getGetMapAuthToken } from '../App';
import { getUrlParams, handleError } from '../utils';
import {
  BASE_PANE_ID,
  BASE_S2_MOSAIC_PANE_ID,
  SENTINELHUB_LAYER_PANE_ID,
  SENTINELHUB_LAYER_PANE_ZINDEX,
  DEFAULT_COMPARED_LAYERS_MAX_ZOOM,
  DEFAULT_COMPARED_LAYERS_OVERZOOM,
  S2_QUARTERLY_MOSAIC_DATASET_ID,
  S2_QUARTERLY_MOSAIC_LAYER_ID,
  MAX_MAP_LOADING_TIME,
} from './const';
import SearchBox from '../SearchBox/SearchBox';

import {
  getTileSizeConfiguration,
  getZoomConfiguration,
} from '../Tools/SearchPanel/dataSourceHandlers/helper';
// import { checkUserAccount } from '../Tools/CommercialDataPanel/commercialData.utils';
import { SpeckleFilterType } from '@sentinel-hub/sentinelhub-js';
import { isTimespanModeSelected } from '../Tools/VisualizationPanel/VisualizationPanel.utils';
import {
  getIntersectingFeatures,
  createClickedPoint,
  shouldShowSingleShLayer,
  shouldShowCompareShLayers,
  shouldShowS2MosaicTransparency,
  getPinTimes,
} from './Map.utils';
import { mapStoreToProps } from './Map.selectors';
import { progressWithDelayedAction } from './progressWithDelayedAction';
import { t } from 'ttag';
import { findLatestDateWithData, getQuarterlyInfo } from '../utils/latestDate.utils';
import { manipulateODataSearchResultsWithAntimeridianDuplicates } from '../utils/handelAntimeridianCoord.utils';
import { getProcessGraph, isOpenEoSupported } from '../api/openEO/openEOHelpers';
import { IMAGE_FORMATS } from '../Controls/ImgDownload/consts';
import { processRRDResults } from '../hooks/useRRDProcessResults';
import { saveToLocalStorage } from '../utils/localStorage.utils';
import DatasetLocationPreview from './components/DatasetLocationPreview';
import MapPanes from './components/MapPanes';
import CommercialDataOverlay from './components/CommercialDataOverlay';
import MapOverlays from './components/MapOverlays';

// import EOBModeSelection from '../junk/EOBModeSelection/EOBModeSelection';

const { BaseLayer, Overlay } = LayersControl;
class Map extends React.Component {
  mapRef = undefined;
  progress = progressWithDelayedAction({
    parent: '#map',
    delay: MAX_MAP_LOADING_TIME,
    action: () => store.dispatch(mainMapSlice.actions.setLoadingMessage(t`The data is still loading...`)),
    resetAction: () => store.dispatch(mainMapSlice.actions.setLoadingMessage(null)),
  });
  state = {
    searchResultsAreas: [],
    accountInfo: {
      payingAccount: false,
      quotasEnabled: false,
    },
    latestS2QMosaicDate: undefined,
    S2QMosaicZoom: { min: 8, max: 20 },
    RRDProcessedResults: [],
  };
  resizeDebounceTimer;

  async componentDidMount() {
    this.setupMapResizeObserver();
  }

  setupMapResizeObserver = () => {
    const mapElement = this.mapRef?.leafletElement;
    if (!mapElement) {
      return;
    }

    const mapContainer = mapElement.getContainer();

    this.resizeObserver = new ResizeObserver(() => {
      // Debounce resize events to avoid excessive invalidateSize calls
      clearTimeout(this.resizeDebounceTimer);

      this.resizeDebounceTimer = setTimeout(() => {
        if (this.mapRef?.leafletElement) {
          this.mapRef.leafletElement.invalidateSize();
        }
      }, 100);
    });

    this.resizeObserver.observe(mapContainer);
  };

  componentWillUnmount() {
    // Clean up timers and observer
    if (this.resizeDebounceTimer) {
      clearTimeout(this.resizeDebounceTimer);
    }
    if (this.resizeObserver) {
      this.resizeObserver.disconnect();
    }
  }

  async componentDidUpdate(prevProps) {
    // This part refers to the case if the search result is in the antimeridian section
    // (Each polygon moves at approximately +180 and creates duplicates at -180, so that it is not cut off in any direction that the user moves it).
    if (this.props.searchResults !== prevProps.searchResults) {
      const responseResult = manipulateODataSearchResultsWithAntimeridianDuplicates(
        prevProps.searchResults,
        this.props.searchResults,
      );

      this.setState({
        searchResultsAreas: responseResult,
      });
    }

    //remove map's progress bar when  map is not displayed or on zoom limit
    if (this.progress.isStarted()) {
      const { min: minZoom } = getZoomConfiguration(this.props.datasetId);

      if (
        this.props.selectedTabIndex !== TABS.VISUALIZE_TAB ||
        (this.props.selectedTabIndex === TABS.VISUALIZE_TAB && this.props.zoom < minZoom)
      ) {
        this.progress.done();
        this.progress.remove();
      }
    }

    if (
      !this.state.latestS2QMosaicDate &&
      this.props.dataSourcesInitialized &&
      this.props.authenticated &&
      this.props.mapBounds
    ) {
      try {
        const S2QMosaicDsh = getDataSourceHandler(S2_QUARTERLY_MOSAIC_DATASET_ID);

        const latestDateWithAvailableData = await findLatestDateWithData({
          datasetId: S2_QUARTERLY_MOSAIC_DATASET_ID,
          bounds: this.props.mapBounds,
          pixelBounds: this.props.pixelBounds,
        });

        if (latestDateWithAvailableData) {
          this.setState({
            latestS2QMosaicDate: latestDateWithAvailableData,
            S2QMosaicZoom: S2QMosaicDsh.getLeafletZoomConfig(S2_QUARTERLY_MOSAIC_DATASET_ID),
          });
        }
      } catch (e) {
        console.error(`Unable to get latest date for mosaic base layer:`, S2_QUARTERLY_MOSAIC_DATASET_ID);
      }
    }

    if (
      prevProps.RRDResults !== this.props.RRDResults ||
      prevProps.RRDSortStateResultsSection !== this.props.RRDSortStateResultsSection ||
      prevProps.RRDFilterStateResultsSection !== this.props.RRDFilterStateResultsSection ||
      prevProps.currentPage !== this.props.currentPage
    ) {
      const { paginatedResults } = processRRDResults(
        this.props.RRDResults,
        this.props.RRDFilterStateResultsSection,
        this.props.RRDSortStateResultsSection,
        this.props.currentPage,
      );
      this.setState({
        RRDProcessedResults: paginatedResults,
      });
    }
  }

  updateViewport = (viewport) => {
    if (viewport?.center) {
      viewport.center = Object.values(L.latLng(...viewport.center).wrap());
      store.dispatch(mainMapSlice.actions.setViewport(viewport));
    }
  };

  setBounds = (ev) => {
    store.dispatch(
      mainMapSlice.actions.setBounds({
        bounds: ev.target.getBounds(),
        pixelBounds: ev.target.getPixelBounds(),
      }),
    );
  };

  onPreviewClick = (e) => {
    const clickedPoint = createClickedPoint(e.latlng);
    const selectedTiles = getIntersectingFeatures(clickedPoint, this.props.searchResults, {
      zoom: this.props.zoom,
    });

    store.dispatch(searchResultsSlice.actions.setSelectedTiles(selectedTiles));
  };

  onPreviewRRDClick = (e) => {
    const clickedPoint = createClickedPoint(e.latlng);
    const selectedTiles = getIntersectingFeatures(clickedPoint, this.state.RRDProcessedResults, {
      zoom: this.props.zoom,
    });

    store.dispatch(searchResultsSlice.actions.setSelectedTiles(selectedTiles));
  };

  onTileError = async (error) => {
    handleError(error);
  };

  onTileLoad = () => {
    const { error } = this.props;
    if (error) {
      store.dispatch(visualizationSlice.actions.setError(null));
    }
  };

  onSelectMode = (modeId) => {
    store.dispatch(visualizationSlice.actions.reset());
    store.dispatch(themesSlice.actions.setSelectedModeIdAndDefaultTheme(modeId));
  };

  render() {
    const {
      lat,
      lng,
      zoom,
      mapBounds,
      datasetId,
      baseLayerId,
      enabledOverlaysId,
      visibleOnMap,
      visualizationLayerId,
      visualizationUrl,
      authenticated,
      fromTime,
      toTime,
      customSelected,
      evalscript,
      dataFusion,
      dataSourcesInitialized,
      selectedThemeId,
      selectedTabIndex,
      displayingSearchResults,
      // eslint-disable-next-line no-unused-vars
      searchResults,
      highlightedRRDResult,
      highlightedTile,
      comparedLayers,
      comparedOpacity,
      comparedClipping,
      gainEffect,
      gammaEffect,
      redRangeEffect,
      greenRangeEffect,
      blueRangeEffect,
      minQa,
      mosaickingOrder,
      upsampling,
      downsampling,
      speckleFilter,
      orthorectification,
      backscatterCoeff,
      selectedLanguage,
      auth,
      displayTimelapseAreaPreview,
      googleAPI,
      shouldAnimateControls,
      toolsOpen,
      showComparePanel,
      orbitDirection,
      // is3D,
      // selectedModeId,
      elevationProfileHighlightedPoint,
      cloudCoverage,
      // eslint-disable-next-line no-unused-vars
      RRDResults,
      // eslint-disable-next-line no-unused-vars
      RRDSortStateResultsSection,
      // eslint-disable-next-line no-unused-vars
      RRDFilterStateResultsSection,
      filteredQuicklookOverlays,
      selectedProcessing,
      processGraph,
    } = this.props;
    const { evalscriptUrl, evalscripturl: evalscriptUrlLegacy } = getUrlParams();
    const resolvedEvalscriptUrl = evalscriptUrl || evalscriptUrlLegacy;
    const isCustomEvalscript = customSelected && !!evalscript;
    const isOpenEOSelected = selectedProcessing === PROCESSING_OPTIONS.OPENEO;
    const supportsOpenEo = isOpenEoSupported(
      visualizationUrl,
      visualizationLayerId,
      IMAGE_FORMATS.PNG,
      isCustomEvalscript,
    );

    const hasCustomProcessGraph = customSelected && !!processGraph && isOpenEOSelected;
    const shouldRenderOpenEO = isOpenEOSelected && (supportsOpenEo || hasCustomProcessGraph);

    const zoomConfig = getZoomConfiguration(datasetId);
    let speckleFilterProp = speckleFilter;
    const dsh = getDataSourceHandler(datasetId);
    if (dsh && !dsh.canApplySpeckleFilter(datasetId, this.props.zoom)) {
      speckleFilterProp = { type: SpeckleFilterType.NONE };
    }

    let constellationProp = null;
    if (dsh && dsh.getDatasetParams) {
      const datasetParams = dsh.getDatasetParams(datasetId);
      constellationProp = datasetParams?.constellation;
    }

    const showSingleShLayer = shouldShowSingleShLayer({
      authenticated,
      dataSourcesInitialized,
      selectedTabIndex,
      displayingSearchResults,
      showComparePanel,
      visualizationLayerId,
      customSelected,
      datasetId,
      visualizationUrl,
    });

    const showCompareShLayers = shouldShowCompareShLayers({
      comparedLayers,
      selectedTabIndex,
      showComparePanel,
    });

    const { latestS2QMosaicDate, S2QMosaicZoom } = this.state;
    const S2QMosaicTransparent = shouldShowS2MosaicTransparency(
      showSingleShLayer,
      visibleOnMap,
      showCompareShLayers,
    );
    const S2QMosaicReady = authenticated && dataSourcesInitialized && latestS2QMosaicDate && S2QMosaicZoom;

    const shownBaseLayers = baseLayers.map((baseLayer) => {
      const isS2Mosaic = baseLayer.id === S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0].id;
      const name =
        S2QMosaicReady && isS2Mosaic
          ? `${baseLayer.name} (${getQuarterlyInfo(latestS2QMosaicDate)})`
          : baseLayer.name;
      return {
        ...baseLayer,
        name: name,
        checked: baseLayer.id === baseLayerId,
      };
    });

    const osmLayer = getDefaultBaseLayer();

    return (
      <LeafletMap
        ref={(el) => (this.mapRef = el)}
        minZoom={2}
        onViewportChanged={this.updateViewport}
        center={[this.props.lat, this.props.lng]}
        zoom={this.props.zoom}
        onMoveEnd={this.setBounds}
        whenReady={this.setBounds}
        zoomControl={false}
        attributionControl={false}
        scaleControl={false}
        fadeAnimation={false}
        tap={false}
        id="map"
        className={`${toolsOpen ? '' : 'left-align-attribution'}`}
        onOverlayAdd={(ev) => {
          store.dispatch(mainMapSlice.actions.addOverlay(ev.layer.options.overlayTileLayerId));
          if (ev.layer.options.pane === SENTINELHUB_LAYER_PANE_ID) {
            store.dispatch(visualizationSlice.actions.setVisibleOnMap(true));
          }
        }}
        onOverlayRemove={(ev) => {
          store.dispatch(mainMapSlice.actions.removeOverlay(ev.layer.options.overlayTileLayerId));
          if (ev.layer.options.pane === SENTINELHUB_LAYER_PANE_ID) {
            store.dispatch(visualizationSlice.actions.setVisibleOnMap(false));
          }
        }}
        onBaseLayerChange={(ev) => {
          const selectedBaseLayerId = shownBaseLayers.find((baseLayer) => baseLayer.name === ev.name)?.id;

          if (selectedBaseLayerId) {
            store.dispatch(mainMapSlice.actions.setBaseLayerId(selectedBaseLayerId));
            saveToLocalStorage(SELECTED_BASE_LAYER_KEY, selectedBaseLayerId);
          }
        }}
      >
        <MapPanes />

        <LayersControl
          // force rerender of layers-control to reset the selected layer if google maps was selected and user logs out.
          // also force rerender when S2QMosaic name changes to reorder the layers
          key={`${shownBaseLayers.map(({ id }) => id).join('|')}-${S2QMosaicReady}`}
          position="topright"
          sortLayers={true}
          sortFunction={(a, b) => {
            if (!this.mapRef) {
              return;
            }
            return (
              this.mapRef.leafletElement.getPane(a.options.pane).style.zIndex -
              this.mapRef.leafletElement.getPane(b.options.pane).style.zIndex
            );
          }}
        >
          {shownBaseLayers.map((baseLayer) => (
            <BaseLayer checked={baseLayer.checked} name={baseLayer.name} key={baseLayer.id}>
              {baseLayer.urlType === 'BYOC' ? (
                <LayerGroup>
                  <TileLayer url={osmLayer.url} attribution={osmLayer.attribution} pane={BASE_PANE_ID} />
                  {S2QMosaicReady && isOpenEoSupported(baseLayer.url, S2_QUARTERLY_MOSAIC_LAYER_ID) ? (
                    <OpenEoLayerComponent
                      processGraph={getProcessGraph(baseLayer.url, S2_QUARTERLY_MOSAIC_LAYER_ID)}
                      datasetId={S2_QUARTERLY_MOSAIC_DATASET_ID}
                      getMapAuthToken={getGetMapAuthToken(auth)}
                      fromTime={moment(latestS2QMosaicDate).utc().startOf('day').toDate()}
                      toTime={moment(latestS2QMosaicDate).utc().endOf('day').toDate()}
                      minZoom={S2QMosaicZoom.min}
                      maxZoom={S2QMosaicZoom.max}
                      progress={this.progress}
                      onTileImageError={this.onTileError}
                      onTileImageLoad={this.onTileLoad}
                      opacity={S2QMosaicTransparent ? 0.6 : 1}
                      pane={BASE_S2_MOSAIC_PANE_ID}
                    />
                  ) : (
                    <SentinelHubLayerComponent
                      pane={BASE_S2_MOSAIC_PANE_ID}
                      datasetId={S2_QUARTERLY_MOSAIC_DATASET_ID}
                      url={baseLayer.url}
                      layers={S2_QUARTERLY_MOSAIC_LAYER_ID}
                      format="PNG"
                      fromTime={moment(latestS2QMosaicDate).utc().startOf('day').toDate()}
                      toTime={moment(latestS2QMosaicDate).utc().endOf('day').toDate()}
                      minZoom={S2QMosaicZoom.min}
                      maxZoom={S2QMosaicZoom.max}
                      accessToken={getAppropriateAuthToken(auth, selectedThemeId)}
                      getMapAuthToken={getGetMapAuthToken(auth)}
                      opacity={S2QMosaicTransparent ? 0.6 : 1}
                      onTileImageError={this.onTileError}
                    />
                  )}
                </LayerGroup>
              ) : baseLayer.urlType === 'VECTOR' ? (
                <GlTileLayer
                  style={baseLayer.url}
                  attribution={baseLayer.attribution}
                  pane={BASE_PANE_ID}
                  preserveDrawingBuffer={baseLayer.preserveDrawingBuffer}
                />
              ) : baseLayer.urlType === 'WMTS' ? (
                <TileLayer url={baseLayer.url} attribution={baseLayer.attribution} pane={BASE_PANE_ID} />
              ) : null}
            </BaseLayer>
          ))}

          <Pane name={SENTINELHUB_LAYER_PANE_ID} style={{ zIndex: SENTINELHUB_LAYER_PANE_ZINDEX }} />

          {showSingleShLayer && shouldRenderOpenEO && (
            <Overlay
              key={`overlay-${datasetId}-${selectedProcessing}`}
              name={`${getDatasetLabel(datasetId)}`}
              checked={visibleOnMap}
            >
              <OpenEoLayerComponent
                processGraph={
                  processGraph
                    ? JSON.parse(processGraph)
                    : getProcessGraph(visualizationUrl, visualizationLayerId)
                }
                cachedProcessGraph={getProcessGraph(visualizationUrl, visualizationLayerId)}
                datasetId={datasetId}
                getMapAuthToken={getGetMapAuthToken(auth)}
                fromTime={fromTime ? fromTime.toISOString() : null}
                toTime={toTime ? toTime.toISOString() : null}
                progress={this.progress}
                onTileImageError={this.onTileError}
                onTileImageLoad={this.onTileLoad}
                pane={SENTINELHUB_LAYER_PANE_ID}
                minZoom={zoomConfig.min}
                maxZoom={zoomConfig.max}
                gainEffect={gainEffect}
                gammaEffect={gammaEffect}
                redRangeEffect={redRangeEffect}
                greenRangeEffect={greenRangeEffect}
                blueRangeEffect={blueRangeEffect}
                minQa={minQa}
                mosaickingOrder={mosaickingOrder}
                upsampling={upsampling}
                downsampling={downsampling}
                speckleFilter={speckleFilterProp}
                orthorectification={orthorectification}
                backscatterCoeff={backscatterCoeff}
                orbitDirection={orbitDirection}
              />
            </Overlay>
          )}

          {showSingleShLayer && !shouldRenderOpenEO && !isOpenEOSelected && (
            <Overlay
              key={`overlay-sentinel-${datasetId}-${visualizationLayerId}-${selectedProcessing}`}
              name={`${getDatasetLabel(datasetId)}`}
              checked={visibleOnMap}
            >
              <SentinelHubLayerComponent
                datasetId={datasetId}
                url={visualizationUrl}
                layers={visualizationLayerId}
                format="PNG"
                fromTime={fromTime ? fromTime.toDate() : null}
                toTime={toTime ? toTime.toDate() : null}
                customSelected={customSelected}
                evalscript={evalscript}
                evalscriptUrl={resolvedEvalscriptUrl}
                dataFusion={dataFusion}
                pane={SENTINELHUB_LAYER_PANE_ID}
                progress={this.progress}
                minZoom={zoomConfig.min}
                maxZoom={zoomConfig.max}
                tileSize={getTileSizeConfiguration(datasetId)}
                allowOverZoomBy={zoomConfig.allowOverZoomBy}
                gainEffect={gainEffect}
                gammaEffect={gammaEffect}
                redRangeEffect={redRangeEffect}
                greenRangeEffect={greenRangeEffect}
                blueRangeEffect={blueRangeEffect}
                minQa={minQa}
                mosaickingOrder={mosaickingOrder}
                upsampling={upsampling}
                downsampling={downsampling}
                speckleFilter={speckleFilterProp}
                orthorectification={orthorectification}
                backscatterCoeff={backscatterCoeff}
                constellation={constellationProp}
                accessToken={getAppropriateAuthToken(auth, selectedThemeId)}
                getMapAuthToken={getGetMapAuthToken(auth)}
                onTileImageError={this.onTileError}
                onTileImageLoad={this.onTileLoad}
                orbitDirection={orbitDirection}
                cloudCoverage={
                  dsh && dsh.tilesHaveCloudCoverage() && isTimespanModeSelected(fromTime, toTime)
                    ? cloudCoverage
                    : 100
                }
              />
            </Overlay>
          )}

          {showCompareShLayers &&
            comparedLayers
              .slice()
              .reverse()
              .map((p, i) => {
                const {
                  fromTime,
                  toTime,
                  datasetId,
                  evalscript,
                  evalscriptUrl, // from the saved pin object (already normalized from legacy evalscripturl by Pin.utils), not from URL params
                  dataFusion,
                  visualizationUrl,
                  layerId,
                  gainEffect,
                  gammaEffect,
                  redRangeEffect,
                  greenRangeEffect,
                  blueRangeEffect,
                  minQa,
                  mosaickingOrder,
                  upsampling,
                  downsampling,
                  speckleFilterProp,
                  orthorectification,
                  backscatterCoeff,
                  themeId,
                  orbitDirection,
                  processGraph,
                } = p;
                const dsh = getDataSourceHandler(datasetId);
                const supportsTimeRange = dsh ? dsh.supportsTimeRange() : true; //We can only check if a datasetId is BYOC when the datasource handler for it is instantiated (thus, we are on the user instance which includes that BYOC collection), so we set default to `true` to cover other cases.
                let {
                  min: minZoom,
                  max: maxZoom = DEFAULT_COMPARED_LAYERS_MAX_ZOOM,
                  allowOverZoomBy = DEFAULT_COMPARED_LAYERS_OVERZOOM,
                } = getZoomConfiguration(datasetId);

                const { pinTimeFrom, pinTimeTo } = getPinTimes(fromTime, toTime, supportsTimeRange);
                const index = comparedLayers.length - 1 - i;
                const isCustomVisualisation = evalscript != null && evalscript.length > 0;
                const supportsOpenEoComparedLayer = isOpenEoSupported(
                  visualizationUrl,
                  layerId,
                  IMAGE_FORMATS.PNG,
                  isCustomVisualisation,
                );

                if (supportsOpenEoComparedLayer && isOpenEOSelected) {
                  let processGraphToUse = processGraph
                    ? JSON.parse(processGraph)
                    : getProcessGraph(visualizationUrl, layerId);

                  return (
                    <OpenEoLayerComponent
                      key={i}
                      processGraph={processGraphToUse}
                      cachedProcessGraph={getProcessGraph(visualizationUrl, layerId)}
                      datasetId={datasetId}
                      getMapAuthToken={getGetMapAuthToken(auth)}
                      fromTime={pinTimeFrom}
                      toTime={pinTimeTo}
                      progress={this.progress}
                      onTileImageError={this.onTileError}
                      onTileImageLoad={this.onTileLoad}
                      pane={SENTINELHUB_LAYER_PANE_ID}
                      opacity={comparedOpacity[index]}
                      clipping={comparedClipping[index]}
                      minZoom={zoomConfig.min}
                      maxZoom={zoomConfig.max}
                      gainEffect={gainEffect}
                      gammaEffect={gammaEffect}
                      redRangeEffect={redRangeEffect}
                      greenRangeEffect={greenRangeEffect}
                      blueRangeEffect={blueRangeEffect}
                      minQa={minQa}
                      mosaickingOrder={mosaickingOrder}
                      upsampling={upsampling}
                      downsampling={downsampling}
                      speckleFilter={speckleFilterProp}
                      orthorectification={orthorectification}
                      backscatterCoeff={backscatterCoeff}
                      orbitDirection={orbitDirection}
                    />
                  );
                }
                return (
                  <SentinelHubLayerComponent
                    key={i}
                    datasetId={datasetId}
                    url={visualizationUrl}
                    layers={layerId}
                    format="PNG"
                    fromTime={pinTimeFrom}
                    toTime={pinTimeTo}
                    customSelected={!!(evalscript || evalscriptUrl)}
                    evalscript={evalscript}
                    evalscriptUrl={evalscriptUrl}
                    dataFusion={dataFusion}
                    minZoom={minZoom}
                    maxZoom={maxZoom}
                    tileSize={getTileSizeConfiguration(datasetId)}
                    allowOverZoomBy={allowOverZoomBy}
                    opacity={comparedOpacity[index]}
                    clipping={comparedClipping[index]}
                    gainEffect={gainEffect}
                    gammaEffect={gammaEffect}
                    redRangeEffect={redRangeEffect}
                    greenRangeEffect={greenRangeEffect}
                    blueRangeEffect={blueRangeEffect}
                    minQa={minQa}
                    mosaickingOrder={mosaickingOrder}
                    upsampling={upsampling}
                    downsampling={downsampling}
                    speckleFilter={speckleFilterProp}
                    orthorectification={orthorectification}
                    backscatterCoeff={backscatterCoeff}
                    pane={SENTINELHUB_LAYER_PANE_ID}
                    progress={this.progress}
                    accessToken={getAppropriateAuthToken(auth, themeId)}
                    getMapAuthToken={getGetMapAuthToken(auth)}
                    onTileImageError={this.onTileError}
                    onTileImageLoad={this.onTileLoad}
                    orbitDirection={orbitDirection}
                    cloudCoverage={
                      dsh && dsh.tilesHaveCloudCoverage() && isTimespanModeSelected(fromTime, toTime)
                        ? cloudCoverage
                        : 100
                    }
                  />
                );
              })}

          {overlayTileLayers().map((overlayTileLayer) => (
            <Overlay
              name={overlayTileLayer.name}
              key={`${overlayTileLayer.id}-${this.props.selectedLanguage}`}
              checked={enabledOverlaysId.includes(overlayTileLayer.id)}
            >
              <Pane name={overlayTileLayer.pane} style={{ zIndex: overlayTileLayer.zIndex }}>
                {overlayTileLayer.urlType === 'VECTOR' ? (
                  <GlTileLayer
                    style={overlayTileLayer.style || overlayTileLayer.url}
                    attribution={overlayTileLayer.attribution}
                    overlayTileLayerId={overlayTileLayer.id}
                    pane={overlayTileLayer.pane}
                    preserveDrawingBuffer={overlayTileLayer.preserveDrawingBuffer}
                  />
                ) : overlayTileLayer.urlType === 'WMTS' ? (
                  <TileLayer
                    url={overlayTileLayer.url}
                    attribution={overlayTileLayer.attribution}
                    overlayTileLayerId={overlayTileLayer.id}
                    pane={overlayTileLayer.pane}
                  />
                ) : null}
              </Pane>
            </Overlay>
          ))}
        </LayersControl>

        <MapOverlays
          // geometry overlays
          aoiGeometry={this.props.aoiGeometry}
          aoiBounds={this.props.aoiBounds}
          aoiLastEdited={this.props.aoiLastEdited}
          loiGeometry={this.props.loiGeometry}
          loiLastEdited={this.props.loiLastEdited}
          poiPosition={this.props.poiPosition}
          poiLastEdited={this.props.poiLastEdited}
          // search & RRD previews
          selectedTabIndex={selectedTabIndex}
          searchResultsAreas={this.state.searchResultsAreas}
          highlightedTileId={highlightedTile?.id}
          onPreviewClick={this.onPreviewClick}
          RRDProcessedResults={this.state.RRDProcessedResults}
          highlightedRRDResultId={highlightedRRDResult}
          onPreviewRRDClick={this.onPreviewRRDClick}
          // elevation point
          elevationFeature={elevationProfileHighlightedPoint}
          // timelapse
          displayTimelapseAreaPreview={displayTimelapseAreaPreview}
          lat={lat}
          lng={lng}
          zoom={zoom}
          mapBounds={mapBounds}
          // quicklooks
          filteredQuicklookOverlays={filteredQuicklookOverlays}
        />

        <CommercialDataOverlay
          displaySearchResults={this.props.commercialDataDisplaySearchResults}
          highlightedResult={this.props.commercialDataHighlightedResult}
          searchResults={this.props.commercialDataSearchResults}
          selectedOrder={this.props.commercialDataSelectedOrder}
        />
        {selectedTabIndex === TABS.VISUALIZE_TAB && <DatasetLocationPreview />}
        {/* {selectedModeId && !is3D && (
          <EOBModeSelection
            highlighted={this.props.selectedModeId === EDUCATION_MODE.id}
            modes={MODES}
            onSelectMode={this.onSelectMode}
            selectedModeId={this.props.selectedModeId}
          />
        )} */}

        <LeafletControls key={selectedLanguage} />
        <SearchBox
          googleAPI={googleAPI}
          giscoAPI={true}
          is3D={false}
          minZoom={zoomConfig.min}
          maxZoom={zoomConfig.max}
          zoom={this.props.zoom}
        />
        <Controls
          selectedLanguage={this.props.selectedLanguage}
          histogramContainer={this.props.histogramContainer}
          shouldAnimateControls={shouldAnimateControls}
          showComparePanel={this.props.showComparePanel}
        />
      </LeafletMap>
    );
  }
}

export default connect(mapStoreToProps, null)(Map);
