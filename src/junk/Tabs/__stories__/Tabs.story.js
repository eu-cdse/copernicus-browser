import React from 'react';
import { storiesOf } from '@storybook/react';

import { Tabs, Tab } from '../Tabs';
import './Tabs.scss';

const stories = storiesOf('Tabs', module);

stories.add('EOB', ({ state, setState }) => {
  const mainTabIndex = state.index || 0;

  return (
    <div id="root">
      <Tabs
        activeIndex={mainTabIndex}
        onSelect={(index) => setState({ index: index })}
        onErrorMessage={(msg) => setState({ errorMsg: msg })}
      >
        <Tab id="SearchTab" title="Search" icon="search" renderKey={0}>
          Search
        </Tab>
        <Tab id="ResultsTab" title="Results" icon="list" renderKey={1} enabled={true}>
          Results
        </Tab>
        <Tab id="VisualizationTab" title="Visualization" icon="paint-brush" renderKey={2} enabled={false}>
          Visualization
        </Tab>
        <Tab id="PinsTab" title="Pins" icon="thumb-tack" renderKey={3}>
          Pins
        </Tab>
      </Tabs>
    </div>
  );
});
