import axios from 'axios';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import isEqual from 'lodash.isequal';
import { t } from 'ttag';
import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

import store, { pinsSlice, tabsSlice } from '../../store';
import { VERSION_INFO } from '../../VERSION';
import { isUserAuthenticated } from '../../Auth/authHelpers';
import { getDataSourceHandler, getDatasetLabel } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';

import { ensureCorrectDataFusionFormat, getThemeName } from '../../utils';
import {
  defaultGain,
  defaultGamma,
  defaultRange,
  isEffectValueSetAndNotDefault,
  isEffectRangeSetAndNotDefault,
} from '../../utils/effectsUtils';
import { getLayerFromParams } from '../../Controls/ImgDownload/ImageDownload.utils';
import { PROCESSING_OPTIONS, TABS } from '../../const';
import { SAVED_PINS, UNSAVED_PINS } from './const';

const PINS_LC_NAME = 'eob-pins';

async function getPinsFromBackend(access_token) {
  const url = `${import.meta.env.VITE_CDSE_BACKEND}userpins`;
  const requestParams = {
    responseType: 'json',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };
  const res = await axios.get(url, requestParams);
  return establishCorrectDataFusionFormatInPins(res.data.map(normalizePin));
}

export async function getPinsFromServer() {
  const access_token = store.getState().auth.user.access_token;
  return await getPinsFromBackend(access_token);
}

// The server schema uses the legacy lowercase key "evalscripturl".
// Map the camelCase field to lowercase and drop the camelCase key before any PUT
// so the server stores and returns the value correctly.
function toServerPin(p) {
  const { evalscriptUrl, evalscripturl: evalscriptUrlLegacy, ...rest } = p;
  return { ...rest, evalscripturl: evalscriptUrl ?? evalscriptUrlLegacy };
}

async function removePinsFromBackend(ids) {
  const access_token = store.getState().auth.user.access_token;
  const url = `${import.meta.env.VITE_CDSE_BACKEND}userpins`;
  const requestParams = {
    responseType: 'json',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };
  let userPins = await getPinsFromServer();
  userPins = userPins.filter((p) => !ids.includes(p._id));
  await axios.put(url, { items: userPins.map(toServerPin) }, requestParams);
  return userPins;
}

export async function removePinsFromServer(ids) {
  return await removePinsFromBackend(ids);
}

async function savePinsToBackend(pins, replace = false) {
  const access_token = store.getState().auth.user.access_token;
  let lastUniqueId;
  pins = pins.map((p) => {
    if (!p._id) {
      const uniqueId = `${uuid()}-pin`;
      p._id = uniqueId;
    }
    lastUniqueId = p._id;
    return p;
  });

  const url = `${import.meta.env.VITE_CDSE_BACKEND}userpins`;
  const requestParams = {
    responseType: 'json',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };

  let newPins;
  if (replace) {
    newPins = [...pins];
  } else {
    const currentPins = await getPinsFromServer();
    newPins = [...pins, ...currentPins];
  }
  try {
    await axios.put(url, { items: newPins.map(toServerPin) }, requestParams);
    return { uniqueId: lastUniqueId, pins: newPins };
  } catch (err) {
    console.error('Unable to save pins!', err);
    throw err;
  }
}

export async function savePinsToServer(pins, replace = false) {
  const response = await savePinsToBackend(pins, replace);
  const normalizedPins = establishCorrectDataFusionFormatInPins(
    response.pins.map((pin) => normalizePin({ ...pin })),
  );

  store.dispatch(pinsSlice.actions.updatePinsByType({ pins: normalizedPins, pinType: SAVED_PINS }));

  return { ...response, pins: normalizedPins };
}

export function savePinsToSessionStorage(newPins, replace = false) {
  let lastUniqueId;
  newPins = newPins.map((p) => {
    if (!p._id) {
      const uniqueId = `${uuid()}-pin`;
      p._id = uniqueId;
    }
    lastUniqueId = p._id;
    return normalizePin({ ...p });
  });
  let pins = sessionStorage.getItem(PINS_LC_NAME);
  if (!pins) {
    pins = [];
  } else {
    pins = JSON.parse(pins);
  }
  if (!replace) {
    pins = [...newPins, ...pins.map((pin) => normalizePin({ ...pin }))];
  } else {
    pins = newPins;
  }

  sessionStorage.setItem(PINS_LC_NAME, JSON.stringify(pins));
  store.dispatch(pinsSlice.actions.updatePinsByType({ pins: pins, pinType: UNSAVED_PINS }));

  return lastUniqueId;
}

export function getPinsFromSessionStorage() {
  let pins = sessionStorage.getItem(PINS_LC_NAME);
  if (!pins) {
    pins = [];
  } else {
    pins = JSON.parse(pins);
  }

  const formattedPins = pins.map((pin) => normalizePin({ ...pin }));

  return establishCorrectDataFusionFormatInPins(formattedPins);
}

export async function saveSharedPinsToServer(pins) {
  const url = `${import.meta.env.VITE_CDSE_BACKEND}sharedpins`;
  const { data } = await axios.post(url, {
    items: pins.map(toServerPin),
  });

  return data.id;
}

export async function createShareLink(pins) {
  const sharedPinsListId = await saveSharedPinsToServer(pins);
  return `${import.meta.env.VITE_ROOT_URL}?sharedPinsListId=${sharedPinsListId}`;
}

export async function getSharedPins(sharedPinsListId) {
  const url = `${import.meta.env.VITE_CDSE_BACKEND}sharedpins/${sharedPinsListId}`;
  const { data } = await axios.get(url);
  return data;
}

const pinPropertiesSubset = (pin) => ({
  title: pin.title,
  themeId: pin.themeId,
  datasetId: pin.datasetId,
  layerId: pin.layerId,
  visualizationUrl: pin.visualizationUrl,
  lat: pin.lat,
  lng: pin.lng,
  zoom: pin.zoom,
  fromTime: pin.fromTime,
  toTime: pin.toTime,
  dateMode: pin.dateMode,
  evalscript: pin.evalscript,
  evalscriptUrl: pin.evalscriptUrl,
  processGraphUrl: pin.processGraphUrl,
  dataFusion: pin.dataFusion,
  dataFusionLegacy: pin.dataFusionLegacy,
  gain: pin.gain,
  gamma: pin.gamma,
  redRange: pin.redRange,
  greenRange: pin.greenRange,
  blueRange: pin.blueRange,
  description: pin.description,
  minQa: pin.minQa,
  mosaickingOrder: pin.mosaickingOrder,
  upsampling: pin.upsampling,
  downsampling: pin.downsampling,
  speckleFilter: pin.speckleFilter,
  orthorectification: pin.orthorectification,
  backscatterCoeff: pin.backscatterCoeff,
  demSource3D: pin.demSource3D,
  terrainViewerSettings: pin.terrainViewerSettings,
  processGraph: pin.processGraph,
  selectedProcessing: pin.selectedProcessing,
});

export function getPinsFromStorage(user) {
  return new Promise((resolve) => {
    if (user) {
      getPinsFromServer().then((pins) => resolve(pins));
    } else {
      const pinsFromLocalStorage = getPinsFromSessionStorage();
      resolve(pinsFromLocalStorage);
    }
  });
}

export async function importSharedPins(sharedPinsListId) {
  const isUserLoggedIn = isUserAuthenticated();
  const [existingPins] = await Promise.all([getPinsFromStorage(isUserLoggedIn)]);
  const sharedPins = await getSharedPins(sharedPinsListId);

  const N_PINS = sharedPins.items.length;
  if (
    !window.confirm(t`You are about to add ${N_PINS} pin(s) to your pin collection. Do you want to proceed?`)
  ) {
    return [];
  }

  store.dispatch(tabsSlice.actions.setTabIndex(TABS.VISUALIZE_TAB));

  //merge sharedPins with pins
  const newPins = [];
  sharedPins.items = establishCorrectDataFusionFormatInPins(sharedPins.items.map(normalizePin));
  sharedPins.items.forEach((sharedPin) => {
    //for each shared pin check if it already exists in existing pins list
    const existingPin = existingPins.find((pin) =>
      isEqual(pinPropertiesSubset(pin), pinPropertiesSubset(sharedPin)),
    );

    if (!existingPin) {
      newPins.push(sharedPin);
    }
  });
  //construct new list of pins and save it
  let result;
  if (newPins.length > 0) {
    const mergedPins = [...existingPins, ...newPins];

    if (isUserLoggedIn) {
      result = await savePinsToServer(mergedPins, true);
    } else {
      result = savePinsToSessionStorage(mergedPins, true);
    }
  }
  return result;
}

// Creates a sentinelhub-js Layer instance from the pin. Known limitation:
export async function layerFromPin(pin, reqConfig) {
  const { datasetId, layerId, evalscript, evalscriptUrl, dataFusion } = pin;

  const visualizationUrl = getVisualizationUrl(pin);

  const dsh = getDataSourceHandler(datasetId);
  const shJsDataset = dsh ? dsh.getSentinelHubDataset(datasetId) : null;
  const layers = await LayersFactory.makeLayers(
    visualizationUrl,
    (_, dataset) => (!shJsDataset ? true : dataset === shJsDataset),
    null,
    {
      ...reqConfig,
      cache: {
        expiresIn: 0,
      },
    },
  ).catch((err) => {
    console.error(err);
    return null;
  });
  if (!layers || layers.length === 0) {
    return null;
  }
  let layer;
  if (layerId) {
    layer = layers.find((l) => l.layerId === layerId);
    if (layer) {
      await layer.updateLayerFromServiceIfNeeded(reqConfig);
      if ((evalscript || evalscriptUrl) && Object.keys(dataFusion || {}).length === 0) {
        layer.evalscript = evalscript;
        layer.evalscriptUrl = evalscriptUrl;
      }
      if (dsh && dsh.supportsLowResolutionAlternativeCollection(datasetId)) {
        layer.lowResolutionCollectionId = dsh.getLowResolutionCollectionId(datasetId);
        layer.lowResolutionMetersPerPixelThreshold = dsh.getLowResolutionMetersPerPixelThreshold(datasetId);
      }
    } else if ((evalscript || evalscriptUrl) && Object.keys(dataFusion || {}).length === 0) {
      // layerId not found in WMS layers but a custom script is present — fall back to layers[0]
      // so the preview can still render using the custom evalscript.
      layer = layers[0];
      layer.evalscript = evalscript;
      layer.evalscriptUrl = evalscriptUrl;
    }
  } else {
    layer = layers[0];
    if (Object.keys(dataFusion || {}).length === 0) {
      layer.evalscript = evalscript;
      layer.evalscriptUrl = evalscriptUrl;
    }
  }
  return layer;
}

export const getVisualizationUrl = ({ visualizationUrl }) => {
  return visualizationUrl;
};

export const isOnEqualDate = (date1, date2) => {
  const date1Moment = moment.utc(date1);
  const date2Moment = moment.utc(date2);

  return date1Moment.isSame(date2Moment, 'day');
};

export const constructTimespanString = ({ fromTime, toTime } = {}) => {
  if (!toTime) {
    return null;
  }

  if (!fromTime || isOnEqualDate(fromTime, toTime)) {
    return moment.utc(toTime).format('YYYY-MM-DD');
  }

  return `${moment.utc(fromTime).format('YYYY-MM-DD')} - ${moment.utc(toTime).format('YYYY-MM-DD')}`;
};

export const constructCompareTimespanString = (comparedLayers = []) => {
  const fromTimes = comparedLayers
    .map((cl) => cl.fromTime)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));
  const toTimes = comparedLayers
    .map((cl) => cl.toTime)
    .filter(Boolean)
    .sort((a, b) => a.localeCompare(b));

  if (!toTimes.length) {
    return null;
  }

  const fromTime = fromTimes[0];
  const toTime = toTimes.at(-1);

  if (!fromTime || isOnEqualDate(fromTime, toTime)) {
    return moment.utc(toTime).format('YYYY-MM-DD');
  }

  return `${moment.utc(fromTime).format('YYYY-MM-DD')} / ${moment.utc(toTime).format('YYYY-MM-DD')}`;
};

export function normalizePin(pin) {
  const resolvedEvalscriptUrl = pin.evalscriptUrl ?? pin.evalscripturl;
  const resolvedProcessGraphUrl = pin.processGraphUrl ?? pin.processgraphurl;

  const result = {
    ...pin,
    evalscriptUrl: resolvedEvalscriptUrl,
    processGraphUrl: resolvedProcessGraphUrl,
  };

  // evalscript/evalscriptUrl and processGraph/processGraphUrl are mutually exclusive.
  // Priority: evalscriptUrl > processGraphUrl > evalscript (inline).
  // Delete the losing-mode fields so they are absent from the object entirely.
  // Remove legacy lowercase keys that were spread in from the original pin object.
  delete result.evalscripturl;
  delete result.processgraphurl;

  if (resolvedEvalscriptUrl) {
    delete result.processGraph;
    delete result.processGraphUrl;
  } else if (resolvedProcessGraphUrl) {
    delete result.evalscript;
    delete result.evalscriptUrl;
  } else if (pin.evalscript) {
    delete result.processGraph;
    delete result.processGraphUrl;
  }

  return result;
}

export function establishCorrectDataFusionFormatInPins(pins) {
  return pins.map((pin) => {
    if (pin.dataFusion !== undefined) {
      const dataFusionInCorrectFormat = ensureCorrectDataFusionFormat(pin.dataFusion, pin.datasetId);
      pin.dataFusion = dataFusionInCorrectFormat;
    }
    return pin;
  });
}

export function isPinValid(pin) {
  const { _id, gain, gamma, redRange, greenRange, blueRange } = pin;
  try {
    isEffectValueSetAndNotDefault(gain, defaultGain);
    isEffectValueSetAndNotDefault(gamma, defaultGamma);
    isEffectRangeSetAndNotDefault(redRange, defaultRange);
    isEffectRangeSetAndNotDefault(greenRange, defaultRange);
    isEffectRangeSetAndNotDefault(blueRange, defaultRange);
  } catch (err) {
    return { isValid: false, error: `Pin ${_id} is invalid: ` + err.message };
  }
  return { isValid: true, error: null };
}

export async function constructPinFromProps(props) {
  const {
    lat,
    lng,
    zoom,
    datasetId,
    layerId,
    visualizationUrl,
    fromTime,
    toTime,
    dateMode,
    evalscript,
    evalscriptUrl,
    customSelected,
    dataFusion,
    gainEffect,
    gammaEffect,
    redRangeEffect,
    greenRangeEffect,
    blueRangeEffect,
    minQa,
    mosaickingOrder,
    upsampling,
    downsampling,
    speckleFilter,
    orthorectification,
    backscatterCoeff,
    demSource3D,
    selectedThemeId,
    selectedThemesListId,
    themesLists,
    terrainViewerSettings,
    orbitDirection,
    cloudCoverage,
    selectedProcessing,
    processGraph,
    processGraphUrl,
  } = props;
  const themeName = getThemeName(themesLists[selectedThemesListId].find((t) => t.id === selectedThemeId));
  const layer = await getLayerFromParams(props);
  return {
    title: `${getDatasetLabel(datasetId)}: ${customSelected ? 'Custom' : layer.title} (${themeName})`,
    lat: lat,
    lng: lng,
    zoom: zoom,
    datasetId: datasetId,
    layerId: layerId,
    visualizationUrl: visualizationUrl,
    fromTime: fromTime.toISOString(),
    toTime: toTime.toISOString(),
    dateMode: dateMode,
    evalscript:
      selectedProcessing === PROCESSING_OPTIONS.PROCESS_API && evalscript && !evalscriptUrl && customSelected
        ? evalscript
        : '',
    // evalscriptUrl is saved regardless of selectedProcessing because normalizePin enforces
    // mutual exclusion downstream (it clears processGraph/processGraphUrl when evalscriptUrl
    // is present), so any stale process graph from a previous OpenEO session is safely discarded.
    evalscriptUrl: evalscriptUrl && customSelected ? evalscriptUrl : '',
    themeId: selectedThemeId,
    dataFusion: dataFusion,
    tag: VERSION_INFO.tag,
    gain: gainEffect,
    gamma: gammaEffect,
    redRange: redRangeEffect,
    greenRange: greenRangeEffect,
    blueRange: blueRangeEffect,
    minQa: minQa,
    mosaickingOrder: mosaickingOrder,
    upsampling: upsampling,
    downsampling: downsampling,
    speckleFilter: speckleFilter,
    orthorectification: orthorectification,
    backscatterCoeff: backscatterCoeff,
    demSource3D: demSource3D,
    terrainViewerSettings: terrainViewerSettings,
    orbitDirection: orbitDirection,
    cloudCoverage: cloudCoverage,
    selectedProcessing: selectedProcessing,
    processGraph:
      selectedProcessing === PROCESSING_OPTIONS.OPENEO && customSelected && !processGraphUrl
        ? processGraph
        : '',
    processGraphUrl:
      selectedProcessing === PROCESSING_OPTIONS.OPENEO && processGraphUrl && customSelected
        ? processGraphUrl
        : '',
  };
}

export function formatDeprecatedPins(pins) {
  return pins.map((pin) => {
    return {
      ...pin,
    };
  });
}
