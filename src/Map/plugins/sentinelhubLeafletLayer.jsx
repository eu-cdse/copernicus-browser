import L from 'leaflet';
import { GridLayer, withLeaflet } from 'react-leaflet';
import isEqual from 'fast-deep-equal';
import {
  LayersFactory,
  ApiType,
  BBox,
  CRS_EPSG3857,
  MimeTypes,
  S1GRDAWSEULayer,
  S2L1CLayer,
  S2L2ALayer,
  S3SLSTRLayer,
  S3OLCILayer,
  S3OLCIL2CDASLayer,
  S5PL2Layer,
  Landsat8AWSLayer,
  Landsat8AWSLOTL1Layer,
  Landsat8AWSLOTL2Layer,
  Landsat45AWSLTML1Layer,
  Landsat45AWSLTML2Layer,
  Landsat15AWSLMSSL1Layer,
  Landsat7AWSLETML1Layer,
  Landsat7AWSLETML2Layer,
  HLSAWSLayer,
  MODISLayer,
  DEMLayer,
  ProcessingDataFusionLayer,
  CancelToken,
  isCancelled,
  Interpolator,
  S2L1CCDASLayer,
  S2L2ACDASLayer,
} from '@sentinel-hub/sentinelhub-js';

import Sentinel1DataSourceHandler from '../../Tools/SearchPanel/dataSourceHandlers/Sentinel1DataSourceHandler';
import {
  S1_AWS_IW_VVVH,
  S1_AWS_IW_VV,
  S1_AWS_EW_HHHV,
  S1_AWS_EW_HH,
  S2L1C,
  S2L2A,
  S3SLSTR,
  S3OLCI,
  S5_O3,
  S5_NO2,
  S5_SO2,
  S5_CO,
  S5_HCHO,
  S5_CH4,
  S5_AER_AI,
  S5_CLOUD,
  S5_OTHER,
  S5_O3_CDAS,
  S5_NO2_CDAS,
  S5_SO2_CDAS,
  S5_CO_CDAS,
  S5_HCHO_CDAS,
  S5_CH4_CDAS,
  S5_AER_AI_CDAS,
  S5_CLOUD_CDAS,
  S5_OTHER_CDAS,
  MODIS,
  AWS_L8L1C,
  AWS_HLS,
  DEM_MAPZEN,
  DEM_COPERNICUS_30,
  DEM_COPERNICUS_90,
  COPERNICUS_CORINE_LAND_COVER,
  COPERNICUS_GLOBAL_LAND_COVER,
  COPERNICUS_WATER_BODIES,
  COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES,
  COPERNICUS_HR_VPP_VEGETATION_INDICES,
  COPERNICUS_HR_VPP_VPP_S1,
  COPERNICUS_HR_VPP_VPP_S2,
  COPERNICUS_CLC_ACCOUNTING,
  COPERNICUS_HRSI_PSA,
  COPERNICUS_HRSI_WDS,
  COPERNICUS_HRSI_SWS,
  COPERNICUS_HRSI_FSC,
  COPERNICUS_HRSI_GFSC,
  COPERNICUS_HRSI_RLIE_S1,
  COPERNICUS_HRSI_RLIE_S2,
  COPERNICUS_HRSI_RLIE_S1_S2,
  CNES_LAND_COVER,
  GLOBAL_HUMAN_SETTLEMENT,
  ESA_WORLD_COVER,
  COPERNICUS_GLOBAL_SURFACE_WATER,
  IO_LULC_10M_ANNUAL,
  AWS_LOTL1,
  AWS_LOTL2,
  AWS_LTML1,
  AWS_LTML2,
  AWS_LMSSL1,
  AWS_LETML1,
  AWS_LETML2,
  AWS_HLS_LANDSAT,
  AWS_HLS_SENTINEL,
  S1_CDAS_IW_VVVH,
  S1_CDAS_IW_HHHV,
  S1_CDAS_IW_VV,
  S1_CDAS_IW_HH,
  S1_CDAS_EW_HHHV,
  S1_CDAS_EW_VVVH,
  S1_CDAS_EW_HH,
  S1_CDAS_EW_VV,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  S3OLCI_CDAS,
  S3SLSTR_CDAS,
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
  S1_CDAS_SM_VVVH,
  S1_CDAS_SM_VV,
  S1_CDAS_SM_HHHV,
  S1_CDAS_SM_HH,
  COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC,
  COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
  S1_MONTHLY_MOSAIC_IW,
  S1_MONTHLY_MOSAIC_DH,
  S3OLCIL2_LAND,
  S3OLCIL2_WATER,
  CDSE_GLC_COLLECTION,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import {
  checkIfCustom,
  getDataSourceHandler,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import DEMDataSourceHandler from '../../Tools/SearchPanel/dataSourceHandlers/DEMDataSourceHandler';
import { constructLayerFromDatasetId } from '../../junk/EOBCommon/utils/dataFusion';
import { isDataFusionEnabled } from '../../utils';
import { constructGetMapParamsEffects } from '../../utils/effectsUtils';
import { refetchWithDefaultToken } from '../../utils/fetching.utils';
import { reqConfigMemoryCache, reqConfigGetMap, DISABLED_ORTHORECTIFICATION } from '../../const';
import { S3OLCICDASLayer } from '@sentinel-hub/sentinelhub-js';
import { S3SLSTRCDASLayer } from '@sentinel-hub/sentinelhub-js';
import { S5PL2CDASLayer } from '@sentinel-hub/sentinelhub-js';
import { S1GRDCDASLayer } from '@sentinel-hub/sentinelhub-js';
import { DEMCDASLayer } from '@sentinel-hub/sentinelhub-js';

class SentinelHubLayer extends L.TileLayer {
  constructor(options) {
    super(options);
    const defaultOptions = {
      tileSize: 512,
      format: MimeTypes.JPEG,
      attribution: '<a href="https://www.sentinel-hub.com" target="_blank">&copy Sentinel Hub</a>',
      preview: 2,
      transparent: true,
    };
    const {
      url,
      layers,
      evalscript,
      evalscripturl,
      dataFusion,
      fromTime,
      toTime,
      datasetId,
      customSelected,
      minQa,
      mosaickingOrder,
      upsampling,
      downsampling,
      speckleFilter,
      orthorectification,
      backscatterCoeff,
      accessToken,
      constellation,
      orbitDirection,
      cloudCoverage,
    } = options;

    this.layer = this.createLayer(url, {
      datasetId: datasetId,
      evalscript: evalscript,
      evalscripturl: evalscripturl,
      dataFusion: dataFusion,
      fromTime: fromTime,
      toTime: toTime,
      layer: layers,
      customSelected: customSelected,
      minQa: minQa,
      mosaickingOrder: mosaickingOrder,
      upsampling: upsampling,
      downsampling: downsampling,
      speckleFilter: speckleFilter,
      orthorectification: orthorectification,
      backscatterCoeff: backscatterCoeff,
      accessToken: accessToken,
      constellation: constellation,
      orbitDirection: orbitDirection,
      cloudCoverage: cloudCoverage,
    });

    const mergedOptions = Object.assign(defaultOptions, options);
    L.setOptions(this, mergedOptions);
  }

  onAdd = (map) => {
    this._initContainer();
    this._crs = this.options.crs || map.options.crs;
    L.TileLayer.prototype.onAdd.call(this, map);
    map.on(
      'move',
      () => {
        this.updateClipping();
        this.updateOpacity();
      },
      this,
    );
    this.updateClipping();
    this.updateOpacity();
  };

  updateClipping = () => {
    if (!this._map || !this.clipping) {
      return this;
    }

    const [a, b] = this.clipping;
    const { min, max } = this._map.getPixelBounds();
    let p = { x: a * (max.x - min.x), y: 0 };
    let q = { x: b * (max.x - min.x), y: max.y - min.y };

    p = this._map.containerPointToLayerPoint(p);
    q = this._map.containerPointToLayerPoint(q);

    let e = this.getContainer();
    e.style['overflow'] = 'hidden';
    e.style['left'] = p.x + 'px';
    e.style['top'] = p.y + 'px';
    e.style['width'] = q.x - p.x + 'px';
    e.style['height'] = q.y - p.y + 'px';
    for (let f = e.firstChild; f; f = f.nextSibling) {
      if (f.style) {
        f.style['margin-top'] = -p.y + 'px';
        f.style['margin-left'] = -p.x + 'px';
      }
    }
  };

  updateOpacity = () => {
    if (!this._map || !this.opacity) {
      return this;
    }
    let e = this.getContainer();
    e.style['opacity'] = this.opacity;
  };

  createTile = (coords, done) => {
    const tile = L.DomUtil.create('img', 'leaflet-tile');
    tile.width = this.options.tileSize;
    tile.height = this.options.tileSize;
    const cancelToken = new CancelToken();
    tile.cancelToken = cancelToken;
    const tileSize = this.options.tileSize;
    const individualTileParams = { ...this.options, width: tileSize, height: tileSize, zoom: coords.z };

    const onTileImageError = this.options.onTileImageError;
    const onTileImageLoad = this.options.onTileImageLoad;
    this.layer.then(async (layer) => {
      let reqConfig = { cancelToken: cancelToken, ...reqConfigGetMap };

      if (this.options.accessToken) {
        reqConfig.authToken = this.options.accessToken;
      }

      if (!layer.evalscript && !layer.evalscriptUrl) {
        try {
          const reqConfigUpdate = {
            cancelToken: cancelToken,
            ...reqConfigMemoryCache,
          };
          await layer.updateLayerFromServiceIfNeeded(reqConfigUpdate);
        } catch (error) {
          if (!isCancelled(error)) {
            if (onTileImageError) {
              onTileImageError(error);
            }
            console.error('There has been a problem with your fetch operation: ', error.message);
          }
        }
      }
      const apiType = layer.supportsApiType(ApiType.PROCESSING)
        ? ApiType.PROCESSING
        : layer.supportsApiType(ApiType.WMTS)
        ? ApiType.WMTS
        : ApiType.WMS;

      if (this.options.getMapAuthToken) {
        reqConfig.authToken = this.options.getMapAuthToken;
      }

      if (apiType === ApiType.WMTS) {
        individualTileParams.tileCoord = {
          x: coords.x,
          y: coords.y,
          z: coords.z,
        };
      } else {
        try {
          const nwPoint = coords.multiplyBy(tileSize);
          const sePoint = nwPoint.add([tileSize, tileSize]);
          const nw = L.CRS.EPSG3857.project(this._map.unproject(nwPoint, coords.z));
          const se = L.CRS.EPSG3857.project(this._map.unproject(sePoint, coords.z));
          const bbox = new BBox(CRS_EPSG3857, nw.x, se.y, se.x, nw.y);

          individualTileParams.bbox = bbox;
        } catch (error) {
          console.error(error.message);
          done(error, null);
        }
      }
      refetchWithDefaultToken(
        (reqConfig) =>
          layer.getMap(individualTileParams, apiType, reqConfig).then((blob) => {
            tile.onload = function () {
              URL.revokeObjectURL(tile.src);
              if (onTileImageLoad) {
                onTileImageLoad();
              }
              done(null, tile);
            };
            const objectURL = URL.createObjectURL(blob);
            tile.src = objectURL;
          }),
        reqConfig,
      ).catch(function (error) {
        if (!isCancelled(error)) {
          if (onTileImageError) {
            onTileImageError(error);
          }
          console.error('There has been a problem with your fetch operation: ', error.message);
        }
        done(error, null);
      });
    });
    return tile;
  };

  setParams = (params) => {
    this.options = Object.assign(this.options, params);
    const {
      url,
      layers,
      evalscript,
      evalscripturl,
      dataFusion,
      datasetId,
      customSelected,
      minQa,
      mosaickingOrder,
      upsampling,
      downsampling,
      speckleFilter,
      orthorectification,
      backscatterCoeff,
      accessToken,
      constellation,
      orbitDirection,
      cloudCoverage,
    } = this.options;
    this.layer = this.createLayer(url, {
      datasetId: datasetId,
      evalscript: evalscript,
      evalscripturl: evalscripturl,
      dataFusion: dataFusion,
      layer: layers,
      customSelected: customSelected,
      minQa: minQa,
      mosaickingOrder: mosaickingOrder,
      upsampling: upsampling,
      downsampling: downsampling,
      speckleFilter: speckleFilter,
      orthorectification: orthorectification,
      backscatterCoeff: backscatterCoeff,
      accessToken: accessToken,
      constellation: constellation,
      orbitDirection: orbitDirection,
      cloudCoverage: cloudCoverage,
    });

    this.redraw();
  };

  setClipping = (clipping) => {
    this.clipping = clipping;
    this.updateClipping();
  };

  setOpacity = (opacity) => {
    this.opacity = opacity;
    this.updateOpacity();
  };

  createLayer = async (url, options) => {
    const { customSelected, dataFusion } = options;

    if (url && !customSelected) {
      return await this.createLayerFromService(url, options);
    }

    if (isDataFusionEnabled(dataFusion)) {
      return await this.createDataFusionLayer(url, options);
    }
    return await this.createCustomLayer(url, options);
  };

  createLayerFromService = async (url, options) => {
    const {
      layer: layerId,
      minQa,
      mosaickingOrder,
      upsampling,
      downsampling,
      speckleFilter,
      orthorectification,
      backscatterCoeff,
      constellation,
      orbitDirection,
      cloudCoverage,
    } = options;
    let layer = await LayersFactory.makeLayer(url, layerId, null, reqConfigMemoryCache);
    await layer.updateLayerFromServiceIfNeeded(reqConfigMemoryCache);

    if (cloudCoverage !== undefined) {
      layer.maxCloudCoverPercent = cloudCoverage;
    }

    if (minQa !== undefined) {
      layer.minQa = minQa;
    }
    if (mosaickingOrder) {
      layer.mosaickingOrder = mosaickingOrder;
    }
    if (upsampling) {
      layer.upsampling = upsampling;
    } else if (!layer.upsampling) {
      layer.upsampling = Interpolator.NEAREST;
    }
    if (downsampling) {
      layer.downsampling = downsampling;
    } else if (!layer.downsampling) {
      layer.downsampling = Interpolator.NEAREST;
    }
    if (speckleFilter) {
      layer.speckleFilter = speckleFilter;
    }
    if (orthorectification) {
      if (orthorectification === DISABLED_ORTHORECTIFICATION) {
        layer.orthorectify = false;
      } else {
        layer.demInstanceType = orthorectification;
        layer.orthorectify = true;
      }
    }
    if (backscatterCoeff) {
      layer.backscatterCoeff = backscatterCoeff;
    }
    if (constellation) {
      layer.constellation = constellation;
    }

    if (orbitDirection) {
      layer.orbitDirection = orbitDirection;
    }

    const dsh = getDataSourceHandler(layer.collectionId);
    if (dsh?.supportsLowResolutionAlternativeCollection(layer.collectionId)) {
      layer.lowResolutionCollectionId = dsh.getLowResolutionCollectionId(layer.collectionId);
      layer.lowResolutionMetersPerPixelThreshold = dsh.getLowResolutionMetersPerPixelThreshold(
        layer.collectionId,
      );
    }

    return layer;
  };

  createDataFusionLayer = async (url, { dataFusion, evalscript, evalscripturl, fromTime, toTime }) => {
    const layers = [];

    for (let dataFusionEntry of dataFusion) {
      let { id, alias, mosaickingOrder, timespan, additionalParameters = {} } = dataFusionEntry;
      const layer = constructLayerFromDatasetId(id, mosaickingOrder, additionalParameters);
      layers.push({
        layer: layer,
        id: alias,
        fromTime: timespan ? timespan[0] : fromTime,
        toTime: timespan ? timespan[1] : toTime,
      });
    }

    const dataFusionLayer = new ProcessingDataFusionLayer({
      evalscript: evalscript,
      evalscriptUrl: evalscripturl,
      layers: layers,
    });
    return dataFusionLayer;
  };

  createCustomLayer = async (
    url,
    {
      datasetId,
      evalscript,
      evalscripturl,
      minQa,
      mosaickingOrder,
      upsampling,
      downsampling,
      speckleFilter,
      orthorectification,
      backscatterCoeff,
      accessToken,
      constellation,
      orbitDirection,
      cloudCoverage,
    },
  ) => {
    switch (datasetId) {
      case S1_AWS_IW_VVVH:
      case S1_AWS_IW_VV:
      case S1_AWS_EW_HHHV:
      case S1_AWS_EW_HH: {
        const { polarization, acquisitionMode, resolution } =
          Sentinel1DataSourceHandler.getDatasetParams(datasetId);
        return await new S1GRDAWSEULayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          polarization: polarization,
          acquisitionMode: acquisitionMode,
          resolution: resolution,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
          speckleFilter: speckleFilter,
          demInstanceType: orthorectification,
          orthorectify: orthorectification
            ? orthorectification === DISABLED_ORTHORECTIFICATION
              ? false
              : true
            : null,
          backscatterCoeff: backscatterCoeff,
          orbitDirection: orbitDirection,
        });
      }
      case S1_CDAS_IW_VVVH:
      case S1_CDAS_IW_HHHV:
      case S1_CDAS_IW_VV:
      case S1_CDAS_IW_HH:
      case S1_CDAS_EW_HHHV:
      case S1_CDAS_EW_VVVH:
      case S1_CDAS_EW_HH:
      case S1_CDAS_EW_VV:
      case S1_CDAS_SM_VVVH:
      case S1_CDAS_SM_VV:
      case S1_CDAS_SM_HHHV:
      case S1_CDAS_SM_HH: {
        const { polarization, acquisitionMode, resolution } =
          Sentinel1DataSourceHandler.getDatasetParams(datasetId);
        return await new S1GRDCDASLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          polarization: polarization,
          acquisitionMode: acquisitionMode,
          resolution: resolution,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
          speckleFilter: speckleFilter,
          demInstanceType: orthorectification,
          orthorectify: orthorectification
            ? orthorectification === DISABLED_ORTHORECTIFICATION
              ? false
              : true
            : null,
          backscatterCoeff: backscatterCoeff,
          orbitDirection: orbitDirection,
        });
      }
      case S2L1C:
        return await new S2L1CLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case S2_L1C_CDAS:
        return await new S2L1CCDASLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
          ...(cloudCoverage !== undefined && cloudCoverage !== null
            ? { maxCloudCoverPercent: cloudCoverage }
            : {}),
        });
      case S2L2A:
        return await new S2L2ALayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case S2_L2A_CDAS:
        return await new S2L2ACDASLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
          ...(cloudCoverage !== undefined && cloudCoverage !== null
            ? { maxCloudCoverPercent: cloudCoverage }
            : {}),
        });
      case S3SLSTR:
        return await new S3SLSTRLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case S3SLSTR_CDAS:
        return await new S3SLSTRCDASLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
          ...(cloudCoverage !== undefined && cloudCoverage !== null
            ? { maxCloudCoverPercent: cloudCoverage }
            : {}),
        });
      case S3OLCI:
        return await new S3OLCILayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case S3OLCI_CDAS:
        return await new S3OLCICDASLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case S3OLCIL2_WATER:
      case S3OLCIL2_LAND:
        return await new S3OLCIL2CDASLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
          ...(cloudCoverage !== undefined && cloudCoverage !== null
            ? { maxCloudCoverPercent: cloudCoverage }
            : {}),
        });
      case S5_O3:
      case S5_NO2:
      case S5_SO2:
      case S5_CO:
      case S5_HCHO:
      case S5_CH4:
      case S5_AER_AI:
      case S5_CLOUD:
      case S5_OTHER:
        return await new S5PL2Layer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          minQa: minQa,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case S5_O3_CDAS:
      case S5_NO2_CDAS:
      case S5_SO2_CDAS:
      case S5_CO_CDAS:
      case S5_HCHO_CDAS:
      case S5_CH4_CDAS:
      case S5_AER_AI_CDAS:
      case S5_CLOUD_CDAS:
      case S5_OTHER_CDAS:
        return await new S5PL2CDASLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          minQa: minQa,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case AWS_L8L1C:
        return await new Landsat8AWSLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case AWS_HLS:
      case AWS_HLS_LANDSAT:
      case AWS_HLS_SENTINEL:
        return await new HLSAWSLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
          constellation: constellation,
        });
      case AWS_LOTL1:
        return await new Landsat8AWSLOTL1Layer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case AWS_LOTL2:
        return await new Landsat8AWSLOTL2Layer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case AWS_LTML1:
        return await new Landsat45AWSLTML1Layer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case AWS_LTML2:
        return await new Landsat45AWSLTML2Layer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case AWS_LMSSL1:
        return await new Landsat15AWSLMSSL1Layer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case AWS_LETML1:
        return await new Landsat7AWSLETML1Layer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case AWS_LETML2:
        return await new Landsat7AWSLETML2Layer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case MODIS:
        return await new MODISLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
        });
      case DEM_MAPZEN:
      case DEM_COPERNICUS_30:
      case DEM_COPERNICUS_90:
        const { demInstance } = DEMDataSourceHandler.getDatasetParams(datasetId);
        return await new DEMLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
          demInstance: demInstance,
        });
      case DEM_COPERNICUS_30_CDAS:
      case DEM_COPERNICUS_90_CDAS:
        const { demInst } = DEMDataSourceHandler.getDatasetParams(datasetId);
        return await new DEMCDASLayer({
          evalscript: evalscript,
          evalscriptUrl: evalscripturl,
          ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
          upsampling: upsampling,
          downsampling: downsampling,
          demInstance: demInst,
        });
      case COPERNICUS_CORINE_LAND_COVER:
      case COPERNICUS_GLOBAL_LAND_COVER:
      case COPERNICUS_WATER_BODIES:
      case COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES:
      case COPERNICUS_HR_VPP_VEGETATION_INDICES:
      case COPERNICUS_HR_VPP_VPP_S1:
      case COPERNICUS_HR_VPP_VPP_S2:
      case COPERNICUS_CLC_ACCOUNTING:
      case CNES_LAND_COVER:
      case COPERNICUS_HRSI_PSA:
      case COPERNICUS_HRSI_WDS:
      case COPERNICUS_HRSI_SWS:
      case COPERNICUS_HRSI_FSC:
      case COPERNICUS_HRSI_GFSC:
      case COPERNICUS_HRSI_RLIE_S1:
      case COPERNICUS_HRSI_RLIE_S2:
      case COPERNICUS_HRSI_RLIE_S1_S2:
      case ESA_WORLD_COVER:
      case COPERNICUS_GLOBAL_SURFACE_WATER:
      case IO_LULC_10M_ANNUAL:
      case GLOBAL_HUMAN_SETTLEMENT:
      case CDSE_GLC_COLLECTION: {
        const dsh = getDataSourceHandler(datasetId);
        return await this.createBYOCLayer(
          url,
          dsh.KNOWN_COLLECTIONS[datasetId],
          evalscript,
          evalscripturl,
          accessToken,
          upsampling,
          downsampling,
          mosaickingOrder,
        );
      }
      case S1_MONTHLY_MOSAIC_IW:
      case S1_MONTHLY_MOSAIC_DH:
      case COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC:
      case COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC: {
        const dsh = getDataSourceHandler(datasetId);
        const layer = await this.createBYOCLayer(
          url,
          dsh.KNOWN_COLLECTIONS[datasetId],
          evalscript,
          evalscripturl,
          accessToken,
          upsampling,
          downsampling,
          mosaickingOrder,
        );
        if (dsh?.supportsLowResolutionAlternativeCollection(layer.collectionId)) {
          layer.lowResolutionCollectionId = dsh.getLowResolutionCollectionId(layer.collectionId);
          layer.lowResolutionMetersPerPixelThreshold = dsh.getLowResolutionMetersPerPixelThreshold(
            layer.collectionId,
          );
        }
        return layer;
      }
      default:
        const isBYOC = !!checkIfCustom(datasetId);
        if (isBYOC) {
          return await this.createBYOCLayer(
            url,
            datasetId,
            evalscript,
            evalscripturl,
            accessToken,
            upsampling,
            downsampling,
            mosaickingOrder,
          );
        }
        throw new Error("Dataset doesn't support evalscript");
    }
  };

  createBYOCLayer = (
    url,
    collectionId,
    evalscript,
    evalscripturl,
    accessToken,
    upsampling,
    downsampling,
    mosaickingOrder,
  ) => {
    let reqConfig = { authToken: accessToken ? accessToken : undefined, ...reqConfigMemoryCache };
    return LayersFactory.makeLayers(url, null, null, reqConfig).then(async (layers) => {
      for (let layer of layers) {
        await layer.updateLayerFromServiceIfNeeded(reqConfig);
        if (
          Array.isArray(collectionId)
            ? collectionId.includes(layer.collectionId)
            : layer.collectionId === collectionId
        ) {
          layer.evalscript = evalscript;
          layer.evalscripturl = evalscripturl;
          if (mosaickingOrder) {
            layer.mosaickingOrder = mosaickingOrder;
          }
          if (upsampling) {
            layer.upsampling = upsampling;
          } else if (!layer.upsampling) {
            layer.upsampling = Interpolator.NEAREST;
          }
          if (downsampling) {
            layer.downsampling = downsampling;
          } else if (!layer.downsampling) {
            layer.downsampling = Interpolator.NEAREST;
          }

          return layer;
        }
      }
      return layers[0];
    });
  };

  createSH12Layer = (url, evalscript, evalscripturl, upsampling, downsampling) => {
    // BUG: we assume that there is only one dataset used within the instance
    return LayersFactory.makeLayers(url, null, null, reqConfigMemoryCache).then((layers) => {
      let layer = layers[0];
      layer.evalscript = evalscript;
      layer.evalscripturl = evalscripturl;
      layer.upsampling = upsampling;
      layer.downsampling = downsampling;
      layer.maxCloudCoverPercent = 100;
      return layer;
    });
  };
}

class SentinelHubLayerComponent extends GridLayer {
  createLeafletElement(props) {
    const { progress, ...params } = props;
    const { leaflet: _l, ...options } = this.getOptions(params);
    const layer = new SentinelHubLayer(options);
    if (progress) {
      layer.on('loading', function () {
        progress.start();
        progress.inc();
      });

      layer.on('load', function () {
        progress.done();
      });
    }
    layer.on('tileunload', function (e) {
      e.tile.cancelToken.cancel();
    });
    layer.setClipping(params.clipping);
    layer.setOpacity(params.opacity);
    return layer;
  }

  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    const { ...prevProps } = fromProps;
    const { ...prevParams } = this.getOptions(prevProps);
    const { ...props } = toProps;
    const { ...params } = this.getOptions(props);

    if (!isEqual(params, prevParams)) {
      this.leafletElement.setParams(params);
    }
    if (fromProps.opacity !== toProps.opacity) {
      this.leafletElement.setOpacity(toProps.opacity);
    }
    if (fromProps.clipping !== toProps.clipping) {
      this.leafletElement.setClipping(toProps.clipping);
    }
  }

  getOptions(params) {
    let options = {};

    if (params.url) {
      options.url = params.url;
    }
    if (params.datasetId) {
      options.datasetId = params.datasetId;
    }
    if (params.layers) {
      options.layers = params.layers;
    }
    if (params.fromTime) {
      options.fromTime = params.fromTime;
    } else {
      options.fromTime = null;
    }
    if (params.toTime) {
      options.toTime = params.toTime;
    }
    if (params.tileSize) {
      options.tileSize = params.tileSize;
    }
    if (params.cloudCoverage !== undefined && params.cloudCoverage !== null) {
      options.cloudCoverage = params.cloudCoverage;
    }
    if (params.format) {
      options.format = MimeTypes[params.format];
    }
    if (params.customSelected && (params.evalscript || params.evalscripturl)) {
      options.customSelected = true;
      if (params.evalscript) {
        options.evalscript = params.evalscript;
        options.evalscripturl = null;
      }
      if (params.evalscripturl) {
        options.evalscript = null;
        options.evalscripturl = params.evalscripturl;
      }
      if (params.dataFusion) {
        options.dataFusion = params.dataFusion;
      }
    } else {
      options.customSelected = false;
    }

    if (params.tileSize) {
      options.tileSize = params.tileSize;
    }
    if (params.minZoom) {
      options.minZoom = params.minZoom;
    }
    if (params.maxZoom && params.allowOverZoomBy) {
      options.maxNativeZoom = params.maxZoom;
      options.maxZoom = params.maxZoom + params.allowOverZoomBy;
    } else if (params.maxZoom) {
      options.maxNativeZoom = params.maxZoom;
      options.maxZoom = params.maxZoom;
    }

    if (params.pane || params.leaflet.pane) {
      options.pane = params.pane || params.leaflet.pane;
    }

    const effects = constructGetMapParamsEffects(params);
    if (effects) {
      options.effects = effects;
    } else {
      options.effects = null;
    }

    if (params.minQa !== undefined) {
      options.minQa = params.minQa;
    } else {
      options.minQa = null;
    }

    if (params.mosaickingOrder) {
      options.mosaickingOrder = params.mosaickingOrder;
    } else {
      options.mosaickingOrder = null;
    }

    if (params.upsampling) {
      options.upsampling = params.upsampling;
    } else {
      options.upsampling = null;
    }

    if (params.downsampling) {
      options.downsampling = params.downsampling;
    } else {
      options.downsampling = null;
    }

    if (params.constellation) {
      options.constellation = params.constellation;
    } else {
      options.constellation = null;
    }

    if (params.orbitDirection) {
      options.orbitDirection = params.orbitDirection;
    } else {
      options.orbitDirection = null;
    }

    if (params.speckleFilter) {
      options.speckleFilter = params.speckleFilter;
    } else {
      options.speckleFilter = null;
    }

    if (params.orthorectification) {
      options.orthorectification = params.orthorectification;
    } else {
      options.orthorectification = null;
    }

    if (params.backscatterCoeff) {
      options.backscatterCoeff = params.backscatterCoeff;
    } else {
      options.backscatterCoeff = null;
    }

    if (params.showlogo !== undefined) {
      options.showlogo = params.showlogo;
    } else {
      options.showlogo = false;
    }

    if (params.accessToken) {
      options.accessToken = params.accessToken;
    }

    if (params.getMapAuthToken) {
      options.getMapAuthToken = params.getMapAuthToken;
    }

    if (params.onTileImageError) {
      options.onTileImageError = params.onTileImageError;
    }

    if (params.onTileImageLoad) {
      options.onTileImageLoad = params.onTileImageLoad;
    }

    return options;
  }
}
export default withLeaflet(SentinelHubLayerComponent);
