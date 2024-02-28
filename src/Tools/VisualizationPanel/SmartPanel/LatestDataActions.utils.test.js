import { getQuarterlyInfo } from './LatestDataAction.utils'; // Adjust the import path accordingly

describe('getQuarterlyInfo with specific test dates', () => {
  it.each([
    ['Sun Jan 01 2023 00:00:00 GMT+0000', 'Jan - Mar 2023'],
    ['Mon Apr 01 2023 00:00:00 GMT+0000', 'Apr - Jun 2023'],
    ['Tue Jul 01 2023 00:00:00 GMT+0000', 'Jul - Sep 2023'],
    ['Fri Oct 01 2023 00:00:00 GMT+0000', 'Oct - Dec 2023'],
    ['Wed Jan 01 2024 00:00:00 GMT+0000', 'Jan - Mar 2024'],
    ['Sat Apr 01 2024 15:00:00 GMT+0000', 'Apr - Jun 2024'],
    ['Thu Jul 01 2024 23:59:59 GMT+0000', 'Jul - Sep 2024'],
    ['Sun Oct 01 2024 12:00:00 GMT+0000', 'Oct - Dec 2024'],
    ['test', 'latest'],
    [null, 'latest'],
  ])('correctly identifies the quarter for %s as %s', (dateString, expected) => {
    expect(getQuarterlyInfo(dateString)).toBe(expected);
  });
});
