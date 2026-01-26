import React from 'react';
import RCSlider from 'rc-slider';

import { capValue } from '../../utils/effectsUtils';

const EffectRangeSlider = ({ name, min, max, step, value, onChange }) => {
  const [range, setRange] = React.useState({ min: min, max: max });

  React.useEffect(() => {
    setRange({ min: value[0], max: value[1] });
  }, [value, min, max]);

  return (
    <div className="effect-container">
      <span className="effect-name">{name}</span>
      <div className="effect-slider">
        <input
          className="slider-value-input left-value"
          type="number"
          min={min}
          max={max}
          step={step}
          value={range.min}
          onChange={(e) => {
            const cappedValue = capValue(e.target.value, min, max);
            const newMinRange = cappedValue <= range.max ? cappedValue : range.max;
            const newRange = { min: newMinRange, max: range.max };
            setRange(newRange);
            onChange([newRange.min, newRange.max]);
          }}
        />

        <RCSlider.Range
          min={min}
          max={max}
          step={step}
          value={[range.min, range.max]}
          onChange={(r) => {
            const [newMinRange, newMaxRange] = r;
            const newRange = { min: newMinRange, max: newMaxRange };
            setRange(newRange);
          }}
          onAfterChange={() => {
            onChange([range.min, range.max]);
          }}
          allowCross={false}
        />

        <input
          className="slider-value-input right-value"
          type="number"
          min={min}
          max={max}
          step={step}
          value={range.max}
          onChange={(e) => {
            const cappedValue = capValue(e.target.value, min, max);
            const newMaxRange = cappedValue >= range.min ? cappedValue : range.min;
            const newRange = { min: range.min, max: newMaxRange };
            setRange(newRange);
            onChange([newRange.min, newRange.max]);
          }}
        />
      </div>
    </div>
  );
};

export default EffectRangeSlider;
