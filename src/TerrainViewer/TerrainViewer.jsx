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
  getBackgroundTileUrl,
  getTileCoord,
  getTileXAndTileY,
  is3DDemSourceCustom,
  getDem3DMaxZoomLevel,
  getDemProviderType,
} from './TerrainViewer.utils';
import { CURRENT_TERRAIN_VIEWER_ID, TERRAIN_VIEWER_IDS } from './TerrainViewer.const';
import { getDataSourceHandler } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getGetMapAuthToken } from '../App';
import { constructGetMapParamsEffects, getVisualizationEffectsFromStore } from '../utils/effectsUtils';
import { DEM_3D_CUSTOM_TO_DATASOURCE, reqConfigGetMap, reqConfigMemoryCache } from '../const';
import Controls from '../Controls/Controls';
import { constructPanelError, isDataFusionEnabled } from '../utils';
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
  const cancelTokenRef = useRef(new CancelToken());
  const [timeoutId, setTimeoutId] = useState(null);
  const [loader, setLoader] = useState();
  const terrainViewerContainer = useRef();

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
  const fromTime = props.fromTime;

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

  const setBounds = useCallback(
    ({ x, y, z, rotH, rotV }) => {
      if (!terrainViewerContainer.current) {
        console.warn('Cannot set bounds - terrain viewer container is null');
        return;
      }

      const containerWidth = terrainViewerContainer.current.clientWidth;
      const containerHeight = terrainViewerContainer.current.clientHeight;
      const { pixelBounds, bounds } = getBoundsFrom3DPosition({
        x,
        y,
        z,
        rotV,
        rotH,
        width: containerWidth,
        height: containerHeight,
      });
      store.dispatch(
        mainMapSlice.actions.setBounds({
          bounds,
          pixelBounds,
        }),
      );
    },
    [terrainViewerContainer],
  );

  const onResize = useCallback(() => {
    setBounds({ x, y, z, rotH, rotV });
  }, [setBounds, x, y, z, rotH, rotV]);

  useEffect(() => {
    if (props.is3D) {
      setDisabled(false);
    }
  }, [props.is3D]);

  const on3DButtonClicked = useCallback(
    (viewerId, buttonId) => {
      if (buttonId === 'center3Dto2D') {
        window.set3DPosition(viewerId, x, y, 8000);
      }
    },
    [x, y],
  );

  const on3DPositionChanged = useCallback(
    (viewerId, x, y, z, rotH, rotV) => {
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
    },
    [timeoutId, is3D, terrainViewerSettings, setBounds],
  );

  const onTerrainViewerLoadingStateChanged = useCallback((isLoading, type) => {
    if (type === 'OVERALL') {
      setLoader(isLoading);
    }
  }, []);

  const on3DLoadingStateChanged = useCallback((viewerId, isLoading, type) => {
    const func = window.on3DLoadingStateChangedFunctions?.[CURRENT_TERRAIN_VIEWER_ID];
    if (func) {
      func(isLoading, type);
    }
  }, []);

  const on3DSettingsChanged = useCallback(
    (viewerId) => {
      store.dispatch(
        terrainViewerSlice.actions.setTerrainViewerSettings({
          ...terrainViewerSettings,
          sunTime: window.get3DSunTime(viewerId),
          settings: window.get3DSettings(viewerId),
        }),
      );
    },
    [terrainViewerSettings],
  );

  const on3DShadingClick = useCallback(() => {
    if (shadingEnabled) {
      setSunEnabled(false);
      window.enable3DSun(terrainViewerId, false);
    }
    setShadingEnabled(!shadingEnabled);
    window.enable3DShading(terrainViewerId, !shadingEnabled);
  }, [shadingEnabled, terrainViewerId]);

  const on3DSunClick = useCallback(() => {
    if (!sunEnabled) {
      setShadingEnabled(true);
      window.enable3DShading(terrainViewerId, true);
    }
    setSunEnabled(!sunEnabled);
    window.enable3DSun(terrainViewerId, !sunEnabled);
    window.show3DSunTimeDialog(terrainViewerId, !sunEnabled);
  }, [sunEnabled, terrainViewerId]);

  const animateExit = useCallback(async () => {
    if (!terrainViewerContainer.current) {
      return Promise.resolve();
    }

    const z2D = getEyeHeightFromZoom(props.lat, props.zoom, terrainViewerContainer.current.clientWidth);

    window.on3DPositionChanged = () => {};
    window.get3DMapTileUrl = () => {};
    cancelTokenRef.current.cancel();

    return await new Promise((resolve) => {
      const closingAnimationId = 'exit-animation';
      window.on3DAnimationCompleted = (viewerId, animationId) => {
        if (viewerId === terrainViewerId && animationId === closingAnimationId) {
          resolve();
        }
      };

      try {
        window.animate3D(terrainViewerId, closingAnimationId, {
          isLooping: false,
          frames: [
            { x, y, z, rotH, rotV, duration: 0.8 },
            { x, y, z: z2D, rotH: rotH > 180 ? 360 : 0, rotV: 0, duration: 0.2 },
          ],
        });
      } catch (error) {
        resolve();
      }
    });
  }, [terrainViewerContainer, props.lat, props.zoom, terrainViewerId, x, y, z, rotH, rotV]);

  const onClose = useCallback(() => {
    cancelTokenRef.current.cancel();
    window.removeEventListener('resize', onResize);
    if (terrainViewerId) {
      window.close3DViewer(terrainViewerId);
    }
    store.dispatch(terrainViewerSlice.actions.resetTerrainViewerSettings());
    store.dispatch(terrainViewerSlice.actions.setTerrainViewerId(null));
  }, [onResize, terrainViewerId]);

  const set3DLocation = useCallback(
    (x, y, zoom) => {
      const z = getHeightFromZoom(zoom);
      window.set3DPosition(terrainViewerId, x, y, z, 0, 0);
    },
    [terrainViewerId],
  );

  const onTileError = useCallback(async (error) => {
    const message = await constructPanelError(error);
    store.dispatch(notificationSlice.actions.displayPanelError(message));
  }, []);

  const get3DMapTileUrl = useCallback((viewerId, minX, minY, maxX, maxY, width, height, callback) => {
    const func = window.get3DMapTileUrlFunctions?.[CURRENT_TERRAIN_VIEWER_ID];
    if (func) {
      func(minX, minY, maxX, maxY, width, height, callback);
    } else {
      const { tileX, tileY, zoomLevel } = getTileCoord(minX, minY, maxX, maxY);
      const mapTilerUrl = getBackgroundTileUrl({ tileX, tileY, zoomLevel });
      callback(mapTilerUrl);
    }
  }, []);

  const get3DDemTileUrl = useCallback(
    async (viewerId, minX, minY, maxX, maxY, width, height, callback) => {
      const SW = convertToWgs84([minX, minY]);
      const NE = convertToWgs84([maxX, maxY]);
      const bounds = L.latLngBounds(L.latLng(SW[1], SW[0]), L.latLng(NE[1], NE[0]));
      const origZoom = getBoundsZoomLevel(bounds);
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
        cancelToken: cancelTokenRef.current,
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
    },
    [layer, props, minZoom, fromTime, toTime, auth, onTileError, DEFAULT_TILE_SIZE, DEFAULT_DEM_TILE_SIZE],
  );

  const getTerrainViewerMapTileUrl = useCallback(
    (minX, minY, maxX, maxY, width, height, callback) => {
      const { tileX, tileY, zoomLevel } = getTileCoord(minX, minY, maxX, maxY);
      const mapTilerUrl = getBackgroundTileUrl({ tileX, tileY, zoomLevel });

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
        cancelToken: cancelTokenRef.current,
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
    },
    [layer, minZoom, fromTime, toTime, props, auth, onTileError],
  );

  useEffect(() => {
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
      window.terrainViewerId = terrainViewerId;

      if (is3DDemSourceCustom(props.demSource3D)) {
        window.get3DDemTileUrl = get3DDemTileUrl;
      }

      return () => {
        window.get3DMapTileUrl = undefined;
        window.on3DButtonClicked = undefined;
        window.on3DPositionChanged = undefined;
        window.on3DLoadingStateChanged = () => {};
        window.on3DSettingsChanged = undefined;
        window.set3DLocation = undefined;
        window.terrainViewerId = undefined;

        if (window.on3DLoadingStateChangedFunctions) {
          delete window.on3DLoadingStateChangedFunctions[TERRAIN_VIEWER_IDS.MAIN];
        }
        if (window.get3DMapTileUrlFunctions) {
          delete window.get3DMapTileUrlFunctions[TERRAIN_VIEWER_IDS.MAIN];
        }
        if (is3DDemSourceCustom(props.demSource3D)) {
          window.get3DDemTileUrl = undefined;
        }
      };
    }
  }, [
    is3D,
    terrainViewerId,
    props.demSource3D,
    on3DButtonClicked,
    on3DPositionChanged,
    on3DSettingsChanged,
    set3DLocation,
    getTerrainViewerMapTileUrl,
    get3DDemTileUrl,
    get3DMapTileUrl,
    on3DLoadingStateChanged,
    onTerrainViewerLoadingStateChanged,
  ]);

  useEffect(() => {
    async function changeLayer() {
      if (
        is3D &&
        props.dataSourcesInitialized &&
        props.datasetId &&
        (props.layerId || props.evalscript || props.evalscripturl)
      ) {
        if (props.visibleOnMap) {
          const newLayer = await getLayerFromParams(props).catch((e) => {
            console.warn(e.message);
          });
          if (newLayer) {
            if (!isDataFusionEnabled(props.dataFusion)) {
              await newLayer.updateLayerFromServiceIfNeeded(reqConfigMemoryCache);
            }
            const dsh = getDataSourceHandler(newLayer.collectionId);
            if (dsh?.supportsLowResolutionAlternativeCollection(newLayer.collectionId)) {
              newLayer.lowResolutionCollectionId = dsh.getLowResolutionCollectionId(newLayer.collectionId);
              newLayer.lowResolutionMetersPerPixelThreshold = dsh.getLowResolutionMetersPerPixelThreshold(
                newLayer.collectionId,
              );
            }
            // Cancel in-flight requests before setting new layer
            cancelTokenRef.current.cancel();
            cancelTokenRef.current = new CancelToken();

            setLayer(newLayer);
          }
        } else {
          setLayer(null);

          if (terrainViewerId) {
            try {
              window.clearTextureCache && window.clearTextureCache(terrainViewerId);
              window.clearTextures && window.clearTextures(terrainViewerId);

              window.get3DMapTileUrl = (viewerId, minX, minY, maxX, maxY, width, height, callback) => {
                const { tileX, tileY, zoomLevel } = getTileCoord(minX, minY, maxX, maxY);
                const mapTilerUrl = getBackgroundTileUrl({ tileX, tileY, zoomLevel });
                callback(mapTilerUrl);
              };

              window.refresh3DTiles && window.refresh3DTiles(terrainViewerId, true);

              const currentPos = { x, y, z, rotH, rotV };
              window.set3DPosition(terrainViewerId, x, y, z * 1.001, rotH, rotV);

              setTimeout(() => {
                window.set3DPosition(
                  terrainViewerId,
                  currentPos.x,
                  currentPos.y,
                  currentPos.z,
                  currentPos.rotH,
                  currentPos.rotV,
                );
              }, 50);
            } catch (error) {
              console.error('Error clearing textures:', error);
            }
          }
        }
      }
    }
    changeLayer();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [
    is3D,
    terrainViewerId,
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
    props.visibleOnMap,
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

  useEffect(() => {
    if (props.is3D && !terrainViewerId && terrainViewerContainer.current) {
      const currentContainer = terrainViewerContainer.current;

      (async () => {
        try {
          await getLayerFromParams(props).catch((e) => {
            console.warn('Error initializing 3D viewer layer:', e.message);
          });

          setLayer(null);

          window.addEventListener('resize', onResize);

          window.set3DLocale(locale);
          cancelTokenRef.current = new CancelToken();
          const tileSize = DEFAULT_DEM_TILE_SIZE;
          const maxZoomLevel = getDem3DMaxZoomLevel(props.demSource3D);
          const demProviderType = getDemProviderType(props.demSource3D);

          const newTerrainViewerId = window.create3DViewer(
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

          store.dispatch(terrainViewerSlice.actions.setTerrainViewerId(newTerrainViewerId));
          window.set3DSunTime(newTerrainViewerId, sunTime);
          window.set3DSettings(newTerrainViewerId, settings);
        } catch (error) {
          console.error('Error during 3D initialization:', error);
        }
      })();

      return () => {
        if (currentContainer) {
          window.removeEventListener('resize', onResize);
        }
      };
    }
  }, [
    props.is3D,
    terrainViewerId,
    onResize,
    locale,
    props.demSource3D,
    x,
    y,
    z,
    rotH,
    rotV,
    sunTime,
    settings,
    props,
  ]);

  useEffect(() => {
    return () => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
      cancelTokenRef.current.cancel();
      window.removeEventListener('resize', onResize);
      if (terrainViewerId) {
        window.close3DViewer(terrainViewerId);
      }
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (terrainViewerId) {
      // Cancel in-flight requests and clear pending queue
      cancelTokenRef.current.cancel();
      cancelTokenRef.current = new CancelToken();

      if (layer) {
        window.get3DMapTileUrl = get3DMapTileUrl;
        window.reload3DTextures(terrainViewerId);
      } else {
        window.get3DMapTileUrl = (viewerId, minX, minY, maxX, maxY, width, height, callback) => {
          const { tileX, tileY, zoomLevel } = getTileCoord(minX, minY, maxX, maxY);
          const mapTilerUrl = getBackgroundTileUrl({ tileX, tileY, zoomLevel });
          callback(mapTilerUrl);
        };

        try {
          if (window.clearTextureCache) {
            window.clearTextureCache(terrainViewerId);
          }
          if (window.clearTextures) {
            window.clearTextures(terrainViewerId);
          }
          if (window.refresh3DTiles) {
            window.refresh3DTiles(terrainViewerId, true);
          }
          window.reload3DTextures(terrainViewerId);
        } catch (error) {
          console.error('Error during texture clearing:', error);
        }
      }
    }
  }, [layer, terrainViewerId, get3DMapTileUrl]);

  useEffect(() => {
    if (!props.is3D && terrainViewerId) {
      animateExit()
        .then(() => {
          onClose();
          setDisabled(true);
        })
        .catch(() => {
          onClose();
          setDisabled(true);
        });
    }
  }, [props.is3D, terrainViewerId, animateExit, onClose]);

  if (disabled || (!terrainViewerContainer.current && props.is3D)) {
    if (props.is3D) {
      return (
        <div
          id="terrain-map-container"
          ref={terrainViewerContainer}
          style={{ maxWidth: `${toolsOpen && !isMobile ? 'calc(100vw - 450px)' : '100vw'}` }}
        >
          <div className="loader-bar" />
        </div>
      );
    }
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
  evalscripturl: store.visualization.evalscripturl,
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
  visibleOnMap: store.visualization.visibleOnMap,
});

export default connect(mapStoreToProps, null)(TerrainViewer);
