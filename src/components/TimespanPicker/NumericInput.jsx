import React, { useEffect, useRef, useState } from 'react';

export const NumericInput = ({ label, value, min, max, setValue, notValidDate }) => {
  const [currentValue, setCurrentValue] = useState(parseInt(value ?? 0));
  const timeOut = useRef(0);

  useEffect(() => {
    setCurrentValue(value);
  }, [value, notValidDate]);

  return (
    <div className="numeric-input">
      <label>{label}</label>
      <input
        className="input-value"
        type="text"
        min={min}
        max={max}
        value={currentValue}
        onKeyUp={(e) => {
          clearTimeout(timeOut.current);
          timeOut.current = setTimeout(() => {
            if (setValue(currentValue) === null) {
              setCurrentValue(value);
            }
          }, 500);
        }}
        onChange={(e) => {
          if (parseInt(e.target.value) < min || parseInt(e.target.value) > max) {
            return;
          }
          setCurrentValue(e.target.value);
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
};
