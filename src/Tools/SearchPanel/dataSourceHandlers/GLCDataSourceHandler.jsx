import { DATASOURCES } from '../../../const';
import { CDSE_GLC_COLLECTION } from './dataSourceConstants';
import moment from 'moment';
import { constructV3Evalscript, isFunction } from '../../../utils';
import { BYOCLayer, DATASET_BYOC } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';
import { filterLayers } from './filter';
import { getSHServiceRootUrl } from './dataSourceHandlers';
import DataSourceHandler from './DataSourceHandler';
import { getGLCTooltip } from './DatasourceRenderingComponents/dataSourceTooltips/GLCTooltip';

export default class GLCDataSourceHandler extends DataSourceHandler {
  datasetSearchLabels = {};
  datasetSearchIds = {};
  collections = {};

  urls = {};
  datasets = [];
  preselectedDatasets = new Set();
  allLayers = [];
  searchFilters = {};
  isChecked = false;
  datasource = DATASOURCES.GLOBAL_LAND_COVER;
  limitMonthsSearch = 12;
  searchGroupLabel = 'Global Land Cover';

  KNOWN_COLLECTIONS = {
    [CDSE_GLC_COLLECTION]: [CDSE_GLC_COLLECTION],
  };

  MIN_MAX_DATES = {
    [CDSE_GLC_COLLECTION]: {
      minDate: moment.utc('2016-01-01'),
      maxDate: moment.utc('2019-12-31'),
    },
  };

  leafletZoomConfig = {
    [CDSE_GLC_COLLECTION]: {
      min: 5,
      max: 25,
    },
  };

  willHandle(service, url, name, layers, preselected, onlyForBaseLayer) {
    name = isFunction(name) ? name() : name;
    const customLayers = layers.filter(
      (l) =>
        l instanceof BYOCLayer && l.collectionId && this.getKnownCollectionsList().includes(l.collectionId),
    );
    if (customLayers.length === 0) {
      return false;
    }
    customLayers.forEach((layer) => {
      this.collections[layer.collectionId] = {
        title: layer.collectionTitle || layer.title,
        url: url,
        themeName: name.replace(t`Based on: `, ''),
        availableBands: layer.availableBands,
        subType: layer.subType,
        onlyForBaseLayer: onlyForBaseLayer,
      };
      // Once collections endpoint will be working properly,
      // title should be replaced with actual collection name (if service will provide such information)
    });

    if (Object.keys(this.collections).length === 0) {
      return;
    }
    this.datasets = Object.keys(this.collections);
    this.datasets.forEach((id) => {
      this.datasetSearchIds[id] = id;
      this.datasetSearchLabels[id] = this.collections[id].title;

      const existingUrls = this.urls[id] ?? [];
      if (!onlyForBaseLayer) {
        existingUrls.push(url);
      }

      this.urls[id] = [...new Set(existingUrls)];
    });

    this.allLayers = [...this.allLayers, ...layers];
    this.saveFISLayers(url, layers);
    return true;
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  getKnownCollectionsList() {
    return Object.values(this.KNOWN_COLLECTIONS).flat();
  }

  getSentinelHubDataset = () => DATASET_BYOC;

  getCollectionByDatasetId(datasetId) {
    return Object.keys(this.KNOWN_COLLECTIONS).find((collection) =>
      this.KNOWN_COLLECTIONS[collection].includes(datasetId),
    );
  }

  getMinMaxDates(datasetId) {
    const collectionId = this.getCollectionByDatasetId(datasetId);
    if (!collectionId) {
      return { minDate: null, maxDate: null };
    }
    return this.MIN_MAX_DATES[collectionId];
  }

  getUrlsForDataset = (datasetId) => {
    return this.urls[datasetId] ? [...new Set(this.urls[datasetId])] : [];
  };

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    let layers = data.filter((layer) => layer.collectionId === datasetId && filterLayers(layer.layerId));
    layers.forEach((l) => {
      l.url = url;
    });
    return layers;
  };

  getBaseLayerForDatasetId = (datasetId) => {
    const layer = this.allLayers.find((l) => l.collectionId === datasetId);
    if (layer) {
      const newLayer = new BYOCLayer({
        evalscript: true,
        collectionId: datasetId,
        subType: layer.subType,
        locationId: layer.locationId,
        shServiceRootUrl: getSHServiceRootUrl(),
      });

      if (this.supportsLowResolutionAlternativeCollection(newLayer.collectionId)) {
        newLayer.lowResolutionCollectionId = this.getLowResolutionCollectionId(newLayer.collectionId);
        newLayer.lowResolutionMetersPerPixelThreshold = this.getLowResolutionMetersPerPixelThreshold(
          newLayer.collectionId,
        );
      }

      return newLayer;
    }
  };

  getDatasetSearchLabels = () => ({
    [CDSE_GLC_COLLECTION]: t`Global Land Cover`,
  });

  getDescription = () => getGLCTooltip();

  getDatasetParams = (datasetId) => {
    const layer = this.allLayers.find((l) => l.collectionId === datasetId);
    if (layer) {
      return {
        collectionId: datasetId,
        subType: layer.subType,
        locationId: layer.locationId,
        shServiceRootUrl: getSHServiceRootUrl(),
      };
    }
    return {};
  };

  getBands = (datasetId) => {
    return this.collections[datasetId].availableBands;
  };

  generateEvalscript = (bands, dataSetId, config) => {
    if (config) {
      return constructV3Evalscript(bands, config);
    }

    return `//VERSION=3
function setup() {
  return {
    input: ["${[...new Set(Object.values(bands))].join('","')}", "dataMask"],
    output: { bands: 4 }
  };
}
let factor = 1/2000;
function evaluatePixel(sample) {
  // This comment is required for evalscript parsing to work
  return [${Object.values(bands)
    .map((e) => 'factor * sample.' + e)
    .join(',')}, sample.dataMask ];
}`;
  };
}
