import { cacheConfig, getMetadataFromCache } from './MetadataCache';

const capabilitiesRequestRegEx = new RegExp(/(sentinel-hub.com|dataspace.copernicus.eu)\/ogc\/wms/);

const isGetCapabilitiesRequest = ({ url }) => {
  return capabilitiesRequestRegEx.test(url) && url.indexOf('request=GetCapabilities') > -1;
};

export const cachedCapabilitiesInterceptor = async (request) => {
  if (isGetCapabilitiesRequest(request)) {
    const instanceUrl = request.url.substring(0, request.url.lastIndexOf('?'));
    const instanceId = instanceUrl.split('/').pop();
    const layers = getMetadataFromCache(cacheConfig.capabilities, instanceId);
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
