import React, { useState, useRef } from 'react';
import { connect } from 'react-redux';

import ZoomInAction from './ZoomInAction';
import LatestDataAction from './LatestDataAction';
import NoDataFoundAction from './NoDataFoundAction';
import { getZoomConfiguration } from '../../SearchPanel/dataSourceHandlers/helper';
import { isZoomInActionAnimationDisabled, disableShowingZoomInActionAnimation } from './SmartPanel.utils';

import './SmartPanel.scss';

const ZOOM_IN_ANIMATION_DURATION = 3000;

function SmartPanel({ zoom, datasetId, fromTime, toTime, googleAPI, setIsShowLatestDataBtnActive }) {
  const [shouldDelayZoomInAction, setShouldDelayZoomInAction] = useState(false);
  const [showingNoDataFoundAction, setShowingNoDataFoundAction] = useState(false);
  const searchBarRef = useRef();

  function getAppropriateAction() {
    if (showingNoDataFoundAction) {
      return <NoDataFoundAction setShowingNoDataFoundAction={setShowingNoDataFoundAction} />;
    }
    const { min: minZoom, max: maxZoom } = getZoomConfiguration(datasetId);
    setIsShowLatestDataBtnActive(false);
    if (zoom < minZoom || shouldDelayZoomInAction) {
      return (
        <ZoomInAction
          googleAPI={googleAPI}
          minZoom={minZoom}
          maxZoom={maxZoom}
          onSelectLocationCallback={onSelectLocationCallback}
          shouldAnimate={!!shouldDelayZoomInAction}
          searchBarRef={searchBarRef}
        />
      );
    }
    if (datasetId && !fromTime && !toTime) {
      setIsShowLatestDataBtnActive(true);
      return <LatestDataAction setShowingNoDataFoundAction={setShowingNoDataFoundAction} />;
    }
  }

  function onSelectLocationCallback() {
    if (isZoomInActionAnimationDisabled()) {
      return;
    }
    setShouldDelayZoomInAction(true);
    setTimeout(() => {
      setShouldDelayZoomInAction(false);
      disableShowingZoomInActionAnimation();
    }, ZOOM_IN_ANIMATION_DURATION);
  }

  const action = getAppropriateAction();
  if (!action) {
    return null;
  }
  return (
    <>
      <div className="smart-panel">{action}</div>
      <div className="smart-panel-search-bar-holder" ref={searchBarRef} />
    </>
  );
}

const mapStoreToProps = (store) => ({
  zoom: store.mainMap.zoom,
  datasetId: store.visualization.datasetId,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  selectedLanguage: store.language.selectedLanguage,
});

export default connect(mapStoreToProps, null)(SmartPanel);
