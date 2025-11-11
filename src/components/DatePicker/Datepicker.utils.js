import moment from 'moment';
import { DEFAULT_CLOUD_COVER_PERCENT } from '../../const';

export const YYYY_MM_REGEX = /\d{4}-\d{2}/g;

export const isNextMonthAvailable = (maxDate, selectedDay) => {
  if (!selectedDay) {
    return false;
  }

  return selectedDay.clone().add(1, 'month').startOf('month').utc(true) <= maxDate.utc(true);
};

export const isPreviousMonthAvailable = (minDate, selectedDay) => {
  if (!selectedDay) {
    return false;
  }
  return selectedDay.clone().subtract(1, 'month').endOf('month').utc(true) >= minDate.utc(true);
};

export const getAvailableYears = (fromDate, toDate) => {
  const years = [];
  for (let i = fromDate.year(); i <= toDate.year(); i += 1) {
    years.push(i);
  }

  return years;
};

export const getAvailableMonths = (allMonths, minDate, maxDate, selectedDay) => {
  minDate = selectedDay ? moment.max(minDate, selectedDay.clone().startOf('year')) : minDate;
  maxDate = selectedDay ? moment.min(maxDate, selectedDay.clone().endOf('year')) : maxDate;

  let months = [];
  for (let i = minDate.get('month'); i <= maxDate.get('month'); i++) {
    months.push({ label: allMonths[i], value: i });
  }
  return months;
};

export const momentToDateWithUTCValues = (momentObj) => {
  // Date objects automatically set the timezone to user's local time.
  // Moment object with UTC 2021-01-01 00:00 will therefore become e.g. 2020-12-31 17:00 GMT-0700 (Mountain Standard Time)
  // react-daypicker will therefore render 2020-12-31 instead of 2021-01-01
  // Here we therefore set UTC values in the Date object
  // Note: the timezone is still present, so converting it back to moment directly will take it into account and will be incorrect
  function setUTCValuesInDate(date) {
    return new Date(
      date.getUTCFullYear(),
      date.getUTCMonth(),
      date.getUTCDate(),
      date.getUTCHours(),
      date.getUTCMinutes(),
      date.getUTCSeconds(),
    );
  }
  return setUTCValuesInDate(momentObj.clone().utc().toDate());
};

function orderAvailableDates(availableDays, direction, selectedDay) {
  if (direction === 'prev') {
    availableDays = availableDays.sort((a, b) => b.date.diff(a.date));
    const dateLimit = selectedDay.clone().startOf('day');
    availableDays = availableDays.filter((d) => d.date.isBefore(dateLimit));
  }
  if (direction === 'next') {
    availableDays = availableDays.sort((a, b) => a.date.diff(b.date));
    const dateLimit = selectedDay.clone().endOf('day');
    availableDays = availableDays.filter((d) => d.date.isAfter(dateLimit));
  }
  return availableDays;
}

function filterDatesOutsideTemporalExtent(availableDays, minDate, maxDate) {
  return availableDays.filter(
    (d) =>
      (minDate ? d.date.isSameOrAfter(minDate) : true) && (maxDate ? d.date.isSameOrBefore(maxDate) : true),
  );
}

export async function getNextBestDate({
  selectedDay,
  direction,
  maxCC = DEFAULT_CLOUD_COVER_PERCENT,
  fetchDatesInRange,
  minDate,
  maxDate,
  maxSearchIterations,
}) {
  let availableDays;

  // If fetchDatesInRange is provided, use expanding window approach
  if (fetchDatesInRange) {
    let searchedUpTo = selectedDay.clone(); // Track how far we've searched

    for (let nMonths = 0; nMonths <= maxSearchIterations; nMonths++) {
      // Calculate the search window with exponential expansion (3^n)
      // nMonths = 0: 1 month (3^0)
      // nMonths = 1: 3 months (3^1)
      // nMonths = 2: 9 months (3^2)
      // nMonths = 3: 27 months (3^3)
      // nMonths = 4: 81 months (3^4), etc.
      const searchRange = Math.pow(3, nMonths);

      let fromDate, toDate;
      if (direction === 'prev') {
        // Search from searchedUpTo going backwards
        toDate = searchedUpTo.clone().subtract(1, 'day').endOf('month');
        fromDate = toDate.clone().subtract(searchRange, 'months').add(1, 'month').startOf('month');
        // Update searchedUpTo for next iteration
        searchedUpTo = fromDate.clone();
      } else {
        // Search from searchedUpTo going forwards
        fromDate = searchedUpTo.clone().add(1, 'day').startOf('month');
        toDate = fromDate.clone().add(searchRange, 'months').subtract(1, 'month').endOf('month');
        // Update searchedUpTo for next iteration
        searchedUpTo = toDate.clone();
      }

      // Clamp to minDate/maxDate boundaries
      if (minDate && fromDate.isBefore(minDate)) {
        fromDate = minDate.clone();
      }
      if (maxDate && toDate.isAfter(maxDate)) {
        toDate = maxDate.clone();
      }

      // Check if search window is outside temporal extent
      if ((minDate && toDate.isBefore(minDate)) || (maxDate && fromDate.isAfter(maxDate))) {
        break;
      }

      availableDays = await fetchDatesInRange(fromDate, toDate);
      availableDays = filterDatesOutsideTemporalExtent([...availableDays], minDate, maxDate);

      availableDays = orderAvailableDates([...availableDays], direction, selectedDay);
      for (let day of availableDays) {
        if (day.cloudCoverPercent === null || day.cloudCoverPercent <= maxCC) {
          return day.date;
        }
      }
    }
  }

  return selectedDay.clone();
}

export function checkAndSetWithinAvailableRange(date, minDate, maxDate) {
  if (minDate && date < minDate) {
    date = minDate.clone();
  }
  if (maxDate && date > maxDate) {
    date = maxDate.clone();
  }
  return date;
}

/**
 * Fetches available days for a date range by iterating through each month in the range.
 *
 * @param {Object} params - The parameters object
 * @param {moment.Moment} params.fromDate - Start date of the range
 * @param {moment.Moment} params.toDate - End date of the range
 * @param {Function} params.fetchDatesForMonth - Function to fetch dates for a single month
 * @returns {Promise<Array>} Combined array of all dates in the range
 */
export async function fetchAvailableDaysInRange({ fromDate, toDate, fetchDatesForMonth }) {
  let allDates = [];
  let currentDate = fromDate.clone().startOf('month');
  const endDate = toDate.clone().endOf('month');

  while (currentDate.isSameOrBefore(endDate, 'month')) {
    const monthDates = await fetchDatesForMonth(currentDate);
    allDates = allDates.concat(monthDates);
    currentDate.add(1, 'month');
  }

  return allDates;
}
