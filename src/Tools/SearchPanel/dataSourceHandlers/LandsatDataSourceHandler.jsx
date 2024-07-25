import React from 'react';
import {
  DATASET_AWS_L8L1C,
  DATASET_AWS_LOTL1,
  DATASET_AWS_LOTL2,
  DATASET_AWS_LTML1,
  DATASET_AWS_LTML2,
  DATASET_AWS_LMSSL1,
  DATASET_AWS_LETML1,
  DATASET_AWS_LETML2,
  Landsat8AWSLayer,
  Landsat8AWSLOTL1Layer,
  Landsat8AWSLOTL2Layer,
  Landsat45AWSLTML1Layer,
  Landsat45AWSLTML2Layer,
  Landsat15AWSLMSSL1Layer,
  Landsat7AWSLETML1Layer,
  Landsat7AWSLETML2Layer,
} from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import DataSourceHandler from './DataSourceHandler';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import LandsatTooltip, {
  renderLandsatOptionsHelpTooltips,
} from './DatasourceRenderingComponents/dataSourceTooltips/LandsatTooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { constructV3Evalscript } from '../../../utils';
import {
  AWS_L8L1C,
  AWS_LOTL1,
  AWS_LOTL2,
  AWS_LTML1,
  AWS_LTML2,
  AWS_LMSSL1,
  AWS_LETML1,
  AWS_LETML2,
} from './dataSourceConstants';
import { getLandsatBandForDataset, getGroupedBands } from './datasourceAssets/landsatBands';
import { IMAGE_FORMATS } from '../../../Controls/ImgDownload/consts';

export const LANDSAT_COPYRIGHT_TEXT = (number) =>
  `Landsat ${number} image courtesy of the U.S. Geological Survey`;

export default class LandsatDataSourceHandler extends DataSourceHandler {
  urls = {
    [AWS_L8L1C]: [],
    [AWS_LOTL1]: [],
    [AWS_LOTL2]: [],
    [AWS_LMSSL1]: [],
    [AWS_LETML1]: [],
    [AWS_LETML2]: [],
  };
  datasetSearchLabels = {
    [AWS_L8L1C]: t`Landsat 8 (USGS archive)`,
    [AWS_LOTL1]: t`Landsat 8-9 L1`,
    [AWS_LOTL2]: t`Landsat 8-9 L2`,
    [AWS_LMSSL1]: t`Landsat 1-5 MSS L1`,
    [AWS_LETML1]: t`Landsat 7 ETM+ L1`,
    [AWS_LETML2]: t`Landsat 7 ETM+ L2`,
  };
  allLayers = [];
  datasets = [];
  preselectedDatasets = new Set();
  searchFilters = {};
  isChecked = false;
  datasource = 'Landsat';
  searchGroupLabel = 'Landsat';
  searchGroupKey = 'landsat';

  leafletZoomConfig = {
    [AWS_L8L1C]: {
      min: 9,
      max: 18,
    },
    [AWS_LOTL1]: {
      min: 9,
      max: 18,
    },
    [AWS_LOTL2]: {
      min: 9,
      max: 18,
    },
    [AWS_LMSSL1]: {
      min: 8,
      max: 18,
    },
    [AWS_LETML1]: {
      min: 8,
      max: 18,
    },
    [AWS_LETML2]: {
      min: 8,
      max: 18,
    },
  };

  knownDatasets = [
    { shDataset: DATASET_AWS_L8L1C, datasetId: AWS_L8L1C, urlId: AWS_L8L1C },
    { shDataset: DATASET_AWS_LOTL1, datasetId: AWS_LOTL1, urlId: AWS_LOTL1 },
    { shDataset: DATASET_AWS_LOTL2, datasetId: AWS_LOTL2, urlId: AWS_LOTL2 },
    { shDataset: DATASET_AWS_LMSSL1, datasetId: AWS_LMSSL1, urlId: AWS_LMSSL1 },
    { shDataset: DATASET_AWS_LETML1, datasetId: AWS_LETML1, urlId: AWS_LETML1 },
    { shDataset: DATASET_AWS_LETML2, datasetId: AWS_LETML2, urlId: AWS_LETML2 },
  ];

  initializeDatasets(layers, url, preselected) {
    this.knownDatasets.forEach((ds) => {
      if (layers.find((l) => l.dataset === ds.shDataset)) {
        this.datasets.push(ds.datasetId);
        this.urls[ds.urlId].push(url);
        if (preselected) {
          this.preselectedDatasets.add(ds.datasetId);
        }
      }
    });
  }

  willHandle(service, url, name, layers, preselected, onlyForBaseLayer) {
    //check if any of layers is handled by landsat datasets
    const hasLandsatDatasets = this.knownDatasets.some((ds) =>
      layers.find((l) => l.dataset === ds.shDataset),
    );

    if (!hasLandsatDatasets) {
      return;
    }

    this.initializeDatasets(layers, url, preselected);

    if (this.datasets.length === 0) {
      return false;
    }

    this.datasets = Array.from(new Set(this.datasets)); // make datasets unique
    this.allLayers.push(
      ...layers.filter((l) =>
        [
          DATASET_AWS_L8L1C,
          DATASET_AWS_LOTL1,
          DATASET_AWS_LOTL2,
          DATASET_AWS_LTML1,
          DATASET_AWS_LTML2,
          DATASET_AWS_LMSSL1,
          DATASET_AWS_LETML1,
          DATASET_AWS_LETML2,
        ].includes(l.dataset),
      ),
    );
    this.saveFISLayers(url, layers);
    return true;
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  getDataSourceTooltip() {
    return <LandsatTooltip />;
  }

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }
    const preselected = false;
    return (
      <GenericSearchGroup
        key={this.searchGroupKey}
        label={this.searchGroupLabel}
        preselected={preselected}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={this.getDataSourceTooltip()}
        saveFiltersValues={this.saveSearchFilters}
        options={this.datasets}
        optionsLabels={this.datasetSearchLabels}
        preselectedOptions={Array.from(this.preselectedDatasets)}
        hasMaxCCFilter={true}
        renderOptionsHelpTooltips={renderLandsatOptionsHelpTooltips}
      />
    );
  }

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];

    const datasets = this.searchFilters.selectedOptions;
    const maxCC = this.searchFilters.maxCC;

    datasets.forEach((datasetId) => {
      let searchLayer = this.allLayers.find((l) => l.dataset === this.getSentinelHubDataset(datasetId));
      if (!searchLayer) {
        return;
      }
      searchLayer.maxCloudCoverPercent = maxCC;

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
    const tiles = data
      .filter((t) => (t.meta.projEpsg ? t.meta.projEpsg !== 3031 : true))
      .map((t) => ({
        sensingTime: t.sensingTime,
        geometry: t.geometry,
        datasource: this.datasource,
        datasetId,
        metadata: {
          previewUrl: this.getUrl(t.links, 'preview'),
          AWSPath: this.getUrl(t.links, 'aws'),
          EOCloudPath: this.getUrl(t.links, 'eocloud'),
          sunElevation: t.meta.sunElevation,
          cloudCoverage: t.meta.cloudCoverPercent,
        },
      }));
    return tiles;
  };

  getUrlsForDataset = (datasetId) => this.urls[datasetId] || [];

  getBands = (datasetId) => getLandsatBandForDataset(datasetId);

  getSentinelHubDataset = (datasetId) => {
    switch (datasetId) {
      case AWS_L8L1C:
        return DATASET_AWS_L8L1C;
      case AWS_LOTL1:
        return DATASET_AWS_LOTL1;
      case AWS_LOTL2:
        return DATASET_AWS_LOTL2;
      case AWS_LTML1:
        return DATASET_AWS_LTML1;
      case AWS_LTML2:
        return DATASET_AWS_LTML2;
      case AWS_LMSSL1:
        return DATASET_AWS_LMSSL1;
      case AWS_LETML1:
        return DATASET_AWS_LETML1;
      case AWS_LETML2:
        return DATASET_AWS_LETML2;
      default:
        return null;
    }
  };

  generateEvalscript = (bands, datasetId, config) => {
    return constructV3Evalscript(bands, config, this.getBands(datasetId));
  };

  tilesHaveCloudCoverage() {
    return true;
  }

  getResolutionLimits(datasetId) {
    switch (datasetId) {
      case AWS_L8L1C:
      case AWS_LOTL2:
      case AWS_LETML1:
      case AWS_LETML2:
        return { resolution: 30, fisResolutionCeiling: 1490 };
      case AWS_LOTL1:
        return { resolution: 15, fisResolutionCeiling: 1490 };
      case AWS_LMSSL1:
        return { resolution: 60, fisResolutionCeiling: 1490 };
      default:
        return {};
    }
  }

  supportsInterpolation() {
    return true;
  }

  supportsV3Evalscript(datasetId) {
    if (
      datasetId === AWS_L8L1C ||
      datasetId === AWS_LOTL1 ||
      datasetId === AWS_LOTL2 ||
      datasetId === AWS_LMSSL1 ||
      datasetId === AWS_LETML1 ||
      datasetId === AWS_LETML2
    ) {
      return true;
    }
    return false;
  }

  getSupportedImageFormats(datasetId) {
    return Object.values(IMAGE_FORMATS);
  }

  groupChannels = (datasetId) => getGroupedBands(datasetId);

  getSibling = (datasetId) => {
    switch (datasetId) {
      case AWS_LOTL1:
        return { siblingId: AWS_LOTL2 };
      case AWS_LOTL2:
        return { siblingId: AWS_LOTL1 };
      default:
        return {};
    }
  };

  getCopyrightText = (datasetId) => {
    switch (datasetId) {
      case AWS_L8L1C:
      case AWS_LOTL1:
      case AWS_LOTL2:
        return LANDSAT_COPYRIGHT_TEXT('8');
      case AWS_LTML1:
      case AWS_LTML2:
        return LANDSAT_COPYRIGHT_TEXT('4-5');
      case AWS_LMSSL1:
        return LANDSAT_COPYRIGHT_TEXT('1-5');
      case AWS_LETML1:
      case AWS_LETML2:
        return LANDSAT_COPYRIGHT_TEXT('7 ETM+');
      default:
        return '';
    }
  };

  isCopernicus = () => false;

  isSentinelHub = () => true;

  getBaseLayerForDatasetId = (datasetId, maxCloudCoverPercent) => {
    switch (datasetId) {
      case AWS_L8L1C:
        return new Landsat8AWSLayer({ maxCloudCoverPercent, evalscript: true });
      case AWS_LOTL1:
        return new Landsat8AWSLOTL1Layer({ maxCloudCoverPercent, evalscript: true });
      case AWS_LOTL2:
        return new Landsat8AWSLOTL2Layer({ maxCloudCoverPercent, evalscript: true });
      case AWS_LTML1:
        return new Landsat45AWSLTML1Layer({ maxCloudCoverPercent, evalscript: true });
      case AWS_LTML2:
        return new Landsat45AWSLTML2Layer({ maxCloudCoverPercent, evalscript: true });
      case AWS_LMSSL1:
        return new Landsat15AWSLMSSL1Layer({ maxCloudCoverPercent, evalscript: true });
      case AWS_LETML1:
        return new Landsat7AWSLETML1Layer({ maxCloudCoverPercent, evalscript: true });
      case AWS_LETML2:
        return new Landsat7AWSLETML2Layer({ maxCloudCoverPercent, evalscript: true });
      default:
        return null;
    }
  };

  isSpectralExplorerSupported = () => true;
}
