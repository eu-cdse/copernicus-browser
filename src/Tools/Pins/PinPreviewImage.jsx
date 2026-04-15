import React from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import L from 'leaflet';
import {
  ApiType,
  BBox,
  CRS_EPSG4326,
  MimeTypes,
  CancelToken,
  isCancelled,
} from '@sentinel-hub/sentinelhub-js';

import { getDataSourceHandler } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getAppropriateAuthToken, getGetMapAuthToken } from '../../App';
import { layerFromPin, normalizePin } from './Pin.utils';
import { constructDataFusionLayer } from '../../junk/EOBCommon/utils/dataFusion';
import { isDataFusionEnabled } from '../../utils';
import { constructGetMapParamsEffects } from '../../utils/effectsUtils';
import { reqConfigMemoryCache, reqConfigGetMap, DATASOURCES } from '../../const';
import {
  getProcessGraph,
  isOpenEoSupported,
  MIMETYPE_TO_OPENEO_FORMAT,
  getOpenEOS1Options,
} from '../../api/openEO/openEOHelpers';
import Sentinel1DataSourceHandler from '../SearchPanel/dataSourceHandlers/Sentinel1DataSourceHandler';
import { metersPerPixel } from '../../utils/coords';
import openEOApi from '../../api/openEO/openEO.api';
import processGraphBuilder from '../../api/openEO/processGraphBuilder';
import { IMAGE_FORMATS } from '../../Controls/ImgDownload/consts';
import { runEffectFunctions } from '../../utils/effects/runEffectFuntions';
import { resolveEvalscript } from '../../utils';

const PIN_PREVIEW_DIMENSIONS = {
  WIDTH: 90,
  HEIGHT: 90,
};

class PinPreviewImage extends React.Component {
  state = {
    previewImgUrl: null,
    fetchingPreview: false,
  };
  cancelToken = null;

  async componentDidMount() {
    const { auth, pin } = this.props;
    const authToken = getAppropriateAuthToken(auth, pin.themeId);
    if (authToken) {
      await this.ensurePinPreview(authToken);
    }
  }

  async componentDidUpdate(prevProps) {
    const pinChanged =
      prevProps.pin?.id !== this.props.pin?.id ||
      prevProps.pin?._id !== this.props.pin?._id ||
      prevProps.pin?.datasetId !== this.props.pin?.datasetId ||
      prevProps.pin?.layerId !== this.props.pin?.layerId ||
      prevProps.pin?.visualizationUrl !== this.props.pin?.visualizationUrl ||
      prevProps.pin?.fromTime !== this.props.pin?.fromTime ||
      prevProps.pin?.toTime !== this.props.pin?.toTime ||
      prevProps.pin?.evalscript !== this.props.pin?.evalscript ||
      prevProps.pin?.evalscriptUrl !== this.props.pin?.evalscriptUrl ||
      prevProps.pin?.processGraph !== this.props.pin?.processGraph ||
      prevProps.pin?.lat !== this.props.pin?.lat ||
      prevProps.pin?.lng !== this.props.pin?.lng ||
      prevProps.pin?.zoom !== this.props.pin?.zoom;

    if (prevProps.auth !== this.props.auth || pinChanged) {
      const oldPreviewImgUrl = this.state.previewImgUrl;
      if (oldPreviewImgUrl) {
        URL.revokeObjectURL(oldPreviewImgUrl);
      }
      if (this.cancelToken) {
        this.cancelToken.cancel();
      }

      await new Promise((resolve) => {
        this.setState({ previewImgUrl: null, fetchingPreview: false }, resolve);
      });

      const { auth, pin } = this.props;
      const authToken = getAppropriateAuthToken(auth, pin.themeId);
      if (authToken) {
        await this.ensurePinPreview(authToken, true);
      }
    }
  }

  componentWillUnmount() {
    if (this.state.previewImgUrl) {
      URL.revokeObjectURL(this.state.previewImgUrl);
    }
    if (this.cancelToken) {
      this.cancelToken.cancel();
    }
  }

  computeTimes = (fromTime, toTime) => {
    const pinTimeFrom = fromTime ? moment.utc(fromTime).toDate() : moment.utc(toTime).startOf('day').toDate();

    const pinTimeTo = fromTime ? moment.utc(toTime).toDate() : moment.utc(toTime).endOf('day').toDate();

    return { pinTimeFrom, pinTimeTo };
  };

  computeBBox = (lat, lng, zoom) => {
    const { WIDTH, HEIGHT } = PIN_PREVIEW_DIMENSIONS;
    const { x, y } = L.CRS.EPSG4326.latLngToPoint(L.latLng(lat, lng), zoom);

    const { lat: south, lng: west } = L.CRS.EPSG4326.pointToLatLng(L.point(x - WIDTH, y + HEIGHT), zoom);
    const { lat: north, lng: east } = L.CRS.EPSG4326.pointToLatLng(L.point(x + WIDTH, y - HEIGHT), zoom);

    return new BBox(CRS_EPSG4326, west, south, east, north);
  };

  ensurePinPreview = async (authToken, forceReload = false) => {
    const pin = normalizePin(this.props.pin);
    const {
      zoom,
      lat,
      lng,
      fromTime,
      toTime,
      datasetId,
      evalscript,
      evalscriptUrl,
      dataFusion,
      minQa,
      mosaickingOrder,
      upsampling,
      downsampling,
      orbitDirection,
      processGraph,
    } = pin;

    const resolvedEvalscript = await resolveEvalscript(evalscript, evalscriptUrl);

    try {
      const { previewImgUrl, fetchingPreview } = this.state;
      if (!forceReload && (previewImgUrl || fetchingPreview)) {
        return;
      }

      const reqConfig = {
        authToken: authToken,
        cancelToken: this.cancelToken,
      };
      // If we fetched the content, embed it directly (avoids server-side re-fetch).
      // If not, keep evalscriptUrl so the SH API can fetch the script server-side.
      const previewPin = resolvedEvalscript
        ? { ...pin, evalscript: resolvedEvalscript, evalscriptUrl: null }
        : pin;
      const layer = await layerFromPin(previewPin, { ...reqConfigMemoryCache, ...reqConfig });
      if (!layer) {
        return;
      }

      const dsh = getDataSourceHandler(datasetId);
      const supportsTimeRange = dsh ? dsh.supportsTimeRange() : true;

      const { pinTimeFrom, pinTimeTo } = this.computeTimes(fromTime, toTime);

      // For collections with a PROCESSING API resolution limit (e.g. S2 Quarterly Mosaics at
      // 1600 m/px), compute the preview bbox at a higher zoom until the resolution is within
      // the threshold where the collection can serve data without errors.
      let bboxZoom = zoom;
      if (dsh && dsh.supportsLowResolutionAlternativeCollection(datasetId)) {
        const threshold = dsh.getLowResolutionMetersPerPixelThreshold(datasetId);
        let testBbox = this.computeBBox(lat, lng, bboxZoom);
        while (metersPerPixel(testBbox, PIN_PREVIEW_DIMENSIONS.WIDTH) > threshold && bboxZoom < 16) {
          bboxZoom++;
          testBbox = this.computeBBox(lat, lng, bboxZoom);
        }
      }
      const bbox = this.computeBBox(lat, lng, bboxZoom);

      const effects = constructGetMapParamsEffects(previewPin);
      const isEvalscript = resolvedEvalscript || evalscriptUrl;

      // Some layers (e.g. S5P) return false for supportsApiType(PROCESSING) even when a
      // custom script is set. Mirror the same guard used in sentinelhubLeafletLayer.createTile.
      const canUseProcessingApi =
        layer.supportsApiType(ApiType.PROCESSING) ||
        (!!layer.dataset && (!!layer.evalscriptUrl || !!(resolvedEvalscript || evalscript)));
      const apiType = canUseProcessingApi
        ? ApiType.PROCESSING
        : layer.supportsApiType(ApiType.WMTS)
        ? ApiType.WMTS
        : ApiType.WMS;

      const getMapAuthToken = getGetMapAuthToken(this.props.auth);
      const cancelToken = new CancelToken();
      this.cancelToken = cancelToken;

      this.setState({ fetchingPreview: true });

      let blob;

      const openEoAllowed =
        !(evalscriptUrl && !resolvedEvalscript) &&
        isOpenEoSupported(layer.instanceId, layer.layerId, IMAGE_FORMATS.PNG, isEvalscript);

      if (openEoAllowed) {
        const getMapParams = {
          bbox,
          fromTime: supportsTimeRange ? pinTimeFrom : null,
          toTime: pinTimeTo,
          width: PIN_PREVIEW_DIMENSIONS.WIDTH,
          height: PIN_PREVIEW_DIMENSIONS.HEIGHT,
          format: MimeTypes.JPEG,
          preview: 2,
          showlogo: false,
          effects,
        };

        const reqConfig = {
          cancelToken: cancelToken,
          retries: 5,
        };
        if (getMapAuthToken) {
          reqConfig.authToken = getMapAuthToken;
        }
        let processGraphToUse = processGraph
          ? JSON.parse(processGraph)
          : getProcessGraph(layer.instanceId, layer.layerId);
        const cachedProcessGraph = getProcessGraph(layer.instanceId, layer.layerId);

        const spatialExtent = {
          west: getMapParams.bbox.minX,
          east: getMapParams.bbox.maxX,
          south: getMapParams.bbox.minY,
          north: getMapParams.bbox.maxY,
          height: getMapParams.height,
          width: getMapParams.width,
          crs: bbox.crs.authId,
        };

        let collectionId;
        if (dsh.supportsLowResolutionAlternativeCollection(datasetId)) {
          const lowResolutionCollectionId = dsh.getLowResolutionCollectionId(datasetId);
          const lowResolutionMetersPerPixelThreshold = dsh.getLowResolutionMetersPerPixelThreshold(datasetId);
          const mPerPixel = metersPerPixel(getMapParams.bbox, getMapParams.width);
          if (mPerPixel > lowResolutionMetersPerPixelThreshold) {
            collectionId = `byoc-${lowResolutionCollectionId}`;
          }
        }

        const s1Options = getOpenEOS1Options({
          isS1: dsh?.datasource === DATASOURCES.S1,
          datasetParams:
            dsh?.datasource === DATASOURCES.S1
              ? Sentinel1DataSourceHandler.getDatasetParams(previewPin.datasetId)
              : undefined,
          orbitDirection: previewPin.orbitDirection,
          speckleFilter: previewPin.speckleFilter,
          orthorectification: previewPin.orthorectification,
          backscatterCoeff: previewPin.backscatterCoeff,
        });

        const newProcessGraph = processGraphBuilder.saveResult(
          processGraphBuilder.loadCollection(
            processGraphToUse,
            {
              id: collectionId,
              datasetId: datasetId,
              spatial_extent: spatialExtent,
              temporal_extent: [getMapParams.fromTime, getMapParams.toTime],
              minQa: previewPin.minQa,
              mosaickingOrder: previewPin.mosaickingOrder,
              upsampling: previewPin.upsampling,
              downsampling: previewPin.downsampling,
              ...s1Options,
            },
            cachedProcessGraph,
          ),
          { format: MIMETYPE_TO_OPENEO_FORMAT[MimeTypes.PNG] },
        );

        const tmpBlob = await openEOApi.getResult(newProcessGraph, getMapAuthToken);
        blob = await runEffectFunctions(tmpBlob, effects ?? {});
      } else {
        const getMapParams = {
          bbox: bbox,
          fromTime: supportsTimeRange ? pinTimeFrom : null,
          toTime: pinTimeTo,
          width: PIN_PREVIEW_DIMENSIONS.WIDTH,
          height: PIN_PREVIEW_DIMENSIONS.HEIGHT,
          format: MimeTypes.JPEG,
          preview: 2,
          showlogo: false,
        };

        if (effects) {
          getMapParams.effects = effects;
        }

        if (minQa !== undefined) {
          layer.minQa = minQa;
        }
        if (mosaickingOrder) {
          layer.mosaickingOrder = mosaickingOrder;
        }
        if (upsampling) {
          layer.upsampling = upsampling;
        }
        if (downsampling) {
          layer.downsampling = downsampling;
        }
        if (orbitDirection) {
          layer.orbitDirection = orbitDirection;
        }

        if (isDataFusionEnabled(dataFusion)) {
          const dataFusionLayer = await constructDataFusionLayer(
            dataFusion,
            resolvedEvalscript,
            evalscriptUrl,
            pinTimeFrom,
            pinTimeTo,
          );
          blob = await dataFusionLayer.getMap(getMapParams, ApiType.PROCESSING, {
            ...reqConfigGetMap,
            ...reqConfig,
          });
        } else {
          blob = await layer.getMap(getMapParams, apiType, { ...reqConfigGetMap, ...reqConfig });
        }
      }

      const imgUrl = blob ? URL.createObjectURL(blob) : null;
      this.setState({
        previewImgUrl: imgUrl,
        fetchingPreview: false,
      });
    } catch (e) {
      if (!isCancelled(e)) {
        console.error(e);
        this.setState({
          previewImgUrl: null,
          fetchingPreview: false,
        });
      }
    }
  };

  render() {
    const { previewImgUrl } = this.state;
    return (
      <img
        alt="saved pin"
        className="preview"
        src={previewImgUrl ? previewImgUrl : 'images/no_preview.png'}
      />
    );
  }
}

const mapStoreToProps = (store) => ({
  auth: store.auth,
});
export default connect(mapStoreToProps)(PinPreviewImage);
