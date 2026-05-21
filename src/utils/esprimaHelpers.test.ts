import { tryParseScript, AstNode } from './esprimaHelpers';

describe('tryParseScript', () => {
  describe('valid scripts', () => {
    it('parses a complete script and returns an AST', () => {
      const ast = tryParseScript('var x = 1;');
      expect(ast).not.toBeNull();
      expect(ast.type).toBe('Program');
    });

    it('parses an empty string', () => {
      const ast = tryParseScript('');
      expect(ast).not.toBeNull();
      expect(ast.type).toBe('Program');
      expect(ast.body).toHaveLength(0);
    });

    it('parses a function declaration', () => {
      const ast = tryParseScript('function setup() { return { input: ["B01"] }; }');
      expect(ast).not.toBeNull();
      expect(ast.body[0].type).toBe('FunctionDeclaration');
      expect(ast.body[0].id.name).toBe('setup');
    });
  });

  describe('truncated scripts (missing closing braces)', () => {
    it('recovers a script missing one closing brace', () => {
      const ast = tryParseScript('function f() { var x = 1;');
      expect(ast).not.toBeNull();
      expect(ast.type).toBe('Program');
    });

    it('recovers a script missing two closing braces', () => {
      const ast = tryParseScript('function outer() { function inner() { var x = 1;');
      expect(ast).not.toBeNull();
      expect(ast.type).toBe('Program');
    });
  });

  describe('colorRamp variable declaration', () => {
    const SCRIPT_WITH_COLOR_RAMP = `
      var colorRamp = [[-1, 0x0000FF], [0, 0xFFFFFF], [1, 0xFF0000]];
      function setup() { return { input: ["B01", "B02"] }; }
    `;

    it('finds a colorRamp VariableDeclaration in the AST body', () => {
      const ast = tryParseScript(SCRIPT_WITH_COLOR_RAMP);
      expect(ast).not.toBeNull();
      const colorRampDecl = ast.body.find(
        (node: AstNode) =>
          node.type === 'VariableDeclaration' &&
          node.declarations.some((d: AstNode) => d.id.name === 'colorRamp'),
      );
      expect(colorRampDecl).toBeDefined();
    });

    it('returns null when colorRamp is absent', () => {
      const ast = tryParseScript('function setup() { return { input: ["B01"] }; }');
      const colorRampDecl = ast.body.find(
        (node: AstNode) =>
          node.type === 'VariableDeclaration' &&
          node.declarations.some((d: AstNode) => d.id.name === 'colorRamp'),
      );
      expect(colorRampDecl).toBeUndefined();
    });
  });

  describe('range option', () => {
    it('omits range info by default', () => {
      const ast = tryParseScript('var x = 1;');
      expect(ast.body[0].range).toBeUndefined();
    });

    it('omits range info when range is false', () => {
      const ast = tryParseScript('var x = 1;', false);
      expect(ast.body[0].range).toBeUndefined();
    });

    it('includes range info when range is true', () => {
      const ast = tryParseScript('var x = 1;', true);
      expect(ast.body[0].range).toBeDefined();
      expect(Array.isArray(ast.body[0].range)).toBe(true);
      expect(ast.body[0].range).toHaveLength(2);
    });

    it('range values correctly reflect character offsets', () => {
      const code = 'var x = 1;';
      const ast = tryParseScript(code, true);
      const [start, end] = ast.body[0].range;
      expect(code.slice(start, end)).toBe('var x = 1;');
    });

    it('includes range on recovered truncated script when range is true', () => {
      const ast = tryParseScript('function f() { var x = 1;', true);
      expect(ast).not.toBeNull();
      expect(ast.body[0].range).toBeDefined();
    });
  });
});
