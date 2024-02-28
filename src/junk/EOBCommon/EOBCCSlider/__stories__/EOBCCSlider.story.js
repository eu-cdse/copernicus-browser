import React from 'react';
import { storiesOf } from '@storybook/react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import { EOBCCSlider } from '../EOBCCSlider';
import './EOBCCSlider.scss';

const stories = storiesOf('EOB - Common - CCSlider', module);

stories.add('Default', ({ state, setState }) => {
  return (
    <div className="custom-ccslider">
      <EOBCCSlider
        onChange={(value) => setState({ value: value })}
        cloudCoverPercentage={state.value}
        sliderWidth={100}
      />
    </div>
  );
});
