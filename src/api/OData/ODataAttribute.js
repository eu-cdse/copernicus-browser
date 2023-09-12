import { ODataValueTypeAttribute } from './ODataTypes';

class ODataAttribute {
  constructor(name, type) {
    this.name = name;
    this.type = type;
  }
  getType() {
    return this.type;
  }
  getName() {
    return this.name;
  }

  formatValue(value) {
    return value;
  }
}

class ODataDoubleAttribute extends ODataAttribute {
  constructor(name) {
    super(name, ODataValueTypeAttribute.DoubleAttribute);
  }
}

class ODataStringAttribute extends ODataAttribute {
  constructor(name) {
    super(name, ODataValueTypeAttribute.StringAttribute);
  }

  formatValue(value) {
    return `'${encodeURIComponent(value)}'`;
  }
}

class ODataIntegerAttribute extends ODataAttribute {
  constructor(name) {
    super(name, ODataValueTypeAttribute.IntegerAttribute);
  }
}

class ODataDateTimeAttribute extends ODataAttribute {
  constructor(name) {
    super(name, ODataValueTypeAttribute.DateTimeOffsetAttribute);
  }
}

export { ODataDoubleAttribute, ODataStringAttribute, ODataIntegerAttribute, ODataDateTimeAttribute };
