import React from 'react';
import RCSlider from 'rc-slider';
import { logToLinear, capValue, calcLog } from '../../utils/effectsUtils';

const EffectSlider = ({ name, min, max, step, value, onChange, useLogScale = true }) => {
  const [sliderValue, setSliderValue] = React.useState(useLogScale ? logToLinear(value, min, max) : value);
  const [inputValue, setinputValue] = React.useState(value);

  React.useEffect(() => {
    setSliderValue(useLogScale ? logToLinear(value, min, max) : value);
    setinputValue(value);
  }, [value, min, max, useLogScale]);

  return (
    <div className="effect-container">
      <span className="effect-name">{name}</span>
      <div className="effect-slider">
        <RCSlider
          className="slider-no-left-value"
          min={min}
          max={max}
          step={step}
          value={sliderValue}
          onChange={(x) => {
            setSliderValue(x);
            const cappedValue = capValue(useLogScale ? calcLog(x, min, max) : x, min, max);
            setinputValue(cappedValue);
          }}
          onAfterChange={() => onChange(inputValue)}
        />

        <input
          className="slider-value-input right-value"
          type="number"
          min={min}
          max={max}
          step={step}
          value={inputValue}
          onChange={(e) => {
            const cappedValue = capValue(e.target.value, min, max);
            setSliderValue(useLogScale ? logToLinear(cappedValue, min, max) : cappedValue);
            onChange(cappedValue);
          }}
        />
      </div>
    </div>
  );
};

export default EffectSlider;
