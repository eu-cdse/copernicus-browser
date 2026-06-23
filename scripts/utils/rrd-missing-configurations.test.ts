import {
  findCollectionsWithoutConfiguration,
  buildMissingConfigIssueBody,
} from './rrd-missing-configurations';

describe('findCollectionsWithoutConfiguration', () => {
  const collectionA = { id: 'col-a', name: 'Collection A' };
  const collectionB = { id: 'col-b', name: 'Collection B' };
  const collectionC = { id: 'col-c', name: 'Collection C' };

  describe('(a) all collections referenced', () => {
    it('returns an empty array when every collection id appears in referencedCollectionIds', () => {
      const collections = [collectionA, collectionB, collectionC];
      const referencedCollectionIds = new Set(['col-a', 'col-b', 'col-c']);

      const result = findCollectionsWithoutConfiguration(collections, referencedCollectionIds);

      expect(result).toEqual([]);
    });
  });

  describe('(b) one collection with no referencing layer', () => {
    it('returns only the collection whose id is absent from referencedCollectionIds', () => {
      const collections = [collectionA, collectionB, collectionC];
      const referencedCollectionIds = new Set(['col-a', 'col-c']);

      const result = findCollectionsWithoutConfiguration(collections, referencedCollectionIds);

      expect(result).toEqual([{ id: 'col-b', name: 'Collection B' }]);
    });
  });

  describe('(c) referencedCollectionIds as a plain array', () => {
    it('behaves identically to passing a Set when given a plain array', () => {
      const collections = [collectionA, collectionB, collectionC];
      const referencedAsSet = new Set(['col-a', 'col-c']);
      const referencedAsArray = ['col-a', 'col-c'];

      const resultFromSet = findCollectionsWithoutConfiguration(collections, referencedAsSet);
      const resultFromArray = findCollectionsWithoutConfiguration(collections, referencedAsArray);

      expect(resultFromArray).toEqual(resultFromSet);
      expect(resultFromArray).toEqual([{ id: 'col-b', name: 'Collection B' }]);
    });

    it('returns empty array via plain array when all collections are referenced', () => {
      const collections = [collectionA, collectionB];
      const referencedCollectionIds = ['col-a', 'col-b'];

      const result = findCollectionsWithoutConfiguration(collections, referencedCollectionIds);

      expect(result).toEqual([]);
    });
  });

  describe('(d) a referenced collection is not flagged even when referenced by multiple layers', () => {
    it('does not flag a collection referenced more than once', () => {
      const collections = [collectionA, collectionB];
      // col-a appears in multiple layers; duplicates in arrays are fine
      const referencedCollectionIds = ['col-a', 'col-a', 'col-b'];

      const result = findCollectionsWithoutConfiguration(collections, referencedCollectionIds);

      expect(result).toEqual([]);
    });

    it('flags only the unreferenced collection when some are referenced multiple times', () => {
      const collections = [collectionA, collectionB, collectionC];
      const referencedCollectionIds = new Set(['col-a', 'col-b']);

      const result = findCollectionsWithoutConfiguration(collections, referencedCollectionIds);

      expect(result).toEqual([{ id: 'col-c', name: 'Collection C' }]);
    });
  });

  describe('(e) empty collections array', () => {
    it('returns an empty array regardless of referencedCollectionIds', () => {
      expect(findCollectionsWithoutConfiguration([], new Set(['col-a']))).toEqual([]);
      expect(findCollectionsWithoutConfiguration([], [])).toEqual([]);
      expect(findCollectionsWithoutConfiguration([], new Set())).toEqual([]);
    });
  });

  describe('return shape', () => {
    it('maps each result to only { id, name } even if the source object has extra properties', () => {
      const collectionsWithExtras = [{ id: 'col-x', name: 'Extra Collection', someOtherProp: 'irrelevant' }];
      const referencedCollectionIds = new Set<string>();

      const result = findCollectionsWithoutConfiguration(collectionsWithExtras, referencedCollectionIds);

      expect(result).toEqual([{ id: 'col-x', name: 'Extra Collection' }]);
      expect(result[0]).not.toHaveProperty('someOtherProp');
    });
  });

  describe('(f) skipped tier umbrella collections', () => {
    const general = { id: 'id-general', name: 'GENERAL' };
    const csesa = { id: 'id-csesa', name: 'CSESA' };
    const frtx = { id: 'id-frtx', name: 'FRTX' };
    const product = { id: 'id-product', name: 'GENERAL_WORLDVIEW_4PS' };

    it('never reports GENERAL, CSESA, FRTX or GENERAL_GHGSAT_CH4 even when unreferenced', () => {
      const collections = [
        general,
        csesa,
        frtx,
        { id: 'id-ghgsat', name: 'GENERAL_GHGSAT_CH4' },
        { id: 'id-frtx-ghgsat', name: 'FRTX_GHGSAT_CH4' },
        { id: 'id-csesa-frtx', name: 'CSESA_FRTX' },
      ];

      const result = findCollectionsWithoutConfiguration(collections, new Set());

      expect(result).toEqual([]);
    });

    it('still reports product collections that share a tier prefix', () => {
      const collections = [general, csesa, frtx, product];

      const result = findCollectionsWithoutConfiguration(collections, new Set());

      expect(result).toEqual([{ id: 'id-product', name: 'GENERAL_WORLDVIEW_4PS' }]);
    });

    it('does not skip a referenced umbrella collection from the result for the wrong reason', () => {
      // Even if somehow referenced, the umbrella collections are absent from the output.
      const collections = [general, product];
      const referencedCollectionIds = new Set(['id-product']);

      const result = findCollectionsWithoutConfiguration(collections, referencedCollectionIds);

      expect(result).toEqual([]);
    });
  });
});

describe('buildMissingConfigIssueBody', () => {
  const date = new Date('2026-06-12T00:00:00.000Z');

  it('includes the total count and a bullet per missing collection', () => {
    const missing = [
      { id: 'col-a', name: 'Collection A' },
      { id: 'col-b', name: 'Collection B' },
    ];

    const body = buildMissingConfigIssueBody(missing, date);

    expect(body).toContain('Total: 2');
    expect(body).toContain('- Collection A (`col-a`)');
    expect(body).toContain('- Collection B (`col-b`)');
    expect(body).toContain('Last checked: 2026-06-12T00:00:00.000Z');
  });

  it('reports a total of 0 with no bullets when nothing is missing', () => {
    const body = buildMissingConfigIssueBody([], date);

    expect(body).toContain('Total: 0');
    expect(body).not.toContain('(`');
  });
});
