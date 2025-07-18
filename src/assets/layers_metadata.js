import moment from 'moment';
import { t } from 'ttag';
import {
  CNES_LAND_COVER,
  ESA_WORLD_COVER,
  IO_LULC_10M_ANNUAL,
  S3SLSTR,
  S3SLSTR_CDAS,
  S5_SO2_CDAS,
  S5_HCHO_CDAS,
  S5_CH4_CDAS,
  S5_O3_CDAS,
  S5_NO2_CDAS,
  S5_CO_CDAS,
  S5_AER_AI_CDAS,
  S5_CLOUD_CDAS,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  AWS_LETML2,
  AWS_LETML1,
  AWS_HLS,
  AWS_L8L1C,
  AWS_LOTL1,
  AWS_LOTL2,
  S3OLCI,
  S3OLCI_CDAS,
  COPERNICUS_GLOBAL_LAND_COVER,
  COPERNICUS_CORINE_LAND_COVER,
  COPERNICUS_CLC_ACCOUNTING,
  GLOBAL_HUMAN_SETTLEMENT,
  COPERNICUS_WATER_BODIES,
  GIBS_ASTER_GDEM,
  GIBS_VIIRS_SNPP_DAYNIGHTBAND_ENCC,
  AWS_LTML1,
  AWS_LTML2,
  ENVISAT_MERIS,
  AWS_LMSSL1,
  COPERNICUS_GLOBAL_SURFACE_WATER,
  DEM_MAPZEN,
  DEM_COPERNICUS_30,
  DEM_COPERNICUS_90,
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
  S1_CDAS_IW_VVVH,
  S1_CDAS_IW_VV,
  S1_CDAS_EW_HHHV,
  S1_CDAS_EW_HH,
  S1_CDAS_SM_VVVH,
  S1_CDAS_SM_VV,
  S1_CDAS_SM_HHHV,
  S1_CDAS_SM_HH,
  S1_CDAS_IW_HHHV,
  S1_CDAS_IW_HH,
  S1_CDAS_EW_VVVH,
  S1_CDAS_EW_VV,
  S1_MONTHLY_MOSAIC_DH,
  S1_MONTHLY_MOSAIC_IW,
  S3OLCIL2_WATER,
  S3OLCIL2_LAND,
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL,
  COPERNICUS_CLMS_BURNT_AREA_DAILY,
  COPERNICUS_CLMS_BURNT_AREA_MONTHLY,
  COPERNICUS_CLMS_DMP_1KM_10DAILY,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_LAI_1KM_10DAILY,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT1,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT2,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT6,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT0,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT1,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT2,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT6,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT0,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT1,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT2,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT6,
  COPERNICUS_CLMS_LAI_300M_10DAILY,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT0,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT1,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT2,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT6,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT0,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT1,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT2,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT6,
  COPERNICUS_CLMS_SWI_12_5KM_10DAILY,
  COPERNICUS_CLMS_SWI_12_5KM_DAILY,
  COPERNICUS_CLMS_SWI_1KM_DAILY,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT1,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT2,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT5,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT6,
  COPERNICUS_CLMS_LST_5KM_10DAILY_V1,
  COPERNICUS_CLMS_LST_5KM_10DAILY_V2,
  COPERNICUS_CLMS_NDVI_1KM_STATS_V2,
  COPERNICUS_CLMS_NDVI_1KM_STATS_V3,
  COPERNICUS_CLMS_NDVI_1KM_10DAILY_V2,
  COPERNICUS_CLMS_NDVI_300M_10DAILY_V1,
  COPERNICUS_CLMS_NDVI_300M_10DAILY_V2,
  COPERNICUS_CLMS_SSM_1KM_DAILY_V1,
  COPERNICUS_CLMS_LSP_300M_YEARLY_V1,
  COPERNICUS_CLMS_LCC_100M_YEARLY_V3,
  COPERNICUS_CLMS_LST_5KM_HOURLY_V1,
  COPERNICUS_CLMS_LST_5KM_HOURLY_V2,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6,
  COPERNICUS_CLMS_WB_300M_10DAILY_V1,
  COPERNICUS_CLMS_WB_1KM_10DAILY_V2,
  COPERNICUS_CLMS_SWE_5KM_DAILY_V1,
  COPERNICUS_CLMS_SWE_5KM_DAILY_V2,
  COPERNICUS_CLMS_SCE_500M_DAILY_V1,
  COPERNICUS_CLMS_SCE_1KM_DAILY_V1,
  COPERNICUS_CLMS_WB_300M_MONTHLY_V2,
  COPERNICUS_CLMS_LIE_500M_DAILY_V1,
  COPERNICUS_CLMS_LIE_250M_DAILY_V2,
  COPERNICUS_CLMS_WB_100M_MONTHLY_V1,
  COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1,
  COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2,
  COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2,
  COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1,
  COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1,
  COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1,
  COPERNICUS_CLMS_LCM_10M_YEARLY_V1,
  COPERNICUS_CLMS_TCD_10M_YEARLY_V1,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

import {
  getS5AERAIMarkdown,
  getS5CH4Markdown,
  getS5COMarkdown,
  getS5HCHOMarkdown,
  getS5NO2Markdown,
  getS5O3Markdown,
  getS5SO2Markdown,
} from '../Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/dataSourceTooltips/Sentinel5Tooltip';

export const PREDEFINED_LAYERS_METADATA = [
  {
    match: [
      { datasourceId: S3SLSTR_CDAS, layerId: 'S7_VISUALIZED' },
      { datasourceId: S3SLSTR_CDAS, layerId: 'S8_VISUALIZED' },
      { datasourceId: S3SLSTR_CDAS, layerId: 'S9_VISUALIZED' },
    ],
    legend: {
      type: 'continuous',
      minPosition: 223,
      maxPosition: 323,
      gradients: [
        { position: 223, color: '#002863', label: '<= - 50' },
        { position: 253, color: '#2e82ff', label: '- 20' },
        { position: 263, color: '#80b3ff' },
        { position: 272, color: '#e0edff' },
        { position: 273, color: '#ffffff', label: '0' },
        { position: 274, color: '#fefce7' },
        { position: 283, color: '#FDE191' },
        { position: 293, color: '#f69855', label: '20' },
        { position: 303, color: '#ec6927' },
        { position: 323, color: '#aa2d1d', label: '>= 50 [°C]' },
      ],
    },
  },

  {
    match: [
      { datasourceId: S3SLSTR_CDAS, layerId: 'F1_VISUALIZED' },
      { datasourceId: S3SLSTR_CDAS, layerId: 'F2_VISUALIZED' },
    ],
    legend: {
      type: 'continuous',
      minPosition: 223,
      maxPosition: 373,
      gradients: [
        { position: 223, color: '#003d99', label: '<= -50' },
        { position: 253, color: '#2e82ff' },
        { position: 263, color: '#80b3ff' },
        { position: 273, color: '#ffffff', label: '0' },
        { position: 274, color: '#fefce7' },
        { position: 283, color: '#FDE191' },
        { position: 293, color: '#f69855' },
        { position: 303, color: '#ec6927' },
        { position: 323, color: '#aa2d1d', label: '50' },
        { position: 343, color: '#650401' },
        { position: 373, color: '#3d0200', label: '>= 100 [°C]' },
      ],
    },
    description: () =>
      t`# Thermal IR fire emission bands\n\nSentinel-3 Sea and Land Surface Temperature Instrument (SLSTR) has two dedicated channels (F1 and F2) that aim to detect Land Surface Temperature (LST). F2 Channel, with a central wavelength of 10854 nm measures in the thermal infrared, or TIR. It is very useful for fire and high temperature event monitoring at 1 km resolution.\n\n\n\nMore info [here.](https://sentinel.esa.int/web/sentinel/user-guides/sentinel-3-slstr/overview/geophysical-measurements/land-surface-temperature)`,
  },

  {
    match: [{ datasourceId: S5_CH4_CDAS, layerId: 'CH4_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 1600,
      maxPosition: 2000,
      gradients: [
        { position: 1600, color: '#000080', label: '1600' },
        { position: 1650, color: '#0000ff', label: '1650' },
        { position: 1750, color: '#00ffff', label: '1750' },
        { position: 1850, color: '#ffff00', label: '1850' },
        { position: 1950, color: '#ff0000', label: '1950' },
        { position: 2000, color: '#800000', label: '2000 [ppb]' },
      ],
    },
    description: getS5CH4Markdown,
  },

  {
    match: [{ datasourceId: S5_HCHO_CDAS, layerId: 'HCHO_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 0.001,
      gradients: [
        { position: 0, color: '#000080', label: '0.0' },
        { position: 0.000125, color: '#0000ff', label: '1.25E-4' },
        { position: 0.000375, color: '#00ffff', label: '3.75E-4' },
        { position: 0.000625, color: '#ffff00', label: '6.25E-4' },
        { position: 0.000875, color: '#ff0000', label: '8.75E-4' },
        { position: 0.001, color: '#800000', label: '1E-3 [mol / m^2]' },
      ],
    },
    description: getS5HCHOMarkdown,
  },

  {
    match: [{ datasourceId: S5_SO2_CDAS, layerId: 'SO2_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 0.01,
      gradients: [
        { position: 0, color: '#000080', label: '0.0' },
        { position: 0.00125, color: '#0000ff', label: '1.25E-3' },
        { position: 0.00375, color: '#00ffff', label: '3.75E-3' },
        { position: 0.00625, color: '#ffff00', label: '6.25E-3' },
        { position: 0.00875, color: '#ff0000', label: '8.75E-3' },
        { position: 0.01, color: '#800000', label: '1E-2 [mol / m^2]' },
      ],
    },
    description: getS5SO2Markdown,
  },

  {
    match: [{ datasourceId: S5_O3_CDAS, layerId: 'O3_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 0.36,
      gradients: [
        { position: 0, color: '#000080', label: '0.0' },
        { position: 0.045, color: '#0000ff', label: '0.045' },
        { position: 0.135, color: '#00ffff', label: '0.135' },
        { position: 0.225, color: '#ffff00', label: '0.225' },
        { position: 0.315, color: '#ff0000', label: '0.315' },
        { position: 0.36, color: '#800000', label: '0.36 [mol / m^2]' },
      ],
    },
    description: getS5O3Markdown,
  },

  {
    match: [{ datasourceId: S5_NO2_CDAS, layerId: 'NO2_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 0.0001,
      gradients: [
        { position: 0, color: '#000080', label: '0.0' },
        { position: 0.0000125, color: '#0000ff', label: '1.25E-5' },
        { position: 0.0000375, color: '#00ffff', label: '3.75E-5' },
        { position: 0.0000625, color: '#ffff00', label: '6.25E-5' },
        { position: 0.0000875, color: '#ff0000', label: '8.75E-5' },
        { position: 0.0001, color: '#800000', label: '1.0E-4 [mol / m^2]' },
      ],
    },
    description: getS5NO2Markdown,
  },

  {
    match: [{ datasourceId: S5_CO_CDAS, layerId: 'CO_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 0.1,
      gradients: [
        { position: 0, color: '#000080', label: '0.0' },
        { position: 0.0125, color: '#0000ff', label: '0.0125' },
        { position: 0.0375, color: '#00ffff', label: '0.0375' },
        { position: 0.0625, color: '#ffff00', label: '0.0625' },
        { position: 0.0875, color: '#ff0000', label: '0.0875' },
        { position: 0.1, color: '#800000', label: '0.1 [mol / m^2]' },
      ],
    },
    description: getS5COMarkdown,
  },

  {
    match: [
      { datasourceId: S5_AER_AI_CDAS, layerId: 'AER_AI_340_AND_380_VISUALIZED' },
      { datasourceId: S5_AER_AI_CDAS, layerId: 'AER_AI_354_AND_388_VISUALIZED' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -1.0,
      maxPosition: 5.0,
      gradients: [
        { position: -1.0, color: '#000080', label: '-1.0' },
        { position: -0.25, color: '#0000ff', label: '-0.25' },
        { position: 1.25, color: '#00ffff', label: '1.25' },
        { position: 2.75, color: '#ffff00', label: '2.75' },
        { position: 4.25, color: '#ff0000', label: '4.25' },
        { position: 5, color: '#800000', label: '5' },
      ],
    },
    description: getS5AERAIMarkdown,
  },

  {
    match: [{ datasourceId: S5_CLOUD_CDAS, layerId: 'CLOUD_BASE_HEIGHT_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 20000,
      gradients: [
        { position: 0, color: '#000080', label: '0' },
        { position: 2500, color: '#0000ff', label: '2500' },
        { position: 7500, color: '#00ffff', label: '7500' },
        { position: 12500, color: '#ffff00', label: '12500' },
        { position: 17500, color: '#ff0000', label: '17500' },
        { position: 20000, color: '#800000', label: '20000 [m]' },
      ],
    },
    description: () => t`# Cloud base height\n\nHeight of cloud base measured in meters (m).`,
  },

  {
    match: [{ datasourceId: S5_CLOUD_CDAS, layerId: 'CLOUD_BASE_PRESSURE_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 10000.0,
      maxPosition: 110000.0,
      gradients: [
        { position: 10000, color: '#000080', label: '10000' },
        { position: 22500, color: '#0000ff', label: '22500' },
        { position: 47500, color: '#00ffff', label: '47500' },
        { position: 72500, color: '#ffff00', label: '72500' },
        { position: 97500, color: '#ff0000', label: '97500' },
        { position: 110000, color: '#800000', label: '110000 [Pa]' },
      ],
    },
    description: () => t`# Cloud base pressure\n\nPressure measured at cloud base in Pascal (Pa).`,
  },

  {
    match: [{ datasourceId: S5_CLOUD_CDAS, layerId: 'CLOUD_FRACTION_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 1.0,
      gradients: [
        { position: 0, color: '#000080', label: '0' },
        { position: 0.125, color: '#0000ff', label: '0.125' },
        { position: 0.375, color: '#00ffff', label: '0.375' },
        { position: 0.625, color: '#ffff00', label: '0.625' },
        { position: 0.875, color: '#ff0000', label: '0.875' },
        { position: 1, color: '#800000', label: '1' },
      ],
    },
    description: () =>
      t`# Effective radiometric cloud fraction\n\nEffective radiometric cloud fraction represents the portion of the Earth's surface covered by clouds, divided by the total surface. Clouds have shielding, albedo, and in-cloud absorption effects on trace gas retrieval. The effective radiometric cloud fraction is an important parameter to correct these effects.`,
  },

  {
    match: [{ datasourceId: S5_CLOUD_CDAS, layerId: 'CLOUD_OPTICAL_THICKNESS_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 250.0,
      gradients: [
        { position: 0, color: '#000080', label: '0' },
        { position: 30, color: '#0000ff', label: '30' },
        { position: 95, color: '#00ffff', label: '95' },
        { position: 155, color: '#ffff00', label: '155' },
        { position: 220, color: '#ff0000', label: '220' },
        { position: 250, color: '#800000', label: '250' },
      ],
    },
    description: () =>
      t`# Cloud optical thickness\n\nThe cloud thickness is a key parameter to characterise optical properties of clouds. It is a measure of how much sunlight passes through the cloud to reach Earth's surface. The higher a cloud's optical thickness, the more sunlight the cloud is scattering and reflecting. Dark blue shows where there are low cloud optical thickness values and red shows larger cloud optical thickness.`,
  },

  {
    match: [{ datasourceId: S5_CLOUD_CDAS, layerId: 'CLOUD_TOP_HEIGHT_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 0.0,
      maxPosition: 20000.0,
      gradients: [
        { position: 0, color: '#000080', label: '0' },
        { position: 2500, color: '#0000ff', label: '2500' },
        { position: 7500, color: '#00ffff', label: '7500' },
        { position: 12500, color: '#ffff00', label: '12500' },
        { position: 17500, color: '#ff0000', label: '17500' },
        { position: 20000, color: '#800000', label: '20000 [m]' },
      ],
    },
    description: () => t`# Cloud top height\n\nHeight of cloud top measured in meters (m).`,
  },

  {
    match: [{ datasourceId: S5_CLOUD_CDAS, layerId: 'CLOUD_TOP_PRESSURE_VISUALIZED' }],
    legend: {
      type: 'continuous',
      minPosition: 10000.0,
      maxPosition: 110000.0,
      gradients: [
        { position: 10000, color: '#000080', label: '10000' },
        { position: 22500, color: '#0000ff', label: '22500' },
        { position: 47500, color: '#00ffff', label: '47500' },
        { position: 72500, color: '#ffff00', label: '72500' },
        { position: 97500, color: '#ff0000', label: '97500' },
        { position: 110000, color: '#800000', label: '110000 [Pa]' },
      ],
    },
    description: () => t`# Cloud top pressure\n\nPressure measured at cloud top in Pascal (Pa).`,
  },

  {
    match: [
      { datasourceId: AWS_L8L1C, layerId: 'THERMAL' },
      { datasourceId: AWS_LOTL1, layerId: 'THERMAL' },
      { datasourceId: AWS_LOTL2, layerId: 'THERMAL' },
    ],
    legend: {
      type: 'continuous',
      minPosition: 223,
      maxPosition: 348,
      gradients: [
        { position: 223, color: '#003d99', label: '<= -50' },
        { position: 253, color: '#2e82ff', label: '-20' },
        { position: 263, color: '#80b3ff', label: '-10' },
        { position: 272, color: '#e0edff' },
        { position: 273, color: '#ffffff', label: '0' },
        { position: 274, color: '#fefce7' },
        { position: 283, color: '#FDE191', label: '10' },
        { position: 293, color: '#f69855', label: '20' },
        { position: 303, color: '#f66927', label: '30' },
        { position: 323, color: '#aa2d1d', label: '50' },
        { position: 342, color: '#650401', label: '90' },
        { position: 348, color: '#3d0200', label: '>= 100 [°C]' },
      ],
    },
    description: () =>
      t`# Thermal band 10\n\nThis thermal visualization is based on band 10 (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). At the central wavelength of 10895 nm it measures in the thermal infrared, or TIR. Instead of measuring the temperature of the air, like weather stations do, band 10 reports on the ground itself, which is often much hotter. Thermal band 10 is useful in providing surface temperatures and is collected with a 100-meter resolution.\n\n\n\nMore info [here](https://www.usgs.gov/faqs/what-are-band-designations-landsat-satellites?qt-news_science_products=0#qt-news_science_products) and [here.](https://landsat.gsfc.nasa.gov/landsat-8/landsat-8-bands/)`,
  },

  {
    match: [
      { datasourceId: AWS_LTML1, layerId: '1_TRUE_COLOR' },
      { datasourceId: AWS_LTML2, layerId: '1_TRUE_COLOR' },
    ],
    description: () =>
      t`# True color composite\n\nSensors carried by satellites can image Earth in different regions of the electromagnetic spectrum. Each region in the spectrum is referred to as a band. Landsat 4-5 TM has 7 bands. The true color composite uses visible light bands red, green and blue in the corresponding red, green and blue color channels, resulting in a natural colored product, that is a good representation of the Earth as humans would see it naturally.\n\n\n\nMore info [here](https://www.usgs.gov/faqs/what-are-band-designations-landsat-satellites).`,
  },
  {
    match: [
      { datasourceId: AWS_LTML1, layerId: 'THERMAL' },
      { datasourceId: AWS_LTML2, layerId: 'THERMAL' },
    ],
    legend: {
      type: 'continuous',
      minPosition: 223,
      maxPosition: 348,
      gradients: [
        { position: 223, color: '#000000', label: '<= -50' },
        { position: 253, color: '#AE0000', label: '-20' },
        { position: 263, color: '#FF6E00', label: '-10' },
        { position: 272, color: '#FF8600' },
        { position: 273, color: '#FFFFFF', label: '0' },
        { position: 274, color: '#fefce7' },
        { position: 283, color: '#FDE191', label: '10' },
        { position: 293, color: '#f69855', label: '20' },
        { position: 303, color: '#f66927', label: '30' },
        { position: 323, color: '#aa2d1d', label: '50' },
        { position: 342, color: '#650401', label: '90' },
        { position: 348, color: '#3d0200', label: '>= 100 [°C]' },
      ],
    },
    description: () =>
      t`# Thermal band 6\n\nThis thermal visualization is based on band 6 (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). At the central wavelength of 11040 nm it measures in the thermal infrared, or TIR. Instead of measuring the temperature of the air, like weather stations do, band 6 reports on the ground itself, which is often much hotter. Thermal band 6 is useful in providing surface temperatures and is collected with a 120-meter resolution, resampled to 30-meter.\n\n\n\nMore info [here](https://www.usgs.gov/faqs/what-are-band-designations-landsat-satellites).`,
  },
  {
    match: [{ datasourceId: AWS_LETML2, layerId: 'THERMAL' }],
    legend: {
      type: 'continuous',
      minPosition: 223,
      maxPosition: 348,
      gradients: [
        { position: 223, color: '#003d99', label: '<= -50' },
        { position: 253, color: '#2e82ff', label: '-20' },
        { position: 263, color: '#80b3ff', label: '-10' },
        { position: 272, color: '#e0edff' },
        { position: 273, color: '#ffffff', label: '0' },
        { position: 274, color: '#fefce7' },
        { position: 283, color: '#FDE191', label: '10' },
        { position: 293, color: '#f69855', label: '20' },
        { position: 303, color: '#f66927', label: '30' },
        { position: 323, color: '#aa2d1d', label: '50' },
        { position: 342, color: '#650401', label: '90' },
        { position: 348, color: '#3d0200', label: '>= 100 [°C]' },
      ],
    },
    description: () =>
      t`# Thermal Visualization\n\nThis thermal visualization is based on band B06 (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). At the central wavelength of 10400-12500 nm it measures in the thermal infrared, or TIR. Instead of measuring the temperature of the air, like weather stations do, band B06 reports on the ground itself, which is often much hotter. Thermal band B06 is useful in providing surface temperatures and is collected with a 60-meter resolution, resampled to 30-meter.\n\n\n\nMore info [here](https://www.usgs.gov/faqs/what-are-band-designations-landsat-satellites) and [here](https://custom-scripts.sentinel-hub.com/landsat-7-etm/thermal/).`,
  },
  {
    match: [{ datasourceId: AWS_LETML1, layerId: 'THERMAL-VCID_1' }],
    legend: {
      type: 'continuous',
      minPosition: 223,
      maxPosition: 348,
      gradients: [
        { position: 223, color: '#003d99', label: '<= -50' },
        { position: 253, color: '#2e82ff', label: '-20' },
        { position: 263, color: '#80b3ff', label: '-10' },
        { position: 272, color: '#e0edff' },
        { position: 273, color: '#ffffff', label: '0' },
        { position: 274, color: '#fefce7' },
        { position: 283, color: '#FDE191', label: '10' },
        { position: 293, color: '#f69855', label: '20' },
        { position: 303, color: '#f66927', label: '30' },
        { position: 323, color: '#aa2d1d', label: '50' },
        { position: 342, color: '#650401', label: '90' },
        { position: 348, color: '#3d0200', label: '>= 100 [°C]' },
      ],
    },
    description: () =>
      t`# Thermal B06_VCID_1 Visualization\n\nThis thermal visualization is based on band B06_VCID_1 (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). At the central wavelength of 10400-12500 nm it measures in the thermal infrared, or TIR. Instead of measuring the temperature of the air, like weather stations do, B06_VCID_1 reports on the ground itself, which is often much hotter. It is useful in providing surface temperatures and is collected with a 60-meter resolution, resampled to 30-meters. As its dinamic range is wider than that of B06_VCID_2, it is less likely to oversaturate over hot areas. \n\n\n\nMore info [here](https://www.usgs.gov/faqs/why-do-landsat-7-level-1-products-contain-two-thermal-bands?qt-news_science_products=0#qt-news_science_products).`,
  },
  {
    match: [{ datasourceId: AWS_LETML1, layerId: 'THERMAL-VCID_2' }],
    legend: {
      type: 'continuous',
      minPosition: 223,
      maxPosition: 348,
      gradients: [
        { position: 223, color: '#003d99', label: '<= -50' },
        { position: 253, color: '#2e82ff', label: '-20' },
        { position: 263, color: '#80b3ff', label: '-10' },
        { position: 272, color: '#e0edff' },
        { position: 273, color: '#ffffff', label: '0' },
        { position: 274, color: '#fefce7' },
        { position: 283, color: '#FDE191', label: '10' },
        { position: 293, color: '#f69855', label: '20' },
        { position: 303, color: '#f66927', label: '30' },
        { position: 323, color: '#aa2d1d', label: '50' },
        { position: 342, color: '#650401', label: '90' },
        { position: 348, color: '#3d0200', label: '>= 100 [°C]' },
      ],
    },
    description: () =>
      t`# Thermal B06_VCID_2 Visualization\n\nThis thermal visualization is based on band B06_VCID_2 (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). At the central wavelength of 10400-12500 nm it measures in the thermal infrared, or TIR. Instead of measuring the temperature of the air, like weather stations do, B06_VCID_2 reports on the ground itself, which is often much hotter. It is useful in providing surface temperatures and is collected with a 60-meter resolution, resampled to 30-meters. Its dinamic range is narrower than that of B06_VCID_1, which means it is more likely to oversaturate over hot areas, but in turn has slightly higher radiometric sensitivity.\n\n\n\nMore info [here](https://www.usgs.gov/faqs/why-do-landsat-7-level-1-products-contain-two-thermal-bands?qt-news_science_products=0#qt-news_science_products).`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '3_NDVI' },
      { datasourceId: S2_L2A_CDAS, layerId: '3_NDVI' },
      { datasourceId: S2_L1C_CDAS, layerId: '6_NDVI' },
      { datasourceId: S2_L2A_CDAS, layerId: '6_NDVI' },
      { datasourceId: S2_L1C_CDAS, layerId: '5_NDVI' },
      { datasourceId: S2_L2A_CDAS, layerId: '5_NDVI' },
      { datasourceId: S2_L1C_CDAS, layerId: '3_NDVI' },
      { datasourceId: S2_L2A_CDAS, layerId: '3_NDVI' },
      { datasourceId: S2_L1C_CDAS, layerId: 'NORMALIZED-DIFFERENCE-VEGETATION-INDEX-NDVI' },
      { datasourceId: S2_L2A_CDAS, layerId: 'NORMALIZED-DIFFERENCE-VEGETATION-INDEX-NDVI' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -0.2,
      maxPosition: 1.1,
      gradients: [
        { position: -0.2, color: 'rgb(5%,5%,5%)', label: '- 1' },
        { position: -0.1, color: 'rgb(5%,5%,5%)', label: '- 0.5' },
        { position: -0.1, color: 'rgb(75%,75%,75%)' },
        { position: 0, color: 'rgb(75%,75%,75%)', label: '- 0.2' },
        { position: 0, color: 'rgb(86%,86%,86%)' },
        { position: 0.1, color: 'rgb(86%,86%,86%)', label: '- 0.1' },
        { position: 0.1, color: 'rgb(92%,92%,92%)' },
        { position: 0.2, color: 'rgb(92%,92%,92%)', label: ' 0' },
        { position: 0.2, color: 'rgb(100%,98%,80%)' },
        { position: 0.25, color: 'rgb(100%,98%,80%)' },
        { position: 0.25, color: 'rgb(93%,91%,71%)' },
        { position: 0.3, color: 'rgb(93%,91%,71%)' },
        { position: 0.3, color: 'rgb(87%,85%,61%)' },
        { position: 0.35, color: 'rgb(87%,85%,61%)' },
        { position: 0.35, color: 'rgb(80%,78%,51%)' },
        { position: 0.4, color: 'rgb(80%,78%,51%)' },
        { position: 0.4, color: 'rgb(74%,72%,42%)' },
        { position: 0.45, color: 'rgb(74%,72%,42%)' },
        { position: 0.45, color: 'rgb(69%,76%,38%)' },
        { position: 0.5, color: 'rgb(69%,76%,38%)' },
        { position: 0.5, color: 'rgb(64%,80%,35%)' },
        { position: 0.55, color: 'rgb(64%,80%,35%)' },
        { position: 0.55, color: 'rgb(57%,75%,32%)' },
        { position: 0.6, color: 'rgb(57%,75%,32%)', label: ' 0.2' },
        { position: 0.6, color: 'rgb(50%,70%,28%)' },
        { position: 0.65, color: 'rgb(50%,70%,28%)' },
        { position: 0.65, color: 'rgb(44%,64%,25%)' },
        { position: 0.7, color: 'rgb(44%,64%,25%)' },
        { position: 0.7, color: 'rgb(38%,59%,21%)' },
        { position: 0.75, color: 'rgb(38%,59%,21%)' },
        { position: 0.75, color: 'rgb(31%,54%,18%)' },
        { position: 0.8, color: 'rgb(31%,54%,18%)' },
        { position: 0.8, color: 'rgb(25%,49%,14%)' },
        { position: 0.85, color: 'rgb(25%,49%,14%)' },
        { position: 0.85, color: 'rgb(19%,43%,11%)' },
        { position: 0.9, color: 'rgb(19%,43%,11%)' },
        { position: 0.9, color: 'rgb(13%,38%,7%)' },
        { position: 0.95, color: 'rgb(13%,38%,7%)' },
        { position: 0.95, color: 'rgb(6%,33%,4%)' },
        { position: 1.0, color: 'rgb(6%,33%,4%)' },
        { position: 1.0, color: 'rgb(0%,27%,0%)', label: ' 0.6' },
        { position: 1.1, color: 'rgb(0%,27%,0%)', label: ' 1' },
      ],
    },
    description: () =>
      t`# Normalized Difference Vegetation Index (NDVI)\n\nThe normalized difference vegetation index is a simple, but effective index for quantifying green vegetation. It is a measure of the state of vegetation health based on how plants reflect light at certain wavelengths. The value range of the NDVI is -1 to 1. Negative values of NDVI (values approaching -1) correspond to water. Values close to zero (-0.1to 0.1) generally correspond to barren areas of rock, sand, or snow. Low, positive values represent shrub and grassland (approximately 0.2 to 0.4), while high values indicate temperate and tropical rainforests (values approaching 1).\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/ndvi/) and [here.](https://eos.com/ndvi/)`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '4_EVI' },
      { datasourceId: S2_L2A_CDAS, layerId: '4_EVI' },
    ],
    description: () =>
      t`# Enhanced Vegetation Index (EVI)\n\nThe enhanced vegetation index (EVI) is an 'optimized' vegetation index as it corrects for soil background signals and atmospheric influences. It is very useful in areas of dense canopy cover. The range of values for EVI is -1 to 1, with healthy vegetation generally around 0.20 to 0.80.\n\n\n\n\n\nMore infos [here](https://custom-scripts.sentinel-hub.com/sentinel-2/evi/) and [here.](https://earthobservatory.nasa.gov/features/MeasuringVegetation/measuring_vegetation_4.php)`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '5_ARVI', themeId: 'FORESTRY' },
      { datasourceId: S2_L2A_CDAS, layerId: '5_ARVI', themeId: 'FORESTRY' },
    ],
    description: () =>
      t`# Atmospherically Resistant Vegetation Index (ARVI)\n\nThe Atmospherically Resistant Vegetation Index (ARVI) is a vegetation index that minimizes the effects of atmospheric scattering. It is most useful for regions with high content of atmospheric aerosol (fog, dust, smoke, air pollution). The range for an ARVI is -1 to 1 where green vegetation generally falls between values of 0.20 to 0.80.\n\n\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/arvi/) and [here.](https://eos.com/blog/6-spectral-indexes-on-top-of-ndvi-to-make-your-vegetation-analysis-complete/)`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '6_SAVI', themeId: 'FORESTRY' },
      { datasourceId: S2_L2A_CDAS, layerId: '6_SAVI', themeId: 'FORESTRY' },
      { datasourceId: S2_L1C_CDAS, layerId: 'SAVI', themeId: 'AGRICULTURE' },
      { datasourceId: S2_L2A_CDAS, layerId: 'SAVI', themeId: 'AGRICULTURE' },
    ],
    description: () =>
      t`# Soil Adjusted Vegetation Index (SAVI)\n\n The Soil Adjusted Vegetation Index is similar to Normalized Difference Vegetation Index (NDVI) but is used in areas where vegetative cover is low (< 40%). The index is a transformation technique that minimizes soil brightness influences from spectral vegetation indices involving red and near-infrared (NIR) wavelengths. The index is helpful when analysing young crops, arid regions with sparse vegetation and exposed soil surfaces.\n\n\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/savi/) and [here.](https://eos.com/blog/6-spectral-indexes-on-top-of-ndvi-to-make-your-vegetation-analysis-complete/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '7_MARI' },
      { datasourceId: S2_L2A_CDAS, layerId: '7_MARI' },
    ],
    description: () =>
      t`# Modified Anthocyanin Reflectance Index (mARI/ARI2)\n\nAnthocyanins are pigments common in higher plants, causing their red, blue and purple coloration. They provide valuable information about the physiological status of plants, as they are considered indicators of various types of plant stresses. The reflectance of anthocyanin is highest around 550nm. However, the same wavelengths are reflected by chlorophyll as well. To isolate the anthocyanins, the 700nm spectral band, that reflects only chlorophyll and not anthocyanins, is subtracted.\n\nTo correct for leaf density and thickness, the near infrared spectral band (in the recommended wavelengths of 760-800nm), which is related to leaf scattering, is added to the basic ARI index. The new index is called modified ARI or mARI (also ARI2).\n\nmARI values for the examined trees in [this original article](https://custom-scripts.sentinel-hub.com/sentinel-2/mari/) ranged in values from 0 to 8.\n\n\n\n\n\nMore info [here.](https://digitalcommons.unl.edu/cgi/viewcontent.cgi?article=1227&context=natrespapers)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '4_GREEN_CITY' },
      { datasourceId: S2_L2A_CDAS, layerId: '4_GREEN-CITY' },
    ],

    description: () =>
      t`# Green City Script\n\nThe Green city script aims to raise awareness of green areas in cities around the world. The script takes into account the Normalized Difference Vegetation Index (NDVI) and true color wavelengths; it separates built up areas from vegetated ones, making it useful for detecting urban areas. Built up areas are displayed in grey and vegetation is displayed in green.\n\n\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/green_city/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '3_URBAN-CLASSIFIED' },
      { datasourceId: S2_L2A_CDAS, layerId: '3_URBAN-CLASSIFIED' },
    ],

    description: () =>
      t`# Urban Classified Script\n\nThe Urban Classified script aims to detect built up areas by separating them from barren ground, vegetation and water. Areas with a high moisture content are returned in blue; areas indicating built up areas are returned in white; vegetated areas are returned in green; everything else indicates barren ground and is displayed in brown colors.\n\n\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/urban_classified/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '5_URBAN-LAND-INFRARED-COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '5_URBAN-LAND-INFRARED-COLOR' },
    ],

    description: () =>
      t`# Urban Land Infrared Color Script\n\nThis script, made by Leo Tolari, combines true color visualization with near infrared (NIR) and shortwave infrared (SWIR) wavelengths. The script highlights urban areas better than true color, while still looking natural.\n\n\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/urban_land_infrared/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '4_MOISTURE-STRESS' },
      { datasourceId: S2_L2A_CDAS, layerId: '4_MOISTURE-STRESS' },
      { datasourceId: S2_L1C_CDAS, layerId: '9_MOISTURE-STRESS' },
      { datasourceId: S2_L2A_CDAS, layerId: '9_MOISTURE-STRESS' },
    ],

    description: () =>
      t`# NDMI for Moisture Stress\n\nThe Normalized Difference Moisture Index (NDMI) for moisture stress can be used to detect irrigation. For all the index values above 0, knowing the land use and land cover, it is possible to determine whether irrigation has taken place. Knowing the type of crop grown (e.g. citrus crops), it is possible to identify whether irrigation is being effective or not during the crucial growing summer season, as well as find out if some parts of the farm are being under or over-irrigated.\n\n\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/ndmi_special/#)`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '5-MOISTURE-INDEX1' },
      { datasourceId: S2_L2A_CDAS, layerId: '5-MOISTURE-INDEX1' },
      { datasourceId: S2_L1C_CDAS, layerId: '5-MOISTURE-INDEX1' },
      { datasourceId: S2_L2A_CDAS, layerId: '5-MOISTURE-INDEX1' },
      { datasourceId: S2_L1C_CDAS, layerId: 'MOISTURE-INDEX' },
      { datasourceId: S2_L2A_CDAS, layerId: 'MOISTURE-INDEX' },
      { datasourceId: S2_L1C_CDAS, layerId: '2_MOISTURE-INDEX' },
      { datasourceId: S2_L2A_CDAS, layerId: '2_MOISTURE-INDEX' },
      { datasourceId: S2_L1C_CDAS, layerId: '99_MOISTURE-INDEX' },
      { datasourceId: S2_L2A_CDAS, layerId: '99_MOISTURE-INDEX' },
      { datasourceId: AWS_LETML2, layerId: 'MOISTURE-INDEX' },
      { datasourceId: AWS_LETML1, layerId: 'MOISTURE-INDEX' },
      { datasourceId: AWS_HLS, layerId: '4_MOISTURE-INDEX' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -0.8,
      maxPosition: 0.8,
      gradients: [
        { position: -0.8, color: 'rgb(50%,0%,0%)', label: '< -0.8' },
        { position: -0.64, color: 'rgb(100%,0%,0%)', label: '-0.24' },
        { position: -0.32, color: 'rgb(100%,100%,0%)', label: '-0.032' },
        { position: 0, label: '0' },
        { position: 0.32, color: 'rgb(0%,100%,100%)', label: '0.032' },
        { position: 0.64, color: 'rgb(0%,0%,100%)', label: '0.24' },
        { position: 0.8, color: 'rgb(0%,0%,50%)', label: '> 0.8' },
      ],
    },
    description: () =>
      t`# Normalized Difference Moisture Index (NDMI)\n\nThe normalized difference moisture Index (NDMI) is used to determine vegetation water content and monitor droughts. The value range of the NDMI is -1 to 1. Negative values of NDMI (values approaching -1) correspond to barren soil. Values around zero (-0.2 to 0.4) generally correspond to water stress. High, positive values represent high canopy without water stress (approximately 0.4 to 1).\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/ndmi/)`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '7-NDWI' },
      { datasourceId: S2_L2A_CDAS, layerId: '7-NDWI' },
      { datasourceId: S2_L1C_CDAS, layerId: '7-NDWI' },
      { datasourceId: S2_L2A_CDAS, layerId: '7-NDWI' },
      { datasourceId: S2_L1C_CDAS, layerId: '3_NDWI' },
      { datasourceId: S2_L2A_CDAS, layerId: '3_NDWI' },
      { datasourceId: AWS_LTML1, layerId: '5_NDWI' },
      { datasourceId: AWS_LTML2, layerId: '5_NDWI' },
      { datasourceId: AWS_LETML1, layerId: 'NDWI' },
      { datasourceId: AWS_LETML2, layerId: 'NDWI' },
      { datasourceId: AWS_LMSSL1, layerId: 'NDWI' },
      { datasourceId: AWS_HLS, layerId: '6_NDWI' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -0.8,
      maxPosition: 0.8,
      gradients: [
        { position: -0.8, color: 'rgb(0%,100%,0%)', label: '< -0.8' },
        { position: 0, color: 'rgb(100%,100%,100%)', label: '0' },
        { position: 0.8, color: 'rgb(0%,0%,100%)', label: '0.8' },
      ],
    },
    description: () =>
      t`# Normalized Difference Water Index (NDWI)\n\nThe normalized difference water index is most appropriate for water body mapping. Values of water bodies are larger than 0.5. Vegetation has smaller values. Built-up features have positive values between zero and 0.2.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/ndwi/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '1_FALSE-COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '1_FALSE-COLOR' },
      { datasourceId: S2_L1C_CDAS, layerId: '2_FALSE_COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '2_FALSE_COLOR' },
      { datasourceId: S2_L1C_CDAS, layerId: '2_FALSE_COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '2_FALSE_COLOR' },
      { datasourceId: S2_L1C_CDAS, layerId: 'FALSE-COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: 'FALSE-COLOR' },
      { datasourceId: S2_L1C_CDAS, layerId: '2_FALSE-COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '2_FALSE-COLOR' },
      { datasourceId: AWS_LETML2, layerId: 'FALSE-COLOR' },
      { datasourceId: AWS_LETML1, layerId: 'FALSE-COLOR' },
      { datasourceId: S3SLSTR, layerId: 'FALSE_COLOR' },
      { datasourceId: S3SLSTR_CDAS, layerId: 'FALSE_COLOR' },
    ],

    description: () =>
      t`# False color composite\n\nA false color composite uses at least one non-visible wavelength to image Earth. The false color composite using near infrared, red and green bands is very popular (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). The false colour composite is most commonly used to assess plant density and health, since plants reflect near infrared and green light, while they absorb red. Cities and exposed ground are grey or tan, and water appears blue or black.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/false_color_infrared/) and [here.](https://earthobservatory.nasa.gov/features/FalseColor/page6.php)`,
  },

  {
    match: [{ datasourceId: AWS_LMSSL1, layerId: 'FALSE-COLOR-ULTRA-RED' }],

    description: () =>
      t`# False color composite\n\nA false color composite uses at least one non-visible wavelength to image Earth. The false color composite using near infrared, red and green bands is very popular (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). The false colour composite is most commonly used to assess plant density and health, since plants reflect near infrared and green light, while they absorb red. Cities and exposed ground are grey or tan, and water appears blue or black. In this case, the NIR band used in the red channel is Ultra Red band 3 (700 - 800 nm), which is particularly useful for distinguishing vegetation boundaries between land and water and various landforms. \n\n\n\nMore info [here](https://eos.com/find-satellite/landsat-5-mss/) and [here](https://custom-scripts.sentinel-hub.com/landsat-1-5-mss/false-color-ultrared/).`,
  },

  {
    match: [{ datasourceId: AWS_LMSSL1, layerId: 'FALSE-COLOR-NEAR-INFRARED' }],

    description: () =>
      t`# False color composite\n\nA false color composite uses at least one non-visible wavelength to image Earth. The false color composite using near infrared, red and green bands is very popular (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). The false colour composite is most commonly used to assess plant density and health, since plants reflect near infrared and green light, while they absorb red. Cities and exposed ground are grey or tan, and water appears blue or black. In this case, the NIR band used in the red channel is the NIR band 4 (800 - 1100 nm), which penetrates atmospheric haze, emphasizes vegetation, and distinguishes between land and water. \n\n\n\nMore info [here](https://eos.com/find-satellite/landsat-5-mss/) and [here](https://custom-scripts.sentinel-hub.com/landsat-1-5-mss/false-color-nir/).`,
  },

  {
    match: [
      { datasourceId: AWS_L8L1C, layerId: '3_FALSE_COLOR' },
      { datasourceId: AWS_LOTL1, layerId: '3_FALSE_COLOR' },
      { datasourceId: AWS_LOTL2, layerId: '3_FALSE_COLOR' },
    ],

    description: () =>
      t`# False color composite\n\nA false color composite uses at least one non-visible wavelength to image Earth. The false color composite using near infrared, red and green bands is very popular (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). The false colour composite is most commonly used to assess plant density and health, since plants reflect near infrared and green light, while they absorb red. Cities and exposed ground are grey or tan, and water appears blue or black.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/false_color_infrared/) and [here.](https://gisgeography.com/landsat-8-bands-combinations/)`,
  },

  {
    match: [
      { datasourceId: AWS_LTML1, layerId: '3_FALSE_COLOR' },
      { datasourceId: AWS_LTML2, layerId: '3_FALSE_COLOR' },
    ],

    description: () =>
      t`# False color composite\n\nA false color composite uses at least one non-visible wavelength to image Earth. The false color composite using near infrared, red and green bands is very popular (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). The false colour composite is most commonly used to assess plant density and health, since plants reflect near infrared and green light, while they absorb red. Cities and exposed ground are grey or tan, and water appears blue or black.\n\n\n\nMore info [here](https://earthobservatory.nasa.gov/features/FalseColor/page6.php)`,
  },

  {
    match: [{ datasourceId: ENVISAT_MERIS, layerId: 'FALSE_COLOR' }],

    description: () =>
      t`# False color composite\n\nA false color composite uses at least one non-visible wavelength to image Earth. The false color composite using near infrared, red and green bands is very popular (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). The false colour composite is most commonly used to assess plant density and health, since plants reflect near infrared and green light, while they absorb red. Cities and exposed ground are grey or tan, and water appears blue or black.\n\n\n\nMore info [here.](https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/meris/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '1_TRUE_COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '1_TRUE_COLOR' },
      { datasourceId: S2_L1C_CDAS, layerId: '1_TRUE_COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '1_TRUE_COLOR' },
      { datasourceId: S2_L1C_CDAS, layerId: 'TRUE-COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: 'TRUE-COLOR' },
      { datasourceId: S2_L1C_CDAS, layerId: '1_TRUE-COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '1_TRUE-COLOR' },
      { datasourceId: S3OLCI, layerId: '1_TRUE-COLOR' },
      { datasourceId: S3OLCI_CDAS, layerId: '1_TRUE-COLOR' },
    ],

    description: () =>
      t`# True color optimized\n\nThis optimized True color script uses the visible light bands red, green and blue in the corresponding red, green and blue color channels, resulting in a product with natural colours that represents the Earth as humans would naturally see it. The visualisation uses highlight compression and improves the contrast and color vividness through minor contrast and saturation enhancement.\n\n\n\nMore info for [L1C](https://custom-scripts.sentinel-hub.com/sentinel-2/l1c_optimized/) and for [L2A](https://custom-scripts.sentinel-hub.com/sentinel-2/l2a_optimized/).`,
  },

  {
    match: [
      { datasourceId: AWS_L8L1C, layerId: '1_TRUE_COLOR' },
      { datasourceId: AWS_L8L1C, layerId: '1_TRUE-COLOR' },
      { datasourceId: AWS_L8L1C, layerId: 'TRUE-COLOR' },
      { datasourceId: AWS_LOTL1, layerId: '1_TRUE_COLOR' },
      { datasourceId: AWS_LOTL1, layerId: '1_TRUE-COLOR' },
      { datasourceId: AWS_LOTL1, layerId: 'TRUE-COLOR' },
      { datasourceId: AWS_LOTL2, layerId: '1_TRUE_COLOR' },
      { datasourceId: AWS_LOTL2, layerId: '1_TRUE-COLOR' },
      { datasourceId: AWS_LOTL2, layerId: 'TRUE-COLOR' },
    ],

    description: () =>
      t`# True color composite\n\nSensors carried by satellites can image Earth in different regions of the electromagnetic spectrum. Each region in the spectrum is referred to as a band. Landsat 8-9 has 11 bands. True color composite uses visible light bands red, green and blue in the corresponding red, green and blue color channels, resulting in a natural colored product, that is a good representation of the Earth as humans would see it naturally.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/landsat-8/composites/) and [here.](https://landsat.gsfc.nasa.gov/landsat-8/landsat-8-bands/)`,
  },
  {
    match: [
      { datasourceId: AWS_LETML2, layerId: '1_TRUE_COLOR' },
      { datasourceId: AWS_LETML1, layerId: '1_TRUE_COLOR' },
    ],

    description: () =>
      t`# True color composite\n\nSensors carried by satellites can image Earth in different regions of the electromagnetic spectrum. Each region in the spectrum is referred to as a band. True color composite uses visible light bands red, green and blue in the corresponding red, green and blue color channels, resulting in a natural colored product, that is a good representation of the Earth as humans would see it naturally.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/landsat-7-etm/true-color//)`,
  },
  {
    match: [{ datasourceId: ENVISAT_MERIS, layerId: '1_TRUE_COLOR' }],

    description: () =>
      t`# True color composite\n\nSensors carried by satellites can image Earth in different regions of the electromagnetic spectrum Each region in the spectrum is referred to as a band. True color composite uses visible light bands red, green and blue in the corresponding red, green and blue color channels, resulting in a natural colored product, that is a good representation of the Earth as humans would see it naturally.\n\n\n\nMore info [here.](https://ladsweb.modaps.eosdis.nasa.gov/missions-and-measurements/meris/)`,
  },

  {
    match: [
      { datasourceId: S3OLCI, layerId: '1_TRUE_COLOR' },
      { datasourceId: S3OLCI_CDAS, layerId: '1_TRUE_COLOR' },
    ],

    description: () =>
      t`# True color composite\n\nSensors carried by satellites can image Earth in different regions of the electromagnetic spectrum . Each region in the spectrum is referred to as a band. True color composite uses visible light bands red, green and blue in the corresponding red, green and blue color channels, resulting in a natural colored product, that is a good representation of the Earth as humans would see it naturally.\n\n\n\nMore info [here.](https://sentinel.esa.int/web/sentinel/user-guides/sentinel-3-olci/overview/heritage)`,
  },

  {
    match: [
      { datasourceId: S3OLCI, layerId: '6_TRUE-COLOR-HIGLIGHT-OPTIMIZED' },
      { datasourceId: S3OLCI_CDAS, layerId: '6_TRUE-COLOR-HIGLIGHT-OPTIMIZED' },
    ],

    description: () =>
      t`# Enhanced True Color Visualization\n\nThis script uses highlight optimization to avoid burnt out pixels and to even out the exposure. It makes clouds look natural and keep as much visual information as possible. Sentinel-3 OLCI tiles cover large areas, making it possible to observe large cloud formations, such as hurricanes.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-3/true_color_highlight_optimized/)`,
  },

  {
    match: [
      { datasourceId: AWS_L8L1C, layerId: '2_TRUE_COLOR_PANSHARPENED' },
      { datasourceId: AWS_LOTL1, layerId: '2_TRUE_COLOR_PANSHARPENED' },
    ],

    description: () =>
      t`# Pansharpened True Color\n\nThe pansharpened true color composite is done by using the usual true color data (red, green and blue (RGB)) and enhancing them by using the panchromatic band 8, or pan band (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). An image from the pan band is similar to black-and-white film: it combines light from the red, green, and blue parts of the spectrum into a single measure of overall visible reflectance. Pansharpened images have 4x the resolution of the usual true color composite, greatly enhancing the usefulness of Landsat imagery.\n\n\n\nMore info [here](https://blog.mapbox.com/pansharpening-for-higher-resolution-in-landsat-live-e4717cd7c356) and [here.](https://landsat.gsfc.nasa.gov/landsat-8/landsat-8-bands/)`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '4-FALSE-COLOR-URBAN' },
      { datasourceId: S2_L2A_CDAS, layerId: '4-FALSE-COLOR-URBAN' },
      { datasourceId: S2_L1C_CDAS, layerId: '4-FALSE-COLOR-URBAN' },
      { datasourceId: S2_L2A_CDAS, layerId: '4-FALSE-COLOR-URBAN' },
      { datasourceId: S2_L1C_CDAS, layerId: 'FALSE-COLOR-URBAN' },
      { datasourceId: S2_L2A_CDAS, layerId: 'FALSE-COLOR-URBAN' },
      { datasourceId: S2_L1C_CDAS, layerId: '2_FALSE-COLOR-URBAN' },
      { datasourceId: S2_L2A_CDAS, layerId: '2_FALSE-COLOR-URBAN' },
      { datasourceId: AWS_LOTL2, layerId: 'FALSE-COLOR-URBAN' },
    ],

    description: () =>
      t`# False Color Urban composite\n\nThis composite is used to visualise urbanized areas more clearly. Vegetation is visible in shades of green, while urbanized areas are represented by white, grey, or purple. Soils, sand, and minerals are shown in a variety of colors. Snow and ice appear as dark blue, and water as black or blue. Flooded areas are very dark blue and almost black. The composite is useful for detecting wildfires and calderas of volcanoes, as they are displayed in shades of red and yellow.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/false-color-urban-rgb/) and [here.](https://eos.com/false-color/)`,
  },

  {
    match: [
      { datasourceId: AWS_L8L1C, layerId: 'FALSE-COLOR-LAVA-FLOW' },
      { datasourceId: AWS_LOTL1, layerId: 'FALSE-COLOR-LAVA-FLOW' },
      { datasourceId: AWS_LOTL2, layerId: 'FALSE-COLOR-LAVA-FLOW' },
    ],

    description: () =>
      t`# False Color Urban composite\n\nThis composite uses a combination of bands in visible and in short wave infrared (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). It displays vegetation in shades of green. While darker shades of green indicate denser vegetation, sparse vegetation have lighter shades. Urban areas are blue and soils have various shades of brown.\n\n\n\nMore info [here.](https://gisgeography.com/landsat-8-bands-combinations/)`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: 'FALSE-COLOR-11-8-2' },
      { datasourceId: S2_L2A_CDAS, layerId: 'FALSE-COLOR-11-8-2' },
      { datasourceId: S2_L1C_CDAS, layerId: 'FALSE-COLOR-1182' },
      { datasourceId: S2_L2A_CDAS, layerId: 'FALSE-COLOR-1182' },
      { datasourceId: S2_L1C_CDAS, layerId: '6_AGRICULTURE' },
      { datasourceId: S2_L2A_CDAS, layerId: '6_AGRICULTURE' },
    ],

    description: () =>
      t`# Agriculture composite\n\nThis composite uses short-wave infrared, near-infrared and blue bands to monitor crop health (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). Both short-wave and near infrared bands are particularly good at highlighting dense vegetation, which appears dark green in the composite. Crops appear in a vibrant green and bare earth appears magenta.\n\n\n\nMore info [here](https://earthobservatory.nasa.gov/features/FalseColor/page5.php) and [here.](https://gisgeography.com/sentinel-2-bands-combinations/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '5_SNOW-CLASSIFIER' },
      { datasourceId: S2_L2A_CDAS, layerId: '5_SNOW-CLASSIFIER' },
    ],

    description: () =>
      t`# Snow Classifier\n\nThe Snow Classifier algorithm aims to detect snow by classifying pixels based on different brightness and Normalized Difference Snow Index (NDSI) thresholds. Values classified as snow are returned in bright vivid blue. The script can overestimate snow areas over clouds.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/snow_classifier/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '4_ULYSSYS-WATER-QUALITY-VIEWER' },
      { datasourceId: S2_L2A_CDAS, layerId: '4_ULYSSYS-WATER-QUALITY-VIEWER' },
    ],

    description: () =>
      t`# Ulyssys Water Quality Viewer (UWQV)\n\nThe script aims to dynamically visualise the chlorophyll and sediment conditions of water bodies, which are primary indicators of water quality. The chlorophyll content ranges in colors from dark blue (low chlorophyll content) through green to red (high chlorophyll content). Sediment concentrations are colored brown; opaque brown indicates high sediment content.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/ulyssys_water_quality_viewer/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '6-SWIR' },
      { datasourceId: S2_L2A_CDAS, layerId: '6-SWIR' },
      { datasourceId: S2_L1C_CDAS, layerId: '6-SWIR' },
      { datasourceId: S2_L2A_CDAS, layerId: '6-SWIR' },
      { datasourceId: S2_L1C_CDAS, layerId: '5_SWIR' },
      { datasourceId: S2_L2A_CDAS, layerId: '5_SWIR' },
      { datasourceId: S2_L1C_CDAS, layerId: 'SWIR' },
      { datasourceId: S2_L2A_CDAS, layerId: 'SWIR' },
      { datasourceId: AWS_HLS, layerId: '5_SWIR' },
    ],
    description: () =>
      t`# Short wave infrared composite (SWIR)\n\nShort wave infrared (SWIR) measurements can help scientists estimate how much water is present in plants and soil, as water absorbs SWIR wavelengths. Short wave infrared bands (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands) are also useful for distinguishing between cloud types (water clouds versus ice clouds), snow and ice, all of which appear white in visible light. In this composite vegetation appears in shades of green, soils and built-up areas are in various shades of brown, and water appears black. Newly burned land reflects strongly in SWIR bands, making them valuable for mapping fire damages. Each rock type reflects shortwave infrared light differently, making it possible to map out geology by comparing reflected SWIR light.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/swir-rgb/)`,
  },

  {
    match: [
      { datasourceId: AWS_LETML2, layerId: 'SWIR' },
      { datasourceId: AWS_LETML1, layerId: 'SWIR' },
    ],
    description: () =>
      t`# Short wave infrared composite (SWIR)\n\nShort wave infrared (SWIR) measurements can help scientists estimate how much water is present in plants and soil, as water absorbs SWIR wavelengths. Short wave infrared bands (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands) are also useful for distinguishing between cloud types (water clouds versus ice clouds), snow and ice, all of which appear white in visible light. In this composite vegetation appears in shades of green, soils and built-up areas are in various shades of brown, and water appears black. Newly burned land reflects strongly in SWIR bands, making them valuable for mapping fire damages. Each rock type reflects shortwave infrared light differently, making it possible to map out geology by comparing reflected SWIR light.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/landsat-4-5-tm/swir/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '8-NDSI' },
      { datasourceId: S2_L2A_CDAS, layerId: '8-NDSI' },
      { datasourceId: S2_L1C_CDAS, layerId: '8-NDSI' },
      { datasourceId: S2_L2A_CDAS, layerId: '8-NDSI' },
      { datasourceId: S2_L1C_CDAS, layerId: '4_NDSI' },
      { datasourceId: S2_L2A_CDAS, layerId: '4_NDSI' },
    ],
    description: () =>
      t`# Normalised Difference Snow Index (NDSI)\n\nThe Sentinel-2 normalised difference snow index can be used to differentiate between cloud and snow cover as snow absorbs in the short-wave infrared light, but reflects the visible light, whereas cloud is generally reflective in both wavelengths. Snow cover is represented in bright vivid blue.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/ndsi-visualized/).`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '3_TONEMAPPED-NATURAL-COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '3_TONEMAPPED-NATURAL-COLOR' },
      { datasourceId: S2_L1C_CDAS, layerId: '2_HIGHLIGHT-OPTIMIZED-NATURAL-COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '2_HIGHLIGHT-OPTIMIZED-NATURAL-COLOR' },
      { datasourceId: S2_L1C_CDAS, layerId: '2_TONEMAPPED_NATURAL_COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '2_TONEMAPPED_NATURAL_COLOR' },
      { datasourceId: S2_L1C_CDAS, layerId: '2_TONEMAPPED_NATURAL_COLOR' },
      { datasourceId: S2_L2A_CDAS, layerId: '2_TONEMAPPED_NATURAL_COLOR' },
      { datasourceId: AWS_LETML1, layerId: '2_TONEMAPPED_NATURAL_COLOR' },
      { datasourceId: AWS_LETML2, layerId: '2_TONEMAPPED_NATURAL_COLOR' },
      { datasourceId: AWS_LOTL1, layerId: '2_TONEMAPPED_NATURAL_COLOR' },
      { datasourceId: AWS_LOTL2, layerId: '2_TONEMAPPED_NATURAL_COLOR' },
    ],

    description: () =>
      t`# Highlight Optimized Natural Color\n\nThis script aims to display the Earth in beautiful natural color images. It uses highlight optimization to avoid burnt out pixels and to even out the exposure.\n\n\n\nMore info [here.](https://sentinel-hub.github.io/custom-scripts/sentinel-2/highlight_optimized_natural_color/#)`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '3_GEOLOGY-12-8-2' },
      { datasourceId: S2_L2A_CDAS, layerId: '3_GEOLOGY-12-8-2' },
    ],

    description: () =>
      t`# Geology 12, 8, 2 composite\n\nThis composite uses short-wave infrared (SWIR) band 12 to differentiate among different rock types (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). Each rock and mineral type reflects short-wave infrared light differently, making it possible to map out geology by comparing reflected SWIR light. Near infrared (NIR) band 8 highlights vegetation and band 2 detects moisture, both contributing to differentiation of ground materials. The composite is useful for finding geological formations and features (e.g. faults, fractures), lithology (e.g. granite, basalt, etc.) and mining applications.\n\n\n\nMore info [here.](https://www.euspaceimaging.com/wp-content/uploads/2018/06/EUSI-SWIR.pdf)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: '4_GEOLOGY-8-11-12' },
      { datasourceId: S2_L2A_CDAS, layerId: '4_GEOLOGY-8-11-12' },
    ],

    description: () =>
      t`# Geology 8, 11, 12 composite\n\nThis composite uses both short-wave infrared (SWIR) bands 11 and 12 to differentiate among different rock types (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). Each rock and mineral type reflects shortwave infrared light differently, making it possible to map out geology by comparing reflected SWIR light. Near Infrared (NIR) band 8 highlights vegetation, contributing to differentiation of ground materials. Vegetation in the composite appears red. The composite is useful for differentiating vegetation, and land especially geologic features that can be useful for mining and mineral exploration.\n\n\n\nMore info [here](https://earthobservatory.nasa.gov/features/FalseColor/page5.php) and [here.](http://murphygeological.com/new---sentinel-2.html#)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: 'WILDFIRES-PIERRE-MARKUSE' },
      { datasourceId: S2_L2A_CDAS, layerId: 'WILDFIRES-PIERRE-MARKUSE' },
      { datasourceId: S2_L1C_CDAS, layerId: 'WILDFIRES' },
      { datasourceId: S2_L2A_CDAS, layerId: 'WILDFIRES' },
      { datasourceId: S2_L1C_CDAS, layerId: 'WILDFIRES-NORMAL-MODE' },
      { datasourceId: S2_L2A_CDAS, layerId: 'WILDFIRES-NORMAL-MODE' },
    ],

    description: () =>
      t`# Wildfires\n\nThis script, created by Pierre Markuse, visualizes wildfires using Sentinel-2 data. It combines natural color background with some NIR/SWIR data for smoke penetration and more detail, while adding highlights from B11 and B12 to show fires in red and orange colors.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/markuse_fire/)`,
  },

  {
    match: [
      { datasourceId: S3OLCI, layerId: '1_TRUE_COLOR_ENHANCED' },
      { datasourceId: S3OLCI, layerId: '2_ENHANCED-TRUE-COLOR' },
      { datasourceId: S3OLCI_CDAS, layerId: '1_TRUE_COLOR_ENHANCED' },
      { datasourceId: S3OLCI_CDAS, layerId: '2_ENHANCED-TRUE-COLOR' },
    ],

    description: () =>
      t`# Enhanced True Color\n\nThis script, created by Pierre Markuse, uses multiple bands (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands) and saturation and brightness control to enhance the true color visualization.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-3/enhanced_true_color-2/#)`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: 'BURN-AREA-INDEX-BAI' },
      { datasourceId: S2_L2A_CDAS, layerId: 'BURN-AREA-INDEX-BAI' },
      { datasourceId: S2_L1C_CDAS, layerId: 'BURN-AREA-INDEX' },
      { datasourceId: S2_L2A_CDAS, layerId: 'BURN-AREA-INDEX' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -1,
      maxPosition: 6,
      gradients: [
        { position: 0, color: 'rgb(100%,100%,100%)', label: '-1' },
        { position: 25, color: 'rgb(100%,52.73%,0%)', label: '' },
        { position: 50, color: 'rgb(100%,43.36%,0%)', label: '' },
        { position: 75, color: 'rgb(68.36%,0%,0%)', label: '' },
        { position: 100, color: 'rgb(0%,0%,0%)', label: '6' },
      ],
    },
    description: () =>
      t`# Burned Area Index\n\nBurned Area Index takes advantage of the wider spectrum of Visible, Red-Edge, NIR and SWIR bands.\n\nValues description:()=> The range of values for the index is \`-1\` to \`1\` for burn scars, and \`1\` - \`6\` for active fires. Different fire intensities may result in different thresholds; the current values were calibrated, as per original author, on mostly Mediterranen regions.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/bais2/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: 'NORMALIZED-BURN-RATIO-NBR' },
      { datasourceId: S2_L2A_CDAS, layerId: 'NORMALIZED-BURN-RATIO-NBR' },
      { datasourceId: S2_L1C_CDAS, layerId: 'NORMALIZED-BURN-RATIO' },
      { datasourceId: S2_L2A_CDAS, layerId: 'NORMALIZED-BURN-RATIO' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -1,
      maxPosition: 1,
      gradients: [
        { position: 0, color: 'rgb(100%,100%,100%)', label: '-1' },
        { position: 25, color: 'rgb(100%,52.73%,0%)', label: '' },
        { position: 50, color: 'rgb(100%,43.36%,0%)', label: '' },
        { position: 75, color: 'rgb(68.36%,0%,0%)', label: '' },
        { position: 100, color: 'rgb(0%,0%,0%)', label: '1' },
      ],
    },
    description: () =>
      t`# Normalized Burn Ratio (NBR)\n\nNormalized Burn Ratio is frequently used to estimate burn severity. It uses near-infrared (NIR) and shortwave-infrared (SWIR) wavelengths. Healthy vegetation has a high reflectance in the near-infrared portion of the spectrum, and a low short-wave infrared reflectance. On the other hand, burned areas have a high shortwave infrared reflectance but low reflectance in the near infrared Darker pixels indicate burned areas.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/nbr/).`,
  },
  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: 'ATMOSPHERIC-PENETRATION' },
      { datasourceId: S2_L2A_CDAS, layerId: 'ATMOSPHERIC-PENETRATION' },
    ],

    description: () =>
      t`# Atmospheric penetration\n\nThis composite uses different bands (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands) in the non-visible part of the electromagnetic spectrum to reduce the influence of the atmosphere in the image. Short wave infrared bands 11 and 12 are highly reflected by the heated areas, making them useful for fire and burned area mapping. Near infrared band 8, is on contrary, highly reflected by vegetation, which signifies absence of fire. Vegetation appears blue, displaying details related to the vegetation vigor. Healthy vegetation is shown in light blue while the stressed, sparse or/and arid vegetation appears in dull blue. Urban features are white, grey, cyan or purple.\n\n\n\nMore info [here.](https://eos.com/atmospheric-penetration/)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: 'BARREN-SOIL' },
      { datasourceId: S2_L2A_CDAS, layerId: 'BARREN-SOIL' },
      { datasourceId: S2_L1C_CDAS, layerId: '8_BARREN-SOIL' },
      { datasourceId: S2_L2A_CDAS, layerId: '8_BARREN-SOIL' },
    ],

    description: () =>
      t`# Barren Soil Visualization\n\nThe Barren Soil Visualization can be useful for soil mapping, to investigate the location of landslides or the extent of erosion in non-vegetated areas. This visualization shows all vegetation in green and the barren ground in red. Water appears black.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/barren_soil/) and [here.](https://medium.com/sentinel-hub/create-useful-and-beautiful-satellite-images-with-custom-scripts-8ef0e6a474c6)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: 'TRUE-COLOR-LAVA-FLOW' },
      { datasourceId: S2_L2A_CDAS, layerId: 'TRUE-COLOR-LAVA-FLOW' },
    ],

    description: () =>
      t`# True Color with IR Highlights composite\n\nThis composite enhances the true color visualization by adding the shortwave infrared wavelengths to amplify details. It displays heated areas in red/orange.\n\n\n\nMore info [here.](https://medium.com/sentinel-hub/active-volcanoes-as-seen-from-space-9d1de0133733)`,
  },

  {
    match: [
      { datasourceId: S2_L1C_CDAS, layerId: 'BURNED-AREAS-DETECTION' },
      { datasourceId: S2_L2A_CDAS, layerId: 'BURNED-AREAS-DETECTION' },
    ],

    description: () =>
      t`# Detection of Burned Areas\n\nThis script is used to detect large scale recently burned areas. Pixels colored red highlight burned areas, and all other pixels are returned in true color. The script sometimes overestimates burned areas over water and clouds.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-2/burned_area_ms/)`,
  },

  {
    match: [
      {
        datasourceId: S2_L2A_CDAS,
        layerId: 'SCENE-CLASSIFICATION',
        timeFrom: moment('2022-01-25').utc().startOf('day'),
      },
      {
        datasourceId: S2_L2A_CDAS,
        layerId: 'SCENE-CLASSIFICATION',
        timeFrom: moment('2022-01-25').utc().startOf('day'),
      },
    ],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#000000',
          label: 'No Data (Missing data)',
        },
        {
          color: '#ff0000',
          label: 'Saturated or defective pixel',
        },
        {
          color: '#2f2f2f',
          label: 'Topographic cast shadows',
        },
        {
          color: '#643200',
          label: 'Cloud shadows',
        },
        {
          color: '#00a000',
          label: 'Vegetation',
        },
        {
          color: '#ffe65a',
          label: 'Not-vegetated',
        },
        {
          color: '#0000ff',
          label: 'Water',
        },
        {
          color: '#808080',
          label: 'Unclassified',
        },
        {
          color: '#c0c0c0',
          label: 'Cloud medium probability',
        },
        {
          color: '#ffffff',
          label: 'Cloud high probability',
        },
        {
          color: '#64c8ff',
          label: 'Thin cirrus',
        },
        {
          color: '#ff96ff',
          label: 'Snow or ice',
        },
      ],
    },
    description: () =>
      t`# Scene classification\n\n\n\nScene classification was developed to distinguish between cloudy pixels, clear pixels and water pixels of Sentinel-2 data and is a result of ESA's Scene classification algorithm. Twelve different classifications are provided including classes of clouds, vegetation, soils/desert, water and snow. It does not constitute a land cover classification map in a strict sense.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/scene-classification/).`,
  },

  {
    match: [
      {
        datasourceId: S2_L2A_CDAS,
        layerId: 'SCENE-CLASSIFICATION',
        timeTo: moment('2022-01-24').utc().endOf('day'),
      },
      {
        datasourceId: S2_L2A_CDAS,
        layerId: 'SCENE-CLASSIFICATION',
        timeTo: moment('2022-01-24').utc().endOf('day'),
      },
    ],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#000000',
          label: 'No Data (Missing data)',
        },
        {
          color: '#ff0000',
          label: 'Saturated or defective pixel',
        },
        {
          color: '#2f2f2f',
          label: 'Dark features / Shadows ',
        },
        {
          color: '#643200',
          label: 'Cloud shadows',
        },
        {
          color: '#00a000',
          label: 'Vegetation',
        },
        {
          color: '#ffe65a',
          label: 'Not-vegetated',
        },
        {
          color: '#0000ff',
          label: 'Water',
        },
        {
          color: '#808080',
          label: 'Unclassified',
        },
        {
          color: '#c0c0c0',
          label: 'Cloud medium probability',
        },
        {
          color: '#ffffff',
          label: 'Cloud high probability',
        },
        {
          color: '#64c8ff',
          label: 'Thin cirrus',
        },
        {
          color: '#ff96ff',
          label: 'Snow or ice',
        },
      ],
    },
    description: () =>
      t`# Scene classification\n\n\n\nScene classification was developed to distinguish between cloudy pixels, clear pixels and water pixels of Sentinel-2 data and is a result of ESA's Scene classification algorithm. Twelve different classifications are provided including classes of clouds, vegetation, soils/desert, water and snow. It does not constitute a land cover classification map in a strict sense.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/scene-classification/).`,
  },

  {
    match: [
      { datasourceId: S3OLCI, layerId: '2_OTCI' },
      { datasourceId: S3OLCI, layerId: '3_OTCI' },
      { datasourceId: S3OLCI_CDAS, layerId: '2_OTCI' },
      { datasourceId: S3OLCI_CDAS, layerId: '3_OTCI' },
    ],
    legend: {
      type: 'continuous',
      gradients: [
        {
          color: '#00007f',
          label: '<= 0',
          position: 0,
        },
        {
          color: '#004ccc',
          label: '1',
          position: 1,
        },
        {
          color: '#ff3333',
          label: '1.8',
          position: 1.8,
        },
        {
          color: '#ffe500',
          label: '2.5',
          position: 2.5,
        },
        {
          color: '#00cc19',
          label: '4',
          position: 4,
        },
        {
          color: '#009933',
          label: '4.5',
          position: 4.5,
        },
        {
          color: '#ffffff',
          label: '5',
          position: 5,
        },
      ],
      maxPosition: 5,
      minPosition: 0,
    },
    description: () =>
      t`# Terrestrial Chlorophyll Index (OTCI)\n\n\n\nThe Terrestrial Chlorophyll Index (OTCI) is estimated based on the chlorophyll content in terrestrial vegetation and can be used to monitor vegetation condition and health. Low OTCI values usually signify water, sand or snow. Extremely high values, displayed with white, usually suggest the absence of chlorophyll as well. They generally represent either bare ground, rock or clouds. The chlorophyll values in between range from red (low chlorophyll values) to dark green (high chlorophyll values) can be used to determine vegetation health.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-3/otci/)`,
  },

  {
    match: [{ datasourceId: COPERNICUS_GLOBAL_LAND_COVER, layerId: 'DISCRETE-CLASSIFICATION-MAP' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#282828',
          label: 'No input data',
        },
        {
          color: '#ffbb22',
          label: 'Shrubs',
        },
        {
          color: '#ffff4c',
          label: 'Herbaceous\nvegetation',
        },
        {
          color: '#f096ff',
          label: 'Cropland',
        },
        {
          color: '#fa0000',
          label: 'Urban built up',
        },
        {
          color: '#b4b4b4',
          label: 'Bare sparse\nvegetation',
        },
        {
          color: '#f0f0f0',
          label: 'Snow and Ice',
        },
        {
          color: '#0032c8',
          label: 'Permanent\nwater bodies',
        },
        {
          color: '#0096a0',
          label: 'Herbaceous\nwetland',
        },
        {
          color: '#fae6a0',
          label: 'Moss and lichen',
        },
        {
          color: '#58481f',
          label: 'Closed forest,\nevergreen needle leaf',
        },
        {
          color: '#009900',
          label: 'Closed forest,\nevergreen, broad leaf',
        },
        {
          color: '#70663e',
          label: 'Closed forest,\ndeciduous needle leaf',
        },
        {
          color: '#00cc00',
          label: 'Closed forest,\ndeciduous broad leaf',
        },
        {
          color: '#4e751f',
          label: 'Closed forest,\nmixed',
        },
        {
          color: '#007800',
          label: 'Closed forest,\nunknown',
        },
        {
          color: '#666000',
          label: 'Open forest,\nevergreen needle leafs',
        },
        {
          color: '#8db400',
          label: 'Open forest,\nevergreen broad leaf',
        },
        {
          color: '#8d7400',
          label: 'Open forest,\ndeciduous needle leaf',
        },
        {
          color: '#a0dc00',
          label: 'Open forest,\ndeciduous broad leaf',
        },
        {
          color: '#929900',
          label: 'Open forest,\nmixed',
        },
        {
          color: '#648c00',
          label: 'Open forest,\nunknown',
        },
        {
          color: '#000080',
          label: 'Open sea',
        },
      ],
    },
    description: () =>
      t`# Discrete Classification Map\n\n\n\nThis layer visualises Global Land Cover discrete classification map with 23 classes defined using the UN-FAO Land Cover Classification System (LCCS) and with color scheme defined in the Product User Manual. Map [here.](https://land.copernicus.eu/global/sites/cgls.vito.be/files/products/CGLOPS1_PUM_LC100m-V3_I3.3.pdf)`,
  },

  {
    match: [{ datasourceId: COPERNICUS_GLOBAL_LAND_COVER, layerId: 'FOREST-TYPE' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#ffffff',
          label: 'Not a forest',
        },
        {
          color: '#58481f',
          label: 'Evergreen niddle leaf',
        },
        {
          color: '#009900',
          label: 'Evergreen broad leaf',
        },
        {
          color: '#70663e',
          label: 'Deciduous needle leaf',
        },
        {
          color: '#00cc00',
          label: 'Deciduous broad leaf',
        },
        {
          color: '#4e751f',
          label: 'Mix of forest type ',
        },
      ],
    },
    description: () =>
      t`# Forest Types\n\n\n\nVisualized forest types based on 6 classes, as defined in the UN-FAO Land Cover Classification System (LCCS). More [here.](https://land.copernicus.eu/global/sites/cgls.vito.be/files/products/CGLOPS1_PUM_LC100m-V3_I3.3.pdf).`,
  },

  {
    match: [{ datasourceId: COPERNICUS_CORINE_LAND_COVER, layerId: '1_CORINE-LAND-COVER' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#e6004d',
          label: 'Continuous\nurban fabric',
        },
        {
          color: '#ff0000',
          label: 'Discontinuous\nurban fabric',
        },
        {
          color: '#cc4df2',
          label: 'Industrial or\ncommercial units',
        },
        {
          color: '#cc0000',
          label: 'Road and rail\nnetworks',
        },
        {
          color: '#e6cccc',
          label: 'Port areas',
        },
        {
          color: '#e6cce6',
          label: 'Airports',
        },
        {
          color: '#a600cc',
          label: 'Mineral\nextraction sites',
        },
        {
          color: '#a64d00',
          label: 'Dump sites',
        },
        {
          color: '#ff4dff',
          label: 'Construction\nsites',
        },
        {
          color: '#ffa6ff',
          label: 'Green urban\nareas',
        },
        {
          color: '#ffe6ff',
          label: 'Sport and leisure\nfacilities',
        },
        {
          color: '#ffffa8',
          label: 'Non-irrigated\narable land',
        },
        {
          color: '#ffff00',
          label: 'Permanently\nirrigated land',
        },
        {
          color: '#e6e600',
          label: 'Rice fields',
        },
        {
          color: '#e68000',
          label: 'Vineyards',
        },
        {
          color: '#f2a64d',
          label: 'Fruit trees and\nberry plantations',
        },
        {
          color: '#e6a600',
          label: 'Olive groves',
        },
        {
          color: '#e6e64d',
          label: 'Pastures',
        },
        {
          color: '#ffe6a6',
          label: 'Annual crops\nassociated with\npermanent crops',
        },
        {
          color: '#ffe64d',
          label: 'Complex cultivation\npatterns',
        },
        {
          color: '#e6cc4d',
          label: 'Land principally\noccupied by\nagriculture with\n significant areas\nof natural vegetation',
        },
        {
          color: '#f2cca6',
          label: 'Agro-forestry\nareas',
        },
        {
          color: '#80ff00',
          label: 'Broad-leaved\nforest',
        },
        {
          color: '#00a600',
          label: 'Coniferous\nforest',
        },
        {
          color: '#4dff00',
          label: 'Mixed forest',
        },
        {
          color: '#ccf24d',
          label: 'Natural\ngrasslands',
        },
        {
          color: '#a6ff80',
          label: 'Moors and\nheathland',
        },
        {
          color: '#a6e64d',
          label: 'Sclerophyllous\nvegetation',
        },
        {
          color: '#a6f200',
          label: 'Transitional\nwoodland-shrub',
        },
        {
          color: '#e6e6e6',
          label: 'Beaches, dunes\nand sands',
        },
        {
          color: '#cccccc',
          label: 'Bare rocks',
        },
        {
          color: '#ccffcc',
          label: 'Sparsely\nvegetated areas',
        },
        {
          color: '#000000',
          label: 'Burnt areas',
        },
        {
          color: '#a6e6cc',
          label: 'Glaciers and\nperpetual snow',
        },
        {
          color: '#a6a6ff',
          label: 'Inland marshes',
        },
        {
          color: '#4d4dff',
          label: 'Peat bogs',
        },
        {
          color: '#ccccff',
          label: 'Salt marshes',
        },
        {
          color: '#e6e6ff',
          label: 'Salines',
        },
        {
          color: '#a6a6e6',
          label: 'Intertidal\nflats',
        },
        {
          color: '#00ccf2',
          label: 'Water courses',
        },
        {
          color: '#80f2e6',
          label: 'Water bodies',
        },
        {
          color: '#00ffa6',
          label: 'Coastal lagoons',
        },
        {
          color: '#a6ffe6',
          label: 'Estuaries',
        },
        {
          color: '#e6f2ff',
          label: 'Sea and ocean',
        },
        {
          color: '#ffffff',
          label: 'No data',
        },
      ],
    },
    description: () =>
      t`# Corine Land Cover (CLC)\n\n\n\nIn this Corine Land Cover layer, all 44 classes are shown. Learn about each class [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/docs/pdf/CLC2018_Nomenclature_illustrated_guide_20190510.pdf) and see the evalscript [here](https://custom-scripts.sentinel-hub.com/copernicus_services/corine_land_cover/).`,
  },

  {
    match: [{ datasourceId: COPERNICUS_CORINE_LAND_COVER, layerId: '2_ARTIFICIAL-SURFACES' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#e6004d',
          label: 'Continuous\nurban fabric',
        },
        {
          color: '#ff0000',
          label: 'Discontinuous\nurban fabric',
        },
        {
          color: '#cc4df2',
          label: 'Industrial or\ncommercial units',
        },
        {
          color: '#cc0000',
          label: 'Road and rail\nnetworks',
        },
        {
          color: '#e6cccc',
          label: 'Port areas',
        },
        {
          color: '#e6cce6',
          label: 'Airports',
        },
        {
          color: '#a600cc',
          label: 'Mineral\nextraction sites',
        },
        {
          color: '#a64d00',
          label: 'Dump sites',
        },
        {
          color: '#ff4dff',
          label: 'Construction\nsites',
        },
        {
          color: '#ffa6ff',
          label: 'Green urban\nareas',
        },
        {
          color: '#ffe6ff',
          label: 'Sport and leisure\nfacilities',
        },
      ],
    },
    description: () =>
      t`# Corine Land Cover (CLC) - Artificial Surfaces\n\n\n\nIn this Corine Land Cover layer, only the 11 artificial surface classes are shown, based on the classification [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/html). Learn about each class [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/docs/pdf/CLC2018_Nomenclature_illustrated_guide_20190510.pdf) and see the evalscript with all the classes [here](https://custom-scripts.sentinel-hub.com/copernicus_services/corine_land_cover/).`,
  },

  {
    match: [{ datasourceId: COPERNICUS_CORINE_LAND_COVER, layerId: '3_AGRICULTURAL-AREAS' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#ffffa8',
          label: 'Non-irrigated\narable land',
        },
        {
          color: '#ffff00',
          label: 'Permanently\nirrigated land',
        },
        {
          color: '#e6e600',
          label: 'Rice fields',
        },
        {
          color: '#e68000',
          label: 'Vineyards',
        },
        {
          color: '#f2a64d',
          label: 'Fruit trees and\nberry plantations',
        },
        {
          color: '#e6a600',
          label: 'Olive groves',
        },
        {
          color: '#e6e64d',
          label: 'Pastures',
        },
        {
          color: '#ffe6a6',
          label: 'Annual crops\nassociated with\npermanent crops',
        },
        {
          color: '#ffe64d',
          label: 'Complex cultivation\npatterns',
        },
        {
          color: '#e6cc4d',
          label: 'Land principally\noccupied by\nagriculture with\n significant areas\nof natural vegetation',
        },
        {
          color: '#f2cca6',
          label: 'Agro-forestry\nareas',
        },
      ],
    },
    description: () =>
      t`# Corine Land Cover (CLC) - Agricultural Areas\n\n\n\nIn this Corine Land Cover layer, only the 11 agricultural classes are shown, based on the classification [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/html). Learn about each class [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/docs/pdf/CLC2018_Nomenclature_illustrated_guide_20190510.pdf) and see the evalscript with all the classes [here](https://custom-scripts.sentinel-hub.com/copernicus_services/corine_land_cover/).`,
  },

  {
    match: [{ datasourceId: COPERNICUS_CORINE_LAND_COVER, layerId: '4_FOREST-AND-SEMINATURAL-AREAS' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#80ff00',
          label: 'Broad-leaved\nforest',
        },
        {
          color: '#00a600',
          label: 'Coniferous\nforest',
        },
        {
          color: '#4dff00',
          label: 'Mixed forest',
        },
        {
          color: '#ccf24d',
          label: 'Natural\ngrasslands',
        },
        {
          color: '#a6ff80',
          label: 'Moors and\nheathland',
        },
        {
          color: '#a6e64d',
          label: 'Sclerophyllous\nvegetation',
        },
        {
          color: '#a6f200',
          label: 'Transitional\nwoodland-shrub',
        },
        {
          color: '#e6e6e6',
          label: 'Beaches, dunes\nand sands',
        },
        {
          color: '#cccccc',
          label: 'Bare rocks',
        },
        {
          color: '#ccffcc',
          label: 'Sparsely\nvegetated areas',
        },
        {
          color: '#000000',
          label: 'Burnt areas',
        },
        {
          color: '#a6e6cc',
          label: 'Glaciers and\nperpetual snow',
        },
      ],
    },
    description: () =>
      t`# Corine Land Cover (CLC) - Forest and Seminatural Areas\n\n\n\nIn this Corine Land Cover layer, only the 12 Forest and Seminatural Area classes are shown, based on the classification [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/html). Learn about each class [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/docs/pdf/CLC2018_Nomenclature_illustrated_guide_20190510.pdf) and see the evalscript with all the classes [here](https://custom-scripts.sentinel-hub.com/copernicus_services/corine_land_cover/).`,
  },

  {
    match: [{ datasourceId: COPERNICUS_CORINE_LAND_COVER, layerId: '5_WETLANDS' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#a6a6ff',
          label: 'Inland marshes',
        },
        {
          color: '#4d4dff',
          label: 'Peat bogs',
        },
        {
          color: '#ccccff',
          label: 'Salt marshes',
        },
        {
          color: '#e6e6ff',
          label: 'Salines',
        },
        {
          color: '#a6a6e6',
          label: 'Intertidal\nflats',
        },
      ],
    },
    description: () =>
      t`# Corine Land Cover (CLC) - Wetlands\n\n\n\nIn this Corine Land Cover layer, only the 5 Wetland classes are shown, based on the classification [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/html). 
      Learn about each class [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/docs/pdf/CLC2018_Nomenclature_illustrated_guide_20190510.pdf) and see the evalscript with all the classes [here](https://custom-scripts.sentinel-hub.com/copernicus_services/corine_land_cover/).`,
  },

  {
    match: [{ datasourceId: COPERNICUS_CORINE_LAND_COVER, layerId: '6_WATER-BODIES' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#00ccf2',
          label: 'Water courses',
        },
        {
          color: '#80f2e6',
          label: 'Water bodies',
        },
        {
          color: '#00ffa6',
          label: 'Coastal lagoons',
        },
        {
          color: '#a6ffe6',
          label: 'Estuaries',
        },
        {
          color: '#e6f2ff',
          label: 'Sea and ocean',
        },
        {
          color: '#ffffff',
          label: 'No data',
        },
      ],
    },
    description: () =>
      t`# Corine Land Cover (CLC) - Water Bodies\n\n\n\nIn this Corine Land Cover layer, only the 6 Water body classes are shown, based on the classification [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/html). Learn about each class [here](https://land.copernicus.eu/user-corner/technical-library/corine-land-cover-nomenclature-guidelines/docs/pdf/CLC2018_Nomenclature_illustrated_guide_20190510.pdf) and see the evalscript with all the classes [here](https://custom-scripts.sentinel-hub.com/copernicus_services/corine_land_cover/).`,
  },

  {
    match: [{ datasourceId: COPERNICUS_CLC_ACCOUNTING, layerId: 'ACCOUNTING-LAYERS-VISUALIZATION' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#e6004d',
          label: 'Continuous\nurban fabric',
        },
        {
          color: '#ff0000',
          label: 'Discontinuous\nurban fabric',
        },
        {
          color: '#cc4df2',
          label: 'Industrial or\ncommercial units',
        },
        {
          color: '#cc0000',
          label: 'Road and rail\nnetworks',
        },
        {
          color: '#e6cccc',
          label: 'Port areas',
        },
        {
          color: '#e6cce6',
          label: 'Airports',
        },
        {
          color: '#a600cc',
          label: 'Mineral\nextraction sites',
        },
        {
          color: '#a64d00',
          label: 'Dump sites',
        },
        {
          color: '#ff4dff',
          label: 'Construction\nsites',
        },
        {
          color: '#ffa6ff',
          label: 'Green urban\nareas',
        },
        {
          color: '#ffe6ff',
          label: 'Sport and leisure\nfacilities',
        },
        {
          color: '#ffffa8',
          label: 'Non-irrigated\narable land',
        },
        {
          color: '#ffff00',
          label: 'Permanently\nirrigated land',
        },
        {
          color: '#e6e600',
          label: 'Rice fields',
        },
        {
          color: '#e68000',
          label: 'Vineyards',
        },
        {
          color: '#f2a64d',
          label: 'Fruit trees and\nberry plantations',
        },
        {
          color: '#e6a600',
          label: 'Olive groves',
        },
        {
          color: '#e6e64d',
          label: 'Pastures',
        },
        {
          color: '#ffe6a6',
          label: 'Annual crops\nassociated with\npermanent crops',
        },
        {
          color: '#ffe64d',
          label: 'Complex cultivation\npatterns',
        },
        {
          color: '#e6cc4d',
          label: 'Land principally\noccupied by\nagriculture with\n significant areas\nof natural vegetation',
        },
        {
          color: '#f2cca6',
          label: 'Agro-forestry\nareas',
        },
        {
          color: '#80ff00',
          label: 'Broad-leaved\nforest',
        },
        {
          color: '#00a600',
          label: 'Coniferous\nforest',
        },
        {
          color: '#4dff00',
          label: 'Mixed forest',
        },
        {
          color: '#ccf24d',
          label: 'Natural\ngrasslands',
        },
        {
          color: '#a6ff80',
          label: 'Moors and\nheathland',
        },
        {
          color: '#a6e64d',
          label: 'Sclerophyllous\nvegetation',
        },
        {
          color: '#a6f200',
          label: 'Transitional\nwoodland-shrub',
        },
        {
          color: '#e6e6e6',
          label: 'Beaches, dunes\nand sands',
        },
        {
          color: '#cccccc',
          label: 'Bare rocks',
        },
        {
          color: '#ccffcc',
          label: 'Sparsely\nvegetated areas',
        },
        {
          color: '#000000',
          label: 'Burnt areas',
        },
        {
          color: '#a6e6cc',
          label: 'Glaciers and\nperpetual snow',
        },
        {
          color: '#a6a6ff',
          label: 'Inland marshes',
        },
        {
          color: '#4d4dff',
          label: 'Peat bogs',
        },
        {
          color: '#ccccff',
          label: 'Salt marshes',
        },
        {
          color: '#e6e6ff',
          label: 'Salines',
        },
        {
          color: '#a6a6e6',
          label: 'Intertidal\nflats',
        },
        {
          color: '#00ccf2',
          label: 'Water courses',
        },
        {
          color: '#80f2e6',
          label: 'Water bodies',
        },
        {
          color: '#00ffa6',
          label: 'Coastal lagoons',
        },
        {
          color: '#a6ffe6',
          label: 'Estuaries',
        },
        {
          color: '#e6f2ff',
          label: 'Sea and ocean',
        },
        {
          color: '#ffffff',
          label: 'No data',
        },
      ],
    },
    description: () =>
      t`#  Corine Land Cover - Accounting\n\n\n\nThis script visualises CORINE Land Cover (CLC) Accounting Layers according to the official CORINE Land Cover color scheme. CLC Accounting Layers are CLC status layers modified for the purpose of consistent statistical analysis in the land cover change accounting system at EEA. For more information about the layer, visit [this website](https://custom-scripts.sentinel-hub.com/copernicus_services/corine_land_cover_accounting_layer/).`,
  },

  {
    match: [{ datasourceId: GLOBAL_HUMAN_SETTLEMENT, layerId: 'GHS-BUILT-S2' }],

    description: () =>
      t`#  The Global Human Settlement Layer GHS-BUILT-S2 \n\n\n\n
      
      The Global Human Settlement Layer GHS-BUILT-S2 is a global map of built-up areas (expressed as probabilities from 0 to 100 %) at 10 m spatial resolution. It was derived from a Sentinel-2 global image composite for the reference year 2018 using Convolutional Neural Networks.

      This script visualises the built-up probabilities stretched to 0-255.

      For more information about the layer, visit [this website](https://custom-scripts.sentinel-hub.com/copernicus_services/global-human-settlement-layer-ghs-built-s2/).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_WATER_BODIES, layerId: 'WATER-BODIES-OCCURENCE' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#ff0000',
          label: 'Very low',
        },
        {
          color: '#8e35ef',
          label: 'Low',
        },
        {
          color: '#a6a6e6',
          label: 'Medium',
        },
        {
          color: '#00ffff',
          label: 'High',
        },
        {
          color: '#3bb9ff',
          label: 'Very High',
        },
        {
          color: '#0032c8',
          label: 'Permanent',
        },
      ],
    },
    description: () =>
      t`# Water Bodies - Occurrence\n\n\n\nThis layer displays the 6 occurrence levels of the Quality layer (QUAL), providing information on the seasonal dynamics of the detected water bodies. QUAL is generated from water body occurrence statistics computed from previous monthly Water Bodies products. The occurrence statistics is ranked from low occurrence to permanent occurrence. More information [here](https://collections.sentinel-hub.com/water-bodies/readme.html), and [here](https://custom-scripts.sentinel-hub.com/copernicus_services/water-bodies-occurence/#).`,
  },

  {
    match: [{ datasourceId: COPERNICUS_GLOBAL_SURFACE_WATER, layerId: '1_OCCURRENCE' }],
    legend: [
      {
        type: 'continuous',
        minPosition: 1,
        maxPosition: 100,
        gradients: [
          { position: '1', color: 'rgb(255,204,204)', label: '1 % Occurence' },
          { position: '100', color: 'rgb(0,0,255)', label: '100 % Occurence' },
        ],
      },
      {
        type: 'discrete',
        items: [
          {
            color: '#ffffff',
            label: 'Not Water',
          },
          {
            color: '#cccccc',
            label: 'No Data',
          },
        ],
      },
    ],
    description: () =>
      t`# Global Surface Water - Occurrence\n\n\n\nThe layer shows the (intra- and inter-annual) variations of surface water presence in the time range between March 1984 and December 2021. Permanent water areas with 100% occurrence over the 38 years are shown in blue, while lighter shades of pink and purple indicate lower degrees of water presence. Learn more [here](https://custom-scripts.sentinel-hub.com/other_collections/global_surface_water_occurrence/).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_GLOBAL_SURFACE_WATER, layerId: '2_CHANGE-INTENSITY' }],
    legend: [
      {
        type: 'continuous',
        minPosition: 0,
        maxPosition: 200,
        gradients: [
          { position: '0', color: 'rgb(255,0,0)', label: '100 % Loss' },
          { position: '100', color: 'rgb(0,0,0)', label: '0 % Change' },
          { position: '200', color: 'rgb(0,255,0)', label: '100 % Increase' },
        ],
      },
      {
        type: 'discrete',
        items: [
          {
            color: '#ffffff',
            label: 'Not Water',
          },
          {
            color: '#888888',
            label: 'Unable to calculate',
          },
          {
            color: '#cccccc',
            label: 'No Data',
          },
        ],
      },
    ],
    description: () =>
      t`# Global Surface Water - Occurrence Change Intensity\n\n\n\nThe layer visualises changes in water occurrence between two different epochs, the first ranging from March 1984 to December 1999, and the other covering the period from January 2000 to December 2021. Areas with increase in water occurrence are visualised in different shades of green, areas with no change are colored black and areas with decrease are shown in shades of red. Learn more [here](https://custom-scripts.sentinel-hub.com/other_collections/global_surface_water_change/).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_GLOBAL_SURFACE_WATER, layerId: '3_SEASONALITY' }],
    legend: [
      {
        type: 'continuous',
        minPosition: 1,
        maxPosition: 12,
        gradients: [
          { position: '1', color: 'rgb(153, 217, 234)', label: '1 month of water' },
          { position: '12', color: 'rgb(0,0,170)', label: '12 months of water' },
        ],
      },
      {
        type: 'discrete',
        items: [
          {
            color: '#ffffff',
            label: 'Not Water',
          },
          {
            color: '#cccccc',
            label: 'No Data',
          },
        ],
      },
    ],
    description: () =>
      t`# Global Surface Water - Seasonality\n\n\n\nThe Seasonality layer provides information on the distribution of surface water in 2021. Permanent water bodies (water was present for 12 months) are colored in dark blue and seasonal water (water was present for less than 12 months) in gradually lighter shades of blue, with the lightest blue showing areas where water was present for only 1 month. Learn more [here](https://custom-scripts.sentinel-hub.com/other_collections/global_surface_water_seasonality/).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_GLOBAL_SURFACE_WATER, layerId: '4_RECURRENCE' }],
    legend: [
      {
        type: 'continuous',
        minPosition: 1,
        maxPosition: 100,
        gradients: [
          { position: '1', color: 'rgb(255, 127, 39)', label: '1 % recurrence' },
          { position: '100', color: 'rgb(153, 217, 234 )', label: '100 % recurrence' },
        ],
      },
      {
        type: 'discrete',
        items: [
          {
            color: '#ffffff',
            label: 'Not Water',
          },
          {
            color: '#cccccc',
            label: 'No Data',
          },
        ],
      },
    ],
    description: () =>
      t`# Global Surface Water - Recurrence\n\n\n\nThe Recurrence layer shows how frequently water returned to a particular location in a defined water period between 1984 and 2021. Orange color indicates low recurrence (water returned to the area infrequently), and light blue color indicates high recurrence (water returned to the area frequently). Learn more [here](https://custom-scripts.sentinel-hub.com/other_collections/global_surface_water_recurrence/).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_GLOBAL_SURFACE_WATER, layerId: '5_TRANSITIONS' }],
    legend: {
      type: 'discrete',
      items: [
        {
          color: '#ffffff',
          label: 'Not water',
        },
        {
          color: '#0000ff',
          label: 'Permanent',
        },
        {
          color: '#22b14c',
          label: 'New permanent',
        },
        {
          color: '#d1102d',
          label: 'Lost permanent',
        },
        {
          color: '#99d9ea',
          label: 'Seasonal',
        },
        {
          color: '#b5e61d',
          label: 'New seasonal',
        },
        {
          color: '#e6a1aa',
          label: 'Lost seasonal',
        },
        {
          color: '#ff7f27',
          label: 'Seasonal to permanent',
        },
        {
          color: '#ffc90e',
          label: 'Permanent to seasonal',
        },
        {
          color: '#7f7f7f',
          label: 'Ephemeral permanent',
        },
        {
          color: '#c3c3c3',
          label: 'Ephemeral seasonal',
        },
        {
          color: '#cccccc',
          label: 'No data',
        },
      ],
    },
    description: () =>
      t`# Global Surface Water - Transitions\n\n\n\nThe Transitions layer is derived from a comparison between the first and last year in the 38-year time period. It visualises conversions between seasonal and permanent water. For example, "lost seasonal" means, that previously seasonal water was converted to land, "new seasonal" means that land has been converted to seasonal waters and so on. Learn more [here](https://custom-scripts.sentinel-hub.com/other_collections/global_surface_water_transitions/) and learn what each class means [here](https://global-surface-water.appspot.com/faq).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_GLOBAL_SURFACE_WATER, layerId: '6_EXTENT' }],
    legend: {
      type: 'discrete',
      items: [
        {
          color: '#6666ff',
          label: 'Water Detected',
        },
        {
          color: '#ffffff',
          label: 'Not Water',
        },
        {
          color: '#cccccc',
          label: 'No Data',
        },
      ],
    },
    description: () =>
      t`# Global Surface Water - Extent\n\n\n\nThis layer visualizes water in blue. It combines all the other layers and visualizes all the locations for which water presence has ever been detected over the 38-year period. Learn more [here](https://custom-scripts.sentinel-hub.com/other_collections/global_surface_water_extent/).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_WATER_BODIES, layerId: 'WATER-BODIES' }],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#344ACD',
          label: 'Water',
        },
      ],
    },
    description: () =>
      t`# Water Bodies\n\n\n\nThis layer visualizes the Water Bodies detection layer (WB), which shows water bodies detected using the Modified Normalized Difference Water Index (MNDWI) derived from Sentinel-2 Level 1C data. More information [here](https://collections.sentinel-hub.com/water-bodies/readme.html), and [here](https://custom-scripts.sentinel-hub.com/copernicus_services/water-bodies/).`,
  },

  {
    match: [{ datasourceId: GIBS_ASTER_GDEM, layerId: 'ASTER_GDEM_Color_Index' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 255,
      gradients: [
        { position: '1', color: 'rgb(0,117,39)', label: '5' },
        { position: '2', color: 'rgb(0,118,39)' },
        { position: '3', color: 'rgb(0,119,40)' },
        { position: '4', color: 'rgb(0,120,41)' },
        { position: '5', color: 'rgb(0,121,42)' },
        { position: '6', color: 'rgb(0,122,42)' },
        { position: '7', color: 'rgb(0,123,43)' },
        { position: '8', color: 'rgb(0,125,44)' },
        { position: '9', color: 'rgb(0,126,45)' },
        { position: '10', color: 'rgb(0,127,46)' },
        { position: '11', color: 'rgb(0,128,46)' },
        { position: '12', color: 'rgb(0,129,47)' },
        { position: '13', color: 'rgb(0,130,48)' },
        { position: '14', color: 'rgb(0,132,49)' },
        { position: '15', color: 'rgb(0,133,49)' },
        { position: '16', color: 'rgb(0,134,50)' },
        { position: '17', color: 'rgb(0,135,51)' },
        { position: '18', color: 'rgb(0,136,52)' },
        { position: '19', color: 'rgb(0,137,53)' },
        { position: '20', color: 'rgb(0,139,53)' },
        { position: '21', color: 'rgb(0,140,54)' },
        { position: '22', color: 'rgb(0,141,55)' },
        { position: '23', color: 'rgb(0,142,56)' },
        { position: '24', color: 'rgb(0,143,56)' },
        { position: '25', color: 'rgb(0,144,57)' },
        { position: '26', color: 'rgb(0,146,58)' },
        { position: '27', color: 'rgb(0,147,59)' },
        { position: '28', color: 'rgb(0,148,60)' },
        { position: '29', color: 'rgb(0,149,60)' },
        { position: '30', color: 'rgb(0,150,61)' },
        { position: '31', color: 'rgb(0,151,62)' },
        { position: '32', color: 'rgb(0,152,63)' },
        { position: '33', color: 'rgb(0,154,63)' },
        { position: '34', color: 'rgb(0,155,64)' },
        { position: '35', color: 'rgb(0,156,65)' },
        { position: '36', color: 'rgb(0,157,66)' },
        { position: '37', color: 'rgb(0,158,67)' },
        { position: '38', color: 'rgb(0,159,67)' },
        { position: '39', color: 'rgb(0,161,68)' },
        { position: '40', color: 'rgb(0,162,69)' },
        { position: '41', color: 'rgb(0,163,70)' },
        { position: '42', color: 'rgb(0,164,70)' },
        { position: '43', color: 'rgb(0,165,71)' },
        { position: '44', color: 'rgb(0,166,72)' },
        { position: '45', color: 'rgb(0,168,73)' },
        { position: '46', color: 'rgb(0,169,74)' },
        { position: '47', color: 'rgb(0,170,74)' },
        { position: '48', color: 'rgb(0,171,75)' },
        { position: '49', color: 'rgb(0,172,76)' },
        { position: '50', color: 'rgb(0,173,77)' },
        { position: '51', color: 'rgb(0,175,78)' },
        { position: '52', color: 'rgb(3,175,76)' },
        { position: '53', color: 'rgb(6,176,75)' },
        { position: '54', color: 'rgb(9,177,74)' },
        { position: '55', color: 'rgb(12,178,73)' },
        { position: '56', color: 'rgb(15,179,72)' },
        { position: '57', color: 'rgb(18,179,71)' },
        { position: '58', color: 'rgb(21,180,70)' },
        { position: '59', color: 'rgb(24,181,69)' },
        { position: '60', color: 'rgb(28,182,67)' },
        { position: '61', color: 'rgb(31,183,66)' },
        { position: '62', color: 'rgb(34,183,65)' },
        { position: '63', color: 'rgb(37,184,64)' },
        { position: '64', color: 'rgb(40,185,63)' },
        { position: '65', color: 'rgb(43,186,62)' },
        { position: '66', color: 'rgb(46,187,61)' },
        { position: '67', color: 'rgb(49,187,60)' },
        { position: '68', color: 'rgb(53,188,58)' },
        { position: '69', color: 'rgb(56,189,57)' },
        { position: '70', color: 'rgb(59,190,56)' },
        { position: '71', color: 'rgb(62,191,55)' },
        { position: '72', color: 'rgb(65,191,54)' },
        { position: '73', color: 'rgb(68,192,53)' },
        { position: '74', color: 'rgb(71,193,52)' },
        { position: '75', color: 'rgb(74,194,51)' },
        { position: '76', color: 'rgb(78,195,50)' },
        { position: '77', color: 'rgb(82,196,48)' },
        { position: '78', color: 'rgb(87,197,46)' },
        { position: '79', color: 'rgb(91,198,45)' },
        { position: '80', color: 'rgb(96,199,43)' },
        { position: '81', color: 'rgb(100,200,42)' },
        { position: '82', color: 'rgb(105,201,40)' },
        { position: '83', color: 'rgb(109,202,39)' },
        { position: '84', color: 'rgb(114,203,37)' },
        { position: '85', color: 'rgb(118,205,36)' },
        { position: '86', color: 'rgb(123,206,34)' },
        { position: '87', color: 'rgb(127,207,33)' },
        { position: '88', color: 'rgb(132,208,31)' },
        { position: '89', color: 'rgb(136,209,30)' },
        { position: '90', color: 'rgb(141,210,28)' },
        { position: '91', color: 'rgb(145,211,27)' },
        { position: '92', color: 'rgb(150,212,25)' },
        { position: '93', color: 'rgb(154,214,24)' },
        { position: '94', color: 'rgb(159,215,22)' },
        { position: '95', color: 'rgb(163,216,21)' },
        { position: '96', color: 'rgb(168,217,19)' },
        { position: '97', color: 'rgb(172,218,18)' },
        { position: '98', color: 'rgb(177,219,16)' },
        { position: '99', color: 'rgb(181,220,15)' },
        { position: '100', color: 'rgb(186,221,13)' },
        { position: '101', color: 'rgb(191,223,12)' },
        { position: '102', color: 'rgb(191,222,11)' },
        { position: '103', color: 'rgb(192,221,11)' },
        { position: '104', color: 'rgb(192,220,11)' },
        { position: '105', color: 'rgb(193,219,11)' },
        { position: '106', color: 'rgb(193,218,11)' },
        { position: '107', color: 'rgb(194,217,11)' },
        { position: '108', color: 'rgb(195,216,11)' },
        { position: '109', color: 'rgb(195,215,11)' },
        { position: '110', color: 'rgb(196,214,11)' },
        { position: '111', color: 'rgb(196,213,11)' },
        { position: '112', color: 'rgb(197,212,11)' },
        { position: '113', color: 'rgb(197,211,11)' },
        { position: '114', color: 'rgb(198,210,11)' },
        { position: '115', color: 'rgb(199,209,11)' },
        { position: '116', color: 'rgb(199,208,11)' },
        { position: '117', color: 'rgb(200,207,11)' },
        { position: '118', color: 'rgb(200,206,11)' },
        { position: '119', color: 'rgb(201,205,11)' },
        { position: '120', color: 'rgb(201,204,11)' },
        { position: '121', color: 'rgb(202,204,11)' },
        { position: '122', color: 'rgb(203,203,10)' },
        { position: '123', color: 'rgb(203,202,10)' },
        { position: '124', color: 'rgb(204,201,10)' },
        { position: '125', color: 'rgb(204,200,10)' },
        { position: '126', color: 'rgb(205,199,10)' },
        { position: '127', color: 'rgb(205,198,10)' },
        { position: '128', color: 'rgb(206,197,10)', label: '1450' },
        { position: '129', color: 'rgb(207,196,10)' },
        { position: '130', color: 'rgb(207,195,10)' },
        { position: '131', color: 'rgb(208,194,10)' },
        { position: '132', color: 'rgb(208,193,10)' },
        { position: '133', color: 'rgb(209,192,10)' },
        { position: '134', color: 'rgb(209,191,10)' },
        { position: '135', color: 'rgb(210,190,10)' },
        { position: '136', color: 'rgb(211,189,10)' },
        { position: '137', color: 'rgb(211,188,10)' },
        { position: '138', color: 'rgb(212,187,10)' },
        { position: '139', color: 'rgb(212,186,10)' },
        { position: '140', color: 'rgb(213,185,10)' },
        { position: '141', color: 'rgb(214,185,10)' },
        { position: '142', color: 'rgb(213,182,10)' },
        { position: '143', color: 'rgb(212,180,10)' },
        { position: '144', color: 'rgb(211,177,11)' },
        { position: '145', color: 'rgb(210,175,11)' },
        { position: '146', color: 'rgb(209,172,12)' },
        { position: '147', color: 'rgb(208,170,12)' },
        { position: '148', color: 'rgb(207,168,13)' },
        { position: '149', color: 'rgb(206,165,13)' },
        { position: '150', color: 'rgb(205,163,14)' },
        { position: '151', color: 'rgb(204,160,14)' },
        { position: '152', color: 'rgb(203,158,15)' },
        { position: '153', color: 'rgb(202,155,15)' },
        { position: '154', color: 'rgb(201,153,16)' },
        { position: '155', color: 'rgb(200,151,16)' },
        { position: '156', color: 'rgb(199,148,17)' },
        { position: '157', color: 'rgb(198,146,17)' },
        { position: '158', color: 'rgb(197,143,18)' },
        { position: '159', color: 'rgb(196,141,18)' },
        { position: '160', color: 'rgb(195,138,19)' },
        { position: '161', color: 'rgb(194,136,19)' },
        { position: '162', color: 'rgb(193,134,19)' },
        { position: '163', color: 'rgb(192,131,20)' },
        { position: '164', color: 'rgb(191,129,20)' },
        { position: '165', color: 'rgb(190,126,21)' },
        { position: '166', color: 'rgb(189,124,21)' },
        { position: '167', color: 'rgb(188,121,22)' },
        { position: '168', color: 'rgb(187,119,22)' },
        { position: '169', color: 'rgb(186,117,23)' },
        { position: '170', color: 'rgb(185,114,23)' },
        { position: '171', color: 'rgb(184,112,24)' },
        { position: '172', color: 'rgb(183,109,24)' },
        { position: '173', color: 'rgb(182,107,25)' },
        { position: '174', color: 'rgb(181,104,25)' },
        { position: '175', color: 'rgb(180,102,26)' },
        { position: '176', color: 'rgb(179,100,26)' },
        { position: '177', color: 'rgb(178,97,27)' },
        { position: '178', color: 'rgb(177,95,27)' },
        { position: '179', color: 'rgb(176,92,28)' },
        { position: '180', color: 'rgb(175,90,28)' },
        { position: '181', color: 'rgb(175,88,29)' },
        { position: '182', color: 'rgb(174,88,32)' },
        { position: '183', color: 'rgb(174,89,36)' },
        { position: '184', color: 'rgb(174,90,40)' },
        { position: '185', color: 'rgb(174,91,44)' },
        { position: '186', color: 'rgb(173,92,48)' },
        { position: '187', color: 'rgb(173,93,52)' },
        { position: '188', color: 'rgb(173,94,55)' },
        { position: '189', color: 'rgb(173,95,59)' },
        { position: '190', color: 'rgb(172,96,63)' },
        { position: '191', color: 'rgb(172,97,67)' },
        { position: '192', color: 'rgb(172,97,71)' },
        { position: '193', color: 'rgb(172,98,75)' },
        { position: '194', color: 'rgb(171,99,79)' },
        { position: '195', color: 'rgb(171,100,82)' },
        { position: '196', color: 'rgb(171,101,86)' },
        { position: '197', color: 'rgb(171,102,90)' },
        { position: '198', color: 'rgb(170,103,94)' },
        { position: '199', color: 'rgb(170,104,98)' },
        { position: '200', color: 'rgb(170,105,102)' },
        { position: '201', color: 'rgb(170,106,106)' },
        { position: '202', color: 'rgb(170,109,109)' },
        { position: '203', color: 'rgb(171,112,112)' },
        { position: '204', color: 'rgb(171,115,115)' },
        { position: '205', color: 'rgb(172,118,118)' },
        { position: '206', color: 'rgb(173,121,121)' },
        { position: '207', color: 'rgb(173,124,124)' },
        { position: '208', color: 'rgb(174,128,128)' },
        { position: '209', color: 'rgb(174,131,131)' },
        { position: '210', color: 'rgb(175,134,134)' },
        { position: '211', color: 'rgb(176,137,137)' },
        { position: '212', color: 'rgb(176,140,140)' },
        { position: '213', color: 'rgb(177,143,143)' },
        { position: '214', color: 'rgb(177,147,147)' },
        { position: '215', color: 'rgb(178,150,150)' },
        { position: '216', color: 'rgb(179,153,153)' },
        { position: '217', color: 'rgb(179,156,156)' },
        { position: '218', color: 'rgb(180,159,159)' },
        { position: '219', color: 'rgb(180,162,162)' },
        { position: '220', color: 'rgb(181,166,166)' },
        { position: '221', color: 'rgb(182,169,169)' },
        { position: '222', color: 'rgb(182,172,172)' },
        { position: '223', color: 'rgb(183,175,175)' },
        { position: '224', color: 'rgb(183,178,178)' },
        { position: '225', color: 'rgb(184,181,181)' },
        { position: '226', color: 'rgb(185,185,185)' },
        { position: '227', color: 'rgb(187,187,187)' },
        { position: '228', color: 'rgb(189,189,189)' },
        { position: '229', color: 'rgb(192,192,192)' },
        { position: '230', color: 'rgb(194,194,194)' },
        { position: '231', color: 'rgb(197,197,197)' },
        { position: '232', color: 'rgb(199,199,199)' },
        { position: '233', color: 'rgb(201,201,201)' },
        { position: '234', color: 'rgb(204,204,204)' },
        { position: '235', color: 'rgb(206,206,206)' },
        { position: '236', color: 'rgb(209,209,209)' },
        { position: '237', color: 'rgb(211,211,211)' },
        { position: '238', color: 'rgb(213,213,213)' },
        { position: '239', color: 'rgb(216,216,216)' },
        { position: '240', color: 'rgb(218,218,218)' },
        { position: '241', color: 'rgb(221,221,221)' },
        { position: '242', color: 'rgb(223,223,223)' },
        { position: '243', color: 'rgb(226,226,226)' },
        { position: '244', color: 'rgb(228,228,228)' },
        { position: '245', color: 'rgb(230,230,230)' },
        { position: '246', color: 'rgb(233,233,233)' },
        { position: '247', color: 'rgb(235,235,235)' },
        { position: '248', color: 'rgb(238,238,238)' },
        { position: '249', color: 'rgb(240,240,240)' },
        { position: '250', color: 'rgb(242,242,242)' },
        { position: '251', color: 'rgb(245,245,245)' },
        { position: '252', color: 'rgb(247,247,247)' },
        { position: '253', color: 'rgb(250,250,250)' },
        { position: '254', color: 'rgb(252,252,252)' },
        { position: '255', color: 'rgb(255,255,255)', label: '> 8400 [m]' },
      ],
    },
  },
  {
    match: [{ datasourceId: GIBS_VIIRS_SNPP_DAYNIGHTBAND_ENCC, layerId: 'VIIRS_SNPP_DayNightBand_ENCC' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 255,
      gradients: [
        { position: '1', color: 'rgb(1,1,1)', label: '0 - 1' },
        { position: '2', color: 'rgb(2,2,2)' },
        { position: '3', color: 'rgb(3,3,3)' },
        { position: '4', color: 'rgb(4,4,4)' },
        { position: '5', color: 'rgb(5,5,5)' },
        { position: '6', color: 'rgb(6,6,6)' },
        { position: '7', color: 'rgb(7,7,7)' },
        { position: '8', color: 'rgb(8,8,8)' },
        { position: '9', color: 'rgb(9,9,9)' },
        { position: '10', color: 'rgb(10,10,10)' },
        { position: '11', color: 'rgb(11,11,11)' },
        { position: '12', color: 'rgb(12,12,12)' },
        { position: '13', color: 'rgb(13,13,13)' },
        { position: '14', color: 'rgb(14,14,14)' },
        { position: '15', color: 'rgb(15,15,15)' },
        { position: '16', color: 'rgb(16,16,16)' },
        { position: '17', color: 'rgb(17,17,17)' },
        { position: '18', color: 'rgb(18,18,18)' },
        { position: '19', color: 'rgb(19,19,19)' },
        { position: '20', color: 'rgb(20,20,20)' },
        { position: '21', color: 'rgb(21,21,21)' },
        { position: '22', color: 'rgb(22,22,22)' },
        { position: '23', color: 'rgb(23,23,23)' },
        { position: '24', color: 'rgb(24,24,24)' },
        { position: '25', color: 'rgb(25,25,25)' },
        { position: '26', color: 'rgb(26,26,26)' },
        { position: '27', color: 'rgb(27,27,27)' },
        { position: '28', color: 'rgb(28,28,28)' },
        { position: '29', color: 'rgb(29,29,29)' },
        { position: '30', color: 'rgb(30,30,30)' },
        { position: '31', color: 'rgb(31,31,31)' },
        { position: '32', color: 'rgb(32,32,32)' },
        { position: '33', color: 'rgb(33,33,33)' },
        { position: '34', color: 'rgb(34,34,34)' },
        { position: '35', color: 'rgb(35,35,35)' },
        { position: '36', color: 'rgb(36,36,36)' },
        { position: '37', color: 'rgb(37,37,37)' },
        { position: '38', color: 'rgb(38,38,38)' },
        { position: '39', color: 'rgb(39,39,39)' },
        { position: '40', color: 'rgb(40,40,40)' },
        { position: '41', color: 'rgb(41,41,41)' },
        { position: '42', color: 'rgb(42,42,42)' },
        { position: '43', color: 'rgb(43,43,43)' },
        { position: '44', color: 'rgb(44,44,44)' },
        { position: '45', color: 'rgb(45,45,45)' },
        { position: '46', color: 'rgb(46,46,46)' },
        { position: '47', color: 'rgb(47,47,47)' },
        { position: '48', color: 'rgb(48,48,48)' },
        { position: '49', color: 'rgb(49,49,49)' },
        { position: '50', color: 'rgb(50,50,50)' },
        { position: '51', color: 'rgb(51,51,51)' },
        { position: '52', color: 'rgb(52,52,52)' },
        { position: '53', color: 'rgb(53,53,53)' },
        { position: '54', color: 'rgb(54,54,54)' },
        { position: '55', color: 'rgb(55,55,55)' },
        { position: '56', color: 'rgb(56,56,56)' },
        { position: '57', color: 'rgb(57,57,57)' },
        { position: '58', color: 'rgb(58,58,58)' },
        { position: '59', color: 'rgb(59,59,59)' },
        { position: '60', color: 'rgb(60,60,60)' },
        { position: '61', color: 'rgb(61,61,61)' },
        { position: '62', color: 'rgb(62,62,62)' },
        { position: '63', color: 'rgb(63,63,63)' },
        { position: '64', color: 'rgb(64,64,64)' },
        { position: '65', color: 'rgb(65,65,65)' },
        { position: '66', color: 'rgb(66,66,66)' },
        { position: '67', color: 'rgb(67,67,67)' },
        { position: '68', color: 'rgb(68,68,68)' },
        { position: '69', color: 'rgb(69,69,69)' },
        { position: '70', color: 'rgb(70,70,70)' },
        { position: '71', color: 'rgb(71,71,71)' },
        { position: '72', color: 'rgb(72,72,72)' },
        { position: '73', color: 'rgb(73,73,73)' },
        { position: '74', color: 'rgb(74,74,74)' },
        { position: '75', color: 'rgb(75,75,75)' },
        { position: '76', color: 'rgb(76,76,76)' },
        { position: '77', color: 'rgb(77,77,77)' },
        { position: '78', color: 'rgb(78,78,78)' },
        { position: '79', color: 'rgb(79,79,79)' },
        { position: '80', color: 'rgb(80,80,80)' },
        { position: '81', color: 'rgb(81,81,81)' },
        { position: '82', color: 'rgb(82,82,82)' },
        { position: '83', color: 'rgb(83,83,83)' },
        { position: '84', color: 'rgb(84,84,84)' },
        { position: '85', color: 'rgb(85,85,85)' },
        { position: '86', color: 'rgb(86,86,86)' },
        { position: '87', color: 'rgb(87,87,87)' },
        { position: '88', color: 'rgb(88,88,88)' },
        { position: '89', color: 'rgb(89,89,89)' },
        { position: '90', color: 'rgb(90,90,90)' },
        { position: '91', color: 'rgb(91,91,91)' },
        { position: '92', color: 'rgb(92,92,92)' },
        { position: '93', color: 'rgb(93,93,93)' },
        { position: '94', color: 'rgb(94,94,94)' },
        { position: '95', color: 'rgb(95,95,95)' },
        { position: '96', color: 'rgb(96,96,96)' },
        { position: '97', color: 'rgb(97,97,97)' },
        { position: '98', color: 'rgb(98,98,98)' },
        { position: '99', color: 'rgb(99,99,99)' },
        { position: '100', color: 'rgb(100,100,100)' },
        { position: '101', color: 'rgb(101,101,101)' },
        { position: '102', color: 'rgb(102,102,102)' },
        { position: '103', color: 'rgb(103,103,103)' },
        { position: '104', color: 'rgb(104,104,104)' },
        { position: '105', color: 'rgb(105,105,105)' },
        { position: '106', color: 'rgb(106,106,106)' },
        { position: '107', color: 'rgb(107,107,107)' },
        { position: '108', color: 'rgb(108,108,108)' },
        { position: '109', color: 'rgb(109,109,109)' },
        { position: '110', color: 'rgb(110,110,110)' },
        { position: '111', color: 'rgb(111,111,111)' },
        { position: '112', color: 'rgb(112,112,112)' },
        { position: '113', color: 'rgb(113,113,113)' },
        { position: '114', color: 'rgb(114,114,114)' },
        { position: '115', color: 'rgb(115,115,115)' },
        { position: '116', color: 'rgb(116,116,116)' },
        { position: '117', color: 'rgb(117,117,117)' },
        { position: '118', color: 'rgb(118,118,118)' },
        { position: '119', color: 'rgb(119,119,119)' },
        { position: '120', color: 'rgb(120,120,120)' },
        { position: '121', color: 'rgb(121,121,121)' },
        { position: '122', color: 'rgb(122,122,122)' },
        { position: '123', color: 'rgb(123,123,123)' },
        { position: '124', color: 'rgb(124,124,124)' },
        { position: '125', color: 'rgb(125,125,125)' },
        { position: '126', color: 'rgb(126,126,126)' },
        { position: '127', color: 'rgb(127,127,127)' },
        { position: '128', color: 'rgb(128,128,128)', label: '128' },
        { position: '129', color: 'rgb(129,129,129)' },
        { position: '130', color: 'rgb(130,130,130)' },
        { position: '131', color: 'rgb(131,131,131)' },
        { position: '132', color: 'rgb(132,132,132)' },
        { position: '133', color: 'rgb(133,133,133)' },
        { position: '134', color: 'rgb(134,134,134)' },
        { position: '135', color: 'rgb(135,135,135)' },
        { position: '136', color: 'rgb(136,136,136)' },
        { position: '137', color: 'rgb(137,137,137)' },
        { position: '138', color: 'rgb(138,138,138)' },
        { position: '139', color: 'rgb(139,139,139)' },
        { position: '140', color: 'rgb(140,140,140)' },
        { position: '141', color: 'rgb(141,141,141)' },
        { position: '142', color: 'rgb(142,142,142)' },
        { position: '143', color: 'rgb(143,143,143)' },
        { position: '144', color: 'rgb(144,144,144)' },
        { position: '145', color: 'rgb(145,145,145)' },
        { position: '146', color: 'rgb(146,146,146)' },
        { position: '147', color: 'rgb(147,147,147)' },
        { position: '148', color: 'rgb(148,148,148)' },
        { position: '149', color: 'rgb(149,149,149)' },
        { position: '150', color: 'rgb(150,150,150)' },
        { position: '151', color: 'rgb(151,151,151)' },
        { position: '152', color: 'rgb(152,152,152)' },
        { position: '153', color: 'rgb(153,153,153)' },
        { position: '154', color: 'rgb(154,154,154)' },
        { position: '155', color: 'rgb(155,155,155)' },
        { position: '156', color: 'rgb(156,156,156)' },
        { position: '157', color: 'rgb(157,157,157)' },
        { position: '158', color: 'rgb(158,158,158)' },
        { position: '159', color: 'rgb(159,159,159)' },
        { position: '160', color: 'rgb(160,160,160)' },
        { position: '161', color: 'rgb(161,161,161)' },
        { position: '162', color: 'rgb(162,162,162)' },
        { position: '163', color: 'rgb(163,163,163)' },
        { position: '164', color: 'rgb(164,164,164)' },
        { position: '165', color: 'rgb(165,165,165)' },
        { position: '166', color: 'rgb(166,166,166)' },
        { position: '167', color: 'rgb(167,167,167)' },
        { position: '168', color: 'rgb(168,168,168)' },
        { position: '169', color: 'rgb(169,169,169)' },
        { position: '170', color: 'rgb(170,170,170)' },
        { position: '171', color: 'rgb(171,171,171)' },
        { position: '172', color: 'rgb(172,172,172)' },
        { position: '173', color: 'rgb(173,173,173)' },
        { position: '174', color: 'rgb(174,174,174)' },
        { position: '175', color: 'rgb(175,175,175)' },
        { position: '176', color: 'rgb(176,176,176)' },
        { position: '177', color: 'rgb(177,177,177)' },
        { position: '178', color: 'rgb(178,178,178)' },
        { position: '179', color: 'rgb(179,179,179)' },
        { position: '180', color: 'rgb(180,180,180)' },
        { position: '181', color: 'rgb(181,181,181)' },
        { position: '182', color: 'rgb(182,182,182)' },
        { position: '183', color: 'rgb(183,183,183)' },
        { position: '184', color: 'rgb(184,184,184)' },
        { position: '185', color: 'rgb(185,185,185)' },
        { position: '186', color: 'rgb(186,186,186)' },
        { position: '187', color: 'rgb(187,187,187)' },
        { position: '188', color: 'rgb(188,188,188)' },
        { position: '189', color: 'rgb(189,189,189)' },
        { position: '190', color: 'rgb(190,190,190)' },
        { position: '191', color: 'rgb(191,191,191)' },
        { position: '192', color: 'rgb(192,192,192)' },
        { position: '193', color: 'rgb(193,193,193)' },
        { position: '194', color: 'rgb(194,194,194)' },
        { position: '195', color: 'rgb(195,195,195)' },
        { position: '196', color: 'rgb(196,196,196)' },
        { position: '197', color: 'rgb(197,197,197)' },
        { position: '198', color: 'rgb(198,198,198)' },
        { position: '199', color: 'rgb(199,199,199)' },
        { position: '200', color: 'rgb(200,200,200)' },
        { position: '201', color: 'rgb(201,201,201)' },
        { position: '202', color: 'rgb(202,202,202)' },
        { position: '203', color: 'rgb(203,203,203)' },
        { position: '204', color: 'rgb(204,204,204)' },
        { position: '205', color: 'rgb(205,205,205)' },
        { position: '206', color: 'rgb(206,206,206)' },
        { position: '207', color: 'rgb(207,207,207)' },
        { position: '208', color: 'rgb(208,208,208)' },
        { position: '209', color: 'rgb(209,209,209)' },
        { position: '210', color: 'rgb(210,210,210)' },
        { position: '211', color: 'rgb(211,211,211)' },
        { position: '212', color: 'rgb(212,212,212)' },
        { position: '213', color: 'rgb(213,213,213)' },
        { position: '214', color: 'rgb(214,214,214)' },
        { position: '215', color: 'rgb(215,215,215)' },
        { position: '216', color: 'rgb(216,216,216)' },
        { position: '217', color: 'rgb(217,217,217)' },
        { position: '218', color: 'rgb(218,218,218)' },
        { position: '219', color: 'rgb(219,219,219)' },
        { position: '220', color: 'rgb(220,220,220)' },
        { position: '221', color: 'rgb(221,221,221)' },
        { position: '222', color: 'rgb(222,222,222)' },
        { position: '223', color: 'rgb(223,223,223)' },
        { position: '224', color: 'rgb(224,224,224)' },
        { position: '225', color: 'rgb(225,225,225)' },
        { position: '226', color: 'rgb(226,226,226)' },
        { position: '227', color: 'rgb(227,227,227)' },
        { position: '228', color: 'rgb(228,228,228)' },
        { position: '229', color: 'rgb(229,229,229)' },
        { position: '230', color: 'rgb(230,230,230)' },
        { position: '231', color: 'rgb(231,231,231)' },
        { position: '232', color: 'rgb(232,232,232)' },
        { position: '233', color: 'rgb(233,233,233)' },
        { position: '234', color: 'rgb(234,234,234)' },
        { position: '235', color: 'rgb(235,235,235)' },
        { position: '236', color: 'rgb(236,236,236)' },
        { position: '237', color: 'rgb(237,237,237)' },
        { position: '238', color: 'rgb(238,238,238)' },
        { position: '239', color: 'rgb(239,239,239)' },
        { position: '240', color: 'rgb(240,240,240)' },
        { position: '241', color: 'rgb(241,241,241)' },
        { position: '242', color: 'rgb(242,242,242)' },
        { position: '243', color: 'rgb(243,243,243)' },
        { position: '244', color: 'rgb(244,244,244)' },
        { position: '245', color: 'rgb(245,245,245)' },
        { position: '246', color: 'rgb(246,246,246)' },
        { position: '247', color: 'rgb(247,247,247)' },
        { position: '248', color: 'rgb(248,248,248)' },
        { position: '249', color: 'rgb(249,249,249)' },
        { position: '250', color: 'rgb(250,250,250)' },
        { position: '251', color: 'rgb(251,251,251)' },
        { position: '252', color: 'rgb(252,252,252)' },
        { position: '253', color: 'rgb(253,253,253)' },
        { position: '254', color: 'rgb(254,254,254)' },
        { position: '255', color: 'rgb(255,255,255)', label: '255' },
      ],
    },
  },
  {
    match: [{ datasourceId: CNES_LAND_COVER, layerId: 'CNES-LAND-COVER-CLASSIFICATION' }],
    legend: {
      type: 'discrete',
      items: [
        {
          color: '#ff00ff',
          label: 'Dense built-up area',
        },
        {
          color: '#ff55ff',
          label: 'Diffuse built-up area',
        },
        {
          color: '#ffaaff',
          label: 'Industrial and commercial areas',
        },
        {
          color: '#00ffff',
          label: 'Roads',
        },
        {
          color: '#ffff00',
          label: 'Oilseeds (Rapeseed)',
        },
        {
          color: '#d0ff00',
          label: 'Straw cereals (Wheat, Triticale, Barley)',
        },
        {
          color: '#a1d600',
          label: 'Protein crops (Beans / Peas)',
        },
        {
          color: '#ffab44',
          label: 'Soy',
        },
        {
          color: '#d6d600',
          label: 'Sunflower',
        },
        {
          color: '#ff5500',
          label: 'Corn',
        },
        {
          color: '#c5ffff',
          label: 'Rice',
        },
        {
          color: '#aaaa61',
          label: 'Tubers/roots',
        },
        {
          color: '#aaaa00',
          label: 'Grasslands',
        },
        {
          color: '#aaaaff',
          label: 'Orchards and fruit growing',
        },
        {
          color: '#550000',
          label: 'Vineyards',
        },
        {
          color: '#009c00',
          label: 'Hardwood forest',
        },
        {
          color: '#003200',
          label: 'Softwood forest',
        },
        {
          color: '#aaff00',
          label: 'Natural grasslands and pastures',
        },
        {
          color: '#55aa7f',
          label: 'Woody moorlands',
        },
        {
          color: '#ff0000',
          label: 'Natural mineral surfaces',
        },
        {
          color: '#ffb802',
          label: 'Beaches and dunes',
        },
        {
          color: '#bebebe',
          label: 'Glaciers and eternal snows',
        },
        {
          color: '#0000ff',
          label: 'Water',
        },
      ],
    },
    description: () =>
      t`# CNES Land cover map\n\n\n\nThe CNES Land Cover Map (Occupation des Sols, OSO) produces land classification for Metropolitan France at 10 m spatial resolution based on Sentinel-2 L2A data within the Theia Land Cover CES framework. Maps for 2020, 2019, and 2018 use a 23-categories nomenclature. For earlier maps in 2017 and 2016, a fully compatible 17-classes nomenclature is employed.\n\n\n\nFind more information [here](https://custom-scripts.sentinel-hub.com/other_collections/cnes_land_cover_classification/).`,
  },
  {
    match: [{ datasourceId: CNES_LAND_COVER, layerId: 'CNES-LAND-COVER-CLASSIFIER-CONFIDENCE' }],
    legend: {
      type: 'discrete',
      items: [
        {
          color: '#000000',
          label: '1% confidence',
        },
        {
          color: '#00c800',
          label: '100% confidence',
        },
      ],
    },
    description: () =>
      t`# CNES land cover classifier confidence visualisation\n\n\n\nThe script visualises the information on the classifier confidence with values ranging from 1 to 100.\n\n\n\nFind more information [here](https://custom-scripts.sentinel-hub.com/other_collections/cnes_land_cover_confidence/).`,
  },
  {
    match: [{ datasourceId: CNES_LAND_COVER, layerId: 'CNES-LAND-COVER-VALIDITY' }],
    legend: {
      type: 'discrete',
      items: [
        {
          color: '#000000',
          label: '1 cloudless image',
        },
        {
          color: '#e60000',
          label: '45 cloudless images',
        },
      ],
    },
    description: () =>
      t`# CNES land cover validity visualisation\n\n\n\nThe script visualises the information on the number of cloudless images for validity.\n\n\n\nFind more information [here](https://custom-scripts.sentinel-hub.com/other_collections/cnes_land_cover_validity/).`,
  },
  {
    match: [{ datasourceId: ESA_WORLD_COVER, layerId: 'WORLDCOVER-MAP' }],
    legend: {
      type: 'discrete',
      items: [
        {
          color: '#006400',
          label: 'Tree cover',
        },
        {
          color: '#ffbb22',
          label: 'Shrubland',
        },
        {
          color: '#ffff4c',
          label: 'Grassland',
        },
        {
          color: '#f096ff',
          label: 'Cropland',
        },
        {
          color: '#fa0000',
          label: 'Built-up areas',
        },
        {
          color: '#b4b4b4',
          label: 'Bare / sparse vegetation',
        },
        {
          color: '#f0f0f0',
          label: 'Snow and ice',
        },
        {
          color: '#0064c8',
          label: 'Permanent water bodies',
        },
        {
          color: '#0096a0',
          label: 'Herbaceous wetland',
        },
        {
          color: '#00cf75',
          label: 'Mangroves',
        },
        {
          color: '#fae6a0',
          label: 'Moss and lichen',
        },
      ],
    },
    description: () =>
      t`# ESA WorldCover Map\n\n\n\nThe WorldCover product displays a global land cover map with 11 different land cover classes produced at 10m resolution based on combination of both Sentinel-1 and Sentinel-2 data. In areas where Sentinel-2 images are covered by clouds for an extended period of time, Sentinel-1 data provides complimentary information on the structural characteristics of the observed land cover. Therefore, the combination of Sentinel-1 and Sentinel-2 data makes it possible to update the land cover map almost in real time. Find more information [here](https://custom-scripts.sentinel-hub.com/other_collections/worldcover/).`,
  },
  {
    match: [{ datasourceId: IO_LULC_10M_ANNUAL, layerId: 'IO-LAND-USE-LAND-COVER-MAP' }],
    legend: {
      type: 'discrete',
      items: [
        {
          color: '#419bdf',
          label: 'Water',
        },
        {
          color: '#397d49',
          label: 'Trees',
        },
        {
          color: '#7a87c6',
          label: 'Flooded Vegetation',
        },
        {
          color: '#e49635',
          label: 'Crops',
        },
        {
          color: '#c4281b',
          label: 'Built Area',
        },
        {
          color: '#a59b8f',
          label: 'Bare Ground',
        },
        {
          color: '#a8ebff',
          label: 'Snow and ice',
        },
        {
          color: '#616161',
          label: 'Clouds',
        },
        {
          color: '#e3e2c3',
          label: 'Rangeland',
        },
      ],
    },
    description: () =>
      t`# 10m Annual Land Use Land Cover (9-class)\n\n\n\nThe 10m Annual Land Use Land Cover (LULC) Map is produced by Impact Observatory, Microsoft, and Esri collaboratively. The data collection is derived from ESA Sentinel-2 imagery at 10m resolution globally using Impact Ovservatory's state of the art deep learning AI land classification model which is trained by billions of human-labeled image pixels. There are 9 LULC classes generated by the algorithm, including Built, Crops, Trees, Water, Rangeland, Flooded Vegetation, Snow/Ice, Bare Ground, and Clouds. Find more information [here](https://custom-scripts.sentinel-hub.com/other_collections/impact-observatory-lulc/).`,
  },
  // HLS collection
  {
    match: [{ datasourceId: AWS_HLS, layerId: 'TRUE-COLOR' }],
    description: () =>
      t`# True color composite\n\nSensors carried by satellites can image Earth in different regions of the electromagnetic spectrum. Each region in the spectrum is referred to as a band. True color composite uses visible light bands red, green and blue in the corresponding red, green and blue color channels, resulting in a natural colored product, that is a good representation of the Earth as humans would see it naturally.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/hls/true_color/)`,
  },
  {
    match: [{ datasourceId: AWS_HLS, layerId: '2_FALSE-COLOR' }],
    description: () =>
      t`# False color composite\n\nA false color composite uses at least one non-visible wavelength to image Earth. The false color composite using near infrared, red and green bands is very popular (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). The false colour composite is most commonly used to assess plant density and health, since plants reflect near infrared and green light, while they absorb red. Cities and exposed ground are grey or tan, and water appears blue or black.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/hls/false_color/) and [here.](https://earthobservatory.nasa.gov/features/FalseColor/page6.php)`,
  },

  {
    match: [
      {
        datasourceId: AWS_LOTL2,
        layerId: 'X_BAND_QUALITY_ASSESSMENT',
      },
    ],

    legend: {
      type: 'discrete',
      items: [
        {
          color: '#ffffff',
          label: 'Cloud',
        },
        {
          color: '#afafaf',
          label: 'Dilated Clouds',
        },
        {
          color: '#996633',
          label: 'Cloud Shadow',
        },
        {
          color: '#66ffff',
          label: 'Cirrus',
        },
        {
          color: '#ff00ff',
          label: 'Snow',
        },
        {
          color: '#0000CC',
          label: 'Water',
        },
      ],
    },
    description: () =>
      t`# Band Quality Assessment visualization\n\n\n\nThe Landsat BQA band provides useful information such as cloudy pixels to users wanting to mask their data from pixels that are either poor quality or contain no useful data. This visualization uses the [decodeL8C2Qa](https://docs.sentinel-hub.com/api/latest/evalscript/functions/#decodel8c2qa) function to decode the BQA band from the Landsat 8/9 Collection 2. Clear pixel, pixel not classified as clouds, snow or water, are displayed as true color image. \n\n\n\nMore info [here](https://www.usgs.gov/landsat-missions/landsat-collection-2-quality-assessment-bands).`,
  },

  {
    match: [{ datasourceId: 'S1_AWS_IW_VVVH', layerId: '1_ENHANCED-VISUALIZATION' }],
    description: () =>
      t`# False color visualization\n\nThis script offers different false color visualizations and the possibility to easily add more visualizations. Using variables, you can influence the resulting image in terms of what you want to higlight.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-1/sar_false_color_visualization-2/) and [here.](https://pierre-markuse.net/2019/10/22/sentinel-1-sar-data-visualization-in-eo-browser-using-a-custom-script/)`,
  },
  {
    match: [{ datasourceId: 'S1_AWS_IW_VVVH', layerId: '2_ENHANCED-VISUALIZATION-2' }],
    description: () =>
      t`# False color visualization-2\n\nThe script visualizes the Earth's surface in False Color from Sentinel-1 data. It helps with maritime monitoring (ice monitoring, ship monitoring,...), land monitoring (agriculture, deforestation,...) and emergency management (flood monitoring, volcano monitoring,...).\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-1/sar_false_color_visualization/)`,
  },
  {
    match: [{ datasourceId: 'S1_AWS_IW_VVVH', layerId: '3_URBAN-AREAS' }],
    description: () =>
      t`# Urban Areas visualization\n\nThe script is useful for locating urban areas and individual buildings. It uses VH and VV polarizations to highlight different buildings and topology orientations with purple and green colors. It can be used to track urban expansion, estimate building type or locate buildings in high-risk areas (such as floods).\n\nThe script does not work well in high elevation areas, where snow and high slopes are also highlighted, making it difficult to separate urban areas from the rest of the surface.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-1/urban_areas/)`,
  },
  {
    match: [{ datasourceId: 'S1_AWS_IW_VVVH', layerId: '4_DEFORESTATION' }],
    description: () =>
      t`# Deforestation Visualization\n\nThe script uses the VV and VH bands of the Sentinel-1 and transforms the cartesian space of VV and VH into polar coordinates computing the length and angle of the resulting vector as well as the area of the square defined by VV and VH. Then the length of the vector is used as a classifier to distinguish between water, forest and soil.\n\nThe script paints the water and bare soil areas black, and uses both the length and the angle to draw a scale for the forest (green) and soil (red), drawing a stronger green if more forest was classified and a stronger red or black if more soil was found.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-1/sar_deforestation_detection/)`,
  },
  {
    match: [{ datasourceId: 'S1_AWS_IW_VVVH', layerId: '5_WATER-SURFACE-ROUGHNESS-VISUALIZATION' }],
    description: () =>
      t`# Water Surface Roughness Visualization \n\nThe script visualizes the Water Surface Roughness from Sentinel-1 data. It helps in maritime monitoring (ship monitoring, oil pollution monitoring, sea currents,...).\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-1/water_surface_roughness_visualization/)`,
  },

  {
    match: [{ datasourceId: DEM_MAPZEN, layerId: '1_TOPOGRAPHIC' }],
    legend: {
      type: 'continuous',
      minPosition: -5000,
      maxPosition: 9000,
      gradients: [
        { position: '-4549', color: 'rgb(3%,3%,45%)', label: '-5.000' },
        { position: '-4549', color: 'rgb(16%,19%,53%)' },
        { position: '-4098', color: 'rgb(16%,19%,53%)' },
        { position: '-4098', color: 'rgb(28%,35%,63%)' },
        { position: '-3647', color: 'rgb(28%,35%,63%)', label: '-500' },
        { position: '-3647', color: 'rgb(41%,50%,73%)' },
        { position: '-3196', color: 'rgb(41%,50%,73%)' },
        { position: '-3196', color: 'rgb(66%,82%,92%)' },
        { position: '-2745', color: 'rgb(66%,82%,92%)' },
        { position: '-2745', color: 'rgb(9%,33%,3%)', label: '0' },
        { position: '-2294', color: 'rgb(9%,33%,3%)' },
        { position: '-2294', color: 'rgb(12%,37%,8%)' },
        { position: '-1843', color: 'rgb(12%,37%,8%)' },
        { position: '-1843', color: 'rgb(15%,41%,13%)', label: '25' },
        { position: '-1392', color: 'rgb(15%,41%,13%)' },
        { position: '-1392', color: 'rgb(18%,45%,18%)' },
        { position: '-941', color: 'rgb(18%,45%,18%)' },
        { position: '-941', color: 'rgb(21%,49%,23%)' },
        { position: '-490', color: 'rgb(21%,49%,23%)' },
        { position: '-490', color: 'rgb(30%,58%,25%)', label: '100' },
        { position: '-39', color: 'rgb(30%,58%,25%)' },
        { position: '-39', color: 'rgb(37%,64%,33%)' },
        { position: '412', color: 'rgb(37%,64%,33%)' },
        { position: '412', color: 'rgb(45%,70%,40%)', label: '300' },
        { position: '863', color: 'rgb(45%,70%,40%)' },
        { position: '863', color: 'rgb(48%,73%,44%)' },
        { position: '1314', color: 'rgb(48%,73%,44%)', label: '500' },
        { position: '1314', color: 'rgb(52%,76%,48%)' },
        { position: '1765', color: 'rgb(52%,76%,48%)' },
        { position: '1765', color: 'rgb(59%,81%,56%)' },
        { position: '2216', color: 'rgb(59%,81%,56%)' },
        { position: '2216', color: 'rgb(65%,84%,61%)' },
        { position: '2667', color: 'rgb(65%,84%,61%)' },
        { position: '2667', color: 'rgb(67%,87%,63%)' },
        { position: '3118', color: 'rgb(67%,87%,63%)' },
        { position: '3118', color: 'rgb(99%,93%,75%)', label: '1.000' },
        { position: '3569', color: 'rgb(99%,93%,75%)' },
        { position: '3569', color: 'rgb(92%,85%,69%)' },
        { position: '4020', color: 'rgb(92%,85%,69%)' },
        { position: '4020', color: 'rgb(84%,77%,62%)' },
        { position: '4471', color: 'rgb(84%,77%,62%)' },
        { position: '4471', color: 'rgb(76%,69%,54%)' },
        { position: '4922', color: 'rgb(76%,69%,54%)' },
        { position: '4922', color: 'rgb(68%,61%,46%)' },
        { position: '5373', color: 'rgb(68%,61%,46%)' },
        { position: '5373', color: 'rgb(60%,53%,38%)', label: '3.500' },
        { position: '5824', color: 'rgb(60%,53%,38%)' },
        { position: '5824', color: 'rgb(53%,45%,30%)' },
        { position: '6275', color: 'rgb(53%,45%,30%)' },
        { position: '6275', color: 'rgb(45%,38%,22%)' },
        { position: '6726', color: 'rgb(45%,38%,22%)' },
        { position: '6726', color: 'rgb(37%,30%,15%)' },
        { position: '7177', color: 'rgb(37%,30%,15%)' },
        { position: '7177', color: 'rgb(29%,22%,7%)' },
        { position: '7628', color: 'rgb(29%,22%,7%)' },
        { position: '7628', color: 'rgb(90%,90%,90%)', label: '6.000' },
        { position: '8079', color: 'rgb(90%,90%,90%)' },
        { position: '8079', color: 'rgb(95%,95%,95%)' },
        { position: '8530', color: 'rgb(95%,95%,95%)' },
        { position: '8530', color: 'rgb(100%,100%,100%)' },
        { position: '8981', color: 'rgb(100%,100%,100%)', label: '9.000 [m]' },
      ],
    },
    description: () =>
      t`# Topographic Visualization\n\n\n\nThis script returns a visualisation with green colours representing lowland elevations and earth colours as mountainous elevations. The script uses discrete classes rather than the continuous visualisations in the other DEM layers.\n\n\It is possible to set custom min and max values in the evalscript by setting defaultVis to false and setting the min and max variables to the desired values.\n\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/dem/dem-topographic/)`,
  },
  {
    match: [
      { datasourceId: DEM_COPERNICUS_30, layerId: '1_TOPOGRAPHIC' },
      { datasourceId: DEM_COPERNICUS_90, layerId: '1_TOPOGRAPHIC' },
      { datasourceId: DEM_COPERNICUS_30_CDAS, layerId: '1_TOPOGRAPHIC' },
      { datasourceId: DEM_COPERNICUS_90_CDAS, layerId: '1_TOPOGRAPHIC' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -346,
      maxPosition: 9342,
      gradients: [
        { position: '-333', color: 'rgb(6%,6%,55%)' },
        { position: '0', color: 'rgb(6%,6%,55%)' },
        { position: '0', color: 'rgb(9%,33%,3%)', label: '0' },
        { position: '346', color: 'rgb(9%,33%,3%)' },
        { position: '346', color: 'rgb(12%,37%,8%)' },
        { position: '692', color: 'rgb(12%,37%,8%)' },
        { position: '692', color: 'rgb(15%,41%,13%)', label: '25' },
        { position: '1038', color: 'rgb(15%,41%,13%)' },
        { position: '1038', color: 'rgb(18%,45%,18%)' },
        { position: '1384', color: 'rgb(18%,45%,18%)' },
        { position: '1384', color: 'rgb(21%,49%,23%)' },
        { position: '1730', color: 'rgb(21%,49%,23%)' },
        { position: '1730', color: 'rgb(24%,53%,24%)', label: '100' },
        { position: '2076', color: 'rgb(24%,53%,24%)' },
        { position: '2076', color: 'rgb(30%,58%,25%)' },
        { position: '2422', color: 'rgb(30%,58%,25%)' },
        { position: '2422', color: 'rgb(37%,64%,33%)', label: '300' },
        { position: '2768', color: 'rgb(37%,64%,33%)' },
        { position: '2768', color: 'rgb(45%,70%,40%)' },
        { position: '3114', color: 'rgb(45%,70%,40%)' },
        { position: '3114', color: 'rgb(48%,73%,44%)', label: '500' },
        { position: '3460', color: 'rgb(48%,73%,44%)' },
        { position: '3460', color: 'rgb(52%,76%,48%)' },
        { position: '3806', color: 'rgb(52%,76%,48%)' },
        { position: '3806', color: 'rgb(59%,81%,56%)' },
        { position: '4152', color: 'rgb(59%,81%,56%)' },
        { position: '4152', color: 'rgb(65%,84%,61%)' },
        { position: '4498', color: 'rgb(65%,84%,61%)' },
        { position: '4498', color: 'rgb(67%,87%,63%)' },
        { position: '4844', color: 'rgb(67%,87%,63%)' },
        { position: '4844', color: 'rgb(99%,93%,75%)', label: '1.000' },
        { position: '5190', color: 'rgb(99%,93%,75%)' },
        { position: '5190', color: 'rgb(92%,85%,69%)' },
        { position: '5536', color: 'rgb(92%,85%,69%)' },
        { position: '5536', color: 'rgb(84%,77%,62%)' },
        { position: '5882', color: 'rgb(84%,77%,62%)' },
        { position: '5882', color: 'rgb(76%,69%,54%)' },
        { position: '6228', color: 'rgb(76%,69%,54%)' },
        { position: '6228', color: 'rgb(68%,61%,46%)' },
        { position: '6574', color: 'rgb(68%,61%,46%)' },
        { position: '6574', color: 'rgb(60%,53%,38%)', label: '3.500' },
        { position: '6920', color: 'rgb(60%,53%,38%)' },
        { position: '6920', color: 'rgb(53%,45%,30%)' },
        { position: '7266', color: 'rgb(53%,45%,30%)' },
        { position: '7266', color: 'rgb(45%,38%,22%)' },
        { position: '7612', color: 'rgb(45%,38%,22%)' },
        { position: '7612', color: 'rgb(37%,30%,15%)' },
        { position: '7958', color: 'rgb(37%,30%,15%)' },
        { position: '7958', color: 'rgb(29%,22%,7%)' },
        { position: '8304', color: 'rgb(29%,22%,7%)' },
        { position: '8304', color: 'rgb(90%,90%,90%)', label: '6.000' },
        { position: '8650', color: 'rgb(90%,90%,90%)' },
        { position: '8650', color: 'rgb(95%,95%,95%)' },
        { position: '8996', color: 'rgb(95%,95%,95%)' },
        { position: '8996', color: 'rgb(100%,100%,100%)' },
        { position: '9342', color: 'rgb(100%,100%,100%)', label: '9.000 [m]' },
      ],
    },
    description: () =>
      t`# Topographic Visualization\n\n\n\nThis script returns a visualisation with green colours representing lowland elevations and earth colours as mountainous elevations. The script uses discrete classes rather than the continuous visualisations in the other DEM layers.\n\nIt is possible to set custom min and max values in the evalscript by setting defaultVis to false and setting the min and max variables to the desired values.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/dem/dem-topographic/)`,
  },
  {
    match: [{ datasourceId: DEM_MAPZEN, layerId: 'COLOR' }],
    legend: {
      type: 'continuous',
      minPosition: -12000,
      maxPosition: 9000,
      gradients: [
        { position: '-12000', color: 'rgb(0%,0%,1%)', label: '-12.000' },
        { position: '-11000', color: 'rgb(11%,0%,35%)' },
        { position: '-10000', color: 'rgb(11%,11%,47%)' },
        { position: '-9000', color: 'rgb(15%,19%,70%)', label: '-1.000' },
        { position: '-8000', color: 'rgb(23%,23%,90%)' },
        { position: '-7000', color: 'rgb(23%,31%,96%)', label: '-200' },
        { position: '-6000', color: 'rgb(35%,33%,98%)' },
        { position: '-5000', color: 'rgb(47%,47%,92%)', label: '-20' },
        { position: '-4000', color: 'rgb(62%,62%,100%)' },
        { position: '-3000', color: 'rgb(78%,78%,78%)', label: '0' },
        { position: '-2000', color: 'rgb(39%,22%,23%)' },
        { position: '-1000', color: 'rgb(47%,18%,15%)', label: '10' },
        { position: '0', color: 'rgb(54%,29%,15%)' },
        { position: '1000', color: 'rgb(66%,37%,0%)', label: '200' },
        { position: '2000', color: 'rgb(47%,22%,35%)' },
        { position: '3000', color: 'rgb(82%,57%,70%)', label: '400' },
        { position: '4000', color: 'rgb(54%,43%,0%)' },
        { position: '5000', color: 'rgb(47%,54%,70%)', label: '1.000' },
        { position: '6000', color: 'rgb(62%,66%,94%)' },
        { position: '7000', color: 'rgb(74%,78%,98%)', label: '5.000' },
        { position: '8000', color: 'rgb(86%,94%,100%)' },
        { position: '9000', color: 'rgb(100%,100%,100%)', label: '9.000 [m]' },
      ],
    },
    description: () =>
      t`# Color Visualization\n\n\n\nThis script returns a color visualization of a digital elevation model, assigning continuous colors to the elevation borders.\n\nIt is possible to set custom min and max values in the evalscript by setting defaultVis to false and setting the min and max variables to the desired values.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/dem/dem-color/)`,
  },
  {
    match: [
      { datasourceId: DEM_COPERNICUS_30, layerId: 'COLOR' },
      { datasourceId: DEM_COPERNICUS_90, layerId: 'COLOR' },
      { datasourceId: DEM_COPERNICUS_30_CDAS, layerId: 'COLOR' },
      { datasourceId: DEM_COPERNICUS_90_CDAS, layerId: 'COLOR' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -5000,
      maxPosition: 9000,
      gradients: [
        { position: '-4500', color: 'rgb(100%,100%,100%)', label: 'Below Sea Level' },
        { position: '-3000', color: 'rgb(78%,78%,78%)', label: '0' },
        { position: '-2000', color: 'rgb(39%,22%,23%)' },
        { position: '-1000', color: 'rgb(47%,18%,15%)', label: '10' },
        { position: '0', color: 'rgb(54%,29%,15%)' },
        { position: '1000', color: 'rgb(66%,37%,0%)', label: '200' },
        { position: '2000', color: 'rgb(47%,22%,35%)' },
        { position: '3000', color: 'rgb(82%,57%,70%)', label: '400' },
        { position: '4000', color: 'rgb(54%,43%,0%)' },
        { position: '5000', color: 'rgb(47%,54%,70%)', label: '1.000' },
        { position: '6000', color: 'rgb(62%,66%,94%)' },
        { position: '7000', color: 'rgb(74%,78%,98%)', label: '5.000' },
        { position: '8000', color: 'rgb(86%,94%,100%)' },
        { position: '9000', color: 'rgb(100%,100%,100%)', label: '9.000 [m]' },
      ],
    },
    description: () =>
      t`# Color Visualization\n\n\n\nThis script returns a color visualization of a digital elevation model, assigning continuous colors to the elevation borders.\n\nIt is possible to set custom min and max values in the evalscript by setting defaultVis to false and setting the min and max variables to the desired values.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/dem/dem-color/)`,
  },
  {
    match: [{ datasourceId: DEM_MAPZEN, layerId: 'GRAYSCALE' }],
    legend: {
      type: 'continuous',
      minPosition: -5000,
      maxPosition: 9000,
      gradients: [
        { position: '-12000', color: 'rgb(0%,0%,0%)', label: '-12.000' },
        { position: '-11000', color: 'rgb(9%,9%,9%)' },
        { position: '-10000', color: 'rgb(21%,21%,21%)' },
        { position: '-9000', color: 'rgb(24%,24%,24%)', label: '-1.000' },
        { position: '-8000', color: 'rgb(27%,27%,27%)' },
        { position: '-7000', color: 'rgb(29%,29%,29%)', label: '-200' },
        { position: '-6000', color: 'rgb(31%,31%,31%)' },
        { position: '-5000', color: 'rgb(33%,33%,33%)', label: '-20' },
        { position: '-4000', color: 'rgb(35%,35%,35%)' },
        { position: '-3000', color: 'rgb(39%,39%,39%)', label: '0' },
        { position: '-2000', color: 'rgb(43%,43%,43%)' },
        { position: '-1000', color: 'rgb(51%,51%,51%)', label: '10' },
        { position: '0', color: 'rgb(54%,54%,54%)' },
        { position: '1000', color: 'rgb(62%,62%,62%)', label: '200' },
        { position: '2000', color: 'rgb(70%,70%,70%)' },
        { position: '3000', color: 'rgb(78%,78%,78%)', label: '400' },
        { position: '4000', color: 'rgb(84%,84%,84%)' },
        { position: '5000', color: 'rgb(88%,88%,88%)', label: '1.000' },
        { position: '6000', color: 'rgb(92%,92%,92%)' },
        { position: '7000', color: 'rgb(96%,96%,96%)', label: '5.000' },
        { position: '8000', color: 'rgb(98%,98%,98%)' },
        { position: '9000', color: 'rgb(100%,100%,100%)', label: '9.000 [m]' },
      ],
    },
    description: () =>
      t`# Grayscale Visualization\n\n\n\nThis script returns a grayscale visualization of a digital elevation model, assigning continuous colors to the elevation borders.\n\nIt is possible to set custom min and max values in the evalscript by setting defaultVis to false and setting the min and max variables to the desired values.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/dem/dem-grayscale/)`,
  },
  {
    match: [
      { datasourceId: DEM_COPERNICUS_30, layerId: 'GRAYSCALE' },
      { datasourceId: DEM_COPERNICUS_90, layerId: 'GRAYSCALE' },
      { datasourceId: DEM_COPERNICUS_30_CDAS, layerId: 'GRAYSCALE' },
      { datasourceId: DEM_COPERNICUS_90_CDAS, layerId: 'GRAYSCALE' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -5000,
      maxPosition: 9000,
      gradients: [
        { position: '-4500', color: 'rgb(35%,35%,35%)', label: 'Below Sea Level' },
        { position: '-3000', color: 'rgb(39%,39%,39%)', label: '0' },
        { position: '-2000', color: 'rgb(43%,43%,43%)' },
        { position: '-1000', color: 'rgb(51%,51%,51%)', label: '10' },
        { position: '0', color: 'rgb(54%,54%,54%)' },
        { position: '1000', color: 'rgb(62%,62%,62%)', label: '200' },
        { position: '2000', color: 'rgb(70%,70%,70%)' },
        { position: '3000', color: 'rgb(78%,78%,78%)', label: '400' },
        { position: '4000', color: 'rgb(84%,84%,84%)' },
        { position: '5000', color: 'rgb(88%,88%,88%)', label: '1.000' },
        { position: '6000', color: 'rgb(92%,92%,92%)' },
        { position: '7000', color: 'rgb(96%,96%,96%)', label: '5.000' },
        { position: '8000', color: 'rgb(98%,98%,98%)' },
        { position: '9000', color: 'rgb(100%,100%,100%)', label: '9.000 [m]' },
      ],
    },
    description: () =>
      t`# Grayscale Visualization\n\n\n\nThis script returns a grayscale visualization of a digital elevation model, assigning continuous colors to the elevation borders.\n\nIt is possible to set custom min and max values in the evalscript by setting defaultVis to false and setting the min and max variables to the desired values.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/dem/dem-grayscale/)`,
  },
  {
    match: [{ datasourceId: DEM_MAPZEN, layerId: 'SEPIA' }],
    legend: {
      type: 'continuous',
      minPosition: -12000,
      maxPosition: 9000,
      gradients: [
        { position: '-12000', color: 'rgb(0%,0%,0%)', label: '-12.000' },
        { position: '-11000', color: 'rgb(2%,0%,2%)' },
        { position: '-10000', color: 'rgb(5%,3%,0%)' },
        { position: '-9000', color: 'rgb(9%,5%,1%)', label: '-1.000' },
        { position: '-8000', color: 'rgb(13%,7%,2%)' },
        { position: '-7000', color: 'rgb(17%,10%,3%)', label: '-200' },
        { position: '-6000', color: 'rgb(23%,13%,3%)' },
        { position: '-5000', color: 'rgb(31%,18%,5%)', label: '-20' },
        { position: '-4000', color: 'rgb(35%,20%,6%)' },
        { position: '-3000', color: 'rgb(39%,22%,6%)', label: '0' },
        { position: '-2000', color: 'rgb(43%,25%,7%)' },
        { position: '-1000', color: 'rgb(51%,29%,9%)', label: '10' },
        { position: '0', color: 'rgb(54%,32%,9%)' },
        { position: '1000', color: 'rgb(62%,36%,11%)', label: '200' },
        { position: '2000', color: 'rgb(70%,41%,12%)' },
        { position: '3000', color: 'rgb(78%,45%,13%)', label: '400' },
        { position: '4000', color: 'rgb(84%,49%,14%)' },
        { position: '5000', color: 'rgb(88%,51%,15%)', label: '1.000' },
        { position: '6000', color: 'rgb(92%,54%,16%)' },
        { position: '7000', color: 'rgb(96%,56%,16%)', label: '5.000' },
        { position: '8000', color: 'rgb(98%,57%,17%)' },
        { position: '9000', color: 'rgb(100%,58%,17%)', label: '9.000 [m]' },
      ],
    },
    description: () =>
      t`# Sepia Visualization\n\n\n\nThis script returns a sepia visualization of a digital elevation model, assigning continuous colors to the elevation borders.\n\nIt is possible to set custom min and max values in the evalscript by setting defaultVis to false and setting the min and max variables to the desired values.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/dem/dem-sepia/)`,
  },
  {
    match: [
      { datasourceId: DEM_COPERNICUS_30, layerId: 'SEPIA' },
      { datasourceId: DEM_COPERNICUS_90, layerId: 'SEPIA' },
      { datasourceId: DEM_COPERNICUS_30_CDAS, layerId: 'SEPIA' },
      { datasourceId: DEM_COPERNICUS_90_CDAS, layerId: 'SEPIA' },
    ],
    legend: {
      type: 'continuous',
      minPosition: -5000,
      maxPosition: 9000,
      gradients: [
        { position: '-4500', color: 'rgb(35%,20%,6%)', label: 'Below Sea Level' },
        { position: '-3000', color: 'rgb(39%,22%,6%)', label: '0' },
        { position: '-2000', color: 'rgb(43%,25%,7%)' },
        { position: '-1000', color: 'rgb(51%,29%,9%)', label: '10' },
        { position: '0', color: 'rgb(54%,32%,9%)' },
        { position: '1000', color: 'rgb(62%,36%,11%)', label: '200' },
        { position: '2000', color: 'rgb(70%,41%,12%)' },
        { position: '3000', color: 'rgb(78%,45%,13%)', label: '400' },
        { position: '4000', color: 'rgb(84%,49%,14%)' },
        { position: '5000', color: 'rgb(88%,51%,15%)', label: '1.000' },
        { position: '6000', color: 'rgb(92%,54%,16%)' },
        { position: '7000', color: 'rgb(96%,56%,16%)', label: '5.000' },
        { position: '8000', color: 'rgb(98%,57%,17%)' },
        { position: '9000', color: 'rgb(100%,58%,17%)', label: '9.000 [m]' },
      ],
    },
    description: () =>
      t`# Sepia Visualization\n\n\n\nThis script returns a sepia visualization of a digital elevation model, assigning continuous colors to the elevation borders.\n\nIt is possible to set custom min and max values in the evalscript by setting defaultVis to false and setting the min and max variables to the desired values.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/dem/dem-sepia/)`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_EW_HHHV, layerId: 'ENHANCED-VISUALIZATION-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_HHHV, layerId: 'ENHANCED-VISUALIZATION-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_VVVH, layerId: 'ENHANCED-VISUALIZATION-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_VVVH, layerId: 'ENHANCED-VISUALIZATION-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_HHHV, layerId: 'ENHANCED-VISUALIZATION-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_EW_VVVH, layerId: 'ENHANCED-VISUALIZATION-ORTHORECTIFIED' },
      { datasourceId: S1_MONTHLY_MOSAIC_DH, layerId: 'ENHANCED-VISUALIZATION' },
      { datasourceId: S1_MONTHLY_MOSAIC_IW, layerId: 'ENHANCED' },
    ],
    description: () =>
      t`# Enhanced visualization\n\nThis script combines the gamma0 of the VV and VH polarizations into a false color visualization. It displays water areas in blue (partially black) and land in different shades of yellow/green. Urban areas are displayed in a light green-yellow (towards white), vegetated areas in mustard green and bare ground in a darker green.\n\nFor snowy and icy areas, the visualization can vary from light green-yellow over brighter green to dark brown or even black. In order not to confuse cryogenic features with non-cryogenic ones, some general information about the location is helpful in interpreting the image.`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_EW_HHHV, layerId: '8_RGB-RATIO' },
      { datasourceId: S1_CDAS_EW_VVVH, layerId: '8_RGB-RATIO' },
      { datasourceId: S1_CDAS_SM_HHHV, layerId: '8_RGB-RATIO' },
      { datasourceId: S1_CDAS_SM_VVVH, layerId: '8_RGB-RATIO' },
      { datasourceId: S1_CDAS_IW_VVVH, layerId: '8_RGB-RATIO' },
      { datasourceId: S1_CDAS_IW_HHHV, layerId: '8_RGB-RATIO' },
      { datasourceId: S1_MONTHLY_MOSAIC_DH, layerId: '0-RGB-RATIO' },
      { datasourceId: S1_MONTHLY_MOSAIC_IW, layerId: '0-RGB-RATIO' },
    ],
    description: () =>
      t`# RGB ratio\n\nThis script combines the gamma0 of the VV and VH polarizations into a false color visualization. It uses the VV polarization in the red channel, the VH polarization in the green channel, and a ratio of VH/VV in the blue channel. It shows water areas in dark red (black), urban areas in yellow, vegetated areas in turquoise, and bare ground in dark purple.\n\nFor snowy and icy areas, the visualization can vary from light yellow to blue to red. In order not to confuse cryogenic features with non-cryogenic ones, some general information about the location is helpful in interpreting the image.`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_EW_HHHV, layerId: '9_SAR-URBAN' },
      { datasourceId: S1_CDAS_EW_VVVH, layerId: '9_SAR-URBAN' },
      { datasourceId: S1_CDAS_SM_HHHV, layerId: '9_SAR-URBAN' },
      { datasourceId: S1_CDAS_SM_VVVH, layerId: '9_SAR-URBAN' },
      { datasourceId: S1_CDAS_IW_VVVH, layerId: '9_SAR-URBAN' },
      { datasourceId: S1_CDAS_IW_HHHV, layerId: '9_SAR-URBAN' },
      { datasourceId: S1_MONTHLY_MOSAIC_DH, layerId: '1-SAR-URBAN' },
      { datasourceId: S1_MONTHLY_MOSAIC_IW, layerId: '1-SAR-URBAN' },
    ],
    description: () =>
      t`# SAR Urban\n\nThe script is useful for locating urban areas and individual buildings. It uses the gamma0 of the VH polarization and the VV polarizations to highlight different buildings and topology orientations with purple and green colors. It can be used to track urban expansion, estimate building type, or locate buildings in risk areas (e.g., flooding).\n\nFor snowy and icy areas, the visualization can vary from white to purple to dark blue or even black. In order not to confuse cryogenic features with non-cryogenic ones, some general information about the location is helpful to interpret the image. \n\n More info [here](https://custom-scripts.sentinel-hub.com/sentinel-1/urban_areas/).`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_EW_HHHV, layerId: 'EW-DH-HH-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_EW_HH, layerId: 'EW-SH-HH-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_HH, layerId: 'SM-SH-HH-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_HHHV, layerId: 'SM-DH-HH-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_HHHV, layerId: 'IW-DH-HH-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_HH, layerId: 'IW-SH-HH-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_MONTHLY_MOSAIC_DH, layerId: 'HH-DECIBEL-GAMMA0' },
    ],
    description: () =>
      t`# HH - decibel gamma0\n\nThis script displays a grayscale visualization of the gamma0 of the HH polarization. The HH polarization is less sensitive to surface roughness compared to the VV polarization and is therefore used for detecting objects and hard targets such as ships. It provides good contrast between water and land surfaces. Compared to the linear gamma0 visualization, the decibel gamma0 visualization includes a logarithmic scaling of the data.`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_EW_HHHV, layerId: 'EW-DH-HH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_EW_HH, layerId: 'EW-SH-HH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_HH, layerId: 'SM-SH-HH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_HHHV, layerId: 'SM-DH-HH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_HHHV, layerId: 'IW-DH-HH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_HH, layerId: 'IW-SH-HH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_MONTHLY_MOSAIC_DH, layerId: 'HH-LINEAR-GAMMA0' },
    ],
    description: () =>
      t`# HH - linear gamma0\n\nThis script displays a grayscale visualization of the gamma0 of the HH polarization. The HH polarization is less sensitive to surface roughness compared to the VV polarization and is therefore used for detecting objects and hard targets such as ships.`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_EW_HHHV, layerId: 'EW-DH-HV-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_HHHV, layerId: 'SM-DH-HV-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_HHHV, layerId: 'IW-DH-HV-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_MONTHLY_MOSAIC_DH, layerId: 'HV-DECIBEL-GAMMA0' },
    ],
    description: () =>
      t`# HV - decibel gamma0\n\nThis script displays a grayscale visualization of the gamma0 of the HV polarization. The values for the cross polarization (HV) are generally lower (darker visualization) than for the co-polarization (HH, VV). The HV polarization has higher values for surfaces characterized by volume scattering, e.g., branches, dry coil bodies, or canopies (lighter color in the visualization) and lower for surfaces with little to no scattering (darker color in the visualization). Compared to the linear gamma0 visualization, the decibel gamma0 visualization includes a logarithmic scaling of the data.`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_EW_HHHV, layerId: 'EW-DH-HV-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_HHHV, layerId: 'SM-DH-HV-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_HHHV, layerId: 'IW-DH-HV-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_MONTHLY_MOSAIC_DH, layerId: 'HV-LINEAR-GAMMA0' },
    ],
    description: () =>
      t`# HV - linear gamma0\n\nThis script displays a grayscale visualization of the gamma0 of the HV polarization. The values for the cross polarization (HV) are generally lower (darker visualization) than for the co-polarization (HH, VV). The HV polarization has higher values for surfaces characterized by volume scattering, e.g., branches, dry coil bodies, or canopies (lighter color in the visualization) and lower for surfaces with little to no scattering (darker color in the visualization).`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_IW_VVVH, layerId: 'IW-DV-VH-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_VVVH, layerId: 'SM-DV-VH-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_EW_VVVH, layerId: 'EW-DV-VH-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_MONTHLY_MOSAIC_IW, layerId: 'VH-DECIBEL-GAMMA0' },
    ],
    description: () =>
      t`# VH - decibel gamma0\n\nThis script displays a grayscale visualization of the gamma0 of the VH polarization. The values for the cross polarization (VH) are generally lower (darker visualization) than for the co-polarization (HH, VV). The VH polarization has higher values for surfaces characterized by volume scattering, e.g., branches, dry coil bodies, or canopies (lighter color in the visualization) and lower for surfaces with little to no scattering (darker color in the visualization). Compared to the linear gamma0 visualization, the decibel gamma0 visualization includes a logarithmic scaling of the data.`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_IW_VVVH, layerId: 'IW-DV-VH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_VVVH, layerId: 'SM-DV-VH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_EW_VVVH, layerId: 'EW-DV-VH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_MONTHLY_MOSAIC_IW, layerId: 'VH-LINEAR-GAMMA0' },
    ],
    description: () =>
      t`# VH - linear gamma0\n\nThis script displays a grayscale visualization of the gamma0 of the VH polarization. The values for the cross polarization (VH) are generally lower (darker visualization) than for the co-polarization (HH, VV).  The VH polarization has higher values for surfaces characterized by volume scattering, e.g., branches, dry coil bodies, or canopies (lighter color in the visualization) and lower for surfaces with little to no scattering (darker color in the visualization).`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_SM_VV, layerId: 'SM-DV-VH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_VV, layerId: 'IW-DV-VV-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_VVVH, layerId: 'IW-DV-VV-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_VVVH, layerId: 'SM-DV-VV-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_EW_VV, layerId: 'EW-DV-VV-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_EW_VVVH, layerId: 'EW-DV-VV-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_MONTHLY_MOSAIC_IW, layerId: 'VV-DECIBEL-GAMMA0' },
    ],
    description: () =>
      t`# VV - decibel gamma0\n\nThis script displays a grayscale visualization of the gamma0 of the VV polarization. Compared to the HH polarization, the VV polarization is more sensitive to surface roughness and is therefore often used in the detection of oil contamination or wake detection. Compared to the linear gamma0 visualization, the decibel gamma0 visualization includes a logarithmic scaling of the data.`,
  },

  {
    match: [
      { datasourceId: S1_CDAS_SM_VV, layerId: 'SM-DV-VV-DECIBEL-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_VV, layerId: 'IW-DV-VH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_IW_VVVH, layerId: 'IW-DV-VV-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_SM_VVVH, layerId: 'SM-DV-VV-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_EW_VV, layerId: 'EW-DV-VH-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_CDAS_EW_VVVH, layerId: 'EW-DV-VV-LINEAR-GAMMA0-ORTHORECTIFIED' },
      { datasourceId: S1_MONTHLY_MOSAIC_IW, layerId: 'VV-LINEAR-GAMMA0' },
    ],
    description: () =>
      t`# VV - linear gamma0\n\nThis script displays a grayscale visualization of the gamma0 of the VV polarization. Compared to the HH polarization, the VV polarization is more sensitive to surface roughness and is therefore often used in the detection of oil contamination or wake detection.`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_WATER, layerId: '3_WATER_TSM_NN' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 1,
      gradients: [
        { position: '0.0000', color: 'rgb(147, 0, 108)', label: '0' },
        { position: '0.0471', color: 'rgb(111, 0, 144)' },
        { position: '0.0980', color: 'rgb(72, 0, 183)' },
        { position: '0.1490', color: 'rgb(33, 0, 222)' },
        { position: '0.2000', color: 'rgb(0, 10, 255)' },
        { position: '0.2471', color: 'rgb(0, 74, 255)' },
        { position: '0.2980', color: 'rgb(0, 144, 255)' },
        { position: '0.3490', color: 'rgb(0, 213, 255)' },
        { position: '0.4000', color: 'rgb(0, 255, 215)' },
        { position: '0.4471', color: 'rgb(0, 255, 119)' },
        { position: '0.4980', color: 'rgb(0, 255, 15)' },
        { position: '0.5490', color: 'rgb(96, 255, 0)' },
        { position: '0.6000', color: 'rgb(200, 255, 0)' },
        { position: '0.6471', color: 'rgb(255, 235, 0)' },
        { position: '0.6980', color: 'rgb(255, 183, 0)' },
        { position: '0.7490', color: 'rgb(255, 131, 0)' },
        { position: '0.8000', color: 'rgb(255, 79, 0)' },
        { position: '0.8471', color: 'rgb(255, 31, 0)' },
        { position: '0.8980', color: 'rgb(230, 0, 0)' },
        { position: '0.9490', color: 'rgb(165, 0, 0)' },
        { position: '1.0000', color: 'rgb(105, 0, 0)', label: '3' },
      ],
    },
    description: () =>
      t`# Total suspended matter concentration\n\nSatellite-derived total suspended matter (TSM) is a measure of the concentration of particulate material in surface water such as mud, silt and other fine-grainded sedimentss, including organic and inorganic fractions. The TSM product is calculated based on the MERIS 1999 Baseline Atmospheric Correction and the OCI neural net TSM algorithm by [Hieronymi et al. 2017](https://www.frontiersin.org/journals/marine-science/articles/10.3389/fmars.2017.00140/full). The product has variable accuracy and schould be considert experimental.\n\nMore info [here](https://eastcoast.coastwatch.noaa.gov/cw_olci_tsmnn.php).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_WATER, layerId: '7_WATER_T865' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 1,
      gradients: [
        { position: '0.0000', color: 'rgb(147, 0, 108)', label: '0' },
        { position: '0.0471', color: 'rgb(111, 0, 144)' },
        { position: '0.0980', color: 'rgb(72, 0, 183)' },
        { position: '0.1490', color: 'rgb(33, 0, 222)' },
        { position: '0.2000', color: 'rgb(0, 10, 255)' },
        { position: '0.2471', color: 'rgb(0, 74, 255)' },
        { position: '0.2980', color: 'rgb(0, 144, 255)' },
        { position: '0.3490', color: 'rgb(0, 213, 255)' },
        { position: '0.4000', color: 'rgb(0, 255, 215)' },
        { position: '0.4471', color: 'rgb(0, 255, 119)' },
        { position: '0.4980', color: 'rgb(0, 255, 15)' },
        { position: '0.5490', color: 'rgb(96, 255, 0)' },
        { position: '0.6000', color: 'rgb(200, 255, 0)' },
        { position: '0.6471', color: 'rgb(255, 235, 0)' },
        { position: '0.6980', color: 'rgb(255, 183, 0)' },
        { position: '0.7490', color: 'rgb(255, 131, 0)' },
        { position: '0.8000', color: 'rgb(255, 79, 0)' },
        { position: '0.8471', color: 'rgb(255, 31, 0)' },
        { position: '0.8980', color: 'rgb(230, 0, 0)' },
        { position: '0.9490', color: 'rgb(165, 0, 0)' },
        { position: '1.0000', color: 'rgb(105, 0, 0)', label: '1' },
      ],
    },
    description: () =>
      t`# Aerosol optical thickness\n\nAerosol optical thickness (AOT) is a measure of the extent to which aerosols in the atmosphere prevent the transmission of light through absorption and scattering. Optical thickness, also knwon as optical depth depends on the physical nature, the shape and the concentration of particles. AOT is often used in climatology and atmospheric research to assess the effects of aerosols on weather, climate, and air quality.\n\nMore info [here](https://earth.gsfc.nasa.gov/climate/data/deep-blue/science).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_WATER, layerId: '4_WATER_PAR' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 1,
      gradients: [
        { position: '0.0000', color: 'rgb(147, 0, 108)', label: '1200' },
        { position: '0.0471', color: 'rgb(111, 0, 144)' },
        { position: '0.0980', color: 'rgb(72, 0, 183)' },
        { position: '0.1490', color: 'rgb(33, 0, 222)' },
        { position: '0.2000', color: 'rgb(0, 10, 255)' },
        { position: '0.2471', color: 'rgb(0, 74, 255)' },
        { position: '0.2980', color: 'rgb(0, 144, 255)' },
        { position: '0.3490', color: 'rgb(0, 213, 255)' },
        { position: '0.4000', color: 'rgb(0, 255, 215)' },
        { position: '0.4471', color: 'rgb(0, 255, 119)' },
        { position: '0.4980', color: 'rgb(0, 255, 15)' },
        { position: '0.5490', color: 'rgb(96, 255, 0)' },
        { position: '0.6000', color: 'rgb(200, 255, 0)' },
        { position: '0.6471', color: 'rgb(255, 235, 0)' },
        { position: '0.6980', color: 'rgb(255, 183, 0)' },
        { position: '0.7490', color: 'rgb(255, 131, 0)' },
        { position: '0.8000', color: 'rgb(255, 79, 0)' },
        { position: '0.8471', color: 'rgb(255, 31, 0)' },
        { position: '0.8980', color: 'rgb(230, 0, 0)' },
        { position: '0.9490', color: 'rgb(165, 0, 0)' },
        { position: '1.0000', color: 'rgb(105, 0, 0)', label: '1600' },
      ],
    },
    description: () =>
      t`# Photosynthetically active radiation\n\nThe Photosynthetically Active Radiation (PAR) visualization displays the instantaneous PAR at the water surface. It was adopted from FERIS and developed based on an algorithm by [Aiken and Moore (1997)](https://earth.esa.int/eogateway/documents/20142/37627/MERIS_ATBD_2.18_v4.0+-+1997+-+PAR.pdf/07a8cd-YOUR-INSTANCEID-HERE). The PAR is a measure of the energy flux from the sun in the wavelenght range of 400–700 nm. It is often used to convert measured chlorophyll concentration into an estimate of ocen productivity and from this an estimate of the carbon sequestration. As such, it plays an important role in modelling of the carbon-cycle.\n\nMore info [here](https://user.eumetsat.int/resources/user-guides/sentinel-3-ocean-colour-level-2-data-guide#ID-Data).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_WATER, layerId: '5_WATER_KD490_M07' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 1,
      gradients: [
        { position: '0.0000', color: 'rgb(147, 0, 108)', label: '-1.2' },
        { position: '0.0471', color: 'rgb(111, 0, 144)' },
        { position: '0.0980', color: 'rgb(72, 0, 183)' },
        { position: '0.1490', color: 'rgb(33, 0, 222)' },
        { position: '0.2000', color: 'rgb(0, 10, 255)' },
        { position: '0.2471', color: 'rgb(0, 74, 255)' },
        { position: '0.2980', color: 'rgb(0, 144, 255)' },
        { position: '0.3490', color: 'rgb(0, 213, 255)' },
        { position: '0.4000', color: 'rgb(0, 255, 215)' },
        { position: '0.4471', color: 'rgb(0, 255, 119)' },
        { position: '0.4980', color: 'rgb(0, 255, 15)' },
        { position: '0.5490', color: 'rgb(96, 255, 0)' },
        { position: '0.6000', color: 'rgb(200, 255, 0)' },
        { position: '0.6471', color: 'rgb(255, 235, 0)' },
        { position: '0.6980', color: 'rgb(255, 183, 0)' },
        { position: '0.7490', color: 'rgb(255, 131, 0)' },
        { position: '0.8000', color: 'rgb(255, 79, 0)' },
        { position: '0.8471', color: 'rgb(255, 31, 0)' },
        { position: '0.8980', color: 'rgb(230, 0, 0)' },
        { position: '0.9490', color: 'rgb(165, 0, 0)' },
        { position: '1.0000', color: 'rgb(105, 0, 0)', label: '1.0' },
      ],
    },
    description: () =>
      t`# Diffuse attenuation coefficient\n\nThe diffuse attenuation coefficient at 490 nm is a measure of how the intensity of light decreases as it passes through a column of water. It quantifies the rate at which light is absorbed and scattered by water and its constituents, such as phytoplankton, dissolved organic matter and suspended particles. This coefficient is crucial for understanding underwater light environments and is widely used in marine biology, oceanography and environmental science. It's calculated as described in [Morel et al. (2007)](https://www.sciencedirect.com/science/article/abs/pii/S0034425707001307).\n\nMore info [here](https://user.eumetsat.int/resources/user-guides/sentinel-3-ocean-colour-level-2-data-guide#ID-Data).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_WATER, layerId: '1_WATER_IWV_W' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 1,
      gradients: [
        { position: '0.0000', color: 'rgb(147, 0, 108)', label: '1' },
        { position: '0.0471', color: 'rgb(111, 0, 144)' },
        { position: '0.0980', color: 'rgb(72, 0, 183)' },
        { position: '0.1490', color: 'rgb(33, 0, 222)' },
        { position: '0.2000', color: 'rgb(0, 10, 255)' },
        { position: '0.2471', color: 'rgb(0, 74, 255)' },
        { position: '0.2980', color: 'rgb(0, 144, 255)' },
        { position: '0.3490', color: 'rgb(0, 213, 255)' },
        { position: '0.4000', color: 'rgb(0, 255, 215)' },
        { position: '0.4471', color: 'rgb(0, 255, 119)' },
        { position: '0.4980', color: 'rgb(0, 255, 15)' },
        { position: '0.5490', color: 'rgb(96, 255, 0)' },
        { position: '0.6000', color: 'rgb(200, 255, 0)' },
        { position: '0.6471', color: 'rgb(255, 235, 0)' },
        { position: '0.6980', color: 'rgb(255, 183, 0)' },
        { position: '0.7490', color: 'rgb(255, 131, 0)' },
        { position: '0.8000', color: 'rgb(255, 79, 0)' },
        { position: '0.8471', color: 'rgb(255, 31, 0)' },
        { position: '0.8980', color: 'rgb(230, 0, 0)' },
        { position: '0.9490', color: 'rgb(165, 0, 0)' },
        { position: '1.0000', color: 'rgb(105, 0, 0)', label: '70' },
      ],
    },
    description: () =>
      t`# Integrated water vapour column\n\nThe integrated water vapour column displays the water vapour integrated over an atmosphere column. It is displayed in kg/m2 and calculated on the basis of band 18 (885 nm) and band 19 (900 nm). The product shows an overestimation in the transition zones between glint and off-glint and has a systematic overestimation of about 20%.\n\nMore info [here](https://sentiwiki.copernicus.eu/web/olci-products#OLCIProducts-IntegratedWaterVapourColumnoverLandS3-OLCI-Products-L2-Land-IWV).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_WATER, layerId: '2_WATER_CHL_OC4ME' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 1,
      gradients: [
        { position: '0.0000', color: 'rgb(147, 0, 108)', label: '0' },
        { position: '0.0471', color: 'rgb(111, 0, 144)' },
        { position: '0.0980', color: 'rgb(72, 0, 183)' },
        { position: '0.1490', color: 'rgb(33, 0, 222)' },
        { position: '0.2000', color: 'rgb(0, 10, 255)' },
        { position: '0.2471', color: 'rgb(0, 74, 255)' },
        { position: '0.2980', color: 'rgb(0, 144, 255)' },
        { position: '0.3490', color: 'rgb(0, 213, 255)' },
        { position: '0.4000', color: 'rgb(0, 255, 215)' },
        { position: '0.4471', color: 'rgb(0, 255, 119)' },
        { position: '0.4980', color: 'rgb(0, 255, 15)' },
        { position: '0.5490', color: 'rgb(96, 255, 0)' },
        { position: '0.6000', color: 'rgb(200, 255, 0)' },
        { position: '0.6471', color: 'rgb(255, 235, 0)' },
        { position: '0.6980', color: 'rgb(255, 183, 0)' },
        { position: '0.7490', color: 'rgb(255, 131, 0)' },
        { position: '0.8000', color: 'rgb(255, 79, 0)' },
        { position: '0.8471', color: 'rgb(255, 31, 0)' },
        { position: '0.8980', color: 'rgb(230, 0, 0)' },
        { position: '0.9490', color: 'rgb(165, 0, 0)' },
        { position: '1.0000', color: 'rgb(105, 0, 0)', label: '2' },
      ],
    },
    description: () =>
      t`# Algal pigment concentration (open waters)\n\nOcean Colour for MERIS (OC4Me) developed by [Morel et al. (2007)](https://www.sciencedirect.com/science/article/abs/pii/S0034425707001307) and CI developed by [Hu et al. (2012)](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2011JC007395).\n\nMore info [here](https://user.eumetsat.int/resources/user-guides/sentinel-3-ocean-colour-level-2-data-guide#ID-Data).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_WATER, layerId: '8_WATER_CHL_NN' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 1,
      gradients: [
        { position: '0.0000', color: 'rgb(147, 0, 108)', label: '0' },
        { position: '0.0471', color: 'rgb(111, 0, 144)' },
        { position: '0.0980', color: 'rgb(72, 0, 183)' },
        { position: '0.1490', color: 'rgb(33, 0, 222)' },
        { position: '0.2000', color: 'rgb(0, 10, 255)' },
        { position: '0.2471', color: 'rgb(0, 74, 255)' },
        { position: '0.2980', color: 'rgb(0, 144, 255)' },
        { position: '0.3490', color: 'rgb(0, 213, 255)' },
        { position: '0.4000', color: 'rgb(0, 255, 215)' },
        { position: '0.4471', color: 'rgb(0, 255, 119)' },
        { position: '0.4980', color: 'rgb(0, 255, 15)' },
        { position: '0.5490', color: 'rgb(96, 255, 0)' },
        { position: '0.6000', color: 'rgb(200, 255, 0)' },
        { position: '0.6471', color: 'rgb(255, 235, 0)' },
        { position: '0.6980', color: 'rgb(255, 183, 0)' },
        { position: '0.7490', color: 'rgb(255, 131, 0)' },
        { position: '0.8000', color: 'rgb(255, 79, 0)' },
        { position: '0.8471', color: 'rgb(255, 31, 0)' },
        { position: '0.8980', color: 'rgb(230, 0, 0)' },
        { position: '0.9490', color: 'rgb(165, 0, 0)' },
        { position: '1.0000', color: 'rgb(105, 0, 0)', label: '2' },
      ],
    },
    description: () =>
      t`# Algal pigment concentration (complex waters)\n\nOcean Colour for MERIS (OC4Me) developed by [Morel et al. (2007)](https://www.sciencedirect.com/science/article/abs/pii/S0034425707001307) and CI developed by [Hu et al. (2012)](https://agupubs.onlinelibrary.wiley.com/doi/10.1029/2011JC007395).\n\nMore info [here](https://user.eumetsat.int/resources/user-guides/sentinel-3-ocean-colour-level-2-data-guide#ID-Data).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_WATER, layerId: '9_WATER_ADG443_NN' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 1,
      gradients: [
        { position: '0.0000', color: 'rgb(147, 0, 108)', label: '-1.3' },
        { position: '0.0471', color: 'rgb(111, 0, 144)' },
        { position: '0.0980', color: 'rgb(72, 0, 183)' },
        { position: '0.1490', color: 'rgb(33, 0, 222)' },
        { position: '0.2000', color: 'rgb(0, 10, 255)' },
        { position: '0.2471', color: 'rgb(0, 74, 255)' },
        { position: '0.2980', color: 'rgb(0, 144, 255)' },
        { position: '0.3490', color: 'rgb(0, 213, 255)' },
        { position: '0.4000', color: 'rgb(0, 255, 215)' },
        { position: '0.4471', color: 'rgb(0, 255, 119)' },
        { position: '0.4980', color: 'rgb(0, 255, 15)' },
        { position: '0.5490', color: 'rgb(96, 255, 0)' },
        { position: '0.6000', color: 'rgb(200, 255, 0)' },
        { position: '0.6471', color: 'rgb(255, 235, 0)' },
        { position: '0.6980', color: 'rgb(255, 183, 0)' },
        { position: '0.7490', color: 'rgb(255, 131, 0)' },
        { position: '0.8000', color: 'rgb(255, 79, 0)' },
        { position: '0.8471', color: 'rgb(255, 31, 0)' },
        { position: '0.8980', color: 'rgb(230, 0, 0)' },
        { position: '0.9490', color: 'rgb(165, 0, 0)' },
        { position: '1.0000', color: 'rgb(105, 0, 0)', label: '1.3' },
      ],
    },
    description: () =>
      t`# CDM absorption coefficient\n\nThe Coloured Detrital and Dissolved Material (CDM) absorption coefficient at 443 nm indicates the fraction of incident light that is absorbed by both detrital particles and colored dissolved organic matter (CDOM). Dissolved organic matter is an important component of the oceanic carbon cycle. It is also used as an indicator for assessing the impact of terrigenous inputs in coastal waters.\n\nMore info [here](https://data.jrc.ec.europa.eu/dataset/b2c93f-YOUR-INSTANCEID-HERE).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_WATER, layerId: '6_WATER_A865' }],
    legend: {
      type: 'continuous',
      minPosition: 0,
      maxPosition: 1,
      gradients: [
        { position: '0.0000', color: 'rgb(147, 0, 108)', label: '0' },
        { position: '0.0471', color: 'rgb(111, 0, 144)' },
        { position: '0.0980', color: 'rgb(72, 0, 183)' },
        { position: '0.1490', color: 'rgb(33, 0, 222)' },
        { position: '0.2000', color: 'rgb(0, 10, 255)' },
        { position: '0.2471', color: 'rgb(0, 74, 255)' },
        { position: '0.2980', color: 'rgb(0, 144, 255)' },
        { position: '0.3490', color: 'rgb(0, 213, 255)' },
        { position: '0.4000', color: 'rgb(0, 255, 215)' },
        { position: '0.4471', color: 'rgb(0, 255, 119)' },
        { position: '0.4980', color: 'rgb(0, 255, 15)' },
        { position: '0.5490', color: 'rgb(96, 255, 0)' },
        { position: '0.6000', color: 'rgb(200, 255, 0)' },
        { position: '0.6471', color: 'rgb(255, 235, 0)' },
        { position: '0.6980', color: 'rgb(255, 183, 0)' },
        { position: '0.7490', color: 'rgb(255, 131, 0)' },
        { position: '0.8000', color: 'rgb(255, 79, 0)' },
        { position: '0.8471', color: 'rgb(255, 31, 0)' },
        { position: '0.8980', color: 'rgb(230, 0, 0)' },
        { position: '0.9490', color: 'rgb(165, 0, 0)' },
        { position: '1.0000', color: 'rgb(105, 0, 0)', label: '2' },
      ],
    },
    description: () =>
      t`# Aerosol Angstrom exponent\n\nThe Aerosol Angstrom exponent is a parameter that describes how the optical thickness of aerosols in the atmosphere varies with wavelength. It provides information about the size distribution of aerosol particles, with higher values indicating smaller particles and lower values indicating larger particles. This exponent is often used in atmospheric research and climatology to analyse the properties of aerosols and their effects on climate and air quality.\n\nMore info [here](https://earth.gsfc.nasa.gov/climate/data/deep-blue/science).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_LAND, layerId: '5_LAND_RC865' }],
    description: () =>
      t`# Rectified reflectance 779\n\nThe rectified reflectance product is a by-product of the GIFAPAR product. It shows a virtual reflectance that is largely free of atmospheric and angular effects and is a good approcimation of the top of the canopy reflectances. The rectified reflectance 779 is based on the NIR band (band 17) with a wavelength of 779 nm.\n\nMore info [here](https://sentiwiki.copernicus.eu/web/olci-products#OLCIProducts-RectifiedReflectanceS3-OLCI-Products-L2-Land-RC).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_LAND, layerId: '4_LAND_RC681' }],
    description: () =>
      t`# Rectified reflectance 681\n\nThe rectified reflectance product is a by-product of the GIFAPAR product. It shows a virtual reflectance that is largely free of atmospheric and angular effects and is a good approcimation of the top of the canopy reflectances. The rectified reflectance 681 is based on the red band (band 10) with a wavelength of 681 nm.\n\nMore info [here](https://sentiwiki.copernicus.eu/web/olci-products#OLCIProducts-RectifiedReflectanceS3-OLCI-Products-L2-Land-RC).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_LAND, layerId: '1_LAND_GIFAPAR' }],
    description: () =>
      t`# Green Instantaneous Fraction of Absorbed Photosynthetically Available Radiation (GIFAPAR)\n\nThe Green Instantaneous Fraction of Absorbed Photosynthetically Available Radiation (GIFAPAR) is a bio-geophysical product used to study the photosynthetic process of plants and is often used in diagnostic and predictive models computing primary productivity of the vegetation canopies. In addition, this parameter is also an input for the estimation of assimilation of CO2 in vegetation. GIFAPAR ranges from 0–1.\n\nMore info [here](https://sentinel.esa.int/documents/247904/2702575/Sentinel-3-OLCI-Product-Notice-Level-2-Land).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_LAND, layerId: '2_LAND_IWV_L' }],
    description: () =>
      t`# Integrated water vapour column\n\nThe integrated water vapour column displays the water vapour integrated over an atmosphere column. It is displayed in kg/m2 and calculated on the basis of band 18 (885 nm) and band 19 (900 nm). The product provides stable and high quality results, but shows a systematic overestimation of about 9%–13% copared to ground base reference.\n\nMore info [here](https://sentiwiki.copernicus.eu/web/olci-products#OLCIProducts-IntegratedWaterVapourColumnoverLandS3-OLCI-Products-L2-Land-IWV).`,
  },
  {
    match: [{ datasourceId: S3OLCIL2_LAND, layerId: '3_LAND_OTCI' }],
    description: () =>
      t`# Terrestrial Chlorophyll Index (OTCI)\n\n\n\nThe Terrestrial Chlorophyll Index (OTCI) is estimated based on the chlorophyll content in terrestrial vegetation and can be used to monitor vegetation condition and health. Low OTCI values usually signify water, sand or snow. Extremely high values, displayed with white, usually suggest the absence of chlorophyll as well. They generally represent either bare ground, rock or clouds. The chlorophyll values in between range from red (low chlorophyll values) to dark green (high chlorophyll values) can be used to determine vegetation health.\n\n\n\nMore info [here.](https://custom-scripts.sentinel-hub.com/sentinel-3/otci/)`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL, layerId: 'NDVI' }],
    description: () =>
      t`NDVI, or Normalized Difference Vegetation Index, is a dimensionless index that is indicative for vegetation density and is calculated by comparing the visible and near-infrared sunlight reflected by the surface (reflectance). The CGLS NDVI V3 product is a 10-day synthesis product derived from SPOT/VEGETATION or PROBA-V top-of-atmosphere orbital segments.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL, layerId: 'NOBS' }],
    description: () =>
      t`The NOBS variable contains the number of observations used in the inversion procedure.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL, layerId: 'QFLAGS' }],
    description: () =>
      t`The QFLAG (quality flag) of the NDVI V3 describes the BRDF inversion quality in both RED and NIR bands.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL, layerId: 'TIMEGRID' }],
    description: () =>
      t`The TIMEGRID (Time Grid) variable indicates the median date of the observations used in the BRDF modelling. It provides an indication of the most representative date of the observations used to compute the BRDF corrected NDVI. Hence, it is recommended to use this layer for time series analyses. Time is measured in minutes passed since the start time of the synthesis, hence day 01, 11 or 21 of the 10-day period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL, layerId: 'UNC' }],
    description: () => t`"The UNC variable contains the uncertainty associated to the angular normalized NDVI
estimation. The uncertainties of the normalized reflectances are estimated by propagating the
uncertainties associated to the BRDF model parameters found via the inversion."`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_BURNT_AREA_DAILY, layerId: 'day_of_burn' }],
    description: () => t`The Burn Scar layer indicates detected burn scars for a given day.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_BURNT_AREA_MONTHLY, layerId: 'day_of_burn' }],
    description: () => t`The Burn Scar layer indicates detected burn scars for a given month.`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_DMP_1KM_10DAILY, layerId: 'DMP' },
      { datasourceId: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0, layerId: 'DMP' },
      { datasourceId: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1, layerId: 'DMP' },
      { datasourceId: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2, layerId: 'DMP' },
      { datasourceId: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6, layerId: 'DMP' },
      { datasourceId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT0, layerId: 'DMP' },
      { datasourceId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT1, layerId: 'DMP' },
      { datasourceId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT2, layerId: 'DMP' },
      { datasourceId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT5, layerId: 'DMP' },
      { datasourceId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT6, layerId: 'DMP' },
    ],
    description: () =>
      t`DMP, or Dry Matter Productivity, represents the overall growth rate or dry biomass increase of the vegetation, expressed in kilograms of dry matter per hectare per day (kgDM/ha/day). DMP is directly related to NPP (Net Primary Productivity, in gC/m²/day), but its units are customized for agro-statistical purposes. `,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_DMP_1KM_10DAILY, layerId: 'QFLAG' },
      { datasourceId: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0, layerId: 'QFLAG' },
      { datasourceId: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1, layerId: 'QFLAG' },
      { datasourceId: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2, layerId: 'QFLAG' },
      { datasourceId: COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6, layerId: 'QFLAG' },
      { datasourceId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT0, layerId: 'QFLAG' },
      { datasourceId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT1, layerId: 'QFLAG' },
      { datasourceId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT2, layerId: 'QFLAG' },
      { datasourceId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT5, layerId: 'QFLAG' },
      { datasourceId: COPERNICUS_CLMS_DMP_300M_10DAILY_RT6, layerId: 'QFLAG' },
    ],
    description: () =>
      t`Quality flag of the product. For more information, refer to the Product User Manual.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_FAPAR_1KM_10DAILY, layerId: 'FAPAR' }],
    description: () =>
      t`FAPAR corresponds to the fraction of photosynthetically active radiation absorbed by the green elements of the canopy. The FAPAR value results directly from the radiative transfer model in the canopy which is computed instantaneously. It depends on canopy structure, vegetation element optical properties and illumination conditions. FAPAR is very useful as input to a number of primary productivity models based on simple efficiency considerations.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT0, layerId: 'FAPAR' }],
    description: () =>
      t`FAPAR corresponds to the fraction of photosynthetically active radiation absorbed by the green elements of the canopy. The FAPAR value results directly from the radiative transfer model in the canopy which is computed instantaneously. It depends on canopy structure, vegetation element optical properties and illumination conditions. FAPAR is very useful as input to a number of primary productivity models based on simple efficiency considerations.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT1, layerId: 'FAPAR' }],
    description: () =>
      t`FAPAR corresponds to the fraction of photosynthetically active radiation absorbed by the green elements of the canopy. The FAPAR value results directly from the radiative transfer model in the canopy which is computed instantaneously. It depends on canopy structure, vegetation element optical properties and illumination conditions. FAPAR is very useful as input to a number of primary productivity models based on simple efficiency considerations.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT2, layerId: 'FAPAR' }],
    description: () =>
      t`FAPAR corresponds to the fraction of photosynthetically active radiation absorbed by the green elements of the canopy. The FAPAR value results directly from the radiative transfer model in the canopy which is computed instantaneously. It depends on canopy structure, vegetation element optical properties and illumination conditions. FAPAR is very useful as input to a number of primary productivity models based on simple efficiency considerations.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT6, layerId: 'FAPAR' }],
    description: () =>
      t`FAPAR corresponds to the fraction of photosynthetically active radiation absorbed by the green elements of the canopy. The FAPAR value results directly from the radiative transfer model in the canopy which is computed instantaneously. It depends on canopy structure, vegetation element optical properties and illumination conditions. FAPAR is very useful as input to a number of primary productivity models based on simple efficiency considerations.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_FAPAR_300M_10DAILY, layerId: 'FAPAR' }],
    description: () =>
      t`FAPAR corresponds to the fraction of photosynthetically active radiation absorbed by the green elements of the canopy. The FAPAR value results directly from the radiative transfer model in the canopy which is computed instantaneously. It depends on canopy structure, vegetation element optical properties and illumination conditions. FAPAR is very useful as input to a number of primary productivity models based on simple efficiency considerations.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0, layerId: 'FAPAR' }],
    description: () =>
      t`FAPAR corresponds to the fraction of photosynthetically active radiation absorbed by the green elements of the canopy. The FAPAR value results directly from the radiative transfer model in the canopy which is computed instantaneously. It depends on canopy structure, vegetation element optical properties and illumination conditions. FAPAR is very useful as input to a number of primary productivity models based on simple efficiency considerations.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT1, layerId: 'FAPAR' }],
    description: () =>
      t`FAPAR corresponds to the fraction of photosynthetically active radiation absorbed by the green elements of the canopy. The FAPAR value results directly from the radiative transfer model in the canopy which is computed instantaneously. It depends on canopy structure, vegetation element optical properties and illumination conditions. FAPAR is very useful as input to a number of primary productivity models based on simple efficiency considerations.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT2, layerId: 'FAPAR' }],
    description: () =>
      t`FAPAR corresponds to the fraction of photosynthetically active radiation absorbed by the green elements of the canopy. The FAPAR value results directly from the radiative transfer model in the canopy which is computed instantaneously. It depends on canopy structure, vegetation element optical properties and illumination conditions. FAPAR is very useful as input to a number of primary productivity models based on simple efficiency considerations.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT6, layerId: 'FAPAR' }],
    description: () =>
      t`FAPAR corresponds to the fraction of photosynthetically active radiation absorbed by the green elements of the canopy. The FAPAR value results directly from the radiative transfer model in the canopy which is computed instantaneously. It depends on canopy structure, vegetation element optical properties and illumination conditions. FAPAR is very useful as input to a number of primary productivity models based on simple efficiency considerations.`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_FCOVER_1KM_10DAILY, layerId: 'FCOVER' },
      { datasourceId: COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT0, layerId: 'FCOVER' },
      { datasourceId: COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT1, layerId: 'FCOVER' },
      { datasourceId: COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT2, layerId: 'FCOVER' },
      { datasourceId: COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT6, layerId: 'FCOVER' },
    ],
    description: () =>
      t`FCover is defined as the fraction of ground surface covered by green vegetation as seen from the nadir direction. It is used to separate vegetation and soil in energy balance processes, including temperature and evapotranspiration. It is computed from the leaf area index and other canopy structural variables and does not depend on variables such as the geometry of illumination as compared to FAPAR. For this reason, it is a very good candidate for the replacement of classical vegetation indices for the monitoring of green vegetation. Because of the linear relationship with radiometric signal, FCover will be only marginally scale dependent. Note that similarly to LAI and FAPAR, only the green elements will be considered, either belonging both to the overstory and understory.`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_FCOVER_300M_10DAILY, layerId: 'FCOVER' },
      { datasourceId: COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT0, layerId: 'FCOVER' },
      { datasourceId: COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT1, layerId: 'FCOVER' },
      { datasourceId: COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT2, layerId: 'FCOVER' },
      { datasourceId: COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT6, layerId: 'FCOVER' },
    ],
    description: () =>
      t`FCover is defined as the fraction of ground surface covered by green vegetation as seen from the nadir direction. It is used to separate vegetation and soil in energy balance processes, including temperature and evapotranspiration. It is computed from the leaf area index and other canopy structural variables and does not depend on variables such as the geometry of illumination as compared to FAPAR. For this reason, it is a very good candidate for the replacement of classical vegetation indices for the monitoring of green vegetation. Because of the linear relationship with radiometric signal, FCover will be only marginally scale dependent. Note that similarly to LAI and FAPAR, only the green elements will be considered, either belonging both to the overstory and understory.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_GPP_300M_10DAILY_RT0, layerId: 'GPP' }],
    description: () =>
      t`Gross Primary Production (GPP) expresses a component of Primary Production of ecosystems related to the creation of new organic matter by vegetation. GPP is the total amount of dry matter (carbon) "fixed" by land plants per unit time through photosynthesis (atmospheric CO2 into organic compounds). A substantial fraction of GPP supports plant autotrophic respiration (Ra). GPP is typically expressed as gram of carbon per square meter per day (gC/m2 /day).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_GPP_300M_10DAILY_RT1, layerId: 'GPP' }],
    description: () =>
      t`Gross Primary Production (GPP) expresses a component of Primary Production of ecosystems related to the creation of new organic matter by vegetation. GPP is the total amount of dry matter (carbon) "fixed" by land plants per unit time through photosynthesis (atmospheric CO2 into organic compounds). A substantial fraction of GPP supports plant autotrophic respiration (Ra). GPP is typically expressed as gram of carbon per square meter per day (gC/m2 /day).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_GPP_300M_10DAILY_RT2, layerId: 'GPP' }],
    description: () =>
      t`Gross Primary Production (GPP) expresses a component of Primary Production of ecosystems related to the creation of new organic matter by vegetation. GPP is the total amount of dry matter (carbon) "fixed" by land plants per unit time through photosynthesis (atmospheric CO2 into organic compounds). A substantial fraction of GPP supports plant autotrophic respiration (Ra). GPP is typically expressed as gram of carbon per square meter per day (gC/m2 /day).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_GPP_300M_10DAILY_RT6, layerId: 'GPP' }],
    description: () =>
      t`Gross Primary Production (GPP) expresses a component of Primary Production of ecosystems related to the creation of new organic matter by vegetation. GPP is the total amount of dry matter (carbon) "fixed" by land plants per unit time through photosynthesis (atmospheric CO2 into organic compounds). A substantial fraction of GPP supports plant autotrophic respiration (Ra). GPP is typically expressed as gram of carbon per square meter per day (gC/m2 /day).`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_LAI_300M_10DAILY, layerId: 'LAI' },
      { datasourceId: COPERNICUS_CLMS_LAI_300M_10DAILY_RT0, layerId: 'LAI' },
      { datasourceId: COPERNICUS_CLMS_LAI_300M_10DAILY_RT1, layerId: 'LAI' },
      { datasourceId: COPERNICUS_CLMS_LAI_300M_10DAILY_RT2, layerId: 'LAI' },
      { datasourceId: COPERNICUS_CLMS_LAI_300M_10DAILY_RT6, layerId: 'LAI' },
    ],
    description: () =>
      t`LAI is defined as half the developed area of photosynthetically active elements of the vegetation per unit horizontal ground area. It determines the size of the interface for exchange of energy (including radiation) and mass between the canopy and the atmosphere. This is an intrinsic canopy primary variable that should not depend on observation conditions. LAI is strongly non-linearly related to reflectance. Therefore, its estimation from remote sensing observations is scale dependent.`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_LAI_1KM_10DAILY, layerId: 'LAI' },
      { datasourceId: COPERNICUS_CLMS_LAI_1KM_10DAILY_RT0, layerId: 'LAI' },
      { datasourceId: COPERNICUS_CLMS_LAI_1KM_10DAILY_RT1, layerId: 'LAI' },
      { datasourceId: COPERNICUS_CLMS_LAI_1KM_10DAILY_RT2, layerId: 'LAI' },
      { datasourceId: COPERNICUS_CLMS_LAI_1KM_10DAILY_RT6, layerId: 'LAI' },
    ],
    description: () =>
      t`LAI is defined as half the developed area of photosynthetically active elements of the vegetation per unit horizontal ground area. It determines the size of the interface for exchange of energy (including radiation) and mass between the canopy and the atmosphere. This is an intrinsic canopy primary variable that should not depend on observation conditions. LAI is strongly non-linearly related to reflectance.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NPP_300M_10DAILY_RT0, layerId: 'NPP' }],
    description: () =>
      t`"NPP, or Net Primary Production, is an indicator of the rate at which plants produce net useful chemical energy expressed in mass of carbon per unit area per day (gC/m²/day)."`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NPP_300M_10DAILY_RT1, layerId: 'NPP' }],
    description: () =>
      t`"NPP, or Net Primary Production, is an indicator of the rate at which plants produce net useful chemical energy expressed in mass of carbon per unit area per day (gC/m²/day)."`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NPP_300M_10DAILY_RT2, layerId: 'NPP' }],
    description: () =>
      t`"NPP, or Net Primary Production, is an indicator of the rate at which plants produce net useful chemical energy expressed in mass of carbon per unit area per day (gC/m²/day)."`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NPP_300M_10DAILY_RT6, layerId: 'NPP' }],
    description: () =>
      t`"NPP, or Net Primary Production, is an indicator of the rate at which plants produce net useful chemical energy expressed in mass of carbon per unit area per day (gC/m²/day)."`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_10DAILY, layerId: 'SWI001' }],
    description: () =>
      t`SWI computed with a characteristic time length of 1 day. The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_10DAILY, layerId: 'SWI005' }],
    description: () =>
      t`SWI computed with a characteristic time length of 5 days. The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_10DAILY, layerId: 'SWI010' }],
    description: () =>
      t`SWI computed with a characteristic time length of 10 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_10DAILY, layerId: 'SWI015' }],
    description: () =>
      t`SWI computed with a characteristic time length of 15 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_10DAILY, layerId: 'SWI020' }],
    description: () =>
      t`SWI computed with a characteristic time length of 20 days. The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_10DAILY, layerId: 'SWI040' }],
    description: () =>
      t`SWI computed with a characteristic time length of 40 days.The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_10DAILY, layerId: 'SWI060' }],
    description: () =>
      t`SWI computed with a characteristic time length of 60 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_10DAILY, layerId: 'SWI100' }],
    description: () =>
      t`SWI computed with a characteristic time length of 100 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_DAILY, layerId: 'SSF' }],
    description: () =>
      t`Surface soil moisture (SSM) retrieval from scatterometer data has certain limitations: it cannot be retrieved when the surface is frozen or covered by snow, dense vegetation, or water. Whereas dense vegetation and water are almost static factors, the freeze/thaw cycle is dynamic. The frozen state of the surface is recorded within the surface state flag (SSF). `,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_DAILY, layerId: 'SWI001' }],
    description: () =>
      t`SWI computed with a characteristic time length of 1 day. The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_DAILY, layerId: 'SWI005' }],
    description: () =>
      t`SWI computed with a characteristic time length of 5 days. The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_DAILY, layerId: 'SWI010' }],
    description: () =>
      t`SWI computed with a characteristic time length of 10 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_DAILY, layerId: 'SWI015' }],
    description: () =>
      t`SWI computed with a characteristic time length of 15 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },

  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_DAILY, layerId: 'SWI020' }],
    description: () =>
      t`SWI computed with a characteristic time length of 20 days. The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_DAILY, layerId: 'SWI040' }],
    description: () =>
      t`SWI computed with a characteristic time length of 40 days.The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_DAILY, layerId: 'SWI060' }],
    description: () =>
      t`SWI computed with a characteristic time length of 60 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_12_5KM_DAILY, layerId: 'SWI100' }],
    description: () =>
      t`SWI computed with a characteristic time length of 100 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_1KM_DAILY, layerId: 'SSF' }],
    description: () =>
      t`Surface soil moisture (SSM) retrieval from scatterometer data has certain limitations: it cannot be retrieved when the surface is frozen or covered by snow, dense vegetation, or water. Whereas dense vegetation and water are almost static factors, the freeze/thaw cycle is dynamic. The frozen state of the surface is recorded within the surface state flag (SSF). `,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_1KM_DAILY, layerId: 'SWI002' }],
    description: () =>
      t`SWI computed with a characteristic time length of 2 days. The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_1KM_DAILY, layerId: 'SWI005' }],
    description: () =>
      t`SWI computed with a characteristic time length of 5 days. The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_1KM_DAILY, layerId: 'SWI010' }],
    description: () =>
      t`SWI computed with a characteristic time length of 10 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_1KM_DAILY, layerId: 'SWI015' }],
    description: () =>
      t`SWI computed with a characteristic time length of 15 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_1KM_DAILY, layerId: 'SWI020' }],
    description: () =>
      t`SWI computed with a characteristic time length of 20 days. The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_1KM_DAILY, layerId: 'SWI040' }],
    description: () =>
      t`SWI computed with a characteristic time length of 40 days.The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_1KM_DAILY, layerId: 'SWI060' }],
    description: () =>
      t`SWI computed with a characteristic time length of 60 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWI_1KM_DAILY, layerId: 'SWI100' }],
    description: () =>
      t`SWI computed with a characteristic time length of 100 days.  The Soil Water index (SWI) provides global daily information about moisture conditions in different soil depths. Near Real Time Data uses the EUMETSAT ASCAT-25km SSM product in orbit format as input data. The Archive of ASCAT SWI uses reprocessed SSM data from TU Wien.`,
  },
  {
    match: [{ datasourceId: CDSE_CCM_VHR_IMAGE_2018_COLLECTION, layerId: '1_TRUE_COLOR' }],
    description: () =>
      t`# True color optimized\n\nThis optimized True color script uses the visible light bands red, green and blue in the corresponding red, green and blue color channels, resulting in a product with natural colours that represents the Earth as humans would naturally see it. The visualisation uses highlight compression and improves the contrast and color vividness through minor contrast and saturation enhancement.`,
  },
  {
    match: [{ datasourceId: CDSE_CCM_VHR_IMAGE_2018_COLLECTION, layerId: '2_FALSE_COLOR' }],
    description: () =>
      t`# False color composite\n\nA false color composite uses at least one non-visible wavelength to image Earth. The false color composite using near infrared, red and green bands is very popular (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). The false colour composite is most commonly used to assess plant density and health, since plants reflect near infrared and green light, while they absorb red. Cities and exposed ground are grey or tan, and water appears blue or black.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/false_color_infrared/).`,
  },
  {
    match: [{ datasourceId: CDSE_CCM_VHR_IMAGE_2018_COLLECTION, layerId: '3_NDVI' }],
    legend: {
      type: 'continuous',
      minPosition: -0.2,
      maxPosition: 1.1,
      gradients: [
        { position: -0.2, color: 'rgb(5%,5%,5%)', label: '- 1' },
        { position: -0.1, color: 'rgb(5%,5%,5%)', label: '- 0.5' },
        { position: -0.1, color: 'rgb(75%,75%,75%)' },
        { position: 0, color: 'rgb(75%,75%,75%)', label: '- 0.2' },
        { position: 0, color: 'rgb(86%,86%,86%)' },
        { position: 0.1, color: 'rgb(86%,86%,86%)', label: '- 0.1' },
        { position: 0.1, color: 'rgb(92%,92%,92%)' },
        { position: 0.2, color: 'rgb(92%,92%,92%)', label: ' 0' },
        { position: 0.2, color: 'rgb(100%,98%,80%)' },
        { position: 0.25, color: 'rgb(100%,98%,80%)' },
        { position: 0.25, color: 'rgb(93%,91%,71%)' },
        { position: 0.3, color: 'rgb(93%,91%,71%)' },
        { position: 0.3, color: 'rgb(87%,85%,61%)' },
        { position: 0.35, color: 'rgb(87%,85%,61%)' },
        { position: 0.35, color: 'rgb(80%,78%,51%)' },
        { position: 0.4, color: 'rgb(80%,78%,51%)' },
        { position: 0.4, color: 'rgb(74%,72%,42%)' },
        { position: 0.45, color: 'rgb(74%,72%,42%)' },
        { position: 0.45, color: 'rgb(69%,76%,38%)' },
        { position: 0.5, color: 'rgb(69%,76%,38%)' },
        { position: 0.5, color: 'rgb(64%,80%,35%)' },
        { position: 0.55, color: 'rgb(64%,80%,35%)' },
        { position: 0.55, color: 'rgb(57%,75%,32%)' },
        { position: 0.6, color: 'rgb(57%,75%,32%)', label: ' 0.2' },
        { position: 0.6, color: 'rgb(50%,70%,28%)' },
        { position: 0.65, color: 'rgb(50%,70%,28%)' },
        { position: 0.65, color: 'rgb(44%,64%,25%)' },
        { position: 0.7, color: 'rgb(44%,64%,25%)' },
        { position: 0.7, color: 'rgb(38%,59%,21%)' },
        { position: 0.75, color: 'rgb(38%,59%,21%)' },
        { position: 0.75, color: 'rgb(31%,54%,18%)' },
        { position: 0.8, color: 'rgb(31%,54%,18%)' },
        { position: 0.8, color: 'rgb(25%,49%,14%)' },
        { position: 0.85, color: 'rgb(25%,49%,14%)' },
        { position: 0.85, color: 'rgb(19%,43%,11%)' },
        { position: 0.9, color: 'rgb(19%,43%,11%)' },
        { position: 0.9, color: 'rgb(13%,38%,7%)' },
        { position: 0.95, color: 'rgb(13%,38%,7%)' },
        { position: 0.95, color: 'rgb(6%,33%,4%)' },
        { position: 1.0, color: 'rgb(6%,33%,4%)' },
        { position: 1.0, color: 'rgb(0%,27%,0%)', label: ' 0.6' },
        { position: 1.1, color: 'rgb(0%,27%,0%)', label: ' 1' },
      ],
    },
    description: () =>
      t`# Normalized Difference Vegetation Index (NDVI)\n\nThe normalized difference vegetation index is a simple, but effective index for quantifying green vegetation. It is a measure of the state of vegetation health based on how plants reflect light at certain wavelengths. The value range of the NDVI is -1 to 1. Negative values of NDVI (values approaching -1) correspond to water. Values close to zero (-0.1to 0.1) generally correspond to barren areas of rock, sand, or snow. Low, positive values represent shrub and grassland (approximately 0.2 to 0.4), while high values indicate temperate and tropical rainforests (values approaching 1).\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/ndvi/).`,
  },
  {
    match: [{ datasourceId: CDSE_CCM_VHR_IMAGE_2021_COLLECTION, layerId: '1_TRUE_COLOR' }],
    description: () =>
      t`# True color optimized\n\nThis optimized True color script uses the visible light bands red, green and blue in the corresponding red, green and blue color channels, resulting in a product with natural colours that represents the Earth as humans would naturally see it. The visualisation uses highlight compression and improves the contrast and color vividness through minor contrast and saturation enhancement.`,
  },
  {
    match: [{ datasourceId: CDSE_CCM_VHR_IMAGE_2021_COLLECTION, layerId: '2_FALSE_COLOR' }],
    description: () =>
      t`# False color composite\n\nA false color composite uses at least one non-visible wavelength to image Earth. The false color composite using near infrared, red and green bands is very popular (a band is a region of the electromagnetic spectrum; a satellite sensor can image Earth in different bands). The false colour composite is most commonly used to assess plant density and health, since plants reflect near infrared and green light, while they absorb red. Cities and exposed ground are grey or tan, and water appears blue or black.\n\n\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/false_color_infrared/).`,
  },
  {
    match: [{ datasourceId: CDSE_CCM_VHR_IMAGE_2021_COLLECTION, layerId: '3_NDVI' }],
    legend: {
      type: 'continuous',
      minPosition: -0.2,
      maxPosition: 1.1,
      gradients: [
        { position: -0.2, color: 'rgb(5%,5%,5%)', label: '- 1' },
        { position: -0.1, color: 'rgb(5%,5%,5%)', label: '- 0.5' },
        { position: -0.1, color: 'rgb(75%,75%,75%)' },
        { position: 0, color: 'rgb(75%,75%,75%)', label: '- 0.2' },
        { position: 0, color: 'rgb(86%,86%,86%)' },
        { position: 0.1, color: 'rgb(86%,86%,86%)', label: '- 0.1' },
        { position: 0.1, color: 'rgb(92%,92%,92%)' },
        { position: 0.2, color: 'rgb(92%,92%,92%)', label: ' 0' },
        { position: 0.2, color: 'rgb(100%,98%,80%)' },
        { position: 0.25, color: 'rgb(100%,98%,80%)' },
        { position: 0.25, color: 'rgb(93%,91%,71%)' },
        { position: 0.3, color: 'rgb(93%,91%,71%)' },
        { position: 0.3, color: 'rgb(87%,85%,61%)' },
        { position: 0.35, color: 'rgb(87%,85%,61%)' },
        { position: 0.35, color: 'rgb(80%,78%,51%)' },
        { position: 0.4, color: 'rgb(80%,78%,51%)' },
        { position: 0.4, color: 'rgb(74%,72%,42%)' },
        { position: 0.45, color: 'rgb(74%,72%,42%)' },
        { position: 0.45, color: 'rgb(69%,76%,38%)' },
        { position: 0.5, color: 'rgb(69%,76%,38%)' },
        { position: 0.5, color: 'rgb(64%,80%,35%)' },
        { position: 0.55, color: 'rgb(64%,80%,35%)' },
        { position: 0.55, color: 'rgb(57%,75%,32%)' },
        { position: 0.6, color: 'rgb(57%,75%,32%)', label: ' 0.2' },
        { position: 0.6, color: 'rgb(50%,70%,28%)' },
        { position: 0.65, color: 'rgb(50%,70%,28%)' },
        { position: 0.65, color: 'rgb(44%,64%,25%)' },
        { position: 0.7, color: 'rgb(44%,64%,25%)' },
        { position: 0.7, color: 'rgb(38%,59%,21%)' },
        { position: 0.75, color: 'rgb(38%,59%,21%)' },
        { position: 0.75, color: 'rgb(31%,54%,18%)' },
        { position: 0.8, color: 'rgb(31%,54%,18%)' },
        { position: 0.8, color: 'rgb(25%,49%,14%)' },
        { position: 0.85, color: 'rgb(25%,49%,14%)' },
        { position: 0.85, color: 'rgb(19%,43%,11%)' },
        { position: 0.9, color: 'rgb(19%,43%,11%)' },
        { position: 0.9, color: 'rgb(13%,38%,7%)' },
        { position: 0.95, color: 'rgb(13%,38%,7%)' },
        { position: 0.95, color: 'rgb(6%,33%,4%)' },
        { position: 1.0, color: 'rgb(6%,33%,4%)' },
        { position: 1.0, color: 'rgb(0%,27%,0%)', label: ' 0.6' },
        { position: 1.1, color: 'rgb(0%,27%,0%)', label: ' 1' },
      ],
    },
    description: () =>
      t`# Normalized Difference Vegetation Index (NDVI)\n\nThe normalized difference vegetation index is a simple, but effective index for quantifying green vegetation. It is a measure of the state of vegetation health based on how plants reflect light at certain wavelengths. The value range of the NDVI is -1 to 1. Negative values of NDVI (values approaching -1) correspond to water. Values close to zero (-0.1to 0.1) generally correspond to barren areas of rock, sand, or snow. Low, positive values represent shrub and grassland (approximately 0.2 to 0.4), while high values indicate temperate and tropical rainforests (values approaching 1).\n\nMore info [here](https://custom-scripts.sentinel-hub.com/sentinel-2/ndvi/).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LST_5KM_10DAILY_V1, layerId: 'TCI' }],
    description: () =>
      t`TCI, long used as a suitable indicator of vegetation health, characterises how hot any given land pixel is with respect to its maximum temperature range. Since over vegetated surfaces, temperature is strongly controlled by energy fluxes (sensible and latent heat), the TCI indirectly characterizes the moisture availability through the near-surface radiation and aerodynamic conditions.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LST_5KM_10DAILY_V2, layerId: 'TCI' }],
    description: () =>
      t`TCI, long used as a suitable indicator of vegetation health, characterises how hot any given land pixel is with respect to its maximum temperature range. Since over vegetated surfaces, temperature is strongly controlled by energy fluxes (sensible and latent heat), the TCI indirectly characterizes the moisture availability through the near-surface radiation and aerodynamic conditions.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_1KM_STATS_V2, layerId: 'NDVI_MAX_LTS' }],
    description: () =>
      t`Maximum of the physical NDVI values. The time series of dekadal (10-daily) NDVI V2.2 observations over 1999-2017 is used to generate Long Term Statistics (LTS) per dekad. The LTS that are calculated for each of the 36 10-daily periods of the year are the minimum, median, maximum, average, standard deviation and the number of observations in the covered time series period. These data allow evaluating whether vegetation conditions deviate from a ‘normal’ situation.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_1KM_STATS_V2, layerId: 'NDVI_MEAN_LTS' }],
    description: () =>
      t`Mean of the physical NDVI values. The time series of dekadal (10-daily) NDVI V2.2 observations over 1999-2017 is used to generate Long Term Statistics (LTS) per dekad. The LTS that are calculated for each of the 36 10-daily periods of the year are the minimum, median, maximum, average, standard deviation and the number of observations in the covered time series period. These data allow evaluating whether vegetation conditions deviate from a ‘normal’ situation.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_1KM_STATS_V2, layerId: 'NDVI_MEDIAN_LTS' }],
    description: () =>
      t`Median of the physical NDVI values. The time series of dekadal (10-daily) NDVI V2.2 observations over 1999-2017 is used to generate Long Term Statistics (LTS) per dekad. The LTS that are calculated for each of the 36 10-daily periods of the year are the minimum, median, maximum, average, standard deviation and the number of observations in the covered time series period. These data allow evaluating whether vegetation conditions deviate from a ‘normal’ situation.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_1KM_STATS_V2, layerId: 'NDVI_MIN_LTS' }],
    description: () =>
      t`Minimum of the physical NDVI values. The time series of dekadal (10-daily) NDVI V2.2 observations over 1999-2017 is used to generate Long Term Statistics (LTS) per dekad. The LTS that are calculated for each of the 36 10-daily periods of the year are the minimum, median, maximum, average, standard deviation and the number of observations in the covered time series period. These data allow evaluating whether vegetation conditions deviate from a ‘normal’ situation.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_1KM_STATS_V3, layerId: 'NDVI_MAX_LTS' }],
    description: () =>
      t`Maximum of the physical NDVI values. The time series of dekadal (10-daily) NDVI V2.2 observations over 1999-2017 is used to generate Long Term Statistics (LTS) per dekad. The LTS that are calculated for each of the 36 10-daily periods of the year are the minimum, median, maximum, average, standard deviation and the number of observations in the covered time series period. These data allow evaluating whether vegetation conditions deviate from a ‘normal’ situation.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_1KM_STATS_V3, layerId: 'NDVI_MEAN_LTS' }],
    description: () =>
      t`Mean of the physical NDVI values. The time series of dekadal (10-daily) NDVI V2.2 observations over 1999-2017 is used to generate Long Term Statistics (LTS) per dekad. The LTS that are calculated for each of the 36 10-daily periods of the year are the minimum, median, maximum, average, standard deviation and the number of observations in the covered time series period. These data allow evaluating whether vegetation conditions deviate from a ‘normal’ situation.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_1KM_STATS_V3, layerId: 'NDVI_MEDIAN_LTS' }],
    description: () =>
      t`Median of the physical NDVI values. The time series of dekadal (10-daily) NDVI V2.2 observations over 1999-2017 is used to generate Long Term Statistics (LTS) per dekad. The LTS that are calculated for each of the 36 10-daily periods of the year are the minimum, median, maximum, average, standard deviation and the number of observations in the covered time series period. These data allow evaluating whether vegetation conditions deviate from a ‘normal’ situation.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_1KM_STATS_V3, layerId: 'NDVI_MIN_LTS' }],
    description: () =>
      t`Minimum of the physical NDVI values. The time series of dekadal (10-daily) NDVI V2.2 observations over 1999-2017 is used to generate Long Term Statistics (LTS) per dekad. The LTS that are calculated for each of the 36 10-daily periods of the year are the minimum, median, maximum, average, standard deviation and the number of observations in the covered time series period. These data allow evaluating whether vegetation conditions deviate from a ‘normal’ situation.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_1KM_10DAILY_V2, layerId: 'NDVI' }],
    description: () =>
      t`The Normalized Difference Vegetation Index (NDVI) can be related to the vegetation photosynthetic activity. It is computed from the RED and NIR reflectances only: NDVI = (NIR - RED) / (NIR+RED) = (B3 - B2) / (B3 + B2), where B2 and B3 are the atmospherically corrected surface reflectances in the RED and NIR bands from the SPOT/VEGETATION and PROBA-V 10-daily synthesis dataset.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_300M_10DAILY_V1, layerId: 'NDVI' }],
    description: () =>
      t`NDVI, or Normalized Difference Vegetation Index, is a dimensionless index that is indicative for vegetation density and is calculated by comparing the visible and near-infrared sunlight reflected by the surface (reflectance). The Global Land NDVI Collection 300m product is a 10-day synthesis product derived from Top of Canopy PROBA-V 300m data.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_NDVI_300M_10DAILY_V2, layerId: 'NDVI' }],
    description: () =>
      t`NDVI, or Normalized Difference Vegetation Index, is a dimensionless index that is indicative for vegetation density and is calculated by comparing the visible and near-infrared sunlight reflected by the surface (reflectance). The Global Land NDVI Collection 300m product is a 10-day synthesis product derived from Top of Canopy PROBA-V 300m data.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SSM_1KM_DAILY_V1, layerId: 'SSM' }],
    description: () =>
      t`SSM (Surface Soil Moisture) describes soil moisture of the soil’s topmost 5cm on a 1km (1°/112) spatial sampling. It is derived from microwave radar data observed by the Sentinel-1 SAR satellite sensors.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'R_EOSD_S1' }],
    description: () =>
      t`Season 1: provides the date when the vegetation growing season ends in the time profile of the Plant Phenology Index. The end-of-season occurs, by definition, when the Plant Phenology Index value reaches 15% of the season amplitude during the green-down period. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'S_EOSD_S2' }],
    description: () =>
      t`Season 2: provides the date when the vegetation growing season ends in the time profile of the Plant Phenology Index. The end-of-season occurs, by definition, when the Plant Phenology Index value reaches 15% of the season amplitude during the green-down period. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'Y_EOSV_S1' }],
    description: () =>
      t`Season 1: provides the value of the Plant Phenology Index at the end of the vegetation growing season. The data at pan-European level are updated in the first quarter of each year. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'ZA_EOSV_S2' }],
    description: () =>
      t`Season 2: provides the value of the Plant Phenology Index at the end of the vegetation growing season. The data at pan-European level are updated in the first quarter of each year. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'ZB_QA_S1' }],
    description: () =>
      t`Season 1: indicates the quality of the pan-European Vegetation Phenology and Productivity Parameters, in the form of a confidence level. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'ZC_QA_S2' }],
    description: () =>
      t`Season 2: indicates the quality of the pan-European Vegetation Phenology and Productivity Parameters, in the form of a confidence level. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'G_AMPL_S1' }],
    description: () =>
      t`Season 1: provides the difference between the maximum and minimum Plant Phenology Index values reached during the season. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'H_AMPL_S2' }],
    description: () =>
      t`Season 2: provides the difference between the maximum and minimum Plant Phenology Index values reached during the season. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'E_LENGTH_S1' }],
    description: () =>
      t`Season 1: provides the number of days between the start and end dates of the vegetation growing season in the time profile of the Plant Phenology Index. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'F_LENGTH_S2' }],
    description: () =>
      t`Season 2: provides the number of days between the start and end dates of the vegetation growing season in the time profile of the Plant Phenology Index. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'O_MAXD_S1' }],
    description: () =>
      t`Season 1: provides the date in the vegetation growing season when the maximum Plant Phenology Index value is reached. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'P_MAXD_S2' }],
    description: () =>
      t`Season 2: provides the date in the vegetation growing season when the maximum Plant Phenology Index value is reached. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'U_MAXV_S1' }],
    description: () =>
      t`Season 1: provides the maximum (peak) value that the Plant Phenology Index reaches during the vegetation growing season. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'V_MAXV_S2' }],
    description: () =>
      t`Season 2: provides the maximum (peak) value that the Plant Phenology Index reaches during the vegetation growing season. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'W_MINV_S1' }],
    description: () =>
      t`Season 1: provides the average Plant Phenology Index value of the minima before the growing season. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'X_MINV_S2' }],
    description: () =>
      t`Season 2: provides the average Plant Phenology Index value of the minima before the growing season. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'C_SPROD_S1' }],
    description: () =>
      t`Season 1: the growing season integral that is computed as the sum of all daily Plant Phenology Index values between the dates of the season start and end, minus their base level value. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'D_SPROD_S2' }],
    description: () =>
      t`Season 2: he growing season integral that is computed as the sum of all daily Plant Phenology Index values between the dates of the season start and end, minus their base level value. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'K_RSLOPE_S1' }],
    description: () =>
      t`Season 1: provides the rate of change in the values of the Plant Phenology Index at the day when the vegetation growing season ends. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'L_RSLOPE_S2' }],
    description: () =>
      t`Season 2: provides the rate of change in the values of the Plant Phenology Index at the day when the vegetation growing season ends. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'I_LSLOPE_S1' }],
    description: () =>
      t`Season 1: provides the rate of change in the values of the Plant Phenology Index at the day when the vegetation growing season starts. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'J_LSLOPE_S2' }],
    description: () =>
      t`Season 2: provides the rate of change in the values of the Plant Phenology Index at the day when the vegetation growing season starts. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'M_SOSD_S1' }],
    description: () =>
      t`Season 1: marks the date when the vegetation growing season starts in the time profile of the Plant Phenology Index. The start-of-season occurs, by definition, when the Plant Phenology Index value reaches 25% of the season amplitude during the green-up period. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'N_SOSD_S2' }],
    description: () =>
      t`Season 2: marks the date when the vegetation growing season starts in the time profile of the Plant Phenology Index. The start-of-season occurs, by definition, when the Plant Phenology Index value reaches 25% of the season amplitude during the green-up period. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'S_SOSV_S1' }],
    description: () =>
      t`Season 1: provides the value of the Plant Phenology Index at the start of the vegetation growing season. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'T_SOSV_S2' }],
    description: () =>
      t`Season 2: provides the value of the Plant Phenology Index at the start of the vegetation growing season. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'A_TPROD_S1' }],
    description: () =>
      t`Season 1: the growing season integral computed as the sum of all daily Plant Phenology Index values between the dates of the season start and end. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LSP_300M_YEARLY_V1, layerId: 'B_TPROD_S2' }],
    description: () =>
      t`Season 2: the growing season integral computed as the sum of all daily Plant Phenology Index values between the dates of the season start and end. The data at pan-European level are updated in the first quarter of each year. The data are available at 10 m x 10 m spatial resolution with the temporal extent from 2023 to present.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Change_Confidence' }],
    description: () =>
      t`Quality layer regarding the change detection between 0-3 (0 = no change, 3 = high confidence). Note: this layer is only available for products produced in production mode conso or nrt.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Data_Density_Indicator' }],
    description: () =>
      t`Data density indicator showing quality of the EO input data between 0 – 100 (0 = bad, 100 = perfect data).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Discrete_Classification' }],
    description: () => t`Main discrete classification according to FAO LCCS scheme.`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Discrete_Classification_Probability' },
    ],
    description: () => t`Classification probability, a quality indicator for the discrete classification.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Forest_Type' }],
    description: () => t`Forest type for all pixels where tree cover fraction is bigger than 1%.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Bare_Cover_Fraction' }],
    description: () => t`Fractional cover (%) for the bare and sparse vegetation class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Crops_Cover_Fraction' }],
    description: () => t`Fractional cover (%) for the cropland class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Tree_Cover_Fraction' }],
    description: () => t`Fractional cover (%) for the forest class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Grass_Cover_Fraction' }],
    description: () => t`Fractional cover (%) for the herbaceous vegetation class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'MossLichen_Cover_Fraction' }],
    description: () => t`Fractional cover (%) for the moss & lichen class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'PermanentWater_Cover_Fraction' }],
    description: () => t`Fractional cover (%) for the permanent inland water bodies class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'SeasonalWater_Cover_fraction' }],
    description: () => t`Fractional cover (%) for the seasonal inland water bodies class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Shrub_Cover_Fraction' }],
    description: () => t`Fractional cover (%) for the shrubland class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'Snow_Cover_Fraction' }],
    description: () => t`Fractional cover (%) for the snow & ice class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'BuiltUp_Cover_Fraction' }],
    description: () => t`Fractional cover (%) for the built-up class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LST_5KM_HOURLY_V1, layerId: 'LST' }],
    description: () => t`Land Surface Temperature (LST) is estimated from Top-of-Atmosphere (TOA) brightness
temperatures of atmospheric window channels within the infrared range. LST describes processes such as the exchange of energy and water between the land surface and atmosphere, and influences the rate and timing of plant growth.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LST_5KM_HOURLY_V2, layerId: 'LST' }],
    description: () => t`Land Surface Temperature (LST) is estimated from Top-of-Atmosphere (TOA) brightness
temperatures of atmospheric window channels within the infrared range. LST describes processes such as the exchange of energy and water between the land surface and atmosphere, and influences the rate and timing of plant growth.`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6, layerId: 'GDMP' },
    ],
    description: () =>
      t` GDMP (Gross Dry Matter Productivity) is considered as the amount of biomass that primary producers create in a given length of time, without any losses caused by respiration. The relation between the DMP (Dry matter productivity) and the GDMP is as follows: DMP = GDMP * AR (with AR = Autotrophic respiration factor).`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6, layerId: 'GDMP' },
    ],
    description: () =>
      t` GDMP (Gross Dry Matter Productivity) is considered as the amount of biomass that primary producers create in a given length of time, without any losses caused by respiration. The relation between the DMP (Dry matter productivity) and the GDMP is as follows: DMP = GDMP * AR (with AR = Autotrophic respiration factor).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'N_CHANGE_CONFIDENCE' }],
    description: () =>
      t`Quality layer regarding the change detection between 0-3 (0 = no change, 3 = high confidence). Note: this layer is only available for products produced in production mode conso or nrt.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'O_DATA_DENSITY_INDICATOR' }],
    description: () =>
      t`Data density indicator showing quality of the EO input data between 0 – 100 (0 = bad, 100 = perfect data).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'A_DISCRETE_CLASSIFICATION' }],
    description: () => t`Main discrete classification according to FAO LCCS scheme.`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'M_DISCRETE_CLASSIFICATION_PROBABILITY' },
    ],
    description: () => t`Classification probability, a quality indicator for the discrete classification.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'B_FOREST_TYPE' }],
    description: () => t`Forest type for all pixels where tree cover fraction is bigger than 1%.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'G_BARE_COVER_FRACTION' }],
    description: () => t`Fractional cover (%) for the bare and sparse vegetation class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'F_CROPS_COVER_FRACTION' }],
    description: () => t`Fractional cover (%) for the cropland class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'E_TREE_COVER_FRACTION' }],
    description: () => t`Fractional cover (%) for the forest class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'H_GRASS_COVER_FRACTION' }],
    description: () => t`Fractional cover (%) for the herbaceous vegetation class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'L_MOSSLICHEN_COVER_FRACTION' }],
    description: () => t`Fractional cover (%) for the moss & lichen class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'C_PERMANENTWATER_COVER_FRACTION' }],
    description: () => t`Fractional cover (%) for the permanent inland water bodies class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'I_SEASONALWATER_COVER_FRACTION' }],
    description: () => t`Fractional cover (%) for the seasonal inland water bodies class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'K_SHRUB_COVER_FRACTION' }],
    description: () => t`Fractional cover (%) for the shrubland class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'J_SNOW_COVER_FRACTION' }],
    description: () => t`Fractional cover (%) for the snow & ice class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCC_100M_YEARLY_V3, layerId: 'D_BUILTUP_COVER_FRACTION' }],
    description: () => t`Fractional cover (%) for the built-up class.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LST_5KM_HOURLY_V1, layerId: 'LST' }],
    description: () => t`TBD`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LST_5KM_HOURLY_V2, layerId: 'LST' }],
    description: () => t`TBD`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6, layerId: 'GDMP' },
    ],
    description: () =>
      t` GDMP (Gross Dry Matter Productivity) is considered as the amount of biomass that primary producers create in a given length of time, without any losses caused by respiration. The relation between the DMP (Dry matter productivity) and the GDMP is as follows: DMP = GDMP * AR (with AR = Autotrophic respiration factor).`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5, layerId: 'GDMP' },
      { datasourceId: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6, layerId: 'GDMP' },
    ],
    description: () =>
      t` GDMP (Gross Dry Matter Productivity) is considered as the amount of biomass that primary producers create in a given length of time, without any losses caused by respiration. The relation between the DMP (Dry matter productivity) and the GDMP is as follows: DMP = GDMP * AR (with AR = Autotrophic respiration factor).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_WB_300M_10DAILY_V1, layerId: 'WB' }],
    description: () =>
      t`This product is a 10-daily synthesis product derived from Top of Canopy (TOC) PROVA-V 333 m data. The basic Water Bodies (WB) layer which tells which pixels contain water and which not, defined as permanent and seasonal water bodies, natural and man-made, independently of their size. Include but are not restricted to the lakes of the Global terrestrial Network for lakes.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_WB_1KM_10DAILY_V2, layerId: 'WB' }],
    description: () => t`Information not currently available.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWE_5KM_DAILY_V1, layerId: 'SWE' }],
    description: () =>
      t`Snow Water Equivalent (SWE) is the measure of the amount of water frozen within the snow pack per unit area. In principle, it gives the height of the water column that would form, if the snow pack would melt completely. It is measured and indicated in millimetres [mm]. The retrieval algorithm used here combines information from satellite-based microwave radiometer and optical spectrometer observations with ground based weather station snow depth measurements and produces daily hemispherical scale SWE estimates. `,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SWE_5KM_DAILY_V2, layerId: 'SWE' }],
    description: () =>
      t`Snow Water Equivalent (SWE) is the measure of the amount of water frozen within the snow pack per unit area. In principle, it gives the height of the water column that would form, if the snow pack would melt completely. It is measured and indicated in millimetres [mm]. The retrieval algorithm used here combines information from satellite-based microwave radiometer and optical spectrometer observations with ground based weather station snow depth measurements and produces daily hemispherical scale SWE estimates. `,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SCE_500M_DAILY_V1, layerId: 'SCE' }],
    description: () =>
      t`The Snow Cover Extent (SCE) product provides information on the Fraction of Snow Cover (FSC) per pixel in percentage (0% – 100%). The SCE is derived from medium resolution optical satellite data. The dataset has the following classes: Outside area of interest (0), Water bodies (20), Cloud mask (30), Polar night (251), Input data error (254), No data (255), and Snow Cover Extent (values between 100 and 200, where the percentage of snow cover can be derived using the formula: SCE = value – 100).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_SCE_1KM_DAILY_V1, layerId: 'SCE' }],
    description: () =>
      t`The Snow Cover Extent (SCE) product provides information on the Fraction of Snow Cover (FSC) per pixel in percentage (0% – 100%). The SCE is derived from medium resolution optical satellite data. The dataset has the following classes: Outside area of interest (0), Water bodies (20), Cloud mask (30), Polar night (251), Input data error (254), No data (255), and Snow Cover Extent (values between 100 and 200, where the percentage of snow cover can be derived using the formula: SCE = value – 100).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_WB_300M_MONTHLY_V2, layerId: 'WB' }],
    description: () =>
      t`The main Water Bodies detection layer (WB) uses the following values: Sea (0), Water (70), No data (251), No water (255). From the Sentinel-2 L1C input reflectances, Water Bodies are detected using the Modified Normalized Difference Water Index (MNDWI), for each input tile`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LIE_500M_DAILY_V1, layerId: 'LIE' }],
    description: () =>
      t`The LIE variable is a classification of lake ice state, with the following classes: Ice cover (10), Open water (30), Cloud (40). Some specific flag values are used: Not interpreted / no satellite input data (50), Sea pixel (60), Land pixel (70).`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LIE_250M_DAILY_V2, layerId: 'LIE' }],
    description: () =>
      t`The LIE variable is a classification of lake ice state, with the following classes: Fully snow covered ice (1), Partially snow covered or  snow free ice (2), Open water (3). Some specific flag values are also used for LIE: 0 for missing data, 4 for sea pixels, 5 for cloudy pixels, 6 for land area. LIE 250m uses thresholds on Top-of-Atmosphere (TOA) reflectances for full snow cover, partially snow covered ice/clear ice, and open water.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_WB_100M_MONTHLY_V1, layerId: 'WB' }],
    description: () =>
      t`The main Water Bodies detection layer (WB) uses the following values: Sea (0), Water (70), No data (251), No water (255). From the Sentinel-2 L1C input reflectances, Water Bodies are detected using the Modified Normalized Difference Water Index (MNDWI), for each input tile`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1, layerId: 'FOBS' },
      { datasourceId: COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2, layerId: 'FOBS' },
    ],
    description: () =>
      t`Fraction of valid LST values (used to calculate statistics) in the compositing period. In this context, a valid LST value corresponds to a clear-sky retrieval, after outlier removal.`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1, layerId: 'MAX' },
      { datasourceId: COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2, layerId: 'MAX' },
    ],
    description: () =>
      t`The aim of 10-day Land Surface Temperature (LST) product is to provide a complete overview of the LST daily cycle over each 10-day compositing for every image pixel. This layer represents the maximum LST values retrieved during the 10-days composite period.`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1, layerId: 'MEDIAN' },
      { datasourceId: COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2, layerId: 'MEDIAN' },
    ],
    description: () =>
      t`The aim of 10-day Land Surface Temperature (LST) product is to provide a complete overview of the LST daily cycle over each 10-day compositing for every image pixel. This layer represents the median LST values retrieved during the 10-days composite period.`,
  },
  {
    match: [
      { datasourceId: COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1, layerId: 'MIN' },
      { datasourceId: COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2, layerId: 'MIN' },
    ],
    description: () =>
      t`The aim of 10-day Land Surface Temperature (LST) product is to provide a complete overview of the LST daily cycle over each 10-day compositing for every image pixel. This layer represents the minimum LST values retrieved during the 10-days composite period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'CHLAMEAN' }],
    description: () => t`Chlorophyll-a (Chla) in mg/m³, commonly used as a proxy to phytoplankton biomass.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'FCBPROB' }],
    description: () =>
      t`Floating Cyanobacteria probability, indicating the probability of cyanobacteria surface blooms present in the water body.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW1020' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 1020nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW400' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 400nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW412' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 412nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW443' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 443nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW490' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 490nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW510' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 510nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW560' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 560nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW620' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 620nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW665' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 665nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW674' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 674nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW681' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 681nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW709' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 709nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW754' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 754nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW779' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 779nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW885' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 885nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'RW900' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 900nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'TMEAN' }],
    description: () =>
      t`Mean turbidity, which is a key indicator of water clarity, quantifying the haziness of the water and acting as an indicator of underwater light availability. Here TMEAN is derived from total suspended matter (TSM) estimates.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'TSI' }],
    description: () =>
      t`Trophic State Index, referring to the degree at which organic matter accumulates in the water body and is most commonly used in relation to monitoring eutrophication. Here TSI is derived from phytoplankton biomass by proxy of chlorophyll-a.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2, layerId: 'TSMMEAN' }],
    description: () =>
      t`Total suspended matter (TSM) in g/m³, used to quantify the concentration of suspended particles in the water body.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW412' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 412nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW443' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 443nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW490' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 490nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW510' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 510nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW560' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 560nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW620' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 620nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW665' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 665nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW681' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 681nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW709' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 709nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW754' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 754nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW760' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 760nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW779' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 779nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW865' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 865nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW885' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 885nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'RW900' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 900nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'TMEAN' }],
    description: () =>
      t`Mean turbidity, which is a key indicator of water clarity, quantifying the haziness of the water and acting as an indicator of underwater light availability. Here TMEAN is derived from total suspended matter (TSM) estimates.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1, layerId: 'TSI' }],
    description: () =>
      t`Trophic State Index, referring to the degree at which organic matter accumulates in the water body and is most commonly used in relation to monitoring eutrophication. Here TSI is derived from phytoplankton biomass by proxy of chlorophyll-a.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW1020' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 1020nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW400' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 400nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW412' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 412nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW443' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 443nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW490' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 490nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW510' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 510nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW560' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 560nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW620' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 620nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW665' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 665nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW674' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 674nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW681' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 681nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW709' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 709nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW754' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 754nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW760' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 760nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW764' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 764nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW767' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 767nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW779' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 779nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW865' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 865nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW885' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 885nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW900' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 900nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'RW940' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 940nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'TMEAN' }],
    description: () =>
      t`Mean turbidity, which is a key indicator of water clarity, quantifying the haziness of the water and acting as an indicator of underwater light availability. Here TMEAN is derived from total suspended matter (TSM) estimates.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1, layerId: 'TSI' }],
    description: () =>
      t`Trophic State Index, referring to the degree at which organic matter accumulates in the water body and is most commonly used in relation to monitoring eutrophication. Here TSI is derived from phytoplankton biomass by proxy of chlorophyll-a.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW1375' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 1375, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW1610' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 1610, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW2190' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 2190, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW443' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 443, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW490' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 490, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW560' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 560, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW665' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 665, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW705' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 705, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW740' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 740, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW783' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 783, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW842' }],
    description: () =>
      t`Fully normalized water-leaving reflectance at the waveband 842, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW865' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 865nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'RW945' }],
    description: () =>
      t`Fully normalized water leaving reflectances at the waveband 945nm, using most representative spectrum within the aggregation period.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'TMEAN' }],
    description: () =>
      t`Mean turbidity, which is a key indicator of water clarity, quantifying the haziness of the water and acting as an indicator of underwater light availability. Here TMEAN is derived from total suspended matter (TSM) estimates.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1, layerId: 'TSI' }],
    description: () =>
      t`Trophic State Index, referring to the degree at which organic matter accumulates in the water body and is most commonly used in relation to monitoring eutrophication. Here TSI is derived from phytoplankton biomass by proxy of chlorophyll-a.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_LCM_10M_YEARLY_V1, layerId: 'LCM10' }],
    description: () => t`Land Cover Map at 10m resolution with 11 different land cover classes.`,
  },
  {
    match: [{ datasourceId: COPERNICUS_CLMS_TCD_10M_YEARLY_V1, layerId: 'TCD10' }],
    description: () => t`Tree Cover Density Map at 10m resolution.`,
  },
];
