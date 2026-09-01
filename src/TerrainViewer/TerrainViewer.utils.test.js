import { getBackgroundTileUrl, getTileCoord } from './TerrainViewer.utils';
import { EQUATOR_LENGTH } from '../const';
import { OSM_MAX_NATIVE_ZOOM } from '../Map/const';

describe('getTileCoord', () => {
  // Regression test for the GISCO z18 cutoff: getTileCoord used to clamp with Math.min(19, ...),
  // one level past the highest zoom GISCO actually serves, so the deepest 3D background tile
  // request 404'd. These extents are deliberately small enough that the UNCLAMPED zoom exceeds 19
  // (a 200m-wide extent computes to 18 and would pass either way — it must be narrower than ~153m
  // to tell the old clamp from the new one).
  test.each([
    ['100m wide extent (computed 19, the level that used to 404)', -50, 50],
    ['10m wide extent (computed 22)', -5, 5],
  ])('clamps zoomLevel to the GISCO maximum for a %s', (_label, min, max) => {
    const { zoomLevel } = getTileCoord(min, min, max, max);

    expect(zoomLevel).toBe(OSM_MAX_NATIVE_ZOOM);
    expect(zoomLevel).toBe(18);
  });

  test('does not clamp a zoom level that is already below the maximum', () => {
    // ~1.2km wide extent -> computed zoom 15, well under the cap.
    const { zoomLevel } = getTileCoord(-600, -600, 600, 600);

    expect(zoomLevel).toBeLessThan(OSM_MAX_NATIVE_ZOOM);
  });

  test('floors zoomLevel at 0 for a whole-world extent', () => {
    const { zoomLevel } = getTileCoord(-EQUATOR_LENGTH, -EQUATOR_LENGTH, EQUATOR_LENGTH, EQUATOR_LENGTH);

    expect(zoomLevel).toBe(0);
  });
});

describe('getBackgroundTileUrl', () => {
  test('never builds a URL above the GISCO z18 cutoff, even for a tiny extent', () => {
    const url = getBackgroundTileUrl(getTileCoord(-5, -5, 5, 5));

    expect(url).toContain('/EPSG3857/18/');
    expect(url).not.toContain('/EPSG3857/19/');
  });
});
