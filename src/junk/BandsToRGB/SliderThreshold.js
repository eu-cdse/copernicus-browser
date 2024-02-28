import React, { Component } from 'react';
import { Slider, Rail, Handles, Tracks } from 'react-compound-slider';
import { SliderRail, KeyboardHandle, Track } from './SliderComponents';
import { pickColor } from './utils';

const sliderStyle = {
  position: 'relative',
  width: '100%',
};

// if slider step is below 1, bugs appear https://github.com/sghall/react-compound-slider/issues/93
// that is why we offset incoming/outgoing values
const SLIDER_BUG_OFFSET = 100;

export class SliderThreshold extends Component {
  onUpdate = (update) => {
    this.props.onSliderUpdate(this.divideWithOffset(update));
  };

  onChange = (values) => {
    this.props.onSliderChange(this.divideWithOffset(values));
  };

  divideWithOffset = (values) => {
    return values.map((item) => item / SLIDER_BUG_OFFSET);
  };

  multiplyWithOffset = (values) => {
    return values.map((item) => item * SLIDER_BUG_OFFSET);
  };

  calculateGradient = (handlePositions, gradient, values) => {
    const firstValue = values[0];
    const lastValue = values[values.length - 1];

    const firstHandlePosition = handlePositions[0];
    const lastHandlePosition = handlePositions[handlePositions.length - 1];
    const range = lastValue - firstValue;

    const offsetLeftInPercent = `${((firstHandlePosition - firstValue) * 100) / range}%`;
    const offsetRightInPercent = `${100 - ((lastValue - lastHandlePosition) * 100) / range}%`;

    const leftGradientColor = pickColor(gradient[0], gradient[1], firstHandlePosition, firstValue, lastValue);
    const rightGradientColor = pickColor(gradient[0], gradient[1], lastHandlePosition, firstValue, lastValue);

    const transparentLeft = `rgba(0,0,0,0) ${offsetLeftInPercent},`;
    const fullGradient = `${leftGradientColor} ${offsetLeftInPercent}, ${rightGradientColor} ${offsetRightInPercent},`;
    const transparentRight = `rgba(0,0,0,0) ${offsetRightInPercent}`;

    return `linear-gradient(90deg, ${transparentLeft} ${fullGradient} ${transparentRight})`;
  };

  render() {
    const { values, colors, domain, gradient, invalidMinMax, handlePositions } = this.props;
    // because of lib bug read above
    const fixedValues = this.multiplyWithOffset(this.props.handlePositions);
    let fixedDomain = domain;

    if (!isNaN(domain[0]) && !isNaN(domain[1])) {
      fixedDomain = [domain[0] * SLIDER_BUG_OFFSET, domain[1] * SLIDER_BUG_OFFSET];
    }

    const gradientStyle = this.calculateGradient(handlePositions, gradient, values);
    return (
      <div className="slider-transparent-background">
        <div className="slider">
          <Slider
            domain={fixedDomain}
            mode={3}
            onChange={this.onChange}
            onUpdate={this.onUpdate}
            rootStyle={sliderStyle}
            step={1}
            values={fixedValues}
          >
            <Rail>
              {({ getRailProps }) => <SliderRail getRailProps={getRailProps} gradient={gradientStyle} />}
            </Rail>
            <Handles>
              {({ handles, getHandleProps }) => (
                <div className="slider-handles">
                  {!invalidMinMax() &&
                    handles.map((handle, index) => (
                      <KeyboardHandle
                        key={handle.id}
                        handle={handle}
                        domain={fixedDomain}
                        rampValue={values[index]}
                        getHandleProps={getHandleProps}
                        pointingToColor={colors && colors[index]}
                      />
                    ))}
                </div>
              )}
            </Handles>
            <Tracks left={false} right={false}>
              {({ tracks, getTrackProps }) => (
                <div className="slider-tracks">
                  {tracks.map(({ id, source, target }, index) => (
                    <Track
                      key={id}
                      source={source}
                      target={target}
                      getTrackProps={getTrackProps}
                      first={index === 0}
                      last={index === tracks.length - 1}
                    />
                  ))}
                </div>
              )}
            </Tracks>
          </Slider>
        </div>
      </div>
    );
  }
}
