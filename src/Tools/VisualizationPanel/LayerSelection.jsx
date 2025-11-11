import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

import Visualizations from './Visualizations';
import CustomVisualizationLayer from './VisualizationLayer/CustomVisualizationLayer';
import Loader from '../../Loader/Loader';
import { CUSTOM_VISUALIZATION_URL_ROUTES } from '../../junk/EOBAdvancedHolder/EOBAdvancedHolder';
import { getDataSourceHandler } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { sortLayers } from './VisualizationPanel.utils';
import store, { visualizationSlice } from '../../store';
import { parseEvalscriptBands, parseIndexEvalscript } from '../../utils';
import { usePrevious } from '../../hooks/usePrevious';

import { PROCESSING_OPTIONS, reqConfigMemoryCache } from '../../const';
import { getProcessGraph, isOpenEoSupported } from '../../api/openEO/openEOHelpers';
import { getVisualizationEffectsFromStore, isVisualizationEffectsApplied } from '../../utils/effectsUtils';
import { IMAGE_FORMATS } from '../../Controls/ImgDownload/consts';

function LayerSelection({
  selectedLayerId,
  visualizedEvalscript,
  customSelected,
  visualizedDataFusion,
  datasetId,
  fromTime,
  toTime,
  visualizationUrl,
  visualizedEvalscriptUrl,
  selectedThemeId,
  themesLists,
  selectedThemesListId,
  dataSourcesInitialized,
  savePin,
  displayEffects,
  locationHash,
  setLocationHash,
  onBackToLayerList,
  toggleLayerActions,
  layerActionsOpen,
  effects,
}) {
  const [layers, setLayers] = useState([]);
  const [loadingLayersInProgress, setLoadingLayersInProgress] = useState(false);
  const [evalscript, setEvalscript] = useState(visualizedEvalscript);
  const [customEvalscript, setCustomEvalscript] = useState(null);
  const [evalscriptUrl, setEvalscriptUrl] = useState(visualizedEvalscriptUrl);
  const [useEvalscriptUrl, setUseEvalscriptUrl] = useState(!!visualizedEvalscriptUrl);
  const [dataFusion, setDataFusion] = useState(visualizedDataFusion);
  const previousDatasetId = usePrevious(datasetId);

  const datasourceHandler = getDataSourceHandler(datasetId);

  useEffect(() => {
    if (datasetId && dataSourcesInitialized) {
      getAllLayers();
    }
    // eslint-disable-next-line
  }, [dataSourcesInitialized, datasetId, visualizationUrl]);

  useEffect(() => {
    if (layers.length === 0 || customSelected) {
      return;
    }

    const currentlySelectedLayer = layers.find((l) => l.layerId === selectedLayerId);
    const layerToSelect = currentlySelectedLayer || layers[0];

    if (layerToSelect) {
      setSelectedVisualization(layerToSelect);
    }
    // eslint-disable-next-line
  }, [layers]);

  useEffect(() => {
    setEvalscript(visualizedEvalscript);
    // eslint-disable-next-line
  }, [visualizedEvalscript]);

  useEffect(() => {
    setEvalscriptUrl(visualizedEvalscriptUrl);
    if (visualizedEvalscriptUrl) {
      setUseEvalscriptUrl(true);
    }
    // eslint-disable-next-line
  }, [visualizedEvalscriptUrl]);

  useEffect(() => {
    window.location.hash = locationHash;
  }, [locationHash]);

  useEffect(() => {
    //reset datafusion internal state when dataset is changed
    if (datasetId && previousDatasetId && datasetId !== previousDatasetId) {
      setDataFusion([]);
    }
  }, [datasetId, previousDatasetId]);

  async function getAllLayers() {
    setLayers([]);
    if (!datasourceHandler) {
      return;
    }
    setLoadingLayersInProgress(true);
    const selectedTheme = themesLists[selectedThemesListId].find((t) => t.id === selectedThemeId);
    const urls = datasourceHandler.getUrlsForDataset(datasetId);
    const shJsDatasetId = datasourceHandler.getSentinelHubDataset(datasetId)
      ? datasourceHandler.getSentinelHubDataset(datasetId).id
      : null;
    let allLayers = [];

    for (let url of urls) {
      const { layersExclude, layersInclude, name } = selectedTheme.content.find((t) => t.url === url);

      let shjsLayers = await LayersFactory.makeLayers(
        url,
        (_, dataset) => (!shJsDatasetId ? true : dataset.id === shJsDatasetId),
        null,
        reqConfigMemoryCache,
      );
      if (datasourceHandler.updateLayersOnVisualization()) {
        // We have to update layers to get thier legend info and additionally acquisitionMode, polarization for S1. WMS layers don't need updating
        await Promise.all(
          shjsLayers.map(async (l) => {
            await l.updateLayerFromServiceIfNeeded(reqConfigMemoryCache);
          }),
        );
      }
      let layers = datasourceHandler.getLayers(
        shjsLayers,
        datasetId,
        url,
        layersExclude,
        layersInclude,
        fromTime,
      );
      for (let layer of layers) {
        if (allLayers.find((l) => l.layerId === layer.layerId)) {
          layer.description += ` (${name})`;
        }
      }

      allLayers = [...allLayers, ...layers];
    }
    allLayers = sortLayers(allLayers);
    setLayers(allLayers);
    setLoadingLayersInProgress(false);
  }

  function setSelectedVisualization(layer) {
    setLocationHash('');
    const isEffectsApplied = isVisualizationEffectsApplied(effects);

    const supportsOpenEO = isOpenEoSupported(
      layer.url,
      layer.layerId,
      IMAGE_FORMATS.PNG,
      isEffectsApplied,
      false,
    );
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        visualizationUrl: layer.url,
        layerId: layer.layerId,
        customSelected: false,
        evalscript: null,
        evalscripturl: null,
        visibleOnMap: true,
        dataFusion: [],
        selectedProcessing: supportsOpenEO ? PROCESSING_OPTIONS.OPENEO : PROCESSING_OPTIONS.PROCESS_API,
        processGraph: supportsOpenEO ? JSON.stringify(getProcessGraph(layer.url, layer.layerId)) : '',
      }),
    );
  }

  function onSelectCustomVisualization() {
    if (evalscriptUrl) {
      setLocationHash(CUSTOM_VISUALIZATION_URL_ROUTES[2]);
      return;
    }
    if (evalscript) {
      if (parseEvalscriptBands(evalscript).length === 3) {
        setLocationHash(CUSTOM_VISUALIZATION_URL_ROUTES[0]);
      } else if (parseIndexEvalscript(evalscript)) {
        setLocationHash(CUSTOM_VISUALIZATION_URL_ROUTES[1]);
      } else {
        setLocationHash(CUSTOM_VISUALIZATION_URL_ROUTES[2]);
      }
      return;
    }

    const bands = datasourceHandler.getBands(datasetId);
    const selectedBands = [...bands, ...bands, ...bands].slice(0, 3).map((b) => b.name);

    setLocationHash(CUSTOM_VISUALIZATION_URL_ROUTES[0]);
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        layerId: null,
        customSelected: true,
        visibleOnMap: true,
        visualizationUrl: layers[0].url,
        evalscript: customEvalscript || datasourceHandler.generateEvalscript(selectedBands, datasetId),
        selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
        processGraph: '',
      }),
    );
  }

  function setEvalScriptAndCustomVisualization(layerId) {
    const layer = layers.find((l) => l.layerId === layerId);
    if (layer) {
      const supportsOpenEO = isOpenEoSupported(layer.url, layer.layerId);

      // Update local state as well
      setEvalscript(layer.evalscript);
      setCustomEvalscript(layer.evalscript);

      store.dispatch(
        visualizationSlice.actions.setVisualizationParams({
          evalscript: layer.evalscript,
          layerId: layer.layerId,
          visualizationUrl: layer.url,
          customSelected: true,
          visibleOnMap: true,
          evalscripturl: null,
          dataFusion: [],
          selectedProcessing: supportsOpenEO ? PROCESSING_OPTIONS.OPENEO : PROCESSING_OPTIONS.PROCESS_API,
          processGraph: supportsOpenEO ? JSON.stringify(getProcessGraph(layer.url, layer.layerId)) : '',
        }),
      );
      setLocationHash(CUSTOM_VISUALIZATION_URL_ROUTES[2]);
    }
  }

  function onCompositeChange(bands) {
    const evalscript = datasourceHandler.generateEvalscript(bands, datasetId);
    setCustomEvalscript(evalscript);
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        evalscript,
      }),
    );
  }

  function onIndexScriptChange(bands, config) {
    const evalscript = datasourceHandler.generateEvalscript(bands, datasetId, config);
    if (Object.values(bands).some((item) => item === null)) {
      setEvalscript(evalscript);
    } else {
      store.dispatch(visualizationSlice.actions.setVisualizationParams({ evalscript: evalscript }));
    }
    setCustomEvalscript(evalscript);
  }

  function onUpdateScript({ evalscript, evalscripturl, isEvalUrl }) {
    setCustomEvalscript(evalscript);
    setEvalscript(evalscript);
    setEvalscriptUrl(evalscripturl);
    setUseEvalscriptUrl(isEvalUrl);
  }

  function onVisualizeEditorEvalscript() {
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        customSelected: true,
        visibleOnMap: true,
        dataFusion: dataFusion,
        evalscript: evalscript,
        evalscripturl: evalscriptUrl,
        selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
      }),
    );
  }

  if (!dataSourcesInitialized || displayEffects) {
    return null;
  }

  if (loadingLayersInProgress) {
    return <Loader />;
  }
  if (customSelected && CUSTOM_VISUALIZATION_URL_ROUTES.includes(locationHash)) {
    return (
      <CustomVisualizationLayer
        datasetId={datasetId}
        visualizationUrl={visualizationUrl}
        evalscriptUrl={evalscriptUrl}
        evalscript={evalscript}
        dataFusion={dataFusion}
        fromTime={fromTime}
        toTime={toTime}
        useEvalscriptUrl={useEvalscriptUrl}
        onUpdateScript={onUpdateScript}
        setDataFusion={setDataFusion}
        onBackToLayerList={onBackToLayerList}
        onVisualizeEditorEvalscript={onVisualizeEditorEvalscript}
        onCompositeChange={onCompositeChange}
        onIndexScriptChange={onIndexScriptChange}
        savePin={savePin}
        processGraph={''}
      />
    );
  }

  const supportsCustom = datasourceHandler && datasourceHandler.supportsCustomLayer(datasetId);

  return (
    <Visualizations
      visualizations={layers}
      selectedLayer={selectedLayerId}
      setSelectedVisualization={setSelectedVisualization}
      setCustomVisualization={onSelectCustomVisualization}
      supportsCustom={supportsCustom}
      setEvalScriptAndCustomVisualization={setEvalScriptAndCustomVisualization}
      savePin={savePin}
      toggleLayerActions={toggleLayerActions}
      layerActionsOpen={layerActionsOpen}
    />
  );
}

const mapStoreToProps = (store) => ({
  selectedLayerId: store.visualization.layerId,
  visualizedEvalscript: store.visualization.evalscript,
  customSelected: store.visualization.customSelected,
  visualizedDataFusion: store.visualization.dataFusion,
  datasetId: store.visualization.datasetId,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  visualizationUrl: store.visualization.visualizationUrl,
  visualizedEvalscriptUrl: store.visualization.evalscripturl,
  selectedThemeId: store.themes.selectedThemeId,
  selectedThemesListId: store.themes.selectedThemesListId,
  themesLists: store.themes.themesLists,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  selectedLanguage: store.language.selectedLanguage,
  effects: getVisualizationEffectsFromStore(store),
});

export default connect(mapStoreToProps, null)(LayerSelection);
