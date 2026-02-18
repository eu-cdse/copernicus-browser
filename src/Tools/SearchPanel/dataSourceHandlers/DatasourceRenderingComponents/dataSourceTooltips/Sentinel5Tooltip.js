import { t } from 'ttag';
import { DATASOURCES } from '../../../../../const';
import { credits } from './credits';
import DataSourceTooltip from './DataSourceTooltip';

const getS5Markdown = () => t`
**Sentinel-5P** is a satellite that provides atmospheric measurements to be used for air quality, ozone monitoring, UV radiation,
 and climate monitoring and forecasting.

**Spatial resolution:** 7 x 3.5km (that is, only details bigger than 7 x 3.5km can be seen).

**Revisit time:** Maximum 1 day to revisit the same area.

**Data availability:** Since April 2018 onwards.

**Common usage:** Monitoring the concentration of carbon monoxide (CO), nitrogen dioxide (NO2) and ozone (O3) in the air. Monitoring the UV aerosol index (AER_AI) and various geophysical parameters of clouds (Cloud).

`;

const getS5O3Markdown = () =>
  t`### Ozone (O3)\n\n\n\nOzone is of crucial importance for the equilibrium of the Earth atmosphere. In the stratosphere, the ozone layer shields the biosphere from dangerous solar ultraviolet radiation. In the troposphere, it acts as an efficient cleansing agent, but at high concentration it also becomes harmful to the health of humans, animals, and vegetation. Ozone is also an important greenhouse-gas contributor to ongoing climate change. Since the discovery of the Antarctic ozone hole in the 1980s and the subsequent Montreal Protocol regulating the production of chlorine-containing ozone-depleting substances, ozone has been routinely monitored from the ground and from space. Measurements are in mol per square meter (mol/ m^2)\n\n\n\nMore info [here.](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/sentinel-5-precursor-level-2-ozone-profile)`;

const getS5NO2Markdown = () =>
  t`### Nitrogen Dioxide (NO2)\n\n\n\nNitrogen dioxide (NO2) and nitrogen oxide (NO) together are usually referred to as nitrogen oxides. They are important trace gases in the Earth’s atmosphere, present in both the troposphere and the stratosphere. They enter the atmosphere as a result of anthropogenic activities (particularly fossil fuel combustion and biomass burning) and natural processes (such as microbiological processes in soils, wildfires and lightning). Measurements are in mol per square meter (mol/ m^2).\n\n\n\nMore info [here.](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/sentinel-5-precursor-level-2-nitrogen-dioxide)`;

const getS5SO2Markdown = () =>
  t`### Sulfur Dioxide (SO2)\n\n\n\nSulphur dioxide enters the Earth’s atmosphere through both natural and anthropogenic (human made) processes. It plays a role in chemistry on a local and global scale and its impact ranges from short term pollution to effects on climate. Only about 30% of the emitted SO2 comes from natural sources; the majority is of anthropogenic origin. Sentinel-5P/TROPOMI instrument samples the Earth’s surface with a revisit time of one day with a spatial resolution of 3.5 x 7 km which allows the resolution of fine details including the detection of smaller SO2 plumes. Measurements are in mol per square meter (mol/ m^2).\n\n\n\nMore info [here.](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/sentinel-5-precursor-level-2-sulphur-dioxide)`;

const getS5COMarkdown = () =>
  t`### Carbon Monoxide (CO)\n\n\n\nCarbon monoxide (CO) is an important atmospheric trace gas. In certain urban areas, it is a major atmospheric pollutant. Main sources of CO are combustion of fossil fuels, biomass burning, and atmospheric oxidation of methane and other hydrocarbons. The carbon monoxide total column is measured in mol per square meter (mol/ m^2).\n\n\n\nMore info [here.](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/sentinel-5-precursor-level-2-carbon-monoxide)`;

const getS5HCHOMarkdown = () =>
  t`### Formaldehyde (HCHO)\n\n\n\nLong term satellite observations of tropospheric formaldehyde (HCHO) are essential to support air quality and chemistry-climate related studies from the regional to the global scale. The seasonal and inter-annual variations of the formaldehyde distribution are principally related to temperature changes and fire events, but also to changes in anthropogenic (human-made) activities. Its lifetime being of the order of a few hours, HCHO concentrations in the boundary layer can be directly related to the release of short-lived hydrocarbons, which mostly cannot be observed directly from space. Measurements are in mol per square meter (mol/ m^2).\n\n\n\nMore info [here.](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/sentinel-5-precursor-level-2-formaldehyde)`;

const getS5CH4Markdown = () =>
  t`### Methane (CH4)\n\n\n\nMethane is, after carbon dioxide, the most important contributor to the anthropogenically (caused by human activity) enhanced greenhouse effect. Measurements are provided in parts per billion (ppb) with a spatial resolution of 7 km x 3.5 km.\n\n\n\nMore info [here.](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/tropomi-level-2-methane)`;

const getS5AERAIMarkdown = () =>
  t`### Aerosol Index\n\nThe Aerosol Index (AI) is a qualitative index indicating the presence of elevated layers of aerosols in the atmosphere. It can be used to detect the presence of UV absorbing aerosols such as desert dust and volcanic ash plumes. Positive values (from light blue to red) indicate the presence of UV-absorbing aerosol. This index is calculated for two pairs of wavelengths: 340/380 nm and 354/388 nm.\n\nMore info [here.](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/sentinel-5-precursor-level-2-ultraviolet-aerosol-index)`;

const getS5CloudMarkdown = () =>
  t`### Cloud\n\nThe TROPOMI instrument, single payload onboard Sentinel-5 Precursor, retrieves operationally the most important quantities for cloud correction of satellite trace gas retrievals: cloud fraction, cloud optical thickness (albedo), and cloud-top pressure (height). Cloud parameters from TROPOMI are not only used for enhancing the accuracy of trace gas retrievals, but also to extend the satellite data record of cloud information.\n\nMore info [here](https://sentinels.copernicus.eu/web/sentinel/data-products/-/asset_publisher/fp37fc19FN8F/content/sentinel-5-precursor-level-2-cloud).`;

const Sentinel5Tooltip = () =>
  DataSourceTooltip({
    source: getS5Markdown(),
    credits: credits[DATASOURCES.S5_CDAS],
  });

export {
  Sentinel5Tooltip,
  getS5Markdown,
  getS5O3Markdown,
  getS5NO2Markdown,
  getS5SO2Markdown,
  getS5COMarkdown,
  getS5HCHOMarkdown,
  getS5CH4Markdown,
  getS5AERAIMarkdown,
  getS5CloudMarkdown,
};
