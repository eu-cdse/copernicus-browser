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
  DEFAULT_THEMES.forEach((t) =>
    t.content.forEach(async (theme) => {
      const instanceId = theme.url.split('/').pop();
      try {
        const response = await import(`../assets/cache/${config.dir}/${instanceId}.json`);
        config.cache[instanceId] = response.default;
      } catch (e) {}
    }),
  );
};

export const getMetadataFromCache = (config, cacheKey) => {
  const cachedData = config.cache[cacheKey];
  return cachedData;
};
