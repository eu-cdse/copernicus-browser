import { t } from 'ttag';
import { AttributeNames } from './attributes';

const productAvailabilityTooltip =
  () => t`The product availability indicates whether a product can be downloaded immediately (*Immediate*) or must first be processed in the user's workspace (*To order*). The workspace offers processing options for:
- Sentinel-1 Level-1 SLC and
- Sentinel-2 L2A.

The *To order* filter should therefore only be used when searching for one of these two product types.`;

const S1 = {
  [AttributeNames.platformSerialIdentifier]: () =>
    t`The available Sentinel-1 data includes products from the Sentinel-1 satellite constellation, including Sentinel-1A (operational since 2014), Sentinel-1B (operational from 2016 to 2022) and Sentinel-1C (sample).`,
  [AttributeNames.orbitDirection]: () =>
    t`Determines whether the data was recorded during a descending orbit (flight direction: north - south) or an ascending orbit (flight direction: south - north).`,
  [AttributeNames.relativeOrbitNumber]: () =>
    t`The Relative Orbit Number is the number of full orbits (between successive ascending node crossings through the Equator) since the relative orbit 1 to the end of a cycle. The relative orbit 1 is the orbit whose ascending node crossing is closest to the Greenwich Meridian. Sentinel-1 is in a near-polar, sun-synchronous orbit with a repeat cycle of 12 days and 175 orbits per cycle for a single satellite.`,
  [AttributeNames.operationalMode]:
    () => t`Sentinel-1 operates in 4 exclusive instrument acquisition modes. Depending on the instrument mode, the data products may be available in different polarisation, resolution and swath withs (between 20 km and 410 km). The four different modes are:
- Stripmap (SM) 
- Interferometric Wide swath (IW)
- Extra-Wide swath (EW)
- Wave (WV)
  `,
  [AttributeNames.swathIdentifier]:
    () => t`Depending on the acquistion mode, the following swaths and identifiers are possible:
- S1-S6 for SM mode (currently the only supported option)
- IW1-IW3 for IW mode
- EW1-EW5 for EW mode
- WV1-WV2 for WV mode
  `,
  [AttributeNames.polarisationChannels]:
    () => t`Determines with which polarisation the data was acquired. The first letter indicates the polarisation when sending the signal, the second letter when receiving the signal, e.g., HV = horizontal polarisation when sending the signal and vertical polarisation when receiving.\n
Data can be acquired in single polarisation HH (SH) or VV (SV) or in dual polarisation HH&HV (DH) or VV&VH (DV), depending on the instrument mode.\n
SM, IW and EW can be acquired in single or dual polarisation. WV can only be acquired in single polarisation.`,
  [AttributeNames.online]: productAvailabilityTooltip,
  [AttributeNames.resolution]:
    () => t`Only applies for Level-1 GRD products and varies depending on the acquisition mode:
  - 3.5 m pixel spacing (full resolution: only SM mode) 
  - 10 m pixel spacing (high resolution: SW, IW mode)
  - 25 m pixel spacing (high resolution: EW mode; medium resolution: WV mode)
  - 40 m pixel spacing (medium resolution: SM, IW, EW mode)
  `,
  [AttributeNames.productClass]:
    () => t`Depending on the processing level different product classes are available:
  - Standard (S): all processing levels
  - Calibration (C): Level-0 products 
  - Noise (N): Level-0 products
  - Annotation (A): Level-1 and Level-2 products
  `,
};

const S2 = {
  [AttributeNames.platformSerialIdentifier]: () =>
    t`The available Sentinel-2 data includes products from the Sentinel-2 satellite constellation, including Sentinel-2A (operational since 2015) and Sentinel-2B (operational since  2017).`,
  [AttributeNames.relativeOrbitNumber]: () =>
    t`The Relative Orbit Number is the number of full orbits (between sucessive ascending node crossings through the Equator) since the relative orbit 1 until the end of a cycle. The relative orbit 1 is the orbit whose ascending node crossing is closest to the Greenwich Meridian. Sentinel-2 is in a sun-synchronous orbit with a 10-day repeat cycle (5-days with both satellites) and 143 orbits per cycle.`,
  [AttributeNames.origin]: () =>
    t`The available Sentinel-2 data is processed either by ESA or by CloudFerro.`,
  [AttributeNames.online]: productAvailabilityTooltip,
  [AttributeNames.S2Collection]: () =>
    t`Sentinel-2 Collection 1 represents the product dataset generated from processing baselines 05.00 and 05.10. See more [here](https://sentiwiki.copernicus.eu/web/s2-processing#S2Processing-Collection-1ProcessingBaselineS2-Processing-Collection-Processing-Baseline).`,
};

const S3 = {
  [AttributeNames.timeliness]: () => t`Sentinel-3 data is  available in the following timeliness:
- Near Real Time (NRT):  typically available within 3 hours after data acquisition
- Short Time Critical (STC): typically available within 48 hours after data acquisition
- Non Time Critical (NTC): typically available within 1 months after data acquisition`,
  [AttributeNames.platformSerialIdentifier]: () =>
    t`The available Sentinel-3 data includes products from the Sentinel-3 satellite constellation, including Sentinel-3A (operational since 2016) and Sentinel-3B (operational since 2018).`,
  [AttributeNames.orbitDirection]: () =>
    t`Determines whether the data was recorded during a descending orbit (flight direction: north - south) or an ascending orbit (flight direction: south - north).`,
  [AttributeNames.relativeOrbitNumber]: () =>
    t`The Relative Orbit Number is the number of full orbits (between successive ascending node crossings through the Equator) since the relative orbit 1 until the end of a cycle. The relative orbit 1 is the orbit whose ascending node crossing is closest to the Greenwich Meridian. Sentinel-3 is in a near-polar, sun-synchronous orbit with a repeat cycle of 27 days.`,
};

const S5P = {
  [AttributeNames.processingMode]:
    () => t`The timeliness provides information about the delivery time of the data product. For Sentinel-5P there are 3 different timeliness available:
- Near Real-Time (NRT): available within 3 hours of acquisition
- Offline: depending on the product, within 12 hours for Level 1B products
- Reprocessing: no time constraints (performed when major product upgrades are required`,
  [AttributeNames.orbitNumber]: () =>
    t`The absolute Orbit Number is the number of orbits that have elapsed since the first ascending node crossing after launch.`,
};

const OPTICAL = {
  [AttributeNames.eopIdentifier]: () =>
    t`The unique identifier for a metadata item, including the ground segment namespace to ensure uniqueness within EOP. See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#optical-data).`,
  [AttributeNames.platformShortName]: () =>
    t`Four characters code used for identifying the specific mission (e.g. SP05 for Spot5, PH00 for Pleiades Constellation). See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#optical-data).`,
  [AttributeNames.platformName]: () =>
    t`Full mission identifier name (e.g. SPOT 6/7 Constellation, Planetscope). See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#optical-data).`,
  [AttributeNames.dataset]: () =>
    t`Full dataset identifier associated to the product (e.g. VHR_IMAGE_2021/IE/Level_3). See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#optical-data).`,
  [AttributeNames.productType]: () =>
    t`The product type, specific to the mission, instrument and processing level (e.g. HRG_THX__3_56FB). See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#optical-data).`,
  [AttributeNames.acrossTrackIncidenceAngle]: () =>
    t`Maximum absolute value of Off Nadir Angle of the acquired data when available (optional). See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#optical-data).`,
};

const CCM_SAR = {
  [AttributeNames.eopIdentifier]: () =>
    t`The unique identifier for a metadata item, including the ground segment namespace to ensure uniqueness within EOP. See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#sar-data).`,
  [AttributeNames.platformShortName]: () =>
    t`Four characters code used for identifying the specific mission (e.g. CS01 for COSMO-SkyMed 1, IE00 for ICEYE). See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#sar-data).`,
  [AttributeNames.platformName]: () =>
    t`Full mission identifier name (e.g. RADARSAT-2, TerraSAR-X). See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#sar-data).`,
  [AttributeNames.dataset]: () =>
    t`Full dataset identifier associated to the product (e.g. SAR_SEA_ICE/RS02/Eurarctic). See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#sar-data).`,
  [AttributeNames.productType]: () =>
    t`The product type, specific to the mission, instrument and processing level (e.g. SAR_SW_SCW_1BD2). See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#sar-data).`,
};

const DEM = {
  open: () =>
    t`GLO-30 and GLO-90 are free and open COP DEM datasets, offering global coverage at resolutions of 30 and 90 m.`,
  restricted: () =>
    t`EEA-10 is a COP DEM dataset available for eligible users only, offering European coverage at resolution of 10 m.`,
  [AttributeNames.eopIdentifier]: () =>
    t`The unique identifier for a metadata item, including the ground segment namespace to ensure uniqueness within EOP. See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#copernicus-dem).`,
  [AttributeNames.deliveryId]: () =>
    t`The delivery ID allows searching for a specific COP DEM delivery. See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#copernicus-dem).`,
  [AttributeNames.gridId]: () =>
    t`This attribute allows selection of available data for a specific grid ID. See more [here](https://documentation.dataspace.copernicus.eu/Data/Others/CCM.html#copernicus-dem).`,
};

const InstrumentTooltips = {
  DEM,
};

const AttributeTooltips = {
  S1,
  S2,
  S3,
  S5P,
  OPTICAL,
  CCM_SAR,
  DEM,
};

export { InstrumentTooltips, AttributeTooltips };
