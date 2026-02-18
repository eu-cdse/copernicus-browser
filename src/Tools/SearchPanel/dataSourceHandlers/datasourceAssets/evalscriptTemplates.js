/**
 * Evalscript template generators for various datasets
 */

/**
 * Generate fallback evalscript with factor multiplication
 * @param {string[]} bandNames - Selected band names (can have duplicates)
 * @param {string[]} uniqueBands - Unique band names
 * @param {number} factor - Scaling factor to apply to samples
 * @returns {string} VERSION=3 evalscript
 */
export const generateFallbackEvalscript = (bandNames, uniqueBands, factor) => {
  return `//VERSION=3
function setup() {
  return {
    input: ["${uniqueBands.join('","')}", "dataMask"],
    output: { bands: 4 }
  };
}
let factor = ${factor};
function evaluatePixel(sample) {
  // This comment is required for evalscript parsing to work
  return [${bandNames.map((e) => 'factor * sample.' + e).join(',')}, sample.dataMask ];
}`;
};

/**
 * Generate Landsat reflectance evalscript with DefaultVisualizer
 * @param {string[]} bandNames - Selected band names (can have duplicates)
 * @param {string[]} uniqueBands - Unique band names
 * @returns {string} VERSION=3 evalscript
 */
export const generateLandsatReflectanceEvalscript = (bandNames, uniqueBands) => {
  const bandSamples = bandNames.map((b) => `samples.${b}`).join(', ');
  const bandList = uniqueBands.map((b) => `"${b}"`).join(',');

  return `//VERSION=3
let minVal = 0.0;
let maxVal = 0.4;

let viz = new DefaultVisualizer(minVal, maxVal);

function evaluatePixel(samples) {
    let val = [${bandSamples}, samples.dataMask];
    return viz.processList(val);
}

function setup() {
  return {
    input: [{
      bands: [${bandList},"dataMask"]
    }],
    output: { bands: 4 }
  }
}`;
};

/**
 * Generate Landsat thermal infrared evalscript with HighlightCompressVisualizer
 * @param {string[]} bandNames - Selected band names (can have duplicates)
 * @param {string[]} uniqueBands - Unique band names
 * @returns {string} VERSION=3 evalscript
 */
export const generateLandsatKelvinEvalscript = (bandNames, uniqueBands) => {
  const bandInput = uniqueBands.map((b) => `"${b}"`).join(', ');
  const band0 = bandNames[0];
  const band1 = bandNames.length > 1 ? bandNames[1] : bandNames[0];

  return `//VERSION=3
function setup() {
  return {
    input: [${bandInput}, "dataMask"],
    output: { bands: 4 }
  };
}

function evaluatePixel(sample) {
  const visualizer = new HighlightCompressVisualizer(250, 320);
  return [visualizer.process(sample.${band0}), visualizer.process(sample.${band1}), visualizer.process(sample.${band0}), sample.dataMask];
}`;
};
