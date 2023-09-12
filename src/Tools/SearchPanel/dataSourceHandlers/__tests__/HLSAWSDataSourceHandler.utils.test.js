import { AWS_HLS, AWS_HLS_LANDSAT, AWS_HLS_SENTINEL } from '../dataSourceConstants';
import { HLSConstellation } from '@sentinel-hub/sentinelhub-js';
import { getConstellationFromCollectionList } from '../HLSAWSDataSourceHandler.utils';

describe('getConstellationFromCollectionList', () => {
  test.each([
    [null, null],
    [undefined, null],
    [[], null],
    [[AWS_HLS], null],
    [[AWS_HLS_LANDSAT], HLSConstellation.LANDSAT],
    [[AWS_HLS_SENTINEL], HLSConstellation.SENTINEL],
    [[AWS_HLS_LANDSAT, AWS_HLS_SENTINEL], null],
    [[AWS_HLS_LANDSAT, AWS_HLS_SENTINEL, AWS_HLS], null],
    [[AWS_HLS_LANDSAT, AWS_HLS], null],
    [[AWS_HLS_SENTINEL, AWS_HLS], null],
    [[AWS_HLS_LANDSAT, AWS_HLS_SENTINEL, AWS_HLS, 'Unknown'], null],
    [[AWS_HLS, 'Unknown'], null],
    [[AWS_HLS, AWS_HLS_LANDSAT, 'Unknown'], null],
    [[AWS_HLS_LANDSAT, 'Unknown'], HLSConstellation.LANDSAT],
    [[AWS_HLS_SENTINEL, 'Unknown'], HLSConstellation.SENTINEL],
    [['Unknown'], null],
  ])('get correct constellation', (collectionList, expectedCollection) => {
    expect(getConstellationFromCollectionList(collectionList)).toEqual(expectedCollection);
  });
});
