import { t } from 'ttag';
import { DATASOURCES } from '../../../../../const';
import { credits } from './credits';
import DataSourceTooltip from './DataSourceTooltip';

const getGIBSMarkdown = () => t`
**GIBS** (Global Imagery Browse Services) provides quick access to over 600 satellite imagery
products, covering every part of the world. Most imagery is available within a few hours after
satellite overpass, some products span almost 30 years.
`;

const GibsTooltip = () =>
  DataSourceTooltip({
    source: getGIBSMarkdown(),
    credits: credits[DATASOURCES.GIBS],
  });

export { GibsTooltip, getGIBSMarkdown };
