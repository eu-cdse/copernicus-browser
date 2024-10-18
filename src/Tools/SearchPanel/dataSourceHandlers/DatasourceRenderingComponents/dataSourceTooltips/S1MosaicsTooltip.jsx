import { t } from 'ttag';

const getSentinel1DHMosaic = () => t`
The **Sentinel-1 DH Monthly Mosaics** is a monthly composite obtained by computing the local resolution weighted average of radiometrically and geometrically terrain corrected input scenes. Due to the use of all available data in a month, it contains less speckle (temporal average) and the best possible local resolution (combination of ascending and descending orbits).

The input for the Sentinel-1 DH Monthly Mosaics are scenes with DH polarization and can come from all acquisition modes.

**Coverage:** Primarily polar and near-polar areas, as well as ocean-relevant areas

**Data availability:** 2020, 2023, 2024 (January – August)

The data for each month is available in the catalog on the 1st day of the corresponding month (e.g. 1.1. or 1.2.).

**Spatial Resolution:** ~40 meters.
`;

const getSentinel1IWMosaic = () => t`
The **Sentinel-1 IW Monthly Mosaics** is a monthly composite obtained by computing the local resolution weighted average of radiometrically and geometrically terrain corrected input scenes. Due to the use of all available data in a month, it contains less speckle (temporal average) and the best possible local resolution (combination of ascending and descending orbits).

The input for the Sentinel-1 IW Monthly Mosaics are scenes taken in the IW acquisition mode with DV polarization. 

**Coverage:** Over land and coastal areas (mainly between 80°N and 56°S)

**Data availability:** 2020, 2023, 2024 (January – August)

The data for each month is available in the catalog on the 1st day of the corresponding month (e.g. 1.1. or 1.2.).

**Spatial Resolution:** ~20 meters.
`;

export { getSentinel1DHMosaic, getSentinel1IWMosaic };
