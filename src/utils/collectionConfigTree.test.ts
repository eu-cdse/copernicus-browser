import {
  CollectionConfigNode,
  findConfigNodeIdsByType,
  findConfigNodeIdsByTypeInScope,
  findConfigNodes,
  findConfigNodesByType,
  findConfigNodesByTypeInScope,
  getSTACCollectionNames,
  isGeometrylessNode,
  isSTACCollectionNode,
} from './collectionConfigTree';

const tree = [
  {
    id: 'C1',
    type: 'collection',
    items: [
      { id: 'I1', type: 'instrument', items: [{ id: 'P1', type: 'productType', items: [] }] },
      {
        id: 'G1',
        type: 'group',
        items: [
          {
            id: 'I2',
            type: 'instrument',
            items: [
              { id: 'P2', type: 'productType', items: [] },
              { id: 'P3', type: 'productType', items: [] },
            ],
          },
        ],
      },
    ],
  },
  { id: 'C2', type: 'collection', items: [{ id: 'I3', type: 'instrument' }] },
];

describe('findConfigNodes', () => {
  test.each([
    [undefined, []],
    [null, []],
    [[], []],
  ])('returns [] for items %p', (items, expected) => {
    expect(findConfigNodes(items, () => true)).toEqual(expected);
  });

  test('skips falsy entries rather than throwing', () => {
    // ODataHelpers reaches this from JS via recursiveCollections.flatMap((c) => c.items), which
    // yields a hole for any collection without items - hence the cast, and hence the guard.
    const withHoles = [null, undefined, { id: 'A' }] as unknown as CollectionConfigNode[];
    expect(findConfigNodes(withHoles, () => true)).toEqual([{ id: 'A' }]);
  });

  test('descends through arbitrary nesting depth', () => {
    expect(findConfigNodes(tree, (item) => item.type === 'productType').map((i) => i.id)).toEqual([
      'P1',
      'P2',
      'P3',
    ]);
  });

  test('does not descend into a node that already matched', () => {
    // C1 matches, so its instruments/product types are never visited.
    expect(findConfigNodes(tree, (item) => item.type === 'collection').map((i) => i.id)).toEqual([
      'C1',
      'C2',
    ]);
  });

  test('returns matches in depth-first document order', () => {
    expect(findConfigNodes(tree, (item) => item.type === 'instrument').map((i) => i.id)).toEqual([
      'I1',
      'I2',
      'I3',
    ]);
  });

  test('a node with no children and no match contributes nothing', () => {
    expect(findConfigNodes([{ id: 'X', type: 'instrument' }], (item) => item.type === 'group')).toEqual([]);
  });
});

describe('findConfigNodesByType', () => {
  test.each([
    ['collection', ['C1', 'C2']],
    ['group', ['G1']],
    ['instrument', ['I1', 'I2', 'I3']],
    ['productType', ['P1', 'P2', 'P3']],
    ['nonexistent', []],
  ])('collects every %s node', (type, expectedIds) => {
    expect(findConfigNodesByType(tree, type).map((i) => i.id)).toEqual(expectedIds);
  });
});

describe('findConfigNodesByTypeInScope', () => {
  test.each([
    [undefined, 'productType', []],
    [null, 'productType', []],
    [[], 'productType', []],
  ])('returns [] for items %p', (items, type, expected) => {
    expect(findConfigNodesByTypeInScope(items, type)).toEqual(expected);
  });

  test('stops at instrument boundaries instead of collecting their product types', () => {
    // Every product type in `tree` sits under an instrument, so asking the collection for its own
    // yields nothing - which is what findConfigNodesByType would not tell you.
    expect(findConfigNodesByTypeInScope(tree[0].items, 'productType')).toEqual([]);
    expect(findConfigNodesByType(tree[0].items, 'productType').map((i) => i.id)).toEqual(['P1', 'P2', 'P3']);
  });

  test('sees through group nodes to the instruments they wrap', () => {
    // I2 is nested inside group G1; I1 is a direct child. Both belong to C1's scope.
    expect(findConfigNodesByTypeInScope(tree[0].items, 'instrument').map((i) => i.id)).toEqual(['I1', 'I2']);
  });

  test('collects product types a group holds directly', () => {
    const groupedProductTypes = [
      { id: 'G', type: 'group', items: [{ id: 'P', type: 'productType' }] },
      { id: 'P0', type: 'productType' },
    ];
    expect(findConfigNodesByTypeInScope(groupedProductTypes, 'productType').map((i) => i.id)).toEqual([
      'P',
      'P0',
    ]);
  });

  test('does not cross into a nested collection', () => {
    const nested = [{ id: 'C', type: 'collection', items: [{ id: 'P', type: 'productType' }] }];
    expect(findConfigNodesByTypeInScope(nested, 'productType')).toEqual([]);
  });
});

describe('findConfigNodeIdsByType', () => {
  test.each([
    [undefined, []],
    [null, []],
    [[], []],
  ])('returns [] for items %p', (items, expected) => {
    expect(findConfigNodeIdsByType(items, 'productType')).toEqual(expected);
  });

  test('returns the ids of every matching node in the subtree', () => {
    expect(findConfigNodeIdsByType(tree, 'productType')).toEqual(['P1', 'P2', 'P3']);
  });
});

describe('findConfigNodeIdsByTypeInScope', () => {
  test.each([
    [undefined, []],
    [null, []],
    [[], []],
  ])('returns [] for items %p', (items, expected) => {
    expect(findConfigNodeIdsByTypeInScope(items, 'productType')).toEqual(expected);
  });

  test('returns only the ids in scope, unlike findConfigNodeIdsByType', () => {
    // The scope difference is the whole reason both exist, so assert it on the id helpers too.
    expect(findConfigNodeIdsByTypeInScope(tree[0].items, 'productType')).toEqual([]);
    expect(findConfigNodeIdsByType(tree[0].items, 'productType')).toEqual(['P1', 'P2', 'P3']);
  });
});

describe('isSTACCollectionNode', () => {
  test.each([
    [{ id: 'S1Mosaics', supportsStacSearch: true, collectionName: 'sentinel-1-global-mosaics' }, true],
    // Every OData-only collection carries a collectionName too, so the name alone proves nothing.
    [{ id: 'S2', collectionName: 'SENTINEL-2' }, false],
    // The flag without a name is the case worth excluding: it would route to the STAC branch and
    // then contribute no collection to the payload.
    [{ id: 'S1Mosaics', supportsStacSearch: true }, false],
    // A node whose product types each name a STAC collection owns them just the same.
    [
      {
        id: 'S6AuxiliaryFiles',
        supportsStacSearch: true,
        items: [{ id: 'AX____POE__AX', type: 'productType', collectionName: 'sentinel-6-aux-poe' }],
      },
      true,
    ],
    // ...but product types naming nothing is the flag-without-a-name case again.
    [{ id: 'S6AuxiliaryFiles', supportsStacSearch: true, items: [{ id: 'P', type: 'productType' }] }, false],
    [{ id: 'S1SAR_L3_IW_MCM' }, false],
    [null, false],
    [undefined, false],
  ])('isSTACCollectionNode %p -> %p', (node, expected) => {
    expect(isSTACCollectionNode(node as CollectionConfigNode | null | undefined)).toBe(expected);
  });
});

describe('getSTACCollectionNames', () => {
  test.each([
    [{ id: 'S1Mosaics', collectionName: 'sentinel-1-global-mosaics' }, ['sentinel-1-global-mosaics']],
    // A node naming no collection searches those of its product types, in config order.
    [
      {
        id: 'S6AuxiliaryFiles',
        items: [
          { id: 'AX____POE__AX', type: 'productType', collectionName: 'sentinel-6-aux-poe' },
          { id: 'AX____ROE__AX', type: 'productType', collectionName: 'sentinel-6-aux-roe' },
        ],
      },
      ['sentinel-6-aux-poe', 'sentinel-6-aux-roe'],
    ],
    // Product types sharing a collection contribute it once.
    [
      {
        id: 'X',
        items: [
          { id: 'P1', type: 'productType', collectionName: 'shared' },
          { id: 'P2', type: 'productType', collectionName: 'shared' },
        ],
      },
      ['shared'],
    ],
    // Product types without a collectionName are skipped, and groups are looked through.
    [
      {
        id: 'X',
        items: [
          { id: 'P1', type: 'productType' },
          { id: 'G', type: 'group', items: [{ id: 'P2', type: 'productType', collectionName: 'b' }] },
        ],
      },
      ['b'],
    ],
    // The node's own collectionName is authoritative: its product types are not consulted.
    [
      {
        id: 'S1Mosaics',
        collectionName: 'sentinel-1-global-mosaics',
        items: [{ id: 'P', type: 'productType', collectionName: 'other' }],
      },
      ['sentinel-1-global-mosaics'],
    ],
    [{ id: 'S1SAR_L3_IW_MCM' }, []],
    [null, []],
    [undefined, []],
  ])('getSTACCollectionNames %p -> %p', (node, expected) => {
    expect(getSTACCollectionNames(node as CollectionConfigNode | null | undefined)).toEqual(expected);
  });
});

describe('getSTACCollectionNames - narrowed to ticked product types', () => {
  const aux: CollectionConfigNode = {
    id: 'S6AuxiliaryFiles',
    items: [
      { id: 'AUX_COMB__', type: 'productType', collectionName: 'sentinel-6-aux-comb' },
      { id: 'AX____POE__AX', type: 'productType', collectionName: 'sentinel-6-aux-poe' },
      { id: 'AX____ROE__AX', type: 'productType', collectionName: 'sentinel-6-aux-roe' },
    ],
  };

  test('returns only the collections behind the ticked product types', () => {
    expect(getSTACCollectionNames(aux, ['AUX_COMB__'])).toEqual(['sentinel-6-aux-comb']);
    expect(getSTACCollectionNames(aux, ['AX____ROE__AX', 'AUX_COMB__'])).toEqual([
      'sentinel-6-aux-comb',
      'sentinel-6-aux-roe',
    ]);
  });

  test.each([[[]], [undefined]])('nothing ticked (%p) stands for every product type', (productTypeIds) => {
    expect(getSTACCollectionNames(aux, productTypeIds)).toEqual([
      'sentinel-6-aux-comb',
      'sentinel-6-aux-poe',
      'sentinel-6-aux-roe',
    ]);
  });

  test("a node's own collectionName ignores the ticked product types", () => {
    const mosaics: CollectionConfigNode = {
      id: 'S1Mosaics',
      collectionName: 'sentinel-1-global-mosaics',
      items: [{ id: 'S1SAR_L3_IW_MCM', type: 'productType' }],
    };
    expect(getSTACCollectionNames(mosaics, ['S1SAR_L3_IW_MCM'])).toEqual(['sentinel-1-global-mosaics']);
  });
});

describe('isGeometrylessNode', () => {
  const instrument = (productTypes: Record<string, unknown>[]): CollectionConfigNode => ({
    id: 'I',
    type: 'instrument',
    items: productTypes.map((productType, i) => ({ id: `P${i}`, type: 'productType', ...productType })),
  });

  test('is true when every product type has supportsGeometry: false', () => {
    expect(isGeometrylessNode(instrument([{ supportsGeometry: false }, { supportsGeometry: false }]))).toBe(
      true,
    );
  });

  test('is false when only some product types lack geometry', () => {
    expect(isGeometrylessNode(instrument([{ supportsGeometry: false }, {}]))).toBe(false);
  });

  test('is false when the flag is absent, since geometry is the default', () => {
    expect(isGeometrylessNode(instrument([{}]))).toBe(false);
  });

  test('looks through groups for product types', () => {
    const node: CollectionConfigNode = {
      id: 'I',
      type: 'instrument',
      items: [{ id: 'G', type: 'group', items: [{ id: 'P', type: 'productType', supportsGeometry: false }] }],
    };
    expect(isGeometrylessNode(node)).toBe(true);
  });

  test.each([[instrument([])], [null], [undefined]])('is false with no product types (%p)', (node) => {
    expect(isGeometrylessNode(node)).toBe(false);
  });
});
