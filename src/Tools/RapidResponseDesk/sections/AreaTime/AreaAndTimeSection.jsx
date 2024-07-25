import React, { useRef, useState } from 'react';
import './AreaAndTimeSection.scss';
import { connect } from 'react-redux';
import CollapsiblePanel from '../../../../components/CollapsiblePanel/CollapsiblePanel';
import { t } from 'ttag';
import store, { collapsiblePanelSlice } from '../../../../store';

export const AreaAndTimeSectionProperties = Object.freeze({
  id: 'area-time',
  title: () => t`Area & Time`,
  toggleExpanded: (v) => store.dispatch(collapsiblePanelSlice.actions.setAreaTimeExpanded(v)),
});
import { AOISelection } from '../../../../components/AOISelection/AOISelection';
import Slider from 'rc-slider';
import { t } from 'ttag';
import store, { areaAndTimeSectionSlice } from '../../../../store';
import { TimespanPicker } from '../../../../components/TimespanPicker/TimespanPicker';
import moment from 'moment/moment';
import { MIN_SEARCH_DATE } from '../../../../api/OData/ODataHelpers';

const AreaAndTimeSection = ({
  areaTimeExpanded,
  aoiGeometry,
  aoiIsDrawing,
  mapBounds,
  aoiCoverage,
  minDate,
  maxDate,
}) => {
  const [fromMoment, setFromMoment] = useState(moment.utc().subtract(1, 'month').startOf('day'));
  const [toMoment, setToMoment] = useState(moment.utc().endOf('day'));
  const [displayCalendarFrom, setDisplayCalendarFrom] = useState(false);
  const [displayCalendarTo, setDisplayCalendarTo] = useState(false);

  const minDateRange = moment.utc(minDate ? minDate : MIN_SEARCH_DATE).startOf('day');
  const maxDateRange = moment.utc(maxDate).endOf('day');

  const cardHolderRef = useRef(null);

  const updateSliderValue = (value) => {
    store.dispatch(areaAndTimeSectionSlice.actions.setAoiCoverage(value));
  };

  const getTitle = () => <div className="uppercase-text">{AreaAndTimeSectionProperties.title()}</div>;

  const getAndSetNextPrevDateFrom = async (direction, selectedDay, toMoment, minDate) => {
    let newFromMoment;
    if (direction === 'prev') {
      newFromMoment = moment.utc(selectedDay).add(-1, 'days');
    } else {
      newFromMoment = moment.utc(selectedDay).add(1, 'days');
    }
    if (newFromMoment < minDate || newFromMoment > toMoment) {
      throw Error('invalidDateRange');
    }
    setFromMoment(newFromMoment);
  };

  const getAndSetNextPrevDateTo = async (direction, selectedDay, fromMoment, maxDate) => {
    let newToMoment;
    if (direction === 'prev') {
      newToMoment = moment.utc(selectedDay).add(-1, 'days');
    } else {
      newToMoment = moment.utc(selectedDay).add(1, 'days');
    }
    if (newToMoment > maxDate || newToMoment < fromMoment) {
      throw Error('invalidDateRange');
    }
    setToMoment(newToMoment);
  };

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
        <div className="date-picker-container">
          <div className="date-picker-with-add">
            <TimespanPicker
              id="aoi-time-select"
              minDate={minDateRange}
              maxDate={maxDateRange}
              timespan={{ fromTime: fromMoment, toTime: toMoment }}
              applyTimespan={(fromTime, toTime) => {
                setFromMoment(fromTime);
                setToMoment(toTime);
              }}
              timespanExpanded={true}
              calendarHolder={cardHolderRef}
              displayCalendarFrom={displayCalendarFrom}
              openCalendarFrom={() => setDisplayCalendarFrom(true)}
              closeCalendarFrom={() => setDisplayCalendarFrom(false)}
              displayCalendarUntil={displayCalendarTo}
              openCalendarUntil={() => setDisplayCalendarTo(true)}
              closeCalendarUntil={() => setDisplayCalendarTo(false)}
              showNextPrevDateArrows={true}
              getAndSetNextPrevDateFrom={async (direction, selectedDay) =>
                await getAndSetNextPrevDateFrom(direction, selectedDay, toMoment, minDateRange)
              }
              getAndSetNextPrevDateTo={async (direction, selectedDay) =>
                await getAndSetNextPrevDateTo(direction, selectedDay, fromMoment, maxDateRange)
              }
              isDisabled={false}
            />
            <span>plus</span>
          </div>
          <div className="calendar-holder" ref={cardHolderRef} />
        </div>
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
