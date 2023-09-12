import { cacheConfig, getMetadataFromCache } from './MetadataCache';

const configurationRequestRegEx = new RegExp(
  /(services.sentinel-hub.com|creodias.sentinel-hub.com|dataspace.copernicus.eu)\/configuration\/v1\/wms\/instances/,
);

const isConfigurationRequest = ({ url }) => {
  return configurationRequestRegEx.test(url);
};

export const cachedInstancesInterceptor = async (request) => {
  if (isConfigurationRequest(request)) {
    const instanceUrl = request.url.split('/').slice(0, -1).join('/');
    const instanceId = instanceUrl.split('/').pop();
    const layers = getMetadataFromCache(cacheConfig.configuration, instanceId);
    // if instance is not cached, proceed with request
    if (!layers) {
      return request;
    }

    request.adapter = async () => {
      return Promise.resolve({
        data: layers,
        headers: request.headers,
        request: request,
        config: request,
        responseType: request.responseType,
      });
    };
    return request;
  }
  return request;
};
