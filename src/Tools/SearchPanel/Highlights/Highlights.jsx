import React, { Component } from 'react';
import moment from 'moment';
import { t } from 'ttag';

import Highlight from './Highlight';
import store, { visualizationSlice, mainMapSlice, pinsSlice } from '../../../store';
import { getDataSourceHandler } from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { parsePosition } from '../../../utils';
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
    };

    if (evalscript || evalscripturl) {
      visualizationParams.evalscript = evalscript;
      visualizationParams.evalscripturl = evalscripturl;
      visualizationParams.customSelected = true;
    } else {
      visualizationParams.layerId = layerId;
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
    return (
      <div className="highlights-panel">
        <div className="highlights-container">
          {highlights.map((pin, index) => (
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
