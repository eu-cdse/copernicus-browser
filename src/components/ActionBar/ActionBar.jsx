import React from 'react';
import './ActionBar.scss';

export const ActionItem = ({ action, className }) => (
  <div
    className={`action-wrapper ${action.disabled() ? 'disabled' : ''} ${
      action.className ? action.className() : ''
    } ${className ? className : ''}`}
    key={action.id}
    onClick={!action.disabled() ? action.onClick : null}
    title={(action.title && action.title()) || action.label()}
  >
    <i className={action.icon()} />
    <div>{action.label()}</div>
  </div>
);

const ActionBar = ({ actionsOpen, actions, className }) => {
  if (!actionsOpen) {
    return null;
  }

  return (
    <div className={`action-bar ${className ? className : ''}`}>
      {actions
        .filter((action) => action.visible())
        .map((action) => (
          <ActionItem key={action.id} action={action} />
        ))}
    </div>
  );
};

export default ActionBar;
