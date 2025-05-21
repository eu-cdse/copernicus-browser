import React from 'react';
import { components } from 'react-select';

export const CustomOption = (props) => {
  const { data } = props;

  return (
    <div title={data.label}>
      <components.Option {...props}>{data.label}</components.Option>
    </div>
  );
};
