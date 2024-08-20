import React from 'react';
import {
  DATASET_BYOC,
  CRS_EPSG4326,
  BYOCLayer,
  BYOCSubTypes,
  LocationIdSHv3,
} from '@sentinel-hub/sentinelhub-js';

import DataSourceHandler from './DataSourceHandler';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import { CopernicusServicesTooltip } from './DatasourceRenderingComponents/dataSourceTooltips/CopernicusServicesTooltips';
import {
  HRVPPSeasonalTrajectoriesTooltip,
  HRVPPVegetationIndicesTooltip,
  HRVPPVPPS1Tooltip,
  HRVPPVPPS2Tooltip,
  getCopercnicusVegetationMarkdown,
  getHRVPPSeasonalTrajectoriesMarkdown,
  getHRVPPVegetationIndicesMarkdown,
  getHRVPPVPPS1Markdown,
  getHRVPPVPPS2Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/CopernicusServicesTooltips';
import HelpTooltip from './DatasourceRenderingComponents/HelpTooltip';

import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import {
  COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES,
  COPERNICUS_HR_VPP_VEGETATION_INDICES,
  COPERNICUS_HR_VPP_VPP_S1,
  COPERNICUS_HR_VPP_VPP_S2,
} from './dataSourceConstants';
import { HR_VPP_SEASONAL_TRAJECTORIES_BANDS } from './datasourceAssets/HRVPPSeasonalTrajectoriesBands';
import { HR_VPP_VEGETATION_INDICES_BANDS } from './datasourceAssets/HRVPPVegetationIndicesBands';
import { HR_VPP_VPP_BANDS } from './datasourceAssets/HRVPPVPPBands';
import { DATASOURCES } from '../../../const';
import { reprojectGeometry } from '../../../utils/reproject';
import { filterLayers } from './filter';

export default class CopernicusHRVPPDataSourceHandler extends DataSourceHandler {
  getDatasetSearchLabels = () => ({
    [COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES]: 'Seasonal Trajectories',
    [COPERNICUS_HR_VPP_VEGETATION_INDICES]: 'Vegetation Indices',
    [COPERNICUS_HR_VPP_VPP_S1]: 'Vegetation Phenology and Productivity Season 1',
    [COPERNICUS_HR_VPP_VPP_S2]: 'Vegetation Phenology and Productivity Season 2',
  });

  urls = {
    [COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES]: [],
    [COPERNICUS_HR_VPP_VEGETATION_INDICES]: [],
    [COPERNICUS_HR_VPP_VPP_S1]: [],
    [COPERNICUS_HR_VPP_VPP_S2]: [],
  };
  datasets = [];
  allLayers = [];
  datasource = DATASOURCES.COPERNICUS_HRVPP;
  searchGroupLabel = 'Copernicus Vegetation';

  leafletZoomConfig = {
    [COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES]: {
      min: 0,
      max: 25,
    },
    [COPERNICUS_HR_VPP_VEGETATION_INDICES]: {
      min: 0,
      max: 25,
    },
    [COPERNICUS_HR_VPP_VPP_S1]: {
      min: 0,
      max: 25,
    },
    [COPERNICUS_HR_VPP_VPP_S2]: {
      min: 0,
      max: 25,
    },
  };

  KNOWN_COLLECTIONS = {
    [COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES]: ['90f0abac-87cf-4277-958b-d8c56d9e5371'],
    [COPERNICUS_HR_VPP_VEGETATION_INDICES]: ['472c0398-430d-4157-a62d-603363d7a4e8'],
    [COPERNICUS_HR_VPP_VPP_S1]: ['67c73156-095d-4f53-8a09-9ddf3848fbb6'],
    [COPERNICUS_HR_VPP_VPP_S2]: ['8c2bc96a-3c2c-482b-9394-031310171b33'],
  };

  KNOWN_COLLECTIONS_LOCATIONS = {
    [COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES]: LocationIdSHv3.cdse,
    [COPERNICUS_HR_VPP_VEGETATION_INDICES]: LocationIdSHv3.cdse,
    [COPERNICUS_HR_VPP_VPP_S1]: LocationIdSHv3.cdse,
    [COPERNICUS_HR_VPP_VPP_S2]: LocationIdSHv3.cdse,
  };

  willHandle(service, url, name, layers, preselected) {
    let handlesAny = false;

    for (let datasetId of Object.keys(this.KNOWN_COLLECTIONS)) {
      const layersWithDataset = layers.filter((l) =>
        this.KNOWN_COLLECTIONS[datasetId].includes(l.collectionId),
      );
      if (layersWithDataset.length > 0) {
        if (!this.urls[datasetId]?.includes(url)) {
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

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  getKnownCollectionsList() {
    return Object.values(this.KNOWN_COLLECTIONS).flat();
  }

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }

    return (
      <GenericSearchGroup
        key={'copernicusServices'}
        label={this.getSearchGroupLabel()}
        preselected={false}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={<CopernicusServicesTooltip />}
        saveFiltersValues={this.saveSearchFilters}
        options={this.datasets}
        optionsLabels={this.getDatasetSearchLabels()}
        preselectedOptions={this.datasets.length <= 1 ? this.datasets : []}
        hasMaxCCFilter={false}
        renderOptionsHelpTooltips={this.renderOptionsHelpTooltips}
      />
    );
  }

  getDescription = () => getCopercnicusVegetationMarkdown();

  renderOptionsHelpTooltips = (option) => {
    switch (option) {
      case COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <HRVPPSeasonalTrajectoriesTooltip />
          </HelpTooltip>
        );
      case COPERNICUS_HR_VPP_VEGETATION_INDICES:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <HRVPPVegetationIndicesTooltip />
          </HelpTooltip>
        );
      case COPERNICUS_HR_VPP_VPP_S1:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <HRVPPVPPS1Tooltip />
          </HelpTooltip>
        );
      case COPERNICUS_HR_VPP_VPP_S2:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <HRVPPVPPS2Tooltip />
          </HelpTooltip>
        );
      default:
        return null;
    }
  };

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];

    const { selectedOptions } = this.searchFilters;
    selectedOptions.forEach((datasetId) => {
      const searchLayer = this.allLayers.find((l) =>
        this.KNOWN_COLLECTIONS[datasetId].includes(l.collectionId),
      );
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
      if (t.geometry && t.geometry.crs && t.geometry.crs.properties.name !== CRS_EPSG4326.urn) {
        reprojectGeometry(t.geometry, { toCrs: CRS_EPSG4326.authId });
      }
      return {
        sensingTime: t.sensingTime,
        geometry: t.geometry,
        datasource: 'CUSTOM',
        datasetId: datasetId,
        metadata: {},
      };
    });
    return tiles;
  };

  getUrlsForDataset = (datasetId) => {
    const urls = this.urls[datasetId];
    if (!urls) {
      return [];
    }
    return urls;
  };

  getSentinelHubDataset = () => DATASET_BYOC;

  getBands = (datasetId) => {
    switch (datasetId) {
      case COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES:
        return HR_VPP_SEASONAL_TRAJECTORIES_BANDS;
      case COPERNICUS_HR_VPP_VEGETATION_INDICES:
        return HR_VPP_VEGETATION_INDICES_BANDS;
      case COPERNICUS_HR_VPP_VPP_S1:
      case COPERNICUS_HR_VPP_VPP_S2:
        return HR_VPP_VPP_BANDS;
      default:
        return [];
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES:
        return getHRVPPSeasonalTrajectoriesMarkdown();
      case COPERNICUS_HR_VPP_VEGETATION_INDICES:
        return getHRVPPVegetationIndicesMarkdown();
      case COPERNICUS_HR_VPP_VPP_S1:
        return getHRVPPVPPS1Markdown();
      case COPERNICUS_HR_VPP_VPP_S2:
        return getHRVPPVPPS2Markdown();
      default:
        return null;
    }
  };

  generateEvalscript = (bands, datasetId, config) => {
    return this.defaultEvalscript(bands, 1 / 1000);
  };

  defaultEvalscript = (bands, factor) => {
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

  areBandsClasses = (datasetId) => {
    return false;
  };

  supportsIndex = () => {
    return false;
  };

  getBaseLayerForDatasetId = (datasetId) => {
    const collectionIds = this.KNOWN_COLLECTIONS[datasetId];
    if (collectionIds) {
      return new BYOCLayer({
        evalscript: true,
        collectionId: collectionIds[0],
        locationId: this.KNOWN_COLLECTIONS_LOCATIONS[datasetId],
      });
    }
  };

  getDatasetParams = (datasetId) => {
    const collectionIds = this.KNOWN_COLLECTIONS[datasetId];
    if (collectionIds) {
      return {
        collectionId: collectionIds[0],
        locationId: this.KNOWN_COLLECTIONS_LOCATIONS[datasetId],
        subType: BYOCSubTypes.BYOC,
      };
    }
    return {};
  };

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    return data
      .filter(
        (layer) =>
          filterLayers(layer.layerId, layersExclude, layersInclude) &&
          this.KNOWN_COLLECTIONS[datasetId].includes(layer.collectionId),
      )
      .map((l) => ({ ...l, url: url }));
  };
}
