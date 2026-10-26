import L from 'leaflet';
import * as maplibregl from 'maplibre-gl';
import maplibreWorkerUrl from 'maplibre-gl/dist/maplibre-gl-worker.mjs?url';
import { createLayerComponent } from '@react-leaflet/core';

import 'maplibre-gl/dist/maplibre-gl.css';

// maplibre-gl 6 finds its worker via a computed `new URL(name, import.meta.url)`, which Vite doesn't detect, so the
// worker file is left out of the production build. Importing it with `?url` makes Vite emit it.
maplibregl.setWorkerUrl(maplibreWorkerUrl);

const GlTileLayer = createLayerComponent(
  (props, context) => ({ instance: new MaplibreGL(props), context }),
  (instance, props, prevProps) => {
    if (props.style !== prevProps.style) {
      instance.getMapboxMap()?.setStyle(props.style);
    }
  },
);

export default GlTileLayer;

/*
Copyright (c) 2014, Mapbox

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted, provided that the above
copyright notice and this permission notice appear in all copies.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES
WITH REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF
MERCHANTABILITY AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR
ANY SPECIAL, DIRECT, INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES
WHATSOEVER RESULTING FROM LOSS OF USE, DATA OR PROFITS, WHETHER IN AN
ACTION OF CONTRACT, NEGLIGENCE OR OTHER TORTIOUS ACTION, ARISING OUT OF
OR IN CONNECTION WITH THE USE OR PERFORMANCE OF THIS SOFTWARE.
*/

// This is an edited copy of https://github.com/mapbox/mapbox-gl-leaflet
// Reason for copy and edit is because current versions of the library doesnt support using custom panes
const MaplibreGL = L.Layer.extend({
  options: {
    updateInterval: 32,
    // How much to extend the overlay view (relative to map size)
    // e.g. 0.1 would be 10% of map view in each direction
    padding: 0,
    // whether or not to register the mouse and keyboard
    // events on the mapbox overlay
    interactive: false,
  },

  initialize: function (options) {
    L.setOptions(this, options);

    // setup throttling the update event when panning
    this._throttledUpdate = L.Util.throttle(this._update, this.options.updateInterval, this);
  },

  onAdd: function (map) {
    if (!this._container) {
      this._initContainer();
    }

    this.getPane().appendChild(this._container);

    this._initGL();

    // maplibre-gl 6 needs WebGL2; without a GL map this layer stays empty instead of breaking the whole map
    if (!this._glMap) {
      return;
    }

    this._offset = this._map.containerPointToLayerPoint([0, 0]);
    this._update();
    // work around https://github.com/mapbox/mapbox-gl-leaflet/issues/47
    if (map.options.zoomAnimation) {
      L.DomEvent.on(map._proxy, L.DomUtil.TRANSITION_END, this._transitionEnd, this);
    }
  },

  onRemove: function () {
    if (this._map._proxy && this._map.options.zoomAnimation) {
      L.DomEvent.off(this._map._proxy, L.DomUtil.TRANSITION_END, this._transitionEnd, this);
    }

    // when changing the language while looking at layer, `pane` is undefined
    const pane = this.getPane();
    if (pane) {
      pane.removeChild(this._container);
    }
    if (this._glMap) {
      this._glMap.remove();
      this._glMap = null;
    }
  },

  getEvents: function () {
    return {
      move: this._throttledUpdate, // sensibly throttle updating while panning
      zoomanim: this._animateZoom, // applys the zoom animation to the <canvas>
      zoom: this._pinchZoom, // animate every zoom event for smoother pinch-zooming
      zoomstart: this._zoomStart, // flag starting a zoom to disable panning
      zoomend: this._zoomEnd,
      resize: this._resize,
    };
  },

  getMapboxMap: function () {
    return this._glMap;
  },

  getCanvas: function () {
    return this._glMap?.getCanvas();
  },

  getSize: function () {
    return this._map.getSize().multiplyBy(1 + this.options.padding * 2);
  },

  getBounds: function () {
    var halfSize = this.getSize().multiplyBy(0.5);
    var center = this._map.latLngToContainerPoint(this._map.getCenter());
    return L.latLngBounds(
      this._map.containerPointToLatLng(center.subtract(halfSize)),
      this._map.containerPointToLatLng(center.add(halfSize)),
    );
  },

  getContainer: function () {
    return this._container;
  },

  _initContainer: function () {
    var container = (this._container = L.DomUtil.create('div', 'leaflet-gl-layer'));

    var size = this.getSize();
    var offset = this._map.getSize().multiplyBy(this.options.padding);
    container.style.width = size.x + 'px';
    container.style.height = size.y + 'px';

    var topLeft = this._map.containerPointToLayerPoint([0, 0]).subtract(offset);

    L.DomUtil.setPosition(container, topLeft);
  },

  _initGL: function () {
    var center = this._map.getCenter();

    // maplibre-gl 6 no longer accepts `preserveDrawingBuffer` as a top-level option
    var { preserveDrawingBuffer, ...layerOptions } = this.options;

    var options = L.extend({}, layerOptions, {
      container: this._container,
      center: [center.lng, center.lat],
      zoom: this._map.getZoom() - 1,
      attributionControl: false,
      // the layer sizes the GL map itself in _update, so don't let maplibre also observe the container
      trackResize: false,
      canvasContextAttributes: { preserveDrawingBuffer: !!preserveDrawingBuffer },
      // allow GL base map to pan beyond min/max latitudes
      transformConstrain: (lngLat, zoom) => ({ center: lngLat, zoom }),
    });

    try {
      this._glMap = new maplibregl.Map(options);
    } catch (error) {
      // maplibre-gl 6 throws when it can't get a WebGL2 context
      console.error('Unable to create the vector map layer', error);
      this._glMap = null;
      return;
    }

    this._glMap._actualCanvas = this._glMap.getCanvas();

    // maplibre-gl 6 no longer exposes `map.transform`, so remember the size the GL map was last resized to.
    // Start at 0x0 so the first _update after (re)adding the layer always restyles the container and resizes the
    // GL map; the container is reused on re-add and may still have the size from before a window resize.
    this._glSize = L.point(0, 0);

    // treat child <canvas> element like L.ImageOverlay
    var canvas = this._glMap._actualCanvas;
    L.DomUtil.addClass(canvas, 'leaflet-image-layer');
    L.DomUtil.addClass(canvas, 'leaflet-zoom-animated');
    if (this.options.interactive) {
      L.DomUtil.addClass(canvas, 'leaflet-interactive');
    }
    if (this.options.className) {
      L.DomUtil.addClass(canvas, this.options.className);
    }
  },

  _update: function () {
    if (!this._glMap) {
      return;
    }

    // update the offset so we can correct for it later when we zoom
    this._offset = this._map.containerPointToLayerPoint([0, 0]);

    if (this._zooming) {
      return;
    }

    var size = this.getSize(),
      container = this._container,
      gl = this._glMap,
      offset = this._map.getSize().multiplyBy(this.options.padding),
      topLeft = this._map.containerPointToLayerPoint([0, 0]).subtract(offset);

    L.DomUtil.setPosition(container, topLeft);

    // jumpTo applies the new camera synchronously, unlike an animated setView
    this._pinchZoom();

    if (this._glSize.x !== size.x || this._glSize.y !== size.y) {
      this._glSize = size;
      container.style.width = size.x + 'px';
      container.style.height = size.y + 'px';
      gl.resize();
    } else {
      gl.triggerRepaint();
    }
  },

  // update the map constantly during a pinch zoom
  _pinchZoom: function () {
    if (!this._glMap) {
      return;
    }

    this._glMap.jumpTo({
      zoom: this._map.getZoom() - 1,
      center: this._map.getCenter(),
    });
  },

  // borrowed from L.ImageOverlay
  // https://github.com/Leaflet/Leaflet/blob/master/src/layer/ImageOverlay.js#L139-L144
  _animateZoom: function (e) {
    if (!this._glMap) {
      return;
    }

    var scale = this._map.getZoomScale(e.zoom);
    var padding = this._map.getSize().multiplyBy(this.options.padding * scale);
    var viewHalf = this.getSize()._divideBy(2);
    // corrections for padding (scaled), adapted from
    // https://github.com/Leaflet/Leaflet/blob/master/src/map/Map.js#L1490-L1508
    var topLeft = this._map
      .project(e.center, e.zoom)
      ._subtract(viewHalf)
      ._add(this._map._getMapPanePos().add(padding))
      ._round();
    var offset = this._map.project(this._map.getBounds().getNorthWest(), e.zoom)._subtract(topLeft);

    L.DomUtil.setTransform(this._glMap._actualCanvas, offset.subtract(this._offset), scale);
  },

  _zoomStart: function () {
    this._zooming = true;
  },

  _zoomEnd: function () {
    if (!this._glMap) {
      return;
    }

    var scale = this._map.getZoomScale(this._map.getZoom()),
      offset = this._map._latLngToNewLayerPoint(
        this._map.getBounds().getNorthWest(),
        this._map.getZoom(),
        this._map.getCenter(),
      );

    L.DomUtil.setTransform(this._glMap._actualCanvas, offset.subtract(this._offset), scale);

    this._zooming = false;

    this._update();
  },

  _transitionEnd: function () {
    L.Util.requestAnimFrame(function () {
      // the layer may have been removed (or never got a GL map) before this frame
      if (!this._glMap) {
        return;
      }

      var zoom = this._map.getZoom();
      var center = this._map.getCenter();
      var offset = this._map.latLngToContainerPoint(this._map.getBounds().getNorthWest());

      // reset the scale and offset
      L.DomUtil.setTransform(this._glMap._actualCanvas, offset, 1);

      // enable panning once the gl map is ready again
      this._glMap.once(
        'moveend',
        L.Util.bind(function () {
          this._zoomEnd();
        }, this),
      );

      // update the map position
      this._glMap.jumpTo({
        center: center,
        zoom: zoom - 1,
      });
    }, this);
  },

  _resize: function (e) {
    this._transitionEnd(e);
  },
});
