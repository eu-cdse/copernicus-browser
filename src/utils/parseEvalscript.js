import { parseScript } from 'esprima';
import escodegen from 'escodegen';

const DEFAULT_OUTPUT_ID = 'default';

export function getEvalscriptSetup(evalscript) {
  const setup = {
    id: DEFAULT_OUTPUT_ID,
    sampleType: 'AUTO',
  };
  try {
    const parsed = parseScript(evalscript, { jsx: true, tolerant: true });
    const { input, output } = getSetupObjects(parsed);

    if (input.value.elements[0].type === 'Literal') {
      setup['bands'] = input.value.elements.map((e) => e.value);
    } else {
      setup['bands'] = [];
      for (let obj of input.value.elements) {
        const datasource = obj.properties.find((p) => p.key.name === 'datasource');
        const bands = obj.properties.find((p) => p.key.name === 'bands').value.elements.map((e) => e.value);
        setup.bands.push({ datasource: datasource ? datasource.value.value : null, bands: bands });
      }
    }

    // setup in evalscript can have multiple outputs
    // the 'default' output is not guaranteed to be the first one, so we try to find it
    // if we don't find it, the first output object is used
    const outputArr = output.value.elements
      ? output.value.elements.map((e) => e.properties)
      : [output.value.properties];
    let outputObj = outputArr[0];
    for (let o of outputArr) {
      const idObj = o.find((p) => p.key.name === 'id');
      if (idObj && idObj.value.value === DEFAULT_OUTPUT_ID) {
        outputObj = o;
        break;
      }
    }

    const id = outputObj.find((p) => p.key.name === 'id');
    if (id) {
      setup.id = id.value.value;
    }
    const sampleType = outputObj.find((p) => p.key.name === 'sampleType');
    if (sampleType) {
      setup.sampleType = sampleType.value.value;
    }
    setup.nBands = outputObj.find((p) => p.key.name === 'bands').value.value;
    return setup;
  } catch (e) {
    return null;
  }
}

export function setEvalscriptSampleType(evalscript, sampleType) {
  try {
    const parsed = parseScript(evalscript, {
      jsx: true,
      tolerant: true,
      range: true,
      tokens: true,
      comment: true,
    });
    escodegen.attachComments(parsed, parsed.comments, parsed.tokens);
    const { output } = getSetupObjects(parsed);

    if (output.value.elements) {
      // find the index of the default output object
      // use the first index if default output object is not found
      const outputArr = output.value.elements.map((e) => e.properties);
      let defaultOutputIndex = 0;
      for (let index in outputArr) {
        const idObj = outputArr[index].find((p) => p.key.name === 'id');
        if (idObj && idObj.value.value === DEFAULT_OUTPUT_ID) {
          defaultOutputIndex = index;
          break;
        }
      }

      const _sampleType = output.value.elements[defaultOutputIndex].properties.find(
        (p) => p.key.name === 'sampleType',
      );
      if (_sampleType) {
        _sampleType.value.value = sampleType;
        _sampleType.value.raw = `""${sampleType}""`;
      } else {
        const a = parseScript(`b = {sampleType: "${sampleType}"}`);
        const newProperty = a.body[0].expression.right.properties[0];
        output.value.elements[defaultOutputIndex].properties.push(newProperty);
      }
    } else {
      const _sampleType = output.value.properties.find((p) => p.key.name === 'sampleType');
      if (_sampleType) {
        _sampleType.value.value = sampleType;
        _sampleType.value.raw = `""${sampleType}""`;
      } else {
        const a = parseScript(`b = {sampleType: "${sampleType}"}`);
        const newProperty = a.body[0].expression.right.properties[0];
        output.value.properties.push(newProperty);
      }
    }
    return escodegen.generate(parsed, { comment: true });
  } catch (e) {
    return evalscript;
  }
}

export function setEvalscriptOutputScale(evalscript, scaleFactor) {
  try {
    const parsed = parseScript(evalscript, {
      jsx: true,
      tolerant: true,
      range: true,
      tokens: true,
      comment: true,
    });
    escodegen.attachComments(parsed, parsed.comments, parsed.tokens);
    const evaluatePixelFunction = parsed.body.find((d) => d.id && d.id.name === 'evaluatePixel');
    evaluatePixelFunction.id.name = '__noScaleFactor__evaluatePixel';
    const newEvaluatePixel = `
    function evaluatePixel(sample, scene, inputMetadata, customData, outputMetadata) {
      let output = __noScaleFactor__evaluatePixel(sample, scene, inputMetadata, customData, outputMetadata);

      if(!Array.isArray(output)){
        for(let key in output){
          output[key] = output[key].map(v => v * ${scaleFactor});
        }
        return output;
      }

      return output.map(v => v * ${scaleFactor});
    }
    `;
    const newEvaluatePixelParsed = parseScript(newEvaluatePixel, { jsx: true, tolerant: true });
    parsed.body.push(newEvaluatePixelParsed);
    const newEvalscript = escodegen.generate(parsed, { comment: true });
    return newEvalscript;
  } catch (e) {
    return evalscript;
  }
}

function getSetupObjects(tree) {
  const setupFunction = tree.body.find((d) => d.id && d.id.name === 'setup');
  const input = setupFunction.body.body[0].argument.properties.find((p) => p.key.name === 'input');
  const output = setupFunction.body.body[0].argument.properties.find((p) => p.key.name === 'output');
  return { input: input, output: output };
}

export function setEvalscriptOutputBandNumber(evalscript, nBands) {
  try {
    const parsed = parseScript(evalscript, {
      jsx: true,
      tolerant: true,
      range: true,
      tokens: true,
      comment: true,
    });
    escodegen.attachComments(parsed, parsed.comments, parsed.tokens);
    const { output } = getSetupObjects(parsed);
    if (output.value.elements) {
      // find the index of the default output object
      // use the first index if default output object is not found
      const outputArr = output.value.elements.map((e) => e.properties);
      let defaultOutputIndex = 0;
      for (let index in outputArr) {
        const idObj = outputArr[index].find((p) => p.key.name === 'id');
        if (idObj && idObj.value.value === DEFAULT_OUTPUT_ID) {
          defaultOutputIndex = index;
          break;
        }
      }

      const originalNBands = output.value.elements[defaultOutputIndex].properties.find(
        (p) => p.key.name === 'bands',
      );
      originalNBands.value.raw = nBands.toString();
      originalNBands.value.value = nBands;
    } else {
      const originalNBands = output.value.properties.find((p) => p.key.name === 'bands');
      originalNBands.value.raw = nBands.toString();
      originalNBands.value.value = nBands;
    }
    return escodegen.generate(parsed, { comment: true });
  } catch (e) {
    return evalscript;
  }
}

export function checkIfIndexOutputInEvalscript(evalscript) {
  const OUTPUT_ID = 'index';
  const N_BANDS = 1;
  const SAMPLE_TYPE = 'FLOAT32';

  let isIndexOutputPresent = false;
  try {
    const parsed = parseScript(evalscript, { jsx: true, tolerant: true });
    const setupFunction = parsed.body.find((d) => d.id && d.id.name === 'setup');
    const output = setupFunction.body.body[0].argument.properties.find((p) => p.key.name === 'output');
    const outputArr = output.value.elements
      ? output.value.elements.map((e) => e.properties)
      : [output.value.properties];

    for (let o of outputArr) {
      const idObj = o.find((p) => p.key.name === 'id');
      const isIdIndex = idObj ? idObj.value.value === OUTPUT_ID : false;

      const sampleTypeObj = o.find((p) => p.key.name === 'sampleType');
      const isSampleTypeFloat32 = sampleTypeObj ? sampleTypeObj.value.value === SAMPLE_TYPE : false;

      const nBandsObj = o.find((p) => p.key.name === 'bands');
      const isOneChannelOutput = nBandsObj ? nBandsObj.value.value === N_BANDS : false;

      isIndexOutputPresent = isIdIndex && isSampleTypeFloat32 && isOneChannelOutput;
      if (isIndexOutputPresent) {
        break;
      }
    }
  } catch (err) {
    console.warn('Unable to parse evalscript', err);
  }

  return isIndexOutputPresent;
}

export function getOutputIds(evalscript) {
  if (!evalscript) {
    return null;
  }
  try {
    const parsed = parseScript(evalscript, { jsx: true, tolerant: true });
    const setupFunction = parsed.body.find((d) => d.id && d.id.name === 'setup');
    const output = setupFunction.body.body[0].argument.properties.find((p) => p.key.name === 'output');
    const outputArr = output.value.elements
      ? output.value.elements.map((e) => e.properties)
      : [output.value.properties];

    return outputArr.map((outputElement) => {
      const idObj = outputElement.find((p) => p.key.name === 'id');
      return idObj ? idObj.value.value : undefined;
    });
  } catch (err) {
    return null;
  }
}

export function checkAllMandatoryOutputsExist(evalscript, outputIds) {
  if (!evalscript || !outputIds || outputIds.length === 0) {
    return false;
  }
  try {
    const outputArr = getOutputIds(evalscript);

    return outputIds.every((outputId) => outputArr.indexOf(outputId) > -1);
  } catch (err) {
    return false;
  }
}
