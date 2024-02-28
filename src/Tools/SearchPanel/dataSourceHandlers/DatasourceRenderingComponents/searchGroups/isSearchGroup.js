import React from 'react';
import HelpTooltip from '../HelpTooltip';

import './isSearchGroup.scss';

export const isSearchGroup = (WrappedComponent) => {
  return class extends React.Component {
    constructor(props) {
      super(props);
      this.state = {
        checked: !!this.props.preselected,
      };
      this.props.saveCheckedState(this.state.checked);
    }

    componentDidUpdate() {
      this.props.saveCheckedState(this.state.checked);
    }

    toggleChecked = () => {
      this.setState((oldState) => ({
        checked: !oldState.checked,
      }));
    };

    render() {
      const { label, preselected, dataSourceTooltip, ...passThroughProps } = this.props;
      const { checked } = this.state;

      return (
        <div className="data-source-group">
          <label>
            <input type="checkbox" onChange={this.toggleChecked} checked={checked} />
            &nbsp;{label}
          </label>

          {dataSourceTooltip && (
            <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
              {dataSourceTooltip}
            </HelpTooltip>
          )}

          <div className="datasources">
            {this.state.checked && <WrappedComponent {...passThroughProps} />}
          </div>
        </div>
      );
    }
  };
};
