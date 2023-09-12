import React, { Component } from 'react';
import { t } from 'ttag';

import { constructTimespanString } from './Pin.utils';

export default class InvalidPin extends Component {
  render() {
    const { item, error, index } = this.props;
    const { lat, lng, zoom, title } = item;

    return (
      <div className="pin-item normal-mode invalid" id={`${index}`}>
        <div className="error">
          <i className="fa fa-exclamation-triangle" /> {error}
        </div>
        <div className="pin-top-container">
          <div className="pin-left-controls-container">
            <div
              className="remove-pin"
              onClick={(e) => {
                e.stopPropagation();
                this.props.onRemovePin(index);
              }}
              title={t`Remove pin`}
            >
              <i className="fa fa-trash" />
            </div>
          </div>

          <div className="preview-image"></div>

          <div className="pin-info">
            <div className="pin-info-row pin-info-title">
              <span>{title}</span>
            </div>
            <div className="pin-info-row pin-date">
              <label>{t`Date`}:</label> <span className="pin-date">{constructTimespanString(item)}</span>
            </div>
            <div className="pin-info-row pin-location" title={t`Zoom to pinned location`}>
              <label>{t`Lat/Lon`}:&nbsp;</label>
              <span className="pin-lat-lng-link">
                {parseFloat(lat).toFixed(2)}, {parseFloat(lng).toFixed(2)}
                &nbsp;|&nbsp;{t`Zoom`}:&nbsp;{zoom}
              </span>
            </div>
          </div>
        </div>
      </div>
    );
  }
}
