import isEqual from 'fast-deep-equal';
import { getOpenEoOptions } from './openEOLeafletLayer';

describe('getOpenEoOptions', () => {
  test('omits zIndex from the diffed params, so changing only zIndex keeps isEqual true', () => {
    const baseParams = { processGraph: { process_graph: {} }, opacity: 1 };

    const prevParams = getOpenEoOptions({ ...baseParams, zIndex: 501 });
    const params = getOpenEoOptions({ ...baseParams, zIndex: 502 });

    // componentDidUpdate only calls instance.setParams() (a full tile redraw) when this is false.
    // zIndex changes are applied separately via instance.setZIndex(), so it must not leak in here.
    expect(isEqual(params, prevParams)).toBe(true);
    expect('zIndex' in params).toBe(false);
  });

  // A compared openEO layer used to be rendered with the MAIN visualization layer's zoom config
  // (Map.jsx read the outer `zoomConfig` instead of the compared layer's own limits). These pin the
  // two ways that misrouting became visible.
  test('a declared max sets both the native cap and the display cap, extended by allowOverZoomBy', () => {
    expect(getOpenEoOptions({ minZoom: 3, maxZoom: 14 })).toMatchObject({
      minZoom: 3,
      maxNativeZoom: 14,
      maxZoom: 14,
    });

    // Overzoom raises only the display cap: tiles are still fetched at the deepest served level.
    expect(getOpenEoOptions({ maxZoom: 14, allowOverZoomBy: 2 })).toMatchObject({
      maxNativeZoom: 14,
      maxZoom: 16,
    });
  });

  test('an absent max leaves maxZoom unset, so the layer inherits L.TileLayer’s default of 18', () => {
    // Not a bug in itself — but it is why handing this layer some other dataset's config (or a
    // handler that declares only a min, as DEM does) silently blanked it above z18 while the map
    // ceiling, computed from the compared layer's own limits, kept zooming past it.
    const options = getOpenEoOptions({ minZoom: 7 });

    expect(options.minZoom).toBe(7);
    expect('maxZoom' in options).toBe(false);
    expect('maxNativeZoom' in options).toBe(false);
  });
});
