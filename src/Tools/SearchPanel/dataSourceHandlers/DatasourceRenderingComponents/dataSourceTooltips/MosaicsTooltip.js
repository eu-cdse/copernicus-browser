import { t } from 'ttag';

const getWorldCoverAnnualCloudlessMosaic = () => t`
The **WorldCover Annual Cloudless Mosaics** product offers an almost cloud-free image over the entire globe, created by stitching together the cloudless Sentinel-2 images acquired over a one-year period at a spatial resolution of 10 meters.

More information can be found [here](https://documentation.dataspace.copernicus.eu/Data/Additional.html#sentinel-2-level-2a-worldcover-annual-cloudless-mosaics-rgbnir).

**Coverage:** Global Coverage.

**Data availability:** 2020, 2021

Data for each year is available in the catalog on the 1.1. of the corresponding year.

**Spatial Resolution:** 10 meters.

**Common usage:** Creating Basemaps, Land cover classification, Infrastructure/Land use planning, Environmental monitoring, Water resource management and more.
`;

const getSentinel2QuarterlyCloudlessMosaic = () => t`
The **Sentinel-2 Quarterly Mosaics** product offers an almost cloud-free image over the entire globe, created by stitching together the cloudless Sentinel-2 images acquired over a quarterly period (every 3 months) at a spatial resolution of 10 meters.

**Coverage:** Global Coverage.

**Data availability:** 2019 – Apr 2025

Data for each quarter is available in the catalog on the 1st day of the corresponding quarter (e.g. 1.1. or 1.4.).

**Spatial Resolution:** 10 meters.

**Common usage:** Creating Basemaps, Land cover classification, Infrastructure/Land use planning, Environmental monitoring, Water resource management and more.
`;

export { getWorldCoverAnnualCloudlessMosaic, getSentinel2QuarterlyCloudlessMosaic };
