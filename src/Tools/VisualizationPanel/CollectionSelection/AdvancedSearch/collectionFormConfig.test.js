import {
  CollectionFormInitialState,
  checkFormElementAccess,
  getCollectionFormConfig,
  getCollectionFormInitialState,
} from './collectionFormConfig.utils';

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
