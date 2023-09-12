import round from 'lodash.round';

export const componentToHex = (c) => {
  let hex = c.toString(16);
  return hex.length === 1 ? '0' + hex : hex;
};

export const rgbToHex = (rgb) => {
  return '#' + componentToHex(rgb[0]) + componentToHex(rgb[1]) + componentToHex(rgb[2]);
};

export const hexToRgb = (hex) => {
  hex = hex.replace('0x', '');
  const bigint = parseInt(hex, 16);
  const r = (bigint >> 16) & 255;
  const g = (bigint >> 8) & 255;
  const b = bigint & 255;

  return [r, g, b];
};

/**
 * Find color on gradient, based on position
 * @param colorOne hex value
 * @param color2 hex value
 * @param weight position/value on slider
 */
export const pickColor = (colorOne, colorTwo, weight, min, max) => {
  colorOne = hexToRgb(colorOne);
  colorTwo = hexToRgb(colorTwo);
  min = parseFloat(min);
  max = parseFloat(max);

  // gradient scale
  const minG = 0;
  const maxG = 100;

  // scale between different number ranges
  const percent = (weight - min) / (max - min);
  const newWeight = percent * (maxG - minG) + minG;

  // offset from color edges
  const w1 = newWeight / 100;
  const w2 = 1 - w1;

  const rgb = [
    Math.round(colorOne[0] * w2 + colorTwo[0] * w1),
    Math.round(colorOne[1] * w2 + colorTwo[1] * w1),
    Math.round(colorOne[2] * w2 + colorTwo[2] * w1),
  ];

  return rgbToHex(rgb);
};

export const spreadHandlersEvenly = (numOfHandlers, min, max) => {
  min = parseFloat(min);
  max = parseFloat(max);

  if (isNaN(min) || isNaN(max)) {
    min = 0;
    max = 1;
  }

  const scale = Math.abs(max - min);
  let handlerValue = min;

  const values = [...Array(numOfHandlers)].map((x, index) => {
    if (index === 0) {
      return min;
    }

    if (index === numOfHandlers - 1) {
      return max;
    }

    handlerValue += scale / (numOfHandlers - 1);

    return round(handlerValue, 2);
  });

  return values;
};
