import moment from 'moment';
import { isTimespanModeSelected } from './VisualizationPanel.utils';

describe('isTimespanModeSelected', () => {
  test.each([
    [null, null, false],
    [undefined, undefined, false],
    [moment.utc('2023-08-25').startOf('day'), moment.utc('2023-08-25').endOf('day'), false],
    [moment.utc('2023-08-25T00:00:00Z'), moment.utc('2023-08-25T23:59:59.999Z'), false],
    ['2023-08-25T00:00:00.000Z', '2023-08-25T23:59:59.999Z', false],
    [new Date(Date.UTC(2023, 7, 25, 0, 0, 0, 0)), new Date(Date.UTC(2023, 7, 25, 23, 59, 59, 999)), false],

    [moment.utc('2023-08-25').startOf('day'), moment.utc('2023-08-25T12:00:00Z'), true],
    [moment.utc('2023-07-25'), moment.utc('2023-08-25'), true],
    [moment.utc('2023-08-25T10:00:00Z'), moment.utc('2023-08-25T12:00:00Z'), true],
    ['2023-08-25T10:00:00Z', '2023-08-25T12:00:00Z', true],
    [new Date(Date.UTC(2023, 7, 25, 10, 0, 0, 0)), new Date(Date.UTC(2023, 7, 25, 12, 0, 0, 0)), true],
  ])('isTimespanModeSelected %p %p %p', (fromTime, toTime, expected) => {
    expect(isTimespanModeSelected(fromTime, toTime)).toBe(expected);
  });
});
