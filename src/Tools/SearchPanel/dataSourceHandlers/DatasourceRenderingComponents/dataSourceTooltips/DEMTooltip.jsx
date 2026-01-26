import React from 'react';
import ReactMarkdown from 'react-markdown';
import { t } from 'ttag';
import DataSourceTooltip from './DataSourceTooltip';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../../../../../rehypeConfig';

const COPERNICUS_CREDITS_URL =
  'https://spacedata.copernicus.eu/collections/copernicus-digital-elevation-model';

const getDEMMarkdown = () =>
  t`A **DEM** (Digital Elevation Model) is a digital representation of a terrain (usually Earth's surface). It is obtained by dividing the whole globe into grid cells, each holding a corresponding altitude value in meters. Depending on the gride cell size, a DEM can be more detailed (high resolution) or less detailed (low resolution). Sentinel Hub DEM data collections are static (independent of date) and globally available.\n\n**Common usage:** Modelling water flows, orthorectification of Sentinel-1 imagery and engineering.`;

const getMapzenMarkdown = () =>
  t`The **Mapzen DEM** is based on the SRTM30 (Shuttle Radar Topography Mission) and [other sources]( https://github.com/tilezen/joerd/blob/master/docs/data-sources.md). The bathymetry data is taken from [ETOPO1](https://www.ngdc.noaa.gov/mgg/global/global.html). It is a static collection (independent of date) with global coverage.\n\n**Spatial resolution:** Mostly 90 m, in some areas up to 10 m.\n\nCredits: [Mapzen](https://github.com/tilezen/joerd/tree/master/docs)`;
const getCopernicus30Markdown = () =>
  t`The **Copernicus DEM** represents the surface of the Earth including buildings, infrastructure and vegetation. Similar to the Mapzen DEM, it is based on a combination of different DEMs (basis [WorldDEMTM](https://www.geospatialworld.net/article/worlddemtm-new-standard-of-global-elevation-models/)). It is a static collection (independent of date) with global coverage.\n\n**Spatial resolution:** 30 m infilled with 90 m (where 30 m tiles are not released).\n\nCredits: [ESA](${COPERNICUS_CREDITS_URL})`;
const getCopernicus90Markdown = () =>
  t`The **Copernicus DEM** represents the surface of the Earth including buildings, infrastructure and vegetation. Similar to the Mapzen DEM, it is based on a combination of different DEMs (basis [WorldDEMTM](https://www.geospatialworld.net/article/worlddemtm-new-standard-of-global-elevation-models/)). It is a static collection (independent of date) with global coverage.\n\n**Spatial resolution:** 90 m\n\nCredits: [ESA](${COPERNICUS_CREDITS_URL})`;

const DEMTooltip = () =>
  DataSourceTooltip({
    source: getDEMMarkdown(),
  });

const MapzenTooltip = () => (
  <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>{getMapzenMarkdown()}</ReactMarkdown>
);
const Copernicus30Tooltip = () => (
  <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>{getCopernicus30Markdown()}</ReactMarkdown>
);
const Copernicus90Tooltip = () => (
  <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS}>{getCopernicus90Markdown()}</ReactMarkdown>
);

export {
  DEMTooltip,
  MapzenTooltip,
  Copernicus30Tooltip,
  Copernicus90Tooltip,
  getDEMMarkdown,
  getMapzenMarkdown,
  getCopernicus30Markdown,
  getCopernicus90Markdown,
};
