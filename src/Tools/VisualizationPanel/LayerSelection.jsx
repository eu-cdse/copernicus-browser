import React, { useState, useEffect, useCallback } from 'react';
import { connect } from 'react-redux';
import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

import Visualizations from './Visualizations';
import CustomVisualizationLayer from './VisualizationLayer/CustomVisualizationLayer';
import Loader from '../../Loader/Loader';
import {
  CUSTOM_VISUALIZATION_URL_ROUTES,
  CUSTOM_COMPOSITE_ROUTE,
  CUSTOM_INDEX_ROUTE,
  CUSTOM_SCRIPT_ROUTE,
} from '../../junk/EOBAdvancedHolder/EOBAdvancedHolder';
import { getDataSourceHandler } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { sortLayers } from './VisualizationPanel.utils';
import {
  generateFallbackEvalscript,
  getDefaultBandNames,
  getLayerProcessingInfo,
  validateEvalscript,
  validateProcessGraph,
} from './LayerSelection.utils';
import store, { visualizationSlice, notificationSlice } from '../../store';
import { t } from 'ttag';
import { parseEvalscriptBands, parseIndexEvalscript } from '../../utils';
import { usePrevious } from '../../hooks/usePrevious';

import { PROCESSING_OPTIONS, reqConfigMemoryCache } from '../../const';
import { getProcessGraphString, isOpenEoSupported } from '../../api/openEO/openEOHelpers';
import { getVisualizationEffectsFromStore } from '../../utils/effectsUtils';
import { IMAGE_FORMATS } from '../../Controls/ImgDownload/consts';

const LayerSelection = ({
  selectedLayerId,
  visualizedEvalscript,
  customSelected,
  visualizedDataFusion,
  datasetId,
  fromTime,
  toTime,
  visualizationUrl,
  visualizedEvalscriptUrl,
  visualizedProcessGraph,
  visualizedProcessGraphUrl,
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
  selectedProcessing,
}) => {
  const [layers, setLayers] = useState([]);
  const [loadingLayersInProgress, setLoadingLayersInProgress] = useState(false);
  const [evalscript, setEvalscript] = useState(visualizedEvalscript);
  const [customEvalscript, setCustomEvalscript] = useState(null);
  const [evalscriptUrl, setEvalscriptUrl] = useState(visualizedEvalscriptUrl);
  const [useEvalscriptUrl, setUseEvalscriptUrl] = useState(!!visualizedEvalscriptUrl);
  const [dataFusion, setDataFusion] = useState(visualizedDataFusion);
  const [processGraph, setProcessGraph] = useState(visualizedProcessGraph);
  const [processGraphUrl, setProcessGraphUrl] = useState(visualizedProcessGraphUrl);
  const [useProcessGraphUrl, setUseProcessGraphUrl] = useState(!!visualizedProcessGraphUrl);
  const [savedCustomState, setSavedCustomState] = useState(null);
  const previousDatasetId = usePrevious(datasetId);

  const datasourceHandler = getDataSourceHandler(datasetId);

  const saveCustomState = useCallback(() => {
    setSavedCustomState({
      layerId: selectedLayerId,
      visualizationUrl,
      evalscript,
      processGraph,
      evalscriptUrl,
      useEvalscriptUrl,
      processGraphUrl,
      useProcessGraphUrl,
      dataFusion,
      selectedProcessing,
    });
  }, [
    selectedLayerId,
    visualizationUrl,
    evalscript,
    processGraph,
    evalscriptUrl,
    useEvalscriptUrl,
    processGraphUrl,
    useProcessGraphUrl,
    dataFusion,
    selectedProcessing,
  ]);

  const setSelectedVisualization = useCallback(
    (layer) => {
      if (!customSelected && layer?.layerId === selectedLayerId && layer?.url === visualizationUrl) {
        return;
      }
      saveCustomState();
      setLocationHash('');
      const { supportsOpenEO, processGraphValue } = getLayerProcessingInfo(layer);

      setProcessGraph(processGraphValue);

      store.dispatch(
        visualizationSlice.actions.setVisualizationParams({
          visualizationUrl: layer.url,
          layerId: layer.layerId,
          customSelected: false,
          visibleOnMap: true,
          dataFusion: [],
          selectedProcessing: supportsOpenEO ? PROCESSING_OPTIONS.OPENEO : PROCESSING_OPTIONS.PROCESS_API,
          processGraph: processGraphValue,
          isProcessGraphModified: false,
        }),
      );
      setUseEvalscriptUrl(false);
      setUseProcessGraphUrl(false);
    },
    [customSelected, selectedLayerId, visualizationUrl, saveCustomState, setLocationHash],
  );

  useEffect(() => {
    if (!datasetId || !dataSourcesInitialized || !datasourceHandler) {
      return;
    }

    let cancelled = false;

    const loadLayers = async () => {
      setLayers([]);
      setLoadingLayersInProgress(true);
      try {
        const selectedTheme = themesLists[selectedThemesListId].find((t) => t.id === selectedThemeId);
        const urls = datasourceHandler.getUrlsForDataset(datasetId);
        const shJsDatasetId = datasourceHandler.getSentinelHubDataset(datasetId)
          ? datasourceHandler.getSentinelHubDataset(datasetId).id
          : null;

        const layerArrays = await Promise.all(
          urls.map(async (url) => {
            const { layersExclude, layersInclude, name } = selectedTheme.content.find((t) => t.url === url);

            let shjsLayers = await LayersFactory.makeLayers(
              url,
              (_, dataset) => (!shJsDatasetId ? true : dataset.id === shJsDatasetId),
              null,
              reqConfigMemoryCache,
            );

            if (datasourceHandler.updateLayersOnVisualization()) {
              await Promise.all(
                shjsLayers.map(async (l) => {
                  await l.updateLayerFromServiceIfNeeded(reqConfigMemoryCache);
                }),
              );
            }

            const layers = datasourceHandler.getLayers(
              shjsLayers,
              datasetId,
              url,
              layersExclude,
              layersInclude,
            );

            return { layers, name };
          }),
        );

        let allLayers = [];
        for (const { layers, name } of layerArrays) {
          const processedLayers = layers.map((layer) => {
            if (allLayers.find((l) => l.layerId === layer.layerId)) {
              return { ...layer, description: `${layer.description} (${name})` };
            }
            return layer;
          });
          allLayers = [...allLayers, ...processedLayers];
        }

        allLayers = sortLayers(allLayers);
        if (!cancelled) {
          setLayers(allLayers);
        }
      } catch (error) {
        console.error('Failed to load layers:', error);
      } finally {
        if (!cancelled) {
          setLoadingLayersInProgress(false);
        }
      }
    };

    loadLayers();

    return () => {
      cancelled = true;
    };
  }, [
    dataSourcesInitialized,
    datasetId,
    datasourceHandler,
    themesLists,
    selectedThemesListId,
    selectedThemeId,
  ]);

  useEffect(() => {
    if (layers.length === 0 || customSelected) {
      return;
    }

    const currentlySelectedLayer = layers.find(
      (layer) => layer.layerId === selectedLayerId && layer.url === visualizationUrl,
    );

    if (selectedLayerId && visualizationUrl && currentlySelectedLayer) {
      return;
    }

    const layerMatchingUrl = visualizationUrl && layers.find((l) => l.url === visualizationUrl);
    const layerToSelect = layerMatchingUrl || layers[0];

    if (layerToSelect) {
      setSelectedVisualization(layerToSelect);
    }
  }, [layers, customSelected, selectedLayerId, visualizationUrl, setSelectedVisualization]);

  useEffect(() => {
    setEvalscript(visualizedEvalscript);
  }, [visualizedEvalscript]);

  useEffect(() => {
    setEvalscriptUrl(visualizedEvalscriptUrl);
    if (visualizedEvalscriptUrl) {
      setUseEvalscriptUrl(true);
    }
  }, [visualizedEvalscriptUrl]);

  useEffect(() => {
    setProcessGraph(visualizedProcessGraph);
  }, [visualizedProcessGraph]);

  useEffect(() => {
    setProcessGraphUrl(visualizedProcessGraphUrl);
    if (visualizedProcessGraphUrl) {
      setUseProcessGraphUrl(true);
    }
  }, [visualizedProcessGraphUrl]);

  useEffect(() => {
    window.location.hash = locationHash;
  }, [locationHash]);

  useEffect(() => {
    //reset datafusion internal state when dataset is changed
    if (datasetId && previousDatasetId && datasetId !== previousDatasetId) {
      setDataFusion([]);
    }
  }, [datasetId, previousDatasetId]);

  // Process API fallback: Load default evalscript when switching to custom mode
  useEffect(() => {
    if (!customSelected || layers.length === 0 || selectedProcessing !== PROCESSING_OPTIONS.PROCESS_API) {
      return;
    }

    if (evalscript || evalscriptUrl) {
      return;
    }

    const activeLayer =
      layers.find((layer) => layer.layerId === selectedLayerId) ||
      layers.find((layer) => layer.url === visualizationUrl) ||
      layers[0];

    if (!activeLayer) {
      return;
    }

    const fallbackEvalscript = generateFallbackEvalscript(activeLayer, datasetId, datasourceHandler);

    if (!fallbackEvalscript) {
      return;
    }

    setEvalscript(fallbackEvalscript);
    setCustomEvalscript(fallbackEvalscript);
    setEvalscriptUrl(null);
    setUseEvalscriptUrl(false);
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        evalscript: fallbackEvalscript,
        evalscriptUrl: null,
        selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
      }),
    );
  }, [
    customSelected,
    layers,
    selectedLayerId,
    visualizationUrl,
    selectedProcessing,
    evalscript,
    evalscriptUrl,
    datasetId,
    datasourceHandler,
  ]);

  // OpenEO fallback: Load default process graph when switching to custom mode
  useEffect(() => {
    if (!customSelected || layers.length === 0 || selectedProcessing !== PROCESSING_OPTIONS.OPENEO) {
      return;
    }

    if (processGraph || processGraphUrl) {
      return;
    }

    const activeLayer =
      layers.find((layer) => layer.layerId === selectedLayerId) ||
      layers.find((layer) => layer.url === visualizationUrl) ||
      layers[0];

    if (!activeLayer) {
      return;
    }

    const supportsOpenEO = isOpenEoSupported(activeLayer.url, activeLayer.layerId, IMAGE_FORMATS.PNG, false);
    const fallbackProcessGraph = getProcessGraphString(activeLayer.url, activeLayer.layerId, supportsOpenEO);

    if (!fallbackProcessGraph) {
      return;
    }

    setProcessGraph(fallbackProcessGraph);
    setProcessGraphUrl(null);
    setUseProcessGraphUrl(false);
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        processGraph: fallbackProcessGraph,
        processGraphUrl: null,
        selectedProcessing: PROCESSING_OPTIONS.OPENEO,
        isProcessGraphModified: false,
      }),
    );
  }, [
    customSelected,
    layers,
    selectedLayerId,
    visualizationUrl,
    selectedProcessing,
    processGraph,
    processGraphUrl,
    datasetId,
    datasourceHandler,
  ]);

  // OpenEO fallback: Load default process graph when switching to custom mode
  useEffect(() => {
    if (!customSelected || layers.length === 0 || selectedProcessing !== PROCESSING_OPTIONS.OPENEO) {
      return;
    }

    if (processGraph || processGraphUrl) {
      return;
    }

    const activeLayer =
      layers.find((layer) => layer.layerId === selectedLayerId) ||
      layers.find((layer) => layer.url === visualizationUrl) ||
      layers[0];

    if (!activeLayer) {
      return;
    }

    const supportsOpenEO = isOpenEoSupported(activeLayer.url, activeLayer.layerId, IMAGE_FORMATS.PNG, false);
    const fallbackProcessGraph = getProcessGraphString(activeLayer.url, activeLayer.layerId, supportsOpenEO);

    if (!fallbackProcessGraph) {
      return;
    }

    setProcessGraph(fallbackProcessGraph);
    setProcessGraphUrl(null);
    setUseProcessGraphUrl(false);
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        processGraph: fallbackProcessGraph,
        processGraphUrl: null,
        selectedProcessing: PROCESSING_OPTIONS.OPENEO,
      }),
    );
  }, [
    customSelected,
    layers,
    selectedLayerId,
    visualizationUrl,
    selectedProcessing,
    processGraph,
    processGraphUrl,
  ]);

  const handleBackToLayerList = useCallback(() => {
    saveCustomState();
    onBackToLayerList();
  }, [saveCustomState, onBackToLayerList]);

  const onSelectCustomVisualization = useCallback(() => {
    if (savedCustomState) {
      setLocationHash(CUSTOM_COMPOSITE_ROUTE);

      store.dispatch(
        visualizationSlice.actions.setVisualizationParams({
          layerId: savedCustomState.layerId,
          customSelected: true,
          visibleOnMap: true,
          visualizationUrl: savedCustomState.visualizationUrl || visualizationUrl || layers[0]?.url,
          evalscript: savedCustomState.evalscript,
          evalscriptUrl: savedCustomState.useEvalscriptUrl ? savedCustomState.evalscriptUrl : null,
          processGraph: savedCustomState.processGraph,
          processGraphUrl: savedCustomState.useProcessGraphUrl ? savedCustomState.processGraphUrl : null,
          selectedProcessing: savedCustomState.selectedProcessing,
          dataFusion: savedCustomState.dataFusion,
        }),
      );
      return;
    }

    if (evalscriptUrl) {
      setLocationHash(CUSTOM_SCRIPT_ROUTE);
      return;
    }
    if (evalscript) {
      if (parseEvalscriptBands(evalscript).length === 3) {
        setLocationHash(CUSTOM_COMPOSITE_ROUTE);
      } else if (parseIndexEvalscript(evalscript)) {
        setLocationHash(CUSTOM_INDEX_ROUTE);
      } else {
        setLocationHash(CUSTOM_SCRIPT_ROUTE);
      }
      return;
    }

    const selectedBands = getDefaultBandNames(datasetId, datasourceHandler);

    setLocationHash(CUSTOM_COMPOSITE_ROUTE);
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        layerId: selectedLayerId,
        customSelected: true,
        visibleOnMap: true,
        visualizationUrl: visualizationUrl || layers[0]?.url,
        evalscript: customEvalscript || datasourceHandler.generateEvalscript(selectedBands, datasetId),
        selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
        processGraph: '',
        isProcessGraphModified: false,
      }),
    );
  }, [
    savedCustomState,
    setLocationHash,
    visualizationUrl,
    layers,
    evalscriptUrl,
    evalscript,
    datasetId,
    datasourceHandler,
    customEvalscript,
    selectedLayerId,
  ]);

  const setEvalScriptAndCustomVisualization = useCallback(
    (layerId) => {
      const layer = layers.find((l) => l.layerId === layerId);
      if (layer) {
        const { supportsOpenEO, processGraphValue } = getLayerProcessingInfo(layer);

        setEvalscript(layer.evalscript);
        setCustomEvalscript(layer.evalscript);
        setProcessGraph(processGraphValue);

        store.dispatch(
          visualizationSlice.actions.setVisualizationParams({
            evalscript: layer.evalscript,
            layerId: layer.layerId,
            visualizationUrl: layer.url,
            customSelected: true,
            visibleOnMap: true,
            evalscriptUrl: null,
            processGraphUrl: null,
            dataFusion: [],
            selectedProcessing: supportsOpenEO ? PROCESSING_OPTIONS.OPENEO : PROCESSING_OPTIONS.PROCESS_API,
            processGraph: processGraphValue,
            isProcessGraphModified: false,
          }),
        );
        setUseEvalscriptUrl(false);
        setUseProcessGraphUrl(false);
        setLocationHash(CUSTOM_SCRIPT_ROUTE);
      }
    },
    [layers, setLocationHash],
  );

  const onCompositeChange = useCallback(
    (bands) => {
      const evalscript = datasourceHandler.generateEvalscript(bands, datasetId);
      setCustomEvalscript(evalscript);
      store.dispatch(
        visualizationSlice.actions.setVisualizationParams({
          evalscript,
          selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
        }),
      );
    },
    [datasourceHandler, datasetId],
  );

  const onIndexScriptChange = useCallback(
    (bands, config) => {
      const evalscript = datasourceHandler.generateEvalscript(bands, datasetId, config);
      if (Object.values(bands).some((item) => item === null)) {
        setEvalscript(evalscript);
      } else {
        store.dispatch(visualizationSlice.actions.setVisualizationParams({ evalscript: evalscript }));
      }
      setCustomEvalscript(evalscript);
      store.dispatch(
        visualizationSlice.actions.setVisualizationParams({
          selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
        }),
      );
    },
    [datasourceHandler, datasetId],
  );

  const onUpdateEvalscript = useCallback(({ scriptContent, scriptUrl, isEvalUrl }) => {
    setCustomEvalscript(scriptContent);
    setEvalscript(scriptContent);
    setEvalscriptUrl(isEvalUrl ? scriptUrl : null);
    setUseEvalscriptUrl(!!isEvalUrl);
  }, []);

  const onUpdateProcessGraph = useCallback(({ scriptContent, scriptUrl, isProcessGraphUrl }) => {
    const content = scriptContent;
    setProcessGraph(content);
    setProcessGraphUrl(isProcessGraphUrl ? scriptUrl : null);
    setUseProcessGraphUrl(!!isProcessGraphUrl);
  }, []);

  const onUpdateScript = useCallback(
    (payload) => {
      if (selectedProcessing === PROCESSING_OPTIONS.OPENEO) {
        onUpdateProcessGraph(payload);
      } else {
        onUpdateEvalscript(payload);
      }
    },
    [selectedProcessing, onUpdateProcessGraph, onUpdateEvalscript],
  );

  const onVisualizeEditorEvalscript = useCallback(
    (newEvalscript, newEvalscriptUrl) => {
      const nextEvalscript = newEvalscript !== undefined ? newEvalscript : evalscript;
      const nextEvalscriptUrl = newEvalscriptUrl !== undefined ? newEvalscriptUrl : evalscriptUrl;

      if (nextEvalscript) {
        const validation = validateEvalscript(nextEvalscript);

        if (!validation.isValid) {
          store.dispatch(
            notificationSlice.actions.displayError(t`Invalid evalscript provided` + `: ${validation.error}`),
          );
          return;
        }

        store.dispatch(
          visualizationSlice.actions.setVisualizationParams({
            customSelected: true,
            visibleOnMap: true,
            dataFusion: dataFusion,
            evalscript: nextEvalscript,
            evalscriptUrl: useEvalscriptUrl ? nextEvalscriptUrl : null,
            selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
          }),
        );
      }
    },
    [evalscript, evalscriptUrl, useEvalscriptUrl, dataFusion],
  );

  const onVisualizeEditorOpenEO = useCallback(
    (newProcessGraph) => {
      const latestProcessGraph = newProcessGraph !== undefined ? newProcessGraph : processGraph;
      const latestProcessGraphUrl = processGraphUrl;

      if (latestProcessGraph) {
        const validation = validateProcessGraph(latestProcessGraph);

        if (!validation.isValid) {
          store.dispatch(
            notificationSlice.actions.displayError(
              t`Invalid OpenEO process graph provided` + `: ${validation.error}`,
            ),
          );
          return;
        }

        store.dispatch(
          visualizationSlice.actions.setVisualizationParams({
            customSelected: true,
            visibleOnMap: true,
            processGraph: validation.processGraphString,
            processGraphUrl: useProcessGraphUrl ? latestProcessGraphUrl : null,
            selectedProcessing: PROCESSING_OPTIONS.OPENEO,
            isProcessGraphModified: true,
          }),
        );
      }
    },
    [processGraph, processGraphUrl, useProcessGraphUrl],
  );

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
        processGraphUrl={processGraphUrl}
        useProcessGraphUrl={useProcessGraphUrl}
        onUpdateScript={onUpdateScript}
        setDataFusion={setDataFusion}
        onBackToLayerList={handleBackToLayerList}
        onVisualizeEditorEvalscript={onVisualizeEditorEvalscript}
        onVisualizeEditorOpenEO={onVisualizeEditorOpenEO}
        onCompositeChange={onCompositeChange}
        onIndexScriptChange={onIndexScriptChange}
        savePin={savePin}
        processGraph={processGraph}
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
};

const mapStoreToProps = (store) => ({
  selectedLayerId: store.visualization.layerId,
  visualizedEvalscript: store.visualization.evalscript,
  customSelected: store.visualization.customSelected,
  visualizedDataFusion: store.visualization.dataFusion,
  datasetId: store.visualization.datasetId,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  visualizationUrl: store.visualization.visualizationUrl,
  visualizedEvalscriptUrl: store.visualization.evalscriptUrl,
  visualizedProcessGraph: store.visualization.processGraph,
  visualizedProcessGraphUrl: store.visualization.processGraphUrl,
  selectedThemeId: store.themes.selectedThemeId,
  selectedThemesListId: store.themes.selectedThemesListId,
  themesLists: store.themes.themesLists,
  dataSourcesInitialized: store.themes.dataSourcesInitialized,
  selectedLanguage: store.language.selectedLanguage,
  effects: getVisualizationEffectsFromStore(store),
  selectedProcessing: store.visualization.selectedProcessing,
});

export default connect(mapStoreToProps, null)(LayerSelection);
