import React, { Component } from 'react';
import moment from 'moment';
import { t } from 'ttag';

import Highlight from './Highlight';
import store, {
  visualizationSlice,
  mainMapSlice,
  pinsSlice,
  clmsSlice,
  compareLayersSlice,
} from '../../../store';
import { getDataSourceHandler } from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { parsePosition, fetchEvalscriptFromEvalscriptUrl } from '../../../utils';
import { constructEffectsFromPinOrHighlight } from '../../../utils/effectsUtils';
import { setTerrainViewerFromPin } from '../../../TerrainViewer/TerrainViewer.utils';

import './Highlights.scss';
import { SAVED_PINS, UNSAVED_PINS, USE_PINS_BACKEND } from '../../Pins/const';
import {
  getPinsFromSessionStorage,
  savePinsToServer,
  savePinsToSessionStorage,
  normalizePin,
} from '../../Pins/Pin.utils';
import { connect } from 'react-redux';
import { IMAGE_FORMATS } from '../../../Controls/ImgDownload/consts';
import { isOpenEoSupported } from '../../../api/openEO/openEOHelpers';
import { PROCESSING_OPTIONS, COMPARE_OPTIONS } from '../../../const';

function buildCompareLayerBase(pin, themeId) {
  const {
    zoom,
    lat,
    lng,
    datasetId,
    visualizationUrl,
    layerId,
    evalscript,
    evalscriptUrl,
    dataFusion,
    dateMode,
    cloudCoverage,
    mosaickingOrder,
    upsampling,
    downsampling,
  } = pin;
  return {
    zoom,
    lat,
    lng,
    datasetId,
    visualizationUrl,
    layerId,
    // evalscript/evalscriptUrl on the parent are intentionally overridden by each child layer
    // via { ...parentLayerBase, ...cl }. For compare highlights like NO2 Paris, these fields
    // are undefined on the parent and only defined on the individual comparedLayers entries.
    evalscript,
    evalscriptUrl,
    dataFusion,
    dateMode,
    cloudCoverage,
    mosaickingOrder,
    upsampling,
    downsampling,
    themeId,
  };
}

class Highlights extends Component {
  state = {
    selectedPinIndex: null,
  };

  componentDidMount() {
    if (USE_PINS_BACKEND && this.props.user) {
      this.fetchUserPins()
        .then((pins) => {
          this.setPinsInArray(pins, SAVED_PINS);
        })
        .catch(() => {});
    } else {
      let pins = getPinsFromSessionStorage();
      this.setPinsInArray(pins, UNSAVED_PINS);
    }
  }

  setPinsInArray = (pins, pinType) => {
    store.dispatch(
      pinsSlice.actions.updatePinsByType({
        pins: pins,
        pinType: pinType,
      }),
    );
  };

  onPinSelect = async (rawPin, comparingPins, sharePins) => {
    const pin = normalizePin(rawPin);
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
      evalscriptUrl,
      dataFusion,
      terrainViewerSettings,
      dateMode,
      mosaickingOrder,
      upsampling,
      downsampling,
      cloudCoverage,
      compareMode,
      comparedOpacity,
      comparedClipping,
      comparedLayers,
      themeId,
    } = pin;

    if (comparingPins || sharePins) {
      return;
    }

    const datasetsToValidate =
      Array.isArray(comparedLayers) && comparedLayers.length > 0
        ? comparedLayers.map((cl) => cl.datasetId)
        : [datasetId];
    if (datasetsToValidate.some((id) => getDataSourceHandler(id) === null)) {
      console.error('a valid dataset was not found for the clicked pin.');
      return;
    }

    const { lat: parsedLat, lng: parsedLng, zoom: parsedZoom } = parsePosition(lat, lng, zoom);
    store.dispatch(visualizationSlice.actions.reset());
    store.dispatch(
      mainMapSlice.actions.setPosition({
        lat: parsedLat,
        lng: parsedLng,
        zoom: parsedZoom,
      }),
    );

    let resolvedEvalscript = evalscript;
    if (!evalscript && evalscriptUrl) {
      try {
        const { data } = await fetchEvalscriptFromEvalscriptUrl(evalscriptUrl);
        resolvedEvalscript = data;
      } catch (e) {
        console.error('Failed to fetch evalscript from URL', e);
      }
    }

    if (Array.isArray(comparedLayers) && comparedLayers.length > 0) {
      store.dispatch(clmsSlice.actions.reset());
      const compareModeOption =
        Object.values(COMPARE_OPTIONS).find((cm) => cm.value === compareMode) ??
        COMPARE_OPTIONS.COMPARE_SPLIT;
      const parentLayerBase = buildCompareLayerBase(pin, themeId);
      const layersForCompare = comparedLayers.map((cl) => normalizePin({ ...parentLayerBase, ...cl }));
      store.dispatch(
        compareLayersSlice.actions.restoreComparedLayers({
          compareShare: false,
          compareSharedPinsId: null,
          layers: layersForCompare,
          compareMode: compareModeOption,
          comparedOpacity: comparedOpacity || new Array(comparedLayers.length).fill(1.0),
          comparedClipping: comparedClipping || new Array(comparedLayers.length).fill([0, 1]),
        }),
      );

      // Keep primary visualization context so layer view works when exiting compare mode.
      const primaryLayer = normalizePin(layersForCompare[0] || {});
      if (primaryLayer.datasetId && primaryLayer.visualizationUrl && primaryLayer.toTime) {
        const primaryDsh = getDataSourceHandler(primaryLayer.datasetId);
        const primarySupportsTimeRange = primaryDsh ? primaryDsh.supportsTimeRange() : true;
        const primaryFromTime = primarySupportsTimeRange
          ? primaryLayer.fromTime
            ? moment.utc(primaryLayer.fromTime)
            : moment.utc(primaryLayer.toTime).startOf('day')
          : null;

        const primaryHasEvalscript = Boolean(primaryLayer.evalscript || primaryLayer.evalscriptUrl);
        const primarySelectedProcessing = primaryHasEvalscript
          ? PROCESSING_OPTIONS.PROCESS_API
          : isOpenEoSupported(primaryLayer.visualizationUrl, primaryLayer.layerId, IMAGE_FORMATS.PNG, false)
          ? PROCESSING_OPTIONS.OPENEO
          : PROCESSING_OPTIONS.PROCESS_API;
        const primaryScriptParams = primaryHasEvalscript
          ? {
              customSelected: true,
              evalscript: primaryLayer.evalscript,
              evalscriptUrl: primaryLayer.evalscriptUrl,
              processGraph: '',
              processGraphUrl: null,
            }
          : { layerId: primaryLayer.layerId };
        const primaryEffects = constructEffectsFromPinOrHighlight(primaryLayer);

        store.dispatch(
          visualizationSlice.actions.setVisualizationParams({
            datasetId: primaryLayer.datasetId,
            visualizationUrl: primaryLayer.visualizationUrl,
            fromTime: primaryFromTime,
            toTime: moment.utc(primaryLayer.toTime),
            visibleOnMap: true,
            dataFusion: primaryLayer.dataFusion,
            selectedProcessing: primarySelectedProcessing,
            ...primaryScriptParams,
            ...primaryEffects,
            ...(primaryLayer.dateMode ? { dateMode: primaryLayer.dateMode } : {}),
            ...(primaryLayer.mosaickingOrder ? { mosaickingOrder: primaryLayer.mosaickingOrder } : {}),
            ...(primaryLayer.upsampling ? { upsampling: primaryLayer.upsampling } : {}),
            ...(primaryLayer.downsampling ? { downsampling: primaryLayer.downsampling } : {}),
            ...(primaryLayer.cloudCoverage !== undefined
              ? { cloudCoverage: primaryLayer.cloudCoverage }
              : {}),
          }),
        );
      }

      if (this.props.setComparePanel) {
        this.props.setComparePanel(true);
      }
      return;
    }

    const dataSourceHandler = getDataSourceHandler(datasetId);

    // Handle CLMS parameters if present
    store.dispatch(clmsSlice.actions.reset());
    const { clmsSelectedPath, clmsSelectedCollection, clmsSelectedConsolidationPeriodIndex } = pin;
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

    let pinTimeFrom, pinTimeTo;

    if (dataSourceHandler.supportsTimeRange()) {
      pinTimeFrom = fromTime ? moment.utc(fromTime) : moment.utc(toTime).startOf('day');
      pinTimeTo = fromTime ? moment.utc(toTime) : moment.utc(toTime).endOf('day');
    } else {
      pinTimeTo = moment.utc(toTime);
    }

    const effects = constructEffectsFromPinOrHighlight(pin);

    // Determine selectedProcessing following the decision order:
    // 1. Custom evalscript → PROCESS_API
    // 2. OpenEO support (only if no custom code)
    const hasEvalscript = Boolean(evalscript || evalscriptUrl);

    let selectedProcessing;
    if (hasEvalscript) {
      selectedProcessing = PROCESSING_OPTIONS.PROCESS_API;
    } else {
      // Only check OpenEO support if no custom code is present
      const supportsOpenEO = isOpenEoSupported(
        visualizationUrl,
        layerId,
        IMAGE_FORMATS.PNG,
        false, // no evalscript at this point
      );
      selectedProcessing = supportsOpenEO ? PROCESSING_OPTIONS.OPENEO : PROCESSING_OPTIONS.PROCESS_API;
    }

    let visualizationParams = {
      datasetId: datasetId,
      visualizationUrl: visualizationUrl,
      fromTime: pinTimeFrom,
      toTime: pinTimeTo,
      visibleOnMap: true,
      dataFusion: dataFusion,
      selectedProcessing: selectedProcessing,
      ...(dateMode ? { dateMode: dateMode } : {}),
      ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
      ...(upsampling ? { upsampling: upsampling } : {}),
      ...(downsampling ? { downsampling: downsampling } : {}),
      ...(cloudCoverage ? { cloudCoverage: cloudCoverage } : {}),
    };

    if (!hasEvalscript) {
      visualizationParams.layerId = layerId;
      store.dispatch(visualizationSlice.actions.setVisualizationParams(visualizationParams));
      return;
    }

    visualizationParams = {
      ...visualizationParams,
      ...effects,
      customSelected: true,
      evalscript: resolvedEvalscript,
      evalscriptUrl: evalscriptUrl,
      processGraph: '',
      processGraphUrl: null,
    };

    store.dispatch(visualizationSlice.actions.setVisualizationParams(visualizationParams));

    setTerrainViewerFromPin({
      lat: parsedLat,
      lng: parsedLng,
      zoom: parsedZoom,
      terrainViewerSettings: terrainViewerSettings,
      is3D: this.props.is3D,
      terrainViewerId: this.props.terrainViewerId,
    });
  };

  savePin = async (pin) => {
    const { newPinsCount, userdata, themeId } = this.props;
    const { comparedLayers } = pin;

    // Highlights are always from the currently selected theme. Use the active themeId
    // so the saved pin can be correctly restored from the Pins panel. The themeId stored on
    // highlight objects (e.g. 'HIGHLIGHT') is not a real theme ID and would cause a
    // "Selected themeId does not exist!" error when clicking the pin.

    let pinsToSave;
    if (Array.isArray(comparedLayers) && comparedLayers.length > 0) {
      const parentLayerBase = buildCompareLayerBase(pin, themeId);
      pinsToSave = comparedLayers.map((cl) => normalizePin({ ...parentLayerBase, ...cl }));
    } else {
      pinsToSave = [normalizePin({ ...pin, themeId })];
    }

    if (USE_PINS_BACKEND && userdata) {
      await savePinsToServer(pinsToSave);
    } else {
      savePinsToSessionStorage(pinsToSave);
    }

    store.dispatch(pinsSlice.actions.setNewPinsCount(newPinsCount + pinsToSave.length));
  };

  setHighlightsSection = () => {
    const { highlights, is3D } = this.props;

    // Sort highlights by date (newest first)
    const sortedHighlights = [...highlights].sort((a, b) => {
      const getDate = (pin) => {
        const comparedDate = pin.comparedLayers
          ?.map((cl) => cl.fromTime || cl.toTime)
          .filter(Boolean)
          .sort()
          .at(-1);
        const dateStr = pin.fromTime || pin.toTime || comparedDate;
        return dateStr ? moment.utc(dateStr).toDate() : moment.utc(0).toDate();
      };
      return getDate(b) - getDate(a);
    });

    return (
      <div className="highlights-panel">
        <div className="highlights-container">
          {sortedHighlights.map((pin, index) => (
            <Highlight
              pin={pin}
              key={`${index}-${pin.title}-${pin._id}`}
              index={index}
              onSelect={() => {
                this.onPinSelect(pin);
                this.setState({ selectedPinIndex: index });
              }}
              isSelected={this.state.selectedPinIndex === index}
              canAddToCompare={!is3D}
              savePin={this.savePin}
            />
          ))}
        </div>
      </div>
    );
  };

  render() {
    return (
      <div className={`highlights-panel-container`}>
        <div className="highlights-panel-title">{t`Highlights`}:</div>
        <div className={`content`}>{this.setHighlightsSection()}</div>
      </div>
    );
  }
}

const mapStoreToProps = (store) => ({
  newPinsCount: store.pins.newPinsCount,
  userdata: store.auth.user.userdata,
  themeId: store.themes.selectedThemeId,
});

export default connect(mapStoreToProps, null)(Highlights);
