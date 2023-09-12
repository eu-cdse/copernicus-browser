import axios from 'axios';
import { SHV3_LOCATIONS_ROOT_URL } from '@sentinel-hub/sentinelhub-js';

import store from '../store';

export function getCollectionInformation(collectionId, locationId, subType) {
  const auth = store.getState()['auth'];
  const token = auth.user && auth.user.access_token ? auth.user.access_token : auth.anonToken;
  const headers = {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  };
  const requestConfig = {
    headers: headers,
  };
  const baseUrl = SHV3_LOCATIONS_ROOT_URL[locationId];
  return axios.get(
    `${baseUrl}api/v1/catalog/1.0.0/collections/${subType === 'BATCH' ? 'batch' : 'byoc'}-${collectionId}`,
    requestConfig,
  );
}
