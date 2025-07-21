import { getRrdCollectionId } from './api.utils';

const fixtures = [
  // ['planetscope', 'planetscope', false, 11],
  ['TerraSAR-X/TanDEM-X', 'TDX-1', false, 1],
  ['Worldview', 'GE01', true, 14],
  ['Legion', 'LG01', true, 14],
  ['Worldview', 'WV04', false, 9],
  ['Worldview', 'GE01', false, 5],
  // ['SPOT', 'SPOT6', false, 16],
  ['PAZ', 'PAZ-1', false, 15],
  ['Legion', 'LG01', false, 20],
  ['GHGSat', 'GHGSat-C4', false, 19],
  ['GHGSat', 'GHGSat-C1', false, 19],
  ['ICEYE', 'ICEYE-X2', false, 10],
  ['ICEYE', 'ICEYE-X200', false, 10],
];

describe("'add' utility", () => {
  test.each(fixtures)(
    'given %p and %p as arguments, returns %p',
    (constellation, platform, isTasking, expectedResult) => {
      const result = getRrdCollectionId(constellation, platform, isTasking);
      expect(result).toEqual(expectedResult);
    },
  );
});
