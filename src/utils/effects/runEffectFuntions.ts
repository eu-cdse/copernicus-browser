import { getBlob, getImageProperties } from '@sentinel-hub/sentinelhub-js';
import { Effects } from '../../types/effectTypes';
import { isAnyEffectSet, transformValueToRange } from './mapDataManipulationUtils';
import { runGainEffectFunction, runGammaEffectFunction, runColorEffectFunction } from './effectFunctions';

// The algorithm works with numbers between 0 and 1, so we must:
// - change the range of the values from [0, 255] to [0, 1]
// - change the values according to the algorithms (gain; gamma; r,g,b effects; custom effect)
// - change the range of the values from [0, 1] back to [0, 255]

export async function runEffectFunctions(originalBlob: Blob, effects: Effects): Promise<Blob> {
  if (!isAnyEffectSet(effects)) {
    return originalBlob;
  }

  const { rgba, width, height, format } = await getImageProperties(originalBlob);

  // change the range of the values from [0, 255] to [0, 1]
  let rgbaArray = new Array(rgba.length);
  for (let i = 0; i < rgba.length; i++) {
    rgbaArray[i] = transformValueToRange(rgba[i], 0, 255, 0, 1);
  }

  // change the values according to the algorithm (gain)
  rgbaArray = runGainEffectFunction(rgbaArray, effects);

  // change the values according to the algorithm (gamma)
  rgbaArray = runGammaEffectFunction(rgbaArray, effects);

  // change the values according to the algorithm (r,g,b effects)
  rgbaArray = runColorEffectFunction(rgbaArray, effects);

  // change the range of the values from [0, 1] back to [0, 255]
  const newImgData = new Uint8ClampedArray(rgbaArray.length);
  for (let i = 0; i < rgbaArray.length; i++) {
    newImgData[i] = transformValueToRange(rgbaArray[i], 0, 1, 0, 255);
  }

  const newBlob = await getBlob({ rgba: newImgData, width, height, format });
  return newBlob;
}
