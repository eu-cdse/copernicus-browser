import React from 'react';
import { connect } from 'react-redux';
import cloneDeep from 'lodash.clonedeep';

import EOBAdvancedHolder from '../../../junk/EOBAdvancedHolder/EOBAdvancedHolder';

import { getDataSourceHandler } from '../../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { parseEvalscriptBands, parseIndexEvalscript } from '../../../utils';
import ActionBar from '../../../components/ActionBar/ActionBar';
import { createLayerActions } from './createLayerActions';
import { getVisualizationEffectsFromStore } from '../../../utils/effectsUtils';
import { PROCESSING_OPTIONS } from '../../../const';
import { getProcessGraph } from '../../../api/openEO/openEOHelpers';

const CustomVisualizationLayer = (props) => {
  const {
    datasetId,
    selectedVisualizationId,
    visualizationUrl,
    evalscriptUrl,
    evalscript,
    dataFusion,
    fromTime,
    toTime,
    useEvalscriptUrl,
    onUpdateScript,
    setDataFusion,
    onBackToLayerList,
    onVisualizeEditorEvalscript,
    onCompositeChange,
    onIndexScriptChange,
    selectedProcessing,
    effects,
  } = props;

  const datasourceHandler = getDataSourceHandler(datasetId);
  const supportsIndex = datasourceHandler && datasourceHandler.supportsIndex(datasetId);
  const areBandsClasses = datasourceHandler && datasourceHandler.areBandsClasses(datasetId);
  const groupChannels =
    datasourceHandler && datasourceHandler.groupChannels && datasourceHandler.groupChannels(datasetId);
  const bands = datasourceHandler.getBands(datasetId);
  // Some datasets might have only 1 or 2 available bands. This assures `bands` always contains exactly 3.
  let selectedBands = [...bands, ...bands, ...bands].slice(0, 3).map((b) => b.name);
  let selectedIndexBands = { a: null, b: null };

  if (evalscript) {
    const parsedBands = parseEvalscriptBands(evalscript);
    if (parsedBands.length === 3) {
      selectedBands = parsedBands;
    }
    const parsedIndexEvalscript = parseIndexEvalscript(evalscript);
    if (parsedIndexEvalscript) {
      selectedIndexBands = parsedIndexEvalscript.bands;
      if (selectedIndexBands.a === 'null') {
        selectedIndexBands.a = null;
      }
      if (selectedIndexBands.b === 'null') {
        selectedIndexBands.b = null;
      }
    }
  }

  const legacyActiveLayer = {
    ...(groupChannels && { groupChannels: () => groupChannels }),
    datasetId: datasetId,
    baseUrls: {
      WMS: visualizationUrl,
    },
  };

  // Prepare props for createLayerActions
  // When in OpenEO mode we set evalscripts to null.
  // TODO: When processGraphs can be changed we will need to add the new processGraph to the visualisation or layer in compare mode
  // for now we do not set anything as the editor is read-only
  const layerActionsProps = cloneDeep({ ...props, ...effects });
  if (selectedProcessing === PROCESSING_OPTIONS.OPENEO) {
    layerActionsProps.evalscript = null; // Don't pass evalscript in OpenEO mode
    layerActionsProps.evalscripturl = null;
    layerActionsProps.selectedProcessing = selectedProcessing;
    layerActionsProps.processGraph = getProcessGraph(visualizationUrl, selectedVisualizationId);
  }
  const layerActions = createLayerActions(layerActionsProps);
  return (
    <div className="custom-visualization">
      <ActionBar actionsOpen={true} actions={layerActions} />
      <EOBAdvancedHolder
        channels={bands}
        evalscripturl={evalscriptUrl}
        evalscript={evalscript}
        dataFusion={dataFusion}
        initialTimespan={{ fromTime: fromTime, toTime: toTime }}
        layers={{
          r: selectedBands[0],
          g: selectedBands[1],
          b: selectedBands[2],
        }}
        indexLayers={selectedIndexBands}
        activeLayer={legacyActiveLayer}
        isEvalUrl={useEvalscriptUrl}
        style={null}
        onUpdateScript={onUpdateScript}
        onDataFusionChange={setDataFusion}
        onBack={onBackToLayerList}
        onEvalscriptRefresh={onVisualizeEditorEvalscript}
        onCompositeChange={onCompositeChange}
        onIndexScriptChange={onIndexScriptChange}
        supportsIndex={supportsIndex}
        areBandsClasses={areBandsClasses}
        selectedVisualizationId={selectedVisualizationId}
        visualizationUrl={visualizationUrl}
        selectedProcessing={selectedProcessing}
        effects={effects}
      />
    </div>
  );
};

const mapStoreToProps = (store) => ({
  user: store.auth.user,
  customSelected: store.visualization.customSelected,
  selectedLanguage: store.language.selectedLanguage,
  selectedVisualizationId: store.visualization.layerId,
  visualizationUrl: store.visualization.visualizationUrl,
  datasetId: store.visualization.datasetId,
  selectedProcessing: store.visualization.selectedProcessing,
  selectedThemeId: store.themes.selectedThemeId,
  selectedModeId: store.themes.selectedModeId,
  is3D: store.mainMap.is3D,
  zoom: store.mainMap.zoom,
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  effects: getVisualizationEffectsFromStore(store),
});

export default connect(mapStoreToProps, null)(CustomVisualizationLayer);
