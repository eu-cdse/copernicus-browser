import React, { useState, useRef, useEffect } from 'react';
import { t } from 'ttag';
import moment from 'moment';

import DatePicker from '../DatePicker/DatePicker';
import { TimespanPicker } from '../../components/TimespanPicker/TimespanPicker';
import CloudCoverageDisplay from '../CloudCoverageDisplay/CloudCoverageDisplay';

import './VisualizationTimeSelect.scss';
import Loader from '../../Loader/Loader';
import CollapsiblePanel from '../CollapsiblePanel/CollapsiblePanel';
import store, { collapsiblePanelSlice, visualizationSlice } from '../../store';
import FindProductsForCurrentView from './FindProductsButton';
import ShowLatestDateButton from './ShowLatestDateButton';
import { handleError, resetMessagePanel } from '../../utils';
import EffectDropdown from '../../junk/EOBEffectsPanel/EffectDropdown';
import { getValueOrDefault } from '../../utils/effectsUtils';
import { useSelector } from 'react-redux';
import { getMosaickingOrderOptions } from '../../utils/mosaickingOrder.utils';
import { defaultEffects, DATE_MODES } from '../../const';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

import Single from './icons/single.svg?react';
import Mosaic from './icons/mosaic.svg?react';
import TimeRange from './icons/time-range.svg?react';
import { getFromTime } from './VisualizationTimeSelect.utils';

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
  onQueryDatesForRange,
  showNextPrev,
  fromTime,
  toTime,
  timespanSupported,
  onQueryFlyoversForActiveMonth,
  onQueryFlyoversForRange,
  hasCloudCoverage,
  isZoomLevelOk,
  updateSelectedTime,
  getLatestAvailableDate,
  limitMonthsSearch,
  maxCloudCover,
  setMaxCloudCover,
  setMaxCloudCoverAfterChange,
  datePanelExpanded,
  showLayerPanel,
  setShowLayerPanel,
  dateMode,
  compareShare,
  clmsSelection,
}) {
  const [loading, setLoading] = useState(false);
  const calendarHolder = useRef(null);
  const [displayCalendarFrom, setDisplayCalendarFrom] = useState(false);
  const [displayCalendarUntil, setDisplayCalendarUntil] = useState(false);
  const [dateLoading, setDateLoading] = useState(false);
  const [nextDateBtnDisabled, setNextDateBtnDisabled] = useState(false);

  const isSingle = dateMode === DATE_MODES.SINGLE.value;
  const isMosaic = dateMode === DATE_MODES.MOSAIC.value;
  const isTimeRange = dateMode === DATE_MODES['TIME RANGE'].value;

  const openCalendarFrom = () => setDisplayCalendarFrom(true);

  const closeCalendarFrom = () => setDisplayCalendarFrom(false);

  const openCalendarUntil = () => setDisplayCalendarUntil(true);

  const closeCalendarUntil = () => setDisplayCalendarUntil(false);

  useEffect(() => {
    async function setData() {
      await getAndSetLatestDateWithData();
    }

    if (isTimeless) {
      setData();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isTimeless]);

  useEffect(() => {
    const updateSelectedDates = () => {
      isSingle ? updateDate(selectedDay) : updateDate(selectedDay ? selectedDay : moment().utc());
    };

    updateSelectedDates();
    closeCalendarFrom();
    closeCalendarUntil();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [dateMode]);

  useEffect(() => {
    // Update timerange from url
    if (isTimeRange) {
      updateTimespan(fromTime, toTime);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function updateTimespan(fromTime, toTime) {
    updateSelectedTime(fromTime, toTime);
  }

  function openLayerPanel() {
    if (!showLayerPanel && setShowLayerPanel && !compareShare) {
      setShowLayerPanel(true);
    }
  }

  function updateDate(date) {
    if (!date) {
      return;
    }
    const fromTime = getFromTime(date, minDate);
    const toTime = date.clone().endOf('day');
    updateSelectedTime(fromTime, toTime);
    openLayerPanel();
  }

  async function getAndSetLatestDateWithData() {
    try {
      setLoading(true);
      const latestDateWithAvailableData = await getLatestAvailableDate();
      if (latestDateWithAvailableData) {
        resetMessagePanel();
        updateDate(latestDateWithAvailableData);
      } else {
        handleError({ message: t`No results found` });
      }
    } catch (e) {
      await handleError(e, t`Unable to show latest date`);
    } finally {
      setLoading(false);
      setNextDateBtnDisabled(true);
      openLayerPanel();
    }
  }

  const selectedDay = toTime ? toTime.clone().startOf('day') : null;

  const renderPanelHeader = () => {
    return (
      <>
        <div className="date-timespan-label">
          <b className="time-select-type">
            {t`Date:`}&nbsp;{DATE_MODES[dateMode]?.label()}
          </b>

          <div className="date-tabs">
            <Single
              title={t`Single date`}
              className={`single-mode-svg ${isSingle ? 'active' : ''}`}
              onClick={() => store.dispatch(visualizationSlice.actions.setDateMode(DATE_MODES.SINGLE.value))}
            />
            <Mosaic
              title={t`Mosaic`}
              className={`mosaic-mode-svg ${isMosaic ? 'active' : ''}`}
              onClick={() => store.dispatch(visualizationSlice.actions.setDateMode(DATE_MODES.MOSAIC.value))}
            />
            <TimeRange
              title={t`Time range`}
              className={`time-range-mode-svg ${isTimeRange ? 'active' : ''}`}
              onClick={() =>
                store.dispatch(visualizationSlice.actions.setDateMode(DATE_MODES['TIME RANGE'].value))
              }
            />
          </div>
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
          onQueryDatesForRange={
            hasCloudCoverage && isZoomLevelOk ? onQueryFlyoversForRange : onQueryDatesForRange
          }
          hasCloudCoverFilter={hasCloudCoverage}
          maxCloudCover={maxCloudCover}
          setMaxCloudCover={setMaxCloudCover}
          setMaxCloudCoverAfterChange={setMaxCloudCoverAfterChange}
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
          isTimeRange={isTimeRange}
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
            enabled={
              isZoomLevelOk &&
              !isTimeless &&
              ((clmsSelection.selected && clmsSelection.selectedCollection) || !clmsSelection.selected)
            }
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
              onQueryDatesForRange={onQueryDatesForRange}
              maxCloudCover={maxCloudCover}
              setMaxCloudCover={setMaxCloudCover}
              setMaxCloudCoverAfterChange={setMaxCloudCoverAfterChange}
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
              isTimeRange={isTimeRange}
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
            enabled={
              isZoomLevelOk &&
              !isTimeless &&
              ((clmsSelection.selected && clmsSelection.selectedCollection) || !clmsSelection.selected)
            }
            datePanelExpanded={datePanelExpanded}
            onClick={getAndSetLatestDateWithData}
          />
          <FindProductsForCurrentView
            enabled={isZoomLevelOk}
            setLoading={setLoading}
            hasProductsWithinSelectedRange={isTimeRange || isMosaic}
          />
        </>
      );
    }

    return (
      <>
        {isTimeRange ? (
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
              showNextPrevDateArrows={showNextPrev}
              maxCloudCover={maxCloudCover}
              setMaxCloudCover={setMaxCloudCoverAfterChange}
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
              isTimeRange={isTimeRange}
              additionalTimeselectOptions={<AdditionalTimeSelectOptions />}
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
                    onQueryDatesForRange={
                      hasCloudCoverage && isZoomLevelOk ? onQueryFlyoversForRange : onQueryDatesForRange
                    }
                    hasCloudCoverFilter={hasCloudCoverage}
                    maxCloudCover={maxCloudCover}
                    setMaxCloudCover={setMaxCloudCover}
                    setMaxCloudCoverAfterChange={setMaxCloudCoverAfterChange}
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
                    isTimeRange={isTimeRange}
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
                  onQueryDatesForRange={onQueryDatesForRange}
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
                  isTimeRange={isTimeRange}
                />
              )}
            </div>
            <ShowLatestDateButton
              enabled={
                isZoomLevelOk &&
                !isTimeless &&
                ((clmsSelection.selected && clmsSelection.selectedCollection) || !clmsSelection.selected)
              }
              datePanelExpanded={datePanelExpanded}
              onClick={getAndSetLatestDateWithData}
            />
          </>
        )}
        {
          <FindProductsForCurrentView
            enabled={isZoomLevelOk}
            setLoading={setLoading}
            hasProductsWithinSelectedRange={isTimeRange || isMosaic}
          />
        }
      </>
    );
  };

  return (
    <div className="visualization-time-select">
      <CollapsiblePanel
        headerComponent={renderPanelHeader()}
        title={renderPanelTitle()}
        expanded={datePanelExpanded}
        toggleExpanded={(v) => store.dispatch(collapsiblePanelSlice.actions.setDatePanelExpanded(v))}
      >
        {renderPanelContent}
      </CollapsiblePanel>
      <div className="visualization-calendar-holder" ref={calendarHolder} />
      {(loading || dateLoading) && <Loader className={'within-collapse-panel'} />}
    </div>
  );
}
