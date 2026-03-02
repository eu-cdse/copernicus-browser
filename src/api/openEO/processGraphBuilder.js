import { findNodeByProcessId } from './openEOHelpers';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { DATASET_BYOC } from '@sentinel-hub/sentinelhub-js';

function resolveCollectionId(options) {
  if (options.id) {
    return options.id;
  }

  if (!options.datasetId) {
    return undefined;
  }

  const dataSourceHandler = getDataSourceHandler(options.datasetId);
  if (!dataSourceHandler) {
    return undefined;
  }

  const shDataset = dataSourceHandler.getSentinelHubDataset?.(options.datasetId);
  let collectionId =
    shDataset?.catalogCollectionId ||
    dataSourceHandler.getCollectionByDatasetId?.(options.datasetId) ||
    undefined;

  if (collectionId && shDataset?.id === DATASET_BYOC.id && !collectionId.startsWith('byoc-')) {
    collectionId = `byoc-${collectionId}`;
  }

  return collectionId;
}

function loadCollection(processGraph, options) {
  let copyProcessGraph = JSON.parse(JSON.stringify(processGraph));
  const loadCollectionNode = findNodeByProcessId(copyProcessGraph, 'load_collection');
  const resolvedCollectionId = resolveCollectionId(options);

  if (loadCollection === undefined) {
    copyProcessGraph[loadCollectionNode] = { process_id: 'load_collection', arguments: options };
    copyProcessGraph['load_collection'] = { process_id: 'load_collection', arguments: {} };
  }

  if (resolvedCollectionId !== undefined && resolvedCollectionId !== null) {
    copyProcessGraph[loadCollectionNode]['arguments']['id'] = resolvedCollectionId;
  }
  if (options.spatial_extent) {
    copyProcessGraph[loadCollectionNode]['arguments']['spatial_extent'] = options.spatial_extent;
  }
  if (options.temporal_extent) {
    copyProcessGraph[loadCollectionNode]['arguments']['temporal_extent'] = options.temporal_extent;
  }
  if (options.bands != null) {
    copyProcessGraph[loadCollectionNode]['arguments']['bands'] = options.bands;
  }

  return copyProcessGraph;
}

// This currently assumes a save_result node already exists
// For now we will only support changing the format as data.from_node would add complexity
function saveResult(processGraph, options) {
  let copyProcessGraph = JSON.parse(JSON.stringify(processGraph));
  const saveResultNode = findNodeByProcessId(copyProcessGraph, 'save_result');
  if (saveResultNode === undefined) {
    throw new Error('No save_result node found');
  }
  if (options.format) {
    copyProcessGraph[saveResultNode]['arguments']['format'] = options.format;
  }

  return copyProcessGraph;
}

const processGraphBuilder = {
  loadCollection,
  saveResult,
};
export default processGraphBuilder;
