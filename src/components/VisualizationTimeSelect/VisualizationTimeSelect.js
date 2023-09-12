import React, { useState, useRef, useEffect } from 'react';
import { t } from 'ttag';

import DatePicker from '../DatePicker/DatePicker';
import { TimespanPicker } from '../../components/TimespanPicker/TimespanPicker';
import CloudCoverageDisplay from '../CloudCoverageDisplay/CloudCoverageDisplay';

import './VisualizationTimeSelect.scss';
import moment from 'moment';
import Loader from '../../Loader/Loader';
import CollapsiblePanel from '../CollapsiblePanel/CollapsiblePanel';
import store, { collapsiblePanelSlice, notificationSlice, visualizationSlice } from '../../store';
import FindProductsForCurrentView from './FindProductsButton';
import ShowLatestDateButton from './ShowLatestDateButton';
import { handleError } from '../../utils';
import EffectDropdown from '../../junk/EOBEffectsPanel/EffectDropdown';
import { getValueOrDefault } from '../../utils/effectsUtils';
import { useSelector } from 'react-redux';
import { getMosaickingOrderOptions } from '../../utils/mosaickingOrder.utils';
import { defaultEffects } from '../../const';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

const AdditionalTimeSelectOptions = () => {
  const mosaickingOrder = useSelector((state) => state.visualization.mosaickingOrder);
  const datasetId = useSelector((state) => state.visualization.datasetId);
  const dsh = getDataSourceHandler(datasetId);
  const hasCloudCoverage = dsh && dsh.tilesHaveCloudCoverage(datasetId);
  const onUpdateMosaickingOrder = (mosaickingOrder) =>
    store.dispatch(
      visualizationSlice.actions.setMosaickingOrder(mosaickingOrder ? mosaickingOrder : undefined),
    );
  return (
    <EffectDropdown
      key="mosaickingOrder"
      name={t`Mosaicking order`}
      value={getValueOrDefault({ mosaickingOrder }, 'mosaickingOrder', defaultEffects)}
      onChange={onUpdateMosaickingOrder}
      options={getMosaickingOrderOptions(datasetId, hasCloudCoverage)}
      displayLayerDefault={true}
      separator=":"
    />
  );
};

export function VisualizationTimeSelect({
  isTimeless,
  maxDate,
  minDate,
  onQueryDatesForActiveMonth,
  showNextPrev,
  fromTime,
  toTime,
  timespanSupported,
  onQueryFlyoversForActiveMonth,
  hasCloudCoverage,
  isZoomLevelOk,
  updateSelectedTime,
  shouldExpandTimespan,
  getLatestAvailableDate,
  limitMonthsSearch,
  maxCloudCover,
  setMaxCloudCover,
  datePanelExpanded,
}) {
  const [timespanExpanded, setTimespanExpanded] = useState(shouldExpandTimespan);
  const [loading, setLoading] = useState(false);
  const calendarHolder = useRef(null);
  const [displayCalendarFrom, setDisplayCalendarFrom] = useState(false);
  const [displayCalendarUntil, setDisplayCalendarUntil] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);
  const [nextDateBtnDisabled, setNextDateBtnDisabled] = useState(false);

  const openCalendarFrom = () => setDisplayCalendarFrom(true);

  const closeCalendarFrom = () => setDisplayCalendarFrom(false);

  const openCalendarUntil = () => setDisplayCalendarUntil(true);

  const closeCalendarUntil = () => setDisplayCalendarUntil(false);

  useEffect(() => {
    //close timespan if dates are not set
    if (!toTime && !fromTime) {
      setTimespanExpanded(false);
    }
  }, [toTime, fromTime]);

  useEffect(() => {
    async function setData() {
      await getAndSetLatestDateWithData();
    }

    if (isTimeless) {
      setData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeless]);

  function updateTimespan(fromTime, toTime) {
    updateSelectedTime(fromTime, toTime);
  }

  function getFromTime(date, minDate, isTimerange) {
    let fromTime = date.clone().startOf('day');
    if (isTimerange) {
      fromTime.add(-1, 'months');
    }
    if (minDate && fromTime.isBefore(minDate)) {
      fromTime = minDate.clone();
    }
    return fromTime;
  }

  function updateDate(date, isTimerange = false) {
    if (!date) {
      return;
    }
    const fromTime = getFromTime(date, minDate, isTimerange);
    const toTime = date.clone().endOf('day');
    updateSelectedTime(fromTime, toTime);
  }

  function toggleTimespan() {
    if (!timespanExpanded && !fromTime && !toTime) {
      const fromTime = getFromTime(maxDate, minDate, !timespanExpanded);
      const toTime = maxDate.clone().endOf('day');
      updateSelectedTime(fromTime, toTime);
    }

    updateDate(toTime, !timespanExpanded);
    if (timespanExpanded) {
      store.dispatch(visualizationSlice.actions.setMosaickingOrder(undefined));
    }
    setTimespanExpanded((timespanExpanded) => !timespanExpanded);
  }

  async function getAndSetLatestDateWithData() {
    try {
      setLoading(true);
      const latestDateWithAvailableData = await getLatestAvailableDate();
      if (latestDateWithAvailableData) {
        store.dispatch(notificationSlice.actions.displayPanelError(null));
        const fromTime = moment.utc(latestDateWithAvailableData).startOf('day');
        const toTime = moment.utc(latestDateWithAvailableData).endOf('day');
        updateSelectedTime(fromTime, toTime);
      } else {
        store.dispatch(notificationSlice.actions.displayPanelError({ message: t`No results found` }));
      }
    } catch (e) {
      await handleError(e, t`Unable to show latest date`);
    } finally {
      setLoading(false);
      setNextDateBtnDisabled(true);
    }
  }

  const selectedDay = toTime ? toTime.clone().startOf('day') : null;

  const renderPanelHeader = (timespanExpanded, timespanSupported, isTimeless) => {
    return (
      <>
        <div className="date-timespan-label">
          <b className="time-select-type">{t`Date:`}</b>
          {timespanSupported && !isTimeless && (
            <div className="time-select-type-button" onClick={toggleTimespan}>
              {timespanExpanded ? t`Single date` : t`Time Range`}
            </div>
          )}
        </div>
      </>
    );
  };

  const renderPanelTitle = () => {
    return (
      <>
        <DatePicker
          id="cloud-cover-datepicker-wrap"
          calendarContainer={calendarHolder}
          selectedDay={selectedDay}
          setSelectedDay={updateDate}
          minDate={minDate}
          maxDate={maxDate}
          showNextPrevDateArrows={showNextPrev}
          onQueryDatesForActiveMonth={
            hasCloudCoverage && isZoomLevelOk ? onQueryFlyoversForActiveMonth : onQueryDatesForActiveMonth
          }
          hasCloudCoverFilter={hasCloudCoverage}
          maxCloudCover={maxCloudCover}
          setMaxCloudCover={setMaxCloudCover}
          getLatestAvailableDate={getLatestAvailableDate}
          limitMonthsSearch={limitMonthsSearch}
          displayCalendar={displayCalendarFrom}
          openCalendar={openCalendarFrom}
          closeCalendar={closeCalendarFrom}
          dateLoading={dateLoading}
          setDateLoading={setDateLoading}
          nextDateBtnDisabled={nextDateBtnDisabled}
          setNextDateBtnDisabled={setNextDateBtnDisabled}
          isTimeless={isTimeless}
          isZoomLevelOk={isZoomLevelOk}
        />
        {hasCloudCoverage && (
          <CloudCoverageDisplay
            cloudCoverage={maxCloudCover}
            displayCalendar={displayCalendarFrom}
            openCalendar={openCalendarFrom}
            closeCalendar={closeCalendarFrom}
            enabled={isZoomLevelOk}
          />
        )}
        {!datePanelExpanded && (
          <ShowLatestDateButton
            enabled={isZoomLevelOk && !isTimeless}
            datePanelExpanded={datePanelExpanded}
            onClick={getAndSetLatestDateWithData}
          />
        )}
      </>
    );
  };

  const renderPanelContent = (isExpanded) => {
    if (!isExpanded) {
      return;
    }

    if (!timespanSupported) {
      return (
        <>
          <div className="datepicker-cloud-coverage-wrapper">
            <DatePicker
              id="visualization-date-picker"
              calendarContainer={calendarHolder}
              selectedDay={selectedDay}
              setSelectedDay={updateDate}
              minDate={minDate}
              maxDate={maxDate}
              showNextPrevDateArrows={showNextPrev}
              onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
              maxCloudCover={maxCloudCover}
              setMaxCloudCover={setMaxCloudCover}
              getLatestAvailableDate={getLatestAvailableDate}
              limitMonths={limitMonthsSearch}
              displayCalendar={displayCalendarFrom}
              openCalendar={openCalendarFrom}
              closeCalendar={closeCalendarFrom}
              dateLoading={dateLoading}
              setDateLoading={setDateLoading}
              nextDateBtnDisabled={nextDateBtnDisabled}
              setNextDateBtnDisabled={setNextDateBtnDisabled}
              isTimeless={isTimeless}
              hasCloudCoverFilter={hasCloudCoverage}
              isZoomLevelOk={isZoomLevelOk}
            />
            {hasCloudCoverage && (
              <CloudCoverageDisplay
                cloudCoverage={maxCloudCover}
                displayCalendar={displayCalendarFrom}
                openCalendar={openCalendarFrom}
                closeCalendar={closeCalendarFrom}
                enabled={isZoomLevelOk}
              />
            )}
          </div>
          <ShowLatestDateButton
            enabled={isZoomLevelOk && !isTimeless}
            datePanelExpanded={datePanelExpanded}
            onClick={getAndSetLatestDateWithData}
          />
          <FindProductsForCurrentView
            enabled={isZoomLevelOk}
            setLoading={setLoading}
            timespanExpanded={timespanExpanded}
          ></FindProductsForCurrentView>
        </>
      );
    }

    return (
      <>
        {timespanExpanded ? (
          <>
            <TimespanPicker
              id="visualization-time-select"
              minDate={minDate}
              maxDate={maxDate}
              timespan={{ fromTime: fromTime, toTime: toTime }}
              applyTimespan={updateTimespan}
              onQueryDatesForActiveMonth={
                hasCloudCoverage && isZoomLevelOk ? onQueryFlyoversForActiveMonth : onQueryDatesForActiveMonth
              }
              hasCloudCoverage={hasCloudCoverage}
              isZoomLevelOk={isZoomLevelOk}
              timespanExpanded={timespanExpanded}
              showNextPrevDateArrows={showNextPrev}
              maxCloudCover={maxCloudCover}
              setMaxCloudCover={setMaxCloudCover}
              calendarHolder={calendarHolder}
              displayCalendarFrom={displayCalendarFrom}
              openCalendarFrom={openCalendarFrom}
              closeCalendarFrom={closeCalendarFrom}
              displayCalendarUntil={displayCalendarUntil}
              openCalendarUntil={openCalendarUntil}
              closeCalendarUntil={closeCalendarUntil}
              dateLoading={dateLoading}
              setDateLoading={setDateLoading}
              nextDateBtnDisabled={nextDateBtnDisabled}
              setNextDateBtnDisabled={setNextDateBtnDisabled}
              isTimeless={isTimeless}
              additionalTimeselectOptions=<AdditionalTimeSelectOptions />
            />
          </>
        ) : (
          <>
            <div className="datepicker-cloud-coverage-wrapper">
              {hasCloudCoverage ? (
                <>
                  <DatePicker
                    id="cloud-cover-datepicker-wrap"
                    calendarContainer={calendarHolder}
                    selectedDay={selectedDay}
                    setSelectedDay={updateDate}
                    minDate={minDate}
                    maxDate={maxDate}
                    showNextPrevDateArrows={showNextPrev}
                    onQueryDatesForActiveMonth={
                      isZoomLevelOk ? onQueryFlyoversForActiveMonth : onQueryDatesForActiveMonth
                    }
                    hasCloudCoverFilter={hasCloudCoverage}
                    maxCloudCover={maxCloudCover}
                    setMaxCloudCover={setMaxCloudCover}
                    getLatestAvailableDate={getLatestAvailableDate}
                    limitMonthsSearch={limitMonthsSearch}
                    displayCalendar={displayCalendarFrom}
                    openCalendar={openCalendarFrom}
                    closeCalendar={closeCalendarFrom}
                    dateLoading={dateLoading}
                    setDateLoading={setDateLoading}
                    nextDateBtnDisabled={nextDateBtnDisabled}
                    setNextDateBtnDisabled={setNextDateBtnDisabled}
                    isTimeless={isTimeless}
                    isZoomLevelOk={isZoomLevelOk}
                  />
                  <CloudCoverageDisplay
                    cloudCoverage={maxCloudCover}
                    displayCalendar={displayCalendarFrom}
                    openCalendar={openCalendarFrom}
                    closeCalendar={closeCalendarFrom}
                    enabled={isZoomLevelOk}
                  />
                </>
              ) : (
                <DatePicker
                  id="visualization-date-picker"
                  calendarContainer={calendarHolder}
                  selectedDay={selectedDay}
                  setSelectedDay={updateDate}
                  minDate={minDate}
                  maxDate={maxDate}
                  showNextPrevDateArrows={showNextPrev}
                  onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
                  getLatestAvailableDate={getLatestAvailableDate}
                  limitMonthsSearch={limitMonthsSearch}
                  displayCalendar={displayCalendarFrom}
                  openCalendar={openCalendarFrom}
                  closeCalendar={closeCalendarFrom}
                  dateLoading={dateLoading}
                  setDateLoading={setDateLoading}
                  nextDateBtnDisabled={nextDateBtnDisabled}
                  setNextDateBtnDisabled={setNextDateBtnDisabled}
                  isTimeless={isTimeless}
                  hasCloudCoverFilter={hasCloudCoverage}
                  isZoomLevelOk={isZoomLevelOk}
                />
              )}
            </div>
            <ShowLatestDateButton
              enabled={isZoomLevelOk && !isTimeless}
              datePanelExpanded={datePanelExpanded}
              onClick={getAndSetLatestDateWithData}
            />
          </>
        )}
        <FindProductsForCurrentView
          enabled={isZoomLevelOk}
          setLoading={setLoading}
          timespanExpanded={timespanExpanded}
        ></FindProductsForCurrentView>
      </>
    );
  };

  return (
    <div className={`visualization-time-select ${timespanExpanded ? 'expanded' : ''}`}>
      <CollapsiblePanel
        headerComponent={renderPanelHeader(timespanExpanded, timespanSupported, isTimeless)}
        title={renderPanelTitle()}
        expanded={datePanelExpanded}
        toggleExpanded={(v) => store.dispatch(collapsiblePanelSlice.actions.setDatePanelExpanded(v))}
      >
        {renderPanelContent}
      </CollapsiblePanel>
      <div className="visualization-calendar-holder" ref={calendarHolder} />
      {(loading || dateLoading) && <Loader />}
    </div>
  );
}
