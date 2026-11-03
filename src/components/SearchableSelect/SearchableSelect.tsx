import React from 'react';
import Select, { GroupBase, Props as SelectProps } from 'react-select';

import { customSelectStyle } from '../CustomSelectInput/CustomSelectStyle';
import { CustomDropdownIndicator } from '../CustomSelectInput/CustomDropdownIndicator';
import { CustomOption } from '../CustomOption/CustomOption';

type SearchableSelectProps<Option, IsMulti extends boolean = false> = Omit<
  SelectProps<Option, IsMulti, GroupBase<Option>>,
  'styles' | 'components'
> & {
  // Stacking order of the menu when it is portaled (menuPortalTarget), e.g. above the tools panel.
  menuPortalZIndex?: number;
};

export const SearchableSelect = <Option, IsMulti extends boolean = false>({
  options,
  value,
  onChange,
  isMulti = false as IsMulti,
  menuPlacement = 'auto',
  menuPortalZIndex,
  ...rest
}: SearchableSelectProps<Option, IsMulti>) => (
  <Select
    value={value}
    options={options}
    onChange={onChange}
    isMulti={isMulti}
    menuPlacement={menuPlacement}
    styles={
      menuPortalZIndex === undefined
        ? customSelectStyle
        : {
            ...customSelectStyle,
            menuPortal: (css) => ({ ...customSelectStyle.menuPortal(css), zIndex: menuPortalZIndex }),
          }
    }
    components={{ DropdownIndicator: CustomDropdownIndicator, Option: CustomOption }}
    {...rest}
  />
);
