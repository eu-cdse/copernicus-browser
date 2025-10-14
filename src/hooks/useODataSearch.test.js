import moment from 'moment';
import { useODataSearch } from './useODataSearch';
import { act, renderHook, waitFor } from '@testing-library/react';
import oDataHelpers from '../api/OData/ODataHelpers';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';

const mockNetwork = new MockAdapter(axios);

describe('useODataSearch with auth token', () => {
  const params = {
    fromTime: moment.utc('2023-05-28T00:00:00.000Z').toDate().toISOString(),
    toTime: moment.utc('2023-05-28T23:59:59.999Z').toDate().toISOString(),
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
  };

  const authToken = 'TOKEN';

  beforeEach(() => {
    mockNetwork.reset();
    mockNetwork.onAny().reply(200, {});
  });

  test('search without auth token', async () => {
    const { result } = renderHook(() => useODataSearch());

    act(() => {
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });

    await waitFor(() => {
      expect(mockNetwork.history.get.length).toBeGreaterThan(0);
    });

    expect(mockNetwork.history.get[0].headers.Authorization).toBe(undefined);
  });

  test('search with auth token', async () => {
    const { result } = renderHook(() => useODataSearch());

    act(() => {
      result.current[2](authToken);
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });

    await waitFor(() => {
      expect(mockNetwork.history.get.length).toBeGreaterThan(0);
    });

    expect(mockNetwork.history.get[0].headers.Authorization).toBe(`Bearer ${authToken}`);

    act(() => {
      result.current[2](null);
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });

    await waitFor(() => {
      expect(mockNetwork.history.get.length).toBeGreaterThan(1);
    });

    expect(mockNetwork.history.get[1].headers.Authorization).toBe(undefined);
  });
});
