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
