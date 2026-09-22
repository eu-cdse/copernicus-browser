import moment from 'moment';

import { parseDataFusion, updatePath, toggleInArray } from './index';
import { parseIndexEvalscript } from './parseIndexEvalscript.util';
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
  'Test if generated index evalscripts are parsed correctly for %s',
  (datasetId) => {
    const datasourceHandler = getDataSourceHandler(datasetId);
    if (datasourceHandler.supportsCustomLayer() && datasourceHandler.supportsIndex(datasetId)) {
      const availableBands = datasourceHandler.getBands(datasetId);
      const selectedBands = [...availableBands, ...availableBands, ...availableBands]
        .slice(0, 3)
        .map((b) => b.name);
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
  },
);

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

  test('showPinPanel: serializes panel=pins', () => {
    const params = getSerializedParams({ showPinPanel: true });

    expect(params.panel).toBe('pins');
  });

  test('showHighlightPanel: serializes panel=highlights', () => {
    const params = getSerializedParams({ showHighlightPanel: true });

    expect(params.panel).toBe('highlights');
  });

  test('neither showPinPanel nor showHighlightPanel nor wmsPanelOpen: serializes panel=layers', () => {
    const params = getSerializedParams({
      showPinPanel: false,
      showHighlightPanel: false,
      wmsPanelOpen: false,
    });

    expect(params.panel).toBe('layers');
  });

  test('wmsPanelOpen: serializes panel=wms', () => {
    const params = getSerializedParams({ wmsPanelOpen: true });

    expect(params.panel).toBe('wms');
  });

  test('compareShare takes precedence: does not serialize panel even if showPinPanel/showHighlightPanel are stale-true', () => {
    const params = getSerializedParams({ compareShare: true, showPinPanel: true, showHighlightPanel: true });

    expect(params).not.toHaveProperty('panel');
    expect(params.compareShare).toBe('true');
  });

  test('Search tab: does not serialize panel/compareShare even if a Visualize sub-panel is stale-true', () => {
    const params = getSerializedParams({
      selectedTabIndex: TABS.SEARCH_TAB,
      wmsPanelOpen: true,
      showPinPanel: true,
      compareShare: true,
    });

    expect(params).not.toHaveProperty('panel');
    expect(params).not.toHaveProperty('compareShare');
  });

  test('Order/RRD tab: does not serialize panel/compareShare even if a Visualize sub-panel is stale-true', () => {
    const params = getSerializedParams({
      selectedTabIndex: TABS.RAPID_RESPONSE_DESK,
      wmsPanelOpen: true,
      showPinPanel: true,
      compareShare: true,
    });

    expect(params).not.toHaveProperty('panel');
    expect(params).not.toHaveProperty('compareShare');
  });
});

describe('toggleInArray', () => {
  test('adds the value to the list when checked is true', () => {
    expect(toggleInArray(['a', 'b'], 'c', true)).toEqual(['a', 'b', 'c']);
  });

  test('removes the value from the list when checked is false', () => {
    expect(toggleInArray(['a', 'b', 'c'], 'b', false)).toEqual(['a', 'c']);
  });

  test('does not mutate the original list', () => {
    const original = ['a', 'b'];
    toggleInArray(original, 'c', true);
    expect(original).toEqual(['a', 'b']);
  });

  test('adding a value that is already in the list results in a duplicate', () => {
    expect(toggleInArray(['a', 'b'], 'a', true)).toEqual(['a', 'b', 'a']);
  });

  test('removing a value that is not in the list is a no-op', () => {
    expect(toggleInArray(['a', 'b'], 'z', false)).toEqual(['a', 'b']);
  });
});
