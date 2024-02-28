import React from 'react';

import './NotificationPanel.scss';

export const NotificationPanel = ({ type, msg, className, children }) => {
  let icon = null;
  switch (type) {
    case 'error':
      icon = 'exclamation-circle';
      break;
    case 'warning':
      icon = 'exclamation-triangle';
      break;
    case 'info':
      icon = 'info-circle';
      break;
    default:
      break;
  }

  const paragraphs = msg && msg.split('\n');

  return (
    <div className={`notification-panel ${className || ''}`}>
      {icon && <i className={`fas fa-${icon}`} />}
      {paragraphs && paragraphs.map((item, i) => <p key={i}>{item}</p>)}
      {children && <p>{children}</p>}
    </div>
  );
};
