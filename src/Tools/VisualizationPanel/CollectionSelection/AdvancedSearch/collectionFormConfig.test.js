import {
  CollectionFormInitialState,
  checkFormElementAccess,
  getCollectionFormConfig,
  getCollectionFormInitialState,
} from './collectionFormConfig.utils';
import { recursiveCollections, complementaryDataGroup } from './collectionFormConfig';
import { ODataCollections } from '../../../../api/OData/ODataTypes';
import { STAC_COLLECTIONS } from '../../../../hooks/stacCollections';
import {
  S1_MONTHLY_MOSAIC_IW,
  S1_MONTHLY_MOSAIC_DH,
  COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
} from '../../../SearchPanel/dataSourceHandlers/dataSourceConstants';

describe('checkFormElementAccess', () => {
  test.each([
    [null, null, true],
    [undefined, null, true],
    [{}, null, true],
    [{ hasAccess: true }, null, true],
    [{ hasAccess: false }, null, false],
    [{ hasAccess: () => true }, null, true],
    [{ hasAccess: () => false }, null, false],
    [{ hasAccess: (token) => !!token }, 'token', true],
    [{ hasAccess: (token) => !!token }, null, false],
    [{ hasAccess: (props) => props?.userName === 'test' }, { userName: 'userName' }, false],
    [{ hasAccess: (props) => props?.userName === 'test' }, { userName: 'test' }, true],
    [{ hasAccess: (props) => props?.userName === 'test' }, 'test', false],
    [{ hasAccess: (props) => props?.userName === 'test' }, null, false],
    [{ hasAccess: (props) => props?.userName === 'test' }, {}, false],
    [{ hasAccess: (props) => props?.userName === 'test' }, { user: 'test' }, false],
  ])('checkFormElementAccess %p %p %p', (formElement, props, expected) => {
    expect(checkFormElementAccess(formElement, props)).toBe(expected);
  });
});

describe('getCollectionFormConfig', () => {
  const elem = (id, type = 'collection') => ({ id, type });

  test.each([
    [null, null, null],
    [undefined, null, null],
    [{}, null, null],
    [[], null, []],
    [[{}], null, [{}]],
    [[elem(1)], null, [elem(1)]],
    [[elem(1), elem(2), elem(3)], null, [elem(1), elem(2), elem(3)]],
    [[elem(1), { ...elem(2), hasAccess: false }, { ...elem(3), hasAccess: true }], null, [elem(1), elem(3)]],
    [
      [elem(1), { ...elem(2), hasAccess: () => false }, { ...elem(3), hasAccess: () => true }],
      null,
      [elem(1), elem(3)],
    ],

    [
      [{ ...elem(1), items: [elem(11, 'instrument'), elem(12, 'instrument'), elem(13, 'instrument')] }],
      null,
      [{ ...elem(1), items: [elem(11, 'instrument'), elem(12, 'instrument'), elem(13, 'instrument')] }],
    ],
    [
      [
        {
          ...elem(1),
          items: [elem(11, 'instrument'), elem(12, 'instrument'), elem(13, 'instrument')],
          hasAccess: false,
        },
      ],
      null,
      [],
    ],
    [
      [
        {
          ...elem(1),
          items: [
            { ...elem(11, 'instrument'), hasAccess: false },
            elem(12, 'instrument'),
            elem(13, 'instrument'),
          ],
        },
      ],
      null,
      [{ ...elem(1), items: [elem(12, 'instrument'), elem(13, 'instrument')] }],
    ],
    // Test nested group structure
    [
      [
        {
          ...elem(1),
          items: [
            {
              ...elem(11, 'group'),
              items: [elem(111, 'instrument'), elem(112, 'instrument')],
            },
          ],
        },
      ],
      null,
      [
        {
          ...elem(1),
          items: [
            {
              ...elem(11, 'group'),
              items: [elem(111, 'instrument'), elem(112, 'instrument')],
            },
          ],
        },
      ],
    ],
    // Test access control on nested items
    [
      [
        {
          ...elem(1),
          items: [
            {
              ...elem(11, 'group'),
              items: [{ ...elem(111, 'instrument'), hasAccess: false }, elem(112, 'instrument')],
            },
          ],
        },
      ],
      null,
      [
        {
          ...elem(1),
          items: [
            {
              ...elem(11, 'group'),
              items: [elem(112, 'instrument')],
            },
          ],
        },
      ],
    ],
  ])('getCollectionFormConfig %p %p %p', (formElement, props, expected) => {
    const collectionFormConfig = getCollectionFormConfig(formElement, props);

    if (!expected) {
      expect(collectionFormConfig).toBe(null);
    } else {
      expect(collectionFormConfig).toEqual(
        expect.arrayContaining(expected.map((e) => expect.objectContaining(e))),
      );
    }
  });
});

describe('getCollectionFormInitialState', () => {
  const createCollection = (id) => ({ id, type: 'collection', items: [] });
  const createInstrument = (id) => ({ id, type: 'instrument', items: [] });
  const createProductType = (id) => ({ id, type: 'productType', items: [] });
  const createGroup = (id, items = []) => ({ id, type: 'group', items });

  test.each([
    //empty form config, empty form state
    [null, null, undefined, CollectionFormInitialState],
    [null, {}, undefined, CollectionFormInitialState],
    [[], {}, undefined, CollectionFormInitialState],
    [[], { selectedCollections: {}, maxCc: {}, selectedFilters: {} }, undefined, CollectionFormInitialState],
    //empty form config, form state has some values
    [
      [],
      { selectedCollections: {}, maxCc: { C1: {} }, selectedFilters: { C1: [{ f1: 1 }] } },
      undefined,
      CollectionFormInitialState,
    ],
    //form config not empty, form state empty
    [[createCollection('C1')], null, undefined, CollectionFormInitialState],
    [[createCollection('C1')], {}, undefined, CollectionFormInitialState],
    [
      [createCollection('C1')],
      { selectedCollections: {}, maxCc: {}, selectedFilters: {} },
      undefined,
      CollectionFormInitialState,
    ],
    //form config not empty, form state not empty
    [
      [createCollection('C1')],
      {
        selectedCollections: {
          C1: {},
        },
        maxCc: {
          C1: 100,
        },
        selectedFilters: {},
      },
      undefined,
      {
        selectedCollections: {
          C1: {},
        },
        maxCc: {
          C1: 100,
        },
        selectedFilters: {},
      },
    ],
    //form state with collection C2 which is not defined in config
    [
      [createCollection('C1')],
      {
        selectedCollections: {
          C1: {},
          C2: {},
        },
        maxCc: {
          C1: 100,
          C2: {},
        },
        selectedFilters: {
          C1: { f1: 1 },
          C2: { f2: 2 },
        },
      },
      undefined,
      {
        selectedCollections: {
          C1: {},
        },
        maxCc: {
          C1: 100,
        },
        selectedFilters: {
          C1: {},
        },
      },
    ],
    //form state with filter f1 which is not defined in config
    [
      [createCollection('C1')],
      {
        selectedCollections: {
          C1: {},
        },
        maxCc: {
          C1: 100,
        },
        selectedFilters: {
          C1: { f1: 1 },
        },
      },
      undefined,
      {
        selectedCollections: {
          C1: {},
        },
        maxCc: {
          C1: 100,
        },
        selectedFilters: {
          C1: {},
        },
      },
    ],
    //form state with filter f1 which is defined in config
    [
      [
        {
          ...createCollection('C1'),
          additionalFilters: [{ id: 'f1' }],
        },
      ],
      {
        selectedCollections: {
          C1: {},
        },
        maxCc: {
          C1: 100,
        },
        selectedFilters: {
          C1: { f1: 1 },
        },
      },
      undefined,
      {
        selectedCollections: {
          C1: {},
        },
        maxCc: {
          C1: 100,
        },
        selectedFilters: {
          C1: { f1: 1 },
        },
      },
    ],
    //form state does not have all properties from config
    [
      [createCollection('C1'), createCollection('C2')],
      { selectedCollections: { C1: {} } },
      undefined,
      { selectedCollections: { C1: {} } },
    ],
    //form state has one additional and is missing one filter
    [
      [
        {
          ...createCollection('C1'),
          additionalFilters: [{ id: 'f1', defaultValue: 1 }, { id: 'f2' }],
        },
      ],
      {
        selectedCollections: {
          C1: {},
          C2: {},
        },
        selectedFilters: {
          C1: { f2: 2, f3: 3 },
        },
      },
      undefined,
      {
        selectedCollections: {
          C1: {},
        },
        selectedFilters: {
          C1: { f2: 2 },
        },
      },
    ],
    //f1 has default value, setDefaultValues option is set to false
    [
      [
        {
          ...createCollection('C1'),
          additionalFilters: [{ id: 'f1', defaultValue: 1 }, { id: 'f2' }],
        },
      ],
      {
        selectedCollections: {
          C1: {},
          C2: {},
        },
        selectedFilters: {
          C1: { f2: 2 },
        },
      },
      { setDefaultValues: false },
      {
        selectedCollections: {
          C1: {},
        },
        selectedFilters: {
          C1: { f2: 2 },
        },
      },
    ],
    //f1 has default value, setDefaultValues option is set to true
    [
      [
        {
          ...createCollection('C1'),
          additionalFilters: [{ id: 'f1', defaultValue: 1 }, { id: 'f2' }],
        },
      ],
      {
        selectedCollections: {
          C1: {},
          C2: {},
        },
        selectedFilters: {
          C1: { f2: 2 },
        },
      },
      { setDefaultValues: true },
      {
        selectedCollections: {
          C1: {},
        },
        selectedFilters: {
          C1: { f1: 1, f2: 2 },
        },
      },
    ],
    // Recursive structure tests
    // Instrument inside collection
    [
      [
        {
          ...createCollection('C1'),
          items: [createInstrument('I1')],
        },
      ],
      {
        selectedCollections: {
          C1: {
            I1: { type: 'instrument' },
            I2: { type: 'instrument' },
          },
        },
      },
      undefined,
      {
        selectedCollections: {
          C1: {
            I1: { type: 'instrument' },
          },
        },
      },
    ],
    // Instrument inside group
    [
      [
        {
          ...createCollection('C1'),
          items: [
            {
              ...createGroup('G1', [createInstrument('I1')]),
            },
          ],
        },
      ],
      {
        selectedCollections: {
          C1: {
            G1: {
              type: 'group',
              I1: { type: 'instrument' },
            },
          },
        },
      },
      undefined,
      {
        selectedCollections: {
          C1: {
            G1: {
              type: 'group',
              I1: { type: 'instrument' },
            },
          },
        },
      },
    ],
    // Product type inside instrument
    [
      [
        {
          ...createCollection('C1'),
          items: [
            {
              ...createInstrument('I1'),
              items: [createProductType('P1')],
            },
          ],
        },
      ],
      {
        selectedCollections: {
          C1: {
            I1: {
              type: 'instrument',
              P1: { type: 'productType' },
              P2: { type: 'productType' },
            },
          },
        },
      },
      undefined,
      {
        selectedCollections: {
          C1: {
            I1: {
              type: 'instrument',
              P1: { type: 'productType' },
            },
          },
        },
      },
    ],
    // Product type inside instrument inside group
    [
      [
        {
          ...createCollection('C1'),
          items: [
            {
              ...createGroup('G1', [
                {
                  ...createInstrument('I1'),
                  items: [createProductType('P1')],
                },
              ]),
            },
          ],
        },
      ],
      {
        selectedCollections: {
          C1: {
            G1: {
              type: 'group',
              I1: {
                type: 'instrument',
                P1: { type: 'productType' },
              },
            },
          },
        },
      },
      undefined,
      {
        selectedCollections: {
          C1: {
            G1: {
              type: 'group',
              I1: {
                type: 'instrument',
                P1: { type: 'productType' },
              },
            },
          },
        },
      },
    ],
    // Cloud cover values at different levels
    [
      [
        {
          ...createCollection('C1'),
          items: [
            {
              ...createInstrument('I1'),
              supportsCloudCover: true,
            },
          ],
        },
      ],
      {
        selectedCollections: {
          C1: {
            I1: { type: 'instrument' },
          },
        },
        maxCc: {
          C1: {
            I1: 75,
          },
        },
      },
      undefined,
      {
        selectedCollections: {
          C1: {
            I1: { type: 'instrument' },
          },
        },
        maxCc: {
          C1: {
            I1: 75,
          },
        },
      },
    ],
  ])('getCollectionFormInitialState %p %p %p', (formConfig, defaultState, options, expected) => {
    expect(getCollectionFormInitialState(formConfig, defaultState, options)).toStrictEqual(expected);
  });
});

describe('recursiveCollections nesting - complementaryDataGroup', () => {
  // Documents the real structure that caused MR !748's review to twice mistake Landsat
  // Mosaic for a top-level formConfig entry: it's nested one level inside the single
  // COMPLEMENTARY_DATA group node, not a sibling of `collections`' top-level entries.
  test('complementaryDataGroup is pushed as a single node into recursiveCollections, not spread', () => {
    const topLevelMatch = recursiveCollections.find((c) => c.id === complementaryDataGroup.id);
    expect(topLevelMatch).toBe(complementaryDataGroup);
  });

  test('Landsat Mosaic is nested inside complementaryDataGroup.items, not a top-level entry', () => {
    expect(recursiveCollections.find((c) => c.id === 'landsat_mosaic')).toBeUndefined();

    const landsatMosaic = complementaryDataGroup.items.find((item) => item.id === 'landsat_mosaic');
    expect(landsatMosaic).toBeDefined();
    expect(landsatMosaic.supportsStacSearch).toBe(true);
  });
});

describe('recursiveCollections nesting - Global Mosaics STAC config', () => {
  // Global Mosaics is three levels deep (collection -> instrument -> productType), unlike
  // Landsat Mosaic which is two. supportsStacSearch and collectionName sit on the instrument
  // nodes (one STAC collection each), while datasetId sits on the productType leaves.
  const globalMosaics = () => recursiveCollections.find((c) => c.id === ODataCollections.GLOBAL_MOSAICS.id);

  test('the top-level Global Mosaics node carries no collectionName', () => {
    // 'GLOBAL-MOSAICS' is the OData collection name, not a STAC collection ID. Leaving it on
    // the top-level node would make extractCollectionNames short-circuit to it and send an
    // unknown collection to the STAC API instead of drilling into the per-instrument names.
    expect(globalMosaics().collectionName).toBeUndefined();
  });

  test.each([
    ['S1Mosaics', STAC_COLLECTIONS.SENTINEL_1_GLOBAL_MOSAICS],
    ['S2Mosaics', STAC_COLLECTIONS.SENTINEL_2_GLOBAL_MOSAICS],
  ])('%s is STAC-enabled and maps to %s', (instrumentId, expectedCollectionName) => {
    const instrument = globalMosaics().items.find((item) => item.id === instrumentId);
    expect(instrument).toBeDefined();
    expect(instrument.supportsStacSearch).toBe(true);
    expect(instrument.collectionName).toBe(expectedCollectionName);
  });

  test.each([
    ['S1Mosaics', 'S1SAR_L3_IW_MCM', S1_MONTHLY_MOSAIC_IW],
    ['S1Mosaics', 'S1SAR_L3_DH_MCM', S1_MONTHLY_MOSAIC_DH],
    ['S2Mosaics', 'S2MSI_L3__MCQ', COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC],
  ])('%s product type %s carries datasetId %s', (instrumentId, productTypeId, expectedDatasetId) => {
    const instrument = globalMosaics().items.find((item) => item.id === instrumentId);
    const productType = instrument.items.find((item) => item.id === productTypeId);
    expect(productType).toBeDefined();
    expect(productType.datasetId).toBe(expectedDatasetId);
  });

  test('the STAC-era product type IDs replaced the OData contains() tokens', () => {
    // The OData query matched on substrings of the product Name ('_IW_mosaic_'); the STAC query
    // matches on the product:type property, whose real values are the S1SAR_L3_*_MCM codes.
    const s1ProductTypeIds = globalMosaics()
      .items.find((item) => item.id === 'S1Mosaics')
      .items.map((item) => item.id);
    expect(s1ProductTypeIds).toEqual(['S1SAR_L3_IW_MCM', 'S1SAR_L3_DH_MCM']);
  });
});
