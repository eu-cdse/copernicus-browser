import { TextDecoder, TextEncoder } from 'util';

global.TextDecoder = TextDecoder;
global.TextEncoder = TextEncoder;
global.window.API_ENDPOINT_CONFIG = {
  SH_SERVICES_URL: 'https://sh.dataspace.copernicus.eu',
  AUTH_BASEURL: 'https://identity.dataspace.copernicus.eu',
};
