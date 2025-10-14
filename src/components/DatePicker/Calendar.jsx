import React, { useRef } from 'react';
import ReactDOM from 'react-dom';
import DayPicker from 'react-day-picker';
import { t } from 'ttag';
import moment from 'moment';

import { getFirstDayOfWeek, getWeekDaysLong, getWeekDaysMin, getMonths } from './MomentLocaleUtils';
import { checkAndSetWithinAvailableRange, momentToDateWithUTCValues } from './Datepicker.utils';
import Navbar from './Navbar';
import YearMonthForm from './YearMonthForm';

import 'react-day-picker/lib/style.css';
import './Calendar.scss';
import { EOBCCSlider } from '../../junk/EOBCommon/EOBCCSlider/EOBCCSlider';
import { useOnClickOutside } from '../../hooks/useOnClickOutside';

function Calendar(props) {
  const wrapperRef = useRef();
  useOnClickOutside(wrapperRef, props.onClickOutside || (() => {}));
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
  } = props;

  const modifiers = {
    highlighted: highlightedDays.map((d) => momentToDateWithUTCValues(d)),
    highlightedCloudy: highlightedCloudyDays.map((d) => momentToDateWithUTCValues(d)),
  };

  const onMonthChange = (newMonth) => {
    handleMonthChange(newMonth);
    setDisplayedDayMonth(newMonth);
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
      <DayPicker
        showOutsideDays
        selectedDays={selectedDay ? momentToDateWithUTCValues(selectedDay) : null}
        modifiers={modifiers}
        month={displayedDayMonth ?? (selectedDay ? momentToDateWithUTCValues(selectedDay) : null)}
        onMonthChange={onMonthChange}
        onDayClick={handleDayClick}
        disabledDays={[
          {
            after: maxDate ? momentToDateWithUTCValues(maxDate) : undefined,
            before: minDate ? momentToDateWithUTCValues(minDate) : undefined,
          },
        ]}
        navbarElement={
          <Navbar
            minDate={minDate}
            maxDate={maxDate}
            selectedDate={displayedDayMonth ? moment(displayedDayMonth) : selectedDay}
          />
        }
        captionElement={({ locale }) => (
          <YearMonthForm
            minFromDate={minDate ?? moment.utc()}
            maxToDate={maxDate ?? moment.utc()}
            onChange={onMonthOrYearDropdownChange}
            locale={locale}
            selectedDay={displayedDayMonth ? moment(displayedDayMonth) : selectedDay}
          />
        )}
        locale={locale}
        weekdaysLong={getWeekDaysLong(locale)}
        weekdaysShort={getWeekDaysMin(locale)}
        months={getMonths(locale)}
        firstDayOfWeek={getFirstDayOfWeek(locale)}
      />
    </div>,
    calendarContainer && calendarContainer.current ? calendarContainer.current : calendarContainer,
  );
}

export default Calendar;
