import { parseIndexEvalscript } from './parseIndexEvalscript.util';

describe('parseIndexEvalscript', () => {
  test('returns null for a CLMS-style VERSION=3 evalscript without blank lines', () => {
    const evalscript = `//VERSION=3
const factor = 1;
const offset = 0;
function setup() {
    return {
        input: ["HER", "dataMask"],
        output: [
            { id: "default", bands: 4, sampleType: "UINT8" },
            { id: "index", bands: 1, sampleType: "FLOAT32" },
            { id: "eobrowserStats", bands: 1, sampleType: "FLOAT32" },
            { id: "dataMask", bands: 1 },
        ],
    };
}

function evaluatePixel(samples) {
    const originalValue = samples.HER;
    const val = originalValue * factor + offset;
    const dataMask = samples.dataMask;`;
    expect(parseIndexEvalscript(evalscript)).toBeNull();
  });

  test('returns null for a CLMS-style VERSION=3 evalscript with extra blank lines', () => {
    const evalscript = `//VERSION=3

const factor = 1;

const offset = 0;
function setup() {
    return {
        input: ["HER", "dataMask"],
        output: [
            { id: "default", bands: 4, sampleType: "UINT8" },
            { id: "index", bands: 1, sampleType: "FLOAT32" },
            { id: "eobrowserStats", bands: 1, sampleType: "FLOAT32" },
            { id: "dataMask", bands: 1 },
        ],
    };
}

function evaluatePixel(samples) {
    const originalValue = samples.HER;
    const val = originalValue * factor + offset;
    const dataMask = samples.dataMask;`;
    expect(parseIndexEvalscript(evalscript)).toBeNull();
  });

  test('returns the correct result for a genuine app-generated index evalscript', () => {
    const evalscript = `//VERSION=3
const colorRamp = [[0,0x000000],[1,0xffffff]]

let viz = new ColorRampVisualizer(colorRamp);

function setup() {
  return {
    input: ["B03","B08", "dataMask"],
    output: [
      { id:"default", bands: 4 },
      { id: "index", bands: 1, sampleType: 'FLOAT32' }
    ]
  };
}

function evaluatePixel(samples) {
  let index = (samples.B03-samples.B08)/(samples.B03+samples.B08);
  const minIndex = 0;
  const maxIndex = 1;
  let visVal = null;

  const isValid = samples.dataMask === 1 && index >= minIndex && index <= maxIndex;

  if(!isValid) {
    visVal = [0, 0, 0, 0];
  }
  else {
    visVal = [...viz.process(index),samples.dataMask];
  }

  // The library for tiffs only works well if there is one channel returned.
  // So here we encode "no data" as NaN and ignore NaNs on the frontend.
  const indexVal = isValid ? index : NaN;

  return { default: visVal, index: [indexVal] };
}`;
    expect(parseIndexEvalscript(evalscript)).toEqual({
      bands: { a: 'B03', b: 'B08' },
      equation: '(A-B)/(A+B)',
      positions: [0, 1],
      colors: ['#000000', '#ffffff'],
    });
  });

  test('parses the (A/B) equation correctly', () => {
    const evalscript = `//VERSION=3
const colorRamp = [[0,0x000000],[1,0xffffff]]

function setup() {
  return {
    input: ["B03","B08", "dataMask"],
    output: [{ id:"default", bands: 4 }]
  };
}

function evaluatePixel(samples) {
  let index = (samples.B03/samples.B08);
  return { default: [] };
}`;
    expect(parseIndexEvalscript(evalscript)).toEqual({
      bands: { a: 'B03', b: 'B08' },
      equation: '(A/B)',
      positions: [0, 1],
      colors: ['#000000', '#ffffff'],
    });
  });

  test('returns null for pre-//VERSION=3 format', () => {
    const evalscript = 'return [B03 * 2.5, B08 * 2.5, B04* 2.5]';
    expect(parseIndexEvalscript(evalscript)).toBeNull();
  });

  test('parses colorRamp with more than 2 entries', () => {
    const evalscript = `//VERSION=3
const colorRamp = [[-1,0xd73027],[0,0xffffff],[1,0x1a9850]]

function setup() {
  return {
    input: ["B03","B08", "dataMask"],
    output: [{ id:"default", bands: 4 }]
  };
}

function evaluatePixel(samples) {
  let index = (samples.B03-samples.B08)/(samples.B03+samples.B08);
  return { default: [] };
}`;
    expect(parseIndexEvalscript(evalscript)).toEqual({
      bands: { a: 'B03', b: 'B08' },
      equation: '(A-B)/(A+B)',
      positions: [-1, 0, 1],
      colors: ['#d73027', '#ffffff', '#1a9850'],
    });
  });

  test('returns correct equation and band names when both input bands are the same', () => {
    const evalscript = `//VERSION=3
const colorRamp = [[0,0x000000],[1,0xffffff]]

function setup() {
  return {
    input: ["B03", "dataMask"],
    output: [{ id:"default", bands: 4 }]
  };
}

function evaluatePixel(samples) {
  let index = (samples.B03-samples.B03)/(samples.B03+samples.B03);
  return { default: [] };
}`;
    expect(parseIndexEvalscript(evalscript)).toEqual({
      bands: { a: 'B03', b: 'B03' },
      equation: '(A-B)/(A+B)',
      positions: [0, 1],
      colors: ['#000000', '#ffffff'],
    });
  });

  test('finds colorRamp when it is not on the second line but is still before setup', () => {
    const evalscript = `//VERSION=3
const someVar = 42;
const anotherVar = 'hello';
const colorRamp = [[0,0x000000],[1,0xffffff]]

function setup() {
  return {
    input: ["B03","B08", "dataMask"],
    output: [{ id:"default", bands: 4 }]
  };
}

function evaluatePixel(samples) {
  let index = (samples.B03-samples.B08)/(samples.B03+samples.B08);
  return { default: [] };
}`;
    expect(parseIndexEvalscript(evalscript)).toEqual({
      bands: { a: 'B03', b: 'B08' },
      equation: '(A-B)/(A+B)',
      positions: [0, 1],
      colors: ['#000000', '#ffffff'],
    });
  });

  test('returns null when colorRamp is defined after setup function', () => {
    const evalscript = `//VERSION=3
function setup() {
  return {
    input: ["B03","B08", "dataMask"],
    output: [{ id:"default", bands: 4 }]
  };
}

const colorRamp = [[0,0x000000],[1,0xffffff]]

function evaluatePixel(samples) {
  let index = (samples.B03-samples.B08)/(samples.B03+samples.B08);
  return { default: [] };
}`;
    expect(parseIndexEvalscript(evalscript)).toBeNull();
  });
});

describe('parseIndexEvalscript — old format (no //VERSION=3)', () => {
  // Colors chosen so they round-trip cleanly through the 0-1 float serialisation:
  //   #000000 → [0,0,0]  → #000000
  //   #808080 → [0.5,0.5,0.5] → #808080
  //   #ffffff → [1,1,1]  → #ffffff
  //   #ff0000 → [1,0,0]  → #ff0000

  test('type 1: parses index() call — equation is always (A-B)/(A+B)', () => {
    const evalscript = `var index = index(B03, B08);
return colorBlend(
  index,
  [0,0.5,1],
  [[0,0,0],[0.5,0.5,0.5],[1,1,1]]
);`;
    expect(parseIndexEvalscript(evalscript)).toEqual({
      bands: { a: 'B03', b: 'B08' },
      equation: '(A-B)/(A+B)',
      positions: [0, 0.5, 1],
      colors: ['#000000', '#808080', '#ffffff'],
    });
  });

  test('type 2: parses (A-B)/(A+B) formula with bare band names', () => {
    const evalscript = `var index = (B03-B08)/(B03+B08);
return colorBlend(
  index,
  [0,1],
  [[0,0,0],[1,1,1]]
);`;
    expect(parseIndexEvalscript(evalscript)).toEqual({
      bands: { a: 'B03', b: 'B08' },
      equation: '(A-B)/(A+B)',
      positions: [0, 1],
      colors: ['#000000', '#ffffff'],
    });
  });

  test('type 2: parses (A/B) formula with surrounding parentheses', () => {
    const evalscript = `var index = (B03/B08);
return colorBlend(
  index,
  [0,1],
  [[0,0,0],[1,1,1]]
);`;
    expect(parseIndexEvalscript(evalscript)).toEqual({
      bands: { a: 'B03', b: 'B08' },
      equation: '(A/B)',
      positions: [0, 1],
      colors: ['#000000', '#ffffff'],
    });
  });

  test('type 2: parses A/B formula without parentheses, normalises to (A/B)', () => {
    const evalscript = `var index = B03/B08;
return colorBlend(
  index,
  [0,1],
  [[1,0,0],[0,0,0]]
);`;
    expect(parseIndexEvalscript(evalscript)).toEqual({
      bands: { a: 'B03', b: 'B08' },
      equation: '(A/B)',
      positions: [0, 1],
      colors: ['#ff0000', '#000000'],
    });
  });

  test('returns null when formula is not (A-B)/(A+B) or A/B', () => {
    const evalscript = `var index = B03+B08;
return colorBlend(
  index,
  [0,1],
  [[0,0,0],[1,1,1]]
);`;
    expect(parseIndexEvalscript(evalscript)).toBeNull();
  });

  test('returns null when colorBlend is not called', () => {
    const evalscript = `var index = (B03-B08)/(B03+B08);
return [0, 0, 0];`;
    expect(parseIndexEvalscript(evalscript)).toBeNull();
  });

  test('returns null when first statement is not a var index declaration', () => {
    const evalscript = `return [B03 * 2.5, B08 * 2.5, B04 * 2.5]`;
    expect(parseIndexEvalscript(evalscript)).toBeNull();
  });
});
