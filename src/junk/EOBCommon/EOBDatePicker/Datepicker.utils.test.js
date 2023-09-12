import { getAvailableYears, isNextMonthAvailable, isPreviousMonthAvailable } from './Datepicker.utils';

describe('isNextMonthAvailable', () => {
  it('should return true when the last available month is after the currently selected month', () => {
    const maxDate = new Date('03-03-2020');
    const selectedDay = new Date('02-02-2020');
    const isAvailable = isNextMonthAvailable(maxDate, selectedDay);
    expect(isAvailable).toBe(true);
  });

  it('should return false when the last available month is the same as the currently selected month', () => {
    const maxDate = new Date('02-02-2020');
    const selectedDay = new Date('02-02-2020');
    const isAvailable = isNextMonthAvailable(maxDate, selectedDay);
    expect(isAvailable).toBe(false);
  });

  it('should return false when the last available month is before the currently selected month', () => {
    const maxDate = new Date('01-01-2020');
    const selectedDay = new Date('02-02-2020');
    const isAvailable = isNextMonthAvailable(maxDate, selectedDay);
    expect(isAvailable).toBe(false);
  });
});

describe('isPreviousMonthAvailable', () => {
  it('should return true when the first available month is before the currently selected month', () => {
    const minDate = new Date('01-01-2020');
    const selectedDay = new Date('02-02-2020');
    const isAvailable = isPreviousMonthAvailable(minDate, selectedDay);
    expect(isAvailable).toBe(true);
  });

  it('should return false when the first available month is the same as the currently selected month', () => {
    const minDate = new Date('02-02-2020');
    const selectedDay = new Date('02-02-2020');
    const isAvailable = isPreviousMonthAvailable(minDate, selectedDay);
    expect(isAvailable).toBe(false);
  });

  it('should return false when the first available month is after the currently selected month', () => {
    const minDate = new Date('03-03-2020');
    const selectedDay = new Date('02-02-2020');
    const isAvailable = isPreviousMonthAvailable(minDate, selectedDay);
    expect(isAvailable).toBe(false);
  });
});

describe('getAvailableYears', () => {
  it('should return an array of available years', () => {
    const fromDate = new Date('01-01-2019');
    const toDate = new Date('01-01-2021');

    const availableYears = getAvailableYears(fromDate, toDate);
    expect(availableYears).toEqual([2019, 2020, 2021]);
  });

  it('should return only the current year when min and max date are in the same year', () => {
    const fromDate = new Date('01-01-2019');
    const toDate = new Date('01-01-2019');

    const availableYears = getAvailableYears(fromDate, toDate);
    expect(availableYears).toEqual([2019]);
  });

  it('should return an empty array when from date is after toDate', () => {
    const fromDate = new Date('01-01-2022');
    const toDate = new Date('01-01-2021');

    const availableYears = getAvailableYears(fromDate, toDate);
    expect(availableYears).toEqual([]);
  });
});
