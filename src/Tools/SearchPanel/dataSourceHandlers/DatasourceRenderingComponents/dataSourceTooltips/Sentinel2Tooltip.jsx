import React from 'react';
import ReactMarkdown from 'react-markdown';
import { t } from 'ttag';
import { DATASOURCES } from '../../../../../const';
import { credits } from './credits';
import DataSourceTooltip from './DataSourceTooltip';

const getSentinel2Markdown = () => t`
**Sentinel-2** provides high-resolution images in the visible and infrared wavelengths, to monitor vegetation, soil and water cover, inland waterways and coastal areas.

**Spatial resolution:** 10m, 20m, and 60m, depending on the wavelength (that is, only details bigger than 10m, 20m, and 60m can be seen). More info [here](https://sentinel.esa.int/web/sentinel/user-guides/sentinel-2-msi/resolutions/spatial). 

**Revisit time:** maximum 5 days to revisit the same area, using both satellites.

**Data availability:** Since June 2015. Full global coverage since March 2017.

**Common usage:** Land-cover maps, land-change detection maps, vegetation monitoring, monitoring of burnt areas.
`;

const getS2L2AMarkdown = () => t`
Level 2A data are high quality data where the effects of the atmosphere on the light being reflected off of the surface of the Earth and reaching the sensor are excluded. Data are available globally since March 2017.

More info about atmospheric correction [here](https://www.sentinel-hub.com/develop/api/ogc/custom-parameters/atmospheric-correction/).`;

const getS2L1CMarkdown = () => t`
Level 1C data are data of sufficient quality for most investigations, where all image corrections were done except for the atmospheric correction. Data are available globally since June 2015 onwards.`;

const Sentinel2Tooltip = () =>
  DataSourceTooltip({
    source: getSentinel2Markdown(),
    credits: credits[DATASOURCES.S2_CDAS],
  });

const S2L2ATooltip = () => <ReactMarkdown children={getS2L2AMarkdown()} />;

const S2L1CTooltip = () => <ReactMarkdown children={getS2L1CMarkdown()} />;

export {
  Sentinel2Tooltip,
  S2L1CTooltip,
  S2L2ATooltip,
  getSentinel2Markdown,
  getS2L2AMarkdown,
  getS2L1CMarkdown,
};
