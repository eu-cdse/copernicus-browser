import { getAllMissions, getRrdCollectionId } from './api.utils';

const fixtures: [string, string, boolean, number][] = [
  ['TerraSAR-X/TanDEM-X', 'TDX-1', false, 1],
  ['TerraSAR-X/TanDEM-X', 'TDX-1', true, 1],
  ['TerraSAR-X/TanDEM-X', 'TSX-1', false, 1],
  ['TerraSAR-X/TanDEM-X', 'TSX-1', true, 1],
  ['COSMO-SkyMed (I Generation)', 'CSK1', false, 3],
  ['COSMO-SkyMed (I Generation)', 'CSK1', true, 3],
  ['COSMO-SkyMed (II Generation)', 'CSG1', false, 4],
  ['COSMO-SkyMed (II Generation)', 'CSG1', true, 4],
  ['Worldview', 'GE01', false, 5],
  ['Worldview', 'WV04', false, 9],
  ['ICEYE', 'ICEYE-X2', false, 10],
  ['ICEYE', 'ICEYE-X2', true, 10],
  ['ICEYE', 'ICEYE-X200', false, 10],
  ['planetscope', 'planetscope', false, 11],
  ['planetscope', 'planetscope', true, 11],
  ['skysat', 'skysat', false, 12],
  ['skysat', 'skysat', true, 12],
  ['RADARSAT', 'RS02', false, 13],
  ['RADARSAT', 'RS02', true, 13],
  ['Worldview', 'GE01', true, 14],
  ['Legion', 'LG01', true, 14],
  ['Legion', 'LG02', true, 14],
  ['Legion', 'LG03', true, 14],
  ['Legion', 'LG04', true, 14],
  ['Legion', 'LG05', true, 14],
  ['Legion', 'LG06', true, 14],
  ['PAZ', 'PAZ-1', false, 15],
  ['PAZ', 'PAZ-1', true, 15],
  ['SPOT', 'SPOT6', false, 16],
  ['PHR', 'PHR1A', false, 17],
  ['PHR', 'PHR1B', false, 17],
  ['PNEO', 'PNEO4', false, 18],
  ['GHGSat', 'GHGSat-C4', false, 19],
  ['GHGSat', 'GHGSat-C1', false, 19],
  ['Legion', 'LG01', false, 20],
  ['GEOSAT', 'GEOSAT2', false, 2],
  ['GEOSAT', 'GEOSAT2', true, 2],
];

describe("'add' utility", () => {
  test.each(fixtures)(
    'getRrdCollectionId(%p, %p, isTasking=%p) returns %p',
    (constellation, platform, isTasking, expectedResult) => {
      const result = getRrdCollectionId(constellation, platform, isTasking);
      expect(result).toEqual(expectedResult);
    },
  );
});

describe('getRrdCollectionId config-driven mode correctness', () => {
  it('never resolves to a mission that does not support the requested mode', () => {
    const allMissions = getAllMissions();
    allMissions.forEach((mission) => {
      mission.stacConstellation.forEach((constellation) => {
        mission.stacPlatform.forEach((platform) => {
          [true, false].forEach((isTasking) => {
            const id = getRrdCollectionId(constellation, platform, isTasking);
            if (id !== -1) {
              const resolvedMission = allMissions.find((m) => m.id === id);
              const modeKey = isTasking ? 'taskingSupported' : 'archiveSupported';
              expect(resolvedMission?.[modeKey]).toBe(true);
            }
          });
        });
      });
    });
  });

  it('returns -1 for PNEO in tasking mode', () => {
    expect(getRrdCollectionId('PNEO', 'PNEO', true)).toBe(-1);
    expect(getRrdCollectionId('PNEO', 'PNEO3', true)).toBe(-1);
    expect(getRrdCollectionId('PNEO', 'PNEO4', true)).toBe(-1);
  });
});
