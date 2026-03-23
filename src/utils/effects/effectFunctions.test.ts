import { runGainEffectFunction, runGammaEffectFunction, runColorEffectFunction } from './effectFunctions';
import { Effects } from '../../types/effectTypes';

// Helper to build a flat RGBA array from an array of [r, g, b, a] tuples.
function buildRgba(pixels: [number, number, number, number][]): number[] {
  return pixels.flatMap(([r, g, b, a]) => [r, g, b, a]);
}

// Helper to extract pixels from a flat RGBA array as [r, g, b, a] tuples.
function extractPixels(arr: number[]): [number, number, number, number][] {
  const result: [number, number, number, number][] = [];
  for (let i = 0; i < arr.length; i += 4) {
    result.push([arr[i], arr[i + 1], arr[i + 2], arr[i + 3]]);
  }
  return result;
}

describe('runGainEffectFunction', () => {
  test('returns the same array reference when gain is 1.0 (no-op)', () => {
    const input = buildRgba([[0.5, 0.5, 0.5, 1.0]]);
    const effects: Effects = { gain: 1.0 };
    const result = runGainEffectFunction(input, effects);
    expect(result).toBe(input);
  });

  test('returns the same array reference when gain is undefined (defaults to 1.0)', () => {
    const input = buildRgba([[0.5, 0.5, 0.5, 1.0]]);
    const effects: Effects = {};
    const result = runGainEffectFunction(input, effects);
    expect(result).toBe(input);
  });

  test('doubles RGB channel values when gain is 2.0', () => {
    const input = buildRgba([[0.3, 0.4, 0.5, 1.0]]);
    const effects: Effects = { gain: 2.0 };
    const result = runGainEffectFunction(input, effects);
    const pixels = extractPixels(result);
    expect(pixels[0][0]).toBeCloseTo(0.6, 5);
    expect(pixels[0][1]).toBeCloseTo(0.8, 5);
    expect(pixels[0][2]).toBeCloseTo(1.0, 5);
    // Alpha channel must remain unchanged
    expect(pixels[0][3]).toBe(1.0);
  });

  test('halves RGB channel values when gain is 0.5', () => {
    const input = buildRgba([[0.8, 0.6, 0.4, 1.0]]);
    const effects: Effects = { gain: 0.5 };
    const result = runGainEffectFunction(input, effects);
    const pixels = extractPixels(result);
    expect(pixels[0][0]).toBeCloseTo(0.4, 5);
    expect(pixels[0][1]).toBeCloseTo(0.3, 5);
    expect(pixels[0][2]).toBeCloseTo(0.2, 5);
    expect(pixels[0][3]).toBe(1.0);
  });

  test('clamps result to 0 when gain would produce a negative value', () => {
    // With gain=2, a channel of 0 stays at 0 (no negative overflow possible with non-negative input).
    // With minValue=0 the offset is always 0, so only way to get negative is if input channel is negative.
    // The source uses Math.max(0.0, ...) to clamp.
    const input = buildRgba([[-0.1, 0.0, 0.5, 1.0]]);
    const effects: Effects = { gain: 2.0 };
    const result = runGainEffectFunction(input, effects);
    expect(result[0]).toBeCloseTo(0.0, 5); // clamped from -0.2 to 0
    expect(result[1]).toBeCloseTo(0.0, 5);
    expect(result[2]).toBeCloseTo(1.0, 5);
  });

  test('applies gain to all pixels in a multi-pixel array', () => {
    const input = buildRgba([
      [0.2, 0.4, 0.6, 1.0],
      [0.1, 0.5, 0.9, 0.5],
    ]);
    const effects: Effects = { gain: 2.0 };
    const result = runGainEffectFunction(input, effects);
    const pixels = extractPixels(result);
    expect(pixels[0][0]).toBeCloseTo(0.4, 5);
    expect(pixels[1][0]).toBeCloseTo(0.2, 5);
    // The gain function clamps at 0 but not at 1, so 0.9 * 2 = 1.8 is kept as-is.
    expect(pixels[1][2]).toBeCloseTo(1.8, 5);
    // Alpha channels unchanged
    expect(pixels[0][3]).toBe(1.0);
    expect(pixels[1][3]).toBe(0.5);
  });

  test('gain of 0 sets all RGB channels to 0', () => {
    const input = buildRgba([[0.5, 0.8, 0.2, 1.0]]);
    const effects: Effects = { gain: 0 };
    // isEffectSet(0) returns true (0 is not undefined/null), gain = 0, which !== 1.0 so it runs
    // factor = 0 / 1 = 0, so transformValueWithGain(x) = Math.max(0, x*0 + 0) = 0
    const result = runGainEffectFunction(input, effects);
    const pixels = extractPixels(result);
    expect(pixels[0][0]).toBeCloseTo(0.0, 5);
    expect(pixels[0][1]).toBeCloseTo(0.0, 5);
    expect(pixels[0][2]).toBeCloseTo(0.0, 5);
    expect(pixels[0][3]).toBe(1.0);
  });
});

describe('runGammaEffectFunction', () => {
  test('returns the same array reference when gamma is 1.0 (no-op)', () => {
    const input = buildRgba([[0.5, 0.5, 0.5, 1.0]]);
    const effects: Effects = { gamma: 1.0 };
    const result = runGammaEffectFunction(input, effects);
    expect(result).toBe(input);
  });

  test('returns the same array reference when gamma is undefined (defaults to 1.0)', () => {
    const input = buildRgba([[0.5, 0.5, 0.5, 1.0]]);
    const effects: Effects = {};
    const result = runGammaEffectFunction(input, effects);
    expect(result).toBe(input);
  });

  test('applies gamma of 2.0 to RGB channels (squares the values)', () => {
    const input = buildRgba([[0.5, 0.8, 0.25, 1.0]]);
    const effects: Effects = { gamma: 2.0 };
    const result = runGammaEffectFunction(input, effects);
    const pixels = extractPixels(result);
    expect(pixels[0][0]).toBeCloseTo(0.25, 5); // 0.5^2
    expect(pixels[0][1]).toBeCloseTo(0.64, 5); // 0.8^2
    expect(pixels[0][2]).toBeCloseTo(0.0625, 5); // 0.25^2
    expect(pixels[0][3]).toBe(1.0); // alpha unchanged
  });

  test('applies gamma of 0.5 to RGB channels (square-root brightens)', () => {
    const input = buildRgba([[0.25, 0.64, 1.0, 0.8]]);
    const effects: Effects = { gamma: 0.5 };
    const result = runGammaEffectFunction(input, effects);
    const pixels = extractPixels(result);
    expect(pixels[0][0]).toBeCloseTo(0.5, 5); // 0.25^0.5
    expect(pixels[0][1]).toBeCloseTo(0.8, 5); // 0.64^0.5
    expect(pixels[0][2]).toBeCloseTo(1.0, 5); // 1.0^0.5
    expect(pixels[0][3]).toBe(0.8); // alpha unchanged
  });

  test('applies gamma to all pixels in a multi-pixel array', () => {
    const input = buildRgba([
      [0.5, 0.5, 0.5, 1.0],
      [1.0, 0.0, 0.25, 0.5],
    ]);
    const effects: Effects = { gamma: 2.0 };
    const result = runGammaEffectFunction(input, effects);
    const pixels = extractPixels(result);
    expect(pixels[0][0]).toBeCloseTo(0.25, 5);
    expect(pixels[1][0]).toBeCloseTo(1.0, 5);
    expect(pixels[1][1]).toBeCloseTo(0.0, 5);
    expect(pixels[1][2]).toBeCloseTo(0.0625, 5);
    // Alpha unchanged
    expect(pixels[0][3]).toBe(1.0);
    expect(pixels[1][3]).toBe(0.5);
  });

  test.each([
    [0.5, 2.0],
    [2.0, 0.5],
    [0.1, 3.0],
  ])('gamma %f applied to value 0 always stays 0, value 1 always stays 1', (gamma) => {
    const input = buildRgba([[0.0, 1.0, 0.5, 1.0]]);
    const effects: Effects = { gamma };
    const result = runGammaEffectFunction(input, effects);
    expect(result[0]).toBeCloseTo(0.0, 5);
    expect(result[1]).toBeCloseTo(1.0, 5);
  });
});

describe('runColorEffectFunction', () => {
  test('returns array unchanged when no range effects are set', () => {
    const input = buildRgba([[0.5, 0.6, 0.7, 1.0]]);
    const effects: Effects = {};
    const result = runColorEffectFunction(input, effects);
    expect(result[0]).toBeCloseTo(0.5, 5);
    expect(result[1]).toBeCloseTo(0.6, 5);
    expect(result[2]).toBeCloseTo(0.7, 5);
    expect(result[3]).toBe(1.0);
  });

  test('remaps red channel when redRange is set, leaves green and blue unchanged', () => {
    // redRange from 0 to 0.5 mapped to [0, 1]: a value of 0.25 in [0, 0.5] -> 0.5 in [0, 1]
    const input = buildRgba([[0.25, 0.6, 0.7, 1.0]]);
    const effects: Effects = { redRange: { from: 0, to: 0.5 } };
    const result = runColorEffectFunction(input, effects);
    expect(result[0]).toBeCloseTo(0.5, 5); // remapped
    expect(result[1]).toBeCloseTo(0.6, 5); // unchanged
    expect(result[2]).toBeCloseTo(0.7, 5); // unchanged
    expect(result[3]).toBe(1.0); // alpha unchanged
  });

  test('remaps green channel when greenRange is set, leaves red and blue unchanged', () => {
    // greenRange from 0 to 0.5 mapped to [0, 1]: a value of 0.5 in [0, 0.5] -> 1.0 in [0, 1]
    const input = buildRgba([[0.3, 0.5, 0.7, 1.0]]);
    const effects: Effects = { greenRange: { from: 0, to: 0.5 } };
    const result = runColorEffectFunction(input, effects);
    expect(result[0]).toBeCloseTo(0.3, 5); // unchanged
    expect(result[1]).toBeCloseTo(1.0, 5); // remapped
    expect(result[2]).toBeCloseTo(0.7, 5); // unchanged
    expect(result[3]).toBe(1.0);
  });

  test('remaps blue channel when blueRange is set, leaves red and green unchanged', () => {
    // blueRange from 0.5 to 1.0 mapped to [0, 1]: a value of 0.75 in [0.5, 1.0] -> 0.5 in [0, 1]
    const input = buildRgba([[0.3, 0.6, 0.75, 1.0]]);
    const effects: Effects = { blueRange: { from: 0.5, to: 1.0 } };
    const result = runColorEffectFunction(input, effects);
    expect(result[0]).toBeCloseTo(0.3, 5); // unchanged
    expect(result[1]).toBeCloseTo(0.6, 5); // unchanged
    expect(result[2]).toBeCloseTo(0.5, 5); // remapped
    expect(result[3]).toBe(1.0);
  });

  test('remaps all three channels simultaneously when all ranges are set', () => {
    const input = buildRgba([[0.5, 0.5, 0.5, 1.0]]);
    const effects: Effects = {
      redRange: { from: 0, to: 1.0 }, // identity mapping
      greenRange: { from: 0, to: 0.5 }, // 0.5 in [0,0.5] -> 1.0 in [0,1]
      blueRange: { from: 0.25, to: 0.75 }, // 0.5 in [0.25,0.75] -> 0.5 in [0,1]
    };
    const result = runColorEffectFunction(input, effects);
    expect(result[0]).toBeCloseTo(0.5, 5); // identity
    expect(result[1]).toBeCloseTo(1.0, 5); // 0.5 mapped from [0, 0.5] -> [0, 1]
    expect(result[2]).toBeCloseTo(0.5, 5); // 0.5 mapped from [0.25, 0.75] -> [0, 1]
    expect(result[3]).toBe(1.0);
  });

  test('clamps channel value to 0 when it falls below the range minimum', () => {
    // Value 0.0 is below redRange.from=0.5; transformValueToRange clamps to newMin=0
    const input = buildRgba([[0.0, 0.5, 0.5, 1.0]]);
    const effects: Effects = { redRange: { from: 0.5, to: 1.0 } };
    const result = runColorEffectFunction(input, effects);
    expect(result[0]).toBeCloseTo(0.0, 5); // clamped to newMin
  });

  test('clamps channel value to 1 when it exceeds the range maximum', () => {
    // Value 1.0 is above redRange.to=0.5; transformValueToRange clamps to newMax=1
    const input = buildRgba([[1.0, 0.5, 0.5, 1.0]]);
    const effects: Effects = { redRange: { from: 0, to: 0.5 } };
    const result = runColorEffectFunction(input, effects);
    expect(result[0]).toBeCloseTo(1.0, 5); // clamped to newMax
  });

  test('applies color ranges to all pixels in a multi-pixel array', () => {
    const input = buildRgba([
      [0.25, 0.6, 0.8, 1.0],
      [0.75, 0.3, 0.4, 0.5],
    ]);
    const effects: Effects = { redRange: { from: 0, to: 0.5 } };
    const result = runColorEffectFunction(input, effects);
    const pixels = extractPixels(result);
    // Pixel 0: red 0.25 in [0, 0.5] -> 0.5 in [0, 1]
    expect(pixels[0][0]).toBeCloseTo(0.5, 5);
    // Pixel 1: red 0.75 is above range max 0.5, clamped to 1.0
    expect(pixels[1][0]).toBeCloseTo(1.0, 5);
    // Green and blue unchanged for both
    expect(pixels[0][1]).toBeCloseTo(0.6, 5);
    expect(pixels[1][1]).toBeCloseTo(0.3, 5);
    expect(pixels[0][2]).toBeCloseTo(0.8, 5);
    expect(pixels[1][2]).toBeCloseTo(0.4, 5);
    // Alpha unchanged
    expect(pixels[0][3]).toBe(1.0);
    expect(pixels[1][3]).toBe(0.5);
  });

  test('identity range [0, 1] leaves channel values unchanged', () => {
    const input = buildRgba([[0.3, 0.5, 0.7, 1.0]]);
    const effects: Effects = {
      redRange: { from: 0, to: 1 },
      greenRange: { from: 0, to: 1 },
      blueRange: { from: 0, to: 1 },
    };
    const result = runColorEffectFunction(input, effects);
    expect(result[0]).toBeCloseTo(0.3, 5);
    expect(result[1]).toBeCloseTo(0.5, 5);
    expect(result[2]).toBeCloseTo(0.7, 5);
  });
});
