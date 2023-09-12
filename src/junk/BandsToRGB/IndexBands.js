import React, { useState } from 'react';
import { useSelector } from 'react-redux';
import { t } from 'ttag';
import store, { indexSlice } from '../../store';

import { SelectedBand } from './SelectedBand';
import { DraggableBand } from './DraggableBand';
import { DraggableBandGhost } from './DraggableBandGhost';
import { SliderThreshold } from './SliderThreshold';
import { pickColor, spreadHandlersEvenly } from './utils';
import { parseIndexEvalscript } from '../../utils';

import './BandsToRGB.scss';
import HelpTooltip from '../../Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/HelpTooltip';
import ReactMarkdown from 'react-markdown';

export const GRADIENTS = [
  ['0x000000', '0xffffff'],
  ['0xd73027', '0x1a9850'],
  ['0xffffff', '0x005824'],
  ['0xffffff', '0xFF0000'],
  ['0x2079B5', '0x2079B5'],
];

const FLOAT_REGEX = /^[-]?\d{0,2}\.?\d{0,2}$/; // limited on two decimals
const ALLOWED_CHARS_REGEX = /^$|^\.$|^-$/; // if empty string or first char is dot or minus
const DEFAULT_DOMAIN = { min: 0, max: 1 };
const EQUATIONS = ['(A-B)/(A+B)', '(A/B)'];
const DEFAULT_VALUES = spreadHandlersEvenly(2, DEFAULT_DOMAIN.min, DEFAULT_DOMAIN.max);

export const IndexBands = ({ bands, layers, onChange, evalscript }) => {
  const [equation, setEquation] = React.useState(EQUATIONS[0]);
  const [values, setValues] = React.useState(DEFAULT_VALUES); //
  const [min, setMin] = React.useState(DEFAULT_DOMAIN.min);
  const [max, setMax] = React.useState(DEFAULT_DOMAIN.max);
  const [open, setOpen] = React.useState(false);
  const [colorRamp, setColorRamp] = React.useState([
    GRADIENTS[0][0].replace('0x', '#'),
    GRADIENTS[0][1].replace('0x', '#'),
  ]);

  const [loading, setLoading] = useState(true);

  const { gradient, handlePositions } = useSelector((state) => state.index);

  const equationArray = [...equation]; // split string into array

  React.useEffect(() => {
    initValues();
    if (evalscript) {
      const parsed = parseIndexEvalscript(evalscript);
      if (parsed !== null) {
        initEvalFromUrl(parsed);
      }
    }

    setLoading(false);
    // eslint-disable-next-line
  }, []);

  function initValues() {
    store.dispatch(indexSlice.actions.setGradient(GRADIENTS[0]));
    store.dispatch(indexSlice.actions.setHandlePositions([0, 1]));
  }

  const initEvalFromUrl = (parsed) => {
    setValues(!parsed.positions.includes(NaN) ? parsed.positions : DEFAULT_VALUES);
    setEquation(parsed.equation);
    setColorRamp(parsed.colors);
    setMin(parsed.positions[0] || DEFAULT_DOMAIN.min); // because we don't save slider min/max use first/last values from evalscript
    setMax(parsed.positions[parsed.positions.length - 1] || DEFAULT_DOMAIN.max);
    onChange(layers, { equation: parsed.equation, colorRamp: parsed.colors, values: parsed.positions });
  };

  const initColors = (values, currentGradient, min, max) => {
    return values.map((item) => pickColor(currentGradient[0], currentGradient[1], item, min, max));
  };

  const onDraggableBandChange = (selectedIndexBands) => {
    onChange(selectedIndexBands, { equation, colorRamp, values });
  };

  const onEquationChange = (selectedEquation) => {
    setEquation(selectedEquation);
    onChange(layers, { equation: selectedEquation, colorRamp, values });
  };

  const onGradientChange = (selectedGradient) => {
    const newColors = initColors(handlePositions, selectedGradient, min, max);
    onChange(layers, { equation, colorRamp: newColors, values });
    store.dispatch(indexSlice.actions.setGradient(selectedGradient));
    setColorRamp(newColors);
    setOpen(false);
  };

  const onSliderChange = (newValues) => {
    if (newValues.includes(NaN)) {
      return;
    }

    if (invalidMinMax()) {
      return;
    }
    const newColors = initColors(newValues, gradient, min, max);
    onChange(layers, { equation, colorRamp: newColors, values });
  };

  const onSliderUpdate = (newValues) => {
    if (newValues.includes(NaN)) {
      return;
    }

    if (invalidMinMax()) {
      return;
    }
    store.dispatch(indexSlice.actions.setHandlePositions(newValues));

    const newColors = initColors(newValues, gradient, min, max);
    setColorRamp(newColors);
  };

  const removeHandle = () => {
    // remove item
    let newValues = values.filter((val, index) => index !== values.length - 1);
    // distribute slider values
    newValues = spreadHandlersEvenly(newValues.length, min, max);
    // get new color for each slider
    const newColors = initColors(newValues, gradient, min, max);
    // dispatch generateEval & fetch call
    onChange(layers, { equation, colorRamp: newColors, values: newValues });
    // save values & colors in state
    setValues(newValues);
    setColorRamp(newColors);
    store.dispatch(indexSlice.actions.setHandlePositions(newValues));
  };

  const addHandle = () => {
    let newValues = [...values, ''];
    newValues = spreadHandlersEvenly(newValues.length, min, max);
    const newColors = initColors(newValues, gradient, min, max);
    onChange(layers, { equation, colorRamp: newColors, values: newValues });
    store.dispatch(indexSlice.actions.setHandlePositions(newValues));
    setValues(newValues);
    setColorRamp(newColors);
  };

  const onMinChange = (newMin) => {
    const parsedMin = parseFloat(newMin);

    if (!isNaN(parsedMin) && FLOAT_REGEX.test(newMin) && parsedMin >= -10 && parsedMin <= 10) {
      setMin(newMin);
      const newValues = spreadHandlersEvenly(values.length, parsedMin, max);
      const newColors = initColors(newValues, gradient, parsedMin, max);
      onChange(layers, { equation, colorRamp: newColors, values: newValues });
      setValues(newValues);
      setColorRamp(newColors);
      store.dispatch(indexSlice.actions.setHandlePositions(newValues));
    } else if (ALLOWED_CHARS_REGEX.test(newMin)) {
      setMin(newMin);
    }
  };

  const onMaxChange = (newMax) => {
    const parsedMax = parseFloat(newMax);

    if (!isNaN(parsedMax) && FLOAT_REGEX.test(newMax) && parsedMax >= -10 && parsedMax <= 10) {
      setMax(newMax);
      const newValues = spreadHandlersEvenly(values.length, min, parsedMax);
      const newColors = initColors(newValues, gradient, min, parsedMax);
      onChange(layers, { equation, colorRamp: newColors, values: newValues });
      setValues(newValues);
      store.dispatch(indexSlice.actions.setHandlePositions(newValues));
      setColorRamp(newColors);
    } else if (ALLOWED_CHARS_REGEX.test(newMax)) {
      setMax(newMax);
    }
  };

  const invalidMinMax = () => {
    return Boolean(isNaN(parseFloat(min)) || isNaN(parseFloat(max)));
  };

  if (loading) {
    return null;
  }

  const link1 =
    'https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/ndvi/#normalized-difference-vegetation-index';
  const link2 = 'https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/ndwi/';

  return (
    <React.Fragment>
      <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnRight">
        <ReactMarkdown linkTarget="_blank">
          {t`Create a simple band ratio (A/B) to highlight the spectral differences between two bands,
          or create a normalized difference index ((A-B)/(A+B)) to compare your data across time.\n\n
          Popular difference indices are the Normalized Difference Vegetation Index (NDVI),
          which uses the near-infrared and red bands or the Normalized Difference Water Index (NDWI),
          which uses the near-infrared and shortwave infrared bands.\n\nMore info [here](${link1}) or [here](${link2}).`}
        </ReactMarkdown>
      </HelpTooltip>
      <p>{t`Drag bands into the index equation`}</p>
      <div className="colors-container">
        {bands.map((band, index) => (
          <DraggableBand key={index} band={band} value={layers} onChange={onDraggableBandChange} />
        ))}
        <DraggableBandGhost bands={bands} />
      </div>

      {/* Equation select */}
      <p>
        {t`Index `}
        <select
          key={equation}
          defaultValue={equation}
          className="dropdown index"
          onChange={(e) => onEquationChange(e.target.value)}
        >
          {EQUATIONS.map((equation, i) => (
            <option key={i}>{equation}</option>
          ))}
        </select>
      </p>

      {/* Colors dropzones displayed in a math equation/formula style */}
      <div className="colors-container">
        <div className="colors-output index">
          {equationArray.map((item, index) => {
            if (item === 'A' || item === 'B') {
              return <SelectedBand key={index} bands={bands} bandName={item.toLowerCase()} value={layers} />;
            }
            if (item === '/')
              return (
                <div key={index} className="divide">
                  /
                </div>
              );
            return <span key={index}>{item}</span>;
          })}
        </div>
      </div>
      {/* Threshold gradient sliders */}
      <div className="treshold">
        <div style={{ padding: '20px 0' }}>
          {t`Threshold`} <i className="fa fa-cog" onClick={() => setOpen(!open)} />
          {open && (
            <div className="gradients-list">
              {GRADIENTS.map((g, index) => (
                <div
                  key={index}
                  onClick={() => onGradientChange(GRADIENTS[index])}
                  className="gradient-option"
                  style={{
                    background: `linear-gradient(90deg, ${g.map((item) => item.replace('0x', '#'))} 100%)`,
                  }}
                />
              ))}
            </div>
          )}
        </div>
        <div className="add-remove-buttons">
          <button
            className="eob-btn primary"
            disabled={values.length === 2 || invalidMinMax()}
            onClick={removeHandle}
            title={t`Remove color picker`}
          >
            <i className="fas fa-minus-square" />
          </button>
          <button
            className="eob-btn primary"
            disabled={values.length === 8 || invalidMinMax()}
            onClick={addHandle}
            title={t`Add color picker`}
          >
            <i className="fas fa-plus-square" />
          </button>
        </div>
        <div style={{ padding: '4px 0' }}>
          <SliderThreshold
            colors={colorRamp}
            domain={[min, max]}
            gradient={gradient}
            onSliderUpdate={onSliderUpdate}
            onSliderChange={onSliderChange}
            values={values}
            invalidMinMax={invalidMinMax}
            handlePositions={handlePositions}
          />
        </div>
        <div className="scale-wrap">
          <input type="text" value={min} onChange={(e) => onMinChange(e.target.value)} />
          <input type="text" value={max} onChange={(e) => onMaxChange(e.target.value)} />
        </div>
      </div>
    </React.Fragment>
  );
};
