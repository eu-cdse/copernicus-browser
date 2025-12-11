import * as wellknown from 'wellknown';
import { ODataFilterBuilder } from './ODataFilterBuilder';
import { ODataQueryBuilder } from './ODataQueryBuilder';
import { ODataCollections, ODataEntity, ODataFilterOperator, OrderingDirection } from './ODataTypes';
import { ExpressionTreeOperator } from './ExpressionTree';
import {
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
  S1_CDAS_EW_HH,
  S1_CDAS_EW_HHHV,
  S1_CDAS_EW_VV,
  S1_CDAS_EW_VVVH,
  S1_CDAS_IW_VV,
  S1_CDAS_IW_VVVH,
  S1_CDAS_IW_HH,
  S1_CDAS_IW_HHHV,
  S1_CDAS_SM_HH,
  S1_CDAS_SM_HHHV,
  S1_CDAS_SM_VV,
  S1_CDAS_SM_VVVH,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  S3OLCI_CDAS,
  S3SLSTR_CDAS,
  S5_AER_AI_CDAS,
  S5_CH4_CDAS,
  S5_CLOUD_CDAS,
  S5_CO_CDAS,
  S5_HCHO_CDAS,
  S5_NO2_CDAS,
  S5_O3_CDAS,
  S5_SO2_CDAS,
  COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
  S1_MONTHLY_MOSAIC_IW,
  S1_MONTHLY_MOSAIC_DH,
  S3OLCIL2_LAND,
  S3OLCIL2_WATER,
  S3SYNERGY_L2_V10,
  S3SYNERGY_L2_SYN,
  S3SYNERGY_L2_VG1,
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
  COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL,
  COPERNICUS_CLMS_BURNT_AREA_DAILY,
  COPERNICUS_CLMS_BURNT_AREA_MONTHLY,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_DMP_1KM_10DAILY,
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
  COPERNICUS_CLMS_LSP_300M_YEARLY_V2,
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
  COPERNICUS_CLMS_LIE_500M_DAILY_V2,
  COPERNICUS_CLMS_SWI_12_5KM_DAILY_V4,
  COPERNICUS_CLMS_SWI_1KM_DAILY_V2,
  COPERNICUS_CLMS_SWI_12_5KM_10DAILY_V4,
  COPERNICUS_CLMS_BURNT_AREA_DAILY_V4,
  COPERNICUS_CLMS_BURNT_AREA_MONTHLY_V4,
  COPERNICUS_CLMS_LIE_BALTIC_250M_DAILY_V1,
  COPERNICUS_CLMS_ETA_GLOBAL_300M_10DAILY_V1,
  COPERNICUS_CLMS_HF_GLOBAL_300M_DAILY_V1,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  AttributeNames,
  AttributeOnlineValues,
  AttributeOperationalModeValues,
  AttributeOrbitDirectionValues,
  AttributePolarisationChannelsValues,
  FormatedAttributeNames,
  ODataAttributes,
} from './assets/attributes';
import Sentinel1DataSourceHandler from '../../Tools/SearchPanel/dataSourceHandlers/Sentinel1DataSourceHandler';
import { Polarization } from '@sentinel-hub/sentinelhub-js';
import { recursiveCollections } from '../../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/collectionFormConfig';
import { FilterElement } from './FilterElement';
import moment from 'moment';
import { isFunction } from '../../utils';

export const PAGE_SIZE = 50;

export const MIN_SEARCH_DATE = moment.utc('1980-01-01').startOf('day');

// S1 is not included as it's handled manually
const PRODUCT_TYPE_TO_DATASETID = {
  S2MSI1C: S2_L1C_CDAS,
  S2MSI2A: S2_L2A_CDAS,
  OL_1_EFR___: S3OLCI_CDAS,
  SL_1_RBT___: S3SLSTR_CDAS,
  OL_2_LFR___: S3OLCIL2_LAND,
  OL_2_WFR___: S3OLCIL2_WATER,
  SY_2_V10___: S3SYNERGY_L2_V10,
  SY_2_SYN___: S3SYNERGY_L2_SYN,
  SY_2_VG1___: S3SYNERGY_L2_VG1,

  L2__AER_AI: S5_AER_AI_CDAS,
  //L2__AER_LH
  L2__CH4___: S5_CH4_CDAS,
  L2__CLOUD_: S5_CLOUD_CDAS,
  L2__CO____: S5_CO_CDAS,
  L2__HCHO__: S5_HCHO_CDAS,
  L2__NO2___: S5_NO2_CDAS,
  L2__O3____: S5_O3_CDAS,
  L2__SO2___: S5_SO2_CDAS,
  'COP-DEM_GLO-30-DGED': DEM_COPERNICUS_30_CDAS,
  'COP-DEM_GLO-90-DGED': DEM_COPERNICUS_90_CDAS,
  S2MSI_L3__MCQ: COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
  S1SAR_L3_IW_MCM: S1_MONTHLY_MOSAIC_IW,
  S1SAR_L3_DH_MCM: S1_MONTHLY_MOSAIC_DH,
  VHR_IMAGE_2018: CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  VHR_IMAGE_2021: CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  VHR_IMAGE_2024: CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
  ndvi_global_1km_10daily_v3: COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL,
  dmp_global_1km_10daily_v2: COPERNICUS_CLMS_DMP_1KM_10DAILY,
  lai_global_1km_10daily_v2: COPERNICUS_CLMS_LAI_1KM_10DAILY,
  fapar_global_1km_10daily_v2: COPERNICUS_CLMS_FAPAR_1KM_10DAILY,
  ba_global_300m_daily_v3: COPERNICUS_CLMS_BURNT_AREA_DAILY,
  ba_global_300m_monthly_v3: COPERNICUS_CLMS_BURNT_AREA_MONTHLY,
  ba_global_300m_daily_v4: COPERNICUS_CLMS_BURNT_AREA_DAILY_V4,
  ba_global_300m_monthly_v4: COPERNICUS_CLMS_BURNT_AREA_MONTHLY_V4,
  fapar_global_300m_10daily_v1: COPERNICUS_CLMS_FAPAR_300M_10DAILY,
  fcover_global_1km_10daily_v2: COPERNICUS_CLMS_FCOVER_1KM_10DAILY,
  fcover_global_300m_10daily_v1: COPERNICUS_CLMS_FCOVER_300M_10DAILY,
  gpp_global_300m_10daily_v1: COPERNICUS_CLMS_GPP_300M_10DAILY_RT0,
  lai_global_300m_10daily_v1: COPERNICUS_CLMS_LAI_300M_10DAILY,
  npp_global_300m_10daily_v1: COPERNICUS_CLMS_NPP_300M_10DAILY_RT0,
  'swi_global_12.5km_10daily_v3': COPERNICUS_CLMS_SWI_12_5KM_10DAILY,
  'swi_global_12.5km_daily_v3': COPERNICUS_CLMS_SWI_12_5KM_DAILY,
  swi_europe_1km_daily_v1: COPERNICUS_CLMS_SWI_1KM_DAILY,
  dmp_global_300m_10daily_v1: COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
  'lst-tci_global_5km_10daily_v1': COPERNICUS_CLMS_LST_5KM_10DAILY_V1,
  'lst-tci_global_5km_10daily_v2': COPERNICUS_CLMS_LST_5KM_10DAILY_V2,
  'ndvi-lts_global_1km_10daily_v2': COPERNICUS_CLMS_NDVI_1KM_STATS_V2,
  'ndvi-lts_global_1km_10daily_v3': COPERNICUS_CLMS_NDVI_1KM_STATS_V3,
  ndvi_global_1km_10daily_v2: COPERNICUS_CLMS_NDVI_1KM_10DAILY_V2,
  ndvi_global_300m_10daily_v1: COPERNICUS_CLMS_NDVI_300M_10DAILY_V1,
  ndvi_global_300m_10daily_v2: COPERNICUS_CLMS_NDVI_300M_10DAILY_V2,
  ssm_europe_1km_daily_v1: COPERNICUS_CLMS_SSM_1KM_DAILY_V1,
  lsp_global_300m_yearly_v1: COPERNICUS_CLMS_LSP_300M_YEARLY_V1,
  lsp_global_300m_yearly_v2: COPERNICUS_CLMS_LSP_300M_YEARLY_V2,
  lc_global_100m_yearly_v3: COPERNICUS_CLMS_LCC_100M_YEARLY_V3,
  lst_global_5km_hourly_v1: COPERNICUS_CLMS_LST_5KM_HOURLY_V1,
  lst_global_5km_hourly_v2: COPERNICUS_CLMS_LST_5KM_HOURLY_V2,
  gdmp_global_1km_10daily_v2: COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2,
  gdmp_global_300m_10daily_v1: COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0,
  wb_global_300m_10daily_v1: COPERNICUS_CLMS_WB_300M_10DAILY_V1,
  wb_global_1km_10daily_v2: COPERNICUS_CLMS_WB_1KM_10DAILY_V2,
  swe_northernhemisphere_5km_daily_v1: COPERNICUS_CLMS_SWE_5KM_DAILY_V1,
  swe_northernhemisphere_5km_daily_v2: COPERNICUS_CLMS_SWE_5KM_DAILY_V2,
  sce_europe_500m_daily_v1: COPERNICUS_CLMS_SCE_500M_DAILY_V1,
  sce_northernhemisphere_1km_daily_v1: COPERNICUS_CLMS_SCE_1KM_DAILY_V1,
  wb_global_300m_monthly_v2: COPERNICUS_CLMS_WB_300M_MONTHLY_V2,
  lie_northernhemisphere_500m_daily_v1: COPERNICUS_CLMS_LIE_500M_DAILY_V1,
  lie_global_500m_daily_v2: COPERNICUS_CLMS_LIE_500M_DAILY_V2,
  lie_europe_250m_daily_v2: COPERNICUS_CLMS_LIE_250M_DAILY_V2,
  wb_global_100m_monthly_v1: COPERNICUS_CLMS_WB_100M_MONTHLY_V1,
  'lst-daily-cycle_global_5km_10daily_v1': COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1,
  'lst-daily-cycle_global_5km_10daily_v2': COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2,
  'lwq-nrt_global_300m_10daily_v2': COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2,
  'lwq-reproc_global_300m_10daily_v1': COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1,
  'lwq-nrt_global_300m_10daily_v1': COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1,
  'lwq-nrt_global_100m_10daily_v1': COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1,
  lcm_global_10m_yearly_v1: COPERNICUS_CLMS_LCM_10M_YEARLY_V1,
  tcd_pantropical_10m_yearly_v1: COPERNICUS_CLMS_TCD_10M_YEARLY_V1,
  'swi_global_12.5km_daily_v4': COPERNICUS_CLMS_SWI_12_5KM_DAILY_V4,
  swi_europe_1km_daily_v2: COPERNICUS_CLMS_SWI_1KM_DAILY_V2,
  'swi_global_12.5km_10daily_v4': COPERNICUS_CLMS_SWI_12_5KM_10DAILY_V4,
  lie_baltic_250m_daily_v1: COPERNICUS_CLMS_LIE_BALTIC_250M_DAILY_V1,
  eta_global_300m_10daily_v1: COPERNICUS_CLMS_ETA_GLOBAL_300M_10DAILY_V1,
  hf_global_300m_daily_v1: COPERNICUS_CLMS_HF_GLOBAL_300M_DAILY_V1,
};

const attributeObjectWithValues = (attributes) => {
  const attributesObject = {};
  attributes.forEach((attribute) => {
    if (attribute?.Name) {
      attributesObject[attribute.Name] = attribute.Value;
    }
  });
  return attributesObject;
};

export const getDatasetIdFromProductType = (productType, attributes) => {
  if (!productType) {
    return null;
  }
  const attributesObject = attributeObjectWithValues(attributes) || {};

  if (/(1S|1S-COG)$/.test(productType)) {
    const polarisationChannels = attributes.filter(
      (attribute) => attribute?.Name === AttributeNames.polarisationChannels,
    );

    if (/^IW_GRDH_1S/.test(productType)) {
      switch (polarisationChannels[0]?.Value) {
        case 'VV':
          return S1_CDAS_IW_VV;
        case 'VV&VH':
          return S1_CDAS_IW_VVVH;
        case 'HH':
          return S1_CDAS_IW_HH;
        case 'HH&HV':
          return S1_CDAS_IW_HHHV;
        default:
          return S1_CDAS_IW_VVVH;
      }
    }
    if (/^EW_GRDM_1S/.test(productType)) {
      switch (polarisationChannels[0]?.Value) {
        case 'HH':
          return S1_CDAS_EW_HH;
        case 'HH&HV':
          return S1_CDAS_EW_HHHV;
        case 'VV':
          return S1_CDAS_EW_VV;
        case 'VV&VH':
          return S1_CDAS_EW_VVVH;
        default:
          return S1_CDAS_EW_HHHV;
      }
    }
    if (/^S[1-6]_GRDH_1S/.test(productType)) {
      if (polarisationChannels[0]?.Value === 'HH') {
        return S1_CDAS_SM_HH;
      } else if (polarisationChannels[0]?.Value === 'VV') {
        return S1_CDAS_SM_VV;
      } else if (polarisationChannels[0]?.Value === 'VV&VH') {
        return S1_CDAS_SM_VVVH;
      } else {
        return S1_CDAS_SM_HHHV;
      }
    }
  }

  if (/^SAR_DGE_/.test(productType)) {
    if (/DGE_30/.test(productType)) {
      return PRODUCT_TYPE_TO_DATASETID['COP-DEM_GLO-30-DGED'];
    }
    if (/DGE_90/.test(productType)) {
      return PRODUCT_TYPE_TO_DATASETID['COP-DEM_GLO-90-DGED'];
    }
  }

  if (productType === 'dynamic_land_cover' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'evapotranspiration' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (
    productType === 'vegetation_phenology_and_productivity_parameters' &&
    checkProductTypeFileFormat(attributes)
  ) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'vegetation_indices' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'surface_soil_moisture' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'land_surface_temperature' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'soil_water_index' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'burnt_area' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'water_bodies' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'snow_water_equivalent' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'snow_cover_extent' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'lake_water_quality' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'river_and_lake_ice_extent' && checkProductTypeFileFormat(attributes)) {
    const { datasetIdentifier } = attributesObject;
    return PRODUCT_TYPE_TO_DATASETID[datasetIdentifier];
  }

  if (productType === 'dry-gross_dry_matter_productivity' && checkProductTypeFileFormat(attributes)) {
    const { consolidationPeriod, metricGridSpacing, datasetShortName } = attributesObject;
    if (metricGridSpacing === 300 && datasetShortName === 'dmp') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_DMP_300M_10DAILY_RT0;
        case 1:
          return COPERNICUS_CLMS_DMP_300M_10DAILY_RT1;
        case 2:
          return COPERNICUS_CLMS_DMP_300M_10DAILY_RT2;
        case 5:
          return COPERNICUS_CLMS_DMP_300M_10DAILY_RT5;
        case 6:
          return COPERNICUS_CLMS_DMP_300M_10DAILY_RT6;
        default:
          return COPERNICUS_CLMS_DMP_300M_10DAILY_RT0;
      }
    }

    if (metricGridSpacing === 1000 && datasetShortName === 'dmp') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0;
        case 1:
          return COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1;
        case 2:
          return COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2;
        case 6:
          return COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6;
        default:
          return COPERNICUS_CLMS_DMP_1KM_10DAILY;
      }
    }

    if (metricGridSpacing === 300 && datasetShortName === 'gdmp') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0;
        case 1:
          return COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1;
        case 2:
          return COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2;
        case 5:
          return COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5;
        case 6:
          return COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6;
        default:
          return COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0;
      }
    }

    if (metricGridSpacing === 1000 && datasetShortName === 'gdmp') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0;
        case 1:
          return COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1;
        case 2:
          return COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2;
        case 6:
          return COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6;
        default:
          return COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2;
      }
    }
  }

  if (productType === 'net-gross_primary_production' && checkProductTypeFileFormat(attributes)) {
    const { consolidationPeriod, metricGridSpacing, datasetShortName } = attributesObject;
    if (metricGridSpacing === 300 && datasetShortName === 'gpp') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_GPP_300M_10DAILY_RT0;
        case 1:
          return COPERNICUS_CLMS_GPP_300M_10DAILY_RT1;
        case 2:
          return COPERNICUS_CLMS_GPP_300M_10DAILY_RT2;
        case 6:
          return COPERNICUS_CLMS_GPP_300M_10DAILY_RT6;
        default:
          return COPERNICUS_CLMS_GPP_300M_10DAILY_RT0;
      }
    }

    if (metricGridSpacing === 300 && datasetShortName === 'npp') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_NPP_300M_10DAILY_RT0;
        case 1:
          return COPERNICUS_CLMS_NPP_300M_10DAILY_RT1;
        case 2:
          return COPERNICUS_CLMS_NPP_300M_10DAILY_RT2;
        case 6:
          return COPERNICUS_CLMS_NPP_300M_10DAILY_RT6;
        default:
          return COPERNICUS_CLMS_NPP_300M_10DAILY_RT0;
      }
    }
  }

  if (productType === 'vegetation_properties' && checkProductTypeFileFormat(attributes)) {
    const { consolidationPeriod, metricGridSpacing, datasetShortName } = attributesObject;
    if (metricGridSpacing === 1000 && datasetShortName === 'fgvc') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT0;
        case 1:
          return COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT1;
        case 2:
          return COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT2;
        case 6:
          return COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT6;
        default:
          return COPERNICUS_CLMS_FCOVER_1KM_10DAILY;
      }
    }
    if (metricGridSpacing === 300 && datasetShortName === 'fgvc') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT0;
        case 1:
          return COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT1;
        case 2:
          return COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT2;
        case 6:
          return COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT6;
        default:
          return COPERNICUS_CLMS_FCOVER_300M_10DAILY;
      }
    }
    if (metricGridSpacing === 1000 && datasetShortName === 'fapar') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT0;
        case 1:
          return COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT1;
        case 2:
          return COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT2;
        case 6:
          return COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT6;
        default:
          return COPERNICUS_CLMS_FAPAR_1KM_10DAILY;
      }
    }
    if (metricGridSpacing === 300 && datasetShortName === 'fapar') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0;
        case 1:
          return COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT1;
        case 2:
          return COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT2;
        case 6:
          return COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT6;
        default:
          return COPERNICUS_CLMS_FAPAR_300M_10DAILY;
      }
    }
    if (metricGridSpacing === 1000 && datasetShortName === 'lai') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_LAI_1KM_10DAILY_RT0;
        case 1:
          return COPERNICUS_CLMS_LAI_1KM_10DAILY_RT1;
        case 2:
          return COPERNICUS_CLMS_LAI_1KM_10DAILY_RT2;
        case 6:
          return COPERNICUS_CLMS_LAI_1KM_10DAILY_RT6;
        default:
          return COPERNICUS_CLMS_LAI_1KM_10DAILY;
      }
    }
    if (metricGridSpacing === 300 && datasetShortName === 'lai') {
      switch (consolidationPeriod) {
        case 0:
          return COPERNICUS_CLMS_LAI_300M_10DAILY_RT0;
        case 1:
          return COPERNICUS_CLMS_LAI_300M_10DAILY_RT1;
        case 2:
          return COPERNICUS_CLMS_LAI_300M_10DAILY_RT2;
        case 6:
          return COPERNICUS_CLMS_LAI_300M_10DAILY_RT6;
        default:
          return COPERNICUS_CLMS_LAI_300M_10DAILY;
      }
    }
  }

  if (
    [
      'NAO_MS4__3_E1F0-COG',
      'PHR_MS___3_E1F0-COG',
      'DOV_MS_L3A_E1F0-COG',
      'OPT_MS4_1C_E1F0-COG',
      'VHI_MS4_1C_E1F0-COG',
      'AIS_MSP_1G_E1F0-COG',
      'HRS_MS4_1C_E1F0-COG',
      'PHR_MS___3_B34B-COG',
      'AIS_MSP_1G_B34B-COG',
      'OPT_MS4_1C_B34B-COG',
      'NAO_MS4__3_B34B-COG',
    ].includes(productType)
  ) {
    const datasetFullAttr = attributes.find((att) => att.Name === AttributeNames.datasetFull);
    if (datasetFullAttr && !datasetFullAttr.Value.includes('ENHANCED')) {
      return PRODUCT_TYPE_TO_DATASETID['VHR_IMAGE_2018'];
    }
  }

  if (
    [
      'GIS_MS4_OR_07B6-COG',
      'AIS_MSP_1G_07B6-COG',
      'WV3_MS4_OR_07B6-COG',
      'WV1_MS4_OR_07B6-COG',
      'PHR_MS___3_07B6-COG',
      'NAO_MS4__3_07B6-COG',
      'OPT_MS4_1C_07B6-COG',
      'HRS_MS4_1C_07B6-COG',
      'VHI_MS4_1C_07B6-COG',
      'S14_MS4__3_07B6-COG',
    ].includes(productType)
  ) {
    return PRODUCT_TYPE_TO_DATASETID['VHR_IMAGE_2021'];
  }

  if (
    ['HRS_MS2_1D_0476-COG', 'PHR_MS___3_0476-COG', 'PNE_MS2__3_0476-COG', 'S14_MS2__3_0476-COG'].includes(
      productType,
    )
  ) {
    return PRODUCT_TYPE_TO_DATASETID['VHR_IMAGE_2024'];
  }

  return PRODUCT_TYPE_TO_DATASETID[productType];
};

const checkProductTypeFileFormat = (attributes) => {
  const fileFormat = attributes.find((attribute) => attribute?.Name === AttributeNames.fileFormat)?.Value;
  if (fileFormat === 'cog') {
    return true;
  }
  return false;
};

const getProductTypeFromDatasetId = (datasetId) => {
  if (!datasetId) {
    return null;
  }
  for (const [key, val] of Object.entries(PRODUCT_TYPE_TO_DATASETID)) {
    if (val === datasetId) {
      return key;
    }
  }
  return null;
};

export const getODataCollectionInfoFromDatasetId = (datasetId, { orbitDirection, maxCC }) => {
  const dsh = getDataSourceHandler(datasetId);
  if (!dsh) {
    return null;
  }

  if (/^S1/.test(datasetId)) {
    const datasetParams = Sentinel1DataSourceHandler.getDatasetParams(datasetId);
    return {
      id: ODataCollections.S1.id,
      instrument: 'SAR',
      productType: 'GRD',
      selectedFilters: {
        operationalMode: [AttributeOperationalModeValues[datasetParams.acquisitionMode]],
        orbitDirection: [
          ...(orbitDirection?.length === 1 &&
          orbitDirection[0] === AttributeOrbitDirectionValues.ASCENDING.value
            ? [AttributeOrbitDirectionValues.ASCENDING]
            : []),
          ...(orbitDirection?.length === 1 &&
          orbitDirection[0] === AttributeOrbitDirectionValues.DESCENDING.value
            ? [AttributeOrbitDirectionValues.DESCENDING]
            : []),
        ],
        polarisationChannels: [
          ...(datasetParams.polarization === Polarization.SV ? [AttributePolarisationChannelsValues.VV] : []),
          ...(datasetParams.polarization === Polarization.DV
            ? [AttributePolarisationChannelsValues.VV_VH]
            : []),
          ...(datasetParams.polarization === Polarization.SH ? [AttributePolarisationChannelsValues.HH] : []),
          ...(datasetParams.polarization === Polarization.DH
            ? [AttributePolarisationChannelsValues.HH_HV]
            : []),
        ],
        [AttributeNames.online]: [AttributeOnlineValues.online],
      },
    };
  }

  if (datasetId === S1_MONTHLY_MOSAIC_DH || datasetId === S1_MONTHLY_MOSAIC_IW) {
    return {
      id: ODataCollections.GLOBAL_MOSAICS.id,
      instrument: 'S1Mosaics',
      productType: datasetId === S1_MONTHLY_MOSAIC_DH ? '_DH_mosaic_' : '_IW_mosaic_',
    };
  }

  if (datasetId === COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC) {
    return {
      id: ODataCollections.GLOBAL_MOSAICS.id,
      instrument: 'S2Mosaics',
      productType: 'S2MSI_L3__MCQ',
    };
  }

  if (/^S2/.test(datasetId)) {
    return {
      id: ODataCollections.S2.id,
      instrument: 'MSI',
      productType: getProductTypeFromDatasetId(datasetId),
      maxCC,
      selectedFilters: {
        [AttributeNames.online]: [AttributeOnlineValues.online],
      },
    };
  }

  if (/^S3/.test(datasetId)) {
    return {
      id: ODataCollections.S3.id,
      instrument: dsh.datasetSearchIds[datasetId],
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }

  if (/^S5/.test(datasetId)) {
    return {
      id: ODataCollections.S5P.id,
      instrument: 'TROPOMI',
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }

  if (/^DEM/.test(datasetId)) {
    return {
      id: ODataCollections.DEM.id,
      instrument: 'open',
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }

  if (
    [
      COPERNICUS_CLMS_LCC_100M_YEARLY_V3,
      COPERNICUS_CLMS_LCM_10M_YEARLY_V1,
      COPERNICUS_CLMS_TCD_10M_YEARLY_V1,
    ].includes(datasetId)
  ) {
    return {
      id: ODataCollections.CLMS_LAND_COVER_AND_LAND_USE_MAPPING.id,
      instrument: 'DYNAMIC_LAND_COVER',
      productType: getProductTypeFromDatasetId(datasetId),
      selectedFilters: {},
    };
  }

  if (
    [
      COPERNICUS_CLMS_LST_5KM_10DAILY_V1,
      COPERNICUS_CLMS_LST_5KM_10DAILY_V2,
      COPERNICUS_CLMS_LST_5KM_HOURLY_V1,
      COPERNICUS_CLMS_LST_5KM_HOURLY_V1,
      COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1,
      COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2,
    ].includes(datasetId)
  ) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'LAND_SURFACE_TEMPERATURE',
      productType: getProductTypeFromDatasetId(datasetId),
      selectedFilters: {},
    };
  }

  if ([COPERNICUS_CLMS_LSP_300M_YEARLY_V1, COPERNICUS_CLMS_LSP_300M_YEARLY_V2].includes(datasetId)) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'VEGETATION_PHENOLOGY_AND_PRODUCTIVITY_PARAMETERS',
      productType: getProductTypeFromDatasetId(datasetId),
      selectedFilters: {},
    };
  }

  if (
    [COPERNICUS_CLMS_ETA_GLOBAL_300M_10DAILY_V1, COPERNICUS_CLMS_HF_GLOBAL_300M_DAILY_V1].includes(datasetId)
  ) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'EVAPOTRANSPIRATION',
      productType: getProductTypeFromDatasetId(datasetId),
      selectedFilters: {},
    };
  }

  if (
    [
      COPERNICUS_CLMS_LIE_BALTIC_250M_DAILY_V1,
      COPERNICUS_CLMS_LIE_250M_DAILY_V2,
      COPERNICUS_CLMS_LIE_500M_DAILY_V1,
      COPERNICUS_CLMS_LIE_500M_DAILY_V2,
    ].includes(datasetId)
  ) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'RIVER_AND_LAKE_ICE_EXTENT',
      productType: getProductTypeFromDatasetId(datasetId),
      selectedFilters: {},
    };
  }

  if ([COPERNICUS_CLMS_SWE_5KM_DAILY_V1, COPERNICUS_CLMS_SWE_5KM_DAILY_V2].includes(datasetId)) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'SNOW_WATER_EQUIVALENT',
      productType: getProductTypeFromDatasetId(datasetId),
      selectedFilters: {},
    };
  }

  if (
    [
      COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2,
      COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1,
      COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1,
      COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1,
    ].includes(datasetId)
  ) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'LAKE_WATER_QUALITY',
      productType: getProductTypeFromDatasetId(datasetId),
      selectedFilters: {},
    };
  }

  if ([COPERNICUS_CLMS_SCE_1KM_DAILY_V1, COPERNICUS_CLMS_SCE_500M_DAILY_V1].includes(datasetId)) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'SNOW_COVER_EXTENT',
      productType: getProductTypeFromDatasetId(datasetId),
      selectedFilters: {},
    };
  }

  if (
    [
      COPERNICUS_CLMS_WB_1KM_10DAILY_V2,
      COPERNICUS_CLMS_WB_300M_10DAILY_V1,
      COPERNICUS_CLMS_WB_300M_MONTHLY_V2,
      COPERNICUS_CLMS_WB_100M_MONTHLY_V1,
    ].includes(datasetId)
  ) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'WATER_BODIES_1',
      productType: getProductTypeFromDatasetId(datasetId),
      selectedFilters: {},
    };
  }

  if ([COPERNICUS_CLMS_SSM_1KM_DAILY_V1].includes(datasetId)) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'SURFACE_SOIL_MOISTURE',
      productType: getProductTypeFromDatasetId(datasetId),
      selectedFilters: {},
    };
  }

  if (
    [
      COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL,
      COPERNICUS_CLMS_NDVI_1KM_STATS_V2,
      COPERNICUS_CLMS_NDVI_1KM_STATS_V3,
      COPERNICUS_CLMS_NDVI_1KM_10DAILY_V2,
      COPERNICUS_CLMS_NDVI_300M_10DAILY_V1,
      COPERNICUS_CLMS_NDVI_300M_10DAILY_V2,
    ].includes(datasetId)
  ) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'VEGETATION_INDICES',
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }

  if (
    [
      COPERNICUS_CLMS_SWI_12_5KM_10DAILY,
      COPERNICUS_CLMS_SWI_12_5KM_DAILY,
      COPERNICUS_CLMS_SWI_1KM_DAILY,
      COPERNICUS_CLMS_SWI_12_5KM_DAILY_V4,
      COPERNICUS_CLMS_SWI_1KM_DAILY_V2,
      COPERNICUS_CLMS_SWI_12_5KM_10DAILY_V4,
    ].includes(datasetId)
  ) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'SOIL_WATER_INDEX',
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }

  if (
    [
      COPERNICUS_CLMS_BURNT_AREA_DAILY,
      COPERNICUS_CLMS_BURNT_AREA_MONTHLY,
      COPERNICUS_CLMS_BURNT_AREA_DAILY_V4,
      COPERNICUS_CLMS_BURNT_AREA_MONTHLY_V4,
    ].includes(datasetId)
  ) {
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'BURNT_AREA',
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }
  if (
    [
      COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
      COPERNICUS_CLMS_DMP_300M_10DAILY_RT1,
      COPERNICUS_CLMS_DMP_300M_10DAILY_RT2,
      COPERNICUS_CLMS_DMP_300M_10DAILY_RT5,
      COPERNICUS_CLMS_DMP_300M_10DAILY_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'DRY_GROSS_DRY_MATTER_PRODUCTIVITY',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_DMP_300M_10DAILY_RT0),
      selectedFilters: {
        ...props,
      },
    };
  }
  if (
    [
      COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0,
      COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1,
      COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2,
      COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5,
      COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'DRY_GROSS_DRY_MATTER_PRODUCTIVITY',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0),
      selectedFilters: {
        ...props,
      },
    };
  }
  if (
    [
      COPERNICUS_CLMS_DMP_1KM_10DAILY,
      COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0,
      COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1,
      COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2,
      COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'DRY_GROSS_DRY_MATTER_PRODUCTIVITY',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_DMP_1KM_10DAILY),
      selectedFilters: {
        ...props,
      },
    };
  }
  if (
    [
      COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2,
      COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0,
      COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1,
      COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2,
      COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'DRY_GROSS_DRY_MATTER_PRODUCTIVITY',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2),
      selectedFilters: {
        ...props,
      },
    };
  }
  if (
    [
      COPERNICUS_CLMS_LAI_1KM_10DAILY,
      COPERNICUS_CLMS_LAI_1KM_10DAILY_RT0,
      COPERNICUS_CLMS_LAI_1KM_10DAILY_RT1,
      COPERNICUS_CLMS_LAI_1KM_10DAILY_RT2,
      COPERNICUS_CLMS_LAI_1KM_10DAILY_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'VEGETATION_PROPERTIES',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_LAI_1KM_10DAILY),
      selectedFilters: {
        ...props,
      },
    };
  }

  if (
    [
      COPERNICUS_CLMS_LAI_300M_10DAILY,
      COPERNICUS_CLMS_LAI_300M_10DAILY_RT0,
      COPERNICUS_CLMS_LAI_300M_10DAILY_RT1,
      COPERNICUS_CLMS_LAI_300M_10DAILY_RT2,
      COPERNICUS_CLMS_LAI_300M_10DAILY_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'VEGETATION_PROPERTIES',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_LAI_300M_10DAILY),
      selectedFilters: {
        ...props,
      },
    };
  }

  if (
    [
      COPERNICUS_CLMS_FAPAR_300M_10DAILY,
      COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0,
      COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT1,
      COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT2,
      COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'VEGETATION_PROPERTIES',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_FAPAR_300M_10DAILY),
      selectedFilters: {
        ...props,
      },
    };
  }

  if (
    [
      COPERNICUS_CLMS_FAPAR_1KM_10DAILY,
      COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT0,
      COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT1,
      COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT2,
      COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'VEGETATION_PROPERTIES',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_FAPAR_1KM_10DAILY),
      selectedFilters: {
        ...props,
      },
    };
  }

  if (
    [
      COPERNICUS_CLMS_FCOVER_1KM_10DAILY,
      COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT0,
      COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT1,
      COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT2,
      COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'VEGETATION_PROPERTIES',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_FCOVER_1KM_10DAILY),
      selectedFilters: {
        ...props,
      },
    };
  }

  if (
    [
      COPERNICUS_CLMS_FCOVER_300M_10DAILY,
      COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT0,
      COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT1,
      COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT2,
      COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'VEGETATION_PROPERTIES',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_FCOVER_300M_10DAILY),
      selectedFilters: {
        ...props,
      },
    };
  }

  if (
    [
      COPERNICUS_CLMS_GPP_300M_10DAILY_RT0,
      COPERNICUS_CLMS_GPP_300M_10DAILY_RT1,
      COPERNICUS_CLMS_GPP_300M_10DAILY_RT2,
      COPERNICUS_CLMS_GPP_300M_10DAILY_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'NET_GROSS_PRIMARY_PRODUCTION',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_GPP_300M_10DAILY_RT0),
      selectedFilters: {
        ...props,
      },
    };
  }

  if (
    [
      COPERNICUS_CLMS_NPP_300M_10DAILY_RT0,
      COPERNICUS_CLMS_NPP_300M_10DAILY_RT1,
      COPERNICUS_CLMS_NPP_300M_10DAILY_RT2,
      COPERNICUS_CLMS_NPP_300M_10DAILY_RT6,
    ].includes(datasetId)
  ) {
    const props = getConsolidationPeriodProps(datasetId);
    return {
      id: ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.id,
      instrument: 'NET_GROSS_PRIMARY_PRODUCTION',
      productType: getProductTypeFromDatasetId(COPERNICUS_CLMS_NPP_300M_10DAILY_RT0),
      selectedFilters: {
        ...props,
      },
    };
  }

  if (
    [
      CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
      CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
      CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
    ].includes(datasetId)
  ) {
    return {
      id: ODataCollections.OPTICAL.id,
      instrument: 'VHR_EUROPE',
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }

  return null;
};
const getConsolidationPeriodProps = (datasetId) => {
  const lastValue = datasetId.split('_').pop();
  if (!lastValue.includes('RT')) {
    return {};
  }
  const value = parseInt(lastValue[2]);
  if (isNaN(value) || value < 0) {
    return {};
  }
  return {
    [AttributeNames.consolidationPeriod]: [{ value: value, label: lastValue }],
  };
};

export const getCollectionInstruments = (collection) => {
  if (collection.instruments) {
    return collection.instruments;
  }
  if (!collection || !collection.items) {
    return [];
  }

  let instruments = [];

  // Process all items in the collection
  collection.items.forEach((item) => {
    if (item.type === 'instrument') {
      instruments.push(item);
    } else if (item.type === 'group' && item.items) {
      // Get instruments from it
      const groupInstruments = getGroupInstruments(item);
      instruments = [...instruments, ...groupInstruments];
    }
  });

  return instruments;
};

export const getGroupInstruments = (group) => {
  if (!group || !group.items) {
    return [];
  }

  let instruments = [];

  // Process all items in the group
  group.items.forEach((item) => {
    if (item.type === 'instrument') {
      instruments.push(item);
    } else if (item.type === 'group' && item.items) {
      // Get instruments from it
      const subGroupInstruments = getGroupInstruments(item);
      instruments = [...instruments, ...subGroupInstruments];
    }
  });

  return instruments;
};

export const getInstrumentProductTypes = (instrument) => {
  if (!instrument || !instrument.items) {
    return [];
  }
  return instrument.items.filter((item) => item.type === 'productType');
};

export const getCollectionInstrumentProductTypes = (collection, instrumentId) => {
  if (!collection || !instrumentId) {
    return [];
  }

  const findInstrument = (items) => {
    if (!items || !items.length) {
      return null;
    }

    for (const item of items) {
      if (item.type === 'instrument' && item.id === instrumentId) {
        return item;
      } else if (item.type === 'group' && item.items) {
        const foundInstrument = findInstrument(item.items);
        if (foundInstrument) {
          return foundInstrument;
        }
      }
    }

    return null;
  };

  const instrument = findInstrument(collection.items);
  return instrument ? getInstrumentProductTypes(instrument) : [];
};

export const findCollectionConfigById = (id) =>
  recursiveCollections.find((collection) => collection.id === id);

export const findInstrumentConfigById = (id) => {
  const findInstruments = (items = []) => {
    return items.flatMap((item) => {
      if (item.type === 'instrument') {
        return [item];
      } else if (item.type === 'group' && Array.isArray(item.items)) {
        return findInstruments(item.items);
      }
      return [];
    });
  };

  // Find all instruments from all collections
  return findInstruments(recursiveCollections.flatMap((c) => c.items)).find(
    (instrument) => instrument.id === id,
  );
};

export const findProductTypeConfigById = (id) => {
  const findProductTypes = (items = []) => {
    return items.flatMap((item) => {
      if (item.type === 'productType') {
        return [item];
      } else if (item.type !== 'collection' && Array.isArray(item.items)) {
        return findProductTypes(item.items);
      }
      return [];
    });
  };

  // Find all product types from all collections
  return findProductTypes(recursiveCollections.flatMap((c) => c.items)).find(
    (productType) => productType.id === id,
  );
};

export const findAdditionalFiltersConfigById = (collectionId, id) => {
  const collection = recursiveCollections.find((collection) => collection.id === collectionId);
  if (!collection || !collection.additionalFilters) {
    return null;
  }
  return collection.additionalFilters.find((af) => af.id === id);
};

export const checkCollectionSupports = (collectionId, supportedProperty) => {
  const collection = findCollectionConfigById(collectionId);

  if (!collection) {
    throw new Error(`No collection ${collection} found`);
  }

  return collection[supportedProperty] !== false;
};

export const checkInstrumentSupports = (instrumentId, supportedProperty) => {
  const instrument = findInstrumentConfigById(instrumentId);
  if (!instrument) {
    throw new Error(`No instrument ${instrumentId} found`);
  }

  // only instruments that don't support supportedProperty have it explicitly set
  return instrument[`supports${supportedProperty}`] !== false;
};

export const checkAllInstrumentsInCollectionSupport = (collectionId, supportedProperty) => {
  const collection = findCollectionConfigById(collectionId);
  const instruments = getCollectionInstruments(collection);
  return instruments.every((instrument) => checkInstrumentSupports(instrument.id, supportedProperty));
};

export const checkProductTypeSupports = (productTypeId, supportedProperty) => {
  const productType = findProductTypeConfigById(productTypeId);

  if (!productType) {
    throw new Error(`No product type ${productTypeId} found`);
  }

  // only products that don't support supportedProperty have it explicitly set
  return productType[`supports${supportedProperty}`] !== false;
};

export const checkAllProductsInInstrumentSupport = (instrumentId, supportedProperty) => {
  const instrument = findInstrumentConfigById(instrumentId);
  const productTypes = getInstrumentProductTypes(instrument);
  return productTypes.every((productType) => checkProductTypeSupports(productType.id, supportedProperty));
};

export const checkAllProductsInCollectionSupport = (collectionId, supportedProperty) => {
  const collection = findCollectionConfigById(collectionId);
  const instruments = getCollectionInstruments(collection);
  return instruments?.every((instrument) =>
    checkAllProductsInInstrumentSupport(instrument.id, supportedProperty),
  );
};

/**
 * Counts how many times the geometry filter will be repeated in an OData query.
 * This is important for URL length estimation, as complex geometries multiplied
 * by many repetitions can exceed browser URL limits.
 *
 * The geometry is repeated based on the query structure:
 * - If all products in a collection support geometry uniformly, it may be applied once at collection level
 * - Otherwise, it's applied at instrument or product type level
 *
 * @param {Array} collections - Array of collection objects with optional instruments and productTypes
 * @returns {number} - Estimated number of geometry filter repetitions
 */
export const countGeometryRepetitions = (collections) => {
  if (!collections || !collections.length) {
    return 1; // At least one occurrence for basic search
  }

  let repetitions = 0;

  collections.forEach((collection) => {
    const collectionConfig = findCollectionConfigById(collection.id);
    if (!collectionConfig) {
      repetitions += 1;
      return;
    }

    const hasInstrumentFilter =
      collection.instruments?.length > 0 || getCollectionInstruments(collectionConfig)?.length > 0;
    const allProductsSupportGeometry = checkAllProductsInCollectionSupport(
      collection.id,
      SUPPORTED_PROPERTIES.Geometry,
    );
    const allInstrumentsSupportInstrumentName = checkAllInstrumentsInCollectionSupport(
      collection.id,
      SUPPORTED_PROPERTIES.InstrumentName,
    );

    // Optimization case: geometry can be applied at top level
    if (!hasInstrumentFilter && allInstrumentsSupportInstrumentName && allProductsSupportGeometry) {
      repetitions += 1;
      return;
    }

    // Need to count instrument/productType level repetitions
    const instruments =
      collection.instruments?.length > 0
        ? collection.instruments
        : getCollectionInstruments(collectionConfig);

    instruments.forEach((instrument) => {
      const instrumentConfig = findInstrumentConfigById(instrument.id);
      const hasProductTypeFilter =
        instrument.productTypes?.length > 0 || getInstrumentProductTypes(instrumentConfig).length > 0;
      const allProductsInInstrumentSupportGeometry = checkAllProductsInInstrumentSupport(
        instrument.id,
        SUPPORTED_PROPERTIES.Geometry,
      );
      const instrumentSupportsInstrumentName = checkInstrumentSupports(
        instrument.id,
        SUPPORTED_PROPERTIES.InstrumentName,
      );

      // Optimization case: geometry can be applied at instrument level
      if (
        !hasProductTypeFilter &&
        instrumentSupportsInstrumentName &&
        allProductsInInstrumentSupportGeometry
      ) {
        repetitions += 1;
        return;
      }

      // Need to count product type level repetitions
      const productTypes =
        instrument.productTypes?.length > 0
          ? instrument.productTypes
          : getInstrumentProductTypes(instrumentConfig);

      productTypes.forEach((productType) => {
        const productTypeConfig = findProductTypeConfigById(productType.id);
        if (productTypeConfig?.productTypeIds?.length > 0) {
          // Multiple product type IDs means multiple repetitions
          repetitions += productTypeConfig.productTypeIds.length;
        } else {
          repetitions += 1;
        }
      });
    });
  });

  return Math.max(1, repetitions);
};

/**
 * Calculates the maximum allowed WKT geometry characters based on the number of
 * geometry repetitions in the query. This helps ensure the total URL stays within
 * browser limits (typically ~8000 characters for GET requests).
 *
 * @param {Array} collections - Array of collection objects
 * @param {number} maxUrlLength - Maximum URL length to target (default: 6000 to leave headroom)
 * @param {number} baseQueryLength - Estimated base query length without geometry (default: 1000)
 * @returns {number} - Maximum allowed characters per geometry occurrence
 */
export const calculateMaxGeometryChars = (collections, maxUrlLength = 6000, baseQueryLength = 1000) => {
  const repetitions = countGeometryRepetitions(collections);
  const availableChars = maxUrlLength - baseQueryLength;

  // Each geometry occurrence includes wrapper text like "OData.CSC.Intersects(area=geography'SRID=4326;...}')"
  // which adds ~60 chars of overhead
  const GEOMETRY_WRAPPER_OVERHEAD = 60;

  const maxCharsPerGeometry = Math.floor(availableChars / repetitions) - GEOMETRY_WRAPPER_OVERHEAD;

  // Minimum of 100 chars (enough for a simple bbox), maximum of 2000 chars
  return Math.max(100, Math.min(2000, maxCharsPerGeometry));
};

//creates timeIntervals filter
//(((date>=interval1From && date<interval1To) or (date>=interval2From && date<interval2To))...)
const createTimeIntervalsFilter = (timeIntervals) => {
  if (!(timeIntervals && timeIntervals.length)) {
    return null;
  }
  const timeIntervalsFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
  timeIntervals.forEach((interval) => {
    const timeIntervalFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
    timeIntervalFilter.expression(AttributeNames.sensingTime, ODataFilterOperator.ge, interval.fromTime);
    timeIntervalFilter.expression(AttributeNames.sensingTime, ODataFilterOperator.lt, interval.toTime);
    timeIntervalsFilter.or(timeIntervalFilter.getTree());
  });

  return timeIntervalsFilter.getTree();
};

// creates product type filter with geometry filter for products that support it
// (productType=Type.1 and intersects..)
const createProductTypeFilter = ({ productTypeId, productTypeConfig, geometry }) => {
  const productTypeFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);

  if (productTypeConfig.customFilterExpression) {
    productTypeFilter.addExpression(productTypeConfig.customFilterExpression);
  } else if (productTypeConfig.customFilterQueryByDatasetFull) {
    productTypeFilter.attribute(ODataAttributes.datasetFull, ODataFilterOperator.eq, productTypeId);
  } else if (productTypeConfig.customFilterQueryByProductType) {
    productTypeFilter.attribute(ODataAttributes.productType, ODataFilterOperator.eq, productTypeId);
  } else if (Array.isArray(productTypeConfig.name)) {
    productTypeConfig.name.forEach((name) => {
      productTypeFilter.contains(AttributeNames.productName, name, 'string');
    });
  } else {
    productTypeFilter.contains(AttributeNames.productName, productTypeConfig.name, 'string');
  }

  if (productTypeConfig.notName !== undefined) {
    if (Array.isArray(productTypeConfig.notName)) {
      productTypeConfig.notName.forEach((notName) => {
        productTypeFilter.notContains(AttributeNames.productName, notName, 'string');
      });
    } else {
      productTypeFilter.notContains(AttributeNames.productName, productTypeConfig.notName, 'string');
    }
  }

  if (geometry && checkProductTypeSupports(productTypeConfig.id, SUPPORTED_PROPERTIES.Geometry)) {
    const wkt = wellknown.stringify(geometry);
    productTypeFilter.intersects(wkt);
  }

  return productTypeFilter.getTree();
};

//creates productType filter
// (productTypeFilter1 or productTypeFilter2 ... )
const createProductTypesFilter = ({ instrument, geometry }) => {
  const hasProductTypeFilter = instrument.productTypes
    ? instrument.productTypes.length > 0
    : getInstrumentProductTypes(instrument).length > 0;
  const allProductsSupportGeometry = checkAllProductsInInstrumentSupport(
    instrument.id,
    SUPPORTED_PROPERTIES.Geometry,
  );
  const instrumentSupportsInstrumentName = checkInstrumentSupports(
    instrument.id,
    SUPPORTED_PROPERTIES.InstrumentName,
  );

  // optimisation: geometry constraint can be applied on top level when all product types share the same constraint
  if (!hasProductTypeFilter && instrumentSupportsInstrumentName && allProductsSupportGeometry && geometry) {
    const geometryFilter = new ODataFilterBuilder();
    const wkt = wellknown.stringify(geometry);
    geometryFilter.intersects(wkt);
    return geometryFilter.getTree();
  }
  const productTypes =
    hasProductTypeFilter && instrument.productTypes
      ? instrument.productTypes
      : getInstrumentProductTypes(findInstrumentConfigById(instrument.id));

  const productTypesFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
  productTypes.forEach((prodType) => {
    const productTypeConfig = findProductTypeConfigById(prodType.id);
    const productTypeIds =
      productTypeConfig.productTypeIds && productTypeConfig.productTypeIds.length > 0
        ? productTypeConfig.productTypeIds
        : [productTypeConfig.id];

    productTypeIds.forEach((productTypeId) => {
      const productTypeFilter = createProductTypeFilter({
        productTypeId,
        productTypeConfig,
        geometry,
      });
      productTypesFilter.add(productTypeFilter);
    });
  });

  return productTypesFilter.getTree();
};

//creates instrument filter
//(instrument=Instrument.id and cloudCover=value and productFilter)
const createInstrumentFilter = ({ instrument, geometry }) => {
  const instrumentFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);

  //add instrument
  if (checkInstrumentSupports(instrument.id, SUPPORTED_PROPERTIES.InstrumentName)) {
    const instrumentConfig = findInstrumentConfigById(instrument.id);
    instrumentFilter.addExpression(
      instrumentConfig?.customFilterExpression
        ? instrumentConfig.customFilterExpression
        : FilterElement.Attribute(ODataAttributes.instrument, ODataFilterOperator.eq, instrument.id),
    );
  }

  //add cloud coverage if it is supported
  //ignore cc if it is 100%
  if (
    instrument.cloudCover !== undefined &&
    instrument.cloudCover !== null &&
    instrument.cloudCover !== 100
  ) {
    instrumentFilter.attribute(ODataAttributes.cloudCover, ODataFilterOperator.le, instrument.cloudCover);
  }

  // add level 3 - product types
  const productTypesFilter = createProductTypesFilter({ instrument, geometry });
  if (productTypesFilter) {
    instrumentFilter.add(productTypesFilter);
  }
  return instrumentFilter.getTree();
};

//creates instruments filter
//(instrumentFilter1 or instrumentFilter2...)
const createInstrumentsFilter = ({ collection, geometry }) => {
  const hasInstrumentFilter = collection.instruments
    ? collection.instruments.length > 0
    : getCollectionInstruments(collection)?.length > 0;
  const allProductsSupportGeometry = checkAllProductsInCollectionSupport(
    collection.id,
    SUPPORTED_PROPERTIES.Geometry,
  );
  const allInstrumentsSupportInstrumentName = checkAllInstrumentsInCollectionSupport(
    collection.id,
    SUPPORTED_PROPERTIES.InstrumentName,
  );

  // optimisation: geometry constraint can be applied on top level when all product types share the same constraint
  if (!hasInstrumentFilter && allInstrumentsSupportInstrumentName && allProductsSupportGeometry && geometry) {
    const geometryFilter = new ODataFilterBuilder();
    const wkt = wellknown.stringify(geometry);
    geometryFilter.intersects(wkt);
    return geometryFilter.getTree();
  }

  const instruments =
    hasInstrumentFilter && collection.instruments
      ? collection.instruments
      : getCollectionInstruments(findCollectionConfigById(collection.id));

  const instrumentsFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
  instruments.forEach((instrument) => {
    const instrumentFilter = createInstrumentFilter({ instrument, geometry });
    instrumentsFilter.add(instrumentFilter);
  });

  return instrumentsFilter.getTree();
};

const applyAdditionalFilterElement = (filter, additionalFilterConfig, key, operator, value) => {
  const { filterElement } = additionalFilterConfig;

  switch (filterElement) {
    case FilterElement.Expression:
      filter.expression(key, operator, value);
      break;
    case FilterElement.CustomFilter:
      if (!additionalFilterConfig.customFilter) {
        throw new Error(`Property customFilter for attribute ${additionalFilterConfig.id} is not defined!`);
      }
      const optionFilter = additionalFilterConfig.customFilter(key, value);
      if (optionFilter) {
        filter.add(FilterElement.CustomFilter(optionFilter));
      }
      break;
    default:
      filter.attribute(ODataAttributes[key], operator, value);
  }
};

//creates additional filters
//(additionalFilter1 and  additionalFilter2...)
const createAdditionalFilters = (collectionId, additionalFilters) => {
  if (!additionalFilters) {
    return null;
  }

  const filter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
  Object.keys(additionalFilters).forEach((key) => {
    if (additionalFilters[key] === null || additionalFilters[key] === undefined) {
      return;
    }

    if (Array.isArray(additionalFilters[key]) && additionalFilters[key].length === 0) {
      return;
    }

    let additionalFilter = Array.isArray(additionalFilters[key])
      ? [...additionalFilters[key]]
      : additionalFilters[key];
    const additionalFilterConfig = findAdditionalFiltersConfigById(collectionId, key);

    if (!additionalFilterConfig) {
      console.error(`Configuration for filter ${key} for collection ${collectionId} is missing`);
      return;
    }

    if (additionalFilterConfig.preProcessFilters && isFunction(additionalFilterConfig.preProcessFilters)) {
      additionalFilter = additionalFilterConfig.preProcessFilters(additionalFilter);
    }

    if (Array.isArray(additionalFilter)) {
      const multiValueFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
      additionalFilter.forEach((option) => {
        applyAdditionalFilterElement(
          multiValueFilter,
          additionalFilterConfig,
          key,
          ODataFilterOperator.eq,
          option.value,
        );
      });
      filter.add(multiValueFilter.getTree());
    } else {
      applyAdditionalFilterElement(
        filter,
        additionalFilterConfig,
        key,
        ODataFilterOperator.eq,
        additionalFilter,
      );
    }
  });
  return filter.getTree();
};

//create collection filter
//(collectionName=Name && InstrumentFilters)
const createCollectionFilter = ({ collection, geometry }) => {
  const collectionFilter = new ODataFilterBuilder();

  //add collection id
  const collectionConfig = findCollectionConfigById(collection.id);
  if (collectionConfig?.supportsCollectionName === undefined || !!collectionConfig?.supportsCollectionName) {
    collectionFilter.addExpression(
      collectionConfig?.customFilterExpression
        ? collectionConfig?.customFilterExpression
        : FilterElement.Expression(
            AttributeNames.collectionName,
            ODataFilterOperator.eq,
            `'${
              collectionConfig?.collectionName ? collectionConfig?.collectionName : collectionConfig?.label
            }'`,
          ),
    );
  }

  // level 2 - instruments
  const instrumentsFilter = createInstrumentsFilter({ collection, geometry });
  if (instrumentsFilter) {
    collectionFilter.and(instrumentsFilter);
  }

  //additional filters
  const additionalFilters = createAdditionalFilters(collection.id, collection.additionalFilters);
  if (additionalFilters) {
    collectionFilter.and(additionalFilters);
  }

  //apply online filter for collections which don't support filtering by product availability
  if (collection.additionalFilters?.[AttributeNames.online] === undefined) {
    collectionFilter.expression(AttributeNames.online, ODataFilterOperator.eq, true);
  }

  return collectionFilter.getTree();
};

//create collection filters
//(collectionFilter1 or collectionFilter2 ...)
const createCollectionsFilter = ({ collections, geometry }) => {
  if (!(collections && collections.length)) {
    return null;
  }

  const collectionsFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
  // level 1 - collections
  collections.forEach((collection) => {
    const collectionFilter = createCollectionFilter({ collection, geometry });
    collectionsFilter.add(collectionFilter);
  });

  return collectionsFilter.getTree();
};

const createCollectionGroupFilter = ({
  collections,
  geometry,
  fromTime,
  toTime,
  timeIntervals,
  supportsDates,
}) => {
  const collectionGroupFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);

  const collectionsFilter = createCollectionsFilter({ collections, geometry: roundGeometryValues(geometry) });
  if (collectionsFilter) {
    collectionGroupFilter.and(collectionsFilter);
  }

  if (supportsDates) {
    if (fromTime) {
      collectionGroupFilter.expression(AttributeNames.sensingTime, ODataFilterOperator.ge, fromTime);
    }

    if (toTime) {
      collectionGroupFilter.expression(AttributeNames.sensingTime, ODataFilterOperator.lt, toTime);
    }

    const timeIntervalsFilter = createTimeIntervalsFilter(timeIntervals);
    if (timeIntervalsFilter) {
      collectionGroupFilter.and(timeIntervalsFilter);
    }
  }

  return collectionGroupFilter.getTree();
};

const createCollectionGroupsFilter = (
  { collections, geometry, fromTime, toTime, timeIntervals },
  groupBy,
) => {
  if (!collections) {
    return null;
  }

  const collectionGroup = new Map();

  collections.forEach((collection) => {
    const supports = checkCollectionSupports(collection.id, groupBy);
    if (collectionGroup.has(supports)) {
      collectionGroup.get(supports).push(collection);
    } else {
      collectionGroup.set(supports, [collection]);
    }
  });

  const collectionGroupsFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);

  collectionGroup.forEach((collectionGroup, supports) => {
    const collectionGroupFilter = createCollectionGroupFilter({
      collections: collectionGroup,
      geometry,
      fromTime,
      toTime,
      timeIntervals,
      [groupBy]: supports,
    });
    if (collectionGroupFilter) {
      collectionGroupsFilter.or(collectionGroupFilter);
    }
  });

  return collectionGroupsFilter.getTree();
};

const createProductFilter = ({ fromTime, toTime, geometry, name, collections, timeIntervals }) => {
  const oDataFilterBuilder = new ODataFilterBuilder(ExpressionTreeOperator.AND);

  if (name) {
    oDataFilterBuilder.contains(AttributeNames.productName, name, 'string');
  }

  const collectionGroupsFilter = createCollectionGroupsFilter(
    {
      fromTime,
      toTime,
      geometry,
      collections,
      timeIntervals,
    },
    'supportsDates',
  );

  if (collectionGroupsFilter) {
    oDataFilterBuilder.and(collectionGroupsFilter);
  } else {
    // apply dates when no collection is selected - search by product name only
    if (fromTime) {
      oDataFilterBuilder.expression(AttributeNames.sensingTime, ODataFilterOperator.ge, fromTime);
    }

    if (toTime) {
      oDataFilterBuilder.expression(AttributeNames.sensingTime, ODataFilterOperator.lt, toTime);
    }

    if (geometry) {
      const wkt = wellknown.stringify(geometry);
      oDataFilterBuilder.intersects(wkt);
    }

    const timeIntervalsFilter = createTimeIntervalsFilter(timeIntervals);
    if (timeIntervalsFilter) {
      oDataFilterBuilder.and(timeIntervalsFilter);
    }
  }

  return oDataFilterBuilder.getQueryString();
};

// this is done exclusively to keep the length of GET request below browser limit
export const roundGeometryValues = (sourceGeometry) => {
  const geometry = JSON.parse(JSON.stringify(sourceGeometry));

  Object.keys(geometry).forEach((key) => {
    if (typeof geometry[key] === 'object') {
      geometry[key] = roundGeometryValues(geometry[key]);
    }
    if (typeof geometry[key] === 'number') {
      geometry[key] = Math.round(geometry[key] * 1000) / 1000;
    }
  });

  return geometry;
};

/*
Construct query for basic search
*/
const createBasicSearchQuery = ({ fromTime, toTime, orbitDirection, geometry, datasetId, maxCC }) => {
  const oDataCollectionInfo = getODataCollectionInfoFromDatasetId(datasetId, {
    orbitDirection,
    maxCC,
  });
  let collections = [];
  if (oDataCollectionInfo) {
    collections = [
      {
        id: oDataCollectionInfo.id,
        ...(oDataCollectionInfo.instrument
          ? {
              instruments: oDataCollectionInfo.instrument
                ? [
                    {
                      id: oDataCollectionInfo.instrument,
                      ...(oDataCollectionInfo.maxCC ? { cloudCover: oDataCollectionInfo.maxCC } : {}),
                      ...(oDataCollectionInfo.productType
                        ? { productTypes: [{ id: oDataCollectionInfo.productType }] }
                        : {}),
                    },
                  ]
                : [],
            }
          : {}),
        additionalFilters: oDataCollectionInfo.selectedFilters,
      },
    ];
  }

  const params = {
    collections,
    geometry,
    fromTime,
    toTime,
  };
  return createAdvancedSearchQuery(params);
};

/*
Construct query for advanced search
*/
const createAdvancedSearchQuery = (params) => {
  const filter = createProductFilter(params);
  const oqb = new ODataQueryBuilder(ODataEntity.Products)
    .filter(filter)
    .orderBy(AttributeNames.sensingTime, OrderingDirection.desc)
    .attributes()
    .count()
    .top(PAGE_SIZE)
    .assets();

  return oqb;
};

const getAttributeValue = (result, attributeName) => {
  const attribute = result.Attributes.find((attr) => attr.Name === attributeName);
  return attribute?.Value;
};

const getPreviewUrl = (result) => {
  return result?.Assets?.[0]?.DownloadLink;
};

const formatFileSize = (size) => {
  if (size === null || size === undefined) {
    return '';
  }
  const sizeMb = Math.round(size / (1024 * 1024));
  if (sizeMb < 1) {
    return `< 1MB`;
  }
  return `${sizeMb}MB`;
};

const formatSearchResults = (results) => {
  if (!results) {
    return null;
  }

  const converted = results.map((result) => {
    return {
      id: result.Id,
      name: result.Name,
      geometry: result.Footprint && wellknown.parse(result.Footprint.replace('geography', '')),
      previewUrl: getPreviewUrl(result),
      sensingTime: result['ContentDate']['Start'],
      platformShortName: getAttributeValue(result, AttributeNames.platformShortName),
      instrumentShortName: getAttributeValue(result, AttributeNames.instrumentShortName),
      productType: getAttributeValue(result, AttributeNames.productType),
      size: formatFileSize(result.ContentLength),
      originDate: result.OriginDate,
      publicationDate: result.PublicationDate,
      modificationDate: result.ModificationDate,
      online: result.Online,
      S3Path: result.S3Path,
      attributes: result.Attributes,
      contentLength: result.ContentLength,
    };
  });
  return converted;
};

const formatAttributesNames = (attribute) => {
  return FormatedAttributeNames[attribute] ? FormatedAttributeNames[attribute]() : attribute;
};

const oDataHelpers = {
  createBasicSearchQuery: createBasicSearchQuery,
  createAdvancedSearchQuery: createAdvancedSearchQuery,
  formatSearchResults: formatSearchResults,
  formatAttributesNames: formatAttributesNames,
};

export const SUPPORTED_PROPERTIES = {
  Geometry: 'Geometry',
  InstrumentName: 'InstrumentName',
};

export default oDataHelpers;
