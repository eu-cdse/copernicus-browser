import { PlanetNicfiLayer } from '@sentinel-hub/sentinelhub-js';
import moment from 'moment';

import { getLayersWithDate, getNewLayerFromSimiliarLayerId } from '../planetNicfi.utils';

jest.mock('../dataSourceHandlers', () => ({
  getDataSourceHandler: jest.fn(),
}));

const LAYERS_IDS = [
  'TRUE_COLOR_2021-10_mosaic',
  'TRUE_COLOR_2021-09_mosaic',
  'TRUE_COLOR_2020-06_2020-08_mosaic',
  'TRUE_COLOR_2020-02_2020-05_mosaic',
  'NDVI_2021-10_mosaic',
  'NDVI_2021-09_mosaic',
  'NDVI_2020-06_2020-08_mosaic',
  'NDVI_2020-02_2020-05_mosaic',
];

const layers = LAYERS_IDS.map((layerId) => new PlanetNicfiLayer({ layerId: layerId }));

const cases = [
  ['2021-10-30', 'NDVI_2021-09_mosaic', new PlanetNicfiLayer({ layerId: 'NDVI_2021-10_mosaic' })],
  [
    '2020-08-30',
    'NDVI_2020-02_2020-05_mosaic',
    new PlanetNicfiLayer({ layerId: 'NDVI_2020-06_2020-08_mosaic' }),
  ],
  ['2022-01-30', 'NDVI_2021-09_mosaic', undefined],
  ['2020-08-30', 'FALSE_COLOR_2021-09_mosaic', undefined],
];

describe('Test: find layer from list by date and selected layerId', () => {
  test.each(cases)(
    'given %p and %p as arguments, returns %p',
    (selectedDate, selectedLayerId, expectedResult) => {
      const layersWithSelectedDate = getLayersWithDate(layers, moment(selectedDate).endOf('day'));
      const sameLayerAtDate = getNewLayerFromSimiliarLayerId(layersWithSelectedDate, selectedLayerId);
      expect(sameLayerAtDate).toEqual(expectedResult);
    },
  );
});
