import React, { Component } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import { CancelToken } from '@sentinel-hub/sentinelhub-js';

import {
  getDataForLayer,
  getDataForIndex,
  getLayerName,
  checkIfIndexOutputPresent,
  getMissingIndexOutputError,
  getNoIndexLayerOutputError,
} from './Histogram.utils';
import {
  getDatasetLabel,
  getDataSourceHandler,
  datasetLabels,
  checkIfCustom,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { CUSTOM } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import Histogram from './Histogram';
import { DraggableDialogBox } from '../../components/DraggableDialogBox/DraggableDialogBox';

import './HistogramModal.scss';
import { TABS } from '../../const';

class HistogramModal extends Component {
  state = {
    loading: false,
    error: null,
    histogramData: null,
    title: null,
    refreshEnabled: false,
    refreshTooltip: null,
  };

  componentDidMount() {
    this.cancelToken = new CancelToken();
    this.setTitle();
    this.checkIfCanBeRefreshed();
    this.fetchData();
  }

  componentDidUpdate(prevProps) {
    if (prevProps === this.props) {
      return;
    }
    this.checkIfCanBeRefreshed();
  }

  componentWillUnmount() {
    this.cancelToken.cancel();
  }

  checkIfCanBeRefreshed = async () => {
    const { layerId, datasetId, customSelected, selectedTabIndex } = this.props;

    const dsHandler = getDataSourceHandler(datasetId);
    const supportsV3Evalscript = dsHandler && dsHandler.supportsV3Evalscript(datasetId);
    const isOnVisualizationPanel = selectedTabIndex === TABS.VISUALIZE_TAB;
    const hasVisualization = !!(layerId || customSelected);
    const isIndexOutputPresent = await checkIfIndexOutputPresent(this.props, this.cancelToken);

    if (!hasVisualization) {
      this.setState({ refreshEnabled: false, refreshTooltip: t`Please select a layer` });
      return;
    }
    if (!isOnVisualizationPanel) {
      this.setState({
        refreshEnabled: false,
        refreshTooltip: t`Histogram can be displayed only while visualizing`,
      });
      return;
    }
    if (!supportsV3Evalscript) {
      const datasetLabel = checkIfCustom(datasetId) ? datasetLabels[CUSTOM] : datasetLabels[datasetId];
      this.setState({
        refreshEnabled: false,
        refreshTooltip: t`Histogram not available for ` + datasetLabel,
      });
      return;
    }
    if (!isIndexOutputPresent) {
      this.setState({
        refreshEnabled: false,
        refreshTooltip: customSelected ? getMissingIndexOutputError() : getNoIndexLayerOutputError(),
      });
      return;
    }

    this.setState({ refreshEnabled: true, refreshTooltip: null });
  };

  setTitle = async () => {
    const { datasetId, layerId, visualizationUrl, customSelected } = this.props;
    const datasetName = getDatasetLabel(datasetId);
    const layerName = await getLayerName(visualizationUrl, layerId, this.cancelToken);
    const layerNameOrId = layerName ? layerName : layerId;
    const customString = t`Custom`;
    const title = `${datasetName} - ${customSelected ? customString : layerNameOrId}`;
    this.setState({ title: title });
  };

  fetchData = async () => {
    const { layerId, customSelected } = this.props;
    this.setState({ loading: true, error: null });

    let data = null;
    if (layerId) {
      data = await getDataForLayer(this.props, this.cancelToken);
    } else if (customSelected) {
      data = await getDataForIndex(this.props, this.cancelToken);
    }

    if (data.error) {
      this.setState({ error: data.error, loading: false });
      return;
    }

    this.setState({ histogramData: data.histogram, loading: false });
  };

  onHistogramModalClose = () => {
    this.props.closeHistogramModal();
  };

  recalculate = () => {
    this.setTitle();
    this.fetchData();
  };

  render() {
    const { datasetId } = this.props;
    const { histogramData, error, loading, title, refreshEnabled, refreshTooltip } = this.state;

    const dsHandler = getDataSourceHandler(datasetId);
    const supportsV3Evalscript = dsHandler && dsHandler.supportsV3Evalscript(datasetId);

    return (
      <DraggableDialogBox
        className="histogram-modal"
        width={550}
        height={400}
        onClose={this.onHistogramModalClose}
        title={title}
        modal={false}
      >
        {loading && (
          <div className="loading-holder">
            <div className="loading">
              <i className="fa fa-cog fa-spin fa-3x fa-fw"></i>
              {t`Loading, please wait`}
            </div>
          </div>
        )}

        {error && <div className="error-holder">{this.state.error}</div>}
        {histogramData && !loading && !error && <Histogram data={histogramData} />}

        {!loading && (
          <EOBButton
            className="recalculate-button small"
            disabled={loading || !supportsV3Evalscript || !refreshEnabled}
            onClick={() => !loading && supportsV3Evalscript && refreshEnabled && this.recalculate()}
            text={t`Recalculate`}
            title={refreshTooltip}
          />
        )}
      </DraggableDialogBox>
    );
  }
}

const mapStoreToProps = (store) => ({
  bounds: store.aoi.bounds ? store.aoi.bounds : store.mainMap.bounds,
  pixelBounds: store.mainMap.pixelBounds,
  aoiGeometry: store.aoi.geometry
    ? store.aoi.geometry.features
      ? store.aoi.geometry.features[0].geometry
      : store.aoi.geometry.geometry
    : null,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  layerId: store.visualization.layerId,
  customSelected: store.visualization.customSelected,
  datasetId: store.visualization.datasetId,
  visualizationUrl: store.visualization.visualizationUrl,
  evalscript: store.visualization.evalscript,
  selectedTabIndex: store.tabs.selectedTabIndex,
});

export default connect(mapStoreToProps, null)(HistogramModal);
