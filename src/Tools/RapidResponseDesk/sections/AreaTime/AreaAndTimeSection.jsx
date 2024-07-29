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
import Button, { ButtonType } from '../../../../components/Button/Button';

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
  const [timespanArray, setTimespanArray] = useState([
    {
      from: moment.utc().subtract(1, 'month').startOf('day'),
      to: moment.utc().endOf('day'),
      id: 0,
      displayCalendarFrom: false,
      displayCalendarTo: false,
    },
  ]);

  const minDateRange = moment.utc(minDate ? minDate : MIN_SEARCH_DATE).startOf('day');
  const maxDateRange = moment.utc(maxDate).endOf('day');

  const cardHolderRef = useRef(null);

  const updateSliderValue = (value) => {
    store.dispatch(areaAndTimeSectionSlice.actions.setAoiCoverage(value));
  };

  const getTitle = () => <div className="uppercase-text">{AreaAndTimeSectionProperties.title()}</div>;

  const detectIfDateIsOverlapping = (id, selectedTimespan) => {
    return (
      timespanArray.find((currentTimespan) => {
        if (id !== currentTimespan.id) {
          return selectedTimespan.isBetween(currentTimespan.from, currentTimespan.to, undefined, '[]');
        } else {
          return undefined;
        }
      }) !== undefined
    );
  };

  useEffect(() => {
    store.dispatch(areaAndTimeSectionSlice.actions.setTimespanArray(timespanArray));
  }, [timespanArray]);

  const getAndSetNextPrevDate = async (direction, selectedDay, id, timespanFrame, isFrom = true) => {
    let newMoment;
    if (direction === 'prev') {
      newMoment = moment.utc(selectedDay).add(-1, 'days');
    } else {
      newMoment = moment.utc(selectedDay).add(1, 'days');
    }

    if (isFrom && (newMoment < minDateRange || newMoment > timespanFrame.to)) {
      throw Error('invalidDateRange');
    }

    if (!isFrom && (newMoment > maxDateRange || newMoment < timespanFrame.from)) {
      throw Error('invalidDateRange');
    }

    if (detectIfDateIsOverlapping(id, newMoment)) {
      throw Error('invalidDateRange');
    }

    isFrom
      ? updateTimespan(id)(newMoment, timespanFrame.to)
      : updateTimespan(id)(timespanFrame.from, newMoment);
  };

  const setAdditionalDateRange = (currentTimespanFrame) => {
    setTimespanArray((prevState) => {
      return [
        ...prevState,
        {
          from: currentTimespanFrame.from.clone().add(-1, 'days').startOf('day'),
          to: currentTimespanFrame.from.clone().add(-1, 'days').endOf('day'),
          id: timespanArray.length,
          displayCalendarFrom: false,
          displayCalendarTo: false,
        },
      ];
    });
  };

  const updateTimespan = (id) => (fromTime, toTime) => {
    setTimespanArray((prevState) => {
      return prevState.map((item, index) => (index === id ? { ...item, from: fromTime, to: toTime } : item));
    });
  };

  const closeAllCalendarDialogs = () => {
    setTimespanArray((prevState) => {
      return prevState.map((item, index) => ({
        ...item,
        displayCalendarFrom: false,
        displayCalendarTo: false,
      }));
    });
  };

  const updateCalendarOpenState = (selectedTimespan, state, isFrom = true) => {
    if (state) {
      closeAllCalendarDialogs();
    }

    setTimespanArray((prevState) => {
      return prevState.map((item, index) =>
        index === selectedTimespan.id
          ? {
              ...item,
              displayCalendarFrom: isFrom ? state : false,
              displayCalendarTo: !isFrom ? state : false,
            }
          : item,
      );
    });
  };

  const removeTimespanFromList = (id) => {
    setTimespanArray((prevState) => prevState.filter((item, index) => index !== id));
  };

  const setTimespanPicker = (timespan, index) => (
    <TimespanPicker
      id="aoi-time-select"
      minDate={minDateRange}
      maxDate={maxDateRange}
      datePickerInputStyle={{ width: '85px' }}
      timespan={{ fromTime: timespan.from, toTime: timespan.to }}
      applyTimespan={updateTimespan(index)}
      timespanExpanded={true}
      calendarHolder={cardHolderRef}
      timespanLimit={(selectedTimespan) => detectIfDateIsOverlapping(index, selectedTimespan)}
      displayCalendarFrom={timespan.displayCalendarFrom}
      openCalendarFrom={() => updateCalendarOpenState(timespan, true)}
      closeCalendarFrom={() => updateCalendarOpenState(timespan, false)}
      displayCalendarUntil={timespan.displayCalendarTo}
      openCalendarUntil={() => updateCalendarOpenState(timespan, true, false)}
      closeCalendarUntil={() => updateCalendarOpenState(timespan, false, false)}
      showNextPrevDateArrows={true}
      getAndSetNextPrevDateFrom={async (direction, selectedDay) =>
        await getAndSetNextPrevDate(direction, selectedDay, index, timespan)
      }
      getAndSetNextPrevDateTo={async (direction, selectedDay) =>
        await getAndSetNextPrevDate(direction, selectedDay, index, timespan, false)
      }
      isDisabled={false}
    />
  );

  const setDateRangeContainer = () => (
    <div className="date-picker-container">
      {timespanArray.map((timespanFrame, index) => {
        return (
          <div className={`date-picker-content${index + 1 < timespanArray.length ? ' bottom-border' : ''}`}>
            {setTimespanPicker(timespanFrame, index)}
            <div className="remove-button-container">
              <Button
                style={{ boxShadow: 'none', color: 'black' }}
                icon={'fas fa-trash'}
                type={ButtonType.text}
                disabled={timespanArray.length === 1}
                rounded={true}
                onClick={() => removeTimespanFromList(index)}
              ></Button>
            </div>
            {timespanArray.length === index + 1 && (
              <div className="add-button-container">
                <Button
                  icon={'fas fa-plus'}
                  rounded={true}
                  onClick={() => setAdditionalDateRange(timespanFrame)}
                ></Button>
              </div>
            )}
          </div>
        );
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
