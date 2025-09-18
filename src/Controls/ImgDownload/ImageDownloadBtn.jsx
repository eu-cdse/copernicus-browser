import React from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import store, { modalSlice, notificationSlice } from '../../store';
import { ModalId } from '../../const';

import DownloadIcon from './download-icon.svg?react';
import { TABS } from '../../const';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getDatasourceNotSupportedMsg } from '../../junk/ConstMessages';

import './ImgDownloadBtn.scss';

const ImageDownloadBtn = (props) => {
  const onOpenImageDownloadPanel = (enabled, errorMessage) => {
    if (!enabled) {
      store.dispatch(notificationSlice.actions.displayError(errorMessage));
      return;
    }
    store.dispatch(modalSlice.actions.addModal({ modal: ModalId.IMG_DOWNLOAD }));
  };

  const checkIfSupportedByDatasetId = (datasetId) => {
    const datasourceHandler = getDataSourceHandler(datasetId);
    const supportsImgExport = datasourceHandler && datasourceHandler.supportsImgExport();
    if (!supportsImgExport) {
      return { enabled: false, errorMessage: getDatasourceNotSupportedMsg() };
    }

    const zoomConfig = datasourceHandler.getLeafletZoomConfig(datasetId);
    if (zoomConfig && props.zoom < zoomConfig.min) {
      return { enabled: false, errorMessage: t`Zoom too low. Please zoom in.` };
    }
    return { enabled: true, errorMessage: null };
  };

  const checkIfEnabled = () => {
    const { layerId, customSelected, selectedTabIndex, comparedLayers, datasetId, showComparePanel } = props;
    const isOnVisualizationPanel = selectedTabIndex === TABS.VISUALIZE_TAB;
    const isOnComparePanel = showComparePanel;
    const hasVisualization = !!(layerId || customSelected);

    if (!isOnVisualizationPanel && !isOnComparePanel) {
      return {
        enabled: false,
        errorMessage: t`you can only download an image while visualising or comparing`,
      };
    }

    if (hasVisualization && datasetId && !isOnComparePanel) {
      return checkIfSupportedByDatasetId(datasetId);
    }

    if (!hasVisualization && !isOnComparePanel) {
      return { enabled: false, errorMessage: t`please select a layer` };
    }

    if (isOnComparePanel && comparedLayers.length < 2) {
      return { enabled: false, errorMessage: t`you need to compare at least 2 layers` };
    }
    if (isOnComparePanel && comparedLayers.length >= 2) {
      const allLayersSupport = comparedLayers.map((l) => checkIfSupportedByDatasetId(l.datasetId));
      const disabledDatasetFound = allLayersSupport.find((s) => !s.enabled);
      if (disabledDatasetFound) {
        return disabledDatasetFound;
      }
    }
    return { enabled: true, errorMessage: null };
  };

  const { modalId, is3D } = props;
  const { enabled, errorMessage } = checkIfEnabled();
  const title = t`Download image` + ` ${errorMessage ? `\n(${errorMessage})` : ''}`;

  return (
    <div
      className={`img-download-btn-wrapper ${is3D ? 'is3d' : ''}`}
      title={title}
      onClick={() => onOpenImageDownloadPanel(enabled, title)}
    >
      <div className={`${enabled ? '' : 'disabled'} ${modalId === ModalId.IMG_DOWNLOAD ? 'active' : ''}`}>
        <DownloadIcon alt="download-icon" />
      </div>
    </div>
  );
};

const mapStoreToProps = (store) => ({
  layerId: store.visualization.layerId,
  customSelected: store.visualization.customSelected,
  evalscript: store.visualization.evalscript,
  visualizationUrl: store.visualization.visualizationUrl,
  datasetId: store.visualization.datasetId,
  selectedTabIndex: store.tabs.selectedTabIndex,
  comparedLayers: store.compare.comparedLayers,
  is3D: store.mainMap.is3D,
  zoom: store.mainMap.zoom,
  modalId: store.modal.id,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
});

export default connect(mapStoreToProps, null)(ImageDownloadBtn);
