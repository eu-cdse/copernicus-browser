import React from 'react';
import { t } from 'ttag';
import ReactMarkdown from 'react-markdown';
import { credits } from './credits';
import { DATASOURCES } from '../../../../../const';
import DataSourceTooltip from './DataSourceTooltip';

const getS3Markdown = () => t`
**Sentinel-3** mission's main objective is to measure the sea surface topography, the sea and land surface temperature, and the colour of the ocean and land surface. To achieve this goal, Sentinel-3 has a combination of different instruments on board. The most important instruments are the Ocean and Land Colour Instrument (OLCI), the SAR Radar Altimeter (SRAL) and the Sea and Land Surface Temperature Radiometer (SLSTR).

**Data availability:** Since May 2016 onwards.
`;

const getS3SLSTRMarkdown = () => t`
The **Sea and Land Surface Temperature (SLSTR)** instrument on board Sentinel-3 measures the global and regional sea and land surface 
temperature. The SLSTR covers the visible, shortwave infrared, and thermal infrared wavelengths of the electromagnetic spectrum. 

**Spatial resolution:** 500m for visible, near- and shortwave infrared wavelengths and 1km for thermal infrared (that is, only details 
bigger than 500m and 1km can be seen, respectively).

**Revisit time:** Maximum 1 day to revisit the same area, using both satellites.

**Data availability:** Since May 2016 onwards.

**Common usage:** Climate change monitoring, vegetation monitoring, active fire detection, land and sea surface temperature monitoring. 
`;

const getS3OLCIMarkdown = () => t`
The **Ocean and Land Colour Instrument (OLCI)** on board Sentinel-3 is a spectrometer that 
measures the solar radiation reflected by Earth, and it monitors the ocean, the environment, 
and climate. It provides more frequent visible imagery than Sentinel-2 but at a lower resolution
and with more wavelengths covered. The Sentinel-3 OLCI instrument continues the measurements previously performed by the MERIS instrument on board Envisat, whose mission concluded.

**Spatial resolution:** 300m (that is, only details bigger than 300m can be seen).

**Revisit time:** Maximum 2 days to revisit the same area, using both satellites.

**Data availability:** Since May 2016 onwards.

**Common usage:** Surface topography, ocean and land surface colour observations and monitoring.
`;

const getS3SynL2Markdown = () => t`
**The Sentinel-3 SYNERGY** is a combination of the OLCI and SLSTR acquisitions with original objective to provide surface vegetation products. [The Level-2 SYN](https://sentiwiki.copernicus.eu/web/synergy-products) product provides surface reflectances for all SYN channels and aerosol parameters over land.

**Spatial resolution**: 300 m  

**Temporal resolution**: < 2 days  

**Data availability**: Global since October 2018  

**Common usage**: Land Monitoring and Security, Climate Change Monitoring  
`;
const getS3VG1L2Markdown = () => t`
**The Sentinel-3 SYNERGY** is a combination of the OLCI and SLSTR acquisitions with original objective to provide surface vegetation products. [The Level-2 VG1](https://sentiwiki.copernicus.eu/web/synergy-products#SYNERGYProducts-L2VG1andV10ProductsS3-Synergy-Products-L2-VG1-and-V10-Products) product contains 1 km VEGETATION-like product, 1 day synthesis surface reflectances and NDVI.

**Spatial resolution**: 1 km

**Temporal resolution**: Daily

**Data availability**: Global since October 2018

**Common usage**: Land Monitoring and Security, Climate Change Monitoring
`;
const getS3V10L2Markdown = () => t`
**The Sentinel-3 SYNERGY** is a combination of the OLCI and SLSTR acquisitions with original objective to provide surface vegetation products. [The Level-2 V10](https://sentiwiki.copernicus.eu/web/synergy-products#SYNERGYProducts-L2VG1andV10ProductsS3-Synergy-Products-L2-VG1-and-V10-Products) product contains 1 km VEGETATION-like product, 10 day synthesis surface reflectances and NDVI.

**Spatial resolution**: 1 km

**Temporal resolution**: 10-days composite

**Data availability**: Global since October 2018

**Common usage**: Land Monitoring and Security, Climate Change Monitoring
`;
// const getS3AODL2Markdown = () => t`Global Aerosol parameter over land and sea on super pixel resolution (4.5 km x 4.5 km)`;
// const getS3VGPL2Markdown = () => t`1 km VEGETATION-Like product (~VGT-P) - TOA Reflectance`;

const Sentinel3Tooltip = () =>
  DataSourceTooltip({
    source: getS3Markdown(),
    credits: credits[DATASOURCES.S3],
  });

const S3SLSTRTooltip = () => <ReactMarkdown children={getS3SLSTRMarkdown()} />;
const S3OLCITooltip = () => <ReactMarkdown children={getS3OLCIMarkdown()} />;
const S3SynL2Tooltip = () => <ReactMarkdown children={getS3SynL2Markdown()} />;
const S3VG1L2Tooltip = () => <ReactMarkdown children={getS3VG1L2Markdown()} />;
const S3V10L2Tooltip = () => <ReactMarkdown children={getS3V10L2Markdown()} />;
//const S3AODL2Tooltip = () => <ReactMarkdown children={getS3AODL2Markdown()} />;
//const S3VGPL2Tooltip = () => <ReactMarkdown children={getS3VGPL2Markdown()} />;

export {
  Sentinel3Tooltip,
  S3SLSTRTooltip,
  S3OLCITooltip,
  S3SynL2Tooltip,
  S3VG1L2Tooltip,
  S3V10L2Tooltip,
  // S3AODL2Tooltip,
  // S3VGPL2Tooltip,
  getS3Markdown,
  getS3SLSTRMarkdown,
  getS3OLCIMarkdown,
  getS3SynL2Markdown,
  getS3VG1L2Markdown,
  getS3V10L2Markdown,
  // getS3AODL2Markdown,
  // getS3VGPL2Markdown,
};
