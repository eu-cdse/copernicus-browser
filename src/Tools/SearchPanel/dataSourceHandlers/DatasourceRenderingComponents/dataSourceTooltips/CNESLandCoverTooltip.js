import { t } from 'ttag';
import { credits } from './credits';
import { CNES_LAND_COVER } from '../../dataSourceConstants';
import DataSourceTooltip from './DataSourceTooltip';

const CNESLandCoverMarkdown = () => t`
The **CNES Land Cover Map** (Occupation des Sols, OSO) produces land classification for Metropolitan France at 10 m spatial resolution based on Sentinel-2 L2A data within the Theia Land Cover CES framework. Maps for 2020, 2019, and 2018 use a 23-categories nomenclature. For earlier maps in 2017 and 2016, a fully compatible 17-classes nomenclature is employed. More information [here](https://collections.sentinel-hub.com/cnes-land-cover-map/).

**Coverage**: Metropolitan France

**Data Availability**: 2016 - ongoing

**Spatial resolution**: 10 meters
`;

const CNESLandCoverTooltip = () =>
  DataSourceTooltip({
    source: CNESLandCoverMarkdown(),
    credits: credits[CNES_LAND_COVER],
  });

export { CNESLandCoverTooltip, CNESLandCoverMarkdown };
