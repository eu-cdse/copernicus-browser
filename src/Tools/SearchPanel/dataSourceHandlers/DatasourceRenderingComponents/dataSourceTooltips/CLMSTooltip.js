import { t } from 'ttag';

const getCLMSCollectionMarkdown = () => t`
Geographical information on land cover and its changes, land use, ground motion, vegetation state, water cycle and earth surface energy variables for both Europe and the entire globe. Visit the [CLMS website](https://land.copernicus.eu/en) for more information.
`;

const getClmsGlobalLcc100mV3YearlyMarkdown = () => t`
  Provides at global level spatial information on different types (classes) of physical coverage of the Earth's surface, e.g. forests, grasslands, croplands, lakes, wetlands for the 2019 base year. The data are updated annually and are available for the 2015-2019 years. More information [here](https://land.copernicus.eu/en/products/global-dynamic-land-cover).`;

const getClmsGlobalLst5kmV110dailytciMarkdown = () => t`
  Provides a statistical overview of the land surface temperature over each 10-day compositing period regardless of any specific hour and every geostationary sensor image pixel. The data are available at global scale in the spatial resolution of about 5 km and covers the period from January 2017 to January 2021. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/10-daily-land-surface-temperature-thermal-condition-index-global-v1-0-5km).`;

const getClmsGlobalLst5kmV110DailyDailyCycleMarkdown = () =>
  t`Provides a statistical overview of the land surface temperature daily cycle for each 10-day compositing period and every geostationary sensor image pixel. The data are available at global scale in the spatial resolution of about 5 km and covers the period from January 2017 to January 2021. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/10-daily-land-surface-temperature-daily-cycle-global-v1-0-5km).`;

const getClmsGlobalLst5kmV1HourlyMarkdown = () => t`
  Provides hourly land surface temperature from geostationary sensors observations. The data are available at global scale in the spatial resolution of about 5 km and covers the period from July 2010 to January 2021. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/hourly-land-surface-temperature-global-v1-0-5km). \n\n *Please note that under default settings, the dataset displayed for each day is the latest image available, which typically reflects the data captured up to midnight. To access data from a specific hour, use the "Date: time range" mode.`;

const getClmsGlobalLst5kmV210dailytciMarkdown = () => t`
  Provides a statistical overview of the land surface temperature over each 10-day compositing period regardless of any specific hour and every geostationary sensor image pixel. The data are available at global scale in the spatial resolution of about 5 km and covers the period from January 2021 to January 2023 with version 2.0 and from January 2023 onwards with version 2.1. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/10-daily-land-surface-temperature-thermal-condition-index-global-v2-0-5km).`;

const getClmsGlobalLst5kmV2HourlyMarkdown = () => t`
  Provides hourly land surface temperature from geostationary sensors observations. The data are available at global scale in the spatial resolution of about 5 km and covers the period from January 2021 to January 2023 with version 2.0 and from January 2023 onwards with version 2.1. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/hourly-land-surface-temperature-global-v2-0-5km). \n\n *Please note that under default settings, the dataset displayed for each day is the latest image available, which typically reflects the data captured up to midnight. To access data from a specific hour, use the "Date: time range" mode.`;

const getClmsGlobalLst5kmV210DailyDailyCycleMarkdown = () =>
  t`Provides a statistical overview of the land surface temperature daily cycle for each 10-day compositing period and every geostationary sensor image pixel. The data are available at global scale in the spatial resolution of about 5 km and covers the period from January 2021 to January 2023 with version 2.0 and from January 2023 onwards with version 2.1. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/10-daily-land-surface-temperature-daily-cycle-global-v2-0-5km).`;

const getClmsGlobalFapar1kmV210dailyMarkdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-1km).`;

const getClmsGlobalFapar1kmV210dailyRt0Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-1km).`;

const getClmsGlobalFapar1kmV210dailyRt1Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-1km).`;

const getClmsGlobalFapar1kmV210dailyRt2Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-1km).`;

const getClmsGlobalFapar1kmV210dailyRt6Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-1km).`;

const getClmsGlobalFapar300mV110dailyMarkdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v1-0-300m).
  `;

const getClmsGlobalFapar300mV110dailyRt0Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v1-0-300m).
  `;

const getClmsGlobalFapar300mV110dailyRt1Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v1-0-300m).
  `;

const getClmsGlobalFapar300mV110dailyRt2Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v1-0-300m).
  `;

const getClmsGlobalFapar300mV110dailyRt6Markdown = () => t`
  Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v1-0-300m).
  `;

const getClmsGlobalLai1kmV210dailyMarkdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-1km).`;

const getClmsGlobalLai1kmV210dailyRt0Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-1km).`;

const getClmsGlobalLai1kmV210dailyRt1Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-1km).`;

const getClmsGlobalLai1kmV210dailyRt2Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-1km).`;

const getClmsGlobalLai1kmV210dailyRt6Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-1km).`;

const getClmsGlobalDmp1kmV210dailyMarkdown = () => t`
  Represents the overall growth rate or dry biomass increase of the vegetation and is directly related to ecosystem Net Primary Production (NPP), however with units customized for agro-statistical purposes (kg/ha/day). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v2-0-1km).`;

const getClmsGlobalDmp1kmV210dailyRt1Markdown = () => t`
  Represents the overall growth rate or dry biomass increase of the vegetation and is directly related to ecosystem Net Primary Production (NPP), however with units customized for agro-statistical purposes (kg/ha/day). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v2-0-1km).`;

const getClmsGlobalDmp1kmV210dailyRt6Markdown = () => t`
  Represents the overall growth rate or dry biomass increase of the vegetation and is directly related to ecosystem Net Primary Production (NPP), however with units customized for agro-statistical purposes (kg/ha/day). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v2-0-1km).`;

const getClmsGlobalDmp300mV110dailyRt1Markdown = () => t`
  Represents the overall growth rate or dry biomass increase of the vegetation and is directly related to ecosystem Net Primary Production (NPP), however with units customized for agro-statistical purposes (kg/ha/day). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v1-0-300m).`;

const getClmsGlobalDmp300mV110dailyRt5Markdown = () => t`
  Represents the overall growth rate or dry biomass increase of the vegetation and is directly related to ecosystem Net Primary Production (NPP), however with units customized for agro-statistical purposes (kg/ha/day). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v1-0-300m).`;

const getClmsGlobalFcover1kmV210dailyMarkdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-1km).`;

const getClmsGlobalFcover1kmV210dailyRt0Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-1km).`;

const getClmsGlobalFcover1kmV210dailyRt1Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-1km).`;

const getClmsGlobalFcover1kmV210dailyRt2Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-1km).`;

const getClmsGlobalFcover1kmV210dailyRt6Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km covering the period from 1999 to June 2020 from SPOT/VEGETATION and PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-1km).`;

const getClmsGlobalFcover300mV110dailyMarkdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v1-0-300m).`;

const getClmsGlobalFcover300mV110dailyRt0Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v1-0-300m).`;

const getClmsGlobalFcover300mV110dailyRt1Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v1-0-300m).`;

const getClmsGlobalFcover300mV110dailyRt2Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v1-0-300m).`;

const getClmsGlobalFcover300mV110dailyRt6Markdown = () => t`
  Corresponds to the fraction of ground covered by green vegetation. It quantifies the spatial extent of the vegetation. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v1-0-300m).`;

const getClmsGlobalGdmp1kmV210dailyMarkdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-1km).`;

const getClmsGlobalGdmp1kmV210dailyRt0Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-1km).`;

const getClmsGlobalGdmp1kmV210dailyRt1Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-1km).`;

const getClmsGlobalGdmp1kmV210dailyRt2Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-1km).`;

const getClmsGlobalGdmp1kmV210dailyRt6Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available at global scale in the spatial resolution of about 1km and with the temporal extent from 1999 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-1km).`;

const getClmsGlobalGdmp300mV110dailyRt0Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v1-0-300m).`;

const getClmsGlobalGdmp300mV110dailyRt1Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v1-0-300m).`;

const getClmsGlobalGdmp300mV110dailyRt2Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v1-0-300m).`;

const getClmsGlobalGdmp300mV110dailyRt5Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v1-0-300m).`;

const getClmsGlobalGdmp300mV110dailyRt6Markdown = () => t`
  Equivalent to Gross Primary Production (GPP). Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v1-0-300m).`;

const getClmsGlobalNdvi1kmV3StatisticsMarkdown = () => t`
  Based upon PROBA-V NDVI 1km version 3, short-term statistics include the minimum, median, maximum, mean, standard deviation and the number of observations over the 5-years period 2015-2019. More information [here](https://land.copernicus.eu/en/products/vegetation/normalised-difference-vegetation-long-term-statistics-v3-0-1km).`;

const getClmsGlobalNdvi300mV110dailyMarkdown = () => t`
  Normalized Difference Vegetation Index (NDVI) is an indicator of the greenness of the biomes. Every 10-days estimates are available at global scale in the spatial resolution of about 300 m from 2014 to June 2020. More information [here](https://land.copernicus.eu/en/products/vegetation/normalized-difference-vegetation-index-300m-v1.0).`;

const getClmsGlobalNdvi300mV210dailyMarkdown = () => t`
  Normalized Difference Vegetation Index (NDVI) is an indicator of the greenness of the biomes. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from July 2020 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/normalised-difference-vegetation-index-v2-0-300m).`;

const getClmsGlobalNdvi300mV310dailyMarkdown = () => t`
  Normalized Difference Vegetation Index (NDVI) is an indicator of the greenness of the biomes. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to the present.`;

const getClmsGlobalSsm1kmV1DailyMarkdown = () => t`
  Provides information on the relative water content of the top few centimeters soil, describing how wet or dry the soil is in its topmost layer, expressed in percent saturation. Daily observations are available for the continental Europe in the spatial resolution of 1 km and with the temporal extent from October 2014 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/daily-surface-soil-moisture-v1.0).`;

const getClmsGlobalBa300mV3MonthlyMarkdown = () => t`
  Maps burn scars, surfaces which have been sufficiently affected by fire to display significant changes in the vegetation cover (destruction of dry material, reduction or loss of green material) and in the ground surface (temporarily darker because of ash). Monthly datasets are available at global scale, in the spatial resolution of 300 m, and with a time lag of two months. They cover the period from 2019 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/burnt-area-v3-1-monthly-300m).`;

const getClmsGlobalBa300mV4MonthlyMarkdown = () => t`
  Maps burn scars, surfaces which have been sufficiently affected by fire to display significant changes in the vegetation cover (destruction of dry material, reduction or loss of green material) and in the ground surface (temporarily darker because of ash). Monthly datasets are available at global scale, in the spatial resolution of 300 m, and with a time lag of two months. They cover the period from July 2018 to present. More information _coming soon_.`;

const getClmsGlobalBa300mV3DailyMarkdown = () => t`
  Maps burn scars, surfaces which have been sufficiently affected by fire to display significant changes in the vegetation cover (destruction of dry material, reduction or loss of green material) and in the ground surface (temporarily darker because of ash). Daily datasets are available at global scale, in the spatial resolution of 300 m, and within 24 hours after the satellite acquisition. They cover the period from July 2023 to present. More info [here](https://land.copernicus.eu/en/products/vegetation/burnt-area-v3-1-daily-300m).`;

const getClmsGlobalBa300mV4DailyMarkdown = () => t`
  Maps burn scars, surfaces which have been sufficiently affected by fire to display significant changes in the vegetation cover (destruction of dry material, reduction or loss of green material) and in the ground surface (temporarily darker because of ash). Daily datasets are available at global scale, in the spatial resolution of 300 m, and within 24 hours after the satellite acquisition. They cover the period from December 2024 to present. More information _coming soon_.`;

const getClmsGlobalLsp300mV1YearlyMarkdown = () => t`
  Provide at global scale and for Europe information on vegetation phenology and productivity gathering 13 parameters  for two growing seasons. More information [here](https://land.copernicus.eu/en/products/vegetation?tab=vegetation_phenology_and_productivity_parameters).`;

const getClmsGlobalLsp300mV2YearlyMarkdown = () => t`
  Provides at global scale and for Europe information on vegetation phenology and productivity gathering 13 parameters for two growing seasons. More information [here](https://land.copernicus.eu/en/products/vegetation?tab=vegetation_phenology_and_productivity_parameters).`;

const getClmsGlobalGpp300mV110dailyRt0Markdown = () => t`
  Provides the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time. 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v1-0-300m).`;

const getClmsGlobalGpp300mV110dailyRt1Markdown = () => t`
  Provides the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time. 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v1-0-300m).`;

const getClmsGlobalGpp300mV110dailyRt2Markdown = () => t`
  Provides the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time. 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v1-0-300m).`;

const getClmsGlobalGpp300mV110dailyRt6Markdown = () => t`
  Provides the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time. 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v1-0-300m).`;

const getClmsGlobalLai300mV110dailyMarkdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-300m-v1.0).`;

const getClmsGlobalLai300mV110dailyRt0Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-300m-v1.0).`;

const getClmsGlobalLai300mV110dailyRt1Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-300m-v1.0).`;

const getClmsGlobalLai300mV110dailyRt2Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-300m-v1.0).`;

const getClmsGlobalLai300mV110dailyRt6Markdown = () => t`
  Defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available in near real time at global scale in the spatial resolution of about 300 m from January 2014 to June 2020 based upon PROBA-V data with version 1.0 and from July 2020 onwards based upon Sentinel-3/OLCI data with version 1.1. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-300m-v1.0).`;

const getClmsGlobalNpp300mV110dailyRt0Markdown = () => t`
  Provides the amount of carbon retained in an ecosystem (increase in biomass); it is equal to the difference between the amount of carbon produced through photosynthesis (GPP) and the amount of energy that is used for respiration (R). 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v1-0-300m).`;

const getClmsGlobalNpp300mV110dailyRt1Markdown = () => t`
  Provides the amount of carbon retained in an ecosystem (increase in biomass); it is equal to the difference between the amount of carbon produced through photosynthesis (GPP) and the amount of energy that is used for respiration (R). 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v1-0-300m).`;

const getClmsGlobalNpp300mV110dailyRt2Markdown = () => t`
  Provides the amount of carbon retained in an ecosystem (increase in biomass); it is equal to the difference between the amount of carbon produced through photosynthesis (GPP) and the amount of energy that is used for respiration (R). 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v1-0-300m).`;

const getClmsGlobalNpp300mV110dailyRt6Markdown = () => t`
  Provides the amount of carbon retained in an ecosystem (increase in biomass); it is equal to the difference between the amount of carbon produced through photosynthesis (GPP) and the amount of energy that is used for respiration (R). 10-daily observations are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2023 to present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v1-0-300m).`;

const getClmsGlobalNdvi1kmV310dailyMarkdown = () => t`
  Normalized Difference Vegetation Index (NDVI) is an indicator of the greenness of the biomes. Every 10-days estimates are available at global scale in the spatial resolution of about 1 km from 1999 to 2013 based upon SPOT/VEGETATION data and from 2014 to June 2020 based upon PROBA-V data. More information [here](https://land.copernicus.eu/en/products/vegetation/normalised-difference-vegetation-index-v3-0-1km).`;

const getClmsGlobalSwi125kmV310dailyMarkdown = () => t`
  Averages the daily Soil Water Index product over 10 days. The data are produced every 10 days over the globe at the spatial resolution of 0.1° and with the temporal extent from January 2007 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/10-daily-soil-water-index-global-v3-0-12-5-km).`;

const getClmsGlobalSwi125kmV3DailyMarkdown = () => t`
  Provides daily updates on the moisture conditions in different soil layers. The data are available over the globe at the spatial resolution of 0.1° and with the temporal extent from January 2007 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/daily-soil-water-index-global-v3-0-12-5km).`;

const getClmsGlobalSwi1kmV1DailyMarkdown = () => t`
  Quantifies the moisture condition at various depths in the soil. Daily observations are available for the continental Europe in the spatial resolution of 1 km and with the temporal extent from January 2015 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/daily-soil-water-index-europe-v1-0-1km).`;

// LOT2

const getClmsGlobalWb300mV110dailyMarkdown = () =>
  t`Detects the areas covered by inland water providing the maximum and the minimum extent of the water surface as well as the seasonal dynamics. 10-daly data are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2014 to 2020. More information [here](https://land.copernicus.eu/en/products/water-bodies/water-bodies-global-v1-0-300m).`;

const getClmsGlobalWb300mV2MonthlyMarkdown = () =>
  t`Detects the areas covered by inland water providing the maximum and the minimum extent of the water surface as well as the seasonal dynamics. Monthly updates are available at global scale in the spatial resolution of 300 m and with the temporal extent from 2020 to present More information [here](https://land.copernicus.eu/en/products/water-bodies/water-bodies-global-v2-0-300m).`;

const getClmsGlobalWb1kmV210dailyMarkdown = () => t`Information not currently available.`;

const getClmsGlobalSwe5kmV1DailyMarkdown = () =>
  t`Provides for the Northern Hemisphere daily updates of the equivalent amount of liquid water stored in the snow pack. The data is available in the spatial resolution of 5 km and with the temporal extent from January 2006 to June 2024. More information [here](https://land.copernicus.eu/en/products/snow/snow-water-equivalent-v1-0-5km).`;

const getClmsGlobalSwe5kmV2DailyMarkdown = () =>
  t`Provides for the Northern Hemisphere daily updates of the equivalent amount of liquid water stored in the snow pack. The data is available in near real time in the spatial resolution of 5 km and with the temporal extent from July 2024 to present. More information [here](https://land.copernicus.eu/en/products/snow/snow-water-equivalent-v2-0-5km).`;

const getClmsGlobalSceEurope500mV1DailyMarkdown = () =>
  t`Provides for Europe daily updates of the fraction of snow cover on the ground (also in forested areas) per pixel in percentage (0% – 100%). The data is available in near real time in the spatial resolution of 500 m and with the temporal extent from March 2017 to present. More information [here](https://land.copernicus.eu/en/products/snow/snow-cover-extent-europe-v1-0-500m).`;

const getClmsNorthernHemisphereSce1kmV1DailyMarkdown = () =>
  t`Provides for Northern Hemisphere daily maps of the fraction of snow cover on ground (also in forested areas) per pixel in percentage (0% – 100%). The data is available in near real time with a pixel spacing of about 1 km and with the temporal extent from January 2018 to present. More information [here](https://land.copernicus.eu/en/products/snow/snow-cover-extent-northern-hemisphere-v1-0-1km).`;

const getClmsGlobalSce1kmV1DailyMarkdown = () =>
  t`Provides for global land areas (excluding Antarctica) daily maps of the fraction of snow cover on ground (also in forested areas) per pixel in percentage (0% – 100%). The data is available in near real time with a pixel spacing of about 1 km and with the temporal extent from December 2025 to present. More information [here](https://land.copernicus.eu/en/products/snow/snow-cover-global-v1-0-1km).`;

const getClmsGlobalLie500mV1DailyMarkdown = () =>
  t`On a daily basis classifies pixels in Northern Hemisphere freshwater bodies into 1) Ice, 2) Open water, and 3) Cloud. The class “Ice” includes various types of ice, also snow-covered ice. The data is updated in near real-time with the spatial resolution of 500 m and with has a temporal extent from April 2021 to present. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-ice-extent-northern-hemisphere-500m).`;

const getClmsGlobalLie250mV2DailyMarkdown = () =>
  t`On a daily basis, classifies pixels of Continental Europe freshwater bodies as 1) Fully snow-covered ice, 2) Partially snow-covered or snow-free ice, and 3) Open water. The data is available in near real time in a spatial resolution of 250 m and with the temporal extent from July the 1st, onwards. In June 2024, the data input sensor was transferred from Terra MODIS (VERSION 1.2.1) to NOAA-20 VIIRS (VERSION 2.2.1), and the area was extended from the Baltic region to cover Continental Europe. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-ice-extent-europe-v2-250m).`;

const getClmsGlobalWb100mV1MonthlyMarkdown = () => t`
  Detects the areas covered by inland water along the year providing the maximum and the minimum extent of the water surface as well as the seasonal dynamics. Monthly updates are available at global scale in the spatial resolution of 100 m and with the temporal extent from 2020 to present. More information [here](https://land.copernicus.eu/en/products/water-bodies/water-bodies-global-v1-0-100m).`;

const getClmsGlobalLwq300mV210DailyNrtMarkdown = () =>
  t`Provides semi-continuous observations for a large number of medium and large-sized lakes. 10-daily observations are available in near real time at 300 m spatial resolution from September 2024 to present. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-water-quality-near-real-time-v2-0-300m).`;

const getClmsGlobalLwq300mV110DailyReprocMarkdown = () =>
  t`Provides semi-continuous observations for a large number of medium and large-sized lakes, according to the Global Lakes and Wetlands Database (GLWD) or otherwise of specific environmental monitoring interest. 10-daily observations are available in the spatial resolution of 300 m and with the temporal extent from 2002 to 2012. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-water-quality-offline-v1-0-300m).`;

const getClmsGlobalLwq300mV110DailyNrtMarkdown = () =>
  t`Provides semi-continuous observations for a large number of medium and large-sized lakes, according to the Global Lakes and Wetlands Database (GLWD) or otherwise of specific environmental monitoring interest. 10-daily observations are available in the spatial resolution of 300 m and with the temporal extent from 2016 to 2024. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-water-quality-offline-v1-0-300m).`;

const getClmsGlobalLwq100mV110DailyNrtMarkdown = () =>
  t`Provides semi-continuous observations for a large number of medium and large-sized lakes, according to the Global Lakes and Wetlands Database (GLWD) or otherwise of specific environmental monitoring interest. 10-daily observations are available in near real time in the spatial resolution of 100 m and with the temporal extent from 2019 to 2024. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-water-quality-v1-0-100m).`;

const getClmsGlobalLcm10mV1YearlyMarkdown = () =>
  t`Provides spatial information at global level on different types (classes) of physical coverage of the Earth's surface, e.g. forests, grasslands, croplands, water bodies, wetlands for the base year 2020. More information [here](https://land.copernicus.eu/en/products?tab=full_coverage_land_cover__use).`;

const getClmsPantropicalTcd10mV1YearlyMarkdown = () =>
  t`Provides spatial information at pantropical level on tree canopy density in percent per pixel for 2020 reference year in a discrete range between 0% and 100%. More information [here](https://land.copernicus.eu/en/products?tab=full_coverage_land_cover__use).`;

const getClmsGlobalLie500mV2DailyMarkdown = () =>
  t`On a daily basis classifies pixels in Global freshwater bodies into 1) Snow-covered ice, 2) Partially snow-covered or snow-free ice, 3) Open water, and 4) Cloud. The data is updated in near-real time with the spatial resolution of 500 m and with a temporal extent from July 2025 to present. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-ice-extent-global-500m_v2).`;

const getClmsGlobalSwi125kmV4DailyMarkdown = () =>
  t`Provides daily updates on the moisture conditions in different soil layers. The data are available over the globe at the spatial resolution of 0.1° and with the temporal extent from 2007 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/daily-soil-water-index-global-12-5km).`;

const getClmsEuropeSwi1kmV2DailyMarkdown = () =>
  t`Quantifies the moisture condition at various depths in the soil. Daily observations are available for the continental Europe in the spatial resolution of 1 km and with the temporal extent from July 2025 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/daily-soil-water-index-europe-1km).`;

const getClmsGlobalSwi125km10V4DailyMarkdown = () =>
  t`Averages the daily Soil Water Index product over 10 days. The data are produced every 10 days over the globe at the spatial resolution of 0.1° and with the temporal extent from January 2007 to present. More information [here](https://land.copernicus.eu/en/products/soil-moisture/10-daily-soil-water-index-global-v3-0-12-5-km).`;

const getClmsBalticLie250mV1DailyMarkdown = () =>
  t`On daily basis for the Northern Europe classifies, in pixels, inland/freshwater bodies as 1) Fully snow-covered ice, 2) Partially snow-covered or snow-free ice, 3) Open water. The data is available in near real time in the spatial resolution of 250 m and with the temporal extent from March 2017 to 30 June 2024. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-ice-extent-baltic-v1-250m).`;

const getClmsGlobalEta300mV110dailyMarkdown = () =>
  t`Provides actual evapotranspiration, soil evaporation and canopy transpiration with some quality indicators. Estimates are provided for two evapotranspiration schemes and an Ensemble of models. Every 10-days estimate are available in near real time at global scale in the spatial resolution of about 300 m from November 2025 onwards in version 1.0. More information [here](https://land.copernicus.eu/en/products/evapotranspiration/evapotranspiration-2025-present-raster-300m-global-10-daily-version-1).`;

const getClmsGlobalHf300mV1DailyMarkdown = () =>
  t`Provides latent and sensible heat fluxes with one auxiliary information. Estimates are provided for each Sentinel-3 overpass in near real time at global scale in the spatial resolution of about 300 m from November 2025 onwards in version 1.0. More information [here](https://land.copernicus.eu/en/products/evapotranspiration/heat-flux-2025-present-raster-300-m-global-daily-version-1).`;

const getClmsLswtOffline1kmV110DailyMarkdown = () =>
  t`Provides the temperature of the water at the lake surface. The LSWT observations (every 10 days) are available at global scale at spatial resolution of ~1 km and with the temporal extent from 2002 to 2012. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/lake-surface-water-temperature-offline-1km).`;

const getClmsLswtNrt1kmV110DailyMarkdown = () =>
  t`Provides the temperature of the water at the lake surface. The near real time observations (every 10 days) are available at global scale at spatial resolution of ~1 km and with the temporal extent from 2016 to present. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/lake-surface-water-temperature-near-real-time-v1-0-1km).`;

const getClmsLwqNrt100mV210DailyMarkdown = () =>
  t`Provides semi-continuous observations for a large number of medium and large-sized lakes, according to the Global Lakes and Wetlands Database (GLWD) or otherwise of specific environmental monitoring interest. 10-daily observations are available in near real time at 100 m spatial resolution from September 2024 to present. More information [here](https://land.copernicus.eu/en/products/water-bodies/lake-water-quality-v2-0-100m).`;

const getClmsGlobalLai300mV210dailyMarkdown = () => t`
Provides information about Leaf Area Index, defined as half the total area of green elements of the canopy per unit horizontal ground area. Every 10-days estimates are available at global scale in the spatial resolution of ~300 m from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/leaf-area-index-v2-0-300m).
`;

const getClmsFapar300mV210DailyMarkdown = () => t`
Quantifies the fraction of the solar radiation absorbed by live plants for photosynthesis. Every 10-days estimates are available at global scale, in the spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-absorbed-photosynthetically-active-radiation-v2-0-300m).
`;

const getCopernicusClmsFcoverGlobal300m10dailyV2RT0Markdown = () =>
  t`Provides information of the fraction of ground covered by green vegetation. Every 10-days estimates are available at global scale in the spatial resolution of ~ 300 m from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-300m).`;

const getCopernicusClmsFcoverGlobal300m10dailyV2RT1Markdown = () =>
  t`Provides information of the fraction of ground covered by green vegetation. Every 10-days estimates are available at global scale in the spatial resolution of ~ 300 m from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-300m).`;

const getCopernicusClmsFcoverGlobal300m10dailyV2RT2Markdown = () =>
  t`Provides information of the fraction of ground covered by green vegetation. Every 10-days estimates are available at global scale in the spatial resolution of ~ 300 m from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-300m).`;

const getCopernicusClmsFcoverGlobal300m10dailyV2RT6Markdown = () =>
  t`Provides information of the fraction of ground covered by green vegetation. Every 10-days estimates are available at global scale in the spatial resolution of ~ 300 m from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/fraction-of-green-vegetation-cover-v2-0-300m).`;

const getClmsUaLcu2018VectorMarkdown = () =>
  t`Urban Atlas Land Cover and Land Use 2018 provides reliable, inter-comparable, high-resolution land use and land cover data for 764 Functional Urban Areas (FUA) with more than 50,000 inhabitants for the 2018 reference year in EEA38 countries (EU, EFTA, Western Balkans countries, as well as Türkiye) and the United Kingdom. More information [here](https://land.copernicus.eu/en/products/urban-atlas).`;

const getClmsUaLcu2021VectorMarkdown = () =>
  t`Urban Atlas Land Cover and Land Use 2021 provides reliable, inter-comparable, high-resolution land use and land cover data for 790 Functional Urban Areas (FUA) with more than 50,000 inhabitants for the 2021 reference year in EEA38 countries (EU, EFTA, Western Balkans countries, as well as Türkiye) and the United Kingdom. More information [here](https://land.copernicus.eu/en/products/urban-atlas).`;

const getClmsUaLcuc20182021VectorMarkdown = () =>
  t`Urban Atlas Land Cover and Land Use Change 2018-2021 provides reliable, inter-comparable, high-resolution land use and land cover change data for 764 Functional Urban Areas (FUA) with more than 50,000 inhabitants for the 2021 reference year in EEA38 countries (EU, EFTA, Western Balkans countries, as well as Türkiye) and the United Kingdom. More information [here](https://land.copernicus.eu/en/products/urban-atlas).`;

const getClmsUaStl2021VectorMarkdown = () =>
  t`Urban Atlas Street Tree Layer 2021 provides information about presence of trees within Functional Urban Areas (FUA). More information [here](https://land.copernicus.eu/en/products/urban-atlas).`;

const getCopernicusClmsDmpGlobal300m10dailyV2RT0Markdown = () =>
  t`Provides information about the overall growth rate, or net dry biomass increase, of the vegetation. It is equivalent to Net Primary Production (NPP) but expressed in kg of dry matter per hectare and per day. Every 10-days, estimates are available at global scale, at a spatial resolution of ~300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v2-0-300m).`;

const getCopernicusClmsDmpGlobal300m10dailyV2RT1Markdown = () =>
  t`Provides information about the overall growth rate, or net dry biomass increase, of the vegetation. It is equivalent to Net Primary Production (NPP) but expressed in kg of dry matter per hectare and per day. Every 10-days, estimates are available at global scale, at a spatial resolution of ~300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v2-0-300m).`;

const getCopernicusClmsDmpGlobal300m10dailyV2RT2Markdown = () =>
  t`Provides information about the overall growth rate, or net dry biomass increase, of the vegetation. It is equivalent to Net Primary Production (NPP) but expressed in kg of dry matter per hectare and per day. Every 10-days, estimates are available at global scale, at a spatial resolution of ~300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v2-0-300m).`;

const getCopernicusClmsDmpGlobal300m10dailyV2RT6Markdown = () =>
  t`Provides information about the overall growth rate, or net dry biomass increase, of the vegetation. It is equivalent to Net Primary Production (NPP) but expressed in kg of dry matter per hectare and per day. Every 10-days, estimates are available at global scale, at a spatial resolution of ~300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/dry-matter-productivity-v2-0-300m).`;

const getCopernicusClmsGppGlobal300m10dailyV2RT0Markdown = () =>
  t`Provides information about the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time, expressed in gC/m²/day. Every 10-days, estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v2-0-300m).`;

const getCopernicusClmsGppGlobal300m10dailyV2RT1Markdown = () =>
  t`Provides information about the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time, expressed in gC/m²/day. Every 10-days, estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v2-0-300m).`;

const getCopernicusClmsGppGlobal300m10dailyV2RT2Markdown = () =>
  t`Provides information about the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time, expressed in gC/m²/day. Every 10-days, estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v2-0-300m).`;

const getCopernicusClmsGppGlobal300m10dailyV2RT6Markdown = () =>
  t`Provides information about the total amount of carbon compounds produced by photosynthesis of plants in an ecosystem in a given period of time, expressed in gC/m²/day. Every 10-days, estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-primary-production-v2-0-300m).`;

const getCopernicusClmsNppGlobal300m10dailyV2RT0Markdown = () =>
  t`Provides information about the net amount of biomass, or carbon, produced by plants per unit area and time, expressed in gC/m²/day. It is equal to the difference between the Gross Primary Production (GPP), i.e. the total amount of carbon produced through photosynthesis, and the amount of energy used for plant respiration. Every 10-days, estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v2-0-300m).`;

const getCopernicusClmsNppGlobal300m10dailyV2RT1Markdown = () =>
  t`Provides information about the net amount of biomass, or carbon, produced by plants per unit area and time, expressed in gC/m²/day. It is equal to the difference between the Gross Primary Production (GPP), i.e. the total amount of carbon produced through photosynthesis, and the amount of energy used for plant respiration. Every 10-days, estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v2-0-300m).`;

const getCopernicusClmsNppGlobal300m10dailyV2RT2Markdown = () =>
  t`Provides information about the net amount of biomass, or carbon, produced by plants per unit area and time, expressed in gC/m²/day. It is equal to the difference between the Gross Primary Production (GPP), i.e. the total amount of carbon produced through photosynthesis, and the amount of energy used for plant respiration. Every 10-days, estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v2-0-300m).`;

const getCopernicusClmsNppGlobal300m10dailyV2RT6Markdown = () =>
  t`Provides information about the net amount of biomass, or carbon, produced by plants per unit area and time, expressed in gC/m²/day. It is equal to the difference between the Gross Primary Production (GPP), i.e. the total amount of carbon produced through photosynthesis, and the amount of energy used for plant respiration. Every 10-days, estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/net-primary-production-v2-0-300m).`;

const getCopernicusClmsGdmpGlobal300m10dailyV2RT0Markdown = () =>
  t`Provides information about the total amount of dry matter produced by land plants per unit time through photosynthesis. It is equivalent to Gross Primary Production (GPP) but expressed in kg of dry matter per hectare and per day. Every 10-days estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-300m).`;

const getCopernicusClmsGdmpGlobal300m10dailyV2RT1Markdown = () =>
  t`Provides information about the total amount of dry matter produced by land plants per unit time through photosynthesis. It is equivalent to Gross Primary Production (GPP) but expressed in kg of dry matter per hectare and per day. Every 10-days estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-300m).`;

const getCopernicusClmsGdmpGlobal300m10dailyV2RT2Markdown = () =>
  t`Provides information about the total amount of dry matter produced by land plants per unit time through photosynthesis. It is equivalent to Gross Primary Production (GPP) but expressed in kg of dry matter per hectare and per day. Every 10-days estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-300m).`;

const getCopernicusClmsGdmpGlobal300m10dailyV2RT6Markdown = () =>
  t`Provides information about the total amount of dry matter produced by land plants per unit time through photosynthesis. It is equivalent to Gross Primary Production (GPP) but expressed in kg of dry matter per hectare and per day. Every 10-days estimates are available at global scale, at a spatial resolution of ~ 300 m, from January 2014 to the present. More information [here](https://land.copernicus.eu/en/products/vegetation/gross-dry-matter-productivity-v2-0-300m).`;

const getCopernicusClmsDlt10mYearlyV1Markdown = () => t`
  The High Resolution Dominant Leaf Type (DLT) raster product provides a basic land cover classification with 3 thematic classes (all non-tree covered areas, broadleaved and coniferous).

This dataset is provided annually starting with 2018 in 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Tree Cover and Forest product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs)`;

const getCopernicusClmsCpflp10mYearlyV1Markdown = () =>
  t`The High Resolution Layer Cropping Patterns - Fallow Land Presence (CPFLP) raster product provides the yearly fallow land classification indicating if arable land has been left fallow in the respective calendar year. This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries. High Resolution Layer Croplands product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsCpbsa10mYearlyV1Markdown = () =>
  t`The High Resolution Layer Cropping Patterns - Bare Soil After (CPBSA) raster product provides bare soil period (in days) after the harvest of the main annual crop. Note that the bare soil period cannot transcend the calendar year for which the product is generated.

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Croplands product is part of the European Union's Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsCpfld10mYearlyV1Markdown = () =>
  t`The High Resolution Layer Cropping Patterns - Fallow Land Duration (CPFLD) raster product provides information on the duration of fallow land periods, expressed in days, over a five-year period.

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

Note: each product covers a five-year window and is referenced by the end year of that window (e.g. the 2021 product covers the period 2017–2021).

High Resolution Layer Croplands product is part of the European Union's Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsCpbsb10mYearlyV1Markdown = () =>
  t`The High Resolution Layer Cropping Patterns - Bare Soil Before (CPBSB) raster product provides the bare soil period (in days) before the emergence of the main annual crop. Note that the bare soil period cannot transcend the calendar year for which the product is generated.

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Croplands product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.


This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsDltcEurope20m3yearlyV1Markdown = () =>
  t`The High Resolution Layer Dominant Leaf Type Change (DLTC) 2018-2021 raster product provides information on the change between the reference years 2018 and 2021 and consists of 7 thematic classes (unchanged areas with no tree cover / new broadleaved cover / new coniferous cover / loss of broadleaved cover / loss of coniferous cover / unchanged areas with tree cover / potential change among dominant leaf types).

This dataset is provided in 20 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

The production of the high resolution forest layers was coordinated by the European Environment Agency (EEA) in the frame of the EU Copernicus programme.

This dataset includes data from the French Overseas Territories (DOMs).`;

const getCopernicusClmsVlccCropTypesEurope10mYearlyV1Markdown = () =>
  t`The High Resolution Layer Crop Types (CTY) raster product provides high resolution crop type classification for 17 classes of both arable and permanent crops across the EEA38 extent. Using both Sentinel-1 and Sentinel-2, the model is finetuned to first map the crop field boundaries, and then determine the main crop for each field.

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Croplands product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsCpmcd10mYearlyV1Markdown = () =>
  t`The High Resolution Layer Cropping Patterns - Main Crop Duration (CPMCD) raster product provides the duration (in days) of the growing season for the main (annual) crop.

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries. High Resolution Layer Croplands product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsVlccTcpc20m3yearlyV1Markdown = () =>
  t`The Copernicus High Resolution Layer Tree Cover Presence Change (TCPC) 2018-2021 raster product provides information on the change between the reference years 2018 and 2021 and consists of 4 thematic classes (unchanged areas with no tree cover / new tree cover / loss of tree cover / unchanged areas with tree cover). The class 255 = outside area is predefined by the 100m boundary layer and remains unchanged. This layer for previous reference year comparisons is called Tree Cover Change Mask (TCCM).

This dataset is provided in 20 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

The production of the high resolution forest layers was coordinated by the European Environment Agency (EEA) in the frame of the EU Copernicus programme. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-forests-and-tree-cover).`;

const getCopernicusClmsVlccGrasslandChangeEurope20m3yearlyV1Markdown = () =>
  t`The High Resolution Layer Grassland Change (GRAC) 2018-2021 raster product at 20m resolution provides information on changes in grassland vegetation cover between the reference years 2018 and 2021. The thematic classes indicate all non-grassland areas, grassland gain and grassland loss, unchanged grassland in both years and unverified grassland gain and loss areas.

This dataset is provided in 20 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Grasslands product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-grasslands).`;

const getCopernicusClmsVlccForestTypeEurope10m3yearlyV1Markdown = () =>
  t`The High Resolution Layer Forest Type (FTY) provides a forest classification with 3 thematic classes (all non-forest areas / broadleaved forest / coniferous forest) at 10m spatial resolution and with a Minimum Mapping Unit (MMU) of 0.5 ha. This raster layer is largely following the FAO (Food and Agriculture Organisation of the United Nations) forest definition with tree covered areas in agricultural and urban context excluded using the respective Forest Additional Support Layer (FADSL).

This dataset is provided on a 3-yearly frequency in 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Tree Cover and Forest product is part of the European Union’s Copernicus Land Monitoring Service.

This dataset includes data from the French Overseas Territories (DOMs)`;

const getCopernicusClmsVlccGrasslandEurope10mYearlyV1Markdown = () => t`
The High Resolution Layer Grassland (GRA) raster product provides a binary status layer of grassland/non-grassland mask. This grassy and non-woody vegetation baseline product includes all kinds of grasslands: managed grassland, semi-natural grassland and natural grassy vegetation. It does not include temporary grasslands, which are masked out using the corresponding Ploughing indicator (PLOUGH), indicating on the number of years since a pixel was last ploughed.

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Grasslands product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-grasslands).`;

const getCopernicusClmsVlccTreeCoverDensityEurope10mYearlyV1Markdown = () => t`
The High Resolution Layer Tree Cover Density (TCD) dataset provides information on the proportional crown coverage per pixel at 10 meter spatial resolution and ranges from 0% (all non-tree covered areas) to 100%, whereby Tree Cover Density is defined as the "vertical projection of tree crowns to a horizontal earth’s surface".

This dataset is provided annually starting with 2018 in 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Tree Cover and Forest product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs).`;

const getCopernicusClmsVlccPloughingIndicatorEurope10mYearlyV1Markdown = () => t`
  The High Resolution Layer Ploughing indicator (PLOUGH) raster product continues the 2015 and 2018 PLOUGH Layer following a rolling archive principle by adding current information and removing historic years. It indicates the number of years since the last indication of ploughing within the permanent grassland area. PLOUGH is derived by taking into account the series of binary HER layers, the BVL classifications and HR VPP PPI (Plant Phenology Index) quantiles. BVL classes 4 (crop) and 7 (overlaying layer between herbaceous and crop) indicate a ploughing event. Low HR VPP PPI quantiles indicate low vegetation at a certain time of the year. For years with missing information (2016 and earlier) the ploughing information from the historic PLOUGH product is considered which causes some issues.

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Grasslands product is part of the European Union's Copernicus Land Monitoring Service.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-grasslands).`;

const getCopernicusClmsUaBuildingHeightEurope10m3yearlyV12021Markdown = () => t`
Urban Atlas Building Block Height 2021 is a 10 m high resolution raster layer containing height information generated for selected cities and urban areas as part of the Urban atlas suite of products. Height information is based on satellite information and derived datasets like the digital surface model, the digital terrain model and the normalized digital surface model (DSM). More information [here](https://land.copernicus.eu/en/products/urban-atlas).`;

const getCopernicusClmsVlccSecondaryCropTypesEurope10mYearlyV1Markdown = () => t`
The High Resolution Layer Cropping Patterns - Secondary Crop Type (CPSCT) raster product indicates if a cover crop was present within the respective calendar year and further segregates the types of cover crop into: short summer, long summer, short winter and long winter cover crop.

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Croplands product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsVlccGrasslandMowingDatesEurope10mYearlyV1Markdown = () => t`
The High Resolution Layer Grassland Mowing Dates (GRAMD) raster product provides at pan-European level in the spatial resolution of 10 m a basic land cover classification, flagging and mapping the start date (DOY) (GRAMD) within the detected Herbaceous cover layer (temporal and permanent grassland)) with a Minimum Mapping Unit (MMU) of 0.25 ha. The GRAMD product will flag and map the dates (Day of Year) of each mowing event on temporary or permanent grassland per year, resulting in a product split in four different rasters per year.

This dataset is provided annually starting with 2017 in 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Grasslands product is part of the European Union's Copernicus Land Monitoring Service.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-grasslands).`;
const getCopernicusClmsVlccCroppingSeasonsTypesEurope10mYearlyV1Markdown = () => t`
The High Resolution Layer Cropping Patterns - Cropping Seasons Types (CPCSY) raster product provides the number of different crop types grown in a 3-year period [0-3] (excluding cover crops).

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Croplands product is part of the European Union’s Copernicus Land Monitoring Service.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsVlccGrasslandMowingEventsEurope10mYearlyV1Markdown = () => t`
  The High Resolution Layer Grassland Mowing Events (GRAME) raster product provides a basic land cover classification containing respectively the number of grassland mowing events within the detected Herbaceous cover layer (temporal and permanent grassland) with a Minimum Mapping Unit (MMU) of 0.25 ha. The GRAME product will flag and map the number of mowing events (1, 2, 3, or 4+) on temporary or permanent grassland detected per year.

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Grasslands product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-grasslands).`;

const getCopernicusClmsVlccHerbaceousCoverEurope10mYearlyV1Markdown = () => t`
The High Resolution Layer Herbaceous cover (HER) raster product provides a basic land cover classification with 2 thematic classes (temporal and permanent herbaceous / non-herbaceous). The production of the herbaceous layer is primarily based on the probability estimates obtained from the Base Vegetation Layer (BVL) which also serves to harmonize the different vegetated HRL products (Grasslands, Tree Cover and Forests, Croplands). HER is further used as input for the Grassland status layer (GRA) extracting the permanent herbaceous in combination with the Ploughing indicator (PLOUGH).

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Grasslands product is part of the European Union’s Copernicus Land Monitoring Service.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-grasslands).`;

const getCopernicusClmsVlccCroppingSeasonsEurope10mYearlyV1Markdown = () => t`
The High Resolution Layer Cropping Patterns - Cropping Seasons Yearly (CPCSY) raster product provides number of growing seasons detected within 1 year (0/1/2).

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Croplands product is part of the European Union’s Copernicus Land Monitoring Service.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsLstTciGlobal3km10dailyV3Markdown = () => t`
  Provides Land Surface Temperature estimates at global scale, at a spatial resolution of ~3 km. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/10daily-land-surface-temperature-synthesis-global-v3-0-3km).`;

const getCopernicusClmsLstDailyCycleGlobal3km10dailyV3Markdown = () => t`
  Provides Land Surface Temperature estimates at global scale, at a spatial resolution of ~3 km. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance/daily-land-surface-temperature-global-v3-0-3km).`;

const getCopernicusClmsLstGlobal3kmHourlyV3Markdown = () => t`
  Provides Land Surface Temperature estimates at global scale, at a spatial resolution of ~3 km. More information [here](https://land.copernicus.eu/en/products/temperature-and-reflectance?tab=land_surface_temperature).`;

const getCopernicusClmsCpsce10mYearlyV1Markdown = () =>
  t`The High Resolution Layer Cropping Patterns - Secondary Crop Emergence (CPSCE) raster product provides the date of emergence of the cover crop in days of the year (DOY). YYDOY where YY = last 2 digits of the year (e.g. 19 for 2019) and DOY is the day of the year (1-365)

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Croplands product is part of the European Union's Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsVlccForestAdditionalSupportLayerEurope10m3yearlyV1Markdown = () => t`
  The High Resolution Layer Forest Additional Support Layer (FADSL) provides information on trees under agricultural use or in urban context to be excluded from the Forest Type (FTY) product and at 10m spatial resolution. The derivation of Forest Additional Support Layer (FADSL) is based on the spatial intersection of the 10m DLT and TCD layers with CORINE Land Cover (CLC) 2018 and HRL Imperviousness Degree 2018 with 10 m spatial resolution; TCD range of 10-100%; with a MMW of 10m and no MMU (pixel base).\nThis dataset is provided on a 3-yearly frequency in 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.\nHigh Resolution Layer Tree Cover and Forest product is part of the European Union’s Copernicus Land Monitoring Service.\nThis dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-forests-and-tree-cover).`;

const getCopernicusClmsVlccSecondaryCropDurationEurope10mYearlyV1Markdown = () => t`
The High Resolution Layer Cropping Patterns - Secondary Crop Duration (CPSCD) raster product provides the duration (in days) of the cover crop season (can exceed the calendar year).

This dataset is provided annually starting in 2017 with 10 meter rasters (fully conformant with the EEA reference grid) in 100 x 100 km tiles covering the EEA38 countries.

High Resolution Layer Croplands product is part of the European Union’s Copernicus Land Monitoring Service. Confidence layer available for the dataset.

This dataset includes data from the French Overseas Territories (DOMs). More information [here](https://land.copernicus.eu/en/products/high-resolution-layer-croplands).`;

const getCopernicusClmsWsiCloudClassificationEuropeUtm20mDailyV1Markdown = () => t`
  The Cloud Classification (CC) product provides information on the extent of clouds and cloud shadows derived from optical satellite data acquired by the Sentinel-2 constellation. It is generated in near real-time at European scale, with a pixel spacing of 20 m x 20 m. Cloud detection is performed at a 120m spatial resolution. It is available for the period from 2016 to the present and used to produce the CLMS High-Resolution Water, Snow and Ice datasets (HR-WSI), which rely on Sentinel-2 imagery. More information [here](https://land.copernicus.eu/en/products/snow/fractional-snow-cover).`;

const getCopernicusClmsWsiFractionalSnowCoverEuropeUtm20mDailyV2Markdown = () => t`
  The Fractional Snow Cover (FSC) product provides the fraction of the surface covered by snow at the top of canopy (FSC-TOC) and on ground (FSC-OG) per pixel as a percentage (0% – 100%). It is generated in near real-time at European scale based on optical satellite data from the Sentinel-2 constellation, with a spatial resolution of 20 m x 20 m. It is available for the period from 2016 to the present. More information [here](https://land.copernicus.eu/en/products/snow/fractional-snow-cover).`;

const getCopernicusClmsWsiSarWetSnowEuropeUtm60mDailyV2Markdown = () => t`
  The SAR Wet Snow (SWS) product provides the wet snow extent for high mountain areas with a spatial resolution of 60 m x 60 m. It is generated in near real-time for selected high mountain areas at European scale based on C-band Synthetic Aperture Radar satellite data from the Sentinel-1 constellation. It is available for the period from 2016 to the present. More information [here](https://land.copernicus.eu/en/products/snow/high-resolution-sar-wet-snow).`;

const getCopernicusClmsWsiWetDrySnowEuropeUtm60mDailyV2Markdown = () => t`
  The Wet / Dry Snow (WDS) product provides information on the snow state (wet or dry) by combining Sentinel-1 radar-based wet snow maps within the snow cover extent derived from Sentinel-2 optical data. It is generated in near real-time at European scale, with a spatial resolution of 60 m x 60 m in areas where Sentinel-1 and Sentinel-2 observation tracks overlap. It is available for the period from 2016 to the present. More information [here](https://land.copernicus.eu/en/products/snow/high-resolution-wet-dry-snow).`;

const getCopernicusClmsWsiGapFilledFractionalSnowCoverEuropeUtm60mDailyV1Markdown = () => t`
  The daily cumulative Gap-filled Fractional Snow Cover (GFSC) product provides pixel-wise snow cover extent as a percentage (0% – 100%) with a spatial resolution of 60 m x 60 m. It is generated on a daily basis at European scale based on synthetic aperture radar (SAR) data from the Sentinel-1 constellation and optical imagery from the Sentinel-2 constellation. The product is generated by merging all available Sentinel-1 and Sentinel-2 observations acquired over the previous seven days to produce a spatially complete composite of snow conditions, thereby reducing data gaps caused by cloud cover and sensor coverage limitations. Snow information derived from Sentinel-1 is focused on the detection of wet snow in high-mountain areas. It is available for the period from 2016 to the present. More information [here](https://land.copernicus.eu/en/products/snow/high-resolution-gap-filled-fractional-snow-cover).`;

const getCopernicusClmsWsiSnowPhenologyS2EuropeUtm20mYearlyV1Markdown = () => t`
  The Sentinel-2 Snow Phenology (SP S2) product characterizes the timing and duration of the snow season. For each pixel and for a given hydrological year, it provides the number of days with snow cover, as well as the first and last day of the longest continuous snow period. The hydrological year starts on 1 September. The product is generated at the European scale with a spatial resolution of 20 m × 20 m, consistent with the input snow cover maps derived from optical satellite data acquired by the Sentinel-2 constellation (Fractional Snow Cover – FSC). It is available for the period from 2016 to the present and can be downloaded in multiple projections and pixel spacings. More information [here](https://land.copernicus.eu/en/products/snow/high-resolution-snow-phenology).`;

const getCopernicusClmsWsiSnowPhenologyS1S2EuropeUtm60mYearlyV1Markdown = () => t`
  The Sentinel-1 & Sentinel-2 Snow Phenology (SP S1+S2) product characterizes the timing and duration of the snow season. For each pixel and for a given hydrological year, it provides the number of days with snow cover, as well as the first and last day of the longest continuous snow period. The hydrological year starts on 1 September. The product is generated at the European scale with a spatial resolution of 60 m × 60 m, consistent with the input snow cover maps derived from optical satellite data acquired by the Sentinel-2 constellation and from C-band Synthetic Aperture Radar satellite data acquired by the Sentinel-1 constellation (Gap-filled Fractional Snow Cover - GFSC). It is available for the period from 2016 to the present and can be downloaded in multiple projections and pixel spacings. More information [here](https://land.copernicus.eu/en/products/snow/high-resolution-snow-phenology).`;

export {
  getCLMSCollectionMarkdown,
  getClmsGlobalLcc100mV3YearlyMarkdown,
  getClmsGlobalLst5kmV110dailytciMarkdown,
  getClmsGlobalLst5kmV1HourlyMarkdown,
  getClmsGlobalLst5kmV210dailytciMarkdown,
  getClmsGlobalLst5kmV2HourlyMarkdown,
  getClmsGlobalFapar1kmV210dailyMarkdown,
  getClmsGlobalFapar1kmV210dailyRt0Markdown,
  getClmsGlobalFapar1kmV210dailyRt1Markdown,
  getClmsGlobalFapar1kmV210dailyRt2Markdown,
  getClmsGlobalFapar1kmV210dailyRt6Markdown,
  getClmsGlobalFapar300mV110dailyMarkdown,
  getClmsGlobalFapar300mV110dailyRt0Markdown,
  getClmsGlobalFapar300mV110dailyRt1Markdown,
  getClmsGlobalFapar300mV110dailyRt2Markdown,
  getClmsGlobalFapar300mV110dailyRt6Markdown,
  getClmsGlobalLai1kmV210dailyMarkdown,
  getClmsGlobalLai1kmV210dailyRt0Markdown,
  getClmsGlobalLai1kmV210dailyRt1Markdown,
  getClmsGlobalLai1kmV210dailyRt2Markdown,
  getClmsGlobalLai1kmV210dailyRt6Markdown,
  getClmsGlobalDmp1kmV210dailyMarkdown,
  getClmsGlobalDmp1kmV210dailyRt1Markdown,
  getClmsGlobalDmp1kmV210dailyRt6Markdown,
  getClmsGlobalDmp300mV110dailyRt1Markdown,
  getClmsGlobalDmp300mV110dailyRt5Markdown,
  getClmsGlobalFcover1kmV210dailyMarkdown,
  getClmsGlobalFcover1kmV210dailyRt0Markdown,
  getClmsGlobalFcover1kmV210dailyRt1Markdown,
  getClmsGlobalFcover1kmV210dailyRt2Markdown,
  getClmsGlobalFcover1kmV210dailyRt6Markdown,
  getClmsGlobalFcover300mV110dailyMarkdown,
  getClmsGlobalFcover300mV110dailyRt0Markdown,
  getClmsGlobalFcover300mV110dailyRt1Markdown,
  getClmsGlobalFcover300mV110dailyRt2Markdown,
  getClmsGlobalFcover300mV110dailyRt6Markdown,
  getClmsGlobalGdmp1kmV210dailyMarkdown,
  getClmsGlobalGdmp1kmV210dailyRt0Markdown,
  getClmsGlobalGdmp1kmV210dailyRt1Markdown,
  getClmsGlobalGdmp1kmV210dailyRt2Markdown,
  getClmsGlobalGdmp1kmV210dailyRt6Markdown,
  getClmsGlobalGdmp300mV110dailyRt0Markdown,
  getClmsGlobalGdmp300mV110dailyRt1Markdown,
  getClmsGlobalGdmp300mV110dailyRt2Markdown,
  getClmsGlobalGdmp300mV110dailyRt5Markdown,
  getClmsGlobalGdmp300mV110dailyRt6Markdown,
  getClmsGlobalNdvi1kmV3StatisticsMarkdown,
  getClmsGlobalNdvi300mV110dailyMarkdown,
  getClmsGlobalNdvi300mV210dailyMarkdown,
  getClmsGlobalNdvi300mV310dailyMarkdown,
  getClmsGlobalSsm1kmV1DailyMarkdown,
  getClmsGlobalBa300mV3MonthlyMarkdown,
  getClmsGlobalBa300mV3DailyMarkdown,
  getClmsGlobalLsp300mV1YearlyMarkdown,
  getClmsGlobalLsp300mV2YearlyMarkdown,
  getClmsGlobalGpp300mV110dailyRt0Markdown,
  getClmsGlobalGpp300mV110dailyRt1Markdown,
  getClmsGlobalGpp300mV110dailyRt2Markdown,
  getClmsGlobalGpp300mV110dailyRt6Markdown,
  getClmsGlobalLai300mV110dailyMarkdown,
  getClmsGlobalLai300mV110dailyRt0Markdown,
  getClmsGlobalLai300mV110dailyRt1Markdown,
  getClmsGlobalLai300mV110dailyRt2Markdown,
  getClmsGlobalLai300mV110dailyRt6Markdown,
  getClmsGlobalNpp300mV110dailyRt0Markdown,
  getClmsGlobalNpp300mV110dailyRt1Markdown,
  getClmsGlobalNpp300mV110dailyRt2Markdown,
  getClmsGlobalNpp300mV110dailyRt6Markdown,
  getClmsGlobalNdvi1kmV310dailyMarkdown,
  getClmsGlobalSwi125kmV310dailyMarkdown,
  getClmsGlobalSwi125kmV3DailyMarkdown,
  getClmsGlobalSwi1kmV1DailyMarkdown,
  getClmsGlobalWb300mV110dailyMarkdown,
  getClmsGlobalWb300mV2MonthlyMarkdown,
  getClmsGlobalWb1kmV210dailyMarkdown,
  getClmsGlobalSwe5kmV1DailyMarkdown,
  getClmsGlobalSwe5kmV2DailyMarkdown,
  getClmsGlobalSceEurope500mV1DailyMarkdown,
  getClmsNorthernHemisphereSce1kmV1DailyMarkdown,
  getClmsGlobalSce1kmV1DailyMarkdown,
  getClmsGlobalLie500mV1DailyMarkdown,
  getClmsGlobalLie250mV2DailyMarkdown,
  getClmsGlobalWb100mV1MonthlyMarkdown,
  getClmsGlobalLst5kmV110DailyDailyCycleMarkdown,
  getClmsGlobalLst5kmV210DailyDailyCycleMarkdown,
  getClmsGlobalLwq300mV210DailyNrtMarkdown,
  getClmsGlobalLwq300mV110DailyReprocMarkdown,
  getClmsGlobalLwq300mV110DailyNrtMarkdown,
  getClmsGlobalLwq100mV110DailyNrtMarkdown,
  getClmsGlobalLcm10mV1YearlyMarkdown,
  getClmsPantropicalTcd10mV1YearlyMarkdown,
  getClmsGlobalLie500mV2DailyMarkdown,
  getClmsGlobalSwi125kmV4DailyMarkdown,
  getClmsEuropeSwi1kmV2DailyMarkdown,
  getClmsGlobalSwi125km10V4DailyMarkdown,
  getClmsGlobalBa300mV4MonthlyMarkdown,
  getClmsGlobalBa300mV4DailyMarkdown,
  getClmsBalticLie250mV1DailyMarkdown,
  getClmsGlobalEta300mV110dailyMarkdown,
  getClmsGlobalHf300mV1DailyMarkdown,
  getClmsLswtOffline1kmV110DailyMarkdown,
  getClmsLswtNrt1kmV110DailyMarkdown,
  getClmsLwqNrt100mV210DailyMarkdown,
  getClmsGlobalLai300mV210dailyMarkdown,
  getClmsFapar300mV210DailyMarkdown,
  getCopernicusClmsFcoverGlobal300m10dailyV2RT0Markdown,
  getCopernicusClmsFcoverGlobal300m10dailyV2RT1Markdown,
  getCopernicusClmsFcoverGlobal300m10dailyV2RT2Markdown,
  getCopernicusClmsFcoverGlobal300m10dailyV2RT6Markdown,
  getClmsUaLcu2018VectorMarkdown,
  getClmsUaLcu2021VectorMarkdown,
  getClmsUaLcuc20182021VectorMarkdown,
  getClmsUaStl2021VectorMarkdown,
  getCopernicusClmsDmpGlobal300m10dailyV2RT0Markdown,
  getCopernicusClmsDmpGlobal300m10dailyV2RT1Markdown,
  getCopernicusClmsDmpGlobal300m10dailyV2RT2Markdown,
  getCopernicusClmsDmpGlobal300m10dailyV2RT6Markdown,
  getCopernicusClmsGppGlobal300m10dailyV2RT0Markdown,
  getCopernicusClmsGppGlobal300m10dailyV2RT1Markdown,
  getCopernicusClmsGppGlobal300m10dailyV2RT2Markdown,
  getCopernicusClmsGppGlobal300m10dailyV2RT6Markdown,
  getCopernicusClmsNppGlobal300m10dailyV2RT0Markdown,
  getCopernicusClmsNppGlobal300m10dailyV2RT1Markdown,
  getCopernicusClmsNppGlobal300m10dailyV2RT2Markdown,
  getCopernicusClmsNppGlobal300m10dailyV2RT6Markdown,
  getCopernicusClmsGdmpGlobal300m10dailyV2RT0Markdown,
  getCopernicusClmsGdmpGlobal300m10dailyV2RT1Markdown,
  getCopernicusClmsGdmpGlobal300m10dailyV2RT2Markdown,
  getCopernicusClmsGdmpGlobal300m10dailyV2RT6Markdown,
  getCopernicusClmsUaBuildingHeightEurope10m3yearlyV12021Markdown,
  getCopernicusClmsCpflp10mYearlyV1Markdown,
  getCopernicusClmsCpbsa10mYearlyV1Markdown,
  getCopernicusClmsCpfld10mYearlyV1Markdown,
  getCopernicusClmsCpbsb10mYearlyV1Markdown,
  getCopernicusClmsDltcEurope20m3yearlyV1Markdown,
  getCopernicusClmsDlt10mYearlyV1Markdown,
  getCopernicusClmsVlccCropTypesEurope10mYearlyV1Markdown,
  getCopernicusClmsCpmcd10mYearlyV1Markdown,
  getCopernicusClmsVlccTcpc20m3yearlyV1Markdown,
  getCopernicusClmsVlccGrasslandChangeEurope20m3yearlyV1Markdown,
  getCopernicusClmsVlccForestTypeEurope10m3yearlyV1Markdown,
  getCopernicusClmsVlccGrasslandEurope10mYearlyV1Markdown,
  getCopernicusClmsVlccTreeCoverDensityEurope10mYearlyV1Markdown,
  getCopernicusClmsVlccPloughingIndicatorEurope10mYearlyV1Markdown,
  getCopernicusClmsVlccGrasslandMowingEventsEurope10mYearlyV1Markdown,
  getCopernicusClmsVlccSecondaryCropTypesEurope10mYearlyV1Markdown,
  getCopernicusClmsVlccGrasslandMowingDatesEurope10mYearlyV1Markdown,
  getCopernicusClmsVlccCroppingSeasonsTypesEurope10mYearlyV1Markdown,
  getCopernicusClmsVlccHerbaceousCoverEurope10mYearlyV1Markdown,
  getCopernicusClmsVlccCroppingSeasonsEurope10mYearlyV1Markdown,
  getCopernicusClmsLstTciGlobal3km10dailyV3Markdown,
  getCopernicusClmsLstDailyCycleGlobal3km10dailyV3Markdown,
  getCopernicusClmsLstGlobal3kmHourlyV3Markdown,
  getCopernicusClmsCpsce10mYearlyV1Markdown,
  getCopernicusClmsVlccForestAdditionalSupportLayerEurope10m3yearlyV1Markdown,
  getCopernicusClmsVlccSecondaryCropDurationEurope10mYearlyV1Markdown,
  getCopernicusClmsWsiCloudClassificationEuropeUtm20mDailyV1Markdown,
  getCopernicusClmsWsiFractionalSnowCoverEuropeUtm20mDailyV2Markdown,
  getCopernicusClmsWsiSarWetSnowEuropeUtm60mDailyV2Markdown,
  getCopernicusClmsWsiWetDrySnowEuropeUtm60mDailyV2Markdown,
  getCopernicusClmsWsiGapFilledFractionalSnowCoverEuropeUtm60mDailyV1Markdown,
  getCopernicusClmsWsiSnowPhenologyS2EuropeUtm20mYearlyV1Markdown,
  getCopernicusClmsWsiSnowPhenologyS1S2EuropeUtm60mYearlyV1Markdown,
};
