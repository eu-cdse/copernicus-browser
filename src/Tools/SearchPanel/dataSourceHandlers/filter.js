const SHADOW_LAYERS_START = '__';
const CACHE_REGEXP_LAYERS_FILTER = {};

export const filterLayers = (layerId, layersExclude, layersInclude) => {
  if (layerId.startsWith(SHADOW_LAYERS_START)) {
    return false;
  }
  if (layersInclude) {
    if (Array.isArray(layersInclude)) {
      if (layersInclude.some((filter) => filterStringMatches(filter, layerId))) {
        return true;
      }
    } else {
      if (filterStringMatches(layersInclude, layerId)) {
        return true;
      }
    }
  }
  if (layersExclude) {
    if (Array.isArray(layersExclude)) {
      if (layersExclude.some((filter) => filterStringMatches(filter, layerId))) {
        return false;
      }
    } else {
      if (filterStringMatches(layersExclude, layerId)) {
        return false;
      }
    }
  }
  return true;
};

const filterStringMatches = (filterString, x) => {
  // Limitations if user wants to use a string as regex:
  // - first char must be "/" or "#" (regexChar) - this denotes a regex; if other limits are not obeyed, the filter will not match
  // - there must be exactly 2 regexChar-s in the target string
  // - the last part is "" or "i"

  const regexChar = filterString[0];
  if (regexChar !== '/' && regexChar !== '#') {
    // filterString is not a regex, usual compare:
    return filterString === x;
  }

  // we have a regex:
  if (!CACHE_REGEXP_LAYERS_FILTER[filterString]) {
    // cache for RegExp objects doesn't have this entry, update it:
    const parts = filterString.split(regexChar);
    if (parts.length !== 3) {
      console.warn(`Invalid regex: ${filterString} (should have exactly 2 "${regexChar}" characters)`);
      return false;
    }
    const [, regexContent, regexFlags] = parts;
    if (regexFlags !== '' && regexFlags !== 'i') {
      console.warn(
        `Invalid regex: ${filterString} (part after the last "${regexChar}" should be an empty string or "i")`,
      );
      return false;
    }

    CACHE_REGEXP_LAYERS_FILTER[filterString] = new RegExp(regexContent, regexFlags);
  }

  const r = CACHE_REGEXP_LAYERS_FILTER[filterString];
  return r.test(x);
};
