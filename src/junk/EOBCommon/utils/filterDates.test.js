import moment from 'moment';
import { applyFilterMonthsToDateRange } from './filterDates';

// moment.js dates are not being compared properly, so we use this function to avoid
// having to change them just for tests:
function expectToEqual(actual, expected) {
  const actualForComparing = actual.map((a) => ({
    fromMoment: a.fromMoment.format(),
    toMoment: a.toMoment.format(),
  }));
  const expectedForComparing = expected.map((a) => ({
    fromMoment: a.fromMoment.format(),
    toMoment: a.toMoment.format(),
  }));
  expect(actualForComparing).toEqual(expectedForComparing);
}

test('no filtering', () => {
  const fromMoment = moment.utc('2017-05-01T00:00:00');
  const toMoment = moment.utc('2019-11-11T11:11:11');
  const filterMonths = null;
  const expected = [
    { fromMoment: moment.utc('2017-05-01T00:00:00'), toMoment: moment.utc('2019-11-11T11:11:11') },
  ];
  const actual = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths);
  expectToEqual(actual, expected);
});

test('filter a single month', () => {
  const fromMoment = moment.utc('2017-05-01T00:00:00');
  const toMoment = moment.utc('2018-11-11T11:11:11');
  const filterMonths = [0];
  const expected = [
    {
      fromMoment: moment.utc('2018-01-01T00:00:00'),
      toMoment: moment.utc('2018-01-31T23:59:59.999'),
    },
  ];
  const actual = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths);
  expectToEqual(actual, expected);
});

test('merging of months', () => {
  const fromMoment = moment.utc('2017-05-01T00:00:00');
  const toMoment = moment.utc('2019-11-11T11:11:11');
  const filterMonths = [0, 1, 2];
  const expected = [
    { fromMoment: moment.utc('2018-01-01T00:00:00'), toMoment: moment.utc('2018-03-31T23:59:59') },
    { fromMoment: moment.utc('2019-01-01T00:00:00'), toMoment: moment.utc('2019-03-31T23:59:59') },
  ];
  const actual = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths);
  expectToEqual(actual, expected);
});

test('multiple ranges within a year', () => {
  const fromMoment = moment.utc('2017-05-01T00:00:00');
  const toMoment = moment.utc('2019-11-11T11:11:11');
  const filterMonths = [0, 1, 2, 4, 5];
  const expected = [
    { fromMoment: moment.utc('2017-05-01T00:00:00'), toMoment: moment.utc('2017-06-30T23:59:59') },
    { fromMoment: moment.utc('2018-01-01T00:00:00'), toMoment: moment.utc('2018-03-31T23:59:59') },
    { fromMoment: moment.utc('2018-05-01T00:00:00'), toMoment: moment.utc('2018-06-30T23:59:59') },
    { fromMoment: moment.utc('2019-01-01T00:00:00'), toMoment: moment.utc('2019-03-31T23:59:59') },
    { fromMoment: moment.utc('2019-05-01T00:00:00'), toMoment: moment.utc('2019-06-30T23:59:59') },
  ];
  const actual = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths);
  expectToEqual(actual, expected);
});

test('new years', () => {
  const fromMoment = moment.utc('2017-05-01T00:00:00');
  const toMoment = moment.utc('2019-10-11T11:11:11');
  const filterMonths = [0, 1, 2, 10, 11];
  const expected = [
    { fromMoment: moment.utc('2017-11-01T00:00:00'), toMoment: moment.utc('2018-03-31T23:59:59') },
    { fromMoment: moment.utc('2018-11-01T00:00:00'), toMoment: moment.utc('2019-03-31T23:59:59') },
  ];
  const actual = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths);
  expectToEqual(actual, expected);
});

test('break from / to if it overlaps', () => {
  const fromMoment = moment.utc('2017-05-01T00:00:00');
  const toMoment = moment.utc('2017-11-11T11:11:11');
  const filterMonths = [0, 1, 2, 3, 4, 5, 9, 10, 11];
  const expected = [
    { fromMoment: moment.utc('2017-05-01T00:00:00'), toMoment: moment.utc('2017-06-30T23:59:59') },
    { fromMoment: moment.utc('2017-10-01T00:00:00'), toMoment: moment.utc('2017-11-11T11:11:11') },
  ];
  const actual = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths);
  expectToEqual(actual, expected);
});

test('empty result', () => {
  const fromMoment = moment.utc('2017-05-01T00:00:00');
  const toMoment = moment.utc('2017-09-30T23:59:50');
  const filterMonths = [9, 10, 11];
  const expected = [];
  const actual = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths);
  expectToEqual(actual, expected);
});

test('short interval, start and end date are in different months', () => {
  const fromMoment = moment.utc('2019-11-26T00:00:00');
  const toMoment = moment.utc('2019-12-05T23:59:50');
  const filterMonths = [9, 10, 11];
  const expected = [
    { fromMoment: moment.utc('2019-11-26T00:00:00'), toMoment: moment.utc('2019-12-05T23:59:50') },
  ];
  const actual = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths);
  expectToEqual(actual, expected);
});

test('properly handle mixing local and utc dates', () => {
  // This tests a fix for a bug in EO Browser:
  //   - set from/to date to 2017-11-24 / 2019-12-24
  //   - set "filter by months" to January
  // Instead of just two intervals (Jan 2018 and Jan 2019), a third (invalid) interval will also be returned:
  //   - from 2020-01-01 to 2019-12-24
  // The reason is that fromMoment is a local date and toMoment is an UTC date, which caused months traversal to fail.
  const fromMoment = moment('2017-11-20T00:00:00+01:00');
  const toMoment = moment.utc('2019-12-30T23:59:59');
  const filterMonths = [0];
  const expected = [
    { fromMoment: moment.utc('2018-01-01T00:00:00'), toMoment: moment.utc('2018-01-31T23:59:59') },
    { fromMoment: moment.utc('2019-01-01T00:00:00'), toMoment: moment.utc('2019-01-31T23:59:59') },
  ];
  const actual = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths);
  expectToEqual(actual, expected);
});
