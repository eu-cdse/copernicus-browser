import { RRDQueryBuilder } from './RRDQueryBuilder';
import {
  InstructionNamesRRD,
  ProviderModeSupport,
} from '../../Tools/RapidResponseDesk/rapidResponseProperties';

const createSearchFilter = () => [
  {
    collections: [5],
    filter: {
      op: 'and',
      args: [
        {
          op: '<=',
          args: [
            {
              property: InstructionNamesRRD.CloudCover,
            },
            30,
          ],
        },
        {
          op: '>=',
          args: [
            {
              property: InstructionNamesRRD.Azimuth,
            },
            0,
          ],
        },
        {
          op: '<=',
          args: [
            {
              property: InstructionNamesRRD.Azimuth,
            },
            90,
          ],
        },
        {
          op: '>=',
          args: [
            {
              property: InstructionNamesRRD.SunAzimuth,
            },
            0,
          ],
        },
        {
          op: '<=',
          args: [
            {
              property: InstructionNamesRRD.SunAzimuth,
            },
            360,
          ],
        },
        {
          op: '>=',
          args: [
            {
              property: InstructionNamesRRD.AOICover,
            },
            70,
          ],
        },
        {
          op: 'or',
          args: [
            {
              op: '=',
              args: [
                {
                  property: InstructionNamesRRD.ResolutionClass,
                },
                'VHR1a',
              ],
            },
            {
              op: '=',
              args: [
                {
                  property: InstructionNamesRRD.ResolutionClass,
                },
                'VHR1b',
              ],
            },
          ],
        },
      ],
    },
    intersects: {
      type: 'Polygon',
      coordinates: [
        [
          [-12.436523437500002, 28.497660832963472],
          [53.96484375000001, 28.497660832963472],
          [53.96484375000001, 65.10914820386476],
          [-12.436523437500002, 65.10914820386476],
          [-12.436523437500002, 28.497660832963472],
        ],
      ],
    },
    datetime: '2024-10-22T00:00:00.000Z/2024-11-21T23:59:59.999Z',
  },
];

const createDefaultBounds = () => ({
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [11.443239, 52.618811],
        [11.395539, 52.744811],
        [11.590539, 52.771511],
        [11.637739, 52.645411],
        [11.443239, 52.618811],
      ],
    ],
  ],
});

const createOpticalTestItem = (defaultBounds) => ({
  id: 'Optical test',
  geometry: defaultBounds,
  bbox: null,
  stac_extentions: [],
  stac_version: '1.0.0',
  type: 'Feature',
  properties: {
    datetime: '2024-10-19T08:35:33',
    [InstructionNamesRRD.CloudCover]: 0,
    [InstructionNamesRRD.Azimuth]: 79.4,
    [InstructionNamesRRD.SunAzimuth]: 79.4,
    [InstructionNamesRRD.SunElevation]: null,
    instrument_mode: null,
    constellation: 'GEOSAT',
    platform: 'GEOSAT2',
    instrument: 'Optical',
    off_nadir: 17.2,
    metadata_source: 'CCME',
  },
});

const createRadarTestItem = (defaultBounds) => ({
  id: 'Radar tasking',
  geometry: defaultBounds,
  bbox: null,
  stac_extentions: [],
  stac_version: '1.0.0',
  type: 'Feature',
  properties: {
    datetime: '2024-31-19T08:35:33',
    [InstructionNamesRRD.CloudCover]: 0,
    [InstructionNamesRRD.Azimuth]: 79.4,
    [InstructionNamesRRD.SunAzimuth]: 79.4,
    [InstructionNamesRRD.SunElevation]: null,
    instrument_mode: null,
    constellation: 'Radar Constellation',
    platform: '',
    instrument: 'Optical',
    off_nadir: 17.2,
    metadata_source: 'CCME',
  },
});

const createCartItems = () => ({
  error: false,
  quote: {
    quota: 395.9,
    products: [
      {
        name: 'Test',
        quota: 395.9,
        scenes: [
          {
            quota: 395.9,
            request: {
              collections: [1],
              filter: {
                op: 'and',
                args: [
                  {
                    op: '>=',
                    args: [
                      {
                        property: InstructionNamesRRD.Azimuth,
                      },
                      20,
                    ],
                  },
                  {
                    op: '<=',
                    args: [
                      {
                        property: InstructionNamesRRD.Azimuth,
                      },
                      80,
                    ],
                  },
                  {
                    op: '=',
                    args: [
                      {
                        property: InstructionNamesRRD.Polarizations,
                      },
                      'HH',
                    ],
                  },
                  {
                    op: '=',
                    args: [
                      {
                        property: InstructionNamesRRD.ResolutionClass,
                      },
                      'VHR1a',
                    ],
                  },
                  {
                    op: '=',
                    args: [
                      {
                        property: 'taskingUseCase',
                      },
                      'UC3',
                    ],
                  },
                ],
              },
              datetime: '2024-12-30T00:00:00.000Z/2024-12-31T23:59:59.999Z',
            },
            item: {
              type: 'Feature',
              id: 'Radar tasking',
              stac_version: '1.0.0',
              properties: {
                datetime: '2024-12-31T17:16:54.829Z',
                constellation: 'Radar Constellation',
                platform: 'n/a',
                instrument: 'SAR',
                [InstructionNamesRRD.Azimuth]: 41.86,
                metadata_source: 'TASK',
                [InstructionNamesRRD.OrbitState]: 'ascending',
              },
            },
            scene_id: 478,
            product_options: [],
            ccme_name: 'Test',
          },
        ],
        quote_item_id: '301',
        product_id: '53',
        product_sku: 'Test',
        ccme_name: 'Test',
        logo_url: '',
        sensor_type: 'SAR',
      },
    ],
    quote_id: 388,
    order_type: ProviderModeSupport.archive,
    use_case: 'UC3',
  },
});

describe('RRD Add to Cart Query builder', () => {
  const searchFilter = createSearchFilter();
  const defaultBounds = createDefaultBounds();
  const opticalTestItem = createOpticalTestItem(defaultBounds);
  const radarTestItem = createRadarTestItem(defaultBounds);
  const cartItems = createCartItems();

  let mainMap = {
    bounds: {
      _southWest: { lat: 28.497660832963472, lng: -12.436523437500002 },
      _northEast: { lat: 65.10914820386476, lng: 53.96484375000001 },
    },
  };

  let aoi = { geometry: null };

  let resultsSection = {
    filtersForSearch: searchFilter,
  };

  let isTaskingEnabled = false;

  describe('Archive', () => {
    it('Create an add to cart query body for archive search with optical', () => {
      const addToCartBody = new RRDQueryBuilder(
        aoi,
        mainMap.bounds,
        undefined,
        undefined,
        undefined,
        resultsSection,
        isTaskingEnabled,
      ).createAddToCartRequestBody(opticalTestItem);
      const expectedAddToCartBody = {
        request: searchFilter.at(0),
        order_type: ProviderModeSupport.archive,
        collections: [
          {
            collection_id: 2,
            items: [opticalTestItem],
            product_options: [],
            source: 'MANUAL',
          },
        ],
      };

      expect(addToCartBody).toEqual(expectedAddToCartBody);
    });

    it('Create a remove from cart / removeSceneId query body', () => {
      const addToCartBody = new RRDQueryBuilder(
        aoi,
        mainMap.bounds,
        undefined,
        undefined,
        undefined,
        resultsSection,
        isTaskingEnabled,
      ).createRemoveFromCartRequestBody(radarTestItem, cartItems);
      const expectedAddToCartBody = {
        quote_item: '301',
        scene_ids: [478],
      };

      expect(addToCartBody).toEqual(expectedAddToCartBody);
    });
  });

  describe('Tasking', () => {
    beforeEach(() => {
      isTaskingEnabled = true;
    });

    it('Create an add to cart query body for tasking search with optical', () => {
      const addToCartBody = new RRDQueryBuilder(
        aoi,
        mainMap.bounds,
        undefined,
        undefined,
        undefined,
        resultsSection,
        isTaskingEnabled,
      ).createAddToCartRequestBody(opticalTestItem);
      const expectedAddToCartBody = {
        request: searchFilter.at(0),
        order_type: ProviderModeSupport.tasking,
        collections: [
          {
            collection_id: 2,
            items: [opticalTestItem],
            product_options: [],
            source: 'MANUAL',
          },
        ],
      };

      expect(addToCartBody).toEqual(expectedAddToCartBody);
    });

    it('Create a remove from cart / removeSceneId query body', () => {
      const addToCartBody = new RRDQueryBuilder(
        aoi,
        mainMap.bounds,
        undefined,
        undefined,
        undefined,
        resultsSection,
        isTaskingEnabled,
      ).createRemoveFromCartRequestBody(radarTestItem, cartItems);
      const expectedAddToCartBody = {
        quote_item: '301',
        scene_ids: [478],
      };

      expect(addToCartBody).toEqual(expectedAddToCartBody);
    });
  });
});
