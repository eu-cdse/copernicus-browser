import { useEffect } from 'react';
import { connect } from 'react-redux';

import store, { collapsiblePanelSlice, notificationSlice, visualizationSlice } from '../store';
import {
  getAllAvailableCollections,
  getDataSourceHandler,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { S2_L2A_CDAS, S2_L1C_CDAS } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { t } from 'ttag';

export function getPreselectedDatasetId() {
  const allCollections = getAllAvailableCollections();
  let preselectedDatasetId;
  if (allCollections.includes(S2_L2A_CDAS)) {
    preselectedDatasetId = S2_L2A_CDAS;
  } else if (allCollections.includes(S2_L1C_CDAS)) {
    preselectedDatasetId = S2_L1C_CDAS;
  } else if (allCollections.length > 0) {
    preselectedDatasetId = allCollections[0];
  }
  return preselectedDatasetId;
}

function PreselectedCollectionProvider({ children, selectedThemeId, dataSourcesInitialized, datasetId }) {
  useEffect(() => {
    if (selectedThemeId && dataSourcesInitialized) {
      let preselectedDatasetId = getPreselectedDatasetId();
      const dsh = getDataSourceHandler(datasetId);

      if (!(datasetId && dsh)) {
        //get preselected dataset when datasetId is not set or is invalid
        if (preselectedDatasetId) {
          store.dispatch(
            visualizationSlice.actions.setVisualizationParams({
              datasetId: preselectedDatasetId,
            }),
          );
          store.dispatch(collapsiblePanelSlice.actions.setCollectionPanelExpanded(true));
        }
      }

      if (datasetId && !dsh) {
        console.error('Invalid datasetId', datasetId);
        store.dispatch(notificationSlice.actions.displayError(t`Selected dataset does not exist!`));
      }
    }

    // eslint-disable-next-line
  }, [selectedThemeId, dataSourcesInitialized]);
  return children;
}

const mapStoreToProps = (store) => ({
  selectedThemeId: store.themes.selectedThemeId,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  datasetId: store.visualization.datasetId,
});
export default connect(mapStoreToProps)(PreselectedCollectionProvider);
