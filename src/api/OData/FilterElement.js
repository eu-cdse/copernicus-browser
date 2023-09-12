const formatValue = (value, type) => {
  switch (type) {
    case 'string':
      return `'${value}'`;
    default:
      return value;
  }
};

const Expression = (key, operator, value, type) => {
  const formatedValue = formatValue(value, type);
  return `${key} ${operator} ${formatedValue}`;
};

const Attribute = (attr, operator, value) => {
  return `Attributes/${attr.getType()}/any(att:att/Name eq '${attr.getName()}' and att/${attr.getType()}/Value ${operator} ${attr.formatValue(
    value,
  )})`;
};

const Intersects = (wkt) => {
  //Coordinates must be given in EPSG 4326
  const hasSridRegEx = new RegExp('SRID');
  const isSrid4326RegEx = new RegExp('SRID=4326');

  if (hasSridRegEx.test(wkt) && !isSrid4326RegEx.test(wkt)) {
    throw new Error('Coordinates must be given in EPSG 4326');
  }

  let geometry = `${!hasSridRegEx.test(wkt) ? 'SRID=4326;' : ''}${wkt}`;

  return `OData.CSC.Intersects(area=geography'${geometry}')`;
};

const Function = (name, key, value, type) => {
  const formatedValue = formatValue(value, type);
  return `${name}(${key},${formatedValue})`;
};

const CustomFilter = (filterBuilder) => filterBuilder?.getTree();

export const Functions = {
  startsWith: 'startswith',
  contains: 'contains',
  notContains: 'not contains',
};

export const FilterElement = {
  Expression,
  Attribute,
  Intersects,
  Function,
  CustomFilter,
};
