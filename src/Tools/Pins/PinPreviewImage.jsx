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
import { layerFromPin } from './Pin.utils';
import { constructDataFusionLayer } from '../../junk/EOBCommon/utils/dataFusion';
import { isDataFusionEnabled } from '../../utils';
import { constructGetMapParamsEffects, isVisualizationEffectsApplied } from '../../utils/effectsUtils';
import { reqConfigMemoryCache, reqConfigGetMap } from '../../const';
import { getConstellationFromDatasetId } from '../SearchPanel/dataSourceHandlers/HLSAWSDataSourceHandler.utils';
import {
  getProcessGraph,
  isOpenEoSupported,
  MIMETYPE_TO_OPENEO_FORMAT,
} from '../../api/openEO/openEOHelpers';
import { metersPerPixel } from '../../utils/coords';
import openEOApi from '../../api/openEO/openEO.api';
import processGraphBuilder from '../../api/openEO/processGraphBuilder';
import { IMAGE_FORMATS } from '../../Controls/ImgDownload/consts';

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
    if (prevProps.auth !== this.props.auth) {
      const { auth, pin } = this.props;
      const authToken = getAppropriateAuthToken(auth, pin.themeId);
      if (authToken) {
        await this.ensurePinPreview(authToken);
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

  ensurePinPreview = async (authToken) => {
    const {
      zoom,
      lat,
      lng,
      fromTime,
      toTime,
      datasetId,
      evalscript,
      evalscripturl,
      dataFusion,
      minQa,
      mosaickingOrder,
      upsampling,
      downsampling,
      orbitDirection,
    } = this.props.pin;

    try {
      const { previewImgUrl, fetchingPreview } = this.state;
      if (previewImgUrl || fetchingPreview) {
        return;
      }

      const reqConfig = {
        authToken: authToken,
        cancelToken: this.cancelToken,
      };
      const layer = await layerFromPin(this.props.pin, { ...reqConfigMemoryCache, ...reqConfig });
      if (!layer) {
        return;
      }

      const dsh = getDataSourceHandler(datasetId);
      const supportsTimeRange = dsh ? dsh.supportsTimeRange() : true;

      const { pinTimeFrom, pinTimeTo } = this.computeTimes(fromTime, toTime);
      const bbox = this.computeBBox(lat, lng, zoom);

      const effects = constructGetMapParamsEffects(this.props.pin);
      const isEffectsApplied = isVisualizationEffectsApplied(this.props.pin);
      const isEvalscript = evalscript || evalscripturl;

      const apiType = layer.supportsApiType(ApiType.PROCESSING)
        ? ApiType.PROCESSING
        : layer.supportsApiType(ApiType.WMTS)
        ? ApiType.WMTS
        : ApiType.WMS;

      const getMapAuthToken = getGetMapAuthToken(this.props.auth);
      const cancelToken = new CancelToken();

      this.setState({ fetchingPreview: true });

      let blob;

      const openEoAllowed = isOpenEoSupported(
        layer.instanceId,
        layer.layerId,
        IMAGE_FORMATS.PNG,
        isEffectsApplied,
        isEvalscript,
      );

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

        const processGraph = getProcessGraph(layer.instanceId, layer.layerId);
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

        const newProcessGraph = processGraphBuilder.saveResult(
          processGraphBuilder.loadCollection(processGraph, {
            id: collectionId,
            spatial_extent: spatialExtent,
            temporal_extent: [getMapParams.fromTime, getMapParams.toTime],
          }),
          { format: MIMETYPE_TO_OPENEO_FORMAT[MimeTypes.PNG] },
        );

        blob = await openEOApi.getResult(newProcessGraph, getMapAuthToken);
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
        const constellation = getConstellationFromDatasetId(datasetId);
        if (constellation) {
          layer.constellation = constellation;
        }

        if (isDataFusionEnabled(dataFusion)) {
          const dataFusionLayer = await constructDataFusionLayer(
            dataFusion,
            evalscript,
            evalscripturl,
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
