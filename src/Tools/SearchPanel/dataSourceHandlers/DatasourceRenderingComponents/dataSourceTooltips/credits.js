import { DATASOURCES } from '../../../../../const';
import {
  COPERNICUS_CORINE_LAND_COVER,
  COPERNICUS_GLOBAL_LAND_COVER,
  COPERNICUS_WATER_BODIES,
  COPERNICUS_GLOBAL_SURFACE_WATER,
  COPERNICUS_CLC_ACCOUNTING,
  CNES_LAND_COVER,
  ESA_WORLD_COVER,
  GLOBAL_HUMAN_SETTLEMENT,
  IO_LULC_10M_ANNUAL,
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL,
  COPERNICUS_CLMS_BURNT_AREA_DAILY,
  COPERNICUS_CLMS_BURNT_AREA_MONTHLY,
  COPERNICUS_CLMS_DMP_1KM_DAILY,
  COPERNICUS_CLMS_DMP_1KM_DAILY_RT0,
  COPERNICUS_CLMS_DMP_1KM_DAILY_RT1,
  COPERNICUS_CLMS_DMP_1KM_DAILY_RT2,
  COPERNICUS_CLMS_DMP_1KM_DAILY_RT6,
  COPERNICUS_CLMS_FAPAR_1KM_DAILY,
  COPERNICUS_CLMS_FAPAR_1KM_DAILY_RT0,
  COPERNICUS_CLMS_FAPAR_1KM_DAILY_RT1,
  COPERNICUS_CLMS_FAPAR_1KM_DAILY_RT2,
  COPERNICUS_CLMS_FAPAR_1KM_DAILY_RT6,
  COPERNICUS_CLMS_LAI_1KM_DAILY,
  COPERNICUS_CLMS_LAI_1KM_DAILY_RT0,
  COPERNICUS_CLMS_LAI_1KM_DAILY_RT1,
  COPERNICUS_CLMS_LAI_1KM_DAILY_RT2,
  COPERNICUS_CLMS_LAI_1KM_DAILY_RT6,
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
} from '../../dataSourceConstants';
import logoCopernicus from './images/logo-tooltips-copernicus.png';
import logoCreodias from './images/logo-tooltips-creodias.png';

const creodias = {
  link: 'https://creodias.eu/',
  logo: logoCreodias,
  title: 'Creodias',
};

const copernicus = {
  link: 'http://copernicus.eu/main/sentinels',
  logo: logoCopernicus,
  title: 'Copernicus',
};

export const credits = {
  [DATASOURCES.S1]: [copernicus],
  [DATASOURCES.S2]: [copernicus],
  [DATASOURCES.S2_CDAS]: [copernicus],
  [DATASOURCES.S3]: [creodias, copernicus],
  [DATASOURCES.S3_CDAS]: [copernicus],
  [DATASOURCES.S5]: [creodias, copernicus],
  [DATASOURCES.S5_CDAS]: [copernicus],
  [DATASOURCES.AWS_LANDSAT15]: [
    {
      title: 'USGS',
      link: 'https://www.usgs.gov/centers/eros/science/usgs-eros-archive-landsat-archives-landsat-1-5-multispectral-scanner-mss-level?qt-science_center_objects=0#qt-science_center_objects',
    },
  ],
  [DATASOURCES.AWS_LANDSAT45]: [
    {
      title: 'USGS',
      link: 'https://www.usgs.gov/centers/eros/science/usgs-eros-archive-landsat-archives-landsat-4-5-thematic-mapper-tm-level-1-data',
    },
  ],
  [DATASOURCES.AWS_LANDSAT7_ETM]: [
    {
      title: 'USGS',
      link: 'https://www.usgs.gov/core-science-systems/nli/landsat/landsat-7?qt-science_support_page_related_con=0#qt-science_support_page_related_con',
    },
  ],
  [DATASOURCES.AWS_LANDSAT8]: [
    {
      title: 'USGS - L8',
      link: 'https://www.usgs.gov/landsat-missions/landsat-8',
    },
    {
      title: 'USGS - L9',
      link: 'https://www.usgs.gov/landsat-missions/landsat-9',
    },
  ],
  [DATASOURCES.EOCLOUD_LANDSAT]: [
    {
      title: 'USGS',
      link: 'https://www.usgs.gov/core-science-systems/nli/landsat/landsat-satellite-missions',
    },
  ],
  [DATASOURCES.AWS_HLS]: [
    {
      title: 'USGS',
      link: 'https://lpdaac.usgs.gov/data/get-started-data/collection-overview/missions/harmonized-landsat-sentinel-2-hls-overview/',
    },
  ],
  [DATASOURCES.ENVISAT_MERIS]: [
    creodias,
    {
      title: 'ESA',
      link: 'https://earth.esa.int/web/guest/missions/esa-operational-eo-missions/envisat/instruments/meris',
    },
  ],
  [DATASOURCES.MODIS]: [{ title: 'NASA', link: 'https://modis.gsfc.nasa.gov/about' }],
  [DATASOURCES.DEM]: [copernicus],
  [DATASOURCES.PROBAV]: [
    {
      title: 'ESA',
      link: 'https://www.esa.int/Our_Activities/Observing_the_Earth/Proba-V/',
    },
  ],
  [DATASOURCES.GIBS]: [
    {
      title: 'NASA',
      link: 'https://earthdata.nasa.gov/about/science-system-description/eosdis-components/global-imagery-browse-services-gibs',
    },
  ],
  [DATASOURCES.PLANET_NICFI]: [
    {
      title: 'Planet NICFI',
      link: 'https://www.planet.com/nicfi/',
    },
  ],
  [DATASOURCES.COPERNICUS]: [{ ...copernicus, link: 'https://www.copernicus.eu/en/copernicus-services' }],

  [COPERNICUS_CORINE_LAND_COVER]: [
    { ...copernicus, link: 'https://land.copernicus.eu/pan-european/corine-land-cover' },
  ],
  [COPERNICUS_GLOBAL_LAND_COVER]: [{ ...copernicus, link: 'https://land.copernicus.eu/global/products/lc' }],
  [COPERNICUS_WATER_BODIES]: [{ ...copernicus, link: 'https://land.copernicus.eu/global/products/wb' }],
  [COPERNICUS_GLOBAL_SURFACE_WATER]: [{ ...copernicus, link: 'https://global-surface-water.appspot.com/' }],
  [COPERNICUS_CLC_ACCOUNTING]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/snow-products/snow-state-conditions',
    },
  ],
  [CNES_LAND_COVER]: [
    {
      title: 'Theia',
      link: 'https://www.theia-land.fr/en/product/land-cover-map/',
    },
    {
      title: 'CESBIO',
      link: 'https://www.cesbio.cnrs.fr/',
    },
  ],
  [ESA_WORLD_COVER]: [
    {
      title: 'ESA',
      link: 'https://esa-worldcover.org/',
    },
  ],
  [GLOBAL_HUMAN_SETTLEMENT]: [
    {
      title: 'European Commission, Joint Research Centre (JRC)',
      link: 'https://ghsl.jrc.ec.europa.eu/index.php',
    },
  ],
  [IO_LULC_10M_ANNUAL]: [
    {
      title: 'Impact Observatory',
      link: 'https://www.impactobservatory.com/',
    },
  ],
  [COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_BURNT_AREA_DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_BURNT_AREA_MONTHLY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_DMP_1KM_DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  // remove if you want the credits to not show on datasource level
  [DATASOURCES.CLMS]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_DMP_1KM_DAILY_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_DMP_1KM_DAILY_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_DMP_1KM_DAILY_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_DMP_1KM_DAILY_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FAPAR_1KM_DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FAPAR_1KM_DAILY_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FAPAR_1KM_DAILY_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FAPAR_1KM_DAILY_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FAPAR_1KM_DAILY_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LAI_1KM_DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LAI_1KM_DAILY_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LAI_1KM_DAILY_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LAI_1KM_DAILY_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LAI_1KM_DAILY_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FAPAR_300M_10DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FCOVER_1KM_10DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FCOVER_300M_10DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GPP_300M_10DAILY_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GPP_300M_10DAILY_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GPP_300M_10DAILY_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GPP_300M_10DAILY_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LAI_300M_10DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LAI_300M_10DAILY_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LAI_300M_10DAILY_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LAI_300M_10DAILY_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LAI_300M_10DAILY_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_NPP_300M_10DAILY_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_NPP_300M_10DAILY_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_NPP_300M_10DAILY_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_NPP_300M_10DAILY_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_SWI_12_5KM_10DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_SWI_12_5KM_DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_SWI_1KM_DAILY]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [DATASOURCES.CCM]: [
    {
      ...copernicus,
      link: 'https://www.copernicus.eu/en/contributing-missions',
    },
  ],
  [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: [
    {
      ...copernicus,
      link: 'https://www.copernicus.eu/en/contributing-missions',
    },
  ],
  [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: [
    {
      ...copernicus,
      link: 'https://www.copernicus.eu/en/contributing-missions',
    },
  ],
  [COPERNICUS_CLMS_DMP_300M_10DAILY_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_DMP_300M_10DAILY_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_DMP_300M_10DAILY_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_DMP_300M_10DAILY_RT5]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_DMP_300M_10DAILY_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LST_5KM_10DAILY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LST_5KM_10DAILY_V2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_NDVI_1KM_STATS_V2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_NDVI_1KM_STATS_V3]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_NDVI_1KM_10DAILY_V2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_NDVI_300M_10DAILY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_NDVI_300M_10DAILY_V2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_SSM_1KM_DAILY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LSP_300M_YEARLY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LCC_100M_YEARLY_V3]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LST_5KM_HOURLY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LST_5KM_HOURLY_V2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_WB_300M_10DAILY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_WB_1KM_10DAILY_V2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_SWE_5KM_DAILY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_SWE_5KM_DAILY_V2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_SCE_500M_DAILY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_SCE_1KM_DAILY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_WB_300M_MONTHLY_V2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LIE_500M_DAILY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_LIE_250M_DAILY_V2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
  [COPERNICUS_CLMS_WB_100M_MONTHLY_V1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/en',
    },
  ],
};
