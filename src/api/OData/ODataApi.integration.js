import moment from 'moment';
import { oDataApi } from './ODataApi';
import oDataHelpers from './ODataHelpers';
import { ODataEntity } from './ODataTypes';

const TIMEOUT = 10000;

const getQueryParams = ({ fromTime, toTime, orbitDirection, geometry, datasetId }) => {
  const params = {};

  if (fromTime) {
    params['fromTime'] = moment.utc(fromTime).toDate().toISOString();
  }
  if (toTime) {
    params['toTime'] = moment.utc(toTime).toDate().toISOString();
  }
  if (orbitDirection) {
    params['orbitDirection'] = orbitDirection;
  }

  if (geometry) {
    params['geometry'] = geometry;
  }
  params['datasetId'] = datasetId;

  return params;
};

describe('ODataApi', () => {
  jest.setTimeout(TIMEOUT);

  test('search', async () => {
    const params = getQueryParams({
      fromTime: '2023-05-28T00:00:00.000Z',
      toTime: '2023-05-28T23:59:59.999Z',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [10.5, 43.7],
            [10.5, 43.9],
            [10.7, 43.9],
            [10.7, 43.7],
            [10.5, 43.7],
          ],
        ],
      },
      datasetId: 'S2_L2A_CDAS',
    });

    const data = await oDataApi.search(ODataEntity.Products, oDataHelpers.createBasicSearchQuery(params));
    expect(data).toBeTruthy();
  });
});
