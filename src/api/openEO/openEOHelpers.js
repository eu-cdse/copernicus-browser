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
  isVisualizationEffectsApplied = false,
  isCustomVisualization = false,
) {
  // enables switching between openEO and process api from developer tools
  if (!window.useOpenEO) {
    return false;
  }

  const hasRequiredParams = !!instanceUrl && !!layerId;
  const isSupportedImageFormat = SUPPORTED_IMAGE_FORMATS.includes(imageFormat);
  const isBlockedByState = isVisualizationEffectsApplied || isCustomVisualization;

  if (!hasRequiredParams || !isSupportedImageFormat || isBlockedByState) {
    return false;
  }

  return getProcessGraph(instanceUrl, layerId) !== undefined;
}

export function findNodeByProcessId(processGraph, processId) {
  return Object.keys(processGraph).find((key) => processGraph[key].process_id === processId);
}

export function getProcessGraphString(url, layerId, supportsOpenEO) {
  if (!supportsOpenEO) {
    return '';
  }
  const processGraph = getProcessGraph(url, layerId);
  return processGraph ? JSON.stringify(processGraph, null, '\t') : '';
}
