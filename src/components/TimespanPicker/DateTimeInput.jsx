import React, { useEffect, useState } from 'react';

import DatePicker from '../DatePicker/DatePicker';
import { NumericInput } from './NumericInput';

let timeoutId = null;
export const DateTimeInput = (props) => {
  const [localDateTime, setLocalDateTime] = useState(null);

  const {
    id,
    selectedTime,
    minDate,
    maxDate,
    label,
    calendarContainer,
    onQueryDatesForActiveMonth,
    hasCloudCoverage,
    showNextPrevDateArrows,
    getAndSetNextPrevDate,
    additionalClassNameForDatePicker,
    maxCloudCover,
    displayCalendar,
    openCalendar,
    closeCalendar,
    dateLoading,
    setDateLoading,
    nextDateBtnDisabled,
    setNextDateBtnDisabled,
    isTimeless,
    isZoomLevelOk,
    isTimeRange,
    isDisabled,
    setSelectedTime,
  } = props;

  useEffect(() => {
    if (selectedTime) {
      setLocalDateTime(selectedTime.clone());
    }
  }, [selectedTime]);

  useEffect(() => {
    if (localDateTime && !localDateTime.isSame(selectedTime)) {
      if (!!timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        if (!isWithinAvailableTimeRange(localDateTime)) {
          setLocalDateTime(selectedTime.clone());
          return;
        }

        setSelectedTime(localDateTime.clone());
      }, 300);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localDateTime]);

  if (!localDateTime) {
    return null;
  }

  const setDay = (day) => {
    const newSelectedDateTime = localDateTime
      .clone()
      .set({ date: day.get('date'), month: day.get('month'), year: day.get('year') });
    setLocalDateTime(newSelectedDateTime.clone());
  };

  const setHours = (hours) => {
    const newSelectedDateTime = localDateTime.clone().hours(hours);
    setLocalDateTime(newSelectedDateTime.clone());
  };

  const setMinutes = (minutes) => {
    const newSelectedDateTime = localDateTime.clone().minutes(minutes);
    setLocalDateTime(newSelectedDateTime.clone());
  };

  const isWithinAvailableTimeRange = (newSelectedDateTime) => {
    return newSelectedDateTime >= minDate && newSelectedDateTime <= maxDate;
  };

  const hours = localDateTime.clone().utc().format('HH');
  const minutes = localDateTime.clone().utc().format('mm');

  return (
    <div className={`date-time-input ${isTimeRange ? 'expanded' : ''}`}>
      <div className="date-time-input-label">{label}</div>
      <div className="date-input">
        <DatePicker
          id={id}
          calendarContainer={calendarContainer}
          selectedDay={localDateTime}
          setSelectedDay={setDay}
          minDate={minDate}
          maxDate={maxDate}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          hasCloudCoverFilter={hasCloudCoverage}
          showNextPrevDateArrows={showNextPrevDateArrows}
          getAndSetNextPrevDate={getAndSetNextPrevDate}
          additionalClassNameForDatePicker={additionalClassNameForDatePicker}
          maxCloudCover={maxCloudCover}
          displayCalendar={displayCalendar}
          openCalendar={openCalendar}
          closeCalendar={closeCalendar}
          dateLoading={dateLoading}
          setDateLoading={setDateLoading}
          nextDateBtnDisabled={nextDateBtnDisabled}
          setNextDateBtnDisabled={setNextDateBtnDisabled}
          isTimeless={isTimeless}
          isZoomLevelOk={isZoomLevelOk}
          isTimeRange={isTimeRange}
          isDisabled={isDisabled}
        />
      </div>
      <div className={`time-input ${isTimeless || isDisabled ? 'disabled' : ''}`}>
        <div className="time-input-hours-minutes">
          <NumericInput label="hh" min="0" max="23" value={hours} setValue={setHours} />
        </div>
        <div className="time-input-hours-minutes no-full-width">:</div>
        <div className="time-input-hours-minutes no-right-margin">
          <NumericInput label="mm" min="0" max="59" value={minutes} setValue={setMinutes} />
        </div>
      </div>
    </div>
  );
};
