import { useEffect } from 'react';
import { connect } from 'react-redux';

import store, { visualizationSlice } from '../store';
import { getDataSourceHandler } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

function VisualizationUrlProvider({ children, dataSourcesInitialized, datasetId, currentVisualizationUrl }) {
  useEffect(() => {
    if (dataSourcesInitialized && datasetId) {
      const datasourceHandler = getDataSourceHandler(datasetId);
      if (!datasourceHandler) {
        return;
      }
      const urls = datasourceHandler.getUrlsForDataset(datasetId);
      if (urls.includes(currentVisualizationUrl)) {
        return;
      }
      const visualizationUrl = urls.length > 0 ? urls[0] : null;
      if (visualizationUrl !== currentVisualizationUrl) {
        store.dispatch(
          visualizationSlice.actions.setVisualizationParams({
            visualizationUrl: visualizationUrl,
          }),
        );
      }
    }
  }, [datasetId, dataSourcesInitialized, currentVisualizationUrl]);
  return children;
}

const mapStoreToProps = (store) => ({
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  datasetId: store.visualization.datasetId,
  currentVisualizationUrl: store.visualization.visualizationUrl,
});
export default connect(mapStoreToProps)(VisualizationUrlProvider);
