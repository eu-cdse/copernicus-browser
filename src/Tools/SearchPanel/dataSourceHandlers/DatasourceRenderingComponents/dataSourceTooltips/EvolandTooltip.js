import DataSourceTooltip from './DataSourceTooltip';

const getEvolandCollectionMarkdown = () => `
Geographical information on land cover and its changes, land use, ground motion, vegetation state, water cycle and earth surface energy variables for both Europe and the entire globe. Visit the [CLMS website](https://land.copernicus.eu/en) for more information.
`;

const EvolandCollectionTooltip = () =>
  DataSourceTooltip({
    source: getEvolandCollectionMarkdown(),
  });

const getC01ContinuousForestMonitoringDescription = () => `
Provides spatio-temporal information on tree cover disturbances (canopy changes and losses) for a monitoring period of three years. More information [here](https://www.evo-land.eu/prototype/c1-continuous-forest-monitoring/).`;

const getC02ForestDisturbanceDescription = () => `
Provides information on the forest disturbance agents, for the areas detected as disturbed in the Continuous Forest Monitoring prototype (C1). More information [here](https://www.evo-land.eu/prototype/c2-forest-disturbance-mapping/).`;

const getC03ForestBiomassDescription = () => `
Provides information on Above-Ground Woody Biomass (AGB) and Forest Canopy Height (FCH). More information [here](https://www.evo-land.eu/prototype/c3-forest-biomass-mapping/).`;

const getC04CoverCropTypeDescription = () => `
Provides spatial information on cover crop types at parcel level and on an annual basis. More information [here](https://www.evo-land.eu/prototype/c4-cover-crop-type-mapping/).`;

const getC05GrasslandCroplandGPPDescription = () => `
Provides the Gross Primary Production (GPP, [gC/m²/day), which indicates the total amount of carbon compounds fixed by plants through photosynthesis in cropland and grassland in a given period of time. 10-day observations are available. More information [here](https://www.evo-land.eu/prototype/c5-cropland-grassland-gpp-monitoring/).`;

const getC06SmallLandscapeFeaturesDescription = () => `
Provides the mapping of woody vegetated features outside forests and stable landscape features within agricultural areas (grass margin, ditches, ponds, hedges). More information [here](https://www.evo-land.eu/prototype/c6-small-landscape-features-mapping/).`;

const getC07ImprovedWaterBodiesMappingDescription = () => `
Provides spatio-temporal information about inland water and maps permanent, new and ephemeral water bodies. More information [here](https://www.evo-land.eu/prototype/c7-improved-water-bodies-mapping/).`;

const getC08ContinuousImperviousnessMonitoringDescription = () => `
Monitors the percentage of soil sealing and captures the spatial distribution of artificially sealed areas including the level of sealing of the soil per area unit every 6 months at 5 m spatial resolution. More information [here](https://www.evo-land.eu/prototype/c8-continuous-imperviousness-monitoring/).`;

const getC09AutomatedLandUseMappingDescription = () => `
Provides a mapping of automatically detected urban change polygons, including the main type of change detected, with a spatial resolution of 5 m and a temporal resolution of one year. More information [here](https://www.evo-land.eu/prototype/c9-automated-land-use-mapping-of-urban-dynamics/).`;

const getC10LandSurfaceCharacteristicsDescription = () => `
Provides spatial information on Land Surface Categories (LSC), i.e. classes of basic, observable bio-geophysical properties of the Earth's surface. The LSC are mapped at a 10 m resolution for individual Sentinel-2 scenes. More information [here](https://www.evo-land.eu/prototype/c10-continuous-mapping-of-land-surface-categories/).`;

const getC11OnDemandLandCoverMappingDescription = () => `
Demonstrates the output of the on-demand land cover mapping use case on forest management type mapping. More information [here](https://www.evo-land.eu/prototype/c11-on-demand-land-cover-mapping/).`;

const getC12TreeTypesDescription = () =>
  `The Tree Types Mapping prototype provides information on the dominant tree species for a demonstration site in Central Europe, based on Sentinel-2 data. More information [here](https://www.evo-land.eu/prototype/c12-tree-type-mapping/).`;

export {
  EvolandCollectionTooltip,
  getC01ContinuousForestMonitoringDescription,
  getC02ForestDisturbanceDescription,
  getC03ForestBiomassDescription,
  getC04CoverCropTypeDescription,
  getC05GrasslandCroplandGPPDescription,
  getC06SmallLandscapeFeaturesDescription,
  getC07ImprovedWaterBodiesMappingDescription,
  getC08ContinuousImperviousnessMonitoringDescription,
  getC09AutomatedLandUseMappingDescription,
  getC10LandSurfaceCharacteristicsDescription,
  getC11OnDemandLandCoverMappingDescription,
  getC12TreeTypesDescription,
};
