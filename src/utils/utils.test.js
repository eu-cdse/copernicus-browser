import moment from 'moment';

import { parseDataFusion, parseEvalscriptBands, parseIndexEvalscript, updatePath } from './index';
import { PROCESSING_OPTIONS, TABS } from '../const';
import {
  S1_CDAS_IW_VVVH,
  S1_CDAS_IW_HHHV,
  S1_CDAS_IW_VV,
  S1_CDAS_IW_HH,
  S1_CDAS_EW_HHHV,
  S1_CDAS_EW_VVVH,
  S1_CDAS_EW_HH,
  S1_CDAS_EW_VV,
  S1_CDAS_SM_VVVH,
  S1_CDAS_SM_VV,
  S1_CDAS_SM_HHHV,
  S1_CDAS_SM_HH,
  S3SLSTR_CDAS,
  S3OLCI_CDAS,
  S5_O3_CDAS,
  S5_NO2_CDAS,
  S5_SO2_CDAS,
  S5_CO_CDAS,
  S5_HCHO_CDAS,
  S5_CH4_CDAS,
  S5_AER_AI_CDAS,
  S5_CLOUD_CDAS,
  S5_OTHER_CDAS,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  CDAS_L8_L9_LOTL1,
  CDAS_LANDSAT_MOSAIC,
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
} from '../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { getDataSourceHandler } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

const dfString1 =
  '{"enabled":true,"primaryLayerAlias":"S2L2Ajisqiw","supplementalDatasets":{"S2_L1C_CDAS":{"enabled":true,"alias":"S2L1Cdewdewd","mosaickingOrder":"leastCC","isCustomTimespan":true,"timespan":["2020-08-05T00:00:00.000Z","2020-08-26T23:59:59.999Z"]}}}';

const expectedDF1 = [
  {
    id: 'CDAS_S2L2A',
    alias: 'S2L2Ajisqiw',
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
  S1_CDAS_IW_VVVH,
  S1_CDAS_IW_HHHV,
  S1_CDAS_IW_VV,
  S1_CDAS_IW_HH,
  S1_CDAS_EW_HHHV,
  S1_CDAS_EW_VVVH,
  S1_CDAS_EW_HH,
  S1_CDAS_EW_VV,
  S1_CDAS_SM_VVVH,
  S1_CDAS_SM_VV,
  S1_CDAS_SM_HHHV,
  S1_CDAS_SM_HH,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  S3SLSTR_CDAS,
  S3OLCI_CDAS,
  S5_O3_CDAS,
  S5_NO2_CDAS,
  S5_SO2_CDAS,
  S5_CO_CDAS,
  S5_HCHO_CDAS,
  S5_CH4_CDAS,
  S5_AER_AI_CDAS,
  S5_CLOUD_CDAS,
  S5_OTHER_CDAS,
  CDAS_L8_L9_LOTL1,
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
  CDAS_LANDSAT_MOSAIC,
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

describe('parseIndexEvalscript', () => {
  test('returns null for a CLMS-style VERSION=3 evalscript without blank lines', () => {
    const evalscript = `//VERSION=3
const factor = 1;
const offset = 0;
function setup() {
    return {
        input: ["HER", "dataMask"],
        output: [
            { id: "default", bands: 4, sampleType: "UINT8" },
            { id: "index", bands: 1, sampleType: "FLOAT32" },
            { id: "eobrowserStats", bands: 1, sampleType: "FLOAT32" },
            { id: "dataMask", bands: 1 },
        ],
    };
}

function evaluatePixel(samples) {
    const originalValue = samples.HER;
    const val = originalValue * factor + offset;
    const dataMask = samples.dataMask;`;
    expect(parseIndexEvalscript(evalscript)).toBeNull();
  });

  test('returns null for a CLMS-style VERSION=3 evalscript with extra blank lines', () => {
    const evalscript = `//VERSION=3

const factor = 1;

const offset = 0;
function setup() {
    return {
        input: ["HER", "dataMask"],
        output: [
            { id: "default", bands: 4, sampleType: "UINT8" },
            { id: "index", bands: 1, sampleType: "FLOAT32" },
            { id: "eobrowserStats", bands: 1, sampleType: "FLOAT32" },
            { id: "dataMask", bands: 1 },
        ],
    };
}

function evaluatePixel(samples) {
    const originalValue = samples.HER;
    const val = originalValue * factor + offset;
    const dataMask = samples.dataMask;`;
    expect(parseIndexEvalscript(evalscript)).toBeNull();
  });

  test('returns the correct result for a genuine app-generated index evalscript', () => {
    const evalscript = `//VERSION=3
const colorRamp = [[0,0x000000],[1,0xffffff]]

let viz = new ColorRampVisualizer(colorRamp);

function setup() {
  return {
    input: ["B04","B08", "dataMask"],
    output: [
      { id:"default", bands: 4 },
      { id: "index", bands: 1, sampleType: 'FLOAT32' }
    ]
  };
}

function evaluatePixel(samples) {
  let index = (samples.B04-samples.B08)/(samples.B04+samples.B08);`;
    expect(parseIndexEvalscript(evalscript)).toEqual({
      bands: { a: 'B04', b: 'B08' },
      equation: '(A-B)/(A+B)',
      positions: [0, 1],
      colors: ['#000000', '#ffffff'],
    });
  });
});

describe('updatePath URL serialization', () => {
  const baseProps = {
    currentZoom: 10,
    currentLat: 48.0,
    currentLng: 16.0,
    selectedTabIndex: TABS.VISUALIZE_TAB,
    terrainViewerSettings: null,
  };

  function getSerializedParams(props) {
    const pushState = jest.spyOn(window.history, 'pushState').mockImplementation(() => {});
    updatePath({ ...baseProps, ...props }, true);
    const url = pushState.mock.calls[0][2];
    pushState.mockRestore();
    return Object.fromEntries(new URL(url).searchParams.entries());
  }

  test('PROCESS_API with evalscriptUrl: serializes evalscriptUrl, not processGraph', () => {
    const params = getSerializedParams({
      customSelected: true,
      selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
      evalscriptUrl: 'https://example.com/script.js',
      processGraph: '{"process":"graph"}',
    });

    expect(params).toHaveProperty('evalscriptUrl');
    expect(params).not.toHaveProperty('processGraph');
    expect(params).not.toHaveProperty('processGraphUrl');
  });

  test('OPENEO with processGraph: serializes processGraph, not evalscriptUrl or evalscript', () => {
    const params = getSerializedParams({
      customSelected: true,
      selectedProcessing: PROCESSING_OPTIONS.OPENEO,
      evalscriptUrl: 'https://example.com/script.js',
      evalscript: 'return [B04, B03, B02];',
      processGraph: '{"process":"graph"}',
    });

    expect(params).toHaveProperty('processGraph');
    expect(params).not.toHaveProperty('evalscriptUrl');
    expect(params).not.toHaveProperty('evalscript');
  });

  test('OPENEO with processGraphUrl: serializes processGraphUrl, not evalscriptUrl', () => {
    const params = getSerializedParams({
      customSelected: true,
      selectedProcessing: PROCESSING_OPTIONS.OPENEO,
      evalscriptUrl: 'https://example.com/script.js',
      evalscript: 'return [B04, B03, B02];',
      processGraphUrl: 'https://example.com/graph.json',
    });

    expect(params).toHaveProperty('processGraphUrl');
    expect(params).not.toHaveProperty('evalscriptUrl');
    expect(params).not.toHaveProperty('evalscript');
  });

  test('PROCESS_API with evalscriptUrl and evalscript: serializes evalscriptUrl only', () => {
    const params = getSerializedParams({
      customSelected: true,
      selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
      evalscriptUrl: 'https://example.com/script.js',
      evalscript: 'return [B04, B03, B02];',
    });

    expect(params).toHaveProperty('evalscriptUrl');
    expect(params).not.toHaveProperty('evalscript');
  });

  test('PROCESS_API with evalscript only: serializes evalscript', () => {
    const params = getSerializedParams({
      customSelected: true,
      selectedProcessing: PROCESSING_OPTIONS.PROCESS_API,
      evalscript: 'return [B04, B03, B02];',
    });

    expect(params).toHaveProperty('evalscript');
    expect(params).not.toHaveProperty('evalscriptUrl');
  });
});
