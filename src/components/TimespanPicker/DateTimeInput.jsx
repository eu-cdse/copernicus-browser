import React from 'react';

import DatePicker from '../DatePicker/DatePicker';
import { NumericInput } from './NumericInput';

export const DateTimeInput = (props) => {
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

  const setDay = (day) => {
    const newSelectedDateTime = selectedTime
      ?.clone()
      .set({ date: day.get('date'), month: day.get('month'), year: day.get('year') });

    if (isWithinAvailableTimeRange(newSelectedDateTime)) {
      setSelectedTime(newSelectedDateTime.clone());
    }
  };

  const setHours = (hours) => {
    const newSelectedDateTime = selectedTime.clone().hours(hours);
    if (isWithinAvailableTimeRange(newSelectedDateTime)) {
      setSelectedTime(newSelectedDateTime.clone());
      return newSelectedDateTime.clone();
    } else {
      return null;
    }
  };

  const setMinutes = (minutes) => {
    const newSelectedDateTime = selectedTime.clone().minutes(minutes);
    if (isWithinAvailableTimeRange(newSelectedDateTime)) {
      setSelectedTime(newSelectedDateTime.clone());
      return newSelectedDateTime.clone();
    } else {
      return null;
    }
  };

  const isWithinAvailableTimeRange = (newSelectedDateTime) => {
    return newSelectedDateTime >= minDate && newSelectedDateTime <= maxDate;
  };

  const hours = selectedTime?.clone().utc().format('HH');
  const minutes = selectedTime?.clone().utc().format('mm');

  return (
    <div className={`date-time-input ${isTimeRange ? 'expanded' : ''}`}>
      <div className="date-time-input-label">{label}</div>
      <div className="date-input">
        <DatePicker
          id={id}
          calendarContainer={calendarContainer}
          selectedDay={selectedTime}
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
