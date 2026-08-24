import React, { useEffect, useState } from 'react';

type Props = {
  className?: string;
  value: number | string;
  setValue: (value: number) => void;
  min: number;
  max: number;
  step?: number;
  type?: 'float' | 'integer';
  inputType?: React.HTMLInputTypeAttribute;
  timeoutDuration?: number;
  allowNull?: boolean;
  placeholder?: string;
};

function InputWithBouncyLimit({
  className,
  value,
  setValue,
  min,
  max,
  step,
  type = 'float',
  inputType = 'number',
  timeoutDuration = 500,
  allowNull = false,
  placeholder,
}: Props) {
  /*
    Implements types "integer" and "float"
  */
  const [inputTimeoutId, setInputTimeoutId] = useState<number | undefined>(undefined);
  const [temporaryValue, setTemporaryValue] = useState<number | string>(value);

  useEffect(() => {
    setTemporaryValue(value);
  }, [value]);

  function handleInput(e: React.ChangeEvent<HTMLInputElement>) {
    clearTimeout(inputTimeoutId);
    setTemporaryValue(e.target.value);

    const parsedVal = type === 'float' ? parseFloat(e.target.value) : parseInt(e.target.value);

    // allowNull only permits a cleared field (empty string) to stay NaN without bouncing back;
    // non-empty unparseable input (e.g. "abc") is still invalid and bounces back like an out-of-range value.
    const isEmpty = e.target.value.trim() === '';
    const isInvalidValue = isNaN(parsedVal) && !(allowNull && isEmpty);

    if (isInvalidValue || parsedVal > max || parsedVal < min) {
      const restrictedVal = isInvalidValue || parsedVal < min ? min : max;
      const timeoutId = window.setTimeout(() => {
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
      type={inputType}
      value={
        temporaryValue === undefined || (typeof temporaryValue === 'number' && Number.isNaN(temporaryValue))
          ? ''
          : temporaryValue
      }
      onInput={handleInput}
      onChange={() => {}}
      step={step}
      placeholder={placeholder}
    />
  );
}

export default InputWithBouncyLimit;
