import React from 'react';
import { components } from 'react-select';

import ChevronDown from '../../icons/chevron-down.svg?react';
import ChevronUp from '../../icons/chevron-up.svg?react';
import Magnifier from '../../icons/magnifier.svg?react';

export const CustomDropdownIndicator = (props) => {
  return (
    components.DropdownIndicator && (
      <components.DropdownIndicator {...props}>
        {props.selectProps.menuIsOpen ? (
          props.selectProps.isSearchable ? (
            <Magnifier />
          ) : (
            <ChevronUp />
          )
        ) : (
          <ChevronDown />
        )}
      </components.DropdownIndicator>
    )
  );
};
