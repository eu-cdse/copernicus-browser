import React from 'react';

import './BadgeWrapper.scss';

// `active` renders the inverted variant (blue on white). The active panel tile itself is filled
// with $primaryColor, so the default badge (blue on blue) would otherwise disappear into it.
const BadgeWrapper = ({ count = 0, onClick, active = false, children }) => {
  return (
    <div className="badge-wrapper" onClick={onClick}>
      {children}
      {count ? <div className={`badge ${active ? 'active' : ''}`}>{count}</div> : null}
    </div>
  );
};

export default BadgeWrapper;
