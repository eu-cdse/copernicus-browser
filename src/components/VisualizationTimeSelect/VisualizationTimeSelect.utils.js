import moment from 'moment';

import { DATE_MODES, PANEL } from '../../const';

// Value of the `date` URL parameter that asks for the newest available image.
export const LATEST_DATE_PARAM = 'latest';

export function getFromTime(date, minDate, isTimeRange = false, isMosaic = false) {
  let fromTime = date.clone().startOf('day');
  if (isTimeRange) {
    fromTime.add(-1, 'months');
  }
  if (isMosaic) {
    fromTime.add(-6, 'months');
  }
  if (minDate && fromTime.isBefore(minDate)) {
    fromTime = minDate.clone();
  }
  return fromTime;
}

// Whether "show the latest date" can be run: the same condition the "Show latest date" button uses.
export function canFindLatestDate({ isZoomLevelOk, isTimeless, clmsSelection }) {
  const clmsOk = !clmsSelection.selected || Boolean(clmsSelection.selectedCollection);
  return Boolean(isZoomLevelOk) && !isTimeless && clmsOk;
}

// Whether the URL asks for the latest image: `date=latest`, or a dataset with no date at all.
// Map bounds are unknown at URL-parse time, so this only decides the intent; the lookup itself is
// run later by VisualizationTimeSelect.
export function shouldLookUpLatestDate({
  date,
  datasetId,
  toTime,
  dateMode,
  fromTime,
  compareShare,
  compareSharedPinsId,
  timelapse,
  panel,
}) {
  if (!datasetId) {
    return false;
  }
  if (compareShare || compareSharedPinsId || timelapse) {
    return false;
  }
  if (panel === PANEL.PINS || panel === PANEL.WMS) {
    return false;
  }
  if (isLatestDateParam(date)) {
    return true;
  }
  if (toTime) {
    return false;
  }
  // A time range with only a start date is a deliberate choice; leave it alone.
  if (dateMode === DATE_MODES['TIME RANGE'].value && fromTime) {
    return false;
  }
  // A time range with no dates at all stays empty for the user to pick.
  return dateMode !== DATE_MODES['TIME RANGE'].value;
}

// Case-insensitive, since links are often built by hand or by an AI assistant.
export function isLatestDateParam(date) {
  return typeof date === 'string' && date.toLowerCase() === LATEST_DATE_PARAM;
}

// Turns the date-related URL parameters into the times to put in the store, and says whether a
// silent latest-date lookup is due. Pure, so the whole decision is unit-tested (URLParamsParser
// itself has no test).
//  - `date=latest` wins over fromTime/toTime, but only when the lookup will really run.
//  - A TIME RANGE longer than maxRangeDays is clamped: fromTime moves to maxRangeDays before toTime.
export function resolveUrlTimes({
  date,
  fromTime,
  toTime,
  dateMode,
  datasetId,
  compareShare,
  compareSharedPinsId,
  timelapse,
  panel,
  maxRangeDays,
}) {
  const urlFromTime = fromTime ? moment.utc(fromTime) : null;
  const urlToTime = toTime ? moment.utc(toTime) : null;

  const pendingLatestDate = shouldLookUpLatestDate({
    date,
    datasetId,
    toTime: urlToTime,
    dateMode,
    fromTime: urlFromTime,
    compareShare,
    compareSharedPinsId,
    timelapse,
    panel,
  });

  const dropUrlDates = pendingLatestDate && isLatestDateParam(date);
  const parsedFromTime = dropUrlDates ? null : urlFromTime;
  const parsedToTime = dropUrlDates ? null : urlToTime;

  const clampedFromTime =
    dateMode === DATE_MODES['TIME RANGE'].value &&
    parsedFromTime &&
    parsedToTime &&
    parsedToTime.diff(parsedFromTime, 'days', true) > maxRangeDays
      ? parsedToTime.clone().subtract(maxRangeDays, 'days').startOf('day')
      : parsedFromTime;

  return { fromTime: clampedFromTime, toTime: parsedToTime, pendingLatestDate };
}
