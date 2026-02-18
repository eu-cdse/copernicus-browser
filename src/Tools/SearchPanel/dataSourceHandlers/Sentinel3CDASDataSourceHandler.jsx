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

import {
  getS3OLCIMarkdown,
  getS3SLSTRMarkdown,
  getS3SynL2Markdown,
  getS3VG1L2Markdown,
  getS3V10L2Markdown,
  getS3Markdown,
  //S3AODL2Tooltip,
  //S3VGPL2Tooltip,
  //getS3AODL2Markdown,
  //getS3VGPL2Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/Sentinel3Tooltip';
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
import DataSourceHandler from './DataSourceHandler';
import { DATASOURCES } from '../../../const';
import { filterLayers } from './filter';

export default class Sentinel3CDASDataSourceHandler extends DataSourceHandler {
  VIEWS = {
    NADIR: 'Nadir',
    OBLIQUE: 'Oblique',
  };
  ORBIT_DIRECTIONS = {
    ASCENDING: 'Ascending',
    DESCENDING: 'Descending',
  };

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

  datasets = [];
  preselectedDatasets = new Set();
  defaultPreselectedDataset = S3OLCI_CDAS;
  datasource = DATASOURCES.S3_CDAS;
  searchGroupLabel = 'Sentinel-3';

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

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  getUrlsForDataset = (datasetId) => this.urls[datasetId] || [];

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

  getDescription = () => getS3Markdown();

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

  getResolutionLimits() {
    return { resolution: 300 };
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

  supportsInterpolation = () => true;

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
