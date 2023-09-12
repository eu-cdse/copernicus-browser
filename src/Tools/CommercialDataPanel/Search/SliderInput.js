import React from 'react';
import { EOBCCSlider } from '../../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';

export const SliderInput = ({ input, params, onChangeHandler }) => (
  <div key={`${params.dataProvider}-${input.id}`} className="row">
    <label title={input.label()}>{input.label()}</label>
    <EOBCCSlider
      sliderWidth={120}
      cloudCoverPercentage={!isNaN(params[input.id]) ? params[input.id] : input.defaultValue}
      onChange={(value) => onChangeHandler(input.id, value)}
      min={input.min}
      max={input.max}
      showIcons={input.showIcons}
      unit={input.unit ? input.unit : null}
    />
  </div>
);
