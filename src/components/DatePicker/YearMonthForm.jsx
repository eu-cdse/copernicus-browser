import React from 'react';

import { getAvailableYears, getAvailableMonths } from './Datepicker.utils';
import { getMonths } from './MomentLocaleUtils';

const YearMonthForm = ({ minFromDate, maxToDate, onChange, locale, selectedDay }) => {
  const allMonths = getMonths(locale);
  const years = getAvailableYears(minFromDate, maxToDate);
  const months = getAvailableMonths(allMonths, minFromDate, maxToDate, selectedDay);

  const handleChange = function handleChange(e) {
    const { year, month } = e.target.form;
    onChange(month.value, year.value);
  };

  return (
    <form className="year-month-form">
      <select name="month" onChange={handleChange} value={selectedDay ? selectedDay.get('month') : ''}>
        {months.map((month) => (
          <option key={month.name} value={month.index}>
            {month.name}
          </option>
        ))}
      </select>
      <select name="year" onChange={handleChange} value={selectedDay ? selectedDay.get('year') : ''}>
        {years.map((year) => (
          <option key={year} value={year}>
            {year}
          </option>
        ))}
      </select>
    </form>
  );
};

export default YearMonthForm;
