import React from 'react';
import Select from 'react-select';
import { t } from 'ttag';

import { customSelectStyle } from '../../components/CustomSelectInput/CustomSelectStyle';
import { CustomDropdownIndicator } from '../../components/CustomSelectInput/CustomDropdownIndicator';

import { getValueOrExecute } from '../../utils/effectsUtils';

const LAYER_DEFAULT = { value: null, label: () => t`Layer default` };

const getLabelForValue = (value, options) => {
  //find value among all provided options
  const option = options.find((o) => o.value === value);
  if (option) {
    return getValueOrExecute(option?.label);
  }

  //for null/empty values display LAYER_DEFAULT label
  if (value === null || value === undefined || value === '') {
    return getValueOrExecute(LAYER_DEFAULT.label);
  }

  //use value as label if everything else fails
  return value;
};

const EffectDropdown = ({
  name,
  separator,
  value,
  onChange,
  options,
  tooltip = null,
  displayLayerDefault = true,
  isLayerDefaultDisabled = false,
}) => {
  const allOptions = [
    ...(displayLayerDefault
      ? [
          {
            value: LAYER_DEFAULT.value,
            label: getValueOrExecute(LAYER_DEFAULT.label),
            disabled: isLayerDefaultDisabled,
          },
        ]
      : []),
    ...options,
  ];

  const selectedOption = {
    value: value,
    label: getLabelForValue(value, allOptions),
    disabled: false,
  };

  return (
    <div className="effect-container effect-with-dropdown">
      <span className="effect-name">
        {name}
        {tooltip ? tooltip : null}
        {separator ? separator : null}
      </span>
      <div className="effect-dropdown">
        <Select
          value={selectedOption}
          options={allOptions}
          onChange={({ value }) => onChange(value)}
          styles={customSelectStyle}
          menuPosition="fixed"
          menuShouldBlockScroll={true}
          className="effect-dropdown-select-dropdown"
          classNamePrefix="effect-dropdown-select"
          components={{ DropdownIndicator: CustomDropdownIndicator }}
          isSearchable={false}
          isOptionDisabled={(option) => option.disabled}
          menuPlacement="auto"
        />
      </div>
    </div>
  );
};

export default EffectDropdown;
