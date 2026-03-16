import { SpeckleFilterType } from '@sentinel-hub/sentinelhub-js';
import { findNodeByProcessId } from './openEOHelpers';
import { DISABLED_ORTHORECTIFICATION } from '../../const';
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

function loadCollection(processGraph, options, cachedProcessGraph = null) {
  let copyProcessGraph = JSON.parse(JSON.stringify(processGraph));
  const loadCollectionNode = findNodeByProcessId(copyProcessGraph, 'load_collection');
  const resolvedCollectionId = resolveCollectionId(options);

  if (loadCollectionNode === undefined) {
    copyProcessGraph['load_collection'] = { process_id: 'load_collection', arguments: {} };
  }

  // Resolve cached defaults: prefer explicitly passed cachedProcessGraph,
  // fall back to processGraph itself (works when it hasn't been user-modified)
  const defaultsGraph = cachedProcessGraph ?? processGraph;
  const defaultsNode = findNodeByProcessId(defaultsGraph, 'load_collection');

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

  const cachedProcessGraphArgs = defaultsNode ? defaultsGraph[defaultsNode]['arguments'] : {};

  // For each option: 1) effects override, 2) cached layer value, 3) undefined
  const resolveOption = (key, value) => (value != null ? value : cachedProcessGraphArgs[key]);

  copyProcessGraph[loadCollectionNode]['arguments']['minQa'] = resolveOption('minQa', options.minQa);
  copyProcessGraph[loadCollectionNode]['arguments']['mosaickingOrder'] = resolveOption(
    'mosaickingOrder',
    options.mosaickingOrder,
  );
  copyProcessGraph[loadCollectionNode]['arguments']['upsampling'] = resolveOption(
    'upsampling',
    options.upsampling,
  );
  copyProcessGraph[loadCollectionNode]['arguments']['downsampling'] = resolveOption(
    'downsampling',
    options.downsampling,
  );
  copyProcessGraph[loadCollectionNode]['arguments']['acquisitionMode'] = resolveOption(
    'acquisitionMode',
    options.acquisitionMode,
  );
  copyProcessGraph[loadCollectionNode]['arguments']['resolution'] = resolveOption(
    'resolution',
    options.resolution,
  );
  copyProcessGraph[loadCollectionNode]['arguments']['polarization'] = resolveOption(
    'polarization',
    options.polarization,
  );
  copyProcessGraph[loadCollectionNode]['arguments']['orbitDirection'] = resolveOption(
    'orbitDirection',
    options.orbitDirection,
  );
  copyProcessGraph[loadCollectionNode]['arguments']['previewMode'] = resolveOption(
    'previewMode',
    options.previewMode,
  );
  copyProcessGraph[loadCollectionNode]['arguments']['backscatterCoefficient'] = resolveOption(
    'backscatterCoefficient',
    options.backscatterCoeff,
  );

  if (options.speckleFilter != null) {
    copyProcessGraph[loadCollectionNode]['arguments']['speckleFilter'] = options.speckleFilter.type;
    if (options.speckleFilter.type !== SpeckleFilterType.NONE) {
      copyProcessGraph[loadCollectionNode]['arguments']['speckleFilterSizeX'] =
        options.speckleFilter.windowSizeX;
      copyProcessGraph[loadCollectionNode]['arguments']['speckleFilterSizeY'] =
        options.speckleFilter.windowSizeY;
    }
  } else {
    copyProcessGraph[loadCollectionNode]['arguments']['speckleFilter'] =
      cachedProcessGraphArgs['speckleFilter'];
    copyProcessGraph[loadCollectionNode]['arguments']['speckleFilterSizeX'] =
      cachedProcessGraphArgs['speckleFilterSizeX'];
    copyProcessGraph[loadCollectionNode]['arguments']['speckleFilterSizeY'] =
      cachedProcessGraphArgs['speckleFilterSizeY'];
  }

  if (options.orthorectification != null && options.orthorectification !== DISABLED_ORTHORECTIFICATION) {
    copyProcessGraph[loadCollectionNode]['arguments']['orthorectificationDemInstance'] =
      options.orthorectification;
  } else {
    copyProcessGraph[loadCollectionNode]['arguments']['orthorectificationDemInstance'] =
      cachedProcessGraphArgs['orthorectificationDemInstance'];
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
