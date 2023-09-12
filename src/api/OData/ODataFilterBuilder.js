import { ExpressionTree, ExpressionTreeOperator } from './ExpressionTree';
import { FilterElement, Functions } from './FilterElement';

export class ODataFilterBuilder {
  constructor(operator = ExpressionTreeOperator.AND, children = []) {
    this.tree = new ExpressionTree(operator, children);
  }

  addExpression(expression) {
    this.tree.addChild(expression);
  }

  contains(key, value) {
    this.addExpression(FilterElement.Function(Functions.contains, key, value, 'string'));
    return this;
  }

  notContains(key, value) {
    this.addExpression(FilterElement.Function(Functions.notContains, key, value, 'string'));
    return this;
  }

  startsWith(key, value) {
    this.addExpression(FilterElement.Function(Functions.startsWith, key, value, 'string'));
  }

  expression(key, operator, value, type = undefined) {
    this.addExpression(FilterElement.Expression(key, operator, value, type));
    return this;
  }

  intersects(wkt) {
    this.addExpression(FilterElement.Intersects(wkt));
    return this;
  }

  attribute(attr, operator, value) {
    this.addExpression(FilterElement.Attribute(attr, operator, value));
    return this;
  }

  add(tree) {
    this.tree.children.push(tree);
    return this;
  }

  _addLogicalOperator(tree, operator) {
    //check if operator is the same
    if (this.tree.value === operator) {
      this.add(tree);
      return this;
    }
    const newTree = new ExpressionTree(operator, [this.tree, tree]);
    this.tree = newTree;
    return this;
  }

  and(tree) {
    this._addLogicalOperator(tree, ExpressionTreeOperator.AND);
  }

  or(tree) {
    this._addLogicalOperator(tree, ExpressionTreeOperator.OR);
  }

  not(expression) {
    this.tree.addChild(`not(${expression})`);
    return this;
  }

  getQueryString() {
    return this.tree.evaluate();
  }

  getTree() {
    return this.tree;
  }
}
