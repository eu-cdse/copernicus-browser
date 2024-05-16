import React from 'react';
// import Toggle from 'react-toggle';
// import NonEmptyCheckboxes from './NonEmptyCheckboxes';

import './Sentinel3SLSTRFilters.scss';
import { EOBCCSlider } from '../../../../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import { t } from 'ttag';

class Sentinel3SLSTRFilters extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      advancedOpened: false,
      ...this.getDefaultSearchFilterValues(),
    };
    this.publishStateFiltersValuesToParent();
  }

  componentDidUpdate(prevProps, prevState) {
    if (
      prevState.maxCC !== this.state.maxCC ||
      prevState.advancedOpened !== this.state.advancedOpened ||
      prevState.views !== this.state.views ||
      prevState.orbitDirections !== this.state.orbitDirections
    ) {
      this.publishStateFiltersValuesToParent();
    }
  }

  getDefaultSearchFilterValues() {
    return {
      maxCC: 100,
      views: Object.keys(this.props.views).slice(0, 1), // only first view is selected by default
      orbitDirections: Object.keys(this.props.orbitDirections).slice(1, 2), // only "descending" is selected by default
    };
  }

  publishStateFiltersValuesToParent() {
    const { advancedOpened, views, orbitDirections, maxCC } = this.state;
    const defaultValues = this.getDefaultSearchFilterValues();
    this.props.saveFiltersValues({
      maxCC: maxCC,
      views: advancedOpened ? views : defaultValues.views,
      orbitDirections: advancedOpened ? orbitDirections : defaultValues.orbitDirections,
    });
  }

  toggleAdvancedOpened = () => {
    this.setState((oldState) => ({
      advancedOpened: !oldState.advancedOpened,
    }));
  };

  onMaxCCChange = (maxCC) => {
    this.setState({
      maxCC: maxCC,
    });
  };

  render() {
    const { maxCC } = this.state;
    return (
      <div className="sentinel3-slstr-filters">
        <div className="filter cloudCoverage">
          <label>{t`Max. cloud coverage`}:</label>
          <EOBCCSlider sliderWidth={100} cloudCoverPercentage={maxCC} onChange={this.onMaxCCChange} />
        </div>

        {/* <div>
          <label>{`tAdvanced search`}:</label>
          <Toggle checked={advancedOpened} icons={false} onChange={this.toggleAdvancedOpened} />
        </div>

        {advancedOpened && (
          <div className="advanced">
            <div className="twoItemsPerLine">
              <label>View:</label>
              <NonEmptyCheckboxes
                choices={this.props.views}
                initiallyChecked={this.state.views}
                onChange={checked => this.setState({ views: checked })}
                warningEmpty={t`Please select at least one view!`}"
              />
            </div>

            <div className="twoItemsPerLine">
              <label>Orbit direction:</label>
              <NonEmptyCheckboxes
                choices={this.props.orbitDirections}
                initiallyChecked={this.state.orbitDirections}
                onChange={checked => this.setState({ orbitDirections: checked })}
                warningEmpty="Please select at least one orbit direction!"
              />
            </div>
          </div>
        )} */}
      </div>
    );
  }
}

export default Sentinel3SLSTRFilters;
