import { t } from 'ttag';

const getSentinel1Markdown = () => t`
**Sentinel-1** provides all-weather, day and night radar imagery for land and ocean services. EO
Browser provides data acquired in Interferometric Wide Swath (IW) and Extra Wide Swath (EW) modes
processed to Level-1 Ground Range Detected (GRD).

**Pixel spacing:** 10m (IW), 40m (EW).

**Revisit time:** <= 5 days using both satellites.

**Revisit time** (for asc/desc and overlap using both satellites): <= 3 days, see [observation scenario](https://sentinel.esa.int/web/sentinel/missions/sentinel-1/observation-scenario)

**Data availability:** Since October 2014.

**Common usage:** Maritime and land monitoring, emergency response, climate change.
`;

export { getSentinel1Markdown };
