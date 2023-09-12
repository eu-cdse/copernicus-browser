import { isOnEqualDate, constructTimespanString } from './Pin.utils';

describe('isOnEqualDate', () => {
  it('should return true when both dates are on the same date', () => {
    const date1 = '2019-08-17T00:00:00.000Z';
    const date2 = '2019-08-17T23:59:59.999Z';
    const isEqualDate = isOnEqualDate(date1, date2);
    expect(isEqualDate).toBe(true);
  });

  it('should return false when both dates have the same day but different months and years', () => {
    const date1 = '2019-08-17T00:00:00.000Z';
    const date2 = '2020-10-17T23:59:59.999Z';
    const isEqualDate = isOnEqualDate(date1, date2);
    expect(isEqualDate).toBe(false);
  });

  it('should return false when both dates have the same day and month but different years', () => {
    const date1 = '2019-08-17T00:00:00.000Z';
    const date2 = '2020-08-17T23:59:59.999Z';
    const isEqualDate = isOnEqualDate(date1, date2);
    expect(isEqualDate).toBe(false);
  });
});

describe('constructTimespanString', () => {
  it('should return a string with timespan of dates when fromTime and toTime are not on the same date', () => {
    const testPin = {
      fromTime: '2019-08-17T00:00:00.000Z',
      toTime: '2019-08-18T23:59:59.999Z',
    };

    const date = constructTimespanString(testPin);
    expect(date).toEqual('2019-08-17 - 2019-08-18');
  });

  it('should return a single date string when the dates are on the same day', () => {
    const testPin = {
      fromTime: '2019-08-18T00:00:00.000Z',
      toTime: '2019-08-18T23:59:59.999Z',
    };
    const date = constructTimespanString(testPin);
    expect(date).toEqual('2019-08-18');
  });

  it('should return a single date string when only toTime is passed', () => {
    const testPin = {
      toTime: '2019-08-18T23:59:59.999Z',
    };
    const date = constructTimespanString(testPin);
    expect(date).toEqual('2019-08-18');
  });

  it('should return null when fromTime and toTime are not defined', () => {
    const testPin = {};
    const date = constructTimespanString(testPin);
    expect(date).toEqual(null);
  });

  it('should return null when a pin is not passed', () => {
    const date = constructTimespanString();
    expect(date).toBe(null);
  });
});
