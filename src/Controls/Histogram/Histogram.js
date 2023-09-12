import React, { Component } from 'react';
import { OrdinalFrame } from 'semiotic';

import styleVariables from '../../variables.module.scss';

export default class Histogram extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data;
  }

  render() {
    const semioticProps = {
      size: [520, 300],
      oAccessor: 'value',
      rAccessor: 'occurrences',
      type: 'bar',
      style: { fill: styleVariables.primaryColor, stroke: styleVariables.primaryColor },

      oSort: (a, b) => a - b,
      axes: [
        { orient: 'left', ticks: 5, label: 'Frequency', dynamicLabelPosition: true },
        {
          orient: 'bottom',
          ticks: 10,
          tickFormat: (d) => {
            const pos = Math.round((this.props.data.length - 1) * d);
            return this.props.data[pos].value.toFixed(2);
          },
          label: 'Value',
          dynamicLabelPosition: true,
        },
      ],

      hoverAnnotation: true,
      tooltipContent: (d) => d.column.name,
      margin: { bottom: 50, left: 90, top: 30, right: 30 }, // otherwise axis labels are clipped on edges
    };
    return (
      <div className="histogram">
        <OrdinalFrame {...semioticProps} data={this.props.data} />
      </div>
    );
  }
}
