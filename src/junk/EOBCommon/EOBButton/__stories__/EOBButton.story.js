import React from 'react';
import { storiesOf } from '@storybook/react';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';

import { EOBButton } from '../EOBButton';

const stories = storiesOf('EOB - Common - Button', module);

stories.add('Default', ({ state, setState }) => {
  return (
    <React.Fragment>
      <div style={{ width: 200, padding: 10 }}>
        <h3>Primary</h3>
        <EOBButton text="Click Me" icon="refresh" onClick={() => setState({ onClick: true })} />
      </div>
      <div style={{ width: 200, padding: 10 }}>
        <h3>Secondary</h3>
        <EOBButton
          className="secondary"
          text="Click Me"
          icon="refresh"
          onClick={() => setState({ onClick: true })}
        />
      </div>
      <div style={{ width: 200, padding: 10 }}>
        <h3>Small</h3>
        <EOBButton
          disabled={true}
          className="small"
          text="I'm small"
          icon="refresh"
          onClick={() => setState({ onClick: true })}
        />
      </div>
      <div style={{ width: 600, padding: 10 }}>
        <h3>Full size</h3>
        <EOBButton
          className="full-size"
          text="Click Me"
          icon="refresh"
          onClick={() => setState({ onClick: true })}
        />
      </div>
      <div style={{ width: 600, padding: 10 }}>
        <h3>Disabled</h3>
        <EOBButton
          disabled={true}
          className="full-size"
          text="Click Me"
          icon="refresh"
          onClick={() => setState({ onClick: true })}
        />
      </div>
    </React.Fragment>
  );
});
