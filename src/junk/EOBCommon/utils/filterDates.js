import moment from 'moment';

export function applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths) {
  /*
    This function takes a date range and the months that are allowed, and returns an array
    of resulting (valid) date ranges.
  */

  // make sure we are dealing with UTC, otherwise strange things might happen:
  fromMoment = moment.utc(fromMoment.unix() * 1000);
  toMoment = moment.utc(toMoment.unix() * 1000);

  if (filterMonths === null || filterMonths.length === 12) {
    return [{ fromMoment: fromMoment, toMoment: toMoment }];
  }

  // iterate from start till end, adding either a new date range or extending the old one
  // along the way:
  let intervals = [];
  let currentInterval = null;
  const fromMonth = fromMoment.clone().startOf('month');
  const toMonth = toMoment.clone().endOf('month');
  for (let month = fromMonth; fromMonth.isSameOrBefore(toMonth); month.add(1, 'month')) {
    // ignore months which are not in filterMonths:
    if (!filterMonths.includes(month.month())) {
      // if there was an interval we were extending, push it to the final list:
      if (currentInterval !== null) {
        intervals.push(currentInterval);
        currentInterval = null;
      }
      continue;
    }

    const intervalStart = moment.max(month.clone().startOf('month'), fromMoment);
    const intervalEnd = moment.min(month.clone().endOf('month'), toMoment);
    if (currentInterval === null) {
      // create a new interval:
      currentInterval = {
        fromMoment: intervalStart,
        toMoment: intervalEnd,
      };
    } else {
      // extend the existing interval:
      currentInterval.toMoment = intervalEnd;
    }
  }
  if (currentInterval !== null) {
    intervals.push(currentInterval);
  }

  return intervals;
}
