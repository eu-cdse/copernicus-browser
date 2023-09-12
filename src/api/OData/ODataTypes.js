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

export { ODataEntity, ODataQueryOption, ODataFilterOperator, ODataValueTypeAttribute, OrderingDirection };
