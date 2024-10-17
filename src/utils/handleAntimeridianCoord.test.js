import {
  multiPolygonCoordinatesNormalization,
  polygonCoordinatesNormalization,
  unNormalizeMultiPolygonCoordinates,
} from './handelAntimeridianCoord.utils';

const originalMultiPolygon_1 = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [179.5, -15.0],
        [179.8, -15.2],
        [179.7, -15.5],
        [179.4, -15.3],
        [179.5, -15.0],
      ],
    ],
    [
      [
        [179.8, -16.0],
        [180.2, -16.2],
        [180.3, -16.5],
        [179.9, -16.3],
        [179.8, -16.0],
      ],
    ],
    [
      [
        [-179.9, -14.0],
        [-180.1, -14.2],
        [-179.7, -14.5],
        [-179.8, -14.3],
        [-179.9, -14.0],
      ],
    ],
    [
      [
        [178.5, -13.0],
        [179.0, -13.2],
        [179.1, -13.5],
        [178.6, -13.3],
        [178.5, -13.0],
      ],
    ],
  ],
};

const originalMultiPolygon_2 = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [179.9, -30.0],
        [180.4, -30.2],
        [179.7, -30.5],
        [179.6, -30.3],
        [179.9, -30.0],
      ],
    ],
    [
      [
        [150.0, -10.0],
        [151.0, -10.2],
        [151.5, -10.5],
        [150.2, -10.3],
        [150.0, -10.0],
      ],
    ],
    [
      [
        [-180.5, 10.0],
        [-169.8, 10.2],
        [-169.5, 10.5],
        [-170.2, 10.3],
        [-170.0, 10.0],
        [-180.5, 10.0],
      ],
    ],
  ],
};

const originalPolygon_1 = {
  type: 'Polygon',
  coordinates: [
    [
      [179.7, -20.0],
      [180.5, -20.2],
      [-179.9, -20.5],
      [-179.5, -20.3],
      [179.7, -20.0],
    ],
  ],
};

const originalPolygon_2 = {
  type: 'Polygon',
  coordinates: [
    [
      [179.5, -15.0],
      [180.2, -15.2],
      [-179.8, -15.5],
      [-179.6, -15.3],
      [179.5, -15.0],
    ],
  ],
};

const normalizedMultiPolygon_1 = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [179.5, -15.0],
        [179.8, -15.2],
        [179.7, -15.5],
        [179.4, -15.3],
        [179.5, -15.0],
      ],
    ],
    [
      [
        [179.8, -16.0],
        [-179.8, -16.2],
        [-179.7, -16.5],
        [179.9, -16.3],
        [179.8, -16.0],
      ],
    ],
    [
      [
        [-179.9, -14.0],
        [179.9, -14.2],
        [-179.7, -14.5],
        [-179.8, -14.3],
        [-179.9, -14.0],
      ],
    ],
    [
      [
        [178.5, -13.0],
        [179.0, -13.2],
        [179.1, -13.5],
        [178.6, -13.3],
        [178.5, -13.0],
      ],
    ],
  ],
};

const normalizedMultiPolygon_2 = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [179.9, -30.0],
        [-179.6, -30.2],
        [179.7, -30.5],
        [179.6, -30.3],
        [179.9, -30.0],
      ],
    ],
    [
      [
        [150.0, -10.0],
        [151.0, -10.2],
        [151.5, -10.5],
        [150.2, -10.3],
        [150.0, -10.0],
      ],
    ],
    [
      [
        [179.5, 10.0],
        [-169.8, 10.2],
        [-169.5, 10.5],
        [-170.2, 10.3],
        [-170.0, 10.0],
        [179.5, 10.0],
      ],
    ],
  ],
};

const normalizedPolygon_1 = {
  type: 'Polygon',
  coordinates: [
    [
      [179.7, -20.0],
      [-179.5, -20.2],
      [-179.9, -20.5],
      [-179.5, -20.3],
      [179.7, -20.0],
    ],
  ],
};

const normalizedPolygon_2 = {
  type: 'Polygon',
  coordinates: [
    [
      [179.5, -15.0],
      [-179.8, -15.2],
      [-179.8, -15.5],
      [-179.6, -15.3],
      [179.5, -15.0],
    ],
  ],
};

const originalMultiPolygon_1_With_Reverse_Rings = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [179.5, -15.0],
        [179.8, -15.2],
        [179.7, -15.5],
        [179.4, -15.3],
        [179.5, -15.0],
      ],
      [
        [-180.5, -15.0],
        [-180.2, -15.2],
        [-180.3, -15.5],
        [-180.6, -15.3],
        [-180.5, -15.0],
      ],
    ],
    [
      [
        [179.8, -16.0],
        [180.2, -16.2],
        [180.3, -16.5],
        [179.9, -16.3],
        [179.8, -16.0],
      ],
      [
        [-180.2, -16.0],
        [-179.8, -16.2],
        [-179.7, -16.5],
        [-180.1, -16.3],
        [-180.2, -16.0],
      ],
    ],
    [
      [
        [-179.9, -14.0],
        [-180.1, -14.2],
        [-179.7, -14.5],
        [-179.8, -14.3],
        [-179.9, -14.0],
      ],
      [
        [180.1, -14.0],
        [179.9, -14.2],
        [180.3, -14.5],
        [180.2, -14.3],
        [180.1, -14.0],
      ],
    ],
    [
      [
        [178.5, -13.0],
        [179.0, -13.2],
        [179.1, -13.5],
        [178.6, -13.3],
        [178.5, -13.0],
      ],
      [
        [-181.5, -13.0],
        [-181, -13.2],
        [-180.9, -13.5],
        [-181.4, -13.3],
        [-181.5, -13.0],
      ],
    ],
  ],
};

const originalMultiPolygon_2_With_Reverse_Rings = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [179.9, -30.0],
        [180.4, -30.2],
        [179.7, -30.5],
        [179.6, -30.3],
        [179.9, -30.0],
      ],
      [
        [-180.1, -30.0],
        [-179.6, -30.2],
        [-180.3, -30.5],
        [-180.4, -30.3],
        [-180.1, -30.0],
      ],
    ],
    [
      [
        [150.0, -10.0],
        [151.0, -10.2],
        [151.5, -10.5],
        [150.2, -10.3],
        [150.0, -10.0],
      ],
      [
        [-210.0, -10.0],
        [-209.0, -10.2],
        [-208.5, -10.5],
        [-209.8, -10.3],
        [-210, -10.0],
      ],
    ],
    [
      [
        [-180.5, 10.0],
        [-169.8, 10.2],
        [-169.5, 10.5],
        [-170.2, 10.3],
        [-170.0, 10.0],
        [-180.5, 10.0],
      ],
      [
        [179.5, 10.0],
        [190.2, 10.2],
        [190.5, 10.5],
        [189.8, 10.3],
        [190, 10.0],
        [179.5, 10.0],
      ],
    ],
  ],
};

const originalMultiPolygon_1_To_East = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [179.5, -15.0],
        [179.8, -15.2],
        [179.7, -15.5],
        [179.4, -15.3],
        [179.5, -15.0],
      ],
    ],
    [
      [
        [179.8, -16.0],
        [180.2, -16.2],
        [180.3, -16.5],
        [179.9, -16.3],
        [179.8, -16.0],
      ],
    ],
    [
      [
        [180.1, -14.0],
        [179.9, -14.2],
        [180.3, -14.5],
        [180.2, -14.3],
        [180.1, -14.0],
      ],
    ],
    [
      [
        [178.5, -13.0],
        [179.0, -13.2],
        [179.1, -13.5],
        [178.6, -13.3],
        [178.5, -13.0],
      ],
    ],
  ],
};

const originalMultiPolygon_2_To_East = {
  type: 'MultiPolygon',
  coordinates: [
    [
      [
        [179.9, -30.0],
        [180.4, -30.2],
        [179.7, -30.5],
        [179.6, -30.3],
        [179.9, -30.0],
      ],
    ],
    [
      [
        [150.0, -10.0],
        [151.0, -10.2],
        [151.5, -10.5],
        [150.2, -10.3],
        [150.0, -10.0],
      ],
    ],
    [
      [
        [179.5, 10.0],
        [190.2, 10.2],
        [190.5, 10.5],
        [189.8, 10.3],
        [190, 10.0],
        [179.5, 10.0],
      ],
    ],
  ],
};

test.each([
  [originalMultiPolygon_1, normalizedMultiPolygon_1],
  [originalMultiPolygon_2, normalizedMultiPolygon_2],
])('Test multiPolygonCoordinatesNormalization', (originalMultiPolygon, expectedNormalizedMultiPolygon) => {
  const normalizedPolygon = multiPolygonCoordinatesNormalization(originalMultiPolygon.coordinates);
  expect(normalizedPolygon).toEqual(expectedNormalizedMultiPolygon.coordinates);
});

test.each([
  [originalPolygon_1, normalizedPolygon_1],
  [originalPolygon_2, normalizedPolygon_2],
])('Test polygonCoordinatesNormalization', (originalMultiPolygon, expectedNormalizedMultiPolygon) => {
  const normalizedPolygon = polygonCoordinatesNormalization(originalMultiPolygon.coordinates);
  expect(normalizedPolygon).toEqual(expectedNormalizedMultiPolygon.coordinates);
});

test.each([
  [normalizedMultiPolygon_1, originalMultiPolygon_1],
  [normalizedMultiPolygon_2, originalMultiPolygon_2],
])('Test unNormalizeMultiPolygonCoordinates', (normalizedMultiPolygon, expectedUnNormalizedMultiPolygon) => {
  const unNormalizedMultiPolygon = unNormalizeMultiPolygonCoordinates(
    normalizedMultiPolygon.coordinates,
    false,
    true,
  );
  expect(unNormalizedMultiPolygon).toEqual(expectedUnNormalizedMultiPolygon.coordinates);
});

test.each([
  [normalizedMultiPolygon_1, originalMultiPolygon_1_With_Reverse_Rings],
  [normalizedMultiPolygon_2, originalMultiPolygon_2_With_Reverse_Rings],
])(
  'Test unNormalizeMultiPolygonCoordinates with reversed polygons',
  (normalizedMultiPolygon, expectedUnNormalizedMultiPolygon) => {
    const unNormalizedMultiPolygon = unNormalizeMultiPolygonCoordinates(
      normalizedMultiPolygon.coordinates,
      false,
    );
    expect(unNormalizedMultiPolygon).toEqual(expectedUnNormalizedMultiPolygon.coordinates);
  },
);

test.each([
  [normalizedMultiPolygon_1, originalMultiPolygon_1_With_Reverse_Rings],
  [normalizedMultiPolygon_2, originalMultiPolygon_2_With_Reverse_Rings],
])(
  'Test unNormalizeMultiPolygonCoordinates with reversed polygons',
  (normalizedMultiPolygon, expectedUnNormalizedMultiPolygon) => {
    const unNormalizedMultiPolygon = unNormalizeMultiPolygonCoordinates(
      normalizedMultiPolygon.coordinates,
      false,
    );
    expect(unNormalizedMultiPolygon).toEqual(expectedUnNormalizedMultiPolygon.coordinates);
  },
);

test.each([
  [normalizedMultiPolygon_1, originalMultiPolygon_1_To_East],
  [normalizedMultiPolygon_2, originalMultiPolygon_2_To_East],
])(
  'Test unNormalizeMultiPolygonCoordinates with all rings facing East',
  (normalizedMultiPolygon, expectedUnNormalizedMultiPolygon) => {
    const unNormalizedMultiPolygon = unNormalizeMultiPolygonCoordinates(
      normalizedMultiPolygon.coordinates,
      true,
    );
    expect(unNormalizedMultiPolygon).toEqual(expectedUnNormalizedMultiPolygon.coordinates);
  },
);
