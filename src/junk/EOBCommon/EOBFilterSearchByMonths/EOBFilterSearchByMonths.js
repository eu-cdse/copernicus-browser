import React from 'react';
import range from 'lodash/range';
import { t } from 'ttag';

import { getShortMonth } from '../EOBDatePicker/MomentLocaleUtils';
import CustomCheckbox from '../../../components/CustomCheckbox/CustomCheckbox';

import './EOBFilterSearchByMonths.scss';

export default class EOBFilterSearchByMonths extends React.Component {
  state = {
    doFiltering: this.props.selectedMonths !== null && this.props.selectedMonths !== undefined,
    selectedMonths: new Set(this.props.selectedMonths),
  };

  handleFilterCheckboxChange = () => {
    this.setState(
      (prevState) => ({
        doFiltering: !prevState.doFiltering,
        selectedMonths:
          !prevState.doFiltering && prevState.selectedMonths.size === 0
            ? new Set(range(12))
            : prevState.selectedMonths,
      }),
      this.publishChange,
    );
  };

  toggleMonth = (monthIndex) => {
    this.setState((prevState) => {
      const newValue = new Set(prevState.selectedMonths);
      if (newValue.has(monthIndex)) {
        newValue.delete(monthIndex);
      } else {
        newValue.add(monthIndex);
      }
      return {
        selectedMonths: newValue,
      };
    }, this.publishChange);
  };

  publishChange = () => {
    const { doFiltering, selectedMonths } = this.state;
    const filterMonths = doFiltering ? Array.from(selectedMonths) : null;
    this.props.onChange(filterMonths);
  };

  render() {
    const { doFiltering, selectedMonths } = this.state;
    return (
      <div className="filter-search-by-months">
        <CustomCheckbox
          value="filter-by-months"
          checked={doFiltering}
          onChange={this.handleFilterCheckboxChange}
          label={t`Filter by months`}
        />
        <div className={doFiltering ? 'months' : ''}>
          {doFiltering &&
            range(12).map((monthIndex) => (
              <CustomCheckbox
                key={monthIndex}
                value={monthIndex}
                checked={selectedMonths.has(monthIndex)}
                onChange={() => this.toggleMonth(monthIndex)}
                label={getShortMonth(monthIndex, this.props.locale)}
              />
            ))}
        </div>
      </div>
    );
  }
}
