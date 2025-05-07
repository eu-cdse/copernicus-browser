import React from 'react';
import ReactMarkdown from 'react-markdown';
import { t } from 'ttag';
import ExternalLink from '../../../../../ExternalLink/ExternalLink';
import logoCopernicus from './images/logo-tooltips-copernicus.png';
import {
  COPERNICUS_CORINE_LAND_COVER,
  COPERNICUS_GLOBAL_LAND_COVER,
  COPERNICUS_WATER_BODIES,
  COPERNICUS_GLOBAL_SURFACE_WATER,
  COPERNICUS_CLC_ACCOUNTING,
} from '../../dataSourceConstants';
import { credits } from './credits';
import { DATASOURCES } from '../../../../../const';
import DataSourceTooltip from './DataSourceTooltip';

const getCopernicusServicesMarkdown = () => t`
The Copernicus Services provide important information for six main areas: Ocean, Land and Atmosphere Monitoring, Emergency Response, Security and Climate Change. Copernicus Services data are based on both satellite Earth Observation imagery and in-situ data and benefit both Europe and the international community. More information can be found [here](https://www.copernicus.eu/en/copernicus-services).
`;

const getCopernicusSnowAndIceMarkdown = () => t`
The High-Resolution Snow & Ice Monitoring service ([HR-S&I](https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring)) is part of the Copernicus Land Monitoring Service (CLMS). The snow aspect of the service provides products measuring snow cover, snow state conditions, persistent snow area, as well as ice cover.
`;

const getCopercnicusVegetationMarkdown = () => t`
The High-Resolution Vegetation Phenology and Productivity ([HR-VPP](https://land.copernicus.eu/en/products/vegetation)) product group is part of Copernicus Land Monitoring Service (CLMS) and offers a collection of datasets designed to provide analysis of vegetation status across the globe. It contains a broad range of datasets including phenology and productivity parameters, seasonal growth trajectories, vegetation properties and indices.
`;

const getCorineLandCoverMarkdown = () => t`
**CORINE Land Cover (CLC)** inventory is a vector-based dataset that consists of 44 land cover and land use classes, derived from a series of satellite missions. In the majority of European countries, CLC is produced using visual interpretation of high resolution satellite imagery. In a few countries semi-automatic solutions are applied, using national in-situ data, satellite image processing, GIS integration and generalisation. More information [here](https://github.com/sentinel-hub/public-collections/tree/main/collections/corine-land-cover). 

**Coverage**: Most of Europe.

**Data availability**:
CLC data is updated every 6 years. In EO Browser, data is available on the following dates:
01-01-1990, 01-01-2000, 01-01-2006, 01-01-2012, 01-01-2018.

**Common Usage**:
Land use and land cover monitoring, analysis and change prediction for various applications, including environment, agriculture, transport and spatial planning. 
`;

const getGlobalLandCoverMarkdown = () => t`
**Global Land Cover** products provide a discrete land cover classification map according to UN-FAO Land Cover Classification System. Additional continuous fractional layers for all basic land cover classes are included as bands, to provide more detailed information on each land cover class. More information [here](https://github.com/sentinel-hub/public-collections/tree/main/collections/global-land-cover). 

**Coverage**: Global.

**Data availability**:
Updated on a yearly basis. In EO Browser, data is available on the following dates:
01-01-2015, 01-01-2016, 01-01-2017, 01-01-2018, 01-01-2019.

**Common Usage**: 
Land use and land cover monitoring, used to aid policy decisions on various issues, including agriculture and food security, biodiversity, climate change, forest and water resources, land degradation & desertification and rural development.
`;

const getWaterBodiesMarkdown = () => t`
The **Water Bodies** product shows the surface extent covered by inland water on a permanent, seasonal or occasional basis on a global scale. It contains one main Water Body detection layer (WB) and one Quality layer (QUAL), that provides information on the seasonal dynamics of the detected water bodies. More information [here](https://collections.sentinel-hub.com/water-bodies/). 

**Coverage**:
Global coverage from longitude -180°E to +180°W and latitude +80°N to -60°S. Depending on the month, some high latitude areas are not covered by Sentinel-2 satellites.

**Data Availability**:
Since October 2020, updated monthly. 

**Common Usage**
Monitoring of water bodies, droughts, floods and climate change.
`;

const getGlobalSurfaceWaterMarkdown = () => t`
The **Global Surface Water** collection is derived from Landsat 5, 7 and 8 imagery and shows various aspects of the spatio-temporal distribution of surface water between 1984 and 2020 (with annual revisions) at a global scale in six different layers. Surface water is considered as any uncovered stretch of water (fresh and salt water areas) greater than 30m² visible from space, including natural and artificial water bodies. More information [here](https://collections.sentinel-hub.com/global-surface-water/).

**Coverage**: Global coverage from longitude 170°E to 180°W and latitude 80°N to 50°S.

**Data Availability**: 1984 - 2019, 1984 - 2020.

**Spatial resolution**: 30 meters.

**Common Usage**: Monitoring of water bodies for water resource management, climate modelling, biodiversity conservation and food security.
`;

const getCLCAccountingMarkdown = () => t`
The **Corine Land Cover Accounting Layers** are status layers modified for the purpose of consistent statistical analysis in the land cover change accounting system. The modification combines CLC status and change layers in the 100 m raster in order to create homogeneous quality time series of CLC / CLC-change layers for accounting purposes. The CLC inventory consists of 44 land cover and land use classes derived from a series of satellite missions since it was first established. More information [here](https://collections.eurodatacube.com/corine-land-cover-accounting-layers/).

**Coverage**: Europe (EEA39 region).

**Data Availability**: Since 2000, updated every 6 years. Data available for 2000, 2006, 2012 and 2018.

**Spatial resolution**: 100 meters.

**Common Usage**: Land use and land cover monitoring, analysis and change prediction for various applications, including environment, agriculture, transport and spatial planning.`;

const CopernicusServicesTooltip = () =>
  DataSourceTooltip({
    source: getCopernicusServicesMarkdown(),
    credits: credits[DATASOURCES.COPERNICUS],
  });

const HRSIPSAMarkdown = () => t`
The **Persistent Snow Area (PSA)** product is generated annually from FSC products and provides the extent of persistent snow cover (the areas where snow is present throughout the hydrological year).

**Coverage**: Europe (EEA39 region) from longitude from 25°W to 45°E and latitude 26°N to 72°N.

**Data Availability**: September 1, 2016 to present 

**Spatial resolution**: 20 meters.

**Common Usage**: The product parameters can be applied to several applications such as weather forecasting, hydrological studies and water management. The snow and the ice cover are therefore essentials for assessing natural hazards such as floods, avalanches and managing the associated risks. The study of snow and ice cover also has socio-economic applications such as winter tourism, agriculture and forestry, hydroelectric power generation or water supply.
`;

const HRSIWDSMarkdown = () => t`
The **Wet/Dry Snow (WDS)** product maps the snow state conditions within the snow mask defined by the FSCTOC product.

**Coverage**: Europe (EEA39 region) from longitude from 25°W to 45°E and latitude 26°N to 72°N.

**Data Availability**: September 1, 2016 to present 

**Spatial resolution**: 60 meters.

**Common Usage**: The product parameters can be applied to several applications such as weather forecasting, hydrological studies and water management. The snow and the ice cover are therefore essentials for assessing natural hazards such as floods, avalanches and managing the associated risks. The study of snow and ice cover also has socio-economic applications such as winter tourism, agriculture and forestry, hydroelectric power generation or water supply.
`;

const HRSISWSMarkdown = () => t`
The **SAR Wet Snow (SWS)** product maps the wet snow extent in high-mountain areas.

**Coverage**: Europe (EEA39 region) from longitude from 25°W to 45°E and latitude 26°N to 72°N.

**Data Availability**: September 1, 2016 to present

**Spatial resolution**: 60m

**Common Usage**: The product parameters can be applied to several applications such as weather forecasting, hydrological studies and water management. The snow and the ice cover are therefore essentials for assessing natural hazards such as floods, avalanches and managing the associated risks. The study of snow and ice cover also has socio-economic applications such as winter tourism, agriculture and forestry, hydroelectric power generation or water supply.
`;

const HRSIFSCMarkdown = () => t`
The **Fractional Snow Cover (FSC)** product provides the snow fraction at the Top Of Canopy (FSCTOC) and On Ground (FSCOG). NDSI is also provided as part of this service.

**Coverage**: Europe (EEA39 region) from longitude from 25°W to 45°E and latitude 26°N to 72°N.

**Data Availability**: September 1, 2016 to present

**Spatial resolution**: 20-60m

**Common Usage**: The product parameters can be applied to several applications such as weather forecasting, hydrological studies and water management. The snow and the ice cover are therefore essentials for assessing natural hazards such as floods, avalanches and managing the associated risks. The study of snow and ice cover also has socio-economic applications such as winter tourism, agriculture and forestry, hydroelectric power generation or water supply.
`;

const HRSIGFSCMarkdown = () => t`
The daily cumulative **Gap-filled Fractional Snow Cover (GFSC)** product is a more complete version of the FSC product; gap-filled both at a spatial and temporal scale.

**Coverage**: Europe (EEA39 region) from longitude from 25°W to 45°E and latitude 26°N to 72°N.

**Data Availability**: September 1, 2016 to present

**Spatial resolution**: 20-60m

**Common Usage**: The product parameters can be applied to several applications such as weather forecasting, hydrological studies and water management. The snow and the ice cover are therefore essentials for assessing natural hazards such as floods, avalanches and managing the associated risks. The study of snow and ice cover also has socio-economic applications such as winter tourism, agriculture and forestry, hydroelectric power generation or water supply.
`;

const HRSIRLIES1Markdown = () => t`
**The River and Lake Ice Extent - Sentinel 1 (RLIE S1)** product measures the presence of ice in rivers and lakes described by the EU-HYDRO network database. It is released in near real time for the entire EEA zone based on the revisit time of the Sentinel-1 SAR constellation, and is generated at a spatial resolution of 20m x 20m.

**Coverage**: Europe (EEA39 region) from longitude 25°W to 45°E and latitude 26°N to 72°N.

**Data Availability**: September 1, 2016 - ongoing

**Spatial resolution**: 20m

**Common Usage**: The product parameters can be applied to several applications such as weather forecasting, hydrological studies and water management. The snow and the ice cover are therefore essentials for assessing natural hazards such as floods, avalanches and managing the associated risks. The study of snow and ice cover also has socio-economic applications such as winter tourism, agriculture and forestry, hydroelectric power generation or water supply.
`;

const HRSIRLIES2Markdown = () => t`
**The River and Lake Ice Extent - Sentinel 2 (RLIE S2)** product measures the presence of ice in rivers and lakes described by the EU-HYDRO network database. It is released in near real time for the entire EEA zone based on the revisit time of the Sentinel-2 constellation, and is generated at a spatial resolution of 20m x 20m.

**Coverage**: Europe (EEA39 region) from longitude 25°W to 45°E and latitude 26°N to 72°N.

**Data Availability**: September 1, 2016 - ongoing

**Spatial resolution**: 20m

**Common Usage**: The product parameters can be applied to several applications such as weather forecasting, hydrological studies and water management. The snow and the ice cover are therefore essentials for assessing natural hazards such as floods, avalanches and managing the associated risks. The study of snow and ice cover also has socio-economic applications such as winter tourism, agriculture and forestry, hydroelectric power generation or water supply.
`;

const HRSIRLIES1S2Markdown = () => t`
**The River and Lake Ice Extent S1+S2 (RLIE S1+S2)** product measures the presence of ice in rivers and lakes described by the EU-HYDRO network database. The RLIE S2 is gap-filled with the RLIE S1 and is only produced when both are acquired on the same day. It is delivered delayed with a 20m x 20m spatial resolution for the entire EEA39 zone.

**Coverage**: Europe (EEA39 region) from longitude 25°W to 45°E and latitude 26°N to 72°N.

**Data Availability**: September 1, 2016 - ongoing

**Spatial resolution**: 20m

**Common Usage**: The product parameters can be applied to several applications such as weather forecasting, hydrological studies and water management. The snow and the ice cover are therefore essentials for assessing natural hazards such as floods, avalanches and managing the associated risks. The study of snow and ice cover also has socio-economic applications such as winter tourism, agriculture and forestry, hydroelectric power generation or water supply.
`;

const Tooltip = (getMarkdown, url) => {
  return (
    <div>
      <div className="data-source-group-tooltip-description">
        <ReactMarkdown children={getMarkdown()} linkTarget="_blank" />
      </div>
      <div className="data-source-group-tooltip-credits">
        <div>{t`Credits:`}</div>
        <div>
          <ExternalLink href={url}>
            <img src={logoCopernicus} alt="Copernicus" className="data-source-group-tooltip-logo" />
          </ExternalLink>
        </div>
      </div>
    </div>
  );
};

const CorineLandCoverTooltip = () =>
  DataSourceTooltip({ source: getCorineLandCoverMarkdown(), credits: credits[COPERNICUS_CORINE_LAND_COVER] });

const GlobalLandCoverTooltip = () =>
  DataSourceTooltip({ source: getGlobalLandCoverMarkdown(), credits: credits[COPERNICUS_GLOBAL_LAND_COVER] });

const WaterBodiesTooltip = () =>
  DataSourceTooltip({ source: getWaterBodiesMarkdown(), credits: credits[COPERNICUS_WATER_BODIES] });

const GlobalSurfaceWaterTooltip = () =>
  DataSourceTooltip({
    source: getGlobalSurfaceWaterMarkdown(),
    credits: credits[COPERNICUS_GLOBAL_SURFACE_WATER],
  });

const CLCAccountingTooltip = () =>
  DataSourceTooltip({ source: getCLCAccountingMarkdown(), credits: credits[COPERNICUS_CLC_ACCOUNTING] });

const HRSIPSATooltip = () =>
  Tooltip(
    HRSIPSAMarkdown,
    'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/snow-products/persistent-snow-area',
  );

const HRSIWDSTooltip = () =>
  Tooltip(
    HRSIWDSMarkdown,
    'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/snow-products/snow-state-conditions',
  );

const HRSISWSTooltip = () =>
  Tooltip(
    HRSISWSMarkdown,
    'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/snow-products/snow-state-conditions',
  );

const HRSIFSCTooltip = () =>
  Tooltip(
    HRSIFSCMarkdown,
    'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/snow-products/snow-state-conditions',
  );

const HRSIGFSCTooltip = () =>
  Tooltip(
    HRSIGFSCMarkdown,
    'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring',
  );

const HRSIRLIES1Tooltip = () =>
  Tooltip(
    HRSIRLIES1Markdown,
    'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/ice-products/ice-cover',
  );

const HRSIRLIES2Tooltip = () =>
  Tooltip(
    HRSIRLIES2Markdown,
    'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/ice-products/ice-cover',
  );

const HRSIRLIES1S2Tooltip = () =>
  Tooltip(
    HRSIRLIES1S2Markdown,
    'https://land.copernicus.eu/pan-european/biophysical-parameters/high-resolution-snow-and-ice-monitoring/ice-products/ice-cover',
  );

export {
  CopernicusServicesTooltip,
  CorineLandCoverTooltip,
  GlobalLandCoverTooltip,
  WaterBodiesTooltip,
  GlobalSurfaceWaterTooltip,
  CLCAccountingTooltip,
  getCopernicusServicesMarkdown,
  getCopernicusSnowAndIceMarkdown,
  getCopercnicusVegetationMarkdown,
  getCorineLandCoverMarkdown,
  getGlobalLandCoverMarkdown,
  getWaterBodiesMarkdown,
  getGlobalSurfaceWaterMarkdown,
  getCLCAccountingMarkdown,
  HRSIPSATooltip,
  HRSIWDSTooltip,
  HRSISWSTooltip,
  HRSIFSCTooltip,
  HRSIGFSCTooltip,
  HRSIRLIES1Tooltip,
  HRSIRLIES2Tooltip,
  HRSIRLIES1S2Tooltip,
  HRSIPSAMarkdown,
  HRSIWDSMarkdown,
  HRSISWSMarkdown,
  HRSIFSCMarkdown,
  HRSIGFSCMarkdown,
  HRSIRLIES1Markdown,
  HRSIRLIES2Markdown,
  HRSIRLIES1S2Markdown,
};
