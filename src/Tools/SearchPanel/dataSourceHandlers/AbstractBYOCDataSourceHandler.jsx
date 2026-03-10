import { BYOCLayer, DATASET_BYOC, BYOCSubTypes, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';

import DataSourceHandler from './DataSourceHandler';
import { filterLayers } from './filter';
import { constructV3Evalscript } from '../../../utils';
import { reprojectGeometry } from '../../../utils/reproject';
import { getSHServiceRootUrl } from './dataSourceHandlers';

/**
 * Abstract base class for BYOC-based data source handlers.
 * Provides common functionality for handlers that work with BYOC collections
 * like CLMSDataSourceHandler and CCMDataSourceHandler.
 */
export default class AbstractBYOCDataSourceHandler extends DataSourceHandler {
  // These should be overridden by subclasses
  KNOWN_COLLECTIONS = {};
  KNOWN_COLLECTIONS_LOCATIONS = {};
  MIN_MAX_DATES = {};

  urls = {};
  datasets = [];
  allLayers = [];
  searchFilters = {};
  isChecked = false;

  leafletZoomConfig = {};

  /**
   * Handle layers that match known collections for this data source
   */
  willHandle(service, url, name, layers, _preselected) {
    let handlesAny = false;

    for (let datasetId of Object.keys(this.KNOWN_COLLECTIONS)) {
      const layersWithDataset = layers.filter((l) =>
        this.KNOWN_COLLECTIONS[datasetId].includes(l.collectionId),
      );

      if (layersWithDataset.length > 0) {
        if (this.urls[datasetId] === null) {
          this.urls[datasetId] = [];
        }
        if (!this.urls[datasetId].includes(url)) {
          this.urls[datasetId].push(url);
        }
        if (!this.datasets.includes(datasetId)) {
          this.datasets.push(datasetId);
        }
        handlesAny = true;
        this.allLayers.push(...layersWithDataset);
      }
    }
    this.saveFISLayers(url, layers);
    return handlesAny;
  }

  /**
   * Check if handler is managing any URLs
   */
  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  /**
   * Get list of all known collection IDs
   */
  getKnownCollectionsList() {
    return Object.values(this.KNOWN_COLLECTIONS).flat();
  }

  /**
   * Convert tiles to standard format
   */
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

  /**
   * Get URLs for a specific dataset
   */
  getUrlsForDataset = (datasetId) => {
    const urls = this.urls[datasetId];
    if (!urls) {
      return [];
    }
    return [...new Set(urls)];
  };

  /**
   * Get the Sentinel Hub dataset type (always BYOC for these handlers)
   */
  getSentinelHubDataset = () => DATASET_BYOC;

  /**
   * Get min/max dates for a dataset
   */
  getMinMaxDates(datasetId) {
    if (this.MIN_MAX_DATES[datasetId] == null) {
      return { minDate: null, maxDate: null };
    }
    return this.MIN_MAX_DATES[datasetId];
  }

  /**
   * Get layers for a dataset
   */
  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    return data
      .filter(
        (layer) =>
          filterLayers(layer.layerId, layersExclude, layersInclude) &&
          this.KNOWN_COLLECTIONS[datasetId].includes(layer.collectionId),
      )
      .map((l) => ({ ...l, url: url }));
  };

  /**
   * Check if dataset supports custom layers
   */
  supportsCustomLayer(datasetId) {
    const bands = this.getBands(datasetId);
    return bands && !!bands.length;
  }

  /**
   * Get base layer for a dataset
   */
  getBaseLayerForDatasetId = (datasetId) => {
    const collectionIds = this.KNOWN_COLLECTIONS[datasetId];
    if (collectionIds) {
      return new BYOCLayer({
        evalscript: true,
        collectionId: collectionIds[0],
        locationId: this.KNOWN_COLLECTIONS_LOCATIONS[datasetId],
        subType: BYOCSubTypes.BYOC,
        shServiceRootUrl: getSHServiceRootUrl(),
      });
    }
  };

  /**
   * Get dataset parameters for layer creation
   */
  getDatasetParams = (datasetId) => {
    const collectionIds = this.KNOWN_COLLECTIONS[datasetId];
    if (collectionIds) {
      return {
        collectionId: collectionIds[0],
        locationId: this.KNOWN_COLLECTIONS_LOCATIONS[datasetId],
        subType: BYOCSubTypes.BYOC,
        shServiceRootUrl: getSHServiceRootUrl(),
      };
    }
    return {};
  };

  /**
   * Generate evalscript for bands
   */
  generateEvalscript = (bands, datasetId, config) => {
    if (config) {
      return constructV3Evalscript(bands, config);
    }

    return this.defaultEvalscript(bands, this.getDefaultScalingFactor(datasetId));
  };

  /**
   * Default evalscript template
   */
  defaultEvalscript = (bands, factor = 1 / 2000) => {
    return `//VERSION=3
function setup() {
  return {
    input: ["${[...new Set(Object.values(bands))].join('","')}", "dataMask"],
    output: { bands: 4 }
  };
}
let factor = ${factor};
function evaluatePixel(sample) {
  // This comment is required for evalscript parsing to work
  return [${Object.values(bands)
    .map((e) => 'factor * sample.' + e)
    .join(',')}, sample.dataMask ];
}`;
  };

  /**
   * Get default scaling factor for evalscript
   * Can be overridden by subclasses
   */
  getDefaultScalingFactor(_datasetId) {
    return 1 / 2000;
  }

  /**
   * Get leaflet zoom configuration for a dataset
   */
  getLeafletZoomConfig(datasetId) {
    return this.leafletZoomConfig[datasetId] || { min: 0, max: 25 };
  }

  /**
   * Check if dataset supports interpolation
   */
  supportsInterpolation() {
    return true;
  }

  /**
   * Get copyright text
   */
  getCopyrightText = () => '';

  /**
   * Check if this is a Copernicus service
   */
  isCopernicus = () => false;

  /**
   * Check if this uses Sentinel Hub
   */
  isSentinelHub = () => true;

  /**
   * Check if dataset supports finding products for current view
   */
  supportsFindProductsForCurrentView = () => true;

  /**
   * Check if bands represent classes (categorical data)
   */
  areBandsClasses = (_datasetId) => {
    return false;
  };

  /**
   * Check if dataset supports index functionality
   */
  supportsIndex = () => {
    return true;
  };

  /**
   * Check if dataset supports low resolution alternative collection
   * Can be overridden by subclasses that have LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS
   */
  supportsLowResolutionAlternativeCollection = (collectionId) => {
    return !!this.LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS?.[collectionId];
  };

  /**
   * Get low resolution collection ID for a collection
   * Can be overridden by subclasses that have LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS
   */
  getLowResolutionCollectionId = (collectionId) => {
    return this.LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS?.[collectionId]?.lowResolutionCollectionId;
  };

  /**
   * Get low resolution meters per pixel threshold for a collection
   * Can be overridden by subclasses that have LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS
   */
  getLowResolutionMetersPerPixelThreshold = (collectionId) => {
    return this.LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS?.[collectionId]?.lowResolutionMetersPerPixelThreshold;
  };

  // Abstract methods that must be implemented by subclasses

  /**
   * Get dataset search labels
   * @returns {Object} Object mapping dataset IDs to display labels
   */
  getDatasetSearchLabels() {
    throw new Error('getDatasetSearchLabels must be implemented by subclass');
  }

  /**
   * Get bands for a dataset
   * @param {string} datasetId - Dataset identifier
   * @returns {Array} Array of band definitions
   */
  getBands(_datasetId) {
    throw new Error('getBands must be implemented by subclass');
  }

  /**
   * Get description for a dataset
   * @param {string} datasetId - Dataset identifier
   * @returns {string} Markdown description
   */
  getDescriptionForDataset(_datasetId) {
    throw new Error('getDescriptionForDataset must be implemented by subclass');
  }

  /**
   * Get general description for the data source
   * @returns {string} Markdown description
   */
  getDescription() {
    throw new Error('getDescription must be implemented by subclass');
  }

  /**
   * Get search group label
   * @returns {string} Label for the search group
   */
  getSearchGroupLabel() {
    return this.searchGroupLabel || 'Custom Data Source';
  }
}
