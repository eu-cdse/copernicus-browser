import { t } from 'ttag';
import round from 'lodash.round';
import moment from 'moment';
import request from 'axios';
import {
  DATASET_AWS_L8L1C,
  DATASET_MODIS,
  DATASET_S2L1C,
  DATASET_S2L2A,
  DATASET_S3OLCI,
  DATASET_S3SLSTR,
  DATASET_S5PL2,
  DATASET_AWSEU_S1GRD,
  DATASET_AWS_DEM,
  DATASET_AWS_LOTL1,
} from '@sentinel-hub/sentinelhub-js';

import { b64EncodeUnicode } from './base64MDN';
import { getDataSourceHandler } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { BAND_UNIT } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { TABS } from '../const';
import { ModalId } from '../const';
import { replaceDeprecatedDatasetWithNew } from './handleOldUrls';
import { rgbToHex } from '../junk/BandsToRGB/utils';
import store, { authSlice, notificationSlice } from '../store';

export function getUrlParams() {
  const urlParamString =
    window.location.search.length > 0 ? window.location.search : window.location.hash.substring(1);
  const searchParams = new URLSearchParams(urlParamString);
  return Object.fromEntries(searchParams.entries());
}

export function userCanAccessLockedFunctionality(user, selectedTheme) {
  if (selectedTheme && selectedTheme.type && selectedTheme.type === 'EDUCATION') {
    return true;
  }

  return !!user;
}

/*
  List of all supported URL parameters: (with exception of legacy EOB2 parameters)
  - themesUrl: URL of the JSON file which contains the themes definitions. If not
    specified, one of the included JSON files is used (either default_themes.js
    or education_themes.js, depending on themeId which must exist in one of them).
  - themeId: value of the id field in the theme definition
  - datasetId: id of the dataset that was chosen when searching. It is specified so
    that we know which layers to list in Visualization panel.
  - visualizationUrl: WMS URL from the selected theme (the information about the
    layerId is available through GetCapabilities request there)
  - layerId: id of the selected layer. If not set, "custom layer" is selected and
    either evalscript or evalscripturl parameters must be set.
  - zoom: zoom level
  - lat: latitude
  - lng: longitude
  - fromTime: date and time of the start of timespan, or null if toTime is a date
    or if layer doesn't support time dimension.
  - toTime: date and time of the end of timespan, or date if a single date is selected,
    or null if layer doesn't support time dimension.
  - evalscript: evalscript of the layer (if layerId and evalscripturl are not specified)
  - evalscripturl: evalscripturl of the layer (if layerId is not specified)
  - gain: gain effect
  - gamma: gamma effect
  - redRangeEffect: red range effect (slider)
  - greenRangeEffect: green range effect (slider)
  - blueRangeEffect: blue range effect (slider)
  - redCurveEffect: part of the advanced rgb effects / manipulation 
  - greenCurveEffect: part of the advanced rgb effects / manipulation
  - blueCurveEffect: part of the advanced rgb effects / manipulation
  - minQa: minQa (min quality) for Sentinel-5P
  - upsampling: upsampling (SH datasets only)
  - downsampling: downsampling (SH datasets only)
  - speckleFilter: speckle filter (Sentinel 1)
  - orthorectification: orthorectification (Sentinel 1 only)
  - backscatterCoeff: backscatterCoeff (Sentinel 1 only)
  - dataFusion: dataFusion settings
  - handlePositions: positions of pins in index feature.
  - gradient: gradient used to calculate color in index feature. 
 
*/

export function updatePath(props, shouldPushToHistoryStack = true) {
  let {
    currentZoom,
    currentLat,
    currentLng,
    fromTime,
    toTime,
    datasetId,
    visualizationUrl,
    layerId,
    evalscript,
    evalscripturl,
    customSelected,
    selectedThemeId,
    themesUrl,
    selectedTabIndex,
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
    demSource3D,
    backscatterCoeff,
    dataFusion,
    handlePositions,
    gradient,
    terrainViewerSettings,
    modalId,
    timelapse,
    orbitDirection,
    cloudCoverage,
    dateMode,
  } = props;
  currentLat = Math.round(100000 * currentLat) / 100000;
  currentLng = Math.round(100000 * currentLng) / 100000;

  let params = {
    zoom: currentZoom,
    lat: currentLat,
    lng: currentLng,
  };

  if (selectedThemeId) {
    params.themeId = selectedThemeId;
  }
  if (themesUrl) {
    params.themesUrl = themesUrl;
  }

  if (visualizationUrl) {
    params.visualizationUrl = visualizationUrl;
  }
  if (customSelected && evalscript && !evalscripturl) {
    params.evalscript = b64EncodeUnicode(evalscript);
  }
  if (customSelected && evalscripturl) {
    params.evalscripturl = evalscripturl;
  }
  if (datasetId) {
    params.datasetId = datasetId;
  }
  if (fromTime) {
    params.fromTime = fromTime.toISOString();
  }
  if (toTime) {
    params.toTime = toTime.toISOString();
  }
  if (layerId) {
    params.layerId = layerId;
  }

  if (selectedTabIndex === TABS.VISUALIZE_TAB) {
    // Visualize tab is selected

    if (handlePositions && customSelected && evalscript) {
      params.handlePositions = handlePositions;
    }

    if (gradient && customSelected && evalscript) {
      params.gradient = gradient;
    }

    if (gainEffect !== undefined && gainEffect !== 1) {
      params.gain = gainEffect;
    }
    if (gammaEffect !== undefined && gammaEffect !== 1) {
      params.gamma = gammaEffect;
    }
    if (redRangeEffect && !(redRangeEffect[0] === 0 && redRangeEffect[1] === 1)) {
      params.redRange = JSON.stringify(redRangeEffect);
    }
    if (greenRangeEffect && !(greenRangeEffect[0] === 0 && greenRangeEffect[1] === 1)) {
      params.greenRange = JSON.stringify(greenRangeEffect);
    }
    if (blueRangeEffect && !(blueRangeEffect[0] === 0 && blueRangeEffect[1] === 1)) {
      params.blueRange = JSON.stringify(blueRangeEffect);
    }

    if (redCurveEffect && redCurveEffect.points) {
      params.redCurve = JSON.stringify(redCurveEffect.points);
    }
    if (greenCurveEffect && greenCurveEffect.points) {
      params.greenCurve = JSON.stringify(greenCurveEffect.points);
    }
    if (blueCurveEffect && blueCurveEffect.points) {
      params.blueCurve = JSON.stringify(blueCurveEffect.points);
    }

    if (minQa !== undefined) {
      params.minQa = minQa;
    }
    if (mosaickingOrder !== undefined) {
      params.mosaickingOrder = mosaickingOrder;
    }
    if (upsampling !== undefined) {
      params.upsampling = upsampling;
    }
    if (downsampling !== undefined) {
      params.downsampling = downsampling;
    }
    if (speckleFilter !== undefined) {
      params.speckleFilter = JSON.stringify(speckleFilter);
    }
    if (orthorectification !== undefined) {
      params.orthorectification = JSON.stringify(orthorectification);
    }
    if (demSource3D !== undefined) {
      params.demSource3D = JSON.stringify(demSource3D);
    }
    if (backscatterCoeff !== undefined) {
      params.backscatterCoeff = JSON.stringify(backscatterCoeff);
    }
    if (isDataFusionEnabled(dataFusion)) {
      params.dataFusion = JSON.stringify(dataFusion);
    }
    if (terrainViewerSettings !== null) {
      params.terrainViewerSettings = JSON.stringify(terrainViewerSettings);
    }
    if (orbitDirection) {
      params.orbitDirection = JSON.stringify(orbitDirection);
    }
    if (cloudCoverage !== undefined) {
      params.cloudCoverage = cloudCoverage;
    }

    if (dateMode !== undefined) {
      params.dateMode = dateMode;
    }
  }

  if (modalId === ModalId.TIMELAPSE) {
    params.timelapse = JSON.stringify(timelapse);
  }

  const escapedParams = Object.keys(params)
    .map((k) => `${k}=${encodeURIComponent(params[k])}`)
    .join('&');

  const newUrl =
    window.location.origin + window.location.pathname + '?' + escapedParams + window.location.hash;

  shouldPushToHistoryStack
    ? window.history.pushState({}, '', newUrl)
    : window.history.replaceState({}, '', newUrl);
}
// eslint-disable-next-line
function hexToRgb(hex) {
  var bigint = parseInt(hex, 16);
  var r = (bigint >> 16) & 255;
  var g = (bigint >> 8) & 255;
  var b = bigint & 255;

  return `[${round(r / 255, 2)},${round(g / 255, 2)},${round(b / 255, 2)}]`;
}

export function constructV3Evalscript(bands, config, bandsWithUnits) {
  // custom config formula used in index feature
  if (config) {
    const { equation, colorRamp, values } = config;
    const indexEquation = [...equation]
      .map((item) => (item === 'B' && `samples.${bands.b}`) || (item === 'A' && `samples.${bands.a}`) || item)
      .join('');
    // temp fix with index instead of actual positions, to be removed in next commit
    return `//VERSION=3
const colorRamp = [${colorRamp.map((color, index) => `[${values[index]},${color.replace('#', '0x')}]`)}]

let viz = new ColorRampVisualizer(colorRamp);

function setup() {
  return {
    input: ["${[...new Set(Object.values(bands))].join('","')}", "dataMask"],
    output: [
      { id:"default", bands: 4 },
      { id: "index", bands: 1, sampleType: 'FLOAT32' }
    ]
  };
}

function evaluatePixel(samples) {
  let index = ${indexEquation};
  const minIndex = ${values[0]};
  const maxIndex = ${values[values.length - 1]};
  let visVal = null;

  if(index > maxIndex || index < minIndex) {
    visVal = [0, 0, 0, 0];
  }
  else {
    visVal = [...viz.process(index),samples.dataMask];
  }

  // The library for tiffs only works well if there is one channel returned.
  // So here we encode "no data" as NaN and ignore NaNs on the frontend.  
  const indexVal = samples.dataMask === 1 ? index : NaN;

  return { default: visVal, index: [indexVal] };
}`;
  }

  const bandsContainKelvin = Object.values(bands).some((band) => bandUnitIsKelvin(band, bandsWithUnits));

  // If no configuration is passed a default evalscript gets generated
  // NOTE: changing the format will likely break parseEvalscriptBands method.
  return `//VERSION=3
function setup() {
  return {
    input: ["${[...new Set(Object.values(bands))].join('","')}", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  ${bandsContainKelvin ? `const visualizer = new HighlightCompressVisualizer(200, 375);` : ``}
  return [${Object.values(bands)
    .map((band) =>
      bandUnitIsKelvin(band, bandsWithUnits) ? `visualizer.process(sample.${band})` : `2.5 * sample.${band}`,
    )
    .join(', ')}, sample.dataMask];
}`;
}

function bandUnitIsKelvin(band, bandsWithUnits) {
  if (!bandsWithUnits) {
    return false;
  }

  let bandWithUnits = bandsWithUnits.find((b) => b.name === band);
  return bandWithUnits.unit === BAND_UNIT.KELVIN;
}

export function constructBasicEvalscript(bands, config, bandsWithUnits) {
  // custom config used for index feature
  if (config) {
    const { equation, colorRamp, values } = config;

    const indexEquation = [...equation]
      .map((item) => (item === 'B' && `${bands.b}`) || (item === 'A' && `${bands.a}`) || item)
      .join('');

    return `var index = ${indexEquation};
return colorBlend(
  index,
    [${values.map((value) => value)}],
    [${colorRamp.map((color) => hexToRgb(color.replace('#', '0x')))}]
);`;
  }
  // NOTE: changing the format will likely break parseEvalscriptBands method.
  return `return [${Object.values(bands)
    .map((band) => (bandUnitIsKelvin(band, bandsWithUnits) ? '' : '2.5*') + band)
    .join(',')}];`;
}

export function parseEvalscriptBands(evalscript) {
  try {
    if (evalscript.startsWith('//VERSION=3')) {
      return evalscript
        .split('\n')[10]
        .split('[')[1]
        .split(']')[0]
        .split(',')
        .map((b) =>
          b.replace('2.5 * sample.', '').replace('visualizer.process(sample.', '').replace(')', '').trim(),
        )
        .map((b) => b.replace('factor * sample.', ''))
        .map((b) => b.replace('sample.CLC === ', ''))
        .slice(0, -1);
    }
    return evalscript
      .split('[')[1]
      .split(']')[0]
      .split(',')
      .map((b) => b.replace('2.5*', ''));
  } catch (e) {
    return [];
  }
}

export function parseIndexEvalscript(evalscript) {
  try {
    if (evalscript.startsWith('//VERSION=3')) {
      let equation = '';
      let bands = evalscript
        .split('\n')[16]
        .split('=')[1]
        .split('/')
        .map((item) => item.replace('(', '').replace(')', '').replace(' ', ''));

      if (bands[0].indexOf('-') !== -1) {
        equation = '(A-B)/(A+B)';
        bands = bands[0].split('-').map((item) => item.replace('samples.', '').replace(';', ''));
      } else {
        equation = '(A/B)';
        bands = bands.map((item) => item.replace('samples.', '').replace(';', ''));
      }

      bands = { a: bands[0], b: bands[1] };

      // positions and coresponding color
      let values = evalscript
        .split('\n')[1]
        .split('=')[1]
        .split(',')
        .map((item) => item.replace(/\[/g, '').replace(/]/g, '').replace(' ', ''));

      let colors = values.filter((item) => item.indexOf('0x') !== -1).map((item) => item.replace('0x', '#'));
      let positions = values.filter((item) => item.indexOf('0x') === -1).map((item) => parseFloat(item));

      return {
        bands: bands,
        equation: equation,
        positions: positions,
        colors: colors,
      };
    } else {
      const bands = evalscript
        .split('\n')[0]
        .replace('var index = ', '')
        .replace(/[\W_]+/g, ',')
        .split(',')
        .filter((b) => b !== '')
        .slice(0, 2);
      const equation = evalscript
        .split('\n')[0]
        .replace('var index = ', '')
        .split(bands[0])
        .join('A')
        .split(bands[1])
        .join('B')
        .replace(';', '');
      const positions = JSON.parse(evalscript.split('\n')[3].slice(0, -1));
      const colors = JSON.parse(evalscript.split('\n')[4]).map((rgb) =>
        rgbToHex(rgb.map((c) => Math.ceil(255 * c))),
      );
      return {
        bands: { a: bands[0], b: bands[1] },
        equation: equation,
        positions: positions,
        colors: colors,
      };
    }
  } catch (e) {
    return null;
  }
}

export function parsePosition(lat, lng, zoom) {
  zoom = isNaN(parseInt(zoom)) ? undefined : parseInt(zoom);
  lat = isNaN(parseFloat(lat)) ? undefined : parseFloat(lat);
  lng = isNaN(parseFloat(lng)) ? undefined : parseFloat(lng);
  return { lat, lng, zoom };
}

export function isDataFusionEnabled(dataFusionOptions) {
  return Boolean(dataFusionOptions && dataFusionOptions.length > 0);
}

const quotaErrorCodes = ['ACCESS_INSUFFICIENT_PROCESSING_UNITS', 'ACCESS_INSUFFICIENT_REQUESTS'];

export const QUOTA_ERROR_MESSAGE = {
  message: t`You have used your monthly processing units or requests quota. You may still use the browser as an anonymous user.`,
  logout: true,
  link: 'https://shapps.dataspace.copernicus.eu/dashboard/',
};

export async function constructErrorMessage(error) {
  const panelError = await constructPanelError(error);
  return panelError.message;
}

export function isQuotaError({ status, code }) {
  return status === 403 && quotaErrorCodes.includes(code);
}

export async function constructPanelError(error) {
  const DEFAULT_ERROR = JSON.stringify(error);
  if (error.response && error.response.data) {
    let errorObj;

    if (error.response.data instanceof Blob) {
      const errorJson = await readBlob(error.response.data);
      errorObj = errorJson?.error;
      if (!errorObj) {
        return { message: DEFAULT_ERROR };
      }
    } else {
      errorObj = error.response.data.error;
    }

    let errorMsg = '';
    if (errorObj?.errors) {
      for (let err of errorObj.errors) {
        for (let key in err) {
          errorMsg += `${key}:\n${JSON.stringify(err[key])}\n\n`;
        }
      }
    } else if (isQuotaError({ status: errorObj.status, code: errorObj.code })) {
      return QUOTA_ERROR_MESSAGE;
    } else {
      errorMsg = errorObj?.message || error.message;
    }
    return { message: errorMsg };
  } else {
    return { message: error.message ? error.message : DEFAULT_ERROR };
  }
}

export function readBlob(blob) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = function (e) {
      try {
        const json = JSON.parse(e.target.result);
        resolve(json);
      } catch (err) {
        reject({});
      }
    };

    reader.readAsText(blob);
  });
}

export function parseDataFusion(dataFusionString, datasetId) {
  const dataFusion = ensureCorrectDataFusionFormat(JSON.parse(dataFusionString), datasetId);
  return replaceDeprecatedDatasetWithNew(dataFusion, {
    oldDataset: DATASET_AWS_L8L1C,
    newDataset: DATASET_AWS_LOTL1,
  });
}

export function ensureCorrectDataFusionFormat(dataFusion, datasetId) {
  try {
    if (Array.isArray(dataFusion)) {
      for (let dataset of dataFusion) {
        if (dataset.timespan) {
          const [fromTime, toTime] = dataset.timespan;
          const parsedTimespan = [moment.utc(fromTime), moment.utc(toTime)];
          dataset.timespan = parsedTimespan;
        }
      }
      return dataFusion;
    } else if (dataFusion && dataFusion.constructor.name === 'Object') {
      /*
      Converts legacy data fusion format to the new format
    */
      const dataFusionInNewFormat = [];

      if (Object.keys(dataFusion).length === 0) {
        return dataFusionInNewFormat;
      }

      const shDataset = getDataSourceHandler(datasetId).getSentinelHubDataset(datasetId);
      const primaryLayerAlias =
        dataFusion.primaryLayerAlias || shDataset.shProcessingApiDatasourceAbbreviation;

      dataFusionInNewFormat.push({
        id: shDataset.id,
        alias: primaryLayerAlias,
      });

      for (let [id, settings] of Object.entries(dataFusion.supplementalDatasets)) {
        const dataset = shJSdatasetIdToDataset(id);
        dataFusionInNewFormat.push({
          id: id,
          alias: settings.alias || dataset.shProcessingApiDatasourceAbbreviation,
          mosaickingOrder: settings.mosaickingOrder,
          timespan: settings.timespan
            ? [moment.utc(settings.timespan[0]), moment.utc(settings.timespan[1])]
            : undefined,
        });
      }
      return dataFusionInNewFormat;
    } else {
      return [];
    }
  } catch (err) {
    console.error(err);
    return [];
  }
}

const shJSdatasetIdToDataset = (datasetId) => {
  switch (datasetId) {
    case DATASET_S2L1C.id:
      return DATASET_S2L1C;
    case DATASET_S2L2A.id:
      return DATASET_S2L2A;
    case DATASET_S3OLCI.id:
      return DATASET_S3OLCI;
    case DATASET_S3SLSTR.id:
      return DATASET_S3SLSTR;
    case DATASET_AWSEU_S1GRD.id:
      return DATASET_AWSEU_S1GRD;
    case DATASET_AWS_L8L1C.id:
      return DATASET_AWS_L8L1C;
    case DATASET_S5PL2.id:
      return DATASET_S5PL2;
    case DATASET_MODIS.id:
      return DATASET_MODIS;
    case DATASET_AWS_DEM.id:
      return DATASET_AWS_DEM;
    default:
      return null;
  }
};

export function isFunction(functionToCheck) {
  return typeof functionToCheck === 'function';
}

export function getThemeName(theme) {
  if (!(theme && theme.name)) {
    return null;
  }
  return isFunction(theme.name) ? theme.name() : theme.name;
}

export async function fetchEvalscriptFromEvalscripturl(evalscripturl) {
  return request.get(evalscripturl);
}

/*
display 401 error message in floating panel, other messages should be 
handled by provided handleErrorMessage function. 

error: error object
defaultErrorMessage: string - message that can be used when we don't want to display whatever is in error.message
handleErrorMessage - (msg) => {} - a function for handling non 401 messages. By default those messages are displayed in visualization panel 
*/
export async function handleError(
  error,
  defaultErrorMessage = null,
  handleErrorMessage = (panelError) =>
    store.dispatch(notificationSlice.actions.displayPanelError(panelError)),
) {
  if (error?.response?.status === 401) {
    store.dispatch(authSlice.actions.setUserAuthError(t`Your authentication has expired`));
  } else if (isQuotaError(error)) {
    store.dispatch(notificationSlice.actions.displayPanelError(QUOTA_ERROR_MESSAGE));
  } else {
    const panelError = defaultErrorMessage
      ? { message: defaultErrorMessage }
      : await constructPanelError(error);

    if (handleErrorMessage && isFunction(handleErrorMessage)) {
      handleErrorMessage(panelError);
    } else {
      console.error(panelError);
    }
  }
}

export const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
