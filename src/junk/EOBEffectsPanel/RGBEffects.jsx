import React from 'react';
import { t } from 'ttag';

import EffectRangeSlider from './EffectRangeSlider';

import { defaultEffects } from '../../const';
import { getValueOrDefault } from '../../utils/effectsUtils';

import 'react-toggle/style.css';

function renderColorSliders({
  effects,
  onUpdateRedRangeEffect,
  onUpdateGreenRangeEffect,
  onUpdateBlueRangeEffect,
}) {
  const colorRanges = [
    {
      name: t`Red`,
      value: getValueOrDefault(effects, 'redRangeEffect', defaultEffects),
      onChange: onUpdateRedRangeEffect,
    },
    {
      name: t`Green`,
      value: getValueOrDefault(effects, 'greenRangeEffect', defaultEffects),
      onChange: onUpdateGreenRangeEffect,
    },
    {
      name: t`Blue`,
      value: getValueOrDefault(effects, 'blueRangeEffect', defaultEffects),
      onChange: onUpdateBlueRangeEffect,
    },
  ];
  return colorRanges.map((colorRange, i) => (
    <EffectRangeSlider
      key={i}
      name={colorRange.name}
      min={0}
      max={1}
      step={0.01}
      value={colorRange.value}
      onChange={colorRange.onChange}
    />
  ));
}

const RGBEffects = (props) => {
  return (
    <>
      <div className="rgb-effects-chooser">
        <label>{t`Advanced RGB effects`}</label>
      </div>

      {renderColorSliders(props)}
    </>
  );
};

export default RGBEffects;
