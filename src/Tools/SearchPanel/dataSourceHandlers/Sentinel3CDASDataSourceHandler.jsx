import React from 'react';
import {
  DATASET_CDAS_S3OLCI,
  DATASET_CDAS_S3OLCIL2,
  DATASET_CDAS_S3SLSTR,
  S3OLCICDASLayer,
  S3OLCIL2CDASLayer,
  S3SLSTRCDASLayer,
} from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import {
  Sentinel3Tooltip,
  S3SLSTRTooltip,
  S3OLCITooltip,
  getS3OLCIMarkdown,
  getS3SLSTRMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/Sentinel3Tooltip';
import Sentinel3SLSTRFilters from './DatasourceRenderingComponents/searchGroups/Sentinel3SLSTRFilters';
import HelpTooltip from './DatasourceRenderingComponents/HelpTooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { S3SLSTR_CDAS, S3OLCI_CDAS, S3OLCIL2_WATER, S3OLCIL2_LAND } from './dataSourceConstants';
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
  };
  datasetSearchIds = {
    [S3OLCI_CDAS]: 'OLCI',
    [S3SLSTR_CDAS]: 'SLSTR',
    [S3OLCIL2_WATER]: 'WATER',
    [S3OLCIL2_LAND]: 'LAND',
  };

  urls = { [S3OLCI_CDAS]: [], [S3SLSTR_CDAS]: [], [S3OLCIL2_WATER]: [], [S3OLCIL2_LAND]: [] };
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
  };

  willHandle(service, url, name, layers, preselected, onlyForBaseLayer) {
    const usesS3SLSTRDataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_CDAS_S3SLSTR.id);
    const usesS3OLCIDataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_CDAS_S3OLCI.id);
    const usesS3OLCIL2Dataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_CDAS_S3OLCIL2.id);

    if (!usesS3SLSTRDataset && !usesS3OLCIDataset && !usesS3OLCIL2Dataset) {
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
        searchLayer = new S3OLCIL2CDASLayer({ instanceId: true, layerId: true });
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
    if (datasetId === S3SLSTR_CDAS) {
      return true;
    }
    return false;
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
          evalscript: true,
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

    return layers;
  };

  supportsFindProductsForCurrentView = () => true;

  isSpectralExplorerSupported = (datasetId) => {
    return datasetId === S3OLCI_CDAS;
  };
}
