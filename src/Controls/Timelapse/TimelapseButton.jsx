import React, { useEffect, useState } from 'react';
import { connect } from 'react-redux';
import { EOBTimelapsePanelButton } from '../../junk/EOBTimelapsePanelButton/EOBTimelapsePanelButton';
import 'rodal/lib/rodal.css';

import store, { notificationSlice, timelapseSlice } from '../../store';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { TIMELAPSE_3D_MIN_EYE_HEIGHT } from '../../TerrainViewer/TerrainViewer.const';

const TimelapseButton = (props) => {
  const [zoomTooLow, setZoomTooLow] = useState(false);

  const {
    is3D,
    terrainViewerSettings,
    newLayersCount,
    displayTimelapseAreaPreview,
    dataSourcesInitialized,
    layerId,
    customSelected,
    datasetId,
    visualizationUrl,
    zoom,
    user,
    selectedTabIndex,
    aoi,
    showComparePanel,
    isPlacingVertex,
  } = props;

  useEffect(() => {
    let zTooLow = false;
    if (is3D && terrainViewerSettings && Object.keys(terrainViewerSettings).length > 3) {
      const { z } = terrainViewerSettings;
      zTooLow = z > TIMELAPSE_3D_MIN_EYE_HEIGHT;
    }

    const isVisualizationSet =
      dataSourcesInitialized && (layerId || customSelected) && datasetId && visualizationUrl;
    if (isVisualizationSet) {
      const dsh = getDataSourceHandler(datasetId);
      const zoomConfig = dsh.getLeafletZoomConfig(datasetId);
      zTooLow = zTooLow || (zoomConfig && zoom < zoomConfig.min);

      if (zTooLow) {
        store.dispatch(timelapseSlice.actions.setTimelapseAreaPreview(false));
      }
    }
    setZoomTooLow(zTooLow);
  }, [
    zoom,
    is3D,
    terrainViewerSettings,
    dataSourcesInitialized,
    layerId,
    customSelected,
    datasetId,
    visualizationUrl,
  ]);

  const generateSelectedResult = () => {
    const { dataSourcesInitialized, layerId, customSelected, datasetId, visualizationUrl } = props;
    const isVisualizationSet =
      dataSourcesInitialized && (layerId || customSelected) && datasetId && visualizationUrl;
    let selectedResult;

    if (isVisualizationSet) {
      selectedResult = { name: datasetId };
      const dsh = getDataSourceHandler(datasetId);
      if (dsh && dsh.supportsTimelapse()) {
        selectedResult.getDates = true;
        selectedResult.baseUrls = { WMS: true };
      }
    }
    return selectedResult;
  };

  return (
    <div className="timelapse-wrapper">
      <EOBTimelapsePanelButton
        selectedResult={generateSelectedResult()}
        isLoggedIn={!!user.userdata}
        selectedTabIndex={selectedTabIndex}
        is3D={is3D}
        aoi={aoi}
        onErrorMessage={(msg) => store.dispatch(notificationSlice.actions.displayError(msg))}
        zoomTooLow={zoomTooLow}
        newLayersCount={newLayersCount}
        displayTimelapseAreaPreview={displayTimelapseAreaPreview}
        showComparePanel={showComparePanel}
        isPlacingVertex={isPlacingVertex}
      />
    </div>
  );
};

const mapStoreToProps = (store) => ({
  user: store.auth.user,
  datasetId: store.visualization.datasetId,
  layerId: store.visualization.layerId,
  customSelected: store.visualization.customSelected,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  visualizationUrl: store.visualization.visualizationUrl,
  selectedTabIndex: store.tabs.selectedTabIndex,
  is3D: store.mainMap.is3D,
  zoom: store.mainMap.zoom,
  aoi: store.aoi,
  terrainViewerSettings: store.terrainViewer.settings,
  newLayersCount: store.timelapse.newLayersCount,
  displayTimelapseAreaPreview: store.timelapse.displayTimelapseAreaPreview,
  isPlacingVertex: store.aoi.isPlacingVertex,
});

export default connect(mapStoreToProps, null)(TimelapseButton);
