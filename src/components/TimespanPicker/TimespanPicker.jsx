import React, { Component, createRef } from 'react';
import { t } from 'ttag';
import moment from 'moment';

import { DateTimeInput } from './DateTimeInput';
import { EOBCCSlider } from '../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import './TimespanPicker.scss';

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
      fromTime: moment(fromTime).clone(),
      toTime: moment(toTime).clone(),
    });
  };

  apply = () => {
    const { fromTime, toTime } = this.state;
    this.props.applyTimespan(fromTime, toTime);
  };

  setFromTime = (time) => {
    this.setState(
      {
        fromTime: time.clone(),
      },
      this.apply,
    );
  };

  setToTime = (time) => {
    this.setState(
      {
        toTime: time.clone(),
      },
      this.apply,
    );
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
          maxDate={toTime}
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
          minDate={fromTime}
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
