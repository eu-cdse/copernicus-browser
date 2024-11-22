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
};

export const FormatedAttributeNames = {
  name: () => t`Name`,
  size: () => t`Size`,
  instrumentShortName: () => t`Instrument short name`,
  productType: () => t`Product type`,
  landCover: () => t`Land cover`,
  cloudCover: () => t`Cloud cover`,
  sensingTime: () => t`Sensing time`,
  originDate: () => t`Origin date`,
  publicationDate: () => t`Publication date`,
  modificationDate: () => t`Modification date`,
  S3Path: () => t`S3Path`,
  origin: () => t`Processed by`,
  brightCover: () => t`Bright cover`,
  cycleNumber: () => t`Cycle number`,
  coastalCover: () => t`Coastal cover`,
  processorName: () => t`Processor name`,
  closedSeaCover: () => t`Closed sea cover`,
  openOceanCover: () => t`Open ocean cover`,
  orbitNumber: () => t`Absolute orbit number`,
  orbitDirection: () => t`Orbit direction`,
  lastOrbitDirection: () => t`Last orbit direction`,
  lastOrbitNumber: () => t`Last orbit number`,
  processingDate: () => t`Processing date`,
  snowOrIceCover: () => t`Snow or ice cover`,
  productGroupId: () => t`Product group id`,
  processingLevel: () => t`Processing level`,
  processorVersion: () => t`Processor version`,
  salineWaterCover: () => t`Saline water cover`,
  tidalRegionCover: () => t`Tidal region cover`,
  granuleidentifier: () => t`Granule identifier`,
  platformShortName: () => t`Platform short name`,
  datastripidentifier: () => t`Datastrip identifier`,
  relativeOrbitNumber: () => t`Relative orbit number`,
  freshInlandWaterCover: () => t`Fresh inland water cover`,
  lastRelativeOrbitNumber: () => t`Last relative orbit`,
  platformSerialIdentifier: () => t`Satellite platform`,
  beginningDateTime: () => t`Beginning date time`,
  endingDateTime: () => t`Ending date time`,
  sliceNumber: () => t`Slice number`,
  productClass: () => t`Product class`,
  operationalMode: () => t`Acquisition mode`,
  polarisationChannels: () => t`Polarisation`,
  timeliness: () => t`Timeliness`,
  swathIdentifier: () => t`Beam id`,
  baselineCollection: () => t`Baseline collection`,
  continentalIceCover: () => t`Continental ice cover`,
  processingCenter: () => t`Processing center`,
  processingMode: () => t`Timeliness`,
  instrument: () => t`Instrument`,
  mission: () => t`Mission`,
  tileId: () => t`Tile id`,
  authority: () => t`Authority`,
  coordinates: () => t`Coordinates`,
  hvOrderTileid: () => t`HV order tile id`,
  spatialResolution: () => t`Spatial resolution`,
  startTimeFromAscendingNode: () => t`Start time from ascending node`,
  completionTimeFromAscendingNode: () => t`Completion time from ascending node`,
  [AttributeNames.online]: () => t`Product availability`,
  [AttributeNames.S2Collection]: () => t`Collection`,
  [AttributeNames.resolution]: () => 'Resolution',
  datatakeID: () => t`Data take id`,
  instrumentConfigurationID: () => t`Instrument configuration id`,
  productConsolidation: () => t`Product consolidation`,
  sliceProductFlag: () => t`Slice product flag`,
  segmentStartTime: () => t`Segment start time`,
  productComposition: () => t`Product composition`,
  totalSlices: () => t`Total slices`,
  eopIdentifier: () => t`Eop Identifier`,
  datasetFull: () => t`Dataset`,
  dataset: () => t`Sub-dataset`,
  deliveryId: () => t`Delivery ID`,
  acrossTrackIncidenceAngle: () => t`Off nadir angle`,
  resolutionClass: () => t`Resolution class`,
  platformName: () => t`Platform name`,
  gridId: () => t`Grid id`,
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
};

export const AttributeOriginValues = {
  ESA: { value: 'ESA', label: 'ESA' },
  CLOUDFERRO: { value: 'CLOUDFERRO', label: 'CloudFerro' },
};
export const AttributeS2CollectionValues = {
  COLLECTION1: { value: 'COLLECTION1', label: 'Collection 1' },
};
export const AttributeS2ProductTypeValues = {
  MSI_L1B_GR: { value: 'MSI_L1B_GR', label: 'MSI_L1B_GR' },
  MSI_L1B_DS: { value: 'MSI_L1B_DS', label: 'MSI_L1B_DS' },
};

export const AttributeProcessorVersionValues = {
  V05_00: {
    value: '05.00',
    label: '05.00',
    timeLimitations: { fromTime: '2015-07-04T00:00:00.000Z', toTime: '2021-12-31T23:59:59.999Z' },
  },
  V05_09: { value: '05.09', label: '05.09' },
  V05_10: {
    value: '05.10',
    label: '05.10',
    timeLimitations: { fromTime: '2022-01-01T00:00:00.000Z', toTime: '2023-12-13T07:00:00.000Z' },
  },
  V99_99: { value: '99.99', label: '99.99' },
};
export const AttributeOnlineValues = {
  online: { value: true, label: 'Immediate' },
  offline: { value: false, label: 'To order' },
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
