import {
  CollectionConfigNode,
  findConfigNodeIdsByType,
  findConfigNodeIdsByTypeInScope,
  findConfigNodes,
  findConfigNodesByType,
  findConfigNodesByTypeInScope,
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
    [{ id: 'S1SAR_L3_IW_MCM' }, false],
    [null, false],
    [undefined, false],
  ])('isSTACCollectionNode %p -> %p', (node, expected) => {
    expect(isSTACCollectionNode(node as CollectionConfigNode | null | undefined)).toBe(expected);
  });
});
