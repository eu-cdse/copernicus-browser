import moment from 'moment';
import { ODATA_SEARCH_ERROR_MESSAGE, useODataSearch } from './useODataSearch';
import { act, renderHook, waitFor } from '@testing-library/react';
import oDataHelpers, { PAGE_SIZE } from '../api/OData/ODataHelpers';
import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { oDataApi } from '../api/OData/ODataApi';
import * as stacSearch from './stacAvailability';

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

describe('useODataSearch no-results behavior', () => {
  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('keeps a stable no-results message and exposes availability separately', async () => {
    jest.spyOn(oDataApi, 'search').mockResolvedValue({ value: [] });
    const getAvailabilityInfoSpy = jest
      .spyOn(stacSearch, 'getAvailabilityInfo')
      .mockResolvedValue('Available data:\nSENTINEL-2 L2A: 2021-01-01 to 2021-12-31');

    const { result } = renderHook(() => useODataSearch());
    const query = {
      options: [{ key: 'filter', value: "(Collection/Name eq 'SENTINEL-2')" }],
      skip: jest.fn(),
    };

    act(() => {
      result.current[2]('TOKEN');
      result.current[1](query);
    });

    await waitFor(() => {
      expect(result.current[0].searchError).toBeTruthy();
    });

    expect(result.current[0].searchError.message).toBe(ODATA_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND);
    expect(result.current[0].searchError.availabilityMessage).toContain('Available data:');
    expect(getAvailabilityInfoSpy).toHaveBeenCalledWith("(Collection/Name eq 'SENTINEL-2')", 'TOKEN');
  });

  it('returns plain no-results error when availability info is null', async () => {
    jest.spyOn(oDataApi, 'search').mockResolvedValue({ value: [] });
    jest.spyOn(stacSearch, 'getAvailabilityInfo').mockResolvedValue(null);

    const { result } = renderHook(() => useODataSearch());
    const query = {
      options: [{ key: 'filter', value: "(Collection/Name eq 'SENTINEL-1')" }],
      skip: jest.fn(),
    };

    act(() => {
      result.current[1](query);
    });

    await waitFor(() => {
      expect(result.current[0].searchError).toBeTruthy();
    });

    expect(result.current[0].searchError.message).toBe(ODATA_SEARCH_ERROR_MESSAGE.NO_PRODUCTS_FOUND);
    expect(result.current[0].searchError.availabilityMessage).toBeUndefined();
  });
});

describe('useODataSearch hydrate', () => {
  const fakeResults = [{ id: 'product-1' }, { id: 'product-2' }];
  const fakeQuery = { skip: jest.fn().mockReturnThis(), options: [] };

  afterEach(() => {
    jest.restoreAllMocks();
    // jest.restoreAllMocks() only resets spies; fakeQuery.skip is a jest.fn()
    // shared across tests, so clear its accumulated calls explicitly.
    fakeQuery.skip.mockClear();
  });

  it('emits oDataSearchResult with seeded allResults, totalCount, hasMore, page and a callable next', async () => {
    jest.spyOn(oDataApi, 'search').mockResolvedValue({ value: [] });

    const { result } = renderHook(() => useODataSearch());

    act(() => {
      result.current[3]({
        query: fakeQuery,
        results: fakeResults,
        page: 2,
        totalCount: 150,
        hasMore: true,
      });
    });

    await waitFor(() => {
      expect(result.current[0].oDataSearchResult).not.toBeNull();
    });

    const hydrated = result.current[0].oDataSearchResult;
    expect(hydrated.allResults).toEqual(fakeResults);
    expect(hydrated.page).toBe(2);
    expect(hydrated.totalCount).toBe(150);
    expect(hydrated.hasMore).toBe(true);
    expect(typeof hydrated.next).toBe('function');
  });

  it('calling next() after hydrate issues exactly one search with skip = PAGE_SIZE * (page + 1)', async () => {
    const searchSpy = jest.spyOn(oDataApi, 'search').mockResolvedValue({
      value: Array.from({ length: 1 }, (_, i) => ({ Id: `p${i}`, Name: `p${i}`, Footprint: null })),
      '@odata.count': 151,
    });

    const { result } = renderHook(() => useODataSearch());

    act(() => {
      result.current[3]({
        query: fakeQuery,
        results: fakeResults,
        page: 2,
        totalCount: 150,
        hasMore: true,
      });
    });

    await waitFor(() => {
      expect(result.current[0].oDataSearchResult).not.toBeNull();
    });

    expect(searchSpy).not.toHaveBeenCalled();

    await act(async () => {
      await result.current[0].oDataSearchResult.next();
    });

    expect(searchSpy).toHaveBeenCalledTimes(1);
    expect(fakeQuery.skip).toHaveBeenCalledWith(PAGE_SIZE * 3);
  });

  it('hydrate itself triggers zero oDataApi.search calls', async () => {
    const searchSpy = jest.spyOn(oDataApi, 'search').mockResolvedValue({ value: [] });

    const { result } = renderHook(() => useODataSearch());

    act(() => {
      result.current[3]({
        query: fakeQuery,
        results: fakeResults,
        page: 0,
        totalCount: 2,
        hasMore: false,
      });
    });

    await waitFor(() => {
      expect(result.current[0].oDataSearchResult).not.toBeNull();
    });

    expect(searchSpy).not.toHaveBeenCalled();
  });
});
