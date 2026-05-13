import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import { DayPicker } from 'react-day-picker';
import { t } from 'ttag';
import moment from 'moment';

import { getLocaleObject } from './localeMap';
import { checkAndSetWithinAvailableRange, momentToDateWithUTCValues } from './Datepicker.utils';
import Navbar from './Navbar';
import YearMonthForm from './YearMonthForm';

import 'react-day-picker/style.css';
import './Calendar.scss';
import { EOBCCSlider } from '../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

function Calendar(props) {
  const wrapperRef = useRef();
  const {
    selectedDay,
    minDate,
    maxDate,
    locale,
    calendarContainer,
    handleMonthChange,
    handleDayClick,
    handleMonthOrYearDropdownChange,
    highlightedDays,
    highlightedCloudyDays,
    hasCloudCoverFilter,
    setMaxCloudCover,
    setMaxCloudCoverAfterChange,
    cloudCoverPercentage,
    displayedDayMonth,
    setDisplayedDayMonth,
    isZoomLevelOk,
    isTimeRange,
    handleClickOutside,
    cloudCoverageSliderRef,
    datepickerRef,
  } = props;

  useOnClickOutside(wrapperRef, handleClickOutside || (() => {}), [cloudCoverageSliderRef, datepickerRef]);

  const modifiers = {
    highlighted: highlightedDays.map((d) => momentToDateWithUTCValues(d)),
    highlightedCloudy: highlightedCloudyDays.map((d) => momentToDateWithUTCValues(d)),
    selected: selectedDay ? [momentToDateWithUTCValues(selectedDay)] : [],
  };

  const currentMonth =
    displayedDayMonth ?? (selectedDay ? momentToDateWithUTCValues(selectedDay) : new Date());

  const onMonthChange = (newMonth) => {
    handleMonthChange(newMonth);
    setDisplayedDayMonth(newMonth);
  };

  const handlePreviousMonth = () => {
    const prev = new Date(currentMonth.getFullYear(), currentMonth.getMonth() - 1, 1);
    onMonthChange(prev);
  };

  const handleNextMonth = () => {
    const next = new Date(currentMonth.getFullYear(), currentMonth.getMonth() + 1, 1);
    onMonthChange(next);
  };

  const onMonthOrYearDropdownChange = (newMonth, newYear) => {
    let newDisplayedDate;
    if (displayedDayMonth) {
      newDisplayedDate = moment(displayedDayMonth).utc(true);
    } else if (selectedDay) {
      newDisplayedDate = moment(selectedDay).utc(true);
    } else {
      newDisplayedDate = moment().utc(true);
    }

    handleMonthOrYearDropdownChange(newMonth, newYear);
    newDisplayedDate = checkAndSetWithinAvailableRange(
      newDisplayedDate.month(newMonth).year(newYear),
      props.minDate,
      props.maxDate,
    );
    setDisplayedDayMonth(momentToDateWithUTCValues(newDisplayedDate));
  };

  return ReactDOM.createPortal(
    <div className="calendar-wrapper" ref={wrapperRef}>
      {hasCloudCoverFilter && !isTimeRange && (
        <div className={`cloud-cover-calendar-cc-section ${isZoomLevelOk ? '' : 'disabled'}`}>
          <div className="time-select-type cc-picker-label">{t`Max. cloud coverage:`}</div>
          <EOBCCSlider
            sliderWidth={'100%'}
            onChange={setMaxCloudCover}
            onAfterChange={setMaxCloudCoverAfterChange}
            cloudCoverPercentage={cloudCoverPercentage}
          />
        </div>
      )}
      <div className="calendar-header">
        <Navbar
          className="date-picker-nav"
          minDate={minDate}
          maxDate={maxDate}
          selectedDate={displayedDayMonth ? moment(displayedDayMonth) : selectedDay}
          onPreviousClick={handlePreviousMonth}
          onNextClick={handleNextMonth}
        />
        <YearMonthForm
          minFromDate={minDate ?? moment.utc()}
          maxToDate={maxDate ?? moment.utc()}
          onChange={onMonthOrYearDropdownChange}
          locale={locale}
          selectedDay={displayedDayMonth ? moment(displayedDayMonth) : selectedDay}
        />
      </div>
      <DayPicker
        hideNavigation
        classNames={{ month_caption: 'rdp-month_caption calendar-caption-hidden' }}
        showOutsideDays
        modifiers={modifiers}
        modifiersClassNames={{
          highlighted: 'rdp-highlighted',
          highlightedCloudy: 'rdp-highlightedCloudy',
          selected: 'rdp-selected',
        }}
        month={currentMonth}
        onMonthChange={onMonthChange}
        onDayClick={handleDayClick}
        disabled={[
          maxDate ? { after: momentToDateWithUTCValues(maxDate) } : undefined,
          minDate ? { before: momentToDateWithUTCValues(minDate) } : undefined,
        ].filter(Boolean)}
        locale={getLocaleObject(locale)}
      />
    </div>,
    calendarContainer && calendarContainer.current ? calendarContainer.current : calendarContainer,
  );
}

export default Calendar;
