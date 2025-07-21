import React from 'react';
import './RadioButton.scss';

const RadioButton = ({ name, value, checked, className, style, onChange, label, disabled = false }) => {
  return (
    <div className={'radio-button' + (disabled ? ' disabled' : '')}>
      <label className={className} style={style}>
        {label}
        <input
          type="radio"
          name={name}
          value={value}
          checked={checked}
          onChange={onChange}
          disabled={disabled}
        />
      </label>
    </div>
  );
};

export default RadioButton;
