import React, { Component } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import store, { mainMapSlice, notificationSlice } from '../store';

import Icon2D from './icons/icon-2D.svg?react';
import Icon3D from './icons/icon-3D.svg?react';

import './TerrainViewer.scss';
import { TABS } from '../const';

class TerrainViewerButton extends Component {
  checkIfDisabled = () => {
    const {
      visualizationUrl,
      datasetId,
      layerId,
      customSelected,
      selectedTabIndex,
      is3D,
      terrainViewerId,
      showComparePanel,
    } = this.props;

    if (!is3D && (selectedTabIndex !== TABS.VISUALIZE_TAB || showComparePanel)) {
      return {
        isDisabled: true,
        errorMessage: t`You can only view data in 3D while visualizing a collection.`,
      };
    }
    if (!is3D && !(visualizationUrl && datasetId && layerId) && !customSelected) {
      return { isDisabled: true, errorMessage: t`please select a layer` };
    }
    if ((!is3D && terrainViewerId) || (is3D && !terrainViewerId)) {
      // Terrain Viewer is closing or opening
      return { isDisabled: true, errorMessage: null };
    }
    return { isDisabled: false, errorMessage: null };
  };

  handleTerrainViewerButtonClick = () => {
    const { is3D } = this.props;
    const { isDisabled, errorMessage } = this.checkIfDisabled();

    if (isDisabled) {
      store.dispatch(notificationSlice.actions.displayError(errorMessage));
      return;
    }
    store.dispatch(mainMapSlice.actions.setIs3D(!is3D));
  };

  render() {
    const { is3D } = this.props;
    const { isDisabled, errorMessage } = this.checkIfDisabled();
    return (
      <div
        className={`terrain-viewer-button ${isDisabled ? 'disabled' : ''} ${is3D ? 'is3d' : ''}`}
        onClick={this.handleTerrainViewerButtonClick}
        title={
          is3D ? t`2D map view` : t`Visualize terrain in 3D` + (errorMessage ? ` \n(${errorMessage})` : '')
        }
      >
        {is3D ? (
          <Icon2D className="icon" fill="currentColor" />
        ) : (
          <Icon3D className="icon" fill="currentColor" />
        )}
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  layerId: store.visualization.layerId,
  datasetId: store.visualization.datasetId,
  visualizationUrl: store.visualization.visualizationUrl,
  customSelected: store.visualization.customSelected,
  is3D: store.mainMap.is3D,
  selectedTabIndex: store.tabs.selectedTabIndex,
  terrainViewerId: store.terrainViewer.id,
});

export default connect(mapStoreToProps, null)(TerrainViewerButton);
