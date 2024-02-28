import { AWS_HLS, AWS_HLS_LANDSAT, AWS_HLS_SENTINEL } from './dataSourceConstants';
import { HLSConstellation } from '@sentinel-hub/sentinelhub-js';

export const getConstellationFromCollectionList = (collectionList = []) => {
  if (!collectionList || collectionList.length === 0) {
    return null;
  }

  if (collectionList.includes(AWS_HLS)) {
    return null;
  }

  if (collectionList.includes(AWS_HLS_LANDSAT) && collectionList.includes(AWS_HLS_SENTINEL)) {
    return null;
  }

  if (collectionList.includes(AWS_HLS_LANDSAT)) {
    return HLSConstellation.LANDSAT;
  }

  if (collectionList.includes(AWS_HLS_SENTINEL)) {
    return HLSConstellation.SENTINEL;
  }

  return null;
};

//get constallation parameter from selected datasetId
export const getConstellationFromDatasetId = (datasetId) => {
  let constellation;
  switch (datasetId) {
    case AWS_HLS_LANDSAT:
      constellation = HLSConstellation.LANDSAT;
      break;
    case AWS_HLS_SENTINEL:
      constellation = HLSConstellation.SENTINEL;
      break;
    default:
      constellation = null;
  }
  return constellation;
};
