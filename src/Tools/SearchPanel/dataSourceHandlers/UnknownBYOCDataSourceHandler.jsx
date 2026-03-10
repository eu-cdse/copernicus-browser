import { BYOCLayer, DATASET_BYOC, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import DataSourceHandler from './DataSourceHandler';
import { filterLayers } from './filter';
import { constructV3Evalscript, isFunction } from '../../../utils';
import { generateFallbackEvalscript } from './datasourceAssets/evalscriptTemplates';
import { DATASOURCES } from '../../../const';
import { reprojectGeometry } from '../../../utils/reproject';
import { getSHServiceRootUrl } from './dataSourceHandlers';
import MosaicDataSourceHandler from './MosaicDataSourceHandler';
import S1MosaicDataSourceHandler from './S1MosaicDataSourceHandler';
import { RRD_COLLECTIONS } from './RRDDataSources/dataSourceRRDConstants';
import CLMSDataSourceHandler from './CLMSDataSourceHandler';
import CCMDataSourceHandler from './CCMDataSourceHandler';
import EvolandDataSourceHandler from './EvolandDataSourceHandler';
import ComplementaryDataDataSourceHandler from './ComplementaryDataDataSourceHandler';

/**
 * Fallback handler for BYOC (Bring Your Own Collection) layers that are not handled by specialized handlers.
 * This handler only processes collections that are not claimed by:
 * - OthersDataSourceHandler (ESA WorldCover, etc.)
 * - MosaicDataSourceHandler (Sentinel-2 Mosaics)
 * - S1MosaicDataSourceHandler (Sentinel-1 Mosaics)
 * - CLMSDataSourceHandler (CLMS Collections)
 * - CCMDataSourceHandler (CCM Collections)
 * - RRD handlers (RRD Collections)
 */
export default class UnknownBYOCDataSourceHandler extends DataSourceHandler {
  datasetSearchLabels = {};
  datasetSearchIds = {};
  collections = {};

  urls = {};
  datasets = [];
  preselectedDatasets = new Set();
  allLayers = [];
  datasource = DATASOURCES.CUSTOM;

  leafletZoomConfig = {
    CUSTOM: { min: 0, max: 25 },
  };

  // Blacklist of collection IDs that are handled by specific BYOC handlers
  // This prevents UnknownBYOCDataSourceHandler from claiming collections that belong to specialized handlers
  BLACKLISTED_COLLECTIONS = [
    ...new MosaicDataSourceHandler().getKnownCollectionsList(), // Sentinel-2 Mosaics
    ...new S1MosaicDataSourceHandler().getKnownCollectionsList(), // Sentinel-1 Mosaics
    ...RRD_COLLECTIONS, // RRD Collections
    ...new CLMSDataSourceHandler().getKnownCollectionsList(), // CLMS Collections
    ...new CCMDataSourceHandler().getKnownCollectionsList(), // CCM Collections
    ...new EvolandDataSourceHandler().getKnownCollectionsList(), // Evoland Collections
    ...new ComplementaryDataDataSourceHandler().getKnownCollectionsList(), // Complementary Data Collections
  ];

  willHandle(service, url, name, layers, _preselected, _onlyForBaseLayer) {
    name = isFunction(name) ? name() : name;
    const customLayers = layers.filter(
      (l) =>
        l instanceof BYOCLayer && l.collectionId && !this.BLACKLISTED_COLLECTIONS.includes(l.collectionId),
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
      this.urls[id] = [...new Set([...(this.urls[id] ? this.urls[id] : []), url])];
    });

    this.allLayers = layers;
    this.saveFISLayers(url, layers);
    return true;
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  convertToStandardTiles = (data, datasetId) => {
    const tiles = data.map((t) => {
      if (t.geometry && t.geometry.crs && t.geometry.crs.properties.name !== CRS_EPSG4326.urn) {
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
    return this.urls[datasetId] || [];
  };

  getSentinelHubDataset = () => DATASET_BYOC;

  getResolutionLimits() {
    return { resolution: 0.5 };
  }

  getMinMaxDates() {
    return { minDate: null, maxDate: null };
  }

  getLayers = (data, datasetId, url, _layersExclude, _layersInclude) => {
    let layers = data.filter((layer) => layer.collectionId === datasetId && filterLayers(layer.layerId));
    layers.forEach((l) => {
      l.url = url;
    });
    return layers;
  };

  supportsCustomLayer(datasetId) {
    const availableBands = this.collections[datasetId].availableBands;
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

  getBands = (datasetId) => {
    return this.collections[datasetId].availableBands;
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

  getLeafletZoomConfig() {
    return this.leafletZoomConfig.CUSTOM;
  }

  supportsInterpolation() {
    return true;
  }

  getCopyrightText = () => '';

  isCopernicus = () => false;

  isSentinelHub = () => true;

  getSearchGroupLabel = () => this.collections[this.datasets[0]].themeName;

  getBaseLayerForDatasetId = (datasetId) => {
    const layer = this.allLayers.find((l) => l.collectionId === datasetId);
    if (layer) {
      return new BYOCLayer({
        evalscript: true,
        collectionId: datasetId,
        subType: layer.subType,
        locationId: layer.locationId,
        shServiceRootUrl: getSHServiceRootUrl(),
      });
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
}
