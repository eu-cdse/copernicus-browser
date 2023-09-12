import React from 'react';

import CurveEditor from './CurveEditor/CurveEditor';

// assumption that images are PNG or JPG: value = 256 (number of all possible R / G / B values)
// should be improved in the future to allow for other formats
export const NUMBER_OF_RGB_VALUES = 256;
export const CURVE_EDITOR_CANVAS_SIZE = 350;
export const MAX_COLOR_VALUE = 1;

export default class AdvancedRgbEffects extends React.Component {
  // in the future histograms should be requested by sentinelhub-js on map move/zoom change
  FAKE_HISTOGRAM = new Array(NUMBER_OF_RGB_VALUES).fill(0);

  redBackground = '#fff4f4';
  greenBackground = '#f4fff4';
  blueBackground = '#f4f4ff';

  render() {
    return (
      <>
        <CurveEditor
          color="red"
          backgroundColor={this.redBackground}
          canvasSize={CURVE_EDITOR_CANVAS_SIZE}
          effect={this.props.redCurveEffect}
          histogram={this.FAKE_HISTOGRAM}
          updateCurveEffect={(curve) => this.props.updateRedCurveEffect(curve)}
          maxColorValue={MAX_COLOR_VALUE}
        />

        <CurveEditor
          color="green"
          backgroundColor={this.greenBackground}
          canvasSize={CURVE_EDITOR_CANVAS_SIZE}
          effect={this.props.greenCurveEffect}
          histogram={this.FAKE_HISTOGRAM}
          updateCurveEffect={(curve) => this.props.updateGreenCurveEffect(curve)}
          maxColorValue={MAX_COLOR_VALUE}
        />

        <CurveEditor
          color="blue"
          backgroundColor={this.blueBackground}
          canvasSize={CURVE_EDITOR_CANVAS_SIZE}
          effect={this.props.blueCurveEffect}
          histogram={this.FAKE_HISTOGRAM}
          updateCurveEffect={(curve) => this.props.updateBlueCurveEffect(curve)}
          maxColorValue={MAX_COLOR_VALUE}
        />
      </>
    );
  }
}
