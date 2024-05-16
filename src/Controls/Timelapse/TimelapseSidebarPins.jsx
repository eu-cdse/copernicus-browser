import React, { Component } from 'react';
import { t } from 'ttag';

import { constructTimespanString } from '../../Tools/Pins/Pin.utils';
import PinPreviewImage from '../../Tools/Pins/PinPreviewImage';
import { constructEffectsFromPinOrHighlight } from '../../utils/effectsUtils';

export class TimelapseSidebarPins extends Component {
  render() {
    const { pins, onAddPin, onSidebarPopupToggle } = this.props;

    if (!pins) {
      return null;
    }

    return (
      <div className="sidebar-overlay">
        <div className="sidebar-pins">
          <h2>Pins</h2>
          <span className="remove" onClick={() => onSidebarPopupToggle('pins')}>
            <i className="fas fa-times"></i>
          </span>
          <div className="pins-container">
            {pins.map((pin, index) => {
              const effects = constructEffectsFromPinOrHighlight(pin.item);
              const pinItem = { ...pin.item, ...effects };

              return (
                <div className="pin-container" key={index} onClick={() => onAddPin(pinItem)}>
                  <PinPreviewImage pin={pinItem} />
                  <div>
                    <div className="pin-title">
                      <span>{pinItem.title}</span>
                    </div>
                    <div>
                      <label>{t`Date`}:</label>&nbsp;
                      <span className="pin-date">{constructTimespanString(pinItem)}</span>
                    </div>
                    <div>
                      <label>{t`Lat/Lon`}:&nbsp;</label>
                      <span>
                        {parseFloat(pinItem.lat).toFixed(2)}, {parseFloat(pinItem.lng).toFixed(2)}
                        &nbsp;|&nbsp;{t`Zoom`}:&nbsp;{pinItem.zoom}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    );
  }
}
