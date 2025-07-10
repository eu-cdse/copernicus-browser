import L from 'leaflet';
import isEqual from 'lodash.isequal';
import { GridLayer, withLeaflet } from 'react-leaflet';
import processGraphBuilder from '../../api/openEO/processGraphBuilder';
import openEOApi from '../../api/openEO/openEO.api';
import { MIMETYPE_TO_OPENEO_FORMAT } from '../../api/openEO/openEOHelpers';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { BBox, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';
import { metersPerPixel } from '../../utils/coords';

function findNodeByProcessId(processGraph, processId) {
  return Object.keys(processGraph).find((key) => processGraph[key].process_id === processId);
}

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
    const nw = L.CRS.EPSG4326.project(this._map.unproject(nwPoint, coords.z));
    const se = L.CRS.EPSG4326.project(this._map.unproject(sePoint, coords.z));
    const processGraph = this.options.processGraph;
    const loadCollectionNode = findNodeByProcessId(processGraph, 'load_collection');
    if (loadCollectionNode === undefined) {
      throw new Error('No load_collection process found');
    }
    let collectionId = null;
    if (this.dsh?.supportsLowResolutionAlternativeCollection(this.options.datasetId)) {
      const lowResolutionCollectionId = this.dsh.getLowResolutionCollectionId(this.options.datasetId);
      const lowResolutionMetersPerPixelThreshold = this.dsh.getLowResolutionMetersPerPixelThreshold(
        this.options.datasetId,
      );
      const mPerPixel = metersPerPixel(new BBox(CRS_EPSG4326, nw.x, se.y, se.x, nw.y), this.options.tileSize);
      if (mPerPixel > lowResolutionMetersPerPixelThreshold) {
        collectionId = `byoc-${lowResolutionCollectionId}`;
      }
    }

    const newProcessGraph = processGraphBuilder.saveResult(
      processGraphBuilder.loadCollection(processGraph, {
        id: collectionId,
        spatial_extent: {
          west: nw.x,
          east: se.x,
          south: se.y,
          north: nw.y,
          height: this.options.tileSize,
          width: this.options.tileSize,
        },
        temporal_extent: [this.options.fromTime, this.options.toTime],
      }),
      { format: this.options.format },
    );

    const onTileImageError = this.options.onTileImageError;
    const onTileImageLoad = this.options.onTileImageLoad;

    const controller = new AbortController();
    const signal = controller.signal;
    tile.controller = controller;
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

  setParams = (params) => {
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
    }
    layer.on('tileunload', function (e) {
      e.tile.controller.abort();
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
    if (params.processGraph && Object.keys(params.processGraph).length > 0) {
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
