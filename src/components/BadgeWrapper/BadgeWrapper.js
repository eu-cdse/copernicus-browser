import React from 'react';

import './BadgeWrapper.scss';

const BadgeWrapper = ({ count = 0, onClick, children }) => {
  return (
    <div className="badge-wrapper" onClick={onClick}>
      {children}
      {count ? <div className="badge">{count}</div> : null}
    </div>
  );
};

export default BadgeWrapper;
