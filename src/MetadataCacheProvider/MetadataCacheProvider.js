import { useEffect, useState } from 'react';
import { addAxiosRequestInterceptor } from '@sentinel-hub/sentinelhub-js';

import { cacheConfig, initMetadaCache } from './MetadataCache';
import { cachedInstancesInterceptor } from './cachedInstancesInterceptor';
import { cachedCapabilitiesInterceptor } from './cachedCapabilitiesInterceptor';

const MetadataCacheProvider = ({ children }) => {
  const [completed, setCompleted] = useState(false);
  useEffect(() => {
    async function init() {
      //load saved responses
      await initMetadaCache(cacheConfig.configuration);
      await initMetadaCache(cacheConfig.capabilities);
      //add axios interceptors to handle configuration and capabilities requests
      addAxiosRequestInterceptor(cachedInstancesInterceptor);
      addAxiosRequestInterceptor(cachedCapabilitiesInterceptor);
      setCompleted(true);
    }

    init();
  }, []);
  if (!completed) {
    return null;
  }
  return children;
};

export default MetadataCacheProvider;
