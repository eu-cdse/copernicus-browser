import { t } from 'ttag';

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

export { getSentinel2Markdown, getS2L2AMarkdown, getS2L1CMarkdown };
