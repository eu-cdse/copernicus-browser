import React from 'react';
import { storiesOf } from '@storybook/react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import { EOBMeasurePanelButton } from '../EOBMeasurePanelButton';

const stories = storiesOf('EOB - Panel - Measure', module);

stories
  .add('Default', ({ state, setState }) => {
    return (
      <EOBMeasurePanelButton
        toggleMeasure={() => setState({ toggleMeasure: true })}
        hasMeasurement={false}
        distance={1134.7}
        area={2708318.79}
        removeMeasurement={() => setState({ removeMeasurement: true })}
        isLoggedIn={false}
        onErrorMessage={(msg) => setState({ errorMsg: msg })}
      />
    );
  })
  .add('Logged In', ({ state, setState }) => {
    return (
      <EOBMeasurePanelButton
        toggleMeasure={() =>
          setState((prevState) => ({
            hasMeasurement: !prevState.hasMeasurement,
          }))
        }
        hasMeasurement={state.hasMeasurement}
        distance={1134.7}
        area={2708318.79}
        removeMeasurement={() => setState({ removeMeasurement: true })}
        isLoggedIn={true}
        onErrorMessage={(msg) => setState({ errorMsg: msg })}
      />
    );
  });
