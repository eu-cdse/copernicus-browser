import { t } from 'ttag';

const FALLBACK_SH_SERVICES_URL = 'https://sh.dataspace.copernicus.eu';

export const S2QuarterlyCloudlessMosaicsInstance = {
  id: 'S2-QUARTERLY-CLOUDLESS-MOSAICS',
  name: 'S2 Quarterly Cloudless Mosaics',
  service: 'WMS',
  url: `${
    global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
  }/ogc/wms/867895-YOUR-INSTANCEID-HERE`,
};

export const S2QuarterlyCloudlessMosaicsBaseLayerTheme = {
  name: 'Sentinel-2 Quarterly Cloudless Mosaics Base Layers Theme',
  id: 'S2QCMBL-THEME',
  content: [
    {
      ...S2QuarterlyCloudlessMosaicsInstance,
      id: `${S2QuarterlyCloudlessMosaicsInstance.name} Base Layer`,
      name: 'Sentinel-2 Mosaic',
      baseLayer: true,
    },
  ],
};

const EDUCATION_THEMES = [];

const educationThemesDefaultMode = EDUCATION_THEMES.map((t) => {
  const normalModePostfix = '-NORMAL-MODE';
  const eduThemeNormalMode = { ...t, id: `${t.id}${normalModePostfix}` };
  if (t.pins) {
    eduThemeNormalMode.pins = t.pins.map((p) => ({ ...p, themeId: `${p.themeId}${normalModePostfix}` }));
  }
  return eduThemeNormalMode;
});

export const DEFAULT_THEMES = [
  {
    name: () => t`Default`,
    id: 'DEFAULT-THEME',
    content: [
      {
        name: 'Sentinel-1 EW HH',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/6fead8-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 EW HH+HV',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/6e3529-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 EW VV',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/96ac73-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 EW VV+VH',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b97ea7-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 IW VV',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/dea335-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 IW VV+VH',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ea8206-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 IW HH',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e8ac80-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 IW HH+HV',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/2bdb51-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 SM HH',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d40367-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 SM HH+HV',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e84bda-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 SM VV',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a994bc-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 SM VV+VH',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/f1c110-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-2 L1C',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/274a99-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-2 L2A',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a91f72-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Sentinel-3 OLCI',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4b010c-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Sentinel-3 OLCI L2',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/9aaacd-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Sentinel-3 SYNERGY',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/42f9b0-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Sentinel-3 SLSTR',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ef19b6-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-5P O3 / NO2 / ...',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'DEM COPERNICUS_30',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b001a3-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'DEM COPERNICUS_90',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7a91ca-YOUR-INSTANCEID-HERE`,
      },
      { ...S2QuarterlyCloudlessMosaicsInstance, preselected: true },
      {
        name: 'Sentinel-1 Mosaics DH',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/aa0b18-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-1 Mosaics IW',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/c9e05c-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'WorldCover Annual Cloudless Mosaics V2',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/65330d-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'CCM VHR Europe 2018',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/1f82ce-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'CCM VHR Europe 2021',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/5ead11-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'CLMS Vegetation indices NDVI',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/cef8d0-YOUR-INSTANCEID-HERE`, // configurationId from our instances account
      },
      {
        name: 'clms_global_ba_300m_v3_monthly_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/efe5a3-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_ba_300m_v3_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/8078ad-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_dmp_1km_v2_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/16134e-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_dmp_1km_v2_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7a20b5-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_dmp_1km_v2_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ba2928-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_dmp_1km_v2_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/c15b45-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_dmp_1km_v2_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/084715-YOUR-INSTANCEID-HERE`,
      },
      // newer not added yet
      {
        name: 'clms_global_fapar_1km_v2_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/f6322b-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fapar_1km_v2_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4de9ee-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fapar_1km_v2_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/803720-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fapar_1km_v2_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/9ccb92-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fapar_1km_v2_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/90debf-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lai_1km_v2_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/db0a4c-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lai_1km_v2_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/db84b4-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lai_1km_v2_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b54215-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lai_1km_v2_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a8d372-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lai_1km_v2_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b858dc-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fapar_300m_v1_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/85f0f9-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fapar_300m_v1_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e733f3-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fapar_300m_v1_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/f6ff91-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fapar_300m_v1_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/1376ec-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fapar_300m_v1_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3d4b9f-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fcover_1km_v2_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4578b2-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fcover_1km_v2_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/5a5bad-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fcover_1km_v2_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/9e5254-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fcover_1km_v2_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/f0a524-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fcover_1km_v2_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4a3475-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fcover_300m_v1_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/9bec27-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fcover_300m_v1_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/39f79b-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fcover_300m_v1_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/22c171-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fcover_300m_v1_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0689b1-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_fcover_300m_v1_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/75537a-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gpp_300m_v1_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/354365-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gpp_300m_v1_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a4948b-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gpp_300m_v1_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0373f4-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gpp_300m_v1_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0625a1-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lai_300m_v1_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/9a416c-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lai_300m_v1_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0f84d9-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lai_300m_v1_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/6d09d4-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lai_300m_v1_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b46865-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lai_300m_v1_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/793b4f-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_npp_300m_v1_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b36fef-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_npp_300m_v1_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/652386-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_npp_300m_v1_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/992f36-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_npp_300m_v1_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3dcee6-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_swi_12.5km_v3_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/43af66-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_swi_12.5km_v3_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/73f8ed-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_europe_swi_1km_v1_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/058c10-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_dmp_300m_v1_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/eda2fb-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_dmp_300m_v1_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4e5f3d-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_dmp_300m_v1_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/8010c3-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_dmp_300m_v1_10daily_geotiff_RT5',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/5aab70-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_dmp_300m_v1_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b54e89-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lst_5km_v1_10daily-tci_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b8f74d-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lst_5km_v2_10daily-tci_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/67d7b1-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_ndvi_1km_v2_statistics_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0ec96e-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_ndvi_1km_v3_statistics_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/148ba1-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_ndvi_1km_v2_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/61e911-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_ndvi_300m_v1_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ca555d-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_ndvi_300m_v2_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/40c16f-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_ssm_1km_v1_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/fc0140-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lsp_300m_v1_yearly_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3ddb52-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lcc_100m_v3_yearly_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/175a80-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lst_5km_v1_hourly_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ef904d-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lst_5km_v2_hourly_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4d1f63-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gdmp_1km_v2_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4a35da-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gdmp_1km_v2_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e8aa5e-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gdmp_1km_v2_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/89a110-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gdmp_1km_v2_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/90f183-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gdmp_1km_v2_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/f54743-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gdmp_300m_v1_10daily_geotiff_RT0',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/10a347-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gdmp_300m_v1_10daily_geotiff_RT1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/02da1e-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gdmp_300m_v1_10daily_geotiff_RT2',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/2d2b27-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gdmp_300m_v1_10daily_geotiff_RT5',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/db73ac-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_gdmp_300m_v1_10daily_geotiff_RT6',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/64db6b-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_wb_1km_v2_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ec7dc0-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_wb_300m_v1_10daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/1ddb62-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_swe_5km_v1_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/703ede-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_sce_500m_v1_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/51f9c7-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_sce_1km_v1_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/f2bbdd-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_wb_300m_v2_monthly_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a1f5a9-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lie_500m_v1_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/50f2e7-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_swe_5km_v2_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/903354-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lie_250m_v2_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/6d6500-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_wb_100m_v1_monthly_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/997509-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lst_5km_v1_10daily-daily-cycle_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e3bcb9-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lst_5km_v2_10daily-daily-cycle_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/36a9b6-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lwq_300m_v2_10daily-nrt_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/356bcf-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lwq_300m_v1_10daily-reproc_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/791ff4-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lwq_300m_v1_10daily-nrt_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/1a3bad-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lwq_100m_v1_10daily-nrt_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/dbd4e0-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'lcm_global_10m_yearly_v1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ca20ee-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'tcd_pantropical_10m_yearly_v1',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/01a8e5-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'clms_global_lie_500m_v2_daily_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/bc15f6-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'swi_global_12.5km_daily_v4_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/cbf041-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'swi_europe_1km_daily_v2_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3606ef-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'swi_global_12.5km_10daily_v4_geotiff',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e5d980-YOUR-INSTANCEID-HERE`,
      },
    ],
  },
  {
    name: () => t`Monitoring Earth from Space`,
    id: 'MONITORING',
    content: [
      {
        name: 'Copernicus Monitoring Earth (S2L2A) API',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/25444d-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Copernicus Monitoring Earth (S2L1C) API',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3b9e0a-YOUR-INSTANCEID-HERE`,
      },
    ],
    pins: [
      {
        lat: 41.96432,
        lng: -122.38866,
        zoom: 13,
        title: 'Dam Removal on the Klamath River (True Color)',
        toTime: '2024-04-11',
        layerId: '1_TRUE_COLOR',
        themeId: 'HIGHLIGHT',
        datasetId: 'S2_L2A_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/25444d-YOUR-INSTANCEID-HERE`,
        description:
          "Many of the Earth's rivers have been altered by dams and reservoirs, providing renewable hydropower and water supply for human use. However, these dams disrupt the habitat network and have a negative effect on water quality. The world's largest dam removal project on the Klamath river in California and Oregon, USA, includes the demolition of four dams, with guided regeneration of the up-and downstream habitats. This project is reopening access for salmon and other migratory fish to more than 600 km of the river system. In addition to their importance for biodiversity, salmon are also a key element of local First Nations culture. [The Klamath River Dam Removal]( https://whitewatertours.com/klamath-river-dam-removal-project-summer-2024-update/) project paves the way for other large-scale riparian habitat restoration projects, providing an example for responsible stewardship of nature.",
      },
      {
        title: 'Clew Bay and Achill Island, Ireland',
        lat: 53.86376,
        lng: -9.85062,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '2_HIGHLIGHT-OPTIMIZED-NATURAL-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/25444d-YOUR-INSTANCEID-HERE`,
        toTime: '2021-08-26',
        evalscript: '',
        evalscripturl: '',
        themeId: 'MONITORING',
        description:
          '[Clew Bay](https://www.clewbay.net/westport-louisburgh-newport/) is a natural ocean bay in County Mayo, Ireland. It has a system of small islands, remnants of sediment transport during the last Ice Age. [Achill Island](https://en.wikivoyage.org/wiki/Achill_Island) can be seen in the north-west of the image, with some spectacular towering cliffs at the westernmost point.',
      },
      {
        lat: 21.9502,
        lng: 89.1671,
        zoom: 12,
        title: 'Sundarbans, Mangrove forest (NDVI)',
        toTime: '2020-01-27',
        layerId: '3_NDVI',
        themeId: 'MONITORING',
        datasetId: 'S2_L2A_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/25444d-YOUR-INSTANCEID-HERE`,
        description:
          '[Mangrove forests](https://oceanservice.noaa.gov/facts/mangroves.html) have exceptionally high biodiversity and are indispensable in erosion reduction. There are 80 different species of mangrove trees known, growing in low-oxygen soil, where slow moving waters accumulate fine sediments for the roots to grow in. [Sundarbans Mangrove forest](https://whc.unesco.org/en/list/798/) covers 140.000 ha of land, making it one of the largest Mangrove forests in the world. It provides livelihood to many people living in the area and is a home to, among others, 250 bird species and an endangered Royal Bengal Tiger. The forest is threatened by seasonal monsoons, cyclones and tidal waves, which cause salinization. ',
      },
      // {
      //   lat: -15.889,
      //   lng: 46.3548,
      //   zoom: 11,
      //   title: 'Heavy Sedimentation Flow of Betsiboka River (False Color)',
      //   toTime: '2017-08-12',
      //   layerId: '2_FALSE_COLOR',
      //   themeId: 'MONITORING',
      //   datasetId: 'S2_L2A_CDAS',
      //   evalscripturl: '',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/25444d-YOUR-INSTANCEID-HERE`,
      //   description:
      //     'A beautiful Betsiboka river delta is a dramatic example of massive deforestation, that occurs in Madagascar every year. One of the biggest culprits is the slash and burn agriculture, called [tavy](https://www.madamagazine.com/en/english-tavy-kahlschlag-einer-insel/), where the forest is burnt and then farmed in the following months. The other deforestation causes include grazing, logging and production of coal. The forest grows back after being cut down, but until then, the barren soil is vulnerable to erosion by heavy rains, depositing it into rivers, which carry it into the sea, contaminating sea life with deposited iron oxides. As soil formation is a process taking thousands of years, it erodes away each year, until it can no longer support a forest. Due to these processes, Madagascar has already lost [80% of its primary forests](https://www.eoi.es/blogs/guidopreti/2014/02/04/deforestation-in-madagascar-a-threat-to-its-biodiversity/), causing many indigenous species, such as [lemurs](https://monkeysandmountains.com/lemurs-madagascar/), to be endangered.',
      // },
      {
        lat: 21.1476,
        lng: -11.4478,
        zoom: 11,
        title: 'Richat Structure, Mauretania',
        toTime: '2020-01-27',
        layerId: '1_TRUE_COLOR',
        themeId: 'MONITORING',
        datasetId: 'S2_L2A_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/25444d-YOUR-INSTANCEID-HERE`,
        description:
          "[Eye of the Sahara](http://geologyscience.com/gallery/eye-of-the-sahara-or-richat-structure/), also known as the Richat structure, is a geological dome made of rocks billions of years old and measures 40.2 km across. Once, there was a temperate forest here, with lakes and rivers. The formation processes of this magnificent structure are still a mistery. The most prominent thoeory believes, that it's the result of the volcanism and erosion. The theory states, that volcanism in the area lifted the layers of sediments and after it died down, the erosion ate away at the structure, making the shape of an eye we see today. As the structure is visible from space, it serves as a landmark for [astronauts](http://www.lovethesepics.com/2011/04/earths-bulls-eye-the-eye-of-africa-landmark-for-astronauts-14-pics/).",
      },
      // {
      //   lat: -50.9647,
      //   lng: -73.3243,
      //   zoom: 12,
      //   title: 'Glacier Grey, Chile',
      //   toTime: '2019-05-08',
      //   layerId: '2_HIGHLIGHT-OPTIMIZED-NATURAL-COLOR',
      //   themeId: 'MONITORING',
      //   datasetId: 'S2_L2A_CDAS',
      //   evalscripturl: '',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/25444d-YOUR-INSTANCEID-HERE`,
      //   description:
      //     "A stunning [glacier Grey](https://earthobservatory.nasa.gov/images/7802/grey-glacier-chile) located in Chilean Torres Del Paine National Park is 6 km wide and over 30 meters high at the glacier's front. Its various shades of grey and blue, clearly visible even from space, attract many visitors each year. In 2017 a huge (380 m x 350 m) [iceberg ruptured](https://www.theguardian.com/environment/2017/nov/29/large-iceberg-breaks-off-from-grey-glacier-in-southern-chile) from the glacier with an unknown cause. Such event are very rare - the last one occurred in the early 1990's.. Due to its diverse plants and wildlife, glaciers, rivers, lakes and pampas, the park became [protected as a UNESCO Biosphere reserve](http://www.ecocamp.travel/fr/Patagonia/Torres-del-Paine-National-Park) in 1978. ",
      // },
      {
        lat: 45.4585,
        lng: 12.28701,
        tag: '',
        zoom: 12,
        title: 'Venice, Italy',
        toTime: '2019-12-10',
        layerId: '1_TRUE_COLOR',
        themeId: 'MONITORING',
        datasetId: 'S2_L2A_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/25444d-YOUR-INSTANCEID-HERE`,
        description:
          "[Venice](https://www.britannica.com/place/Venice/Lagoon-and-tides), a so called island city with a population of [637,245](https://worldpopulationreview.com/world-cities/venice-population/), remains a major Italian port and is one of the world’s oldest tourist and cultural centres. The lagoon's mud banks, shallows, and channels with its marine and bird life provide next to salt pans a source of income for the Venetians. The lagoon has served as protection and as a natural sewerage system. The deepening of channels in the 20th century, the overextraction of fresh water from mainland aquifers, the rising of the Adriatic Sea, and the geologic sinking of the Po River basin have lowered the land level, creating a serious flooding problem. On a regular basis, when high tides combine with winds from the south and east, the waters of the lagoon rise and flood the city, making Venice to be known as the [City built on water](https://www.livitaly.com/how-was-venice-built/).",
      },
      {
        lat: 38.7931301,
        lng: 15.211227399999984,
        zoom: 14,
        title: 'Stromboli, Province of Messina, Italy (SWIR)',
        toTime: '2019-02-07',
        layerId: '6-SWIR',
        themeId: 'MONITORING',
        datasetId: 'S2_L2A_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/25444d-YOUR-INSTANCEID-HERE`,
        description:
          "[Stromboli](https://www.volcanodiscovery.com/stromboli.html) has been active consistently for at least 2000 years, which is unusual among volcanoes.  Most of its activity consists of brief and smaller bursts of lava 100-200 meters high into the air. Occasionally, longer periods of eruptions occur, lasting from a few to up to 10 years. The most recent one began in December 2002 and ended in July 2003. Although Stromboli's eruptions are not dangerous for the most part, more violent eruptions that take lives and destroy property, do occur. In [July 2019](https://www.bbc.com/news/world-europe-48857422), a hiker died during the eruption, several people were injured and many had to flee to the sea. The deadliest [eruption in 1930](http://www.geo.mtu.edu/volcanoes/boris/mirror/mirrored_html/STROMBOLI-1930.html) took 6 lives and caused considerable damage. ",
      },
      // {
      //   lat: 43.4918,
      //   lng: 16.619,
      //   zoom: 11,
      //   title: 'Wildfires in Croatia, July 2017 (SWIR)',
      //   toTime: '2017-07-17',
      //   layerId: '6-SWIR',
      //   themeId: 'MONITORING',
      //   datasetId: 'S2_L2A_CDAS',
      //   evalscripturl: '',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/25444d-YOUR-INSTANCEID-HERE`,
      //   description:
      //     'In summer of 2017, [dozens of wildfires erupted](https://www.channelnewsasia.com/news/world/croatia-fights-dozens-of-fires-along-adriatic-coast-9144906) along the Adriatic coast. Soaring heat wave temperatures accompanied by a lack of rainfall led to a drought, which resulted in dry, hot forest floor, extremely vulnerable to wildfires. The cause of many wildfires were careless people, while strong winds made the situation worse by enabling fires to spread much faster. The firefighters struggled to contain the fires and keep them from dwellings. Altogether, an astonishing 83.000 hectares of forest burned down.',
      // },
    ],
  },

  {
    name: () => t`Agriculture`,
    id: 'AGRICULTURE',
    content: [
      {
        name: 'Agriculture (S2L2A)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Agriculture (S2L1C)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/6e1aa1-YOUR-INSTANCEID-HERE`,
      },
    ],
    pins: [
      {
        title: 'Rapeseed Flowering in Mecklenburg-Vorpommern (True Color)',
        lat: 53.49673,
        lng: 13.58202,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2022-05-18',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          '[Oilseed rape](https://en.wikipedia.org/wiki/Rapeseed) is one of the main crops produced in Europe and is mainly used to produce [biodiesel](https://www.eia.gov/energyexplained/biofuels/biodiesel-rd-other-basics.php). During the flowering period (late April-early May), the fields are coloured by the distinctive yellow flowers, which can also be observed from space.',
      },
      {
        title: 'Agriculture in Kansas, USA (False Color)',
        lat: 37.79317,
        lng: -95.39549,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '2_FALSE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-27',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          "The soils in Allen County in the state of Kansas are deep and fertile, providing the county and state with good conditions for a strong agricultural economy. The area is called The Great Plains. It's therefore not surprising that agriculture accounts for more than 40% of the state's total income. The main crops grown are wheat, maize, sorghum and soybeans, as well as sunflowers. Livestock farming consists mainly of cattle and calves. [Feedlots](https://agresearchmag.ars.usda.gov/2003/jul/feed/) are found throughout the region. Production is modern, large-scale agriculture, that is prone to erosion and drought due to overuse - increasing the possibility of a modern Dust Bowl event. Learn more [here](https://farmflavor.com/kansas-agriculture/).",
      },
      {
        title: 'Agriculture at the Israel-Jordan Border (True Color)',
        lat: 31.1122,
        lng: 35.4326,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-26',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          'Agriculture in the southern part of the Dead Sea region is dominated by [salt ponds](https://www.researchgate.net/figure/The-southern-part-of-the-Dead-Sea-is-covered-by-salt-evaporation-ponds-The-picture_fig3_225427098). Several fields are located on both sides of the Jordan Valley Highway. Due to the increasing global demand for sodium chloride and potassium salt, both of which are found in the Dead Sea salt ponds, the number of ponds increased rapidly towards the end of the last century. Since then their number has remained stable at around 50 ponds. The fields are mainly used to grow dates, but also tomatoes, aubergines or olives. Learn more [here](https://earth.esa.int/web/earth-watching/image-of-the-week/content/-/article/the-dead-sea/).',
      },
      {
        title: 'Agriculture in West Bengal, India (Agriculture Composite)',
        lat: 22.05565,
        lng: 87.34354,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: 'FALSE-COLOR-11-8-2',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-25',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          'The state of West Bengal, where Belda is located, is the most important producer of rice and vegetables in the whole of India. It occupies only 2.7% of the country’s land area, but provides food to almost 8% of population. The state is dominated by small and marginal farms, which account for 96% of all farms. Learn more [here](https://wb.gov.in/departments-details.aspx?id=D170907140022669&page=Agriculture).',
      },
      {
        title: 'Agriculture in Vietnam (Agriculture Composite)',
        lat: 8.9473,
        lng: 105.0001,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: 'FALSE-COLOR-11-8-2',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-21',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          'Agriculture in the Ca Mau district, located in the Mekong Delta in Vietnam, consists mainly of aquaculture (shrimp, mud crabs), rice and timber. The whole area is heavily drained, either by small streams or by canals diverted from the streams, clearly visible in the image. The cultivated areas are shown in vibrant green. The environmental impact of aquaculture with certified shrimps is increasingly coming into focus because of the risk of pollution from organic waste, chemicals and antibiotics. Learn more [here](https://vietnamnews.vn/society/523132/ca-mau-amends-list-of-key-agricultural-products.html).',
      },
      {
        title: 'Agriculture along the Nile River (EVI)',
        lat: 26.0896,
        lng: 32.3819,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '4_EVI',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-21',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          'Due to the fertile soil and regular floods, agriculture has been practised in the Nile Basin for thousands of years. Almost 90 per cent of agricultural land is rainfed (i.e supplied with water by rainfall). These systems are characterized by subsistence-level production and low yields of crops and livestock. There are about 5.6 million hectares of land in the Nile Basin that are irrigated or equipped with irrigation systems. The three main crops grown in the Nile Basin are wheat, fodder and maize. Learn more [here](https://www.fao.org/3/x8034e/x8034e.pdf).',
      },
      {
        title: 'Agriculture in Ethiopia (False Color)',
        lat: 7.36579,
        lng: 39.20317,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '2_FALSE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-19',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          'The Meraro area in the Arsi zone, which is part of the Ethiopian Highlands, plays an important role in food security in Ethiopia. Agriculture in the region (and the country) has long been an [intensive subsistence farming zone](https://reliefweb.int/report/ethiopia/cluster-farming-improving-farmers-productivity-food-security-arsi-zone) with 12 million smallholder households producing 95% of the country’s agricultural products. In order to become less dependent on foreign food imports and to promote the country’s development, the agricultural sector has undergone major changes in recent years. Learn more [here](https://www.fao.org/ethiopia/fao-in-ethiopia/ethiopia-at-a-glance/en/).',
      },
      {
        title: 'Agriculture in Cambodia (Agriculture Composite)',
        lat: 12.77723,
        lng: 104.51105,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: 'FALSE-COLOR-11-8-2',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2019-12-15',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          'The [Tonle Sap Lake](https://en.unesco.org/biosphere/aspac/tonle-sap) with its surroundings is one of the most productive large wetland ecosystems in the world. The people in this area are highly dependent on the natural resources of the ecosystem and live mainly from agriculture and fishing. Agriculture is determined by the monsoon. In the rainy season, rice is the main crop. In the dry season, also other vegetables and fruits. Intact wetlands are very important for storing CO2 and therefore play a role in global warming. Wetlands are also habitats with high biodiversity that can come into conflict with intensive agriculture.',
      },
      {
        title: 'Agriculture in Ontario, Canada (Barren Soil)',
        lat: 43.6926,
        lng: -81.0152,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '8_BARREN-SOIL',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2019-10-09',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          'Agriculture is the predominant land use in southern Ontario, even though only a small percentage of the total population is employed in this sector. This is an indicator of a developed country. Crops grown are mainly oilseeds and various grains, and the main livestock is cattle. In addition to crops, Ontario is a national leader in the production of greenhouse vegetables. Learn more [here](https://www150.statcan.gc.ca/n1/daily-quotidien/170510/dq170510a-eng.htm?indid=10441-1&indgeo=6).',
      },
      // {
      //   title: 'Agriculture in the Burdekin River Delta, Australia (Agriculture Composite)',
      //   lat: -19.6355,
      //   lng: 147.2532,
      //   zoom: 12,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: 'FALSE-COLOR-11-8-2',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-08-17',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'AGRICULTURE',
      //   description:
      //     'Burdekin Shire is located in the delta of the Burdekin River and is one of the largest sugar cane producing counties in Queensland. Agricultural fields are located on both sides of the Burdekin River and are depicted in either light green (overgrown) or dark brown (harvested/barren fields). Learn more [here](https://economy.id.com.au/burdekin/value-of-agriculture).',
      // },
      // {
      //   title: 'Agriculture in California, USA (NDVI)',
      //   lat: 36.70772,
      //   lng: -120.60242,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '3_NDVI',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-08-03',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'AGRICULTURE',
      //   description:
      //     'The [Central Valley](https://ca.water.usgs.gov/projects/central-valley/about-central-valley.html) lies to the west of the famous Sierra Nevada in California and is the largest and most important agricultural region in the USA. The fields are irrigated partly by the valley’s two major rivers, Sacramento and San Joaquin, and partly by groundwater. Although the valley occupies less than 1% of the country’s total farmland, it produces 25% of USA’s food. In total, more than 250 different crops are grown, the most important being cereals, hay, cotton, various fruits, vegetables and nuts.',
      // },
      // {
      //   title: 'Agriculture in Limpopo, South Africa (True Color)',
      //   lat: -24.8591,
      //   lng: 28.78847,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-06-11',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'AGRICULTURE',
      //   gain: '2',
      //   gamma: '1.7',
      //   description:
      //     "The biggest challenge for South African agriculture is the lack of water, as it doesn't rain regularly. Therefore, most fields are irrigated, which contributes to Limpopo being an important part of South African agriculture. Farmer-managed seed systems have been introduced to adapt agriculture and support smallholder farmers. Learn more [here](https://acbio.org.za/wp-content/uploads/2022/04/farmermanagedseedsystemsinlimpopoprovincesouthafricaweb.pdf).",
      // },
      {
        title: 'Agriculture in Poland (Moisture Stress)',
        lat: 52.669,
        lng: 16.1423,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '9_MOISTURE-STRESS',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2019-06-03',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          'Located on the banks of the River Warta, this highlight shows different moisture stress and field arrangements on the opposite banks of the river. On the north bank, the fields are more regularly spaced and have a lower moisture content, while on the south bank the fields are more diverse in both size and orientation and have a higher moisture content. As the region generally has quite low annual precipitation (~500 mm/year), one explanation for the moisture difference could be the higher prominence of the lakes south of the river, but different field management techniques could also play a role. Cereals are the main crop grown in the region, with rapeseed, sugar beet and potatoes grown to a lesser extent. Learn more [here](http://www.agribenchmark.org/fileadmin/Dateiablage/B-Cash-Crop/Countries/Poland/Poland_crop_production.pdf).',
      },
      {
        title: 'Agriculture in the Veneto Region, Italy (Barren Soil)',
        lat: 45.7955,
        lng: 13.0957,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '8_BARREN-SOIL',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
        toTime: '2019-04-16',
        evalscript: '',
        evalscripturl: '',
        themeId: 'AGRICULTURE',
        description:
          '[Agriculture in Veneto](https://www.recare-hub.eu/news/45-06-bioforsk) is one of the most productive in Italy, producing mainly cereals, fruit and wine. Small fields cultivated by hand contrast with the increasing industrialization of the sector, which suffers from soil degradation.',
      },
      // {
      //   title: 'Agriculture in Saudi Arabia (Moisture Index)',
      //   lat: 26.21913,
      //   lng: 43.49539,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '99_MOISTURE-INDEX',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-01-29',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'AGRICULTURE',
      //   description:
      //     'Due to its dry and warm climate, the desert country of Saudi Arabia relies heavily on irrigated agriculture to grow crops. The [circular shape](https://www.esa.int/ESA_Multimedia/Videos/2017/10/Sustenance_from_the_sands) of the fields is the result of the irrigation system (center-pivot irrigation), which uses water from a huge fossil aquifer. The size of the field ranges from a few hundred metres to almost 1 km, limited by the size of the irrigation system. What started as a great success story and secured the food for the kingdom, is becoming increasingly problematic as the once rich water reserves are running out. Therefore, Saudi Arabia is buying more and more fields abroad to meet its domestic needs.',
      // },
      // {
      //   title: 'Agriculture in Zambia (True Color)',
      //   lat: -14.7857,
      //   lng: 27.1771,
      //   zoom: 12,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/3f9be2-YOUR-INSTANCEID-HERE`,
      //   toTime: '2018-01-08',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'AGRICULTURE',
      //   gain: '2',
      //   gamma: '1.7',
      //   description:
      //     'Agriculture north-east of Mumbwa town in Zambia’s Central Province, is blessed with good climatic conditions and fertile soils. The main crops grown in the region are maize, cotton, soybeans and sunflowers. Besides vegetable cultivation, the region also offers favourable conditions for livestock farming. The most important animal species are cattle, sheep and goats. Several round structures created by center-pivot irrigation with groundwater can be seen in the west. Learn more [here](https://www.fao.org/3/i9761en/I9761EN.pdf).',
      // },
    ],
  },

  {
    name: () => t`Atmosphere and Air Pollution`,
    id: 'ATMOSPHERE',
    content: [
      {
        name: 'Sentinel-5P O3 / NO2 / ...',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      },
      // {
      //   name: 'EOB3 Landsat-8 L2 API',
      //   service: 'WMS',
      //   url: 'https://services-uswest2.sentinel-hub.com/ogc/wms/fa0736-YOUR-INSTANCEID-HERE',
      //   preselected: true,
      // },
    ],
    pins: [
      // {
      //   title: 'High CO concentrations, Ghana',
      //   lat: 8.086,
      //   lng: 2.208,
      //   zoom: 7,
      //   datasetId: 'S5_CO_CDAS',
      //   layerId: 'CO_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-27',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'Carbon monoxide (CO) is an important atmospheric trace gas for our understanding of tropospheric chemistry. In certain urban areas, it is a major atmospheric pollutant. The main sources of CO are combustion of fossil fuels, biomass burning, and atmospheric oxidation of methane and other hydrocarbons, whereas fossil fuel combustion is the main source of CO at Northern mid-latitudes, the oxidation of isoprene and biomass burning play an important role in the tropics. TROPOMI on the Sentinel 5 Precursor (S5P) satellite observes the global CO abundance exploiting clear-sky and cloudy-sky Earth radiance measurements in the 2.3 µm spectral range of the shortwave infrared (SWIR) part of the solar spectrum. [More...](http://www.tropomi.eu/data-products/carbon-monoxide)',
      // },
      // {
      //   title: 'High CO concentrations, Thailand',
      //   lat: 15.012,
      //   lng: 102.063,
      //   zoom: 7,
      //   datasetId: 'S5_CO_CDAS',
      //   layerId: 'CO_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-24',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'Carbon monoxide (CO) is an important atmospheric trace gas for our understanding of tropospheric chemistry. In certain urban areas, it is a major atmospheric pollutant. The main sources of CO are combustion of fossil fuels, biomass burning, and atmospheric oxidation of methane and other hydrocarbons, whereas fossil fuel combustion is the main source of CO at Northern mid-latitudes, the oxidation of isoprene and biomass burning play an important role in the tropics. TROPOMI on the Sentinel 5 Precursor (S5P) satellite observes the global CO abundance exploiting clear-sky and cloudy-sky Earth radiance measurements in the 2.3 µm spectral range of the shortwave infrared (SWIR) part of the solar spectrum. [More...](http://www.tropomi.eu/data-products/carbon-monoxide)',
      // },
      // {
      //   title: 'High CO concentrations, Australia',
      //   lat: -37.068,
      //   lng: 148.195,
      //   zoom: 7,
      //   datasetId: 'S5_CO_CDAS',
      //   layerId: 'CO_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-27',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'Carbon monoxide (CO) is an important atmospheric trace gas for our understanding of tropospheric chemistry. In certain urban areas, it is a major atmospheric pollutant. The main sources of CO are combustion of fossil fuels, biomass burning, and atmospheric oxidation of methane and other hydrocarbons, whereas fossil fuel combustion is the main source of CO at Northern mid-latitudes, the oxidation of isoprene and biomass burning play an important role in the tropics. TROPOMI on the Sentinel 5 Precursor (S5P) satellite observes the global CO abundance exploiting clear-sky and cloudy-sky Earth radiance measurements in the 2.3 µm spectral range of the shortwave infrared (SWIR) part of the solar spectrum. [More...](http://www.tropomi.eu/data-products/carbon-monoxide)',
      // },
      // {
      //   title: 'High CO concentrations, Angola, DR Kongo',
      //   lat: -7.934,
      //   lng: 15.282,
      //   zoom: 7,
      //   datasetId: 'S5_CO_CDAS',
      //   layerId: 'CO_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-07-10',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'Carbon monoxide (CO) is an important atmospheric trace gas for our understanding of tropospheric chemistry. In certain urban areas, it is a major atmospheric pollutant. The main sources of CO are combustion of fossil fuels, biomass burning, and atmospheric oxidation of methane and other hydrocarbons, whereas fossil fuel combustion is the main source of CO at Northern mid-latitudes, the oxidation of isoprene and biomass burning play an important role in the tropics. TROPOMI on the Sentinel 5 Precursor (S5P) satellite observes the global CO abundance exploiting clear-sky and cloudy-sky Earth radiance measurements in the 2.3 µm spectral range of the shortwave infrared (SWIR) part of the solar spectrum. [More...](http://www.tropomi.eu/data-products/carbon-monoxide)',
      // },
      // {
      //   title: 'Low CO concentrations, Switzerland',
      //   lat: 45.51,
      //   lng: 6.207,
      //   zoom: 7,
      //   datasetId: 'S5_CO_CDAS',
      //   layerId: 'CO_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-24',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'Carbon monoxide (CO) is an important atmospheric trace gas for our understanding of tropospheric chemistry. In certain urban areas, it is a major atmospheric pollutant. The main sources of CO are combustion of fossil fuels, biomass burning, and atmospheric oxidation of methane and other hydrocarbons, whereas fossil fuel combustion is the main source of CO at Northern mid-latitudes, the oxidation of isoprene and biomass burning play an important role in the tropics. TROPOMI on the Sentinel 5 Precursor (S5P) satellite observes the global CO abundance exploiting clear-sky and cloudy-sky Earth radiance measurements in the 2.3 µm spectral range of the shortwave infrared (SWIR) part of the solar spectrum. [More...](http://www.tropomi.eu/data-products/carbon-monoxide)',
      // },
      // {
      //   lat: 46.04941,
      //   lng: 14.50676,
      //   zoom: 13,
      //   title: 'Heatwave in Ljubljana (Land Surface Temperature)',
      //   toTime: '2023-07-16',
      //   layerId: null,
      //   themeId: 'HIGHLIGHT',
      //   datasetId: 'AWS_LOTL2',
      //   evalscript:
      //     '\nvar band = "B10";\n\n\nvar option = 0;\n\n\nvar minC = 15;\nvar maxC = 55;\n\n\n\nvar NDVIs = 0.2;\nvar NDVIv = 0.8;\n\nvar waterE = 0.991;\nvar soilE = 0.966;\nvar vegetationE = 0.973;\n\nvar C = 0.009; \n\nvar bCent = (band == "B10") ? 0.000010895 : 0.000012005;\n\nvar rho = 0.01438; // m K\n\n\nif (option == 2) {\n\tminC = 0;\n\tmaxC = 25;\n}\nlet viz = ColorGradientVisualizer.createRedTemperature(minC, maxC);\n\n\nfunction setup() {\n\treturn {\n\t\tinput: [{\n\t\t\tbands: [\n\t\t\t\t"B03",\n\t\t\t\t"B04",\n\t\t\t\t"B05",\n\t\t\t\t"B10"\n\t\t\t]\n\t\t}],\n\t\toutput: { bands: 3 }\n\t}\n}\n\n\nfunction LSEcalc(NDVI, Pv) {\n\tvar LSE;\n\tif (NDVI < 0) {\n\t\tLSE = waterE;\n\t} else if (NDVI < NDVIs) {\n\t\tLSE = soilE;\n\t} else if (NDVI > NDVIv) {\n\t\tLSE = vegetationE;\n\t} else {\n\t\tLSE = vegetationE * Pv + soilE * (1 - Pv) + C;\n\t}\n\treturn LSE;\n}\n\nfunction evaluatePixelOrig(samples) {\n\n\tvar LSTmax = -999;\n\tvar LSTavg = 0;\n\tvar LSTstd = 0;\n\tvar reduceNavg = 0;\n\tvar N = samples.length;\n\n\n\tvar LSTarray = [];\n\n\tfor (var i = 0; i < N; i++) {\n\t\t//// for LST\n\t\t// B10 or B11\n\t\tvar Bi = (band == "B10") ? samples[i].B10 : samples[i].B11;\n\t\tvar B03i = samples[i].B03;\n\t\tvar B04i = samples[i].B04;\n\t\tvar B05i = samples[i].B05;\n\n\n\t\tif ((Bi > 173 && Bi < 65000) && (B03i > 0 && B04i > 0 && B05i > 0)) {\n\n\t\t\tvar b10BTi = Bi - 273.15;\n\n\t\t\tvar NDVIi = (B05i - B04i) / (B05i + B04i);\n\t\t\tvar PVi = Math.pow(((NDVIi - NDVIs) / (NDVIv - NDVIs)), 2);\t\n\t\t\tvar LSEi = LSEcalc(NDVIi, PVi);\n\t\t\tvar LSTi = (b10BTi / (1 + (((bCent * b10BTi) / rho) * Math.log(LSEi))));\n\n\t\t\tLSTavg = LSTavg + LSTi;\n\n\t\t\tif (LSTi > LSTmax) { LSTmax = LSTi; }\n\t\t\tLSTarray.push(LSTi);\n\t\t} else {\n\t\t\t++reduceNavg;\n\t\t}\n\t}\n\tN = N - reduceNavg;\n\n\tLSTavg = LSTavg / N;\n\n\tfor (var i = 0; i < LSTarray.length; i++) {\n\t\tLSTstd = LSTstd + (Math.pow(LSTarray[i] - LSTavg, 2));\n\t}\n\tLSTstd = (Math.pow(LSTstd / (LSTarray.length - 1), 0.5));\n\n\tlet outLST = (option == 0)\n\t\t? LSTavg\n\t\t: (option == 1)\n\t\t\t? LSTmax\n\t\t\t: LSTstd;\n\n\treturn viz.process(outLST);\n}\nfunction evaluatePixel(sample, scene, metadata, customData, outputMetadata) {\n\treturn evaluatePixelOrig([sample], [scene], metadata, customData, outputMetadata);\n}',
      //   evalscripturl: '',
      //   visualizationUrl:
      //     'https://services-uswest2.sentinel-hub.com/ogc/wms/fa0736-YOUR-INSTANCEID-HERE',
      //   dataFusion: [],
      //   description:
      //     'In July 2023, southern Europe experienced a severe heatwave. This Landsat 8 image from July 16 shows the [Land Surface Temperature](https://custom-scripts.sentinel-hub.com/landsat-8/land_surface_temperature_mapping/) in the city of Ljubljana. The color scale ranges from dark red (15°C) to white (55°C). Clouds are shown as white data gaps, with cloud shadows significantly darker (colder) than their surroundings. The coldest feature on this image is the Sava River in the northern part of the image. Parks and forests are also significantly colder than buildings and streets. The hottest areas are large metal roofs and parking lots located in industrial areas in the north and northeast. Such images help city governments adapt to climate change by preserving green spaces, planting trees, and avoiding dense buildup to mitigate the effects of heatwaves. Compare the thermal visualisation to the True Color image [here](https://sentinelshare.page.link/M8qB) or check out the aerial imagery [here](https://ipi.eprostor.gov.si/jv/).',
      // },
      {
        lat: 28.94447,
        lng: 76.84387,
        zoom: 9,
        title: 'Deteriorating Air Quality in New Delhi (Aerosol Index)',
        toTime: '2023-11-02',
        layerId: 'AER_AI_340_AND_380_VISUALIZED',
        themeId: 'HIGHLIGHT',
        datasetId: 'S5_AER_AI_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
        description:
          'The air quality in and around New Delhi has reached alarming levels and is affecting the well-being of residents. The region has been experiencing high concentrations of pollutants from various sources such as vehicular emissions, industrial activities, burning of crops and other sources, forming a thick layer of smog, especially during winters. These pollutants can have serious effects on health by causing respiratory problems, aggravating pre-existing conditions and posing risks to cardiovascular health. Sentinel-5P plays a crucial role in monitoring and visualising the extent of air pollution with its spatial resolution of 3.5×5.5 km, daily revisit and advanced atmospheric monitoring capabilities by capturing the distribution of key pollutants in the atmosphere. The satellite data reveals the spatial and temporal patterns of pollution, allowing authorities to identify pollution hotspots and track the movement of pollutants in the region.',
      },
      {
        lat: 13.790071437194856,
        lng: -129.649658203125,
        zoom: 7,
        title: 'Hurricane Dora’s Historic Journey (Cloud Base Pressure)',
        toTime: '2023-08-04',
        layerId: 'CLOUD_BASE_PRESSURE_VISUALIZED',
        themeId: 'HIGHLIGHT',
        datasetId: 'S5_CLOUD_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
        description:
          'Hurricane Dora started its journey across the Eastern Pacific near Mexico on July 31 when it developed into a tropical depression [[1]](https://www.wunderground.com/hurricane/eastern-pacific/2023/hurricane-dora). Warmer ocean temperatures over the Eastern and Central Pacific caused by El Nino led to a quick intensification of Dora, evolving into a strong, category 4 hurricane by August 4. Dora is now the longest lasting category 4 hurricane in the Pacific Ocean and one of two cyclones that crossed the Pacific from East to West [[2]](https://www.hawaiinewsnow.com/2023/08/12/hurricane-dora-makes-history-without-making-landfall/)[[3]](https://www.foxweather.com/weather-news/hurricane-dora-wildfires-high-surf-hawaii). Sentinel-5P allows us to track the path of the cyclone by measuring air pressure at the base of the cloud. Hurricanes are low-pressure tropical cyclones; thus they can be identified as rotating air masses with low pressure up to 10000 Pa.',
      },
      {
        title: 'High NO2 concentrations, India',
        lat: 22.28,
        lng: 76.97,
        zoom: 7,
        datasetId: 'S5_NO2_CDAS',
        layerId: 'NO2_VISUALIZED',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-24',
        evalscript: '',
        evalscripturl: '',
        themeId: 'ATMOSPHERE',
        description:
          'Nitrogen dioxide (NO2) and nitrogen oxide (NO) together are usually referred to as nitrogen oxides (NOx = NO + NO2). They are important trace gases in the Earth’s atmosphere, present in both the troposphere and the stratosphere. They enter the atmosphere as a result of anthropogenic activities (notably fossil fuel combustion and biomass burning) and natural processes (such as microbiological processes in soils, wildfires and lightning). During daytime, i.e. in the presence of sunlight, a photochemical cycle involving ozone (O3) converts NO into NO2 (and vice versa) on a timescale of minutes, so that NO2 is a robust measure for concentrations of nitrogen oxides. [More...](http://www.tropomi.eu/data-products/nitrogen-dioxide)',
      },
      {
        title: 'High NO2 concentrations, Poland',
        lat: 51.696,
        lng: 16.864,
        zoom: 7,
        datasetId: 'S5_NO2_CDAS',
        layerId: 'NO2_VISUALIZED',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-24',
        evalscript: '',
        evalscripturl: '',
        themeId: 'ATMOSPHERE',
        description:
          'Nitrogen dioxide (NO2) and nitrogen oxide (NO) together are usually referred to as nitrogen oxides (NOx = NO + NO2). They are important trace gases in the Earth’s atmosphere, present in both the troposphere and the stratosphere. They enter the atmosphere as a result of anthropogenic activities (notably fossil fuel combustion and biomass burning) and natural processes (such as microbiological processes in soils, wildfires and lightning). During daytime, i.e. in the presence of sunlight, a photochemical cycle involving ozone (O3) converts NO into NO2 (and vice versa) on a timescale of minutes, so that NO2 is a robust measure for concentrations of nitrogen oxides. [More...](http://www.tropomi.eu/data-products/nitrogen-dioxide)',
      },
      // {
      //   title: 'High NO2 concentrations, Johannesburg',
      //   lat: -27.24,
      //   lng: 30.65,
      //   zoom: 6,
      //   datasetId: 'S5_NO2_CDAS',
      //   layerId: 'NO2_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-07-17',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'Nitrogen dioxide (NO2) and nitrogen oxide (NO) together are usually referred to as nitrogen oxides (NOx = NO + NO2). They are important trace gases in the Earth’s atmosphere, present in both the troposphere and the stratosphere. They enter the atmosphere as a result of anthropogenic activities (notably fossil fuel combustion and biomass burning) and natural processes (such as microbiological processes in soils, wildfires and lightning). During daytime, i.e. in the presence of sunlight, a photochemical cycle involving ozone (O3) converts NO into NO2 (and vice versa) on a timescale of minutes, so that NO2 is a robust measure for concentrations of nitrogen oxides. [More...](http://www.tropomi.eu/data-products/nitrogen-dioxide)',
      // },
      // {
      //   title: 'High NO2 concentrations, Riyadh, Kuwait and Dubai',
      //   lat: 27.338,
      //   lng: 48.801,
      //   zoom: 7,
      //   datasetId: 'S5_NO2_CDAS',
      //   layerId: 'NO2_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-07-17',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'Nitrogen dioxide (NO2) and nitrogen oxide (NO) together are usually referred to as nitrogen oxides (NOx = NO + NO2). They are important trace gases in the Earth’s atmosphere, present in both the troposphere and the stratosphere. They enter the atmosphere as a result of anthropogenic activities (notably fossil fuel combustion and biomass burning) and natural processes (such as microbiological processes in soils, wildfires and lightning). During daytime, i.e. in the presence of sunlight, a photochemical cycle involving ozone (O3) converts NO into NO2 (and vice versa) on a timescale of minutes, so that NO2 is a robust measure for concentrations of nitrogen oxides. [More...](http://www.tropomi.eu/data-products/nitrogen-dioxide)',
      // },
      // {
      //   title: 'High CH4 concentrations, Turkmenistan',
      //   lat: 40.175,
      //   lng: 59.93,
      //   zoom: 7,
      //   datasetId: 'S5_CH4_CDAS',
      //   layerId: 'CH4_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-01',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     "After carbon dioxide (CO2), methane is the most important contributor to the anthropogenically enhanced greenhouse effect. Roughly three-quarters of methane emissions are anthropogenic and as such it is important to continue recording satellite based measurements. TROPOMI aims at providing CH4 column concentrations with high sensitivity to the Earth’s surface, good spatiotemporal coverage, and sufficient accuracy to facilitate inverse modelling of sources and sinks. TROPOMI uses absorption information from the Oxygen-A Band (760nm) and the SWIR spectral range to monitor CH4 abundances in the Earth's atmosphere. [More...](http://www.tropomi.eu/data-products/methane)",
      // },
      // {
      //   title: 'High CH4 concentrations, Burkina Faso',
      //   lat: 11.883,
      //   lng: -1.044,
      //   zoom: 7,
      //   datasetId: 'S5_CH4_CDAS',
      //   layerId: 'CH4_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-03-14',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     "After carbon dioxide (CO2), methane is the most important contributor to the anthropogenically enhanced greenhouse effect. Roughly three-quarters of methane emissions are anthropogenic and as such it is important to continue recording satellite based measurements. TROPOMI aims at providing CH4 column concentrations with high sensitivity to the Earth’s surface, good spatiotemporal coverage, and sufficient accuracy to facilitate inverse modelling of sources and sinks. TROPOMI uses absorption information from the Oxygen-A Band (760nm) and the SWIR spectral range to monitor CH4 abundances in the Earth's atmosphere. [More...](http://www.tropomi.eu/data-products/methane)",
      // },
      // {
      //   title: 'High SO2 concentrations, Andorra and Marseille',
      //   lat: 42.306,
      //   lng: 2.538,
      //   zoom: 7,
      //   datasetId: 'S5_CH4_CDAS',
      //   layerId: 'SO2_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-01-10',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'Sulphur dioxide enters the Earth’s atmosphere through both natural and anthropogenic processes. It plays a role in chemistry on a local and global scale and its impact ranges from short-term pollution to effects on the climate. Only about 30% of the emitted SO2 comes from natural sources; the majority is of anthropogenic origin. SO2 emissions adversely affect human health and air quality. SO2 has an effect on climate through radiative forcing, via the formation of sulphate aerosols. Along with volcanic ash volcanic SO2 emissions also pose a threat to aviation. S5P/TROPOMI samples the Earth’s surface with a revisit time of one day with unprecedented spatial resolution of 3.5 x 7 km which allows the resolution of fine details including the detection of much smaller SO2 plumes. [More...](http://www.tropomi.eu/data-products/sulphur-dioxide)',
      // },
      {
        title: 'High SO2 concentrations, Italy',
        lat: 38.383,
        lng: 14.474,
        zoom: 8,
        datasetId: 'S5_SO2_CDAS',
        layerId: 'SO2_VISUALIZED',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
        toTime: '2019-08-31',
        evalscript: '',
        evalscripturl: '',
        themeId: 'ATMOSPHERE',
        description:
          'Sulphur dioxide enters the Earth’s atmosphere through both natural and anthropogenic processes. It plays a role in chemistry on a local and global scale and its impact ranges from short-term pollution to effects on the climate. Only about 30% of the emitted SO2 comes from natural sources; the majority is of anthropogenic origin. SO2 emissions adversely affect human health and air quality. SO2 has an effect on climate through radiative forcing, via the formation of sulphate aerosols. Along with volcanic ash volcanic SO2 emissions also pose a threat to aviation. S5P/TROPOMI samples the Earth’s surface with a revisit time of one day with unprecedented spatial resolution of 3.5 x 7 km which allows the resolution of fine details including the detection of much smaller SO2 plumes. [More...](http://www.tropomi.eu/data-products/sulphur-dioxide)',
      },
      // {
      //   title: 'High O3 concentrations, Kamchatka',
      //   lat: 53.882,
      //   lng: 159.368,
      //   zoom: 7,
      //   datasetId: 'S5_O3_CDAS',
      //   layerId: 'O3_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-24',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'Ozone is of crucial importance for the equilibrium of the Earth atmosphere. In the stratosphere, the ozone layer shields the biosphere from dangerous solar ultraviolet radiation. In the troposphere, it acts as an efficient cleansing agent, but a high concentration of it is harmful to the health of humans, animals, and vegetation. Ozone is also an important greenhouse-gas contributor to ongoing climate change. Since the discovery of the Antarctic ozone hole in the 1980s and the subsequent Montreal Protocol regulating the production of chlorine-containing ozone-depleting substances, ozone has been routinely monitored from the ground and from space. [More...](http://www.tropomi.eu/data-products/total-ozone-column)',
      // },
      // {
      //   title: 'High HCHO concentrations, Ghana',
      //   lat: 7.662,
      //   lng: -2.582,
      //   zoom: 7,
      //   datasetId: 'S5_HCHO_CDAS',
      //   layerId: 'HCHO_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-24',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'Long-term satellite observations of tropospheric formaldehyde HCHO are essential to support air quality and chemistry-climate related studies from the regional to the global scale. Formaldehyde is an intermediate gas in almost all oxidation chains of non-methane volatile organic compounds (NMVOC), leading eventually to CO2. Non-Methane Volatile Organic Compounds (NMVOCs) are, together with NOx, CO and CH4, among the most important precursors of tropospheric O3. The major HCHO source in the remote atmosphere is CH4 oxidation. Over the continents, the oxidation of higher NMVOCs emitted from vegetation, fires, traffic and industrial sources results in important and localized enhancements of the HCHO levels. The seasonal and inter-annual variations of the formaldehyde distribution are principally related to temperature changes and fire events, but also to changes in anthropogenic activities. Its lifetime being of the order of a few hours, HCHO concentrations in the boundary layer can be directly related to the release of short-lived hydrocarbons, which mostly cannot be observed directly from space. [More...](http://www.tropomi.eu/data-products/formaldehyde)',
      // },
      {
        title: 'High HCHO concentrations, China',
        lat: 36.989,
        lng: 113.236,
        zoom: 7,
        datasetId: 'S5_HCHO_CDAS',
        layerId: 'HCHO_VISUALIZED',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
        toTime: '2019-07-02',
        evalscript: '',
        evalscripturl: '',
        themeId: 'ATMOSPHERE',
        description:
          'Long-term satellite observations of tropospheric formaldehyde HCHO are essential to support air quality and chemistry-climate related studies from the regional to the global scale. Formaldehyde is an intermediate gas in almost all oxidation chains of non-methane volatile organic compounds (NMVOC), leading eventually to CO2. Non-Methane Volatile Organic Compounds (NMVOCs) are, together with NOx, CO and CH4, among the most important precursors of tropospheric O3. The major HCHO source in the remote atmosphere is CH4 oxidation. Over the continents, the oxidation of higher NMVOCs emitted from vegetation, fires, traffic and industrial sources results in important and localized enhancements of the HCHO levels. The seasonal and inter-annual variations of the formaldehyde distribution are principally related to temperature changes and fire events, but also to changes in anthropogenic activities. Its lifetime being of the order of a few hours, HCHO concentrations in the boundary layer can be directly related to the release of short-lived hydrocarbons, which mostly cannot be observed directly from space. [More...](http://www.tropomi.eu/data-products/formaldehyde)',
      },
      {
        title: 'High AER concentrations, Australia',
        lat: -36.081,
        lng: 149.454,
        zoom: 7,
        datasetId: 'S5_AER_AI_CDAS',
        layerId: 'AER_AI_340_AND_380_VISUALIZED',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-24',
        evalscript: '',
        evalscripturl: '',
        themeId: 'ATMOSPHERE',
        description:
          'The Aerosol Index (AI) is a qualitative index indicating the presence of elevated layers of aerosols in the atmosphere. The main aerosol types that cause signals detected in the AI (because of their significant absorption) are desert dust, biomass burning and volcanic ash plumes. An advantage of the AI is that it can be derived for clear as well as (partly) cloudy ground pixels. [More...](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/sentinel-5-precursor-level-2-ultraviolet-aerosol-index)',
      },
      // {
      //   title: 'High AER concentrations, Chad',
      //   lat: 15.766,
      //   lng: 16.381,
      //   zoom: 7,
      //   datasetId: 'S5_AER_AI_CDAS',
      //   layerId: 'AER_AI_340_AND_380_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-07-04',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'The Aerosol Index (AI) is a qualitative index indicating the presence of elevated layers of aerosols in the atmosphere. The main aerosol types that cause signals detected in the AI (because of their significant absorption) are desert dust, biomass burning and volcanic ash plumes. An advantage of the AI is that it can be derived for clear as well as (partly) cloudy ground pixels. [More...](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/sentinel-5-precursor-level-2-ultraviolet-aerosol-index)',
      // },
      // {
      //   title: 'High AER concentrations, Mauretania',
      //   lat: 18.381,
      //   lng: -10.745,
      //   zoom: 7,
      //   datasetId: 'S5_AER_AI_CDAS',
      //   layerId: 'AER_AI_340_AND_380_VISUALIZED',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-07-04',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'ATMOSPHERE',
      //   description:
      //     'The Aerosol Index (AI) is a qualitative index indicating the presence of elevated layers of aerosols in the atmosphere. The main aerosol types that cause signals detected in the AI (because of their significant absorption) are desert dust, biomass burning and volcanic ash plumes. An advantage of the AI is that it can be derived for clear as well as (partly) cloudy ground pixels. [More...](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/sentinel-5-precursor-level-2-ultraviolet-aerosol-index)',
      // },
      {
        title: 'Cloud Optical Thickness',
        lat: 56.623,
        lng: -30.432,
        zoom: 7,
        datasetId: 'S5_CLOUD_CDAS',
        layerId: 'CLOUD_OPTICAL_THICKNESS_VISUALIZED',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-24',
        evalscript: '',
        evalscripturl: '',
        themeId: 'ATMOSPHERE',
        description:
          "The [optical thickness of a cloud](https://cloudatlas.wmo.int/en/optical-thickness.html) is the degree to which the cloud prevents light from passing through it. By measuring how much sunlight gets scattered by clouds back up into space, scientists can better understand how much [clouds influence Earth's climate](https://neo.sci.gsfc.nasa.gov/view.php?datasetId=MYDAL2_M_CLD_OT). Optical thickness depends on the clouds [physical constitution](http://glossary.ametsoc.org/wiki/Optical_thickness) (crystals, drops, droplets), and form; the overall effect depends on the particles concentration, scatter parameter and phase function, as well as the vertical extent of the cloud.",
      },
      {
        title: 'Cloud Base Pressure',
        lat: -18.641,
        lng: 103.854,
        zoom: 7,
        datasetId: 'S5_CLOUD_CDAS',
        layerId: 'CLOUD_BASE_PRESSURE_VISUALIZED',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-15',
        evalscript: '',
        evalscripturl: '',
        themeId: 'ATMOSPHERE',
        description:
          'Cloud Base Pressure represents the [average pressure at the base of the lowest cloud layer at each location](https://isccp.giss.nasa.gov/cloudtypes.html). A [cloud base](https://en.wikipedia.org/wiki/Cloud_base) (or the base of the cloud) is the lowest altitude of the visible portion of a cloud. It can be expressed as the pressure level corresponding to this altitude in hectopascals (hPa, equivalent to the millibar).',
      },
    ],
  },

  {
    name: () => t`Change Detection through Time`,
    id: 'HISTORICAL',
    content: [
      {
        name: 'Historical (S2L2A)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e9ad1f-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Historical (S2L1C)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/dd16e0-YOUR-INSTANCEID-HERE`,
      },
      // {
      //   name: 'Historical (L8 USGS)',
      //   service: 'WMS',
      //   url: 'https://services.sentinel-hub.com/ogc/wms/a2b6e4-YOUR-INSTANCEID-HERE',
      //   preselected: true,
      // },
    ],
    pins: [
      // {
      //   title: 'Agriculture Expansion in Egypt, 2019 (NDVI)',
      //   lat: 30.6338,
      //   lng: 30.2879,
      //   zoom: 10,
      //   datasetId: 'AWS_LOTL1',
      //   layerId: '4-NDVI',
      //   visualizationUrl: 'https://services.sentinel-hub.com/ogc/wms/a2b6e4-YOUR-INSTANCEID-HERE',
      //   toTime: '2019-08-11',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'HISTORICAL',
      //   description:
      //     'Agricultural land in Egypt can be divided into two main categories; Old Lands and New Lands. Old Lands represent highly fertile soils, which are located in the Nile Delta. Due to the River Nile deposits and the highly productive nature of the soil, these areas have been traditionally cultivated with strategic cereal crops, such as rice, wheat and maize, preserving food security for the Egyptian people. During the past four decades, these areas have been encroached by dramatic urban sprawl due to the rapid population growth and economic development. Therefore, there has been a pressing need for the government to find alternative solutions to maintain the sustainability of the national agricultural sector. Consequently, the adopted policies by the government to reclaim new lands in the desert have led to the second category (New Lands). These are barren areas located in the Western and Eastern deserts outside the green zone of the Nile Delta. The New Lands process includes accessibility through constructing roads, houses, installing irrigation and drainage systems and providing reliable sources of water and electricity. Tiba district is one of those newly reclaimed areas located in the western Nile Delta of Egypt with a total area of 125 square km. Learn more [here](https://www.mdpi.com/2077-0472/9/7/137/pdf).',
      // },
      {
        title: 'Lake Poopó, Bolivia 2020',
        lat: -18.9069,
        lng: -67.0207,
        zoom: 10,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e9ad1f-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-09',
        evalscript: '',
        evalscripturl: '',
        themeId: 'HISTORICAL',
        description:
          "In a typical year, rainfall during the wet season (December through March) recharges the Bolivian lake Poopó directly and via increased inflow from the Desaguadero River. In 2015, the lake dried up. This is not the first time that Poopó has evaporated; the lake last dried up in 1994. In that case, it took several years for water to return, and even longer for ecosystems to recover. Despite its history, in 2016 and 2017, as the waters still haven't returned, many environmentalists believed the waters will not return this time. There are multiple reasons as to why the droughts in the area are getting worse. Sitting high in the Bolivian Andes, the saline lake is particularly vulnerable to fluctuations because it is shallow — typically no more than 3 meters (9 feet) deep. Due to climate change the area has warmed an estimated one degree Celsius over the past century, leading to an increase in the rate of evaporation from the lake. And the lack of rain over the past year has sped the process even further. The government blamed the drought solely on El Nino and climate change, but even though this is one of the causes, it seems the management of the lake is also the problem. Some of the water that is supposed to fill the lake is being diverted for agriculture and mining. Even when water is available, the river is often clogged with sedimentation, due to the runoff from development and mining in the area. What happened to Lake Poopó is not unlike the drying of the vast Aral Sea in Central Asia. In both cases, a closed water system was overdrawn, with more water going out than coming in. However, in summer 2018, the lake filled up again, although the water line is clearly diminished compared to 2004. If all the problems persist, there is legitimate concern, that next time, the lake might stay dry forever. Learn more [here](https://www.nationalgeographic.com/news/2016/01/160121-lake-poopo-bolivia-dried-out-el-nino-climate-change-water/) and [here](https://earthobservatory.nasa.gov/images/87363/bolivias-lake-poopo-disappears).",
      },
      {
        title: 'Dubai Urbanization, 2020',
        lat: 25.1369,
        lng: 55.2317,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e9ad1f-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-19',
        evalscript: '',
        evalscripturl: '',
        themeId: 'HISTORICAL',
        description:
          'Perhaps no place on the Earth has had as drastic land cover change over the past ten years as Dubai. The creation of over 300 kilometers of coastline, the rapid expansion of urban land cover, and the intensification of urban development make this one of the most rapidly and visibly changed land covers due to urbanization. The total population of Dubai has grown by 1000% over the last 40 years alone. In 1975 the total population was 183,000 inhabitants, which increased in 2015 to about 2 million, making Dubai population one of the fastest growing in the world. The total built up area increased from only 54 square km in 1975 to 977 square km in 2015, raising  urbanized land by 1800% in only 40 years. Learn more [here](https://lcluc.umd.edu/hotspot/urbanization-dubai#:~:text=Dubai%20has%20experienced%20tremendous%20recent,in%202015%20(AMEInfo%202005a).) and [here](https://www.researchgate.net/publication/317564338_The_Boom_Population_and_Urban_Growth_of_Dubai_City).',
      },
      {
        title: 'Agriculture in Italy, 2020 (NDVI)',
        lat: 45.706898546777,
        lng: 12.983779907226562,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '3_NDVI',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e9ad1f-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-21',
        evalscript: '',
        evalscripturl: '',
        themeId: 'HISTORICAL',
        description:
          "Agriculture is one of Italy's key economic sectors, accounting for around 2.1% of GDP. Most farms are small, with the average size being eleven hectares. Italian industries, including the food-processing sector, rely heavily on imports of raw materials. Italy is one of the largest agricultural producers and food processors in the EU. The northern part of Italy produces primarily grains, soybeans, meat, and dairy products, while the south specializes in fruits, vegetables, olive oil, wine, and durum wheat.  Even though much of its mountainous terrain is unsuitable for farming, approximately 4% of the population is employed in farming.  Veneto agriculture is one of the most productive in Italy, producing mainly cereals, fruits and wine. Small, hand farmed fields present a contrast to the growing industrialization of the sector, which suffers from soil degradation. Learn more [here](https://www.recare-hub.eu/news/45-06-bioforsk) and [here](https://www.privacyshield.gov/article?id=Italy-Agricultural-Sector#:~:text=Italy's%20agriculture%20is%20typical%20of,%2C%20wine%2C%20and%20durum%20wheat.).",
      },
      // {
      //   title: 'Aral Sea, 2019',
      //   lat: 45.038,
      //   lng: 59.175,
      //   zoom: 9,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE_COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/e9ad1f-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-07-21',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'HISTORICAL',
      //   description:
      //     'In the 1960s, the Soviet Union undertook a major water diversion project on the arid plains of Kazakhstan, Uzbekistan, and Turkmenistan. The region’s two major rivers, fed by snowmelt and precipitation in faraway mountains, were used to transform the desert into farms for cotton and other crops. Before the project, the Syr Darya and the Amu Darya rivers flowed down from the mountains, cut northwest through the Kyzylkum Desert, and finally pooled together in the lowest part of the basin. The lake they made, the Aral Sea, was once the fourth largest in the world. Although irrigation made the desert bloom, it devastated the Aral Sea. As the Aral Sea has dried up, fisheries and the communities that depended on them collapsed. The salty dust blew off the lakebed and settled onto fields, degrading the soil. Croplands had to be flushed with larger and larger volumes of river water. The loss of the moderating influence of such a large body of water made winters colder and summers hotter and drier. Additionally, as the Aral water content diminishes, salinization of the lake increases. This creates vertical stratification, where surface salinity is lower than the bottom layer, thus heating up faster. This additionally contributes to water evaporation, creating a positive feedback loop. Learn more [here](http://www.columbia.edu/~tmt2120/environmental%20impacts.htm) and [here](https://earthobservatory.nasa.gov/world-of-change/AralSea).',
      // },
      // {
      //   title: 'Disappearing Glaciers of Switzerland, 2019',
      //   lat: 46.5134,
      //   lng: 8.0502,
      //   zoom: 12,
      //   datasetId: 'AWS_LOTL1',
      //   layerId: '1_TRUE_COLOR',
      //   visualizationUrl: 'https://services.sentinel-hub.com/ogc/wms/a2b6e4-YOUR-INSTANCEID-HERE',
      //   toTime: '2019-08-18',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'HISTORICAL',
      //   description:
      //     "Glaciers around the world are melting due to climate change. In Switzerland, they have shrunk 10% in the past five years, a rate that has never been seen before in over a century of observations. The summer 2019 heatwave saw glacier melt rates break records, leading to huge losses in ice volume. Scientists took measurements from 20 glaciers in the country and found that about 2% of Switzerland's total glacier volume was lost in the past year. Initial signs for 2019 had been encouraging after glacier snow cover was measured at 20-40% higher than normal in April and May, following a very cold January with lots of precipitation. However the third-hottest summer since records began meant melting accelerated dramatically. Melting was particularly severe in eastern Switzerland and the northern side of the Alps. More than 500 glaciers have completely disappeared in Switzerland since 1850, and 2019 saw the Pizol glacier removed from the country's glacier monitoring network. Most glaciers in Central Europe, Western Canada and the United States will vanish in the second half of this century if current rates of ice loss continue. Learn more [here](https://edition.cnn.com/2019/10/15/europe/switzerland-glacier-melting-scli-intl-scn/index.html) and [here](https://www.euronews.com/2019/12/02/before-and-after-see-how-swiss-glaciers-have-shrunk-dramatically-across-150-years).",
      // },
      {
        title: 'Xingu River, 2019 (False Color)',
        lat: -3.367429183298769,
        lng: -51.52313232421875,
        zoom: 10,
        datasetId: 'S2_L2A_CDAS',
        layerId: '2_FALSE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e9ad1f-YOUR-INSTANCEID-HERE`,
        toTime: '2019-09-26',
        evalscript: '',
        evalscripturl: '',
        themeId: 'HISTORICAL',
        description:
          'The controversial Belo Monte mega-dam in Pará state has done significant socio-environmental harm to the Xingu River and the indigenous and traditional people living beside it. Project designers appear to have seriously overestimated the Xingu River flow rates and failed to account for fluctuations between wet and dry seasons, while also not accounting for reductions in flow due to deforestation caused by rapidly expanding cattle ranches and soy plantations. Due to escalating climate change and drought that are reducing Xingu River flow, the dam seems almost certain to never fulfill promised economic or energy-producing goals. The dam diverts the Xingu River’s natural flow into a constructed channel, then into a reservoir and to the main electricity-producing Belo Monte dam, largely drying up the river in its original path. Tens of thousands of indigenous and traditional people were forced from their homes, and had to give up their fishing livelihoods. Today, the Belo Monte hydroelectric dam stands as a warning – proof of the damage caused by ill-conceived Amazon mega-projects. Learn more [here](https://news.mongabay.com/2018/02/belo-monte-legacy-harm-from-amazon-dam-didnt-end-with-construction/) and [here](https://news.mongabay.com/2020/01/belo-monte-boondoggle-brazils-biggest-costliest-dam-may-be-unviable/).',
      },
    ],
  },

  {
    name: () => t`Floods and Droughts`,
    id: 'FLOODING',
    content: [
      {
        name: 'Humidity (S2L2A)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/8184c6-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Humidity (S2L1C)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ede228-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Copernicus Sentinel-1 Education + API (V3)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b50152-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      // {
      //   name: 'Humidity (L8 USGS)',
      //   service: 'WMS',
      //   url: 'https://services.sentinel-hub.com/ogc/wms/1f6348-YOUR-INSTANCEID-HERE',
      //   preselected: true,
      // },
    ],
    pins: [
      {
        title: 'Winter Flooding in the UK (Custom)',
        datasetId: 'S1_CDAS_IW_VVVH',
        themeId: 'FLOODING',
        layerId: null,
        lat: 51.74266,
        lng: -1.48006,
        zoom: 12,
        fromTime: '2024-01-04T00:00:00.000Z',
        toTime: '2024-01-04T23:59:59.999Z',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b50152-YOUR-INSTANCEID-HERE`,
        description:
          'In late 2023 and early 2024, north-western Europe experienced very high levels of rainfall, which led to widespread river flooding. In the winter months, when multispectral imagery is degraded by lower light levels and widespread cloud cover, the Sentinel-1 SAR platform offers an ideal platform for monitoring surface water flooding at a regional scale as the sensor can penetrate the cloud cover. The low backscatter of surface waters also clearly distinguishes them from other land cover types.',
        evalscript: `//VERSION=3
          function setup() {
              return {
                  input: [
                      {
                          datasource: "S2L2A",
                          bands: ["B08"],
                      },
                      {
                          datasource: "S1GRD",
                          bands: ["VV", "dataMask"],
                      },
                  ],
                  output: { bands: 4 },
                  mosaicking: "SIMPLE",
              };
          }
          
          function toDB(input) {
              return (10 * Math.log(input)) / Math.LN10;
          }
          
          //threshold value for water detection, reduce for more water, increase for less water
          const lim = 15;
          //gain value for image brightness (increase for brighter image)
          const f = 2.5;
          
          function evaluatePixel(sample) {
              var S1 = sample.S1GRD[0];
              var S2 = sample.S2L2A[0];
              if (toDB(S1.VV) <= -1 * lim) {
                  return [S1.VV * 10, S1.VV * 10, S1.VV * 50, 1];
              } else {
                  return [f * S2.B08, f * S2.B08, f * S2.B08, 1];
              }
          }
          `,
        evalscripturl: '',
        dataFusion: [
          {
            id: 'CDAS_S1GRD',
            alias: 'S1GRD',
            additionalParameters: {
              polarization: 'DV',
              acquisitionMode: 'IW',
              resolution: 'HIGH',
            },
          },
          {
            id: 'CDAS_S2L2A',
            alias: 'S2L2A',
            timespan: [new Date('2023-04-04T00:00:00.000Z'), new Date('2023-04-04T23:59:59.999Z')],
            mosaickingOrder: 'mostRecent',
          },
        ],
      },
      {
        lat: -1.27508,
        lng: -62.10022,
        zoom: 13,
        title: 'Amazon Drought (Highlight Optimized Natural Color)',
        toTime: '2023-10-02',
        layerId: 'HIGHLIGHT-OPTIMIZED-NATURAL-COLOR',
        themeId: 'HIGHLIGHT',
        datasetId: 'S2_L2A_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/8184c6-YOUR-INSTANCEID-HERE`,
        description:
          'The Amazon watershed has experienced an extraordinary drought in late September and early October 2023 that will most likely become the worst drought event ever recorded in the region [[1]](https://www.reuters.com/business/environment/amazon-drought-chokes-river-traffic-threatens-northern-corn-exports-2023-10-09/). This time of year is normally the driest part of the year in the region, but the current conditions are exceptional. According to the National Institute for Amazon Research, the drought is caused by a combination of El Niño, the occasional warming of the Pacific Ocean surface, and the warming of the northern tropical Atlantic Ocean. Droughts are a significant factor in forest carbon loss and also affect endangered species such as the Amazon river dolphin. Compared to the same season in previous years, large areas of uncovered sediments are evident, and areas occupied by wetlands and open waters are greatly reduced.',
      },
      {
        lat: 39.67285,
        lng: 21.96239,
        zoom: 10,
        title: 'Flooding in Central Greece (False Color Urban)',
        toTime: '2023-09-10',
        layerId: 'FALSE-COLOR-URBAN',
        themeId: 'FLOODING',
        datasetId: 'S2_L2A_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/8184c6-YOUR-INSTANCEID-HERE`,
        description:
          'After a summer of brutal heatwaves, central Greece was hit by devastating flooding in the first half of September 2023 with over a year’s worth of rainfall falling in 24 hours in some places [[1]](https://www.bbc.com/news/world-europe-66751510). So far, the death toll has reached 17 people, with hundreds awaiting to be rescued. Much of the Thessaly region, the breadbasket of Greece, remains underwater or buried under a deep layer of mud and silt [[2]](https://www.theguardian.com/world/2023/sep/09/greek-rescuers-working-through-the-night-to-locate-villagers-trapped-by-flood). The high rainfall totals are thought to have been caused by an unusual omega weather system event - in which a zone of high pressure is sandwiched between two areas of low pressure. The same weather system is also to blame for the unseasonal UK heatwave and flooding in Bulgaria and Turkey [[3]](https://www.theguardian.com/world/2023/sep/06/uk-heatwave-floods-south-east-europe-omega-weather-system). The scale of the flooding is perfectly illustrated using a False Color composite based on the SWIR and NIR bands acquired by Sentinel-2. This particular visualisation uses the [False Color Urban RGB composite](https://custom-scripts.sentinel-hub.com/sentinel-2/false-color-urban-rgb/), which is also excellent for showing flooded areas.',
      },
      {
        lat: -3.17573,
        lng: 29.23157,
        zoom: 12,
        title: 'Devastating Flooding in DR Congo (Enhanced Visualization)',
        toTime: '2023-05-05',
        layerId: '2_ENHANCED-VISUALIZATION-2',
        themeId: 'HIGHLIGHT',
        datasetId: 'S1_CDAS_IW_VVVH',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b50152-YOUR-INSTANCEID-HERE`,
        description:
          'The Democratic Republic of Congo experienced one of the largest flood and landslide events in recent history between 2 and 4 May 2023, with more than 400 confirmed deaths, some 5,500 missing and immense property damage [[1]](https://edition.cnn.com/2023/05/08/africa/flooding-congo-dead-intl/index.html). The image has been captured by a Synthetic Aperture Radar (SAR), which provides another type of imagery as it can penetrate clouds. It can capture data at any time of day as it does not depend on sunlight, and works in all weather conditions. This makes the sensor a very useful tool to provide timely information about such devastating natural disasters.',
      },
      // {
      //   title: 'Flood in Madagascar (True Color)',
      //   lat: -15.4924,
      //   lng: 47.1094,
      //   zoom: 11,
      //   datasetId: 'AWS_LOTL1',
      //   layerId: '1_TRUE_COLOR',
      //   visualizationUrl: 'https://services.sentinel-hub.com/ogc/wms/1f6348-YOUR-INSTANCEID-HERE',
      //   toTime: '2020-01-27',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'FLOODING',
      //   description:
      //     "The northwest coast of Madagascar, with its distinctive [Betsiboka](https://www.esa.int/Applications/Observing_the_Earth/Earth_from_Space_Madagascar_jellyfish) River, is known as one of the most rapidly changing coasts in the world. Due to massive deforestation of rainforests and mangroves, the Betsiboka Estuary is subject to catastrophic soil erosion. During each rain event, iron-rich silt sediments are washed from the bare hills into the river system, giving the river its characteristic reddish brown colour. The large sediment plumes eventually deposit in the ecologically important Bombetoka Bay, threatening the balance of this haven for Madagascar's endemic fauna. In late January 2020, torrential rains in the northern part of the island caused severe flooding in the region, which in turn had a major impact on local communities and the ecosystem.",
      // },
      // {
      //   title: 'Flood in Bangladesh (NDWI)',
      //   lat: 25.8299,
      //   lng: 89.8483,
      //   zoom: 11,
      //   datasetId: 'S2_L1C_CDAS',
      //   layerId: '3_NDWI',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/ede228-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-07-19',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'FLOODING',
      //   description:
      //     'Bangladesh is known as one of the most flood-affected countries in the world. Every year, [the monsoon](https://education.nationalgeographic.org/resource/monsoon/) brings heavy rains from June to September. In early July 2019, heavy rains and overflowing rivers flooded many districts in northern Bangladesh, forcing nearly 200,000 people to [leave their homes](https://floodlist.com/asia/bangladesh-monsoon-floods-july-2019). On the night of 17 July 2019, the Jamuna River burst its banks and flooded at least 40 villages, worsening the impact of the monsoon season in the region. Timely identification of flooded areas is essential for effective flood protection and disaster management, as is the [Global Flood Awareness System](https://www.globalfloods.eu/).',
      // },
      // {
      //   title: 'Flood in Omaha (Nebraska, USA) (SWIR)',
      //   lat: 41.2904,
      //   lng: -95.8987,
      //   zoom: 10,
      //   datasetId: 'S2_L1C_CDAS',
      //   layerId: '6-SWIR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/ede228-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-03-16',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'FLOODING',
      //   description:
      //     'From March 13-23, 2019 (with a peak from March 13-17), Nebraska, Iowa and South Dakota experienced widespread flooding ranging from mild/moderate to historic/catastrophic. By far the worst flooding occurred along several major rivers, including the Loup River system, the Cedar River and the Wood River. The floods were characterised by high water levels (as with all floods), but in many areas the damage was also magnified by unusually heavy break-off of thick river ice caused by winter storms and blizzards. Due to the meridional mountain ranges, the cold polar air forms these extreme conditions.',
      // },
      // {
      //   title: 'Drought in Chennai (Moisture Index)',
      //   lat: 13.16588,
      //   lng: 80.16614,
      //   zoom: 14,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '2_MOISTURE-INDEX',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/8184c6-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-02-05',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'FLOODING',
      //   description:
      //     'Chennai is located on the south-eastern coast of India on a flat coastal plain and is the fourth largest city in the country with a population of over 7 million. The city relies heavily on annual monsoon rains to replenish its four water reservoirs, which are the main water resources for the public sector and the extensive automobile industry in the region. Poor management of water resources combined with three years of inadequate monsoon rains prior to the drought led to dramatic depletion of the reservoirs. In addition, the aquifer was depleted beyond its usual regenerative capacity as residents resorted to groundwater extraction through [bore wells](https://www.indiawaterportal.org/topics/borewells-and-tubewells). Learn more [here](https://www.nationalgeographic.com/environment/article/india-water-crisis-drought-could-be-helped-better-building-planning).',
      // },
      {
        title: 'Drought in Denmark (True Color)',
        lat: 56.2704,
        lng: 10.4713,
        zoom: 10,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/8184c6-YOUR-INSTANCEID-HERE`,
        toTime: '2018-07-27',
        evalscript: '',
        evalscripturl: '',
        themeId: 'FLOODING',
        description:
          'July 2018 was incredibly hot for northern Europe. A prolonged drought coupled with record-breaking temperatures was a devastating combination for farms in Denmark. Spring vegetable and cereal harvests were 40-50% lower. Another consequence of the severe drought was wildfires. The extreme heat warmed lakes and oceans, favouring conditions for a dangerous algal bloom, and the Baltic Sea experienced the worst algal bloom in decades. Learn more [here](https://www.climate.gov/news-features/event-tracker/hot-dry-summer-has-led-drought-europe-2018).',
      },
    ],
  },

  {
    name: () => t`Geology`,
    id: 'GEOLOGY',
    content: [
      {
        name: 'Geology (S2L2A)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Geology (S2L1C)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b49f2a-YOUR-INSTANCEID-HERE`,
      },
    ],
    pins: [
      {
        title: 'Senj Archipelago, Croatia',
        lat: 44.87746,
        lng: 14.78125,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2022-07-19',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          'The Senj Archipelago includes 3 major islands - [Prvić](https://en.wikipedia.org/wiki/Prvi%C4%87), [St. Grgur](https://en.wikipedia.org/wiki/Sveti_Grgur) and [Goli Otok](https://en.wikipedia.org/wiki/Goli_Otok). All three islands have large areas of barren limestone rock surface, with a directly visible structure due to the lack of vegetation. In addition, sun glint patterns on the water surface allow the interpretation of local wind effects, especially near the shore.',
      },
      {
        title: 'Sea Stacks of Boreray Island, St. Kilda Archipelago, UK',
        lat: 57.87031,
        lng: -8.49196,
        zoom: 15,
        datasetId: 'S2_L1C_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b49f2a-YOUR-INSTANCEID-HERE`,
        toTime: '2019-06-21',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          'This set of uninhabited islands and rocky peaks really tests the limits of satellite image preprocessing: Due to the extremely steep slopes, some pixels are prone to overcorrection to high brightness. In the south of the island, the refraction of wave arcs can be observed in this image. [Learn more](https://whc.unesco.org/en/list/387/).',
      },
      {
        title: 'Grasberg Open Pit, Indonesia (Geology 12,8,2)',
        lat: -4.05377,
        lng: 137.09101,
        zoom: 14,
        datasetId: 'S2_L1C_CDAS',
        layerId: '3_GEOLOGY-12-8-2',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/b49f2a-YOUR-INSTANCEID-HERE`,
        toTime: '2018-05-14',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          'For years the [Grasberg open pit mine](https://courses.lumenlearning.com/geology/chapter/reading-open-pit-mining/) which forms a 1.6 km wide crater at the surface, has been one of the most productive mines in the world, with massive reserves of gold and copper. Situated high in the rugged Sudirman Mountains, Papua Indonesia, its [mineralization](https://www.sciencedirect.com/science/article/abs/pii/037567429490023X) extends from the surface at 4,200 m to the deepest drill penetrations at 2,700 m. The gold and copper bearing ore formed millions of years ago when hot magma intruded into sedimentary rock during the uplift of the local mountains. Since the 1990s, the Grasberg highly sophisticated mining operation has been busily extracting this ore at staggering [volumes](https://www.mining-technology.com/projects/grasbergopenpit/) to the tune of 528 billion ounces of copper and 53 million ounces of gold. It transitioned into an [underground mine](https://www.nsenergybusiness.com/projects/grasberg-block-cave-underground-mine/) in 2019. Unfortunately, the dumping of millions of tons of waste [tailings](https://www.tailings.info/basics/tailings.htm) directly into the nearby [Ajkwa river system](https://earthworks.org/stories/ajkwa-estuary/) has not only devasted aquatic life but also caused a steadily growing floodplain of desolation, killing thousands of hectares of verdant forest and mangroves and continues to leave the locals [counting the cost](https://theinsiderstories.com/indonesia-will-summon-freeport-on-environmental-damage/).',
      },
      {
        title: 'Meteor Crater, Arizona',
        lat: 35.02841,
        lng: -111.02646,
        zoom: 14,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-25',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          'The Arizona [Meteor Crater](https://www.meteorite.com/meteor-crater/) (Barringer Meteorite Crater) formed 50,000 years ago when an asteroid plunged through the Earth’s atmosphere and crashed into what would become central Arizona. The 10 second collision initially formed a crater over 1200 m across and 200 m deep. Subsequent erosion have shaved off parts of the rim and has partially filled the crater, which is now 1600 m wide, 170 m deep gouge, yet the arid climate has done its share to preserve the crater’s original graceful look making it the best-preserved [impact crater](https://en.wikipedia.org/wiki/Impact_crater#:~:text=An%20impact%20crater%20is%20an,impact%20of%20a%20smaller%20body.) on Earth. Very little of the original mass of about 150,000 tons survived the impact, however bits and pieces of the space rock remain scattered throughout the crater, which has for years been a [tourist attraction](https://meteorcrater.com/) as well as a wonderful laboratory for scientists and researchers furthering the study of meteorite impacts.',
      },
      {
        title: 'Danakil Depression, Ethiopia (Geology 12,8,2)',
        lat: 14.23389,
        lng: 40.28944,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '3_GEOLOGY-12-8-2',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2019-10-16',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          "Northern Ethiopia’s [Danakil Depression](https://earthobservatory.nasa.gov/images/84239/curiosities-of-the-danakil-depression), located in the Danakil Desert, is one of the [hottest](https://www.autoeurope.co.uk/travel-blog/the-worlds-coldest-and-warmest-places/), driest and lowest places on earth. Parts of the region are more than 100 m below sea level, forming a cauldron where temperatures average 34 °C and at times climb to 50 °C. In addition, it only receives 100 to 200 mm of rainfall per year. The climate here can only be described as cruel. But against all odds, [people](http://www.bbc.com/earth/story/20160614-the-people-and-creatures-living-in-earths-hottest-place) do live here and for centuries the locals have survived by mining and selling [salt blocks](https://www.fairplanet.org/story/the-hottest-place-on-earth-the-salt-mines-of-danakil-depression/) left behind after evaporation. As if the climate was not enough, the region's energetic geology makes it look like an alien land. There are volcanoes with bubbling lava lakes, multi-coloured hydrothermal fields, and great salt pans, all of which manifest themselves in the vibrant combination of yellows, oranges, and reds that make the landscape look equal parts [neon and deadly](https://www.bbc.com/future/article/20170803-in-earths-hottest-place-life-has-been-found-in-pure-acid). It is thought that somewhere in the future this geological depression caused by the drifting of three tectonic plates will have drifted enough that the Red Sea will spill over, drowning this strange landscape into a new ocean.",
      },
      // {
      //   title: "National Reserve de l'Ancarana, Madagascar (Geology 8,11,12)",
      //   lat: -12.9196,
      //   lng: 49.0567,
      //   zoom: 12,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '4_GEOLOGY-8-11-12',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-08-19',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'GEOLOGY',
      //   description:
      //     'Containing a unique geological wonder, a spectacularly eroded limestone fortress of sharp ridges, [Ankarana National Park](https://www.madacamp.com/Ankarana_National_Park) is situated on a limestone plateau about 108 km south of Antsiranana and covers 18,225 ha. Ankarana has since earned a reputation for its limestone karst pinnacles called [tsingy](https://madagascar-tourisme.com/en/what-to-do/fauna-and-flora/tsingy/) which in Malagasy means "where one cannot walk barefoot". Observing the tsingy from the air, pilots have been reminded of the deep urban canyons of Manhattan, because the formations have become like rows of high-rise apartment buildings, providing shelter to a different array of species at each level. The topography of the park is varied and in addition to the limestone ‘tsingies’ includes a dense tropical jungle, deciduous forest, canyons and an extensive cave system and network of underground rushing rivers - some of which contain crocodiles. This variety of landscape makes it a popular choice among hikers offering [incredible trails](https://www.naturalworldsafaris.com/africa/madagascar/ankarana-national-park), unique and terrific landscapes and excellent wildlife viewing.',
      // },
      // {
      //   title: 'Colca Canyon, Peru (False Color)',
      //   lat: -15.57451,
      //   lng: -72.09177,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '2_FALSE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-06-24',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'GEOLOGY',
      //   description:
      //     'Nestled within the [Andes Mountains](https://www.tripsavvy.com/coast-mountains-and-jungle-geography-of-peru-1619914) of Peru along Colca River is the [Colca Canyon](http://www.discover-peru.org/colca-canyon/). This canyon is reportedly the [deepest](https://colcawonderperu.wordpress.com/about/) in the world, with an estimated depth of 4,160 m on the North side and 3,600 m on the South side, thought to be twice as deep as the [Grand Canyon](https://www.nps.gov/grca/index.htm) in the USA. Unlike most of the Grand Canyon, portions of the Colca Canyon are habitable, and one can see pre-Inca agricultural terraces still being used by local farmers who practice the same lifestyle as their ancestors. The Colca Canyon was [formed](https://www.geocaching.com/geocache/GC1HKWF_colca-canyon?guid=f0c266-YOUR-INSTANCEID-HERE) by the erosion of volcanic rock caused by the Colca River along the line of a fault on the crust of the earth. Regardless of its depth the Colca Canyon is considered geologically young. Its location near the Valley of the volcanoes, an area of about 40 volcanoes, means that it is a geologically active area. The largest [volcanoes](http://web.gps.caltech.edu/~clay/PeruTrip/Talks/PeruVolcanoes-Wicks.pdf) are Sabancayo and Ampato. Unsurprisingly, it’s also home to some of Peru’s most [captivating scenery](https://www.beautifulworld.com/south-america/peru/colca-canyon/) as well as one of the best viewing points for South America’s most famous bird - [the condor](http://www.discover-peru.org/endangered-animals-in-the-andes/) - which can oft be seen gliding on the thermal winds in search for food high in the rugged peaks of the Andes.',
      // },
      {
        title: 'Mingsha Singing Sand Dunes, China',
        lat: 40.0336,
        lng: 94.62851,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-02',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          '[Singing Sand Dune](https://www.topchinatravel.com/china-attractions/misha-hill-and-crescent-spring.htm) (Mingsha Hill) and its twin natural beauty at the foot of the hill, [Crescent Spring](http://www.silkroadtourcn.com/attractions/crescent-lake-and-singing-sand-dunes.html), are 7 km away from downtown [Dunhuang](https://www.topchinatravel.com/dunhuang/) and cover a total area of around 200 square km. [The dune](https://en.wikipedia.org/wiki/Singing_Sand_Dunes_(Dunhuang)) stretches for 40 km in length and 20 km in width respectively, with the highest point reaching 250 meters and is completely piled up with sand in five colors of red, yellow, green, black and white. There is unsurprisingly a [legend](https://www.topchinatravel.com/china-attractions/misha-hill-and-crescent-spring.htm) that narrates the formation of the singing sand dunes, however, the [real cause](https://www.nationalgeographic.com/news/2012/10/121031-singing-sand-dunes-physics-science-whistling/) is the friction and static created as the wind shifts the sand or as people slide down the steep slopes of the sand dunes from the top. On days when a strong wind blows, the fast shifting sand roars, but when light wind blows, the sand produces a gentle, dulcet sounds akin to music. When sliding on the steep slopes of sand dunes from the top, the drifting sands look like beautiful brocades hung up on the sand dunes, accompanied with beautiful singing sound. The singing sounds like the sound from traditional Chinese music instruments. Hence, the dune gets its name because of the singing sound of the sand. The sands really do sing! Sunrise and sunset are times of great beauty at the edge of the desert. Modest cameras can capture great moments but for the technologically advanced, better equipment will reveal amazing colors!',
      },
      {
        title: 'Alluvial Streams, China',
        lat: 39.8514,
        lng: 95.2264,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-02',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          'The [Shule river](https://en.wikipedia.org/wiki/Shule_River) drainage basin covers 102,300 square km of land, getting most of its water from the surrounding glaciers. The river carves many alluvial streams and wide [alluvial fans](https://www.nationalgeographic.org/encyclopedia/alluvial-fan/) along the way. Alluvial fans are usually created as flowing water interacts with mountains, hills, or the steep walls of canyons. Streams carrying alluvium can be trickles of rainwater, a fast-moving creek, a powerful river, or even runoff from agriculture or industry. As a stream flows down a hill, it picks up sand and other particles, called alluvium. The rushing water carries alluvium to a flat plain, where the stream leaves its channel to spread out. Alluvium is deposited as the stream fans out, creating the familiar triangle-shaped feature, which can be tiny, or enormous.',
      },
      {
        title: 'Knockan Crag, Scotland (Geology 8,11,12)',
        lat: 57.9337,
        lng: -5.1461,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '4_GEOLOGY-8-11-12',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2019-10-31',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          'Amazing stories stored in the rocks come to life at [Knockan Crag National Nature Reserve](https://www.nature.scot/sites/default/files/2018-02/The%20Story%20of%20Knockan%20Crag%20National%20Nature%20Reserve.pdf), a visitor attraction in the North West Highlands of Scotland, 21 km north of Ullapool near the crofting townships of Knockan and Elphin. As its name suggests, Knockan Crag is a cliff that rises to a height of 300 m above sea level. It is hard not to get excited about rocks and geology at Knockan Crag as it holds the key to an amazing story of colliding continents and [scientific intrigue](https://www.earth.ox.ac.uk/~oesis/nws/loc-knockan.html). Knockan Crag is internationally renowned due to the presence of a geological feature called the "[Moine Thrust](https://www.geological-digressions.com/tag/knockan-crag/)" first identified here in the 1860s. The Moine Thrust is a major near horizontal geological fault affecting the rocks, whereby the older rocks have been pushed towards, up and over younger rocks. This is the place where [Moine metamorphic](https://www.scottishgeology.com/best-places/knockan-crag/) rocks have ended up on top of limestone, and at the Moine Thrust at Knockan Crag you can put your hands on these two very different rocks. [Nature trails](http://earthwise.bgs.ac.uk/index.php/Knockan_Crag,_North-west_Highlands_-_an_excursion) ascending up and along the crag lead tourists through striking succession of weathering [Cambrian sediments](https://www.geolsoc.org.uk/GeositesKnockan) overlain by the older Moine rocks. Infact, crystalline Moine metamorphic rocks sit on top of a sequence of undisturbed sedimentary rocks which have not been affected by the activity that deformed the overlying rocks. For more than 100 years geologists have used Knockan Crag to help in understanding mountain building and tectonic plates across the world.',
      },
      {
        title: 'The Great Blue Hole, Belize (Enhanced True Color)',
        lat: 17.3202,
        lng: -87.54267,
        zoom: 14,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-22',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        gain: '1.4',
        description:
          'Instead of its roaring waves and scary storms, the Caribbean sea often offers amazing natural wonders below its otherwise uncertain surface. [The Great Blue Hole of Belize](https://www.marineinsight.com/environment/what-is-the-great-blue-hole-of-belize/), located off the coast of Belize, is one of such wonders. Circular in shape with a diameter of 300 m, the water depth in this hole is 125 m, which gives it a deep blue color in contrast with the aquamarine color of the water neighboring it. Researchers say this giant underwater [sinkhole](https://www.usgs.gov/special-topic/water-science-school/science/sinkholes?qt-science_center_objects=0#qt-science_center_objects) was originally formed during the last glacial period as a limestone cave when the sea levels were lower. As the ocean began to rise due to [thawing](https://www.nationalgeographic.com/environment/global-warming/big-thaw/) of polar ice caps, the cave system flooded and eventually collapsed, creating a “vertical cave” in the ocean. As such, this swallow hole is popular among divers, who flock to the area to see the geological formations that now lie in the ocean’s depths. [Researcher divers](https://geographical.co.uk/people/explorers/item/3132-explore-belize-blue-hole) have found huge [stalactites and stalagmites](https://oceanexplorer.noaa.gov/facts/stalactite.html) below the surface, some even reaching 9 – 12 m in length. They say that the deeper one goes, the water becomes clearer and the formations, more complex. The Great Blue Hole is part of the larger Belize Barrier Reef Reserve System, a World Heritage Site of UNESCO.',
      },
      {
        title: 'Grand Canyon National Park, USA',
        lat: 36.2571,
        lng: -112.6772,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2019-11-04',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          "[Founded in 1919](https://www.nationalparks.org/explore-parks/grand-canyon-national-park), located in Arizona, the [Grand Canyon National Park](https://www.nps.gov/grca/index.htm) encompasses 446 km of the Colorado River and adjacent uplands. The park is home to much of the immense Grand Canyon 1.6 km deep, and up to 29 km wide. The Grand Canyon National Park has a rich [geological](https://www.usgs.gov/science-support/osqi/yes/national-parks/grand-canyon-geology) history. Though scientists are still unsure of the canyon's exact history, many scientists have pieced together a linier history that includes [the Colorado Plateau](https://web.uri.edu/geofieldtrip/grand-canyon-national-park/), the mighty Colorado River and millions of years of erosion. Long considered one of the seven wonders of the world, tourists flock to marvel at the canyon’s jaw-dropping immensity, and the sheer spectacle of how the Colorado River carved through layer after layer of rock to expose a unique combination of geological color and erosional forms. It is impossible not to notice [distinct layers of rock](https://www.mygrandcanyonpark.com/things-to-do/grand-canyon-geology) exposing an ombre of reds, browns, pinks, purples and more.",
      },
      {
        title: 'Ha Long Bay, Vietnam (Geology 12,8,2)',
        lat: 20.88167,
        lng: 107.09833,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '3_GEOLOGY-12-8-2',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2019-12-07',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          '[Ha long Bay](https://www.beautifulworld.com/asia/vietnam/ha-long-bay/) is an extraordinary beautiful natural wonder in northern Vietnam’s Quang Ninh Province, near the Chinese border. Covering over 1,500 square km area, it comprises of more than 1,600 rocky and earthen islands, typically in the form of jagged limestone pillars jutting out from the sea, and several caves, floating villages and [grottoes](https://en.wikipedia.org/wiki/Grotto), all of which blend together to produce an exotic and picturesque seascape. The existence of surreal seascape has been often explained by the old age [dragon legend](https://www.visithalongbay.com/insight-guides/the-legend-of-halong-bay.html) while scientist have explained that the formations are as a result of 500 million years of strong erosive forces moulding the rocks into fascinating shapes. It is classified as both a [World Heritage Site by UNESCO](https://whc.unesco.org/en/list/672), and as one of the New 7 Wonders of Nature and for many tourists, this place is like something right out of a movie. The fact is that Ha long Bay features a wide range of biodiversity, while the surrealistic scenery has indeed featured in endless movies.',
      },
      // {
      //   title: 'Namib Desert, Namibia',
      //   lat: -25.6543,
      //   lng: 15.948,
      //   zoom: 10,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE_COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-11-18',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'GEOLOGY',
      //   description:
      //     'With its [red sand dunes](https://www.earthmagazine.org/article/travels-geology-desert-geology-namibia-writer-and-her-father-explore-otherworldly-dunes) rolling endlessly into the ocean, the [Namib](https://www.rovos.com/the-namib-desert) is the oldest desert in the world, existing for at least 55 million years, stretching over 2000 km along Namibia‘s entire Atlantic coast and parts of Angola and South Africa. This extremely [arid ecoregion](https://www.worldwildlife.org/ecoregions/at1315) features dunes, rocky mountainous areas, gravel plains, perennial river mouth wetlands, coastal pans, lagoons, riparian vegetation and isolated springs resulting in a landscape of exceptional beauty. With rainfall varying from 85 mm in the west to just 2 mm in the east, coastal fog is the primary source of water accounting for a unique environment in which endemic [plants and animals](https://www.britannica.com/place/Namib#ref37004) adapt to an ever changing variety of microhabitats and ecological niches. Despite its emptiness, the desert scenery of the Namib has a stark beauty with its striking patterns created by the constantly shifting sand dunes to the dramatic coastline, where shipwrecks shrouded in fog disintegrate slowly into the sand. In addition to being home to the famous solitary [Sossusvlei Dunes](https://www.sossusvlei.org/about/), it is also the site of major mines for tungsten, salt and diamonds.',
      // },
      {
        title: 'Fjords of Norway (Geology 12,8,2)',
        lat: 66.5464,
        lng: 13.196,
        zoom: 10,
        datasetId: 'S2_L2A_CDAS',
        layerId: '3_GEOLOGY-12-8-2',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2019-09-26',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          "A [fjord](https://www.visitflam.com/editorial-content/everything-you-should-know-about-the-fjords-of-norway/?referrer=4464&gclid=Cj0KCQjw6ar4BRDnARIsAITGzlAyf5HypXDOQeJ4RTYb1M0hft5j1lpMTFV0qZcktbYwBuaVyK2iYe0aAvi1EALw_wcB) is a story of water, ice and mountains. It is a long, deep, narrow body of water that reaches far inland. Fjords are often set in a U-shaped valley with steep walls of rock on either side. While fjords are not just a Norwegian phenomenon and can be found in other mountainous regions, the [fjords of Norway](https://en.wikivoyage.org/wiki/Fjords_of_Norway) are particularly famous, spread all over the country and easily accessible as the fjord-dominated landscape runs like a strip all around Norway's coast. They were formed thousands of years ago by retreating glaciers, allowing the sea to flood in the remaining space. In the last [ice age](https://en.wikipedia.org/wiki/Ice_age), glaciers moving very slowly over time carved deep valleys. This is why fjords can be very deep farther inland where the glacial force was strongest, e.g. [Sognefjord](https://www.visitflam.com/activities/fjord-cruise-sognefjord/), is 1308 m deep at its deepest and gets shallow towards the sea. Some features of fjords include [coral reefs](https://marinelab.fsu.edu/labs/brooke/research/deep-sea-corals/norwegian-fjords/) and rocky islands called [skerries](https://en.wiktionary.org/wiki/skerry). Norway has over 1,700 named fjords which increase the jagged coastline from a modest 3000 km to 30,000 km, islands add another 70,000 km in total creating [the most complex coastline](https://www.google.com/maps/place/Norway/@66.134237,16.2021192,5z/data=!4m5!3m4!1s0x461268458f4de5bf:0xa1b03b9db864d02b!8m2!3d60.472024!4d8.468946). The dramatic scenery has become a magnet to tourists who enjoy kayaking and other boat sports.",
      },
      {
        title: 'Richat Structure, Mauretania',
        lat: 21.136065481691592,
        lng: -11.301498413085938,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/d7cc04-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-27',
        evalscript: '',
        evalscripturl: '',
        themeId: 'GEOLOGY',
        description:
          "[Eye of the Sahara](http://geologyscience.com/gallery/eye-of-the-sahara-or-richat-structure/), also known as the Richat structure, is a geological dome made of rocks billions of years old and measures 40.2 km across. Once, there was a temperate forest here, with lakes and rivers. The formation processes of this magnificent structure are still a mistery. The most prominent theory believes, that it's the result of the volcanism and erosion. The theory states, that volcanism in the area lifted the layers of sediments and after it died down, the erosion ate away at the structure, making the shape of an eye we see today. As the structure is visible from space, it serves as a landmark for [astronauts](http://www.lovethesepics.com/2011/04/earths-bulls-eye-the-eye-of-africa-landmark-for-astronauts-14-pics/).",
      },
    ],
  },

  {
    name: () => t`Ocean and Water Bodies`,
    id: 'OCEAN',
    content: [
      {
        name: 'Ocean (S2L2A)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Ocean (S2L1C)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/182c7c-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Ocean (S3-OLCI)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/e6f99f-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Ocean (S3-SLSTR)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/6f41f4-YOUR-INSTANCEID-HERE`,
      },
    ],
    pins: [
      {
        title: 'Salt Pans and Lakes of Seewinkel, Austria',
        lat: 47.77801,
        lng: 16.82445,
        zoom: 14,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
        toTime: '2022-08-03',
        evalscript: '',
        evalscripturl: '',
        themeId: 'OCEAN',
        description:
          'The lowland area immediately east of [Lake Neusiedl](https://www.nationalparksaustria.at/en/national-park-neusiedler-see.html) in Austria is home to many salt pans and lakes. In the current view, some of them are dry with a white salt crust, others are dry with dark brown sediment, while some have open water and are coloured green by algae growth. On the western side of the picture, the dynamics of the reeds on the lakeshore can be observed: Dense, young reeds grow green near the open water, while aging, more fragmented reeds occupy the areas further from the shore.',
      },
      {
        title: 'Tagliamento River, Italy (SWIR)',
        lat: 46.09508,
        lng: 12.82156,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '5_SWIR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
        toTime: '2023-05-05',
        evalscript: '',
        evalscripturl: '',
        themeId: 'OCEAN',
        description:
          'The rivers Tagliamento, Meduna and Cellina are unregulated gravel-bed rivers that mainly transport water from the Alps to the Adriatic sea during the snowmelt period. In the current view, the [Tagliamento](https://wilderness-society.org/wild-river-tagliamento-in-northern-italy/) in the East has visible water surfaces while the Meduna and the Cellina have none. The view is a Short-Wave Infrared (SWIR) composite, showing vegetation in shades of green, bare soil in brown, gravel in white and water in black.',
      },
      {
        title: 'Vistula River, Poland (False color)',
        lat: 52.42969,
        lng: 19.95529,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '2_FALSE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
        toTime: '2023-04-22',
        evalscript: '',
        evalscripturl: '',
        themeId: 'OCEAN',
        description:
          'The Vistula is the longest river in Poland and the ninth-longest river in Europe. The unregulated sections of the Vistula river show a system of islands, gravel bars and meanders. The use of infrared false colour highlights the dark water surface and shows the vegetation in different shades of red. [Learn more](http://awsassets.panda.org/downloads/vistula.pdf).',
      },
      // {
      //   title: 'Heavy Sedimentation Flow of Betsiboka River (False Color)',
      //   lat: -15.889,
      //   lng: 46.3548,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '2_FALSE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
      //   toTime: '2017-08-12',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'OCEAN',
      //   description:
      //     'The beautiful Betsiboka river delta is a dramatic example of massive deforestation, that occurs in Madagascar every year. One of the biggest culprits is the slash and burn agriculture, called [tavy](https://www.madamagazine.com/en/english-tavy-kahlschlag-einer-insel/), where the forest is burnt and then farmed in the following months. The other deforestation causes include grazing, logging and the production of coal. The forest grows back after being cut down, but until then, the barren soil is vulnerable to erosion by heavy rains. The rain transports it into rivers and from their into the sea, contaminating sea life with deposited iron oxides. As soil formation is a process taking thousands of years, soil erodes away each year, until it can no longer support a forest. Due to these processes, Madagascar has already lost [80 % of its primary forests](https://www.eoi.es/blogs/guidopreti/2014/02/04/deforestation-in-madagascar-a-threat-to-its-biodiversity/), causing many indigenous species, such as [lemurs](https://monkeysandmountains.com/lemurs-madagascar/), to be endangered.',
      // },
      // {
      //   title: 'Low Sedimentation Flow of Betsiboka River (False Color)',
      //   lat: -15.889,
      //   lng: 46.3548,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '2_FALSE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
      //   toTime: '2017-08-02',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'OCEAN',
      //   description:
      //     'The beautiful Betsiboka river delta is a dramatic example of massive deforestation, that occurs in Madagascar every year. One of the biggest culprits is the slash and burn agriculture, called [tavy](https://www.madamagazine.com/en/english-tavy-kahlschlag-einer-insel/), where the forest is burnt and then farmed in the following months. The other deforestation causes include grazing, logging and the production of coal. The forest grows back after being cut down, but until then, the barren soil is vulnerable to erosion by heavy rains. The rain transports it into rivers and from their into the sea, contaminating sea life with deposited iron oxides. As soil formation is a process taking thousands of years, soil erodes away each year, until it can no longer support a forest. Due to these processes, Madagascar has already lost [80 % of its primary forests](https://www.eoi.es/blogs/guidopreti/2014/02/04/deforestation-in-madagascar-a-threat-to-its-biodiversity/), causing many indigenous species, such as [lemurs](https://monkeysandmountains.com/lemurs-madagascar/), to be endangered.',
      // },
      {
        title: 'Lake Natron, Tanzania',
        lat: -2.3677,
        lng: 36.0757,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
        toTime: '2019-11-20',
        evalscript: '',
        evalscripturl: '',
        themeId: 'OCEAN',
        description:
          'Natron is a fascinating lake, deadly to most animals, that are not accustomed to its alkaline environment. The dangerously high PH of 10.5 is caused by sodium carbonate flowing in from the surrounding hills, active with volcanism. Sodium carbonate deposits serve as a preservant, calcifying the carcasses of deceased animals. Despite the harsh ecosystem, some species survive here. On its shores, flocks of flamingos, which have evolved leathery skin to tolerate the water, find a safe nesting place, as predators avoid the area. The stunning red color is caused by cyanobacteria, that thrive in the dry season, as salinity rises due to evaporation. Read more [here](https://www.smithsonianmag.com/travel/flamingos-find-life-among-death-180959265/), [here](https://earthobservatory.nasa.gov/images/90191/lake-natron-tanzania) and [here](https://www.livescience.com/40135-photographer-rick-brandt-lake-natron.html).',
      },
      // {
      //   title: 'Roper River, Tanzania (Enhanced False Color)',
      //   lat: -14.715,
      //   lng: 135.2479,
      //   zoom: 12,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '2_FALSE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-02-23',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'OCEAN',
      //   gamma: '1.2',
      //   description:
      //     'Roper river is over 1.000 km long, and its irrigation potential is considered to be immense. Using the powerful northern rivers is expected to create numerous jobs and greatly contribute to agricultural development and sustainability. However, some worry the project would require a million hectares of the catchment area to be bulldozed for irrigation agriculture, as well as a dam to be built, which could significantly dry up the river. As the impact on the economy is compelling, the project continues regardless. Read more on the [catchment area](https://web.archive.org/web/20150401172739/http://lrm.nt.gov.au/__data/assets/pdf_file/0003/20766/overview4.pdf) and more on the project [here](https://www.irrigationaustralia.com.au/news/water-its-our-dam-shame) and [here](https://www.topendcoasts.org.au/concern_for_the_roper_river_abc_country_hour).',
      // },
      {
        title: 'Algae Blooms of Don River, Russia (Water Quality Viewer)',
        lat: 47.9113,
        lng: 42.7739,
        zoom: 10,
        datasetId: 'S2_L2A_CDAS',
        layerId: '4_ULYSSYS-WATER-QUALITY-VIEWER',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
        toTime: '2019-09-05',
        evalscript: '',
        evalscripturl: '',
        themeId: 'OCEAN',
        description:
          "The [Tsimlyansk Reservoir](https://www.britannica.com/place/Tsimlyansk-Reservoir) - a big reservoir on the Don River in Russia - is around 250 kilometers long and provides water for a hydropower station, as well as for the irrigation of the surrounding fields. The visualization aims to dynamically visualise the chlorophyll and sediment concentrations in water bodies, the two primary indicators of water quality. Chlorophyll content ranges in colors from dark blue (low chlorophyll content) through green to red (high chlorophyll content). Sediment concentrations are colored brown; opaque brown indicates high sediment content. High chlorophyll and sediment concentrations can both be found on the norther shore, coming from the surrounding agricultural fields. This reduces the [reservoir's water quality (pollution, eutrophication, toxification)](https://link.springer.com/article/10.1134/S1875372814020048) which poses a risk for the in situ ecosystem.",
      },
      // {
      //   title: 'Salt lake Mackay, Australia',
      //   lat: -22.4015,
      //   lng: 128.7804,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE_COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
      //   toTime: '2018-12-26',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'OCEAN',
      //   description:
      //     'Lake Mackay or Wilkinkarra (in [Pitjantjatjara](https://ulurutoursaustralia.com.au/blog/the-culture-and-heritage-of-the-pitjantjatjara-in-central-australia/)) is the fourth largest lake in Australia, covering an area of 3.494 square kilometers. The particularity of this water body is that being an [ephemeral lake](https://www.sciencedirect.com/topics/earth-and-planetary-sciences/ephemeral-lake), it only fills with water after seasonal rainfall, although water can persist for several months after a major rain event. When inundated, the lake is of significant importance for [endemic waterbird populations](http://www.epa.wa.gov.au/sites/default/files/Referral_Documentation/App%20B.3_Waterbird%20Survey%20at%20Lake%20Mackay.pdf), who use the freshwater [claypans](https://www.merriam-webster.com/dictionary/claypan) as breeding grounds. Due to evaporation, minerals are carried to the surface, forming bright white salt pans that contrast with the darker brown islands scattered across the eastern half of the lake. On these islands and around the shoreline, bright orange longitudinal sand ridges form stunning lines from east to west across the landscape.',
      // },
      // {
      //   title: 'Shark Bay, Australia',
      //   lat: -25.9898,
      //   lng: 113.852,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE_COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-01-10',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'OCEAN',
      //   description:
      //     'Located 800 km north of Perth in the Indian Ocean, Shark Bay is a unique [UNESCO World Heritage](https://whc.unesco.org/en/about/) site. The bay is renown for having the largest [seagrass](https://ocean.si.edu/ocean-life/plants-algae/seagrass-and-seagrass-beds) meadow in the world (~4.000 square kilometers), forming a feeding ground for large populations of aquatic life, including [dugong](https://www.worldwildlife.org/species/dugong). The seagrass can be seen from space in the shallower areas of the bay, contrasting strongly with the dark brown sand on the surrounding land. The water in Shark Bay is up to twice as salty as the sea, forming one of few marine environments in the world with [hypersaline waters](https://www.sharkbay.org/nature/geology/salinity/) and hosts [stromatolites](https://www.bushheritage.org.au/species/stromatolites), colonies of algae that build mounds and are among the oldest forms of life on earth.',
      // },
      // {
      //   title: 'Shark Bay, Australia (Water Quality Viewer)',
      //   lat: -25.9898,
      //   lng: 113.852,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '4_ULYSSYS-WATER-QUALITY-VIEWER',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-01-10',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'OCEAN',
      //   gain: '1.1',
      //   gamma: '1.2',
      //   description:
      //     'Located 800 km north of Perth in the Indian Ocean, Shark Bay is a unique [UNESCO World Heritage](https://whc.unesco.org/en/about/) site. The bay is renown for having the largest [seagrass](https://ocean.si.edu/ocean-life/plants-algae/seagrass-and-seagrass-beds) meadow in the world (~4.000 square kilometers), forming a feeding ground for large populations of aquatic life, including [dugong](https://www.worldwildlife.org/species/dugong). The seagrass can be seen from space in the shallower areas of the bay, contrasting strongly with the dark brown sand on the surrounding land. The water in Shark Bay is up to twice as salty as the sea, forming one of few marine environments in the world with [hypersaline waters](https://www.sharkbay.org/nature/geology/salinity/) and hosts [stromatolites](https://www.bushheritage.org.au/species/stromatolites), colonies of algae that build mounds and are among the oldest forms of life on earth.',
      // },
      // {
      //   title: 'Barrier Reef, New Caledonia (Enhanced True Color)',
      //   lat: -20.2103,
      //   lng: 164.1529,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE_COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-09-29',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'OCEAN',
      //   gain: '2.0',
      //   gamma: '1.5',
      //   description:
      //     '[Barrier reef of New Caledonia](https://whc.unesco.org/en/list/1115/) is protected as a UNESCO World heritage site, due to its outstanding coral reef biodiversity and lagoon beauty. It is comprised of six marine clusters and is one of the three most extensive reef systems in the world. The ecosystems are intact, with healthy populations of great diversity. They provide habitat to a number of emblematic or threatened marine species such as turtles, whales or dugongs whose population here is the third largest in the world. This varied reef landscape ranges from extensive double barrier systems, offshore reefs and coral islands, to the near-shore reticulate reef formations. This beauty continues below the surface with dramatic displays of coral diversity, massive coral structures, together with arches, caves and major fissures in the reefs.',
      // },
      {
        title: 'Coastal waves, Tyrrhenian Sea',
        lat: 41.4969,
        lng: 12.452,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7e2a0c-YOUR-INSTANCEID-HERE`,
        toTime: '2019-12-22',
        evalscript: '',
        evalscripturl: '',
        themeId: 'OCEAN',
        description:
          'Coastal waves are a daily consequence of the so-called [sea breeze](https://eschooltoday.com/winds/land-breeze-and-sea-breeze.html). During the day, the land gets heated from the sun, getting warmer than the sea. As warmer air is less dense, it rises above the land, lowering the air pressure. The difference in air pressure creates cool winds, blowing from the sea towards the land. Italy attracts many tourists interested in [surfing](https://www.surf-forecast.com/breaks/Circoletto-Rome), especially in winter, when the waves are expected to be the highest. On December 22, 2019, however, the waves were extremely high due to the [storms Elsa and Fabien](https://www.accuweather.com/en/severe-weather/storms-elsa-and-fabien-unleash-damage-from-france-and-spain-to-italy/649871), which caused winds up to 200 kilometers per hour. The storms caused power outages, heavy flooding and a mini tornado, which destroyed 20 homes. The storm caused 9 fatalities and resulted in considerable damage across Portugal, Spain and France.',
      },
    ],
  },

  {
    name: () => t`Snow and Glaciers`,
    id: 'SNOW',
    content: [
      {
        name: 'CDSE Sentinel-1-IW_VV+VH',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ea8206-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Snow (S2L2A)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
        preselected: true,
        layersExclude: ['6_AGRICULTURE'],
      },
      {
        name: 'Snow (S2L1C)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/78cd05-YOUR-INSTANCEID-HERE`,
        layersExclude: ['6_AGRICULTURE'],
      },
    ],
    pins: [
      // {
      //   title: 'Khatanga Gulf, Russia (Agriculture 11,8,2)',
      //   lat: 73.645,
      //   lng: 109.9,
      //   zoom: 8,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '6_AGRICULTURE',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-06-23',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'SNOW',
      //   description:
      //     'The narrow, 220 km wide Khatanga gulf is believed to hold 9.5 billion tons of geological reserves. Despite being one of the least accessible areas in the Russian Arctic, with the nearest 2.500 population town, Khatanga, 350 km away, oil industry development of the area is being considered. [Learn more.](https://bit.ly/2JQT31o)',
      // },
      {
        lat: 64.92239,
        lng: 22.28622,
        zoom: 9,
        title: 'Heavy Ice in the Bothnian Bay (RGB Ratio)',
        toTime: '2024-02-12',
        layerId: '8_RGB-RATIO',
        themeId: 'HIGHLIGHT',
        datasetId: 'S1_CDAS_IW_VVVH',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ea8206-YOUR-INSTANCEID-HERE`,
        description:
          'This winter, the Bothnian Sea froze about a month earlier than usual. This Sentinel-1 image shows the variety of ice patterns. Open water is red, land is yellow to green, ice is yellow when it is very rough, blue or dark red when its surface is flat. Under such conditions, the shipping lanes have to be maintained by a special icebreaker fleet. These images - which are regularly available despite long polar nights and cloudy weather - are crucial for optimizing icebreaking activities and maintaining maritime transport networks in winter.',
      },
      {
        lat: 48.15097,
        lng: 10.78308,
        zoom: 10,
        title: 'Onset of Winter in Southern Germany (True Color)',
        toTime: '2023-12-07T23:59:59.999Z',
        layerId: '1_TRUE_COLOR',
        themeId: 'HIGHLIGHT',
        datasetId: 'S2_L2A_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
        description:
          'On the morning of December 2, 2023, some people in Southern Germany may have felt like they were watching the wrong movie when they woke up to almost half a meter of fresh snow. The weather services reported the highest snow depths for this time of year since recording (e.g. 45 cm for Munich). The trigger for the huge masses of snow was a moisture-rich warm front from south-western Europe, which collided with a cold front from Scandinavia over the northern Alpine foothills. What offered perfect conditions for all winter enthusiasts caused chaos, frustration and considerable obstructions on other fronts. Traffic in the region came to a standstill, airports were not operating, sport events had to be canceled and the subsequent snowmelt a few days later led to flooded fields and roads [[1](https://www.theguardian.com/world/2023/dec/02/snow-chaos-southern-germany-munich-airport-suspends-flights)].',
      },
      {
        title: 'Bear Glacier, Alaska (Highlight Optimized Natural Color)',
        lat: 60.0004,
        lng: -149.7066,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '3_TONEMAPPED-NATURAL-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
        toTime: '2019-10-25',
        evalscript: '',
        evalscripturl: '',
        themeId: 'SNOW',
        description:
          'Bear Glacier, the largest glacier in Kenai Fjords National Park, Alaska, is separated from the ocean by a large [terminal moraine](http://www.antarcticglaciers.org/glacial-geology/glacial-landforms/glacial-depositional-landforms/moraine-types/) forming a [proglacial lake](https://www.swisseduc.ch/glaciers/glossary/proglacial-lake-en.html) which attracts numerous sea kayaking enthusiasts. The 20 km long glacier has two remarkable [medial moraines](https://www.nps.gov/articles/lateralmedialmoraines.htm), formed by joining ice streams. These moraines contrast with the brighter ice and appear clearly in Sentinel-2 images. However, the stunning features of the glacier may not be observable for long: [a recent study](https://www.nps.gov/rlc/oceanalaska/upload/Bear-Glacier-RB_FINAL_12-17-19_508-compliant.pdf) has shown that Bear Glacier has been dramatically retreating (237 m per year) over the two last decades.',
      },
      // {
      //   title: 'Glacier Grey, Chile (Highlight Optimized Natural Color)',
      //   lat: -50.9647,
      //   lng: -73.3243,
      //   zoom: 12,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '3_TONEMAPPED-NATURAL-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-05-08',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'SNOW',
      //   description:
      //     "The stunning [glacier Grey](https://earthobservatory.nasa.gov/images/7802/grey-glacier-chile) located in the Chilean Torres Del Paine National Park is 6 km wide and over 30 meters high at the glacier's front. Its various shades of grey and blue, clearly visible even from space, attract many visitors each year. In 2017 a huge (380 m x 350 m) [iceberg ruptured](https://www.theguardian.com/environment/2017/nov/29/large-iceberg-breaks-off-from-grey-glacier-in-southern-chile) from the glacier with the cause unknown. Such events are very rare, with the last one occurring in the early 1990's. Due to its diverse plants and wildlife, glaciers, rivers, lakes and pampas, the park became [protected as a UNESCO Biosphere reserve](http://www.ecocamp.travel/fr/Patagonia/Torres-del-Paine-National-Park) in 1978.",
      // },
      // {
      //   title: 'Erebus Ice Tongue, Antarctica (Enhanced true color)',
      //   lat: -77.7033,
      //   lng: 166.7433,
      //   zoom: 10,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '3_TONEMAPPED-NATURAL-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-02-13',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'SNOW',
      //   description:
      //     'An ice tongue is a natural phenomenon, which occurs when a valley glacier moves very rapidly out into the sea or a lake. [The Erebus ice tongue glacier](https://earthobservatory.nasa.gov/images/4965/erebus-ice-tongue) in Antarctica comes down from Mt. Erebus and protrudes off the coast of Ross Island, forming an 11 – 12 km long ice tongue—a long and narrow sheet of ice projecting out from the coastline. When the sea ice in McMurdo Sound thaws in the summer, the ice tongue floats on the water without thawing. It also calves off in places forming icebergs. The Erebus Ice Tongue is only about 10 meters high, so its icebergs are small. When the ice around the tongue melts in the summer, waves of sea water constantly batter the edges of the tongue, carving very elaborate structures in the ice, sometimes producing deep caves at the margins. In winter, the sea freezes once more around these new shapes.',
      // },
      {
        title: 'Sermeq Kujalleq Glacier, Greenland (Highlight Optimized Natural Color)',
        lat: 69.164,
        lng: -50.632,
        zoom: 9,
        datasetId: 'S2_L2A_CDAS',
        layerId: '3_TONEMAPPED-NATURAL-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
        toTime: '2019-10-29',
        evalscript: '',
        evalscripturl: '',
        themeId: 'SNOW',
        gain: '1.1',
        description:
          '[Sermeq Kujalleq](https://www.atlasobscura.com/articles/worlds-fastest-glacier-sermeq-kujalleq), also called Jakobshavn glacier, is known as the world’s fastest glacier. It travels an average of 130 feet in 24 hours and calves more than 45 cubic kilometers of icebergs each year into the Ilulissat Icefjord. Its front is an enormous ice wall—stretching 91 meters at its peak, that constantly explodes. Icebergs break off the glacier accompanied by blasts and roars akin to a rocket launch. When they hit the sea below, the calved icebergs can create huge waves that threaten to swallow people, boats, and buildings. The icebergs from Sermeq Kujalleq have crashed so violently that they have even caused earthquakes. Because the glacier is so large, the breaks seem to occur in __slow motion__.',
      },
      // {
      //   title: 'Glaciers of western Greeenland (Tonemapped Natural Color) ',
      //   lat: 72.9559,
      //   lng: -54.5735,
      //   zoom: 10,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '3_TONEMAPPED-NATURAL-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-07-10',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'SNOW',
      //   gain: '1.2',
      //   description:
      //     'On Greenland’s western shore numerous glaciers enter the Baffin Bay. Several of them find their way to the bay via the Upernavik Icefjord which can be seen on the image. The biggest glacier is the Upernavik glacier from which the fjord’s name was derived. Until 1980 the glacier consisted of one main termini but with its retreat since then it has four main calving termini today. [Learn more](https://blogs.agu.org/fromaglaciersperspective/2017/05/30/upernavik/).',
      // },
      {
        title: 'Helheim Glacier, Greeenland (Highlight Optimized Natural Color)',
        lat: 66.3767,
        lng: -38.1474,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '3_TONEMAPPED-NATURAL-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
        toTime: '2019-10-28',
        evalscript: '',
        evalscripturl: '',
        themeId: 'SNOW',
        gain: '1.1',
        description:
          'Located in the southeast of Greenland the Helheim glacier is the fastest flowing glacier on the island’s eastern shore. It has an average width of ~6.5 km and calves into the [Sermilik Fjord]( https://earth.esa.int/web/earth-watching/image-of-the-week/content/-/article/helheim-glacier-greenland). In the last two decades the glacier front experienced rapid changes, first retreating ~6.5 km in the earlier 2000s before then partially recovering and gaining back more than ~3 km. [Learn more](https://www.nasa.gov/feature/goddard/2017/two-decades-of-changes-in-helheim-glacier).',
      },
      {
        title: 'Byrd Glacier, Antarctica (Highlight Optimized Natural Color)',
        lat: -80.56,
        lng: 156.672,
        zoom: 8,
        datasetId: 'S2_L2A_CDAS',
        layerId: '3_TONEMAPPED-NATURAL-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
        toTime: '2019-10-14',
        evalscript: '',
        evalscripturl: '',
        themeId: 'SNOW',
        description:
          '[Byrd Glacier](https://earthobservatory.nasa.gov/images/7544/byrd-glacier-antarctica) is one of the largest fast-flowing glaciers in Antarctica. Ice flows from the East Antarctic plateau into the Ross ice shelf at a rate of ~800 m per year along the centre line of this ~20 km wide and ~100 km long glacier. Distinct longitudinal flow stripes are clearly visible from space where the ice is funnelled between the [Transantarctic Mountains](https://www.britannica.com/place/Transantarctic-Mountains). Similarly to other Antarctic glaciers, Byrd Glacier is [vulnerable to warming temperatures](https://insideclimatenews.org/news/12112019/antarctica-ice-shelf-melt-atmospheric-river-thwaites-glacier-ocean-sea-level-rise) that lead to an acceleration of the ice flow, with disastrous effects on sea-level rise.',
      },
      // {
      //   title: 'Mountains of New Zealand (Snow Classifier)',
      //   lat: -45.1273,
      //   lng: 168.485,
      //   zoom: 10,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '5_SNOW-CLASSIFIER',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-09-19',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'SNOW',
      //   gain: '1.4',
      //   description:
      //     'The mountains around Lake Te Anau (west) and Lake Wakatipu (east) on New Zealand’s South Island are located in the Fiorland National Park. Lake Te Anau is home to the only inland fjords in New Zealand originating from the time when the mountain’s glaciers were still reaching far down the valleys. Today covered with snow in winter these more than 2000 m high peaks are a popular destination for tracking and mountaineering [more](http://www.teanau.net.nz/Mountains). They are also home to an almost extinct bird species called [takahe](http://www.teanau.net.nz/See-a-takahe).',
      // },
      // {
      //   title: 'Mountain Rivers, New Zealand (False Color)',
      //   lat: -43.7677,
      //   lng: 170.319,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '2_FALSE_COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-08-30',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'SNOW',
      //   description:
      //     'The southern Alps in New Zealand are widely covered with snow in winter. The strong red colors mainly in the southeast corner indicated healthy vegetation. The different colors of the lakes’ origin from different mixtures of minerals brought by the streams from the surrounding mountains.',
      // },
      {
        title: 'Frozen Lakes on the Tibetan Plateau',
        lat: 33.3641,
        lng: 90.3936,
        zoom: 10,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
        toTime: '2019-12-06',
        evalscript: '',
        evalscripturl: '',
        themeId: 'SNOW',
        description:
          'These frozen lakes are situated on the border between the Chinese counties Shuanghu and Golmud on the Tibetan Plateau. Often fed by glaciers they are likely to become bigger over the next years due to an increase in melt water before finally shrinking as a glacier that feed them will disappear. With an average elevation above 4.500 meters the plateau provides cold enough temperatures for most of the lakes to be frozen or partially covered with ice for most of the year. [Learn more](https://thediplomat.com/2019/03/the-worlds-third-pole-is-melting/)',
      },
      {
        title: 'Winter Landscape, Canada',
        lat: 55.5313,
        lng: -110.9123,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE_COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
        toTime: '2019-12-13',
        evalscript: '',
        evalscripturl: '',
        themeId: 'SNOW',
        description:
          'A winter landscape of the [Christina Lake Oil Sands Factory](https://www.cenovus.com/operations/oilsands/christina-lake.html). The factory uses specialized technology to drill and pump the oil from 375 meters deep underground. The project is expected to last for more than 30 years and produces 210.000 barrels of oil per day. In winter, the lakes are covered by snow, giving them a surreal white color.',
      },
      // {
      //   title: 'Drifting Ice Plates, Arctic Sea',
      //   lat: 75.1789,
      //   lng: 117.195,
      //   zoom: 10,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE_COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/a55e9e-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-06-29',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'SNOW',
      //   description:
      //     'Melting ice plates in the Arctic Ocean near Russia, forming interesting patterns as a result of being carried by ocean currents.',
      // },
    ],
  },

  {
    name: () => t`Urban`,
    id: 'URBAN',
    content: [
      {
        name: 'Urban (S2L2A)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Urban (S2L1C)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/af9f44-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Urban (S3-SLSTR)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/91d827-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
    ],
    pins: [
      {
        title: 'Marshalling Yard Maschen in Hamburg, Germany',
        lat: 53.4044,
        lng: 10.0524,
        zoom: 14,
        datasetId: 'S2_L2A_CDAS',
        layerId: '5_URBAN-LAND-INFRARED-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2023-02-28',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          'With more than 100 separate siding tracks and an area of 2.8 square km, the freight train classification yard of Maschen is the largest of its kind in Europe. Located South of Hamburg, the station serves as a hub for international freight transport all over Europe. [Learn more](https://en.wikipedia.org/wiki/Maschen_Marshalling_Yard).',
      },
      {
        title: 'Temara, Morocco',
        lat: 33.861,
        lng: -6.9688,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2019-08-15',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          'Few would argue that lions have made a deeper impression on the human imagination than any other animal. The lion species we most associate with the huge royal mane are called Barbary Lions. Barbary Lions are believed to be [extinct in nature](https://endangeredlist.org/animal/barbary-lion/#:~:text=The%20Barbary%20lions%20are%20considered,although%20it%20was%20never%20proven.), with the last lion recorded being shot in 1943. Pictured on our satellite image, however, is a place where they possibly live on. Right in the middle of Temara, a coastal Moroccan city, lies a national park that houses the Rabat Zoo. The enclosure was first built to house the royal Barbary lions, previously kept in the palace. Now a group of lions that exhibits the characteristics of the Barbary lion lives there, believed to be direct descendants that continue the lineage. Learn more [here](https://www.google.com/maps/place/The+Green+Belt/@33.9244461,-6.9215968,13.25z/data=!4m12!1m6!3m5!1s0x0:0x169daf5f0001b466!2sNational+Zoo+Rabat+Morocco!8m2!3d33.955304!4d-6.89435!3m4!1s0xda712ae1b994e15:0xe9a31803dfafc8c0!8m2!3d33.9525448!4d-6.9110012), [here](https://en.wikipedia.org/wiki/Rabat_Zoo), [here](https://blogs.kent.ac.uk/barbarylion/2017/09/30/how-to-win-another-10-years-for-the-moroccan-lions/) and [here](https://www.researchgate.net/publication/266755974_The_North_African_Barbary_lion_and_the_Atlas_Lion_Project).',
      },
      // {
      //   title: 'Baltimore, USA',
      //   lat: 39.2866,
      //   lng: -76.6292,
      //   zoom: 12,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-09-08',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'URBAN',
      //   description:
      //     "With [more than 250](https://livebaltimore.com/neighborhoods/#:~:text=Baltimore%20City%20includes%20more%20than%20250%20diverse%20neighborhoods!) identified districts, [Baltimore](https://www.britannica.com/place/Baltimore) has been dubbed a \"city of neighborhoods\". However, not all are created equal. It's a situation by no means unique to [Baltimore](https://en.wikipedia.org/wiki/Baltimore) - most cities have their divide between those with lower and those with higher income. Baltimore however stands out for the extent of the gap, its relation to [race](https://wp.nyu.edu/economicinequality/2017/03/29/economic-inequality-in-baltimore-md/), as well as the proximity of the two extremes. The gap here is twice as large as in New York, and one of the largest in the country. To represent the [extent of economic inequality](https://wp.nyu.edu/economicinequality/2017/03/29/economic-inequality-in-baltimore-md/), the typical Baltimore resident in the bottom fifth of earners made $13,588 in 2013, whereas those in top 5 percent made an average of $166,924 that year. In fact, 14 Baltimore neighborhoods have [lower life expectancies than North Korea](https://www.washingtonpost.com/news/wonk/wp/2015/04/30/baltimores-poorest-residents-die-20-years-earlier-than-its-richest/). One of the reasons for this is Baltimore's abnormaly high crime rate. The city has by far the highest robbery rate in America and there's a murder almost every day. The main perpetrators of crime are drug gangs. On top of the low standard of living, the poor Baltimore youth has a low chance of escaping this environment and high incidence of substance abuse, PTSD and depression.",
      // },
      // {
      //   title: 'London, England',
      //   lat: 51.4919,
      //   lng: -0.0714,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-29',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'URBAN',
      //   description:
      //     'The "snake" meandering through London, one of the oldest great cities in the world, is the River Thames. It is so important to the city that it is theorized even its name originates from it. This wonder of nature is now under human control. In the 19th century dumping of raw sewage into the Thames and gas manufactories built alongside the river deteriorated it to a point where the discharge of methane gas in the depths of the river caused the water to bubble, and the toxins wore away at boats\' propellers. Chlorine-soaked drapes were hung in the windows of Parliament in an attempt to stave off the smell of the river, but to no avail and four serious cholera outbreaks killed tens of thousands of people between 1832 and 1865. The river was declared biologically dead. Now in 2020, there are 45 locks on the river, each with one or more adjacent barriers. These lock and barrier combinations are used for controlling the flow of water down the river, most notably when there is a risk of flooding. The river recovered to a point where it\'s bustling with salmon, herons, cormorants, moorhen and even seals. The city also had a huge problem with [air pollution](https://www.britannica.com/place/London/Climate#ref92695). Heavy industry factories and domestic chimneys all burned coal at the beginning of 20th century, reducing winter sunshine hours by 30%. The issue was resolved by banning the burning of coal with the Clean Air Acts. Learn more [here](http://www.bbc.com/earth/story/20151111-how-the-river-thames-was-brought-back-from-the-dead), [here](https://en.wikipedia.org/wiki/River_Thames#cite_note-55) and [here](https://riverfoundation.org.au/our-programs/riverprize/international-riverprize/).',
      // },
      {
        title: 'Beijing, China',
        lat: 39.9205,
        lng: 116.3974,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-23',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          '[Beijing](https://www.britannica.com/place/Beijing/) is one of the oldest inhabited areas in the world; fossils indicate that the [Peking Man](https://www.chinahighlights.com/beijing/beijing-facts.htm) (Homo erectus) lived here from 770,000 to 230,000 years before present. It has been the capital of China for hundreds of years and changed its name 16 times in the process. Its rich history makes it impossible to understand China without the knowledge of this city. To protect itself from invasion, Chinese built the longest wall in the world, almost 21,200 km long and 5 – 8 meters high, called the [Great Wall](https://www.chinahighlights.com/greatwall/). It spans over the mighty Yan mountain range (seen on the left side of the pin), which separates the North China Plain on the south from the Mongolian Plain on the north. The rumor that the wall is visible from space is a widely believed myth, called into question in October 2003, after the first Chinese astronaut returned from his  journey into Space, and stated that he had not been able to see the Great Wall of China. The European Space Agency then claimed that the Great Wall is visible to the naked eye in an orbit between 160 and 320 km and even published a picture of a part of the “Great Wall” photographed from Space. In this picture the wall looked like a route full of bends that resembled river meanders. One week later, when everything seemed perfectly clear and the myth had been finally reborn, another message from ESA acknowledged that the Great Wall in the picture was actually a river! Looking at what we learned about the human visual system and its limits, it is impossible for humans to see the wall from space with our own eyes. Learn more [here](https://en.wikipedia.org/wiki/Beijing), [here](https://web.archive.org/web/20080910214156/http://www.journalofoptometry.org/Archive/vol1/pdf/02%20Vol1-n1%20Letter%20to%20the%20Editor.pdf).',
      },
      {
        title: 'Amsterdam, Netherlands',
        lat: 52.3486,
        lng: 4.8141,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2019-12-27',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          "[Amsterdam's](https://www.britannica.com/place/Amsterdam) name derives from [Amstelredamme](https://en.wikipedia.org/wiki/Amsterdam#:~:text=Found%20within%20the%20province%20of,dam%20in%20the%20river%20Amstel.) and indicative of the city's origin around a dam in the river Amstel. Originating as a small fishing village in the late 12th century, Amsterdam became one of the most important ports in the world during the Dutch Golden Age in the 17th century, and became the leading centre for finance and trade. Even today the Port of Amsterdam is the fourth largest port in Europe and still growing. Large ports are usually ecologically disastrous. Amsterdam however, aims to change this by making every effort to keep physical and environmental impact to a minimum and be at the top of Europe's [sustainable ports](https://www.portofamsterdam.com/en/discover/sustainable-port) by 2030. A special focus is currently put on plastics recycling. For example, the Plastic Whale organization builds small boats almost entirely out of old plastics, then uses them to gather plastic out of the Amsterdam waterway. Additionally, Amsterdam is [famous for](https://viatravelers.com/amsterdam-is-famous-for/) its diversity, the Van Gogh art museum, the Anne Frank House and tulips.",
      },
      // {
      //   title: 'Taizhou, China',
      //   lat: 32.4481,
      //   lng: 119.9824,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-12-30',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'URBAN',
      //   description:
      //     'Taizhou is the cradle of the Chinese [private economy](https://papers.ssrn.com/sol3/papers.cfm?abstract_id=1138052). Billions of dollars are invested in infrastructure, such as advanced manufacturing, urban water conservancy, transportation, and the G5 network. Investments in infrastructure were as high as 14 billion dollars in October 2020, followed by a 17 billion dollar investment the previous month. However, Tahzhou economy could face unforeseen difficulties. The city has a long coastline, dotted with numerous islands, and it is built on the Yangtze river delta, making it exceptionally exposed to flooding, increasingly so due to global warming. [Simulations](https://www.researchgate.net/publication/328746437_Character_of_extreme_high_tide_level_variations_response_to_coastline_deformation_in_Taizhou_Bay) show, that extreme floods, storms and high tide level fluctuations will increase in the river and estuarine section. This could turn out to make the rapid Chinese urban expansion a lot more costly than expected. Learn more [here](https://www.researchgate.net/publication/283426813_The_spatial_exposure_of_the_Chinese_infrastructure_system_to_flooding_and_drought_hazards) and [here](https://www.zj.gov.cn/art/2012/5/26/art_1568658_26245200.html).',
      // },
      {
        title: 'Moscow, Russia',
        lat: 55.7358,
        lng: 37.6048,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2019-08-30',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          "[Moscow](https://www.britannica.com/place/Moscow) is named for the river that runs through it, the Moskva. Though Moscow is the capital city of Russia today, it wasn't always so. From 1712 to 1918, St. Petersburg acted as the capital of Russia. Moscow is regularly named one of the most expensive cities in the world. Although you'll find a historic center here, complete with palaces, churches, and monuments, Moscow is a fully modern city with skyscrapers, a network of public transportation, and traffic. The Kremlin, the seat of the government, is the world’s largest medieval fortress. The Moscow Metro dates from the early 1930s and is one of the most-used subway systems in the world. Over 180 Moscow Metro stations, some decorated with artwork and expensive materials, connect the 12 lines that shuttle passengers throughout this huge city. The trains run more regularly than in any other metro in the world, with the interval between trains being [just 1.5 minutes](https://www.traveltalktours.com/fascinating-facts-moscow/) at peak times. More than 40 percent of the city's territory consists of parks, gardens and forests. For each Muscovite there is about 16 square meters of greenery. For comparison, for a New Yorker there is about 8.6 and for a Londoner and Parisian 7.5 square meters of greenery. The city has more than 700 public gardens and boulevards and almost 50 parks and forests. The green areas are clearly seen covering large portions of the city, when looking at the NDVI or a Green City visualization. Learn more [here](https://bridgetomoscow.com/curious-fact-moscow-parks), [here](https://www.planete-energies.com/en/medias/close/moscow-city-undergoing-transformation) and [here](https://www.tripsavvy.com/moscow-facts-1501850).",
      },
      {
        title: 'Toronto, Canada',
        lat: 43.6711,
        lng: -79.5568,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2019-10-09',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          '[Toronto](https://www.britannica.com/place/Toronto), the most populous city in Canada, is a multicultural city, and the country’s financial and commercial centre. It has a well developed education system, with [50 % of the workforce having a university degree](https://www.narcity.com/ca/on/toronto/lifestyle/50-fun-facts-every-true-torontonian-will-definitely-love). One of the most distinctive features of the geography of Toronto is the Toronto [ravine system](https://en.wikipedia.org/wiki/Toronto_ravine_system#cite_note-1). It is a network of deep ravines that form a large urban forest that runs throughout much of the city. For the most part designated as parkland, the ravines are largely undeveloped. Toronto\'s slogan "_The city within a park_" partially stems from the extensive ravine green space with some 10 million trees and 1,500 parks, covering 18 % of the city area. The terrain that the city of Toronto sits on was formed by glaciers after the end of the last ice age about 12,000 years ago. Over the millennia, small rivers and creeks eroded the soil, cutting deep ravines through what is today the Toronto region. Despite the dense population of metropolitan Toronto, many of the ravines have been left close to their natural state, due to the danger of flooding. Every few decades, a massive flooding event occurs. The most recent event was in 1954, when Hurricane Hazel, dropping over 12 cm of rain onto the city in a single day. In the post-war years, several developments had begun to encroach on the ravine lands, and these neighbourhoods were badly damaged by the storm. The whole blocks were washed away and 81 people killed. This disaster led to an almost complete ban on development in the ravines, and a new Region Conservation Authority was created to maintain them as open spaces.',
      },
      {
        title: 'Melbourne, Australia',
        lat: -37.8372,
        lng: 144.8417,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-01',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          "Victoria's vibrant capital – [Melbourne](https://www.britannica.com/place/Melbourne) – is a wonderful city that is often ranked amongst the world's most liveable. It is home to about 136,000 people and is the core of an extensive metropolitan area with a population of more than 1,000,000, some 38% born overseas. In 1856, Melbourne workers successfully campaigned for the world's first 8-hour work day. All the rest of us are still thankful today! Though Melbourne’s flat site has led to the regular development of a rectangular pattern of streets, the city has many beautiful parks and diverse architecture. It is known for its unpredictable weather, as it's often possible to experience four seasons in one day. Melbourne’s most important industries, in terms of number of employees, are metal processing, including the manufacture of transportation equipment, and engineering. Melbourne is also one of Australia’s leaders in the manufacture of computers and is developing as a centre for biomedicine and biotechnology. Melbourne has a lively sport culture, with hundreds of sports fields, tennis courts, swimming pools, and golf courses for active sports participants. Learn more [here](https://www.experienceoz.com.au/en/melbourne-facts).",
      },
      {
        title: 'Tabriz, Iran',
        lat: 38.06249,
        lng: 46.24283,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2019-12-20',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          '[Tabriz](https://www.britannica.com/place/Tabriz), the fourth largest city of Iran and capital of the East Azerbaijan province, counts almost 1,400,000 inhabitants. The name Tabriz is said to derive from tap-rīz (“causing heat to flow”), from the many thermal springs in the area. Iran is prone to earthquakes as it sits on [major fault lines](https://www.rferl.org/a/earthquake-hits-northwest-iran-tabriz/30259208.html) and experiences an average of one earthquake a day. Consequently, Tabriz, which lies about 1,367 metres above sea level, is prone to frequent and deadly earthquakes, which cause serious damages and casualties. The city has been occupied several times throughout history. The modernization of Tabriz has quickened since World War II, with streets widened, buildings erected, and public gardens laid out with fountains and pools. The city’s newer buildings include a railway station and Tabriz University. The city is commercially important, with the principal products including carpets, textiles, cement, agricultural machinery, motorcycles, and household appliances. The city is linked by rail with Tehran and with areas to the north, and it has an airport.',
      },
      {
        title: 'Venice, Italy',
        lat: 45.4585,
        lng: 12.28701,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2019-12-10',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          "[Venice](https://www.britannica.com/place/Venice/Lagoon-and-tides), a so called island city with a population of [637,245](https://worldpopulationreview.com/world-cities/venice-population/), remains a major Italian port and is one of the world’s oldest tourist and cultural centres. The lagoon's mud banks, shallows, and channels with its marine and bird life provide next to salt pans a source of income for the Venetians. The lagoon has served as protection and as a natural sewerage system. The deepening of channels in the 20th century, the overextraction of fresh water from mainland aquifers, the rising of the Adriatic Sea, and the geologic sinking of the Po River basin have lowered the land level, creating a serious flooding problem. On a regular basis, when high tides combine with winds from the south and east, the waters of the lagoon rise and flood the city, making Venice to be known as the [City built on water](https://www.livitaly.com/how-was-venice-built/).",
      },
      // {
      //   title: 'Washington, USA',
      //   lat: 38.90719,
      //   lng: -77.03687,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-21',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'URBAN',
      //   description:
      //     '[Washington D.C.](https://www.britannica.com/place/Washington-DC) is the capital city of the United States of America. It is coextensive with the District of Columbia (the city is often referred to as simply D.C.) and is located on the northern shore of the Potomac River. In 1790 the U.S. Congress established a 260-square-km territory to serve as the permanent seat of the federal government. The territory was later named the District of Columbia, within which the city of Washington was built.  After the American Civil War (1861 – 65), the city of Washington expanded beyond its originally planned boundaries and became legally indistinguishable from the District of Columbia. Washington, D.C., remains a territory, not a state, and since 1974 it has been governed by a locally elected mayor and city council over which the Congress retains the power of veto. The Washington metropolitan area covers nearly 10,360 square km and encompasses 10 counties. As a result of Washington’s abundance of federal civil service jobs and its status as a major tourist destination, the city’s economy is overwhelmingly dominated by the service sector. Research and development work is another key component of the local economy with most businesses linked to the federal government. Though it’s a bustling city, Washington, D.C. is a home to many [animals](https://kids.nationalgeographic.com/explore/states/washington-dc/), such as the Virginia opossums, groundhogs, brown bats or flying squirrels. Several bird species live here as well, most notably a bald eagle, cardinals, great blue herons, and the official bird, the wood thrush.',
      // },
      {
        title: 'Lagos, Nigeria',
        lat: 6.6213,
        lng: 3.2932,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-01',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          '[Lagos](https://www.britannica.com/place/Lagos-Nigeria), a Nigerian city and a chief port, is dominated by a system of islands, sandbars, and lagoons. The highest elevation in Lagos is only 22 feet above sea level. The port of Lagos serves as the principal outlet for Nigeria’s exports. The Lagos metropolitan area is a major educational and cultural centre. The main business district occupies Lagos Island’s southwestern shore and contains an increasing number of multistory buildings. This is the heart of the city, the centre of commerce, finance, administration, and education. The principal manufacturing industries in Lagos include the production of electronics equipment, automobile assembly, food and beverage processing, metalworks, and the production of paints and soap. The original settlement on the northwestern tip of Lagos Island is now a slum area characterized by narrow streets, poor housing, and overcrowding.',
      },
      // {
      //   title: 'Kinshasa, DR Kongo',
      //   lat: -4.273,
      //   lng: 15.3352,
      //   zoom: 12,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-05-13',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'URBAN',
      //   description:
      //     '[Kinshasa](https://www.britannica.com/place/Kinshasa/Cultural-life), formerly known as Léopoldville, is the largest city and the capital of the Democratic Republic of the Congo. The city’s inhabitants are popularly known as Kinois. Kinshasa is the most important consumer centre of the republic and the core of its industrial and commercial activity. The city serves as the headquarters of major public corporations and of privately owned industrial and commercial companies. Among Kinshasa’s main industries are food processing and those producing consumer goods, generally for domestic markets. The rapid expansion of Kinshasa’s population has created serious problems in supplying the city with food; there is a constant threat of shortages, posing an implicit political problem. The poor forage at a considerable distance for firewood and keep gardens where they can find good soil. The demands of this vast urban population have caused extensive erosion in the surrounding countryside, as the soil is exhausted from overcultivation and trees cut for charcoal have not been replanted. The administration is unable to provide adequate services such as running water, electricity, and sanitation throughout the city. Medical facilities, like other city services, are overwhelmed by population growth; the same problem is present for the primary and secondary education system.',
      // },
      {
        title: 'Mogadishu, Somalia',
        lat: 2.05649,
        lng: 45.28324,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-20',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          'Mogadishu, the capital city of Somalia, is located in the horn of Africa and bordering the Red Sea. The major religion is Sunni Muslim and the official language is Somali, although Arabic, Italian, and English are all spoken there. Mogadishu’s population was estimated [2.5 million](https://worldpopulationreview.com/countries/cities/somalia) people in 2020. Founded by the Arabs in the 10th century, Mogadishu became the capital and chief port of Somalia. Initially after their arrival, families of Arab and Persian descent ruled Somalia and fueled the widespread conversion to Islam. By the 13th century, Mogadishu became prosperous by trading gold, livestock, slaves, leather, and ivory. Despite the growing affluence in the city of Mogadishu, the country as a whole suffered from political instability under the dictatorship of President Mohamed Siad Barre who ruled the nation from 1969 to 1991. The unstable political environment worsened in 1992 when an extreme famine hit Somalia. The United Nations intervened to ensure the equal distribution of aid and prevent the new government from abusing its power. The mission was unsuccessful and the UN left the port city in 2002 after one of its officials was kidnapped. By 2008 officials estimated that nearly half of the city’s residents, over one million people, had fled to the countryside.  Since 2008 nearly 3,000 African Union peacekeeping troops have patrolled the city to try to maintain order and provide medical aid. Although Mogadishu was once a powerful and commercially important port city, more than two decades of violence and government instability have caused what many experts fear may be irreparable damage to its inhabitants, its economy, and its infrastructure. Learn more [here](https://www.britannica.com/place/Somalia/Transportation#ref37733) and [here.](https://www.blackpast.org/global-african-history/mogadishu-somalia-ca-950/)',
      },
      {
        title: 'Khayelitsha Slums, Cape Town',
        lat: -34.02357,
        lng: 18.61032,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-21',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          'The [United Nations](https://mirror.unhabitat.org/documents/media_centre/sowcr2006/SOWCR%205.pdf) defines slums as urban areas lacking clean water, sanitation facilities, adequate living space, durable houses and/or housing security. [Khayelitsha slums](https://borgenproject.org/life-inside-worlds-largest-slums/#:~:text=Though%20Khayelitsha%20was%20originally%20an,under%20the%20age%20of%2019.) are one of the [largest slums in the world](https://www.habitatforhumanity.org.uk/blog/2017/12/the-worlds-largest-slums-dharavi-kibera-khayelitsha-neza/), with a population of 400,000 to 1,2 million people. It was set up in the 1980s as a ghetto for workers who migrated to [Cape Town](https://www.theguardian.com/cities/2014/apr/30/cape-town-apartheid-ended-still-paradise-few-south-africa) in search of jobs during the apartheid era, though it grew rapidly after the oppressive system was abolished in 1994. It is a place of extreme poverty. The unemployment rate for individuals living in Khayelitsha is 73 percent with 70 percent of its individuals living in shacks made of timber and sheet metal. The severe poverty combined with a lack of community infrastructure has led the community to vast crime rates, gangs, violence and drug use. There is no proper sewerage in place, so many people do not have toilets, contributing to severe sanitation problems. Lack of clean water and food is another hardship. An estimated one in three people has to walk 200 meters or more to access clean water with around 65 percent of residents with [no electricity or running water](https://news.yahoo.com/no-space-water-cape-town-slum-little-face-152054693.html?guccounter=1&guce_referrer=aHR0cHM6Ly93d3cuZ29vZ2xlLmNvbS8&guce_referrer_sig=AQAAAHXMUsFRzTNsvJhdNbzrnCxf_iMYLN7rtsjTgNfcVvzxksgXBgxnfNI28HyKSFfZ_6o9SGgdOkV5jjnRTn3BfK-7qCm0kVtO5crcX_wIktTpuGay596Mr2PVH4Hncm76Mt2OMiLzDTTpInknPkbnzrY2_GTr_Q1tgCM_Yso0XPiu). A limited food supply is sold between shacks, being constantly exposed to the sun. Khayelitsha has a high population density and a low amount of resources to support the growing population, leading to overcrowding. Several NGOs are trying their best to alleviate various hardships. They believe that with the combined efforts of determined people and organizations, one of the world’s largest and fastest growing slums can finally improve its situation.',
      },
      {
        title: 'Tokyo, Japan',
        lat: 35.6198,
        lng: 139.7396,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-13',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          '[Tokyo](https://www.britannica.com/place/Tokyo), the capital city of Japan, is considered to be the [largest city in the world](https://worldpopulationreview.com/world-cities), with a total of more than 38 million residents. The site of Tokyo has been inhabited since ancient times; the small fishing village of Edo existed there for centuries. The city is built on low, alluvial plains and adjacent upland hills, near the boundary of three plates, making it an extremely active region for [earthquakes](https://www.ft.com/content/3efc4d-YOUR-INSTANCEID-HERE). The last strong seismic tremor to hit Tokyo, the 1923 Great Kanto earthquake, killed 143,000 people and destroyed 695,000 homes and it is estimated that similarly strong earthquake could happen again in the following years. That is why Tokyo skyscrapers are built using elastic steel and shock absorbers, making them able to move and sway, instead of collapse, when the ground shakes. Early summer and early autumn are rainy seasons; two or three typhoons usually occur during September and October. Many domestic and international financial institutions and other businesses are headquartered in central Tokyo. The city is an important wholesale centre, where goods from all parts of the country and the world are distributed. Light and labour-intensive industries predominate in the city, notably printing and publishing and the manufacture of electronic equipment. Tokyo is Japan’s major cultural centre, with several art and science museums. Tokyo station is the central railroad terminal for all of Japan, including the internationally famous high-speed bullet trains from western Japan. The city has numerous outlying islands, which extend as far as 1,850 km from central Tokyo and was considered the highest cost-of-living city in the world for 14 years until 2006. Learn [more](https://en.wikipedia.org/wiki/Tokyo#Economy).',
      },
      {
        title: 'Altai, Mongolia',
        lat: 46.3711,
        lng: 96.24478,
        zoom: 14,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2019-11-01',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          "With a population of about 15,800 Altai is one of the smallest provincial capitals in one of the least densely populated provinces, Govi-Altai. Govi-Altai is situated in the western part of Mongolia and is the countries second largest province (aimag). The majestic peaks of the Mongol Altai mountains stretch from North to South through its territory. The province was named after the Gobi Desert and the Mongol Altai Nuruu range, which virtually bisects the province to create a stark, rocky landscape. Most of the population live in the north-east part, where melting snow from the Khangai Nuur feeds small rivers, creating vital water supplies. Gobi-Altai is one of the least suitable areas for raising livestock, and therefore one of the most hostile to human habitation. The average height is 1940 m high above sea level. The climate is capricious with winter temperatures as low as -30°C and summer temperatures up to 34°C. Despite the harsh conditions, the province is home to rare large mammals, such as Ibex, snow leopards, the Govi Bear, wild Bactrian camel, Argali sheep, black-tailed gazelle, and other wild cats. The province's territory contains many national parks, strictly protected areas, nature reserves and national monuments, protecting several animal species and providing a home to rare wildlife sanctuary. Learn more [here](https://www.toursmongolia.com/provinces/gobi-altai), [here](https://mongolia-guide.com/destination/gobi-altai) and [here](https://en.wikivoyage.org/wiki/Altai_(Mongolia)).",
      },
      {
        title: 'Nuuk, Greenland',
        lat: 64.17989,
        lng: -51.67488,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2019-10-21',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          "Located only 150 miles south of the Arctic Circle, at the mouth of a group of fjords, Nuuk is the capital, main port and the largest city of Greenland. It contains almost a third of Greenland's population, counting 18,326 people. Winters in the city are freezing, with the average January [temperature](https://www.eldoradoweather.com/climate/greenland/Nuuk.html) around -4 °C and getting as low as -10 °C. Even summer is relatively cold, with the hottest August temperatures not more than 10°C. Nuuk is the seat of government and is the country's largest cultural and economic centre, containing the Supreme court, foreign consulates, a university, vocational training schools, a hospital, and radio and television stations. Important economic activities include government administrative work, education, health care, and other services, as well as hunting, fishing, fish and shrimp processing, and shipbuilding and repair. The city attracts [tourists](https://www.tripadvisor.com/Tourism-g295112-Nuuk_Sermersooq_Municipality-Vacations.html) as it's the perfect starting point for a whale-watching trip, a dog-sled ride, or glacier exploration. Daily flights bring visitors to a land that has been inhabited for over 4,000 years. The National Museum and Archives exhibits collections of rare Norse and Inuit archaeological artifacts, while the Katuaq Cultural Centre provides a showcase for contemporary Greenlandic art and music. Learn more [here](https://en.wikipedia.org/wiki/Nuuk#Tourism) and [here](https://www.britannica.com/place/Nuuk).",
      },
      {
        title: 'Ptuj, Slovenia',
        lat: 46.41854,
        lng: 15.86786,
        zoom: 14,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-08',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          'Ptuj is the oldest town in Slovenia, dating back to the Stone Age. Due to its strategic location along a prehistoric trade route between the Baltic Sea and the Adriatic, it became an important center and legion-camp of the Ancient Romans. This is also how it got its name - the romans named it Poetovium. The town is dominated by the [castle](https://www.culture.si/en/Ptuj_Castle), standing proudly on the hill above Ptuj. Its strategic position at the bank of Drava river allowed the castle hill to be inhabited since the early days of Ptuj and Ptuj kept an important role over centuries. The current look of the building dates back to the 18th century and is home to a museum that hosts the biggest collection of music instruments in the whole country. Ptuj is the center place of a carnival in spring, an ancient rite of spring and fertility, called Kurentovanje. [Kurent](http://www.kurentovanje.net/en/the-kurent/) is a figure dressed in sheep skin wearing a mask, a long red tongue, cow bells, and multi-colored ribbons on the head. Organized in groups, Kurents go through towns, from house to house, making noise with bells to symbolically scare off evil spirits and the winter. Kurent has been recognized by [UNESCO](https://www.slovenia.info/en/places-to-go/regions/thermal-pannonian-slovenia/ptuj) for its unique cultural heritage. Each year, more than [100,000](https://govorise.metropolitan.si/dogodki/pustovanja-2019-po-sloveniji-od-povorke-v-ptuju-do-priljubljenega-cerknega/) people gather for the largest carnival in the country. Learn more [here](https://www.mywanderlust.pl/visit-ptuj-slovenia/) and [here](https://en.wikipedia.org/wiki/Ptuj).',
      },
      // {
      //   title: 'Seoul, South Korea',
      //   lat: 37.5307,
      //   lng: 126.8392,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-03',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'URBAN',
      //   description:
      //     '[Seoul](https://www.britannica.com/place/Seoul), the capital of South Korea, is the cultural, economic, and political centre of the country. The area of the city has been inhabited by humans for thousands of years. The site was originally used for military purposes, with the remains of the fortifications now a popular attraction. The service sector employs the largest proportion of the city’s workforce, with information technology and electronics industries highly developed. One of the biggest challenges of the city is overpopulation. With more than 10 million people living within 234 square miles. Seoul is one of the most populous cities in the world and one of the [most connected](https://ourworld.unu.edu/en/is-seoul-the-next-great-sharing-city). It has a highly-developed tech infrastructure, widespread public wifi, and 60 percent of South Koreans own a smartphone. To battle urban sprawl and overpopulation issues, Seoul built many residential buildings, an extensive subway system and set up a greenbelt around a large part of the city’s perimeter, which prohibits further extension of the built-up area. As a result, urban sprawl has extended to places outside the greenbelt, creating new residential areas in suburbs and satellite cities.',
      // },
      {
        title: 'Bagdhad, Iraq',
        lat: 33.3203,
        lng: 44.3563,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-14',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          '[Baghdad](https://www.britannica.com/place/Baghdad/History), the capital of the Iraq, is situated in the heart of the ancient Mesopotamia and holds most of Iraq’s manufacturing, finance, and commerce. The vast majority of the population, counting more than 7,5 million people, is Muslim and Arab. The government is the city’s principal employer, with hundreds of thousands of citizens working in the civil service, in government-run educational institutions, and in government-owned industrial and commercial enterprises. Bagdhad has long been an active cultural centre for the Arab world, producing prominent sculptors, painters, poets, and writers. Between the 8th and 9th centuries, it flourished into an [unrivaled intellectual center](https://en.wikipedia.org/wiki/Baghdad) of science, medicine, philosophy, and education and had the largest selection of books in the world. It was likely the largest city in the world containing over one million inhabitants at its peak. It began to decline in the "Iranian Intermezzo" of the 9th to 11th centuries, and was destroyed in the Mongolian invasion in 1258. Baghdad regained prominence only when it became the capital of Iraq in 1920; over the next half century, the city took on all the characteristics of a modern metropolis. The city was heavily damaged by aerial bombardment during the Persian Gulf War and again by air and ground operations during the Iraq War. During the interwar period the city’s services and infrastructure deteriorated badly because of inattention and economic sanctions. In recent years, it found itself the victim of several attacks, especially from al-Qaeda and its successor, the Islamic State.',
      },
      // {
      //   title: 'Tel Aviv, Israel',
      //   lat: 32.05472,
      //   lng: 34.84726,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
      //   toTime: '2020-01-26',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'URBAN',
      //   description:
      //     '[Tel Aviv](https://www.britannica.com/place/Tel-Aviv-Yafo/History) is a major city and the economic centre of Israel. The city was founded in 1909 as a Jewish garden suburb of the ancient port of Jaffa, with which it was later joined. By the beginning of the 21st century, the modern city of Tel Aviv had developed into a major economic and cultural centre. Tel Aviv forms the core of Israel’s largest metropolitan area, representing more than two-fifths of Israel’s population. Tel Aviv is depicted as the city “that never stops”, a thriving, vibrant, modern, dynamic, and multicultural city, one generally characterized as tolerant, secular, and liberal, while also being a materialistic and a hedonistic city of the present. Jews represent the vast majority of Tel Aviv’s population. Tel Aviv forms the core of Israel’s postindustrial, globally oriented economy with almost one-sixth of all jobs in Israel located in the city. Nearly all banks and insurance companies operating in the country are headquartered in the city, and Israel’s only stock exchange is located there as well. As Israel’s most prominent centre of culture and entertainment, Tel Aviv is home to most of the country’s theatres and a New Israeli Opera. More than one-third of all performances and exhibitions in Israel are held in Tel Aviv, and the city hosts three of Israel’s eight largest museums.',
      // },
      {
        title: 'Giza, Egypt',
        lat: 29.97271,
        lng: 31.11792,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2019-12-30',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          'Giza, located within the [Greater Cairo metropolitan area](http://www.newgeography.com/content/002901-the-evolving-urban-form-cairo), is the third-largest city in Egypt with 9 million inhabitants. The city is famous for its archaeological sites, in particular the [Great Sphinx](https://www.britannica.com/topic/Great-Sphinx) and the [Giza Pyramid Complex](https://www.nationalgeographic.com/history/archaeology/giza-pyramids/), which includes the Great Pyramid, the only of the [Seven Wonders of the Ancient World](https://www.ancient.eu/The_Seven_Wonders/) still standing. The Great Pyramids are easily identifiable in satellite images thanks to their shadows cast to the North West contrasting with the brightly illuminated South sides. The distinct delineation between the arid [Sahara desert](https://www.livescience.com/23140-sahara-desert.html) to the West and the city of Cairo, with its green parks and golf courses, to the East is striking. Today, Giza is a rapidly growing region of Cairo, and the soaring population is leading to new construction of housing and roads encroaching on the desert hills.',
      },
      {
        title: 'Cadiz, Spain',
        lat: 36.5204,
        lng: -6.27903,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-27',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          "Cadiz is a beautiful Spanish city with colorful architecture and plazas. It stands on a small, 12.10 square km big peninsula stretching out into a bay, and is almost entirely surrounded by the sea. Consequently, there is a shortage of land to be developed. The older quarters of Cadiz are full of buildings that, because of their age and historical significance, are not eligible for urban renewal. This is why in recent years, the city's population has steadily declined; between 1995 and 2006, it lost more than 14,000 residents, a decrease of 9 %. In the early 19th century it became the bastion of Spain's anti-monarchist, liberal movement, as a result of which the country's first Constitution was declared here in 1812. The industrial development is rather limited, but important naval and various other factories exist on the mainland, and there are tuna fisheries off the coast. The city is primarily a commercial port, exporting wine, salt, olives, figs, cork, and salted fish and importing coal, iron and machinery, timber, cereals, coffee, and other food. Learn more [here](https://www.britannica.com/place/Cadiz-Spain), [here](https://www.andalucia.com/cities/cadiz.htm) and [here](https://en.wikipedia.org/wiki/C%C3%A1diz#:~:text=The%20city%20can%20boast%20of,across%20the%20Bay%20of%20C%C3%A1diz.).",
      },
      // {
      //   title: 'Rio de Janeiro, Brazil',
      //   lat: -22.90804,
      //   lng: -43.20425,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-09-16',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'URBAN',
      //   description:
      //     '[Rio de Janeiro](https://www.britannica.com/place/Rio-de-Janeiro-Brazil) is widely recognized as one of the world’s most beautiful and interesting urban centres. Although Rio de Janeiro continues to be the preeminent icon of Brazil in the eyes of many in the world, in reality its location, architecture, inhabitants, and lifestyle make it highly unique when compared with other Brazilian cities. Rio de Janeiro is well known for the beauty of its beaches and of its peaks, ridges, and hills - all partly covered by tropical forests. Perhaps at no time is the city’s festive reputation better displayed than during the annual pre-Lenten Carnival, which enlivens the city night and day with music, singing, parties, balls, and street parades of brilliantly costumed dancers performing to samba rhythms.  Rio’s inhabitants (called Cariocas, after the Tupi Indian word meaning “white man’s home”) represent a microcosm of Brazil’s ethnic diversity and include people of European, African, and mixed ancestry. The city is also an important economic centre, with activities ranging from industry and national and international trade to administration, banking, education, culture, and research. It is one of the premier tourist destinations in the world. The city’s vibrant culture and many museums, historical sites, and physical features - especially the beaches - attract large crowds of visitors, as do events and festivals such as the annual Carnival and New Year’s Eve celebrations.',
      // },
      {
        title: 'Honolulu, Hawaii',
        lat: 21.32096,
        lng: -157.85088,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-24',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          'Honolulu, meaning "sheltered harbor" in Hawaiian, is the most remote major city in the world, with the closest location on the mainland United States being 3,787 km away. As Hawaii is a chain of volcanic islands, with Honolulu located on the island Oahu, volcanic features are prominent in the city, with the volcanic field of the [Honolulu Volcanics](https://en.wikipedia.org/wiki/Honolulu_Volcanics) partially located inside the city. These volcanoes formed through explosive eruptions and gave rise to cinder cones, lava flows, tuff cones and volcanic islands. Among these are well known landmarks, such as the Diamond Head, the Koko Head or the Punchbowl Crater. Punchbowl, a 600-metre wide crater 2 km inland, contains the National Memorial Cemetery of the Pacific with some 24,000 graves of World War II, the Korean War, and the Vietnam War. The city acts as a natural gateway to the islands\' large tourism industry, which brings millions of visitors and contributes $10 billion annually to the local economy. Other important aspects of the city\'s economy include military defense, research and development, and manufacturing. Learn more [here](https://en.wikipedia.org/wiki/Honolulu) and [here](https://www.britannica.com/place/Honolulu).',
      },
      {
        title: 'Delhi, India',
        lat: 28.68627,
        lng: 77.22178,
        zoom: 13,
        datasetId: 'S2_L2A_CDAS',
        layerId: '1_TRUE-COLOR',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/4ec90b-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-25',
        evalscript: '',
        evalscripturl: '',
        themeId: 'URBAN',
        description:
          '[Delhi](https://www.britannica.com/place/Delhi), the capital city of India, actually consists of two components: the historic Old Delhi in the north, and New Delhi in the south, which became the capital of India in 1947. Delhi is a city of great historical significance as an important commercial, transport, and cultural hub, as well as the political centre of India. It has been the centre of succession of mighty empires and powerful kingdoms. The animal life of Delhi, like its plant life, is quite diverse. Among carnivorous animals are leopards, hyenas, foxes, wolves, and jackals, which inhabit the ravine lands and hilly ridges. Monkeys are found in the city, especially around some of the temples and historical ruins. Birdlife is profuse; year-round species include pigeons, sparrows, kites, parrots, partridges, bush quail, and, on the ridges, peafowl. In the demographic history of Delhi, a turning point was the year 1947, when thousands of Hindu and Sikh refugees from predominantly Muslim Pakistan entered the city in the wake of India’s independence. Since that time the population has grown steadily, with an ongoing heavy flow of immigrants, most arriving from other Indian states or from adjacent countries. The religious composition of Delhi’s population is diverse. The great majority of the residents are Hindu, adherents of Islam constitute form the largest minority, followed by smaller numbers of Sikhs, Jains, Christians, and Buddhists. The service sector is the most important part of Delhi’s economy, and it is the city’s largest employer. The city struggles with challenges brought by overcrowding, such as sub-standard housing, air pollution and traffic congestion.',
      },
    ],
  },

  {
    name: () => t`Vegetation and Forestry`,
    id: 'FORESTRY',
    content: [
      {
        name: 'Vegetation (S2L2A)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3eddab-YOUR-INSTANCEID-HERE`,
        preselected: true,
        layersExclude: ['7_MARI'],
      },
      {
        name: 'Vegetation (S2L1C)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/255008-YOUR-INSTANCEID-HERE`,
        layersExclude: ['7_MARI'],
      },
      {
        name: 'Vegetation (S3-OLCI)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/9e7ebf-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
    ],
    pins: [
      {
        title: 'Sundarbans, Mangrove Forest (OTCI)',
        lat: 21.953,
        lng: 89.052,
        zoom: 9,
        datasetId: 'S3OLCI_CDAS',
        layerId: '3_OTCI',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/9e7ebf-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-27',
        evalscript: '',
        evalscripturl: '',
        themeId: 'FORESTRY',
        description:
          '[Mangrove forests](https://oceanservice.noaa.gov/facts/mangroves.html) have exceptionally high biodiversity and are essential for erosion control. There are 80 known species of mangrove trees that grow in oxygen poor soils, where slow-moving water accumulates fine sediments in which roots can grow and salinization can occur. [The Sundarbans Mangrove Forest](https://www.esa.int/ESA_Multimedia/Images/2016/07/Sundarbans_web) covers 140,000 hectares of land, making it one of the largest mangrove forests in the world. It provides a livelihood for many people in the region and is home to 250 bird species and the endangered Royal Bengal Tiger, among others. The forest protects the coast from seasonal monsoons, cyclones and tidal waves. Learn more [here](https://whc.unesco.org/en/list/798/).',
      },
      {
        title: 'Serengetti National Park (Barren Soil)',
        lat: -1.5937,
        lng: 34.8469,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: '8_BARREN-SOIL',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3eddab-YOUR-INSTANCEID-HERE`,
        toTime: '2020-01-02',
        evalscript: '',
        evalscripturl: '',
        themeId: 'FORESTRY',
        description:
          '[The Serengeti National Park](https://whc.unesco.org/en/list/156/) in Tanzania covers 1,500 square kilometres of savannah and is home to the largest annual animal migrations in the world. The ecosystem is home to 2 million wildebeest, 900,000 Thomson’s gazelle and 300,00 zebra as the dominant herds. Other herbivoers include buffalo, giraffe, elephant and even more species. There are also hippos, black rhinos, 10 antelope species and 10 primate species. Major predators include 4,000 lions, leopards, cheetahs and spotted hyenas. The park is still threatened by poaching, wildfires, tourism and droughts. Sustainable tourism concepts are a first step to reduce the risk of endangering this biodiverse ecosystem.',
      },
      {
        title: 'Russian Taiga (EVI)',
        lat: 62.0505063310321,
        lng: 45.40924072265625,
        zoom: 9,
        datasetId: 'S2_L2A_CDAS',
        layerId: '4_EVI',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/3eddab-YOUR-INSTANCEID-HERE`,
        toTime: '2019-08-12',
        evalscript: '',
        evalscripturl: '',
        themeId: 'FORESTRY',
        description:
          '[The Taiga](https://education.nationalgeographic.org/resource/taiga/), the coniferous forest of the subarctic region, covers vast landscapes in Alaska, Canada, Scandinavia and Siberia. The Russian taiga stretches over 5,800 kilometres from the Pacific to the Ural Mountains and was completely covered by glaciers during the last ice age. The soil of taiga forests often contains permafrost, which means that the ground has been frozen for years and often up to thousands of years. Taiga forests are home to animal species such as owls, moose, deer, lynx, rodents and the Siberian tiger. The taiga is threatened by global warming as higher temperatures thaw the permafrost and release [methane](https://www.nationalgeographic.com/environment/article/news-arctic-permafrost-may-thaw-faster-than-expected), a potent greenhouse gas that accelerates climate change.',
      },
      // {
      //   title: 'Forestry in the Amazon Rainforest (True Color)',
      //   lat: -9.3756,
      //   lng: -52.1178,
      //   zoom: 11,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '1_TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/3eddab-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-07-18',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'FORESTRY',
      //   gain: '3.3',
      //   gamma: '1.5',
      //   description:
      //     '[The Amazon](https://www.esa.int/Applications/Observing_the_Earth/Earth_from_Space_Amazon_rainforest) is the largest rainforest in the world, larger than the next two - in the Congo Basin and Indonesia - combined. In 2020, the Amazon had 526 million hectares of primary forest. One in ten known species on Earth lives there. There is a clear link between the health of the Amazon and the health of the planet. The rainforest, which contains 90-140 billion tonnes of carbon, helps stabilise the local and global climate. Deforestation can release significant amounts of carbon, which could have catastrophic consequences for the entire world. Despite its global importance, more than 1.4 million hectares of forest have been cleared by logging since the 1970s, and an even larger area is affected by selective logging and forest fires. Conversion to cattle pastures and industrial agricultural production (especially soy farms) are the main causes of forest loss. Some parts are protected under the [UNESCO World Heritage]( https://whc.unesco.org/en/list/998/) programme.',
      // },
      // {
      //   title: 'Forestry in Indonesia, 2018 (Barren Soil)',
      //   lat: -2.0709,
      //   lng: 111.74452,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: '8_BARREN-SOIL',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/3eddab-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-03-20',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'FORESTRY',
      //   description:
      //     '[The rainforest in Indonesia](https://whc.unesco.org/en/list/1167/), home to over 3,000 species of animals (such as the Sumatran tiger or the pygmy elephant), is one of the most biodiverse places on Earth. Until the 1960s, about 80% of the country was covered by forest. Today, due to deforestation, this has dropped to less than 50%. The main cause of deforestation is illegal logging for plantations and/or the timber industry. Together with natural forest fires, this has led to a large loss of forest area and biodiversity, which not only causes problems for the indigenous population, but also contributes to global warming, as rainforests store large amounts of carbon. Learn more [here](https://www.ran.org/indonesian-rainforests/).',
      // },
      // {
      //   title: 'Forestry in Central African Republic (Agriculture Composite)',
      //   lat: 6.02152,
      //   lng: 23.25987,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: 'FALSE-COLOR-11-8-2',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/3eddab-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-02-21',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'FORESTRY',
      //   gain: '1.4',
      //   description:
      //     '[Central African Forests](https://www.esa.int/Applications/Observing_the_Earth/Earth_from_Space_Second_lungs_of_the_Earth) form the second largest rainforest complex in the world after the Amazon. These forests have always been a source of diverse resources, services and primary materials for their population. They provide timber, energy, bushmeat, fish and other food, medicinal plants and other diverse wood and non-wood products. Deforestation and destruction of forest resources is the result of shifting cultivation and uncontrolled exploitation to meet the needs of the local population and the market for primary materials. Traditional shifting cultivation with slash-and-burn agriculture and the extraction of fuelwood are by far the main causes of forest loss. Efforts to regenerate and conserve these resources are ineffective in the face of poor governance and persistent poverty. Learn more [here](https://www.fao.org/3/y5841e/y5841e08.htm).',
      // },
    ],
  },

  {
    name: () => t`Volcanoes`,
    id: 'VOLCANOES',
    content: [
      {
        name: 'Volcanoes (S2L2A)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/150710-YOUR-INSTANCEID-HERE`,
        preselected: true,
        layersExclude: ['2_FALSE_COLOR', '2_TONEMAPPED_NATURAL_COLOR'],
      },
      {
        name: 'Volcanoes (S2L1C)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7362d4-YOUR-INSTANCEID-HERE`,
        layersExclude: ['2_FALSE_COLOR', '2_TONEMAPPED_NATURAL_COLOR'],
      },
      {
        name: 'Volcanoes (Sentinel-5P)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/bf279a-YOUR-INSTANCEID-HERE`,
      },
    ],
    pins: [
      {
        lat: 19.01141,
        lng: -98.64796,
        zoom: 13,
        title: 'Popocatépetl Ash Emission (True Color)',
        toTime: '2024-03-06',
        layerId: 'TRUE-COLOR',
        themeId: 'VOLCANOES',
        datasetId: 'S2_L2A_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/150710-YOUR-INSTANCEID-HERE`,
        description:
          "On 6 March, Mexico's most active volcano increased its ash and gas emissions, posing a threat to Mexico City. It is located around 70 kilometres south-east of the city and threatens around 25 million people. There are 1500 active volcanoes worldwide, most of them along the Pacific Rim, known as the [Ring of Fire](https://en.wikipedia.org/wiki/Ring_of_Fire), of which around 50 erupt every year. Timely detection of dangerous volcanoes is crucial for over 500 million people living nearby. Space monitoring detects subtle changes, assesses the risks and supports response measures. EO Browser offers several preset band combinations, such as [True Color Composite](https://custom-scripts.sentinel-hub.com/sentinel-2/true_color/), which uses the visible light bands - red, green, and blue - in the corresponding red, green and blue color channels, resulting in a naturally coloured output that depicts the Earth as humans would naturally see it.",
      },
      {
        title: 'Yasur Volcano, Vanatu (IR Highlights)',
        lat: -19.52667,
        lng: 169.43665,
        zoom: 14,
        datasetId: 'S2_L2A_CDAS',
        layerId: 'TRUE-COLOR-LAVA-FLOW',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/150710-YOUR-INSTANCEID-HERE`,
        toTime: '2019-12-22',
        evalscript: '',
        evalscripturl: '',
        themeId: 'VOLCANOES',
        description:
          'The Yasur Volcano (361 m) is located on Tanna, one of the southernmost islands of the Pacific state of Vanuatu. The volcano has been continuously active for hundreds of years. Since records began, there have been mostly [Strombolian](https://en.wikipedia.org/wiki/Strombolian_eruption) and sometimes [Vulcanian](https://en.wikipedia.org/wiki/Vulcanian_eruption). Volcanism in this area is caused by the subduction of the Indo-Australian plate under the Pacific plate. The Yasur is known to be a major contributor to global volcanic sulphur dioxide emissions. In 2004-2005, 7.9 kg/sec were measured. This represented about 2% of global volcanic emissions of this gas. Ashfall brings nutrients to local vegetation, which is also affected by volcanic gases in the downwind area and acid rain. Learn more [here](http://www.photovolcanica.com/VolcanoInfo/Yasur/Yasur.html).',
      },
      {
        title: 'Stromboli, Province of Messina, Italy (IR Highlights)',
        lat: 38.7931301,
        lng: 15.211227399999985,
        zoom: 14,
        datasetId: 'S2_L2A_CDAS',
        layerId: 'TRUE-COLOR-LAVA-FLOW',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/150710-YOUR-INSTANCEID-HERE`,
        toTime: '2019-02-07',
        evalscript: '',
        evalscripturl: '',
        themeId: 'VOLCANOES',
        description:
          "[Stromboli](https://earth.esa.int/web/earth-watching/historical-views/content/-/article/stromboli-volcano/) has been continuously active for at least 2000 years, which is unusual among volcanoes. Most activity consists of short and minor bursts of lava, shooting 100-200 metres into the air. Occasionally there are longer eruptions, lasting between a few years and 10 years. The most recent eruption began in December 2002 and ended in July 2003. Although Stromboli's eruptions are usually not dangerous, there are also more violent ones that claim lives and destroy property.",
      },
      // {
      //   title: 'Erta Ale, Ethiopia (False Color Urban)',
      //   lat: 13.592683183820354,
      //   lng: 40.68614959716797,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: 'FALSE-COLOR-URBAN',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/150710-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-02-03',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'VOLCANOES',
      //   description:
      //     'The Erta Ale volcano is a large basaltic shield volcano in the Erta Ale volcanic chain in the central northern Danakil Depression (NE Ethiopia). It’s famous for its persistent lava lake, which has been active for most of the last decades since its discovery in the 1960s. Erta Ale is only 613 m high but, as is typical of a shield volcano, has very gentle slopes and a large base with a diameter of 40 km. The summit is bounded by a complex, elongated caldera, 1700 x 600 m wide, containing huge lava flows and several larger and smaller craters. Most conspicuous are the active north and south craters, which currently contain the lava lake. Learn more [here](https://www.eumetsat.int/large-so2-plume-erta-ale-volcano).',
      // },
      // {
      //   title: 'Pacaya (IR Highlights)',
      //   lat: 14.385467017006029,
      //   lng: -90.61514854431153,
      //   zoom: 14,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: 'TRUE-COLOR-LAVA-FLOW',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/150710-YOUR-INSTANCEID-HERE`,
      //   toTime: '2019-01-30',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'VOLCANOES',
      //   description:
      //     'The [Pacaya Volcano](https://un-spider.org/news-and-events/news/increased-volcanic-activity-guatemala-2021-fuego-and-pacaya) (2560 m) is located 30 km south of the centre of Guatemala City. From 1965 to 1975 and since 1990, Pacaya has erupted almost continuously, emitting mainly strombolian activity and lava flows. Occasionally, larger explosive eruptions have also been observed. Pacaya’s activity has been very episodic over the last few thousand years, involving thick deposits of basaltic lava over periods of less than 300 years, followed by inactive phases lasting between 300 and 500 years. Fortunately, major eruptions are often preceded by increased seismic activity, so surrounding communities can be warned. Learn more [here](http://www.photovolcanica.com/VolcanoInfo/Pacaya/Pacaya.html).',
      // },
      // {
      //   title: 'Etna (IR Highlights)',
      //   lat: 37.74371,
      //   lng: 15.004059999999982,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: 'TRUE-COLOR-LAVA-FLOW',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/150710-YOUR-INSTANCEID-HERE`,
      //   toTime: '2018-12-26',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'VOLCANOES',
      //   description:
      //     '[Mount Etna](https://whc.unesco.org/en/list/1427/) on the Italian island of Sicily is the highest active volcano in Europe. It currently reaches a height of 3320 metres (changes due to deposits from eruptions and collapses of the crater) and covers an impressive area of 1600 square kilometres. On its lower slopes are hot vineyards, olive groves and orchards. There are several smaller and larger settlements around the foot of the volcano. Etna is currently very active and has experienced four strombolian [eruptions](https://www.esa.int/ESA_Multimedia/Images/2021/02/Etna_erupts) in the last five years.',
      // },
      // {
      //   title: 'Nyiragongo (False Color Urban)',
      //   lat: -1.5220378,
      //   lng: 29.24945660000003,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: 'FALSE-COLOR-URBAN',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/150710-YOUR-INSTANCEID-HERE`,
      //   toTime: '2018-08-11',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'VOLCANOES',
      //   description:
      //     "[Nyiragongo](https://www.esa.int/SPECIALS/Eduspace_Disasters_EN/SEMDGLNSNNG_0.html) in the Democratic Republic of Congo is considered the most dangerous volcano in the world. The reason for this is the consistency of its lava, which is uncharacteristically fluid and can therefore flow at up to 100 km per hour. In comparison, lava normally moves at a speed of 1 to 10 km per hour due to its high density. Nyiragongo is a stratovolcano, which means that its eruptions can be explosive. Moreover, the walls of the 600-metre deep crater in which the lava is trapped can break at any moment. This happened on 10 January 1977 and had devastating consequences. Unfortunately, the volcano isn't well explored. Therefore, it's impossible to predict such events in the future. Learn more [here](https://whc.unesco.org/en/list/63/).",
      // },
      // {
      //   title: 'Jebel Marra, Sudan (not active)',
      //   lat: 12.92987,
      //   lng: 24.18983,
      //   zoom: 13,
      //   datasetId: 'S2_L2A_CDAS',
      //   layerId: 'TRUE-COLOR',
      //   visualizationUrl: `${global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL: FALLBACK_SH_SERVICES_URL}/ogc/wms/150710-YOUR-INSTANCEID-HERE`,
      //   toTime: '2018-01-12',
      //   evalscript: '',
      //   evalscripturl: '',
      //   themeId: 'VOLCANOES',
      //   description:
      //     "You're looking at the dormant volcano [Jebel Marra](https://whc.unesco.org/en/tentativelists/6519/) in Sudan. The most striking feature of this mountain is the volcanic caldera called Deriba Caldera. At its heart are two volcanic lakes that were formed about 3500 years ago when eruptions removed rock material and created a crater. The lakes are fed by rain and hot springs.",
      // },
      {
        title: 'Kilauea (False Color Urban)',
        lat: 19.3523,
        lng: -155.2516,
        zoom: 12,
        datasetId: 'S2_L1C_CDAS',
        layerId: 'FALSE-COLOR-URBAN',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/7362d4-YOUR-INSTANCEID-HERE`,
        toTime: '2016-10-25',
        evalscript: '',
        evalscripturl: '',
        themeId: 'VOLCANOES',
        description:
          "[Kilauea](https://whc.unesco.org/en/list/409/) is the most active volcanic area in the world. Its caldera is over 10 km2 in size and 150 m deep. Kilauea's [eruptions]( https://www.esa.int/Applications/Observing_the_Earth/Copernicus/Sentinel-1/Can_rain_trigger_a_volcanic_eruption) are usually not explosive, as is typical of shield volcanoes. Its lava flows are usually slow, so people living in the area can evacuate and avoid them. One of the most destructive eruptions occurred in 1955, when lava poured from the caldera for 88 consecutive days, destroying valuable sugar cane fields. Learn more [here](https://www.britannica.com/place/Kilauea).",
      },
    ],
  },
  {
    name: () => t`Wildfires`,
    id: 'WILDFIRES',
    content: [
      {
        name: 'Wildfires (S2L2A)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/81ed0b-YOUR-INSTANCEID-HERE`,
        preselected: true,
        layersExclude: ['BURN-AREA-INDEX-BAI'],
      },
      {
        name: 'Wildfires (S2L1C)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ce3273-YOUR-INSTANCEID-HERE`,
        layersExclude: ['BURN-AREA-INDEX-BAI'],
      },
      {
        name: 'Wildfires (S3-SLSTR)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/6d91d5-YOUR-INSTANCEID-HERE`,
        preselected: true,
      },
      {
        name: 'Wildfires (S3-OLCI)',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/61016e-YOUR-INSTANCEID-HERE`,
      },
      {
        name: 'Sentinel-5P O3 / NO2 / ...',
        service: 'WMS',
        url: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/0b0f5a-YOUR-INSTANCEID-HERE`,
      },
    ],
    pins: [
      {
        lat: 53.10351,
        lng: -75.56396,
        zoom: 10,
        title: 'Wildfires in Canada (SWIR)',
        toTime: '2023-06-20',
        layerId: 'SWIR',
        themeId: 'HIGHLIGHT',
        datasetId: 'S2_L2A_CDAS',
        evalscripturl: '',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/81ed0b-YOUR-INSTANCEID-HERE`,
        description:
          'Since March 2023, Canada has experienced a series of record-breaking wildfires that intensified particularly in June [[1]]( https://www.nytimes.com/2023/06/17/world/americas/canada-wildfires-season.html). The wildfires have affected 11 provinces and territories, including Alberta, Nova Scotia, Ontario and Quebec. Smoke from the fires has led to evacuations and air quality alerts in Canada, the United States and Europe. The province of Quebec has been particularly hard hit, as shown in the image captured by Sentinel-2 L2A, with the SWIR visualization applied. SWIR highlights freshly burned land as the difference in moisture between freshly burned areas and their undamaged surroundings is clearly visible.',
      },
      {
        title: 'Wildfires in Australia, January 2019 (Pierre Markuse script)',
        lat: -21.9374,
        lng: 116.6572,
        zoom: 12,
        datasetId: 'S2_L2A_CDAS',
        layerId: 'WILDFIRES-PIERRE-MARKUSE',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/81ed0b-YOUR-INSTANCEID-HERE`,
        toTime: '2019-01-05',
        evalscript: '',
        evalscripturl: '',
        themeId: 'WILDFIRES',
        description:
          'The 2019-2020 [Australian bushfire season](https://www.esa.int/ESA_Multimedia/Images/2019/11/Bushfires_rage_in_Australia) has destroyed 46 million hectares of land, including buildings. Nearly [3 billion animals died](https://www.bbc.com/news/world-australia-53549936) or were displaced. Wildfires occur in Australia every summer (the peak is usually in February), but a severe drought in 2020 made it the hottest and driest year on record with high temperatures and windy conditions. Learn more [here](https://www.directrelief.org/2020/06/six-months-after-australias-wildfires-recovery-continues/). Air pollution is one of the factors that can be monitored to assess the severity of wildfires by Copernicus [Sentinel-5P](https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel/sentinel-5p/).',
      },
      {
        title: 'Wildfires in California, August 2018 (Atmospheric Penetration)',
        lat: 37.6047,
        lng: -119.8787,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: 'ATMOSPHERIC-PENETRATION',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/81ed0b-YOUR-INSTANCEID-HERE`,
        toTime: '2018-08-05',
        evalscript: '',
        evalscripturl: '',
        themeId: 'WILDFIRES',
        description:
          'In November 2018, the Camp Fire in Butte County and the Woolsey Fire near Los Angeles ignited a wildfire that killed 90 people, burned 250,000 acres and destroyed 20,000 buildings. [Wildfires](https://www.who.int/health-topics/wildfires?gclid=EAIaIQobChMIkouu8v3u_AIVTfl3Ch3-xwE8EAAYASAAEgKfj_D_BwE#tab=tab_1) pollute the air and produce unhealthy gases that can be measured in communities hundreds of miles away. A hotter and drier climate, as well as high temperatures and strong winds, increase the risk of wildfires. Long-term trends related to global warming make it inevitable to improve disaster management and wildfire monitoring. Careless people are often the reason why fires break out. In addition, as California’s population grows, so does the population density in high fire risk areas. Learn more [here](https://news.stanford.edu/2018/11/28/reflections-california-wildfires/). Air pollution is one of the factors that can be monitored to assess the severity of wildfires by Copernicus [Sentinel-5P](https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel/sentinel-5p/).',
      },
      {
        title: 'Wildfires in Croatia, July 2017 (Pierre Markuse script)',
        lat: 43.4918,
        lng: 16.619,
        zoom: 11,
        datasetId: 'S2_L2A_CDAS',
        layerId: 'WILDFIRES-PIERRE-MARKUSE',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/81ed0b-YOUR-INSTANCEID-HERE`,
        toTime: '2017-07-17',
        evalscript: '',
        evalscripturl: '',
        themeId: 'WILDFIRES',
        description:
          'In the summer of 2017, a heat wave and a lack of rainfall led to a drought on the Adriatic coast. The dry, hot forest floor became extremely vulnerable to wildfires. Many wildfires are caused by careless people lighting campfires or throwing away cigarette butts while the wind spreads the fire faster. Firefighters struggled to contain the fires and keep them away from homes. In total, an astonishing 83,000 hectares of forest burned. Wildfires happen every summer, but due to global warming and less rainfall, they’ll now be even more common in our everyday lives. Learn more [here](http://www.euroforecaster.org/newsletter23/extreme_wildfire.pdf).',
      },
      {
        title: 'Wildfires in Funchal (Pierre Markuse script)',
        lat: 32.7335,
        lng: -17.0427,
        zoom: 12,
        datasetId: 'S2_L1C_CDAS',
        layerId: 'WILDFIRES',
        visualizationUrl: `${
          global.window ? global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL : FALLBACK_SH_SERVICES_URL
        }/ogc/wms/ce3273-YOUR-INSTANCEID-HERE`,
        toTime: '2016-08-17',
        evalscript: '',
        evalscripturl: '',
        themeId: 'WILDFIRES',
        description:
          'In August 2016, a [wildfire](https://www.esa.int/ESA_Multimedia/Images/2016/09/Fire-scarred_Madeira2) broke out on the Portuguese mainland and the island of Madeira after weeks of drought and temperatures above 35°C. The fire spread quickly and the smoke increased. Four days later, the fires were mostly extinguished, but a large area of forest remained. The hot and dry conditions favoured the forest fire, but there are also people who accidentally or intentionally set fire to the forest with disastrous effects on nature, people in the area and their property. The government used the [EU Civil Protection Mechanism](https://civil-protection-humanitarian-aid.ec.europa.eu/what/civil-protection/eu-civil-protection-mechanism_en#:~:text=Print%20friendly%20pdf-,What%20is%20it%3F,preparedness%2C%20and%20response%20to%20disasters.), which allowed other European countries to help. Learn more [here](https://earthobservatory.nasa.gov/images/88590/fires-char-madeira).',
      },
    ],
  },
  ...educationThemesDefaultMode,
];
