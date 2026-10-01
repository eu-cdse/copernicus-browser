import React from 'react';
import moment from 'moment';
import { useDispatch } from 'react-redux';

import { VisualizationTimeSelect } from '../../components/VisualizationTimeSelect/VisualizationTimeSelect';
import { externalLayersSlice } from '../../store';
import { selectActiveExternalLayer } from '../../store/slices/externalLayersSlice';
import { useAppSelector } from '../../hooks';
import { getWmsAvailableDatesInMonth } from '../../ExternalLayers/externalLayers.utils';
import { DATE_MODES } from '../../const';

// Props passed by the parent (VisualizationPanel); the active layer and panel-expanded flag come
// from the Redux store via hooks below.
interface WmsDateSelectionProps {
  showLayerPanel?: boolean;
  setShowLayerPanel?: (show: boolean) => void;
  showComparePanel?: boolean;
  showPinPanel?: boolean;
  compareShare?: boolean;
  compareShareInit?: boolean;
  wmsPanelOpen?: boolean;
  panelFromUrlParams?: string;
}

// Date selection for an active external WMS layer with a time dimension. Reuses the app's
// VisualizationTimeSelect/calendar but feeds available days from the layer's parsed time extent
// (no network), forces single mode, and disables the modes/actions WMS doesn't support.
function WmsDateSelection({
  showLayerPanel,
  setShowLayerPanel,
  showComparePanel,
  showPinPanel,
  compareShare,
  compareShareInit,
  wmsPanelOpen,
  panelFromUrlParams,
}: WmsDateSelectionProps) {
  const dispatch = useDispatch();
  const activeExternalLayer = useAppSelector(selectActiveExternalLayer);
  const datePanelExpanded = useAppSelector((state) => state.collapsiblePanel.datePanelExpanded);

  if (!activeExternalLayer) {
    return null;
  }
  const { timeStart, timeEnd, timeDefault, time, timeRanges } = activeExternalLayer;
  if (!timeStart && !timeEnd && !timeDefault) {
    return null;
  }
  // Floored/ceiled to day boundaries: the calendar and its available-day search
  // (Datepicker.utils.js's filterDatesOutsideTemporalExtent) compare whole-day markers (midnight
  // UTC) against these bounds, but a WMS extent's timeStart/timeEnd is a precise timestamp that
  // rarely falls on midnight (e.g. "2026-09-28T21:00:00.000Z"). Left un-floored, minDate's
  // time-of-day (21:00) is *after* that same day's midnight marker, so the day the extent actually
  // starts on gets filtered out as "before minDate" — the prev-arrow then can't reach it and, once
  // it's the only remaining candidate, throws "No new available date" and disables itself one day
  // too early. See #1280 comment thread.
  const minDate = moment.utc(timeStart || timeDefault).startOf('day');
  // Some servers advertise a time extent that reaches days or weeks into the future (e.g. a
  // multi-day weather forecast run); a WMS server has no way to flag "beyond this, it's a forecast"
  // in the capabilities document, so the calendar would otherwise both default to and allow picking
  // a date that hasn't happened yet. Cap at today regardless of what the server advertises.
  const maxDate = moment.min(moment.utc(timeEnd || timeDefault), moment.utc()).endOf('day');
  // Belt-and-braces: guards stale persisted state (pins, sessions) saved before this value was
  // validated upstream in parseTimeExtent, and a persisted time from before the maxDate cap above
  // (or simply a `time` picked when the extent's max was still in the future).
  const candidateToTime = moment.utc(time || timeDefault);
  const toTime = !candidateToTime.isValid()
    ? maxDate
    : moment.min(moment.max(candidateToTime, minDate), maxDate);

  const updateSelectedTime = (fromTime: moment.MomentInput, newToTime: moment.MomentInput) => {
    if (!newToTime) {
      return;
    }
    const day = moment.utc(newToTime).format('YYYY-MM-DD');
    // Sub-daily layers (time values include a time-of-day) reject a date-only TIME and render
    // blank, so keep the default's time-of-day on the picked day (best-effort for the exact time).
    const timeOfDay = timeDefault && timeDefault.includes('T') ? timeDefault.split('T')[1] : null;
    const value = timeOfDay ? `${day}T${timeOfDay}` : day;
    dispatch(externalLayersSlice.actions.setActiveExternalLayerTime(value));
  };

  const onQueryDatesForActiveMonth = async (day: moment.MomentInput) => {
    const month = day ? moment.utc(day) : moment.utc();
    return getWmsAvailableDatesInMonth(
      timeRanges ?? undefined,
      month.clone().startOf('month'),
      month.clone().endOf('month'),
    );
  };

  const onQueryDatesForRange = async (fromMoment: moment.MomentInput, toMoment: moment.MomentInput) =>
    getWmsAvailableDatesInMonth(timeRanges ?? undefined, moment.utc(fromMoment), moment.utc(toMoment));

  const getLatestAvailableDate = async () => maxDate;

  return (
    <VisualizationTimeSelect
      isTimeless={false}
      minDate={minDate}
      maxDate={maxDate}
      fromTime={null}
      toTime={toTime}
      timespanSupported={false}
      hasCloudCoverage={false}
      isZoomLevelOk={true}
      showNextPrev={true}
      updateSelectedTime={updateSelectedTime}
      onQueryDatesForActiveMonth={onQueryDatesForActiveMonth}
      onQueryDatesForRange={onQueryDatesForRange}
      // WMS has no flyovers and passes hasCloudCoverage={false}, so these are never invoked
      // (the calendar always uses onQueryDates*); no-ops just satisfy the prop contract.
      onQueryFlyoversForActiveMonth={async () => []}
      onQueryFlyoversForRange={async () => []}
      getLatestAvailableDate={getLatestAvailableDate}
      limitMonthsSearch={1}
      maxCloudCover={100}
      setMaxCloudCover={() => {}}
      setMaxCloudCoverAfterChange={() => {}}
      datePanelExpanded={datePanelExpanded}
      showLayerPanel={showLayerPanel}
      setShowLayerPanel={setShowLayerPanel}
      showComparePanel={showComparePanel}
      showPinPanel={showPinPanel}
      dateMode={DATE_MODES.SINGLE.value}
      compareShare={compareShare}
      compareShareInit={compareShareInit}
      wmsPanelOpen={wmsPanelOpen}
      panelFromUrlParams={panelFromUrlParams}
      clmsSelection={{ selected: false }}
      disabledModes={[DATE_MODES.MOSAIC.value, DATE_MODES['TIME RANGE'].value]}
      findProductsDisabled={true}
    />
  );
}

export default WmsDateSelection;
