import React from 'react';
import {
  Map as LeafletMap,
  Pane,
  LayersControl,
  GeoJSON,
  Rectangle,
  Marker,
  FeatureGroup,
  TileLayer,
  LayerGroup,
} from 'react-leaflet';

import { connect } from 'react-redux';
import ReactLeafletGoogleLayer from './plugins/ReactLeafletGoogleLayer';
import 'nprogress/nprogress.css';

import store, {
  commercialDataSlice,
  mainMapSlice,
  themesSlice,
  visualizationSlice,
  searchResultsSlice,
} from '../store';
import 'leaflet/dist/leaflet.css';
import './Map.scss';
import L from 'leaflet';
import moment from 'moment';
import { TABS } from '../const';
import Controls from '../Controls/Controls';
import PreviewLayer from '../Tools/Results/PreviewLayer';
import LeafletControls from './LeafletControls/LeafletControls';
import SentinelHubLayerComponent from './plugins/sentinelhubLeafletLayer';
import OpenEoLayerComponent from './plugins/openEOLeafletLayer';
import GlTileLayer from './plugins/GlTileLayer';
import { baseLayers, overlayTileLayers, LAYER_ACCESS } from './Layers';
import { S2QuarterlyCloudlessMosaicsBaseLayerTheme } from '../assets/default_themes';
import {
  getDatasetLabel,
  getDataSourceHandler,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getAppropriateAuthToken, getGetMapAuthToken } from '../App';
import { getUrlParams, handleError } from '../utils';
import TimelapseAreaPreview from '../Controls/Timelapse/TimelapseAreaPreview';
import SearchBox from '../SearchBox/SearchBox';

import {
  getTileSizeConfiguration,
  getZoomConfiguration,
} from '../Tools/SearchPanel/dataSourceHandlers/helper';
// import { checkUserAccount } from '../Tools/CommercialDataPanel/commercialData.utils';
import MaptilerLogo from './maptiler-logo-adaptive.svg';
import { SpeckleFilterType } from '@sentinel-hub/sentinelhub-js';
import { getVisualizationEffectsFromStore, isVisualizationEffectsApplied } from '../utils/effectsUtils';
import {
  getOrbitDirectionFromList,
  isTimespanModeSelected,
} from '../Tools/VisualizationPanel/VisualizationPanel.utils';
import { getConstellationFromDatasetId } from '../Tools/SearchPanel/dataSourceHandlers/HLSAWSDataSourceHandler.utils';
import { getIntersectingFeatures } from './Map.utils';
import { isRectangle } from '../utils/geojson.utils';
import { COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { progressWithDelayedAction } from './progressWithDelayedAction';
import { t } from 'ttag';
import {
  findLatestDateWithData,
  getQuarterlyInfo,
} from '../Tools/VisualizationPanel/SmartPanel/LatestDataAction.utils';
import { manipulateODataSearchResultsWithAntimeridianDuplicates } from '../utils/handelAntimeridianCoord.utils';
import { getProcessGraph, isOpenEoSupported } from '../api/openEO/openEOHelpers';
import { IMAGE_FORMATS } from '../Controls/ImgDownload/consts';
import { processRRDResults } from '../hooks/useRRDProcessResults';
import QuicklookOverlay from '../Map/plugins/QuicklookOverlay';
// import EOBModeSelection from '../junk/EOBModeSelection/EOBModeSelection';

const BASE_PANE_ID = 'baseMapPane';
const BASE_PANE_ZINDEX = 5;
const BASE_S2_MOSAIC_PANE_ID = 'baseS2MosaicMapPane';
const BASE_S2_MOSAIC_PANE_ZINDEX = BASE_PANE_ZINDEX;
const SENTINELHUB_LAYER_PANE_ID = 'sentinelhubPane';
const SENTINELHUB_LAYER_PANE_ZINDEX = 6;
const highlightedTileStyle = {
  weight: 2,
  color: '#57de71',
  opacity: 1,
  fillColor: '#57de71',
  fillOpacity: 0.3,
};
const DEFAULT_COMPARED_LAYERS_MAX_ZOOM = 25;
const DEFAULT_COMPARED_LAYERS_OVERZOOM = 0;

const S2QuarterlyMosaicDatasetId = COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC;
const S2QuarterlyMosaicLayerId = 'TRUE-COLOR-CLOUDLESS';

const MAX_MAP_LOADING_TIME = 5 * 1000;

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
  mapInvalidateSizeTimer;

  async componentDidMount() {
    // const accountInfo = await checkUserAccount(this.props.auth.user);
    // this.setState({ accountInfo: accountInfo });
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

    if (prevProps.auth !== this.props.auth) {
      // const accountInfo = await checkUserAccount(this.props.auth.user);
      // this.setState({ accountInfo: accountInfo });
    }

    if (prevProps.toolsOpen !== this.props.toolsOpen) {
      this.updateLeafletMapSize();
    }

    if (this.props.shouldAnimateControls) {
      if (this.mapInvalidateSizeTimer) {
        clearTimeout(this.mapInvalidateSizeTimer);
      }

      // wait a bit for the leaflet container to load, then resize the map
      this.mapInvalidateSizeTimer = setTimeout(this.updateLeafletMapSize, 800);
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
        const S2QMosaicDsh = getDataSourceHandler(S2QuarterlyMosaicDatasetId);

        const latestDateWithAvailableData = await findLatestDateWithData({
          datasetId: S2QuarterlyMosaicDatasetId,
          bounds: this.props.mapBounds,
          pixelBounds: this.props.pixelBounds,
        });

        if (latestDateWithAvailableData) {
          this.setState({
            latestS2QMosaicDate: latestDateWithAvailableData,
            S2QMosaicZoom: S2QMosaicDsh.getLeafletZoomConfig(S2QuarterlyMosaicDatasetId),
          });
        }
      } catch (e) {
        console.error(`Unable to get latest date for mosaic base layer:`, S2QuarterlyMosaicDatasetId);
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

  updateLeafletMapSize = () => {
    this.mapRef.leafletElement.pm.map.invalidateSize();
  };

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
    const clickedPoint = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [e.latlng.lng, e.latlng.lat],
      },
    };

    const selectedTiles = getIntersectingFeatures(clickedPoint, this.props.searchResults, {
      zoom: this.props.zoom,
    });

    store.dispatch(searchResultsSlice.actions.setSelectedTiles(selectedTiles));
  };

  onPreviewRRDClick = (e) => {
    const clickedPoint = {
      type: 'Feature',
      geometry: {
        type: 'Point',
        coordinates: [e.latlng.lng, e.latlng.lat],
      },
    };

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
      quicklookImages,
    } = this.props;
    const { evalscripturl } = getUrlParams();
    const isEffectsSelected = isVisualizationEffectsApplied(this.props);
    const supportsOpenEo = isOpenEoSupported(
      visualizationUrl,
      visualizationLayerId,
      IMAGE_FORMATS.PNG,
      isEffectsSelected,
    );
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

    const showSingleShLayer =
      authenticated &&
      dataSourcesInitialized &&
      selectedTabIndex === TABS.VISUALIZE_TAB &&
      !displayingSearchResults &&
      !showComparePanel &&
      (visualizationLayerId || customSelected) &&
      datasetId &&
      visualizationUrl;

    const showCompareShLayers =
      comparedLayers.length && selectedTabIndex === TABS.VISUALIZE_TAB && showComparePanel;

    const { latestS2QMosaicDate, S2QMosaicZoom } = this.state;
    const S2QMosaicTransparent = (showSingleShLayer && visibleOnMap) || showCompareShLayers;
    const S2QMosaicReady = authenticated && dataSourcesInitialized && latestS2QMosaicDate && S2QMosaicZoom;

    let shownBaseLayers =
      this.state.accountInfo.payingAccount && googleAPI
        ? baseLayers
        : baseLayers.filter((baseLayer) => baseLayer.access === LAYER_ACCESS.PUBLIC);

    if (S2QMosaicReady) {
      shownBaseLayers = shownBaseLayers.map((baseLayer) => {
        if (baseLayer.id === S2QuarterlyCloudlessMosaicsBaseLayerTheme.content[0].name) {
          return {
            ...baseLayer,
            name: `${baseLayer.name} (${getQuarterlyInfo(latestS2QMosaicDate)})`,
          };
        }
        return baseLayer;
      });
    }

    const osmLayer = baseLayers.find((bl) => bl.id === 'osm-background');

    const isBaseMapMaptiler = baseLayers
      .find((baseLayer) => baseLayer.id === baseLayerId)
      ?.attribution?.includes('maptiler');

    const isAnyOverlayMaptiler = overlayTileLayers()
      .filter((overlayTileLayer) => enabledOverlaysId.includes(overlayTileLayer.id))
      .some((overlayTileLayer) => overlayTileLayer.attribution.includes('maptiler'));

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
          store.dispatch(
            mainMapSlice.actions.setBaseLayerId(
              baseLayers.find((baseLayer) => baseLayer.name === ev.name)?.id,
            ),
          );
        }}
      >
        <Pane name={BASE_PANE_ID} style={{ zIndex: BASE_PANE_ZINDEX }} />
        <Pane name={BASE_S2_MOSAIC_PANE_ID} style={{ zIndex: BASE_S2_MOSAIC_PANE_ZINDEX }} />

        <LayersControl
          // force rerender of layers-control to reset the selected layer if google maps was selected and user logs out.
          // also force rerender when S2QMosaic name changes to reorder the layers
          key={shownBaseLayers.map(({ name }) => name).join('')}
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
            <BaseLayer checked={baseLayer.checked} name={baseLayer.name} key={baseLayer.name}>
              {baseLayer.urlType === 'BYOC' ? (
                <LayerGroup>
                  <TileLayer url={osmLayer.url} attribution={osmLayer.attribution} pane={BASE_PANE_ID} />
                  {S2QMosaicReady && isOpenEoSupported(baseLayer.url, S2QuarterlyMosaicLayerId) ? (
                    <OpenEoLayerComponent
                      processGraph={getProcessGraph(baseLayer.url, S2QuarterlyMosaicLayerId)}
                      datasetId={S2QuarterlyMosaicDatasetId}
                      getMapAuthToken={getGetMapAuthToken(auth)}
                      fromTime={moment(latestS2QMosaicDate).utc().startOf('day').toDate()}
                      toTime={moment(latestS2QMosaicDate).utc().endOf('day').toDate()}
                      minZoom={S2QMosaicZoom.min}
                      maxZoom={S2QMosaicZoom.max}
                      progress={this.progress}
                      onTileImageError={this.onTileError}
                      onTileImageLoad={this.onTileLoad}
                      updateLeafletMapSize={this.updateLeafletMapSize}
                      opacity={S2QMosaicTransparent ? 0.6 : 1}
                      pane={BASE_S2_MOSAIC_PANE_ID}
                    />
                  ) : (
                    <SentinelHubLayerComponent
                      pane={BASE_S2_MOSAIC_PANE_ID}
                      datasetId={S2QuarterlyMosaicDatasetId}
                      url={baseLayer.url}
                      layers={S2QuarterlyMosaicLayerId}
                      format="PNG"
                      fromTime={moment(latestS2QMosaicDate).utc().startOf('day').toDate()}
                      toTime={moment(latestS2QMosaicDate).utc().endOf('day').toDate()}
                      minZoom={S2QMosaicZoom.min}
                      maxZoom={S2QMosaicZoom.max}
                      accessToken={getAppropriateAuthToken(auth, selectedThemeId)}
                      getMapAuthToken={getGetMapAuthToken(auth)}
                      updateLeafletMapSize={this.updateLeafletMapSize}
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
              ) : baseLayer.urlType === 'GOOGLE_MAPS' ? (
                <ReactLeafletGoogleLayer
                  apiKey={import.meta.env.VITE_GOOGLE_MAP_KEY}
                  type={'satellite'}
                  pane={BASE_PANE_ID}
                />
              ) : baseLayer.urlType === 'WMTS' ? (
                <TileLayer url={baseLayer.url} attribution={baseLayer.attribution} pane={BASE_PANE_ID} />
              ) : null}
            </BaseLayer>
          ))}

          <Pane name={SENTINELHUB_LAYER_PANE_ID} style={{ zIndex: SENTINELHUB_LAYER_PANE_ZINDEX }} />

          {showSingleShLayer && supportsOpenEo && (
            <Overlay name={`${getDatasetLabel(datasetId)}`} checked={visibleOnMap}>
              <OpenEoLayerComponent
                processGraph={getProcessGraph(visualizationUrl, visualizationLayerId)}
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
              />
            </Overlay>
          )}

          {showSingleShLayer && !supportsOpenEo && (
            <Overlay name={`${getDatasetLabel(datasetId)}`} checked={visibleOnMap}>
              <SentinelHubLayerComponent
                datasetId={datasetId}
                url={visualizationUrl}
                layers={visualizationLayerId}
                format="PNG"
                fromTime={fromTime ? fromTime.toDate() : null}
                toTime={toTime ? toTime.toDate() : null}
                customSelected={customSelected}
                evalscript={evalscript}
                evalscripturl={evalscripturl}
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
                updateLeafletMapSize={this.updateLeafletMapSize}
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
                  evalscripturl,
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
                } = p;
                const dsh = getDataSourceHandler(datasetId);
                const supportsTimeRange = dsh ? dsh.supportsTimeRange() : true; //We can only check if a datasetId is BYOC when the datasource handler for it is instantiated (thus, we are on the user instance which includes that BYOC collection), so we set default to `true` to cover other cases.
                let {
                  min: minZoom,
                  max: maxZoom = DEFAULT_COMPARED_LAYERS_MAX_ZOOM,
                  allowOverZoomBy = DEFAULT_COMPARED_LAYERS_OVERZOOM,
                } = getZoomConfiguration(datasetId);

                let pinTimeFrom, pinTimeTo;
                if (supportsTimeRange) {
                  if (fromTime) {
                    pinTimeFrom = moment.utc(fromTime).toDate();
                    pinTimeTo = moment.utc(toTime).toDate();
                  } else {
                    pinTimeFrom = moment.utc(toTime).startOf('day').toDate();
                    pinTimeTo = moment.utc(toTime).endOf('day').toDate();
                  }
                } else {
                  pinTimeTo = moment.utc(toTime).endOf('day').toDate();
                }
                const index = comparedLayers.length - 1 - i;
                const supportsOpenEo = isOpenEoSupported(visualizationUrl, layerId);

                if (supportsOpenEo) {
                  return (
                    <OpenEoLayerComponent
                      processGraph={getProcessGraph(visualizationUrl, layerId)}
                      datasetId={datasetId}
                      getMapAuthToken={getGetMapAuthToken(auth)}
                      fromTime={fromTime ? fromTime.toISOString() : null}
                      toTime={toTime ? toTime.toISOString() : null}
                      progress={this.progress}
                      onTileImageError={this.onTileError}
                      onTileImageLoad={this.onTileLoad}
                      pane={SENTINELHUB_LAYER_PANE_ID}
                      opacity={comparedOpacity[index]}
                      clipping={comparedClipping[index]}
                      minZoom={zoomConfig.min}
                      maxZoom={zoomConfig.max}
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
                    customSelected={!!(evalscript || evalscripturl)}
                    evalscript={evalscript}
                    evalscripturl={evalscripturl}
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
                    constellation={getConstellationFromDatasetId(datasetId)}
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

        {this.props.aoiGeometry && !isRectangle(this.props.aoiGeometry) && (
          <GeoJSON id="aoi-layer" data={this.props.aoiGeometry} key={this.props.aoiLastEdited} />
        )}
        {this.props.aoiGeometry && this.props.aoiBounds && isRectangle(this.props.aoiGeometry) && (
          <Rectangle id="aoi-layer" bounds={this.props.aoiBounds} key={this.props.aoiLastEdited} />
        )}
        {this.props.loiGeometry && (
          <GeoJSON id="loi-layer" data={this.props.loiGeometry} key={this.props.loiLastEdited} />
        )}
        {!this.props.poiPosition ? null : <Marker id="poi-layer" position={this.props.poiPosition} />}

        <Pane name={'highlightPane'} style={{ zIndex: 500 }} />
        {this.state.searchResultsAreas && selectedTabIndex === TABS.SEARCH_TAB ? (
          <FeatureGroup onClick={this.onPreviewClick}>
            {this.state.searchResultsAreas.map((tile, i) => (
              <PreviewLayer
                isHighlighted={tile.id === highlightedTile?.id}
                tile={tile}
                pane={tile?.id === highlightedTile?.id ? 'highlightPane' : 'overlayPane'}
                key={`search-result-${tile?.id}-${tile?.id === highlightedTile?.id}`}
              />
            ))}
          </FeatureGroup>
        ) : null}

        {this.state.RRDProcessedResults && selectedTabIndex === TABS.RAPID_RESPONSE_DESK ? (
          <FeatureGroup onClick={this.onPreviewRRDClick}>
            {this.state.RRDProcessedResults.map((tile, i) => (
              <PreviewLayer
                isHighlighted={tile._internalId === highlightedRRDResult}
                tile={tile}
                pane={tile?._internalId === highlightedRRDResult ? 'highlightPane' : 'overlayPane'}
                key={`rrd-result-${tile?._internalId}-${tile?._internalId === highlightedRRDResult}`}
              />
            ))}
          </FeatureGroup>
        ) : null}

        {this.props.elevationProfileHighlightedPoint ? (
          <GeoJSON
            data={this.props.elevationProfileHighlightedPoint}
            key={JSON.stringify(elevationProfileHighlightedPoint)}
            pointToLayer={(feature, latlng) => {
              return L.circleMarker(latlng, {
                radius: 8,
                fillColor: '#fff',
                color: '#3388ff',
                weight: 2,
                opacity: 1,
                fillOpacity: 1,
              });
            }}
          />
        ) : null}

        {displayTimelapseAreaPreview && selectedTabIndex === TABS.VISUALIZE_TAB && (
          <TimelapseAreaPreview lat={lat} lng={lng} zoom={zoom} mapBounds={mapBounds} />
        )}

        {this.props.commercialDataDisplaySearchResults && !!this.props.commercialDataHighlightedResult && (
          <GeoJSON
            id="commercialDataResult"
            data={this.props.commercialDataHighlightedResult.geometry}
            key={this.props.commercialDataHighlightedResult.id}
            style={() => highlightedTileStyle}
          />
        )}

        {this.props.commercialDataDisplaySearchResults &&
        this.props.commercialDataSearchResults &&
        this.props.commercialDataSearchResults.length > 0 ? (
          <FeatureGroup
            onClick={(e) => {
              store.dispatch(
                commercialDataSlice.actions.setLocation({ lat: e.latlng.lat, lng: e.latlng.lng }),
              );
            }}
          >
            {this.props.commercialDataSearchResults.map((result, i) => (
              <PreviewLayer tile={result} key={`preview-layer-${i}`} />
            ))}
          </FeatureGroup>
        ) : null}

        {!!this.props.commercialDataSelectedOrder &&
          !!this.props.commercialDataSelectedOrder.input &&
          !!this.props.commercialDataSelectedOrder.input.bounds &&
          !!this.props.commercialDataSelectedOrder.input.bounds.geometry && (
            <GeoJSON
              id="commercialDataSelectedOrder"
              data={this.props.commercialDataSelectedOrder.input.bounds.geometry}
              key={this.props.commercialDataSelectedOrder.id}
              style={() => ({
                weight: 2,
                color: 'green',
                opacity: 1,
                fillColor: 'green',
                fillOpacity: 0.3,
              })}
            />
          )}

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

        {isBaseMapMaptiler || isAnyOverlayMaptiler ? (
          <a href="https://www.maptiler.com/" target="_blank" rel="noopener noreferrer">
            <img className="maptiler-logo" src={MaptilerLogo} alt="" />
          </a>
        ) : null}

        {this.props.quicklookOverlay && (
          <QuicklookOverlay
            quicklookOverlay={this.props.quicklookOverlay}
            quicklookImages={quicklookImages}
            internalId={this.props.quicklookOverlay?._internalId}
          />
        )}
      </LeafletMap>
    );
  }
}

const mapStoreToProps = (store) => {
  return {
    lat: store.mainMap.lat,
    lng: store.mainMap.lng,
    zoom: store.mainMap.zoom,
    mapBounds: store.mainMap.bounds,
    baseLayerId: store.mainMap.baseLayerId,
    enabledOverlaysId: store.mainMap.enabledOverlaysId,
    displayingSearchResults: store.searchResults.displayingSearchResults,
    searchResults: store.searchResults.searchResult?.allResults,
    RRDResults: store.resultsSection.results,
    currentPage: store.resultsSection.currentPage,
    RRDSortStateResultsSection: store.resultsSection.sortState,
    RRDFilterStateResultsSection: store.resultsSection.filterState,
    highlightedRRDResult: store.resultsSection.highlightedResult,
    highlightedTile: store.searchResults.highlightedTile,
    aoiGeometry: store.aoi.geometry,
    aoiBounds: store.aoi.bounds,
    aoiLastEdited: store.aoi.lastEdited,
    loiGeometry: store.loi.geometry,
    loiLastEdited: store.loi.lastEdited,
    displayTimelapseAreaPreview: store.timelapse.displayTimelapseAreaPreview,
    poiPosition: store.poi.position,
    poiLastEdited: store.poi.lastEdited,
    datasetId: store.visualization.datasetId,
    visibleOnMap: store.visualization.visibleOnMap,
    visualizationLayerId: store.visualization.layerId,
    visualizationUrl: store.visualization.visualizationUrl,
    fromTime: store.visualization.fromTime,
    toTime: store.visualization.toTime,
    customSelected: store.visualization.customSelected,
    evalscript: store.visualization.evalscript,
    dataFusion: store.visualization.dataFusion,
    cloudCoverage: store.visualization.cloudCoverage,
    dataSourcesInitialized: store.themes.dataSourcesInitialized,
    selectedThemeId: store.themes.selectedThemeId,
    selectedTabIndex: store.tabs.selectedTabIndex,
    selectedLanguage: store.language.selectedLanguage,
    ...getVisualizationEffectsFromStore(store),
    orbitDirection: getOrbitDirectionFromList(store.visualization.orbitDirection),
    error: store.visualization.error,
    comparedLayers: store.compare.comparedLayers,
    comparedOpacity: store.compare.comparedOpacity,
    comparedClipping: store.compare.comparedClipping,
    auth: store.auth,
    commercialDataSearchResults: store.commercialData.searchResults,
    commercialDataHighlightedResult: store.commercialData.highlightedResult,
    commercialDataDisplaySearchResults: store.commercialData.displaySearchResults,
    commercialDataSelectedOrder: store.commercialData.selectedOrder,
    selectedTabSearchPanelIndex: store.tabs.selectedTabSearchPanelIndex,
    is3D: store.mainMap.is3D,
    selectedModeId: store.themes.selectedModeId,
    elevationProfileHighlightedPoint: store.elevationProfile.highlightedPoint,
    quicklookOverlay: store.mainMap.quicklookOverlay,
    quicklookImages: store.resultsSection.quicklookImages,
  };
};

export default connect(mapStoreToProps, null)(Map);
