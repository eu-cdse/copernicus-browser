import React from 'react';
import Toggle from 'react-toggle';
import 'react-toggle/style.css';

export const ToggleInput = ({ input, params, onChangeHandler }) => (
  <div key={`${params.dataProvider}-${input.id}`} className="row">
    <label title={input.label()}>{input.label()}</label>
    <Toggle
      checked={params[input.id]}
      icons={false}
      onChange={() => onChangeHandler(input.id, !params[input.id])}
    />
  </div>
);
