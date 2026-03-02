import React, { Component } from 'react';
import ReactDOM from 'react-dom';
import { connect } from 'react-redux';
import { t } from 'ttag';
import L from 'leaflet';

import { CancelToken } from '@sentinel-hub/sentinelhub-js';

import store, { notificationSlice } from '../../store';

import {
  checkIfIndexOutputPresent,
  getMissingIndexOutputError,
  getNoIndexLayerOutputError,
} from './Histogram.utils';

import {
  getDataSourceHandler,
  datasetLabels,
  checkIfCustom,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { CUSTOM } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

import HistogramModal from './HistogramModal';

import './HistogramWrapper.scss';
import { PROCESSING_OPTIONS, TABS } from '../../const';

class HistogramWrapper extends Component {
  state = {
    histogramOpened: false,
    histogramEnabled: false,
    errorMessage: null,
  };

  componentDidMount() {
    this.cancelToken = new CancelToken();
    L.DomEvent.disableScrollPropagation(this.ref);
    L.DomEvent.disableClickPropagation(this.ref);
    this.checkIfEnabled();
  }

  componentDidUpdate(prevProps) {
    if (prevProps === this.props) {
      return;
    }
    this.checkIfEnabled();
  }

  componentWillUnmount() {
    this.cancelToken.cancel();
  }

  onToggleHistogramModal = (enabled, errorMessage) => {
    if (!enabled) {
      store.dispatch(notificationSlice.actions.displayError(errorMessage));
      return;
    }
    this.setState((prevState) => ({ histogramOpened: !prevState.histogramOpened }));
  };

  checkIfEnabled = async () => {
    const {
      layerId,
      datasetId,
      customSelected,
      selectedTabIndex,
      selectedProcessing,
      isProcessGraphModified,
    } = this.props;

    const dsHandler = getDataSourceHandler(datasetId);
    const supportsV3Evalscript = dsHandler && dsHandler.supportsV3Evalscript(datasetId);
    const isOnVisualizationPanel = selectedTabIndex === TABS.VISUALIZE_TAB;
    const hasVisualization = !!(layerId || customSelected);
    const isEditedOpenEOProcessingSelected =
      selectedProcessing === PROCESSING_OPTIONS.OPENEO && isProcessGraphModified;

    if (!hasVisualization) {
      this.setState({ histogramEnabled: false, errorMessage: t`Please select a layer` });
      return;
    }
    if (!isOnVisualizationPanel) {
      this.setState({
        histogramEnabled: false,
        errorMessage: t`Histogram can be displayed only while visualising`,
      });
      return;
    }
    if (!supportsV3Evalscript) {
      const datasetLabel = checkIfCustom(datasetId) ? datasetLabels[CUSTOM] : datasetLabels[datasetId];
      this.setState({
        histogramEnabled: false,
        errorMessage: t`Histogram not available for ` + datasetLabel,
      });
      return;
    }
    if (isEditedOpenEOProcessingSelected) {
      this.setState({
        histogramEnabled: false,
        errorMessage: t`Histogram not available for edited OpenEO process graph`,
      });
      return;
    }

    const isIndexOutputPresent = await checkIfIndexOutputPresent(this.props, this.cancelToken);

    if (!isIndexOutputPresent) {
      this.setState({
        histogramEnabled: false,
        errorMessage: customSelected ? getMissingIndexOutputError() : getNoIndexLayerOutputError(),
      });
      return;
    }

    this.setState({ histogramEnabled: true, errorMessage: null });
  };

  render() {
    const { histogramOpened, histogramEnabled, errorMessage } = this.state;
    const title = t`Histogram` + ` ${errorMessage ? `\n(${errorMessage})` : ''}`;

    return (
      <div className="histogram-wrapper" ref={(r) => (this.ref = r)}>
        <div className="histogram-button-wrapper" title={title}>
          <div
            className={`histogram-button ${histogramEnabled ? '' : 'disabled'} ${
              histogramOpened ? 'active' : ''
            }`}
            onClick={(e) => {
              e.stopPropagation();
              this.onToggleHistogramModal(histogramEnabled, errorMessage);
            }}
          >
            <i className="fas fa-chart-bar" />
          </div>
        </div>

        {histogramOpened &&
          ReactDOM.createPortal(
            <HistogramModal closeHistogramModal={() => this.setState({ histogramOpened: false })} />,
            this.props.histogramContainer,
          )}
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  modalId: store.modal.id,
  datasetId: store.visualization.datasetId,
  layerId: store.visualization.layerId,
  customSelected: store.visualization.customSelected,
  selectedTabIndex: store.tabs.selectedTabIndex,
  selectedProcessing: store.visualization.selectedProcessing,
  isProcessGraphModified: store.visualization.isProcessGraphModified,
  evalscript: store.visualization.evalscript,
  visualizationUrl: store.visualization.visualizationUrl,
});

export default connect(mapStoreToProps, null)(HistogramWrapper);
