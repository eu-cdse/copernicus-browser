import { MOSAICKING_ORDER_OPTIONS } from '../const';

export const getMosaickingOrderOptions = () => {
  const allOptions = Object.keys(MOSAICKING_ORDER_OPTIONS);

  return allOptions.map((option) => ({
    value: option,
    label: MOSAICKING_ORDER_OPTIONS[option](),
  }));
};

export const isValidMosaickingOrder = (datasetId, mosaickingOrder) => {
  const mosaickingOrderOptions = getMosaickingOrderOptions();
  return mosaickingOrderOptions && mosaickingOrderOptions.find((option) => option.value === mosaickingOrder);
};
