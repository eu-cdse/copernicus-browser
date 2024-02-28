import React from 'react';

import { isNextMonthAvailable, isPreviousMonthAvailable } from './Datepicker.utils';

const Navbar = ({ className, minDate, maxDate, onPreviousClick, onNextClick, selectedDate }) => {
  const isPreviousMonthDisabled = !isPreviousMonthAvailable(minDate, selectedDate);
  const isNextMonthDisabled = !isNextMonthAvailable(maxDate, selectedDate);

  return (
    <div className={className}>
      <div
        className={`date-nav-button left ${isPreviousMonthDisabled ? 'disabled' : ''}`}
        onClick={() => {
          if (!isPreviousMonthDisabled) {
            onPreviousClick();
          }
        }}
      >
        <i className="fa fa-chevron-left" />
      </div>
      <div
        className={`date-nav-button right ${isNextMonthDisabled ? 'disabled' : ''}`}
        onClick={() => {
          if (!isNextMonthDisabled) {
            onNextClick();
          }
        }}
      >
        <i className="fa fa-chevron-right" />
      </div>
    </div>
  );
};

export default Navbar;
