import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';

import { getUrlParams, parsePosition, parseDataFusion, fetchEvalscriptFromEvalscripturl } from '../utils';
import store, {
  mainMapSlice,
  visualizationSlice,
  themesSlice,
  indexSlice,
  terrainViewerSlice,
  timelapseSlice,
  modalSlice,
  compareLayersSlice,
  tabsSlice,
  clmsSlice,
} from '../store';
import { b64DecodeUnicode, b64EncodeUnicode } from '../utils/base64MDN';

import { COMPARE_OPTIONS, DEFAULT_LAT_LNG, PROCESSING_OPTIONS, SHOW_TUTORIAL_LC, TABS } from '../const';
import { ModalId } from '../const';
import { IS_3D_MODULE_ENABLED } from '../TerrainViewer/TerrainViewer.const';
import { getSharedPins } from '../Tools/Pins/Pin.utils';
import { decrypt } from '../utils/encrypt';
import { doesUserHaveAccessToCCMVisualization } from '../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/ccmProductTypeAccessRightsConfig';
import {
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
  S2_L2A_CDAS,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { saveToLocalStorage } from '../utils/localStorage.utils';
import { isOpenEoSupported } from '../api/openEO/openEOHelpers';
import { IMAGE_FORMATS } from '../Controls/ImgDownload/consts';
import { isVisualizationEffectsApplied } from '../utils/effectsUtils';

class URLParamsParser extends React.Component {
  state = {
    params: null,
  };

  async componentDidMount() {
    let params = getUrlParams();

    params = await this.parseEvalscriptFromEvalscriptUrl(params);

    const hasAccessToCCMVisualization = doesUserHaveAccessToCCMVisualization(this.props.user.access_token);
    if (
      [
        CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
        CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
        CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
      ].includes(params.datasetId) &&
      !hasAccessToCCMVisualization
    ) {
      params.datasetId = S2_L2A_CDAS;
      params.layerId = '1_TRUE_COLOR';
    }

    this.checkAndDisplayTutorial(params);
    this.setStore(params);
    this.setState({
      params: params,
    });
  }

  parseEvalscriptFromEvalscriptUrl = async (params) => {
    const { evalscripturl } = params;

    if (!evalscripturl) {
      return params;
    }

    const { data } = await fetchEvalscriptFromEvalscripturl(evalscripturl);

    return {
      ...params,
      evalscript: b64EncodeUnicode(data),
    };
  };

  checkAndDisplayTutorial = (params) => {
    const { shouldDisplayTutorial } = params;

    if (shouldDisplayTutorial === 'true') {
      saveToLocalStorage(SHOW_TUTORIAL_LC, true);
    }
  };

  setStore = (params) => {
    const {
      zoom,
      lat,
      lng,
      fromTime,
      toTime,
      datasetId,
      visualizationUrl,
      layerId,
      evalscript,
      evalscripturl,
      themesUrl,
      gain,
      gamma,
      redRange,
      greenRange,
      blueRange,
      minQa,
      mosaickingOrder,
      upsampling,
      downsampling,
      speckleFilter,
      orthorectification,
      demSource3D,
      backscatterCoeff,
      dataFusion,
      handlePositions,
      gradient,
      terrainViewerSettings,
      timelapse,
      timelapseSharePreviewMode,
      previewFileUrl,
      orbitDirection,
      cloudCoverage,
      compareShare,
      compareSharedPinsId,
      compareMode,
      comparedOpacity,
      comparedClipping,
      dateMode,
      clmsSelectedPath,
      clmsSelectedCollection,
      clmsSelectedConsolidationPeriodIndex,
      useEvoland,
    } = params;
    let { lat: parsedLat, lng: parsedLng, zoom: parsedZoom } = parsePosition(lat, lng, zoom);

    if (parsedLat > 90 || parsedLat < -90 || parsedLng > 180 || parsedLng < -180) {
      parsedLng = DEFAULT_LAT_LNG.lng;
      parsedLat = DEFAULT_LAT_LNG.lat;
    }
    store.dispatch(mainMapSlice.actions.setPosition({ zoom: parsedZoom, lat: parsedLat, lng: parsedLng }));
    const decryptedVisualisationUrl =
      visualizationUrl && !visualizationUrl.startsWith('https')
        ? decrypt(visualizationUrl)
        : visualizationUrl;

    const customSelected = evalscript || evalscripturl ? true : undefined;
    const newVisualizationParams = {
      datasetId: datasetId,
      fromTime: fromTime ? moment.utc(fromTime) : null,
      toTime: toTime ? moment.utc(toTime) : null,
      visualizationUrl: decryptedVisualisationUrl,
      layerId,
      evalscript: evalscript ? b64DecodeUnicode(evalscript) : undefined,
      customSelected: customSelected,
      evalscripturl,
      gainEffect: gain ? parseFloat(gain) : undefined,
      gammaEffect: gamma ? parseFloat(gamma) : undefined,
      redRangeEffect: redRange ? JSON.parse(redRange) : undefined,
      greenRangeEffect: greenRange ? JSON.parse(greenRange) : undefined,
      blueRangeEffect: blueRange ? JSON.parse(blueRange) : undefined,

      minQa: minQa ? parseInt(minQa) : undefined,
      mosaickingOrder: mosaickingOrder,
      upsampling: upsampling,
      downsampling: downsampling,
      speckleFilter: speckleFilter ? JSON.parse(speckleFilter) : undefined,
      orthorectification: orthorectification ? JSON.parse(orthorectification) : undefined,
      demSource3D: demSource3D ? JSON.parse(demSource3D) : undefined,
      backscatterCoeff: backscatterCoeff ? JSON.parse(backscatterCoeff) : undefined,
      dataFusion: dataFusion ? parseDataFusion(dataFusion, datasetId) : undefined,
      orbitDirection: orbitDirection ? JSON.parse(orbitDirection) : undefined,
      cloudCoverage: cloudCoverage && !isNaN(cloudCoverage) ? JSON.parse(cloudCoverage) : undefined,
      dateMode: dateMode,
      useEvoland: useEvoland,
      visibleOnMap: (layerId || customSelected) && datasetId && decryptedVisualisationUrl,
      selectedProcessing: isOpenEoSupported(
        decryptedVisualisationUrl,
        layerId,
        IMAGE_FORMATS.PNG,
        isVisualizationEffectsApplied({ effects: { gain, gamma, redRange, greenRange, blueRange } }),
        evalscript || evalscripturl,
      )
        ? PROCESSING_OPTIONS.OPENEO
        : PROCESSING_OPTIONS.PROCESS_API,
    };
    store.dispatch(visualizationSlice.actions.setVisualizationParams(newVisualizationParams));
    if (datasetId && !compareShare) {
      store.dispatch(tabsSlice.actions.setTabIndex(TABS.VISUALIZE_TAB));
    }

    if (handlePositions && gradient) {
      const parsedGradient = gradient.split(',');
      const parsedHandlePositions = handlePositions.split(',').map((position) => parseFloat(position));

      store.dispatch(indexSlice.actions.setHandlePositions(parsedHandlePositions));
      store.dispatch(indexSlice.actions.setGradient(parsedGradient));
    }

    if (themesUrl) {
      store.dispatch(themesSlice.actions.setThemesUrl(themesUrl));
    }

    if (useEvoland !== undefined) {
      store.dispatch(themesSlice.actions.setUseEvoland(useEvoland === 'true'));
    }

    if (IS_3D_MODULE_ENABLED && terrainViewerSettings) {
      let parsedTerrainViewerSettings;
      try {
        parsedTerrainViewerSettings = JSON.parse(terrainViewerSettings);
        if (Object.keys(parsedTerrainViewerSettings).length > 0) {
          store.dispatch(
            terrainViewerSlice.actions.setTerrainViewerSettings(JSON.parse(terrainViewerSettings)),
          );
          store.dispatch(mainMapSlice.actions.setIs3D(true));
        }
      } catch (err) {
        console.error('Parsing terrain viewer settings failed:', err);
      }
    }

    if (timelapse) {
      store.dispatch(timelapseSlice.actions.set(JSON.parse(timelapse)));
      store.dispatch(modalSlice.actions.addModal({ modal: ModalId.TIMELAPSE }));

      if (timelapseSharePreviewMode) {
        store.dispatch(
          timelapseSlice.actions.setTimelapseSharePreviewMode(JSON.parse(timelapseSharePreviewMode)),
        );
      }

      if (previewFileUrl) {
        store.dispatch(timelapseSlice.actions.setPreviewFileUrl(previewFileUrl));
      }
    }

    if (clmsSelectedPath) {
      store.dispatch(clmsSlice.actions.setSelectedPath(clmsSelectedPath));
    }
    if (clmsSelectedCollection) {
      store.dispatch(clmsSlice.actions.setSelectedCollection(clmsSelectedCollection));
    }
    if (clmsSelectedConsolidationPeriodIndex) {
      store.dispatch(
        clmsSlice.actions.setSelectedConsolidationPeriodIndex(parseInt(clmsSelectedConsolidationPeriodIndex)),
      );
    }

    if (compareShare) {
      (async () => {
        const pins = await getSharedPins(compareSharedPinsId);

        let compareModeOption = Object.keys(COMPARE_OPTIONS).find(
          (key) => COMPARE_OPTIONS[key].value === compareMode,
        );

        store.dispatch(
          compareLayersSlice.actions.restoreComparedLayers({
            compareShare: params.compareShare,
            compareSharedPinsId: params.compareSharedPinsId,
            layers: pins.items,
            compareMode: compareModeOption
              ? COMPARE_OPTIONS[compareModeOption]
              : COMPARE_OPTIONS.COMPARE_SPLIT,
            comparedOpacity: JSON.parse(comparedOpacity),
            comparedClipping: JSON.parse(comparedClipping),
          }),
        );
        store.dispatch(tabsSlice.actions.setTabIndex(TABS.VISUALIZE_TAB));
      })();
    }
  };

  render() {
    const { params } = this.state;
    if (!params) {
      return null;
    }

    return this.props.children({
      themeId: params.themeId,
      sharedPinsListId: params.sharedPinsListId,
      compareShare: params.compareShare,
    });
  }
}

const mapStoreToProps = (store) => ({
  user: store.auth.user,
});

export default connect(mapStoreToProps, null)(URLParamsParser);
