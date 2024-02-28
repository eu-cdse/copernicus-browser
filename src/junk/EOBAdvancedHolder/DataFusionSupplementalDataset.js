import React, { useState, useEffect, useRef } from 'react';
import { t } from 'ttag';
import { MosaickingOrder } from '@sentinel-hub/sentinelhub-js';

import { TimespanPicker } from '../../components/TimespanPicker/TimespanPicker';

function DataFusionSupplementalDataset(props) {
  const {
    alias,
    mosaickingOrderDisabled,
    mosaickingOrder = MosaickingOrder.MOST_RECENT,
    additionalMosaickingOrders,
    additionalParametersComponent: AdditionalParametersComponent = null,
    additionalParameters = {},
    additionalParametersSettings = {},
    minDate,
    maxDate,
    initialTimespan,
    label,
  } = props;

  const [isCustomTimespan, setIsCustomTimespan] = useState(!!props.timespan);
  const [settingsExpanded, setSettingsExpanded] = useState(true);
  const [isValid, setIsValid] = useState(true);
  const [currentAlias, setCurrentAlias] = useState(alias);
  const calendarHolder = useRef(null);
  const [displayCalendarFrom, setDisplayCalendarFrom] = useState(false);
  const [displayCalendarUntil, setDisplayCalendarUntil] = useState(false);

  useEffect(() => {
    if (isValid) {
      props.updateAlias(alias, currentAlias);
    }
    // Disable warning for values used not in the dependency array (we only want useEffect to run on currentAlias change)
    // eslint-disable-next-line
  }, [currentAlias]);

  function updateAlias(e) {
    const isValid = props.checkAliasValidity(e.target.value);
    if (isValid) {
      setIsValid(true);
    } else {
      setIsValid(false);
    }
    setCurrentAlias(e.target.value);
  }

  const timespan = props.timespan
    ? { fromTime: props.timespan[0], toTime: props.timespan[1] }
    : initialTimespan;
  return (
    <div className="supplemental-dataset">
      <div className="supplemental-dataset-header" onClick={() => setSettingsExpanded(!settingsExpanded)}>
        {settingsExpanded ? (
          <i className="fa fa-chevron-up open-close" />
        ) : (
          <i className="fa fa-chevron-down open-close" />
        )}
        <span>{`${alias} (${label})`}</span>
        <i className="fa fa-trash remove" onClick={() => props.onRemoveSupplementalDataset(alias)} />
      </div>

      {settingsExpanded && (
        <div className="supplemental-dataset-info">
          <div className="supplemental-dataset-alias-input">
            <label htmlFor={`${alias}-alias`}>Datasource alias:</label>
            <input
              id={`${alias}-alias`}
              type="text"
              value={currentAlias}
              className={isValid ? '' : 'invalid'}
              onChange={updateAlias}
            />
          </div>

          {!mosaickingOrderDisabled && (
            <div className="mosaicking-order">
              {t`Mosaicking order`}:
              <select
                className="dropdown-normal-ui"
                value={mosaickingOrder}
                onChange={(e) => props.updateMosaickingOrder(alias, e.target.value)}
              >
                <option value={MosaickingOrder.MOST_RECENT}>{t`Most recent`}</option>
                <option value={MosaickingOrder.LEAST_RECENT}>{t`Least recent`}</option>
                {additionalMosaickingOrders.map((mo) => (
                  <option key={mo.id} value={mo.id}>
                    {mo.label}
                  </option>
                ))}
              </select>
            </div>
          )}

          {AdditionalParametersComponent && (
            <AdditionalParametersComponent
              onChange={(v) => props.updateAdditionalParameters(alias, v)}
              additionalParameters={additionalParameters}
              additionalParametersSettings={additionalParametersSettings}
            />
          )}

          <div className="timespan">
            <input
              type="checkbox"
              id={`custom-timespan-${alias}`}
              checked={isCustomTimespan}
              onChange={() => setIsCustomTimespan(!isCustomTimespan)}
            />
            <label htmlFor={`custom-timespan-${alias}`}>{t`Customize timespan`}</label>
            {isCustomTimespan && (
              <TimespanPicker
                id={alias}
                timespan={timespan}
                maxDate={maxDate}
                minDate={minDate}
                applyTimespan={(fromTime, toTime) => props.updateTimespan(alias, fromTime, toTime)}
                autoApply={true}
                calendarHolder={calendarHolder}
                displayCalendarFrom={displayCalendarFrom}
                openCalendarFrom={() => setDisplayCalendarFrom(true)}
                closeCalendarFrom={() => setDisplayCalendarFrom(false)}
                displayCalendarUntil={displayCalendarUntil}
                openCalendarUntil={() => setDisplayCalendarUntil(true)}
                closeCalendarUntil={() => setDisplayCalendarUntil(false)}
              />
            )}
            <div className="calendar-holder" ref={calendarHolder} />
          </div>
        </div>
      )}
    </div>
  );
}

export default DataFusionSupplementalDataset;
