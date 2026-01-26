import React, { Component } from 'react';
import { t } from 'ttag';
import { OrdinalFrame } from 'semiotic';

import styleVariables from '../../variables.module.scss';
import { connect } from 'react-redux';

class Histogram extends Component {
  shouldComponentUpdate(nextProps) {
    return this.props.data !== nextProps.data || this.props.selectedLanguage !== nextProps.selectedLanguage;
  }

  render() {
    const histogramData = this.props.data || [];

    const semioticProps = {
      size: [520, 300],
      oAccessor: 'value',
      rAccessor: 'occurrences',
      type: 'bar',
      style: { fill: styleVariables.primaryColor, stroke: styleVariables.primaryColor },

      oSort: (a, b) => a - b,
      axes: [
        { orient: 'left', ticks: 5, label: t`Frequency`, dynamicLabelPosition: true },
        {
          orient: 'bottom',
          ticks: 5,
          tickFormat: (d) => {
            if (!histogramData || histogramData.length === 0) {
              return '';
            }
            const pos = Math.round((histogramData.length - 1) * d);
            return histogramData[pos].value.toFixed(3);
          },
          label: t`Value`,
          dynamicLabelPosition: true,
        },
      ],

      hoverAnnotation: true,
      tooltipContent: (d) => d.column.name,
      margin: { bottom: 60, left: 90, top: 30, right: 50 }, // otherwise axis labels are clipped on edges
    };
    return (
      <div className="histogram">
        <OrdinalFrame {...semioticProps} data={histogramData} />
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps)(Histogram);
