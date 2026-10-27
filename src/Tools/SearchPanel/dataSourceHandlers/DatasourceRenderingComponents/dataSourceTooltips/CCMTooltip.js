import { t } from 'ttag';

const getCCMVHRImage2018Markdown = () => t`
This dataset comprises one cloud-free Very High Resolution optical coverage of 39 European States (EEA-39) including all islands of those countries plus 
the French Overseas Departments of French Guiana, Martinique, Guadeloupe, Mayotte and Réunion but excluding French Overseas Territories for a total coverage 
of ~ 6 million square kilometres. The area of interest is extended by a 4 km buffer over the sea and a 500 m buffer over countries bordering the EEA-39 states. 
More [info](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/VHR-IMAGE-2018).
`;

const getCCMVHRImage2021Markdown = () => t`
This dataset comprises one cloud-free Very High Resolution optical coverage of 39 European States (EEA-39) including all islands of those countries plus 
the French Overseas Departments of French Guiana, Martinique, Guadeloupe, Mayotte and Réunion but excluding French Overseas Territories. The area of 
interest (~6 million square kilometres) is extended by a 4 km buffer over the sea and a 500 m buffer over countries bordering the EEA-39 states. 
More info [here](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions/collections-description/VHR-IMAGE-2021). 
`;

const getCCMVHRImage2024Markdown = () => t`
This dataset comprises one cloud-free Very High Resolution optical coverage of 39 European States (EEA-39) including all islands of those countries plus
the French Overseas Departments of French Guiana, Martinique, Guadeloupe, Mayotte and Réunion but excluding French Overseas Territories. The area of
interest (~6 million square kilometres) is extended by a 4 km buffer over the sea and a 500 m buffer over countries bordering the EEA-39 states.
More info [here](https://dataspace.copernicus.eu/optical-vhr-coverage-over-europe-vhrimage2024).
`;

const getCCMMRThermalLSTMarkdown = () => t`
The collection holds Level-2 Land Surface Temperature (LST) products from OroraTech’s
FOREST satellites, at 200 m ground sampling distance, over selected European pilot sites.
Each product is a Cloud Optimized GeoTIFF giving the land surface temperature, in Kelvin.
Daytime and night-time acquisitions from complementary orbits make the collection suited to
studying the daily temperature cycle, urban heat islands, drought and surface water stress.
`;

const getCCMVHRImageMosaic2024Markdown = () => t`
This mosaic dataset, directly processed and delivered by the data provider, comprises one cloud-free Very High Resolution optical coverage of 39 European States (EEA-39) including all islands of those countries plus
the French Overseas Departments of French Guiana, Martinique, Guadeloupe, Mayotte and Réunion but excluding French Overseas Territories. The area of
interest (~6 million square kilometres) is extended by a 4 km buffer over the sea and a 500 m buffer over countries bordering the EEA-39 states.
More info [here](https://dataspace.copernicus.eu/optical-vhr-coverage-over-europe-vhrimage2024).
`;

const getCCMCollectionMarkdown = () => t`
The Copernicus Contributing Missions (CCM) provide data that complements the Copernicus Sentinel Missions and play a crucial role in Earth observation.
These missions are conducted by ESA, its Member States, and international third-party operators, and they offer very high to high resolution optical, radar
and elevation model data. More [info](https://dataspace.copernicus.eu/explore-data/data-collections/copernicus-contributing-missions).
`;

export {
  getCCMCollectionMarkdown,
  getCCMVHRImage2018Markdown,
  getCCMVHRImage2021Markdown,
  getCCMVHRImage2024Markdown,
  getCCMVHRImageMosaic2024Markdown,
  getCCMMRThermalLSTMarkdown,
};
