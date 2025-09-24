import { DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX } from '../Tools/VisualizationPanel/CollectionSelection/CLMSCollectionSelection.utils';

// This function determines the base dataset and consolidation period index for a given datasetId.
// It uses the data structure to find the parent, so it works even if the parent has _RT0, _RT1, etc. suffixes.
export const handleCLMSConsolidationPeriod = (datasetId, clmsOptionsWithParent) => {
  const node = clmsOptionsWithParent.find((opt) => opt.id === datasetId);

  // If the node exists and has no parentId, it's a base dataset (not a consolidation period)
  if (node && !node.parentId) {
    return {
      baseDatasetId: datasetId,
      consolidationPeriodIndex: undefined,
      clmsDataset: node,
    };
  }

  // If the node exists and has a parentId, find the parent
  if (node && node.parentId) {
    const parent = clmsOptionsWithParent.find((opt) => opt.id === node.parentId);
    const idx = parent?.consolidationPeriods?.findIndex((cp) => cp.id === datasetId);
    return {
      baseDatasetId: parent?.id,
      consolidationPeriodIndex: idx > -1 ? idx : DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX,
      clmsDataset: parent,
    };
  }

  // Fallback: try to find the parent by searching all options' consolidationPeriods
  const clmsDataset = clmsOptionsWithParent.find((opt) =>
    opt.consolidationPeriods?.some((cp) => cp.id === datasetId),
  );
  const idx = clmsDataset?.consolidationPeriods?.findIndex((cp) => cp.id === datasetId);
  return {
    baseDatasetId: clmsDataset?.id ?? datasetId,
    consolidationPeriodIndex: idx > -1 ? idx : DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX,
    clmsDataset: clmsDataset ?? node,
  };
};
