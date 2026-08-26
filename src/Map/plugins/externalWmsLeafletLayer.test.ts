import L from 'leaflet';
import { optionalTileSize } from './externalWmsLeafletLayer';

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
