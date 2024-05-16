import React, { Component } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import store, { modalSlice, notificationSlice } from '../../store';
import { ModalId } from '../../const';

import DownloadIcon from './download-icon.svg?react';
import './ImgDownloadBtn.scss';
import { TABS } from '../../const';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getDatasourceNotSupportedMsg } from '../../junk/ConstMessages';

class ImageDownloadBtn extends Component {
  onOpenImageDownloadPanel = (enabled, errorMessage) => {
    if (!enabled) {
      store.dispatch(notificationSlice.actions.displayError(errorMessage));
      return;
    }
    store.dispatch(modalSlice.actions.addModal({ modal: ModalId.IMG_DOWNLOAD }));
  };

  checkIfSupportedByDatasetId = (datasetId) => {
    const datasourceHandler = getDataSourceHandler(datasetId);
    const supportsImgExport = datasourceHandler && datasourceHandler.supportsImgExport();
    if (!supportsImgExport) {
      return { enabled: false, errorMessage: getDatasourceNotSupportedMsg() };
    }
    return { enabled: true, errorMessage: null };
  };

  checkIfEnabled = () => {
    const { layerId, customSelected, selectedTabIndex, comparedLayers, datasetId, showComparePanel } =
      this.props;
    const isOnVisualizationPanel = selectedTabIndex === TABS.VISUALIZE_TAB;
    const isOnComparePanel = showComparePanel;
    const hasVisualization = !!(layerId || customSelected);

    if (!isOnVisualizationPanel && !isOnComparePanel) {
      return {
        enabled: false,
        errorMessage: t`you can only download an image while visualizing or comparing`,
      };
    }

    if (hasVisualization && datasetId && !isOnComparePanel) {
      return this.checkIfSupportedByDatasetId(datasetId);
    }

    if (!hasVisualization && !isOnComparePanel) {
      return { enabled: false, errorMessage: t`please select a layer` };
    }

    if (isOnComparePanel && comparedLayers.length < 2) {
      return { enabled: false, errorMessage: t`you need to compare at least 2 layers` };
    }
    if (isOnComparePanel && comparedLayers.length >= 2) {
      const allLayersSupport = comparedLayers.map((l) => this.checkIfSupportedByDatasetId(l.datasetId));
      const disabledDatasetFound = allLayersSupport.find((s) => !s.enabled);
      if (disabledDatasetFound) {
        return disabledDatasetFound;
      }
    }
    return { enabled: true, errorMessage: null };
  };

  render() {
    const { modalId } = this.props;
    const { enabled, errorMessage } = this.checkIfEnabled();
    const title = t`Download image` + ` ${errorMessage ? `\n(${errorMessage})` : ''}`;

    return (
      <div
        className={`img-download-btn-wrapper ${this.props.is3D ? 'is3d' : ''}`}
        title={title}
        onClick={() => this.onOpenImageDownloadPanel(enabled, title)}
      >
        {
          <div className={`${enabled ? '' : 'disabled'} ${modalId === ModalId.IMG_DOWNLOAD ? 'active' : ''}`}>
            <DownloadIcon alt="download-icon" title={title} />
          </div>
        }
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  layerId: store.visualization.layerId,
  customSelected: store.visualization.customSelected,
  evalscript: store.visualization.evalscript,
  visualizationUrl: store.visualization.visualizationUrl,
  datasetId: store.visualization.datasetId,
  selectedTabIndex: store.tabs.selectedTabIndex,
  comparedLayers: store.compare.comparedLayers,
  is3D: store.mainMap.is3D,
  modalId: store.modal.id,
});

export default connect(mapStoreToProps, null)(ImageDownloadBtn);
