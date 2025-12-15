import { t } from 'ttag';
import { credits } from './credits';
import DataSourceTooltip from './DataSourceTooltip';
import { CDAS_L8_L9_LOTL1, CDAS_LANDSAT_MOSAIC } from '../../dataSourceConstants';

const getComplentaryDataMarkdown = () => t`
General complementary data information.
`;

const ComplementaryDataTooltip = () =>
  DataSourceTooltip({
    source: getComplentaryDataMarkdown(),
  });

const getLandsat89Markdown = () => t`
The **Landsat 8-9** collection contains imagery from the two most recently launched Landsat satellites (Landsat 8 and Landsat 9, provided by NASA/USGS). Both carry the Operational Land Imager (OLI) and the Thermal Infrared Sensor (TIRS), with 9 optical and 2 thermal bands. These two sensors provide seasonal coverage of the global landmass.

**Spatial resolution:** 15 m for the panchromatic band and 30 m for the rest (the thermal bands are re-sampled from 100 m).

**Revisit time:** 16 days

**Data availability:** Since January 2021

**Common usage:** Vegetation monitoring, land use, land cover maps, change monitoring, etc.

**Level-1** data (from **Landsat Collection 2**) provides global top of the atmosphere reflectance and top of the atmosphere brightness temperature products. 
  
The data underwent several processing steps including geometric and radiometric improvements. 
  
More info about Level-1 data [here](https://documentation.dataspace.copernicus.eu/APIs/SentinelHub/Data/Landsat8-9.html).
`;

const Landsat89Tooltip = () =>
  DataSourceTooltip({
    source: getLandsat89Markdown(),
    credits: credits[CDAS_L8_L9_LOTL1],
  });

const getLandsatMosaicMarkdown = () => t`
Global, cloud-free, and reconstructed historical Landsat spectral bands are provided at a spatial resolution of 30 meters and temporal resolution of bimonthly intervals from 1997 onwards. The dataset was generated using the GLAD Landsat ARD version 2 as the primary input for temporal aggregation and the imputation of missing values.
`;

const LandsatMosaicTooltip = () =>
  DataSourceTooltip({
    source: getLandsatMosaicMarkdown(),
    credits: credits[CDAS_LANDSAT_MOSAIC],
  });

export {
  ComplementaryDataTooltip,
  getComplentaryDataMarkdown,
  LandsatMosaicTooltip,
  getLandsatMosaicMarkdown,
  Landsat89Tooltip,
  getLandsat89Markdown,
};
