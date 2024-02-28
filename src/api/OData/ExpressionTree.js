export const ExpressionTreeOperator = {
  AND: 'and',
  OR: 'or',
};

export class ExpressionTree {
  constructor(value = ExpressionTreeOperator.AND, children = []) {
    this.value = value;
    this.children = children;
  }

  addChild(value) {
    if (!this.children) {
      this.children = [];
    }
    if (value instanceof ExpressionTree) {
      this.children.push(value);
    } else {
      this.children.push({ value: value });
    }
  }

  isEmpty(tree) {
    return (
      tree.value === undefined ||
      ((tree.value === ExpressionTreeOperator.AND || tree.value === ExpressionTreeOperator.OR) &&
        !tree.children.length)
    );
  }

  evaluateChildren(children, parentOperator, depth) {
    let result = '';
    for (let i = 0; i < children.length; i++) {
      const tmp = this._evaluate(children[i], depth + 1);
      const operator = parentOperator;
      if (i === 0) {
        result = tmp;
      } else {
        result = `${result} ${operator} ${tmp}`;
      }
    }
    if (children.length > 1 && depth > 0) {
      result = `(${result})`;
    }

    return result;
  }

  _evaluate(tree, depth = 0) {
    if (!tree || this.isEmpty(tree)) {
      return '';
    }

    if (
      (tree.value === ExpressionTreeOperator.AND || tree.value === ExpressionTreeOperator.OR) &&
      tree.children &&
      tree.children.length
    ) {
      // if the value is "and" or "or", evaluate children recursively
      return `${this.evaluateChildren(
        tree.children.filter((child) => !this.isEmpty(child)),
        tree.value,
        depth,
      )}`;
    }
    return tree.value;
  }

  evaluate() {
    return this._evaluate(this);
  }
}
