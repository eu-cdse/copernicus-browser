import { buildSelectedCollectionEntry, getSTACConfigForDatasetId } from './collectionFormConfig.utils';
import { recursiveCollections } from './collectionFormConfig';
import { ODataCollections } from '../../../../api/OData/ODataTypes';
import { STAC_COLLECTIONS } from '../../../../hooks/stacCollections';
import {
  CDAS_LANDSAT_MOSAIC,
  S1_MONTHLY_MOSAIC_IW,
  S1_MONTHLY_MOSAIC_DH,
  COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
} from '../../../SearchPanel/dataSourceHandlers/dataSourceConstants';

describe('getSTACConfigForDatasetId', () => {
  describe('guards', () => {
    test.each([
      [null, recursiveCollections],
      [undefined, recursiveCollections],
      ['', recursiveCollections],
      ['some-dataset', null],
      ['some-dataset', undefined],
      ['some-dataset', 'not-an-array'],
    ])('returns null for datasetId %p and collections %p', (datasetId, collections) => {
      expect(getSTACConfigForDatasetId(datasetId, collections)).toBeNull();
    });

    test('returns null for a datasetId that no collection declares', () => {
      expect(getSTACConfigForDatasetId('this-dataset-does-not-exist', recursiveCollections)).toBeNull();
    });
  });

  describe('two-level match (collection -> item)', () => {
    test('resolves Landsat Mosaic, nested one level inside the Complementary Data group', () => {
      expect(getSTACConfigForDatasetId(CDAS_LANDSAT_MOSAIC, recursiveCollections)).toStrictEqual({
        collectionName: STAC_COLLECTIONS.OPENGEOHUB_LANDSAT_MOSAIC,
        collectionId: ODataCollections.COMPLEMENTARY_DATA.id,
      });
    });

    test('a two-level match reports no instrument or product type', () => {
      const config = getSTACConfigForDatasetId(CDAS_LANDSAT_MOSAIC, recursiveCollections);
      expect(config.instrumentId).toBeUndefined();
      expect(config.productTypeId).toBeUndefined();
    });
  });

  describe('three-level match (collection -> instrument -> productType)', () => {
    test.each([
      [
        'Sentinel-1 IW monthly mosaics',
        S1_MONTHLY_MOSAIC_IW,
        STAC_COLLECTIONS.SENTINEL_1_GLOBAL_MOSAICS,
        'S1Mosaics',
        'S1SAR_L3_IW_MCM',
      ],
      [
        'Sentinel-1 DH monthly mosaics',
        S1_MONTHLY_MOSAIC_DH,
        STAC_COLLECTIONS.SENTINEL_1_GLOBAL_MOSAICS,
        'S1Mosaics',
        'S1SAR_L3_DH_MCM',
      ],
      [
        'Sentinel-2 quarterly mosaics',
        COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
        STAC_COLLECTIONS.SENTINEL_2_GLOBAL_MOSAICS,
        'S2Mosaics',
        'S2MSI_L3__MCQ',
      ],
    ])('resolves %s', (_label, datasetId, collectionName, instrumentId, productTypeId) => {
      expect(getSTACConfigForDatasetId(datasetId, recursiveCollections)).toStrictEqual({
        collectionName,
        collectionId: ODataCollections.GLOBAL_MOSAICS.id,
        instrumentId,
        productTypeId,
      });
    });

    test('the two Sentinel-1 mosaic datasets share a STAC collection but differ by product type', () => {
      const iw = getSTACConfigForDatasetId(S1_MONTHLY_MOSAIC_IW, recursiveCollections);
      const dh = getSTACConfigForDatasetId(S1_MONTHLY_MOSAIC_DH, recursiveCollections);

      expect(iw.collectionName).toBe(dh.collectionName);
      expect(iw.productTypeId).not.toBe(dh.productTypeId);
    });
  });

  describe('supportsStacSearch gating', () => {
    const collectionsFixture = (overrides) => [
      {
        id: 'C1',
        collectionName: 'c1-collection',
        items: [
          {
            id: 'I1',
            collectionName: 'i1-collection',
            ...overrides,
            items: [{ id: 'P1', datasetId: 'ds-p1' }],
          },
        ],
      },
    ];

    test('a product type inherits supportsStacSearch from its instrument', () => {
      expect(
        getSTACConfigForDatasetId('ds-p1', collectionsFixture({ supportsStacSearch: true })),
      ).toStrictEqual({
        collectionName: 'i1-collection',
        collectionId: 'C1',
        instrumentId: 'I1',
        productTypeId: 'P1',
      });
    });

    test('a product type under a non-STAC instrument stays on OData', () => {
      expect(getSTACConfigForDatasetId('ds-p1', collectionsFixture({}))).toBeNull();
    });

    test('a product type falls back to its collection collectionName when the instrument has none', () => {
      const collections = [
        {
          id: 'C1',
          collectionName: 'c1-collection',
          supportsStacSearch: true,
          items: [{ id: 'I1', items: [{ id: 'P1', datasetId: 'ds-p1' }] }],
        },
      ];

      expect(getSTACConfigForDatasetId('ds-p1', collections).collectionName).toBe('c1-collection');
    });

    test('an instrument with no items array does not throw', () => {
      const collections = [{ id: 'C1', collectionName: 'c1', items: [{ id: 'I1' }] }];
      expect(getSTACConfigForDatasetId('ds-p1', collections)).toBeNull();
    });
  });
});

describe('buildSelectedCollectionEntry', () => {
  test.each([
    ['both ids pin instrument and product type', { instrumentId: 'I', productTypeId: 'P' }, { I: { P: {} } }],
    ['an instrument alone leaves the product type open', { instrumentId: 'I' }, { I: {} }],
    ['no instrument selects the whole collection', { productTypeId: undefined }, {}],
  ])('%s', (_name, params, expected) => {
    expect(buildSelectedCollectionEntry(params)).toEqual(expected);
  });

  test('drops a product type that has no instrument to hang off', () => {
    // The form only ever reaches a product type through its instrument, so this cannot be
    // represented - it degrades to "the whole collection" rather than inventing a level.
    expect(buildSelectedCollectionEntry({ productTypeId: 'P' })).toEqual({});
  });

  test.each([[undefined], [{}]])('returns {} for %p', (params) => {
    expect(buildSelectedCollectionEntry(params)).toEqual({});
  });

  test('the OData and STAC callers produce the same entry for the same selection', () => {
    // The whole point of sharing this: RecursiveCollectionForm passes OData field names and
    // FindProductsButton passes STAC ones, and both must land on one shape.
    const oDataCollectionInfo = { instrument: 'IW', productType: 'IW_MCM' };
    const stacConfig = { instrumentId: 'IW', productTypeId: 'IW_MCM' };
    expect(
      buildSelectedCollectionEntry({
        instrumentId: oDataCollectionInfo.instrument,
        productTypeId: oDataCollectionInfo.productType,
      }),
    ).toEqual(
      buildSelectedCollectionEntry({
        instrumentId: stacConfig.instrumentId,
        productTypeId: stacConfig.productTypeId,
      }),
    );
  });
});
