import React, { Component } from 'react';
import { connect } from 'react-redux';

import {
  findMatchingLayerMetadata,
  getDescriptionFromMetadata,
  getShortDescriptionFromMetadata,
  getTitleFromMetadata,
  getLegendDefinitionFromMetadata,
} from '../legendUtils';
import ActionBar from '../../../components/ActionBar/ActionBar';
import LayerHeader from './LayerHeader';
import LayerDetails from './LayerDetails';
import { createLayerActions } from './createLayerActions';
import { getVisualizationEffectsFromStore } from '../../../utils/effectsUtils';
import { getOrbitDirectionFromList } from '../VisualizationPanel.utils';

class VisualizationLayer extends Component {
  state = { detailsOpen: false };

  toggleDetails = (e) => {
    e.stopPropagation();
    this.setState((prevState) => ({ detailsOpen: !prevState.detailsOpen }));
  };

  render() {
    const {
      layer: viz,
      selectedVisualizationId,
      customSelected,
      datasetId,
      selectedThemeId,
      selectedModeId,
      setEvalScriptAndCustomVisualization,
      visualizationUrl,
      toggleLayerActions,
      layerActionsOpen,
    } = this.props;

    const { detailsOpen } = this.state;
    const vizId = viz.layerId;
    const isActive = selectedVisualizationId === vizId && viz.url === visualizationUrl && !customSelected;
    const hasEvalScript = viz.evalscript !== null;

    const layerMetadata = findMatchingLayerMetadata(datasetId, viz.layerId, selectedThemeId);
    const longDescription = getDescriptionFromMetadata(layerMetadata);
    const shortDescription =
      getShortDescriptionFromMetadata(layerMetadata, selectedModeId) || viz.description;
    const title = getTitleFromMetadata(layerMetadata, selectedModeId) || viz.title;
    const legend = getLegendDefinitionFromMetadata(layerMetadata) || viz.legend;

    const hasDetails = viz.legendUrl || legend || longDescription;
    const layerActions = createLayerActions(this.props);

    return (
      <div
        key={`${vizId}-${visualizationUrl}`}
        onClick={() => this.props.setSelectedVisualization(viz)}
        className={isActive ? 'layer-container active' : 'layer-container'}
      >
        <LayerHeader
          selectedThemeId={selectedThemeId}
          datasetId={datasetId}
          viz={viz}
          title={title}
          shortDescription={shortDescription}
          isActive={isActive}
          hasEvalScript={hasEvalScript}
          hasDetails={hasDetails}
          setEvalScriptAndCustomVisualization={setEvalScriptAndCustomVisualization}
          detailsOpen={detailsOpen}
          toggleDetails={this.toggleDetails}
          actionsOpen={layerActionsOpen}
          toggleActions={toggleLayerActions}
        />
        <ActionBar
          className="layer-actions"
          actionsOpen={layerActionsOpen && isActive}
          actions={layerActions}
        />
        <LayerDetails
          viz={viz}
          legend={legend}
          detailsOpen={detailsOpen && isActive}
          longDescription={longDescription}
        />
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  user: store.auth.user,
  customSelected: store.visualization.customSelected,
  selectedLanguage: store.language.selectedLanguage,
  selectedVisualizationId: store.visualization.layerId,
  visualizationUrl: store.visualization.visualizationUrl,
  datasetId: store.visualization.datasetId,
  selectedThemeId: store.themes.selectedThemeId,
  selectedModeId: store.themes.selectedModeId,
  is3D: store.mainMap.is3D,
  zoom: store.mainMap.zoom,
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  evalscript: store.visualization.evalscript,
  evalscripturl: store.visualization.evalscripturl,
  dataFusion: store.visualization.dataFusion,
  ...getVisualizationEffectsFromStore(store),
  orbitDirection: getOrbitDirectionFromList(store.visualization.orbitDirection),
});

export default connect(mapStoreToProps, null)(VisualizationLayer);
