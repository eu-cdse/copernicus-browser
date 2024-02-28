import React from 'react';

export const NumericInput = ({ label, value, min, max, setValue }) => (
  <div className="numeric-input">
    <label>{label}</label>
    <input
      className="input-value"
      type="text"
      min={min}
      max={max}
      value={value}
      onChange={(e) => {
        if (parseInt(e.target.value) < min || parseInt(e.target.value) > max) {
          return;
        }
        setValue(e.target.value);
      }}
    />
    <div className="spinner">
      <div className="up" onClick={() => setValue(parseInt(value) + 1)}>
        <i className="fas fa-chevron-up" />
      </div>
      <div className="down" onClick={() => setValue(parseInt(value) - 1)}>
        <i className="fas fa-chevron-down" />
      </div>
    </div>
  </div>
);
