import React from 'react';
import { useSelector } from 'react-redux';

import store, { floatingPanelNotificationSlice } from '../store';
import { useTimeout } from '../hooks/useTimeout';

import { successColor, warningColor } from '../variables.module.scss';

import './FloatingWorkspaceNotificationPanel.scss';

export const FloatingWorkspaceNotificationPanel = () => {
  const { notificationUniqueId, notificationAlertType, notificationMsg } = useSelector(
    (state) => state.floatingPanelNotification,
  );
  const delay = 3000;

  const setNotificationTimeout = () => store.dispatch(floatingPanelNotificationSlice.actions.reset());
  useTimeout(notificationUniqueId, delay, setNotificationTimeout);

  const alertTypeColors = {
    success: successColor,
    warning: warningColor,
  };

  const backgroundColor = alertTypeColors[notificationAlertType];

  return (
    notificationMsg && (
      <div className="notification-panel-workspace" style={{ backgroundColor }}>
        <div className={`notification-panel-text ${notificationAlertType}`}>{notificationMsg}</div>
      </div>
    )
  );
};
