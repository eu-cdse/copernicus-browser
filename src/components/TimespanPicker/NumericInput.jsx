import React, { useState, useEffect, useRef } from 'react';

export const NUMERIC_INPUT_LIMITATIONS = Object.freeze({
  INCREMENT: 'INCREMENT',
  DECREMENT: 'DECREMENT',
});

export const NumericInput = ({ label, value, min, max, disableSpecificButtonFunction, setValue }) => {
  const [incrementDisabled, setIncrementDisabled] = useState(false);
  const [decrementDisabled, setDecrementDisabled] = useState(false);
  const [currentValue, setCurrentValue] = useState(parseInt(value ?? 0));
  const timeOut = useRef(0);

  useEffect(() => {
    if (value) {
      setCurrentValue(value);
    }
  }, [value]);

  const updateValue = (value) => {
    if (!disableSpecificButtonFunction) {
      setValue(value);
      return;
    }

    let disabled = disableSpecificButtonFunction(value);
    if (disabled === null) {
      resetButtonStates();
      setValue(value);
    } else if (disabled === NUMERIC_INPUT_LIMITATIONS.INCREMENT) {
      setIncrementDisabled(true);
    } else if (disabled === NUMERIC_INPUT_LIMITATIONS.DECREMENT) {
      setDecrementDisabled(true);
    }
  };

  const resetButtonStates = () => {
    setIncrementDisabled(false);
    setDecrementDisabled(false);
  };

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
          resetButtonStates();
          if (parseInt(e.target.value) < min || parseInt(e.target.value) > max) {
            return;
          }
          setCurrentValue(e.target.value);
        }}
      />
      <div className="spinner">
        <div className="up" onClick={() => updateValue(parseInt(value) + 1)}>
          <i
            className="fas fa-chevron-up"
            style={
              incrementDisabled
                ? {
                    pointerEvents: 'none',
                    cursor: 'default',
                    opacity: 0.5,
                  }
                : null
            }
          />
        </div>
        <div className="down" onClick={() => updateValue(parseInt(value) - 1)}>
          <i
            className="fas fa-chevron-down"
            style={
              decrementDisabled
                ? {
                    pointerEvents: 'none',
                    cursor: 'default',
                    opacity: 0.5,
                  }
                : null
            }
          />
        </div>
      </div>
    </div>
  );
};
