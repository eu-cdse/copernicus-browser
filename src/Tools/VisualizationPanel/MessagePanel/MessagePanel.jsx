import React, { useEffect } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';

import VisualizationErrorPanel from './VisualizationErrorPanel';
import { NotificationPanel } from '../../../junk/NotificationPanel/NotificationPanel';
import ExternalLink from '../../../ExternalLink/ExternalLink';
import store, { notificationSlice, themesSlice, visualizationSlice } from '../../../store';

import './MessagePanel.scss';
import useLoginLogout from '../../../Auth/loginLogout/useLoginLogout';

function MessagePanel({
  error,
  panelError,
  failedThemeParts,
  selectedMode,
  selectedTabIndex,
  selectedThemeId,
  datasetId,
  layerId,
  customSelected,
  toTime,
}) {
  const { doLogout } = useLoginLogout();

  function closePanel() {
    store.dispatch(visualizationSlice.actions.setError(null));
    store.dispatch(notificationSlice.actions.displayPanelError(null));
    store.dispatch(themesSlice.actions.setFailedThemeParts([]));
  }

  useEffect(() => {
    store.dispatch(visualizationSlice.actions.setError(null));
  }, [selectedMode, selectedTabIndex, selectedThemeId]);

  useEffect(() => {
    if (datasetId && (layerId || customSelected) && toTime) {
      store.dispatch(themesSlice.actions.setFailedThemeParts([]));
    }
  }, [datasetId, layerId, customSelected, toTime]);

  if (!error && !panelError && failedThemeParts.length < 1) {
    return null;
  }

  return (
    <div className="message-panel">
      <div className="message-panel-header">
        <div className="message-panel-icon">
          <i className="fa fa-exclamation-circle" />
        </div>
        <div onClick={closePanel} className="close-message-panel">
          <i className="fas fa-times" />
        </div>
      </div>
      <div className="message-panel-messages">
        {error && <VisualizationErrorPanel error={error} />}
        {panelError && (
          <NotificationPanel
            msg={
              <div>
                <span>{panelError.message}</span>
                {panelError.link ? (
                  <ExternalLink href={panelError.link}>
                    <i className="fas fa-external-link-alt" />
                  </ExternalLink>
                ) : null}
                {panelError.logout && (
                  <div className="message-panel-logout" onClick={doLogout} title={t`Logout`}>{t`Logout`}</div>
                )}
              </div>
            }
            type="nothing"
          />
        )}
        {failedThemeParts.length > 0 && (
          <NotificationPanel
            type="nothing"
            additionalClass="notification-error-themes"
            msg={
              <div>
                {t`Error retrieving additional data!`}
                <div>
                  <span>{t`These are theme parts which contain unavailable data sources:`}</span>
                  <ul style={{ textAlign: 'left' }}>
                    {failedThemeParts.map((f) => (
                      <li key={f}>{f}</li>
                    ))}
                  </ul>
                </div>
              </div>
            }
          />
        )}
      </div>
    </div>
  );
}

const mapStoreToProps = (store) => ({
  error: store.visualization.error,
  panelError: store.notification.panelError,
  failedThemeParts: store.themes.failedThemeParts,
  selectedMode: store.modes.selectedMode,
  selectedTabIndex: store.tabs.selectedTabIndex,
  selectedThemeId: store.themes.selectedThemeId,
  datasetId: store.visualization.datasetId,
  layerId: store.visualization.layerId,
  customSelected: store.visualization.customSelected,
  toTime: store.visualization.toTime,
});

export default connect(mapStoreToProps, null)(MessagePanel);
