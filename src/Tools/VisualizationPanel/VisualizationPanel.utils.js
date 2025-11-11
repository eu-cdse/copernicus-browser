import moment from 'moment';
import { defaultEffects } from '../../const';
import { getDataSourceHandler } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';

//Regex for matching True color layers
const TRUE_COLOR_REGEX = /TRUE(\s|-|_)COLOR/i;

//Lets assume layer is True color if layerId or title contains TRUE COLOR
const isTrueColorLayer = (layer) =>
  TRUE_COLOR_REGEX.test(layer.layerId) || TRUE_COLOR_REGEX.test(layer.title);

//True color layers should come first, the rest are sorted by layerId
export const sortLayers = (layers) => {
  const sortedLayers = [
    ...layers.filter((l) => isTrueColorLayer(l)).sort((a, b) => (a.layerId > b.layerId ? 1 : -1)),
    ...layers.filter((l) => !isTrueColorLayer(l)).sort((a, b) => (a.layerId > b.layerId ? 1 : -1)),
  ];

  return sortedLayers;
};

// Get dataset-specific default effects
export const getDefaultEffectsForDataset = (datasetId) => {
  const baseEffects = { ...defaultEffects };

  if (!datasetId) {
    return baseEffects;
  }

  try {
    const dsh = getDataSourceHandler(datasetId);

    if (dsh) {
      // Set minQa based on dataset support
      if (dsh.supportsMinQa && dsh.supportsMinQa()) {
        baseEffects.minQa = dsh.getDefaultMinQa ? dsh.getDefaultMinQa(datasetId) : 50;
      } else {
        baseEffects.minQa = null;
      }

      // You can add more dataset-specific logic here for other effects
      // For example:
      // if (!dsh.supportsSpeckleFilter()) {
      //   baseEffects.speckleFilter = '';
      // }
      // if (!dsh.supportsOrthorectification()) {
      //   baseEffects.orthorectification = '';
      // }
    }
  } catch (error) {
    console.warn('Error getting dataset-specific effects:', error);
  }

  return baseEffects;
};

export const haveEffectsChangedFromDefault = (newEffects, datasetId = null) => {
  const relevantDefaultEffects = datasetId ? getDefaultEffectsForDataset(datasetId) : defaultEffects;

  for (let effectName in newEffects) {
    if (
      newEffects[effectName] !== undefined &&
      JSON.stringify(relevantDefaultEffects[effectName]) !== JSON.stringify(newEffects[effectName])
    ) {
      return true;
    }
  }
  return false;
};

export const getOrbitDirectionFromList = (orbitDirectionsList) =>
  orbitDirectionsList && orbitDirectionsList.length === 1 ? orbitDirectionsList[0] : null;

export const isTimespanModeSelected = (fromTime, toTime) => {
  if (!fromTime || !toTime) {
    return false;
  }

  const fromMoment = moment.utc(fromTime);
  const toMoment = moment.utc(toTime);

  return !(
    fromMoment.isSame(toMoment, 'day') &&
    fromMoment.isSame(fromMoment.clone().startOf('day')) &&
    toMoment.isSame(toMoment.clone().endOf('day'))
  );
};
