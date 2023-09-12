import React from 'react';
import { connect } from 'react-redux';
import { getZoomConfiguration } from '../Tools/SearchPanel/dataSourceHandlers/helper';
import { t } from 'ttag';
import { EOBButton } from '../junk/EOBCommon//EOBButton/EOBButton';
import { TABS } from '../const';
import { openLoginWindow, onLogIn, decodeToken } from '../Auth/authHelpers';

import './FloatingNotificationPanel.scss';

function showUserAuthError(userAuthError, toolsOpen) {
  return (
    <div className={`floating-notification-panel ${toolsOpen ? 'tools-opened' : 'tools-closed'}`}>
      <div className="message">{userAuthError}</div>
      <EOBButton
        text={t`Login again`}
        onClick={async () => {
          const token = await openLoginWindow();
          onLogIn(token, decodeToken(token));
        }}
      ></EOBButton>
    </div>
  );
}

function FloatingNotificationPanel({ zoom, datasetId, selectedTabIndex, userAuthError, toolsOpen }) {
  function showZoomInAlert() {
    const { min: minZoom } = getZoomConfiguration(datasetId);
    return selectedTabIndex === TABS.VISUALIZE_TAB && zoom < minZoom;
  }

  if (userAuthError) {
    return showUserAuthError(userAuthError, toolsOpen);
  }

  if (showZoomInAlert()) {
    return (
      <div className={`floating-notification-panel ${toolsOpen ? 'tools-opened' : 'tools-closed'}`}>
        {t`Please zoom in or search for a location of interest`}
      </div>
    );
  }
  return null;
}

const mapStoreToProps = (store) => ({
  zoom: store.mainMap.zoom,
  datasetId: store.visualization.datasetId,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  selectedLanguage: store.language.selectedLanguage,
  selectedTabIndex: store.tabs.selectedTabIndex,
  userAuthError: store.auth.user.error,
  toolsOpen: store.tools.open,
});

export default connect(mapStoreToProps, null)(FloatingNotificationPanel);
