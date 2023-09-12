import { DATASOURCES } from '../../../../../const';
import {
  COPERNICUS_CORINE_LAND_COVER,
  COPERNICUS_GLOBAL_LAND_COVER,
  COPERNICUS_WATER_BODIES,
  COPERNICUS_GLOBAL_SURFACE_WATER,
  COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES,
  COPERNICUS_HR_VPP_VEGETATION_INDICES,
  COPERNICUS_HR_VPP_VPP_S1,
  COPERNICUS_HR_VPP_VPP_S2,
  COPERNICUS_CLC_ACCOUNTING,
  CNES_LAND_COVER,
  ESA_WORLD_COVER,
  GLOBAL_HUMAN_SETTLEMENT,
  COPERNICUS_HRSI_PSA,
  COPERNICUS_HRSI_WDS,
  COPERNICUS_HRSI_SWS,
  COPERNICUS_HRSI_FSC,
  COPERNICUS_HRSI_GFSC,
  IO_LULC_10M_ANNUAL,
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
  [COPERNICUS_HR_VPP_SEASONAL_TRAJECTORIES]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-vegetation-phenology-and-productivity/seasonal-trajectories',
    },
  ],
  [COPERNICUS_HR_VPP_VEGETATION_INDICES]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-vegetation-phenology-and-productivity/vegetation-indices',
    },
  ],
  [COPERNICUS_HR_VPP_VPP_S1]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-vegetation-phenology-and-productivity/vegetation-phenology-and-productivity',
    },
  ],
  [COPERNICUS_HR_VPP_VPP_S2]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-vegetation-phenology-and-productivity/vegetation-phenology-and-productivity',
    },
  ],
  [COPERNICUS_HRSI_PSA]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/snow-products/persistent-snow-area',
    },
  ],
  [COPERNICUS_HRSI_WDS]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/snow-products/snow-state-conditions',
    },
  ],
  [COPERNICUS_HRSI_SWS]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/snow-products/snow-state-conditions',
    },
  ],
  [COPERNICUS_HRSI_FSC]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/snow-products/snow-state-conditions',
    },
  ],

  [COPERNICUS_HRSI_GFSC]: [
    {
      ...copernicus,
      link: 'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring',
    },
  ],
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
};
