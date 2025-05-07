import React from 'react';

import CheckMark from '../../icons/check-mark.svg?react';
import './customCheckbox.scss';

const CustomCheckbox = ({ className, inputClassName, checked, onChange, label }) => {
  return (
    <div className={`custom-checkbox-container${className ? ` ${className}` : ''}`}>
      <label className="custom-checkbox-label">
        <input
          className={`custom-checkbox ${inputClassName ? inputClassName : ''}`}
          type="checkbox"
          checked={!!checked}
          onChange={onChange}
        />
        {!!checked && <CheckMark className="check-mark" />}
        {label && <span className="custom-checkbox-text">{label}</span>}
      </label>
    </div>
  );
};

export default CustomCheckbox;
