import { rgbToHex } from '../junk/BandsToRGB/utils';
import { AstNode, tryParseScript } from './esprimaHelpers';

interface ParsedColorRamp {
  positions: number[];
  colors: string[];
}

interface ParsedEquation {
  bands: { a: string; b: string };
  equation: string;
}

export interface ParseIndexEvalscriptResult {
  bands: { a: string; b: string };
  equation: string;
  positions: number[];
  colors: string[];
}

// ─── //VERSION=3 format ────────────────────────────────────────────────────

// Returns the VariableDeclarator node for colorRamp if it is declared before the setup function.
// Its presence marks the evalscript as app-generated (vs. CLMS-style scripts without a colorRamp).
function findColorRampBeforeSetup(body: AstNode[], setupFnIndex: number): AstNode | null {
  return (
    body
      .slice(0, setupFnIndex)
      .filter((node) => node.type === 'VariableDeclaration')
      .flatMap((node) => node.declarations)
      .find((d: AstNode) => d.id.name === 'colorRamp') ?? null
  );
}

// Returns true when setup()'s return value has an `input` property that is a plain string-literal
// array, as opposed to the band-object form `[{ bands: [...] }]` used by some CLMS datasets.
function hasStringArrayInput(setupFn: AstNode): boolean {
  const setupReturn = setupFn.body.body.find((node: AstNode) => node.type === 'ReturnStatement');
  if (!setupReturn || setupReturn.argument?.type !== 'ObjectExpression') {
    return false;
  }
  const inputProp = setupReturn.argument.properties.find(
    (p: AstNode) => (p.key.name ?? p.key.value) === 'input',
  );
  return (
    inputProp?.value.type === 'ArrayExpression' &&
    inputProp.value.elements.every((el: AstNode) => el.type === 'Literal' && typeof el.value === 'string')
  );
}

// Extracts the source text of the `let index = <expr>` initialiser from evaluatePixel.
// Slices from the declarator's character range (not the AST node range) so that wrapping
// parentheses like `(samples.A/samples.B)` are included — Esprima's expression range excludes them.
function getIndexExpressionSource(evalscript: string, evalPixelFn: AstNode): string | null {
  const indexDecl = evalPixelFn.body.body.find(
    (node: AstNode) =>
      node.type === 'VariableDeclaration' && node.declarations.some((d: AstNode) => d.id.name === 'index'),
  );
  if (!indexDecl) {
    return null;
  }
  const declarator = indexDecl.declarations.find((d: AstNode) => d.id.name === 'index');
  if (!declarator?.init) {
    return null;
  }
  const declaratorSrc = evalscript.slice(declarator.range[0], declarator.range[1]);
  return declaratorSrc.slice(declaratorSrc.indexOf('=') + 1).trim();
}

// Substitutes `samples.X` references with A/B tokens and returns the equation string together
// with the two band names. The first unique band encountered becomes A; the second (or the same
// band again when only one is used) becomes B.
// When A === B, a positional pass preserves the original equation shape, and a subsequent fix
// corrects the (B+B) artefact — caused by the positional pass — back to (A+B).
function buildEquation(initSrc: string): ParsedEquation | null {
  const allMatchNames = [...initSrc.matchAll(/samples\.([A-Za-z0-9_]+)/g)].map((m) => m[1]);
  const uniqueBands = [...new Set(allMatchNames)];
  if (uniqueBands.length === 0) {
    return null;
  }

  const bandA = uniqueBands[0];
  const bandB = uniqueBands[1] ?? uniqueBands[0];

  let equation: string;
  if (bandA === bandB) {
    let isFirst = true;
    equation = initSrc.replace(new RegExp(`samples\\.${bandA}(?![A-Za-z0-9_])`, 'g'), () => {
      if (isFirst) {
        isFirst = false;
        return 'A';
      }
      return 'B';
    });
    equation = equation.replace(/B\+B/g, 'A+B');
  } else {
    equation = initSrc
      .replace(new RegExp(`samples\\.${bandA}`, 'g'), 'A')
      .replace(new RegExp(`samples\\.${bandB}`, 'g'), 'B');
  }

  if (equation.includes('samples.')) {
    return null;
  }

  return { bands: { a: bandA, b: bandB }, equation };
}

// Parses the colorRamp declarator into parallel arrays of numeric positions and hex color strings.
// Each colorRamp entry is [position, 0xRRGGBB], where position may be a negative literal.
function parseColorRamp(colorRampDeclarator: AstNode): ParsedColorRamp | null {
  const colorRampInit = colorRampDeclarator.init;
  if (!colorRampInit || colorRampInit.type !== 'ArrayExpression') {
    return null;
  }

  const positions: number[] = [];
  const colors: string[] = [];
  for (const element of colorRampInit.elements) {
    if (element.type !== 'ArrayExpression' || element.elements.length !== 2) {
      return null;
    }
    const [posNode, colorNode] = element.elements;

    let position: number;
    if (posNode.type === 'Literal') {
      position = posNode.value;
    } else if (
      posNode.type === 'UnaryExpression' &&
      posNode.operator === '-' &&
      posNode.argument.type === 'Literal'
    ) {
      position = -posNode.argument.value;
    } else {
      return null;
    }
    positions.push(position);

    if (colorNode.type !== 'Literal' || typeof colorNode.value !== 'number') {
      return null;
    }
    colors.push('#' + colorNode.value.toString(16).padStart(6, '0'));
  }

  return positions.length > 0 ? { positions, colors } : null;
}

function parseVersionedEvalscript(evalscript: string): ParseIndexEvalscriptResult | null {
  const ast = tryParseScript(evalscript, true);
  if (!ast) {
    return null;
  }

  const { body } = ast;

  const setupFnIndex = body.findIndex(
    (node: AstNode) => node.type === 'FunctionDeclaration' && node.id.name === 'setup',
  );
  if (setupFnIndex === -1) {
    return null;
  }

  const colorRampDeclarator = findColorRampBeforeSetup(body, setupFnIndex);
  if (!colorRampDeclarator) {
    return null;
  }

  const setupFn = body[setupFnIndex];
  if (!hasStringArrayInput(setupFn)) {
    return null;
  }

  const evalPixelFn = body.find(
    (node: AstNode) => node.type === 'FunctionDeclaration' && node.id.name === 'evaluatePixel',
  );
  if (!evalPixelFn) {
    return null;
  }

  const initSrc = getIndexExpressionSource(evalscript, evalPixelFn);
  if (!initSrc) {
    return null;
  }

  const equationResult = buildEquation(initSrc);
  if (!equationResult) {
    return null;
  }

  const colorRamp = parseColorRamp(colorRampDeclarator);
  if (!colorRamp) {
    return null;
  }

  const { bands, equation } = equationResult;
  const { positions, colors } = colorRamp;
  return { bands, equation, positions, colors };
}

// ─── Old (pre-VERSION=3) format ────────────────────────────────────────────

// Recursively collects all Identifier names from a pure BinaryExpression tree.
function collectAstIdentifiers(node: AstNode): string[] {
  if (!node) {
    return [];
  }
  if (node.type === 'Identifier') {
    return [node.name];
  }
  if (node.type === 'BinaryExpression') {
    return [...collectAstIdentifiers(node.left), ...collectAstIdentifiers(node.right)];
  }
  return [];
}

// Maps a raw substituted equation string (e.g. "A/B") to its canonical form (e.g. "(A/B)").
// Only the two supported equation shapes are accepted; any other returns null.
const CANONICAL_EQUATION: Record<string, string> = {
  '(A-B)/(A+B)': '(A-B)/(A+B)',
  'A/B': '(A/B)',
  '(A/B)': '(A/B)',
};

// Extracts bands and canonical equation from the old-format `var index = <expr>` initialiser.
// Band names are bare identifiers (e.g. B03), not `samples.B03`.
function buildOldFormatEquation(init: AstNode, initSrc: string): ParsedEquation | null {
  const allNames = collectAstIdentifiers(init);
  const uniqueBands = [...new Set(allNames)];
  if (uniqueBands.length === 0 || uniqueBands.length > 2) {
    return null;
  }

  const bandA = uniqueBands[0];
  const bandB = uniqueBands[1] ?? uniqueBands[0];

  const substituted = initSrc
    .replace(new RegExp(`\\b${bandA}\\b`, 'g'), 'A')
    .replace(new RegExp(`\\b${bandB}\\b`, 'g'), 'B');

  const equation = CANONICAL_EQUATION[substituted];
  if (!equation) {
    return null;
  }

  return { bands: { a: bandA, b: bandB }, equation };
}

// Parses a colorBlend(value, positions, colors) call node.
// Colors are stored as [r, g, b] float arrays (0-1) and converted to hex via rgbToHex.
function parseColorBlendCall(node: AstNode): ParsedColorRamp | null {
  if (
    node.type !== 'CallExpression' ||
    node.callee.type !== 'Identifier' ||
    node.callee.name !== 'colorBlend' ||
    node.arguments.length !== 3
  ) {
    return null;
  }

  const [, positionsNode, colorsNode] = node.arguments;
  if (positionsNode.type !== 'ArrayExpression' || colorsNode.type !== 'ArrayExpression') {
    return null;
  }

  const positions: number[] = [];
  for (const el of positionsNode.elements) {
    if (el.type === 'Literal' && typeof el.value === 'number') {
      positions.push(el.value);
    } else {
      return null;
    }
  }

  const colors: string[] = [];
  for (const el of colorsNode.elements) {
    if (el.type !== 'ArrayExpression' || el.elements.length !== 3) {
      return null;
    }
    const components: number[] = [];
    for (const comp of el.elements) {
      if (comp.type !== 'Literal' || typeof comp.value !== 'number') {
        return null;
      }
      components.push(comp.value);
    }
    colors.push(rgbToHex(components.map((c) => Math.ceil(c * 255))));
  }

  if (positions.length === 0 || positions.length !== colors.length) {
    return null;
  }

  return { positions, colors };
}

function parseOldFormatEvalscript(evalscript: string): ParseIndexEvalscriptResult | null {
  // The old-format snippet has a top-level `return` statement which is a syntax error outside a
  // function body. Wrap it so esprima can parse it, then navigate into the function's body.
  const WRAPPER_PREFIX = '(function(){';
  const wrappedCode = `${WRAPPER_PREFIX}${evalscript}})`;
  const ast = tryParseScript(wrappedCode, true);
  if (!ast) {
    return null;
  }

  // Navigate: ExpressionStatement > FunctionExpression > body > body[]
  const stmts: AstNode[] = ast.body[0]?.expression?.body?.body;
  if (!Array.isArray(stmts)) {
    return null;
  }

  // First statement must be: var <anything> = <expression>
  const firstStmt = stmts[0];
  if (firstStmt?.type !== 'VariableDeclaration') {
    return null;
  }

  const indexDeclarator = firstStmt.declarations[0];
  if (!indexDeclarator?.init) {
    return null;
  }

  const init = indexDeclarator.init;
  let equationResult: ParsedEquation | null = null;

  if (
    init.type === 'CallExpression' &&
    init.callee?.type === 'Identifier' &&
    init.callee.name === 'index' &&
    init.arguments.length === 2 &&
    init.arguments.every((arg: AstNode) => arg.type === 'Identifier')
  ) {
    // Type 1: var index = index(bandA, bandB) — equation is always (A-B)/(A+B)
    equationResult = {
      bands: { a: init.arguments[0].name, b: init.arguments[1].name },
      equation: '(A-B)/(A+B)',
    };
  } else if (init.type === 'BinaryExpression') {
    // Type 2: var index = (B03-B08)/(B03+B08) or B03/B08 or (B03/B08)
    // Use wrappedCode for source extraction since ranges are relative to it.
    const declaratorSrc = wrappedCode.slice(indexDeclarator.range[0], indexDeclarator.range[1]);
    const initSrc = declaratorSrc.slice(declaratorSrc.indexOf('=') + 1).trim();
    equationResult = buildOldFormatEquation(init, initSrc);
  } else {
    return null;
  }

  if (!equationResult) {
    return null;
  }

  // The script must contain: return colorBlend(index, [...positions], [...colors])
  const returnStmt = stmts.find((n: AstNode) => n.type === 'ReturnStatement');
  if (!returnStmt?.argument) {
    return null;
  }

  const colorRamp = parseColorBlendCall(returnStmt.argument);
  if (!colorRamp) {
    return null;
  }

  const { bands, equation } = equationResult;
  const { positions, colors } = colorRamp;
  return { bands, equation, positions, colors };
}

// ─── Public API ────────────────────────────────────────────────────────────

export function parseIndexEvalscript(evalscript: string): ParseIndexEvalscriptResult | null {
  try {
    if (evalscript.startsWith('//VERSION=3')) {
      return parseVersionedEvalscript(evalscript);
    }
    const result = parseOldFormatEvalscript(evalscript);
    return result;
  } catch {
    return null;
  }
}
