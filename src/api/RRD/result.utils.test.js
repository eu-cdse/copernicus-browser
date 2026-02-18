import {
  extractFeaturesFromRRDResponse,
  ensureInternalFeatureIds,
  validateResultsGeometry,
  validateAndPrepareRRDResults,
} from './result.utils';

const makeFeature = (id, geometry) => ({ id, geometry });
const validPolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [0, 0],
      [1, 0],
      [1, 1],
      [0, 1],
      [0, 0],
    ],
  ],
};

describe('extractFeaturesFromRRDResponse', () => {
  it('extracts features from single response', () => {
    const response = { features: [makeFeature('1', validPolygon)] };
    const features = extractFeaturesFromRRDResponse(response);
    expect(features.length).toBe(1);
    expect(features[0].id).toBe('1');
  });

  it('extracts and flattens features from array response', () => {
    const response = [
      { features: [makeFeature('1', validPolygon)] },
      { features: [makeFeature('2', validPolygon)] },
    ];
    const features = extractFeaturesFromRRDResponse(response);
    expect(features.map((f) => f.id)).toEqual(['1', '2']);
  });

  it('handles array items with missing or empty features', () => {
    const response = [
      { features: [makeFeature('1', validPolygon)] },
      { foo: 'bar' }, // no features
      { features: [] }, // empty features
    ];
    const features = extractFeaturesFromRRDResponse(response);
    expect(features.map((f) => f.id)).toEqual(['1']);
  });
});

describe('validateResultsGeometry', () => {
  it('returns empty partitions for non-array inputs', () => {
    expect(validateResultsGeometry(null)).toEqual({ valid: [], invalid: [] });
    expect(validateResultsGeometry(undefined)).toEqual({ valid: [], invalid: [] });
    expect(validateResultsGeometry({})).toEqual({ valid: [], invalid: [] });
  });

  it('marks entries without geometry as invalid', () => {
    const noGeometry = { id: 'nogeo', properties: { name: 'test' } };
    const withGeometry = {
      id: 'ok',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
      },
    };

    const result = validateResultsGeometry([noGeometry, withGeometry]);
    expect(result.valid).toEqual([withGeometry]);
    expect(result.invalid).toEqual([noGeometry]);
  });

  it('accepts valid Polygon geometry', () => {
    const validPolygon = {
      id: 'poly',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
      },
    };

    const result = validateResultsGeometry([validPolygon]);
    expect(result.valid).toEqual([validPolygon]);
    expect(result.invalid).toEqual([]);
  });

  it('rejects Polygon with invalid structure (capitalized fields)', () => {
    const invalid = {
      id: '1',
      geometry: {
        Type: 'Polygon',
        Coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
      },
    };
    const valid = {
      id: '2',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            [0, 1],
            [0, 0],
          ],
        ],
      },
    };

    const result = validateResultsGeometry([invalid, valid]);

    expect(result.valid).toEqual([valid]);
    expect(result.invalid).toEqual([invalid]);
  });

  it('rejects Polygon with unclosed ring', () => {
    const unclosedPolygon = {
      id: 'unclosed',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [2.56489, 41.7756],
            [2.52486, 41.8964],
            [2.67124, 41.923],
            [2.71102, 41.8022],
            // Missing closing point
          ],
        ],
      },
    };

    const result = validateResultsGeometry([unclosedPolygon]);
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([unclosedPolygon]);
  });

  it('rejects Polygon with insufficient points in ring', () => {
    const shortRingPolygon = {
      id: 'short_ring',
      geometry: {
        type: 'Polygon',
        coordinates: [
          [
            [0, 0],
            [1, 0],
            [1, 1],
            // needs at least 4 points (3 unique + closing)
          ],
        ],
      },
    };

    const result = validateResultsGeometry([shortRingPolygon]);
    expect(result.valid).toEqual([]);
    expect(result.invalid).toEqual([shortRingPolygon]);
  });
});

describe('ensureInternalFeatureIds', () => {
  it('returns [] for empty array', () => {
    expect(ensureInternalFeatureIds([])).toEqual([]);
  });

  it('adds _internalId to each feature and preserves fields', () => {
    const input = [makeFeature('a', validPolygon)];
    const withIds = ensureInternalFeatureIds(input);
    expect(withIds.length).toBe(1);
    expect(withIds[0].id).toBe('a');
    expect(withIds[0]).toHaveProperty('_internalId');
    expect(typeof withIds[0]._internalId).toBe('string');
    expect(withIds[0]._internalId.length).toBeGreaterThan(0);
  });

  it('generates unique _internalId values across features', () => {
    const input = [
      makeFeature('a', validPolygon),
      makeFeature('b', validPolygon),
      makeFeature('c', validPolygon),
    ];
    const withIds = ensureInternalFeatureIds(input);
    const ids = withIds.map((f) => f._internalId);
    expect(new Set(ids).size).toBe(ids.length);
  });
});

describe('validateAndPrepareRRDResults', () => {
  it('drops invalid geometry and reports it', () => {
    const response = { features: [makeFeature('1', { type: 'Polygon' })] }; // missing coordinates
    const prepared = validateAndPrepareRRDResults(response);

    expect(prepared.validResults).toEqual([]);
    expect(prepared.invalidResults.map((f) => f.id)).toEqual(['1']);
  });

  it('keeps valid geometry and adds internal ids', () => {
    const response = {
      features: [makeFeature('p', validPolygon)],
    };
    const prepared = validateAndPrepareRRDResults(response);

    expect(prepared.validResults.length).toBe(1);
    expect(prepared.validResults[0].geometry).toEqual(validPolygon);
    expect(typeof prepared.validResults[0]._internalId).toBe('string');
    expect(prepared.invalidResults).toEqual([]);
  });

  it('filters invalid and valid features from mixed response', () => {
    const response = {
      features: [
        makeFeature('1', { type: 'Polygon' }), // missing coordinates
        makeFeature('2', {
          Type: 'Polygon',
          coordinates: [
            [
              [0, 0],
              [1, 0],
              [1, 1],
              [0, 1],
              [0, 0],
            ],
          ],
        }), // capitalized Type
        makeFeature('3', validPolygon),
      ],
    };
    const prepared = validateAndPrepareRRDResults(response);

    expect(prepared.validResults.map((f) => f.id)).toEqual(['3']);
    expect(prepared.invalidResults.map((f) => f.id)).toEqual(['1', '2']);
    expect(prepared.validResults.every((f) => f._internalId)).toBe(true);
  });
});
