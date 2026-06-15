import React, { useCallback, useState } from 'react';
import { useSelector } from 'react-redux';
import { t } from 'ttag';
import ReactMarkdown from 'react-markdown';
import type { PluggableList } from 'unified';
import store, { indexSlice } from '../../store';
import { usePrevious } from '../../hooks/usePrevious';

import HelpTooltip from '../../Tools/SearchPanel/dataSourceHandlers/DatasourceRenderingComponents/HelpTooltip';
import { SelectedBand } from './SelectedBand';
import { DraggableBand } from './DraggableBand';
import { DraggableBandGhost } from './DraggableBandGhost';
import { SliderThreshold } from './SliderThreshold';
import { pickColor, spreadHandlersEvenly } from './utils';
import { parseIndexEvalscript, ParseIndexEvalscriptResult } from '../../utils/parseIndexEvalscript.util';
import { RootState } from '../../hooks';
import { REACT_MARKDOWN_REHYPE_PLUGINS } from '../../rehypeConfig';
import { IndexLayer, IndexBandsProps } from './types';

import './BandsToRGB.scss';

export const GRADIENTS: string[][] = [
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

const link1 =
  'https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/ndvi/#normalized-difference-vegetation-index';
const link2 = 'https://custom-scripts.sentinel-hub.com/custom-scripts/sentinel-2/ndwi/';
const getTooltipContent = () =>
  t`Create a simple band ratio (A/B) to highlight the spectral differences between two bands,
or create a normalized difference index ((A-B)/(A+B)) to compare your data across time.\n\n
Popular difference indices are the Normalized Difference Vegetation Index (NDVI),
which uses the near-infrared and red bands or the Normalized Difference Water Index (NDWI),
which uses the near-infrared and shortwave infrared bands.\n\nMore info [here](${link1}) or [here](${link2}).` +
  '\n\n' +
  t`Modifying the index configuration switches the mode to custom script and updates the layer automatically.`;

export const IndexBands = ({ bands, layers, onChange, evalscript }: IndexBandsProps) => {
  const [equation, setEquation] = React.useState(EQUATIONS[0]);
  const [values, setValues] = React.useState<number[]>(DEFAULT_VALUES);
  const [min, setMin] = React.useState<number | string>(DEFAULT_DOMAIN.min);
  const [max, setMax] = React.useState<number | string>(DEFAULT_DOMAIN.max);
  const [open, setOpen] = React.useState(false);
  const [colorRamp, setColorRamp] = React.useState<string[]>([
    GRADIENTS[0][0].replace('0x', '#'),
    GRADIENTS[0][1].replace('0x', '#'),
  ]);

  const [loading, setLoading] = useState(true);
  const [handlePositions, setHandlePositions] = useState<number[]>(DEFAULT_VALUES);

  const prevEvalscript = usePrevious(evalscript);
  const isInternalChange = React.useRef(false);

  const { gradient: reduxGradient } = useSelector((state: RootState) => state.index);

  React.useEffect(() => {
    store.dispatch(indexSlice.actions.setHandlePositions(handlePositions));
  }, [handlePositions]);

  const gradient = reduxGradient ?? GRADIENTS[0];

  const equationArray = [...equation]; // split string into array

  React.useEffect(() => {
    const parsed = evalscript ? parseIndexEvalscript(evalscript) : null;
    if (parsed !== null) {
      initEvalFromUrl(parsed);
    } else {
      initValues();
    }

    setLoading(false);
    // eslint-disable-next-line
  }, []);

  function initValues() {
    store.dispatch(indexSlice.actions.setGradient(GRADIENTS[0]));
    setHandlePositions(DEFAULT_VALUES);
  }
  const applyParsedIndex = useCallback(
    (parsed: ParseIndexEvalscriptResult) => {
      const positions = !parsed.positions.includes(NaN) ? parsed.positions : DEFAULT_VALUES;
      const newMin = parsed.positions[0] ?? DEFAULT_DOMAIN.min;
      const newMax = parsed.positions[parsed.positions.length - 1] ?? DEFAULT_DOMAIN.max;
      // Preserve all dragged handle positions so they stay where the user dropped them.
      // Fall back to parsed positions only when the handle count changes.
      // Clamp to new domain in case it changed.
      const clamp = (v: number) => Math.max(newMin, Math.min(v, newMax));
      const newHandlePositions =
        positions.length === handlePositions.length ? handlePositions.map(clamp) : positions;
      // Restore the gradient from the evalscript only for external changes (user edited the
      // custom script tab). For internal changes (slider drag, equation change, etc.) the
      // gradient is already correct in Redux — overwriting it would corrupt it because the
      // stored colors reflect dragged handle positions, not the gradient endpoints.
      const isExternal = !isInternalChange.current;
      isInternalChange.current = false;
      const activeGradient = isExternal
        ? [parsed.colors[0].replace('#', '0x'), parsed.colors[parsed.colors.length - 1].replace('#', '0x')]
        : gradient;
      if (isExternal) {
        store.dispatch(indexSlice.actions.setGradient(activeGradient));
      }
      setValues(positions);
      setHandlePositions(newHandlePositions);
      setEquation(parsed.equation);
      setColorRamp(initColors(newHandlePositions, activeGradient, newMin, newMax));
      setMin(newMin);
      setMax(newMax);
    },
    [gradient, handlePositions],
  );

  React.useEffect(() => {
    if (prevEvalscript === undefined || evalscript === prevEvalscript) {
      return;
    }
    const parsed = evalscript ? parseIndexEvalscript(evalscript) : null;
    if (parsed !== null) {
      applyParsedIndex(parsed);
    }
  }, [applyParsedIndex, evalscript, prevEvalscript]);

  const initEvalFromUrl = (parsed: ParseIndexEvalscriptResult) => {
    applyParsedIndex(parsed);
    onChange(layers, { equation: parsed.equation, colorRamp: parsed.colors, values: parsed.positions });
  };

  const initColors = (
    vals: number[],
    currentGradient: string[],
    minVal: number | string,
    maxVal: number | string,
  ): string[] => {
    return vals.map((item) => pickColor(currentGradient[0], currentGradient[1], item, minVal, maxVal));
  };

  const notifyChange = (...args: Parameters<typeof onChange>) => {
    isInternalChange.current = true;
    onChange(...args);
  };

  const onDraggableBandChange = (selectedIndexBands: IndexLayer) => {
    notifyChange(selectedIndexBands, { equation, colorRamp, values });
  };

  const onEquationChange = (selectedEquation: string) => {
    setEquation(selectedEquation);
    notifyChange(layers, { equation: selectedEquation, colorRamp, values });
  };

  const onGradientChange = (selectedGradient: string[]) => {
    const newColors = initColors(handlePositions, selectedGradient, min, max);
    notifyChange(layers, { equation, colorRamp: newColors, values });
    store.dispatch(indexSlice.actions.setGradient(selectedGradient));
    setColorRamp(newColors);
    setOpen(false);
  };

  const onSliderChange = (newValues: number[]) => {
    if (newValues.includes(NaN)) {
      return;
    }

    if (invalidMinMax()) {
      return;
    }
    const newColors = initColors(newValues, gradient, min, max);
    setColorRamp(newColors);
    notifyChange(layers, { equation, colorRamp: newColors, values });
  };

  const onSliderUpdate = (newValues: number[]) => {
    if (newValues.includes(NaN)) {
      return;
    }

    if (invalidMinMax()) {
      return;
    }
    setHandlePositions(newValues);

    const newColors = initColors(newValues, gradient, min, max);
    setColorRamp(newColors);
  };

  const removeHandle = () => {
    let newValues = values.filter((_val, index) => index !== values.length - 1);
    newValues = spreadHandlersEvenly(newValues.length, min, max);
    const newColors = initColors(newValues, gradient, min, max);
    notifyChange(layers, { equation, colorRamp: newColors, values: newValues });
    setValues(newValues);
    setColorRamp(newColors);
    setHandlePositions(newValues);
  };

  const addHandle = () => {
    const newValues = spreadHandlersEvenly(values.length + 1, min, max);
    const newColors = initColors(newValues, gradient, min, max);
    notifyChange(layers, { equation, colorRamp: newColors, values: newValues });
    setHandlePositions(newValues);
    setValues(newValues);
    setColorRamp(newColors);
  };

  const onMinChange = (newMin: string) => {
    const parsedMin = parseFloat(newMin);

    if (!isNaN(parsedMin) && FLOAT_REGEX.test(newMin) && parsedMin >= -10 && parsedMin <= 10) {
      setMin(newMin);
      const newValues = spreadHandlersEvenly(values.length, parsedMin, max);
      const newColors = initColors(newValues, gradient, parsedMin, max);
      notifyChange(layers, { equation, colorRamp: newColors, values: newValues });
      setValues(newValues);
      setColorRamp(newColors);
      setHandlePositions(newValues);
    } else if (ALLOWED_CHARS_REGEX.test(newMin)) {
      setMin(newMin);
    }
  };

  const onMaxChange = (newMax: string) => {
    const parsedMax = parseFloat(newMax);

    if (!isNaN(parsedMax) && FLOAT_REGEX.test(newMax) && parsedMax >= -10 && parsedMax <= 10) {
      setMax(newMax);
      const newValues = spreadHandlersEvenly(values.length, min, parsedMax);
      const newColors = initColors(newValues, gradient, min, parsedMax);
      notifyChange(layers, { equation, colorRamp: newColors, values: newValues });
      setValues(newValues);
      setHandlePositions(newValues);
      setColorRamp(newColors);
    } else if (ALLOWED_CHARS_REGEX.test(newMax)) {
      setMax(newMax);
    }
  };

  const invalidMinMax = () => {
    return Boolean(isNaN(parseFloat(min as string)) || isNaN(parseFloat(max as string)));
  };

  if (loading) {
    return null;
  }

  return (
    <React.Fragment>
      <div className="help-text-container">
        <span>{t`Drag bands into the index equation`}</span>
        <HelpTooltip direction="right" closeOnClickOutside={true} className="padOnLeft">
          <ReactMarkdown rehypePlugins={REACT_MARKDOWN_REHYPE_PLUGINS as PluggableList}>
            {getTooltipContent()}
          </ReactMarkdown>
        </HelpTooltip>
      </div>
      <div className="colors-container">
        {bands.map((band, index) => (
          <DraggableBand
            key={index}
            band={band}
            value={layers}
            onChange={onDraggableBandChange}
            style={undefined}
          />
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
              return (
                <SelectedBand
                  key={index}
                  bands={bands}
                  bandName={item.toLowerCase()}
                  value={layers}
                  showName={false}
                />
              );
            }
            if (item === '/') {
              return (
                <div key={index} className="divide">
                  /
                </div>
              );
            }
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
