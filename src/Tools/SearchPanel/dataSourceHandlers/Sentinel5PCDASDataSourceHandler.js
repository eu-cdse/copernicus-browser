import { DATASET_CDAS_S5PL2, S5PL2CDASLayer } from '@sentinel-hub/sentinelhub-js';

import { t } from 'ttag';

import {
  S5_O3_CDAS,
  S5_NO2_CDAS,
  S5_SO2_CDAS,
  S5_CO_CDAS,
  S5_HCHO_CDAS,
  S5_CH4_CDAS,
  S5_AER_AI_CDAS,
  S5_CLOUD_CDAS,
  S5_OTHER_CDAS,
} from './dataSourceConstants';
import { DATASOURCES } from '../../../const';
import DataSourceHandler from './DataSourceHandler';
import {
  getS5AERAIMarkdown,
  getS5CH4Markdown,
  getS5COMarkdown,
  getS5CloudMarkdown,
  getS5HCHOMarkdown,
  getS5Markdown,
  getS5NO2Markdown,
  getS5O3Markdown,
  getS5SO2Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/Sentinel5Tooltip';
import { getS5ProductType } from './datasourceAssets/getS5ProductType';
import { filterLayers } from './filter';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';

export default class Sentinel5PCDASDataSourceHandler extends DataSourceHandler {
  S5PDATASETS = [
    S5_O3_CDAS,
    S5_NO2_CDAS,
    S5_SO2_CDAS,
    S5_CO_CDAS,
    S5_HCHO_CDAS,
    S5_CH4_CDAS,
    S5_AER_AI_CDAS,
    S5_CLOUD_CDAS,
  ];

  getDatasetSearchLabels = () => ({
    [S5_O3_CDAS]: t`O3 (Ozone)`,
    [S5_NO2_CDAS]: t`NO2 (Nitrogen dioxide)`,
    [S5_SO2_CDAS]: t`SO2 (Sulfur dioxide)`,
    [S5_CO_CDAS]: t`CO (Carbon monoxide)`,
    [S5_HCHO_CDAS]: t`HCHO (Formaldehyde)`,
    [S5_CH4_CDAS]: t`CH4 (Methane)`,
    [S5_AER_AI_CDAS]: t`AER AI (Aerosol Index)`,
    [S5_CLOUD_CDAS]: t`Cloud`,
    [S5_OTHER_CDAS]: t`Other`,
  });

  datasetSearchIds = {
    [S5_O3_CDAS]: 'O3',
    [S5_NO2_CDAS]: 'NO2',
    [S5_SO2_CDAS]: 'SO2',
    [S5_CO_CDAS]: 'CO',
    [S5_HCHO_CDAS]: 'HCHO',
    [S5_CH4_CDAS]: 'CH4',
    [S5_AER_AI_CDAS]: 'AER_AI',
    [S5_CLOUD_CDAS]: 'CLOUD',
    [S5_OTHER_CDAS]: 'Other',
  };

  urls = [];
  datasets = [];
  preselectedDatasets = new Set();
  datasource = DATASOURCES.S5_CDAS;
  defaultPreselectedDataset = S5_AER_AI_CDAS;
  searchGroupLabel = 'Sentinel-5P';

  shLayer = S5PL2CDASLayer;
  shDataset = DATASET_CDAS_S5PL2;
  OTHER_DATASETID = S5_OTHER_CDAS;
  NO2_DATASETID = S5_NO2_CDAS;
  CLOUD_DATASETID = S5_CLOUD_CDAS;
  AER_AI_DATASETID = S5_AER_AI_CDAS;

  getSentinelHubDataset = () => this.shDataset;

  getLeafletZoomConfig() {
    return {
      min: 3,
      max: 19,
    };
  }

  willHandle(service, url, name, layers, preselected, _onlyForBaseLayer) {
    const s5pLayers = layers.filter((l) => l.dataset && l.dataset.id === this.shDataset.id);
    if (s5pLayers.length === 0) {
      return false;
    }

    s5pLayers.forEach((l) => {
      let dataset = this.S5PDATASETS.find((d) => this.isVisualizationLayerForDataset(d, l.layerId));
      if (!dataset) {
        // if the layer is a channel, do not warn about it:
        const channel = this.S5PDATASETS.find((d) => this.isChannelLayerForDataset(d, l.title));
        if (!channel) {
          if (l.title.startsWith('__')) {
            // It's a shadow layer
            console.warn(`Ignoring ${l.title} - not among supported S-5P datasets.`);
            return;
          }
          dataset = this.OTHER_DATASETID;
          this.otherLayers.push(l);
        } else {
          return;
        }
      }
      this.datasets.push(dataset);
      if (preselected) {
        this.preselectedDatasets.add(dataset);
      }
    });

    if (!this.urls.includes(url)) {
      this.urls.push(url);
    }
    this.datasets = Array.from(new Set(this.datasets)).sort(); // make datasets unique
    this.saveFISLayers(url, layers);
    return true;
  }

  isHandlingAnyUrl() {
    return this.urls.length > 0;
  }

  isVisualizationLayerForDataset(dataset, layerTitle) {
    return layerTitle.startsWith(this.datasetSearchIds[dataset]) && layerTitle.endsWith('_VISUALIZED');
  }

  getUrlsForDataset = () => {
    return this.urls;
  };

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    let layers = data.filter(
      (layer) =>
        filterLayers(layer.layerId, layersExclude, layersInclude) &&
        this.filterLayersS5(layer.layerId, datasetId),
    );
    layers.forEach((l) => {
      l.url = url;
    });
    return layers;
  };

  filterLayersS5 = (layerId, datasetId) => {
    if (datasetId === this.OTHER_DATASETID) {
      if (!this.S5PDATASETS.filter((d) => layerId.startsWith(this.datasetSearchIds[d])).length) {
        return true;
      }
      return false;
    }
    return layerId.startsWith(this.datasetSearchIds[datasetId]);
  };

  getS5ProductType = (datasetId) => {
    return getS5ProductType(datasetId);
  };

  getBaseLayerForDatasetId = (datasetId) => {
    const productType = this.getS5ProductType(datasetId);
    if (productType) {
      return new this.shLayer({
        evalscript: true,
        productType: productType,
      });
    }
  };

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];
    let datasets;

    const isOtherSelected = this.searchFilters.selectedOptions.includes(this.OTHER_DATASETID);
    if (isOtherSelected) {
      datasets = this.S5PDATASETS;
    } else {
      datasets = this.searchFilters.selectedOptions;
    }

    datasets.forEach((datasetId) => {
      // instanceId and layerId are required parameters, although we don't need them for findTiles
      const searchLayer = new this.shLayer({
        instanceId: true,
        layerId: true,
        productType: this.datasetSearchIds[datasetId],
      });
      const ff = new FetchingFunction(
        isOtherSelected ? this.OTHER_DATASETID : datasetId,
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
      metadata: {
        creoDIASPath: this.getUrl(t.links, 'creodias'),
        isS5: true,
      },
    }));
    return tiles;
  };

  isChannelLayerForDataset(dataset, layerTitle) {
    switch (dataset) {
      case this.CLOUD_DATASETID:
        return [
          'CLOUD_BASE_HEIGHT',
          'CLOUD_BASE_PRESSURE',
          'CLOUD_FRACTION',
          'CLOUD_OPTICAL_THICKNESS',
          'CLOUD_TOP_HEIGHT',
          'CLOUD_TOP_PRESSURE',
        ].includes(layerTitle);
      case this.AER_AI_DATASETID:
        return ['AER_AI_340_380', 'AER_AI_354_388'].includes(layerTitle);
      default:
        return layerTitle === this.datasetSearchIds[dataset];
    }
  }

  getBands = (datasetId) => {
    switch (datasetId) {
      case this.CLOUD_DATASETID:
        return [
          { name: 'CLOUD_BASE_HEIGHT' },
          { name: 'CLOUD_BASE_PRESSURE' },
          { name: 'CLOUD_FRACTION' },
          { name: 'CLOUD_OPTICAL_THICKNESS' },
          { name: 'CLOUD_TOP_HEIGHT' },
          { name: 'CLOUD_TOP_PRESSURE' },
        ];
      case this.AER_AI_DATASETID:
        return [{ name: 'AER_AI_340_380' }, { name: 'AER_AI_354_388' }];
      default:
        return [{ name: this.datasetSearchIds[datasetId] }];
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case S5_O3_CDAS:
        return getS5O3Markdown();
      case S5_NO2_CDAS:
        return getS5NO2Markdown();
      case S5_SO2_CDAS:
        return getS5SO2Markdown();
      case S5_CO_CDAS:
        return getS5COMarkdown();
      case S5_HCHO_CDAS:
        return getS5HCHOMarkdown();
      case S5_CH4_CDAS:
        return getS5CH4Markdown();
      case S5_AER_AI_CDAS:
        return getS5AERAIMarkdown();
      case S5_CLOUD_CDAS:
        return getS5CloudMarkdown();
      default:
        return null;
    }
  };

  getDescription = () => getS5Markdown();

  getDefaultMinQa = (datasetId) => {
    // values set as per documentation
    // https://docs.sentinel-hub.com/api/latest/#/data/Sentinel-5P-L2?id=processing-options
    switch (datasetId) {
      case this.NO2_DATASETID:
        return 75;
      default:
        return 50;
    }
  };

  getResolutionLimits = () => ({
    resolution: 3500,
  });

  supportsFindProductsForCurrentView = () => true;

  supportsInterpolation = () => true;

  supportsMinQa = () => true;

  supportsCustomLayer = (datasetId) => {
    switch (datasetId) {
      case this.OTHER_DATASETID:
        return false;
      default:
        return true;
    }
  };
}
