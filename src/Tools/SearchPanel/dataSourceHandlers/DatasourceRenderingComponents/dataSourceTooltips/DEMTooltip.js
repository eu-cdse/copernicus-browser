import { t } from 'ttag';

const COPERNICUS_CREDITS_URL =
  'https://spacedata.copernicus.eu/collections/copernicus-digital-elevation-model';

const getDEMMarkdown = () =>
  t`A **DEM** (Digital Elevation Model) is a digital representation of a terrain (usually Earth's surface). It is obtained by dividing the whole globe into grid cells, each holding a corresponding altitude value in meters. Depending on the gride cell size, a DEM can be more detailed (high resolution) or less detailed (low resolution). Sentinel Hub DEM data collections are static (independent of date) and globally available.\n\n**Common usage:** Modelling water flows, orthorectification of Sentinel-1 imagery and engineering.`;

const getCopernicus30Markdown = () =>
  t`The **Copernicus DEM** represents the surface of the Earth including buildings, infrastructure and vegetation. Similar to the Mapzen DEM, it is based on a combination of different DEMs (basis [WorldDEMTM](https://www.geospatialworld.net/article/worlddemtm-new-standard-of-global-elevation-models/)). It is a static collection (independent of date) with global coverage.\n\n**Spatial resolution:** 30 m infilled with 90 m (where 30 m tiles are not released).\n\nCredits: [ESA](${COPERNICUS_CREDITS_URL})`;
const getCopernicus90Markdown = () =>
  t`The **Copernicus DEM** represents the surface of the Earth including buildings, infrastructure and vegetation. Similar to the Mapzen DEM, it is based on a combination of different DEMs (basis [WorldDEMTM](https://www.geospatialworld.net/article/worlddemtm-new-standard-of-global-elevation-models/)). It is a static collection (independent of date) with global coverage.\n\n**Spatial resolution:** 90 m\n\nCredits: [ESA](${COPERNICUS_CREDITS_URL})`;

export { getDEMMarkdown, getCopernicus30Markdown, getCopernicus90Markdown };
