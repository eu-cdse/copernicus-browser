import L from 'leaflet';
import { createTileLayerComponent, type LayerProps } from '@react-leaflet/core';
import {
  updateLayerClipping,
  updateLayerOpacity,
  bindClipOpacityOnMove,
  bindDebouncedTileUpdate,
} from './layerClipOpacity';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type AnyLeafletLayer = any;

// react-leaflet spreads every prop into the Leaflet options object, and Leaflet's setOptions
// copies keys with `for…in` — so `tileSize: undefined` lands as an own property that shadows
// GridLayer's 256px prototype default, yielding a NaN tile grid. The prop must be omitted
// entirely, not passed as undefined.
export function optionalTileSize(tileSize?: number | null): { tileSize?: number } {
  return tileSize != null ? { tileSize } : {};
}

// Same hazard as optionalTileSize: `maxZoom: undefined` would land as an own property shadowing
// GridLayer's prototype default, so only emit the key when it has a value.
// Setting an explicit maxZoom is what makes the layer participate in Leaflet's zoom-bound-layer
// bookkeeping (_addZoomLimit/_updateZoomLevels) — that's both what lets external layers zoom past
// GridLayer's default of 18, and what clamps the map back down when switching to a lower-max layer.
export function optionalZoomLimits(maxZoom?: number | null): { maxZoom?: number } {
  return maxZoom != null ? { maxZoom } : {};
}

// Compare-mode clip/opacity is shared with the other tile-layer plugins via layerClipOpacity.ts;
// only the WMS-specific onAdd setup (writing srs/crs into wmsParams) lives here.
function addClippingAndOpacity(layer: AnyLeafletLayer) {
  layer.onAdd = function (map: L.Map) {
    (this as AnyLeafletLayer)._initContainer();
    (this as AnyLeafletLayer)._crs = (this as AnyLeafletLayer).options.crs || map.options.crs;
    // Replicate L.TileLayer.WMS.onAdd setup: write srs/crs into wmsParams before tiles are requested
    if ((this as AnyLeafletLayer).wmsParams) {
      (this as AnyLeafletLayer)._wmsVersion = parseFloat((this as AnyLeafletLayer).wmsParams.version);
      const projectionKey = (this as AnyLeafletLayer)._wmsVersion >= 1.3 ? 'crs' : 'srs';
      (this as AnyLeafletLayer).wmsParams[projectionKey] = (this as AnyLeafletLayer)._crs.code;
    }
    L.TileLayer.prototype.onAdd.call(this, map);
    bindClipOpacityOnMove(this, map);
  };

  layer.updateClipping = function () {
    updateLayerClipping(this);
  };

  layer.updateOpacity = function () {
    updateLayerOpacity(this);
  };

  layer.setClipping = function (clipping: number[] | null) {
    (this as AnyLeafletLayer).clipping = clipping;
    (this as AnyLeafletLayer).updateClipping();
  };

  layer.setOpacity = function (opacity: number | null) {
    (this as AnyLeafletLayer).opacity = opacity;
    (this as AnyLeafletLayer).updateOpacity();
  };

  bindDebouncedTileUpdate(layer);
}

export class ExternalWmsLayer extends L.TileLayer.WMS {
  constructor(url: string, options: L.WMSOptions) {
    super(url, options);
    addClippingAndOpacity(this);
  }
}

class ExternalTileLayer extends L.TileLayer {
  constructor(url: string, options?: L.TileLayerOptions) {
    super(url, options);
    addClippingAndOpacity(this);
  }
}

interface ExternalWmsProps extends LayerProps {
  url: string;
  layers: string;
  format?: string;
  transparent?: boolean;
  version?: string;
  pane?: string;
  zIndex?: number;
  opacity?: number | null;
  clipping?: number[] | null;
  time?: string | null;
  style?: string | null;
  maxZoom?: number;
}

interface ExternalTileProps extends LayerProps {
  url: string;
  pane?: string;
  zIndex?: number;
  opacity?: number | null;
  clipping?: number[] | null;
  tileSize?: number;
  maxZoom?: number;
}

export const ExternalWmsLayerComponent = createTileLayerComponent<ExternalWmsLayer, ExternalWmsProps>(
  (props, context) => {
    const {
      url,
      layers,
      format,
      transparent,
      version,
      pane,
      zIndex,
      opacity,
      clipping,
      time,
      style,
      maxZoom,
    } = props;
    const options: L.WMSOptions = {
      layers: layers,
      format: format ?? 'image/png',
      transparent: transparent !== undefined ? transparent : true,
      version: version ?? '1.1.1',
      pane: pane,
      ...optionalZoomLimits(maxZoom),
    };
    // Only set zIndex when provided; passing undefined would override Leaflet's GridLayer default.
    if (zIndex != null) {
      options.zIndex = zIndex;
    }
    // TIME is an extra WMS GetMap param (not part of L.WMSOptions' typed keys); it ends up in wmsParams.
    if (time) {
      (options as Record<string, unknown>).TIME = time;
    }
    // Same for styles: the selected SLD style name, when the layer advertises more than one.
    // Lowercase to match L.TileLayer.WMS's own defaultWmsParams key — some WMS servers reject a
    // request that carries both `styles=` and `STYLES=` as duplicate parameters.
    if (style) {
      (options as Record<string, unknown>).styles = style;
    }
    const instance = new ExternalWmsLayer(url, options);
    (instance as AnyLeafletLayer).setClipping(clipping ?? null);
    (instance as AnyLeafletLayer).setOpacity(opacity ?? null);
    return { instance, context };
  },
  (instance, props, prevProps) => {
    if (prevProps.opacity !== props.opacity) {
      (instance as AnyLeafletLayer).setOpacity(props.opacity ?? null);
    }
    if (prevProps.clipping !== props.clipping) {
      (instance as AnyLeafletLayer).setClipping(props.clipping ?? null);
    }
    if (prevProps.zIndex !== props.zIndex) {
      (instance as AnyLeafletLayer).setZIndex(props.zIndex);
    }
    if (prevProps.time !== props.time) {
      // setParams merges into wmsParams and redraws; empty string clears the TIME filter.
      (instance as AnyLeafletLayer).setParams({ TIME: props.time ?? '' });
    }
    if (prevProps.style !== props.style) {
      // Empty string falls back to the server's default style, matching the TIME clear above.
      // Lowercase `styles` to match L.TileLayer.WMS's own defaultWmsParams key — avoids sending
      // both `styles=` and `STYLES=` as duplicate parameters, which some WMS servers reject outright.
      (instance as AnyLeafletLayer).setParams({ styles: props.style ?? '' });
    }
    // Guard against instance reuse: if a reused layer is handed a different source, repoint it.
    if (prevProps.url !== props.url) {
      (instance as AnyLeafletLayer).setUrl(props.url);
    }
    if (prevProps.layers !== props.layers) {
      (instance as AnyLeafletLayer).setParams({ layers: props.layers });
    }
  },
);

export const ExternalTileLayerComponent = createTileLayerComponent<ExternalTileLayer, ExternalTileProps>(
  (props, context) => {
    const { url, pane, zIndex, opacity, clipping, tileSize, maxZoom } = props;
    const options: L.TileLayerOptions = { pane, ...optionalZoomLimits(maxZoom) };
    // Only set zIndex when provided; passing undefined would override Leaflet's GridLayer default.
    if (zIndex != null) {
      options.zIndex = zIndex;
    }
    // Only set tileSize when provided; passing undefined would override Leaflet's 256px default.
    if (tileSize != null) {
      options.tileSize = tileSize;
    }
    const instance = new ExternalTileLayer(url, options);
    (instance as AnyLeafletLayer).setClipping(clipping ?? null);
    (instance as AnyLeafletLayer).setOpacity(opacity ?? null);
    return { instance, context };
  },
  (instance, props, prevProps) => {
    if (prevProps.opacity !== props.opacity) {
      (instance as AnyLeafletLayer).setOpacity(props.opacity ?? null);
    }
    if (prevProps.clipping !== props.clipping) {
      (instance as AnyLeafletLayer).setClipping(props.clipping ?? null);
    }
    if (prevProps.zIndex !== props.zIndex) {
      (instance as AnyLeafletLayer).setZIndex(props.zIndex);
    }
    // Guard against instance reuse: if a reused layer is handed a different source, repoint it.
    if (prevProps.url !== props.url) {
      (instance as AnyLeafletLayer).setUrl(props.url);
    }
  },
);
