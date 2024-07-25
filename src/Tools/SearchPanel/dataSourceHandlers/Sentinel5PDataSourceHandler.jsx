import React from 'react';
import { DATASET_S5PL2, S5PL2Layer } from '@sentinel-hub/sentinelhub-js';

import { t } from 'ttag';
import DataSourceHandler from './DataSourceHandler';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import {
  Sentinel5Tooltip,
  getS5Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/Sentinel5Tooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import {
  S5_O3,
  S5_NO2,
  S5_SO2,
  S5_CO,
  S5_HCHO,
  S5_CH4,
  S5_AER_AI,
  S5_CLOUD,
  S5_OTHER,
} from './dataSourceConstants';
import { filterLayers } from './filter';
import { DATASOURCES } from '../../../const';
import { getS5ProductType } from './datasourceAssets/getS5ProductType';

export default class Sentinel5PDataSourceHandler extends DataSourceHandler {
  S5PDATASETS = [S5_O3, S5_NO2, S5_SO2, S5_CO, S5_HCHO, S5_CH4, S5_AER_AI, S5_CLOUD];

  getDatasetSearchLabels = () => ({
    [S5_O3]: t`O3 (Ozone)`,
    [S5_NO2]: t`NO2 (Nitrogen dioxide)`,
    [S5_SO2]: t`SO2 (Sulfur dioxide)`,
    [S5_CO]: t`CO (Carbon monoxide)`,
    [S5_HCHO]: t`HCHO (Formaldehyde)`,
    [S5_CH4]: t`CH4 (Methane)`,
    [S5_AER_AI]: t`AER AI (Aerosol Index)`,
    [S5_CLOUD]: t`Cloud`,
    [S5_OTHER]: t`Other`,
  });
  datasetSearchIds = {
    [S5_O3]: 'O3',
    [S5_NO2]: 'NO2',
    [S5_SO2]: 'SO2',
    [S5_CO]: 'CO',
    [S5_HCHO]: 'HCHO',
    [S5_CH4]: 'CH4',
    [S5_AER_AI]: 'AER_AI',
    [S5_CLOUD]: 'CLOUD',
    [S5_OTHER]: 'Other',
  };

  urls = [];
  datasets = [];
  otherLayers = [];
  preselectedDatasets = new Set();
  searchFilters = {};
  isChecked = false;
  datasource = DATASOURCES.S5;
  searchGroupLabel = 'Sentinel-5P';
  defaultPreselectedDataset = S5_AER_AI;

  shLayer = S5PL2Layer;
  shDataset = DATASET_S5PL2;
  OTHER_DATASETID = S5_OTHER;
  NO2_DATASETID = S5_NO2;
  CLOUD_DATASETID = S5_CLOUD;
  AER_AI_DATASETID = S5_AER_AI;

  leafletZoomConfig = {
    [S5_O3]: {
      min: 3,
      max: 19,
    },
    [S5_NO2]: {
      min: 3,
      max: 19,
    },
    [S5_SO2]: {
      min: 3,
      max: 19,
    },
    [S5_CO]: {
      min: 3,
      max: 19,
    },
    [S5_HCHO]: {
      min: 3,
      max: 19,
    },
    [S5_CH4]: {
      min: 3,
      max: 19,
    },
    [S5_AER_AI]: {
      min: 3,
      max: 19,
    },
    [S5_CLOUD]: {
      min: 3,
      max: 19,
    },
    [S5_OTHER]: {
      min: 3,
      max: 19,
    },
  };

  willHandle(service, url, name, layers, preselected) {
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

  isVisualizationLayerForDataset(dataset, layerTitle) {
    return layerTitle.startsWith(this.datasetSearchIds[dataset]) && layerTitle.endsWith('_VISUALIZED');
  }

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

  isHandlingAnyUrl() {
    return this.urls.length > 0;
  }

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }
    const preselected = this.preselectedDatasets.size > 0;
    return (
      <GenericSearchGroup
        key={`sentinel-5p`}
        label={this.getSearchGroupLabel()}
        preselected={preselected}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={<Sentinel5Tooltip />}
        saveFiltersValues={this.saveSearchFilters}
        options={this.datasets}
        optionsLabels={this.getDatasetSearchLabels()}
        preselectedOptions={Array.from(this.preselectedDatasets)}
        hasMaxCCFilter={false}
        renderOptionsHelpTooltips={this.renderOptionsHelpTooltips}
      />
    );
  }

  getDescription = () => getS5Markdown();

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

  getSentinelHubDataset = () => this.shDataset;

  getS5ProductType = (datasetId) => {
    return getS5ProductType(datasetId);
  };

  getResolutionLimits() {
    return { resolution: 3500 };
  }

  supportsCustomLayer(datasetId) {
    switch (datasetId) {
      case this.OTHER_DATASETID:
        return false;
      default:
        return true;
    }
  }

  supportsMinQa() {
    return true;
  }

  getDefaultMinQa(datasetId) {
    // values set as per documentation
    // https://docs.sentinel-hub.com/api/latest/#/data/Sentinel-5P-L2?id=processing-options
    switch (datasetId) {
      case this.NO2_DATASETID:
        return 75;
      default:
        return 50;
    }
  }

  supportsInterpolation() {
    return true;
  }

  getBaseLayerForDatasetId = (datasetId) => {
    const productType = this.getS5ProductType(datasetId);
    if (productType) {
      return new this.shLayer({
        evalscript: true,
        productType: productType,
      });
    }
  };
}
