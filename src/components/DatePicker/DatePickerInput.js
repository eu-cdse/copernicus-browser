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
  } = props;
  const [dateValue, setDateValue] = useState(null);
  const [inputDisabled, setInputDisabled] = useState(false);
  const [prevDateDisabled, setPrevDateDisabled] = useState(false);
  const [nextDateDisabled, setNextDateDisabled] = useState(false);

  useEffect(() => {
    if (props.selectedDay) {
      setDateValue(props.selectedDay.utc().format(props.dateFormat));
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
  }, [props.selectedDay, props.dateFormat, isTimeless]);

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

    await getAndSetNextPrevDate('prev', selectedDay).catch((err) => setPrevDateDisabled(true));

    if (setNextDateBtnDisabled) {
      setNextDateBtnDisabled(false);
    }
  }

  async function getNextDate() {
    if (nextDateDisabled) {
      return;
    }

    await getAndSetNextPrevDate('next', selectedDay).catch((err) => setNextDateDisabled(true));
  }

  return (
    <div className="date-picker-input-wrapper">
      {showNextPrevDateArrows && (
        <i
          className={`fas fa-chevron-left ${prevDateDisabled ? 'disabled' : ''} ${
            additionalClassNameForDatePicker ? additionalClassNameForDatePicker : ''
          }`}
          title={''}
          onClick={getPrevDate}
        />
      )}
      <input
        className={`date-picker-input ${
          additionalClassNameForDatePicker ? additionalClassNameForDatePicker : ''
        } ${inputDisabled ? 'disabled' : ''}`}
        value={dateValue || ''}
        onClick={onClick}
        onChange={handleChange}
        onBlur={handleBlur}
        onKeyPress={handleKeyPress}
        placeholder={dateFormat}
      />
      {showNextPrevDateArrows && (
        <i
          className={`fas fa-chevron-right ${nextDateDisabled ? 'disabled' : ''} ${
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
