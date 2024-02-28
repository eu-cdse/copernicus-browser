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
  const elem = (id) => ({ id: id });

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
      [{ ...elem(1), children: [elem(11), elem(12), elem(13)] }],
      null,
      [{ ...elem(1), children: [elem(11), elem(12), elem(13)] }],
    ],
    [[{ ...elem(1), children: [elem(11), elem(12), elem(13)], hasAccess: false }], null, []],
    [
      [{ ...elem(1), children: [{ ...elem(11), hasAccess: false }, elem(12), elem(13)] }],
      null,
      [{ ...elem(1), children: [elem(12), elem(13)] }],
    ],
    // children is an array of primitive values instead of objects
    [[{ ...elem(1), children: [1, 2, 3] }], null, [{ ...elem(1), children: [1, 2, 3] }]],
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
    [[{ id: 'C1' }], null, undefined, CollectionFormInitialState],
    [[{ id: 'C1' }], {}, undefined, CollectionFormInitialState],
    [
      [{ id: 'C1' }],
      { selectedCollections: {}, maxCc: {}, selectedFilters: {} },
      undefined,
      CollectionFormInitialState,
    ],
    //form config not empty, form state not empty
    [
      [{ id: 'C1' }],
      { selectedCollections: { C1: {} }, maxCc: { C1: 100 }, selectedFilters: {} },
      undefined,
      { selectedCollections: { C1: {} }, maxCc: { C1: 100 }, selectedFilters: {} },
    ],
    //form state with collection C2 which is not defined in config
    [
      [{ id: 'C1' }],
      {
        selectedCollections: { C1: {}, C2: {} },
        maxCc: { C1: 100, C2: {} },
        selectedFilters: { C1: { f1: 1 }, C2: { f2: 2 } },
      },
      undefined,
      { selectedCollections: { C1: {} }, maxCc: { C1: 100 }, selectedFilters: { C1: {} } },
    ],
    //form state with filter f1 which is not defined in config
    [
      [{ id: 'C1' }],
      { selectedCollections: { C1: {} }, maxCc: { C1: 100 }, selectedFilters: { C1: { f1: 1 } } },
      undefined,
      { selectedCollections: { C1: {} }, maxCc: { C1: 100 }, selectedFilters: { C1: {} } },
    ],
    //form state with filter f1 which is defined in config
    [
      [{ id: 'C1', additionalFilters: [{ id: 'f1' }] }],
      { selectedCollections: { C1: {} }, maxCc: { C1: 100 }, selectedFilters: { C1: { f1: 1 } } },
      undefined,
      { selectedCollections: { C1: {} }, maxCc: { C1: 100 }, selectedFilters: { C1: { f1: 1 } } },
    ],

    //form state does not have all properties from config
    [
      [{ id: 'C1' }, { id: 'C2' }],
      { selectedCollections: { C1: {} } },
      undefined,
      { selectedCollections: { C1: {} } },
    ],
    //form state has one additional and is missing one filter
    [
      [
        {
          id: 'C1',
          additionalFilters: [{ id: 'f1', defaultValue: 1 }, { id: 'f2' }],
        },
      ],
      { selectedCollections: { C1: {}, C2: {} }, selectedFilters: { C1: { f2: 2, f3: 3 } } },
      undefined,
      { selectedCollections: { C1: {} }, selectedFilters: { C1: { f2: 2 } } },
    ],
    //f1 has default value, setDefaultValues option is set to false
    [
      [
        {
          id: 'C1',
          additionalFilters: [{ id: 'f1', defaultValue: 1 }, { id: 'f2' }],
        },
      ],
      { selectedCollections: { C1: {}, C2: {} }, selectedFilters: { C1: { f2: 2 } } },
      { setDefaultValues: false },
      { selectedCollections: { C1: {} }, selectedFilters: { C1: { f2: 2 } } },
    ],
    //f1 has default value, setDefaultValues option is set to true
    [
      [
        {
          id: 'C1',
          additionalFilters: [{ id: 'f1', defaultValue: 1 }, { id: 'f2' }],
        },
      ],
      { selectedCollections: { C1: {}, C2: {} }, selectedFilters: { C1: { f2: 2 } } },
      { setDefaultValues: true },
      { selectedCollections: { C1: {} }, selectedFilters: { C1: { f1: 1, f2: 2 } } },
    ],
    //instrument is not defined in form config
    [
      [{ id: 'C1', instruments: [{ id: 'I1' }] }],
      { selectedCollections: { C1: { I1: {}, I2: {} } } },
      undefined,
      { selectedCollections: { C1: { I1: {} } } },
    ],
    //instrument in config, but not in form state
    [
      [{ id: 'C1', instruments: [{ id: 'I1' }, { id: 'I2' }] }],
      { selectedCollections: { C1: { I1: {} } } },
      undefined,
      { selectedCollections: { C1: { I1: {} } } },
    ],
    //product type defined in form and config and form state
    [
      [{ id: 'C1', instruments: [{ id: 'I1', productTypes: [{ id: 'P1' }] }] }],
      { selectedCollections: { C1: { I1: { P1: {} }, I2: {} } } },
      undefined,
      { selectedCollections: { C1: { I1: { P1: {} } } } },
    ],
    //product type not defined in form config
    [
      [{ id: 'C1', instruments: [{ id: 'I1', productTypes: [{ id: 'P1' }] }] }],
      { selectedCollections: { C1: { I1: { P2: {} } } } },
      undefined,
      { selectedCollections: { C1: { I1: {} } } },
    ],

    //product type in config, but not in state
    [
      [{ id: 'C1', instruments: [{ id: 'I1', productTypes: [{ id: 'P1' }, { id: 'P2' }] }] }],
      { selectedCollections: { C1: { I1: { P2: {} } } } },
      undefined,
      { selectedCollections: { C1: { I1: { P2: {} } } } },
    ],
  ])('getCollectionFormInitialState %p %p %p', (formConfig, defaultState, options, expected) => {
    expect(getCollectionFormInitialState(formConfig, defaultState, options)).toStrictEqual(expected);
  });
});
