import React from 'react';
import './RadioButton.scss';

const RadioButton = ({ name, value, checked, className, style, onChange, label }) => {
  return (
    <div className="radio-button">
      <label className={className} style={style}>
        {label}
        <input type="radio" name={name} value={value} checked={checked} onChange={onChange} />
      </label>
    </div>
  );
};

export default RadioButton;
