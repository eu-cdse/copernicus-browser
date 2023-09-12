export function isCustomPreset(preset) {
  return preset === 'CUSTOM';
}

export function getMultipliedLayers(layers) {
  let result = [];
  for (let layer in layers) {
    if (layers.hasOwnProperty(layer)) {
      result.push(`${layers[layer]}*2.5`);
    }
  }
  return result.join(',');
}

export function isScriptFromLayers(script, layers) {
  return btoa('return [' + getMultipliedLayers(layers) + '];') === script;
}
