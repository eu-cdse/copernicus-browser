import React, { Component } from 'react';
import { t } from 'ttag';
import moment from 'moment';

import PinPreviewImage from '../../Pins/PinPreviewImage';
import store, { compareLayersSlice } from '../../../store';
import Description from '../../Pins/Description';

import { constructTimespanString } from '../../Pins/Pin.utils';
import { constructEffectsFromPinOrHighlight } from '../../../utils/effectsUtils';
import { getDataSourceHandler } from '../dataSourceHandlers/dataSourceHandlers';

import './Highlight.scss';

import DoubleChevronDown from '../../../icons/double-chevron-down.svg?react';
import DoubleChevronUp from '../../../icons/double-chevron-up.svg?react';

class Highlight extends Component {
  state = {
    showDescription: false,
  };

  toggleDescription = (e) => {
    e.stopPropagation();
    this.setState((prevState) => ({
      showDescription: !prevState.showDescription,
    }));
  };

  canDisplayDescription = () => {
    const { description } = this.props.pin;

    return description !== '' && description;
  };

  addHighlightToCompare = (e) => {
    e.stopPropagation();
    const effects = constructEffectsFromPinOrHighlight(this.props.pin);
    const highlight = { ...this.props.pin, ...effects };

    const dsh = getDataSourceHandler(highlight.datasetId);
    const supportsTimeRange = dsh ? dsh.supportsTimeRange() : true;

    if (supportsTimeRange) {
      // Highlights usually only have toTime, which is the date of visualization
      // Compare expects fromTime and toTime if timerange is supported
      if (!highlight.fromTime) {
        highlight.fromTime = moment.utc(highlight.toTime).startOf('day').toISOString();
        highlight.toTime = moment.utc(highlight.toTime).endOf('day').toISOString();
      }
    }

    store.dispatch(compareLayersSlice.actions.addToCompare(highlight));
  };

  render() {
    const { pin, index } = this.props;
    const { description, title } = pin;
    const { showDescription } = this.state;

    const effects = constructEffectsFromPinOrHighlight(pin);
    const highlight = { ...pin, ...effects };

    return (
      <div className="highlight-item normal-mode" id={`${index}`}>
        <div className="highlight-content" onClick={this.props.onSelect}>
          <PinPreviewImage pin={highlight} />
          <div className="highlight-info">
            <span className="highlight-info-row">{title}</span>
            <div>
              <label>{t`Date`}:</label> <span className="highlight-date">{constructTimespanString(pin)}</span>
            </div>
            {this.canDisplayDescription() && (
              <div
                className="highlight-info-row pin-description-toggle"
                title={showDescription ? t`Hide description` : t`Show description`}
                onClick={this.toggleDescription}
              >
                <div className="description-toggle">
                  {showDescription ? (
                    <DoubleChevronUp className="double-chevron-up" />
                  ) : (
                    <DoubleChevronDown className="double-chevron-down" />
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        {this.canDisplayDescription() && (
          <Description canEdit={false} content={description} showContent={showDescription} />
        )}
      </div>
    );
  }
}

export default Highlight;
