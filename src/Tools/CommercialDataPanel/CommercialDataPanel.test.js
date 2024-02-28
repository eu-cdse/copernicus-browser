import { isPlanetHarmonizationSupported } from './CommercialDataPanel';
import { formatNumberAsRoundedUnit, getProductsOrderSize, roundToNDigits } from './commercialData.utils';
import { PlanetItemType, PlanetProductBundle, TPDProvider } from '@sentinel-hub/sentinelhub-js';
import geo_area from '@mapbox/geojson-area';

test.each([
  [PlanetItemType.PSScene, PlanetProductBundle.ANALYTIC_SR_UDM2, true],
  [PlanetItemType.PSScene, PlanetProductBundle.ANALYTIC_UDM2, false],
  [PlanetItemType.PSScene, PlanetProductBundle.ANALYTIC_8B_UDM2, false],
  [PlanetItemType.PSScene, PlanetProductBundle.ANALYTIC_8B_SR_UDM2, true],
  [PlanetItemType.PSScene, PlanetProductBundle.ANALYTIC, false],
  [PlanetItemType.PSScene, PlanetProductBundle.ANALYTIC_SR, false],
  [PlanetItemType.PSScene4Band, PlanetProductBundle.ANALYTIC, true],
  [PlanetItemType.PSScene4Band, PlanetProductBundle.ANALYTIC_UDM2, true],
  [PlanetItemType.PSScene4Band, PlanetProductBundle.ANALYTIC_SR, false],
  [PlanetItemType.PSScene4Band, PlanetProductBundle.ANALYTIC_SR_UDM2, false],
  [PlanetItemType.PSScene4Band, PlanetProductBundle.ANALYTIC_8B_UDM2, false],
  [PlanetItemType.PSScene4Band, PlanetProductBundle.ANALYTIC_8B_SR_UDM2, false],
])('Test isPlanetHarmonizationSupported method', (itemType, productBundle, expectedResult) => {
  expect(isPlanetHarmonizationSupported(itemType, productBundle)).toEqual(expectedResult);
});

describe('Test formatNumberAsRoundedUnit function', () => {
  test.each([
    [1.2345, 3, 'm', 'N/A', '1.235m'],
    [0, 2, '', undefined, '0'],
    [null, 2, '', undefined, ''],
    [undefined, 2, '', undefined, ''],
    ['not a number', 2, '', undefined, ''],
    [0, 2, '', 'N/A', '0'],
    [null, 2, '', 'N/A', 'N/A'],
    [undefined, 2, '', 'N/A', 'N/A'],
    ['not a number', 2, 'N/A', '', ''],
    [0, 2, '', '', '0'],
    [null, 2, '', '', ''],
    [undefined, 2, '', '', ''],
    ['not a number', 2, '', '', ''],
  ])('display null values', (value, precision, unit, nullValueLabel, expectedResult) => {
    expect(formatNumberAsRoundedUnit(value, precision, unit, nullValueLabel)).toEqual(expectedResult);
  });
});

describe('getProductsOrderSize', () => {
  const aoiGeometry = {
    type: 'Polygon',
    coordinates: [
      [
        [0.25, 0.25],
        [0.25, 0.75],
        [0.75, 0.75],
        [0.75, 0.25],
        [0.25, 0.25],
      ],
    ],
  };

  const geometry1 = {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [0, 1],
        [1, 1],
        [1, 0],
        [0, 0],
      ],
    ],
  };

  const geometry2 = {
    type: 'Polygon',
    coordinates: [
      [
        [-1, -1],
        [-1, 2],
        [2, 2],
        [2, -1],
        [-1, -1],
      ],
    ],
  };

  const geometry3 = {
    type: 'Polygon',
    coordinates: [
      [
        [0.5, 0.5],
        [0.5, 0.6],
        [0.6, 0.6],
        [0.6, 0.5],
        [0.5, 0.5],
      ],
    ],
  };

  const geometry4 = {
    type: 'Polygon',
    coordinates: [
      [
        [-0.5, -0.5],
        [-0.5, -0.6],
        [-0.6, -0.6],
        [-0.6, -0.5],
        [-0.5, -0.5],
      ],
    ],
  };

  const geometry5 = {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [0, 0.25],
        [0.25, 0.25],
        [0.25, 0],
        [0.0, 0],
      ],
    ],
  };

  const createProduct = (provider, id, geometry) => {
    switch (provider) {
      case TPDProvider.MAXAR:
        return { catalogID: id, geometry: geometry, properties: {} };
      case TPDProvider.PLANET:
        return { id: id, geometry: geometry, properties: {} };
      default:
        return {
          properties: {
            id: id,
          },
          geometry: geometry,
        };
    }
  };

  const airbusProduct1 = createProduct(TPDProvider.AIRBUS, 1, geometry1);
  const airbusProduct2 = createProduct(TPDProvider.AIRBUS, 2, geometry2);
  const airbusProduct3 = createProduct(TPDProvider.AIRBUS, 3, geometry3);
  const airbusProduct4 = createProduct(TPDProvider.AIRBUS, 4, geometry4);
  const airbusProduct5 = createProduct(TPDProvider.AIRBUS, 5, geometry5);

  const planetProduct1 = createProduct(TPDProvider.PLANET, 1, geometry1);
  const planetProduct2 = createProduct(TPDProvider.PLANET, 2, geometry2);
  const planetProduct3 = createProduct(TPDProvider.PLANET, 3, geometry3);
  const planetProduct4 = createProduct(TPDProvider.PLANET, 4, geometry4);
  const planetProduct5 = createProduct(TPDProvider.PLANET, 5, geometry5);

  const maxarProduct1 = createProduct(TPDProvider.MAXAR, 1, geometry1);
  const maxarProduct2 = createProduct(TPDProvider.MAXAR, 2, geometry2);
  const maxarProduct3 = createProduct(TPDProvider.MAXAR, 3, geometry3);
  const maxarProduct4 = createProduct(TPDProvider.MAXAR, 4, geometry4);
  const maxarProduct5 = createProduct(TPDProvider.MAXAR, 5, geometry5);

  test.each([
    [null, null, null, 0],
    [aoiGeometry, null, null, 0],
    [aoiGeometry, [], null, 0],
    [aoiGeometry, null, [], 0],
    [aoiGeometry, [], [], 0],
    [aoiGeometry, [], [airbusProduct1], 0],
    [aoiGeometry, [airbusProduct1.properties.id], [], 0],
    [
      aoiGeometry,
      [airbusProduct1.properties.id],
      [airbusProduct1],
      roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [airbusProduct1.properties.id],
      [airbusProduct1, airbusProduct2],
      roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [airbusProduct1.properties.id, airbusProduct2.properties.id],
      [airbusProduct1, airbusProduct2],
      2 * roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [airbusProduct3.properties.id],
      [airbusProduct1, airbusProduct2, airbusProduct3],
      roundToNDigits(geo_area.geometry(airbusProduct3.geometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [airbusProduct1.properties.id, airbusProduct3.properties.id],
      [airbusProduct1, airbusProduct2, airbusProduct3],
      roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2) +
        roundToNDigits(geo_area.geometry(airbusProduct3.geometry) / 1000000, 2),
    ],
    //airbusProduct4 and aoiGeometry don't intersect
    [aoiGeometry, [airbusProduct4.properties.id], [airbusProduct4], 0],
    //airbusProduct5 and aoiGeometry touch
    [aoiGeometry, [airbusProduct5.properties.id], [airbusProduct5], 0],
  ])(
    'getTransactionSize for ordering AIRBUS products',
    (aoiGeometry, selectedProducts, searchResults, expectedResult) => {
      expect(getProductsOrderSize(TPDProvider.AIRBUS, aoiGeometry, selectedProducts, searchResults)).toBe(
        expectedResult,
      );
    },
  );

  test.each([
    [aoiGeometry, [], [planetProduct1], 0],
    [aoiGeometry, [planetProduct1.id], [], 0],
    [
      aoiGeometry,
      [planetProduct1.id],
      [planetProduct1],
      roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [planetProduct1.id],
      [planetProduct1, planetProduct2],
      roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [planetProduct1.id, planetProduct2.id],
      [planetProduct1, planetProduct2],
      2 * roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [planetProduct3.id],
      [planetProduct1, planetProduct2, planetProduct3],
      roundToNDigits(geo_area.geometry(planetProduct3.geometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [planetProduct1.id, planetProduct3.id],
      [planetProduct1, planetProduct2, planetProduct3],
      roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2) +
        roundToNDigits(geo_area.geometry(planetProduct3.geometry) / 1000000, 2),
    ],
    //planetProduct4 and aoiGeometry don't intersect
    [aoiGeometry, [planetProduct4.id], [planetProduct4], 0],
    //planetProduct5 and aoiGeometry touch
    [aoiGeometry, [planetProduct5.id], [planetProduct5], 0],
  ])(
    'getTransactionSize for ordering PLANET products',
    (aoiGeometry, selectedProducts, searchResults, expectedResult) => {
      expect(getProductsOrderSize(TPDProvider.PLANET, aoiGeometry, selectedProducts, searchResults)).toBe(
        expectedResult,
      );
    },
  );

  test.each([
    [aoiGeometry, [], [maxarProduct1], 0],
    [aoiGeometry, [maxarProduct1.catalogID], [], 0],
    [
      aoiGeometry,
      [maxarProduct1.catalogID],
      [maxarProduct1],
      roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [maxarProduct1.catalogID],
      [maxarProduct1, maxarProduct2],
      roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [maxarProduct1.catalogID, maxarProduct2.catalogID],
      [maxarProduct1, maxarProduct2],
      2 * roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [maxarProduct3.catalogID],
      [maxarProduct1, maxarProduct2, maxarProduct3],
      roundToNDigits(geo_area.geometry(maxarProduct3.geometry) / 1000000, 2),
    ],
    [
      aoiGeometry,
      [maxarProduct1.catalogID, maxarProduct3.catalogID],
      [maxarProduct1, maxarProduct2, maxarProduct3],
      roundToNDigits(geo_area.geometry(aoiGeometry) / 1000000, 2) +
        roundToNDigits(geo_area.geometry(maxarProduct3.geometry) / 1000000, 2),
    ],
    //maxarProduct4 and aoiGeometry don't intersect
    [aoiGeometry, [maxarProduct4.catalogID], [maxarProduct4], 0],
    //maxarProduct5 and aoiGeometry touch
    [aoiGeometry, [maxarProduct5.catalogID], [maxarProduct5], 0],
  ])(
    'getTransactionSize for ordering MAXAR products',
    (aoiGeometry, selectedProducts, searchResults, expectedResult) => {
      expect(getProductsOrderSize(TPDProvider.MAXAR, aoiGeometry, selectedProducts, searchResults)).toBe(
        expectedResult,
      );
    },
  );
});
