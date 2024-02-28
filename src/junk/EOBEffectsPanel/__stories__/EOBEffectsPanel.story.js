import React from 'react';
import { storiesOf } from '@storybook/react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import { EOBEffectsPanel } from '../EOBEffectsPanel';
import './EOBEffectsPanel.scss';

const stories = storiesOf('EOB - EffectsPanel', module);

stories.add('Default', ({ state, setState }) => (
  <div id="storybook-EOBEffectsPanel">
    <EOBEffectsPanel
      effects={effects}
      isFISLayer={false}
      onUpdateGainEffect={(value) => setState({ gainEffect: value })}
      onUpdateGammaEffect={(value) => setState({ gammaEffect: value })}
      onUpdateRedRangeEffect={(value) => setState({ redRangeEffect: value })}
      onUpdateGreenRangeEffect={(value) => setState({ greenRangeEffect: value })}
      onUpdateBlueRangeEffect={(value) => setState({ blueRangeEffect: value })}
    />
  </div>
));

stories.add('FIS layer', ({ state, setState }) => (
  <div id="storybook-EOBEffectsPanel">
    <EOBEffectsPanel
      effects={effects}
      isFISLayer={true}
      onUpdateGainEffect={(value) => setState({ gainEffect: value })}
      onUpdateGammaEffect={(value) => setState({ gammaEffect: value })}
      onUpdateRedRangeEffect={(value) => setState({ redRangeEffect: value })}
      onUpdateGreenRangeEffect={(value) => setState({ greenRangeEffect: value })}
      onUpdateBlueRangeEffect={(value) => setState({ blueRangeEffect: value })}
    />
  </div>
));

const effects = {
  gainEffect: 1,
  gammaEffect: 1,
  redRangeEffect: [0, 1],
  greenRangeEffect: [0, 1],
  blueRangeEffect: [0, 1],
};
