import React from 'react';
import moment from 'moment';
import { connect } from 'react-redux';
import jwt_dec from 'jwt-decode';

import { getUrlParams, parsePosition, parseDataFusion, fetchEvalscriptFromEvalscripturl } from '../utils';
import {
  datasourceToDatasetId,
  dataSourceToThemeId,
  getDatasetIdFromInstanceId,
  getNewDatasetPropertiesIfDeprecatedDatasetId,
  presetToLayerId,
} from '../utils/handleOldUrls';
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

import { COMPARE_OPTIONS, DEFAULT_LAT_LNG, SHOW_TUTORIAL_LC, TABS } from '../const';
import { ModalId } from '../const';
import { ACCESS_ROLES } from '../api/OData/assets/accessRoles';
import { IS_3D_MODULE_ENABLED } from '../TerrainViewer/TerrainViewer.const';
import { getSharedPins } from '../Tools/Pins/Pin.utils';
import { decrypt } from '../utils/encrypt';
import { CCM_ROLES } from '../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/ccmProductTypeAccessRightsConfig';
import {
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  S2_L2A_CDAS,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

class URLParamsParser extends React.Component {
  state = {
    params: null,
  };

  async componentDidMount() {
    let params = getUrlParams();
    // Check if the url contains EOB2 params and update them accordingly.
    if (this.containsEOB2Params(params)) {
      const translatedEOB2Params = await this.translateEOB2(params);
      params = {
        ...params,
        ...translatedEOB2Params,
      };
    }

    params = await this.parseEvalscriptFromEvalscriptUrl(params);

    const isUserCopernicusServicesUser =
      this.props.user.access_token !== null
        ? jwt_dec(this.props.user.access_token).realm_access.roles.includes(
            CCM_ROLES.COPERNICUS_SERVICES_CCM,
          ) ||
          jwt_dec(this.props.user.access_token).realm_access.roles.includes(ACCESS_ROLES.COPERNICUS_SERVICES)
        : false;

    if (
      [CDSE_CCM_VHR_IMAGE_2018_COLLECTION, CDSE_CCM_VHR_IMAGE_2021_COLLECTION].includes(params.datasetId) &&
      !isUserCopernicusServicesUser
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
      window.localStorage.setItem(SHOW_TUTORIAL_LC, true);
    }
  };

  containsEOB2Params = (params) => {
    return !!(
      params.instanceId ||
      params.time ||
      params.preset ||
      params.datasource ||
      params.gainOverride ||
      params.gammaOverride ||
      params.redRangeOverride ||
      params.greenRangeOverride ||
      params.blueRangeOverride
    );
  };

  translateEOB2 = async (params) => {
    let {
      time,
      preset,
      datasource,
      instanceId,
      gainOverride,
      gammaOverride,
      redRangeOverride,
      greenRangeOverride,
      blueRangeOverride,
    } = params;
    const EOB3Params = {};

    if (instanceId) {
      EOB3Params.themeId = instanceId.split('/').pop();
    }

    if (time) {
      const times = time.split('/');
      if (times.length === 2) {
        EOB3Params.fromTime = moment.utc(times[0]);
        EOB3Params.toTime = moment.utc(times[1]);
      } else {
        EOB3Params.fromTime = moment.utc(times[0]).startOf('day');
        EOB3Params.toTime = moment.utc(times[0]).endOf('day');
      }

      if (!EOB3Params.fromTime.isValid()) {
        EOB3Params.fromTime = moment.utc().startOf('day');
      }
      if (!EOB3Params.toTime.isValid()) {
        EOB3Params.toTime = moment.utc().endOf('day');
      }
    }

    //If datasource, 2 possible cases.
    //1. Basic link -> Convert datasource to datasetId and add it to params.
    //2. Theme link -> Convert datasource to datasetId + get the themeId -> add it to params.
    if (datasource) {
      let dataset = datasourceToDatasetId[datasource];
      if (dataset) {
        EOB3Params.datasetId = dataset;
        EOB3Params.layerId = presetToLayerId(preset);
      }
      const themeId = dataSourceToThemeId[datasource];
      if (themeId) {
        EOB3Params.themeId = themeId;
      }
    }

    if (instanceId) {
      const dataset = await getDatasetIdFromInstanceId(instanceId, preset);
      if (dataset) {
        EOB3Params.datasetId = dataset;
        EOB3Params.layerId = presetToLayerId(preset);
      }
    }

    if (gainOverride !== undefined) {
      EOB3Params.gain = gainOverride;
    }
    if (gammaOverride !== undefined) {
      EOB3Params.gamma = gammaOverride;
    }
    if (redRangeOverride !== undefined) {
      EOB3Params.redRange = redRangeOverride;
    }
    if (greenRangeOverride !== undefined) {
      EOB3Params.greenRange = greenRangeOverride;
    }
    if (blueRangeOverride !== undefined) {
      EOB3Params.blueRange = blueRangeOverride;
    }

    return EOB3Params;
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
    } = params;
    let { lat: parsedLat, lng: parsedLng, zoom: parsedZoom } = parsePosition(lat, lng, zoom);

    if (parsedLat > 90 || parsedLat < -90 || parsedLng > 180 || parsedLng < -180) {
      parsedLng = DEFAULT_LAT_LNG.lng;
      parsedLat = DEFAULT_LAT_LNG.lat;
    }
    store.dispatch(mainMapSlice.actions.setPosition({ zoom: parsedZoom, lat: parsedLat, lng: parsedLng }));

    const newVisualizationParams = {
      datasetId: datasetId,
      fromTime: fromTime ? moment.utc(fromTime) : null,
      toTime: toTime ? moment.utc(toTime) : null,
      visualizationUrl:
        visualizationUrl && !visualizationUrl.startsWith('https')
          ? decrypt(visualizationUrl)
          : visualizationUrl,
      layerId,
      evalscript: evalscript ? b64DecodeUnicode(evalscript) : undefined,
      customSelected: evalscript || evalscripturl ? true : undefined,
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
      ...getNewDatasetPropertiesIfDeprecatedDatasetId(datasetId, visualizationUrl),
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
