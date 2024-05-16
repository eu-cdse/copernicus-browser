import React from 'react';
import { CheckboxGroup, Checkbox } from 'react-checkbox-group';
import Toggle from 'react-toggle';
import { t } from 'ttag';

import { EOBCCSlider } from '../../../../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import { isSearchGroup } from './isSearchGroup';
import './Sentinel12SearchGroup.scss';

class Sentinel2SearchGroup extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      ...this.getDefaultSearchFilterValues(),
    };
    this.publishStateFiltersValuesToParent();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.selectedOptions !== this.state.selectedOptions ||
      prevState.maxCC !== this.state.maxCC ||
      prevState.advancedOpened !== this.state.advancedOpened
    ) {
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

  getDefaultSearchFilterValues() {
    return {
      selectedOptions: Array.from(this.props.preselectedOptions),
      advancedOpened: this.props.preselectedOptions.length === 0,
      maxCC: 100,
    };
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

  toggleAdvancedOpened = () => {
    this.setState(
      (oldState) => ({
        advancedOpened: !oldState.advancedOpened,
      }),
      () => {
        const { advancedOpened } = this.state;
        if (!advancedOpened) {
          this.setState({
            ...this.getDefaultSearchFilterValues(),
          });
        }
      },
    );
  };

  render() {
    const { key, options, hasMaxCCFilter, renderOptionsFilters, renderOptionsHelpTooltips, optionsLabels } =
      this.props;
    const { advancedOpened, maxCC, selectedOptions } = this.state;
    return (
      <>
        <div>
          <CheckboxGroup
            className="checkboxGroup"
            name={key}
            value={selectedOptions}
            onChange={this.onOptionsChange}
          >
            <div className="sentinel2-dsg">
              <div>
                <label>{t`Advanced search`}:</label>
                <Toggle checked={advancedOpened} icons={false} onChange={this.toggleAdvancedOpened} />
              </div>

              {advancedOpened && (
                <div>
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
              )}
            </div>
          </CheckboxGroup>
        </div>
      </>
    );
  }
}

export default isSearchGroup(Sentinel2SearchGroup);
