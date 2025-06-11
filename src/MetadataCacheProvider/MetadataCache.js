import { RRD_THEMES } from '../assets/cache/rrdThemes';
import { DEFAULT_THEMES } from '../assets/default_themes';

const configurationCache = {};
const capabilitiesCache = {};

export const cacheConfig = {
  configuration: {
    dir: 'configuration',
    cache: configurationCache,
  },
  capabilities: {
    dir: 'capabilities',
    cache: capabilitiesCache,
  },
};

export const initMetadaCache = async (config) => {
  const p1 = [...DEFAULT_THEMES, ...RRD_THEMES].map(async (t) => {
    const p2 = t.content.map(async (theme) => {
      const instanceId = theme.url.split('/').pop();
      try {
        if (instanceId !== undefined) {
          const response = await import(`../assets/cache/${config.dir}/${instanceId}.json`);
          config.cache[instanceId] = response.default;
        }
      } catch (e) {}
    });
    return Promise.all(p2);
  });
  await Promise.all(p1);
};

export const getMetadataFromCache = (config, cacheKey) => {
  const cachedData = config.cache[cacheKey];
  return cachedData;
};
