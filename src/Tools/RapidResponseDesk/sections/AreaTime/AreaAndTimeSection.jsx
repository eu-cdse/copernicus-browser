import React, { useEffect, useRef, useState } from 'react';
import './AreaAndTimeSection.scss';
import { connect } from 'react-redux';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { t } from 'ttag';
import store, { areaAndTimeSectionSlice, collapsiblePanelSlice } from '../../../../store';
import { AOISelection } from '../../../../components/AOISelection/AOISelection';
import Slider from 'rc-slider';
import { TimespanPicker } from '../../../../components/TimespanPicker/TimespanPicker';
import moment from 'moment/moment';
import { MIN_SEARCH_DATE } from '../../../../api/OData/ODataHelpers';
import Button from '../../../../components/Button/Button';

export const AreaAndTimeSectionProperties = Object.freeze({
  id: 'area-time',
  title: () => t`Area & Time`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setAreaTimeExpanded(v)),
});

const AreaAndTimeSection = ({
  areaTimeExpanded,
  aoiGeometry,
  aoiIsDrawing,
  mapBounds,
  aoiCoverage,
  minDate,
  maxDate,
}) => {
  const [dateTime, setDateTime] = useState([
    {
      from: moment.utc().subtract(1, 'month').startOf('day'),
      to: moment.utc().endOf('day'),
      id: 0,
      displayCalendarFrom: false,
      displayCalendarTo: false,
    },
  ]);
  const [dateRangesCounter, setDateRangesCounter] = useState(0);

  const minDateRange = moment.utc(minDate ? minDate : MIN_SEARCH_DATE).startOf('day');
  const maxDateRange = moment.utc(maxDate).endOf('day');

  const cardHolderRef = useRef(null);

  const updateSliderValue = (value) => {
    store.dispatch(areaAndTimeSectionSlice.actions.setAoiCoverage(value));
  };

  const getTitle = () => <div className="uppercase-text">{AreaAndTimeSectionProperties.title()}</div>;

  const detectIfDateIsCovering = (id, selectedDateTime) => {
    return (
      dateTime.find((currentDateTime) => {
        if (id !== currentDateTime.id) {
          return selectedDateTime.isBetween(currentDateTime.from, currentDateTime.to, undefined, '[]');
        } else {
          return undefined;
        }
      }) !== undefined
    );
  };

  useEffect(() => {
    store.dispatch(areaAndTimeSectionSlice.actions.setDateTimeRange(dateTime));
  }, [dateTime]);

  const getAndSetNextPrevDate = async (direction, selectedDay, id, dateTimeRange, isFrom = true) => {
    let newMoment;
    if (direction === 'prev') {
      newMoment = moment.utc(selectedDay).add(-1, 'days');
    } else {
      newMoment = moment.utc(selectedDay).add(1, 'days');
    }

    if (isFrom && (newMoment < minDateRange || newMoment > dateTimeRange.to)) {
      throw Error('invalidDateRange');
    }

    if (!isFrom && (newMoment > maxDateRange || newMoment < dateTimeRange.from)) {
      throw Error('invalidDateRange');
    }

    if (detectIfDateIsCovering(id, newMoment)) {
      throw Error('invalidDateRange');
    }

    isFrom
      ? updateDateTime(id)(newMoment, dateTimeRange.to)
      : updateDateTime(id)(dateTimeRange.from, newMoment);
  };

  const setAdditionalDateRange = (currentDateTimeRange) => {
    setDateRangesCounter(dateRangesCounter + 1);
    setDateTime((prevState) => {
      return [
        ...prevState,
        {
          from: currentDateTimeRange.from.clone().add(-1, 'days'),
          to: currentDateTimeRange.from.clone().add(-1, 'days').endOf('day'),
          id: dateRangesCounter + 1,
          displayCalendarFrom: false,
          displayCalendarTo: false,
        },
      ];
    });
  };

  const updateDateTime = (id) => (fromTime, toTime) => {
    setDateTime((prevState) => {
      return prevState.map((item, index) => (index === id ? { ...item, from: fromTime, to: toTime } : item));
    });
  };

  const closeAllCalendarDialogs = () => {
    setDateTime((prevState) => {
      return prevState.map((item, index) => ({
        ...item,
        displayCalendarFrom: false,
        displayCalendarTo: false,
      }));
    });
  };

  const updateCalendarOpenState = (selectedDateTime, state, isFrom = true) => {
    if (state) {
      closeAllCalendarDialogs();
    }

    setDateTime((prevState) => {
      return prevState.map((item, index) =>
        index === selectedDateTime.id
          ? {
              ...item,
              displayCalendarFrom: isFrom ? state : false,
              displayCalendarTo: !isFrom ? state : false,
            }
          : item,
      );
    });
  };

  const setTimespanPicker = (dateTimeRange, index) => (
    <TimespanPicker
      id="aoi-time-select"
      minDate={minDateRange}
      maxDate={maxDateRange}
      datePickerInputStyle={index + 1 > dateTime.length ? null : { width: '85px' }}
      timespan={{ fromTime: dateTimeRange.from, toTime: dateTimeRange.to }}
      applyTimespan={updateDateTime(index)}
      timespanExpanded={true}
      calendarHolder={cardHolderRef}
      displayCalendarFrom={dateTimeRange.displayCalendarFrom}
      openCalendarFrom={() => updateCalendarOpenState(dateTimeRange, true)}
      closeCalendarFrom={() => updateCalendarOpenState(dateTimeRange, false)}
      displayCalendarUntil={dateTimeRange.displayCalendarTo}
      openCalendarUntil={() => updateCalendarOpenState(dateTimeRange, true, false)}
      closeCalendarUntil={() => updateCalendarOpenState(dateTimeRange, false, false)}
      showNextPrevDateArrows={true}
      getAndSetNextPrevDateFrom={async (direction, selectedDay) =>
        await getAndSetNextPrevDate(direction, selectedDay, index, dateTimeRange)
      }
      getAndSetNextPrevDateTo={async (direction, selectedDay) =>
        await getAndSetNextPrevDate(direction, selectedDay, index, dateTimeRange, false)
      }
      isDisabled={false}
    />
  );

  const setDateRangeContainer = () => (
    <div className="date-picker-container">
      {dateTime.map((dateTimeRange, index) => {
        if (index + 1 < dateTime.length) {
          return setTimespanPicker(dateTimeRange, index);
        } else {
          return (
            <div className="date-picker-with-add">
              {setTimespanPicker(dateTimeRange, index)}
              <div className="add-button-container">
                <Button
                  icon={'fas fa-plus'}
                  rounded={true}
                  onClick={() => setAdditionalDateRange(dateTimeRange)}
                ></Button>
              </div>
            </div>
          );
        }
      })}
      <div className="calendar-holder" ref={cardHolderRef} />
    </div>
  );

  const setBody = () => (
    <div className="area-time-body">
      <div className="area-interest-container">
        <AOISelection
          aoiGeometry={aoiGeometry}
          aoiIsDrawing={aoiIsDrawing}
          mapBounds={mapBounds}
        ></AOISelection>
        <div className="coverage-slider-container">
          <label className="aoi-label-text">{`${t`AOI coverage`}:`}</label>
          <Slider
            className="aoi-slider"
            min={0}
            max={1}
            step={0.01}
            value={aoiCoverage}
            onChange={updateSliderValue}
          />
          <span className="aoi-current-value-text">{`${Math.round(aoiCoverage * 100)}%`}</span>
        </div>
        {setDateRangeContainer()}
      </div>
    </div>
  );

  return (
    <CollapsiblePanel
      key={AreaAndTimeSectionProperties.id}
      className={`section ${areaTimeExpanded ? 'active' : 'inactive'}`}
      title={getTitle()}
      headerComponent={getTitle()}
      expanded={areaTimeExpanded}
      toggleExpanded={AreaAndTimeSectionProperties.toggleExpanded}
    >
      {() => {
        return areaTimeExpanded ? setBody() : null;
      }}
    </CollapsiblePanel>
  );
};

const mapStoreToProps = (store) => ({
  selectedLanguage: store.language.selectedLanguage,
  areaTimeExpanded: store.collapsiblePanel.areaTimeExpanded,
  aoiGeometry: store.aoi.geometry,
  aoiCoverage: store.areaAndTimeSection.aoiCoverage,
  aoiIsDrawing: store.aoi.isDrawing,
  mapBounds: store.mainMap.bounds,
});

export default connect(mapStoreToProps, null)(AreaAndTimeSection);
