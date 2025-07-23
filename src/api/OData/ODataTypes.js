const ODataEntity = {
  Products: 'Products',
};

const ODataQueryOption = {
  top: 'top',
  orderby: 'orderby',
  filter: 'filter',
  skip: 'skip',
  expand: 'expand',
  count: 'count',
  value: 'value',
  nodes: 'Nodes',
  [ODataEntity.Products]: ODataEntity.Products,
};

const ODataFilterOperator = {
  eq: 'eq',
  gt: 'gt',
  ge: 'ge',
  le: 'le',
  lt: 'lt',
  ne: 'ne',
};

const ODataValueTypeAttribute = {
  DoubleAttribute: 'OData.CSC.DoubleAttribute',
  StringAttribute: 'OData.CSC.StringAttribute',
  IntegerAttribute: 'OData.CSC.IntegerAttribute',
  DateTimeOffsetAttribute: 'OData.CSC.DateTimeOffsetAttribute',
};

const OrderingDirection = {
  desc: 'desc',
  asc: 'asc',
};

const ODataProductFileExtension = {
  ZIP: 'zip',
  TGZ: 'tgz',
  EOF: 'eof',
  TAR: 'tar',
};

// by default product can be downloaded as zip
// but some product types are not stored as zip archives
const ODataProductTypeExtension = {
  AUX_RESORB: ODataProductFileExtension.EOF,
  AUX_POEORB: ODataProductFileExtension.EOF,
  AUX_PREORB: ODataProductFileExtension.EOF,
  AUX_PREORB_PRIVATE: ODataProductFileExtension.EOF,
  AUX_RESORB_PRIVATE: ODataProductFileExtension.EOF,
  AUX_GNSSRD: ODataProductFileExtension.TGZ,
  AUX_PROQUA: ODataProductFileExtension.TGZ,
  AUX_MOEORB: ODataProductFileExtension.EOF,
  AUX_PRCPTF: ODataProductFileExtension.EOF,
  SR___MDO_AX: ODataProductFileExtension.TGZ,
  SR___POE_AX: ODataProductFileExtension.TGZ,
  SR_2_TDP_LI: ODataProductFileExtension.EOF,
  SR_2_TDP_HY: ODataProductFileExtension.EOF,
};

const ODataCollections = {
  S1: { id: 'S1', label: 'SENTINEL-1' },
  S2: { id: 'S2', label: 'SENTINEL-2' },
  S3: { id: 'S3', label: 'SENTINEL-3' },
  S5P: { id: 'S5P', label: 'SENTINEL-5P' },
  S6: { id: 'S6', label: 'SENTINEL-6' },
  GLOBAL_MOSAICS: { id: 'GLOBAL-MOSAICS', label: 'GLOBAL-MOSAICS' },
  OPTICAL: { id: 'OPTICAL', label: 'CCM Optical', collection: 'CCM' },
  DEM: { id: 'DEM', label: 'CCM DEM', collection: 'CCM' },
  CCM_SAR: { id: 'CCM_SAR', label: 'CCM SAR', collection: 'CCM' },
  CLMS_BIOGEOPHYSICAL_PARAMETERS: {
    id: 'CLMS_BIOGEOPHYSICAL_PARAMETERS',
    label: 'CLMS Bio-geophysical Parameters',
    collection: 'CLMS',
  },
  CLMS_LAND_COVER_AND_LAND_USE_MAPPING: {
    id: 'CLMS_LAND_COVER_AND_LAND_USE_MAPPING',
    label: 'CLMS Land Cover and Land Use Mapping',
    collection: 'CLMS',
  },
  CLMS_PRIORITY_AREA_MONITORING: {
    id: 'CLMS_PRIORITY_AREA_MONITORING',
    label: 'CLMS Priority Area Monitoring',
    collection: 'CLMS',
  },
};

export {
  ODataEntity,
  ODataQueryOption,
  ODataFilterOperator,
  ODataValueTypeAttribute,
  OrderingDirection,
  ODataProductFileExtension,
  ODataProductTypeExtension,
  ODataCollections,
};
