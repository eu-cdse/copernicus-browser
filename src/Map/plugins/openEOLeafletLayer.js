import L from 'leaflet';
import isEqual from 'lodash.isequal';
import { GridLayer, withLeaflet } from 'react-leaflet';
import processGraphBuilder from '../../api/openEO/processGraphBuilder';
import openEOApi from '../../api/openEO/openEO.api';
import {
  OPENEO_DOWNLOADABLE_FORMATS,
  findNodeByProcessId,
  OPENEO_VALID_FORMATS,
  MIMETYPE_TO_OPENEO_FORMAT,
} from '../../api/openEO/openEOHelpers';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { BBox, CRS_EPSG3857 } from '@sentinel-hub/sentinelhub-js';
import { metersPerPixel } from '../../utils/coords';
import store, { notificationSlice } from '../../store';
import { t } from 'ttag';

class OpenEoLayer extends L.TileLayer {
  constructor(options) {
    super(options);
    const defaultOptions = {
      tileSize: 512,
      format: MIMETYPE_TO_OPENEO_FORMAT['image/png'],
      attribution: '<a href="https://www.sentinel-hub.com" target="_blank">&copy Sentinel Hub</a>',
    };

    const mergedOptions = Object.assign(defaultOptions, options);
    L.setOptions(this, mergedOptions);
    this.dsh = getDataSourceHandler(this.options.datasetId);
  }

  onAdd = (map) => {
    this._initContainer();
    this._crs = this.options.crs || map.options.crs;
    L.TileLayer.prototype.onAdd.call(this, map);
    map.on(
      'move',
      () => {
        this.updateClipping();
        this.updateOpacity();
      },
      this,
    );
    this.updateClipping();
    this.updateOpacity();
  };

  createTile = (coords, done) => {
    const tile = L.DomUtil.create('img', 'leaflet-tile');
    tile.width = this.options.tileSize;
    tile.height = this.options.tileSize;
    const nwPoint = coords.multiplyBy(this.options.tileSize);
    const sePoint = nwPoint.add([this.options.tileSize, this.options.tileSize]);
    const nw = L.CRS.EPSG3857.project(this._map.unproject(nwPoint, coords.z));
    const se = L.CRS.EPSG3857.project(this._map.unproject(sePoint, coords.z));
    const processGraph = this.options.processGraph;
    const loadCollectionNode = findNodeByProcessId(processGraph, 'load_collection');

    const onTileImageError = this.options.onTileImageError;
    const onTileImageLoad = this.options.onTileImageLoad;

    const controller = new AbortController();
    const signal = controller.signal;
    tile.controller = controller;

    if (loadCollectionNode === undefined) {
      store.dispatch(
        notificationSlice.actions.displayError(t`No load_collection process found in the process graph.`),
      );
      done(new Error('No load_collection process found'), null);
      return tile;
    }

    let collectionId;

    if (this.dsh?.supportsLowResolutionAlternativeCollection(this.options.datasetId)) {
      const lowResolutionCollectionId = this.dsh.getLowResolutionCollectionId(this.options.datasetId);
      const lowResolutionMetersPerPixelThreshold = this.dsh.getLowResolutionMetersPerPixelThreshold(
        this.options.datasetId,
      );
      const mPerPixel = metersPerPixel(new BBox(CRS_EPSG3857, nw.x, se.y, se.x, nw.y), this.options.tileSize);
      if (mPerPixel > lowResolutionMetersPerPixelThreshold) {
        collectionId = `byoc-${lowResolutionCollectionId}`;
      }
    }

    const newProcessGraph = processGraphBuilder.loadCollection(processGraph, {
      id: collectionId,
      datasetId: this.options.datasetId,
      spatial_extent: {
        west: nw.x,
        east: se.x,
        south: se.y,
        north: nw.y,
        height: this.options.tileSize,
        width: this.options.tileSize,
        crs: CRS_EPSG3857.authId,
      },
      temporal_extent: [this.options.fromTime, this.options.toTime],
    });

    openEOApi
      .getResult(newProcessGraph, this.options.getMapAuthToken, signal)
      .then(async (blob) => {
        tile.onload = function () {
          URL.revokeObjectURL(tile.src);
          if (onTileImageLoad) {
            onTileImageLoad();
          }
          done(null, tile);
        };
        const objectURL = URL.createObjectURL(blob);
        tile.src = objectURL;
      })
      .catch(function (error) {
        if (error.name !== 'AbortError') {
          if (onTileImageError) {
            onTileImageError(error);
          }
          console.error('There has been a problem with your fetch operation: ', error.message);
        }
        done(error, null);
      });

    return tile;
  };

  validateProcessGraphFormat = (processGraph) => {
    const saveResultNode = findNodeByProcessId(processGraph, 'save_result');
    if (saveResultNode) {
      const format = processGraph[saveResultNode]?.arguments?.format;
      if (format && !OPENEO_VALID_FORMATS.includes(format.toLowerCase())) {
        const formatLower = format.toLowerCase();
        if (OPENEO_DOWNLOADABLE_FORMATS.includes(formatLower)) {
          store.dispatch(
            notificationSlice.actions.displayError(
              t`Format "${format}" is not supported for map visualization but can be downloaded.`,
            ),
          );
        } else {
          store.dispatch(
            notificationSlice.actions.displayError(
              t`Format "${format}" is not supported. Only PNG and JPG formats are supported for map visualization.`,
            ),
          );
        }
        return false;
      }
    }
    return true;
  };

  setParams = (params) => {
    if (!this.validateProcessGraphFormat(params.processGraph)) {
      return;
    }

    this.options = Object.assign(this.options, params);
    this.redraw();
  };

  setClipping = (clipping) => {
    this.clipping = clipping;
    this.updateClipping();
  };

  setOpacity = (opacity) => {
    this.opacity = opacity;
    this.updateOpacity();
  };

  updateClipping = () => {
    if (!this._map || !this.clipping) {
      return this;
    }

    const [a, b] = this.clipping;
    const { min, max } = this._map.getPixelBounds();
    let p = { x: a * (max.x - min.x), y: 0 };
    let q = { x: b * (max.x - min.x), y: max.y - min.y };

    p = this._map.containerPointToLayerPoint(p);
    q = this._map.containerPointToLayerPoint(q);

    let e = this.getContainer();
    e.style['overflow'] = 'hidden';
    e.style['left'] = p.x + 'px';
    e.style['top'] = p.y + 'px';
    e.style['width'] = q.x - p.x + 'px';
    e.style['height'] = q.y - p.y + 'px';
    for (let f = e.firstChild; f; f = f.nextSibling) {
      if (f.style) {
        f.style['margin-top'] = -p.y + 'px';
        f.style['margin-left'] = -p.x + 'px';
      }
    }
  };

  updateOpacity = () => {
    if (!this._map || !this.opacity) {
      return this;
    }
    let e = this.getContainer();
    e.style['opacity'] = this.opacity;
  };
}

class OpenEoLayerComponent extends GridLayer {
  createLeafletElement(props) {
    const { progress, ...params } = props;
    const { leaflet: _l, ...options } = this.getOptions(params);
    const layer = new OpenEoLayer(options);
    if (progress) {
      layer.on('loading', function () {
        progress.start();
        progress.inc();
      });

      layer.on('load', function () {
        progress.done();
      });

      layer.on('tileerror', function () {
        if (layer._noTilesToLoad()) {
          progress.done();
        }
      });
    }
    layer.on('tileunload', function (e) {
      if (e !== undefined && e.tile !== undefined && e.tile.controller !== undefined) {
        e.tile.controller.abort();
      }
    });
    layer.setClipping(params.clipping);
    layer.setOpacity(params.opacity);
    return layer;
  }

  updateLeafletElement(fromProps, toProps) {
    super.updateLeafletElement(fromProps, toProps);
    const { ...prevProps } = fromProps;
    const { ...prevParams } = this.getOptions(prevProps);
    const { ...props } = toProps;
    const { ...params } = this.getOptions(props);

    if (!isEqual(params, prevParams)) {
      this.leafletElement.setParams(params);
    }
    if (fromProps.opacity !== toProps.opacity) {
      this.leafletElement.setOpacity(toProps.opacity);
    }
    if (fromProps.clipping !== toProps.clipping) {
      this.leafletElement.setClipping(toProps.clipping);
    }
  }

  getOptions(params) {
    let options = {};
    if (params.processGraph) {
      options.processGraph = params.processGraph;
    }
    if (params.datasetId) {
      options.datasetId = params.datasetId;
    }
    if (params.fromTime) {
      options.fromTime = params.fromTime;
    }

    if (params.toTime) {
      options.toTime = params.toTime;
    }

    if (params.getMapAuthToken) {
      options.getMapAuthToken = params.getMapAuthToken;
    }

    if (params.onTileImageError) {
      options.onTileImageError = params.onTileImageError;
    }

    if (params.onTileImageLoad) {
      options.onTileImageLoad = params.onTileImageLoad;
    }

    if (params.pane || params.leaflet.pane) {
      options.pane = params.pane || params.leaflet.pane;
    }

    if (params.minZoom) {
      options.minZoom = params.minZoom;
    }
    if (params.maxZoom && params.allowOverZoomBy) {
      options.maxNativeZoom = params.maxZoom;
      options.maxZoom = params.maxZoom + params.allowOverZoomBy;
    } else if (params.maxZoom) {
      options.maxNativeZoom = params.maxZoom;
      options.maxZoom = params.maxZoom;
    }

    return options;
  }
}
export default withLeaflet(OpenEoLayerComponent);
