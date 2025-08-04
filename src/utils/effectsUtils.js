/*
EFFECTS format in different parts of the app

store (transforming to this format and from this format to others):
  - gainEffect, gammaEffect: <number>
  - redRangeEffect, greenRangeEffect, blueRangeEffect: [start, end]

pins (transforming to this format and from this format to others):
  - gainEffect, gammaEffect: <number>
  - redRangeEffect, greenRangeEffect, blueRangeEffect: [start, end]

url (transforming to this format and from this format to others):
  - gainEffect, gammaEffect: <number>
  - redRangeEffect, greenRangeEffect, blueRangeEffect: stringified [start, end]
  
getMapParams (only transforming to this format, not from it):
  - gain, gamma: <number>
  - redRange, greenRange, blueRange: {from, to}
  - customEffect: function

*/

import { isFunction } from '.';
import { defaultEffects } from '../const';
import { getDataSourceHandler } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

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

export function constructGetMapParamsAdvancedOptions(options) {
  const {
    minQa,
    upsampling,
    downsampling,
    speckleFilter,
    orthorectification,
    backscatterCoeff,
    demSource3D,
  } = options;

  const getMapParamsAdvancedOptions = {};
  if (minQa != null && minQa !== defaultEffects.minQa) {
    getMapParamsAdvancedOptions.minQa = minQa;
  }
  if (upsampling != null && upsampling !== defaultEffects.upsampling) {
    getMapParamsAdvancedOptions.upsampling = upsampling;
  }
  if (downsampling != null && downsampling !== defaultEffects.downsampling) {
    getMapParamsAdvancedOptions.downsampling = downsampling;
  }
  if (orthorectification != null && orthorectification !== defaultEffects.orthorectification) {
    getMapParamsAdvancedOptions.orthorectification = orthorectification;
  }
  if (backscatterCoeff != null && backscatterCoeff !== defaultEffects.backscatterCoeff) {
    getMapParamsAdvancedOptions.backscatterCoeff = backscatterCoeff;
  }
  if (demSource3D != null && demSource3D !== defaultEffects.demSource3D) {
    getMapParamsAdvancedOptions.demSource3D = demSource3D;
  }

  if (speckleFilter != null && speckleFilter.type !== defaultEffects.speckleFilter) {
    getMapParamsAdvancedOptions.speckleFilter = speckleFilter;
  }
  if (Object.keys(getMapParamsAdvancedOptions).length === 0) {
    return null;
  }
  return getMapParamsAdvancedOptions;
}

export function constructGetMapParamsEffects(effects) {
  const { gainEffect, gammaEffect, redRangeEffect, greenRangeEffect, blueRangeEffect } = effects;
  const getMapParamsEffects = {};
  if (isEffectValueSetAndNotDefault(gainEffect, defaultEffects.gainEffect)) {
    getMapParamsEffects.gain = gainEffect;
  }
  if (isEffectValueSetAndNotDefault(gammaEffect, defaultEffects.gammaEffect)) {
    getMapParamsEffects.gamma = gammaEffect;
  }
  if (isEffectRangeSetAndNotDefault(redRangeEffect, defaultEffects.redRangeEffect)) {
    getMapParamsEffects.redRange = { from: redRangeEffect[0], to: redRangeEffect[1] };
  }
  if (isEffectRangeSetAndNotDefault(greenRangeEffect, defaultEffects.greenRangeEffect)) {
    getMapParamsEffects.greenRange = { from: greenRangeEffect[0], to: greenRangeEffect[1] };
  }
  if (isEffectRangeSetAndNotDefault(blueRangeEffect, defaultEffects.blueRangeEffect)) {
    getMapParamsEffects.blueRange = { from: blueRangeEffect[0], to: blueRangeEffect[1] };
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
  const { gain, gamma, redRange, greenRange, blueRange, demSource3D } = item;

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
  minQa: store.visualization.minQa,
  mosaickingOrder: store.visualization.mosaickingOrder,
  upsampling: store.visualization.upsampling,
  downsampling: store.visualization.downsampling,
  speckleFilter: store.visualization.speckleFilter,
  orthorectification: store.visualization.orthorectification,
  backscatterCoeff: store.visualization.backscatterCoeff,
  demSource3D: store.visualization.demSource3D,
});

export const isVisualizationEffectsApplied = (params) => {
  const effects = constructGetMapParamsEffects(params);
  const advancedOptions = constructGetMapParamsAdvancedOptions(params);
  return effects != null || advancedOptions != null;
};

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
