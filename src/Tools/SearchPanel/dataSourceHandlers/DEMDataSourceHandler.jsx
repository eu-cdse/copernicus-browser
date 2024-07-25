import React from 'react';
import { DATASET_AWS_DEM, DEMLayer, DEMInstanceType } from '@sentinel-hub/sentinelhub-js';

import DataSourceHandler from './DataSourceHandler';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import {
  DEMTooltip,
  MapzenTooltip,
  Copernicus30Tooltip,
  Copernicus90Tooltip,
  getDEMMarkdown,
  getMapzenMarkdown,
  getCopernicus90Markdown,
  getCopernicus30Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/DEMTooltip';
import HelpTooltip from './DatasourceRenderingComponents/HelpTooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { DEM_MAPZEN, DEM_COPERNICUS_30, DEM_COPERNICUS_90 } from './dataSourceConstants';
import { filterLayers } from './filter';
import { DATASOURCES } from '../../../const';

export default class DEMDataSourceHandler extends DataSourceHandler {
  DATASETS = [DEM_MAPZEN, DEM_COPERNICUS_30, DEM_COPERNICUS_90];
  KNOWN_BANDS = [{ name: 'DEM', description: '', color: undefined }];

  datasetSearchLabels = {
    [DEM_MAPZEN]: 'Mapzen',
    [DEM_COPERNICUS_30]: 'Copernicus 30',
    [DEM_COPERNICUS_90]: 'Copernicus 90',
  };

  datasetSearchIds = {
    [DEM_MAPZEN]: 'MAPZEN',
    [DEM_COPERNICUS_30]: 'COPERNICUS_30',
    [DEM_COPERNICUS_90]: 'COPERNICUS_90',
  };

  leafletZoomConfig = {
    [DEM_MAPZEN]: {
      min: 2,
    },
    [DEM_COPERNICUS_30]: {
      min: 7,
    },
    [DEM_COPERNICUS_90]: {
      min: 7,
    },
  };

  urls = { [DEM_MAPZEN]: [], [DEM_COPERNICUS_30]: [], [DEM_COPERNICUS_90]: [] };
  datasets = [];
  otherLayers = [];
  preselectedDatasets = new Set();
  searchFilters = {};
  isChecked = false;
  datasource = DATASOURCES.DEM;
  searchGroupLabel = 'DEM';
  defaultPreselectedDataset = DEM_MAPZEN;

  shLayer = DEMLayer;
  shDataset = DATASET_AWS_DEM;

  willHandle(service, url, name, layers, preselected) {
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

  renderOptionsHelpTooltips = (option) => {
    const createTooltip = (content) => (
      <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
        {content}
      </HelpTooltip>
    );

    let content = null;
    if (option === DEM_MAPZEN) {
      content = <MapzenTooltip />;
    } else if (option === DEM_COPERNICUS_30) {
      content = <Copernicus30Tooltip />;
    } else if (option === DEM_COPERNICUS_90) {
      content = <Copernicus90Tooltip />;
    }

    return content ? createTooltip(content) : null;
  };

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }
    const preselected = false;
    return (
      <GenericSearchGroup
        key={`dem`}
        label={this.getSearchGroupLabel()}
        preselected={preselected}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={<DEMTooltip />}
        saveFiltersValues={this.saveSearchFilters}
        options={this.datasets}
        optionsLabels={this.datasetSearchLabels}
        preselectedOptions={Array.from(this.preselectedDatasets)}
        renderOptionsHelpTooltips={this.renderOptionsHelpTooltips}
      />
    );
  }

  getDescription = () => getDEMMarkdown();

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

  getUrlsForDataset = (datasetId) => {
    return this.urls[datasetId] || [];
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

  getSentinelHubDataset = (datasetId) => {
    switch (datasetId) {
      case DEM_MAPZEN:
      case DEM_COPERNICUS_30:
      case DEM_COPERNICUS_90:
        return DATASET_AWS_DEM;
      default:
        return null;
    }
  };

  getDatasetFromDEMInstance = (demInstance) => {
    switch (demInstance) {
      case DEMInstanceType.COPERNICUS_30:
        return DEM_COPERNICUS_30;
      case DEMInstanceType.COPERNICUS_90:
        return DEM_COPERNICUS_90;
      default:
        return DEM_MAPZEN;
    }
  };

  supportsCustomLayer() {
    return true;
  }

  getBands = () => {
    return this.KNOWN_BANDS;
  };

  isTimeless() {
    return true;
  }

  supportsInterpolation = () => true;

  static getDatasetParams = (datasetId) => {
    switch (datasetId) {
      case DEM_MAPZEN:
        return {
          demInstance: DEMInstanceType.MAPZEN,
        };
      case DEM_COPERNICUS_30:
        return {
          demInstance: DEMInstanceType.COPERNICUS_30,
        };
      case DEM_COPERNICUS_90:
        return {
          demInstance: DEMInstanceType.COPERNICUS_90,
        };

      default:
        return { demInstance: DEMInstanceType.MAPZEN };
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case DEM_MAPZEN:
        return getMapzenMarkdown();
      case DEM_COPERNICUS_30:
        return getCopernicus30Markdown();
      case DEM_COPERNICUS_90:
        return getCopernicus90Markdown();
      default:
        return null;
    }
  };

  getDatasetParams = (datasetId) => {
    return DEMDataSourceHandler.getDatasetParams(datasetId);
  };

  supportsIndex = () => {
    return false;
  };

  getBaseLayerForDatasetId = (datasetId) => {
    const { demInstance } = this.getDatasetParams(datasetId);
    if (demInstance) {
      return new this.shLayer({
        evalscript: true,
        demInstance: demInstance,
      });
    }
  };

  getSibling = (datasetId) => {
    switch (datasetId) {
      case DEM_COPERNICUS_90:
        return { siblingId: DEM_COPERNICUS_30 };
      case DEM_COPERNICUS_30:
        return { siblingId: DEM_COPERNICUS_90 };
      default:
        return {};
    }
  };
}
