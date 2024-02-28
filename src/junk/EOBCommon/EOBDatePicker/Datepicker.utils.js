import moment from 'moment';

export const isNextMonthAvailable = (maxDate, selectedDay) => {
  const currentMoment = moment(selectedDay);
  const lastAvailableMoment = moment(maxDate);

  const currentYear = currentMoment.year();
  const lastAvailableYear = lastAvailableMoment.year();

  // check if we can go forward another year
  if (lastAvailableYear - currentYear > 0) {
    return true;
  }

  // if this is the last year, check if another month is available
  return lastAvailableMoment.month() - currentMoment.month() > 0;
};

export const isPreviousMonthAvailable = (minDate, selectedDay) => {
  const currentMoment = moment(selectedDay);
  const firstAvailableMoment = moment(minDate);

  const currentYear = currentMoment.year();
  const firstAvailableYear = firstAvailableMoment.year();

  // check if we can go back another year
  if (currentYear - firstAvailableYear > 0) {
    return true;
  }

  // if this is the last year, check if another month is available
  return currentMoment.month() - firstAvailableMoment.month() > 0;
};

export const getAvailableYears = (fromDate, toDate) => {
  const fromDateMoment = moment(fromDate);
  const toDateMoment = moment(toDate);

  const years = [];
  for (let i = fromDateMoment.year(); i <= toDateMoment.year(); i += 1) {
    years.push(i);
  }

  return years;
};
