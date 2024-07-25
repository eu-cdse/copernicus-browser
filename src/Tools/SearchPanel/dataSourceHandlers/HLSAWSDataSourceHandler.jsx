import React from 'react';
import { LinkType, DATASET_AWS_HLS } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import DataSourceHandler from './DataSourceHandler';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';

import { AWS_HLS, AWS_HLS_LANDSAT, AWS_HLS_SENTINEL } from './dataSourceConstants';
import { BAND_UNIT } from './dataSourceConstants';
import { DATASOURCES } from '../../../const';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import { HLSAWSLayer, HLSConstellation } from '@sentinel-hub/sentinelhub-js';
import HLSTooltip, {
  getHLS_Markdown,
  HLS_Landsat_Markdown,
  HLS_Sentinel_Markdown,
  renderHLSOptionsHelpTooltips,
} from './DatasourceRenderingComponents/dataSourceTooltips/HLSTooltip';
import {
  getConstellationFromCollectionList,
  getConstellationFromDatasetId,
} from './HLSAWSDataSourceHandler.utils';

export default class HLSAWSDataSourceHandler extends DataSourceHandler {
  KNOWN_BANDS = [
    {
      name: 'Blue',
      getDescription: () => t`Blue band`,
      constellation: null,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 490,
    },
    {
      name: 'Green',
      getDescription: () => t`Green band`,
      constellation: null,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 560,
    },
    {
      name: 'Red',
      getDescription: () => t`Red band`,
      constellation: null,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 665,
    },
    {
      name: 'CoastalAerosol',
      getDescription: () => t`Coastal Aerosol`,
      constellation: null,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 443,
    },
    {
      name: 'RedEdge1',
      getDescription: () => t`Red-Edge 1 - Sentinel`,
      constellation: HLSConstellation.SENTINEL,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 705,
    },
    {
      name: 'RedEdge2',
      getDescription: () => t`Red-Edge 2 - Sentinel`,
      constellation: HLSConstellation.SENTINEL,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 740,
    },
    {
      name: 'RedEdge3',
      getDescription: () => t`Red-Edge 3 - Sentinel`,
      constellation: HLSConstellation.SENTINEL,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 783,
    },
    {
      name: 'NIR_Broad',
      getDescription: () => t`NIR Broad - Sentinel`,
      constellation: HLSConstellation.SENTINEL,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 842,
    },
    {
      name: 'NIR_Narrow',
      getDescription: () => t`NIR Narrow`,
      constellation: null,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 865,
    },
    {
      name: 'SWIR1',
      getDescription: () => t`SWIR 1`,
      constellation: null,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 1610,
    },
    {
      name: 'SWIR2',
      getDescription: () => t`SWIR 2`,
      constellation: null,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 2190,
    },
    {
      name: 'WaterVapor',
      getDescription: () => t`Water Vapor - Sentinel`,
      constellation: HLSConstellation.SENTINEL,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 945,
    },
    {
      name: 'Cirrus',
      getDescription: () => t`Cirrus`,
      constellation: null,
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 1375,
    },
    {
      name: 'ThermalInfrared1',
      getDescription: () => t`Thermal Infrared 1 - Landsat`,
      constellation: HLSConstellation.LANDSAT,
    },
    {
      name: 'ThermalInfrared2',
      getDescription: () => t`Thermal Infrared 2 - Landsat`,
      constellation: HLSConstellation.LANDSAT,
    },
    {
      name: 'QA',
      getDescription: () => t`Quality Assessment band (QA)`,
      constellation: null,
    },
    {
      name: 'VAA',
      getDescription: () => t`View (sensor) Azimuth Angle`,
      constellation: null,
    },
    {
      name: 'VZA',
      getDescription: () => t`View (sensor) Zenith Angle`,
      constellation: null,
    },
    {
      name: 'SAA',
      getDescription: () => t`Sun Azimuth Angle`,
      constellation: null,
    },
    {
      name: 'SZA',
      getDescription: () => t`Sun Zenith Angle`,
      constellation: null,
    },
  ];

  getDatasetSearchLabels = () => {
    return {
      [AWS_HLS_LANDSAT]: 'Landsat',
      [AWS_HLS_SENTINEL]: 'Sentinel',
    };
  };

  datasetSearchIds = { [AWS_HLS]: AWS_HLS };

  urls = [];
  configs = {};
  datasets = [];
  allLayers = [];
  handlerId = AWS_HLS;
  resultId;
  preselected = false;
  preselectedDatasets = new Set();
  searchFilters = {};
  isChecked = false;
  datasource = DATASOURCES.AWS_HLS;
  searchGroupLabel = 'Harmonized Landsat Sentinel';

  leafletZoomConfig = {
    [AWS_HLS_LANDSAT]: {
      min: 7,
      max: 14,
    },
    [AWS_HLS_SENTINEL]: {
      min: 7,
      max: 14,
    },
    [AWS_HLS]: {
      min: 7,
      max: 14,
    },
  };

  willHandle(service, url, name, layers, preselected) {
    const usesHLSDataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_AWS_HLS.id);
    if (!usesHLSDataset) {
      return false;
    }

    if (!this.datasets.includes(AWS_HLS_LANDSAT)) {
      this.datasets.push(AWS_HLS_LANDSAT);
    }
    if (!this.datasets.includes(AWS_HLS_SENTINEL)) {
      this.datasets.push(AWS_HLS_SENTINEL);
    }

    if (!this.datasets.includes(AWS_HLS)) {
      this.datasets.push(AWS_HLS);
      this.preselectedDatasets.add(AWS_HLS);
    }

    this.urls.push(url);

    this.preselected = this.preselected || preselected;

    this.allLayers.push(...layers.filter((l) => l.dataset && l.dataset === DATASET_AWS_HLS));
    this.saveFISLayers(url, layers);
    return true;
  }

  getBaseLayerForDatasetId = (datasetId, maxCloudCoverPercent) => {
    const { maxCC } = this.searchFilters;

    return new HLSAWSLayer({
      instanceId: true,
      layerId: true,
      productType: this.datasetSearchIds[datasetId],
      maxCloudCoverPercent: maxCC || maxCloudCoverPercent,
      ...this.getDatasetParams(datasetId),
    });
  };

  isHandlingAnyUrl() {
    return this.urls.length > 0;
  }

  getDataSourceTooltip() {
    return <HLSTooltip />;
  }

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }
    return (
      <GenericSearchGroup
        key={'hls'}
        label={'Harmonized Landsat Sentinel'}
        preselected={this.preselected}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={this.getDataSourceTooltip()}
        saveFiltersValues={this.saveSearchFilters}
        options={[AWS_HLS_LANDSAT, AWS_HLS_SENTINEL]}
        optionsLabels={this.getDatasetSearchLabels()}
        //override preselected collection for advanced search form
        preselectedOptions={[AWS_HLS_LANDSAT, AWS_HLS_SENTINEL]}
        hasMaxCCFilter={true}
        renderOptionsHelpTooltips={renderHLSOptionsHelpTooltips}
      />
    );
  }

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];

    const { maxCC } = this.searchFilters;
    const datasetId = AWS_HLS;
    const constellation = getConstellationFromCollectionList(this.searchFilters.selectedOptions);

    const searchLayer = new HLSAWSLayer({
      instanceId: true,
      layerId: true,
      productType: this.datasetSearchIds[datasetId],
      maxCloudCoverPercent: maxCC,
      ...(constellation && {
        constellation: constellation,
      }),
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

    return fetchingFunctions;
  }

  convertToStandardTiles = (data, datasetId) => {
    const selectedOption =
      this.searchFilters?.selectedOptions?.length === 1 ? this.searchFilters.selectedOptions[0] : null;

    const tiles = data.map((t) => ({
      sensingTime: t.sensingTime,
      geometry: t.geometry,
      datasource: this.datasource,
      datasetId: selectedOption || datasetId,
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

  getUrlsForDataset = () => {
    return this.urls;
  };

  getBands = (datasetId) => {
    const { constellation } = this.getDatasetParams(datasetId);
    if (constellation) {
      return this.KNOWN_BANDS.filter(
        (band) => band.constellation === null || band.constellation === constellation,
      );
    }

    return this.KNOWN_BANDS.filter((band) => band.constellation === null);
  };

  getSentinelHubDataset = () => {
    return DATASET_AWS_HLS;
  };

  getResolutionLimits() {
    return { resolution: 30 };
  }

  supportsInterpolation() {
    return true;
  }

  tilesHaveCloudCoverage() {
    return true;
  }

  getDescription = () => getHLS_Markdown();

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case AWS_HLS_LANDSAT:
        return HLS_Landsat_Markdown();
      case AWS_HLS_SENTINEL:
        return HLS_Sentinel_Markdown();
      default:
        return null;
    }
  };

  getDatasetParams = (datasetId) => {
    return {
      constellation: getConstellationFromDatasetId(datasetId),
    };
  };

  getSearchLayerParams = (datasetId) => {
    return {
      constellation: getConstellationFromDatasetId(datasetId),
    };
  };

  getAdditionalParamsForGetMap = (datasetId) => {
    return {
      constellation: getConstellationFromDatasetId(datasetId),
    };
  };

  isSpectralExplorerSupported = () => true;
}
