import React from 'react';
import { connect } from 'react-redux';
import { getZoomConfiguration } from '../Tools/SearchPanel/dataSourceHandlers/helper';
import { t } from 'ttag';
import { EOBButton } from '../junk/EOBCommon//EOBButton/EOBButton';
import { TABS } from '../const';

import './FloatingNotificationPanel.scss';
import store, { mainMapSlice } from '../store';
import useLoginLogout from '../Auth/loginLogout/useLoginLogout';

const FloatingNotificationWrapper = ({ toolsOpen, children }) => {
  return (
    <div className={`floating-notification-panel ${toolsOpen ? 'tools-opened' : 'tools-closed'}`}>
      {children}
    </div>
  );
};

function RenderUserAuthError({ userAuthError, toolsOpen }) {
  const { doLogin } = useLoginLogout();

  return (
    <FloatingNotificationWrapper toolsOpen={toolsOpen}>
      <div className="message">{userAuthError}</div>
      <EOBButton
        text={t`Login again`}
        onClick={async () => {
          await doLogin();
        }}
      ></EOBButton>
    </FloatingNotificationWrapper>
  );
}

function RenderZoomInAlert({ toolsOpen }) {
  return (
    <FloatingNotificationWrapper toolsOpen={toolsOpen}>
      <div className="message">{t`Please zoom in or search for a location of interest`}</div>
    </FloatingNotificationWrapper>
  );
}

function RenderMapLoadingMessage({ toolsOpen, mapLoadingMessage }) {
  return (
    <FloatingNotificationWrapper toolsOpen={toolsOpen}>
      <div className="message">{mapLoadingMessage}</div>
      <EOBButton
        text={t`Close`}
        onClick={() => store.dispatch(mainMapSlice.actions.setLoadingMessage(null))}
      ></EOBButton>
    </FloatingNotificationWrapper>
  );
}

function FloatingNotificationPanel({
  zoom,
  datasetId,
  selectedTabIndex,
  userAuthError,
  toolsOpen,
  mapLoadingMessage,
}) {
  function showZoomInAlert() {
    const { min: minZoom } = getZoomConfiguration(datasetId);
    return selectedTabIndex === TABS.VISUALIZE_TAB && zoom < minZoom;
  }

  if (userAuthError) {
    return RenderUserAuthError({ userAuthError, toolsOpen });
  }

  if (showZoomInAlert()) {
    return RenderZoomInAlert({ toolsOpen });
  }

  if (mapLoadingMessage) {
    return RenderMapLoadingMessage({ toolsOpen, mapLoadingMessage });
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
  mapLoadingMessage: store.mainMap.loadingMessage,
});

export default connect(mapStoreToProps, null)(FloatingNotificationPanel);
