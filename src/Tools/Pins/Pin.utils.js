import axios from 'axios';
import { v4 as uuid } from 'uuid';
import moment from 'moment';
import isEqual from 'lodash.isequal';
import { t } from 'ttag';
import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

import store, { pinsSlice, tabsSlice } from '../../store';
import { DEFAULT_THEMES } from '../../assets/default_themes.js';
import { VERSION_INFO } from '../../VERSION';
import { b64DecodeUnicode } from '../../utils/base64MDN';
import { getUserTokenFromLocalStorage } from '../../Auth/authHelpers';
import { getDataSourceHandler, getDatasetLabel } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';

import {
  datasourceToDatasetId,
  dataSourceToThemeId,
  datasourceToUrl,
  getNewDatasetPropertiesIfDeprecatedDatasetId,
} from '../../utils/handleOldUrls';
import { ensureCorrectDataFusionFormat, getThemeName } from '../../utils';
import {
  defaultGain,
  defaultGamma,
  defaultRange,
  isEffectValueSetAndNotDefault,
  isEffectRangeSetAndNotDefault,
} from '../../utils/effectsUtils';
import { getLayerFromParams } from '../../Controls/ImgDownload/ImageDownload.utils';
import { DEFAULT_THEME_ID, TABS } from '../../const';
import { SAVED_PINS, UNSAVED_PINS } from './PinPanel';
import {
  S3OLCI,
  S3SLSTR,
  S5_AER_AI,
  S5_CH4,
  S5_CLOUD,
  S5_CO,
  S5_HCHO,
  S5_NO2,
  S5_O3,
  S5_OTHER,
  S5_SO2,
} from '../SearchPanel/dataSourceHandlers/dataSourceConstants';

const PINS_LC_NAME = 'eob-pins';

const SH_SERVICE_HOSTNAMES_V3 = {
  SERVICES: 'https://services.sentinel-hub.com/',
  CREODIAS: 'https://creodias.sentinel-hub.com/',
};

// check if the pin was already converted by this version of EOB3
const needsConversion = (pin) => {
  if (!pin.tag || pin.tag === '') {
    return true;
  }
  return pin.tag !== VERSION_INFO.tag;
};

const convertDataSource = (pin, newPin) => {
  const { datasource } = pin;
  if (datasource) {
    const datasetId = datasourceToDatasetId[datasource];
    const themeId = dataSourceToThemeId[datasource] ? dataSourceToThemeId[datasource] : DEFAULT_THEME_ID;
    const visualizationUrl = datasourceToUrl[datasource];
    newPin.datasetId = datasetId;
    newPin.themeId = themeId;
    newPin.visualizationUrl = visualizationUrl;
  }
  return newPin;
};

const convertPreset = (pin, newPin) => {
  const { preset } = pin;
  if (preset) {
    newPin.layerId = preset;
  }
  return newPin;
};

const convertActiveLayer = (pin, newPin) => {
  const { activeLayer } = pin;
  if (activeLayer) {
    const visualizationUrl = pin.activeLayer.baseUrls.WMS;
    const theme = DEFAULT_THEMES.find((t) => t.content.map((d) => d.url).includes(visualizationUrl));
    newPin.datasetId = activeLayer.shortName ? activeLayer.shortName : activeLayer.id;
    newPin.themeId = theme ? theme.id : DEFAULT_THEMES[0].id;
    newPin.visualizationUrl = visualizationUrl;
  }
  return newPin;
};

const addTag = (newPin) => {
  newPin.tag = VERSION_INFO.tag;
  return newPin;
};

const convertTitle = (pin, newPin) => {
  const { pinTitle, datasource, preset } = pin;
  if (pinTitle) {
    newPin.title = pinTitle;
  } else if (!newPin.title) {
    newPin.title = `${datasource} ${preset}`;
  }
  return newPin;
};

const convertEvalscript = (pin, newPin) => {
  const { evalscript, time, preset } = pin;
  // We should only decode pins which have encoded evalscripts. Those are EOB2 pins and have to be identified with their distinct attributes.
  const isEOB2Pin = time && preset;
  if (!newPin.layerId && !newPin.evalscripturl && isEOB2Pin && evalscript && evalscript !== '') {
    newPin.evalscript = b64DecodeUnicode(evalscript);
  }
  return newPin;
};

const convertTime = (pin, newPin) => {
  const { time } = pin;

  if (time) {
    const times = time.split('/');
    if (times.length === 2) {
      newPin.fromTime = times[0];
      newPin.toTime = times[1];
    } else {
      newPin.fromTime = moment.utc(times[0]).startOf('day').toISOString();
      newPin.toTime = moment.utc(times[0]).endOf('day').toISOString();
    }
  }
  return newPin;
};

const convertEffects = (pin, newPin) => {
  const { gainOverride, gammaOverride, redRangeOverride, greenRangeOverride, blueRangeOverride } = pin;
  const { gain, gamma, redRange, greenRange, blueRange } = pin;
  const {
    downsampling,
    mosaickingOrder,
    upsampling,
    speckleFilter,
    orthorectification,
    backscatterCoeff,
    demSource3D,
  } = pin;
  if (
    isEffectValueSetAndNotDefault(gainOverride, defaultGain) &&
    !isEffectValueSetAndNotDefault(gain, defaultGain)
  ) {
    newPin.gain = gainOverride;
  }
  if (
    isEffectValueSetAndNotDefault(gammaOverride, defaultGamma) &&
    !isEffectValueSetAndNotDefault(gamma, defaultGamma)
  ) {
    newPin.gamma = gammaOverride;
  }
  if (
    isEffectRangeSetAndNotDefault(redRangeOverride, defaultRange) &&
    isEffectRangeSetAndNotDefault(redRange, defaultRange)
  ) {
    newPin.redRange = redRangeOverride;
  }
  if (
    isEffectRangeSetAndNotDefault(greenRangeOverride, defaultRange) &&
    isEffectRangeSetAndNotDefault(greenRange, defaultRange)
  ) {
    newPin.greenRange = greenRangeOverride;
  }
  if (
    isEffectRangeSetAndNotDefault(blueRangeOverride, defaultRange) &&
    isEffectRangeSetAndNotDefault(blueRange, defaultRange)
  ) {
    newPin.blueRange = blueRangeOverride;
  }

  if (mosaickingOrder) {
    newPin.mosaickingOrder = mosaickingOrder;
  }

  if (!!upsampling) {
    newPin.upsampling = upsampling;
  }

  if (!!downsampling) {
    newPin.downsampling = downsampling;
  }

  if (speckleFilter) {
    newPin.speckleFilter = speckleFilter;
  }

  if (orthorectification) {
    newPin.orthorectification = orthorectification;
  }

  if (backscatterCoeff) {
    newPin.backscatterCoeff = backscatterCoeff;
  }

  if (demSource3D) {
    newPin.demSource3D = demSource3D;
  }

  return newPin;
};

export function convertToNewFormat(pin) {
  if (needsConversion(pin)) {
    const {
      _id,
      lng,
      lat,
      zoom,
      fromTime,
      toTime,
      dateMode,
      title,
      visualizationUrl,
      themeId,
      datasetId,
      layerId,
      evalscript,
      evalscripturl,
      dataFusion,
      description,
      gain,
      gamma,
      redRange,
      greenRange,
      blueRange,
      redCurve,
      greenCurve,
      blueCurve,
      minQa,
      mosaickingOrder,
      upsampling,
      downsampling,
      speckleFilter,
      orthorectification,
      backscatterCoeff,
      orbitDirection,
      demSource3D,
      terrainViewerSettings,
      cloudCoverage,
    } = pin;
    let newPin = {
      _id: _id,
      lng: lng,
      lat: lat,
      zoom: zoom,
      fromTime: fromTime,
      toTime: toTime,
      dateMode: dateMode,
      title: title,
      visualizationUrl: visualizationUrl,
      themeId: themeId,
      datasetId: datasetId,
      layerId: layerId,
      evalscript: evalscript,
      evalscripturl: evalscripturl,
      dataFusion: dataFusion,
      description: description,
      gain: gain,
      gamma: gamma,
      redRange: redRange,
      greenRange: greenRange,
      blueRange: blueRange,
      redCurve: redCurve,
      greenCurve: greenCurve,
      blueCurve: blueCurve,
      minQa: minQa,
      mosaickingOrder: mosaickingOrder,
      upsampling: upsampling,
      downsampling: downsampling,
      speckleFilter: speckleFilter,
      orthorectification: orthorectification,
      backscatterCoeff: backscatterCoeff,
      orbitDirection: orbitDirection,
      demSource3D: demSource3D,
      terrainViewerSettings: terrainViewerSettings,
      cloudCoverage: cloudCoverage,
    };
    // convert pin data
    newPin = convertTitle(pin, newPin);
    newPin = convertTime(pin, newPin);
    newPin = convertActiveLayer(pin, newPin);
    newPin = convertDataSource(pin, newPin);
    newPin = convertPreset(pin, newPin);
    newPin = convertEvalscript(pin, newPin);
    newPin = convertEffects(pin, newPin);
    // tag pin so we know that data was converted by this version of EOB3
    newPin = addTag(newPin);
    return newPin;
  }
  return pin;
}

async function getPinsFromBackend(access_token) {
  const url = `${process.env.REACT_APP_EOB_BACKEND}userpins`;
  const requestParams = {
    responseType: 'json',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };
  const res = await axios.get(url, requestParams);
  return establishCorrectDataFusionFormatInPins(res.data);
}

export async function getPinsFromServer() {
  const access_token = store.getState().auth.user.access_token;
  return await getPinsFromBackend(access_token);
}

async function removePinsFromBackend(ids) {
  const access_token = store.getState().auth.user.access_token;
  const url = `${process.env.REACT_APP_EOB_BACKEND}userpins`;
  const requestParams = {
    responseType: 'json',
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  };
  let userPins = await getPinsFromServer();
  userPins = userPins.filter((p) => !ids.includes(p._id));
  await axios.put(url, { items: userPins }, requestParams);
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

  const url = `${process.env.REACT_APP_EOB_BACKEND}userpins`;
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
    await axios.put(url, { items: newPins }, requestParams);
    return { uniqueId: lastUniqueId, pins: newPins };
  } catch (err) {
    console.error('Unable to save pins!', err);
    throw err;
  }
}

export async function savePinsToServer(pins, replace = false) {
  const response = await savePinsToBackend(pins, replace);

  store.dispatch(pinsSlice.actions.updatePinsByType({ pins: response.pins, pinType: SAVED_PINS }));

  return response;
}

export function savePinsToSessionStorage(newPins, replace = false) {
  let lastUniqueId;
  newPins = newPins.map((p) => {
    if (!p._id) {
      const uniqueId = `${uuid()}-pin`;
      p._id = uniqueId;
    }
    lastUniqueId = p._id;
    return p;
  });
  let pins = sessionStorage.getItem(PINS_LC_NAME);
  if (!pins) {
    pins = [];
  } else {
    pins = JSON.parse(pins);
  }
  if (!replace) {
    pins = [...newPins, ...pins];
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

  const formattedPins = pins.map((pin) => {
    return {
      ...pin,
      ...getNewDatasetPropertiesIfDeprecatedDatasetId(pin.datasetId, pin.visualizationUrl),
    };
  });

  return establishCorrectDataFusionFormatInPins(formattedPins);
}

export async function saveSharedPinsToServer(pins) {
  const url = `${process.env.REACT_APP_EOB_BACKEND}sharedpins`;
  const { data } = await axios.post(url, {
    items: pins,
  });

  return data.id;
}

export async function createShareLink(pins) {
  const sharedPinsListId = await saveSharedPinsToServer(pins);
  return `${process.env.REACT_APP_ROOT_URL}?sharedPinsListId=${sharedPinsListId}`;
}

export async function getSharedPins(sharedPinsListId) {
  const url = `${process.env.REACT_APP_EOB_BACKEND}sharedpins/${sharedPinsListId}`;
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
  evalscripturl: pin.evalscripturl,
  dataFusion: pin.dataFusion,
  dataFusionLegacy: pin.dataFusionLegacy,
  gain: pin.gain,
  gamma: pin.gamma,
  redRange: pin.redRange,
  greenRange: pin.greenRange,
  blueRange: pin.blueRange,
  redCurve: pin.redCurve,
  greenCurve: pin.greenCurve,
  blueCurve: pin.blueCurve,
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
});

export function getPinsFromStorage(user) {
  return new Promise((resolve, reject) => {
    if (user) {
      getPinsFromServer().then((pins) => resolve(pins));
    } else {
      const pinsFromLocalStorage = getPinsFromSessionStorage();
      resolve(pinsFromLocalStorage);
    }
  });
}

export async function importSharedPins(sharedPinsListId) {
  const isUserLoggedIn = await getUserTokenFromLocalStorage();
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
  sharedPins.itmes = establishCorrectDataFusionFormatInPins(sharedPins.items);
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
  const { datasetId, layerId, evalscript, evalscripturl, dataFusion } = pin;

  const visualizationUrl = getVisualizationUrl(pin);

  const dsh = getDataSourceHandler(datasetId);
  const shJsDataset = dsh ? dsh.getSentinelHubDataset(datasetId) : null;
  const layers = await LayersFactory.makeLayers(
    visualizationUrl,
    (_, dataset) => (!shJsDataset ? true : dataset === shJsDataset),
    null,
    reqConfig,
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
    }
  } else {
    layer = layers[0];
    if (Object.keys(dataFusion).length === 0) {
      layer.evalscript = evalscript;
      layer.evalscriptUrl = evalscripturl;
    }
  }
  return layer;
}

export const getVisualizationUrl = ({ visualizationUrl, datasetId }) => {
  // historically some S3 and S5P datasets were configured with 'services' hostnames. we're trying to fix this here now
  if (isS3orS5(datasetId)) {
    return visualizationUrl.replace(SH_SERVICE_HOSTNAMES_V3.SERVICES, SH_SERVICE_HOSTNAMES_V3.CREODIAS);
  }
  return visualizationUrl;
};

export const isS3orS5 = (datasetId) => {
  return [
    S5_O3,
    S5_NO2,
    S5_SO2,
    S5_CO,
    S5_HCHO,
    S5_CH4,
    S5_AER_AI,
    S5_CLOUD,
    S5_OTHER,
    S3OLCI,
    S3SLSTR,
  ].includes(datasetId);
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
    evalscripturl,
    customSelected,
    dataFusion,
    gainEffect,
    gammaEffect,
    redRangeEffect,
    greenRangeEffect,
    blueRangeEffect,
    redCurveEffect,
    greenCurveEffect,
    blueCurveEffect,
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
  } = props;
  const isGIBS = !fromTime; //GIBS only has toTime
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
    fromTime: isGIBS ? null : fromTime.toISOString(),
    toTime: toTime.toISOString(),
    dateMode: dateMode,
    evalscript: evalscript && !evalscripturl && customSelected ? evalscript : '',
    evalscripturl: evalscripturl && customSelected ? evalscripturl : '',
    themeId: selectedThemeId,
    dataFusion: dataFusion,
    tag: VERSION_INFO.tag,
    gain: gainEffect,
    gamma: gammaEffect,
    redRange: redRangeEffect,
    greenRange: greenRangeEffect,
    blueRange: blueRangeEffect,
    redCurve: redCurveEffect ? redCurveEffect.points : undefined,
    greenCurve: greenCurveEffect ? greenCurveEffect.points : undefined,
    blueCurve: blueCurveEffect ? blueCurveEffect.points : undefined,
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
  };
}

export function formatDeprecatedPins(pins) {
  return pins.map((pin) => {
    return {
      ...pin,
      ...getNewDatasetPropertiesIfDeprecatedDatasetId(pin.datasetId, pin.visualizationUrl),
    };
  });
}
