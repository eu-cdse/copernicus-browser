import {
  uploadGeoFileErrorMessages,
  parseContent,
  UPLOAD_GEOMETRY_TYPE,
  SUPPORTED_GEOMETRY_TYPES,
  extractGeometriesFromGeoJson,
  createUnion,
  removeExtraCoordDimensionsIfNeeded,
} from './EOBUploadGeoFile.utils';

describe('parse wkt string', () => {
  test.each([
    [null, undefined, undefined, uploadGeoFileErrorMessages.ERROR_PARSING_FILE()],
    [undefined, undefined, undefined, uploadGeoFileErrorMessages.ERROR_PARSING_FILE()],
    ['', undefined, undefined, uploadGeoFileErrorMessages.ERROR_PARSING_FILE()],
    ['string', undefined, undefined, uploadGeoFileErrorMessages.ERROR_PARSING_FILE()],
    ['[1,2,3,4]', undefined, undefined, uploadGeoFileErrorMessages.ERROR_PARSING_FILE()],
    [
      'POINT (30 10)',
      undefined,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      'POINT (30 10)',
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      'POINT (30 10)',
      UPLOAD_GEOMETRY_TYPE.LINE,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE]),
    ],

    [
      'LINESTRING (30 10, 10 30, 40 40)',
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],

    [
      'LINESTRING (30 10, 10 30, 40 40)',
      UPLOAD_GEOMETRY_TYPE.LINE,
      {
        coordinates: [
          [30, 10],
          [10, 30],
          [40, 40],
        ],
        type: 'LineString',
      },
      false,
    ],

    [
      'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))',
      undefined,
      {
        type: 'Polygon',
        coordinates: [
          [
            [30, 10],
            [40, 40],
            [20, 40],
            [10, 20],
            [30, 10],
          ],
        ],
      },
      false,
    ],
    [
      'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))',
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      {
        type: 'Polygon',
        coordinates: [
          [
            [30, 10],
            [40, 40],
            [20, 40],
            [10, 20],
            [30, 10],
          ],
        ],
      },
      false,
    ],

    [
      'POLYGON ((30 10, 40 40, 20 40, 10 20, 30 10))',
      UPLOAD_GEOMETRY_TYPE.LINE,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE]),
    ],

    [
      'POLYGON ((35 10, 45 45, 15 40, 10 20, 35 10),(20 30, 35 35, 30 20, 20 30))',
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      {
        type: 'Polygon',
        coordinates: [
          [
            [35, 10],
            [45, 45],
            [15, 40],
            [10, 20],
            [35, 10],
          ],
          [
            [20, 30],
            [35, 35],
            [30, 20],
            [20, 30],
          ],
        ],
      },
      false,
    ],
    [
      'MULTIPOINT ((10 40), (40 30), (20 20), (30 10))',
      undefined,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      'MULTIPOINT ((10 40), (40 30), (20 20), (30 10))',
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      'MULTIPOINT ((10 40), (40 30), (20 20), (30 10))',
      UPLOAD_GEOMETRY_TYPE.LINE,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE]),
    ],
    [
      'MULTIPOINT (10 40, 40 30, 20 20, 30 10)',
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      'MULTILINESTRING ((10 10, 20 20, 10 40),(40 40, 30 30, 40 20, 30 10))',
      undefined,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      'MULTILINESTRING ((10 10, 20 20, 10 40),(40 40, 30 30, 40 20, 30 10))',
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      'MULTILINESTRING ((10 10, 20 20, 10 40),(40 40, 30 30, 40 20, 30 10))',
      UPLOAD_GEOMETRY_TYPE.LINE,
      {
        coordinates: [
          [
            [10, 10],
            [20, 20],
            [10, 40],
          ],
          [
            [40, 40],
            [30, 30],
            [40, 20],
            [30, 10],
          ],
        ],
        type: 'MultiLineString',
      },
      false,
    ],
    [
      'MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)),((15 5, 40 10, 10 20, 5 10, 15 5)))',
      undefined,
      {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [30, 20],
              [45, 40],
              [10, 40],
              [30, 20],
            ],
          ],
          [
            [
              [15, 5],
              [40, 10],
              [10, 20],
              [5, 10],
              [15, 5],
            ],
          ],
        ],
      },
      false,
    ],
    [
      'MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)),((15 5, 40 10, 10 20, 5 10, 15 5)))',
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [30, 20],
              [45, 40],
              [10, 40],
              [30, 20],
            ],
          ],
          [
            [
              [15, 5],
              [40, 10],
              [10, 20],
              [5, 10],
              [15, 5],
            ],
          ],
        ],
      },
      false,
    ],
    [
      'MULTIPOLYGON (((30 20, 45 40, 10 40, 30 20)),((15 5, 40 10, 10 20, 5 10, 15 5)))',
      UPLOAD_GEOMETRY_TYPE.LINE,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE]),
    ],
    [
      'MULTIPOLYGON (((40 40, 20 45, 45 30, 40 40)),((20 35, 10 30, 10 10, 30 5, 45 20, 20 35),(30 20, 20 15, 20 25, 30 20)))',
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      {
        type: 'MultiPolygon',
        coordinates: [
          [
            [
              [40, 40],
              [20, 45],
              [45, 30],
              [40, 40],
            ],
          ],
          [
            [
              [20, 35],
              [10, 30],
              [10, 10],
              [30, 5],
              [45, 20],
              [20, 35],
            ],
            [
              [30, 20],
              [20, 15],
              [20, 25],
              [30, 20],
            ],
          ],
        ],
      },
      false,
    ],
    ['POLYGON EMPTY', UPLOAD_GEOMETRY_TYPE.POLYGON, { type: 'Polygon', coordinates: [] }, false],
    [
      'POLYGON EMPTY',
      UPLOAD_GEOMETRY_TYPE.LINE,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE]),
    ],
    ['POLYGON 123,', UPLOAD_GEOMETRY_TYPE.POLYGON, { type: 'Polygon', coordinates: [] }, false],
    [
      'POLYGON 123,',
      UPLOAD_GEOMETRY_TYPE.LINE,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE]),
    ],

    ['POLYGON [1,2,3,4],', UPLOAD_GEOMETRY_TYPE.POLYGON, { type: 'Polygon', coordinates: [] }, false],
    [
      'POLYGON [1,2,3,4],',
      UPLOAD_GEOMETRY_TYPE.LINE,
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE]),
    ],

    ['POLYGON (),', UPLOAD_GEOMETRY_TYPE.POLYGON, undefined, uploadGeoFileErrorMessages.ERROR_PARSING_FILE()],
    ['POLYGON (),', UPLOAD_GEOMETRY_TYPE.LINE, undefined, uploadGeoFileErrorMessages.ERROR_PARSING_FILE()],
  ])('Test parseContent for wkt ', (inputString, uploadType, expectedResult, errorMessage) => {
    if (errorMessage) {
      expect(() => parseContent(inputString, uploadType, 'wkt')).toThrowError(errorMessage);
    } else {
      expect(parseContent(inputString, uploadType, 'wkt')).toStrictEqual(expectedResult);
    }
  });
});

describe('parse bbox string', () => {
  test.each([
    [
      '[1,2,3,4]',
      {
        type: 'Polygon',
        coordinates: [
          [
            [1, 2],
            [3, 2],
            [3, 4],
            [1, 4],
            [1, 2],
          ],
        ],
      },
      false,
    ],
    [null, undefined, true],
    [undefined, undefined, true],
    ['', undefined, true],
    ['not array', undefined, true],
    ['[]', undefined, true],
    ['[1]', undefined, true],
    ['[1,2]', undefined, true],
    ['[1,2,3]', undefined, true],
    ['[1,2,3,4,5]', undefined, true],
    ['[a,b,3,4]', undefined, true],
    ['[1 2 3 4]', undefined, true],
  ])('Test parseContent for bbox ', (inputString, expectedResult, shouldThrowError) => {
    if (shouldThrowError) {
      expect(() => parseContent(inputString, UPLOAD_GEOMETRY_TYPE.POLYGON, 'bbox')).toThrow();
    } else {
      expect(parseContent(inputString, UPLOAD_GEOMETRY_TYPE.POLYGON, 'bbox')).toStrictEqual(expectedResult);
    }
  });
});

const createPolygonFeature = (lng, lat) => {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      coordinates: [
        [
          [lng + 0, lat + 0],
          [lng + 0, lat + 1],
          [lng + 1, lat + 1],
          [lng + 1, lat + 0],
          [lng + 0, lat + 0],
        ],
      ],
      type: 'Polygon',
    },
  };
};

const createLineFeature = (lng, lat) => {
  return {
    type: 'Feature',
    properties: {},
    geometry: {
      coordinates: [
        [lng, lat],
        [lng + 1, lat + 1],
      ],
      type: 'LineString',
    },
  };
};

describe('extractGeometriesByType', () => {
  const polygon0 = createPolygonFeature(0, 0);
  const polygon1 = createPolygonFeature(1, 1);

  const multipolygon = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [102.0, 2.0],
            [103.0, 2.0],
            [103.0, 3.0],
            [102.0, 3.0],
            [102.0, 2.0],
          ],
        ],
        [
          [
            [100.0, 0.0],
            [101.0, 0.0],
            [101.0, 1.0],
            [100.0, 1.0],
            [100.0, 0.0],
          ],
          [
            [100.2, 0.2],
            [100.2, 0.8],
            [100.8, 0.8],
            [100.8, 0.2],
            [100.2, 0.2],
          ],
        ],
      ],
    },
  };

  const line0 = createLineFeature(0, 0);
  const line1 = createLineFeature(1, 2);

  const multiline = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [0, 0],
          [1, 1],
        ],
        [
          [2, 2],
          [3, 3],
        ],
      ],
    },
  };

  const point = {
    type: 'Feature',
    properties: {},
    geometry: {
      coordinates: [0, 0],
      type: 'Point',
    },
  };

  test.each([
    [null, undefined, undefined, uploadGeoFileErrorMessages.ERROR_PARSING_FILE()],
    [
      undefined,
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      undefined,
      uploadGeoFileErrorMessages.ERROR_PARSING_FILE(),
    ],
    [
      '',
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      undefined,
      uploadGeoFileErrorMessages.ERROR_PARSING_FILE(),
    ],
    [
      {},
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      undefined,
      uploadGeoFileErrorMessages.ERROR_PARSING_FILE(),
    ],
    [
      { type: 'invalid type' },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      undefined,
      uploadGeoFileErrorMessages.ERROR_PARSING_FILE(),
    ],

    [
      point,
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [polygon0, SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON], [polygon0.geometry], false],
    [polygon0, ['LineString'], undefined, uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(['LineString'])],
    [line0, SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE], [line0.geometry], false],
    [
      point,
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE],
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE]),
    ],
    [multipolygon, SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON], [multipolygon.geometry], false],
    [multiline, SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE], [multiline.geometry], false],
  ])('Test geojson type Feature', (inputGeoJson, allowedGeometryTypes, expectedResult, errorMessage) => {
    if (errorMessage) {
      expect(() => extractGeometriesFromGeoJson(inputGeoJson, allowedGeometryTypes)).toThrowError(
        errorMessage,
      );
    } else {
      expect(extractGeometriesFromGeoJson(inputGeoJson, allowedGeometryTypes)).toStrictEqual(expectedResult);
    }
  });

  test.each([
    [
      {
        type: 'FeatureCollection',
        features: [],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      [],
      false,
    ],

    [
      {
        type: 'FeatureCollection',
        features: [point],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      {
        type: 'FeatureCollection',
        features: [line0],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE],
      [line0.geometry],
      false,
    ],
    [
      {
        type: 'FeatureCollection',
        features: [polygon0],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      [polygon0.geometry],
      false,
    ],
    [
      {
        type: 'FeatureCollection',
        features: [polygon0, polygon1],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      [polygon0.geometry, polygon1.geometry],
      false,
    ],
    [
      {
        type: 'FeatureCollection',
        features: [line0, line1],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE],
      [line0.geometry, line1.geometry],
      false,
    ],
    [
      {
        type: 'FeatureCollection',
        features: [line0, polygon0, line1, polygon1],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE],
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE]),
    ],
    [
      {
        type: 'FeatureCollection',
        features: [line0, polygon0, line1, polygon1],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      {
        type: 'FeatureCollection',
        features: [line0, multiline],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE],
      [line0.geometry, multiline.geometry],
      false,
    ],
    [
      {
        type: 'FeatureCollection',
        features: [polygon0, multipolygon],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      [polygon0.geometry, multipolygon.geometry],
      false,
    ],
    [
      {
        type: 'FeatureCollection',
        features: [line0, line1, point],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE],
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE]),
    ],
  ])(
    'Test geojson type FeatureCollection',
    (inputGeoJson, allowedGeometryTypes, expectedResult, errorMessage) => {
      if (errorMessage) {
        expect(() => extractGeometriesFromGeoJson(inputGeoJson, allowedGeometryTypes)).toThrowError(
          errorMessage,
        );
      } else {
        expect(extractGeometriesFromGeoJson(inputGeoJson, allowedGeometryTypes)).toStrictEqual(
          expectedResult,
        );
      }
    },
  );

  test.each([
    [
      {
        type: 'GeometryCollection',
        geometries: [],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      [],
      false,
    ],
    [
      {
        type: 'GeometryCollection',
        geometries: [line0.geometry],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE],
      [line0.geometry],
      false,
    ],
    [
      {
        type: 'GeometryCollection',
        geometries: [polygon0.geometry],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      [polygon0.geometry],
      false,
    ],
    [
      {
        type: 'GeometryCollection',
        geometries: [point.geometry],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      {
        type: 'GeometryCollection',
        geometries: [line0.geometry, polygon0.geometry, multipolygon.geometry, multiline.geometry],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      undefined,
      uploadGeoFileErrorMessages.UNSUPORTED_GEOJSON_TYPE(
        SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      ),
    ],
    [
      {
        type: 'GeometryCollection',
        geometries: [polygon0.geometry, polygon1.geometry, multipolygon.geometry],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.POLYGON],
      [polygon0.geometry, polygon1.geometry, multipolygon.geometry],
      false,
    ],
    [
      {
        type: 'GeometryCollection',
        geometries: [line0.geometry, multiline.geometry],
      },
      SUPPORTED_GEOMETRY_TYPES[UPLOAD_GEOMETRY_TYPE.LINE],
      [line0.geometry, multiline.geometry],
      false,
    ],
  ])(
    'Test geojson type GeometryCollection',
    (inputGeoJson, allowedGeometryTypes, expectedResult, errorMessage) => {
      if (errorMessage) {
        expect(() => extractGeometriesFromGeoJson(inputGeoJson, allowedGeometryTypes)).toThrowError(
          errorMessage,
        );
      } else {
        expect(extractGeometriesFromGeoJson(inputGeoJson, allowedGeometryTypes)).toStrictEqual(
          expectedResult,
        );
      }
    },
  );
});

describe('createUnion', () => {
  const polygon0 = createPolygonFeature(0, 0);
  const polygon1 = createPolygonFeature(2, 2);

  const line0 = createLineFeature(0, 0);
  const line1 = createLineFeature(1, 2);

  const multiline = {
    type: 'Feature',
    properties: {},
    geometry: {
      type: 'MultiLineString',
      coordinates: [
        [
          [0, 0],
          [1, 1],
        ],
        [
          [2, 2],
          [3, 3],
        ],
      ],
    },
  };

  test.each([
    [undefined, UPLOAD_GEOMETRY_TYPE.POLYGON, null, false],
    [null, UPLOAD_GEOMETRY_TYPE.POLYGON, null, false],
    [[], UPLOAD_GEOMETRY_TYPE.POLYGON, null, false],
    [{}, UPLOAD_GEOMETRY_TYPE.POLYGON, null, false],
    ['not-array', UPLOAD_GEOMETRY_TYPE.POLYGON, null, false],
    [
      [polygon0.geometry],
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      {
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0],
          ],
        ],
        type: 'Polygon',
      },
      false,
    ],
    [
      [polygon0.geometry, polygon1],
      UPLOAD_GEOMETRY_TYPE.POLYGON,
      {
        coordinates: [
          [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
          [
            [
              [2, 2],
              [3, 2],
              [3, 3],
              [2, 3],
              [2, 2],
            ],
          ],
        ],
        type: 'MultiPolygon',
      },
      false,
    ],
    [
      [line0.geometry],
      UPLOAD_GEOMETRY_TYPE.LINE,
      {
        coordinates: [
          [0, 0],
          [1, 1],
        ],
        type: 'LineString',
      },
      false,
    ],
    [
      [line0.geometry, line1.geometry],
      UPLOAD_GEOMETRY_TYPE.LINE,
      {
        coordinates: [
          [
            [0, 0],
            [1, 1],
          ],
          [
            [1, 2],
            [2, 3],
          ],
        ],
        type: 'MultiLineString',
      },
      false,
    ],

    [
      [createLineFeature(3, 3).geometry, multiline.geometry, createLineFeature(0, 1).geometry],
      UPLOAD_GEOMETRY_TYPE.LINE,
      {
        coordinates: [
          [
            [3, 3],
            [4, 4],
          ],
          [
            [0, 0],
            [1, 1],
          ],
          [
            [2, 2],
            [3, 3],
          ],
          [
            [0, 1],
            [1, 2],
          ],
        ],
        type: 'MultiLineString',
      },
      false,
    ],
  ])('Test createUnion', (geometries, type, expectedResult, errorMessage) => {
    if (errorMessage) {
      expect(() => createUnion(geometries, type)).toThrowError(errorMessage);
    } else {
      expect(createUnion(geometries, type)).toStrictEqual(expectedResult);
    }
  });
});

describe('removeExtraCoordDimensionsIfNeeded', () => {
  test.each([
    [undefined, null, false],
    [null, null, false],
    [{}, null, uploadGeoFileErrorMessages.ERROR_PARSING_GEOMETRY()],
    [
      {
        coordinates: [0, 0],
        type: 'Point',
      },
      {
        coordinates: [0, 0],
        type: 'Point',
      },
      false,
    ],
    [
      {
        coordinates: [0, 0, 1],
        type: 'Point',
      },
      {
        coordinates: [0, 0],
        type: 'Point',
      },
      false,
    ],

    [
      {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
      {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
      false,
    ],

    [
      {
        type: 'LineString',
        coordinates: [
          [0, 0, 1],
          [1, 1, 1],
        ],
      },
      {
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
        ],
      },
      false,
    ],

    [
      {
        type: 'MultiLineString',
        coordinates: [
          [
            [0, 0],
            [1, 1],
          ],
          [
            [2, 2],
            [3, 3],
          ],
        ],
      },
      {
        type: 'MultiLineString',
        coordinates: [
          [
            [0, 0],
            [1, 1],
          ],
          [
            [2, 2],
            [3, 3],
          ],
        ],
      },
      false,
    ],
    [
      {
        type: 'MultiLineString',
        coordinates: [
          [
            [0, 0, 1],
            [1, 1, 2],
          ],
          [
            [2, 2, 3],
            [3, 3, 4],
          ],
        ],
      },
      {
        type: 'MultiLineString',
        coordinates: [
          [
            [0, 0],
            [1, 1],
          ],
          [
            [2, 2],
            [3, 3],
          ],
        ],
      },
      false,
    ],
    [
      {
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0],
          ],
        ],
        type: 'Polygon',
      },
      {
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0],
          ],
        ],
        type: 'Polygon',
      },
      false,
    ],
    [
      {
        coordinates: [
          [
            [0, 0, 1],
            [0, 1, 2],
            [1, 1, 3],
            [1, 0, 4],
            [0, 0, 5],
          ],
        ],
        type: 'Polygon',
      },
      {
        coordinates: [
          [
            [0, 0],
            [0, 1],
            [1, 1],
            [1, 0],
            [0, 0],
          ],
        ],
        type: 'Polygon',
      },
      false,
    ],
    [
      {
        coordinates: [
          [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
          [
            [
              [2, 2],
              [3, 2],
              [3, 3],
              [2, 3],
              [2, 2],
            ],
          ],
        ],
        type: 'MultiPolygon',
      },
      {
        coordinates: [
          [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
          [
            [
              [2, 2],
              [3, 2],
              [3, 3],
              [2, 3],
              [2, 2],
            ],
          ],
        ],
        type: 'MultiPolygon',
      },
      false,
    ],
    [
      {
        coordinates: [
          [
            [
              [0, 0, 1],
              [1, 0, 2],
              [1, 1, 3],
              [0, 1, 4],
              [0, 0, 5],
            ],
          ],
          [
            [
              [2, 2, 1],
              [3, 2, 2],
              [3, 3, 3],
              [2, 3, 3],
              [2, 2, 4],
            ],
          ],
        ],
        type: 'MultiPolygon',
      },
      {
        coordinates: [
          [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
          [
            [
              [2, 2],
              [3, 2],
              [3, 3],
              [2, 3],
              [2, 2],
            ],
          ],
        ],
        type: 'MultiPolygon',
      },
      false,
    ],
    [
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [3, 4, 100],
                [5, 6, 200],
              ],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [
                [
                  [0, 0, 200],
                  [0, 1, 200],
                  [1, 1, 200],
                  [1, 0, 200],
                  [0, 0, 200],
                ],
              ],
              type: 'Polygon',
            },
          },
        ],
      },
      {
        type: 'FeatureCollection',
        features: [
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [0, 0],
                [1, 1],
              ],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              type: 'LineString',
              coordinates: [
                [3, 4],
                [5, 6],
              ],
            },
          },
          {
            type: 'Feature',
            properties: {},
            geometry: {
              coordinates: [
                [
                  [0, 0],
                  [0, 1],
                  [1, 1],
                  [1, 0],
                  [0, 0],
                ],
              ],
              type: 'Polygon',
            },
          },
        ],
      },
      false,
    ],
  ])('Test createUnion', (geometry, expectedResult, errorMessage) => {
    if (errorMessage) {
      expect(() => removeExtraCoordDimensionsIfNeeded(geometry)).toThrowError(errorMessage);
    } else {
      expect(removeExtraCoordDimensionsIfNeeded(geometry)).toStrictEqual(expectedResult);
    }
  });
});
