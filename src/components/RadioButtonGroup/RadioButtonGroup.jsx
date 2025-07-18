import React, { useState } from 'react';
import RadioButton from '../RadioButton/RadioButton';
import './RadioButtonGroup.scss';

const RadioButtonGroup = ({ options, name, onChange, value }) => {
  const [selectedValue, setSelectedValue] = useState(value.value);

  const handleChange = (event) => {
    const value = event.target.value;
    setSelectedValue(value);
    if (onChange) {
      onChange(value);
    }
  };

  return (
    <div className="radio-button-group">
      {options.map((option) => (
        <RadioButton
          key={option.value}
          name={name}
          value={option.value}
          className={option.className}
          checked={selectedValue === option.value}
          onChange={handleChange}
          label={option.label}
          style={option.style}
        />
      ))}
    </div>
  );
};

export default RadioButtonGroup;
