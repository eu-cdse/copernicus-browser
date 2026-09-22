import { useEffect } from 'react';
import { connect } from 'react-redux';

import store, { collapsiblePanelSlice, notificationSlice, visualizationSlice } from '../store';
import {
  getAllAvailableCollections,
  getDataSourceHandler,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { S2_L2A_CDAS, S2_L1C_CDAS } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { t } from 'ttag';

export function getPreselectedDatasetId(allowAnyCollectionFallback = true) {
  const allCollections = getAllAvailableCollections();
  let preselectedDatasetId;
  if (allCollections.includes(S2_L2A_CDAS)) {
    preselectedDatasetId = S2_L2A_CDAS;
  } else if (allCollections.includes(S2_L1C_CDAS)) {
    preselectedDatasetId = S2_L1C_CDAS;
  } else if (allowAnyCollectionFallback && allCollections.length > 0) {
    preselectedDatasetId = allCollections[0];
  }
  return preselectedDatasetId;
}

function PreselectedCollectionProvider({
  children,
  selectedThemeId,
  dataSourcesInitialized,
  dataSourcesReadyVersion,
  datasetId,
}) {
  useEffect(() => {
    if (!selectedThemeId) {
      return;
    }

    if (!datasetId) {
      // Preselect a dataset as soon as any data source has registered, without waiting for the
      // full (possibly slow) theme to finish loading — e.g. right after a theme switch resets datasetId.
      // Before the theme is fully initialized, only preselect the known-preferred S2 dataset (never
      // an arbitrary other one) — falling back to "whatever registered first" would make the choice
      // depend on network race order. The effect re-runs on every dataSourcesReadyVersion bump, so it
      // naturally retries until either S2 registers or the theme finishes loading.
      if (dataSourcesReadyVersion > 0 || dataSourcesInitialized) {
        const preselectedDatasetId = getPreselectedDatasetId(dataSourcesInitialized);
        if (preselectedDatasetId) {
          store.dispatch(
            visualizationSlice.actions.setVisualizationParams({
              datasetId: preselectedDatasetId,
            }),
          );
        }
      }
      return;
    }

    if (!dataSourcesInitialized) {
      // datasetId is already set (e.g. from the URL) - wait for full readiness before judging
      // whether it's valid, since its own data source part may simply not have registered yet.
      return;
    }

    const dsh = getDataSourceHandler(datasetId);
    if (!dsh) {
      console.error('Invalid datasetId', datasetId);
      store.dispatch(notificationSlice.actions.displayError(t`Selected dataset does not exist!`));
      const preselectedDatasetId = getPreselectedDatasetId(dataSourcesInitialized);
      if (preselectedDatasetId) {
        store.dispatch(visualizationSlice.actions.setNewDatasetId({ datasetId: preselectedDatasetId }));
        store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(true));
      }
    }
  }, [selectedThemeId, dataSourcesInitialized, dataSourcesReadyVersion, datasetId]);
  return children;
}

const mapStoreToProps = (store) => ({
  selectedThemeId: store.themes.selectedThemeId,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  dataSourcesReadyVersion: store.themes.dataSourcesReadyVersion,
  datasetId: store.visualization.datasetId,
});
export default connect(mapStoreToProps)(PreselectedCollectionProvider);
