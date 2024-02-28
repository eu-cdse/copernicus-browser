import React from 'react';
import { DATASET_BYOC, CRS_EPSG4326, BYOCSubTypes, BYOCLayer } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import DataSourceHandler from './DataSourceHandler';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import {
  WorldCoverTooltip,
  getWorldCoverMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/ESAWorldCoverTooltip';
import {
  GHSTooltip,
  GHSMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/GlobalHumanSettlementTooltip';
import {
  CopernicusGlobalSurfaceWaterTooltip,
  CopernicusGlobalSurfaceWaterMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/CopernicusGlobalSurfaceWaterTooltip';
import {
  IOLULCTooltip,
  IOLULCMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/IOLULCTooltip';

import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
// import { FetchingFunction } from '../search';

import {
  CNESLandCoverMarkdown,
  CNESLandCoverTooltip,
} from './DatasourceRenderingComponents/dataSourceTooltips/CNESLandCoverTooltip';
import HelpTooltip from './DatasourceRenderingComponents/HelpTooltip';
import {
  CNES_LAND_COVER,
  ESA_WORLD_COVER,
  GLOBAL_HUMAN_SETTLEMENT,
  COPERNICUS_GLOBAL_SURFACE_WATER,
  IO_LULC_10M_ANNUAL,
} from './dataSourceConstants';
import { CNES_LAND_COVER_BANDS } from './datasourceAssets/CNESLandCoverBands';
import { ESA_WORLD_COVER_BANDS } from './datasourceAssets/copernicusWorldCoverBands';
import { COPERNICUS_GLOBAL_SURFACE_WATER_BANDS } from './datasourceAssets/copernicusGlobalSurfaceWaterBands';
import { GHS_BANDS } from './datasourceAssets/GHSBands';
import { IO_LULC_10M_ANNUAL_BANDS } from './datasourceAssets/IOLULCBands';
import { DATASOURCES } from '../../../const';
import { reprojectGeometry } from '../../../utils/reproject';
import { filterLayers } from './filter';

export default class OthersDataSourceHandler extends DataSourceHandler {
  getDatasetSearchLabels = () => ({
    [CNES_LAND_COVER]: 'CNES Land Cover Map',
    [ESA_WORLD_COVER]: 'ESA WorldCover',
    [COPERNICUS_GLOBAL_SURFACE_WATER]: 'Global Surface Water',
    [GLOBAL_HUMAN_SETTLEMENT]: 'Global Human Settlement',
    [IO_LULC_10M_ANNUAL]: 'IO Land Use Land Cover Map',
  });

  urls = {
    [CNES_LAND_COVER]: [],
    [ESA_WORLD_COVER]: [],
    [COPERNICUS_GLOBAL_SURFACE_WATER]: [],
    [GLOBAL_HUMAN_SETTLEMENT]: [],
    [IO_LULC_10M_ANNUAL]: [],
  };
  datasets = [];
  allLayers = [];
  datasource = DATASOURCES.OTHER;

  leafletZoomConfig = {
    [CNES_LAND_COVER]: {
      min: 4,
      max: 18,
    },
    [ESA_WORLD_COVER]: {
      min: 8,
      max: 20,
    },
    [COPERNICUS_GLOBAL_SURFACE_WATER]: {
      min: 3,
      max: 16,
    },
    [GLOBAL_HUMAN_SETTLEMENT]: {
      min: 5,
      max: 18,
    },
    [IO_LULC_10M_ANNUAL]: {
      min: 4,
      max: 18,
    },
  };

  KNOWN_COLLECTIONS = {
    // temporary disable known collections
    // [CNES_LAND_COVER]: ['9baa27-YOUR-INSTANCEID-HERE'],
    // [ESA_WORLD_COVER]: ['0b940c-YOUR-INSTANCEID-HERE'],
    // [COPERNICUS_GLOBAL_SURFACE_WATER]: ['9a525f-YOUR-INSTANCEID-HERE'],
    // [GLOBAL_HUMAN_SETTLEMENT]: ['3dbeea-YOUR-INSTANCEID-HERE'],
    // [IO_LULC_10M_ANNUAL]: ['0ed263-YOUR-INSTANCEID-HERE'],
  };

  KNOWN_COLLECTIONS_LOCATIONS = {
    // temporary disable locations for known collections
    // [CNES_LAND_COVER]: LocationIdSHv3.cdse,
    // [ESA_WORLD_COVER]: LocationIdSHv3.cdse,
    // [COPERNICUS_GLOBAL_SURFACE_WATER]: LocationIdSHv3.cdse,
    // [GLOBAL_HUMAN_SETTLEMENT]: LocationIdSHv3.cdse,
    // [IO_LULC_10M_ANNUAL]: LocationIdSHv3.cdse,
  };

  defaultPreselectedDataset = ESA_WORLD_COVER;
  searchGroupLabel = t`Other`;

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
        key={'otherCollections'}
        label={this.getSearchGroupLabel()}
        preselected={false}
        saveCheckedState={this.saveCheckedState}
        saveFiltersValues={this.saveSearchFilters}
        options={this.datasets}
        optionsLabels={this.getDatasetSearchLabels()}
        preselectedOptions={this.datasets.length <= 1 ? this.datasets : []}
        hasMaxCCFilter={false}
        renderOptionsHelpTooltips={this.renderOptionsHelpTooltips}
      />
    );
  }

  renderOptionsHelpTooltips = (option) => {
    switch (option) {
      case CNES_LAND_COVER:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <CNESLandCoverTooltip />
          </HelpTooltip>
        );
      case ESA_WORLD_COVER:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <WorldCoverTooltip />
          </HelpTooltip>
        );
      case COPERNICUS_GLOBAL_SURFACE_WATER:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <CopernicusGlobalSurfaceWaterTooltip />
          </HelpTooltip>
        );
      case GLOBAL_HUMAN_SETTLEMENT:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <GHSTooltip />
          </HelpTooltip>
        );
      case IO_LULC_10M_ANNUAL:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <IOLULCTooltip />
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
      case CNES_LAND_COVER:
        return CNES_LAND_COVER_BANDS;
      case ESA_WORLD_COVER:
        return ESA_WORLD_COVER_BANDS;
      case COPERNICUS_GLOBAL_SURFACE_WATER:
        return COPERNICUS_GLOBAL_SURFACE_WATER_BANDS;
      case GLOBAL_HUMAN_SETTLEMENT:
        return GHS_BANDS;
      case IO_LULC_10M_ANNUAL:
        return IO_LULC_10M_ANNUAL_BANDS;
      default:
        return [];
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case ESA_WORLD_COVER:
        return getWorldCoverMarkdown();
      case GLOBAL_HUMAN_SETTLEMENT:
        return GHSMarkdown();
      case CNES_LAND_COVER:
        return CNESLandCoverMarkdown();
      case IO_LULC_10M_ANNUAL:
        return IOLULCMarkdown();
      case COPERNICUS_GLOBAL_SURFACE_WATER:
        return CopernicusGlobalSurfaceWaterMarkdown();
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
