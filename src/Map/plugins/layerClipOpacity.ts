import L from 'leaflet';
import { TILE_REQUEST_DEBOUNCE_MS } from '../const';

// Shared compare-mode clip/opacity for the Leaflet tile-layer plugins (Sentinel Hub, openEO and
// external WMS/WMTS). The split-slider clip and per-layer opacity are pure DOM/CSS operations on the
// layer's container and are identical across layer types, so they live here instead of being copied
// into each plugin. The layers extend different bases (L.TileLayer and L.TileLayer.WMS), so these are
// plain functions taking the layer instance rather than a base class.

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyLeafletLayer = any;

// The compare-clippable layers share this shape (all are Leaflet tile layers); structural typing
// avoids `any` while not coupling to a specific base class (L.TileLayer vs L.TileLayer.WMS).
interface ClippableLayer {
  _map?: L.Map;
  clipping?: [number, number] | null;
  opacity?: number | null;
  getContainer(): HTMLElement | undefined;
}

// Clip the layer's container to its `clipping` = [a, b] horizontal slice of the current viewport
// (used by the compare split slider). No-op when there's no map or no clipping set.
export function updateLayerClipping(layer: ClippableLayer): void {
  if (!layer._map || !layer.clipping) {
    return;
  }
  const [a, b] = layer.clipping;
  const size = layer._map.getPixelBounds().getSize();
  let p = L.point(a * size.x, 0);
  let q = L.point(b * size.x, size.y);
  p = layer._map.containerPointToLayerPoint(p);
  q = layer._map.containerPointToLayerPoint(q);
  const e: HTMLElement | undefined = layer.getContainer();
  if (!e) {
    return;
  }
  e.style.overflow = 'hidden';
  e.style.left = p.x + 'px';
  e.style.top = p.y + 'px';
  e.style.width = q.x - p.x + 'px';
  e.style.height = q.y - p.y + 'px';
  for (let f = e.firstChild as HTMLElement | null; f; f = f.nextSibling as HTMLElement | null) {
    if (f.style) {
      f.style.marginTop = -p.y + 'px';
      f.style.marginLeft = -p.x + 'px';
    }
  }
}

// Apply the layer's `opacity` to its container. No-op when there's no map or opacity is unset
// (opacity 0 is honoured).
export function updateLayerOpacity(layer: ClippableLayer): void {
  if (!layer._map || layer.opacity == null) {
    return;
  }
  const e: HTMLElement | undefined = layer.getContainer();
  if (e) {
    e.style.opacity = String(layer.opacity);
  }
}

// Register a map `move` listener that re-applies clip + opacity as the user pans/zooms. Call from
// each layer's onAdd after the base onAdd, then apply once. `context` is the layer (listener `this`).
export function bindClipOpacityOnMove(layer: ClippableLayer, map: L.Map): void {
  map.on(
    'move',
    () => {
      updateLayerClipping(layer);
      updateLayerOpacity(layer);
    },
    layer,
  );
  updateLayerClipping(layer);
  updateLayerOpacity(layer);
}

// Delays tile loading until the map has been idle for `TILE_REQUEST_DEBOUNCE_MS`, so intermediate
// zoom levels during a rapid scroll don't each trigger their own tile-grid rebuild/request burst.
// Shared by the Sentinel Hub, openEO and external WMS/WMTS Leaflet layer plugins.
export function bindDebouncedTileUpdate(layer: AnyLeafletLayer): void {
  layer._debounceTimer = null;
  const originalUpdate = (L.GridLayer.prototype as AnyLeafletLayer)._update.bind(layer);
  layer._update = function (center: L.PointExpression) {
    clearTimeout(layer._debounceTimer);
    layer._debounceTimer = setTimeout(() => originalUpdate(center), TILE_REQUEST_DEBOUNCE_MS);
  };
  const originalOnRemove = layer.onRemove.bind(layer);
  layer.onRemove = function (map: L.Map) {
    clearTimeout(layer._debounceTimer);
    originalOnRemove(map);
  };
}
