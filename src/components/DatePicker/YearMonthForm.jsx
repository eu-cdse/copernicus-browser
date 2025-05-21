import React from 'react';
import Select from 'react-select';

import { getAvailableYears, getAvailableMonths } from './Datepicker.utils';
import { getMonths } from './MomentLocaleUtils';
import { CustomDropdownIndicator } from '../../components/CustomSelectInput/CustomDropdownIndicator';

import { customSelectStyle } from '../CustomSelectInput/CustomSelectStyle';
import { primaryColor } from '../../variables.module.scss';

const YearMonthForm = ({ minFromDate, maxToDate, onChange, locale, selectedDay }) => {
  const allMonths = getMonths(locale);
  const years = getAvailableYears(minFromDate, maxToDate).map((y) => ({ label: y, value: y }));
  const months = getAvailableMonths(allMonths, minFromDate, maxToDate, selectedDay);

  return (
    <div className="year-month-form">
      <div className="year-month-dropdown-wrapper">
        <Select
          value={months.find((month) => month.value === selectedDay?.get('month'))}
          options={months}
          menuPosition="fixed"
          onChange={(v) => onChange(v.value, selectedDay?.get('year'))}
          components={{ DropdownIndicator: CustomDropdownIndicator }}
          isSearchable={false}
          menuShouldBlockScroll={true}
          menuShouldScrollIntoView={true}
          menuPlacement="auto"
          className="year-month-dropdown"
          classNamePrefix="month"
          styles={{
            ...customSelectStyle,
            menu: (css) => ({ ...customSelectStyle.menu(css), minWidth: 'unset', width: 'inherit' }),
            input: (css) => ({ ...customSelectStyle.input(css), color: primaryColor }),
            singleValue: (css, state) => ({
              ...customSelectStyle.singleValue(css, state),
              color: primaryColor,
            }),
          }}
        />
        <Select
          value={years.find((year) => year.value === selectedDay?.get('year'))}
          options={years}
          menuPosition="fixed"
          onChange={(v) => onChange(selectedDay?.get('month'), v.value)}
          components={{ DropdownIndicator: CustomDropdownIndicator }}
          isSearchable={false}
          menuShouldBlockScroll={true}
          menuShouldScrollIntoView={true}
          menuPlacement="auto"
          className="year-month-dropdown"
          classNamePrefix="year"
          styles={{
            ...customSelectStyle,
            menu: (css) => ({ ...customSelectStyle.menu(css), minWidth: 'unset', width: 'inherit' }),
            input: (css) => ({ ...customSelectStyle.input(css), color: primaryColor }),
            singleValue: (css, state) => ({
              ...customSelectStyle.singleValue(css, state),
              color: primaryColor,
            }),
          }}
        />
      </div>
    </div>
  );
};

export default YearMonthForm;
