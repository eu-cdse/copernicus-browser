import moment from 'moment';

import { parseDataFusion, parseEvalscriptBands, parseIndexEvalscript } from './index';
import {
  S1_AWS_IW_VVVH,
  S1_AWS_IW_VV,
  S1_AWS_EW_HHHV,
  S1_AWS_EW_HH,
  S3SLSTR,
  S3OLCI,
  S5_O3,
  S5_NO2,
  S5_SO2,
  S5_CO,
  S5_HCHO,
  S5_CH4,
  S5_AER_AI,
  S5_CLOUD,
  S5_OTHER,
  AWS_L8L1C,
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
  AWS_LOTL1,
  AWS_LOTL2,
  AWS_LTML1,
  AWS_LTML2,
  AWS_LMSSL1,
  AWS_LETML1,
  AWS_LETML2,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { getDataSourceHandler } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

const dfString1 =
  '{"enabled":true,"primaryLayerAlias":"S2L2Ajisqiw","supplementalDatasets":{"AWSEU_S1GRD":{"enabled":true,"alias":"S1GRdewD","mosaickingOrder":"leastRecent","isCustomTimespan":true,"timespan":["2020-08-25T20:00:00.000Z","2020-08-26T23:59:59.999Z"]},"S2_L1C_CDAS":{"enabled":true,"alias":"S2L1Cdewdewd","mosaickingOrder":"leastCC","isCustomTimespan":true,"timespan":["2020-08-05T00:00:00.000Z","2020-08-26T23:59:59.999Z"]}}}';

const expectedDF1 = [
  {
    id: 'CDAS_S2L2A',
    alias: 'S2L2Ajisqiw',
  },
  {
    id: 'AWSEU_S1GRD',
    alias: 'S1GRdewD',
    mosaickingOrder: 'leastRecent',
    timespan: [moment.utc('2020-08-25T20:00:00.000Z'), moment.utc('2020-08-26T23:59:59.999Z')],
  },
  {
    id: 'S2_L1C_CDAS',
    alias: 'S2L1Cdewdewd',
    mosaickingOrder: 'leastCC',
    timespan: [moment.utc('2020-08-05T00:00:00.000Z'), moment.utc('2020-08-26T23:59:59.999Z')],
  },
];

const dfString2 =
  '[{"id":"S2_L2A_CDAS","alias":"S2L2A","mosaickingOrder":"leastCC"},{"id":"CRE_S3SLSTR","alias":"S3SLSTR","timespan":["2020-08-26T02:00:00.000Z","2020-08-26T21:59:59.999Z"]}]';

const expectedDF2 = [
  {
    id: 'S2_L2A_CDAS',
    alias: 'S2L2A',
    mosaickingOrder: 'leastCC',
  },
  {
    id: 'CRE_S3SLSTR',
    alias: 'S3SLSTR',
    timespan: [moment.utc('2020-08-26T02:00:00.000Z'), moment.utc('2020-08-26T21:59:59.999Z')],
  },
];

test.each([
  [dfString1, S2_L2A_CDAS, expectedDF1],
  [dfString2, null, expectedDF2],
])('Test if dataFusion url param is parsed correctly', (dataFusionString, datasetId, expectedDataFusion) => {
  const parsedDataFusion = parseDataFusion(dataFusionString, datasetId);
  expect(parsedDataFusion).toEqual(expectedDataFusion);
});

const allDatasetIds = [
  S1_AWS_IW_VVVH,
  S1_AWS_IW_VV,
  S1_AWS_EW_HHHV,
  S1_AWS_EW_HH,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  S3SLSTR,
  S3OLCI,
  S5_O3,
  S5_NO2,
  S5_SO2,
  S5_CO,
  S5_HCHO,
  S5_CH4,
  S5_AER_AI,
  S5_CLOUD,
  S5_OTHER,
  AWS_L8L1C,
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
  AWS_LOTL1,
  AWS_LOTL2,
  AWS_LTML1,
  AWS_LTML2,
  AWS_LMSSL1,
  AWS_LETML1,
  AWS_LETML2,
];

test.each(allDatasetIds.map((d) => [d]))(
  'Test if generated evalscripts are parsed correctly for %s',
  (datasetId) => {
    const datasourceHandler = getDataSourceHandler(datasetId);
    if (datasourceHandler.supportsCustomLayer()) {
      const availableBands = datasourceHandler.getBands(datasetId);
      const selectedBands = [...availableBands, ...availableBands, ...availableBands]
        .slice(0, 3)
        .map((b) => b.name);
      const evalscript = datasourceHandler.generateEvalscript(selectedBands, datasetId);
      const parsedBands = parseEvalscriptBands(evalscript);
      expect(parsedBands).toEqual(selectedBands);

      if (datasourceHandler.supportsIndex(datasetId)) {
        const indexBands = { a: selectedBands[0], b: selectedBands[1] };
        const equation = '(A/B)';
        const colorRamp = ['#000000', '#8f8f8f', '#f5f5f5'];
        const values = [0.2, 0.75, 0.9];
        const evalscript = datasourceHandler.generateEvalscript(indexBands, datasetId, {
          equation: equation,
          colorRamp: colorRamp,
          values: values,
        });
        const {
          bands: parsedIndexBands,
          equation: parsedEquation,
          positions: parsedValues,
          colors: parsedColorRamp,
        } = parseIndexEvalscript(evalscript);
        expect(parsedIndexBands).toEqual(indexBands);
        expect(parsedEquation).toEqual(equation);
        expect(parsedValues).toEqual(values);
        expect(parsedColorRamp).toEqual(colorRamp);
      }
    }
  },
);
