import { ODataFilterBuilder } from './ODataFilterBuilder';
import { ODataEntity, ODataQueryOption } from './ODataTypes';

export class ODataQueryBuilder {
  options = [];
  constructor(entity = ODataEntity.Products) {
    this.entity = entity;
    this.path = null;
  }

  _findOption(key) {
    return this.options.find((option) => option.key === key);
  }

  _addOption(key, value) {
    this.options.push({ key, value });
  }

  _removeOption(key) {
    this.options = this.options.filter((option) => option.key !== key);
  }

  top(value) {
    if (value !== undefined && value !== null) {
      this._addOption(ODataQueryOption.top, value);
    } else {
      this._removeOption(ODataQueryOption.top);
    }
    return this;
  }

  orderBy(field, direction = 'asc') {
    if (field) {
      this._addOption(ODataQueryOption.orderby, `${field} ${direction}`);
    } else {
      this._removeOption(ODataQueryOption.orderby);
    }
    return this;
  }

  filter(filter) {
    if (filter) {
      this._addOption(
        ODataQueryOption.filter,
        filter instanceof ODataFilterBuilder ? filter.getQueryString() : filter,
      );
    } else {
      this._removeOption(ODataQueryOption.filter);
    }
    return this;
  }

  skip(num) {
    this._removeOption(ODataQueryOption.skip);
    if (num !== null && num !== undefined) {
      this._addOption(ODataQueryOption.skip, num);
    }
    return this;
  }
  count() {
    this._addOption(ODataQueryOption.count, 'True');
    return this;
  }

  attributes() {
    this._addOption(ODataQueryOption.expand, 'Attributes');
    return this;
  }

  assets() {
    this._addOption(ODataQueryOption.expand, 'Assets');
    return this;
  }

  id(entityId) {
    this._addOption(ODataQueryOption[this.entity], entityId);
    return this;
  }

  value(entityId) {
    this.id(entityId);
    this._addOption(ODataQueryOption.value, 'value');
    return this;
  }

  nodes() {
    this._addOption(ODataQueryOption.nodes, ODataQueryOption.nodes);
    return this;
  }

  getQueryString() {
    let queryString = this.entity;

    if (this._findOption(ODataQueryOption[this.entity])) {
      queryString = `${queryString}(${this._findOption(ODataQueryOption[this.entity]).value})`;

      if (this.path) {
        queryString = `${queryString}/${this.path}`;
      }

      if (this._findOption(ODataQueryOption.value)) {
        queryString = `${queryString}/$value`;
      }

      if (this._findOption(ODataQueryOption.nodes)) {
        queryString = `${queryString}/${ODataQueryOption.nodes}`;
      }

      return queryString;
    }

    if (this.options.length > 0) {
      queryString = `${queryString}?`;
    }

    this.options.forEach((option) => {
      queryString = `${queryString}&$${option.key}=${option.value}`;
    });

    return queryString;
  }
}
