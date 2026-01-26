import React, { useState, useEffect } from 'react';
import moment from 'moment';

function DatePickerInput(props) {
  const {
    isTimeless,
    onClick,
    dateFormat,
    selectedDay,
    setSelectedDay,
    onValueConfirmed,
    showNextPrevDateArrows,
    getAndSetNextPrevDate,
    minDate,
    maxDate,
    additionalClassNameForDatePicker,
    nextDateBtnDisabled,
    setNextDateBtnDisabled,
    isDisabled,
    datePickerInputStyle,
  } = props;
  const [dateValue, setDateValue] = useState(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [prevDateDisabled, setPrevDateDisabled] = useState(false);
  const [nextDateDisabled, setNextDateDisabled] = useState(false);

  useEffect(() => {
    if (selectedDay && !isDisabled) {
      setDateValue(selectedDay.utc().format(dateFormat));
      setPrevDateDisabled(false);
      setNextDateDisabled(false);
    } else {
      // If no date is set we only allow to look for prev date from current day
      setDateValue(null);
      setNextDateDisabled(true);
    }

    setInputDisabled(isTimeless);
    setPrevDateDisabled(isTimeless);
    setNextDateDisabled(isTimeless);
  }, [selectedDay, dateFormat, isTimeless, isDisabled]);

  useEffect(() => {
    setNextDateDisabled(nextDateBtnDisabled);
  }, [nextDateBtnDisabled]);

  function isValueValidDate(value) {
    if (!value) {
      return false;
    }
    const parsedDate = moment.utc(value, dateFormat, true);
    return parsedDate.isValid() && parsedDate >= minDate && maxDate >= parsedDate;
  }

  function handleChange(e) {
    setDateValue(e.target.value);
    if (isValueValidDate(e.target.value)) {
      setSelectedDay(moment.utc(e.target.value));
    }
  }

  function handleBlur() {
    if (!isValueValidDate(dateValue)) {
      setDateValue(selectedDay.utc().format(dateFormat));
    }
  }

  function handleKeyPress(e) {
    if (e.key === 'Enter') {
      if (isValueValidDate(e.target.value)) {
        onValueConfirmed();
      }
    }
  }

  async function getPrevDate() {
    if (prevDateDisabled) {
      return;
    }

    await getAndSetNextPrevDate('prev', selectedDay).catch(() => setPrevDateDisabled(true));

    if (setNextDateBtnDisabled) {
      setNextDateBtnDisabled(false);
    }
  }

  async function getNextDate() {
    if (nextDateDisabled) {
      return;
    }

    await getAndSetNextPrevDate('next', selectedDay).catch(() => setNextDateDisabled(true));
  }

  return (
    <div className="date-picker-input-wrapper">
      {showNextPrevDateArrows && (
        <i
          className={`fas fa-chevron-left ${prevDateDisabled || isDisabled ? 'disabled' : ''} ${
            additionalClassNameForDatePicker ? additionalClassNameForDatePicker : ''
          }`}
          title={''}
          onClick={getPrevDate}
        />
      )}
      <input
        className={`date-picker-input ${
          additionalClassNameForDatePicker ? additionalClassNameForDatePicker : ''
        } ${inputDisabled || isDisabled ? 'disabled' : ''}`}
        value={dateValue || ''}
        onClick={onClick}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        placeholder={dateFormat}
        style={datePickerInputStyle}
      />
      {showNextPrevDateArrows && (
        <i
          className={`fas fa-chevron-right ${nextDateDisabled || isDisabled ? 'disabled' : ''} ${
            additionalClassNameForDatePicker ? additionalClassNameForDatePicker : ''
          }`}
          title={''}
          onClick={getNextDate}
        />
      )}
    </div>
  );
}

export default DatePickerInput;
