import React from 'react';
import { DATASET_S2L2A, DATASET_S2L1C, LinkType, S2L1CLayer, S2L2ALayer } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import DataSourceHandler from './DataSourceHandler';
import Sentinel2SearchGroup from './DatasourceRenderingComponents/searchGroups/Sentinel2SearchGroup';
import {
  Sentinel2Tooltip,
  S2L1CTooltip,
  S2L2ATooltip,
  getSentinel2Markdown,
  getS2L1CMarkdown,
  getS2L2AMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/Sentinel2Tooltip';
import HelpTooltip from './DatasourceRenderingComponents/HelpTooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { S2L1C, S2L2A } from './dataSourceConstants';
import { BAND_UNIT } from './dataSourceConstants';
import { DATASOURCES } from '../../../const';

export default class Sentinel2AWSDataSourceHandler extends DataSourceHandler {
  L1C_BANDS = [
    {
      name: 'B01',
      getDescription: () => t`Band 1 - Coastal aerosol - 443 nm`,
      color: '#4c17e2',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 443,
    },
    {
      name: 'B02',
      getDescription: () => t`Band 2 - Blue - 490 nm`,
      color: '#699aff',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 490,
    },
    {
      name: 'B03',
      getDescription: () => t`Band 3 - Green - 560 nm`,
      color: '#a4d26f',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 560,
    },
    {
      name: 'B04',
      getDescription: () => t`Band 4 - Red - 665 nm`,
      color: '#e47121',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 665,
    },
    {
      name: 'B05',
      getDescription: () => t`Band 5 - Vegetation Red Edge - 705 nm`,
      color: '#ba0a0a',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 705,
    },
    {
      name: 'B06',
      getDescription: () => t`Band 6 - Vegetation Red Edge - 740 nm`,
      color: '#cc1412',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 740,
    },
    {
      name: 'B07',
      getDescription: () => t`Band 7 - Vegetation Red Edge - 783 nm`,
      color: '#c00607',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 783,
    },
    {
      name: 'B08',
      getDescription: () => t`Band 8 - NIR - 842 nm`,
      color: '#c31e20',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 842,
    },
    {
      name: 'B8A',
      getDescription: () => t`Band 8A - Vegetation Red Edge - 865 nm`,
      color: '#bc0e10',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 865,
    },
    {
      name: 'B09',
      getDescription: () => t`Band 9 - Water vapour - 945 nm`,
      color: '#b31a1b',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 945,
    },
    {
      name: 'B10',
      getDescription: () => t`Band 10 - SWIR - Cirrus - 1375 nm`,
      color: '#d71234',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 1375,
    },
    {
      name: 'B11',
      getDescription: () => t`Band 11 - SWIR - 1610 nm`,
      color: '#990134',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 1610,
    },
    {
      name: 'B12',
      getDescription: () => t`Band 12 - SWIR - 2190 nm`,
      color: '#800000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 2190,
    },
  ];

  L2A_BANDS = [...this.L1C_BANDS].filter((b) => b.name !== 'B10');

  getDatasetSearchLabels = () => ({
    [S2L1C]: 'Sentinel-2 L1C',
    [S2L2A]: t`Sentinel-2 L2A`,
  });
  datasetSearchIds = { [S2L1C]: 'L1C', [S2L2A]: 'L2A' };
  searchGroupLabel = 'Sentinel-2';

  urls = { [S2L2A]: [], [S2L1C]: [] };
  configs = {};
  datasets = [];
  allLayers = [];
  handlerId = 'S2AWS';
  resultId;
  preselectedDatasets = new Set();
  searchFilters = {};
  isChecked = false;
  datasource = DATASOURCES.S2;
  defaultPreselectedDataset = S2L2A;

  leafletZoomConfig = {
    [S2L1C]: {
      min: 5,
      max: 18,
    },
    [S2L2A]: {
      min: 7,
      max: 18,
    },
  };

  willHandle(service, url, name, layers, preselected, onlyForBaseLayer) {
    const usesS2L2ADataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_S2L2A.id);
    const usesS2L1CDataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_S2L1C.id);
    if (!usesS2L2ADataset && !usesS2L1CDataset) {
      return false;
    }
    if (usesS2L1CDataset && !this.datasets.includes(S2L1C)) {
      this.datasets.push(S2L1C);
      this.urls[S2L1C].push(url);
    }
    if (usesS2L2ADataset && !this.datasets.includes(S2L2A)) {
      this.datasets.push(S2L2A);
      this.urls[S2L2A].push(url);
    }
    if (preselected) {
      if (usesS2L1CDataset) {
        this.preselectedDatasets.add(S2L1C);
      }
      if (usesS2L2ADataset) {
        this.preselectedDatasets.add(S2L2A);
      }
    }

    this.allLayers.push(
      ...layers.filter((l) => l.dataset && (l.dataset === DATASET_S2L2A || l.dataset === DATASET_S2L1C)),
    );
    this.saveFISLayers(url, layers);
    return true;
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  renderOptionsHelpTooltips = (option) => {
    switch (option) {
      case S2L1C:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <S2L1CTooltip />
          </HelpTooltip>
        );
      case S2L2A:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <S2L2ATooltip />
          </HelpTooltip>
        );
      default:
        return null;
    }
  };

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }
    const preselected = this.preselectedDatasets.size > 0;
    return (
      <Sentinel2SearchGroup
        key={`sentinel-2-aws`}
        label={this.getSearchGroupLabel()}
        preselected={preselected}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={<Sentinel2Tooltip />}
        saveFiltersValues={this.saveSearchFilters}
        options={this.datasets}
        optionsLabels={this.getDatasetSearchLabels()}
        preselectedOptions={Array.from(this.preselectedDatasets)}
        hasMaxCCFilter={true}
        renderOptionsHelpTooltips={this.renderOptionsHelpTooltips}
      />
    );
  }

  getDescription = () => getSentinel2Markdown();

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];

    const { selectedOptions, maxCC } = this.searchFilters;
    selectedOptions.forEach((datasetId) => {
      const searchLayer = this.allLayers.find((l) => l.dataset === this.getSentinelHubDataset(datasetId));
      if (searchLayer.maxCloudCoverPercent !== undefined) {
        searchLayer.maxCloudCoverPercent = maxCC;
      }
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
      metadata: {
        previewUrl: this.getUrl(t.links, LinkType.PREVIEW),
        AWSPath: this.getUrl(t.links, LinkType.AWS),
        sciHubLink: this.getUrl(t.links, LinkType.SCIHUB),
        tileId: t.meta.tileId,
        cloudCoverage: t.meta.cloudCoverPercent,
        tileCRS: 'EPSG:4326', //When we search results, this CRS is in accept headers
        MGRSLocation: t.meta.MGRSLocation,
      },
    }));
    return tiles;
  };

  getBands = (datasetId) => {
    switch (datasetId) {
      case S2L1C:
        return this.L1C_BANDS;
      case S2L2A:
        return this.L2A_BANDS;
      default:
        return [];
    }
  };

  getUrlsForDataset = (datasetId) => this.urls[datasetId] || [];

  getSentinelHubDataset = (datasetId) => {
    switch (datasetId) {
      case S2L1C:
        return DATASET_S2L1C;
      case S2L2A:
        return DATASET_S2L2A;
      default:
        return null;
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case S2L1C:
        return getS2L1CMarkdown();
      case S2L2A:
        return getS2L2AMarkdown();
      default:
        return null;
    }
  };

  tilesHaveCloudCoverage() {
    return true;
  }

  getResolutionLimits(datasetId) {
    switch (datasetId) {
      case S2L1C:
        return { resolution: 10 };
      case S2L2A:
        return { resolution: 10, fisResolutionCeiling: 1400 };
      default:
        return {};
    }
  }

  supportsInterpolation() {
    return true;
  }

  getSibling = (datasetId) => {
    switch (datasetId) {
      case S2L2A:
        return { siblingId: S2L1C };
      case S2L1C:
        return { siblingId: S2L2A };
      default:
        return {};
    }
  };

  getBaseLayerForDatasetId = (datasetId, maxCloudCoverPercent) => {
    switch (datasetId) {
      case S2L1C:
        return new S2L1CLayer({
          maxCloudCoverPercent,
          evalscript: '//VERSION=3 ---',
        });
      case S2L2A:
        return new S2L2ALayer({
          maxCloudCoverPercent,
          evalscript: '//VERSION=3 ---',
        });
      default:
        return null;
    }
  };

  isSpectralExplorerSupported = () => true;
}
