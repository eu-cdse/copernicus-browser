import {
  MODIS,
  S1_AWS_IW_VVVH,
  S1_AWS_IW_VV,
  S1_AWS_EW_HHHV,
  S1_AWS_EW_HH,
  S2L1C,
  S2L2A,
  S3OLCI,
  S3SLSTR,
  AWS_L8L1C,
  S5_O3,
  S5_NO2,
  S5_CO,
  S5_HCHO,
  S5_CH4,
  S5_AER_AI,
  S5_CLOUD,
  S5_SO2,
  S5_OTHER,
  PROBAV_S1,
  PROBAV_S5,
  PROBAV_S10,
  GIBS_MODIS_TERRA,
  GIBS_MODIS_AQUA,
  GIBS_VIIRS_SNPP_CORRECTED_REFLECTANCE,
  GIBS_VIIRS_SNPP_DAYNIGHTBAND_ENCC,
  GIBS_CALIPSO_WWFC_V3_01,
  GIBS_CALIPSO_WWFC_V3_02,
  GIBS_BLUEMARBLE,
  GIBS_MISR,
  GIBS_ASTER_GDEM,
  CUSTOM,
  AWS_LOTL1,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

import {
  LayersFactory,
  DATASET_AWS_L8L1C,
  DATASET_BYOC,
  DATASET_MODIS,
  DATASET_S2L1C,
  DATASET_S2L2A,
  DATASET_S3OLCI,
  DATASET_S3SLSTR,
  DATASET_S5PL2,
  DATASET_AWSEU_S1GRD,
} from '@sentinel-hub/sentinelhub-js';

import { reqConfigMemoryCache } from '../const';

export const datasourceToDatasetId = {
  'Sentinel-2 L1C': S2L1C,
  'Sentinel-2 L2A': S2L2A,
  'Sentinel-1 AWS (S1-AWS-IW-VVVH)': S1_AWS_IW_VVVH,
  'Sentinel-1 AWS (S1-AWS-EW-HHHV)': S1_AWS_EW_HHHV,
  'Sentinel-1 AWS (S1-AWS-IW-VV)': S1_AWS_IW_VV,
  'Sentinel-5P AER_AI': S5_AER_AI,
  'Sentinel-5P CH4': S5_CH4,
  'Sentinel-5P CLOUD': S5_CLOUD,
  'Sentinel-5P CO': S5_CO,
  'Sentinel-5P HCHO': S5_HCHO,
  'Sentinel-5P NO2': S5_NO2,
  'Sentinel-5P O3': S5_O3,
  'Sentinel-5P SO2': S5_SO2,
  'Sentinel-3 SLSTR': S3SLSTR,
  'Sentinel-3 OLCI': S3OLCI,
  'Sentinel-3 OLCI (forestry)': S3OLCI,
  'Landsat 8 USGS': AWS_L8L1C,
  MODIS: MODIS,
  'Proba-V 1-day (S1)': PROBAV_S1,
  'Proba-V 5-day (S5)': PROBAV_S5,
  'Proba-V 10-day (S10)': PROBAV_S10,
  'GIBS MODIS Terra': GIBS_MODIS_TERRA,
  'GIBS MODIS Aqua': GIBS_MODIS_AQUA,
  'GIBS VIIRS SNPP Corrected Reflectance': GIBS_VIIRS_SNPP_CORRECTED_REFLECTANCE,
  'GIBS VIIRS SNPP DayNightBand ENCC': GIBS_VIIRS_SNPP_DAYNIGHTBAND_ENCC,
  'GIBS CALIPSO Wide Field Camera Radiance v3-01': GIBS_CALIPSO_WWFC_V3_01,
  'GIBS CALIPSO Wide Field Camera Radiance v3-02': GIBS_CALIPSO_WWFC_V3_02,
  'GIBS BlueMarble': GIBS_BLUEMARBLE,
  'GIBS MISR': GIBS_MISR,
  'GIBS ASTER GDEM': GIBS_ASTER_GDEM,
  //volcanoes (on config.js):
  'Change Detection, L8 USGS': AWS_L8L1C,
  'Landsat 8 USGS (Historical)': AWS_L8L1C,
  'Flooding/Droughts, L8 USGS': AWS_L8L1C,
  'Vegetation, L8 USGS': AWS_L8L1C,
  'Volcanoes, S2L1C': S2L1C,
  'Volcanoes, S2L2A': S2L2A,
  'Sentinel-2 L2A - volcanoes': S2L2A,
  'Sentinel-2 L1C - volcanoes': S2L1C,
  'Volcanoes, L8 USGS': AWS_L8L1C,
  'Volcanoes (L8 L1C)': AWS_L8L1C,
  'Vegetation, S2L1C': S2L1C,
  'Vegetation, S2L2A': S2L2A,
  'Sentinel-2 L2A - forestry': S2L2A,
  'Earth From Space, S2L1C': S2L1C,
  'Earth From Space, S2L2A': S2L2A,
  'Sentinel-2 L2A introduction': S2L2A,
  'Sentinel-2 L1C introduction': S2L1C,
  'Urban, S2L1C': S2L1C,
  'Urban, S2L2A': S2L2A,
  'Sentinel-2 L2A - urban': S2L2A,
  'Sentinel-2 L2A urban': S2L2A,
  'Sentinel-2 L1C - urban': S2L1C,
  'Sentinel-2 L1C urban': S2L1C,
  'Flooding/Droughts, S2L1C': S2L1C,
  'Flooding/Droughts, S2L2A': S2L2A,
  'Sentinel-2 L2A - humidity': S2L2A,
  'Sentinel-2 L1C - humidity': S2L1C,
  'Water Bodies, S2L1C': S2L1C,
  'Water Bodies, S2L2A': S2L2A,
  'Sentinel-2 L2A - water': S2L2A,
  'Sentinel-2 L2A water': S2L2A,
  'Sentinel-2 L1C water': S2L1C,
  'Geology, S2L1C': S2L1C,
  'Geology, S2L2A': S2L2A,
  'Sentinel-2 L2A - geology': S2L2A,
  'Sentinel-2 L1C geology': S2L2A,
  'Agriculture, S2L1C': S2L1C,
  'Agriculture, S2L2A': S2L2A,
  'Sentinel-2 L2A - agriculture': S2L2A,
  'Sentinel-2 L2A agriculture': S2L2A,
  'Snow and Glaciers, S2L1C': S2L1C,
  'Snow and Glaciers, S2L2A': S2L2A,
  'Sentinel-2 L2A - snow': S2L2A,
  'Sentinel-2 L2A snow': S2L2A,
  'Sentinel-2 L1C - snow': S2L1C,
  'Sentinel-2 L1C snow': S2L1C,
  'Change Detection, S2L1C': S2L1C,
  'Change Detection, S2L2A': S2L2A,
  'Historical (S2L2A)': S2L2A,
  'Historical (S2L1C)': S2L1C,
  'Vegetation, S3-OLCI': S3OLCI,
  'Wildfires, S3-SLSTR': S3SLSTR,
  'Wildfires, S3-OLCI': S3OLCI,
  //Wildfires (config.js based)
  'Wildfires, S2L1C': S2L1C,
  'Sentinel-2 L2A - wildfires': S2L2A,
  'Sentinel-2 L1C - wildfires': S2L1C,
  'Sentinel-2 L2A - wildfires - pins': S2L2A,
  'Sentinel-2 L1C - wildfires - pins': S2L1C,
  'Wildfires, S2L2A': S2L2A,
  'Wildfires (S-2 L2A)': S2L2A,
  'Wildfires (S-2 L1C)': S2L1C,
  /* Contradictory name origins from a wrongly named datasource name
   */
  'Sentinel-2 S5P - wildfires': S5_CO,
  //Atmoshphere_monitoring (config.js)
  'Atmosphere CO': S5_CO,
  'Atmosphere NO2': S5_NO2,
  'Atmosphere CH4': S5_CH4,
  'Atmosphere SO2': S5_SO2,
  'Atmosphere O3': S5_O3,
  'Atmosphere HCHO': S5_HCHO,
  'Atmosphere AER': S5_AER_AI,
  'Atmosphere CLOUD': S5_CLOUD,
  'Sentinel-2 L1C - geology': S2L1C,
};

export const dataSourceToThemeId = {
  //volcanoes (on config.js):
  'Change Detection, L8 USGS': 'HISTORICAL',
  'Landsat 8 USGS (Historical)': 'HISTORICAL',
  'Flooding/Droughts, L8 USGS': 'FLOODING',
  'Vegetation, L8 USGS': 'FORESTRY',
  'Change Detection, Envisat': 'HISTORICAL',
  'Envisat Meris (Historical)': 'HISTORICAL',
  'Change Detection, L5 ESA': 'HISTORICAL',
  'Landsat 5 ESA': 'HISTORICAL',
  'Volcanoes, S2L1C': 'VOLCANOES',
  'Volcanoes, S2L2A': 'VOLCANOES',
  'Sentinel-2 L2A - volcanoes': 'VOLCANOES',
  'Sentinel-2 L1C - volcanoes': 'VOLCANOES',
  'Volcanoes, L8 USGS': 'VOLCANOES',
  'Volcanoes (L8 L1C)': 'VOLCANOES',
  'Vegetation, S2L1C': 'FORESTRY',
  'Vegetation, S2L2A': 'FORESTRY',
  'Sentinel-3 OLCI (forestry)': 'FORESTRY',
  'Sentinel-2 L2A - forestry': 'FORESTRY',
  'Earth From Space, S2L1C': 'MONITORING',
  'Earth From Space, S2L2A': 'MONITORING',
  'Sentinel-2 L2A introduction': 'MONITORING',
  'Sentinel-2 L1C introduction': 'MONITORING',
  'Urban, S2L1C': 'URBAN',
  'Urban, S2L2A': 'URBAN',
  'Sentinel-2 L2A - urban': 'URBAN',
  'Sentinel-2 L2A urban': 'URBAN',
  'Sentinel-2 L1C - urban': 'URBAN',
  'Sentinel-2 L1C urban': 'URBAN',
  'Flooding/Droughts, S2L1C': 'FLOODING',
  'Flooding/Droughts, S2L2A': 'FLOODING',
  'Sentinel-2 L2A - humidity': 'FLOODING',
  'Sentinel-2 L1C - humidity': 'FLOODING',
  'Water Bodies, S2L1C': 'OCEAN',
  'Water Bodies, S2L2A': 'OCEAN',
  'Sentinel-2 L2A - water': 'OCEAN',
  'Sentinel-2 L2A water': 'OCEAN',
  'Sentinel-2 L1C water': 'OCEAN',
  'Geology, S2L1C': 'GEOLOGY',
  'Geology, S2L2A': 'GEOLOGY',
  'Sentinel-2 L2A - geology': 'GEOLOGY',
  'Sentinel-2 L1C geology': 'GEOLOGY',
  'Sentinel-2 L1C - geology': 'GEOLOGY',
  'Agriculture, S2L1C': 'AGRICULTURE',
  'Agriculture, S2L2A': 'AGRICULTURE',
  'Sentinel-2 L2A - agriculture': 'AGRICULTURE',
  'Sentinel-2 L2A agriculture': 'AGRICULTURE',
  'Snow and Glaciers, S2L1C': 'SNOW',
  'Snow and Glaciers, S2L2A': 'SNOW',
  'Sentinel-2 L2A - snow': 'SNOW',
  'Sentinel-2 L2A snow': 'SNOW',
  'Sentinel-2 L1C - snow': 'SNOW',
  'Sentinel-2 L1C snow': 'SNOW',
  'Change Detection, S2L1C': 'HISTORICAL',
  'Change Detection, S2L2A': 'HISTORICAL',
  'Historical (S2L2A)': 'HISTORICAL',
  'Historical (S2L1C)': 'HISTORICAL',
  'Vegetation, S3-OLCI': 'FORESTRY',
  'Wildfires, S3-SLSTR': 'WILDFIRES',
  'Wildfires, S3-OLCI': 'WILDFIRES',
  //Wildfires (config.js based)
  'Wildfires, S2L1C': 'WILDFIRES',
  'Sentinel-2 L2A - wildfires': 'WILDFIRES',
  'Sentinel-2 L1C - wildfires': 'WILDFIRES',
  'Sentinel-2 L2A - wildfires - pins': 'WILDFIRES',
  'Sentinel-2 L1C - wildfires - pins': 'WILDFIRES',
  'Wildfires, S2L2A': 'WILDFIRES',
  'Wildfires (S-2 L2A)': 'WILDFIRES',
  'Wildfires (S-2 L1C)': 'WILDFIRES',
  /* Contradictory name origins from a wrongly named datasource name
   */
  'Sentinel-2 S5P - wildfires': 'WILDFIRES',
  //Atmoshphere_monitoring (config.js)
  'Atmosphere CO': 'ATMOSPHERE',
  'Atmosphere NO2': 'ATMOSPHERE',
  'Atmosphere CH4': 'ATMOSPHERE',
  'Atmosphere SO2': 'ATMOSPHERE',
  'Atmosphere O3': 'ATMOSPHERE',
  'Atmosphere HCHO': 'ATMOSPHERE',
  'Atmosphere AER': 'ATMOSPHERE',
  'Atmosphere CLOUD': 'ATMOSPHERE',
};

const getDatasetIdFromParamsS1 = (params) => {
  switch (params) {
    case 'AWS IW DV':
      return S1_AWS_IW_VVVH;
    case 'AWS IW SV':
      return S1_AWS_IW_VV;
    case 'AWS EW DH':
      return S1_AWS_EW_HHHV;
    case 'AWS EW SH':
      return S1_AWS_EW_HH;
    default:
      return '';
  }
};

const layerToDatasetId = async (layer, instanceId) => {
  const dataset = layer.dataset.id;
  switch (dataset) {
    case DATASET_S2L1C.id:
      return S2L1C;
    case DATASET_S2L2A.id:
      return S2L2A;
    case DATASET_S3OLCI.id:
      return S3OLCI;
    case DATASET_S3SLSTR.id:
      return S3SLSTR;
    case DATASET_AWSEU_S1GRD.id:
      try {
        await layer.updateLayerFromServiceIfNeeded(reqConfigMemoryCache);
        const params = 'AWS ' + layer.acquisitionMode + ' ' + layer.polarization;
        return getDatasetIdFromParamsS1(params);
      } catch (er) {
        return;
      }
    case DATASET_AWS_L8L1C.id:
      return AWS_L8L1C;
    case DATASET_S5PL2.id:
      return S5_OTHER;
    case DATASET_MODIS.id:
      return MODIS;
    case DATASET_BYOC.id:
      return CUSTOM;
    case 'AWS_DEM':
      return '';
    default:
      return '';
  }
};

export const getDatasetIdFromInstanceId = async (instanceId, preset) => {
  const layerInstance = instanceId.split('/').pop();
  let datasetId;
  try {
    const layers = await LayersFactory.makeLayers(
      `https://services.sentinel-hub.com/ogc/wms/${layerInstance}`,
      null,
      null,
      reqConfigMemoryCache,
    );
    const selectedLayer = layers.find((l) => l.layerId === preset);
    datasetId = await layerToDatasetId(selectedLayer, layerInstance);
  } catch (err) {
    console.log('error creating layers');
  }
  return datasetId;
};

export const datasourceToUrl = {
  'Sentinel-2 L1C': 'https://services.sentinel-hub.com/ogc/wms/42924c-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A': 'https://services.sentinel-hub.com/ogc/wms/bd86bc-YOUR-INSTANCEID-HERE',
  'Sentinel-1 AWS (S1-AWS-IW-VVVH)':
    'https://services.sentinel-hub.com/ogc/wms/f2068f-YOUR-INSTANCEID-HERE',
  'Sentinel-1 GRD IW': 'https://eocloud.sentinel-hub.com/v1/wms/6a6b78-YOUR-INSTANCEID-HERE',
  'Sentinel-1 GRD EW': 'https://eocloud.sentinel-hub.com/v1/wms/52803c-YOUR-INSTANCEID-HERE',
  'Sentinel-1 AWS (S1-AWS-EW-HHHV)':
    'https://services.sentinel-hub.com/ogc/wms/694b40-YOUR-INSTANCEID-HERE',
  'Sentinel-1 AWS (S1-AWS-IW-VV)':
    'https://services.sentinel-hub.com/ogc/wms/118885-YOUR-INSTANCEID-HERE',
  'Sentinel-1 GRD EW SH': 'https://eocloud.sentinel-hub.com/v1/wms/3f5321-YOUR-INSTANCEID-HERE',
  'Sentinel-5P AER_AI': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Sentinel-5P CH4': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Sentinel-5P CLOUD': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Sentinel-5P CO': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Sentinel-5P HCHO': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Sentinel-5P NO2': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Sentinel-5P O3': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Sentinel-5P SO2': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Sentinel-3 SLSTR': 'https://services.sentinel-hub.com/ogc/wms/786d82-YOUR-INSTANCEID-HERE',
  'Sentinel-3 OLCI': 'https://services.sentinel-hub.com/ogc/wms/82f84f-YOUR-INSTANCEID-HERE',
  'Landsat 5 ESA': 'https://eocloud.sentinel-hub.com/v1/wms/e3e5e6-YOUR-INSTANCEID-HERE',
  'Landsat 7 ESA': 'https://eocloud.sentinel-hub.com/v1/wms/65e58c-YOUR-INSTANCEID-HERE',
  'Landsat 8 ESA': 'https://eocloud.sentinel-hub.com/v1/wms/2d8dbf-YOUR-INSTANCEID-HERE',
  'Landsat 8 USGS': 'https://services.sentinel-hub.com/ogc/wms/950dce-YOUR-INSTANCEID-HERE',
  'Envisat Meris': 'https://eocloud.sentinel-hub.com/v1/wms/65a188-YOUR-INSTANCEID-HERE',
  MODIS: 'https://services.sentinel-hub.com/ogc/wms/a322e0-YOUR-INSTANCEID-HERE',
  'Proba-V 1-day (S1)': 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows',
  'Proba-V 5-day (S5)': 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows',
  'Proba-V 10-day (S10)': 'https://proba-v-mep.esa.int/applications/geo-viewer/app/geoserver/ows',
  'GIBS MODIS Terra': 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi',
  'GIBS MODIS Aqua': 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi',
  'GIBS VIIRS SNPP Corrected Reflectance': 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi',
  'GIBS VIIRS SNPP DayNightBand ENCC': 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi',
  'GIBS CALIPSO Wide Field Camera Radiance v3-01':
    'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi',
  'GIBS CALIPSO Wide Field Camera Radiance v3-02':
    'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi',
  'GIBS BlueMarble': 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi',
  'GIBS MISR': 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi',
  'GIBS ASTER GDEM': 'https://gibs.earthdata.nasa.gov/wms/epsg4326/best/wms.cgi',
  //volcanoes
  'Change Detection, L8 USGS':
    'https://services.sentinel-hub.com/ogc/wms/a2b6e4-YOUR-INSTANCEID-HERE',
  'Landsat 8 USGS (Historical)':
    'https://services.sentinel-hub.com/ogc/wms/a2b6e4-YOUR-INSTANCEID-HERE',
  'Flooding/Droughts, L8 USGS':
    'https://services.sentinel-hub.com/ogc/wms/1f6348-YOUR-INSTANCEID-HERE',
  'Vegetation, L8 USGS': 'https://services.sentinel-hub.com/ogc/wms/4b077b-YOUR-INSTANCEID-HERE',
  'Change Detection, Envisat': 'https://eocloud.sentinel-hub.com/v1/wms/000830-YOUR-INSTANCEID-HERE',
  'Envisat Meris (Historical)':
    'https://eocloud.sentinel-hub.com/v1/wms/000830-YOUR-INSTANCEID-HERE',
  'Volcanoes, S2L1C': 'https://services.sentinel-hub.com/ogc/wms/ad8bbb-YOUR-INSTANCEID-HERE',
  'Volcanoes, S2L2A': 'https://services.sentinel-hub.com/ogc/wms/cb8d43-YOUR-INSTANCEID-HERE',
  'Volcanoes, L8 USGS': 'https://services.sentinel-hub.com/ogc/wms/53f4f3-YOUR-INSTANCEID-HERE',
  'Volcanoes (L8 L1C)': 'https://services.sentinel-hub.com/ogc/wms/53f4f3-YOUR-INSTANCEID-HERE',
  'Vegetation, S2L1C': 'https://services.sentinel-hub.com/ogc/wms/8d6624-YOUR-INSTANCEID-HERE',
  'Vegetation, S2L2A': 'https://services.sentinel-hub.com/ogc/wms/2730da-YOUR-INSTANCEID-HERE',
  'Earth From Space, S2L1C': 'https://services.sentinel-hub.com/ogc/wms/4407ca-YOUR-INSTANCEID-HERE',
  'Earth From Space, S2L2A': 'https://services.sentinel-hub.com/ogc/wms/4e7f01-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L1C introduction':
    'https://services.sentinel-hub.com/ogc/wms/4407ca-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A introduction':
    'https://services.sentinel-hub.com/ogc/wms/4e7f01-YOUR-INSTANCEID-HERE',
  'Urban, S2L1C': 'https://services.sentinel-hub.com/ogc/wms/02e09c-YOUR-INSTANCEID-HERE',
  'Urban, S2L2A': 'https://services.sentinel-hub.com/ogc/wms/bf6e66-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L1C - urban': 'https://services.sentinel-hub.com/ogc/wms/02e09c-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A - urban': 'https://services.sentinel-hub.com/ogc/wms/bf6e66-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L1C urban': 'https://services.sentinel-hub.com/ogc/wms/02e09c-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A urban': 'https://services.sentinel-hub.com/ogc/wms/bf6e66-YOUR-INSTANCEID-HERE',
  'Flooding/Droughts, S2L1C':
    'https://services.sentinel-hub.com/ogc/wms/9a82b8-YOUR-INSTANCEID-HERE',
  'Flooding/Droughts, S2L2A':
    'https://services.sentinel-hub.com/ogc/wms/1f6348-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L1C - humidity':
    'https://services.sentinel-hub.com/ogc/wms/9a82b8-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A - humidity':
    'https://services.sentinel-hub.com/ogc/wms/1f6348-YOUR-INSTANCEID-HERE',
  'Water Bodies, S2L1C': 'https://services.sentinel-hub.com/ogc/wms/961331-YOUR-INSTANCEID-HERE',
  'Water Bodies, S2L2A': 'https://services.sentinel-hub.com/ogc/wms/eac23b-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L1C water': 'https://services.sentinel-hub.com/ogc/wms/961331-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A - water': 'https://services.sentinel-hub.com/ogc/wms/eac23b-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A water': 'https://services.sentinel-hub.com/ogc/wms/eac23b-YOUR-INSTANCEID-HERE',
  'Geology, S2L1C': 'https://services.sentinel-hub.com/ogc/wms/18f7c3-YOUR-INSTANCEID-HERE',
  'Geology, S2L2A': 'https://services.sentinel-hub.com/ogc/wms/239b83-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L1C geology': 'https://services.sentinel-hub.com/ogc/wms/18f7c3-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L1C - geology':
    'https://services.sentinel-hub.com/ogc/wms/18f7c3-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A - geology':
    'https://services.sentinel-hub.com/ogc/wms/239b83-YOUR-INSTANCEID-HERE',
  'Agriculture, S2L1C': 'https://services.sentinel-hub.com/ogc/wms/fa8422-YOUR-INSTANCEID-HERE',
  'Agriculture, S2L2A': 'https://services.sentinel-hub.com/ogc/wms/c6c712-YOUR-INSTANCEID-HERE',
  'Snow and Glaciers, S2L1C':
    'https://services.sentinel-hub.com/ogc/wms/6ab085-YOUR-INSTANCEID-HERE',
  'Snow and Glaciers, S2L2A':
    'https://services.sentinel-hub.com/ogc/wms/08bc6d-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L1C - snow': 'https://services.sentinel-hub.com/ogc/wms/6ab085-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A - snow': 'https://services.sentinel-hub.com/ogc/wms/08bc6d-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L1C snow': 'https://services.sentinel-hub.com/ogc/wms/6ab085-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A snow': 'https://services.sentinel-hub.com/ogc/wms/08bc6d-YOUR-INSTANCEID-HERE',
  'Change Detection, S2L1C': 'https://services.sentinel-hub.com/ogc/wms/3f2caf-YOUR-INSTANCEID-HERE',
  'Change Detection, S2L2A': 'https://services.sentinel-hub.com/ogc/wms/1b882a-YOUR-INSTANCEID-HERE',
  'Historical (S2L1C)': 'https://services.sentinel-hub.com/ogc/wms/3f2caf-YOUR-INSTANCEID-HERE',
  'Historical (S2L2A)': 'https://services.sentinel-hub.com/ogc/wms/1b882a-YOUR-INSTANCEID-HERE',
  'Vegetation, S3-OLCI': 'https://services.sentinel-hub.com/ogc/wms/89b5c4-YOUR-INSTANCEID-HERE',
  'Wildfires, S3-SLSTR': 'https://services.sentinel-hub.com/ogc/wms/616409-YOUR-INSTANCEID-HERE',
  'Wildfires, S3-OLCI': 'https://services.sentinel-hub.com/ogc/wms/9acaad-YOUR-INSTANCEID-HERE',
  'Change Detection, L5 ESA': 'https://eocloud.sentinel-hub.com/v1/wms/e3e5e6-YOUR-INSTANCEID-HERE',
  //Wildfires
  'Wildfires, S2L1C': 'https://services.sentinel-hub.com/ogc/wms/146ebe-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A - wildfires':
    'https://services.sentinel-hub.com/ogc/wms/aae187-YOUR-INSTANCEID-HERE',
  'Wildfires, S2L2A': 'https://services.sentinel-hub.com/ogc/wms/aae187-YOUR-INSTANCEID-HERE',
  'Sentinel-2 L2A - wildfires - pins':
    'https://services.sentinel-hub.com/ogc/wms/aae187-YOUR-INSTANCEID-HERE',
  'Wildfires (S-2 L2A)': 'https://services.sentinel-hub.com/ogc/wms/aae187-YOUR-INSTANCEID-HERE',
  /* Contradictory name origins from a wrongly named datasource name
   */
  'Sentinel-2 S5P - wildfires':
    'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  //Atmoshphere_monitoring
  'Atmosphere CO': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Atmosphere NO2': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Atmosphere CH4': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Atmosphere SO2': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Atmosphere O3': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Atmosphere HCHO': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Atmosphere AER': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
  'Atmosphere CLOUD': 'https://services.sentinel-hub.com/ogc/wms/2c5dc5-YOUR-INSTANCEID-HERE',
};

const EOB3DatasourceToUrl = {
  'Landsat 8 L1': 'https://services.sentinel-hub.com/ogc/wms/e35192-YOUR-INSTANCEID-HERE',
};

export const getNewDatasetPropertiesIfDeprecatedDatasetId = (datasetId, visualizationUrl) => {
  let newProperties = {};

  if (datasetId === AWS_L8L1C) {
    newProperties.datasetId = AWS_LOTL1;

    if (visualizationUrl === datasourceToUrl['Landsat 8 USGS']) {
      newProperties.visualizationUrl = EOB3DatasourceToUrl['Landsat 8 L1'];
    }
  }

  return newProperties;
};

export const replaceDeprecatedDatasetWithNew = (dataFusion, { oldDataset, newDataset }) => {
  return dataFusion.map((d) => {
    if (d.id === oldDataset.id) {
      d.id = newDataset.id;
      return d;
    }
    return d;
  });
};

export const presetToLayerId = (preset) => {
  switch (preset) {
    case 'SCENE-CLASSIFICATION-MAP':
      return 'SCENE-CLASSIFICATION';
    default:
      return preset;
  }
};
