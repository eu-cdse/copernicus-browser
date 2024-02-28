import React from 'react';

import LegendFromSpec from './LegendFromSpec';
import LegendFromUrl from './LegendFromUrl';

import './Legend.scss';

export default class Legend extends React.Component {
  render() {
    const { legendDefinitionFromLayer, legendUrl } = this.props;
    return (
      <div className="layer-legend">
        {legendDefinitionFromLayer ? (
          <LegendFromSpec legend={legendDefinitionFromLayer} />
        ) : legendUrl ? (
          <LegendFromUrl legendUrl={legendUrl} />
        ) : null}
      </div>
    );
  }
}
