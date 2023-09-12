import React from 'react';
import { connect } from 'react-redux';
import cloneDeep from 'lodash.clonedeep';

import EOBAdvancedHolder from '../../../junk/EOBAdvancedHolder/EOBAdvancedHolder';

import { getDataSourceHandler } from '../../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { parseEvalscriptBands, parseIndexEvalscript } from '../../../utils';
import ActionBar from '../../../components/ActionBar/ActionBar';
import { createLayerActions } from './createLayerActions';
import { getVisualizationEffectsFromStore } from '../../../utils/effectsUtils';

const CustomVisualizationLayer = (props) => {
  const {
    datasetId,
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

  const layerActions = createLayerActions(cloneDeep(props));

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
  selectedThemeId: store.themes.selectedThemeId,
  selectedModeId: store.themes.selectedModeId,
  is3D: store.mainMap.is3D,
  zoom: store.mainMap.zoom,
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  ...getVisualizationEffectsFromStore(store),
});

export default connect(mapStoreToProps, null)(CustomVisualizationLayer);
