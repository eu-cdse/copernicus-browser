import React from 'react';

export const CustomDropdownIndicator = (props) => {
  const Magnifier = props.magnifier;
  const ChevronUp = props.chevronUp;
  const ChevronDown = props.chevronDown;

  return props.selectProps.menuIsOpen ? props.magnifier ? <Magnifier /> : <ChevronUp /> : <ChevronDown />;
};
