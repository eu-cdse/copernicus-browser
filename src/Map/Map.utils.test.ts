import moment from 'moment';
import {
  getBufferRadius,
  getIntersectingFeatures,
  createClickedPoint,
  shouldShowSingleShLayer,
  shouldShowCompareShLayers,
  shouldShowS2MosaicTransparency,
  getPinTimes,
} from './Map.utils';
import { TABS } from '../const';

const squareFeature: GeoJSON.Feature = {
  type: 'Feature',
  properties: {},
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

const longAndNarrowFeature: GeoJSON.Feature = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [0, 0],
        [100, 0],
        [100, 0.005],
        [0, 0.005],
        [0, 0],
      ],
    ],
  },
};

//S3B_SR_2_LAN_LI_20230318T210822_20230318T213100_20230416T155045_1358_077_200______LN3_O_NT_005.
const s3Feature: GeoJSON.Feature = {
  type: 'Feature',
  properties: {},
  geometry: {
    type: 'Polygon',
    coordinates: [
      [
        [4.85261, 43.2015],
        [4.19255, 44.9986],
        [3.49828, 46.7924],
        [2.76524, 48.5827],
        [1.98807, 50.369],
        [1.16043, 52.1508],
        [0.274836, 53.9276],
        [-0.677716, 55.6986],
        [-1.70806, 57.463],
        [-2.8294, 59.2198],
        [-4.05789, 60.9678],
        [-5.4136, 62.7052],
        [-6.92162, 64.4302],
        [-8.61364, 66.14],
        [-10.5302, 67.8314],
        [-12.7236, 69.4999],
        [-15.262, 71.1395],
        [-18.235, 72.7422],
        [-21.761, 74.2968],
        [-25.9954, 75.7877],
        [-31.1384, 77.1926],
        [-37.4349, 78.4803],
        [-45.1496, 79.6071],
        [-54.4844, 80.5157],
        [-65.4114, 81.1388],
        [-77.4737, 81.414],
        [-89.7703, 81.3083],
        [-101.294, 80.8348],
        [-111.368, 80.0458],
        [-119.794, 79.009],
        [-126.696, 77.7872],
        [-132.324, 76.4304],
        [-136.939, 74.9748],
        [-140.761, 73.4464],
        [-143.966, 71.8636],
        [-146.686, 70.2392],
        [-149.025, 68.5827],
        [-151.059, 66.9009],
        [-152.846, 65.1987],
        [-154.432, 63.48],
        [-155.853, 61.7477],
        [-157.136, 60.004],
        [-158.303, 58.2508],
        [-159.372, 56.4894],
        [-160.358, 54.721],
        [-160.355, 54.7205],
        [-159.369, 56.4889],
        [-158.3, 58.2502],
        [-157.132, 60.0034],
        [-155.849, 61.747],
        [-154.428, 63.4793],
        [-152.842, 65.198],
        [-151.054, 66.9001],
        [-149.021, 68.582],
        [-146.682, 70.2384],
        [-143.961, 71.8627],
        [-140.756, 73.4455],
        [-136.933, 74.9737],
        [-132.318, 76.4292],
        [-126.69, 77.786],
        [-119.788, 79.0076],
        [-111.363, 80.0442],
        [-101.29, 80.8331],
        [-89.7684, 81.3065],
        [-77.4743, 81.4122],
        [-65.4143, 81.1371],
        [-54.489, 80.5141],
        [-45.1551, 79.6056],
        [-37.4408, 78.4789],
        [-31.1443, 77.1914],
        [-26.0011, 75.7866],
        [-21.7665, 74.2958],
        [-18.2402, 72.7413],
        [-15.2668, 71.1387],
        [-12.7281, 69.4991],
        [-10.5345, 67.8306],
        [-8.61771, 66.1393],
        [-6.92547, 64.4295],
        [-5.41726, 62.7046],
        [-4.06137, 60.9672],
        [-2.83271, 59.2193],
        [-1.71123, 57.4625],
        [-0.680749, 55.6981],
        [0.271924, 53.927],
        [1.15763, 52.1503],
        [1.98536, 50.3685],
        [2.76263, 48.5822],
        [3.49576, 46.792],
        [4.1901, 44.9981],
        [4.85023, 43.2011],
        [4.85261, 43.2015],
      ],
    ],
  },
};

const clickedPoint = ({ lng, lat }: { lng: number; lat: number }): GeoJSON.Feature => ({
  type: 'Feature',
  properties: null,
  geometry: {
    type: 'Point',
    coordinates: [lng, lat],
  },
});

describe('getIntersectingFeatures - simple polygon', () => {
  test('simple feature, click inside', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 0.5, lat: 0.5 }), [squareFeature], {
      zoom: 11,
    });
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(squareFeature);
  });

  test('simple feature, click inside near the border', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 0.5, lat: 0.9999 }), [squareFeature], {
      zoom: 11,
    });
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(squareFeature);
  });

  test('simple feature, click outside near the border', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 0.5, lat: 1.0001 }), [squareFeature], {
      zoom: 11,
    });
    expect(result.length).toBe(0);
  });

  test('simple feature, click outside near the border, low zoom, no buffer', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 0.5, lat: 1.0001 }), [squareFeature], {
      zoom: 3,
    });
    expect(result.length).toBe(0);
  });
});

describe('getIntersectingFeatures - long and narrow polygon', () => {
  test('long and narrow feature, click inside', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.0025 }), [longAndNarrowFeature], {
      zoom: 11,
    });
    expect(result.length).toBe(1);
    expect(result[0]).toEqual(longAndNarrowFeature);
  });

  test('long and narrow feature, click inside near the border', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.0049 }), [longAndNarrowFeature], {
      zoom: 11,
    });
    expect(result.length).toBe(1);
  });

  test('long and narrow feature, click on the border, zoom 3, buffer 20km', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.005 }), [longAndNarrowFeature], {
      zoom: 3,
    });
    expect(result.length).toBe(1);
  });

  test('long and narrow feature, click on the border, zoom 10, buffer 156m', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.005 }), [longAndNarrowFeature], {
      zoom: 10,
    });
    expect(result.length).toBe(1);
  });

  test('long and narrow feature, click on the border, zoom 19, buffer 10m', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.005 }), [longAndNarrowFeature], {
      zoom: 19,
    });
    expect(result.length).toBe(1);
  });

  test('long and narrow feature, click aprox 5m outside the border, zoom 13, buffer 10m', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.00505 }), [longAndNarrowFeature], {
      zoom: 13,
    });
    expect(result.length).toBe(1);
  });

  test('long and narrow feature, click aprox 15m outside the border, zoom 13, buffer 10m', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.00515 }), [longAndNarrowFeature], {
      zoom: 13,
    });
    expect(result.length).toBe(0);
  });

  test('long and narrow feature, click aprox 15m outside the border, zoom 12, buffer 39m', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.00515 }), [longAndNarrowFeature], {
      zoom: 12,
    });
    expect(result.length).toBe(1);
  });

  test('long and narrow feature, click aprox 15m outside the border, zoom 10, buffer 156m', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.00515 }), [longAndNarrowFeature], {
      zoom: 10,
    });
    expect(result.length).toBe(1);
  });

  test('long and narrow feature, click 11 km outside the border, zoom 10', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.105 }), [longAndNarrowFeature], {
      zoom: 10,
    });
    expect(result.length).toBe(0);
  });

  test('long and narrow feature, click 11 km outside the border, zoom 3', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 50, lat: 0.105 }), [longAndNarrowFeature], {
      zoom: 3,
    });
    expect(result.length).toBe(1);
  });
});

describe('getIntersectingFeatures - s3-sral-lan_li product', () => {
  test('s3-sral-lan_li product, click inside', () => {
    const result = getIntersectingFeatures(
      clickedPoint({ lng: 2.657296657562256, lat: 48.832301686966154 }),
      [s3Feature],
      {
        zoom: 11,
      },
    );
    expect(result.length).toBe(1);
  });

  test('s3-sral-lan_li product, click inside near the border', () => {
    const result = getIntersectingFeatures(
      clickedPoint({ lng: 2.658326625823975, lat: 48.83231581180227 }),
      [s3Feature],
      {
        zoom: 11,
      },
    );
    expect(result.length).toBe(1);
  });

  test('s3-sral-lan_li product, click aprox 60m outside the border, buffer 10m', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 2.659045, lat: 48.832457 }), [s3Feature], {
      zoom: 13,
    });
    expect(result.length).toBe(0);
  });

  test('s3-sral-lan_li product, click aprox 60m outside the border, buffer 39m', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 2.659045, lat: 48.832457 }), [s3Feature], {
      zoom: 12,
    });
    expect(result.length).toBe(0);
  });

  test('s3-sral-lan_li product, click aprox 60m,  buffer 78m', () => {
    const result = getIntersectingFeatures(clickedPoint({ lng: 2.659045, lat: 48.832457 }), [s3Feature], {
      zoom: 11,
    });
    expect(result.length).toBe(1);
  });
});

describe('createClickedPoint', () => {
  test('creates a GeoJSON point feature from latlng', () => {
    expect(createClickedPoint({ lat: 45.5, lng: 13.2 })).toEqual({
      type: 'Feature',
      properties: null,
      geometry: { type: 'Point', coordinates: [13.2, 45.5] },
    });
  });

  test('handles negative coordinates', () => {
    expect(createClickedPoint({ lat: -33.87, lng: 151.21 }).geometry.coordinates).toEqual([151.21, -33.87]);
  });

  test('handles zero coordinates', () => {
    expect(createClickedPoint({ lat: 0, lng: 0 })).toEqual({
      type: 'Feature',
      properties: null,
      geometry: { type: 'Point', coordinates: [0, 0] },
    });
  });
});

describe('shouldShowSingleShLayer', () => {
  const base = {
    authenticated: true,
    dataSourcesInitialized: true,
    selectedTabIndex: TABS.VISUALIZE_TAB,
    displayingSearchResults: false,
    showComparePanel: false,
    visualizationLayerId: 'TRUE-COLOR',
    customSelected: false,
    datasetId: 'S2L2A',
    visualizationUrl: 'https://example.com',
  };

  test('returns true when all conditions are met', () => {
    expect(shouldShowSingleShLayer(base)).toBe(true);
  });

  test('returns false when not authenticated', () => {
    expect(shouldShowSingleShLayer({ ...base, authenticated: false })).toBe(false);
  });

  test('returns false when displaying search results', () => {
    expect(shouldShowSingleShLayer({ ...base, displayingSearchResults: true })).toBe(false);
  });

  test('returns false when compare panel is shown', () => {
    expect(shouldShowSingleShLayer({ ...base, showComparePanel: true })).toBe(false);
  });

  test('returns false when not on visualize tab', () => {
    expect(shouldShowSingleShLayer({ ...base, selectedTabIndex: TABS.SEARCH_TAB })).toBe(false);
  });

  test('returns true with customSelected and no layerId', () => {
    expect(shouldShowSingleShLayer({ ...base, visualizationLayerId: null, customSelected: true })).toBe(true);
  });

  test('returns false when missing datasetId', () => {
    expect(shouldShowSingleShLayer({ ...base, datasetId: null })).toBe(false);
  });

  test('returns false when both visualizationLayerId and customSelected are falsy', () => {
    expect(shouldShowSingleShLayer({ ...base, visualizationLayerId: null, customSelected: false })).toBe(
      false,
    );
  });

  test('returns false when dataSourcesInitialized is false', () => {
    expect(shouldShowSingleShLayer({ ...base, dataSourcesInitialized: false })).toBe(false);
  });

  test('returns false when visualizationUrl is missing', () => {
    expect(shouldShowSingleShLayer({ ...base, visualizationUrl: null })).toBe(false);
  });
});

describe('shouldShowCompareShLayers', () => {
  test('returns true when compare mode is active', () => {
    expect(
      shouldShowCompareShLayers({
        comparedLayers: [{}],
        selectedTabIndex: TABS.VISUALIZE_TAB,
        showComparePanel: true,
      }),
    ).toBe(true);
  });

  test('returns false when no compared layers', () => {
    expect(
      shouldShowCompareShLayers({
        comparedLayers: [],
        selectedTabIndex: TABS.VISUALIZE_TAB,
        showComparePanel: true,
      }),
    ).toBe(false);
  });

  test('returns false when compare panel is hidden', () => {
    expect(
      shouldShowCompareShLayers({
        comparedLayers: [{}],
        selectedTabIndex: TABS.VISUALIZE_TAB,
        showComparePanel: false,
      }),
    ).toBe(false);
  });

  test('returns false when not on visualize tab', () => {
    expect(
      shouldShowCompareShLayers({
        comparedLayers: [{}],
        selectedTabIndex: TABS.SEARCH_TAB,
        showComparePanel: true,
      }),
    ).toBe(false);
  });
});

describe('shouldShowS2MosaicTransparency', () => {
  test('returns true when single layer is visible', () => {
    expect(shouldShowS2MosaicTransparency(true, true, false)).toBe(true);
  });

  test('returns true when compare layers are shown', () => {
    expect(shouldShowS2MosaicTransparency(false, false, true)).toBe(true);
  });

  test('returns false when layer is not visible on map', () => {
    expect(shouldShowS2MosaicTransparency(true, false, false)).toBe(false);
  });

  test('returns false when single layer condition is false and compare layers are not shown', () => {
    expect(shouldShowS2MosaicTransparency(false, true, false)).toBe(false);
  });
});

describe('getPinTimes', () => {
  const toTime = '2024-01-15T12:00:00Z';
  const fromTime = '2024-01-10T10:00:00Z';

  test('returns full range when supportsTimeRange and fromTime is set', () => {
    const { pinTimeFrom, pinTimeTo } = getPinTimes(fromTime, toTime, true);
    expect(pinTimeFrom).toEqual(moment.utc(fromTime).toDate());
    expect(pinTimeTo).toEqual(moment.utc(toTime).toDate());
  });

  test('returns day range when supportsTimeRange but fromTime is absent', () => {
    const { pinTimeFrom, pinTimeTo } = getPinTimes(null, toTime, true);
    expect(pinTimeFrom).toEqual(moment.utc(toTime).startOf('day').toDate());
    expect(pinTimeTo).toEqual(moment.utc(toTime).endOf('day').toDate());
  });

  test('returns undefined pinTimeFrom when not supporting time range', () => {
    const { pinTimeFrom, pinTimeTo } = getPinTimes(fromTime, toTime, false);
    expect(pinTimeFrom).toBeUndefined();
    expect(pinTimeTo).toEqual(moment.utc(toTime).endOf('day').toDate());
  });

  test('returns undefined pinTimeFrom and endOfDay pinTimeTo when not supporting time range and fromTime is null', () => {
    const { pinTimeFrom, pinTimeTo } = getPinTimes(null, toTime, false);
    expect(pinTimeFrom).toBeUndefined();
    expect(pinTimeTo).toEqual(moment.utc(toTime).endOf('day').toDate());
  });

  test('returns day range when supportsTimeRange and fromTime is undefined', () => {
    const { pinTimeFrom, pinTimeTo } = getPinTimes(undefined, toTime, true);
    expect(pinTimeFrom).toEqual(moment.utc(toTime).startOf('day').toDate());
    expect(pinTimeTo).toEqual(moment.utc(toTime).endOf('day').toDate());
  });
});

describe('getBufferRadius', () => {
  test.each([
    [0, 20000],
    [3, 20000],
    [4, 10000],
    [5, 5000],
    [6, 2500],
    [7, 1250],
    [8, 625],
    [9, 312.5],
    [10, 156.25],
    [11, 78.125],
    [12, 39.0625],
    [13, 10], // zoom > maxZoom (12) — clamped to defaultBufferRadius
    [19, 10], // zoom >> maxZoom — still clamped
  ])('zoom %', (zoom, expectedRadius) => {
    const radius = getBufferRadius(zoom);
    expect(radius).toEqual(expectedRadius);
  });
});
