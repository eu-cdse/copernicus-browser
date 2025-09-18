import { RRD_THEMES } from '../assets/cache/rrdThemes';
import { DEFAULT_THEMES } from '../assets/default_themes';

const configurationCache = {};
const capabilitiesCache = {};

export const cacheConfig = {
  configuration: {
    fileName: 'configuration',
    cache: configurationCache,
  },
  capabilities: {
    fileName: 'capabilities',
    cache: capabilitiesCache,
  },
};

export const initMetadaCache = async (config) => {
  // Load all cache entries from the four generated files
  let mainData = {};
  let rrdData = {};
  try {
    const mainResponse = await import(`../assets/cache/${config.fileName}.json`);
    mainData = mainResponse.default;
  } catch (e) {
    mainData = {};
  }
  try {
    const rrdResponse = await import(`../assets/cache/rrd_${config.fileName}.json`);
    rrdData = rrdResponse.default;
  } catch (e) {
    rrdData = {};
  }

  // Load from DEFAULT_THEMES (main) and RRD_THEMES (rrd)
  DEFAULT_THEMES.forEach((t) => {
    t.content.forEach((theme) => {
      const instanceId = theme.url.split('/').pop();
      if (instanceId !== undefined && mainData[instanceId] !== undefined) {
        config.cache[instanceId] = mainData[instanceId];
      }
    });
  });
  RRD_THEMES.forEach((t) => {
    t.content.forEach((theme) => {
      const instanceId = theme.url.split('/').pop();
      if (instanceId !== undefined && rrdData[instanceId] !== undefined) {
        config.cache[instanceId] = rrdData[instanceId];
      }
    });
  });
};

export const getMetadataFromCache = (config, cacheKey) => {
  const cachedData = config.cache[cacheKey];
  return cachedData;
};
