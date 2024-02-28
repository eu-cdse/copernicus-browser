import { ExpressionTree, ExpressionTreeOperator } from './ExpressionTree';

describe('ExpressionTree', () => {
  test('empty tree - and ', () => {
    const tree = new ExpressionTree();
    expect(tree.evaluate()).toBe('');
  });

  test('empty tree - or', () => {
    const tree = new ExpressionTree(ExpressionTree.OR);
    expect(tree.evaluate()).toBe('');
  });

  test('1 value child', () => {
    const tree = new ExpressionTree();
    tree.addChild('A');
    expect(tree.evaluate()).toBe('A');
  });
  test('2 value children - and', () => {
    const tree = new ExpressionTree();
    tree.addChild('A');
    tree.addChild('B');
    expect(tree.evaluate()).toBe('A and B');
  });

  test('5 value children - and', () => {
    const tree = new ExpressionTree();
    for (let i = 0; i < 5; i++) {
      tree.addChild(i);
    }
    expect(tree.evaluate()).toBe('0 and 1 and 2 and 3 and 4');
  });

  test('1 value child and empty subtree', () => {
    const tree = new ExpressionTree();
    tree.addChild('A');
    const subtree = new ExpressionTree();
    tree.addChild(subtree);
    expect(tree.evaluate()).toBe('A');
  });

  test('1 value child and subtree with 1 value child', () => {
    const tree = new ExpressionTree();
    tree.addChild('A');
    const subtree = new ExpressionTree();
    subtree.addChild('1');
    tree.addChild(subtree);
    expect(tree.evaluate()).toBe('A and 1');
  });

  test('1 value child and subtree with 2 value children (and)', () => {
    const tree = new ExpressionTree();
    tree.addChild('A');
    const subtree = new ExpressionTree();
    subtree.addChild('1');
    subtree.addChild('2');

    tree.addChild(subtree);
    expect(tree.evaluate()).toBe('A and (1 and 2)');
  });

  test('1 value child and subtree with 2 value children (or)', () => {
    const tree = new ExpressionTree(ExpressionTreeOperator.AND);
    tree.addChild('A');
    const subtree = new ExpressionTree(ExpressionTreeOperator.OR);
    subtree.addChild('1');
    subtree.addChild('2');

    tree.addChild(subtree);
    expect(tree.evaluate()).toBe('A and (1 or 2)');
  });

  test('2 subtrees', () => {
    const tree = new ExpressionTree(ExpressionTreeOperator.AND);
    const subTree1 = new ExpressionTree(ExpressionTreeOperator.OR);
    const subTree2 = new ExpressionTree(ExpressionTreeOperator.OR);
    tree.addChild(subTree1);
    tree.addChild(subTree2);
    subTree1.addChild('A');
    subTree1.addChild('B');
    subTree2.addChild('1');
    subTree2.addChild('2');
    expect(tree.evaluate()).toBe('(A or B) and (1 or 2)');
  });

  test('more nesting', () => {
    const tree = new ExpressionTree(ExpressionTreeOperator.AND);
    const subTree1 = new ExpressionTree(ExpressionTreeOperator.OR);
    const subTree2 = new ExpressionTree(ExpressionTreeOperator.OR);
    subTree1.addChild('A');
    subTree1.addChild('B');
    subTree2.addChild('1');
    subTree2.addChild('2');
    tree.addChild(subTree1);
    subTree1.addChild(subTree2);
    expect(tree.evaluate()).toBe('(A or B or (1 or 2))');
  });
});
