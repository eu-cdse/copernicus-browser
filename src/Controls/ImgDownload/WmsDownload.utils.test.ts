import L from 'leaflet';

import {
  buildExternalWmsGetMapUrl,
  compositeWmtsImage,
  isAllExternalCompare,
  isMixedSourceCompare,
} from './WmsDownload.utils';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Build a Leaflet LatLngBounds from explicit corners. */
function makeBounds(south: number, west: number, north: number, east: number): L.LatLngBounds {
  return L.latLngBounds([south, west], [north, east]);
}

/** Parse the query string portion of a URL produced by buildExternalWmsGetMapUrl. */
function parseParams(url: string): URLSearchParams {
  const qmark = url.indexOf('?');
  return new URLSearchParams(qmark === -1 ? '' : url.slice(qmark + 1));
}

// ---------------------------------------------------------------------------
// buildExternalWmsGetMapUrl (thin sentinelhub-js wrapper — WMS 1.1.1 only)
// ---------------------------------------------------------------------------

describe('buildExternalWmsGetMapUrl', () => {
  const bounds = makeBounds(40, 10, 50, 20);
  const baseUrl = 'https://example.com/wms';
  const layer = 'my_layer';

  test('emits WMS 1.1.1 with SRS EPSG:4326, lon/lat bbox, transparent PNG', () => {
    const url = buildExternalWmsGetMapUrl(baseUrl, layer, bounds, 800, 600);
    const p = parseParams(url);
    // sentinelhub-js uses lowercase OGC param keys.
    expect(p.get('version')).toBe('1.1.1');
    expect(p.get('srs')).toBe('EPSG:4326');
    expect(p.get('layers')).toBe(layer);
    expect(p.get('width')).toBe('800');
    expect(p.get('height')).toBe('600');
    expect(p.get('transparent')).toBe('true');
    // 1.1.1 EPSG:4326 is lon/lat order: west,south,east,north.
    expect(p.get('bbox')).toBe('10,40,20,50');
  });

  test('web-mercator mode requests EPSG:3857 with a projected metre bbox', () => {
    const url = buildExternalWmsGetMapUrl(baseUrl, layer, bounds, 800, 600, undefined, undefined, true);
    const p = parseParams(url);
    expect(p.get('srs')).toBe('EPSG:3857');
    const [minX, minY, maxX, maxY] = (p.get('bbox') as string).split(',').map(Number);
    expect(maxX).toBeGreaterThan(minX);
    expect(maxY).toBeGreaterThan(minY);
    expect(Math.abs(minX)).toBeGreaterThan(1000); // metres, far larger than any degree value
  });

  test('TIME is a single date value when supplied, absent otherwise', () => {
    expect(parseParams(buildExternalWmsGetMapUrl(baseUrl, layer, bounds, 800, 600)).has('time')).toBe(false);
    const url = buildExternalWmsGetMapUrl(baseUrl, layer, bounds, 800, 600, '2023-06-01T00:00:00Z');
    expect(parseParams(url).get('time')).toBe('2023-06-01');
  });
});

// ---------------------------------------------------------------------------
// compositeWmtsImage (tile grid math must key off the actual TileMatrixSet tile size,
// not assume 256px — see MR !1210 review discussion)
// ---------------------------------------------------------------------------

describe('compositeWmtsImage', () => {
  // Stub Image so tile "loads" resolve immediately without a real network fetch, and record
  // every requested tile URL so the {x}/{y}/{z} substitutions can be inspected.
  class StubImage {
    onload: (() => void) | null = null;
    onerror: (() => void) | null = null;
    crossOrigin = '';
    private _src = '';
    get src() {
      return this._src;
    }
    set src(value: string) {
      this._src = value;
      requestedUrls.push(value);
      queueMicrotask(() => this.onload?.());
    }
  }

  let requestedUrls: string[];
  let OriginalImage: typeof Image;
  let originalDrawImage: typeof CanvasRenderingContext2D.prototype.drawImage;

  beforeEach(() => {
    requestedUrls = [];
    OriginalImage = global.Image;
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    global.Image = StubImage as any;
    // jest-canvas-mock's drawImage validates the image argument is a real HTMLImageElement; swap it
    // for a no-op since these tests care about which tiles were requested, not the stitched pixels.
    originalDrawImage = CanvasRenderingContext2D.prototype.drawImage;
    CanvasRenderingContext2D.prototype.drawImage = jest.fn();
  });

  afterEach(() => {
    global.Image = OriginalImage;
    CanvasRenderingContext2D.prototype.drawImage = originalDrawImage;
  });

  test('a larger tileSize covers the same TILEMATRIX with proportionally fewer, larger tiles', async () => {
    // Full-world bounds at the mercator latitude limit make the tile-index math land on exact
    // integers: tileMinX/Y = 0 and tileMaxX/Y = n - 1, where n = 2**z * 256 / tileSize (the same
    // convention buildWmtsPreviewTileUrl already uses for pin/layer preview thumbnails).
    const bounds = makeBounds(-85.05112878, -180, 85.05112878, 180);
    const tileUrl = 'https://example.com/tiles/{z}/{x}/{y}.png';
    // width = 2048 over a 360° span selects z = round(log2(2048 * 360 / (256 * 360))) = 3,
    // regardless of tileSize — the TILEMATRIX (zoom) is resolution-driven, not tileSize-driven.
    const width = 2048;

    await compositeWmtsImage(tileUrl, bounds, width, width, 256);
    const urlsFor256 = [...requestedUrls];
    requestedUrls = [];
    await compositeWmtsImage(tileUrl, bounds, width, width, 512);
    const urlsFor512 = [...requestedUrls];

    const maxIndices = (urls: string[]) => {
      let maxZ = -1;
      let maxX = -1;
      let maxY = -1;
      for (const url of urls) {
        const m = url.match(/tiles\/(\d+)\/(\d+)\/(\d+)\.png/);
        if (!m) {
          throw new Error(`unparseable tile url: ${url}`);
        }
        maxZ = Math.max(maxZ, Number(m[1]));
        maxX = Math.max(maxX, Number(m[2]));
        maxY = Math.max(maxY, Number(m[3]));
      }
      return { maxZ, maxX, maxY };
    };

    const at256 = maxIndices(urlsFor256);
    const at512 = maxIndices(urlsFor512);

    // Same TILEMATRIX (z) either way: only the tile count per axis changes with tileSize.
    expect(at256.maxZ).toBe(3);
    expect(at512.maxZ).toBe(3);
    // n = 2**3 * 256 / 256 = 8 tiles per axis -> max index 7.
    expect(at256.maxX).toBe(7);
    expect(at256.maxY).toBe(7);
    // n = 2**3 * 256 / 512 = 4 tiles per axis -> max index 3. Before the fix this was still 7,
    // which is out of range for Planet's PopularWebMercator512 TileMatrixSet and produced the
    // "Invalid TILECOL"/"Invalid TILEROW" 400 the live download request hit.
    expect(at512.maxX).toBe(3);
    expect(at512.maxY).toBe(3);
  });

  test('defaults to a 256px grid when no tileSize is given', async () => {
    const bounds = makeBounds(-10, -10, 10, 10);
    const tileUrl = 'https://example.com/tiles/{z}/{x}/{y}.png';

    await compositeWmtsImage(tileUrl, bounds, 800, 800);
    const defaultUrls = [...requestedUrls];

    requestedUrls = [];
    await compositeWmtsImage(tileUrl, bounds, 800, 800, 256);
    const explicit256Urls = [...requestedUrls];

    expect(defaultUrls).toEqual(explicit256Urls);
  });
});

// ---------------------------------------------------------------------------
// isAllExternalCompare
// ---------------------------------------------------------------------------

describe('isAllExternalCompare', () => {
  test('returns false for undefined', () => {
    expect(isAllExternalCompare(undefined)).toBe(false);
  });

  test('returns false for empty array', () => {
    expect(isAllExternalCompare([])).toBe(false);
  });

  test('returns false when all items lack externalWms', () => {
    expect(isAllExternalCompare([{ name: 'A' }, { name: 'B' }])).toBe(false);
  });

  test('returns false when at least one item lacks externalWms', () => {
    expect(isAllExternalCompare([{ externalWms: { url: 'x' } }, { name: 'B' }])).toBe(false);
  });

  test('returns true when every item has externalWms (single element)', () => {
    expect(isAllExternalCompare([{ externalWms: { url: 'x' } }])).toBe(true);
  });

  test('returns true when every item has externalWms (multiple elements)', () => {
    expect(isAllExternalCompare([{ externalWms: { url: 'x' } }, { externalWms: { url: 'y' } }])).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// isMixedSourceCompare
// ---------------------------------------------------------------------------

describe('isMixedSourceCompare', () => {
  test('returns false for undefined', () => {
    expect(isMixedSourceCompare(undefined)).toBe(false);
  });

  test('returns false for empty array', () => {
    expect(isMixedSourceCompare([])).toBe(false);
  });

  test('returns false when all items have externalWms (all-external)', () => {
    expect(isMixedSourceCompare([{ externalWms: { url: 'x' } }, { externalWms: { url: 'y' } }])).toBe(false);
  });

  test('returns false when no items have externalWms (all-SH)', () => {
    expect(isMixedSourceCompare([{ name: 'A' }, { name: 'B' }])).toBe(false);
  });

  test('returns true for one external and one non-external', () => {
    expect(isMixedSourceCompare([{ externalWms: { url: 'x' } }, { name: 'B' }])).toBe(true);
  });

  test('returns true for one non-external and one external (opposite order)', () => {
    expect(isMixedSourceCompare([{ name: 'A' }, { externalWms: { url: 'x' } }])).toBe(true);
  });

  test('returns true when mixed across multiple items', () => {
    expect(
      isMixedSourceCompare([{ externalWms: { url: 'x' } }, { externalWms: { url: 'y' } }, { name: 'SH' }]),
    ).toBe(true);
  });
});
