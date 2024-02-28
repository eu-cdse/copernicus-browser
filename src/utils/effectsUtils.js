/*
EFFECTS format in different parts of the app

store (transforming to this format and from this format to others):
  - gainEffect, gammaEffect: <number>
  - redRangeEffect, greenRangeEffect, blueRangeEffect: [start, end]
  - redCurveEffect, greenCurveEffect, blueCurveEffect: {points: [{ x, y }, ...], values: [{ x, y }, ...]}

pins (transforming to this format and from this format to others):
  - gainEffect, gammaEffect: <number>
  - redRangeEffect, greenRangeEffect, blueRangeEffect: [start, end]
  - redCurveEffect, greenCurveEffect, blueCurveEffect: POINTS array [{ x, y }, ...]

url (transforming to this format and from this format to others):
  - gainEffect, gammaEffect: <number>
  - redRangeEffect, greenRangeEffect, blueRangeEffect: stringified [start, end]
  - redCurveEffect, greenCurveEffect, blueCurveEffect: stringified POINTS array [{ x, y }, ...]
  
getMapParams (only transforming to this format, not from it):
  - gain, gamma: <number>
  - redRange, greenRange, blueRange: {from, to}
  - customEffect: function

*/

import { isFunction } from '.';
import { getDataSourceHandler } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { computeNewValuesFromPoints } from '../junk/EOBEffectsPanel/AdvancedRgbEffects/CurveEditor/CurveEditor.utils';

export const defaultGain = 1.0;
export const defaultGamma = 1.0;
export const defaultRange = [0.0, 1.0];

export function isEffectValueSetAndNotDefault(val, defaultVal) {
  if (val === undefined || val === null) {
    return false;
  }
  if (typeof val !== typeof defaultVal) {
    throw new Error('Effect value is not of correct type');
  }
  return val !== defaultVal;
}

export function isEffectRangeSetAndNotDefault(val, defaultVal) {
  if (val === undefined || val === null) {
    return false;
  }
  if (typeof val !== typeof defaultVal) {
    throw new Error('Effect is not of correct type');
  }
  if (val.length !== defaultVal.length) {
    throw new Error('Effect array is not of the correct length');
  }
  return !(val[0] === defaultVal[0] && val[1] === defaultVal[1]);
}

const customEffectsFunctionCache = new Map();

const getCustomEffectsFunctionCacheKey = ({ redCurveEffect, blueCurveEffect, greenCurveEffect }) =>
  JSON.stringify({
    redCurveEffect: redCurveEffect,
    blueCurveEffect: blueCurveEffect,
    greenCurveEffect: greenCurveEffect,
  });

export const createCustomEffectFunction = ({ redCurveEffect, greenCurveEffect, blueCurveEffect }) => {
  let customEffectsFunction;
  if (
    (redCurveEffect && redCurveEffect.values) ||
    (greenCurveEffect && greenCurveEffect.values) ||
    (blueCurveEffect && blueCurveEffect.values)
  ) {
    customEffectsFunction = ({ r, g, b, a }) => {
      let newR = r;
      let newG = g;
      let newB = b;
      if (redCurveEffect && redCurveEffect.values) {
        let redId = Math.round(r * (redCurveEffect.values.length - 1));
        redId = Math.max(0, Math.min(redCurveEffect.values.length - 1, redId));
        newR = redCurveEffect.values[redId].y;
      }
      if (greenCurveEffect && greenCurveEffect.values) {
        let greenId = Math.round(g * (greenCurveEffect.values.length - 1));
        greenId = Math.max(0, Math.min(greenCurveEffect.values.length - 1, greenId));
        newG = greenCurveEffect.values[greenId].y;
      }
      if (blueCurveEffect && blueCurveEffect.values) {
        let blueId = Math.round(b * (blueCurveEffect.values.length - 1));
        blueId = Math.max(0, Math.min(blueCurveEffect.values.length - 1, blueId));
        newB = blueCurveEffect.values[blueId].y;
      }
      return { r: newR, g: newG, b: newB, a: a };
    };
  }
  return customEffectsFunction;
};

export function constructGetMapParamsEffects(effects) {
  const { gainEffect, gammaEffect, redRangeEffect, greenRangeEffect, blueRangeEffect } = effects;

  const getMapParamsEffects = {};
  if (isEffectValueSetAndNotDefault(gainEffect, defaultGain)) {
    getMapParamsEffects.gain = gainEffect;
  }
  if (isEffectValueSetAndNotDefault(gammaEffect, defaultGamma)) {
    getMapParamsEffects.gamma = gammaEffect;
  }
  if (isEffectRangeSetAndNotDefault(redRangeEffect, defaultRange)) {
    getMapParamsEffects.redRange = { from: redRangeEffect[0], to: redRangeEffect[1] };
  }
  if (isEffectRangeSetAndNotDefault(greenRangeEffect, defaultRange)) {
    getMapParamsEffects.greenRange = { from: greenRangeEffect[0], to: greenRangeEffect[1] };
  }
  if (isEffectRangeSetAndNotDefault(blueRangeEffect, defaultRange)) {
    getMapParamsEffects.blueRange = { from: blueRangeEffect[0], to: blueRangeEffect[1] };
  }

  const customEffectsFunctionCacheKey = getCustomEffectsFunctionCacheKey(effects);
  if (!customEffectsFunctionCache.has(customEffectsFunctionCacheKey)) {
    customEffectsFunctionCache.set(customEffectsFunctionCacheKey, createCustomEffectFunction(effects));
  }
  const customEffectsFunction = customEffectsFunctionCache.get(customEffectsFunctionCacheKey);
  if (customEffectsFunction) {
    getMapParamsEffects.customEffect = customEffectsFunction;
  }

  if (Object.keys(getMapParamsEffects).length === 0) {
    return null;
  }
  return getMapParamsEffects;
}

function isPinEffectValueSetAndNotDefault(val, defaultVal) {
  if (val === undefined || val === null) {
    return false;
  }
  return Number(val) !== defaultVal;
}

function isPinEffectRangeSetAndNotDefault(val, defaultVal) {
  if (val === undefined || val === null) {
    return false;
  }
  if (val.length !== defaultVal.length) {
    throw new Error('Effect array is not of the correct length');
  }
  return !(Number(val[0]) === defaultVal[0] && Number(val[1]) === defaultVal[1]);
}

export function constructEffectsFromPinOrHighlight(item) {
  const { gain, gamma, redRange, greenRange, blueRange, redCurve, greenCurve, blueCurve, demSource3D } = item;

  const effects = {};

  if (isPinEffectValueSetAndNotDefault(gain, defaultGain)) {
    effects.gainEffect = Number(gain);
  }
  if (isPinEffectValueSetAndNotDefault(gamma, defaultGamma)) {
    effects.gammaEffect = Number(gamma);
  }
  if (isPinEffectRangeSetAndNotDefault(redRange, defaultRange)) {
    effects.redRangeEffect = [Number(redRange[0]), Number(redRange[1])];
  }
  if (isPinEffectRangeSetAndNotDefault(greenRange, defaultRange)) {
    effects.greenRangeEffect = [Number(greenRange[0]), Number(greenRange[1])];
  }
  if (isPinEffectRangeSetAndNotDefault(blueRange, defaultRange)) {
    effects.blueRangeEffect = [Number(blueRange[0]), Number(blueRange[1])];
  }

  if (redCurve) {
    effects.redCurveEffect = { points: redCurve, values: computeNewValuesFromPoints(redCurve) };
  }
  if (greenCurve) {
    effects.greenCurveEffect = { points: greenCurve, values: computeNewValuesFromPoints(greenCurve) };
  }
  if (blueCurve) {
    effects.blueCurveEffect = { points: blueCurve, values: computeNewValuesFromPoints(blueCurve) };
  }
  if (demSource3D) {
    effects.demSource3D = demSource3D;
  }

  return effects;
}

export const getVisualizationEffectsFromStore = (store) => ({
  gainEffect: store.visualization.gainEffect,
  gammaEffect: store.visualization.gammaEffect,
  redRangeEffect: store.visualization.redRangeEffect,
  greenRangeEffect: store.visualization.greenRangeEffect,
  blueRangeEffect: store.visualization.blueRangeEffect,
  redCurveEffect: store.visualization.redCurveEffect,
  greenCurveEffect: store.visualization.greenCurveEffect,
  blueCurveEffect: store.visualization.blueCurveEffect,
  minQa: store.visualization.minQa,
  mosaickingOrder: store.visualization.mosaickingOrder,
  upsampling: store.visualization.upsampling,
  downsampling: store.visualization.downsampling,
  speckleFilter: store.visualization.speckleFilter,
  orthorectification: store.visualization.orthorectification,
  backscatterCoeff: store.visualization.backscatterCoeff,
  demSource3D: store.visualization.demSource3D,
});

export const logToLinear = (e, min, max) => {
  return ((Math.log(e) - Math.log(min)) / (Math.log(max) - Math.log(min))) * max;
};

export const calcLog = (e, min, max) => {
  const pos = e / max;
  const value = min * Math.exp(pos * Math.log(max / min));
  return value.toFixed(1);
};

export const capValue = (val, min, max) => Math.max(Math.min(val, max), min);

export const capitalize = (text) => text.toLowerCase().charAt(0).toUpperCase() + text.toLowerCase().slice(1);

export const findSpeckleFilterIndex = (speckleFilters, speckleFilter) =>
  speckleFilter
    ? speckleFilters.findIndex((element) =>
        element.params
          ? Object.keys(element.params).every((key) => element.params[key] === speckleFilter[key])
          : null,
      )
    : null;

export const isNullOrUndefined = (value) => value === null || value === undefined;

export const getValueOrDefault = (object, key, defaultValues) => {
  if (!object || !key) {
    return null;
  }

  if (!isNullOrUndefined(object[key])) {
    return object[key];
  }

  if (!!defaultValues && !isNullOrUndefined(defaultValues[key])) {
    return defaultValues[key];
  }

  return null;
};

export const getDatasetDefaults = ({ datasetId, zoom }) => {
  const datasetDefaults = {};
  const dsh = getDataSourceHandler(datasetId);
  if (dsh) {
    datasetDefaults.doesDatasetSupportMinQa = dsh.supportsMinQa();
    datasetDefaults.doesDatasetSupportInterpolation = dsh.supportsInterpolation(datasetId);
    datasetDefaults.doesDatasetSupportSpeckleFilter = dsh.supportsSpeckleFilter(datasetId);
    datasetDefaults.doesDatasetSupportOrthorectification = dsh.supportsOrthorectification(datasetId);
    datasetDefaults.doesDatasetSupportBackscatterCoeff = dsh.supportsBackscatterCoeff(datasetId);
    datasetDefaults.supportedSpeckleFilters = dsh.getSupportedSpeckleFilters(datasetId);
    datasetDefaults.canApplySpeckleFilter = dsh.canApplySpeckleFilter(datasetId, zoom);
    if (dsh.supportsMinQa()) {
      datasetDefaults.defaultMinQaValue = dsh.getDefaultMinQa(datasetId);
    }
  }

  return datasetDefaults;
};

export const getValueOrExecute = (value) => (isFunction(value) ? value() : value);
