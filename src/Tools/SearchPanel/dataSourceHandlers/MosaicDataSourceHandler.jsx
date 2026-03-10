import { t } from 'ttag';
import { BYOCLayer } from '@sentinel-hub/sentinelhub-js';

import AbstractBYOCDataSourceHandler from './AbstractBYOCDataSourceHandler';
import { filterLayers } from './filter';
import { isFunction } from '../../../utils';
import { DATASOURCES } from '../../../const';

import { getSHServiceRootUrl } from './dataSourceHandlers';
import {
  getWorldCoverAnnualCloudlessMosaic,
  getSentinel2QuarterlyCloudlessMosaic,
} from './DatasourceRenderingComponents/dataSourceTooltips/MosaicsTooltip';
import {
  COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC,
  COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
} from './dataSourceConstants';
import moment from 'moment';
import { S2_ANNUAL_MOSAIC_BANDS, S2_QUARTERLY_MOSAIC_BANDS } from './datasourceAssets/MosaicsBands';

const LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS = {
  [COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC]: {
    lowResolutionCollectionId: '6af2d932-8f18-4bed-a31b-d32bc49d43a0',
    lowResolutionMetersPerPixelThreshold: 320,
  },
};

export default class MosaicDataSourceHandler extends AbstractBYOCDataSourceHandler {
  constructor() {
    super();
    this.LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS = LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS;
  }

  datasetSearchLabels = {};
  datasetSearchIds = {};
  collections = {};

  urls = {};
  datasets = [];
  preselectedDatasets = new Set();
  allLayers = [];
  datasource = DATASOURCES.MOSAIC;
  limitMonthsSearch = 12;
  searchGroupLabel = 'Sentinel-2 Mosaics';

  KNOWN_COLLECTIONS = {
    [COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC]: [COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC],
    [COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC]: [COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC],
  };

  MIN_MAX_DATES = {
    [COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC]: {
      minDate: moment.utc('2020-01-01'),
      maxDate: moment.utc('2021-01-01'),
    },
    [COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC]: {
      minDate: moment.utc('2015-07-01'),
      maxDate: null,
    },
  };

  leafletZoomConfig = {
    [COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC]: {
      min: 9,
      max: 25,
    },
    [COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC]: {
      min: 2,
      max: 25,
    },
  };

  getDatasetSearchLabels = () => ({
    [COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC]: t`WorldCover Annual Cloudless Mosaics`,
    [COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC]: t`Sentinel-2 Quarterly Mosaics`,
  });

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

  getResolutionLimits() {
    return { resolution: 0.5 };
  }

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

  getLayers = (data, datasetId, url, _layersExclude, _layersInclude) => {
    let layers = data.filter((layer) => layer.collectionId === datasetId && filterLayers(layer.layerId));
    layers.forEach((l) => {
      l.url = url;
    });
    return layers;
  };

  supportsCustomLayer(datasetId) {
    const availableBands = this.collections[datasetId]?.availableBands;
    return availableBands && !!availableBands.length;
  }

  getDatasetLabel = (datasetId) => {
    let collectionLabel;
    const collectionData = this.collections[datasetId];
    if (collectionData) {
      //Use theme name as label if all layers in theme are based on same collection, otherwise use title( at the moment this represents layer name)
      collectionLabel = this.datasets.length === 1 ? collectionData.themeName : collectionData.title;
    }
    return collectionLabel || 'CUSTOM';
  };

  getDescriptionForDataset = (datasetId) => {
    const collectionId = this.getCollectionByDatasetId(datasetId);
    switch (collectionId) {
      case COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC:
        return getWorldCoverAnnualCloudlessMosaic();
      case COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC:
        return getSentinel2QuarterlyCloudlessMosaic();
      default:
        return null;
    }
  };

  getBands = (datasetId) => {
    const collectionId = this.getCollectionByDatasetId(datasetId);
    switch (collectionId) {
      case COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC:
        return S2_ANNUAL_MOSAIC_BANDS;
      case COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC:
        return S2_QUARTERLY_MOSAIC_BANDS;
      default:
        return [];
    }
  };

  getLeafletZoomConfig(datasetId) {
    const collectionId = this.getCollectionByDatasetId(datasetId);
    if (!collectionId) {
      return { min: 0, max: 25 };
    }
    return this.leafletZoomConfig[collectionId];
  }

  supportsInterpolation() {
    return true;
  }

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

  supportsDisplayLatestDateOnSelect = (_datasetId) => true;

  supportsFindProductsForCurrentView = (datasetId) =>
    datasetId === COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC;

  isOnlyForBaseLayer = (datasetId) => this.collections[datasetId].onlyForBaseLayer;
}
