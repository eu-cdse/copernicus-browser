import React from 'react';

import './DataFusionAdditionalParameters.scss';

function DataFusionAdditionalParameters({ additionalParameters, additionalParametersSettings, onChange }) {
  const handleChange = (e, parameter) => {
    onChange({
      ...additionalParameters,
      [parameter]: e.target.value,
    });
  };

  return (
    <div className="data-fusion-additional-parameters">
      {Object.keys(additionalParameters).map((parameter) => (
        <div key={parameter} className="additional-parameter">
          {additionalParametersSettings[parameter].getName()}:
          {additionalParametersSettings[parameter].parameterType === 'select' ? (
            <select
              className="dropdown-normal-ui"
              value={additionalParameters[parameter]}
              onChange={(e) => handleChange(e, parameter)}
            >
              {additionalParametersSettings[parameter].options.map((o) => (
                <option key={o.value} value={o.value}>
                  {o.name}
                </option>
              ))}
            </select>
          ) : (
            <input
              key={parameter}
              type={additionalParametersSettings[parameter].parameterType}
              value={additionalParameters[parameter]}
              onChange={(e) => handleChange(e, parameter)}
            />
          )}
          {additionalParametersSettings[parameter].description && (
            <div className="additional-parameter-description">
              {additionalParametersSettings[parameter].description}
            </div>
          )}
        </div>
      ))}
    </div>
  );
}

export default DataFusionAdditionalParameters;
