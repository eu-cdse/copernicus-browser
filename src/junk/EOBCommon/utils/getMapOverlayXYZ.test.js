import axios from 'axios';

import { getMapOverlayXYZ } from './getMapOverlayXYZ';
import { OSM_MAX_NATIVE_ZOOM } from '../../../Map/const';

jest.mock('axios');

// A tiny extent, so the tile grid stays at a couple of tiles whatever zoom is picked.
const BOUNDS = {
  _southWest: { lng: 0, lat: 0 },
  _northEast: { lng: 0.001, lat: 0.001 },
};
const TILE_URL = 'https://gisco-services.ec.europa.eu/maps/tiles/OSMCartoBackground/EPSG3857/{z}/{x}/{y}.png';

const requestedZooms = (urls) =>
  new Set(
    urls.map((url) => {
      const match = url.match(/EPSG3857\/(\d+)\//);
      if (!match) {
        throw new Error(`unparseable tile url: ${url}`);
      }
      return Number(match[1]);
    }),
  );

describe('getMapOverlayXYZ', () => {
  // Record every tile URL the stitcher asks for. Image "loads" resolve immediately so no real
  // network or decoding is involved — the assertions are about which {z} was requested.
  class StubImage {
    onload = null;
    onerror = null;
    crossOrigin = '';
    set src(value) {
      queueMicrotask(() => this.onload?.());
    }
  }

  let requestedUrls;
  let originals;

  beforeEach(() => {
    requestedUrls = [];

    originals = {
      Image: global.Image,
      caches: global.caches,
      Response: global.Response,
      Headers: global.Headers,
      createObjectURL: global.URL.createObjectURL,
      revokeObjectURL: global.URL.revokeObjectURL,
      drawImage: CanvasRenderingContext2D.prototype.drawImage,
    };

    global.Image = StubImage;
    // jsdom ships neither; the cache-write path constructs both before handing them to cache.put.
    global.Headers = class {
      set() {}
      get() {
        return null;
      }
    };
    global.Response = class {
      constructor(body, init) {
        this.body = body;
        this.headers = init?.headers ?? new global.Headers();
      }
    };
    // Always a cache miss, so every tile goes through axios and gets recorded.
    global.caches = {
      open: jest.fn().mockResolvedValue({
        match: jest.fn().mockResolvedValue(undefined),
        put: jest.fn().mockResolvedValue(undefined),
        keys: jest.fn().mockResolvedValue([]),
        delete: jest.fn().mockResolvedValue(true),
      }),
    };
    global.URL.createObjectURL = jest.fn(() => 'blob:stub');
    global.URL.revokeObjectURL = jest.fn();
    // jest-canvas-mock's drawImage validates its argument is a real HTMLImageElement.
    CanvasRenderingContext2D.prototype.drawImage = jest.fn();

    axios.get.mockImplementation((url) => {
      requestedUrls.push(url);
      return Promise.resolve({ data: new Blob(), headers: { 'content-type': 'image/png' } });
    });
  });

  afterEach(() => {
    global.Image = originals.Image;
    global.caches = originals.caches;
    global.Response = originals.Response;
    global.Headers = originals.Headers;
    global.URL.createObjectURL = originals.createObjectURL;
    global.URL.revokeObjectURL = originals.revokeObjectURL;
    CanvasRenderingContext2D.prototype.drawImage = originals.drawImage;
    jest.clearAllMocks();
  });

  // Regression test for the clamp that used to live inside the `zoom === null` branch only.
  // Every real caller passes an explicit map zoom, so the cap never ran — and the map's ceiling
  // now reaches 25 over VHR collections (see getMapMaxZoom in src/Map/Map.utils.ts), so image
  // download and timelapse were free to request z19-z25 GISCO tiles, which 404.
  test.each([19, 22, 25])(
    'clamps an explicitly passed zoom of %i down to the declared maxNativeZoom',
    async (zoom) => {
      await getMapOverlayXYZ(TILE_URL, BOUNDS, zoom, 512, 512, {
        maxNativeZoom: OSM_MAX_NATIVE_ZOOM,
      });

      expect(requestedUrls.length).toBeGreaterThan(0);
      expect(requestedZooms(requestedUrls)).toEqual(new Set([OSM_MAX_NATIVE_ZOOM]));
      expect(OSM_MAX_NATIVE_ZOOM).toBe(18);
    },
  );

  test('leaves an explicitly passed zoom below the cap untouched', async () => {
    await getMapOverlayXYZ(TILE_URL, BOUNDS, 12, 512, 512, { maxNativeZoom: OSM_MAX_NATIVE_ZOOM });

    expect(requestedZooms(requestedUrls)).toEqual(new Set([12]));
  });

  test('clamps the auto-computed zoom when no zoom is passed', async () => {
    // The extent is small enough that the computed zoom lands well above the cap.
    await getMapOverlayXYZ(TILE_URL, BOUNDS, null, 512, 512, { maxNativeZoom: OSM_MAX_NATIVE_ZOOM });

    expect(requestedZooms(requestedUrls)).toEqual(new Set([OSM_MAX_NATIVE_ZOOM]));
  });

  test('applies the cap after zoomOffset, since the offset can push past it', async () => {
    await getMapOverlayXYZ(TILE_URL, BOUNDS, 17, 512, 512, {
      zoomOffset: 4,
      maxNativeZoom: OSM_MAX_NATIVE_ZOOM,
    });

    expect(requestedZooms(requestedUrls)).toEqual(new Set([OSM_MAX_NATIVE_ZOOM]));
  });

  // There is no safe generic default: guessing too high 404s on GISCO, guessing too low blurs
  // every other provider. A caller that omits it should fail loudly rather than inherit a guess.
  test.each([
    ['the options object is omitted', undefined],
    ['maxNativeZoom is not given', {}],
    ['maxNativeZoom is undefined', { maxNativeZoom: undefined }],
  ])('throws when %s', async (_label, options) => {
    await expect(getMapOverlayXYZ(TILE_URL, BOUNDS, 25, 512, 512, options)).rejects.toThrow(
      /requires a numeric maxNativeZoom/,
    );

    expect(requestedUrls).toHaveLength(0);
  });
});
