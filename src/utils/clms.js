import { DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX } from '../Tools/VisualizationPanel/CollectionSelection/CLMSCollectionSelection.utils';

export const handleCLMSConsolidationPeriod = (datasetId, clmsOptionsWithParent) => {
  const consolidationPeriod = datasetId.split('_').pop();
  const baseDatasetId = datasetId.split('_RT')[0];

  if (!consolidationPeriod?.includes('RT')) {
    return {
      baseDatasetId: datasetId,
      consolidationPeriodIndex: undefined,
      clmsDataset: clmsOptionsWithParent.find((opt) => opt.id === datasetId),
    };
  }

  const clmsDataset = clmsOptionsWithParent.find((opt) =>
    opt.consolidationPeriods?.map((cp) => cp.id).includes(datasetId),
  );

  const idx = clmsDataset?.consolidationPeriods.findIndex((cp) => cp.id === datasetId);

  return {
    baseDatasetId,
    consolidationPeriodIndex: idx > -1 ? idx : DEFAULT_SELECTED_CONSOLIDATION_PERIOD_INDEX,
    clmsDataset,
  };
};
