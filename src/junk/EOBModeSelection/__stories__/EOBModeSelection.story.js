import React from 'react';
import { storiesOf } from '@storybook/react';

import EOBModeSelection from '../EOBModeSelection';
import { EDUCATION_MODE, DEFAULT_MODE, MODES } from '../../../const';
import './EOBModeSelection.story.scss';

const stories = storiesOf('EOB - Panel - Mode selection', module);

stories.add('Default', ({ state, setState }) => {
  const modeId = state.modeId || DEFAULT_MODE.id;
  return (
    <div style={{ background: 'white', height: '20vh' }}>
      <EOBModeSelection
        modes={MODES}
        selectedModeId={modeId}
        onSelectMode={(modeId) => setState({ modeId: modeId })}
        highlighted={modeId === EDUCATION_MODE.id}
      />
    </div>
  );
});

stories.add('Education', ({ state, setState }) => {
  const modeId = state.modeId || EDUCATION_MODE.id;
  return (
    <div style={{ background: 'white', height: '20vh' }}>
      <EOBModeSelection
        modes={MODES}
        selectedModeId={modeId}
        onSelectMode={(modeId) => setState({ modeId: modeId })}
        highlighted={modeId === EDUCATION_MODE.id}
      />
    </div>
  );
});
