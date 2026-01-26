import React from 'react';
import {
  DATASET_CDAS_S3OLCI,
  DATASET_CDAS_S3OLCIL2,
  DATASET_CDAS_S3SLSTR,
  DATASET_CDAS_S3SYNERGYL2,
  S3OLCICDASLayer,
  S3OLCIL2CDASLayer,
  S3SLSTRCDASLayer,
  S3SYNL2CDASLayer,
} from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import {
  Sentinel3Tooltip,
  S3SLSTRTooltip,
  S3OLCITooltip,
  getS3OLCIMarkdown,
  getS3SLSTRMarkdown,
  S3SynL2Tooltip,
  getS3SynL2Markdown,
  S3V10L2Tooltip,
  S3VG1L2Tooltip,
  getS3VG1L2Markdown,
  getS3V10L2Markdown,
  //S3AODL2Tooltip,
  //S3VGPL2Tooltip,
  //getS3AODL2Markdown,
  //getS3VGPL2Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/Sentinel3Tooltip';
import Sentinel3SLSTRFilters from './DatasourceRenderingComponents/searchGroups/Sentinel3SLSTRFilters';
import HelpTooltip from './DatasourceRenderingComponents/HelpTooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import {
  S3SLSTR_CDAS,
  S3OLCI_CDAS,
  S3OLCIL2_WATER,
  S3OLCIL2_LAND,
  S3SYNERGY_L2_SYN,
  S3SYNERGY_L2_AOD,
  S3SYNERGY_L2_VGP,
  S3SYNERGY_L2_VG1,
  S3SYNERGY_L2_V10,
} from './dataSourceConstants';
import { BAND_UNIT } from './dataSourceConstants';
import Sentinel3DataSourceHandler from './Sentinel3DataSourceHandler';
import { DATASOURCES } from '../../../const';
import { filterLayers } from './filter';

export default class Sentinel3CDASDataSourceHandler extends Sentinel3DataSourceHandler {
  datasetSearchLabels = {
    [S3OLCI_CDAS]: 'Sentinel-3 OLCI L1B',
    [S3OLCIL2_WATER]: `Sentinel-3 OLCI L2 Water`,
    [S3OLCIL2_LAND]: `Sentinel-3 OLCI L2 Land`,
    [S3SLSTR_CDAS]: 'Sentinel-3 SLSTR L1B',
    [S3SYNERGY_L2_AOD]: 'Sentinel-3 SYNERGY L2 AOD',
    [S3SYNERGY_L2_SYN]: 'Sentinel-3 SYNERGY L2 SYN',
    [S3SYNERGY_L2_VGP]: 'Sentinel-3 SYNERGY L2 VGP',
    [S3SYNERGY_L2_VG1]: 'Sentinel-3 SYNERGY L2 VG1',
    [S3SYNERGY_L2_V10]: 'Sentinel-3 SYNERGY L2 V10',
  };
  datasetSearchIds = {
    [S3OLCI_CDAS]: 'OLCI',
    [S3SLSTR_CDAS]: 'SLSTR',
    [S3OLCIL2_WATER]: 'OLCI',
    [S3OLCIL2_LAND]: 'OLCI',
    [S3SYNERGY_L2_AOD]: 'SYNERGY',
    [S3SYNERGY_L2_SYN]: 'SYNERGY',
    [S3SYNERGY_L2_VGP]: 'SYNERGY',
    [S3SYNERGY_L2_VG1]: 'SYNERGY',
    [S3SYNERGY_L2_V10]: 'SYNERGY',
  };

  urls = {
    [S3OLCI_CDAS]: [],
    [S3SLSTR_CDAS]: [],
    [S3OLCIL2_WATER]: [],
    [S3OLCIL2_LAND]: [],
    [S3SYNERGY_L2_SYN]: [],
    [S3SYNERGY_L2_VG1]: [],
    [S3SYNERGY_L2_V10]: [],
    [S3SYNERGY_L2_AOD]: [],
    [S3SYNERGY_L2_VGP]: [],
  };
  defaultPreselectedDataset = S3OLCI_CDAS;
  datasource = DATASOURCES.S3_CDAS;

  S3OLCIL2_WATER_BANDS = [
    { name: 'IWV_W' },
    { name: 'CHL_OC4ME' },
    { name: 'TSM_NN' },
    { name: 'PAR' },
    { name: 'KD490_M07' },
    { name: 'A865' },
    { name: 'T865' },
    { name: 'CHL_NN' },
    { name: 'ADG443_NN' },
    ...this.OLCI_BANDS.filter((b) => !['B13', 'B14', 'B15', 'B19', 'B20'].includes(b.name)),
  ];

  S3OLCIL2_LAND_BANDS = [
    { name: 'GIFAPAR' },
    { name: 'IWV_L' },
    { name: 'OTCI' },
    { name: 'RC681' },
    { name: 'RC865' },
  ];

  S3SYNERGY_DEFAULT_BANDS = [
    ...this.OLCI_BANDS.filter((b) => !['B13', 'B14', 'B15', 'B19', 'B20'].includes(b.name)),
    ...this.SLSTR_BANDS.filter((b) => !['F1', 'F2', 'S4', 'S7', 'S8', 'S9'].includes(b.name)),
  ];
  S3SYNERGY_VG1_BANDS = [{ name: 'B0_VG1' }, { name: 'B2_VG1' }, { name: 'B3_VG1' }, { name: 'MIR_VG1' }];
  S3SYNERGY_V10_BANDS = [{ name: 'B0_V10' }, { name: 'B2_V10' }, { name: 'B3_V10' }, { name: 'MIR_V10' }];

  S3SYNERGY_SYN_LAYERS = [{ id: 'TRUE-COLOR' }, { id: 'FALSE-COLOR' }, { id: 'S6' }];
  S3SYNERGY_VG1_LAYERS = [
    { id: 'NDVI_VG1', name: 'NDVI' },
    { id: 'TOA_NDVI_VG1', name: 'TOA_NDVI_VG1' },
  ];
  S3SYNERGY_V10_LAYERS = [{ id: 'NDVI_V10', name: 'NDVI' }];
  //S3SYNERGY_VGP_LAYERS = [{ id: 'TRUE-COLOR', name: 'NDVI' }];
  //S3SYNERGY_AOD_LAYERS = [{ id: 'TRUE-COLOR', name: 'NDVI' }];

  leafletZoomConfig = {
    [S3SLSTR_CDAS]: {
      min: 6,
      max: 18,
    },
    [S3OLCI_CDAS]: {
      min: 6,
      max: 18,
    },
    [S3OLCIL2_WATER]: {
      min: 6,
      max: 18,
    },
    [S3OLCIL2_LAND]: {
      min: 6,
      max: 18,
    },
    [S3SYNERGY_L2_SYN]: {
      min: 6,
      max: 18,
    },
    [S3SYNERGY_L2_VG1]: {
      min: 6,
      max: 18,
    },
    [S3SYNERGY_L2_V10]: {
      min: 6,
      max: 18,
    },
    [S3SYNERGY_L2_AOD]: {
      min: 6,
      max: 18,
    },
    [S3SYNERGY_L2_VGP]: {
      min: 6,
      max: 18,
    },
  };

  willHandle(service, url, name, layers, preselected, _onlyForBaseLayer) {
    const usesS3SLSTRDataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_CDAS_S3SLSTR.id);
    const usesS3OLCIDataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_CDAS_S3OLCI.id);
    const usesS3OLCIL2Dataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_CDAS_S3OLCIL2.id);
    const usesS3SYNL2Dataset = !!layers.find(
      (l) => l.dataset && l.dataset.id === DATASET_CDAS_S3SYNERGYL2.id,
    );

    if (!usesS3SLSTRDataset && !usesS3OLCIDataset && !usesS3OLCIL2Dataset && !usesS3SYNL2Dataset) {
      return false;
    }

    if (usesS3SLSTRDataset && !this.datasets.includes(S3SLSTR_CDAS)) {
      this.urls[S3SLSTR_CDAS].push(url);
      this.datasets.push(S3SLSTR_CDAS);
    }
    if (usesS3OLCIDataset && !this.datasets.includes(S3OLCI_CDAS)) {
      this.urls[S3OLCI_CDAS].push(url);
      this.datasets.push(S3OLCI_CDAS);
    }
    if (usesS3OLCIL2Dataset && !this.datasets.includes(S3OLCIL2_WATER)) {
      this.urls[S3OLCIL2_WATER].push(url);
      this.datasets.push(S3OLCIL2_WATER);
    }
    if (usesS3OLCIL2Dataset && !this.datasets.includes(S3OLCIL2_LAND)) {
      this.urls[S3OLCIL2_LAND].push(url);
      this.datasets.push(S3OLCIL2_LAND);
    }
    const hasS3SYNL2SYNLayers = layers.find((l) =>
      this.S3SYNERGY_SYN_LAYERS.find(({ id }) => l.layerId === id),
    );
    if (usesS3SYNL2Dataset && !this.datasets.includes(S3SYNERGY_L2_SYN) && hasS3SYNL2SYNLayers) {
      this.urls[S3SYNERGY_L2_SYN].push(url);
      this.datasets.push(S3SYNERGY_L2_SYN);
    }
    const hasS3SYNL2VG1Layers = layers.find((l) =>
      this.S3SYNERGY_VG1_LAYERS.find(({ id }) => l.layerId === id),
    );
    if (usesS3SYNL2Dataset && !this.datasets.includes(S3SYNERGY_L2_VG1) && hasS3SYNL2VG1Layers) {
      this.urls[S3SYNERGY_L2_VG1].push(url);
      this.datasets.push(S3SYNERGY_L2_VG1);
    }

    const hasS3SYNL2V10Layers = layers.find((l) =>
      this.S3SYNERGY_V10_LAYERS.find(({ id }) => l.layerId === id),
    );
    if (usesS3SYNL2Dataset && !this.datasets.includes(S3SYNERGY_L2_V10) && hasS3SYNL2V10Layers) {
      this.urls[S3SYNERGY_L2_V10].push(url);
      this.datasets.push(S3SYNERGY_L2_V10);
    }
    /*
       const hasS3SYNL2AODLayers = layers.find((l) =>
      this.S3SYNERGY_AOD_LAYERS.find(({ id }) => l.layerId === id),
    );
        if (usesS3SYN2Dataset && !this.datasets.includes(S3SYNERGY_L2_AOD) && hasS3SYNL2AODLayers) {
      this.urls[S3SYNERGY_L2_AOD].push(url);
      this.datasets.push(S3SYNERGY_L2_AOD);
    }
      const hasS3SYNL2VGPLayers = layers.find((l) =>
      this.S3SYNERGY_VGP_LAYERS.find(({ id }) => l.layerId === id),
    );
    if (usesS3SYN2Dataset && !this.datasets.includes(S3SYNERGY_L2_VGP) && hasS3SYNL2VGPLayers) {
      this.urls[S3SYNERGY_L2_VGP].push(url);
      this.datasets.push(S3SYNERGY_L2_VGP);
    } */

    if (preselected) {
      if (usesS3SLSTRDataset) {
        this.preselectedDatasets.add(S3SLSTR_CDAS);
      }
      if (usesS3OLCIDataset) {
        this.preselectedDatasets.add(S3OLCI_CDAS);
      }
      if (usesS3OLCIL2Dataset) {
        this.preselectedDatasets.add(S3OLCIL2_WATER);
      }
      if (usesS3OLCIL2Dataset) {
        this.preselectedDatasets.add(S3OLCIL2_LAND);
      }
      if (usesS3SYNL2Dataset) {
        this.preselectedDatasets.add(S3SYNERGY_L2_SYN);
      }
    }
    this.saveFISLayers(url, layers);
    return true;
  }

  renderOptionsHelpTooltips = (option) => {
    switch (option) {
      case S3SLSTR_CDAS:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <S3SLSTRTooltip />
          </HelpTooltip>
        );
      case S3OLCI_CDAS:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <S3OLCITooltip />
          </HelpTooltip>
        );
      case S3OLCIL2_LAND:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <S3OLCITooltip />
          </HelpTooltip>
        );
      case S3OLCIL2_WATER:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <S3OLCITooltip />
          </HelpTooltip>
        );
      case S3SYNERGY_L2_V10:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <S3V10L2Tooltip />
          </HelpTooltip>
        );

      case S3SYNERGY_L2_SYN:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <S3SynL2Tooltip />
          </HelpTooltip>
        );

      case S3SYNERGY_L2_VG1:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <S3VG1L2Tooltip />
          </HelpTooltip>
        );
      /*    case S3SYNERGY_L2_AOD:
          return (
            <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
              <S3AODL2Tooltip />
            </HelpTooltip>
          );
          case S3SYNERGY_L2_VGP:
            return (
              <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
                <S3VGPL2Tooltip />
              </HelpTooltip>
            ); */
      default:
        return null;
    }
  };

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }
    return (
      <GenericSearchGroup
        key={`sentinel-3`}
        label={this.getSearchGroupLabel()}
        preselected={false}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={<Sentinel3Tooltip />}
        saveFiltersValues={this.saveSearchFilters}
        options={this.datasets}
        optionsLabels={this.datasetSearchLabels}
        preselectedOptions={Array.from(this.preselectedDatasets)}
        hasMaxCCFilter={false}
        renderOptionsFilters={(option) => {
          // SLSTR allows additional filters:
          if (option === S3SLSTR_CDAS) {
            return (
              <Sentinel3SLSTRFilters
                saveFiltersValues={this.saveSLSTRSearchFilters}
                views={this.VIEWS}
                orbitDirections={this.ORBIT_DIRECTIONS}
              />
            );
          }
          return null;
        }}
        renderOptionsHelpTooltips={this.renderOptionsHelpTooltips}
      />
    );
  }

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];

    const datasets = this.searchFilters.selectedOptions;
    datasets.forEach((dataset) => {
      const { maxCC, views, orbitDirections } = this.searchFiltersSLSTR;

      let searchLayer;
      if (dataset === S3OLCI_CDAS) {
        // instanceId and layerId are required parameters, although we don't need them for findTiles
        searchLayer = new S3OLCICDASLayer({ instanceId: true, layerId: true });
      }
      if (dataset === S3SLSTR_CDAS) {
        // instanceId and layerId are required parameters, although we don't need them for findTiles
        searchLayer = new S3SLSTRCDASLayer({
          instanceId: true,
          layerId: true,
          view: views[0],
          orbitDirection: orbitDirections[0],
          maxCloudCoverPercent: maxCC,
        });
      }
      if (dataset === S3OLCIL2_WATER || dataset === S3OLCIL2_LAND) {
        searchLayer = new S3OLCIL2CDASLayer({ instanceId: true, layerId: true, maxCloudCoverPercent: maxCC });
      }
      if (
        dataset === S3SYNERGY_L2_SYN ||
        dataset === S3SYNERGY_L2_VG1 ||
        dataset === S3SYNERGY_L2_V10
        // TODO: || dataset === S3SYNERGY_L2_AOD || dataset === S3SYNERGY_L2_VGP
      ) {
        searchLayer = new S3SYNL2CDASLayer({
          instanceId: true,
          layerId: true,
          maxCloudCoverPercent: maxCC,
          s3Type: this.getS3Type(dataset),
        });
      }

      const ff = new FetchingFunction(
        dataset,
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

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case S3SLSTR_CDAS:
        return getS3SLSTRMarkdown();
      case S3OLCI_CDAS:
        return getS3OLCIMarkdown();
      case S3OLCIL2_LAND:
        return getS3OLCIMarkdown();
      case S3OLCIL2_WATER:
        return getS3OLCIMarkdown();
      case S3SYNERGY_L2_SYN:
        return getS3SynL2Markdown();
      case S3SYNERGY_L2_VG1:
        return getS3VG1L2Markdown();
      case S3SYNERGY_L2_V10:
        return getS3V10L2Markdown();
      //case S3SYNERGY_L2_AOD:
      //  return getS3AODL2Markdown();
      //case S3SYNERGY_L2_VGP:
      //  return getS3VGPL2Markdown();
      default:
        return null;
    }
  };

  getBands = (datasetId) => {
    switch (datasetId) {
      case S3OLCI_CDAS:
        return this.OLCI_BANDS;
      case S3OLCIL2_LAND:
        return this.S3OLCIL2_LAND_BANDS;
      case S3OLCIL2_WATER:
        return this.S3OLCIL2_WATER_BANDS;
      case S3SLSTR_CDAS:
        return this.SLSTR_BANDS;
      case S3SYNERGY_L2_V10:
        return this.S3SYNERGY_V10_BANDS;
      case S3SYNERGY_L2_VG1:
        return this.S3SYNERGY_VG1_BANDS;
      case S3SYNERGY_L2_SYN:
        // case S3SYNERGY_L2_AOD:
        // case S3SYNERGY_L2_VGP:
        return this.S3SYNERGY_DEFAULT_BANDS;
      default:
        return [];
    }
  };

  getSentinelHubDataset = (datasetId) => {
    switch (datasetId) {
      case S3OLCI_CDAS:
        return DATASET_CDAS_S3OLCI;
      case S3SLSTR_CDAS:
        return DATASET_CDAS_S3SLSTR;
      case S3OLCIL2_LAND:
      case S3OLCIL2_WATER:
        return DATASET_CDAS_S3OLCIL2;
      case S3SYNERGY_L2_SYN:
      case S3SYNERGY_L2_VG1:
      case S3SYNERGY_L2_V10:
        // case S3SYNERGY_L2_AOD:
        // case S3SYNERGY_L2_VGP:
        return DATASET_CDAS_S3SYNERGYL2;
      default:
        return null;
    }
  };

  groupChannels = (datasetId) => {
    if (datasetId === S3SLSTR_CDAS) {
      const groupedBands = {
        [t`Reflectance`]: this.SLSTR_BANDS.filter((band) => band.unit === BAND_UNIT.REFLECTANCE),
        [t`Brightness temperature`]: this.SLSTR_BANDS.filter((band) => band.unit === BAND_UNIT.KELVIN),
      };
      return groupedBands;
    } else if (datasetId === S3OLCIL2_WATER) {
      const groupedBands = {
        [t`Optical bands`]: this.S3OLCIL2_WATER_BANDS.filter((band) => band.unit === BAND_UNIT.REFLECTANCE),
        [t`Others`]: this.S3OLCIL2_WATER_BANDS.filter((band) => band.unit === undefined),
      };
      return groupedBands;
    } else {
      return null;
    }
  };

  tilesHaveCloudCoverage(datasetId) {
    if (datasetId === S3OLCI_CDAS) {
      return false;
    }
    return true;
  }

  getBaseLayerForDatasetId = (datasetId, maxCloudCoverPercent) => {
    switch (datasetId) {
      case S3SLSTR_CDAS:
        return new S3SLSTRCDASLayer({
          maxCloudCoverPercent,
          evalscript: true,
        });
      case S3OLCI_CDAS:
        return new S3OLCICDASLayer({
          evalscript: true,
        });
      case S3OLCIL2_LAND:
      case S3OLCIL2_WATER:
        return new S3OLCIL2CDASLayer({
          maxCloudCoverPercent,
          evalscript: true,
        });
      case S3SYNERGY_L2_SYN:
      case S3SYNERGY_L2_VG1:
      case S3SYNERGY_L2_V10:
        //  case S3SYNERGY_L2_AOD:
        //  case S3SYNERGY_L2_VGP:
        return new S3SYNL2CDASLayer({
          maxCloudCoverPercent,
          evalscript: true,
          s3Type: this.getS3Type(datasetId),
        });
      default:
        return null;
    }
  };

  filterLayersBasedOnEvalscriptBands(datasetId, evalscript) {
    const subcollectionBands = this.getBands(datasetId);
    const usedBand = subcollectionBands.find((b) => {
      const onlyWholeName = new RegExp(String.raw`\b${b.name}\b`, 'g');
      return onlyWholeName.test(evalscript);
    });
    return usedBand;
  }

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    let layers = data.filter((layer) => filterLayers(layer.layerId, layersExclude, layersInclude));
    layers.forEach((l) => {
      l.url = url;
    });

    if (datasetId === S3OLCIL2_WATER || datasetId === S3OLCIL2_LAND) {
      layers = layers.filter((layer) => this.filterLayersBasedOnEvalscriptBands(datasetId, layer.evalscript));
    }
    if (datasetId === S3SYNERGY_L2_SYN) {
      layers = layers.filter((layer) => this.S3SYNERGY_SYN_LAYERS.find(({ id }) => layer.layerId === id));
    }
    if (datasetId === S3SYNERGY_L2_VG1) {
      layers = layers.filter((layer) => this.S3SYNERGY_VG1_LAYERS.find(({ id }) => layer.layerId === id));
    }
    if (datasetId === S3SYNERGY_L2_V10) {
      layers = layers.filter((layer) => this.S3SYNERGY_V10_LAYERS.find(({ id }) => layer.layerId === id));
    }
    /*  if(datasetId === S3SYNERGY_L2_AOD || datasetId === S3SYNERGY_L2_VGP){
      layers = layers.filter((layer) => this.S3SYNERGY_AOD_LAYERS.find(({ name }) => layer.layerId === name));
    }
    if(datasetId === S3SYNERGY_L2_VGP){
      layers = layers.filter((layer) => this.S3SYNERGY_VGP_LAYERS.find(({ name }) => layer.layerId === name));
    } */

    return layers;
  };

  supportsFindProductsForCurrentView = () => true;

  isSpectralExplorerSupported = (datasetId) => {
    return datasetId === S3OLCI_CDAS;
  };

  getSearchLayerParams = (datasetId) => {
    return {
      s3Type: this.getS3Type(datasetId),
    };
  };

  getAdditionalParamsForGetMap = (datasetId) => {
    return {
      s3Type: this.getS3Type(datasetId),
    };
  };

  getS3Type = (datasetId) => {
    switch (datasetId) {
      case S3SYNERGY_L2_SYN:
        return 'SY_2_SYN';
      case S3SYNERGY_L2_VG1:
        return 'SY_2_VG1';
      case S3SYNERGY_L2_V10:
        return 'SY_2_V10';
      default:
        return null;
    }
  };
}
