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

const Sentinel3Tooltip = () =>
  DataSourceTooltip({
    source: getS3Markdown(),
    credits: credits[DATASOURCES.S3],
  });

const S3SLSTRTooltip = () => <ReactMarkdown source={getS3SLSTRMarkdown()} />;

const S3OLCITooltip = () => <ReactMarkdown source={getS3OLCIMarkdown()} />;

export {
  Sentinel3Tooltip,
  S3SLSTRTooltip,
  S3OLCITooltip,
  getS3Markdown,
  getS3SLSTRMarkdown,
  getS3OLCIMarkdown,
};
