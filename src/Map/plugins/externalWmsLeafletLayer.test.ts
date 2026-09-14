import L from 'leaflet';
import { optionalTileSize, optionalZoomLimits, ExternalWmsLayer } from './externalWmsLeafletLayer';

describe('optionalTileSize', () => {
  test('omits the tileSize key entirely when given null or undefined', () => {
    expect('tileSize' in optionalTileSize(null)).toBe(false);
    expect('tileSize' in optionalTileSize(undefined)).toBe(false);
  });

  test('returns an object with tileSize when a number is provided', () => {
    expect(optionalTileSize(512)).toEqual({ tileSize: 512 });
  });

  // Regression test: pins the underlying Leaflet hazard this helper works around, so it doesn't
  // get "simplified away" later by someone who doesn't understand why it's needed. Leaflet's
  // setOptions (Util.js) copies every own key of the passed options object with `for…in`,
  // including `tileSize: undefined`, which shadows GridLayer's 256px prototype default.
  // getTileSize() then builds an un-rounded Point straight from that undefined value, so it
  // isn't NaN yet — but any tile-grid arithmetic Leaflet performs on it downstream (e.g.
  // Point#scaleBy, used to compute pixel bounds for each tile) immediately turns into NaN.
  test('passing tileSize: undefined to L.TileLayer breaks the tile grid (the bug this helper avoids)', () => {
    const layerWithUndefinedTileSize = new L.TileLayer('http://x/{z}/{x}/{y}.png', {
      tileSize: undefined,
    } as never);
    const brokenTileSize = layerWithUndefinedTileSize.getTileSize();
    expect(brokenTileSize.x).toBeUndefined();
    expect(new L.Point(1, 1).scaleBy(brokenTileSize).x).toBe(NaN);

    const layerWithoutTileSizeKey = new L.TileLayer('http://x/{z}/{x}/{y}.png', {});
    expect(layerWithoutTileSizeKey.getTileSize().x).toBe(256);
  });
});

describe('optionalZoomLimits', () => {
  test('omits the maxZoom key entirely when given null or undefined', () => {
    expect(optionalZoomLimits(null)).toEqual({});
    expect(optionalZoomLimits(undefined)).toEqual({});
    expect('maxZoom' in optionalZoomLimits(undefined)).toBe(false);
  });

  test('returns maxZoom when provided', () => {
    expect(optionalZoomLimits(20)).toEqual({ maxZoom: 20 });
  });

  test('keeps zero as a real value rather than dropping it as falsy', () => {
    expect(optionalZoomLimits(0)).toEqual({ maxZoom: 0 });
  });

  // Regression test for the issue this helper exists for: without an explicit maxZoom, Leaflet's
  // GridLayer default caps external WMS/WMTS layers at zoom 18. Setting it also registers the layer
  // with the map's zoom-bound bookkeeping, which is what clamps the zoom back down on layer switch.
  test('a TileLayer built with these options reports the raised maxZoom instead of Leaflet default 18', () => {
    const defaultLayer = new L.TileLayer('http://x/{z}/{x}/{y}.png', {});
    expect(defaultLayer.options.maxZoom).toBe(18);

    const raisedLayer = new L.TileLayer('http://x/{z}/{x}/{y}.png', {
      ...optionalZoomLimits(20),
    });
    expect(raisedLayer.options.maxZoom).toBe(20);
  });
});

describe('ExternalWmsLayer styles param', () => {
  // Regression test for #1268: some WMS servers reject a GetMap request that carries both
  // `styles=` (Leaflet's own defaultWmsParams) and `STYLES=` (a differently-cased key added
  // separately by app code) as duplicate parameters. Only a single, lowercase `styles` key
  // must ever end up in wmsParams, matching Leaflet's own casing.
  test('constructing with a styles option sets only the lowercase key', () => {
    const layer = new ExternalWmsLayer('http://x', { layers: '0', styles: 'default' } as never);
    const wmsParams = (layer as unknown as { wmsParams: Record<string, unknown> }).wmsParams;
    expect(wmsParams.styles).toBe('default');
    expect('STYLES' in wmsParams).toBe(false);
  });

  test('setParams({ styles }) updates the lowercase key without introducing an uppercase one', () => {
    const layer = new ExternalWmsLayer('http://x', { layers: '0' } as never);
    // setParams exists on L.TileLayer.WMS at runtime but isn't part of @types/leaflet.
    (layer as unknown as { setParams: (params: Record<string, unknown>) => void }).setParams({
      styles: 'other',
    });
    const wmsParams = (layer as unknown as { wmsParams: Record<string, unknown> }).wmsParams;
    expect(wmsParams.styles).toBe('other');
    expect('STYLES' in wmsParams).toBe(false);
  });
});
