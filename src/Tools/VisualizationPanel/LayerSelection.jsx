import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { LayersFactory } from '@sentinel-hub/sentinelhub-js';

import Visualizations from './Visualizations';
import CustomVisualizationLayer from './VisualizationLayer/CustomVisualizationLayer';
import Loader from '../../Loader/Loader';
import { CUSTOM_VISUALIZATION_URL_ROUTES } from '../../junk/EOBAdvancedHolder/EOBAdvancedHolder';
import { getDataSourceHandler } from '../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { YYYY_MM_REGEX } from '../SearchPanel/dataSourceHandlers/PlanetBasemapDataSourceHandler';
import { PLANET_NICFI } from '../SearchPanel/dataSourceHandlers/dataSourceConstants';
import { sortLayers } from './VisualizationPanel.utils';
import store, { visualizationSlice } from '../../store';
import { parseEvalscriptBands, parseIndexEvalscript } from '../../utils';
import { usePrevious } from '../../hooks/usePrevious';

import { reqConfigMemoryCache, DATASOURCES } from '../../const';

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
}) {
  const [layers, setLayers] = useState([]);
  const [loadingLayersInProgress, setLoadingLayersInProgress] = useState(false);
  const [evalscript, setEvalscript] = useState(visualizedEvalscript);
  const [customEvalscript, setCustomEvalscript] = useState(null);
  const [evalscriptUrl, setEvalscriptUrl] = useState(visualizedEvalscriptUrl);
  const [useEvalscriptUrl, setUseEvalscriptUrl] = useState(!!visualizedEvalscriptUrl);
  const [dataFusion, setDataFusion] = useState(visualizedDataFusion);
  const previousSelectedLayerId = usePrevious(selectedLayerId);
  const previousDatasetId = usePrevious(datasetId);

  const datasourceHandler = getDataSourceHandler(datasetId);

  useEffect(() => {
    if (datasetId && dataSourcesInitialized) {
      getAllLayers();
    }
    // eslint-disable-next-line
  }, [dataSourcesInitialized, datasetId, visualizationUrl]);

  useEffect(() => {
    // Layers and dates work differently for Planet NICFI than other datasets
    // We do not change the date on a layer, as a layer only has one date(sensing timeTange) for the mosaic
    // If the selected date changes, we need to get all layers that has data for that date
    if (dataSourcesInitialized && datasetId && datasetId === PLANET_NICFI) {
      getAllLayers();
    }
    // eslint-disable-next-line
  }, [toTime]);

  useEffect(() => {
    if (layers.length > 0 && !customSelected) {
      if (
        datasourceHandler &&
        datasourceHandler.datasource === DATASOURCES.PLANET_NICFI &&
        previousSelectedLayerId &&
        selectedLayerId
      ) {
        // If NDVI layer is currently selected and date changes, we will get a new list of layers
        // Find the NDVI from the new list and select this layer as the selected layer
        const selectedLayerDateArr = previousSelectedLayerId.match(YYYY_MM_REGEX);
        const newSelectedLayer = layers.find((l) => {
          const currentLayerDateArr = l.layerId.match(YYYY_MM_REGEX);
          return (
            l.layerId.replace(currentLayerDateArr.join('_'), '_DATE_') ===
            previousSelectedLayerId.replace(selectedLayerDateArr.join('_'), '_DATE_')
          );
        });
        store.dispatch(
          visualizationSlice.actions.setVisualizationParams({
            layerId: newSelectedLayer.layerId,
            visibleOnMap: true,
          }),
        );
      } else if (!selectedLayerId || !layers.find((l) => l.layerId === selectedLayerId)) {
        const newLayerId = layers[0].layerId;
        store.dispatch(
          visualizationSlice.actions.setVisualizationParams({
            layerId: newLayerId,
            visibleOnMap: true,
          }),
        );
      }
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
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        visualizationUrl: layer.url,
        layerId: layer.layerId,
        customSelected: false,
        evalscript: null,
        evalscripturl: null,
        visibleOnMap: true,
        dataFusion: [],
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
      }),
    );
  }

  function setEvalScriptAndCustomVisualization(layerId) {
    const layer = layers.find((l) => l.layerId === layerId);
    if (layer) {
      store.dispatch(
        visualizationSlice.actions.setVisualizationParams({
          evalscript: layer.evalscript,
          layerId: null,
          customSelected: true,
          visibleOnMap: true,
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
        layerId: null,
        customSelected: true,
        visibleOnMap: true,
        dataFusion: dataFusion,
        evalscript: evalscript,
        evalscripturl: evalscriptUrl,
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
});

export default connect(mapStoreToProps, null)(LayerSelection);
