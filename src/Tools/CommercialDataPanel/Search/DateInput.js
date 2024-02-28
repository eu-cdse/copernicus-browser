import React, { useState } from 'react';
import DatePicker from '../../../components/DatePicker/DatePicker';

const DateInput = ({ name, value, label, onChangeHandler, min, max, calendarContainerRef }) => {
  const [displayCalendar, setDisplayCalendar] = useState(false);

  const openCalendar = () => setDisplayCalendar(true);
  const closeCalendar = () => setDisplayCalendar(false);

  return (
    <>
      <div className="row">
        <label title={label}>{label}</label>
        <DatePicker
          selectedDay={value}
          calendarContainer={calendarContainerRef}
          setSelectedDay={(selectedDate) => onChangeHandler(name, selectedDate)}
          minDate={min}
          maxDate={max}
          displayCalendar={displayCalendar}
          openCalendar={openCalendar}
          closeCalendar={closeCalendar}
        />
      </div>
      <div id={`${name}-calendar-holder`} className={`${name}-calendar-holder`} ref={calendarContainerRef} />
    </>
  );
};

export default DateInput;
