import { DATASET_CDAS_DEM, DEMCDASLayer, DEMInstanceType } from '@sentinel-hub/sentinelhub-js';

import DataSourceHandler from './DataSourceHandler';
import {
  getCopernicus90Markdown,
  getCopernicus30Markdown,
  getDEMMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/DEMTooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { DEM_COPERNICUS_30_CDAS, DEM_COPERNICUS_90_CDAS } from './dataSourceConstants';
import { filterLayers } from './filter';
import { DATASOURCES } from '../../../const';

export default class DEMCDASDataSourceHandler extends DataSourceHandler {
  KNOWN_BANDS = [{ name: 'DEM', description: '', color: undefined }];

  searchGroupLabel = 'Copernicus DEM';
  shLayer = DEMCDASLayer;
  shDataset = DATASET_CDAS_DEM;
  datasource = DATASOURCES.DEM_CDAS;
  defaultPreselectedDataset = DEM_COPERNICUS_30_CDAS;

  urls = { [DEM_COPERNICUS_30_CDAS]: [], [DEM_COPERNICUS_90_CDAS]: [] };
  datasets = [];

  datasetSearchLabels = {
    [DEM_COPERNICUS_30_CDAS]: 'Copernicus 30',
    [DEM_COPERNICUS_90_CDAS]: 'Copernicus 90',
  };

  datasetSearchIds = {
    [DEM_COPERNICUS_30_CDAS]: 'COPERNICUS_30',
    [DEM_COPERNICUS_90_CDAS]: 'COPERNICUS_90',
  };

  willHandle(service, url, name, layers, preselected, onlyForBaseLayer) {
    const demLayers = layers.filter((l) => l.dataset && l.dataset.id === this.shDataset.id);

    if (demLayers.length === 0) {
      return false;
    }

    demLayers.forEach((l) => {
      const dataset = l.demInstance
        ? this.getDatasetFromDEMInstance(l.demInstance)
        : this.defaultPreselectedDataset;
      this.datasets.push(dataset);
      if (preselected) {
        this.preselectedDatasets.add(dataset);
      }

      if (this.urls[dataset] && !this.urls[dataset].find((u) => u === url)) {
        this.urls[dataset].push(url);
      }
    });

    this.datasets = Array.from(new Set(this.datasets)); // make datasets unique
    return true;
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  getDescription = () => getDEMMarkdown();

  getUrlsForDataset = (datasetId) => {
    return this.urls[datasetId] || [];
  };

  getSentinelHubDataset = (datasetId) => {
    switch (datasetId) {
      case DEM_COPERNICUS_30_CDAS:
      case DEM_COPERNICUS_90_CDAS:
        return DATASET_CDAS_DEM;
      default:
        return null;
    }
  };

  getDatasetFromDEMInstance = (demInstance) => {
    switch (demInstance) {
      case DEMInstanceType.COPERNICUS_30:
        return DEM_COPERNICUS_30_CDAS;
      case DEMInstanceType.COPERNICUS_90:
        return DEM_COPERNICUS_90_CDAS;
      default:
        return DEM_COPERNICUS_30_CDAS;
    }
  };

  getDatasetParams = (datasetId) => {
    switch (datasetId) {
      case DEM_COPERNICUS_30_CDAS:
        return {
          demInstance: DEMInstanceType.COPERNICUS_30,
        };
      case DEM_COPERNICUS_90_CDAS:
        return {
          demInstance: DEMInstanceType.COPERNICUS_90,
        };

      default:
        return { demInstance: DEMInstanceType.COPERNICUS_30 };
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case DEM_COPERNICUS_30_CDAS:
        return getCopernicus30Markdown();
      case DEM_COPERNICUS_90_CDAS:
        return getCopernicus90Markdown();
      default:
        return null;
    }
  };

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];
    let datasets;

    datasets = this.searchFilters.selectedOptions;

    datasets.forEach((datasetId) => {
      // instanceId and layerId are required parameters, although we don't need them for findTiles
      const searchLayer = new this.shLayer({
        instanceId: true,
        layerId: true,
        demInstance: this.datasetSearchIds[datasetId],
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
    const tiles = data.map((t) => ({
      sensingTime: t.sensingTime,
      geometry: t.geometry,
      datasource: this.datasource,
      datasetId,
      metadata: {},
    }));
    return tiles;
  };

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    let layers = data.filter(
      (layer) =>
        filterLayers(layer.layerId, layersExclude, layersInclude) &&
        this.filterLayersByDEMInstance(layer, datasetId),
    );
    layers.forEach((l) => {
      l.url = url;
    });
    return layers;
  };

  filterLayersByDEMInstance = (layer, datasetId) =>
    this.getDatasetFromDEMInstance(layer.demInstance) === datasetId;

  getBaseLayerForDatasetId = (datasetId) => {
    const { demInstance } = this.getDatasetParams(datasetId);
    if (demInstance) {
      return new this.shLayer({
        evalscript: true,
        demInstance: demInstance,
      });
    }
  };

  getLeafletZoomConfig() {
    return {
      min: 7,
    };
  }

  getBands = () => {
    return this.KNOWN_BANDS;
  };

  getSibling = (datasetId) => {
    switch (datasetId) {
      case DEM_COPERNICUS_90_CDAS:
        return { siblingId: DEM_COPERNICUS_30_CDAS };
      case DEM_COPERNICUS_30_CDAS:
        return { siblingId: DEM_COPERNICUS_90_CDAS };
      default:
        return {};
    }
  };

  supportsFindProductsForCurrentView = () => true;

  supportsCustomLayer = () => true;

  isTimeless = () => true;

  supportsInterpolation = () => true;

  supportsIndex = () => false;
}
