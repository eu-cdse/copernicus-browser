import React from 'react';
import ReactMarkdown from 'react-markdown';
import { t } from 'ttag';
import HelpTooltip from '../../DatasourceRenderingComponents/HelpTooltip';

import {
  AWS_LETML1,
  AWS_LETML2,
  AWS_LOTL1,
  AWS_LOTL2,
  AWS_LTML1,
  AWS_LTML2,
} from '../../dataSourceConstants';
import { credits } from './credits';
import { DATASOURCES } from '../../../../../const';
import DataSourceTooltip from './DataSourceTooltip';

export const getLandsat_Markdown = () => t`
The series of **Landsat** satellites of NASA/ U.S. Geological Survey are similar to Sentinel-2 (they capture visible and infrared wavelengths)
 and additionally can capture thermal infrared (Landsat 8). The Landsat series has a long history of imagery spanning nearly five decades.
  This platform gives you access to imagery acquired by Landsat 5, 7 and 8.

**Spatial resolution:** 15m, 30m, and 100m resampled to 30m, depending on the wavelength (that is, only details bigger than 10m and 30m, can be seen). More info [here](https://www.usgs.gov/faqs/what-are-band-designations-landsat-satellites?qt-news_science_products=0#qt-news_science_products).

**Revisit time:** Maximum 8 days to revisit the same area using the two operational satellites Landsat 7 and Landsat 8.

**Data availability:** Europe and North Africa from 1984 - 2011 (Landsat 5), 1999 - 2003 (Landsat 7), 2013 until present (Landsat 8) from the ESA archive. The global U.S. Geological Survey (USGS) archive since April 2013 until today (Landsat 8 only)   .

**Common usage:** Vegetation monitoring, land use, land cover maps, change monitoring, etc.
`;

export const getLandsat45AWS_Markdown = () => t`
The **Landsat 4-5 TM** collection includes imagery produced with the Thematic Mapper (TM) sensor, which was carried onboard Landsat 4 and 5 satellites. There are 6 optical and one thermal infrared band available, all in 30 meter resolution. Data is archived, with global coverage over land, available from 1982 to 2012. Top of the atmosphere level-1, and surface reflectance level-2 products are provided.

**Spatial resolution**: 30 meter

**Revisit time** 16 days

**Data availability**: global, Level-1 from August 1982 to May 2012, Level-2 from July 1984 to May 2012. 

**Common Usage**: Monitoring of vegetation, ice and water resources, change detection and the creation of land use - land cover maps.
`;

export const getLandsat15AWS_Markdown = () =>
  t`
  **Landsat 1-5 MSS** collection includes imagery produced with the Multispectral Scanner System (MSS), which was carried onboard Landsat 1 through Landsat 5 satellites. There are 4 optical bands available in 60 m resolution. Data is archived and includes global imagery since 1972. 

  **Spatial resolution**: 68 m x 83 m (commonly resampled to 57 m, or 60 m)
  
  **Revisit time**: 18 days for Landsats 1-3 and 16 days for Landsats 4-5
  
  **Data availability**: Global, since:
  - Landsat 1 from July 1972 to January 1978
  - Landsat 2 from January 1975 to February 1982
  - Landsat 3 from March 1978 to March 1983
  - Landsat 4 from July 1982 to December 1993
  - Landsat 5 from 1984 to October 1992, and from June 2012 to January 2013
  
  **Common Usage**: Monitoring of vegetation, ice and water resources, change detection and the creation of land use - land cover maps.
  `;

export const getLandsat7ETMAWS_Markdown = () => t`  
**Landsat 7 ETM+** includes imagery produced with the Enhanced Thematic Mapper (ETM+) sensor, which was carried onboard Landsat 7 satellite. There are 8 optical and 1 thermal infrared bands available. Global data is available since 1999, with a revisit time of 16 days. Top of the atmosphere level-1, and surface reflectance level-2 products are provided. Note that there are data gaps for all images acquired since 2003-05-30 due to sensor failure.

**Spatial resolution**: 30 meter, 15 meter for a panchromatic band

**Revisit time**: 16 days

**Data availability**: global, since April 1999

**Common Usage**: Monitoring of vegetation, ice and water resources, change detection and the creation of land use - land cover maps.
`;

export const getLandsat89AWS_Markdown = () => t`
The **Landsat 8-9** collection contains imagery from the two most recently launched Landsat satellites (Landsat 8 and Landsat 9, provided by NASA/USGS). Both carry the Operational Land Imager (OLI) and the Thermal Infrared Sensor (TIRS), with 9 optical and 2 thermal bands. These two sensors provide seasonal coverage of the global landmass.

**Spatial resolution:** 15 m for the panchromatic band and 30 m for the rest (the thermal bands is re-sampled from 100 m).

**Revisit time:** 16 days

**Data availability:** Since February 2013

**Common usage:** Vegetation monitoring, land use, land cover maps, change monitoring, etc.
`;

const getLandsatEOCloud_Markdown = getLandsat_Markdown;

export const AWS_LOTL1_Markdown = () =>
  t`**Level-1** data (from **Landsat Collection 2**) provides global top of the atmosphere reflectance and top of the atmosphere brightness temperature products. 
  
  The data underwent several processing steps including geometric and radiometric improvements. 
  
  More info about Level-1 data [here](https://www.usgs.gov/core-science-systems/nli/landsat/landsat-collection-2-level-1-data?qt-science_support_page_related_con=1#qt-science_support_page_related_con) and [here](https://docs.sentinel-hub.com/api/latest/data/landsat-8/)`;

export const AWS_LOTL2_Markdown = () => t`
**Level-2** data (from **Landsat Collection 2**) provides global surface reflectance and surface temperature science products (CEOS Analysis Ready Data). 

The data products are generated from Collection 2 Level-1 inputs that meet the <76 degrees Solar Zenith Angle constraint and include the required auxiliary data inputs to generate a scientifically viable product. 

Learn more about Level-2 data [here](https://www.usgs.gov/core-science-systems/nli/landsat/landsat-collection-2-level-2-science-products) and [here](https://docs.sentinel-hub.com/api/latest/data/landsat-8-l2/).`;

export const AWS_LTML1_Markdown = () =>
  t`**Landsat 4-5 TM Level-1** product provides top of the atmosphere (TOA) reflectance imagery. Level-1 data is produced by processing Landsat TM data with standard processing parameters, such as cubic convolution and terrain correction. Learn more [here](https://collections.sentinel-hub.com/landsat-4-5-tm-l1/) and [here](https://www.usgs.gov/centers/eros/science/usgs-eros-archive-landsat-archives-landsat-4-5-thematic-mapper-collection-2?qt-science_center_objects=0#qt-science_center_objects).`;

export const AWS_LTML2_Markdown = () =>
  t`**Landsat 4-5 TM Level-2** product is produced by processing Level-1 data to surface reflectance - an estimate of the surface spectral reflectance at ground level in the absence of atmospheric scattering and absorption. Learn more [here](https://collections.sentinel-hub.com/landsat-4-5-tm-l2/) and [here](https://www.usgs.gov/centers/eros/science/usgs-eros-archive-landsat-archives-landsat-4-5-tm-collection-2-level-2-science?qt-science_center_objects=0#qt-science_center_objects).`;

export const AWS_LETML1_Markdown = () => t`**Landsat 7 ETM+ Level-1** 

Learn more [here](https://docs.sentinel-hub.com/api/latest/data/landsat-etm/)
`;

export const AWS_LETML2_Markdown = () => t`**Landsat 7 ETM+ Level-2** 

Learn more [here](https://docs.sentinel-hub.com/api/latest/data/landsat-etm-l2/).
`;

const renderHelpTooltip = (tooltip) => (
  <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
    <ReactMarkdown source={tooltip} linkTarget="_blank" />
  </HelpTooltip>
);

export const renderLandsatOptionsHelpTooltips = (option) => {
  switch (option) {
    case AWS_LOTL1:
      return renderHelpTooltip(AWS_LOTL1_Markdown());
    case AWS_LOTL2:
      return renderHelpTooltip(AWS_LOTL2_Markdown());
    case AWS_LTML1:
      return renderHelpTooltip(AWS_LTML1_Markdown());
    case AWS_LTML2:
      return renderHelpTooltip(AWS_LTML2_Markdown());
    case AWS_LETML1:
      return renderHelpTooltip(AWS_LETML1_Markdown());
    case AWS_LETML2:
      return renderHelpTooltip(AWS_LETML2_Markdown());
    default:
      return null;
  }
};

const LandsatTooltip = () =>
  DataSourceTooltip({
    source: getLandsat_Markdown(),
    credits: [
      {
        title: 'USGS',
        link: 'https://www.usgs.gov/core-science-systems/nli/landsat/landsat-satellite-missions',
      },
    ],
  });

export const Landsat45AWSTooltip = () =>
  DataSourceTooltip({
    source: getLandsat45AWS_Markdown(),
    credits: credits[DATASOURCES.AWS_LANDSAT45],
  });

export const Landsat15AWSTooltip = () =>
  DataSourceTooltip({
    source: getLandsat15AWS_Markdown(),
    credits: credits[DATASOURCES.AWS_LANDSAT15],
  });

export const Landsat7ETMAWSTooltip = () =>
  DataSourceTooltip({
    source: getLandsat7ETMAWS_Markdown(),
    credits: credits[DATASOURCES.AWS_LANDSAT7_ETM],
  });

export const Landsat89AWSTooltip = () =>
  DataSourceTooltip({
    source: getLandsat89AWS_Markdown(),
    credits: credits[DATASOURCES.AWS_LANDSAT8],
  });

export const LandsatEOCloudTooltip = () =>
  DataSourceTooltip({
    source: getLandsatEOCloud_Markdown(),
    credits: credits[DATASOURCES.EOCLOUD_LANDSAT],
  });

export default LandsatTooltip;
