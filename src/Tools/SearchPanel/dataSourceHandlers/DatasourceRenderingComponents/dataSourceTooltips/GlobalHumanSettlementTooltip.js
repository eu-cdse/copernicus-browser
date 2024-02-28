import { t } from 'ttag';
import { credits } from './credits';
import { GLOBAL_HUMAN_SETTLEMENT } from '../../dataSourceConstants';
import DataSourceTooltip from './DataSourceTooltip';

const GHSMarkdown = () => t`
The **Global Human Settlement** (GHS) framework produces global maps of built-up areas, population density and settlements to monitor human presence on Earth over time.

**Coverage**: Global coverage with longitude from 180°W to 180°E and latitude from 72°N to 56°S

**Data Availability**: Reference year 2018

**Spatial resolution**: 10 meters.

**Common Usage**: Knowledge of population distribution and density has a number of applications, including disaster risk management or the study and management of urbanisation processes, not only but also in relation to the challenges of climate change and environmental degradation. 
`;

const GHSTooltip = () =>
  DataSourceTooltip({
    source: GHSMarkdown(),
    credits: credits[GLOBAL_HUMAN_SETTLEMENT],
  });

export { GHSTooltip, GHSMarkdown };
