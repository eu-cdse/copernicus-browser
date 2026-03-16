import { Effects, ColorRange } from '../../types/effectTypes';

// from one range to another
// f(x) = c + ((d - c) / (b - a)) * (x - a)
// a = oldMin, b = oldMax; c = newMin, d = newMax
// [0,255] to [0,1]: a = 0, b = 255; c = 0, d = 1
// [0,1] to [0,255]: a = 0, b = 1; c = 0, d = 255

export function transformValueToRange(
  x: number,
  oldMin: number,
  oldMax: number,
  newMin: number,
  newMax: number,
): number {
  let newX = newMin + ((newMax - newMin) / (oldMax - oldMin)) * (x - oldMin);
  newX = Math.max(newX, newMin);
  newX = Math.min(newX, newMax);
  return newX;
}

export function isEffectSet(effect: number | ColorRange): boolean {
  return effect !== undefined && effect !== null;
}

export function isAnyEffectSet(effects: Effects): boolean {
  return Object.values(effects).some((e) => isEffectSet(e));
}
