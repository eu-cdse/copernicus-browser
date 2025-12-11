import {
  buildSearchGeometry,
  countGeometryVertices,
  geometryToBBoxGeometry,
  boundsToPolygon,
  estimateWktLength,
  DEFAULT_MAX_GEOMETRY_CHARS,
} from './geojson.utils';

// Helper to create a mock Leaflet bounds object
const createMockBounds = (southWest, northEast) => ({
  _southWest: { lat: southWest[0], lng: southWest[1] },
  _northEast: { lat: northEast[0], lng: northEast[1] },
});

// Simple polygon with 5 vertices (a rectangle) - well under default char limit
const simplePolygon = {
  type: 'Polygon',
  coordinates: [
    [
      [10, 40],
      [20, 40],
      [20, 50],
      [10, 50],
      [10, 40],
    ],
  ],
};

// Polygon with 20 vertices - under default 500 char limit (~372 chars estimated)
const polygon20Vertices = {
  type: 'Polygon',
  coordinates: [
    Array.from({ length: 20 }, (_, i) => {
      const angle = (i / 20) * 2 * Math.PI;
      return [Math.cos(angle) * 10, Math.sin(angle) * 10];
    }),
  ],
};

// Polygon with 27 vertices - just under default 500 char limit (~498 chars estimated)
const polygon27Vertices = {
  type: 'Polygon',
  coordinates: [
    Array.from({ length: 27 }, (_, i) => {
      const angle = (i / 27) * 2 * Math.PI;
      return [Math.cos(angle) * 10, Math.sin(angle) * 10];
    }),
  ],
};

// Polygon with 28 vertices - just over default 500 char limit (~516 chars estimated)
const polygon28Vertices = {
  type: 'Polygon',
  coordinates: [
    Array.from({ length: 28 }, (_, i) => {
      const angle = (i / 28) * 2 * Math.PI;
      return [Math.cos(angle) * 10, Math.sin(angle) * 10];
    }),
  ],
};

// Complex polygon with many vertices (150) - well over default limit
const complexPolygon = {
  type: 'Polygon',
  coordinates: [
    Array.from({ length: 150 }, (_, i) => {
      const angle = (i / 150) * 2 * Math.PI;
      return [Math.cos(angle) * 10 + 15, Math.sin(angle) * 10 + 45];
    }),
  ],
};

// MultiPolygon with total vertices under 100
const simpleMultiPolygon = {
  type: 'MultiPolygon',
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
};

// MultiPolygon with total vertices over 100
const complexMultiPolygon = {
  type: 'MultiPolygon',
  coordinates: [
    [
      Array.from({ length: 60 }, (_, i) => {
        const angle = (i / 60) * 2 * Math.PI;
        return [Math.cos(angle) * 5, Math.sin(angle) * 5];
      }),
    ],
    [
      Array.from({ length: 60 }, (_, i) => {
        const angle = (i / 60) * 2 * Math.PI;
        return [Math.cos(angle) * 5 + 20, Math.sin(angle) * 5 + 20];
      }),
    ],
  ],
};

describe('countGeometryVertices', () => {
  test('counts vertices in a simple Polygon', () => {
    expect(countGeometryVertices(simplePolygon)).toBe(5);
  });

  test('counts vertices in a Polygon with 20 vertices', () => {
    expect(countGeometryVertices(polygon20Vertices)).toBe(20);
  });

  test('counts vertices in a Polygon with 27 vertices', () => {
    expect(countGeometryVertices(polygon27Vertices)).toBe(27);
  });

  test('counts vertices in a Polygon with 28 vertices', () => {
    expect(countGeometryVertices(polygon28Vertices)).toBe(28);
  });

  test('counts vertices in a simple MultiPolygon', () => {
    // Two polygons with 5 vertices each = 10 total
    expect(countGeometryVertices(simpleMultiPolygon)).toBe(10);
  });

  test('counts vertices in a complex MultiPolygon', () => {
    // Two polygons with 60 vertices each = 120 total
    expect(countGeometryVertices(complexMultiPolygon)).toBe(120);
  });

  test('returns 0 for null geometry', () => {
    expect(countGeometryVertices(null)).toBe(0);
  });

  test('returns 0 for undefined geometry', () => {
    expect(countGeometryVertices(undefined)).toBe(0);
  });

  test('returns 0 for geometry without coordinates', () => {
    expect(countGeometryVertices({ type: 'Polygon' })).toBe(0);
  });

  test('counts vertices in a Point', () => {
    expect(countGeometryVertices({ type: 'Point', coordinates: [10, 20] })).toBe(1);
  });

  test('counts vertices in a LineString', () => {
    expect(
      countGeometryVertices({
        type: 'LineString',
        coordinates: [
          [0, 0],
          [1, 1],
          [2, 2],
        ],
      }),
    ).toBe(3);
  });
});

describe('geometryToBBoxGeometry', () => {
  test('converts a Polygon to its bounding box', () => {
    const result = geometryToBBoxGeometry(simplePolygon);

    expect(result.type).toBe('Polygon');
    // Bounding box should be [10, 40] to [20, 50]
    // Verify it's a rectangle (5 coordinates forming a closed ring)
    expect(result.coordinates[0]).toHaveLength(5);

    // Extract min/max from the bbox polygon
    const coords = result.coordinates[0];
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);

    expect(Math.min(...lngs)).toBe(10);
    expect(Math.max(...lngs)).toBe(20);
    expect(Math.min(...lats)).toBe(40);
    expect(Math.max(...lats)).toBe(50);
  });

  test('converts a MultiPolygon with non-overlapping polygons to MultiPolygon of bboxes', () => {
    const result = geometryToBBoxGeometry(simpleMultiPolygon);

    // Non-overlapping polygons should remain as MultiPolygon
    expect(result.type).toBe('MultiPolygon');
    expect(result.coordinates).toHaveLength(2);

    // Each polygon should be converted to a bbox (5 vertices)
    expect(result.coordinates[0][0]).toHaveLength(5);
    expect(result.coordinates[1][0]).toHaveLength(5);
  });

  test('merges overlapping polygons into a unified polygon', () => {
    // Two overlapping polygons - their bboxes will intersect
    const overlappingMultiPolygon = {
      type: 'MultiPolygon',
      coordinates: [
        [
          [
            [0, 0],
            [2, 0],
            [2, 2],
            [0, 2],
            [0, 0],
          ],
        ],
        [
          [
            [1, 1],
            [3, 1],
            [3, 3],
            [1, 3],
            [1, 1],
          ],
        ],
      ],
    };

    const result = geometryToBBoxGeometry(overlappingMultiPolygon);

    // Overlapping bboxes should be merged into a single Polygon (L-shape union)
    expect(result.type).toBe('Polygon');

    // The merged polygon should encompass both: [0,0] to [3,3]
    const coords = result.coordinates[0];
    const lngs = coords.map((c) => c[0]);
    const lats = coords.map((c) => c[1]);

    expect(Math.min(...lngs)).toBe(0);
    expect(Math.max(...lngs)).toBe(3);
    expect(Math.min(...lats)).toBe(0);
    expect(Math.max(...lats)).toBe(3);
  });

  test('returns null for null input', () => {
    expect(geometryToBBoxGeometry(null)).toBeNull();
  });

  test('returns geometry as-is for Point', () => {
    const point = { type: 'Point', coordinates: [10, 20] };
    expect(geometryToBBoxGeometry(point)).toEqual(point);
  });
});

describe('estimateWktLength', () => {
  test('estimates WKT length for a simple Polygon', () => {
    // 5 vertices, Polygon: 12 + 5*18 = 102
    const estimate = estimateWktLength(simplePolygon);
    expect(estimate).toBe(102);
  });

  test('estimates WKT length for Polygon with 20 vertices', () => {
    // 20 vertices, Polygon: 12 + 20*18 = 372
    const estimate = estimateWktLength(polygon20Vertices);
    expect(estimate).toBe(372);
  });

  test('estimates WKT length for a simple MultiPolygon', () => {
    // 10 vertices total, 2 polygons, MultiPolygon: 15 + 2*4 + 10*18 = 203
    const estimate = estimateWktLength(simpleMultiPolygon);
    expect(estimate).toBe(203);
  });

  test('estimates WKT length for complex MultiPolygon', () => {
    // 120 vertices total, 2 polygons, MultiPolygon: 15 + 2*4 + 120*18 = 2183
    const estimate = estimateWktLength(complexMultiPolygon);
    expect(estimate).toBe(2183);
  });

  test('returns 0 for null geometry', () => {
    expect(estimateWktLength(null)).toBe(0);
  });

  test('returns 0 for undefined geometry', () => {
    expect(estimateWktLength(undefined)).toBe(0);
  });

  test('default max geometry chars is 500', () => {
    // Verify the constant is exported and has expected value
    expect(DEFAULT_MAX_GEOMETRY_CHARS).toBe(500);
  });
});

describe('buildSearchGeometry', () => {
  const mockMapBounds = createMockBounds([40, 10], [50, 20]);
  const mockAoiBounds = createMockBounds([41, 11], [49, 19]);
  const mockPoiBounds = createMockBounds([42, 12], [48, 18]);

  describe('WKT character threshold behavior', () => {
    test('uses original geometry when estimated WKT length is under default limit', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({ aoiGeometry: simplePolygon });

      // Should return original geometry unchanged
      expect(geometry).toEqual(simplePolygon);
      expect(wasSimplified).toBe(false);
    });

    test('uses original geometry when estimated WKT length is under default limit (20 vertices)', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({ aoiGeometry: polygon20Vertices });

      // Should return original geometry unchanged
      expect(geometry).toEqual(polygon20Vertices);
      expect(wasSimplified).toBe(false);
    });

    test('uses original geometry when estimated WKT length is at boundary (27 vertices ~498 chars)', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({ aoiGeometry: polygon27Vertices });

      // 27 vertices = 12 + 27*18 = 498 chars, under 500 limit
      // Should return original geometry unchanged
      expect(geometry).toEqual(polygon27Vertices);
      expect(wasSimplified).toBe(false);
    });

    test('simplifies geometry to bbox when estimated WKT length exceeds default limit', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({ aoiGeometry: polygon28Vertices });

      // 28 vertices = 12 + 28*18 = 516 chars, over 500 limit
      // Should be simplified to a bbox (5 vertices rectangle)
      expect(geometry.type).toBe('Polygon');
      expect(geometry.coordinates[0]).toHaveLength(5);
      expect(geometry).not.toEqual(polygon28Vertices);
      expect(wasSimplified).toBe(true);
    });

    test('simplifies complex polygon to bbox', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({ aoiGeometry: complexPolygon });

      expect(geometry.type).toBe('Polygon');
      // Should be a rectangle (5 vertices)
      expect(geometry.coordinates[0]).toHaveLength(5);
      expect(wasSimplified).toBe(true);
    });

    test('uses original MultiPolygon when total estimated WKT length is under limit', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({ aoiGeometry: simpleMultiPolygon });

      expect(geometry).toEqual(simpleMultiPolygon);
      expect(wasSimplified).toBe(false);
    });

    test('simplifies MultiPolygon to bbox MultiPolygon when estimated WKT length exceeds limit', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({ aoiGeometry: complexMultiPolygon });

      expect(geometry.type).toBe('MultiPolygon');
      expect(geometry.coordinates).toHaveLength(2);
      // Each polygon should be simplified to 5 vertices
      expect(geometry.coordinates[0][0]).toHaveLength(5);
      expect(geometry.coordinates[1][0]).toHaveLength(5);
      expect(wasSimplified).toBe(true);
    });

    test('respects custom maxGeometryChars parameter - lower limit', () => {
      // With maxGeometryChars=50, even simple polygon should be simplified
      const { geometry, wasSimplified } = buildSearchGeometry({
        aoiGeometry: simplePolygon,
        maxGeometryChars: 50,
      });

      // estimateWktLength for simplePolygon (5 vertices) = 12 + 5*18 = 102 chars
      // Since 102 > 50, it should be simplified
      expect(geometry.type).toBe('Polygon');
      expect(geometry.coordinates[0]).toHaveLength(5);
      expect(wasSimplified).toBe(true);
    });

    test('respects custom maxGeometryChars parameter - higher limit', () => {
      // With maxGeometryChars=2000, even polygon28Vertices should not be simplified
      const { geometry, wasSimplified } = buildSearchGeometry({
        aoiGeometry: polygon28Vertices,
        maxGeometryChars: 2000,
      });

      // estimateWktLength for polygon28Vertices = 12 + 28*18 = 516 chars
      // Since 516 < 2000, it should not be simplified
      expect(geometry).toEqual(polygon28Vertices);
      expect(wasSimplified).toBe(false);
    });
  });

  describe('bbox conversion correctness', () => {
    test('bbox preserves the extent of the original polygon', () => {
      const trianglePolygon = {
        type: 'Polygon',
        coordinates: [
          Array.from({ length: 150 }, (_, i) => {
            // Create a triangle-ish shape with many vertices
            const t = i / 150;
            if (t < 0.33) {
              return [0 + t * 30, 0];
            }
            if (t < 0.66) {
              return [10, (t - 0.33) * 60];
            }
            return [10 - (t - 0.66) * 30, 20 - (t - 0.66) * 60];
          }),
        ],
      };

      const { geometry, wasSimplified } = buildSearchGeometry({ aoiGeometry: trianglePolygon });

      expect(wasSimplified).toBe(true);

      // Get original extent
      const originalCoords = trianglePolygon.coordinates[0];
      const originalMinLng = Math.min(...originalCoords.map((c) => c[0]));
      const originalMaxLng = Math.max(...originalCoords.map((c) => c[0]));
      const originalMinLat = Math.min(...originalCoords.map((c) => c[1]));
      const originalMaxLat = Math.max(...originalCoords.map((c) => c[1]));

      // Get bbox extent
      const bboxCoords = geometry.coordinates[0];
      const bboxMinLng = Math.min(...bboxCoords.map((c) => c[0]));
      const bboxMaxLng = Math.max(...bboxCoords.map((c) => c[0]));
      const bboxMinLat = Math.min(...bboxCoords.map((c) => c[1]));
      const bboxMaxLat = Math.max(...bboxCoords.map((c) => c[1]));

      // Bbox should have same extent as original
      expect(bboxMinLng).toBeCloseTo(originalMinLng, 5);
      expect(bboxMaxLng).toBeCloseTo(originalMaxLng, 5);
      expect(bboxMinLat).toBeCloseTo(originalMinLat, 5);
      expect(bboxMaxLat).toBeCloseTo(originalMaxLat, 5);
    });
  });

  describe('fallback priority', () => {
    test('aoiGeometry takes priority over all bounds', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({
        mapBounds: mockMapBounds,
        aoiBounds: mockAoiBounds,
        poiBounds: mockPoiBounds,
        aoiGeometry: simplePolygon,
      });

      expect(geometry).toEqual(simplePolygon);
      expect(wasSimplified).toBe(false);
    });

    test('combines aoiBounds and poiBounds when both exist and no aoiGeometry', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({
        mapBounds: mockMapBounds,
        aoiBounds: mockAoiBounds,
        poiBounds: mockPoiBounds,
      });

      // Should be a MultiPolygon combining both
      expect(geometry.type).toBe('MultiPolygon');
      expect(geometry.coordinates).toHaveLength(2);
      expect(wasSimplified).toBe(false);
    });

    test('uses aoiBounds when only aoiBounds exists', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({
        mapBounds: mockMapBounds,
        aoiBounds: mockAoiBounds,
      });

      expect(geometry.type).toBe('Polygon');
      // Should match aoiBounds extent
      const coords = geometry.coordinates[0];
      expect(coords[0]).toEqual([11, 41]); // SW corner
      expect(wasSimplified).toBe(false);
    });

    test('uses poiBounds when only poiBounds exists', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({
        mapBounds: mockMapBounds,
        poiBounds: mockPoiBounds,
      });

      expect(geometry.type).toBe('Polygon');
      // Should match poiBounds extent
      const coords = geometry.coordinates[0];
      expect(coords[0]).toEqual([12, 42]); // SW corner
      expect(wasSimplified).toBe(false);
    });

    test('falls back to mapBounds when no other geometry exists', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({
        mapBounds: mockMapBounds,
      });

      expect(geometry.type).toBe('Polygon');
      // Should match mapBounds extent
      const coords = geometry.coordinates[0];
      expect(coords[0]).toEqual([10, 40]); // SW corner
      expect(wasSimplified).toBe(false);
    });

    test('returns null geometry when no geometry or bounds provided', () => {
      const { geometry, wasSimplified } = buildSearchGeometry({});

      expect(geometry).toBeNull();
      expect(wasSimplified).toBe(false);
    });
  });
});

describe('boundsToPolygon', () => {
  test('converts Leaflet bounds to GeoJSON Polygon', () => {
    const bounds = createMockBounds([40, 10], [50, 20]);
    const result = boundsToPolygon(bounds);

    expect(result.type).toBe('Polygon');
    expect(result.coordinates[0]).toHaveLength(5);

    // Verify corners
    const coords = result.coordinates[0];
    expect(coords[0]).toEqual([10, 40]); // SW
    expect(coords[1]).toEqual([20, 40]); // SE
    expect(coords[2]).toEqual([20, 50]); // NE
    expect(coords[3]).toEqual([10, 50]); // NW
    expect(coords[4]).toEqual([10, 40]); // Close ring (back to SW)
  });
});
