import React from 'react';

import './CloudCoverageDisplay.scss';

const CloudCoverageDisplay = ({
  cloudCoverage,
  displayCalendar,
  openCalendar,
  closeCalendar,
  enabled = true,
}) => {
  return (
    <div
      className={`cloud-coverage-picker ${enabled ? '' : 'disabled'}`}
      onClick={displayCalendar ? closeCalendar : openCalendar}
    >
      <i className="fas fa-cloud"></i>
      <div>{`${cloudCoverage}%`}</div>
    </div>
  );
};

export default CloudCoverageDisplay;
