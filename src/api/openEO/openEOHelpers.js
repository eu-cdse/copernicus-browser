import { IMAGE_FORMATS } from '../../Controls/ImgDownload/consts';

export const MIMETYPE_TO_OPENEO_FORMAT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/tiff': 'gtiff',
};

export const OPENEO_VALID_FORMATS = ['png', 'jpg'];

export const OPENEO_DOWNLOADABLE_FORMATS = ['geotiff', 'gtiff'];

window.useOpenEO = true;

const SUPPORTED_IMAGE_FORMATS = [IMAGE_FORMATS.JPG, IMAGE_FORMATS.PNG, IMAGE_FORMATS.TIFF_FLOAT32];

export function getProcessGraph(instanceUrl, layerId) {
  if (!instanceUrl || !layerId) {
    return undefined;
  }
  const instanceId = instanceUrl.split('/').pop();

  const files = import.meta.glob('../../assets/cache/processGraphs/*.json', { eager: true });
  const texts = files[`../../assets/cache/processGraphs/${instanceId}.json`];
  const graphs = texts?.default || {};
  return graphs[layerId];
}

export function isOpenEoSupported(
  instanceUrl,
  layerId,
  imageFormat = IMAGE_FORMATS.PNG,
  isCustomVisualization = false,
) {
  // enables switching between openEO and process api from developer tools
  if (!window.useOpenEO) {
    return false;
  }

  const hasRequiredParams = !!instanceUrl && !!layerId;
  const isSupportedImageFormat = SUPPORTED_IMAGE_FORMATS.includes(imageFormat);
  const isBlockedByState = isCustomVisualization;

  if (!hasRequiredParams || !isSupportedImageFormat || isBlockedByState) {
    return false;
  }

  return getProcessGraph(instanceUrl, layerId) !== undefined;
}

export function findNodeByProcessId(processGraph, processId) {
  return Object.keys(processGraph).find((key) => processGraph[key].process_id === processId);
}

export function getOpenEOS1Options({
  isS1,
  datasetParams,
  orbitDirection,
  speckleFilter,
  orthorectification,
  backscatterCoeff,
  acquisitionMode,
  polarization,
  resolution,
} = {}) {
  if (!isS1) {
    return {};
  }
  const s1Options = {
    ...(datasetParams ?? {}),
    orbitDirection,
    speckleFilter,
    orthorectification,
    backscatterCoeff,
  };
  if (acquisitionMode !== undefined) {
    s1Options.acquisitionMode = acquisitionMode;
  }
  if (polarization !== undefined) {
    s1Options.polarization = polarization;
  }
  if (resolution !== undefined) {
    s1Options.resolution = resolution;
  }
  return s1Options;
}

export function getProcessGraphString(url, layerId, supportsOpenEO) {
  if (!supportsOpenEO) {
    return '';
  }
  const processGraph = getProcessGraph(url, layerId);
  return processGraph ? JSON.stringify(processGraph, null, '\t') : '';
}
