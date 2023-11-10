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
  AUX_GNSSRD: ODataProductFileExtension.TGZ,
  AUX_PROQUA: ODataProductFileExtension.TGZ,
  AUX_MOEORB: ODataProductFileExtension.EOF,
  AUX_PRCPTF: ODataProductFileExtension.EOF,
  SR___MDO_AX: ODataProductFileExtension.TGZ,
  SR___POE_AX: ODataProductFileExtension.TGZ,
};

export {
  ODataEntity,
  ODataQueryOption,
  ODataFilterOperator,
  ODataValueTypeAttribute,
  OrderingDirection,
  ODataProductFileExtension,
  ODataProductTypeExtension,
};
