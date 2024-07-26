import React, { Component } from 'react';

import DatePicker from '../DatePicker/DatePicker';
import { NumericInput } from './NumericInput';

export class DateTimeInput extends Component {
  setDay = (day) => {
    const { selectedTime } = this.props;
    const newSelectedTime = selectedTime
      .clone()
      .set({ date: day.get('date'), month: day.get('month'), year: day.get('year') });
    this.props.setSelectedTime(newSelectedTime);
  };

  setHours = (hours) => {
    const { selectedTime } = this.props;
    const newSelectedTime = selectedTime.clone().hours(hours);
    if (!this.isWithinAvailableRange(newSelectedTime)) {
      return;
    }
    this.props.setSelectedTime(newSelectedTime);
  };

  setMinutes = (minutes) => {
    const { selectedTime } = this.props;
    const newSelectedTime = selectedTime.clone().minutes(minutes);
    if (!this.isWithinAvailableRange(newSelectedTime)) {
      return;
    }
    this.props.setSelectedTime(newSelectedTime);
  };

  isWithinAvailableRange = (newSelectedDay) => {
    const { minDate, maxDate } = this.props;
    return newSelectedDay >= minDate && newSelectedDay <= maxDate;
  };

  render() {
    const {
      id,
      selectedTime,
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
      datePickerInputStyle,
    } = this.props;

    if (!selectedTime) {
      return null;
    }

    const hours = selectedTime.clone().utc().format('HH');
    const minutes = selectedTime.clone().utc().format('mm');

    return (
      <div className={`date-time-input ${isTimeRange ? 'expanded' : ''}`}>
        <div className="date-time-input-label">{label}</div>
        <div className="date-input">
          <DatePicker
            id={id}
            calendarContainer={calendarContainer}
            selectedDay={selectedTime}
            setSelectedDay={this.setDay}
            minDate={this.props.minDate}
            maxDate={this.props.maxDate}
            onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
            hasCloudCoverFilter={hasCloudCoverage}
            showNextPrevDateArrows={showNextPrevDateArrows}
            getAndSetNextPrevDate={getAndSetNextPrevDate}
            additionalClassNameForDatePicker={additionalClassNameForDatePicker}
            maxCloudCover={maxCloudCover}
            setMaxCloudCover={this.setMaxCloudCover}
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
            datePickerInputStyle={datePickerInputStyle}
          />
        </div>
        <div className={`time-input ${isTimeless || isDisabled ? 'disabled' : ''}`}>
          <div className="time-input-hours-minutes">
            <NumericInput label="hh" min="0" max="23" value={hours} setValue={this.setHours} />
          </div>
          <div className="time-input-hours-minutes no-full-width">:</div>
          <div className="time-input-hours-minutes no-right-margin">
            <NumericInput label="mm" min="0" max="59" value={minutes} setValue={this.setMinutes} />
          </div>
        </div>
      </div>
    );
  }
}
