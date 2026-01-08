import React from 'react';
import { t } from 'ttag';

import MeasureIcon from './MeasureIcon';
import '../EOBPanel.scss';
import './EOBMeasurePanelButton.scss';

// Utility for formatting distance
export function PrettyDistance({ value }) {
  const kilometers = value / 1000;
  return kilometers >= 1 ? (
    <span>
      {kilometers.toLocaleString(undefined, { maximumFractionDigits: 2 })} {t`km`}
    </span>
  ) : (
    <span>
      {value.toLocaleString(undefined, { maximumFractionDigits: 0 })} {t`m`}
    </span>
  );
}

// Utility for formatting area
function FormatArea({ value }) {
  const km2 = value / 1e6;
  return (
    <span>
      {km2.toLocaleString(undefined, { maximumFractionDigits: 2 })} {t`km`}
      <sup>2</sup>
    </span>
  );
}

export function EOBMeasurePanelButton(props) {
  const { distance, area, hasMeasurement, active, toggleMeasure } = props;

  const panelTitle = t`Measure (Click to start, double click to finish)`;
  const panelTitleRemove = t`Remove measurement`;
  const panelTitleClose = t`Close measurement option`;

  // Info about current measurement
  const MeasurementInfo = () => (
    <span className="aoiCords">
      {distance > 0 && (
        <div className="measure-text">
          <PrettyDistance value={distance} />
        </div>
      )}
      {area > 0 && (
        <div className="measure-text">
          <FormatArea value={area} />
        </div>
      )}
    </span>
  );

  // Button to start/stop measuring
  const MeasureButton = () => (
    // jsx-a11y/anchor-is-valid
    // eslint-disable-next-line
    <a
      className={`drawGeometry ${active ? 'active' : ''} ${active ? 'open-options' : ''}`}
      onClick={toggleMeasure}
    >
      <i>
        <MeasureIcon />
      </i>
    </a>
  );

  return (
    <div
      className="measurePanel panelButton floatItem"
      title={active ? (hasMeasurement ? panelTitleRemove : panelTitleClose) : panelTitle}
    >
      {hasMeasurement && <MeasurementInfo />}
      <MeasureButton />
    </div>
  );
}
