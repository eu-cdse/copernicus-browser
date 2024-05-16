import { AWS_HLS_LANDSAT, AWS_HLS_SENTINEL } from '../../dataSourceConstants';
import React from 'react';
import ReactMarkdown from 'react-markdown';
import { t } from 'ttag';
import { DATASOURCES } from '../../../../../const';
import HelpTooltip from '../../DatasourceRenderingComponents/HelpTooltip';
import { credits } from './credits';
import DataSourceTooltip from './DataSourceTooltip';

export const getHLS_Markdown = () => t`
**Harmonized Landsat Sentinel** (HLS) is an initiative of NASA to create a Virtual Constellation of surface reflectance (SR) data from the Operational Land Imager (OLI) and the Multi-Spectral Instrument (MSI) on board the Landsat 8 and 9 and Sentinel-2 remote sensing satellites. HLS includes a total of 21 bands, of which 2 (2 Thermal Infrared) are only available for Landsat and 5 (3 red edge, NIR broad, water vapour) are only available for Sentinel. More information on the available bands and data can be found [here](https://docs.sentinel-hub.com/api/latest/data/hls/#available-bands-and-data).

The products are radiometrically harmonized as much as possible and resampled to a common 30-metre resolution, using the Sentinel-2 MGRS UTM grid.

**Spatial resolution:** 30 metres.

**Revisit time:** 2 – 3 days.

**Data availability:** Since April 2013.

**Common usage:** Vegetation monitoring, land use, land cover maps and change monitoring.
`;

export const HLS_Landsat_Markdown = () =>
  t`**Landsat data** provides consistent surface reflectance (SR) data from the Operational Land Imager (OLI) on board the joint NASA/USGS Landsat 8 and Landsat 9 satellites. The input product is Landsat 8-9 Collection 2 Level 1 top-of-atmosphere reflectance. The data is available globally since April 2013.`;

export const HLS_Sentinel_Markdown = () =>
  t`**Sentinel data** provides consistent surface reflectance values from the Multi-Spectral Instrument (MSI) on board the European Copernicus satellites Sentinel-2A and Sentinel-2B. The input product is the Sentinel-2 L1C top-of-atmosphere reflectance. The data is available globally since November 2015.`;

export const renderHLSOptionsHelpTooltips = (option) => {
  switch (option) {
    case AWS_HLS_LANDSAT:
      return renderHelpTooltip(HLS_Landsat_Markdown());
    case AWS_HLS_SENTINEL:
      return renderHelpTooltip(HLS_Sentinel_Markdown());
    default:
      return null;
  }
};

const renderHelpTooltip = (tooltip) => (
  <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
    <ReactMarkdown children={tooltip} />
  </HelpTooltip>
);

const HLSTooltip = () =>
  DataSourceTooltip({
    source: getHLS_Markdown(),
    credits: credits[DATASOURCES.AWS_HLS],
  });

export default HLSTooltip;
