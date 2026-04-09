import React, { Component, createRef } from 'react';
import { t } from 'ttag';
import moment from 'moment';

import { DateTimeInput } from './DateTimeInput';
import { EOBCCSlider } from '../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import './TimespanPicker.scss';

export const MAX_TIME_RANGE_DAYS = 180;

export class TimespanPicker extends Component {
  state = {
    fromTime: null,
    toTime: null,
    cloudCoverage: this.props.maxCloudCover,
  };

  cloudCoverageSliderRef = createRef();

  componentDidMount() {
    this.handleTimespan();
  }

  componentDidUpdate(prevProps) {
    if (prevProps.timespan !== this.props.timespan) {
      this.handleTimespan();
    }
  }

  handleTimespan = () => {
    const { fromTime, toTime } = this.props.timespan;
    const { isDisabled } = this.props;

    if ((!fromTime && !toTime) || isDisabled) {
      return;
    }
    this.setState({
      fromTime: fromTime ? moment(fromTime).clone() : null,
      toTime: toTime ? moment(toTime).clone() : null,
    });
  };

  apply = () => {
    const { fromTime, toTime } = this.state;
    this.props.applyTimespan(fromTime, toTime);
  };

  setFromTime = (time) => {
    const { isTimeRange } = this.props;
    const newFromTime = time.clone();
    const maxToTime = newFromTime.clone().add(MAX_TIME_RANGE_DAYS, 'days').endOf('day');
    const clampedToTime =
      isTimeRange && this.state.toTime && this.state.toTime.isValid() && this.state.toTime.isAfter(maxToTime)
        ? maxToTime
        : this.state.toTime;
    this.setState({ fromTime: newFromTime, toTime: clampedToTime }, this.apply);
  };

  setToTime = (time) => {
    const { isTimeRange } = this.props;
    const newToTime = time.clone();
    const minFromTime = newToTime.clone().subtract(MAX_TIME_RANGE_DAYS, 'days').startOf('day');
    const clampedFromTime =
      isTimeRange &&
      this.state.fromTime &&
      this.state.fromTime.isValid() &&
      this.state.fromTime.isBefore(minFromTime)
        ? minFromTime
        : this.state.fromTime;
    this.setState({ fromTime: clampedFromTime, toTime: newToTime }, this.apply);
  };

  render() {
    const { fromTime, toTime, cloudCoverage } = this.state;
    const {
      id,
      onQueryDatesForActiveMonth,
      showNextPrevDateArrows,
      setMaxCloudCover,
      calendarHolder,
      displayCalendarFrom,
      openCalendarFrom,
      closeCalendarFrom,
      displayCalendarUntil,
      openCalendarUntil,
      closeCalendarUntil,
      dateLoading,
      datePickerInputStyle,
      setDateLoading,
      nextDateBtnDisabled,
      setNextDateBtnDisabled,
      getAndSetNextPrevDateFrom,
      getAndSetNextPrevDateTo,
      isTimeless,
      hasCloudCoverage,
      isZoomLevelOk,
      isTimeRange,
      additionalTimeselectOptions,
      isDisabled,
    } = this.props;
    const additionalClassNameForDatePicker = 'timespan-date-picker';

    return (
      <div className="timespan-picker">
        <DateTimeInput
          id={`${id}-from`}
          label={t`From:`}
          calendarContainer={calendarHolder || this.calendarHolder}
          selectedTime={fromTime}
          setSelectedTime={this.setFromTime}
          minDate={this.props.minDate}
          maxDate={toTime && toTime.isValid() ? toTime : this.props.maxDate}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          hasCloudCoverage={hasCloudCoverage}
          showNextPrevDateArrows={showNextPrevDateArrows}
          getAndSetNextPrevDate={getAndSetNextPrevDateFrom}
          additionalClassNameForDatePicker={additionalClassNameForDatePicker}
          maxCloudCover={cloudCoverage}
          displayCalendar={displayCalendarFrom}
          openCalendar={openCalendarFrom}
          closeCalendar={closeCalendarFrom}
          dateLoading={dateLoading}
          setDateLoading={setDateLoading}
          nextDateBtnDisabled={nextDateBtnDisabled}
          setNextDateBtnDisabled={setNextDateBtnDisabled}
          isTimeless={isTimeless}
          isZoomLevelOk={isZoomLevelOk}
          isTimeRange={isTimeRange}
          isDisabled={isDisabled}
          datePickerInputStyle={datePickerInputStyle}
          cloudCoverageSliderRef={this.cloudCoverageSliderRef}
        />
        <DateTimeInput
          id={`${id}-until`}
          label={t`Until:`}
          calendarContainer={calendarHolder || this.calendarHolder}
          selectedTime={toTime}
          setSelectedTime={this.setToTime}
          minDate={fromTime && fromTime.isValid() ? fromTime : this.props.minDate}
          maxDate={this.props.maxDate}
          onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
          hasCloudCoverage={hasCloudCoverage}
          showNextPrevDateArrows={showNextPrevDateArrows}
          getAndSetNextPrevDate={getAndSetNextPrevDateTo}
          additionalClassNameForDatePicker={additionalClassNameForDatePicker}
          maxCloudCover={cloudCoverage}
          displayCalendar={displayCalendarUntil}
          openCalendar={openCalendarUntil}
          closeCalendar={closeCalendarUntil}
          dateLoading={dateLoading}
          setDateLoading={setDateLoading}
          nextDateBtnDisabled={nextDateBtnDisabled}
          setNextDateBtnDisabled={setNextDateBtnDisabled}
          isTimeless={isTimeless}
          isZoomLevelOk={isZoomLevelOk}
          isTimeRange={isTimeRange}
          isDisabled={isDisabled}
          datePickerInputStyle={datePickerInputStyle}
          cloudCoverageSliderRef={this.cloudCoverageSliderRef}
        />
        {hasCloudCoverage && (
          <div className={`timespan-picker-cc-slider`} ref={this.cloudCoverageSliderRef}>
            <div className="timespan-picker-cc-slider-text">{t`Max. cloud coverage:`}</div>
            <EOBCCSlider
              sliderWidth={'100%'}
              onChange={(value) => this.setState({ cloudCoverage: value })}
              onAfterChange={(value) => setMaxCloudCover(value)}
              cloudCoverPercentage={cloudCoverage}
            />
          </div>
        )}
        {additionalTimeselectOptions ? additionalTimeselectOptions : null}

        <div className="timespan-calendar-holder" ref={(e) => (this.calendarHolder = e)} />
      </div>
    );
  }
}
