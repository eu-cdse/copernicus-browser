import { t } from 'ttag';
import { DATASOURCES } from '../../../../../const';
import { credits } from './credits';
import DataSourceTooltip from './DataSourceTooltip';

const getProbaVMarkdown = () => t`
The **Proba-V** satellite is a small satellite designed to map land cover and vegetation growth
across the entire globe every two days. EO Browser provides derived products which minimize cloud
cover by combining cloud-free measurement within a 1 day (S1), 5 days (S5) and 10 days (S10) period.

**Spatial resolution:** 100m for S1 and S5, 333m for S1 and S10, 1000m for S1 and S10.

**Revisit time:** 1 day for latitudes 35-75°N and 35-56°S, 2 days for latitudes between 35°N
and 35°S.

**Data availability:** From October 2013 to February 2021.

**Common usage:** The observation of land cover, vegetation growth, climate impact assessment,
water resource management, agricultural monitoring and food security estimates, inland water
resource monitoring and tracking the steady spread of deserts and deforestation.
`;

const ProbaVTooltip = () =>
  DataSourceTooltip({
    source: getProbaVMarkdown(),
    credits: credits[DATASOURCES.PROBAV],
  });

export { ProbaVTooltip, getProbaVMarkdown };
