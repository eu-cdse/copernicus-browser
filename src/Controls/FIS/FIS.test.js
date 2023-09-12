import { constructCSVFromData } from './FIS.utils';

const obj1 = {
  someBand: [
    { date: new Date('1919-05-08T01:00:00.000+02:00'), udi: 0 },
    { date: new Date('2007-12-20T01:00:00.000+02:00'), udi: 1 },
  ],
  anotherBand: [
    { date: new Date('1964-05-13T01:00:00.000+02:00'), udi: 0 },
    { date: new Date('1979-07-01T01:00:00.000+02:00'), udi: 1 },
  ],
};
const dropColumns1 = [];
const csv1 =
  'someBand/date,someBand/udi,anotherBand/date,anotherBand/udi\n1919-05-07T23:00:00.000Z,0,1964-05-12T23:00:00.000Z,0\n2007-12-19T23:00:00.000Z,1,1979-06-30T23:00:00.000Z,1';

const obj2 = { someBand: [{ date: new Date(1965, 11, 11), uk: 0 }] };
const dropColumns2 = ['date', 'uk'];
const csv2 = '\n';

test.each([
  [obj1, dropColumns1, csv1],
  [obj2, dropColumns2, csv2],
])('Test CSV generating function', (data, dropColumns, expectedCSV) => {
  const csv = constructCSVFromData(data, dropColumns);
  expect(csv).toBe(expectedCSV);
});
