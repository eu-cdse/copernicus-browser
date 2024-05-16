import React, { useState } from 'react';
import { connect } from 'react-redux';
import moment from 'moment';
import { t } from 'ttag';
import { getOrbitDirectionFromList } from './VisualizationPanel.utils';
import { findLatestDateWithData, isDatasetIdGIBS } from './LatestDataAction.utils';
import store, { visualizationSlice } from '../../../store';
import Loader from '../../../Loader/Loader';

function LatestDataAction({ datasetId, bounds, pixelBounds, setShowingNoDataFoundAction, orbitDirection }) {
  const [loading, setLoading] = useState(false);

  async function getAndSetLatestDateWithData() {
    setLoading(true);
    const latestDateWithAvailableData = await findLatestDateWithData({
      datasetId,
      bounds,
      pixelBounds,
      orbitDirection,
    });
    if (latestDateWithAvailableData) {
      const isGIBS = isDatasetIdGIBS(datasetId);
      const fromTime = isGIBS ? null : moment.utc(latestDateWithAvailableData).startOf('day');
      const toTime = moment.utc(latestDateWithAvailableData).endOf('day');
      store.dispatch(
        visualizationSlice.actions.setVisualizationParams({
          fromTime: fromTime,
          toTime: toTime,
        }),
      );
    } else {
      setShowingNoDataFoundAction(true);
    }
    setLoading(false);
  }
  return (
    <div className="smart-panel-action latest-data-action">
      <div className="message">{t`Please select a date or click the button below`}:</div>
      <div className="btn-loader-wrapper">
        <div
          className="eob-btn smart-panel-action-btn show-latest-data-btn"
          onClick={getAndSetLatestDateWithData}
        >{t`Show latest data`}</div>
        {loading && <Loader />}
      </div>
      <div className="blue-triangle-topright"></div>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  bounds: store.mainMap.bounds,
  pixelBounds: store.mainMap.pixelBounds,
  datasetId: store.visualization.datasetId,
  selectedLanguage: store.language.selectedLanguage,
  orbitDirection: getOrbitDirectionFromList(store.visualization.orbitDirection),
});

export default connect(mapStoreToProps, null)(LatestDataAction);
