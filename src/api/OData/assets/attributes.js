import { t } from 'ttag';
import { ODataDoubleAttribute, ODataIntegerAttribute, ODataStringAttribute } from '../ODataAttribute';

export const AttributeNames = {
  collectionName: 'Collection/Name',
  cloudCover: 'cloudCover',
  instrumentShortName: 'instrumentShortName',
  dataset: 'dataset',
  datasetFull: 'datasetFull',
  productType: 'productType',
  sensingTime: 'ContentDate/Start',
  productName: 'Name',
  platformShortName: 'platformShortName',
  platformSerialIdentifier: 'platformSerialIdentifier',
  relativeOrbitNumber: 'relativeOrbitNumber',
  timeliness: 'timeliness',
  orbitDirection: 'orbitDirection',
  operationalMode: 'operationalMode',
  polarisationChannels: 'polarisationChannels',
  orbitNumber: 'orbitNumber',
  processingMode: 'processingMode',
  swathIdentifier: 'swathIdentifier',
  online: 'Online',
  origin: 'origin',
  processorVersion: 'processorVersion',
  S2Collection: 'S2Collection',
  productClass: 'productClass',
  resolution: 'resolution',
  eopIdentifier: 'eopIdentifier',
  acrossTrackIncidenceAngle: 'acrossTrackIncidenceAngle',
  resolutionClass: 'resolutionClass',
  deliveryId: 'deliveryId',
  platformName: 'platformName',
  gridId: 'gridId',
  temporalRepeatRate: 'temporalRepeatRate',
  datasetVersion: 'datasetVersion',
  fileFormat: 'fileFormat',
  areaOfInterest: 'areaOfInterest',
  datasetIdentifier: 'datasetIdentifier',
  component: 'component',
  gridLabel: 'gridLabel',
  metricGridSpacing: 'metricGridSpacing',
  datasetShortName: 'datasetShortName',
  consolidationPeriod: 'consolidationPeriod',
  nominalDate: 'nominalDate',
};

export const FormatedAttributeNames = {
  name: () => t`Name`,
  size: () => t`Size`,
  landCover: () => t`Land cover`,
  originDate: () => t`Origin date`,
  publicationDate: () => t`Publication date`,
  modificationDate: () => t`Modification date`,
  S3Path: () => t`S3Path`,
  brightCover: () => t`Bright cover`,
  cycleNumber: () => t`Cycle number`,
  coastalCover: () => t`Coastal cover`,
  processorName: () => t`Processor name`,
  closedSeaCover: () => t`Closed sea cover`,
  openOceanCover: () => t`Open ocean cover`,
  lastOrbitDirection: () => t`Last orbit direction`,
  lastOrbitNumber: () => t`Last orbit number`,
  processingDate: () => t`Processing date`,
  snowOrIceCover: () => t`Snow or ice cover`,
  productGroupId: () => t`Product group id`,
  processingLevel: () => t`Processing level`,
  salineWaterCover: () => t`Saline water cover`,
  tidalRegionCover: () => t`Tidal region cover`,
  granuleIdentifier: () => t`Granule identifier`,
  datastripidentifier: () => t`Datastrip identifier`,
  freshInlandWaterCover: () => t`Fresh inland water cover`,
  lastRelativeOrbitNumber: () => t`Last relative orbit`,
  beginningDateTime: () => t`Beginning date time`,
  endingDateTime: () => t`Ending date time`,
  sliceNumber: () => t`Slice number`,
  baselineCollection: () => t`Baseline collection`,
  continentalIceCover: () => t`Continental ice cover`,
  processingCenter: () => t`Processing center`,
  instrument: () => t`Instrument`,
  mission: () => t`Mission`,
  tileId: () => t`Tile id`,
  authority: () => t`Authority`,
  coordinates: () => t`Coordinates`,
  hvOrderTileid: () => t`HV order tile id`,
  spatialResolution: () => t`Spatial resolution`,
  startTimeFromAscendingNode: () => t`Start time from ascending node`,
  completionTimeFromAscendingNode: () => t`Completion time from ascending node`,
  datatakeID: () => t`Data take id`,
  instrumentConfigurationID: () => t`Instrument configuration id`,
  productConsolidation: () => t`Product consolidation`,
  sliceProductFlag: () => t`Slice product flag`,
  segmentStartTime: () => t`Segment start time`,
  productComposition: () => t`Product composition`,
  totalSlices: () => t`Total slices`,
  productVersion: () => t`Product version`,
  platformAcronym: () => t`Platform acronym`,
  datasetAlias: () => t`Dataset alias`,
  missionShortName: () => t`Mission short name`,
  datastripId: () => t`Datastrip id`,
  granuleId: () => t`Granule id`,
  sourceProduct: () => t`Source product`,
  sourceProductOriginDate: () => t`Source product origin date`,
  online: () => t`Online`,
  S2Collection: () => t`S2 collection`,
  resolution: () => 'Resolution',
  cloudCover: () => t`Cloud cover`,
  instrumentShortName: () => t`Instrument short name`,
  dataset: () => t`Sub-dataset`,
  datasetFull: () => t`Dataset`,
  productType: () => t`Product type`,
  sensingTime: () => t`Sensing time`,
  platformShortName: () => t`Platform short name`,
  platformSerialIdentifier: () => t`Platform serial identifier`,
  relativeOrbitNumber: () => t`Relative orbit number`,
  timeliness: () => t`Timeliness`,
  orbitDirection: () => t`Orbit direction`,
  operationalMode: () => t`Operational mode`,
  polarisationChannels: () => t`Polarisation channels`,
  orbitNumber: () => t`Absolute orbit number`,
  processingMode: () => t`Processing mode`,
  swathIdentifier: () => t`Swath identifier`,
  origin: () => t`Origin`,
  processorVersion: () => t`Processor version`,
  productClass: () => t`Product class`,
  eopIdentifier: () => t`Eop identifier`,
  acrossTrackIncidenceAngle: () => t`Off nadir angle`,
  resolutionClass: () => t`Resolution class`,
  deliveryId: () => t`Delivery id`,
  platformName: () => t`Platform name`,
  gridId: () => t`Grid id`,
  temporalRepeatRate: () => t`Temporal repeat rate`,
  datasetVersion: () => t`Dataset version`,
  fileFormat: () => t`File format`,
  areaOfInterest: () => t`Area of interest`,
  datasetIdentifier: () => t`Dataset identifier`,
  component: () => t`Component`,
  gridLabel: () => t`Grid label`,
  consolidationPeriod: () => t`Consolidation period`,
  collectionName: () => t`Collection name`,
  productName: () => t`Product name`,
  metricGridSpacing: () => t`Metric grid spacing`,
  datasetShortName: () => t`Dataset Short name`,
  nominalDate: () => t`Nominal date`,
};

export const AttributesDescriptions = {
  [AttributeNames.collectionName]: t`Name of the data collection or series.`,
  [AttributeNames.cloudCover]: t`Estimated percentage of cloud coverage in the scene.`,
  [AttributeNames.instrumentShortName]: t`Short name of the instrument used to capture the data (e.g., SAR, MSI).`,
  [AttributeNames.dataset]: t`Identifier of the dataset within a collection.`,
  [AttributeNames.datasetFull]: t`Full name or path of the dataset.`,
  [AttributeNames.productType]: t`Type of product generated, indicating processing level and acquisition mode.`,
  [AttributeNames.sensingTime]: t`Start time of the satellite sensing or data acquisition.`,
  [AttributeNames.productName]: t`Unique name or identifier of the product.`,
  [AttributeNames.platformShortName]: t`Short name of the satellite platform (e.g., SENTINEL-1, SENTINEL-2).`,
  [AttributeNames.platformSerialIdentifier]: t`Identifier for the platform variant (e.g., A or B for Sentinel satellites).`,
  [AttributeNames.relativeOrbitNumber]: t`Orbit number relative to a fixed reference cycle.`,
  [AttributeNames.timeliness]: t`Processing timeliness category (e.g., Near Real-Time, Offline).`,
  [AttributeNames.orbitDirection]: t`Direction of the satellite orbit during acquisition (e.g., ASCENDING, DESCENDING).`,
  [AttributeNames.operationalMode]: t`Acquisition mode used by the instrument (e.g., IW, SM).`,
  [AttributeNames.polarisationChannels]: t`Radar polarisation modes used (e.g., VV, VH).`,
  [AttributeNames.orbitNumber]: t`Absolute orbit number at time of acquisition.`,
  [AttributeNames.processingMode]: t`Mode used for processing the product, if applicable.`,
  [AttributeNames.swathIdentifier]: t`Identifiers of the swath(s) used in the acquisition (e.g., IW1, IW2, IW3).`,
  [AttributeNames.online]: t`Indicates whether the product is currently available for download.`,
  [AttributeNames.origin]: t`Source organization or system that produced the data.`,
  [AttributeNames.processorVersion]: t`Version of the processing software used to generate the product.`,
  [AttributeNames.S2Collection]: t`Identifier for Sentinel-2 collection (e.g., S2_MSI_L1C).`,
  [AttributeNames.productClass]: t`Class of the product, indicating type or access constraints.`,
  [AttributeNames.resolution]: t`Spatial resolution of the dataset in meters.`,
  [AttributeNames.eopIdentifier]: t`Identifier conforming to Earth Observation Product standards.`,
  [AttributeNames.acrossTrackIncidenceAngle]: t`Incidence angle across the track of the satellite, typically in degrees.`,
  [AttributeNames.resolutionClass]: t`Classification of the resolution level (e.g., High, Medium).`,
  [AttributeNames.deliveryId]: t`Identifier for the delivery package or transfer bundle.`,
  [AttributeNames.platformName]: t`Full name of the satellite platform.`,
  [AttributeNames.gridId]: t`Identifier of the spatial grid cell containing the product.`,
  [AttributeNames.temporalRepeatRate]: t`Time interval between repeat acquisitions over the same location.`,
  [AttributeNames.datasetVersion]: t`Version number of the dataset definition.`,
  [AttributeNames.fileFormat]: t`File format used for the data product (e.g., SAFE, GeoTIFF).`,
  [AttributeNames.areaOfInterest]: t`Geographic area the data product covers or is relevant to.`,
  [AttributeNames.datasetIdentifier]: t`Globally unique identifier for the dataset.`,
  [AttributeNames.component]: t`Subsystem or data component involved in the acquisition or processing.`,
  [AttributeNames.gridLabel]: t`Human-readable label for the grid cell or tile.`,
  [AttributeNames.metricGridSpacing]: t`Spacing of the grid in meters used for spatial referencing.`,
  [AttributeNames.datasetShortName]: t`Short, human-friendly name of the dataset.`,
  [AttributeNames.consolidationPeriod]: t`Time period over which data is consolidated for processing or delivery.`,
  [AttributeNames.nominalDate]: t`The reference date for the data, often representing when it is intended to be used.`,
};

export const ODataAttributes = {
  cloudCover: new ODataDoubleAttribute(AttributeNames.cloudCover),
  instrument: new ODataStringAttribute(AttributeNames.instrumentShortName),
  dataset: new ODataStringAttribute(AttributeNames.dataset),
  deliveryId: new ODataStringAttribute(AttributeNames.dataset),
  datasetFull: new ODataStringAttribute(AttributeNames.datasetFull),
  productType: new ODataStringAttribute(AttributeNames.productType),
  platformSerialIdentifier: new ODataStringAttribute(AttributeNames.platformSerialIdentifier),
  relativeOrbitNumber: new ODataIntegerAttribute(AttributeNames.relativeOrbitNumber),
  timeliness: new ODataStringAttribute(AttributeNames.timeliness),
  orbitDirection: new ODataStringAttribute(AttributeNames.orbitDirection),
  operationalMode: new ODataStringAttribute(AttributeNames.operationalMode),
  polarisationChannels: new ODataStringAttribute(AttributeNames.polarisationChannels),
  orbitNumber: new ODataIntegerAttribute(AttributeNames.orbitNumber),
  processingMode: new ODataStringAttribute(AttributeNames.processingMode),
  swathIdentifier: new ODataStringAttribute(AttributeNames.swathIdentifier),
  origin: new ODataStringAttribute(AttributeNames.origin),
  processorVersion: new ODataStringAttribute(AttributeNames.processorVersion),
  productClass: new ODataStringAttribute(AttributeNames.productClass),
  eopIdentifier: new ODataStringAttribute(AttributeNames.eopIdentifier),
  acrossTrackIncidenceAngle: new ODataDoubleAttribute(AttributeNames.acrossTrackIncidenceAngle),
  resolutionClass: new ODataStringAttribute(AttributeNames.resolutionClass),
  platformShortName: new ODataStringAttribute(AttributeNames.platformShortName),
  platformName: new ODataStringAttribute(AttributeNames.platformName),
  gridId: new ODataStringAttribute(AttributeNames.gridId),
  temporalRepeatRate: new ODataStringAttribute(AttributeNames.temporalRepeatRate),
  datasetVersion: new ODataIntegerAttribute(AttributeNames.datasetVersion),
  fileFormat: new ODataStringAttribute(AttributeNames.fileFormat),
  areaOfInterest: new ODataStringAttribute(AttributeNames.areaOfInterest),
  datasetIdentifier: new ODataStringAttribute(AttributeNames.datasetIdentifier),
  component: new ODataStringAttribute(AttributeNames.component),
  gridLabel: new ODataStringAttribute(AttributeNames.gridLabel),
  consolidationPeriod: new ODataIntegerAttribute(AttributeNames.consolidationPeriod),
};

export const AttributeOriginValues = {
  ESA: { value: 'ESA', label: 'ESA' },
  CLOUDFERRO: { value: 'CLOUDFERRO', label: 'CloudFerro' },
};

export const AttributeS2ProductTypeValues = {
  MSI_L1B_GR: { value: 'MSI_L1B_GR', label: 'MSI_L1B_GR' },
  MSI_L1B_DS: { value: 'MSI_L1B_DS', label: 'MSI_L1B_DS' },
};

export const AttributeProcessorVersionValues = {
  V99_99: { value: '99.99', label: '99.99' },
};
export const AttributeOnlineValues = {
  online: { value: true, label: 'Immediate' },
  offline: { value: false, label: 'To order' },
};

export const AttributeConsolidationPeriodValues = {
  RT0: { value: 0, label: 'RT0' },
  RT1: { value: 1, label: 'RT1' },
  RT2: { value: 2, label: 'RT2' },
  RT5: { value: 5, label: 'RT5' },
  RT6: { value: 6, label: 'RT6' },
};

export const AttributeProcessingModeValues = {
  NRTI: { value: 'NRTI', label: 'Near Real Time' },
  OFFL: { value: 'OFFL', label: 'Offline' },
  RPRO: { value: 'RPRO', label: 'Reprocessing' },
};

export const AttributeTimelinessValues = {
  NR: { value: 'NR', label: 'Near Real Time' },
  ST: { value: 'ST', label: 'Short Time Critical' },
  NT: { value: 'NT', label: 'Non Time Critical' },
};

export const AttributePlatformSerialIdentifierValues = {
  S1A: { value: 'A', label: 'S1A' },
  S1B: { value: 'B', label: 'S1B' },
  S1C: { value: 'C', label: 'S1C' },
  S1D: { value: 'D', label: 'S1D' },
  S2A: { value: 'A', label: 'S2A' },
  S2B: { value: 'B', label: 'S2B' },
  S2C: { value: 'C', label: 'S2C' },
  S3A: { value: 'A', label: 'S3A' },
  S3B: { value: 'B', label: 'S3B' },
};

export const AttributeOrbitDirectionValues = {
  ASCENDING: { value: 'ASCENDING', label: 'Ascending' },
  DESCENDING: { value: 'DESCENDING', label: 'Descending' },
};

export const AttributeOperationalModeValues = {
  SM: { value: 'SM', label: 'SM' },
  IW: { value: 'IW', label: 'IW' },
  EW: { value: 'EW', label: 'EW' },
  WV: { value: 'WV', label: 'WV' },
};

export const AttributePolarisationChannelsValues = {
  HH: { value: 'HH', label: 'HH' },
  HV: { value: 'HV', label: 'HV' },
  VV: { value: 'VV', label: 'VV' },
  VH: { value: 'VH', label: 'VH' },
  VH_VV: { value: 'VH&VV', label: 'VH+VV' },
  VV_VH: { value: 'VV&VH', label: 'VV+VH' },
  HH_HV: { value: 'HH&HV', label: 'HH+HV' },
};

export const AttributeProductClassValues = {
  STANDARD: { value: 'S', label: 'Standard' },
  CALIBRATION: { value: 'C', label: 'Calibration' },
  NOISE: { value: 'N', label: 'Noise' },
  ANNOTATON: { value: 'A', label: 'Annotation' },
};

export const AttributeProductResolution = {
  FULL: { value: 'F', label: 'Full' },
  HIGH: { value: 'H', label: 'High' },
  MEDIUM: { value: 'M', label: 'Medium' },
};

export const AttributeDEMDatasetVersions = [
  '2019_1',
  '2019_2',
  '2020_1',
  '2020_2',
  '2021_1',
  '2021_2',
  '2022_1',
  '2023_1',
  '2024_1',
].map((version) => ({ id: 'DEM', value: version, label: version }));

export const AttributeDEMDatasetsMap = [
  {
    id: 'open',
    productTypes: [
      { id: 'COP-DEM_GLO-30-DGED' },
      { id: 'COP-DEM_GLO-30-DTED' },
      { id: 'COP-DEM_GLO-90-DGED' },
      { id: 'COP-DEM_GLO-90-DTED' },
    ],
  },
  { id: 'restricted', productTypes: [{ id: 'COP-DEM_EEA-10-DGED' }, { id: 'COP-DEM_EEA-10-INSP' }] },
];

export const AttributeTemporalRepeatRateValues = {
  DAILY: { value: 'daily', label: 'Daily' },
  TENDAY: { value: '10daily', label: '10-Day' },
  MONTHLY: { value: 'monthly', label: 'Monthly' },
};

export const AttributeFileFormatValues = {
  COG: { value: 'cog', label: 'Cloud Optimized GeoTIFF' },
  NC: { value: 'nc', label: 'NetCDF' },
};

export const AttributeGridLabelValues = {
  KM1: { value: '1km', label: '1 km' },
  KM3: { value: '3km', label: '3 km' },
};

export const AttributeAreaOfInterestValues = {
  GLOBAL: { value: 'global', label: 'Global' },
  EUROPE: { value: 'europe', label: 'Europe' },
};

export const AttributeComponentValues = {
  BIOGEOPHYSICAL: { value: 'bio-geophysical', label: 'Bio-geophysical' },
};
