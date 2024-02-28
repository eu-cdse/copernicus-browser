import { t } from 'ttag';
import { credits } from './credits';
import { ESA_WORLD_COVER } from '../../dataSourceConstants';
import DataSourceTooltip from './DataSourceTooltip';

const getWorldCoverMarkdown = () => t`
The **ESA WorldCover** product is the first global land cover map at 10 m resolution based on both Sentinel-1 and Sentinel-2 data. More information [here](https://esa-worldcover.org/).

**Coverage**: Global coverage.

**Data Availability**: 2020.

**Spatial resolution**: 10 meters.

**Common Usage**: Development of novel services to help with preserving biodiversity, food security, carbon assessment and climate modelling.
`;

const WorldCoverTooltip = () =>
  DataSourceTooltip({
    source: getWorldCoverMarkdown(),
    credits: credits[ESA_WORLD_COVER],
  });

export { getWorldCoverMarkdown, WorldCoverTooltip };
