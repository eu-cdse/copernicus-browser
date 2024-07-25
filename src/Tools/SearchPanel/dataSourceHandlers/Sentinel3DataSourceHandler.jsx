import React from 'react';
import { DATASET_S3OLCI, DATASET_S3SLSTR, S3OLCILayer, S3SLSTRLayer } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import DataSourceHandler from './DataSourceHandler';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import {
  Sentinel3Tooltip,
  S3SLSTRTooltip,
  S3OLCITooltip,
  getS3Markdown,
  getS3OLCIMarkdown,
  getS3SLSTRMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/Sentinel3Tooltip';
import Sentinel3SLSTRFilters from './DatasourceRenderingComponents/searchGroups/Sentinel3SLSTRFilters';
import HelpTooltip from './DatasourceRenderingComponents/HelpTooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { S3SLSTR, S3OLCI } from './dataSourceConstants';
import { BAND_UNIT } from './dataSourceConstants';
import { DATASOURCES } from '../../../const';

export default class Sentinel3DataSourceHandler extends DataSourceHandler {
  VIEWS = {
    NADIR: 'Nadir',
    OBLIQUE: 'Oblique',
  };
  ORBIT_DIRECTIONS = {
    ASCENDING: 'Ascending',
    DESCENDING: 'Descending',
  };

  datasetSearchLabels = { [S3OLCI]: 'OLCI', [S3SLSTR]: 'SLSTR' };
  datasetSearchIds = { [S3OLCI]: 'OLCI', [S3SLSTR]: 'SLSTR' };
  searchGroupLabel = 'Sentinel-3';

  urls = { [S3OLCI]: [], [S3SLSTR]: [] };
  datasets = [];
  preselectedDatasets = new Set();
  configs = {};
  searchFilters = {};
  searchFiltersSLSTR = {}; // SLSTR specific parameters
  isChecked = false;
  datasource = DATASOURCES.S3;
  defaultPreselectedDataset = S3OLCI;

  OLCI_BANDS = [
    {
      name: 'B01',
      getDescription: () => t`Band 1 - Aerosol correction, improved water constituent retrieval - 400 nm`,
      color: '#4900A5',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 400,
    },
    {
      name: 'B02',
      getDescription: () => t`Band 2 - Yellow substance and detrital pigments (turbidity)-412.5 nm`,
      color: '#4400DB',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 412.5,
    },
    {
      name: 'B03',
      getDescription: () => t`Band 3 - Chl absorption max., biogeochemistry, vegetation - 442.5 nm`,
      color: '#000AFF',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 442.5,
    },
    {
      name: 'B04',
      getDescription: () => t`Band 4 - High Chl, other pigments - 490 nm`,
      color: '#00FFFF',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 490,
    },
    {
      name: 'B05',
      getDescription: () => t`Band 5 - Chl, sediment, turbidity, red tide - 510 nm`,
      color: '#00FF00',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 510,
    },
    {
      name: 'B06',
      getDescription: () => t`Band 6 - Chlorophyll reference (Chl minimum) - 560 nm`,
      color: '#B6FF00',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 560,
    },
    {
      name: 'B07',
      getDescription: () => t`Band 7 - Sediment loading - 620 nm`,
      color: '#FF6200',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 620,
    },
    {
      name: 'B08',
      getDescription: () =>
        t`Band 8 - Chl (2nd Chl abs. max.), sediment, yellow substance/vegetation - 665 nm`,
      color: '#FF0000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 665,
    },
    {
      name: 'B09',
      getDescription: () =>
        t`Band 9 - For improved fluorescence retrieval and to better account for spectral smile together with the band 8 (665 nm) and band 10 (681.25 nm) - 673.75 nm`,
      color: '#FF0000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 673.75,
    },
    {
      name: 'B10',
      getDescription: () => t`Band 10 - Chl fluorescence peak, red edge - 681.25 nm`,
      color: '#FF0000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 681.25,
    },
    {
      name: 'B11',
      getDescription: () => t`Band 11 - Chl fluorescence baseline, red edge transition - 708.75 nm`,
      color: '#ED0000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 708.75,
    },
    {
      name: 'B12',
      getDescription: () => t`Band 12 - O2 absorption/clouds, vegetation - 753.75 nm`,
      color: '#880000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 753.75,
    },
    {
      name: 'B13',
      getDescription: () => t`Band 13 - O2 absorption band/aerosol corr. - 761.25 nm`,
      color: '#760000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 761.25,
    },
    {
      name: 'B14',
      getDescription: () => t`Band 14 - Atmospheric correction - 764.375 nm`,
      color: '#700000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 764.375,
    },
    {
      name: 'B15',
      getDescription: () => t`Band 15 - O2A used for cloud top pressure, fluorescence over land - 767.5 nm`,
      color: '#670000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 767.5,
    },
    {
      name: 'B16',
      getDescription: () => t`Band 16 - Atmos. corr./aerosol corr. - 778.75 nm`,
      color: '#500000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 778.75,
    },
    {
      name: 'B17',
      getDescription: () => t`Band 17 - Atmos. corr./aerosol corr., clouds, pixel co-registration - 865 nm`,
      color: '#000000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 865,
    },
    {
      name: 'B18',
      getDescription: () =>
        t`Band 18 - Water vapour absorption reference band. Common reference band with SLSTR instrument. Vegetation monitoring - 885 nm`,
      color: '#000000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 885,
    },
    {
      name: 'B19',
      getDescription: () =>
        t`Band 19 - Water vapour absorption/vegetation monitoring (max. reflectance) - 900 nm`,
      color: '#000000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 900,
    },
    {
      name: 'B20',
      getDescription: () => t`Band 20 - Water vapour absorption, atmos./aerosol corr. - 940 nm`,
      color: '#000000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 940,
    },
    {
      name: 'B21',
      getDescription: () => t`Band 21 - Atmos./aerosol corr. - 1020 nm`,
      color: '#000000',
      unit: BAND_UNIT.REFLECTANCE,
      centralWL: 1020,
    },
  ];

  SLSTR_BANDS = [
    {
      name: 'F1',
      getDescription: () => t`Band F1 - Thermal IR fire emission - Active fire - 3742.00 nm`,
      unit: BAND_UNIT.KELVIN,
    },
    {
      name: 'F2',
      getDescription: () => t`Band F2 - Thermal IR fire emission - Active fire - 10854.00 nm`,
      unit: BAND_UNIT.KELVIN,
    },
    {
      name: 'S1',
      getDescription: () => t`Band S1 - VNIR - Cloud screening, vegetation monitoring, aerosol - 554.27 nm`,
      unit: BAND_UNIT.REFLECTANCE,
    },
    {
      name: 'S2',
      getDescription: () => t`Band S2 - VNIR - NDVI, vegetation monitoring, aerosol - 659.47 nm`,
      unit: BAND_UNIT.REFLECTANCE,
    },
    {
      name: 'S3',
      getDescription: () => t`Band S3 - VNIR - NDVI, cloud flagging, pixel co-registration - 868.00 nm`,
      unit: BAND_UNIT.REFLECTANCE,
    },
    {
      name: 'S4',
      getDescription: () => t`Band S4 - SWIR - Cirrus detection over land - 1374.80 nm`,
      unit: BAND_UNIT.REFLECTANCE,
    },
    {
      name: 'S5',
      getDescription: () => t`Band S5 - SWIR - Cloud clearing, ice, snow, vegetation monitoring - 1613.40 nm`,
      unit: BAND_UNIT.REFLECTANCE,
    },
    {
      name: 'S6',
      getDescription: () => t`Band S6 - SWIR - Vegetation state and cloud clearing - 2255.70 nm`,
      unit: BAND_UNIT.REFLECTANCE,
    },
    {
      name: 'S7',
      getDescription: () => t`Band S7 - Thermal IR Ambient - SST, LST, active fire - 3742.00 nm`,
      unit: BAND_UNIT.KELVIN,
    },
    {
      name: 'S8',
      getDescription: () => t`Band S8 - Thermal IR Ambient - SST, LST, active fire - 10854.00 nm`,
      unit: BAND_UNIT.KELVIN,
    },
    {
      name: 'S9',
      getDescription: () => t`Band S9 - Thermal IR Ambient - SST, LST - 12022.50 nm`,
      unit: BAND_UNIT.KELVIN,
    },
  ];

  leafletZoomConfig = {
    [S3SLSTR]: {
      min: 6,
      max: 18,
    },
    [S3OLCI]: {
      min: 6,
      max: 18,
    },
  };

  willHandle(service, url, name, layers, preselected) {
    const usesS3SLSTRDataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_S3SLSTR.id);
    const usesS3OLCIDataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_S3OLCI.id);

    if (!usesS3SLSTRDataset && !usesS3OLCIDataset) {
      return false;
    }

    if (usesS3SLSTRDataset && !this.datasets.includes(S3SLSTR)) {
      this.urls[S3SLSTR].push(url);
      this.datasets.push(S3SLSTR);
    }
    if (usesS3OLCIDataset && !this.datasets.includes(S3OLCI)) {
      this.urls[S3OLCI].push(url);
      this.datasets.push(S3OLCI);
    }

    if (preselected) {
      if (usesS3SLSTRDataset) {
        this.preselectedDatasets.add(S3SLSTR);
      }
      if (usesS3OLCIDataset) {
        this.preselectedDatasets.add(S3OLCI);
      }
    }

    this.saveFISLayers(url, layers);
    return true;
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  saveSLSTRSearchFilters = (searchFilters) => {
    this.searchFiltersSLSTR = searchFilters;
  };

  renderOptionsHelpTooltips = (option) => {
    switch (option) {
      case S3SLSTR:
        return (
          <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
            <S3SLSTRTooltip />
          </HelpTooltip>
        );
      case S3OLCI:
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
          if (option === S3SLSTR) {
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

  getDescription = () => getS3Markdown();

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];

    const datasets = this.searchFilters.selectedOptions;
    datasets.forEach((dataset) => {
      const { maxCC, views, orbitDirections } = this.searchFiltersSLSTR;

      let searchLayer;
      if (dataset === S3OLCI) {
        // instanceId and layerId are required parameters, although we don't need them for findTiles
        searchLayer = new S3OLCILayer({ instanceId: true, layerId: true });
      }
      if (dataset === S3SLSTR) {
        // instanceId and layerId are required parameters, although we don't need them for findTiles
        searchLayer = new S3SLSTRLayer({
          instanceId: true,
          layerId: true,
          view: views[0],
          orbitDirection: orbitDirections[0],
          maxCloudCoverPercent: maxCC,
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

  convertToStandardTiles = (data, datasetId) => {
    const tiles = data.map((t) => ({
      sensingTime: t.sensingTime,
      geometry: t.geometry,
      datasource: this.datasource,
      datasetId,
      metadata: {
        previewUrl: this.getUrl(t.links, 'preview'),
        creoDIASPath: this.getUrl(t.links, 'creodias'),
        cloudCoverage: t.meta.cloudCoverPercent,
      },
    }));
    return tiles;
  };

  getUrlsForDataset = (datasetId) => this.urls[datasetId] || [];

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case S3SLSTR:
        return getS3SLSTRMarkdown();
      case S3OLCI:
        return getS3OLCIMarkdown();
      default:
        return null;
    }
  };

  getBands = (datasetId) => {
    switch (datasetId) {
      case S3OLCI:
        return this.OLCI_BANDS;
      case S3SLSTR:
        return this.SLSTR_BANDS;
      default:
        return [];
    }
  };

  getSentinelHubDataset = (datasetId) => {
    switch (datasetId) {
      case S3OLCI:
        return DATASET_S3OLCI;
      case S3SLSTR:
        return DATASET_S3SLSTR;
      default:
        return null;
    }
  };

  /* S-3 SLSTR has an additional band group 'Auxiliary meteorological data', containing the following channels:
      'CLOUD_FRACTION',
      'SEA_ICE_FRACTION',
      'SEA_SURFACE_TEMPERATURE',
      'DEW_POINT',
      'SKIN_TEMPERATURE',
      'SNOW_ALBEDO',
      'SNOW_DEPTH',
      'SOIL_WETNESS',
      'TEMPERATURE',
      'TOTAL_COLUMN_OZONE',
      'TOTAL_COLUMN_WATER_VAPOR',
    It was decided this group will be omitted, as it is not of particular importance and the channel names are too long
    */
  groupChannels = (datasetId) => {
    if (datasetId === S3SLSTR) {
      const groupedBands = {
        [t`Reflectance`]: this.SLSTR_BANDS.filter((band) => band.unit === BAND_UNIT.REFLECTANCE),
        [t`Brightness temperature`]: this.SLSTR_BANDS.filter((band) => band.unit === BAND_UNIT.KELVIN),
      };
      return groupedBands;
    } else {
      return null;
    }
  };

  tilesHaveCloudCoverage(datasetId) {
    if (datasetId === S3SLSTR) {
      return true;
    }
    return false;
  }

  getResolutionLimits() {
    return { resolution: 300 };
  }

  supportsInterpolation() {
    return true;
  }

  getBaseLayerForDatasetId = (datasetId, maxCloudCoverPercent) => {
    switch (datasetId) {
      case S3SLSTR:
        return new S3SLSTRLayer({
          maxCloudCoverPercent,
          evalscript: true,
        });
      case S3OLCI:
        return new S3OLCILayer({
          evalscript: true,
        });
      default:
        return null;
    }
  };

  isSpectralExplorerSupported = (datasetId) => {
    return datasetId === S3OLCI;
  };
}
