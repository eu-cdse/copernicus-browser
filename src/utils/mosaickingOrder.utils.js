import { MosaickingOrder } from '@sentinel-hub/sentinelhub-js';
import { MOSAICKING_ORDER_OPTIONS } from '../const';

export const getMosaickingOrderOptions = (datasetId, hasCloudCoverage) => {
  let allOptions = Object.keys(MOSAICKING_ORDER_OPTIONS);

  // remove LEAST_CC from datasets which don't support CC
  // atm LEAST_CC doesn't work for S3SLSTR
  if (!hasCloudCoverage || /S3SLSTR/.test(datasetId)) {
    allOptions = allOptions.filter((option) => option !== MosaickingOrder.LEAST_CC);
  }

  return allOptions.map((option) => ({
    value: option,
    label: MOSAICKING_ORDER_OPTIONS[option](),
  }));
};

export const isValidMosaickingOrder = (datasetId, mosaickingOrder) => {
  const mosaickingOrderOptions = getMosaickingOrderOptions(datasetId);
  return mosaickingOrderOptions && mosaickingOrderOptions.find((option) => option.value === mosaickingOrder);
};
