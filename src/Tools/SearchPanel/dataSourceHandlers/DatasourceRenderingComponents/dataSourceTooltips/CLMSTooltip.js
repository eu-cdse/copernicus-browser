import { t } from 'ttag';
import DataSourceTooltip from './DataSourceTooltip';

const getCLMSCollectionMarkdown = () => t`
Geographical information on land cover and its changes, land use, ground motion, vegetation state, water cycle and earth surface energy variables for both Europe and the entire globe. Visit the [CLMS website](https://land.copernicus.eu/en) for more information.
`;

const CLMSCollectionTooltip = () =>
  DataSourceTooltip({
    source: getCLMSCollectionMarkdown(),
  });

const getClmsGlobalLcc100mV3YearlyMarkdown = () => t`
  Provides at global level spatial information on different types (classes) of physical coverage of the Earth's surface, e.g. forests, grasslands, croplands, lakes, wetlands for the 2019 base year. The data are updated annually and are available for the 2015-2019 years. More information [here](https://land.copernicus.eu/en/products/global-dynamic-land-cover).`;

const ClmsGlobalLcc100mV3YearlyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLcc100mV3YearlyMarkdown(),
  });

const getClmsGlobalLst5kmV110dailytciMarkdown = () => t`
  Provides a statistical overview of the land surface temperature over each 10-day compositing period regardless of any specific hour and every geostationary sensor image pixel. The data are available at global scale in the spatial resolution of about 5 km and covers the period from January 2017 to January 2021. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/10-daily-land-surface-temperature-thermal-condition-index-global-v1-0-5km).`;

const ClmsGlobalLst5kmV110dailytciTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLst5kmV110dailytciMarkdown(),
  });

const getClmsGlobalLst5kmV110DailyDailyCycleMarkdown = () =>
  t`Provides a statistical overview of the land surface temperature daily cycle for each 10-day compositing period and every geostationary sensor image pixel. The data are available at global scale in the spatial resolution of about 5 km and covers the period from January 2017 to January 2021. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/10-daily-land-surface-temperature-daily-cycle-global-v1-0-5km).`;
const ClmsGlobalLst5kmV110DailyDailyCycleTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalLst5kmV110DailyDailyCycleMarkdown() });

const getClmsGlobalLst5kmV1HourlyMarkdown = () => t`
  Provides hourly land surface temperature from geostationary sensors observations. The data are available at global scale in the spatial resolution of about 5 km and covers the period from July 2010 to January 2021. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/hourly-land-surface-temperature-global-v1-0-5km). \n\n *Please note that under default settings, the dataset displayed for each day is the latest image available, which typically reflects the data captured up to midnight. To access data from a specific hour, use the "Date: time range" mode.`;

const ClmsGlobalLst5kmV1HourlyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLst5kmV1HourlyMarkdown(),
  });

const getClmsGlobalLst5kmV210dailytciMarkdown = () => t`
  Provides a statistical overview of the land surface temperature over each 10-day compositing period regardless of any specific hour and every geostationary sensor image pixel. The data are available at global scale in the spatial resolution of about 5 km and covers the period from January 2021 to January 2023 with version 2.0 and from January 2023 onwards with version 2.1. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/10-daily-land-surface-temperature-thermal-condition-index-global-v2-0-5km).`;

const ClmsGlobalLst5kmV210dailytciTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLst5kmV210dailytciMarkdown(),
  });

const getClmsGlobalLst5kmV2HourlyMarkdown = () => t`
  Provides hourly land surface temperature from geostationary sensors observations. The data are available at global scale in the spatial resolution of about 5 km and covers the period from January 2021 to January 2023 with version 2.0 and from January 2023 onwards with version 2.1. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/hourly-land-surface-temperature-global-v2-0-5km). \n\n *Please note that under default settings, the dataset displayed for each day is the latest image available, which typically reflects the data captured up to midnight. To access data from a specific hour, use the "Date: time range" mode.`;

const ClmsGlobalLst5kmV2HourlyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLst5kmV2HourlyMarkdown(),
  });

const getClmsGlobalLst5kmV210DailyDailyCycleMarkdown = () =>
  t`Provides a statistical overview of the land surface temperature daily cycle for each 10-day compositing period and every geostationary sensor image pixel. The data are available at global scale in the spatial resolution of about 5 km and covers the period from January 2021 to January 2023 with version 2.0 and from January 2023 onwards with version 2.1. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/10-daily-land-surface-temperature-daily-cycle-global-v2-0-5km).`;
const ClmsGlobalLst5kmV210DailyDailyCycleTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalLst5kmV210DailyDailyCycleMarkdown() });

const getClmsGlobalFapar1kmV210dailyMarkdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-1km).`;

const ClmsGlobalFapar1kmV210dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFapar1kmV210dailyMarkdown(),
  });

const getClmsGlobalFapar1kmV210dailyRt0Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-1km).`;

const ClmsGlobalFapar1kmV210dailyRt0Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFapar1kmV210dailyRt0Markdown(),
  });

const getClmsGlobalFapar1kmV210dailyRt1Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-1km).`;

const ClmsGlobalFapar1kmV210dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFapar1kmV210dailyRt1Markdown(),
  });

const getClmsGlobalFapar1kmV210dailyRt2Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-1km).`;

const ClmsGlobalFapar1kmV210dailyRt2Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFapar1kmV210dailyRt2Markdown(),
  });

const getClmsGlobalFapar1kmV210dailyRt6Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-1km).`;

const ClmsGlobalFapar1kmV210dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFapar1kmV210dailyRt6Markdown(),
  });

const getClmsGlobalFapar300mV110dailyMarkdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v1-0-300m).
  `;

const ClmsGlobalFapar300mV110dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFapar300mV110dailyMarkdown(),
  });

const getClmsGlobalFapar300mV110dailyRt0Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v1-0-300m).
  `;

const ClmsGlobalFapar300mV110dailyRt0Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFapar300mV110dailyRt0Markdown(),
  });

const getClmsGlobalFapar300mV110dailyRt1Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v1-0-300m).
  `;

const ClmsGlobalFapar300mV110dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFapar300mV110dailyRt1Markdown(),
  });

const getClmsGlobalFapar300mV110dailyRt2Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v1-0-300m).
  `;

const ClmsGlobalFapar300mV110dailyRt2Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFapar300mV110dailyRt2Markdown(),
  });

const getClmsGlobalFapar300mV110dailyRt6Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v1-0-300m).
  `;

const ClmsGlobalFapar300mV110dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFapar300mV110dailyRt6Markdown(),
  });

const getClmsGlobalLai1kmV210dailyMarkdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-1km).`;

const ClmsGlobalLai1kmV210dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLai1kmV210dailyMarkdown(),
  });

const getClmsGlobalLai1kmV210dailyRt0Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-1km).`;

const ClmsGlobalLai1kmV210dailyRt0Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLai1kmV210dailyRt0Markdown(),
  });

const getClmsGlobalLai1kmV210dailyRt1Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-1km).`;

const ClmsGlobalLai1kmV210dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLai1kmV210dailyRt1Markdown(),
  });

const getClmsGlobalLai1kmV210dailyRt2Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-1km).`;

const ClmsGlobalLai1kmV210dailyRt2Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLai1kmV210dailyRt2Markdown(),
  });

const getClmsGlobalLai1kmV210dailyRt6Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-1km).`;

const ClmsGlobalLai1kmV210dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLai1kmV210dailyRt6Markdown(),
  });

const getClmsGlobalDmp1kmV210dailyMarkdown = () => t`
  Represents the overall growth rate or dry biomass increase of the vegetation and is directly related to ecosystem Net Primary Production (NPP), however with units customized for agro-statistical purposes (kg/ha/day). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v2-0-1km).`;

const ClmsGlobalDmp1kmV210dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalDmp1kmV210dailyMarkdown(),
  });

const getClmsGlobalDmp1kmV210dailyRt1Markdown = () => t`
  Represents the overall growth rate or dry biomass increase of the vegetation and is directly related to ecosystem Net Primary Production (NPP), however with units customized for agro-statistical purposes (kg/ha/day). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v2-0-1km).`;

const ClmsGlobalDmp1kmV210dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalDmp1kmV210dailyRt1Markdown(),
  });

const getClmsGlobalDmp1kmV210dailyRt6Markdown = () => t`
  Represents the overall growth rate or dry biomass increase of the vegetation and is directly related to ecosystem Net Primary Production (NPP), however with units customized for agro-statistical purposes (kg/ha/day). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v2-0-1km).`;

const ClmsGlobalDmp1kmV210dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalDmp1kmV210dailyRt6Markdown(),
  });

const getClmsGlobalDmp300mV110dailyRt1Markdown = () => t`
  Represents the overall growth rate or dry biomass increase of the vegetation and is directly related to ecosystem Net Primary Production (NPP), however with units customized for agro-statistical purposes (kg/ha/day). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v1-0-300m).`;

const ClmsGlobalDmp300mV110dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalDmp300mV110dailyRt1Markdown(),
  });

const getClmsGlobalDmp300mV110dailyRt5Markdown = () => t`
  Represents the overall growth rate or dry biomass increase of the vegetation and is directly related to ecosystem Net Primary Production (NPP), however with units customized for agro-statistical purposes (kg/ha/day). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v1-0-300m).`;

const ClmsGlobalDmp300mV110dailyRt5Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalDmp300mV110dailyRt5Markdown(),
  });

const getClmsGlobalFcover1kmV210dailyMarkdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-1km).`;

const ClmsGlobalFcover1kmV210dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFcover1kmV210dailyMarkdown(),
  });

const getClmsGlobalFcover1kmV210dailyRt0Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-1km).`;

const ClmsGlobalFcover1kmV210dailyRt0Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFcover1kmV210dailyRt0Markdown(),
  });

const getClmsGlobalFcover1kmV210dailyRt1Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-1km).`;

const ClmsGlobalFcover1kmV210dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFcover1kmV210dailyRt1Markdown(),
  });

const getClmsGlobalFcover1kmV210dailyRt2Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-1km).`;

const ClmsGlobalFcover1kmV210dailyRt2Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFcover1kmV210dailyRt2Markdown(),
  });

const getClmsGlobalFcover1kmV210dailyRt6Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-1km).`;

const ClmsGlobalFcover1kmV210dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFcover1kmV210dailyRt6Markdown(),
  });

const getClmsGlobalFcover300mV110dailyMarkdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v1-0-300m).`;

const ClmsGlobalFcover300mV110dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFcover300mV110dailyMarkdown(),
  });

const getClmsGlobalFcover300mV110dailyRt0Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v1-0-300m).`;

const ClmsGlobalFcover300mV110dailyRt0Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFcover300mV110dailyRt0Markdown(),
  });

const getClmsGlobalFcover300mV110dailyRt1Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v1-0-300m).`;

const ClmsGlobalFcover300mV110dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFcover300mV110dailyRt1Markdown(),
  });

const getClmsGlobalFcover300mV110dailyRt2Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v1-0-300m).`;

const ClmsGlobalFcover300mV110dailyRt2Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFcover300mV110dailyRt2Markdown(),
  });

const getClmsGlobalFcover300mV110dailyRt6Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v1-0-300m).`;

const ClmsGlobalFcover300mV110dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalFcover300mV110dailyRt6Markdown(),
  });

const getClmsGlobalGdmp1kmV210dailyMarkdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-1km).`;

const ClmsGlobalGdmp1kmV210dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGdmp1kmV210dailyMarkdown(),
  });

const getClmsGlobalGdmp1kmV210dailyRt0Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-1km).`;

const ClmsGlobalGdmp1kmV210dailyRt0Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGdmp1kmV210dailyRt0Markdown(),
  });

const getClmsGlobalGdmp1kmV210dailyRt1Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-1km).`;

const ClmsGlobalGdmp1kmV210dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGdmp1kmV210dailyRt1Markdown(),
  });

const getClmsGlobalGdmp1kmV210dailyRt2Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-1km).`;

const ClmsGlobalGdmp1kmV210dailyRt2Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGdmp1kmV210dailyRt2Markdown(),
  });

const getClmsGlobalGdmp1kmV210dailyRt6Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-1km).`;

const ClmsGlobalGdmp1kmV210dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGdmp1kmV210dailyRt6Markdown(),
  });

const getClmsGlobalGdmp300mV110dailyRt0Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v1-0-300m).`;

const ClmsGlobalGdmp300mV110dailyRt0Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGdmp300mV110dailyRt0Markdown(),
  });

const getClmsGlobalGdmp300mV110dailyRt1Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v1-0-300m).`;

const ClmsGlobalGdmp300mV110dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGdmp300mV110dailyRt1Markdown(),
  });

const getClmsGlobalGdmp300mV110dailyRt2Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v1-0-300m).`;

const ClmsGlobalGdmp300mV110dailyRt2Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGdmp300mV110dailyRt2Markdown(),
  });

const getClmsGlobalGdmp300mV110dailyRt5Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v1-0-300m).`;

const ClmsGlobalGdmp300mV110dailyRt5Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGdmp300mV110dailyRt5Markdown(),
  });

const getClmsGlobalGdmp300mV110dailyRt6Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v1-0-300m).`;

const ClmsGlobalGdmp300mV110dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGdmp300mV110dailyRt6Markdown(),
  });

const getClmsGlobalNdvi1kmV2StatisticsMarkdown = () => t`
  Based upon SPOT/VEGETATION and PROBA-V NDVI 1km version 2, long-term statistics include the minimum, median, maximum, mean, standard deviation and the number of observations over the 19-years period 1999-2017. More information [here](https://land.copernicus.eu/en/products/vegetation/normalised-difference-vegetation-index-long-term-statistics-v2-0-1km).`;

const ClmsGlobalNdvi1kmV2StatisticsTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNdvi1kmV2StatisticsMarkdown(),
  });

const getClmsGlobalNdvi1kmV3StatisticsMarkdown = () => t`
  Based upon PROBA-V NDVI 1km version 3, short-term statistics include the minimum, median, maximum, mean, standard deviation and the number of observations over the 5-years period 2015-2019. More information [here](https://land.copernicus.eu/en/products/vegetation/normalised-difference-vegetation-long-term-statistics-v3-0-1km).`;

const ClmsGlobalNdvi1kmV3StatisticsTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNdvi1kmV3StatisticsMarkdown(),
  });

const getClmsGlobalNdvi1kmV210dailyMarkdown = () => t`
  Normalized Difference Vegetation Index (NDVI) is an indicator of the greenness of the biomes. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km from April 1998 to 2013 based upon SPOT/VEGETATION data and from 2014 to 2020 based upon PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/normalised-difference-vegetation-long-term-statistics-v3-0-1km).`;

const ClmsGlobalNdvi1kmV210dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNdvi1kmV210dailyMarkdown(),
  });

const getClmsGlobalNdvi300mV110dailyMarkdown = () => t`
  Normalized Difference Vegetation Index (NDVI) is an indicator of the greenness of the biomes. Every 10-days estimates are available at global scale in the spatial resolution of about 300 m from 2014 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/normalized-difference-vegetation-index-300m-v1.0).`;

const ClmsGlobalNdvi300mV110dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNdvi300mV110dailyMarkdown(),
  });

const getClmsGlobalNdvi300mV210dailyMarkdown = () => t`
  Normalized Difference Vegetation Index (NDVI) is an indicator of the greenness of the biomes. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from July 2020 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/normalised-difference-vegetation-index-v2-0-300m).`;

const ClmsGlobalNdvi300mV210dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNdvi300mV210dailyMarkdown(),
  });

const getClmsGlobalNdvi300mV310dailyMarkdown = () => t`
  Normalized Difference Vegetation Index (NDVI) is an indicator of the greenness of the biomes. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to the present.`;

const ClmsGlobalNdvi300mV310dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNdvi300mV310dailyMarkdown(),
  });

const getClmsGlobalSsm1kmV1DailyMarkdown = () => t`
  Provides information on the relative water content of the top few centimeters soil, describing how wet or dry the soil is in its topmost layer, expressed in percent saturation. Daily observations are available for the continental Europe in the spatial resolution of 1 km and with the temporal extent from October 2014 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/daily-surface-soil-moisture-v1.0).`;

const ClmsGlobalSsm1kmV1DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalSsm1kmV1DailyMarkdown(),
  });

const getClmsGlobalBa300mV3MonthlyMarkdown = () => t`
  Maps burn scars, surfaces which have been sufficiently affected by fire to display significant changes in the vegetation cover (destruction of dry material, reduction or loss of green material) and in the ground surface (temporarily darker because of ash). Monthly datasets are available at global scale, in the spatial resolution of 300 m, and with a time lag of two months. They cover the period from 2019 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/burnt-area-v3-1-monthly-300m).`;

const ClmsGlobalBa300mV3MonthlyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalBa300mV3MonthlyMarkdown(),
  });

const getClmsGlobalBa300mV4MonthlyMarkdown = () => t`
  Maps burn scars, surfaces which have been sufficiently affected by fire to display significant changes in the vegetation cover (destruction of dry material, reduction or loss of green material) and in the ground surface (temporarily darker because of ash). Monthly datasets are available at global scale, in the spatial resolution of 300 m, and with a time lag of two months. They cover the period from July 2018 to present. More information _coming soon_.`;

const ClmsGlobalBa300mV4MonthlyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalBa300mV4MonthlyMarkdown(),
  });

const getClmsGlobalBa300mV3DailyMarkdown = () => t`
  Maps burn scars, surfaces which have been sufficiently affected by fire to display significant changes in the vegetation cover (destruction of dry material, reduction or loss of green material) and in the ground surface (temporarily darker because of ash). Daily datasets are available at global scale, in the spatial resolution of 300 m, and within 24 hours after the satellite acquisition. They cover the period from July 2023 to present. More info [here](https://land.copernicus.eu/en/products/vegetation/burnt-area-v3-1-daily-300m).`;

const ClmsGlobalBa300mV3DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalBa300mV3DailyMarkdown(),
  });

const getClmsGlobalBa300mV4DailyMarkdown = () => t`
  Maps burn scars, surfaces which have been sufficiently affected by fire to display significant changes in the vegetation cover (destruction of dry material, reduction or loss of green material) and in the ground surface (temporarily darker because of ash). Daily datasets are available at global scale, in the spatial resolution of 300 m, and within 24 hours after the satellite acquisition. They cover the period from December 2024 to present. More information _coming soon_.`;

const ClmsGlobalBa300mV4DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalBa300mV4DailyMarkdown(),
  });

const getClmsGlobalLsp300mV1YearlyMarkdown = () => t`
  Provide at global scale and for Europe information on vegetation phenology and productivity gathering 13 parameters  for two growing seasons. More information [here](https://land.copernicus.eu/en/products/vegetation?tab=vegetation_phenology_and_productivity_parameters).`;

const ClmsGlobalLsp300mV1YearlyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLsp300mV1YearlyMarkdown(),
  });

const getClmsGlobalLsp300mV2YearlyMarkdown = () => t`
  Provides at global scale and for Europe information on vegetation phenology and productivity gathering 13 parameters for two growing seasons. More information [here](https://land.copernicus.eu/en/products/vegetation?tab=vegetation_phenology_and_productivity_parameters).`;

const ClmsGlobalLsp300mV2YearlyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLsp300mV2YearlyMarkdown(),
  });

const getClmsGlobalGpp300mV110dailyRt0Markdown = () => t`
  Provides the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time. 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v1-0-300m).`;

const ClmsGlobalGpp300mV110dailyRt0Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGpp300mV110dailyRt0Markdown(),
  });

const getClmsGlobalGpp300mV110dailyRt1Markdown = () => t`
  Provides the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time. 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v1-0-300m).`;

const ClmsGlobalGpp300mV110dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGpp300mV110dailyRt1Markdown(),
  });

const getClmsGlobalGpp300mV110dailyRt2Markdown = () => t`
  Provides the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time. 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v1-0-300m).`;

const ClmsGlobalGpp300mV110dailyRt2Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGpp300mV110dailyRt2Markdown(),
  });

const getClmsGlobalGpp300mV110dailyRt6Markdown = () => t`
  Provides the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time. 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v1-0-300m).`;

const ClmsGlobalGpp300mV110dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalGpp300mV110dailyRt6Markdown(),
  });

const getClmsGlobalLai300mV110dailyMarkdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-300m-v1.0).`;

const ClmsGlobalLai300mV110dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLai300mV110dailyMarkdown(),
  });

const getClmsGlobalLai300mV110dailyRt0Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-300m-v1.0).`;

const ClmsGlobalLai300mV110dailyRt0Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLai300mV110dailyRt0Markdown(),
  });

const getClmsGlobalLai300mV110dailyRt1Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-300m-v1.0).`;

const ClmsGlobalLai300mV110dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLai300mV110dailyRt1Markdown(),
  });

const getClmsGlobalLai300mV110dailyRt2Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-300m-v1.0).`;

const ClmsGlobalLai300mV110dailyRt2Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLai300mV110dailyRt2Markdown(),
  });

const getClmsGlobalLai300mV110dailyRt6Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-300m-v1.0).`;

const ClmsGlobalLai300mV110dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLai300mV110dailyRt6Markdown(),
  });

const getClmsGlobalNpp300mV110dailyRt0Markdown = () => t`
  Provides the amount of carbon retained in an ecosystem (increase in biomass); it is equal to the difference between the amount of carbon produced through photosynthesis (GPP) and the amount of energy that is used for respiration (R). 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v1-0-300m).`;

const ClmsGlobalNpp300mV110dailyRt0Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNpp300mV110dailyRt0Markdown(),
  });

const getClmsGlobalNpp300mV110dailyRt1Markdown = () => t`
  Provides the amount of carbon retained in an ecosystem (increase in biomass); it is equal to the difference between the amount of carbon produced through photosynthesis (GPP) and the amount of energy that is used for respiration (R). 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v1-0-300m).`;

const ClmsGlobalNpp300mV110dailyRt1Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNpp300mV110dailyRt1Markdown(),
  });

const getClmsGlobalNpp300mV110dailyRt2Markdown = () => t`
  Provides the amount of carbon retained in an ecosystem (increase in biomass); it is equal to the difference between the amount of carbon produced through photosynthesis (GPP) and the amount of energy that is used for respiration (R). 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v1-0-300m).`;

const ClmsGlobalNpp300mV110dailyRt2Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNpp300mV110dailyRt2Markdown(),
  });

const getClmsGlobalNpp300mV110dailyRt6Markdown = () => t`
  Provides the amount of carbon retained in an ecosystem (increase in biomass); it is equal to the difference between the amount of carbon produced through photosynthesis (GPP) and the amount of energy that is used for respiration (R). 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v1-0-300m).`;

const ClmsGlobalNpp300mV110dailyRt6Tooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNpp300mV110dailyRt6Markdown(),
  });

const getClmsGlobalNdvi1kmV310dailyMarkdown = () => t`
  Normalized Difference Vegetation Index (NDVI) is an indicator of the greenness of the biomes. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km from 1999 to 2013 based upon SPOT/VEGETATION data and from 2014 to June 2020 based upon PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/normalised-difference-vegetation-index-v3-0-1km).`;

const ClmsGlobalNdvi1kmV310dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalNdvi1kmV310dailyMarkdown(),
  });

const getClmsGlobalSwi125kmV310dailyMarkdown = () => t`
  Averages the daily Soil Water Index product over 10 days. The data are produced every 10 days over the globe at the spatial resolution of 0.1° and with the temporal extent from January 2007 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/10-daily-soil-water-index-global-v3-0-12-5-km).`;

const ClmsGlobalSwi125kmV310dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalSwi125kmV310dailyMarkdown(),
  });

const getClmsGlobalSwi125kmV3DailyMarkdown = () => t`
  Provides daily updates on the moisture conditions in different soil layers. The data are available over the globe at the spatial resolution of 0.1° and with the temporal extent from January 2007 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/daily-soil-water-index-global-v3-0-12-5km).`;

const ClmsGlobalSwi125kmV3DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalSwi125kmV3DailyMarkdown(),
  });

const getClmsGlobalSwi1kmV1DailyMarkdown = () => t`
  Quantifies the moisture condition at various depths in the soil. Daily observations are available for the continental Europe in the spatial resolution of 1 km and with the temporal extent from January 2015 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/daily-soil-water-index-europe-v1-0-1km).`;

const ClmsGlobalSwi1kmV1DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalSwi1kmV1DailyMarkdown(),
  });

// LOT2

const getClmsGlobalWb300mV110dailyMarkdown = () =>
  t`Detects the areas covered by inland water providing the maximum and the minimum extent of the water surface as well as the seasonal dynamics. 10-daly data are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2014 to 2020. More information [here](https://land.copernicus.eu/en/products/water-bodies/water-bodies-global-v1-0-300m).`;

const ClmsGlobalWb300mV110dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalWb300mV110dailyMarkdown(),
  });

const getClmsGlobalWb300mV2MonthlyMarkdown = () =>
  t`Detects the areas covered by inland water providing the maximum and the minimum extent of the water surface as well as the seasonal dynamics. Monthly updates are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2020 to present More information [here](https://land.copernicus.eu/en/products/water-bodies/water-bodies-global-v2-0-300m).`;

const ClmsGlobalWb300mV2MonthlyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalWb300mV2MonthlyMarkdown(),
  });

const getClmsGlobalWb1kmV210dailyMarkdown = () => t`Information not currently available.`;
const ClmsGlobalWb1kmV210dailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalWb1kmV210dailyMarkdown(),
  });

const getClmsGlobalSwe5kmV1DailyMarkdown = () =>
  t`Provides for the Northern Hemisphere daily updates of the equivalent amount of liquid water stored in the snow pack. The data is available in the spatial resolution of 5 km and with the temporal extent from January 2006 to June 2024. More information [here](https://land.copernicus.eu/en/products/snow/snow-water-equivalent-v1-0-5km).`;

const ClmsGlobalSwe5kmV1DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalSwe5kmV1DailyMarkdown(),
  });

const getClmsGlobalSwe5kmV2DailyMarkdown = () =>
  t`Provides for the Northern Hemisphere daily updates of the equivalent amount of liquid water stored in the snow pack. The data is available in near real time in the spatial resolution of 5 km and with the temporal extent from July 2024 to present. More information [here](https://land.copernicus.eu/en/products/snow/snow-water-equivalent-v2-0-5km).`;
const ClmsGlobalSwe5kmV2DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalSwe5kmV2DailyMarkdown(),
  });

const getClmsGlobalSceEurope500mV1DailyMarkdown = () =>
  t`Provides for Europe daily updates of the fraction of snow cover on the ground (also in forested areas) per pixel in percentage (0% – 100%). The data is available in near real time in the spatial resolution of 500 m and with the temporal extent from March 2017 to present. More information [here](https://land.copernicus.eu/en/products/snow/snow-cover-extent-europe-v1-0-500m).`;
const ClmsGlobalSce500mV1DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalSceEurope500mV1DailyMarkdown(),
  });

const getClmsNorthernHemisphereSce1kmV1DailyMarkdown = () =>
  t`Provides for Northern Hemisphere daily maps of the fraction of snow cover on ground (also in forested areas) per pixel in percentage (0% – 100%). The data is available in near real time with a pixel spacing of about 1 km and with the temporal extent from January 2018 to present. More information [here](https://land.copernicus.eu/en/products/snow/snow-cover-extent-northern-hemisphere-v1-0-1km).`;
const ClmsNorthernHemisphereSce1kmV1DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsNorthernHemisphereSce1kmV1DailyMarkdown(),
  });

const getClmsGlobalSce1kmV1DailyMarkdown = () =>
  t`Provides global daily updates of the fraction of snow cover on the ground (also in forested areas) and uncertainty per pixel in percentage (0% – 100%). The data is available in near real time with a pixel spacing of about 1 km and with the temporal extent from December 2025 to present.`;
const ClmsGlobalSce1kmV1DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalSce1kmV1DailyMarkdown(),
  });

const getClmsGlobalLie500mV1DailyMarkdown = () =>
  t`On a daily basis classifies pixels in Northern Hemisphere freshwater bodies into 1) Ice, 2) Open water, and 3) Cloud. The class “Ice” includes various types of ice, also snow-covered ice. The data is updated in near real-time with the spatial resolution of 500 m and with has a temporal extent from April 2021 to present. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-ice-extent-northern-hemisphere-500m).`;
const ClmsGlobalLie500mV1DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLie500mV1DailyMarkdown(),
  });

const getClmsGlobalLie250mV2DailyMarkdown = () =>
  t`On a daily basis, classifies pixels of Continental Europe freshwater bodies as 1) Fully snow-covered ice, 2) Partially snow-covered or snow-free ice, and 3) Open water. The data is available in near real time in a spatial resolution of 250 m and with the temporal extent from July the 1st, onwards. In June 2024, the data input sensor was transferred from Terra MODIS (VERSION 1.2.1) to NOAA-20 VIIRS (VERSION 2.2.1), and the area was extended from the Baltic region to cover Continental Europe. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-ice-extent-europe-v2-250m).`;
const ClmsGlobalLie250mV2DailyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalLie250mV2DailyMarkdown(),
  });

const getClmsGlobalWb100mV1MonthlyMarkdown = () => t`
  Detects the areas covered by inland water along the year providing the maximum and the minimum extent of the water surface as well as the seasonal dynamics. Monthly updates are available at global scale in the spatial resolution of 100 m and with the temporal extent from 2020 to present. More information [here](https://land.copernicus.eu/en/products/water-bodies/water-bodies-global-v1-0-100m).`;
const ClmsGlobalWb100mV1MonthlyTooltip = () =>
  DataSourceTooltip({
    source: getClmsGlobalWb100mV1MonthlyMarkdown(),
  });

const getClmsGlobalLwq300mV210DailyNrtMarkdown = () =>
  t`Provides semi-continuous observations for a large number of medium and large-sized lakes. 10-daily observations are available in near real time at 300 m spatial resolution from September 2024 to present. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-water-quality-near-real-time-v2-0-300m).`;
const ClmsGlobalLwq300mV210DailyNrtTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalLwq300mV210DailyNrtMarkdown() });

const getClmsGlobalLwq300mV110DailyReprocMarkdown = () =>
  t`Provides semi-continuous observations for a large number of medium and large-sized lakes, according to the Global Lakes and Wetlands Database (GLWD) or otherwise of specific environmental monitoring interest. 10-daily observations are available in the spatial resolution of 300 m and with the temporal extent from 2002 to 2012. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-water-quality-offline-v1-0-300m).`;
const ClmsGlobalLwq300mV110DailyReprocTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalLwq300mV110DailyReprocMarkdown() });

const getClmsGlobalLwq300mV110DailyNrtMarkdown = () =>
  t`Provides semi-continuous observations for a large number of medium and large-sized lakes, according to the Global Lakes and Wetlands Database (GLWD) or otherwise of specific environmental monitoring interest. 10-daily observations are available in the spatial resolution of 300 m and with the temporal extent from 2016 to 2024. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-water-quality-offline-v1-0-300m).`;
const ClmsGlobalLwq300mV110DailyNrtTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalLwq300mV110DailyNrtMarkdown() });

const getClmsGlobalLwq100mV110DailyNrtMarkdown = () =>
  t`Provides semi-continuous observations for a large number of medium and large-sized lakes, according to the Global Lakes and Wetlands Database (GLWD) or otherwise of specific environmental monitoring interest. 10-daily observations are available in near real time in the spatial resolution of 100 m and with the temporal extent from 2019 to 2024. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-water-quality-v1-0-100m).`;
const ClmsGlobalLwq100mV110DailyNrtTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalLwq100mV110DailyNrtMarkdown() });

const getClmsGlobalLcm10mV1YearlyMarkdown = () =>
  t`Provides spatial information at global level on different types (classes) of physical coverage of the Earth's surface, e.g. forests, grasslands, croplands, water bodies, wetlands for the base year 2020. More information [here](https://land.copernicus.eu/en/products?tab=full_coverage_land_cover__use).`;
const ClmsGlobalLcm10mV1YearlyTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalLcm10mV1YearlyMarkdown() });

const getClmsPantropicalTcd10mV1YearlyMarkdown = () =>
  t`Provides spatial information at pantropical level on tree canopy density in percent per pixel for 2020 reference year in a discrete range between 0% and 100%. More information [here](https://land.copernicus.eu/en/products?tab=full_coverage_land_cover__use).`;
const ClmsPantropicalTcd10mV1YearlyTooltip = () =>
  DataSourceTooltip({ source: getClmsPantropicalTcd10mV1YearlyMarkdown() });

const getClmsGlobalLie500mV2DailyMarkdown = () =>
  t`On a daily basis classifies pixels in Global freshwater bodies into 1) Snow-covered ice, 2) Partially snow-covered or snow-free ice, 3) Open water, and 4) Cloud. The data is updated in near-real time with the spatial resolution of 500 m and with a temporal extent from July 2025 to present. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-ice-extent-global-500m_v2).`;
const ClmsGlobalLie500mV2DailyTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalLie500mV2DailyMarkdown() });

const getClmsGlobalSwi125kmV4DailyMarkdown = () =>
  t`Provides daily updates on the moisture conditions in different soil layers. The data are available over the globe at the spatial resolution of 0.1° and with the temporal extent from 2007 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/daily-soil-water-index-global-12-5km).`;
const ClmsGlobalSwi125kmV4DailyTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalSwi125kmV4DailyMarkdown() });

const getClmsEuropeSwi1kmV2DailyMarkdown = () =>
  t`Quantifies the moisture condition at various depths in the soil. Daily observations are available for the continental Europe in the spatial resolution of 1 km and with the temporal extent from July 2025 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/daily-soil-water-index-europe-1km).`;
const ClmsEuropeSwi1kmV2DailyTooltip = () =>
  DataSourceTooltip({ source: getClmsEuropeSwi1kmV2DailyMarkdown() });

const getClmsGlobalSwi125km10V4DailyMarkdown = () =>
  t`Averages the daily Soil Water Index product over 10 days. The data are produced every 10 days over the globe at the spatial resolution of 0.1° and with the temporal extent from January 2007 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/10-daily-soil-water-index-global-v3-0-12-5-km).`;
const ClmsGlobalSwi125km10V4DailyTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalSwi125km10V4DailyMarkdown() });

const getClmsBalticLie250mV1DailyMarkdown = () =>
  t`On daily basis for the Northern Europe classifies, in pixels, inland/freshwater bodies as 1) Fully snow-covered ice, 2) Partially snow-covered or snow-free ice, 3) Open water. The data is available in near real time in the spatial resolution of 250 m and with the temporal extent from March 2017 to 30 June 2024. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-ice-extent-baltic-v1-250m).`;
const ClmsBalticLie250mV1DailyTooltip = () =>
  DataSourceTooltip({ source: getClmsBalticLie250mV1DailyMarkdown() });

const getClmsGlobalEta300mV110dailyMarkdown = () =>
  t`Provides actual evapotranspiration, soil evaporation and canopy transpiration with some quality indicators. Estimates are provided for two evapotranspiration schemes and an Ensemble of models. Every 10-days estimate are available in near real time at global scale in the spatial resolution of about 300 m from November 2025 onwards in version 1.0. More information [here](https://land.copernicus.eu/en/products/evapotranspiration/evapotranspiration-2025-present-raster-300m-global-10-daily-version-1).`;
const ClmsGlobalEta300mV110dailyTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalEta300mV110dailyMarkdown() });

const getClmsGlobalHf300mV1DailyMarkdown = () =>
  t`Provides latent and sensible heat fluxes with one auxiliary information. Estimates are provided for each Sentinel-3 overpass in near real time at global scale in the spatial resolution of about 300 m from November 2025 onwards in version 1.0. More information [here](https://land.copernicus.eu/en/products/evapotranspiration/heat-flux-2025-present-raster-300-m-global-daily-version-1).`;
const ClmsGlobalHf300mV1DailyTooltip = () =>
  DataSourceTooltip({ source: getClmsGlobalHf300mV1DailyMarkdown() });

const getClmsLswtOffline1kmV110DailyMarkdown = () =>
  t`Provides the temperature of the water at the lake surface. The LSWT observations (every 10 days) are available at global scale at spatial resolution of ~1 km and with the temporal extent from 2002 to 2012. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/lake-surface-water-temperature-offline-1km).`;
const ClmsLswtOffline1kmV110DailyTooltip = () =>
  DataSourceTooltip({ source: getClmsLswtOffline1kmV110DailyMarkdown() });

const getClmsLswtNrt1kmV110DailyMarkdown = () =>
  t`Provides the temperature of the water at the lake surface. The near real time observations (every 10 days) are available at global scale at spatial resolution of ~1 km and with the temporal extent from 2016 to present. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/lake-surface-water-temperature-near-real-time-v1-0-1km).`;
const ClmsLswtNrt1kmV110DailyTooltip = () =>
  DataSourceTooltip({ source: getClmsLswtNrt1kmV110DailyMarkdown() });

const getClmsLwqNrt100mV210DailyMarkdown = () =>
  t`Provides semi-continuous observations for a large number of medium and large-sized lakes, according to the Global Lakes and Wetlands Database (GLWD) or otherwise of specific environmental monitoring interest. 10-daily observations are available in near real time at 100 m spatial resolution from September 2024 to present. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-water-quality-v2-0-100m).`;
const ClmsLwqNrt100mV210DailyTooltip = () =>
  DataSourceTooltip({ source: getClmsLwqNrt100mV210DailyMarkdown() });

export {
  getCLMSCollectionMarkdown,
  CLMSCollectionTooltip,
  getClmsGlobalLcc100mV3YearlyMarkdown,
  ClmsGlobalLcc100mV3YearlyTooltip,
  getClmsGlobalLst5kmV110dailytciMarkdown,
  ClmsGlobalLst5kmV110dailytciTooltip,
  getClmsGlobalLst5kmV1HourlyMarkdown,
  ClmsGlobalLst5kmV1HourlyTooltip,
  getClmsGlobalLst5kmV210dailytciMarkdown,
  ClmsGlobalLst5kmV210dailytciTooltip,
  getClmsGlobalLst5kmV2HourlyMarkdown,
  ClmsGlobalLst5kmV2HourlyTooltip,
  getClmsGlobalFapar1kmV210dailyMarkdown,
  ClmsGlobalFapar1kmV210dailyTooltip,
  getClmsGlobalFapar1kmV210dailyRt0Markdown,
  ClmsGlobalFapar1kmV210dailyRt0Tooltip,
  getClmsGlobalFapar1kmV210dailyRt1Markdown,
  ClmsGlobalFapar1kmV210dailyRt1Tooltip,
  getClmsGlobalFapar1kmV210dailyRt2Markdown,
  ClmsGlobalFapar1kmV210dailyRt2Tooltip,
  getClmsGlobalFapar1kmV210dailyRt6Markdown,
  ClmsGlobalFapar1kmV210dailyRt6Tooltip,
  getClmsGlobalFapar300mV110dailyMarkdown,
  ClmsGlobalFapar300mV110dailyTooltip,
  getClmsGlobalFapar300mV110dailyRt0Markdown,
  ClmsGlobalFapar300mV110dailyRt0Tooltip,
  getClmsGlobalFapar300mV110dailyRt1Markdown,
  ClmsGlobalFapar300mV110dailyRt1Tooltip,
  getClmsGlobalFapar300mV110dailyRt2Markdown,
  ClmsGlobalFapar300mV110dailyRt2Tooltip,
  getClmsGlobalFapar300mV110dailyRt6Markdown,
  ClmsGlobalFapar300mV110dailyRt6Tooltip,
  getClmsGlobalLai1kmV210dailyMarkdown,
  ClmsGlobalLai1kmV210dailyTooltip,
  getClmsGlobalLai1kmV210dailyRt0Markdown,
  ClmsGlobalLai1kmV210dailyRt0Tooltip,
  getClmsGlobalLai1kmV210dailyRt1Markdown,
  ClmsGlobalLai1kmV210dailyRt1Tooltip,
  getClmsGlobalLai1kmV210dailyRt2Markdown,
  ClmsGlobalLai1kmV210dailyRt2Tooltip,
  getClmsGlobalLai1kmV210dailyRt6Markdown,
  ClmsGlobalLai1kmV210dailyRt6Tooltip,
  getClmsGlobalDmp1kmV210dailyMarkdown,
  ClmsGlobalDmp1kmV210dailyTooltip,
  getClmsGlobalDmp1kmV210dailyRt1Markdown,
  ClmsGlobalDmp1kmV210dailyRt1Tooltip,
  getClmsGlobalDmp1kmV210dailyRt6Markdown,
  ClmsGlobalDmp1kmV210dailyRt6Tooltip,
  getClmsGlobalDmp300mV110dailyRt1Markdown,
  ClmsGlobalDmp300mV110dailyRt1Tooltip,
  getClmsGlobalDmp300mV110dailyRt5Markdown,
  ClmsGlobalDmp300mV110dailyRt5Tooltip,
  getClmsGlobalFcover1kmV210dailyMarkdown,
  ClmsGlobalFcover1kmV210dailyTooltip,
  getClmsGlobalFcover1kmV210dailyRt0Markdown,
  ClmsGlobalFcover1kmV210dailyRt0Tooltip,
  getClmsGlobalFcover1kmV210dailyRt1Markdown,
  ClmsGlobalFcover1kmV210dailyRt1Tooltip,
  getClmsGlobalFcover1kmV210dailyRt2Markdown,
  ClmsGlobalFcover1kmV210dailyRt2Tooltip,
  getClmsGlobalFcover1kmV210dailyRt6Markdown,
  ClmsGlobalFcover1kmV210dailyRt6Tooltip,
  getClmsGlobalFcover300mV110dailyMarkdown,
  ClmsGlobalFcover300mV110dailyTooltip,
  getClmsGlobalFcover300mV110dailyRt0Markdown,
  ClmsGlobalFcover300mV110dailyRt0Tooltip,
  getClmsGlobalFcover300mV110dailyRt1Markdown,
  ClmsGlobalFcover300mV110dailyRt1Tooltip,
  getClmsGlobalFcover300mV110dailyRt2Markdown,
  ClmsGlobalFcover300mV110dailyRt2Tooltip,
  getClmsGlobalFcover300mV110dailyRt6Markdown,
  ClmsGlobalFcover300mV110dailyRt6Tooltip,
  getClmsGlobalGdmp1kmV210dailyMarkdown,
  ClmsGlobalGdmp1kmV210dailyTooltip,
  getClmsGlobalGdmp1kmV210dailyRt0Markdown,
  ClmsGlobalGdmp1kmV210dailyRt0Tooltip,
  getClmsGlobalGdmp1kmV210dailyRt1Markdown,
  ClmsGlobalGdmp1kmV210dailyRt1Tooltip,
  getClmsGlobalGdmp1kmV210dailyRt2Markdown,
  ClmsGlobalGdmp1kmV210dailyRt2Tooltip,
  getClmsGlobalGdmp1kmV210dailyRt6Markdown,
  ClmsGlobalGdmp1kmV210dailyRt6Tooltip,
  getClmsGlobalGdmp300mV110dailyRt0Markdown,
  ClmsGlobalGdmp300mV110dailyRt0Tooltip,
  getClmsGlobalGdmp300mV110dailyRt1Markdown,
  ClmsGlobalGdmp300mV110dailyRt1Tooltip,
  getClmsGlobalGdmp300mV110dailyRt2Markdown,
  ClmsGlobalGdmp300mV110dailyRt2Tooltip,
  getClmsGlobalGdmp300mV110dailyRt5Markdown,
  ClmsGlobalGdmp300mV110dailyRt5Tooltip,
  getClmsGlobalGdmp300mV110dailyRt6Markdown,
  ClmsGlobalGdmp300mV110dailyRt6Tooltip,
  getClmsGlobalNdvi1kmV2StatisticsMarkdown,
  ClmsGlobalNdvi1kmV2StatisticsTooltip,
  getClmsGlobalNdvi1kmV3StatisticsMarkdown,
  ClmsGlobalNdvi1kmV3StatisticsTooltip,
  getClmsGlobalNdvi1kmV210dailyMarkdown,
  ClmsGlobalNdvi1kmV210dailyTooltip,
  getClmsGlobalNdvi300mV110dailyMarkdown,
  ClmsGlobalNdvi300mV110dailyTooltip,
  getClmsGlobalNdvi300mV210dailyMarkdown,
  ClmsGlobalNdvi300mV210dailyTooltip,
  getClmsGlobalNdvi300mV310dailyMarkdown,
  ClmsGlobalNdvi300mV310dailyTooltip,
  getClmsGlobalSsm1kmV1DailyMarkdown,
  ClmsGlobalSsm1kmV1DailyTooltip,
  getClmsGlobalBa300mV3MonthlyMarkdown,
  ClmsGlobalBa300mV3MonthlyTooltip,
  getClmsGlobalBa300mV3DailyMarkdown,
  ClmsGlobalBa300mV3DailyTooltip,
  getClmsGlobalLsp300mV1YearlyMarkdown,
  ClmsGlobalLsp300mV2YearlyTooltip,
  getClmsGlobalLsp300mV2YearlyMarkdown,
  ClmsGlobalLsp300mV1YearlyTooltip,
  getClmsGlobalGpp300mV110dailyRt0Markdown,
  ClmsGlobalGpp300mV110dailyRt0Tooltip,
  getClmsGlobalGpp300mV110dailyRt1Markdown,
  ClmsGlobalGpp300mV110dailyRt1Tooltip,
  getClmsGlobalGpp300mV110dailyRt2Markdown,
  ClmsGlobalGpp300mV110dailyRt2Tooltip,
  getClmsGlobalGpp300mV110dailyRt6Markdown,
  ClmsGlobalGpp300mV110dailyRt6Tooltip,
  getClmsGlobalLai300mV110dailyMarkdown,
  ClmsGlobalLai300mV110dailyTooltip,
  getClmsGlobalLai300mV110dailyRt0Markdown,
  ClmsGlobalLai300mV110dailyRt0Tooltip,
  getClmsGlobalLai300mV110dailyRt1Markdown,
  ClmsGlobalLai300mV110dailyRt1Tooltip,
  getClmsGlobalLai300mV110dailyRt2Markdown,
  ClmsGlobalLai300mV110dailyRt2Tooltip,
  getClmsGlobalLai300mV110dailyRt6Markdown,
  ClmsGlobalLai300mV110dailyRt6Tooltip,
  getClmsGlobalNpp300mV110dailyRt0Markdown,
  ClmsGlobalNpp300mV110dailyRt0Tooltip,
  getClmsGlobalNpp300mV110dailyRt1Markdown,
  ClmsGlobalNpp300mV110dailyRt1Tooltip,
  getClmsGlobalNpp300mV110dailyRt2Markdown,
  ClmsGlobalNpp300mV110dailyRt2Tooltip,
  getClmsGlobalNpp300mV110dailyRt6Markdown,
  ClmsGlobalNpp300mV110dailyRt6Tooltip,
  getClmsGlobalNdvi1kmV310dailyMarkdown,
  ClmsGlobalNdvi1kmV310dailyTooltip,
  getClmsGlobalSwi125kmV310dailyMarkdown,
  ClmsGlobalSwi125kmV310dailyTooltip,
  getClmsGlobalSwi125kmV3DailyMarkdown,
  ClmsGlobalSwi125kmV3DailyTooltip,
  getClmsGlobalSwi1kmV1DailyMarkdown,
  ClmsGlobalSwi1kmV1DailyTooltip,
  getClmsGlobalWb300mV110dailyMarkdown,
  ClmsGlobalWb300mV110dailyTooltip,
  getClmsGlobalWb300mV2MonthlyMarkdown,
  ClmsGlobalWb300mV2MonthlyTooltip,
  getClmsGlobalWb1kmV210dailyMarkdown,
  ClmsGlobalWb1kmV210dailyTooltip,
  getClmsGlobalSwe5kmV1DailyMarkdown,
  ClmsGlobalSwe5kmV1DailyTooltip,
  getClmsGlobalSwe5kmV2DailyMarkdown,
  ClmsGlobalSwe5kmV2DailyTooltip,
  getClmsGlobalSceEurope500mV1DailyMarkdown,
  ClmsGlobalSce500mV1DailyTooltip,
  getClmsNorthernHemisphereSce1kmV1DailyMarkdown,
  ClmsNorthernHemisphereSce1kmV1DailyTooltip,
  ClmsGlobalSce1kmV1DailyTooltip,
  getClmsGlobalSce1kmV1DailyMarkdown,
  getClmsGlobalLie500mV1DailyMarkdown,
  ClmsGlobalLie500mV1DailyTooltip,
  getClmsGlobalLie250mV2DailyMarkdown,
  ClmsGlobalLie250mV2DailyTooltip,
  getClmsGlobalWb100mV1MonthlyMarkdown,
  ClmsGlobalWb100mV1MonthlyTooltip,
  getClmsGlobalLst5kmV110DailyDailyCycleMarkdown,
  ClmsGlobalLst5kmV110DailyDailyCycleTooltip,
  getClmsGlobalLst5kmV210DailyDailyCycleMarkdown,
  ClmsGlobalLst5kmV210DailyDailyCycleTooltip,
  getClmsGlobalLwq300mV210DailyNrtMarkdown,
  ClmsGlobalLwq300mV210DailyNrtTooltip,
  getClmsGlobalLwq300mV110DailyReprocMarkdown,
  ClmsGlobalLwq300mV110DailyReprocTooltip,
  getClmsGlobalLwq300mV110DailyNrtMarkdown,
  ClmsGlobalLwq300mV110DailyNrtTooltip,
  getClmsGlobalLwq100mV110DailyNrtMarkdown,
  ClmsGlobalLwq100mV110DailyNrtTooltip,
  getClmsGlobalLcm10mV1YearlyMarkdown,
  ClmsGlobalLcm10mV1YearlyTooltip,
  getClmsPantropicalTcd10mV1YearlyMarkdown,
  ClmsPantropicalTcd10mV1YearlyTooltip,
  getClmsGlobalLie500mV2DailyMarkdown,
  ClmsGlobalLie500mV2DailyTooltip,
  getClmsGlobalSwi125kmV4DailyMarkdown,
  ClmsGlobalSwi125kmV4DailyTooltip,
  getClmsEuropeSwi1kmV2DailyMarkdown,
  ClmsEuropeSwi1kmV2DailyTooltip,
  ClmsGlobalSwi125km10V4DailyTooltip,
  getClmsGlobalSwi125km10V4DailyMarkdown,
  ClmsGlobalBa300mV4MonthlyTooltip,
  getClmsGlobalBa300mV4MonthlyMarkdown,
  ClmsGlobalBa300mV4DailyTooltip,
  getClmsGlobalBa300mV4DailyMarkdown,
  ClmsBalticLie250mV1DailyTooltip,
  getClmsBalticLie250mV1DailyMarkdown,
  ClmsGlobalEta300mV110dailyTooltip,
  getClmsGlobalEta300mV110dailyMarkdown,
  ClmsGlobalHf300mV1DailyTooltip,
  getClmsGlobalHf300mV1DailyMarkdown,
  ClmsLswtOffline1kmV110DailyTooltip,
  getClmsLswtOffline1kmV110DailyMarkdown,
  ClmsLswtNrt1kmV110DailyTooltip,
  getClmsLswtNrt1kmV110DailyMarkdown,
  ClmsLwqNrt100mV210DailyTooltip,
  getClmsLwqNrt100mV210DailyMarkdown,
};
