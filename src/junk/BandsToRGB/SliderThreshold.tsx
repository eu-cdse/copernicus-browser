import React from 'react';
import { Range } from 'rc-slider';
import { KeyboardHandle } from './SliderComponents';
import { pickColor } from './utils';
import { SliderThresholdProps } from './types';

interface RcHandleProps {
  index: number;
  offset: number;
  tabIndex: number;
  ref: React.Ref<KeyboardHandle>;
}

function calculateGradient(handlePositions: number[], gradient: string[], values: number[]): string {
  const firstValue = values[0];
  const lastValue = values[values.length - 1];

  const firstHandlePosition = handlePositions[0];
  const lastHandlePosition = handlePositions[handlePositions.length - 1];
  const range = lastValue - firstValue;

  const offsetLeftInPercent = `${((firstHandlePosition - firstValue) * 100) / range}%`;
  const offsetRightInPercent = `${100 - ((lastValue - lastHandlePosition) * 100) / range}%`;

  const leftGradientColor = pickColor(gradient[0], gradient[1], firstHandlePosition, firstValue, lastValue);
  const rightGradientColor = pickColor(gradient[0], gradient[1], lastHandlePosition, firstValue, lastValue);

  const transparentLeft = `rgba(0,0,0,0) ${offsetLeftInPercent},`;
  const fullGradient = `${leftGradientColor} ${offsetLeftInPercent}, ${rightGradientColor} ${offsetRightInPercent},`;
  const transparentRight = `rgba(0,0,0,0) ${offsetRightInPercent}`;

  return `linear-gradient(90deg, ${transparentLeft} ${fullGradient} ${transparentRight})`;
}

export function SliderThreshold({
  values,
  colors,
  domain,
  gradient,
  invalidMinMax,
  handlePositions,
  onSliderUpdate,
  onSliderChange,
}: SliderThresholdProps) {
  const numericMin = parseFloat(domain[0] as string);
  const numericMax = parseFloat(domain[1] as string);

  if (isNaN(numericMin) || isNaN(numericMax)) {
    return <div className="slider-transparent-background" />;
  }

  const gradientStyle = calculateGradient(handlePositions, gradient, values);

  return (
    <div className="slider-transparent-background">
      <div className="slider">
        <Range
          min={numericMin}
          max={numericMax}
          step={0.01}
          value={handlePositions}
          allowCross={false}
          onChange={onSliderUpdate}
          onAfterChange={onSliderChange}
          railStyle={{ background: gradientStyle, height: 34 }}
          trackStyle={Array(values.length - 1).fill({ background: 'transparent', height: 34 })}
          handle={({ index, offset, tabIndex, ref }: RcHandleProps) =>
            invalidMinMax() ? (
              <span key={index} style={{ display: 'none' }} />
            ) : (
              <KeyboardHandle
                key={index}
                ref={ref}
                offset={offset}
                tabIndex={tabIndex}
                rampValue={values[index]}
                pointingToColor={colors && colors[index]}
              />
            )
          }
        />
      </div>
    </div>
  );
}
