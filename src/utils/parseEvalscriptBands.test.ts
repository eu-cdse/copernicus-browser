import { parseEvalscriptBands } from './parseEvalscriptBands.util';
import { getDataSourceHandler } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
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

describe('parseEvalscriptBands — V3 evalscripts (//VERSION=3)', () => {
  test('standard V3 with 2.5 * sample.BAND multiplications', () => {
    const evalscript = `//VERSION=3
function setup() {
  return {
    input: ["B04","B03","B02", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02, sample.dataMask];
}`;
    expect(parseEvalscriptBands(evalscript)).toEqual(['B04', 'B03', 'B02']);
  });

  test('Kelvin V3 with HighlightCompressVisualizer(200, 375)', () => {
    const evalscript = `//VERSION=3
function setup() {
  return {
    input: ["B10","B11","B12", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  const visualizer = new HighlightCompressVisualizer(200, 375);
  return [visualizer.process(sample.B10), visualizer.process(sample.B11), visualizer.process(sample.B12), sample.dataMask];
}`;
    expect(parseEvalscriptBands(evalscript)).toEqual(['B10', 'B11', 'B12']);
  });

  test('fallback V3 with factor * sample.BAND pattern', () => {
    const evalscript = `//VERSION=3
function setup() {
  return {
    input: ["B04","B03","B02", "dataMask"],
    output: { bands: 4 }
  };
}
let factor = 2.5;
function evaluatePixel(sample) {
  // This comment is required for evalscript parsing to work
  return [factor * sample.B04,factor * sample.B03,factor * sample.B02, sample.dataMask ];
}`;
    expect(parseEvalscriptBands(evalscript)).toEqual(['B04', 'B03', 'B02']);
  });

  test('Landsat reflectance V3 with let val = [samples.BAND, ...] declaration', () => {
    const evalscript = `//VERSION=3
let minVal = 0.0;
let maxVal = 0.4;

let viz = new DefaultVisualizer(minVal, maxVal);

function evaluatePixel(samples) {
    let val = [samples.B04, samples.B03, samples.B02, samples.dataMask];
    return viz.processList(val);
}

function setup() {
  return {
    input: [{
      bands: ["B04","B03","B02","dataMask"]
    }],
    output: { bands: 4 }
  }
}`;
    expect(parseEvalscriptBands(evalscript)).toEqual(['B04', 'B03', 'B02']);
  });

  test('Landsat Kelvin V3 with HighlightCompressVisualizer(250, 320)', () => {
    const evalscript = `//VERSION=3
function setup() {
  return {
    input: ["B10", "B11", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  const visualizer = new HighlightCompressVisualizer(250, 320);
  return [visualizer.process(sample.B10), visualizer.process(sample.B11), visualizer.process(sample.B10), sample.dataMask];
}`;
    expect(parseEvalscriptBands(evalscript)).toEqual(['B10', 'B11', 'B10']);
  });

  test('index V3 evalscript returning an object returns []', () => {
    const evalscript = `//VERSION=3
const colorRamp = [[0,0x000000],[1,0xffffff]]

let viz = new ColorRampVisualizer(colorRamp);

function setup() {
  return {
    input: ["B03","B08", "dataMask"],
    output: [
      { id:"default", bands: 4 },
      { id: "index", bands: 1, sampleType: 'FLOAT32' }
    ]
  };
}

function evaluatePixel(samples) {
  let index = (samples.B03-samples.B08)/(samples.B03+samples.B08);
  return { default: [0,0,0,0], index: [0] };
}`;
    expect(parseEvalscriptBands(evalscript)).toEqual([]);
  });

  test('dataMask is filtered out from results', () => {
    const evalscript = `//VERSION=3
function setup() {
  return {
    input: ["B04", "dataMask"],
    output: { bands: 2 }
  };
}

function evaluatePixel(sample) {
  return [2.5 * sample.B04, sample.dataMask];
}`;
    expect(parseEvalscriptBands(evalscript)).toEqual(['B04']);
  });

  test('truncated V3 evalscript (missing closing braces) still returns bands', () => {
    const evalscript = `//VERSION=3
function setup() {
  return {
    input: ["B04","B03","B02", "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  return [2.5 * sample.B04, 2.5 * sample.B03, 2.5 * sample.B02, sample.dataMask];
`;
    expect(parseEvalscriptBands(evalscript)).toEqual(['B04', 'B03', 'B02']);
  });

  test('V3 evalscript without evaluatePixel function returns []', () => {
    const evalscript = `//VERSION=3
function setup() {
  return {
    input: ["B04","B03","B02", "dataMask"],
    output: { bands: 4 }
  };
}`;
    expect(parseEvalscriptBands(evalscript)).toEqual([]);
  });
});

describe('parseEvalscriptBands — old format (no //VERSION=3)', () => {
  test('coefficient on left: 2.5*B04 style (constructBasicEvalscript output)', () => {
    const evalscript = 'return [2.5*B04,2.5*B03,2.5*B02];';
    expect(parseEvalscriptBands(evalscript)).toEqual(['B04', 'B03', 'B02']);
  });

  test('coefficient on right: B04 * 2.5 style', () => {
    const evalscript = 'return [ B04 * 2.5, B03 * 2.5, B02 * 2.5 ];';
    expect(parseEvalscriptBands(evalscript)).toEqual(['B04', 'B03', 'B02']);
  });

  test('bare band names without coefficient', () => {
    const evalscript = 'return [B04,B03,B02];';
    expect(parseEvalscriptBands(evalscript)).toEqual(['B04', 'B03', 'B02']);
  });

  test('empty string returns []', () => {
    expect(parseEvalscriptBands('')).toEqual([]);
  });

  test('malformed evalscript (invalid JS) returns []', () => {
    expect(parseEvalscriptBands('this is not valid javascript @@##!!')).toEqual([]);
  });

  test('dataMask is filtered out from old-format results', () => {
    const evalscript = 'return [B04, B03, dataMask];';
    expect(parseEvalscriptBands(evalscript)).toEqual(['B04', 'B03']);
  });

  test('single band old-format evalscript', () => {
    const evalscript = 'return [B08];';
    expect(parseEvalscriptBands(evalscript)).toEqual(['B08']);
  });
});

describe('parseEvalscriptBands — round-trip via generateEvalscript', () => {
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
    'round-trip: generateEvalscript then parseEvalscriptBands returns selected bands for %s',
    (datasetId) => {
      const datasourceHandler = getDataSourceHandler(datasetId);
      if (!datasourceHandler.supportsCustomLayer()) {
        return;
      }
      const availableBands = datasourceHandler.getBands(datasetId);
      if (!availableBands || availableBands.length === 0) {
        return;
      }
      // Build a selectedBands object: pick up to 3 bands (cycling if fewer than 3 available)
      const bandNames = [...availableBands, ...availableBands, ...availableBands]
        .slice(0, 3)
        .map((b: { name: string }) => b.name);
      const selectedBands = { r: bandNames[0], g: bandNames[1], b: bandNames[2] };
      const evalscript = datasourceHandler.generateEvalscript(selectedBands, datasetId);
      const parsed = parseEvalscriptBands(evalscript);
      expect(parsed).toEqual(Object.values(selectedBands));
    },
  );
});
