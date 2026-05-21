import { AstNode, tryParseScript } from './esprimaHelpers';

// Recursively unwraps a single array element AST node to extract a band name.
// Handles:
//   MemberExpression  sample.B04 / samples.B04  → property name
//   CallExpression    visualizer.process(sample.B04) → recurse into first argument
//   BinaryExpression  2.5 * sample.B04 / factor * sample.B04 → recurse right then left
//   Identifier        B04 (old-format bare band names) → identifier name
function extractBandName(node: AstNode): string | null {
  if (!node) {
    return null;
  }
  if (node.type === 'MemberExpression') {
    return node.property.name ?? null;
  }
  if (node.type === 'Identifier') {
    return node.name;
  }
  if (node.type === 'CallExpression') {
    return extractBandName(node.arguments[0]);
  }
  if (node.type === 'BinaryExpression') {
    // Try right side first: for `factor * sample.B04` and `2.5 * sample.B04`,
    // the band MemberExpression is on the right. For `B04 * 2.5` (old format),
    // the Identifier is on the left — the right fallback then picks it up.
    return extractBandName(node.right) ?? extractBandName(node.left);
  }
  return null;
}

// ─── //VERSION=3 format ────────────────────────────────────────────────────

function parseVersionedBands(evalscript: string): string[] {
  const ast = tryParseScript(evalscript);
  if (!ast) {
    return [];
  }

  const evalPixelFn = ast.body.find(
    (node: AstNode) => node.type === 'FunctionDeclaration' && node.id.name === 'evaluatePixel',
  );
  if (!evalPixelFn) {
    return [];
  }

  const fnBody: AstNode[] = evalPixelFn.body.body;

  // Prefer a ReturnStatement whose argument is a plain ArrayExpression.
  const returnStmt = fnBody.find(
    (node: AstNode) => node.type === 'ReturnStatement' && node.argument?.type === 'ArrayExpression',
  );

  let elements: AstNode[] | null = null;
  if (returnStmt) {
    elements = returnStmt.argument.elements;
  } else {
    // Fall back to a VariableDeclaration whose first declarator init is an ArrayExpression.
    // Handles: let val = [samples.B04, samples.B03, ...] (Landsat reflectance evalscript).
    const varDecl = fnBody.find(
      (node: AstNode) =>
        node.type === 'VariableDeclaration' && node.declarations[0]?.init?.type === 'ArrayExpression',
    );
    if (varDecl) {
      elements = varDecl.declarations[0].init.elements;
    }
  }

  if (!elements) {
    return [];
  }

  return elements.map(extractBandName).filter((name): name is string => name !== null && name !== 'dataMask');
}

// ─── Old (pre-VERSION=3) format ────────────────────────────────────────────

function parseOldFormatBands(evalscript: string): string[] {
  // The old-format snippet has a top-level `return` statement which is a syntax error outside a
  // function body. Wrap it so esprima can parse it, then navigate into the function's body.
  const wrappedCode = `(function(){${evalscript}})`;
  const ast = tryParseScript(wrappedCode);
  if (!ast) {
    return [];
  }

  // Navigate: ExpressionStatement > FunctionExpression > body > body[]
  const stmts: AstNode[] = ast.body[0]?.expression?.body?.body;
  if (!Array.isArray(stmts)) {
    return [];
  }

  const returnStmt = stmts.find(
    (node: AstNode) => node.type === 'ReturnStatement' && node.argument?.type === 'ArrayExpression',
  );
  if (!returnStmt) {
    return [];
  }

  return returnStmt.argument.elements
    .map(extractBandName)
    .filter((name): name is string => name !== null && name !== 'dataMask');
}

// ─── Public API ────────────────────────────────────────────────────────────

export function parseEvalscriptBands(evalscript: string): string[] {
  try {
    if (evalscript.startsWith('//VERSION=3')) {
      return parseVersionedBands(evalscript);
    }
    return parseOldFormatBands(evalscript);
  } catch {
    return [];
  }
}
