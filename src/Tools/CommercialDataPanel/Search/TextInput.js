import React from 'react';

export const TextInput = ({ input, params, onChangeHandler }) => (
  <div key={`${params.dataProvider}-${input.id}`} className="row">
    <label title={input.label}>{input.label}</label>
    <input
      type="text"
      id={input.id}
      defaultValue={params[input.id]}
      onChange={(e) => onChangeHandler(input.id, e.target.value)}
    />
  </div>
);
