import React, { Component } from 'react';
import moment from 'moment';
import { t } from 'ttag';
import { connect } from 'react-redux';

import Highlight from './Highlight';
import store, { visualizationSlice, mainMapSlice, collapsiblePanelSlice } from '../../../store';
import { getDataSourceHandler } from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { parsePosition } from '../../../utils';
import { NotificationPanel } from '../../../junk/NotificationPanel/NotificationPanel';
import { constructEffectsFromPinOrHighlight } from '../../../utils/effectsUtils';
import { setTerrainViewerFromPin } from '../../../TerrainViewer/TerrainViewer.utils';

import './Highlights.scss';
import CollapsiblePanel from '../../../components/CollapsiblePanel/CollapsiblePanel';

class Highlights extends Component {
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

    let visualizationParams = {
      datasetId: datasetId,
      visualizationUrl: visualizationUrl,
      fromTime: pinTimeFrom,
      toTime: pinTimeTo,
      visibleOnMap: true,
      dataFusion: dataFusion,
    };

    if (evalscript || evalscripturl) {
      visualizationParams.evalscript = evalscript;
      visualizationParams.evalscripturl = evalscripturl;
      visualizationParams.customSelected = true;
    } else {
      visualizationParams.layerId = layerId;
    }

    const effects = constructEffectsFromPinOrHighlight(pin);
    visualizationParams = { ...visualizationParams, ...effects };

    store.dispatch(visualizationSlice.actions.setVisualizationParams(visualizationParams));
    this.props.setSelectedHighlight(this.props.item);

    setTerrainViewerFromPin({
      lat: parsedLat,
      lng: parsedLng,
      zoom: parsedZoom,
      terrainViewerSettings: terrainViewerSettings,
      is3D: this.props.is3D,
      terrainViewerId: this.props.terrainViewerId,
    });
  };

  setHighlightsSection = (isExpanded) => {
    if (!isExpanded) {
      return;
    }

    const { highlights, isThemeSelected, is3D } = this.props;
    const noHighlightsInThemeMsg = t`This configuration has no highlights.`;
    const noThemeSelected = t`Please select a configuration.`;

    return (
      <div className="highlights-panel">
        {!isThemeSelected && (
          <div className="highlights-notifications">
            <NotificationPanel type="info" msg={noThemeSelected} />
          </div>
        )}

        {isThemeSelected && !highlights.length && (
          <div className="highlights-notifications">
            <NotificationPanel type="info" msg={noHighlightsInThemeMsg} />
          </div>
        )}
        {highlights.length > 0 && (
          <div className="highlights-container">
            {highlights.map((pin, index) => (
              <Highlight
                pin={pin}
                key={`${index}-${pin.title}-${pin._id}`}
                index={index}
                onSelect={() => this.onPinSelect(pin)}
                canAddToCompare={!is3D}
              />
            ))}
          </div>
        )}
      </div>
    );
  };

  setPanelHeader = () => {
    return <div className="highlights-panel-header">{t`Highlights`}:</div>;
  };

  render() {
    return (
      <CollapsiblePanel
        title={this.setPanelHeader()}
        headerComponent={this.setPanelHeader()}
        expanded={this.props.highlightsPanelExpanded}
        toggleExpanded={(v) => store.dispatch(collapsiblePanelSlice.actions.setHighlightsPanelExpanded(v))}
        className="highlights-panel-container"
      >
        {this.setHighlightsSection}
      </CollapsiblePanel>
    );
  }
}

const mapStoreToProps = (store) => ({
  highlightsPanelExpanded: store.collapsiblePanel.highlightsPanelExpanded,
});

export default connect(mapStoreToProps, null)(Highlights);
