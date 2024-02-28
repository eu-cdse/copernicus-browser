import { t } from 'ttag';
import { DATASOURCES } from '../../../../../const';
import { credits } from './credits';
import DataSourceTooltip from './DataSourceTooltip';

const getPlanetBasemapMarkdown = () => t`
Through the **NICFI** (Norway’s International Climate & Forests Initiative) Satellite Data Program, anyone can access 
Planet’s high-resolution, analysis-ready mosaics of the world’s tropics in order to support reducing and reversing the 
loss of tropical forests, combating climate change, conserving biodiversity, contributing to forest regrowth, restoration 
and enhancement, and facilitating sustainable development. You can view, download and stream access by signing up for the 
NICFI Satellite Data Program [here](http://www.planet.com/nicfi).

**Spatial resolution:** < 5 metres.

**Data availability:** Global tropical regions, September 2015 - August 2020 biannually, from September 2020 monthly.

**Common usage:** Forest management, urban growth monitoring, biodiversity conservation.
`;

const PlanetBasemapTooltip = () =>
  DataSourceTooltip({
    source: getPlanetBasemapMarkdown(),
    credits: credits[DATASOURCES.PLANET_NICFI],
  });

export { PlanetBasemapTooltip, getPlanetBasemapMarkdown };
