import React from 'react';
import RCSlider from 'rc-slider';

import 'rc-slider/assets/index.css';
import './EOBCCSlider.scss';

export class EOBCCSlider extends React.Component {
  static defaultProps = {
    sliderWidth: 50,
    containerWidth: 0,
    cloudCoverPercentage: 100,
    onChange: () => {},
    onAfterChange: () => {},
    min: 0,
    max: 100,
    showIcons: true,
    icon: 'fas fa-cloud',
    unit: '%',
  };

  render() {
    return (
      <div className="cc-slider">
        <div className="rcStyler" style={{ width: this.props.sliderWidth }}>
          <RCSlider
            min={this.props.min}
            max={this.props.max}
            step={1}
            value={this.props.cloudCoverPercentage}
            onChange={this.props.onChange}
            onAfterChange={this.props.onAfterChange}
          />
        </div>
        {this.props.showIcons && <i className={this.props.icon}>&nbsp;</i>}
        <div className="percentage">
          {this.props.cloudCoverPercentage}
          {this.props.unit ? this.props.unit : ''}
        </div>
      </div>
    );
  }
}
