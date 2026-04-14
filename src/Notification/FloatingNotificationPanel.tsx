import React, { useEffect, useRef } from 'react';
import { connect } from 'react-redux';
import { getZoomConfiguration } from '../Tools/SearchPanel/dataSourceHandlers/helper';
import { t } from 'ttag';
import { EOBButton } from '../junk/EOBCommon//EOBButton/EOBButton';
import { TABS } from '../const';

import './FloatingNotificationPanel.scss';
import store, { mainMapSlice, visualizationSlice } from '../store';
import useLoginLogout from '../Auth/loginLogout/useLoginLogout';
import { RootState } from '../hooks';

type WithToolsOpen = {
  toolsOpen: boolean;
};

const FloatingNotificationWrapper = ({
  toolsOpen,
  children,
}: WithToolsOpen & { children: React.ReactNode }) => {
  return (
    <div className={`floating-notification-panel ${toolsOpen ? 'tools-opened' : 'tools-closed'}`}>
      {children}
    </div>
  );
};

function RenderUserAuthError({ userAuthError, toolsOpen }: { userAuthError: string; toolsOpen: boolean }) {
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

function RenderZoomInAlert({ toolsOpen }: WithToolsOpen) {
  return (
    <FloatingNotificationWrapper toolsOpen={toolsOpen}>
      <div className="message">{t`Please zoom in or search for a location of interest`}</div>
    </FloatingNotificationWrapper>
  );
}

function RenderResolutionAlert({ toolsOpen }: WithToolsOpen) {
  return (
    <FloatingNotificationWrapper toolsOpen={toolsOpen}>
      <div className="message">{t`Please zoom in to visualize the data`}</div>
    </FloatingNotificationWrapper>
  );
}

function RenderMapLoadingMessage({
  toolsOpen,
  mapLoadingMessage,
}: WithToolsOpen & { mapLoadingMessage: string }) {
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

type Props = {
  zoom: number;
  datasetId: string | undefined;
  // fromTime, toTime, and selectedLanguage are not used directly but are mapped from the store
  // to trigger a re-render when dates or language change, keeping the notification panel in sync.
  fromTime: string | null | undefined;
  toTime: string | null | undefined;
  selectedLanguage: string | null | undefined;
  selectedTabIndex: number;
  userAuthError: string | null | undefined;
  toolsOpen: boolean;
  mapLoadingMessage: string | null;
  resolutionTooLow: boolean;
};

function FloatingNotificationPanel({
  zoom,
  datasetId,
  selectedTabIndex,
  userAuthError,
  toolsOpen,
  mapLoadingMessage,
  resolutionTooLow,
}: Props) {
  const resolutionTooLowRef = useRef(resolutionTooLow);
  resolutionTooLowRef.current = resolutionTooLow;

  useEffect(() => {
    if (resolutionTooLowRef.current) {
      store.dispatch(visualizationSlice.actions.setResolutionTooLow(false));
    }
  }, [zoom]);

  function showZoomInAlert() {
    const { min: minZoom } = getZoomConfiguration(datasetId);
    return selectedTabIndex === TABS.VISUALIZE_TAB && zoom < minZoom;
  }

  if (userAuthError) {
    return <RenderUserAuthError userAuthError={userAuthError} toolsOpen={toolsOpen} />;
  }

  if (showZoomInAlert()) {
    return <RenderZoomInAlert toolsOpen={toolsOpen} />;
  }

  if (resolutionTooLow) {
    return <RenderResolutionAlert toolsOpen={toolsOpen} />;
  }

  if (mapLoadingMessage) {
    return <RenderMapLoadingMessage toolsOpen={toolsOpen} mapLoadingMessage={mapLoadingMessage} />;
  }
  return null;
}

const mapStoreToProps = (store: RootState) => ({
  zoom: store.mainMap.zoom,
  datasetId: store.visualization.datasetId,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  selectedLanguage: store.language.selectedLanguage,
  selectedTabIndex: store.tabs.selectedTabIndex,
  userAuthError: store.auth.user.error,
  toolsOpen: store.tools.open,
  mapLoadingMessage: store.mainMap.loadingMessage,
  resolutionTooLow: store.visualization.resolutionTooLow,
});

export default connect(mapStoreToProps, null)(FloatingNotificationPanel);
