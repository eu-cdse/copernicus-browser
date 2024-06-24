import React from 'react';
import {
  DATASET_AWSEU_S1GRD,
  DATASET_CDAS_S1GRD,
  S1GRDAWSEULayer,
  S1GRDCDASLayer,
  AcquisitionMode,
  Polarization,
  Resolution,
  SpeckleFilterType,
} from '@sentinel-hub/sentinelhub-js';

import DataSourceHandler from './DataSourceHandler';
import Sentinel1SearchGroup from './DatasourceRenderingComponents/searchGroups/Sentinel1SearchGroup';
import {
  Sentinel1Tooltip,
  getSentinel1Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/Sentinel1Tooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import {
  S1_AWS_IW_VVVH,
  S1_AWS_IW_VV,
  S1_AWS_EW_HHHV,
  S1_AWS_EW_HH,
  ASCENDING,
  DESCENDING,
  S1_CDAS_IW_VVVH,
  S1_CDAS_IW_HHHV,
  S1_CDAS_IW_VV,
  S1_CDAS_IW_HH,
  S1_CDAS_EW_HHHV,
  S1_CDAS_EW_VVVH,
  S1_CDAS_EW_HH,
  S1_CDAS_EW_VV,
  S1_CDAS_SM_VVVH,
  S1_CDAS_SM_VV,
  S1_CDAS_SM_HHHV,
  S1_CDAS_SM_HH,
} from './dataSourceConstants';
import { constructV3Evalscript } from '../../../utils';
import { filterLayers } from './filter';
import { IMAGE_FORMATS } from '../../../Controls/ImgDownload/consts';
import { DATASOURCES } from '../../../const';
import store, { visualizationSlice } from '../../../store';

export const S1_SUPPORTED_SPECKLE_FILTERS = [
  {
    label: SpeckleFilterType.NONE,
    params: {
      type: SpeckleFilterType.NONE,
    },
  },
  {
    label: SpeckleFilterType.LEE + ' 3x3',
    params: {
      type: SpeckleFilterType.LEE,
      windowSizeX: 3,
      windowSizeY: 3,
    },
  },
  {
    label: SpeckleFilterType.LEE + ' 5x5',
    params: {
      type: SpeckleFilterType.LEE,
      windowSizeX: 5,
      windowSizeY: 5,
    },
  },
  {
    label: SpeckleFilterType.LEE + ' 7x7',
    params: {
      type: SpeckleFilterType.LEE,
      windowSizeX: 7,
      windowSizeY: 7,
    },
  },
];

export const S1_OBSERVATION_SCENARIOS = {
  KNOWN_BANDS: [
    { name: 'VV', description: '', color: undefined },
    { name: 'VH', description: '', color: undefined },
    { name: 'HH', description: '', color: undefined },
    { name: 'HV', description: '', color: undefined },
  ],
  DATA_LOCATIONS: {
    AWS: 'AWS',
    CDAS: 'CDAS',
  },
  ACQUISITION_MODES: {
    SM: 'SM - Stripmap Mode 3.5m x 3.5m',
    IW: 'IW - Interferometric Wide Swath 10m x 10m',
    EW: 'EW - Extra-Wide Swath 40m x 40m',
  },
  POLARIZATIONS: {
    SM: { VV: 'VV', VVVH: 'VV+VH', HH: 'HH', HHHV: 'HH+HV' },
    IW: {
      VV: 'VV',
      VVVH: 'VV+VH',
      HH: 'HH',
      HHHV: 'HH+HV',
    },
    EW: {
      HH: 'HH',
      HHHV: 'HH+HV',
      VV: 'VV',
      VVVH: 'VV+VH',
    },
  },
  ORBIT_DIRECTIONS: {
    [ASCENDING]: 'Ascending',
    [DESCENDING]: 'Descending',
  },
};

export const S1_ADVANCED_SEARCH_OPTIONS = {
  ACQUISITION_MODES: 'ACQUISITION_MODES',
  POLARIZATIONS: 'POLARIZATIONS',
  ORBIT_DIRECTIONS: 'ORBIT_DIRECTIONS',
};

export default class Sentinel1DataSourceHandler extends DataSourceHandler {
  KNOWN_BANDS = S1_OBSERVATION_SCENARIOS.KNOWN_BANDS;
  DATA_LOCATIONS = S1_OBSERVATION_SCENARIOS.DATA_LOCATIONS;
  ACQUISITION_MODES = S1_OBSERVATION_SCENARIOS.ACQUISITION_MODES;
  POLARIZATIONS = S1_OBSERVATION_SCENARIOS.POLARIZATIONS;
  ORBIT_DIRECTIONS = S1_OBSERVATION_SCENARIOS.ORBIT_DIRECTIONS;

  datasets = [];
  urls = {
    AWS: [],
  };
  configs = {};
  searchFilters = {};
  isChecked = false;
  datasource = DATASOURCES.S1;
  searchGroupLabel = 'Sentinel-1';

  leafletZoomConfig = {
    [S1_AWS_IW_VVVH]: {
      min: 7,
      max: 18,
    },
    [S1_AWS_IW_VV]: {
      min: 7,
      max: 18,
    },
    [S1_AWS_EW_HHHV]: {
      min: 7,
      max: 18,
    },
    [S1_AWS_EW_HH]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_IW_VVVH]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_IW_HHHV]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_IW_VV]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_IW_HH]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_EW_HHHV]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_EW_VVVH]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_EW_HH]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_EW_VV]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_SM_VVVH]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_SM_VV]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_SM_HHHV]: {
      min: 7,
      max: 18,
    },
    [S1_CDAS_SM_HH]: {
      min: 7,
      max: 18,
    },
  };

  getDatasetSearchLabels = () => ({
    [S1_CDAS_IW_VVVH]: 'Sentinel-1 IW VV+VH',
    [S1_CDAS_IW_HHHV]: 'Sentinel-1 IW HH+HV',
    [S1_CDAS_IW_VV]: 'Sentinel-1 IW VV',
    [S1_CDAS_IW_HH]: 'Sentinel-1 IW HH',
    [S1_CDAS_EW_HHHV]: 'Sentinel-1 EW HH+HV',
    [S1_CDAS_EW_VVVH]: 'Sentinel-1 EW VV+VH',
    [S1_CDAS_EW_HH]: 'Sentinel-1 EW HH',
    [S1_CDAS_EW_VV]: 'Sentinel-1 EW VV',
    [S1_CDAS_SM_VVVH]: 'Sentinel-1 SM VV+VH',
    [S1_CDAS_SM_VV]: 'Sentinel-1 SM VV',
    [S1_CDAS_SM_HHHV]: 'Sentinel-1 SM HH+HV',
    [S1_CDAS_SM_HH]: 'Sentinel-1 SM HH',
  });

  dataLocations = {};
  acquisitionModes = {};
  polarizations = { IW: {}, EW: {}, SM: {} };
  defaultPreselectedDataset = S1_CDAS_IW_VVVH;

  willHandle(service, url, name, layers, preselected) {
    const hasAWSLayer = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_AWSEU_S1GRD.id);
    const hasCDASLayer = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_CDAS_S1GRD.id);

    if (!hasAWSLayer && !hasCDASLayer) {
      return false;
    }
    this.setFilteringOptions(layers, hasAWSLayer, hasCDASLayer);
    const availableDatasets = this.getAvailableDatasets(layers);

    if (!this.datasets.includes(...availableDatasets)) {
      this.datasets.push(...availableDatasets);
      this.setUrls(url, availableDatasets);
      this.saveFISLayers(url, layers);
    }
    return true;
  }

  saveFISLayers(url, layers) {
    this.FISLayers[url] = {};
    const fisLayers = layers.filter((l) => l.layerId.startsWith('__FIS_'));
    for (let l of fisLayers) {
      this.FISLayers[url][l.dataset.id] = [...(this.FISLayers[url][l.dataset.id] || []), l.layerId];
    }
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  saveSearchFilters = (searchFilters) => {
    this.searchFilters = searchFilters;
    const { orbitDirections } = searchFilters;
    store.dispatch(visualizationSlice.actions.setOrbitDirection(orbitDirections));
  };

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }

    return (
      <Sentinel1SearchGroup
        key={`sentinel-1`}
        label={this.getSearchGroupLabel()}
        preselected={false}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={<Sentinel1Tooltip />}
        saveFiltersValues={this.saveSearchFilters}
        dataLocations={this.dataLocations}
        acquisitionModes={this.acquisitionModes}
        polarizations={this.polarizations}
        orbitDirections={this.ORBIT_DIRECTIONS}
        renderOptionsHelpTooltips={this.renderOptionsHelpTooltips}
      />
    );
  }

  getDescription = () => getSentinel1Markdown();

  setFilteringOptions = (layers, hasAWSLayer, hasCDASLayer) => {
    if (hasAWSLayer) {
      this.dataLocations.AWS = this.DATA_LOCATIONS.AWS;
    }
    if (hasCDASLayer) {
      this.dataLocations.CDAS = this.DATA_LOCATIONS.CDAS;
    }
    const IWLayers = layers.filter((l) => l.acquisitionMode === 'IW');
    const EWLayers = layers.filter((l) => l.acquisitionMode === 'EW');
    const SMLayers = layers.filter((l) => l.acquisitionMode === 'SM');

    if (IWLayers.length > 0) {
      this.acquisitionModes.IW = this.ACQUISITION_MODES.IW;

      const hasVV = IWLayers.some((l) => l.polarization === Polarization.SV);
      const hasVVVH = IWLayers.some((l) => l.polarization === Polarization.DV);
      const hasHH = IWLayers.some((l) => l.polarization === Polarization.SH);
      const hasHHHV = IWLayers.some((l) => l.polarization === Polarization.DH);

      if (hasVV) {
        this.polarizations.IW.VV = this.POLARIZATIONS.IW.VV;
      }
      if (hasVVVH) {
        this.polarizations.IW.VVVH = this.POLARIZATIONS.IW.VVVH;
      }
      if (hasHH) {
        this.polarizations.IW.HH = this.POLARIZATIONS.IW.HH;
      }
      if (hasHHHV) {
        this.polarizations.IW.HHHV = this.POLARIZATIONS.IW.HHHV;
      }
    }

    if (EWLayers.length > 0) {
      this.acquisitionModes.EW = this.ACQUISITION_MODES.EW;

      const hasHH = EWLayers.some((l) => l.polarization === Polarization.SH);
      const hasHHHV = EWLayers.some((l) => l.polarization === Polarization.DH);
      const hasVV = EWLayers.some((l) => l.polarization === Polarization.SV);
      const hasVVVH = EWLayers.some((l) => l.polarization === Polarization.DV);

      if (hasHH) {
        this.polarizations.EW.HH = this.POLARIZATIONS.EW.HH;
      }
      if (hasHHHV) {
        this.polarizations.EW.HHHV = this.POLARIZATIONS.EW.HHHV;
      }
      if (hasVV) {
        this.polarizations.EW.VV = this.POLARIZATIONS.EW.VV;
      }
      if (hasVVVH) {
        this.polarizations.EW.VVVH = this.POLARIZATIONS.EW.VVVH;
      }
    }

    if (SMLayers.length > 0) {
      this.acquisitionModes.SM = this.ACQUISITION_MODES.SM;

      const hasVV = SMLayers.some((l) => l.polarization === Polarization.SV);
      const hasVVVH = SMLayers.some((l) => l.polarization === Polarization.DV);
      const hasHH = SMLayers.some((l) => l.polarization === Polarization.SH);
      const hasHHHV = SMLayers.some((l) => l.polarization === Polarization.DH);

      if (hasVV) {
        this.polarizations.SM.VV = this.POLARIZATIONS.SM.VV;
      }
      if (hasVVVH) {
        this.polarizations.SM.VVVH = this.POLARIZATIONS.SM.VVVH;
      }
      if (hasHH) {
        this.polarizations.SM.HH = this.POLARIZATIONS.SM.HH;
      }
      if (hasHHHV) {
        this.polarizations.SM.HHHV = this.POLARIZATIONS.SM.HHHV;
      }
    }
  };

  getAvailableDatasets = (layers) => {
    const availableDatasets = [];
    const AWSLayers = layers.filter((l) => l.dataset && l.dataset.id === DATASET_AWSEU_S1GRD.id);
    const CDASLayers = layers.filter((l) => l.dataset && l.dataset.id === DATASET_CDAS_S1GRD.id);

    if (
      AWSLayers.some((l) => l.acquisitionMode === AcquisitionMode.IW && l.polarization === Polarization.DV)
    ) {
      availableDatasets.push(S1_AWS_IW_VVVH);
    }
    if (
      AWSLayers.some((l) => l.acquisitionMode === AcquisitionMode.IW && l.polarization === Polarization.SV)
    ) {
      availableDatasets.push(S1_AWS_IW_VV);
    }
    if (
      AWSLayers.some((l) => l.acquisitionMode === AcquisitionMode.EW && l.polarization === Polarization.DH)
    ) {
      availableDatasets.push(S1_AWS_EW_HHHV);
    }
    if (
      AWSLayers.some((l) => l.acquisitionMode === AcquisitionMode.EW && l.polarization === Polarization.SH)
    ) {
      availableDatasets.push(S1_AWS_EW_HH);
    }

    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.IW && l.polarization === Polarization.DV)
    ) {
      availableDatasets.push(S1_CDAS_IW_VVVH);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.IW && l.polarization === Polarization.DH)
    ) {
      availableDatasets.push(S1_CDAS_IW_HHHV);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.IW && l.polarization === Polarization.SV)
    ) {
      availableDatasets.push(S1_CDAS_IW_VV);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.IW && l.polarization === Polarization.SH)
    ) {
      availableDatasets.push(S1_CDAS_IW_HH);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.EW && l.polarization === Polarization.DH)
    ) {
      availableDatasets.push(S1_CDAS_EW_HHHV);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.EW && l.polarization === Polarization.DV)
    ) {
      availableDatasets.push(S1_CDAS_EW_VVVH);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.EW && l.polarization === Polarization.SH)
    ) {
      availableDatasets.push(S1_CDAS_EW_HH);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.EW && l.polarization === Polarization.SV)
    ) {
      availableDatasets.push(S1_CDAS_EW_VV);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.SM && l.polarization === Polarization.DV)
    ) {
      availableDatasets.push(S1_CDAS_SM_VVVH);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.SM && l.polarization === Polarization.SV)
    ) {
      availableDatasets.push(S1_CDAS_SM_VV);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.SM && l.polarization === Polarization.DH)
    ) {
      availableDatasets.push(S1_CDAS_SM_HHHV);
    }
    if (
      CDASLayers.some((l) => l.acquisitionMode === AcquisitionMode.SM && l.polarization === Polarization.SH)
    ) {
      availableDatasets.push(S1_CDAS_SM_HH);
    }

    return availableDatasets;
  };

  setUrls(url, datasets) {
    for (let datasetId of datasets) {
      if (this.urls[datasetId]) {
        this.urls[datasetId].push(url);
      } else {
        this.urls[datasetId] = [url];
      }
    }
  }

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    const isAWS = this.searchFilters['dataLocations'].includes('AWS');
    const isCDAS = this.searchFilters['dataLocations'].includes('CDAS');
    const isIW = this.searchFilters['acquisitionModes'].includes('IW');
    const isEW = this.searchFilters['acquisitionModes'].includes('EW');
    const isSM = this.searchFilters['acquisitionModes'].includes('SM');
    const isIW_VV = isIW && this.searchFilters['polarizations'].includes('VV');
    const isIW_HH = isIW && this.searchFilters['polarizations'].includes('HH');
    const isIW_VVVH = isIW && this.searchFilters['polarizations'].includes('VVVH');
    const isIW_HHHV = isIW && this.searchFilters['polarizations'].includes('HHHV');
    const isEW_HH = isEW && this.searchFilters['polarizations'].includes('HH');
    const isEW_VV = isEW && this.searchFilters['polarizations'].includes('VV');
    const isEW_HHHV = isEW && this.searchFilters['polarizations'].includes('HHHV');
    const isEW_VVVH = isEW && this.searchFilters['polarizations'].includes('VVVH');
    const isSM_VV = isSM && this.searchFilters['polarizations'].includes('VV');
    const isSM_VVVH = isSM && this.searchFilters['polarizations'].includes('VVVH');
    const isSM_HH = isSM && this.searchFilters['polarizations'].includes('HH');
    const isSM_HHHV = isSM && this.searchFilters['polarizations'].includes('HHHV');
    const orbitDirection =
      this.searchFilters['orbitDirections'].length === 1 ? this.searchFilters['orbitDirections'][0] : null;

    let fetchingFunctions = [];

    if (isAWS) {
      let selectedDatasets = [];
      if (isIW_VV) {
        selectedDatasets.push(S1_AWS_IW_VV);
      }
      if (isIW_VVVH) {
        selectedDatasets.push(S1_AWS_IW_VVVH);
      }
      if (isEW_HH) {
        selectedDatasets.push(S1_AWS_EW_HH);
      }
      if (isEW_HHHV) {
        selectedDatasets.push(S1_AWS_EW_HHHV);
      }
      selectedDatasets.forEach((datasetId) => {
        // Evalscript (or instanceId + layerId) is a required parameter, although we don't need it for findTiles
        let searchLayer = new S1GRDAWSEULayer({
          evalscript: true,
          orbitDirection: orbitDirection,
          ...Sentinel1DataSourceHandler.getDatasetParams(datasetId),
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
    }

    if (isCDAS) {
      let selectedDatasets = [];
      if (isIW_VV) {
        selectedDatasets.push(S1_CDAS_IW_VV);
      }
      if (isIW_HH) {
        selectedDatasets.push(S1_CDAS_IW_HH);
      }
      if (isIW_VVVH) {
        selectedDatasets.push(S1_CDAS_IW_VVVH);
      }
      if (isIW_HHHV) {
        selectedDatasets.push(S1_CDAS_IW_HHHV);
      }
      if (isEW_HH) {
        selectedDatasets.push(S1_CDAS_EW_HH);
      }
      if (isEW_VV) {
        selectedDatasets.push(S1_CDAS_EW_VV);
      }
      if (isEW_HHHV) {
        selectedDatasets.push(S1_CDAS_EW_HHHV);
      }
      if (isEW_VVVH) {
        selectedDatasets.push(S1_CDAS_EW_VVVH);
      }
      if (isSM_VV) {
        selectedDatasets.push(S1_CDAS_SM_VV);
      }
      if (isSM_VVVH) {
        selectedDatasets.push(S1_CDAS_SM_VVVH);
      }
      if (isSM_HH) {
        selectedDatasets.push(S1_CDAS_SM_HH);
      }
      if (isSM_HHHV) {
        selectedDatasets.push(S1_CDAS_SM_HHHV);
      }
      selectedDatasets.forEach((datasetId) => {
        // Evalscript (or instanceId + layerId) is a required parameter, although we don't need it for findTiles
        let searchLayer = new S1GRDCDASLayer({
          evalscript: true,
          orbitDirection: orbitDirection,
          ...Sentinel1DataSourceHandler.getDatasetParams(datasetId),
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
    }

    return fetchingFunctions;
  }

  convertToStandardTiles = (data, datasetId) => {
    const tiles = data.map((t) => ({
      sensingTime: t.sensingTime,
      geometry: t.geometry,
      datasource: this.datasource,
      datasetId,
      metadata: {
        AWSPath: this.getUrl(t.links, 'aws'),
        previewUrl: this.getUrl(t.links, 'preview'),
        EOCloudPath: this.getUrl(t.links, 'eocloud'),
      },
    }));
    return tiles;
  };

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    const datasetParams = Sentinel1DataSourceHandler.getDatasetParams(datasetId);
    let layers = data.filter(
      (layer) =>
        filterLayers(layer.layerId, layersExclude, layersInclude) &&
        this.filterLayersS1(layer, datasetParams),
    );
    layers.forEach((l) => {
      l.url = url;
    });
    return layers;
  };

  getBands = (datasetId) => {
    switch (datasetId) {
      case S1_AWS_IW_VV:
      case S1_CDAS_IW_VV:
      case S1_CDAS_EW_VV:
      case S1_CDAS_SM_VV:
        return this.KNOWN_BANDS.filter((b) => ['VV'].includes(b.name));
      case S1_AWS_EW_HHHV:
      case S1_CDAS_EW_HHHV:
      case S1_CDAS_IW_HHHV:
      case S1_CDAS_SM_HHHV:
        return this.KNOWN_BANDS.filter((b) => ['HH', 'HV'].includes(b.name));
      case S1_AWS_EW_HH:
      case S1_CDAS_EW_HH:
      case S1_CDAS_IW_HH:
      case S1_CDAS_SM_HH:
        return this.KNOWN_BANDS.filter((b) => ['HH'].includes(b.name));
      case S1_AWS_IW_VVVH:
      case S1_CDAS_IW_VVVH:
      case S1_CDAS_EW_VVVH:
      case S1_CDAS_SM_VVVH:
        return this.KNOWN_BANDS.filter((b) => ['VV', 'VH'].includes(b.name));
      default:
        return this.KNOWN_BANDS;
    }
  };

  filterLayersS1 = (layer, datasetParams) => {
    if (
      layer.acquisitionMode === datasetParams.acquisitionMode &&
      (layer.polarization === datasetParams.polarization || !layer.polarization)
    ) {
      return true;
    }
    return false;
  };

  static getDatasetParams = (datasetId) => {
    // Note: the usual combinations are IW + DV/SV + HIGH and EW + DH/SH + MEDIUM.
    switch (datasetId) {
      case S1_CDAS_SM_VVVH:
        return {
          polarization: Polarization.DV,
          acquisitionMode: AcquisitionMode.SM,
          resolution: Resolution.HIGH, // we do not have data for FULL resolution (yet)
        };
      case S1_CDAS_SM_VV:
        return {
          polarization: Polarization.SV,
          acquisitionMode: AcquisitionMode.SM,
          resolution: Resolution.HIGH, // we do not have data for FULL resolution (yet)
        };
      case S1_CDAS_SM_HHHV:
        return {
          polarization: Polarization.DH,
          acquisitionMode: AcquisitionMode.SM,
          resolution: Resolution.HIGH, // we do not have data for FULL resolution (yet)
        };
      case S1_CDAS_SM_HH:
        return {
          polarization: Polarization.SH,
          acquisitionMode: AcquisitionMode.SM,
          resolution: Resolution.HIGH, // we do not have data for FULL resolution (yet)
        };
      case S1_AWS_IW_VVVH:
      case S1_CDAS_IW_VVVH:
        return {
          polarization: Polarization.DV,
          acquisitionMode: AcquisitionMode.IW,
          resolution: Resolution.HIGH,
        };
      case S1_CDAS_IW_HHHV:
        return {
          polarization: Polarization.DH,
          acquisitionMode: AcquisitionMode.IW,
          resolution: Resolution.HIGH,
        };
      case S1_AWS_IW_VV:
      case S1_CDAS_IW_VV:
        return {
          polarization: Polarization.SV,
          acquisitionMode: AcquisitionMode.IW,
          resolution: Resolution.HIGH,
        };
      case S1_CDAS_IW_HH:
        return {
          polarization: Polarization.SH,
          acquisitionMode: AcquisitionMode.IW,
          resolution: Resolution.HIGH,
        };
      case S1_AWS_EW_HHHV:
      case S1_CDAS_EW_HHHV:
        return {
          polarization: Polarization.DH,
          acquisitionMode: AcquisitionMode.EW,
          resolution: Resolution.MEDIUM,
        };
      case S1_CDAS_EW_VVVH:
        return {
          polarization: Polarization.DV,
          acquisitionMode: AcquisitionMode.EW,
          resolution: Resolution.MEDIUM,
        };
      case S1_AWS_EW_HH:
      case S1_CDAS_EW_HH:
        return {
          polarization: Polarization.SH,
          acquisitionMode: AcquisitionMode.EW,
          resolution: Resolution.MEDIUM,
        };
      case S1_CDAS_EW_VV:
        return {
          polarization: Polarization.SV,
          acquisitionMode: AcquisitionMode.EW,
          resolution: Resolution.MEDIUM,
        };
      default:
        return { polarization: null, acquisitionMode: null };
    }
  };

  getDatasetParams = (datasetId) => {
    return Sentinel1DataSourceHandler.getDatasetParams(datasetId);
  };

  getUrlsForDataset = (datasetId) => {
    return this.urls[datasetId] || [];
  };

  getSentinelHubDataset = (datasetId) => {
    switch (datasetId) {
      case S1_AWS_IW_VVVH:
      case S1_AWS_IW_VV:
      case S1_AWS_EW_HHHV:
      case S1_AWS_EW_HH:
        return DATASET_AWSEU_S1GRD;
      case S1_CDAS_IW_VVVH:
      case S1_CDAS_IW_HHHV:
      case S1_CDAS_IW_VV:
      case S1_CDAS_IW_HH:
      case S1_CDAS_EW_HHHV:
      case S1_CDAS_EW_VVVH:
      case S1_CDAS_EW_HH:
      case S1_CDAS_EW_VV:
      case S1_CDAS_SM_VVVH:
      case S1_CDAS_SM_VV:
      case S1_CDAS_SM_HHHV:
      case S1_CDAS_SM_HH:
        return DATASET_CDAS_S1GRD;
      default:
        return null;
    }
  };

  generateEvalscript = (bands, datasetId, config) => {
    switch (datasetId) {
      case S1_AWS_IW_VVVH:
      case S1_AWS_IW_VV:
      case S1_AWS_EW_HHHV:
      case S1_AWS_EW_HH:
      case S1_CDAS_IW_HH:
      case S1_CDAS_IW_VVVH:
      case S1_CDAS_IW_VV:
      case S1_CDAS_IW_HHHV:
      case S1_CDAS_EW_HHHV:
      case S1_CDAS_EW_VVVH:
      case S1_CDAS_EW_HH:
      case S1_CDAS_EW_VV:
      case S1_CDAS_SM_VVVH:
      case S1_CDAS_SM_VV:
      case S1_CDAS_SM_HHHV:
      case S1_CDAS_SM_HH:
        return constructV3Evalscript(bands, config);
      default:
        return '';
    }
  };

  getFISLayer(url, datasetId, layerId, isCustom) {
    const shDataset = this.getSentinelHubDataset(datasetId);
    return super.getFISLayer(url, shDataset.id, layerId, isCustom);
  }

  supportsInterpolation() {
    return true;
  }

  supportsSpeckleFilter(datasetId) {
    return !!this.getSupportedSpeckleFilters(datasetId).length;
  }

  getSupportedSpeckleFilters(datasetId) {
    switch (datasetId) {
      case S1_AWS_IW_VVVH:
      case S1_AWS_IW_VV:
      case S1_AWS_EW_HHHV:
      case S1_AWS_EW_HH:
      case S1_CDAS_IW_VVVH:
      case S1_CDAS_IW_HHHV:
      case S1_CDAS_IW_VV:
      case S1_CDAS_IW_HH:
      case S1_CDAS_EW_HHHV:
      case S1_CDAS_EW_VVVH:
      case S1_CDAS_EW_HH:
      case S1_CDAS_EW_VV:
      case S1_CDAS_SM_VVVH:
      case S1_CDAS_SM_VV:
      case S1_CDAS_SM_HHHV:
      case S1_CDAS_SM_HH:
        return S1_SUPPORTED_SPECKLE_FILTERS;
      default:
        return [];
    }
  }

  canApplySpeckleFilter = (datasetId, currentZoom) => {
    const ZoomThresholdIW = 12;
    const ZoomThresholdEW = 8;
    const ZoomThresholdSM = 12;

    switch (datasetId) {
      case S1_AWS_IW_VVVH:
      case S1_AWS_IW_VV:
      case S1_CDAS_IW_VVVH:
      case S1_CDAS_IW_HHHV:
      case S1_CDAS_IW_VV:
      case S1_CDAS_IW_HH:
        return currentZoom >= ZoomThresholdIW;
      case S1_AWS_EW_HHHV:
      case S1_AWS_EW_HH:
      case S1_CDAS_EW_HHHV:
      case S1_CDAS_EW_VVVH:
      case S1_CDAS_EW_HH:
      case S1_CDAS_EW_VV:
        return currentZoom >= ZoomThresholdEW;
      case S1_CDAS_SM_VVVH:
      case S1_CDAS_SM_VV:
      case S1_CDAS_SM_HHHV:
      case S1_CDAS_SM_HH:
        return currentZoom >= ZoomThresholdSM;
      default:
        return false;
    }
  };

  supportsOrthorectification = (datasetId) => {
    switch (datasetId) {
      case S1_AWS_IW_VVVH:
      case S1_AWS_IW_VV:
      case S1_AWS_EW_HHHV:
      case S1_AWS_EW_HH:
      case S1_CDAS_IW_VVVH:
      case S1_CDAS_IW_HHHV:
      case S1_CDAS_IW_VV:
      case S1_CDAS_IW_HH:
      case S1_CDAS_EW_HHHV:
      case S1_CDAS_EW_VVVH:
      case S1_CDAS_EW_HH:
      case S1_CDAS_EW_VV:
      case S1_CDAS_SM_VVVH:
      case S1_CDAS_SM_VV:
      case S1_CDAS_SM_HHHV:
      case S1_CDAS_SM_HH:
        return true;
      default:
        return false;
    }
  };

  supportsBackscatterCoeff = (datasetId) => {
    switch (datasetId) {
      case S1_AWS_IW_VVVH:
      case S1_AWS_IW_VV:
      case S1_AWS_EW_HHHV:
      case S1_AWS_EW_HH:
      case S1_CDAS_IW_VVVH:
      case S1_CDAS_IW_HHHV:
      case S1_CDAS_IW_VV:
      case S1_CDAS_IW_HH:
      case S1_CDAS_EW_HHHV:
      case S1_CDAS_EW_VVVH:
      case S1_CDAS_EW_HH:
      case S1_CDAS_EW_VV:
      case S1_CDAS_SM_VVVH:
      case S1_CDAS_SM_VV:
      case S1_CDAS_SM_HHHV:
      case S1_CDAS_SM_HH:
        return true;
      default:
        return false;
    }
  };

  supportsV3Evalscript = (datasetId) => {
    switch (datasetId) {
      case S1_AWS_IW_VVVH:
      case S1_AWS_IW_VV:
      case S1_AWS_EW_HHHV:
      case S1_AWS_EW_HH:
      case S1_CDAS_IW_VVVH:
      case S1_CDAS_IW_HHHV:
      case S1_CDAS_IW_VV:
      case S1_CDAS_IW_HH:
      case S1_CDAS_EW_HHHV:
      case S1_CDAS_EW_VVVH:
      case S1_CDAS_EW_HH:
      case S1_CDAS_EW_VV:
      case S1_CDAS_SM_VVVH:
      case S1_CDAS_SM_VV:
      case S1_CDAS_SM_HHHV:
      case S1_CDAS_SM_HH:
        return true;
      default:
        return false;
    }
  };

  getSupportedImageFormats() {
    return Object.values(IMAGE_FORMATS);
  }

  getPreselectedDataset(bounds) {
    const coords = bounds
      ? {
          north: bounds.getNorth(),
          south: bounds.getSouth(),
        }
      : null;

    //  S1_AWS_EW_HHHV if the viewport bbox latitude is above 70° north or 55° south
    if ((coords && coords.south > 70) || (coords && coords.north < -55)) {
      // check if S1_AWS_EW_HHHV is present among datasets in selected theme
      if (!!this.datasets.find((d) => d === S1_AWS_EW_HHHV)) {
        return S1_AWS_EW_HHHV;
      }

      //try to find dataset with EW acquisition mode
      const datasetEW = this.datasets.find((d) => d.match(/EW/));

      if (datasetEW) {
        return datasetEW;
      }
    }

    return super.getPreselectedDataset();
  }

  getBaseLayerForDatasetId = (datasetId) => {
    const { polarization, acquisitionMode, resolution } =
      Sentinel1DataSourceHandler.getDatasetParams(datasetId);
    switch (datasetId) {
      case S1_AWS_IW_VVVH:
      case S1_AWS_IW_VV:
      case S1_AWS_EW_HHHV:
      case S1_AWS_EW_HH:
        return new S1GRDAWSEULayer({
          instanceId: true,
          layerId: true,
          polarization: polarization,
          acquisitionMode: acquisitionMode,
          resolution: resolution,
        });
      case S1_CDAS_IW_VVVH:
      case S1_CDAS_IW_HHHV:
      case S1_CDAS_IW_VV:
      case S1_CDAS_IW_HH:
      case S1_CDAS_EW_HHHV:
      case S1_CDAS_EW_VVVH:
      case S1_CDAS_EW_HH:
      case S1_CDAS_EW_VV:
      case S1_CDAS_SM_VVVH:
      case S1_CDAS_SM_VV:
      case S1_CDAS_SM_HHHV:
      case S1_CDAS_SM_HH:
        return new S1GRDCDASLayer({
          instanceId: true,
          layerId: true,
          polarization: polarization,
          acquisitionMode: acquisitionMode,
          resolution: resolution,
        });
      default:
        return null;
    }
  };

  findTiles = ({ datasetId, bbox, fromTime, toTime, nDates, offset, reqConfig, orbitDirection }) => {
    const searchLayer = this._getSearchLayer(datasetId);
    if (orbitDirection) {
      searchLayer.orbitDirection = orbitDirection;
    }
    return searchLayer.findTiles(bbox, fromTime, toTime, nDates, offset, reqConfig);
  };

  findDates = ({ datasetId, bbox, fromTime, toTime, reqConfig, orbitDirection }) => {
    const searchLayer = this._getSearchLayer(datasetId);
    if (orbitDirection) {
      searchLayer.orbitDirection = orbitDirection;
    }
    return searchLayer.findDatesUTC(bbox, fromTime, toTime, reqConfig);
  };

  supportsFindProductsForCurrentView = (datasetId) => /CDAS/.test(datasetId);
}
