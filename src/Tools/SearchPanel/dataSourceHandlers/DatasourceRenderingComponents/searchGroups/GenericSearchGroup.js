import React from 'react';
import { CheckboxGroup, Checkbox } from 'react-checkbox-group';
import { t } from 'ttag';

import { EOBCCSlider } from '../../../../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import { isSearchGroup } from './isSearchGroup';

class GenericSearchGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      selectedOptions: Array.from(this.props.preselectedOptions),
      maxCC: 100,
    };
    this.publishStateFiltersValuesToParent();
  }

  componentDidUpdate(prevProps, prevState) {
    if (prevState.selectedOptions !== this.state.selectedOptions || prevState.maxCC !== this.state.maxCC) {
      this.publishStateFiltersValuesToParent();
    }
  }

  publishStateFiltersValuesToParent() {
    const { selectedOptions, maxCC = undefined } = this.state;
    this.props.saveFiltersValues({
      selectedOptions: selectedOptions,
      maxCC: maxCC,
    });
  }

  onOptionsChange = (options) => {
    this.setState({
      selectedOptions: options,
    });
  };

  onMaxCCChange = (maxCC) => {
    this.setState({
      maxCC: maxCC,
    });
  };

  renderCloudCoverageFilter(maxCC) {
    return (
      <div className="filter cloudCoverage">
        <label>{t`Max. cloud coverage`}:</label>
        <EOBCCSlider sliderWidth={120} cloudCoverPercentage={maxCC} onChange={this.onMaxCCChange} />
      </div>
    );
  }

  render() {
    const { key, options, hasMaxCCFilter, renderOptionsFilters, renderOptionsHelpTooltips, optionsLabels } =
      this.props;
    const { selectedOptions, maxCC } = this.state;
    return (
      <div>
        <CheckboxGroup
          className="checkboxGroup"
          name={`generic-${key}`}
          value={selectedOptions}
          onChange={this.onOptionsChange}
        >
          <div className="column">
            {options.map((option) => (
              <div key={option}>
                <div className="title">
                  <label>
                    <Checkbox value={option} />
                    &nbsp;{optionsLabels[option]}
                  </label>
                  {renderOptionsHelpTooltips && renderOptionsHelpTooltips(option)}
                </div>
                {renderOptionsFilters && selectedOptions.includes(option) && (
                  <div className="filters">{renderOptionsFilters(option)}</div>
                )}
              </div>
            ))}
            <div className="filters">{hasMaxCCFilter && this.renderCloudCoverageFilter(maxCC)}</div>
          </div>
        </CheckboxGroup>
      </div>
    );
  }
}

export default isSearchGroup(GenericSearchGroup);
