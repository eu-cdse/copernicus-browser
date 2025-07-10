import { findNodeByProcessId } from './openEOHelpers';

function loadCollection(processGraph, options) {
  let copyProcessGraph = JSON.parse(JSON.stringify(processGraph));
  const loadCollectionNode = findNodeByProcessId(copyProcessGraph, 'load_collection');

  if (loadCollection === undefined) {
    copyProcessGraph[loadCollectionNode] = { process_id: 'load_collection', arguments: options };
    copyProcessGraph['load_collection'] = { process_id: 'load_collection', arguments: {} };
  }

  if (options.id) {
    copyProcessGraph[loadCollectionNode]['arguments']['id'] = options.id;
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
