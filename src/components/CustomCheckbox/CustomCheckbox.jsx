import React from 'react';

import CheckMark from '../../icons/check-mark.svg?react';
import './customCheckbox.scss';

export const CustomCheckboxLabelPosition = Object.freeze({
  left: 'left',
  right: 'right',
});

const CustomCheckbox = ({
  className,
  inputClassName,
  checked,
  onChange,
  label,
  labelPosition = 'left',
  disabled,
  disabledTitle,
}) => {
  return (
    <div className={`custom-checkbox-container${className ? ` ${className}` : ''}`}>
      <label
        className={`custom-checkbox-label ${
          labelPosition === CustomCheckboxLabelPosition.left ? 'label-left' : 'label-right'
        }`}
      >
        <div className="custom-checkbox-inner-wrapper" title={disabled ? disabledTitle : ''}>
          <input
            className={`custom-checkbox ${inputClassName ? inputClassName : ''} ${
              disabled ? 'disabled' : ''
            }`}
            disabled={disabled}
            type="checkbox"
            checked={!!checked}
            onChange={onChange}
          />
          {!!checked && <CheckMark className="check-mark" />}
        </div>
        {label && <span className="custom-checkbox-text">{label}</span>}
      </label>
    </div>
  );
};

export default CustomCheckbox;
