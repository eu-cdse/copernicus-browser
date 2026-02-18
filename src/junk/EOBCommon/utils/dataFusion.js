import {
  ApiType,
  parseLegacyWmsGetMapParams,
  DATASET_BYOC,
  BYOCLayer,
  ProcessingDataFusionLayer,
  DATASET_CDAS_S2L1C,
  S2L1CCDASLayer,
  DATASET_CDAS_S2L2A,
  S2L2ACDASLayer,
  DATASET_CDAS_S3OLCI,
  S3OLCICDASLayer,
  DATASET_CDAS_S3SLSTR,
  S3SLSTRCDASLayer,
  S5PL2CDASLayer,
  DATASET_CDAS_S5PL2,
  DEMCDASLayer,
  DATASET_CDAS_DEM,
  DATASET_CDAS_S1GRD,
  S1GRDCDASLayer,
} from '@sentinel-hub/sentinelhub-js';

import { S1_DEFAULT_PARAMS } from '../../../const';
import { getSHServiceRootUrl } from '../../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

export async function getMapDataFusion(wmsParams, dataFusionSettings, effects = null) {
  const { evalscript, evalscriptUrl, getMapParams } = parseLegacyWmsGetMapParams(wmsParams);
  const dataFusionLayer = await constructDataFusionLayer(
    dataFusionSettings,
    evalscript,
    evalscriptUrl,
    getMapParams.fromTime,
    getMapParams.toTime,
  );
  if (effects) {
    getMapParams.effects = effects;
  }
  return await dataFusionLayer.getMap(getMapParams, ApiType.PROCESSING);
}

export async function constructDataFusionLayer(
  dataFusionSettings,
  evalscript,
  evalscriptUrl,
  fromTime,
  toTime,
) {
  const layers = [];

  for (let dataset of dataFusionSettings) {
    let { id, alias, mosaickingOrder, timespan, additionalParameters = {} } = dataset;
    const layer = constructLayerFromDatasetId(id, mosaickingOrder, additionalParameters);
    layers.push({
      layer: layer,
      id: alias,
      fromTime: timespan ? timespan[0] : fromTime,
      toTime: timespan ? timespan[1] : toTime,
    });
  }

  const dataFusionLayer = new ProcessingDataFusionLayer({
    evalscript: evalscript,
    evalscriptUrl: evalscriptUrl,
    layers: layers,
  });
  return dataFusionLayer;
}

// given the dataset ID, construct an empty sentinelhub-js layer:
export function constructLayerFromDatasetId(datasetId, mosaickingOrder, additionalParameters) {
  switch (datasetId) {
    case DATASET_CDAS_S1GRD.id:
      // we are setting evalscript to avoid exception when the layer is initialized without any parameters
      // (this should be fixed in sentinelhub-js)
      const {
        orthorectification = S1_DEFAULT_PARAMS.orthorectification,
        polarization = S1_DEFAULT_PARAMS.polarization,
        acquisitionMode = S1_DEFAULT_PARAMS.acquisitionMode,
        resolution = S1_DEFAULT_PARAMS.resolution,
        speckleFilter = S1_DEFAULT_PARAMS.speckleFilter,
      } = additionalParameters;
      const orthorectify = orthorectification === '' ? false : true;
      const demInstanceType = orthorectification === '' ? null : orthorectification;
      return new S1GRDCDASLayer({
        evalscript: '//VERSION=3 ---',
        mosaickingOrder: mosaickingOrder,
        orthorectify: orthorectify,
        polarization: polarization,
        acquisitionMode: acquisitionMode,
        resolution: resolution,
        demInstanceType: demInstanceType,
        speckleFilter: speckleFilter,
      });
    case DATASET_CDAS_S2L1C.id:
      return new S2L1CCDASLayer({ evalscript: '//VERSION=3 ---', mosaickingOrder: mosaickingOrder });
    case DATASET_CDAS_S2L2A.id:
      return new S2L2ACDASLayer({ evalscript: '//VERSION=3 ---', mosaickingOrder: mosaickingOrder });
    case DATASET_CDAS_S3OLCI.id:
      return new S3OLCICDASLayer({ evalscript: '//VERSION=3 ---', mosaickingOrder: mosaickingOrder });
    case DATASET_CDAS_S3SLSTR.id:
      return new S3SLSTRCDASLayer({ evalscript: '//VERSION=3 ---', mosaickingOrder: mosaickingOrder });
    case DATASET_CDAS_S5PL2.id:
      return new S5PL2CDASLayer({ evalscript: '//VERSION=3 ---', mosaickingOrder: mosaickingOrder });
    case DATASET_CDAS_DEM.id:
      return new DEMCDASLayer({
        evalscript: '//VERSION=3 ---',
        mosaickingOrder: mosaickingOrder,
        ...additionalParameters,
      });
    case DATASET_BYOC.id:
      return new BYOCLayer({
        evalscript: '//VERSION=3 ---',
        mosaickingOrder: mosaickingOrder,
        ...additionalParameters,
        shServiceRootUrl: getSHServiceRootUrl(),
      });
    default:
      console.error('Data fusion: unknown dataset');
      return null;
  }
}
