import L from 'leaflet';
import { baseLayers, overlayTileLayers } from './Layers';
import { OSM_BACKGROUND_NAME as OSM_BACKGROUND_ID } from '../const';
import { OSM_LAYER_MAX_ZOOM, OSM_MAX_NATIVE_ZOOM } from './const';

describe('baseLayers', () => {
  test('the OSM background layer declares maxNativeZoom 18 and maxZoom 25', () => {
    const osmLayer = baseLayers.find((layer) => layer.id === OSM_BACKGROUND_ID);

    expect(osmLayer).toBeDefined();
    expect(osmLayer.url).toContain('OSMCartoBackground');
    expect(osmLayer.maxNativeZoom).toBe(18);
    expect(osmLayer.maxZoom).toBe(25);
    expect(osmLayer.maxNativeZoom).toBe(OSM_MAX_NATIVE_ZOOM);
    expect(osmLayer.maxZoom).toBe(OSM_LAYER_MAX_ZOOM);
  });
});

describe('overlayTileLayers', () => {
  test('the labels overlay declares maxNativeZoom 18 and maxZoom 25', () => {
    const labelsLayer = overlayTileLayers().find((layer) => layer.id === 'labels');

    expect(labelsLayer).toBeDefined();
    expect(labelsLayer.url).toContain('OSMCartoLabelsEN');
    expect(labelsLayer.maxNativeZoom).toBe(18);
    expect(labelsLayer.maxZoom).toBe(25);
    expect(labelsLayer.maxNativeZoom).toBe(OSM_MAX_NATIVE_ZOOM);
    expect(labelsLayer.maxZoom).toBe(OSM_LAYER_MAX_ZOOM);
  });
});

// Regression test: pins the underlying Leaflet hazard OSM_MAX_NATIVE_ZOOM + OSM_LAYER_MAX_ZOOM
// work around together, so the fix isn't "simplified away" by someone who only sets one of them.
// GISCO's OSM tile services (OSMCartoBackground / OSMCartoLabelsEN / OSMCartoCompositeEN) only
// serve tiles up to z18 - z19+ returns 404. Leaflet's GridLayer default maxZoom is 18, and
// GridLayer._setView (leaflet-src.js) sets `tileZoom = undefined` and drops EVERY tile whenever
// `tileZoom > options.maxZoom` - that's the white-background glitch. `_clampZoom`, which applies
// `maxNativeZoom` to keep requesting the z18 tile and upscale it, is only reached in the `else`
// branch of that same check. So setting maxNativeZoom alone (without raising maxZoom) never even
// gets a chance to run, and the layer still goes blank above z18.
describe('OSM zoom options Leaflet regression', () => {
  test('a plain L.TileLayer defaults to maxZoom 18, matching GISCO tiles cutoff', () => {
    const defaultLayer = new L.TileLayer('http://x/{z}/{x}/{y}.png', {});
    expect(defaultLayer.options.maxZoom).toBe(18);
  });

  test('a layer built with maxNativeZoom + maxZoom clamps deep zooms back to the native level', () => {
    const layer = new L.TileLayer('http://x/{z}/{x}/{y}.png', {
      maxNativeZoom: OSM_MAX_NATIVE_ZOOM,
      maxZoom: OSM_LAYER_MAX_ZOOM,
    });

    expect(layer.options.maxZoom).toBe(25);
    expect(layer._clampZoom(21)).toBe(18);
    expect(layer._clampZoom(18)).toBe(18);
    expect(layer._clampZoom(10)).toBe(10);
  });
});
