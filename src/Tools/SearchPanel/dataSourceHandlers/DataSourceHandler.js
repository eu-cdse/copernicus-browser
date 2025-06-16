import moment from 'moment';

import { constructV3Evalscript } from '../../../utils';
import { datasetLabels } from './dataSourceHandlers';
import { filterLayers } from './filter';
import { IMAGE_FORMATS } from '../../../Controls/ImgDownload/consts';
import { DEFAULT_TILES_SIZE_CONFIG, DEFAULT_ZOOM_CONFIGURATION } from './helper';
import { DEFAULT_CLOUD_COVER_PERCENT } from '../../../const';
// DataSourceHandler subclasses take care of:
// - recognizing (WMS / WMTS) URLs as "theirs"
// - fetching additional information from their services as needed
// - displaying search form
// - returning search results corresponding to search input
// - ...

export const SENTINEL_COPYRIGHT_TEXT = `Credit: European Union, contains modified Copernicus Sentinel data ${moment
  .utc()
  .format('YYYY')}, processed with EO Browser`;

export default class DataSourceHandler {
  fetchingFunctions = [];
  FISLayers = {};
  datasets = [];
  defaultPreselectedDataset = null;
  limitMonthsSearch = 3;

  willHandle(service, url, name, configs, preselected, onlyForBaseLayer) {
    // Returns boolean, indicating if the protocol (typically WMS / WMTS) and URL are
    // supported by this class; that is, this class knows how to handle them.
    // Should remember protocol / url so it can handle the subsequent method invocations.
    // Should remember if the configuration is needed only for base layer, so it's hidden in search.
    // Note that `configs` is an object which can have 2 keys, `capabilities` and `instanceConfig`.
    return false;
  }
  isHandlingAnyUrl() {
    // Returns whether this handler accepted handling of anything.
    return false;
  }
  getSearchFormComponents() {
    return [];
  }

  getLeafletZoomConfig(datasetId) {
    // returns an object containing min and max zoom options for a specific dataset Id
    // if a config object for the provided datasetId is not found it retuns both options as undefined
    if (!datasetId) {
      throw new Error('datasetId not provided.');
    }

    if (this.leafletZoomConfig && this.leafletZoomConfig[datasetId]) {
      return this.leafletZoomConfig[datasetId];
    }

    return DEFAULT_ZOOM_CONFIGURATION;
  }

  getLeafletTileSizeConfig(datasetId) {
    // returns tileSize 256 or 512 for a specific dataset Id
    // if a config for provided dataset is not found it returns default size of 512
    if (!datasetId) {
      throw new Error('datasetId not provided.');
    }

    if (this.leafletTileSizeConfig && this.leafletTileSizeConfig[datasetId]) {
      return this.leafletTileSizeConfig[datasetId];
    }

    return DEFAULT_TILES_SIZE_CONFIG;
  }

  prepareNewSearch(fromMoment, toMoment, queryArea = null) {
    this.fetchingFunctions = this.getNewFetchingFunctions(fromMoment, toMoment, queryArea);
    return this.fetchingFunctions;
  }

  getUrlsForDataset(datasetId) {
    return [];
  }

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    let layers = data.filter((layer) => filterLayers(layer.layerId, layersExclude, layersInclude));
    layers.forEach((l) => {
      l.url = url;
    });
    return layers;
  };

  getBands = () => {
    return [];
  };

  supportsCustomLayer() {
    return true;
  }

  supportsTimeRange() {
    return true;
  }

  supportsTimelapse() {
    return true;
  }

  tilesHaveCloudCoverage() {
    return false;
  }

  updateLayersOnVisualization() {
    return true;
  }

  supportsMinQa() {
    return false;
  }

  getDefaultMinQa(datasetId) {
    return null;
  }

  supportsInterpolation() {
    return false;
  }

  supportsSpeckleFilter() {
    return false;
  }

  getSupportedSpeckleFilters() {
    return [];
  }

  canApplySpeckleFilter() {
    return false;
  }

  supportsOrthorectification = () => {
    return false;
  };

  supportsBackscatterCoeff = () => {
    return false;
  };

  supportsFindProductsForCurrentView = () => false;

  isTimeless() {
    return false;
  }

  saveFISLayers(url, layers) {
    this.FISLayers[url] = {};
    for (let datasetId of this.datasets) {
      const shJsDataset = this.getSentinelHubDataset(datasetId);
      const datasetFISLayers = layers
        .filter((l) => (l.layerId.startsWith('__FIS_') && l.dataset ? l.dataset === shJsDataset : true))
        .map((l) => l.layerId);
      this.FISLayers[url][datasetId] = datasetFISLayers;
    }
  }

  getFISLayer(url, datasetId, layerId, isCustom) {
    if (isCustom) {
      return true;
    }

    const FISLayerId = `__FIS_${layerId}`;
    if (
      this.FISLayers[url] &&
      this.FISLayers[url][datasetId] &&
      this.FISLayers[url][datasetId].includes(FISLayerId)
    ) {
      return FISLayerId;
    }
    return null;
  }

  getResolutionLimits() {
    return {};
  }

  getMinMaxDates(datasetId) {
    const datasetInfo = this.getSentinelHubDataset(datasetId);
    if (!datasetInfo) {
      return { minDate: null, maxDate: null };
    }
    const minDate = datasetInfo.minDate ? moment(datasetInfo.minDate) : null;
    const maxDate = datasetInfo.maxDate ? moment(datasetInfo.maxDate) : null;
    return { minDate, maxDate };
  }

  getTemporalResolution(datasetId) {
    return null;
  }

  generateEvalscript = (bands, dataSetId, config) => {
    return constructV3Evalscript(bands, config, this.getBands(dataSetId));
  };

  getUrl = (links, type) => {
    const link = links.find((l) => l.type === type);
    if (link) {
      return link.target;
    }
    return null;
  };

  getDatasetLabel = (datasetId) => datasetLabels[datasetId];

  supportsV3Evalscript() {
    return true;
  }

  getSupportedImageFormats() {
    return Object.values(IMAGE_FORMATS);
  }

  saveSearchFilters = (searchFilters) => {
    this.searchFilters = searchFilters;
  };

  saveCheckedState = (checkedState) => {
    this.isChecked = checkedState;
  };

  areBandsClasses = () => {
    return false;
  };

  supportsIndex = () => {
    return true;
  };

  getSibling = () => {
    return {};
  };

  getCopyrightText = () => SENTINEL_COPYRIGHT_TEXT;

  isCopernicus = () => true;

  isSentinelHub = () => true;

  getSearchGroupLabel = () => {
    return this.searchGroupLabel;
  };

  getDatasetSearchLabels = () => this.datasetSearchLabels;

  getDatasets = () => this.datasets;

  isDisplayedAsGroup = () => false;

  getDescription = () => '';

  getDescriptionForDataset = () => undefined;

  getPreselectedDataset() {
    let preselectedDataset = this.defaultPreselectedDataset;
    if (this.preselectedDatasets && this.preselectedDatasets.size > 0) {
      // check if defaultPreselectedDataset is among preselectedDatasets
      // and only return the first value if it's not.
      if (!this.preselectedDatasets.has(this.defaultPreselectedDataset)) {
        preselectedDataset = Array.from(this.preselectedDatasets)[0];
      }
    }

    // check if preselectedDataset is present among datasets in selected theme
    if (preselectedDataset && this.datasets.length) {
      if (!this.datasets.find((d) => d === preselectedDataset)) {
        preselectedDataset = this.datasets[0];
      }
    }

    // return preselected dataset if it's available
    if (!!preselectedDataset) {
      return preselectedDataset;
    }

    // if preselected dataset is not available and there are not datasets, return null
    if (!this.datasets.length) {
      return null;
    }

    // if preselected dataset is not available
    // find the first avaialable dataset that is not used for base layer
    const searchableDataset = this.datasets.find((ds) => !this.isOnlyForBaseLayer(ds));
    if (!searchableDataset) {
      return null;
    }

    return searchableDataset;
  }

  getBaseLayerForDatasetId = () => null;

  _getSearchLayer = (datasetId, maxCloudCoverPercent = DEFAULT_CLOUD_COVER_PERCENT) => {
    const searchLayer = this.getBaseLayerForDatasetId(datasetId, maxCloudCoverPercent);
    if (!searchLayer) {
      throw new Error(`No layer for datasetId ${datasetId}`);
    }
    return searchLayer;
  };

  findTiles = ({
    datasetId,
    bbox,
    fromTime,
    toTime,
    nDates,
    offset,
    reqConfig,
    maxCloudCoverPercent = DEFAULT_CLOUD_COVER_PERCENT,
  }) => {
    const searchLayer = this._getSearchLayer(datasetId, maxCloudCoverPercent);
    return searchLayer.findTiles(bbox, fromTime, toTime, nDates, offset, reqConfig);
  };

  findDates = ({ datasetId, bbox, fromTime, toTime, reqConfig }) => {
    const searchLayer = this._getSearchLayer(datasetId);
    return searchLayer.findDatesUTC(bbox, fromTime, toTime, reqConfig);
  };

  supportsImgExport = () => true;
  supportsAnalyticalImgExport = () => true;

  // returns dataset specific parameters which should be used by sentinelhub-js layer to make getMap request and can't be set/overriden in UI
  getAdditionalParamsForGetMap = (datasetId) => {};

  isSpectralExplorerSupported = () => false;

  getLimitMonthsSearch = () => this.limitMonthsSearch;

  supportsDisplayLatestDateOnSelect = (datasetId) => false;

  supportsLowResolutionAlternativeCollection = () => false;

  isOnlyForBaseLayer = (datasetId) => false;
}
