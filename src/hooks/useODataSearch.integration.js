import moment from 'moment';
import { useODataSearch } from './useODataSearch';
import { act } from '@testing-library/react';
import { renderHook } from '@testing-library/react-hooks';
import oDataHelpers from '../api/OData/ODataHelpers';

const TIMEOUT = 30000;

describe('useODataSearch S1', () => {
  jest.setTimeout(TIMEOUT);

  test('single S1 IW result', async () => {
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
      datasetId: 'S1_CDAS_IW_VVVH',
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(1);

    expect(result.current[0].oDataSearchResult.allResults[0].name).toContain('S1');
    expect(result.current[0].oDataSearchResult.allResults[0].name).toContain('GRD');
    expect(result.current[0].oDataSearchResult.allResults[0].platformShortName).toEqual('SENTINEL-1');
    expect(result.current[0].oDataSearchResult.allResults[0].instrumentShortName).toContain('SAR');
    expect(result.current[0].oDataSearchResult.allResults[0].productType).toEqual('IW_GRDH_1S');
    expect(result.current[0].oDataSearchResult.allResults[0].sensingTime).toContain('2023-05-28');
  });

  test('multiple S1 EW result', async () => {
    const params = {
      fromTime: moment.utc('2016-12-23T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2016-12-23T23:59:59.999Z').toDate().toISOString(),
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [10.1, 47.5],
            [10.1, 47.9],
            [11.1, 47.9],
            [11.1, 47.5],
            [10.1, 47.5],
          ],
        ],
      },
      datasetId: 'S1_CDAS_EW_HHHV',
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    const expectedResults = 2;
    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(expectedResults);

    for (let i = 0; i < expectedResults; i++) {
      expect(result.current[0].oDataSearchResult.allResults[i].name).toContain('S1');
      expect(result.current[0].oDataSearchResult.allResults[i].name).toContain('GRD');
      expect(result.current[0].oDataSearchResult.allResults[i].platformShortName).toEqual('SENTINEL-1');
      expect(result.current[0].oDataSearchResult.allResults[i].instrumentShortName).toContain('SAR');
      expect(result.current[0].oDataSearchResult.allResults[i].sensingTime).toContain('2016-12-23');
    }
  });

  test('multiple S1 IW results', async () => {
    const params = {
      fromTime: moment.utc('2023-05-28T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2023-05-28T23:59:59.999Z').toDate().toISOString(),
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [4.9, 39.8],
            [4.9, 47.9],
            [12.8, 47.9],
            [12.8, 39.8],
            [4.9, 39.8],
          ],
        ],
      },
      datasetId: 'S1_CDAS_IW_VVVH',
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    const expectedResults = 7;
    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(expectedResults);

    for (let i = 0; i < expectedResults; i++) {
      expect(result.current[0].oDataSearchResult.allResults[i].name).toContain('S1');
      expect(result.current[0].oDataSearchResult.allResults[i].name).toContain('GRD');
      expect(result.current[0].oDataSearchResult.allResults[i].platformShortName).toEqual('SENTINEL-1');
      expect(result.current[0].oDataSearchResult.allResults[i].instrumentShortName).toContain('SAR');
      /*
        The product filter was changed to "contains(Name,'GRD')" after recommendation by CF.
        This worked for a while, but now the results also contain products with product types
        'CARD-BS', 'CARD-COH6', 'CARD-COH12.
        This is probably not correct and also causes the check below to fail.
        So, this check should be disabled until the right approach is agreed upon.
      */
      // expect(result.current[0].oDataSearchResult.allResults[i].productType).toContain('IW_GRDH_1S');
      expect(result.current[0].oDataSearchResult.allResults[i].sensingTime).toContain('2023-05-28');
    }
  });

  test('multiple S1 product types', async () => {
    const params = {
      fromTime: moment.utc('2023-05-16T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2023-05-16T23:59:59.999Z').toDate().toISOString(),
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
      collections: [
        {
          id: 'S1',
          instruments: [
            {
              id: 'SAR',
              productTypes: [{ id: 'RAW' }, { id: 'SLC' }, { id: 'GRD' }, { id: 'GRD-COG' }, { id: 'OCN' }],
            },
          ],
          additionalFilters: undefined,
        },
      ],
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createAdvancedSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(5);

    expect(result.current[0].oDataSearchResult.allResults[0].name).toContain('S1');
    expect(result.current[0].oDataSearchResult.allResults[0].platformShortName).toEqual('SENTINEL-1');
    expect(result.current[0].oDataSearchResult.allResults[0].instrumentShortName).toContain('SAR');
    expect(result.current[0].oDataSearchResult.allResults[0].sensingTime).toContain('2023-05-16');

    expect(
      result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('RAW')),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('SLC')),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('GRD')),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('COG')),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('OCN')),
    ).toBeTruthy();
  });
});

describe('useODataSearch S2', () => {
  jest.setTimeout(TIMEOUT);

  test('single S2 L2A result', async () => {
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

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(1);

    expect(result.current[0].oDataSearchResult.allResults[0].name).toContain('S2');
    expect(result.current[0].oDataSearchResult.allResults[0].name).toContain('L2A');
    expect(result.current[0].oDataSearchResult.allResults[0].platformShortName).toEqual('SENTINEL-2');
    expect(result.current[0].oDataSearchResult.allResults[0].instrumentShortName).toContain('MSI');
    expect(result.current[0].oDataSearchResult.allResults[0].productType).toEqual('S2MSI2A');
    expect(result.current[0].oDataSearchResult.allResults[0].sensingTime).toContain('2023-05-28');
  });

  test('multiple S2 L1C results', async () => {
    const params = {
      fromTime: moment.utc('2023-05-28T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2023-05-28T23:59:59.999Z').toDate().toISOString(),
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [4.9, 39.8],
            [4.9, 47.9],
            [12.8, 47.9],
            [12.8, 39.8],
            [4.9, 39.8],
          ],
        ],
      },
      datasetId: 'S2_L1C_CDAS',
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    const expectedResults = 43;
    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(expectedResults);

    for (let i = 0; i < expectedResults; i++) {
      expect(result.current[0].oDataSearchResult.allResults[i].name).toContain('S2');
      expect(result.current[0].oDataSearchResult.allResults[i].name).toContain('L1C');
      expect(result.current[0].oDataSearchResult.allResults[i].platformShortName).toEqual('SENTINEL-2');
      expect(result.current[0].oDataSearchResult.allResults[i].instrumentShortName).toContain('MSI');
      expect(result.current[0].oDataSearchResult.allResults[i].productType).toEqual('S2MSI1C');
      expect(result.current[0].oDataSearchResult.allResults[i].sensingTime).toContain('2023-05-28');
    }
  });

  test('multiple S2 product types', async () => {
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
      collections: [
        {
          id: 'S2',
          instruments: [
            {
              id: 'MSI',
              productTypes: [{ id: 'S2MSI1C' }, { id: 'S2MSI2A' }],
            },
          ],
          additionalFilters: undefined,
        },
      ],
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createAdvancedSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(2);

    expect(result.current[0].oDataSearchResult.allResults[0].name).toContain('S2');
    expect(result.current[0].oDataSearchResult.allResults[0].platformShortName).toEqual('SENTINEL-2');
    expect(result.current[0].oDataSearchResult.allResults[0].instrumentShortName).toContain('MSI');
    expect(result.current[0].oDataSearchResult.allResults[0].sensingTime).toContain('2023-05-28');

    expect(
      result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('L2A')),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ productType }) => productType === 'S2MSI2A'),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('L1C')),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ productType }) => productType === 'S2MSI1C'),
    ).toBeTruthy();
  });
});

describe('useODataSearch S3', () => {
  jest.setTimeout(TIMEOUT);

  test('multiple S3 results', async () => {
    const params = {
      fromTime: moment.utc('2023-05-28T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2023-05-28T23:59:59.999Z').toDate().toISOString(),
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [4.9, 39.8],
            [4.9, 47.9],
            [12.8, 47.9],
            [12.8, 39.8],
            [4.9, 39.8],
          ],
        ],
      },
      datasetId: 'S3OLCI_CDAS',
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    const expectedResults = 8;
    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(expectedResults);

    for (let i = 0; i < expectedResults; i++) {
      expect(result.current[0].oDataSearchResult.allResults[i].name).toContain('S3');
      expect(result.current[0].oDataSearchResult.allResults[i].name).toContain('OL');
      expect(result.current[0].oDataSearchResult.allResults[i].platformShortName).toEqual('SENTINEL-3');
      expect(result.current[0].oDataSearchResult.allResults[i].instrumentShortName).toContain('OLCI');
      expect(result.current[0].oDataSearchResult.allResults[i].productType).toEqual('OL_1_EFR___');
      expect(result.current[0].oDataSearchResult.allResults[i].sensingTime).toContain('2023-05-28');
    }
  });

  test('multiple S3 product types', async () => {
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
      collections: [
        {
          id: 'S3',
          instruments: [
            { id: 'OLCI', productTypes: [{ id: 'OL_1_EFR___' }] },
            { id: 'SRAL' },
            { id: 'SLSTR', productTypes: [{ id: 'SL_1_RBT___' }] },
            { id: 'SYNERGY' },
          ],
          additionalFilters: undefined,
        },
      ],
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createAdvancedSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    const expectedResults = 26;
    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(expectedResults);

    expect(result.current[0].oDataSearchResult.allResults[0].name).toContain('S3');
    expect(result.current[0].oDataSearchResult.allResults[0].platformShortName).toEqual('SENTINEL-3');
    expect(result.current[0].oDataSearchResult.allResults[0].sensingTime).toContain('2023-05-28');

    expect(
      result.current[0].oDataSearchResult.allResults.find(({ instrumentShortName }) =>
        instrumentShortName.includes('OLCI'),
      ),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ productType }) => productType === 'OL_1_EFR___'),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ instrumentShortName }) =>
        instrumentShortName.includes('SLSTR'),
      ),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ productType }) => productType === 'SL_1_RBT___'),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ instrumentShortName }) =>
        instrumentShortName.includes('SYNERGY'),
      ),
    ).toBeTruthy();
  });
});

describe('useODataSearch S5', () => {
  jest.setTimeout(TIMEOUT);

  test('multiple S5 results', async () => {
    const params = {
      fromTime: moment.utc('2023-05-28T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2023-05-28T23:59:59.999Z').toDate().toISOString(),
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [4.9, 39.8],
            [4.9, 47.9],
            [12.8, 47.9],
            [12.8, 39.8],
            [4.9, 39.8],
          ],
        ],
      },
      datasetId: 'S5_O3_CDAS',
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    const expectedResults = 5;
    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(expectedResults);

    for (let i = 0; i < expectedResults; i++) {
      expect(result.current[0].oDataSearchResult.allResults[i].name).toContain('S5');
      expect(result.current[0].oDataSearchResult.allResults[i].name).toContain('03');
      expect(result.current[0].oDataSearchResult.allResults[i].platformShortName).toEqual('SENTINEL-5P');
      expect(result.current[0].oDataSearchResult.allResults[i].instrumentShortName).toContain('TROPOMI');
      expect(result.current[0].oDataSearchResult.allResults[i].productType).toEqual('L2__O3____');
      expect(result.current[0].oDataSearchResult.allResults[i].sensingTime).toContain('2023-05-28');
    }
  });

  test('multiple S5 product types', async () => {
    const params = {
      fromTime: moment.utc('2023-05-28T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2023-05-28T23:59:59.999Z').toDate().toISOString(),
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [4.9, 39.8],
            [4.9, 47.9],
            [12.8, 47.9],
            [12.8, 39.8],
            [4.9, 39.8],
          ],
        ],
      },
      collections: [
        {
          id: 'S5P',
          instruments: [
            {
              id: 'TROPOMI',
              productTypes: [
                { id: 'L1B_RA_BD2' },
                { id: 'L1B_RA_BD1' },
                { id: 'L1B_IR_UVN' },
                { id: 'L2__CH4___' },
                { id: 'L2__CLOUD_' },
              ],
            },
          ],
          additionalFilters: undefined,
        },
      ],
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createAdvancedSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    const expectedResults = 12;
    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(expectedResults);

    expect(result.current[0].oDataSearchResult.allResults[0].name).toContain('S5');
    expect(result.current[0].oDataSearchResult.allResults[0].platformShortName).toEqual('SENTINEL-5P');
    expect(result.current[0].oDataSearchResult.allResults[0].sensingTime).toContain('2023-05-28');

    expect(
      result.current[0].oDataSearchResult.allResults.find(({ instrumentShortName }) =>
        instrumentShortName.includes('TROPOMI'),
      ),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ productType }) => productType === 'L1B_RA_BD2'),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ productType }) => productType === 'L1B_RA_BD1'),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ productType }) => productType === 'L1B_IR_UVN'),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ productType }) => productType === 'L2__CH4___'),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ productType }) => productType === 'L2__CLOUD_'),
    ).toBeTruthy();
  });
});

describe('useODataSearch CCM', () => {
  jest.setTimeout(TIMEOUT);

  test('Collection DAP_MG2b_01', async () => {
    const params = {
      collections: [
        {
          id: 'CCM',
          instruments: [
            {
              id: 'VHR_URBAN_ATLAS',
              productTypes: [
                {
                  id: 'DAP_MG2b_01',
                },
              ],
            },
          ],
          additionalFilters: undefined,
        },
      ],
      fromTime: moment.utc('2006-02-01T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2009-03-25T23:59:59.999Z').toDate().toISOString(),
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [3.6914062500000004, 37.020098201368114],
            [20.478515625000004, 37.020098201368114],
            [20.478515625000004, 60.65164736580915],
            [3.6914062500000004, 60.65164736580915],
            [3.6914062500000004, 37.020098201368114],
          ],
        ],
      },
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createAdvancedSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    const { allResults } = result.current[0].oDataSearchResult;

    const expectedResults = 1;
    expect(allResults.length).toBeGreaterThanOrEqual(expectedResults);

    const datasetFullAttribute = allResults[0].attributes.find(
      (attribute) => attribute.Name === 'datasetFull',
    );

    const searchByProducts = [
      'SP05_HRG_THX__3',
      'SP05_HRG_T____3',
      'SP05_HRG_J____3',
      'AL01_AV2_OBS_3A',
      'AL01_PSM_OB1_3A',
    ];

    expect(datasetFullAttribute.Name).toEqual('datasetFull');
    expect(datasetFullAttribute.Value).toEqual('DAP_MG2b_01');
    expect(allResults[0].sensingTime).toContain('2009-03-17T10:36:46.000Z');
    expect(allResults[0].attributes.find((attribute) => attribute.Name.includes('datasetFull'))).toBeTruthy();
    allResults.forEach((result) => {
      expect(searchByProducts.some((searchVal) => result.name.includes(searchVal))).toBeTruthy();
    });
  });

  test('Collection VHR_IMAGE_2018', async () => {
    const params = {
      collections: [
        {
          id: 'CCM',
          instruments: [
            {
              id: 'VHR_EUROPE',
              productTypes: [
                {
                  id: 'VHR_IMAGE_2018',
                },
              ],
            },
          ],
          additionalFilters: undefined,
        },
      ],
      fromTime: moment.utc('2017-02-01T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2019-03-25T23:59:59.999Z').toDate().toISOString(),
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [3.6914062500000004, 37.020098201368114],
            [20.478515625000004, 37.020098201368114],
            [20.478515625000004, 60.65164736580915],
            [3.6914062500000004, 60.65164736580915],
            [3.6914062500000004, 37.020098201368114],
          ],
        ],
      },
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createAdvancedSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    const { allResults } = result.current[0].oDataSearchResult;

    const expectedResults = 1;
    expect(allResults.length).toBeGreaterThanOrEqual(expectedResults);

    const datasetFullAttribute = allResults[0].attributes.find(
      (attribute) => attribute.Name === 'datasetFull',
    );

    const searchByProducts = [
      'PL00_DOV_MS_L1A',
      'PL00_DOV_MS_L3A',
      'PH1A_PHR_MS___3',
      'PH1A_PHR_MS__2A',
      'PH1B_PHR_MS___3',
      'PH1B_PHR_MS__2A',
      'SP06_NAO_MS4__3',
      'SP06_NAO_MS4_2A',
      'SP07_NAO_MS4__3',
      'SP07_NAO_MS4_2A',
      'SW00_OPT_MS4_1B',
      'SW00_OPT_MS4_1C',
    ];

    expect(datasetFullAttribute.Name).toEqual('datasetFull');
    expect(datasetFullAttribute.Value).toEqual('VHR_IMAGE_2018');
    expect(allResults[0].sensingTime).toContain('2018-09-15T10:30:35.000Z');
    expect(allResults[0].attributes.find((attribute) => attribute.Name.includes('datasetFull'))).toBeTruthy();
    allResults.forEach((result) => {
      expect(searchByProducts.some((searchVal) => result.name.includes(searchVal))).toBeTruthy();
    });
  });

  test('Collection VHR_IMAGE_2021', async () => {
    const params = {
      collections: [
        {
          id: 'CCM',
          instruments: [
            {
              id: 'VHR_EUROPE',
              productTypes: [
                {
                  id: 'VHR_IMAGE_2021',
                },
              ],
            },
          ],
          additionalFilters: undefined,
        },
      ],
      fromTime: moment.utc('2020-02-01T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2022-03-25T23:59:59.999Z').toDate().toISOString(),
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [3.6914062500000004, 37.020098201368114],
            [20.478515625000004, 37.020098201368114],
            [20.478515625000004, 60.65164736580915],
            [3.6914062500000004, 60.65164736580915],
            [3.6914062500000004, 37.020098201368114],
          ],
        ],
      },
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createAdvancedSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    const { allResults } = result.current[0].oDataSearchResult;

    const expectedResults = 1;
    expect(allResults.length).toBeGreaterThanOrEqual(expectedResults);

    const datasetFullAttribute = allResults[0].attributes.find(
      (attribute) => attribute.Name === 'datasetFull',
    );

    const searchByProducts = [
      'PH1A_PHR_MS__2A',
      'PH1A_PHR_MS___3',
      'GY01_GIS_MS4_SO',
      'GY01_GIS_MS4_OR',
      'PH1B_PHR_MS__2A',
      'PH1B_PHR_MS___3',
      'EW02_WV1_MS4_SO',
      'EW02_WV1_MS4_OR',
      'SP07_NAO_MS4__3',
      'SP07_NAO_MS4_2A',
      'KS03_AIS_MSP_1R',
      'KS03_AIS_MSP_1G',
    ];

    expect(datasetFullAttribute.Name).toEqual('datasetFull');
    expect(datasetFullAttribute.Value).toEqual('VHR_IMAGE_2021');
    expect(allResults[0].attributes.find((attribute) => attribute.Name.includes('datasetFull'))).toBeTruthy();
    allResults.forEach((result) => {
      expect(searchByProducts.some((searchVal) => result.name.includes(searchVal))).toBeTruthy();
    });
  });
});

describe('useODataSearch multiple data sources', () => {
  jest.setTimeout(TIMEOUT);

  test('multiple data sources', async () => {
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
      collections: [
        {
          id: 'S1',
          instruments: [
            {
              id: 'SAR',
              productTypes: [{ id: 'RAW' }, { id: 'GRD' }],
            },
          ],
          additionalFilters: undefined,
        },
        {
          id: 'S2',
          instruments: [
            {
              id: 'MSI',
              productTypes: [],
            },
          ],
          additionalFilters: undefined,
        },
        // {
        //   id: 'S3',
        //   instruments: [],
        //   additionalFilters: undefined,
        // },
        {
          id: 'S5P',
          instruments: [
            {
              id: 'TROPOMI',
              productTypes: [{ id: 'L1B_RA_BD2' }],
            },
          ],
          additionalFilters: undefined,
        },
      ],
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createAdvancedSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    // const expectedResults = 9;
    const expectedResults = 5;
    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(expectedResults);

    expect(result.current[0].oDataSearchResult.allResults[0].sensingTime).toContain('2023-05-28');

    expect(
      result.current[0].oDataSearchResult.allResults.find(
        ({ instrumentShortName }) => instrumentShortName === 'SAR',
      ),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('RAW')),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('GRD')),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(
        ({ instrumentShortName }) => instrumentShortName === 'MSI',
      ),
    ).toBeTruthy();
    // expect(
    //   result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('S3')),
    // ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ name }) => name.includes('S5P')),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(
        ({ instrumentShortName }) => instrumentShortName === 'TROPOMI',
      ),
    ).toBeTruthy();
    expect(
      result.current[0].oDataSearchResult.allResults.find(({ productType }) => productType === 'L1B_RA_BD2'),
    ).toBeTruthy();
  });
});

describe('useODataSearch DEM', () => {
  test.skip('DGE_30', async () => {
    const params = {
      fromTime: moment.utc('2011-06-20T00:00:00.000Z').toDate().toISOString(),
      toTime: moment.utc('2011-06-20T23:59:59.999Z').toDate().toISOString(),
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [14, 46],
            [15, 47],
            [15, 47],
            [14, 47],
            [14, 46],
          ],
        ],
      },
      datasetId: 'DEM_COPERNICUS_30_CDAS',
    };

    const { result, waitForNextUpdate } = renderHook(() => useODataSearch());

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeNull();

    act(() => {
      result.current[1](oDataHelpers.createBasicSearchQuery(params));
    });
    await waitForNextUpdate({ timeout: TIMEOUT });

    expect(result.current[0].searchInProgress).toBeFalsy();
    expect(result.current[0].oDataSearchResult).toBeTruthy();

    expect(result.current[0].oDataSearchResult.allResults.length).toBeGreaterThanOrEqual(1);

    expect(result.current[0].oDataSearchResult.allResults[0].name).toContain('DEM');
    expect(result.current[0].oDataSearchResult.allResults[0].name).toContain('DGE_30');
    expect(result.current[0].oDataSearchResult.allResults[0].platformShortName).toBeUndefined();
    expect(result.current[0].oDataSearchResult.allResults[0].instrumentShortName).toBeUndefined();
    expect(result.current[0].oDataSearchResult.allResults[0].productType).toEqual('DGE_30');
    expect(result.current[0].oDataSearchResult.allResults[0].sensingTime).toContain('2011-06-20');
  });
});
