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
import { getAppropriateAuthToken } from '../../App';
import { layerFromPin } from './Pin.utils';
import { constructDataFusionLayer } from '../../junk/EOBCommon/utils/dataFusion';
import { isDataFusionEnabled } from '../../utils';
import { constructGetMapParamsEffects } from '../../utils/effectsUtils';
import { reqConfigMemoryCache, reqConfigGetMap } from '../../const';
import { getConstellationFromDatasetId } from '../SearchPanel/dataSourceHandlers/HLSAWSDataSourceHandler.utils';

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

      this.cancelToken = new CancelToken();
      const reqConfig = {
        authToken: authToken,
        cancelToken: this.cancelToken,
      };

      const layer = await layerFromPin(this.props.pin, { ...reqConfigMemoryCache, ...reqConfig });
      if (!layer) {
        return;
      }

      this.setState({ fetchingPreview: true });
      const apiType = layer.supportsApiType(ApiType.PROCESSING)
        ? ApiType.PROCESSING
        : layer.supportsApiType(ApiType.WMTS)
        ? ApiType.WMTS
        : ApiType.WMS;

      const pinTimeFrom = fromTime
        ? moment.utc(fromTime).toDate()
        : moment.utc(toTime).startOf('day').toDate();
      const pinTimeTo = fromTime ? moment.utc(toTime).toDate() : moment.utc(toTime).endOf('day').toDate();

      const { x, y } = L.CRS.EPSG4326.latLngToPoint(L.latLng(lat, lng), zoom);
      const { lat: south, lng: west } = L.CRS.EPSG4326.pointToLatLng(
        L.point(x - PIN_PREVIEW_DIMENSIONS.WIDTH, y + PIN_PREVIEW_DIMENSIONS.HEIGHT),
        zoom,
      );
      const { lat: north, lng: east } = L.CRS.EPSG4326.pointToLatLng(
        L.point(x + PIN_PREVIEW_DIMENSIONS.WIDTH, y - PIN_PREVIEW_DIMENSIONS.HEIGHT),
        zoom,
      );
      const bbox = new BBox(CRS_EPSG4326, west, south, east, north);

      const dsh = getDataSourceHandler(datasetId);
      const supportsTimeRange = dsh ? dsh.supportsTimeRange() : true; //We can only check if a datasetId is BYOC when the datasource handler for it is instantiated (thus, we are on the user instance which includes that BYOC collection), so we set default to `true` to cover that case.
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

      const getMapParamsEffects = constructGetMapParamsEffects(this.props.pin);
      if (getMapParamsEffects) {
        getMapParams.effects = getMapParamsEffects;
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

      let blob;

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
