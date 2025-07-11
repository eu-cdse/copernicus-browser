import { IMAGE_FORMATS } from '../../Controls/ImgDownload/consts';

export const MIMETYPE_TO_OPENEO_FORMAT = {
  'image/png': 'png',
  'image/jpeg': 'jpg',
  'image/tiff': 'gtiff',
};

const PARTIAL_ROLL_OUT_CHANCE = 0.5;

const SUPPORTED_IMAGE_FORMATS = [IMAGE_FORMATS.JPG, IMAGE_FORMATS.PNG, IMAGE_FORMATS.TIFF_UINT8];

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

const randomNumber = Math.random(); // Simulate a random number for the example

console.log(
  `Random number generated: ${randomNumber},${
    randomNumber < PARTIAL_ROLL_OUT_CHANCE ? 'Will use openEO' : ' Will not proceed with OpenEO support check'
  }`,
); // For debugging purposes

export function isOpenEoSupported(
  instanceUrl,
  layerId,
  imageFormat = IMAGE_FORMATS.PNG,
  isVisualizationEffectsApplied = false,
) {
  if (randomNumber > PARTIAL_ROLL_OUT_CHANCE) {
    return false;
  }
  if (
    !instanceUrl ||
    !layerId ||
    !SUPPORTED_IMAGE_FORMATS.includes(imageFormat) ||
    isVisualizationEffectsApplied
  ) {
    return false;
  }
  const graph = getProcessGraph(instanceUrl, layerId);
  return graph !== undefined;
}

export function findNodeByProcessId(processGraph, processId) {
  return Object.keys(processGraph).find((key) => processGraph[key].process_id === processId);
}
