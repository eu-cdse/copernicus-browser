import moment from 'moment';

import {
  createDatetimeInterval,
  createGeometryFilters,
  combineFilters,
  createProductTypeFilters,
  mapODataKeyToSTAC,
  createSTACSearchPayload,
} from './STACSearchPayloadBuilder';
import type { CQL2Filter } from './STACSearchPayloadBuilder';

describe('createDatetimeInterval', () => {
  test('returns null when timeInterval is null', () => {
    expect(createDatetimeInterval(null)).toBeNull();
  });

  test('leaves the interval open-ended (`..`) when only fromTime is set', () => {
    expect(createDatetimeInterval({ fromTime: '2023-06-29T00:00:00Z', toTime: null })).toBe(
      '2023-06-29T00:00:00Z/..',
    );
  });

  test('leaves the interval open-started (`..`) when only toTime is set', () => {
    expect(createDatetimeInterval({ fromTime: null, toTime: '2023-06-29T23:59:59Z' })).toBe(
      '../2023-06-29T23:59:59Z',
    );
  });

  test('returns a bounded interval when both fromTime and toTime are set', () => {
    expect(createDatetimeInterval({ fromTime: '2023-06-29T00:00:00Z', toTime: '2023-06-30T00:00:00Z' })).toBe(
      '2023-06-29T00:00:00Z/2023-06-30T00:00:00Z',
    );
  });

  test('falls back to a fully open interval (`../..`) when both fromTime and toTime are null', () => {
    expect(createDatetimeInterval({ fromTime: null, toTime: null })).toBe('../..');
  });
});

describe('createGeometryFilters', () => {
  test('returns an empty array for null geometry', () => {
    expect(createGeometryFilters(null)).toEqual([]);
  });

  test('returns an empty array for undefined geometry', () => {
    expect(createGeometryFilters(undefined)).toEqual([]);
  });

  test('returns an s_intersects filter for a real geometry', () => {
    const geometry = {
      type: 'Polygon' as const,
      coordinates: [
        [
          [1, 1],
          [1, 2],
          [2, 2],
          [2, 1],
          [1, 1],
        ],
      ],
    };

    expect(createGeometryFilters(geometry)).toEqual([
      { op: 's_intersects', args: [{ property: 'geometry' }, geometry] },
    ]);
  });
});

describe('combineFilters', () => {
  test('returns undefined for an empty array', () => {
    expect(combineFilters([])).toBeUndefined();
  });

  test('returns the bare filter when there is exactly one', () => {
    const filter: CQL2Filter = { op: '=', args: [{ property: 'platform' }, 'landsat-8'] };
    expect(combineFilters([filter])).toEqual(filter);
  });

  test('wraps multiple filters in an `and` op', () => {
    const filterA: CQL2Filter = { op: '=', args: [{ property: 'platform' }, 'landsat-8'] };
    const filterB: CQL2Filter = { op: 's_intersects', args: [{ property: 'geometry' }, {}] };

    expect(combineFilters([filterA, filterB])).toEqual({ op: 'and', args: [filterA, filterB] });
  });
});

describe('mapODataKeyToSTAC', () => {
  test('maps processingMode to product:timeliness_category', () => {
    expect(mapODataKeyToSTAC('processingMode')).toBe('product:timeliness_category');
  });

  test('maps orbitNumber to sat:absolute_orbit', () => {
    expect(mapODataKeyToSTAC('orbitNumber')).toBe('sat:absolute_orbit');
  });

  test('passes an unmapped key through unchanged', () => {
    expect(mapODataKeyToSTAC('cloudCoverPercentage')).toBe('cloudCoverPercentage');
  });
});

describe('createSTACSearchPayload', () => {
  test('with no selected collections, no dates and no search criteria: sets an open datetime and no filter', () => {
    const payload = createSTACSearchPayload({
      collectionForm: { selectedCollections: {} },
    });

    expect(payload).toEqual({ limit: 50, datetime: '../..' });
    expect(payload.filter).toBeUndefined();
    expect(payload.collections).toBeUndefined();
  });

  test('builds a `=` platform filter for a single selected collection', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2: { platform: 'sentinel-2a' },
        },
      },
    });

    expect(payload.filter).toEqual({ op: '=', args: [{ property: 'platform' }, 'sentinel-2a'] });
  });

  test('builds an `in` platform filter when multiple collections are selected', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2A: { platform: 'sentinel-2a' },
          S2B: { platform: 'sentinel-2b' },
        },
      },
    });

    expect(payload.filter).toEqual({
      op: 'in',
      args: [{ property: 'platform' }, ['sentinel-2a', 'sentinel-2b']],
    });
  });

  test('populates the top-level `collections` param via a direct collectionName match', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2: { platform: 'sentinel-2a' },
        },
      },
      collectionFormConfig: [{ id: 'S2', supportsStacSearch: true, collectionName: 'SENTINEL-2' }],
    });

    expect(payload.collections).toEqual(['SENTINEL-2']);
  });

  test('populates `collections` for a group node via its sub-collection items', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          COMPLEMENTARY_DATA: {
            type: 'group',
            'LANDSAT-8': { type: 'collection' },
            'LANDSAT-9': { type: 'collection' },
          },
        },
      },
      collectionFormConfig: [
        {
          id: 'COMPLEMENTARY_DATA',
          items: [
            { id: 'LANDSAT-8', supportsStacSearch: true, collectionName: 'LANDSAT8' },
            { id: 'LANDSAT-9', supportsStacSearch: true, collectionName: 'LANDSAT9' },
          ],
        },
      ],
    });

    expect(payload.collections).toEqual(['LANDSAT8', 'LANDSAT9']);
  });

  test('does not add a `collections` param when collectionFormConfig is not provided', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2: { platform: 'sentinel-2a' },
        },
      },
    });

    expect(payload.collections).toBeUndefined();
  });

  test('extracts product type and instrument filters from nested selectedCollections', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2: {
            platform: 'sentinel-2a',
            MSI: {
              type: 'instrument',
              L1C: { type: 'productType' },
            },
          },
        },
      },
      collectionFormConfig: [
        {
          id: 'S2',
          supportsStacSearch: true,
          collectionName: 'SENTINEL-2',
          items: [{ id: 'MSI', supportsInstrumentName: true }],
        },
      ],
    });

    expect(payload.filter).toEqual({
      op: 'and',
      args: [
        { op: '=', args: [{ property: 'platform' }, 'sentinel-2a'] },
        { op: '=', args: [{ property: 'product:type' }, 'L1C'] },
        { op: '=', args: [{ property: 'instruments' }, 'MSI'] },
      ],
    });
  });

  test('builds `in` product type / instrument filters when there is more than one of each', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2: {
            platform: 'sentinel-2a',
            MSI: {
              type: 'instrument',
              L1C: { type: 'productType' },
              L2A: { type: 'productType' },
            },
            MSI2: {
              type: 'instrument',
            },
          },
        },
      },
      collectionFormConfig: [
        {
          id: 'S2',
          supportsStacSearch: true,
          collectionName: 'SENTINEL-2',
          items: [
            { id: 'MSI', supportsInstrumentName: true },
            { id: 'MSI2', supportsInstrumentName: true },
          ],
        },
      ],
    });

    expect(payload.filter).toEqual({
      op: 'and',
      args: [
        { op: '=', args: [{ property: 'platform' }, 'sentinel-2a'] },
        { op: 'in', args: [{ property: 'product:type' }, ['L1C', 'L2A']] },
        { op: 'in', args: [{ property: 'instruments' }, ['MSI', 'MSI2']] },
      ],
    });
  });

  test('omits instrument filters when the collection config sets supportsInstrumentName to false', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2: {
            platform: 'sentinel-2a',
            MSI: {
              type: 'instrument',
              L1C: { type: 'productType' },
            },
          },
        },
      },
      collectionFormConfig: [
        {
          id: 'S2',
          supportsStacSearch: true,
          collectionName: 'SENTINEL-2',
          supportsInstrumentName: false,
          items: [{ id: 'MSI' }],
        },
      ],
    });

    // Product type filter still included; instrument filter is gated off at the collection level.
    expect(payload.filter).toEqual({
      op: 'and',
      args: [
        { op: '=', args: [{ property: 'platform' }, 'sentinel-2a'] },
        { op: '=', args: [{ property: 'product:type' }, 'L1C'] },
      ],
    });
  });

  test('omits instrument filters when the instrument config sets supportsInstrumentName to false', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2: {
            MSI: {
              type: 'instrument',
              L1C: { type: 'productType' },
            },
          },
        },
      },
      collectionFormConfig: [
        {
          id: 'S2',
          supportsStacSearch: true,
          collectionName: 'SENTINEL-2',
          items: [{ id: 'MSI', supportsInstrumentName: false }],
        },
      ],
    });

    expect(payload.filter).toEqual({ op: '=', args: [{ property: 'product:type' }, 'L1C'] });
  });

  test('omits instrument filters when supportsInstrumentName is false, even with a platform key present', () => {
    // Regression test: the instrument-level gate in shouldIncludeInstruments used to inspect
    // every key of the collection node, including non-instrument metadata keys like `platform`
    // (present on every real selected collection). Since it used .some(), a non-instrument key
    // would short-circuit the gate to true regardless of the actual instrument's config,
    // silently including instrument filters that should have been suppressed. Only
    // instrument-type keys must be considered.
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2: {
            platform: 'sentinel-2a',
            MSI: {
              type: 'instrument',
              L1C: { type: 'productType' },
            },
          },
        },
      },
      collectionFormConfig: [
        {
          id: 'S2',
          supportsStacSearch: true,
          collectionName: 'SENTINEL-2',
          items: [{ id: 'MSI', supportsInstrumentName: false }],
        },
      ],
    });

    expect(payload.filter).toEqual({
      op: 'and',
      args: [
        { op: '=', args: [{ property: 'platform' }, 'sentinel-2a'] },
        { op: '=', args: [{ property: 'product:type' }, 'L1C'] },
      ],
    });
  });

  test('createAdditionalFilters: builds `=` filters for scalar values and translates mapped keys', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {},
        selectedFilters: {
          S2: {
            processingMode: 'NRT',
            cloudCoverPercentage: 50,
          },
        },
      },
    });

    expect(payload.filter).toEqual({
      op: 'and',
      args: [
        { op: '=', args: [{ property: 'product:timeliness_category' }, 'NRT'] },
        { op: '=', args: [{ property: 'cloudCoverPercentage' }, 50] },
      ],
    });
  });

  test('createAdditionalFilters: unwraps a single-item array of {value} objects into a `=` filter', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {},
        selectedFilters: {
          S2: {
            customTag: [{ value: 'only-one' }],
          },
        },
      },
    });

    expect(payload.filter).toEqual({ op: '=', args: [{ property: 'customTag' }, 'only-one'] });
  });

  test('createAdditionalFilters: unwraps a multi-item array of {value} objects into an `in` filter and translates the key', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {},
        selectedFilters: {
          S2: {
            orbitNumber: [{ value: 10 }, { value: 20 }],
          },
        },
      },
    });

    expect(payload.filter).toEqual({
      op: 'in',
      args: [{ property: 'sat:absolute_orbit' }, [10, 20]],
    });
  });

  test('searchCriteria: builds a `like` filter on title and suppresses the datetime interval', () => {
    const payload = createSTACSearchPayload({
      collectionForm: { selectedCollections: {} },
      searchCriteria: 'S2A_MSIL1C',
      fromMoment: moment.utc('2023-06-29T00:00:00.000Z'),
      toMoment: moment.utc('2023-06-30T00:00:00.000Z'),
    });

    expect(payload.filter).toEqual({ op: 'like', args: [{ property: 'title' }, '%S2A_MSIL1C%'] });
    expect(payload.datetime).toBeUndefined();
  });

  test('without searchCriteria, the datetime interval is included even when fromMoment/toMoment are unset', () => {
    const payload = createSTACSearchPayload({
      collectionForm: { selectedCollections: {} },
    });

    expect(payload.datetime).toBe('../..');
  });

  test('builds the datetime interval from fromMoment/toMoment when no filterMonths are set', () => {
    const payload = createSTACSearchPayload({
      collectionForm: { selectedCollections: {} },
      fromMoment: moment.utc('2023-06-29T00:00:00.000Z'),
      toMoment: moment.utc('2023-06-29T23:59:59.999Z'),
    });

    expect(payload.datetime).toBe('2023-06-29T00:00:00Z/2023-06-29T23:59:59Z');
  });

  test('filterMonths: delegates to applyFilterMonthsToDateRange and uses the first returned interval', () => {
    const fromMoment = moment.utc('2023-01-01T00:00:00.000Z');
    const toMoment = moment.utc('2023-12-31T23:59:59.999Z');
    const filterMonths = [6, 7, 8];
    const applyFilterMonthsToDateRange = jest.fn(() => [
      {
        fromMoment: moment.utc('2023-06-01T00:00:00.000Z'),
        toMoment: moment.utc('2023-08-31T23:59:59.999Z'),
      },
    ]);

    const payload = createSTACSearchPayload({
      collectionForm: { selectedCollections: {} },
      fromMoment,
      toMoment,
      filterMonths,
      applyFilterMonthsToDateRange,
    });

    expect(applyFilterMonthsToDateRange).toHaveBeenCalledWith(fromMoment, toMoment, filterMonths);
    expect(payload.datetime).toBe('2023-06-01T00:00:00.000Z/2023-08-31T23:59:59.999Z');
  });

  test('filterMonths: omits the datetime interval when applyFilterMonthsToDateRange returns no intervals', () => {
    const applyFilterMonthsToDateRange = jest.fn(() => []);

    const payload = createSTACSearchPayload({
      collectionForm: { selectedCollections: {} },
      filterMonths: [6, 7, 8],
      applyFilterMonthsToDateRange,
    });

    expect(payload.datetime).toBeUndefined();
  });

  test('adds an s_intersects geometry filter derived from aoiBounds when collections are selected', () => {
    const aoiBounds = {
      _southWest: { lat: 1, lng: 1 },
      _northEast: { lat: 2, lng: 2 },
    };

    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2: { platform: 'sentinel-2a' },
        },
      },
      aoiBounds,
    });

    expect(payload.filter).toEqual({
      op: 'and',
      args: [
        { op: '=', args: [{ property: 'platform' }, 'sentinel-2a'] },
        {
          op: 's_intersects',
          args: [
            { property: 'geometry' },
            {
              type: 'Polygon',
              coordinates: [
                [
                  [1, 1],
                  [2, 1],
                  [2, 2],
                  [1, 2],
                  [1, 1],
                ],
              ],
            },
          ],
        },
      ],
    });
  });

  test('combines platform, geometry, product type/instrument, additional and search filters with `and`', () => {
    const aoiBounds = {
      _southWest: { lat: 1, lng: 1 },
      _northEast: { lat: 2, lng: 2 },
    };

    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          S2: {
            platform: 'sentinel-2a',
            MSI: {
              type: 'instrument',
              L1C: { type: 'productType' },
            },
          },
        },
        selectedFilters: {
          S2: {
            processingMode: 'NRT',
          },
        },
      },
      collectionFormConfig: [
        {
          id: 'S2',
          supportsStacSearch: true,
          collectionName: 'SENTINEL-2',
          items: [{ id: 'MSI', supportsInstrumentName: true }],
        },
      ],
      aoiBounds,
      searchCriteria: 'S2A',
    });

    expect(payload.collections).toEqual(['SENTINEL-2']);
    expect(payload.datetime).toBeUndefined();
    expect(payload.filter).toEqual({
      op: 'and',
      args: [
        { op: '=', args: [{ property: 'platform' }, 'sentinel-2a'] },
        {
          op: 's_intersects',
          args: [
            { property: 'geometry' },
            {
              type: 'Polygon',
              coordinates: [
                [
                  [1, 1],
                  [2, 1],
                  [2, 2],
                  [1, 2],
                  [1, 1],
                ],
              ],
            },
          ],
        },
        { op: '=', args: [{ property: 'product:type' }, 'L1C'] },
        { op: '=', args: [{ property: 'instruments' }, 'MSI'] },
        { op: '=', args: [{ property: 'product:timeliness_category' }, 'NRT'] },
        { op: 'like', args: [{ property: 'title' }, '%S2A%'] },
      ],
    });
  });
});

describe('createProductTypeFilters', () => {
  test('returns no filter for an empty list', () => {
    expect(createProductTypeFilters([])).toEqual([]);
  });

  test('uses `=` for a single product type', () => {
    expect(createProductTypeFilters(['S1SAR_L3_IW_MCM'])).toEqual([
      { op: '=', args: [{ property: 'product:type' }, 'S1SAR_L3_IW_MCM'] },
    ]);
  });

  test('uses `in` for several product types', () => {
    expect(createProductTypeFilters(['S1SAR_L3_IW_MCM', 'S1SAR_L3_DH_MCM'])).toEqual([
      { op: 'in', args: [{ property: 'product:type' }, ['S1SAR_L3_IW_MCM', 'S1SAR_L3_DH_MCM']] },
    ]);
  });
});

describe('createSTACSearchPayload - Global Mosaics', () => {
  // Mirrors the real recursiveCollections shape: supportsStacSearch and collectionName live on
  // the instrument nodes, one STAC collection each, with the product types nested below them.
  const globalMosaicsConfig = [
    {
      id: 'GLOBAL-MOSAICS',
      type: 'collection',
      supportsInstrumentName: false,
      items: [
        {
          id: 'S1Mosaics',
          type: 'instrument',
          supportsStacSearch: true,
          collectionName: 'sentinel-1-global-mosaics',
          supportsInstrumentName: false,
          items: [
            { id: 'S1SAR_L3_IW_MCM', type: 'productType' },
            { id: 'S1SAR_L3_DH_MCM', type: 'productType' },
          ],
        },
        {
          id: 'S2Mosaics',
          type: 'instrument',
          supportsStacSearch: true,
          collectionName: 'sentinel-2-global-mosaics',
          supportsInstrumentName: false,
          items: [{ id: 'S2MSI_L3__MCQ', type: 'productType' }],
        },
      ],
    },
  ];

  // Complementary Data is a group node; Landsat Mosaic sits one level below it and owns its
  // own STAC collection. `hideChildren` on that entry means its product type is auto-selected.
  const combinedConfig = [
    ...globalMosaicsConfig,
    {
      id: 'COMPLEMENTARY_DATA',
      type: 'group',
      items: [
        {
          id: 'landsat_mosaic',
          type: 'collection',
          supportsStacSearch: true,
          collectionName: 'opengeohub-landsat-bimonthly-mosaic-v1.0.1',
          items: [{ id: 'landsat_mosaic', type: 'productType' }],
        },
      ],
    },
  ];

  test('scopes the search to the Sentinel-1 STAC collection and the selected product type', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': {
            type: 'collection',
            S1Mosaics: {
              type: 'instrument',
              S1SAR_L3_IW_MCM: { type: 'productType' },
            },
          },
        },
      },
      collectionFormConfig: globalMosaicsConfig,
    });

    expect(payload.collections).toEqual(['sentinel-1-global-mosaics']);
    expect(payload.filter).toEqual({
      op: '=',
      args: [{ property: 'product:type' }, 'S1SAR_L3_IW_MCM'],
    });
  });

  test('selecting both Sentinel-1 product types filters on both with `in`', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': {
            type: 'collection',
            S1Mosaics: {
              type: 'instrument',
              S1SAR_L3_IW_MCM: { type: 'productType' },
              S1SAR_L3_DH_MCM: { type: 'productType' },
            },
          },
        },
      },
      collectionFormConfig: globalMosaicsConfig,
    });

    expect(payload.collections).toEqual(['sentinel-1-global-mosaics']);
    expect(payload.filter).toEqual({
      op: 'in',
      args: [{ property: 'product:type' }, ['S1SAR_L3_IW_MCM', 'S1SAR_L3_DH_MCM']],
    });
  });

  test('selecting both instruments searches both STAC collections', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': {
            type: 'collection',
            S1Mosaics: { type: 'instrument', S1SAR_L3_IW_MCM: { type: 'productType' } },
            S2Mosaics: { type: 'instrument', S2MSI_L3__MCQ: { type: 'productType' } },
          },
        },
      },
      collectionFormConfig: globalMosaicsConfig,
    });

    expect(payload.collections).toEqual(['sentinel-1-global-mosaics', 'sentinel-2-global-mosaics']);
  });

  test('omits the instruments filter, since the mosaic instrument IDs are not STAC instrument names', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': {
            type: 'collection',
            S1Mosaics: { type: 'instrument', S1SAR_L3_IW_MCM: { type: 'productType' } },
          },
        },
      },
      collectionFormConfig: globalMosaicsConfig,
    });

    const filters = JSON.stringify(payload.filter);
    expect(filters).not.toContain('instruments');
  });

  // Regression: a collection with no instrument-level selection (Complementary Data wrapping
  // Landsat Mosaic) resolves the instrument gate to its `true` default. While the gate was a
  // `.some()` across collections, that single `true` re-enabled instrument filtering for the
  // whole payload, and the mosaics' instrument node IDs were emitted as STAC instrument names -
  // a filter the live API matches zero items against.
  test('omits the instruments filter when mosaics are combined with a collection that allows instrument names', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': {
            type: 'collection',
            S1Mosaics: { type: 'instrument', S1SAR_L3_IW_MCM: { type: 'productType' } },
            S2Mosaics: { type: 'instrument', S2MSI_L3__MCQ: { type: 'productType' } },
          },
          COMPLEMENTARY_DATA: {
            type: 'group',
            landsat_mosaic: { type: 'collection', landsat_mosaic: { type: 'productType' } },
          },
        },
      },
      collectionFormConfig: combinedConfig,
    });

    expect(payload.collections).toEqual([
      'sentinel-1-global-mosaics',
      'sentinel-2-global-mosaics',
      'opengeohub-landsat-bimonthly-mosaic-v1.0.1',
    ]);
    expect(payload.filter).toEqual({
      op: 'in',
      args: [{ property: 'product:type' }, ['S1SAR_L3_IW_MCM', 'S2MSI_L3__MCQ', 'landsat_mosaic']],
    });
  });

  // Regression: selecting an instrument node does not auto-select its product types, so
  // Sentinel-1 Mosaics contributes none while Landsat Mosaic (hideChildren) contributes one.
  // The flat product:type filter was then `product:type = 'landsat_mosaic'`, `and`-combined
  // across both collections, so the Sentinel-1 results silently disappeared. Sentinel-1 is now
  // expanded to both of its configured product types instead.
  test('expands a STAC collection with no selected product types to its configured ones', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': {
            type: 'collection',
            S1Mosaics: { type: 'instrument' },
          },
          COMPLEMENTARY_DATA: {
            type: 'group',
            landsat_mosaic: { type: 'collection', landsat_mosaic: { type: 'productType' } },
          },
        },
      },
      collectionFormConfig: combinedConfig,
    });

    expect(payload.collections).toEqual([
      'sentinel-1-global-mosaics',
      'opengeohub-landsat-bimonthly-mosaic-v1.0.1',
    ]);
    expect(payload.filter).toEqual({
      op: 'in',
      args: [{ property: 'product:type' }, ['landsat_mosaic', 'S1SAR_L3_IW_MCM', 'S1SAR_L3_DH_MCM']],
    });
  });

  // Same defect one level down: both STAC collections live under a single top-level entry, so
  // the expansion has to run per STAC collection rather than per selected top-level node.
  test('expands per STAC collection when both live under the same top-level collection', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': {
            type: 'collection',
            S1Mosaics: { type: 'instrument' },
            S2Mosaics: { type: 'instrument', S2MSI_L3__MCQ: { type: 'productType' } },
          },
        },
      },
      collectionFormConfig: globalMosaicsConfig,
    });

    expect(payload.collections).toEqual(['sentinel-1-global-mosaics', 'sentinel-2-global-mosaics']);
    expect(payload.filter).toEqual({
      op: 'in',
      args: [{ property: 'product:type' }, ['S2MSI_L3__MCQ', 'S1SAR_L3_IW_MCM', 'S1SAR_L3_DH_MCM']],
    });
  });

  // Regression: a narrowed selection next to an unticked sibling node. Dropping the filter
  // outright (the previous behaviour) let the unselected IW mosaics back into the results;
  // expanding only the unticked Sentinel-2 node keeps the DH constraint intact.
  test('keeps a narrowed product type selection when a sibling STAC collection is unticked', () => {
    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': {
            type: 'collection',
            S1Mosaics: { type: 'instrument', S1SAR_L3_DH_MCM: { type: 'productType' } },
            S2Mosaics: { type: 'instrument' },
          },
        },
      },
      collectionFormConfig: globalMosaicsConfig,
    });

    expect(payload.collections).toEqual(['sentinel-1-global-mosaics', 'sentinel-2-global-mosaics']);
    expect(payload.filter).toEqual({
      op: 'in',
      args: [{ property: 'product:type' }, ['S1SAR_L3_DH_MCM', 'S2MSI_L3__MCQ']],
    });
  });

  // Fallback: nothing to expand to, so no product:type filter at all rather than one that
  // would exclude the collection entirely.
  test('omits the product type filter when a STAC collection configures no product types', () => {
    const configWithoutProductTypes = [
      {
        id: 'GLOBAL-MOSAICS',
        supportsInstrumentName: false,
        items: [
          {
            id: 'S1Mosaics',
            type: 'instrument',
            supportsStacSearch: true,
            collectionName: 'sentinel-1-global-mosaics',
            items: [],
          },
          {
            id: 'S2Mosaics',
            type: 'instrument',
            supportsStacSearch: true,
            collectionName: 'sentinel-2-global-mosaics',
            supportsInstrumentName: false,
            items: [{ id: 'S2MSI_L3__MCQ', type: 'productType' }],
          },
        ],
      },
    ];

    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': {
            type: 'collection',
            S1Mosaics: { type: 'instrument' },
            S2Mosaics: { type: 'instrument', S2MSI_L3__MCQ: { type: 'productType' } },
          },
        },
      },
      collectionFormConfig: configWithoutProductTypes,
    });

    expect(payload.collections).toEqual(['sentinel-1-global-mosaics', 'sentinel-2-global-mosaics']);
    expect(payload.filter).toBeUndefined();
  });

  // A group is a heading the UI draws inside its parent, not something the API knows about, so the
  // expansion has to descend past it to the product types underneath rather than emit the group's
  // own id - which would send a UI label to the API as if it were a product:type value.
  test('expands past a group node to the product types beneath it', () => {
    const configWithGroupingNode = [
      {
        id: 'GLOBAL-MOSAICS',
        type: 'collection',
        supportsInstrumentName: false,
        items: [
          {
            id: 'S1Mosaics',
            type: 'instrument',
            supportsStacSearch: true,
            collectionName: 'sentinel-1-global-mosaics',
            items: [
              {
                id: 'MonthlyMosaics',
                type: 'group',
                items: [
                  { id: 'S1SAR_L3_IW_MCM', type: 'productType' },
                  { id: 'S1SAR_L3_DH_MCM', type: 'productType' },
                ],
              },
            ],
          },
        ],
      },
    ];

    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': { type: 'collection', S1Mosaics: { type: 'instrument' } },
        },
      },
      collectionFormConfig: configWithGroupingNode,
    });

    expect(payload.filter).toEqual({
      op: 'in',
      args: [{ property: 'product:type' }, ['S1SAR_L3_IW_MCM', 'S1SAR_L3_DH_MCM']],
    });
  });

  // collectionName alone does not make a node a STAC collection - every OData-only collection
  // carries one too. Only the pairing with supportsStacSearch does, which is what the partitioner
  // in AdvancedSearch.jsx checks one call earlier; if the two disagreed, an OData collection could
  // reach this builder and be searched against a STAC collection that does not exist.
  test('ignores a sibling that carries a collectionName without supportsStacSearch', () => {
    const configWithODataSibling = [
      {
        id: 'GLOBAL-MOSAICS',
        type: 'collection',
        supportsInstrumentName: false,
        items: [
          {
            id: 'S1Mosaics',
            type: 'instrument',
            supportsStacSearch: true,
            collectionName: 'sentinel-1-global-mosaics',
            items: [{ id: 'S1SAR_L3_IW_MCM', type: 'productType' }],
          },
          {
            id: 'S3Olci',
            type: 'instrument',
            collectionName: 'SENTINEL-3',
            items: [{ id: 'OL_1_EFR___', type: 'productType' }],
          },
        ],
      },
    ];

    const payload = createSTACSearchPayload({
      collectionForm: {
        selectedCollections: {
          'GLOBAL-MOSAICS': {
            type: 'collection',
            S1Mosaics: { type: 'instrument' },
            S3Olci: { type: 'instrument' },
          },
        },
      },
      collectionFormConfig: configWithODataSibling,
    });

    expect(payload.collections).toEqual(['sentinel-1-global-mosaics']);
    expect(payload.filter).toEqual({
      op: '=',
      args: [{ property: 'product:type' }, 'S1SAR_L3_IW_MCM'],
    });
  });
});
