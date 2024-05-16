import React from 'react';

import './NotificationPanel.scss';

export const NotificationPanel = ({ type, msg, additionalClass }) => {
  let icon = '';
  switch (type) {
    case 'error':
      icon = 'exclamation-circle';
      break;
    case 'ok':
      icon = 'check-circle';
      break;
    case 'warning':
      icon = 'exclamation-triangle';
      break;
    case 'info':
      icon = 'info-circle';
      break;
    case 'loading':
      icon = 'spinner fa-spin fa-fw';
      break;
    case 'nothing':
      icon = '';
      break;
    default:
      break;
  }

  return (
    <div className={`notification ${additionalClass ? additionalClass : ''}`}>
      {icon !== '' && <i className={`fa fa-${icon}`} style={{ marginRight: '6px' }} />}
      {msg}
    </div>
  );
};
