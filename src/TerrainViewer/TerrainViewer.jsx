import React, { useState, useEffect, useRef, useCallback } from 'react';
import { connect } from 'react-redux';
import { BBox, CRS_EPSG3857, MimeTypes, CancelToken, DEMLayer } from '@sentinel-hub/sentinelhub-js';
import proj4 from 'proj4';
import { t } from 'ttag';
import L from 'leaflet';

import store, { terrainViewerSlice, mainMapSlice, notificationSlice } from '../store';
import { getLayerFromParams } from '../Controls/ImgDownload/ImageDownload.utils';
import { convertToWgs84, wgs84ToMercator } from '../junk/EOBCommon/utils/coords';
import {
  getMapTile,
  getPositionString,
  getEyeHeightFromBounds,
  getBoundsFrom3DPosition,
  getZoomFromEyeHeight,
  getEyeHeightFromZoom,
  getHeightFromZoom,
  getMaptilerUrl,
  getTileCoord,
  getTileXAndTileY,
  is3DDemSourceCustom,
  getDem3DMaxZoomLevel,
  getDemProviderType,
} from './TerrainViewer.utils';
import { CURRENT_TERRAIN_VIEWER_ID, TERRAIN_VIEWER_IDS } from './TerrainViewer.const';
import {
  datasourceForDatasetId,
  getDataSourceHandler,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getGetMapAuthToken } from '../App';
import { constructGetMapParamsEffects, getVisualizationEffectsFromStore } from '../utils/effectsUtils';
import { DATASOURCES, DEM_3D_CUSTOM_TO_DATASOURCE, reqConfigGetMap, reqConfigMemoryCache } from '../const';
import Controls from '../Controls/Controls';
import { constructPanelError, getUrlParams, isDataFusionEnabled } from '../utils';
import ExternalLink from '../ExternalLink/ExternalLink';

import IconSun from './icons/icon-sun.svg?react';

import 'rodal/lib/rodal.css';
import { getBoundsZoomLevel } from '../utils/coords';
import { isMobile } from 'react-device-detect';
import { getOrbitDirectionFromList } from '../Tools/VisualizationPanel/VisualizationPanel.utils';

function TerrainViewer(props) {
  /*
    This component uses icons by https://fontawesome.com/, available under a Creative Commons Licence https://creativecommons.org/licenses/by/4.0/legalcode
    Icons were converted to PNG and resized.
  */
  const [layer, setLayer] = useState();
  const [shadingEnabled, setShadingEnabled] = useState(true);
  const [sunEnabled, setSunEnabled] = useState(false);
  const [disabled, setDisabled] = useState(!props.is3D);
  const [cancelToken, setCancelToken] = useState(new CancelToken());
  const [timeoutId, setTimeoutId] = useState(null);
  const [loader, setLoader] = useState();
  const terrainViewerContainer = useRef();

  const { evalscripturl } = getUrlParams();

  const {
    toTime,
    lat,
    lng,
    datasetId,
    locale,
    auth,
    terrainViewerSettings,
    is3D,
    mapBounds,
    dataSourcesInitialized,
    terrainViewerId,
    toolsOpen,
  } = props;
  const isGIBS = datasourceForDatasetId(datasetId) === DATASOURCES.GIBS;
  const fromTime = isGIBS ? null : props.fromTime;

  const { x: defaultX, y: defaultY } = wgs84ToMercator({ lat: lat, lng: lng });
  const {
    x = defaultX,
    y = defaultY,
    z = getEyeHeightFromBounds(mapBounds),
    rotV = 10,
    rotH = 0,
    settings,
    sunTime,
  } = terrainViewerSettings || {};
  const DEFAULT_TILE_SIZE = 512;
  const DEFAULT_DEM_TILE_SIZE = 512;

  let minZoom = 7;
  if (dataSourcesInitialized && datasetId) {
    const dsh = getDataSourceHandler(datasetId);
    if (dsh) {
      minZoom = dsh.getLeafletZoomConfig(datasetId).min;
    }
  }

  const onResize = useCallback(
    () => setBounds({ x: x, y: y, z: z, rotH: rotH, rotV: rotV }),
    // eslint-disable-next-line
    [],
  );

  useEffect(() => {
    if (is3D && terrainViewerContainer.current) {
      setBounds({ x: x, y: y, z: z, rotH: rotH, rotV: rotV });
    }
    // eslint-disable-next-line
  }, [terrainViewerContainer]);

  useEffect(() => {
    if (props.is3D) {
      setDisabled(false);
      on3DInitialized();
    } else if (terrainViewerId) {
      animateExit().then(() => {
        onClose();
        setDisabled(true);
      });
    }
    // eslint-disable-next-line
  }, [props.is3D]);

  useEffect(() => {
    async function changeLayer(layer) {
      if (
        layer &&
        props.dataSourcesInitialized &&
        props.datasetId &&
        (props.layerId || props.evalscript || evalscripturl)
      ) {
        const newLayer = await getLayerFromParams(props).catch((e) => {
          console.warn(e.message);
        });
        if (newLayer) {
          if (!isDataFusionEnabled(props.dataFusion)) {
            await newLayer.updateLayerFromServiceIfNeeded(reqConfigMemoryCache);
          }
          const dsh = getDataSourceHandler(layer.collectionId);
          if (dsh?.supportsLowResolutionAlternativeCollection(layer.collectionId)) {
            layer.lowResolutionCollectionId = dsh.getLowResolutionCollectionId(layer.collectionId);
            layer.lowResolutionMetersPerPixelThreshold = dsh.getLowResolutionMetersPerPixelThreshold(
              layer.collectionId,
            );
          }

          setLayer(newLayer);
          window.reload3DTextures(terrainViewerId);
        }
      }
    }
    changeLayer(layer);
    // eslint-disable-next-line
  }, [
    props.layerId,
    props.evalscript,
    props.evalscripturl,
    // eslint-disable-next-line
    isDataFusionEnabled(props.dataFusion) && props.dataFusion,
    props.visualizationUrl,
    props.fromTime,
    props.toTime,
    props.datasetId,
    props.customSelected,
    props.gainEffect,
    props.gammaEffect,
    props.redRangeEffect,
    props.greenRangeEffect,
    props.blueRangeEffect,
    props.upsampling,
    props.downsampling,
    props.minQa,
    props.speckleFilter,
    props.orthorectification,
    props.backscatterCoeff,
    props.dataSourcesInitialized,
    props.orbitDirection,
    props.cloudCoverage,
    props.dateMode,
  ]);

  useEffect(() => {
    if (terrainViewerId) {
      window.set3DLocale(props.locale);
    }
    // eslint-disable-next-line
  }, [props.locale]);

  useEffect(() => {
    if (terrainViewerId) {
      const tileSize = DEFAULT_DEM_TILE_SIZE;
      const maxZoomLevel = getDem3DMaxZoomLevel(props.demSource3D);
      const demProviderType = getDemProviderType(props.demSource3D);

      window.set3DDemProvider(terrainViewerId, demProviderType, tileSize, maxZoomLevel);
      window.set3DPosition(terrainViewerId, x, y, z, rotH, rotV);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [props.demSource3D]);

  function set3DLocation(x, y, zoom) {
    const z = getHeightFromZoom(zoom);
    window.set3DPosition(terrainViewerId, x, y, z, 0, 0);
  }

  async function onTileError(error) {
    const message = await constructPanelError(error);
    store.dispatch(notificationSlice.actions.displayPanelError(message));
  }

  function get3DMapTileUrl(viewerId, minX, minY, maxX, maxY, width, height, callback) {
    const func = window.get3DMapTileUrlFunctions[CURRENT_TERRAIN_VIEWER_ID];
    if (func) {
      func(minX, minY, maxX, maxY, width, height, callback);
    } else {
      const { tileX, tileY, zoomLevel } = getTileCoord(minX, minY, maxX, maxY);
      const mapTilerUrl = getMaptilerUrl({ tileX, tileY, zoomLevel });
      callback(mapTilerUrl);
    }
  }

  function getTerrainViewerMapTileUrl(minX, minY, maxX, maxY, width, height, callback) {
    const { tileX, tileY, zoomLevel } = getTileCoord(minX, minY, maxX, maxY);
    const mapTilerUrl = getMaptilerUrl({ tileX, tileY, zoomLevel });

    if (!layer || zoomLevel <= minZoom) {
      callback(mapTilerUrl);
      return;
    }

    const getMapParams = {
      bbox: new BBox(CRS_EPSG3857, minX, minY, maxX, maxY),
      format: MimeTypes.JPEG,
      width: width,
      height: height,
      fromTime: fromTime && fromTime.toDate(),
      toTime: toTime.toDate(),
      preview: 2,
      effects: constructGetMapParamsEffects(props),
      tileCoord: {
        x: tileX,
        y: tileY,
        z: zoomLevel,
      },
    };
    const reqConfig = {
      cancelToken: cancelToken,
      authToken: getGetMapAuthToken(auth),
      retries: 0,
      ...reqConfigGetMap,
    };

    function onCallback(url) {
      if (url === null) {
        callback(mapTilerUrl);
      } else {
        callback(url);
      }
    }

    getMapTile({
      layer,
      params: getMapParams,
      minX,
      minY,
      maxX,
      maxY,
      width,
      height,
      callback: onCallback,
      reqConfig,
      onTileError,
    });
  }

  async function get3DDemTileUrl(viewerId, minX, minY, maxX, maxY, width, height, callback) {
    const SW = convertToWgs84([minX, minY]);
    const NE = convertToWgs84([maxX, maxY]);
    const bounds = L.latLngBounds(L.latLng(SW[1], SW[0]), L.latLng(NE[1], NE[0]));
    const origZoom = getBoundsZoomLevel(bounds);
    // Difference between zooms based on tile size
    const zoomLevel =
      origZoom > 2 ? origZoom - Math.log2(DEFAULT_TILE_SIZE / DEFAULT_DEM_TILE_SIZE) : origZoom;

    const { tileX, tileY } = getTileXAndTileY(zoomLevel, minX, minY, maxX, maxY);

    const dsh = getDataSourceHandler(DEM_3D_CUSTOM_TO_DATASOURCE[props.demSource3D]);
    const minZoomLevel = dsh
      ? dsh.getLeafletZoomConfig(DEM_3D_CUSTOM_TO_DATASOURCE[props.demSource3D]).min
      : minZoom;

    if (!layer || zoomLevel <= minZoomLevel) {
      let url = `https://s3.amazonaws.com/elevation-tiles-prod/terrarium/${zoomLevel}/${tileX}/${tileY}.png`;
      callback(url);
      return;
    }

    const getMapParams = {
      bbox: new BBox(CRS_EPSG3857, minX, minY, maxX, maxY),
      format: MimeTypes.PNG,
      width: DEFAULT_DEM_TILE_SIZE,
      height: DEFAULT_DEM_TILE_SIZE,
      fromTime: fromTime && fromTime.toDate(),
      toTime: toTime.toDate(),
      preview: 2,
      effects: constructGetMapParamsEffects(props),
      tileCoord: {
        x: tileX,
        y: tileY,
        z: zoomLevel,
      },
    };
    const reqConfig = {
      cancelToken: cancelToken,
      authToken: getGetMapAuthToken(auth),
      retries: 0,
      ...reqConfigGetMap,
    };

    function onCallback(url) {
      callback(url, 'png', () => URL.revokeObjectURL(url));
    }

    const demLayer = new DEMLayer({
      demInstance: props.demSource3D,
      evalscript: `
      //VERSION=3
      function setup(){
        return {
          input: ["DEM"],
          output: {bands: 3, sampleType: "UINT8"}
        }
      }

      function evaluatePixel(sample) {
        // RGB color coded elevation data
        var dem = sample.DEM + 32768;
        var red = Math.floor(dem / 256);
        var green = Math.floor(dem - 256 * red);
        var blue = Math.floor(256 * (dem - green - 256 * red));
        return [red, green, blue];
      }
    `,
    });

    getMapTile({
      layer: demLayer,
      params: getMapParams,
      minX,
      minY,
      maxX,
      maxY,
      width: DEFAULT_DEM_TILE_SIZE,
      height: DEFAULT_DEM_TILE_SIZE,
      callback: onCallback,
      reqConfig,
      onTileError,
    });
  }

  async function on3DInitialized() {
    if (!is3D) {
      return;
    }
    const layer = await getLayerFromParams(props).catch((e) => {
      console.warn(e.message);
    });
    if (layer && !isDataFusionEnabled(props.dataFusion)) {
      await layer.updateLayerFromServiceIfNeeded(reqConfigMemoryCache);
    }
    const dsh = getDataSourceHandler(layer.collectionId);
    if (dsh?.supportsLowResolutionAlternativeCollection(layer.collectionId)) {
      layer.lowResolutionCollectionId = dsh.getLowResolutionCollectionId(layer.collectionId);
      layer.lowResolutionMetersPerPixelThreshold = dsh.getLowResolutionMetersPerPixelThreshold(
        layer.collectionId,
      );
    }

    window.addEventListener('resize', onResize);

    window.set3DLocale(locale);
    setLayer(layer);
    setCancelToken(new CancelToken());
    const tileSize = DEFAULT_DEM_TILE_SIZE;
    const maxZoomLevel = getDem3DMaxZoomLevel(props.demSource3D);
    const demProviderType = getDemProviderType(props.demSource3D);

    const terrainViewerId = window.create3DViewer(
      'terrain-map-container',
      x,
      y,
      z,
      rotH,
      rotV,
      demProviderType,
      tileSize,
      maxZoomLevel,
    );
    store.dispatch(terrainViewerSlice.actions.setTerrainViewerId(terrainViewerId));
    window.set3DSunTime(terrainViewerId, sunTime);
    window.set3DSettings(terrainViewerId, settings);
  }

  function on3DButtonClicked(viewerId, buttonId) {
    if (buttonId === 'center3Dto2D') {
      window.set3DPosition(viewerId, x, y, 8000);
    }
  }

  function on3DPositionChanged(viewerId, x, y, z, rotH, rotV) {
    clearTimeout(timeoutId);
    if (!is3D) {
      return;
    }

    const newTimeoutId = setTimeout(() => {
      const [lng, lat] = proj4('EPSG:3857', 'EPSG:4326', [x, y]);
      const zoom = getZoomFromEyeHeight(x, y, z);
      store.dispatch(
        terrainViewerSlice.actions.setTerrainViewerSettings({
          ...terrainViewerSettings,
          x: x,
          y: y,
          z: z,
          rotH: rotH,
          rotV: rotV,
        }),
      );
      store.dispatch(
        mainMapSlice.actions.setPosition({
          lat: lat,
          lng: lng,
          zoom: zoom,
        }),
      );
      setBounds({ x: x, y: y, z: z, rotH: rotH, rotV: rotV });
    }, 500);
    setTimeoutId(newTimeoutId);
  }

  function onTerrainViewerLoadingStateChanged(isLoading, type) {
    if (type === 'OVERALL') {
      setLoader(isLoading);
    }
  }

  function on3DLoadingStateChanged(viewerId, isLoading, type) {
    const func = window.on3DLoadingStateChangedFunctions[CURRENT_TERRAIN_VIEWER_ID];
    if (func) {
      func(isLoading, type);
    }
  }

  function on3DSettingsChanged(viewerId) {
    store.dispatch(
      terrainViewerSlice.actions.setTerrainViewerSettings({
        ...terrainViewerSettings,
        sunTime: window.get3DSunTime(viewerId),
        settings: window.get3DSettings(viewerId),
      }),
    );
  }

  function on3DShadingClick() {
    if (shadingEnabled) {
      setSunEnabled(false);
      window.enable3DSun(terrainViewerId, false);
    }
    setShadingEnabled(!shadingEnabled);
    window.enable3DShading(terrainViewerId, !shadingEnabled);
  }

  function on3DSunClick() {
    if (!sunEnabled) {
      setShadingEnabled(true);
      window.enable3DShading(terrainViewerId, true);
    }
    setSunEnabled(!sunEnabled);
    window.enable3DSun(terrainViewerId, !sunEnabled);
    window.show3DSunTimeDialog(terrainViewerId, !sunEnabled);
  }

  function setBounds({ x, y, z, rotH, rotV }) {
    const containerWidth = terrainViewerContainer.current.clientWidth;
    const containerHeight = terrainViewerContainer.current.clientHeight;
    const { pixelBounds, bounds } = getBoundsFrom3DPosition({
      x: x,
      y: y,
      z: z,
      rotV: rotV,
      rotH: rotH,
      width: containerWidth,
      height: containerHeight,
    });
    store.dispatch(
      mainMapSlice.actions.setBounds({
        bounds: bounds,
        pixelBounds: pixelBounds,
      }),
    );
  }

  async function animateExit() {
    const z2D = getEyeHeightFromZoom(props.lat, props.zoom, terrainViewerContainer.current.clientWidth);

    window.on3DPositionChanged = () => {};
    window.get3DMapTileUrl = () => {};
    cancelToken.cancel();

    return await new Promise((resolve) => {
      const closingAnimationId = 'exit-animation';
      window.on3DAnimationCompleted = (viewerId, animationId) =>
        viewerId === terrainViewerId && animationId === closingAnimationId && resolve();
      window.animate3D(terrainViewerId, closingAnimationId, {
        isLooping: false,
        frames: [
          { x: x, y: y, z: z, rotH: rotH, rotV: rotV, duration: 0.8 },
          { x: x, y: y, z: z2D, rotH: rotH > 180 ? 360 : 0, rotV: 0, duration: 0.2 },
        ],
      });
    });
  }

  function onClose() {
    cancelToken.cancel();
    window.removeEventListener('resize', onResize);
    window.close3DViewer(terrainViewerId);
    store.dispatch(terrainViewerSlice.actions.resetTerrainViewerSettings());
    store.dispatch(terrainViewerSlice.actions.setTerrainViewerId(null));
  }

  if (is3D) {
    if (!window.on3DLoadingStateChangedFunctions) {
      window.on3DLoadingStateChangedFunctions = {};
    }
    if (!window.get3DMapTileUrlFunctions) {
      window.get3DMapTileUrlFunctions = {};
    }
    window.get3DMapTileUrl = get3DMapTileUrl;
    window.on3DButtonClicked = on3DButtonClicked;
    window.on3DPositionChanged = on3DPositionChanged;
    window.on3DLoadingStateChanged = on3DLoadingStateChanged;
    window.on3DSettingsChanged = on3DSettingsChanged;
    window.set3DLocation = set3DLocation;
    window.on3DLoadingStateChangedFunctions[TERRAIN_VIEWER_IDS.MAIN] = onTerrainViewerLoadingStateChanged;
    window.get3DMapTileUrlFunctions[TERRAIN_VIEWER_IDS.MAIN] = getTerrainViewerMapTileUrl;
    if (is3DDemSourceCustom(props.demSource3D)) {
      window.get3DDemTileUrl = get3DDemTileUrl;
    }
  }

  useEffect(() => {
    if (layer) {
      window.get3DMapTileUrl = get3DMapTileUrl;
      window.reload3DTextures(terrainViewerId);
    }
    // eslint-disable-next-line
  }, [layer]);

  window.set3DLocation = set3DLocation;
  window.terrainViewerId = terrainViewerId;
  window.on3DObjectInteraction = (viewerId, x, y, z, longitude, latitude, distance, isClicked) => {};

  if (disabled) {
    return null;
  }

  const closingClass = !is3D ? 'closing' : '';

  return (
    <>
      <div
        id="terrain-map-container"
        ref={terrainViewerContainer}
        style={{ maxWidth: `${toolsOpen && !isMobile ? 'calc(100vw - 450px)' : '100vw'}` }}
      >
        <div className={`loader-bar ${loader ? '' : 'hidden'}`} />
        <div className="toolbar3d">
          <div
            className={`button3d help`}
            onClick={() => {
              window.show3DHelpDialog(terrainViewerId);
            }}
            title={t`Help`}
          >
            <i className="fa fa-info"></i>
          </div>
          <div
            className={`button3d animated ${closingClass}`}
            onClick={() => {
              window.show3DGeneralSettingsDialog(terrainViewerId, true);
            }}
            title={t`Settings`}
          >
            <i className="fa fa-regular fa-gear"></i>
          </div>
          <div
            className={`button3d animated ${shadingEnabled ? 'enabled' : ''} ${closingClass}`}
            onClick={on3DShadingClick}
            title={t`Shading`}
          >
            <i className="fa fa-regular fa-lightbulb-o"></i>
          </div>
          <div
            className={`button3d animated ${sunEnabled ? 'enabled' : ''} ${closingClass}`}
            onClick={on3DSunClick}
            title={t`Sun`}
          >
            <IconSun className="icon" />
          </div>
        </div>
        <div className="info3dcontainer">{getPositionString(lat, lng, z)}</div>
        <div className="attribution">
          <ExternalLink
            className="attribution-link maptiler-attribution"
            href="https://www.maptiler.com/copyright/"
          >
            © MapTiler
          </ExternalLink>
          <ExternalLink
            className="attribution-link osm-attribution"
            href="https://www.openstreetmap.org/copyright"
          >
            © OpenStreetMap contributors
          </ExternalLink>
          <ExternalLink
            className="attribution-link sentinelhub-attribution"
            href="https://www.sentinel-hub.com/"
          >
            © Sentinel Hub
          </ExternalLink>
        </div>
      </div>

      <Controls is3D={true} />
    </>
  );
}

const mapStoreToProps = (store) => ({
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
  zoom: store.mainMap.zoom,
  mapBounds: store.mainMap.bounds,
  pixelBounds: store.mainMap.pixelBounds,
  is3D: store.mainMap.is3D,
  layerId: store.visualization.layerId,
  evalscript: store.visualization.evalscript,
  dataFusion: store.visualization.dataFusion,
  visualizationUrl: store.visualization.visualizationUrl,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  dateMode: store.visualization.dateMode,
  cloudCoverage: store.visualization.cloudCoverage,
  datasetId: store.visualization.datasetId,
  customSelected: store.visualization.customSelected,
  ...getVisualizationEffectsFromStore(store),
  orbitDirection: getOrbitDirectionFromList(store.visualization.orbitDirection),
  demSource3D: store.visualization.demSource3D,
  selectedThemesListId: store.themes.selectedThemesListId,
  themesLists: store.themes.themesLists,
  selectedThemeId: store.themes.selectedThemeId,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  locale: store.language.selectedLanguage,
  user: store.auth.user,
  auth: store.auth,
  terrainViewerSettings: store.terrainViewer.settings,
  terrainViewerId: store.terrainViewer.id,
});

export default connect(mapStoreToProps, null)(TerrainViewer);
