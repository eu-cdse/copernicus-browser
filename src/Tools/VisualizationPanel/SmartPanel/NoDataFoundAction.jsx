import React, { useEffect, useState, useRef } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { t } from 'ttag';

import Loader from '../../../Loader/Loader';
import {
  getLatestTileLocation,
  getNearestLocationWithData,
  findAvailableCollectionsWithData,
  isDatasetIdGIBS,
} from './LatestDataAction.utils';
import store, { mainMapSlice, visualizationSlice } from '../../../store';

function NoDataFoundAction({
  lat,
  lng,
  zoom,
  datasetId,
  fromTime,
  toTime,
  bounds,
  pixelBounds,
  setShowingNoDataFoundAction,
  selectedThemeId,
}) {
  const AVAILABLE_COLLECTIONS_LIMIT = 5;
  const [availableCollectionsWithData, setAvailableCollectionsWithData] = useState([]);
  const [alreadyCheckedAvailableCollections, setAlreadyCheckedAvailableCollections] = useState([]);
  const [loadingAvailableCollections, setLoadingAvailableCollections] = useState(false);
  const [loadingLatest, setLoadingLatest] = useState(false);
  const [loadingNearest, setLoadingNearest] = useState(false);
  const firstUpdate = useRef(true);

  useEffect(() => {
    if (firstUpdate.current) {
      firstUpdate.current = false;
      return;
    }
    setShowingNoDataFoundAction(false);
    // eslint-disable-next-line
  }, [lat, lng, zoom, datasetId, fromTime, toTime, selectedThemeId]);

  useEffect(() => {
    setLoadingAvailableCollections(true);
    findAvailableCollectionsWithData({
      bounds: bounds,
      pixelBounds: pixelBounds,
      nCollectionsLimit: AVAILABLE_COLLECTIONS_LIMIT,
      setAvailableCollectionsWithData: setAvailableCollectionsWithData,
      nDays: 14,
      setAlreadyCheckedAvailableCollections: setAlreadyCheckedAvailableCollections,
    }).then(() => setLoadingAvailableCollections(false));
    // eslint-disable-next-line
  }, []);

  async function goToLocationWithLatestData() {
    setLoadingLatest(true);
    const latestTileLocation = await getLatestTileLocation(datasetId);
    if (latestTileLocation) {
      const { lat: newLat, lng: newLng, zoom: newZoom, fromTime, toTime } = latestTileLocation;
      setNewLocationAndTime({
        lat: newLat,
        lng: newLng,
        zoom: newZoom,
        fromTime: fromTime,
        toTime: toTime,
      });
    }
    setLoadingLatest(false);
  }

  async function goToNearestLocationWithData() {
    setLoadingNearest(true);
    const nearestLocation = await getNearestLocationWithData(datasetId, bounds);
    if (nearestLocation) {
      const { lat: newLat, lng: newLng, zoom: newZoom, fromTime, toTime } = nearestLocation;
      setNewLocationAndTime({
        lat: newLat,
        lng: newLng,
        zoom: newZoom,
        fromTime: fromTime,
        toTime: toTime,
      });
    }
    setLoadingNearest(false);
  }

  function setNewLocationAndTime({ lat, lng, zoom, fromTime, toTime }) {
    store.dispatch(
      mainMapSlice.actions.setPosition({
        lat: lat,
        lng: lng,
        zoom: zoom,
      }),
    );
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        fromTime: fromTime,
        toTime: toTime,
      }),
    );
  }

  function onSelectAvailableCollectionWithData(datasetId, sensingTime) {
    const fromTime = isDatasetIdGIBS(datasetId) ? null : moment.utc(sensingTime).startOf('day');
    const toTime = moment.utc(sensingTime).endOf('day');
    store.dispatch(visualizationSlice.actions.setNewDatasetId({ datasetId: datasetId }));
    store.dispatch(
      visualizationSlice.actions.setVisualizationParams({
        fromTime: fromTime,
        toTime: toTime,
      }),
    );
    setShowingNoDataFoundAction(false);
  }

  function loadMoreAvailableCollectionsWithData() {
    setLoadingAvailableCollections(true);
    findAvailableCollectionsWithData({
      bounds: bounds,
      pixelBounds: pixelBounds,
      setAvailableCollectionsWithData: setAvailableCollectionsWithData,
      nDays: 14,
      collectionsToSkip: alreadyCheckedAvailableCollections,
      setAlreadyCheckedAvailableCollections: setAlreadyCheckedAvailableCollections,
    }).then(() => setLoadingAvailableCollections(false));
  }

  const buttonsDisabled = loadingNearest || loadingLatest;

  return (
    <div className="smart-panel-action no-data-found-action">
      <div className="message">{t`There is no data on this location for any date. Please select an option below:`}</div>
      <div className="btn-loader-wrapper">
        <div
          className={`eob-btn smart-panel-action-btn no-data-found-action-btn ${
            buttonsDisabled ? 'disabled' : ''
          }`}
          onClick={goToLocationWithLatestData}
        >{t`Go to location with latest data`}</div>
        {loadingLatest && <Loader />}
      </div>
      <div className="btn-loader-wrapper">
        <div
          className={`eob-btn smart-panel-action-btn no-data-found-action-btn ${
            buttonsDisabled ? 'disabled' : ''
          }`}
          onClick={goToNearestLocationWithData}
        >{t`Go to nearest location with data`}</div>
        {loadingNearest && <Loader />}
      </div>
      {availableCollectionsWithData.length > 0 && (
        <div className="message">{t`Available collections with data on this location within the last 2 weeks:`}</div>
      )}
      {availableCollectionsWithData.map(({ datasetId, label, sensingTime }) => (
        <div
          className={`eob-btn available-collections-btn ${buttonsDisabled ? 'disabled' : ''}`}
          key={datasetId}
          onClick={() => onSelectAvailableCollectionWithData(datasetId, sensingTime)}
        >
          {label}
        </div>
      ))}
      {loadingAvailableCollections && <Loader />}
      {availableCollectionsWithData.length === AVAILABLE_COLLECTIONS_LIMIT &&
        !loadingAvailableCollections && (
          <div
            className={`eob-btn available-collections-btn ${buttonsDisabled ? 'disabled' : ''}`}
            onClick={loadMoreAvailableCollectionsWithData}
          >
            ...
          </div>
        )}
      <div className="blue-triangle-topright"></div>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
  zoom: store.mainMap.zoom,
  bounds: store.mainMap.bounds,
  pixelBounds: store.mainMap.pixelBounds,
  datasetId: store.visualization.datasetId,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  selectedThemeId: store.themes.selectedThemeId,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(NoDataFoundAction);
