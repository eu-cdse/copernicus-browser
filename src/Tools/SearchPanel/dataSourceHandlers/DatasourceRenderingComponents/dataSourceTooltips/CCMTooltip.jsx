import { t } from 'ttag';
import DataSourceTooltip from './DataSourceTooltip';

const getCCMVHRImage2018Markdown = () => t`
This dataset comprises one cloud-free Very High Resolution optical coverage of 39 European States (EEA-39) including all islands of those countries plus 
the French Overseas Departments of French Guiana, Martinique, Guadeloupe, Mayotte and Réunion but excluding French Overseas Territories for a total coverage 
of ~ 6 million square kilometres. The area of interest is extended by a 4 km buffer over the sea and a 500 m buffer over countries bordering the EEA-39 states. 
More [info](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/VHR-IMAGE-2018).
`;

const CCMVHRImage2018Tooltip = () =>
  DataSourceTooltip({
    source: getCCMVHRImage2018Markdown(),
  });

const getCCMVHRImage2021Markdown = () => t`
This dataset comprises one cloud-free Very High Resolution optical coverage of 39 European States (EEA-39) including all islands of those countries plus 
the French Overseas Departments of French Guiana, Martinique, Guadeloupe, Mayotte and Réunion but excluding French Overseas Territories. The area of 
interest (~6 million square kilometres) is extended by a 4 km buffer over the sea and a 500 m buffer over countries bordering the EEA-39 states. 
More info [here](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/VHR-IMAGE-2021). 
`;

const CCMVHRImage2021Tooltip = () =>
  DataSourceTooltip({
    source: getCCMVHRImage2021Markdown(),
  });

const getCCMVHRImage2024Markdown = () => t`
This dataset comprises one cloud-free Very High Resolution optical coverage of 39 European States (EEA-39) including all islands of those countries plus 
the French Overseas Departments of French Guiana, Martinique, Guadeloupe, Mayotte and Réunion but excluding French Overseas Territories. The area of 
interest (~6 million square kilometres) is extended by a 4 km buffer over the sea and a 500 m buffer over countries bordering the EEA-39 states. 
More info [here](https://dataspace.copernicus.eu/optical-vhr-coverage-over-europe-vhrimage2024). 
`;

const CCMVHRImage2024Tooltip = () =>
  DataSourceTooltip({
    source: getCCMVHRImage2024Markdown(),
  });

const getCCMCollectionMarkdown = () => t`
The Copernicus Contributing Missions (CCM) provide data that complements the Copernicus Sentinel Missions and play a crucial role in Earth observation. 
These missions are conducted by ESA, its Member States, and international third-party operators, and they offer very high to high resolution optical, radar 
and elevation model data. More [info](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions).
`;

const CCMCollectionTooltip = () =>
  DataSourceTooltip({
    source: getCCMCollectionMarkdown(),
  });

export {
  getCCMCollectionMarkdown,
  CCMCollectionTooltip,
  getCCMVHRImage2018Markdown,
  CCMVHRImage2018Tooltip,
  getCCMVHRImage2021Markdown,
  CCMVHRImage2021Tooltip,
  getCCMVHRImage2024Markdown,
  CCMVHRImage2024Tooltip,
};
