import { MAPSERVER_WMS_CAPABILITIES_XML } from '../assets/cache/mapserverWmsCapabilities';

const mapserverCapabilitiesRequestRegEx = new RegExp(/mapserver\.dataspace\.copernicus\.eu\/ogc\?/i);

const isMapserverGetCapabilitiesRequest = ({ url }) => {
  return (
    mapserverCapabilitiesRequestRegEx.test(url) &&
    /request=GetCapabilities/i.test(url) &&
    /service=wms/i.test(url)
  );
};

// The mapserver.dataspace.copernicus.eu WMS GetCapabilities endpoint is public (no admin auth
// needed) but has been unstable; this data doesn't change often, so serve a bundled snapshot
// instead of hitting the network. Regenerate the snapshot with:
// `npm run update-mapserver-capabilities-cache`.
export const cachedMapserverCapabilitiesInterceptor = async (request) => {
  if (isMapserverGetCapabilitiesRequest(request)) {
    request.adapter = async () => {
      return Promise.resolve({
        data: MAPSERVER_WMS_CAPABILITIES_XML,
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
