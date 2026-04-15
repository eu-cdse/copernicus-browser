import { useEffect } from 'react';
import { useSelector, useDispatch } from 'react-redux';

import { visualizationSlice } from '../store';
import { getDataSourceHandler } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

function VisualizationUrlProvider({ children }) {
  const dispatch = useDispatch();
  const dataSourcesInitialized = useSelector((state) => state.themes.dataSourcesInitialized);
  const datasetId = useSelector((state) => state.visualization.datasetId);
  const currentVisualizationUrl = useSelector((state) => state.visualization.visualizationUrl);
  const layerId = useSelector((state) => state.visualization.layerId);
  const customSelected = useSelector((state) => state.visualization.customSelected);

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
        // Set both visualizationUrl and visibleOnMap when providing a URL
        const shouldBeVisible = !!(layerId || customSelected) && !!datasetId && !!visualizationUrl;
        dispatch(
          visualizationSlice.actions.setVisualizationParams({
            visualizationUrl: visualizationUrl,
            visibleOnMap: shouldBeVisible,
          }),
        );
      }
    }
  }, [datasetId, dataSourcesInitialized, currentVisualizationUrl, layerId, customSelected, dispatch]);
  return children;
}

export default VisualizationUrlProvider;
