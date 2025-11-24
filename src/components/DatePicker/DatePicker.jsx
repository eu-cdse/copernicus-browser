import React, { Component } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';

import DatePickerInput from './DatePickerInput';
import Calendar from './Calendar';

import {
  checkAndSetWithinAvailableRange,
  getNextBestDate,
  momentToDateWithUTCValues,
  fetchAvailableDaysInRange,
} from './Datepicker.utils';

import './DatePicker.scss';
import { handleError } from '../../utils';

const STANDARD_STRING_DATE_FORMAT = 'YYYY-MM-DD';

class DatePicker extends Component {
  state = {
    availableDays: null,
    loading: false,
    displayedDayMonth: null,
  };

  async componentDidMount() {
    await this.fetchDates();
    if (this.props.selectedDay !== null) {
      this.setDisplayedDayMonth(momentToDateWithUTCValues(this.props.selectedDay));
    }
  }

  async componentDidUpdate(prevProps) {
    //refetch available dates when zoom is changed
    if (
      (!!this.props.zoom && this.props.zoom !== prevProps.zoom) ||
      (prevProps.displayCalendar === false && this.props.displayCalendar === true)
    ) {
      await this.fetchDates();
    }

    if (this.props.selectedDay !== null && !this.props.selectedDay.isSame(prevProps.selectedDay, 'day')) {
      this.setDisplayedDayMonth(momentToDateWithUTCValues(this.props.selectedDay));
    }
  }

  setDisplayedDayMonth = (newDayMonth) => {
    this.setState({ displayedDayMonth: newDayMonth }, async () => await this.fetchDates());
  };

  async fetchDates() {
    const { displayedDayMonth } = this.state;
    const { selectedDay, maxDate, setSelectedDay, displayCalendar } = this.props;
    if (!!displayCalendar) {
      const targetMonth = displayedDayMonth ? moment(displayedDayMonth).utc(true) : selectedDay;
      const days = await this.fetchAvailableDaysForMonth(targetMonth);
      if (!selectedDay) {
        if (days.length > 0) {
          setSelectedDay(moment.utc(days[0].date));
        } else {
          let latestDate;
          if (this.props.getLatestAvailableDate) {
            latestDate = await this.props.getLatestAvailableDate();
          }
          setSelectedDay(latestDate ? moment.utc(latestDate) : maxDate.clone().utc());
        }
      }
      this.setState({ availableDays: days });
    }
  }

  openCalendar = async () => {
    await this.props.openCalendar();
    await this.fetchDates();
  };

  closeCalendar = () => {
    this.props.closeCalendar();
  };

  handleClickOutside = () => {
    if (!this.state.loading) {
      this.closeCalendar();
    }
  };

  handleDayClick = (day) => {
    this.props.setSelectedDay(moment.utc(day).startOf(day));
    this.closeCalendar();

    if (this.props.setNextDateBtnDisabled) {
      this.props.setNextDateBtnDisabled(false);
    }
  };

  handleMonthChange = (date) => {
    const { selectedDay } = this.props;
    const newSelectedDay = this.checkAndSetWithinAvailableRange(
      selectedDay.clone().month(date.getMonth()).year(date.getFullYear()),
    );

    const fromDate = newSelectedDay.clone().startOf('month');
    this.fetchAvailableDaysForMonth(fromDate).then((dates) => this.setState({ availableDays: dates }));
  };

  onMonthOrYearDropdownChange = (month, year) => {
    const { selectedDay, minDate, maxDate } = this.props;
    const newSelectedDay = checkAndSetWithinAvailableRange(
      selectedDay.clone().month(month).year(year),
      minDate,
      maxDate,
    );

    const fromDate = newSelectedDay.clone().startOf('month');
    this.fetchAvailableDaysForMonth(fromDate).then((dates) => this.setState({ availableDays: dates }));
  };

  fetchAvailableDaysForMonth = async (date) => {
    const { setDateLoading, hasCloudCoverFilter, isZoomLevelOk } = this.props;

    if (!this.props.onQueryDatesForActiveMonth) {
      return [];
    }

    let dateArray = [];
    try {
      if (setDateLoading) {
        setDateLoading(true);
      }
      this.setState({ loading: true });

      dateArray = await this.props.onQueryDatesForActiveMonth(date);

      if (hasCloudCoverFilter && isZoomLevelOk) {
        dateArray = dateArray.map((date) => ({
          date: moment.utc(date.fromTime),
          cloudCoverPercent: date.meta.minimalCloudCoverPercent ?? date.meta.averageCloudCoverPercent,
        }));
      } else {
        dateArray = dateArray.map((date) => ({
          date: moment.utc(date.fromTime || date.sensingTime || date),
          cloudCoverPercent: null,
        }));
      }
    } catch (err) {
      handleError(err, 'Unable to fetch available days for month', (msg) => console.error(msg));
    } finally {
      if (setDateLoading) {
        setDateLoading(false);
      }
      this.setState({ loading: false });
    }
    return dateArray;
  };

  fetchAvailableDaysInRange = async (fromDate, toDate) => {
    const { setDateLoading, hasCloudCoverFilter, isZoomLevelOk } = this.props;

    // Use the range fetcher for next/prev buttons (expanding time window)
    if (this.props.onQueryDatesForRange) {
      let dateArray = [];
      try {
        if (setDateLoading) {
          setDateLoading(true);
        }
        this.setState({ loading: true });

        dateArray = await this.props.onQueryDatesForRange(fromDate, toDate);

        if (hasCloudCoverFilter && isZoomLevelOk) {
          dateArray = dateArray.map((date) => ({
            date: moment.utc(date.fromTime),
            cloudCoverPercent: date.meta.minimalCloudCoverPercent ?? date.meta.averageCloudCoverPercent,
          }));
        } else {
          dateArray = dateArray.map((date) => ({
            date: moment.utc(date.fromTime || date.sensingTime || date),
            cloudCoverPercent: null,
          }));
        }
      } catch (err) {
        handleError(err, 'Unable to fetch available days in range', (msg) => console.error(msg));
      } finally {
        if (setDateLoading) {
          setDateLoading(false);
        }
        this.setState({ loading: false });
      }
      return dateArray;
    }

    // Fallback: use the utility function that calls month-by-month using onQueryDatesForActiveMonth
    return await fetchAvailableDaysInRange({
      fromDate,
      toDate,
      fetchDatesForMonth: async (date) => {
        if (!this.props.onQueryDatesForActiveMonth) {
          return [];
        }

        const dateArray = await this.props.onQueryDatesForActiveMonth(date);

        if (hasCloudCoverFilter && isZoomLevelOk) {
          return dateArray.map((date) => ({
            date: moment.utc(date.fromTime),
            cloudCoverPercent: date.meta.minimalCloudCoverPercent ?? date.meta.averageCloudCoverPercent,
          }));
        } else {
          return dateArray.map((date) => ({
            date: moment.utc(date.fromTime || date.sensingTime || date),
            cloudCoverPercent: null,
          }));
        }
      },
    });
  };

  checkAndSetWithinAvailableRange = (newSelectedDay) => {
    const { minDate, maxDate } = this.props;
    if (newSelectedDay < minDate) {
      newSelectedDay = minDate.clone();
    }
    if (newSelectedDay > maxDate) {
      newSelectedDay = maxDate.clone();
    }
    return newSelectedDay;
  };

  handleGetAndSetNextPrevDate = async (direction) => {
    let { loading } = this.state;
    let { selectedDay, setSelectedDay, minDate, maxDate, maxCloudCover, dateLoading } = this.props;

    if (loading || dateLoading) {
      return;
    }

    if (!selectedDay) {
      selectedDay = maxDate.clone().utc();
      if (this.props.getLatestAvailableDate) {
        const latestDate = await this.props.getLatestAvailableDate();
        if (latestDate) {
          if (direction === 'prev') {
            // No selectedDay is set and best date in the direction towards earlier dates was requested.
            // We set selectedDay to one day after latest available date, so that latest available date is considered.
            selectedDay = latestDate.clone().add(1, 'day');
          }
          if (direction === 'next') {
            // Same as other direction.
            selectedDay = latestDate.clone().subtract(1, 'day');
          }
        }
      }
    }

    let newSelectedDay;

    newSelectedDay = await getNextBestDate({
      selectedDay: selectedDay,
      direction: direction,
      maxCC: maxCloudCover,
      fetchDatesInRange: this.fetchAvailableDaysInRange,
      minDate: minDate,
      maxDate: maxDate,
      maxSearchIterations: 5,
    });

    if (newSelectedDay.isSame(selectedDay)) {
      throw new Error('No new available date');
    }

    newSelectedDay = newSelectedDay.clone().utc(true);
    setSelectedDay(newSelectedDay);
    this.setDisplayedDayMonth(momentToDateWithUTCValues(newSelectedDay));
    if (newSelectedDay.get('month') !== selectedDay.get('month')) {
      await this.fetchDates();
    }
  };

  partitionAvailableDaysByCC = (availableDays, maxCloudCover) => {
    availableDays = availableDays || [];

    return availableDays.reduce(
      (result, el) => {
        maxCloudCover !== null && maxCloudCover !== undefined && el.cloudCoverPercent > maxCloudCover
          ? result.cloudy.push(el.date)
          : result.sunny.push(el.date);
        return result;
      },
      { sunny: [], cloudy: [] },
    );
  };

  render() {
    const {
      isTimeless,
      selectedDay,
      setSelectedDay,
      minDate,
      maxDate,
      locale,
      calendarContainer,
      id,
      showNextPrevDateArrows,
      getAndSetNextPrevDate,
      hasCloudCoverFilter,
      setMaxCloudCover,
      setMaxCloudCoverAfterChange,
      maxCloudCover,
      additionalClassNameForDatePicker,
      displayCalendar,
      dateLoading,
      nextDateBtnDisabled,
      setNextDateBtnDisabled,
      isZoomLevelOk,
      isTimeRange,
      isDisabled,
      datePickerInputStyle,
      cloudCoverageSliderRef,
    } = this.props;

    const { availableDays, loading, displayedDayMonth } = this.state;
    const { sunny: highlightedDays, cloudy: highlightedCloudyDays } = this.partitionAvailableDaysByCC(
      availableDays,
      maxCloudCover,
    );
    return (
      <>
        <div className={`date-picker ${displayCalendar ? id : ''}`}>
          <DatePickerInput
            isTimeless={isTimeless}
            selectedDay={selectedDay}
            setSelectedDay={setSelectedDay}
            dateFormat={STANDARD_STRING_DATE_FORMAT}
            onClick={displayCalendar ? this.closeCalendar : this.openCalendar}
            onValueConfirmed={this.closeCalendar}
            showNextPrevDateArrows={showNextPrevDateArrows}
            getAndSetNextPrevDate={getAndSetNextPrevDate ?? this.handleGetAndSetNextPrevDate}
            minDate={minDate}
            maxDate={maxDate}
            additionalClassNameForDatePicker={additionalClassNameForDatePicker}
            nextDateBtnDisabled={nextDateBtnDisabled}
            setNextDateBtnDisabled={setNextDateBtnDisabled}
            isDisabled={isDisabled}
            datePickerInputStyle={datePickerInputStyle}
          />
        </div>
        {loading && !dateLoading && (
          <div className="date-picker-loader">
            <i className="fa fa-spinner fa-spin fa-fw" />
          </div>
        )}
        {displayCalendar && (
          <Calendar
            hasCloudCoverFilter={hasCloudCoverFilter}
            cloudCoverPercentage={maxCloudCover}
            setMaxCloudCover={setMaxCloudCover}
            setMaxCloudCoverAfterChange={setMaxCloudCoverAfterChange}
            selectedDay={selectedDay}
            minDate={minDate}
            handleMonthChange={this.handleMonthChange}
            maxDate={maxDate}
            locale={locale}
            calendarContainer={calendarContainer}
            handleDayClick={this.handleDayClick}
            handleMonthOrYearDropdownChange={this.onMonthOrYearDropdownChange}
            handleClickOutside={this.handleClickOutside}
            outsideClickIgnoreClass={id}
            highlightedDays={highlightedDays}
            highlightedCloudyDays={highlightedCloudyDays}
            eventTypes="click"
            displayedDayMonth={displayedDayMonth}
            setDisplayedDayMonth={this.setDisplayedDayMonth}
            isZoomLevelOk={isZoomLevelOk}
            isTimeRange={isTimeRange}
            cloudCoverageSliderRef={cloudCoverageSliderRef}
          />
        )}
      </>
    );
  }
}

const mapStoreToProps = (store) => ({
  locale: store.language.selectedLanguage,
  zoom: store.mainMap.zoom,
});

export default connect(mapStoreToProps, null)(DatePicker);
