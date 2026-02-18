import React, { Component } from 'react';
import moment from 'moment';
import { t } from 'ttag';

import Highlight from './Highlight';
import store, { visualizationSlice, mainMapSlice, pinsSlice, clmsSlice } from '../../../store';
import { getDataSourceHandler } from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { fetchEvalscriptFromEvalscripturl, parsePosition } from '../../../utils';
import {
  constructEffectsFromPinOrHighlight,
  isVisualizationEffectsApplied,
} from '../../../utils/effectsUtils';
import { setTerrainViewerFromPin } from '../../../TerrainViewer/TerrainViewer.utils';

import './Highlights.scss';
import { SAVED_PINS, UNSAVED_PINS, USE_PINS_BACKEND } from '../../Pins/PinPanel';
import { getPinsFromSessionStorage, savePinsToServer, savePinsToSessionStorage } from '../../Pins/Pin.utils';
import { connect } from 'react-redux';
import { IMAGE_FORMATS } from '../../../Controls/ImgDownload/consts';
import { isOpenEoSupported } from '../../../api/openEO/openEOHelpers';
import { PROCESSING_OPTIONS } from '../../../const';

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

  onPinSelect = async (pin, comparingPins, sharePins) => {
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
      dataFusion,
      terrainViewerSettings,
      dateMode,
      mosaickingOrder,
      upsampling,
      downsampling,
      cloudCoverage,
    } = pin;

    if (comparingPins || sharePins) {
      return;
    }

    const dataSourceHandler = getDataSourceHandler(datasetId);
    if (dataSourceHandler === null) {
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

    // Handle CLMS parameters if present
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
    const isEffectsApplied = isVisualizationEffectsApplied(effects);
    const supportsOpenEO = isOpenEoSupported(
      visualizationUrl,
      datasetId,
      IMAGE_FORMATS.PNG,
      isEffectsApplied,
      evalscript || evalscripturl,
    );
    let visualizationParams = {
      datasetId: datasetId,
      visualizationUrl: visualizationUrl,
      fromTime: pinTimeFrom,
      toTime: pinTimeTo,
      visibleOnMap: true,
      dataFusion: dataFusion,
      selectedProcessing: supportsOpenEO ? PROCESSING_OPTIONS.OPENEO : PROCESSING_OPTIONS.PROCESS_API,
      ...(dateMode ? { dateMode: dateMode } : {}),
      ...(mosaickingOrder ? { mosaickingOrder: mosaickingOrder } : {}),
      ...(upsampling ? { upsampling: upsampling } : {}),
      ...(downsampling ? { downsampling: downsampling } : {}),
      ...(cloudCoverage ? { cloudCoverage: cloudCoverage } : {}),
    };

    const hasEvalscript = Boolean(evalscript);
    const hasEvalscriptUrl = Boolean(evalscripturl);

    if (!hasEvalscript && !hasEvalscriptUrl) {
      visualizationParams.layerId = layerId;
      store.dispatch(visualizationSlice.actions.setVisualizationParams(visualizationParams));
      return;
    }

    visualizationParams.customSelected = true;
    visualizationParams.evalscript = hasEvalscript ? evalscript : undefined;
    visualizationParams.evalscripturl = evalscripturl;

    store.dispatch(visualizationSlice.actions.setVisualizationParams(visualizationParams));

    if (hasEvalscriptUrl && !hasEvalscript) {
      try {
        const { data } = await fetchEvalscriptFromEvalscripturl(evalscripturl);
        if (data) {
          store.dispatch(visualizationSlice.actions.setEvalscript(data));
        }
      } catch {
        // ignore fetch error — keep using evalscripturl
      }
    }

    visualizationParams = { ...visualizationParams, ...effects };

    store.dispatch(visualizationSlice.actions.setVisualizationParams(visualizationParams));

    setTerrainViewerFromPin({
      lat: parsedLat,
      lng: parsedLng,
      zoom: parsedZoom,
      terrainViewerSettings: terrainViewerSettings,
      is3D: this.props.is3D,
      terrainViewerId: this.props.terrainViewerId,
    });

    this.setState({ selectedPin: pin });
  };

  savePin = async (pin) => {
    const { newPinsCount, userdata } = this.props;

    if (USE_PINS_BACKEND && userdata) {
      await savePinsToServer([{ ...pin }]);
    } else {
      savePinsToSessionStorage([{ ...pin }]);
    }

    store.dispatch(pinsSlice.actions.setNewPinsCount(newPinsCount + 1));
  };

  setHighlightsSection = () => {
    const { highlights, is3D } = this.props;

    // Sort highlights by date (newest first)
    const sortedHighlights = [...highlights].sort((a, b) => {
      const getDate = (pin) => {
        const dateStr = pin.fromTime || pin.toTime;
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
});

export default connect(mapStoreToProps, null)(Highlights);
