import React from 'react';
import { t } from 'ttag';
import ArrowSvg from '../../icons/arrow.svg?react';

const ShowLatestDateButton = ({ enabled, datePanelExpanded, onClick }) => (
  <div
    className={
      datePanelExpanded
        ? `action-button ${enabled ? '' : 'disabled'}`
        : `small-action-button ${enabled ? '' : 'disabled'}`
    }
    onClick={onClick}
    title={datePanelExpanded ? '' : t`Show latest date`}
  >
    {datePanelExpanded ? (
      <div className={`action-button-text ${enabled ? '' : 'disabled'}`}>{t`Show latest date`}</div>
    ) : null}
    <ArrowSvg />
  </div>
);

export default ShowLatestDateButton;
