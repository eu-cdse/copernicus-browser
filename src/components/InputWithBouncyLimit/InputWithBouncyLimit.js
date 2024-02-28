import React, { useEffect, useState } from 'react';

function InputWithBouncyLimit({
  className,
  value,
  setValue,
  min,
  max,
  step,
  type = 'float',
  timeoutDuration = 500,
  allowNull = false,
  placeholder,
}) {
  /*
    Implements types "integer" and "float"
  */
  const [inputTimeoutId, setInputTimeoutId] = useState(null);
  const [temporaryValue, setTemporaryValue] = useState(value);

  useEffect(() => {
    setTemporaryValue(value);
  }, [value]);

  function handleInput(e) {
    clearTimeout(inputTimeoutId);
    setTemporaryValue(e.target.value);

    let parsedVal;
    if (type === 'float') {
      parsedVal = parseFloat(e.target.value);
    } else if (type === 'integer') {
      parsedVal = parseInt(e.target.value);
    }

    const isInvalidValue = !allowNull && (parsedVal === '' || isNaN(parsedVal));

    if (isInvalidValue || parsedVal > max || parsedVal < min) {
      const restrictedVal = isInvalidValue || parsedVal < min ? min : max;
      const timeoutId = setTimeout(() => {
        setTemporaryValue(restrictedVal);
        setValue(restrictedVal);
      }, timeoutDuration);
      setInputTimeoutId(timeoutId);
    } else {
      setValue(parsedVal);
    }
  }

  return (
    <input
      className={className}
      type="number"
      value={temporaryValue === undefined ? '' : temporaryValue}
      onInput={handleInput}
      onChange={() => {}}
      step={step}
      placeholder={placeholder}
    />
  );
}

export default InputWithBouncyLimit;
