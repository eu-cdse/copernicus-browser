import React from 'react';
import { t } from 'ttag';
import { BYOCLayer, DATASET_BYOC, BYOCSubTypes, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';

import DataSourceHandler from './DataSourceHandler';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { filterLayers } from './filter';
import { constructV3Evalscript, isFunction } from '../../../utils';
import { generateFallbackEvalscript } from './datasourceAssets/evalscriptTemplates';
import { DATASOURCES } from '../../../const';
import { reprojectGeometry } from '../../../utils/reproject';
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

const CRS_EPSG4326_urn = 'urn:ogc:def:crs:EPSG::4326';

const LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS = {
  [COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC]: {
    lowResolutionCollectionId: '6af2d932-8f18-4bed-a31b-d32bc49d43a0',
    lowResolutionMetersPerPixelThreshold: 320,
  },
};

export default class MosaicDataSourceHandler extends DataSourceHandler {
  datasetSearchLabels = {};
  datasetSearchIds = {};
  collections = {};

  urls = {};
  datasets = [];
  preselectedDatasets = new Set();
  allLayers = [];
  searchFilters = {};
  isChecked = false;
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

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }
    return (
      <GenericSearchGroup
        key={'CUSTOM'}
        label={this.getSearchGroupLabel()}
        preselected={false}
        saveCheckedState={this.saveCheckedState}
        saveFiltersValues={this.saveSearchFilters}
        options={this.datasets.length > 1 ? this.datasets : []}
        optionsLabels={this.datasetSearchLabels}
        preselectedOptions={Array.from(this.preselectedDatasets)}
        hasMaxCCFilter={false}
      />
    );
  }
  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];
    let datasets;

    if (this.datasets.length === 1) {
      datasets = this.datasets;
    } else {
      datasets = this.searchFilters.selectedOptions;
    }

    datasets.forEach((datasetId) => {
      // InstanceId, layerId and evalscript are required parameters, although we don't need them for findTiles.
      // As we don't have any layer related information at this stage, some dummy values are set for those 3 params to prevent
      // querying configuration service for dataset defaults
      const subType = this.collections[datasetId].subType
        ? this.collections[datasetId].subType
        : BYOCSubTypes.BYOC;
      const searchLayer = new BYOCLayer({
        instanceId: true,
        layerId: true,
        evalscript: '//',
        collectionId: datasetId,
        subType: subType,
        shServiceRootUrl: getSHServiceRootUrl(),
      });
      const ff = new FetchingFunction(
        datasetId,
        searchLayer,
        fromMoment,
        toMoment,
        queryArea,
        this.convertToStandardTiles,
      );
      fetchingFunctions.push(ff);
    });
    return fetchingFunctions;
  }

  convertToStandardTiles = (data, datasetId) => {
    const tiles = data.map((t) => {
      if (t.geometry && t.geometry.crs && t.geometry.crs.properties.name !== CRS_EPSG4326_urn) {
        reprojectGeometry(t.geometry, { toCrs: CRS_EPSG4326.authId });
      }
      return {
        sensingTime: t.sensingTime,
        geometry: t.geometry,
        datasource: this.datasource,
        datasetId: datasetId,
        metadata: {},
      };
    });
    return tiles;
  };

  getUrlsForDataset = (datasetId) => {
    return this.urls[datasetId] ? [...new Set(this.urls[datasetId])] : [];
  };

  getSentinelHubDataset = () => DATASET_BYOC;

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

  generateEvalscript = (bands, dataSetId, config) => {
    // NOTE: changing the format will likely break parseEvalscriptBands method.
    if (config) {
      return constructV3Evalscript(bands, config);
    }

    const bandNames = Object.values(bands);
    const uniqueBands = [...new Set(bandNames)];
    const factor = 1 / 2000;
    return generateFallbackEvalscript(bandNames, uniqueBands, factor);
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

  getCopyrightText = () => '';

  isCopernicus = () => false;

  isSentinelHub = () => true;

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

  getKnownCollectionsList() {
    return Object.values(this.KNOWN_COLLECTIONS).flat();
  }

  supportsDisplayLatestDateOnSelect = () => true;

  supportsLowResolutionAlternativeCollection = (collectionId) => {
    return !!LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS[collectionId];
  };

  getLowResolutionCollectionId = (collectionId) => {
    return LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS[collectionId]?.lowResolutionCollectionId;
  };

  getLowResolutionMetersPerPixelThreshold = (collectionId) => {
    return LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS[collectionId]?.lowResolutionMetersPerPixelThreshold;
  };

  supportsFindProductsForCurrentView = (datasetId) =>
    datasetId === COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC;

  isOnlyForBaseLayer = (datasetId) => this.collections[datasetId].onlyForBaseLayer;
}
