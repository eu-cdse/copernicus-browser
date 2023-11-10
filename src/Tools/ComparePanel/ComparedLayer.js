import React, { Component } from 'react';
import { connect } from 'react-redux';
import Slider, { Range } from 'rc-slider';
import { t } from 'ttag';

import store, { mainMapSlice, compareLayersSlice } from '../../store';
import { parsePosition } from '../../utils';
import PinPreviewImage from '../Pins/PinPreviewImage';
import { constructTimespanString } from '../Pins/Pin.utils';

import { ReactComponent as LocationCrosshairsSvg } from './LocationCrosshair.svg';
import { COMPARE_OPTIONS } from '../../const';

import './ComparedLayer.scss';

class ComparedLayer extends Component {
  zoomToPin = () => {
    const { zoom, lat, lng } = this.props.layer;
    const { lat: parsedLat, lng: parsedLng, zoom: parsedZoom } = parsePosition(lat, lng, zoom);
    store.dispatch(
      mainMapSlice.actions.setPosition({
        lat: parsedLat,
        lng: parsedLng,
        zoom: parsedZoom,
      }),
    );
  };

  onChange = (e) => {
    if (this.props.compareMode === COMPARE_OPTIONS.COMPARE_OPACITY.value) {
      store.dispatch(compareLayersSlice.actions.updateOpacity({ index: this.props.index, value: e }));
    } else {
      store.dispatch(compareLayersSlice.actions.updateClipping({ index: this.props.index, value: e }));
    }
  };

  removeLayer = () => {
    store.dispatch(compareLayersSlice.actions.removeFromCompare(this.props.index));
  };

  render() {
    const { layer, compareMode, opacity, clipping, index } = this.props;
    const { title, lat, lng, zoom } = layer;
    return (
      <div className={`compare-layer normal-mode`} id={index}>
        <div className="order-layers">
          <div className="compare-drag-handler">
            <i className="fa fa-ellipsis-v compare-drag-handler-icon" />
            <i className="fa fa-ellipsis-v compare-drag-handler-icon" />
          </div>
        </div>
        <div
          className="remove-layer"
          onClick={(e) => {
            e.stopPropagation();
            this.removeLayer();
          }}
          title={t`Remove layer`}
        >
          <i className="fas fa-trash" />
        </div>
        <div
          className="zoom-to-layer"
          title={t`Zoom to location`}
          onClick={(e) => {
            e.stopPropagation();
            this.zoomToPin();
          }}
        >
          <LocationCrosshairsSvg />
        </div>
        <div className="compare-layer-content">
          <PinPreviewImage pin={layer} />
          <div className="compare-layer-info">
            <span>{title}</span>
            <div>
              <label>{t`Date`}:</label> <span className="pin-date">{constructTimespanString(layer)}</span>
            </div>
            <div>
              <label>{t`Lat/Lon`}:</label> {parseFloat(lat).toFixed(2)}, {parseFloat(lng).toFixed(2)} |{' '}
              <label>{t`Zoom`}:</label> {zoom}
            </div>
            {compareMode === COMPARE_OPTIONS.COMPARE_OPACITY.value && (
              <div className="compare-panel-slider opacity">
                <label>{t`Opacity`}:</label>
                <Slider
                  min={0}
                  max={1}
                  step={0.01}
                  value={opacity != null ? opacity : 1.0}
                  onChange={this.onChange}
                />
                <span>{opacity != null ? opacity : 1.0}</span>
              </div>
            )}
            {compareMode === COMPARE_OPTIONS.COMPARE_SPLIT.value && (
              <div className="compare-panel-slider split">
                <label>{t`Split position`}:</label>
                <Range
                  min={0}
                  max={1}
                  step={0.01}
                  value={clipping ? clipping : [0, 1]}
                  onChange={this.onChange}
                />
              </div>
            )}
          </div>
        </div>
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  anonToken: store.auth.anonToken,
  authToken: store.auth.user.access_token,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(ComparedLayer);
