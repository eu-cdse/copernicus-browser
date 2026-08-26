import axios from 'axios';
import { executeRequest, DEFAULT_RETRY_OPTIONS } from '../httpRequestResolver';
import { getErrorStatus } from '../../utils';

const RRDApiBaseUrlEndpoints = {
  search: import.meta.env.VITE_RRD_BASE_URL + '/sor',
  cart: import.meta.env.VITE_RRD_BASE_URL + '/dred',
};

const HttpServiceInstances = () => {
  const instances = new Map();

  const getAxiosInstance = (endpoint) => {
    if (!instances.has(endpoint)) {
      instances.set(
        endpoint,
        axios.create({
          baseURL: endpoint,
          headers: {
            'Content-Type': 'application/json',
          },
        }),
      );
    }

    return instances.get(endpoint);
  };

  return {
    getSearchInstance: () => getAxiosInstance(RRDApiBaseUrlEndpoints.search),
    getCartInstance: () => getAxiosInstance(RRDApiBaseUrlEndpoints.cart),
  };
};

const RETRYABLE_STATUS_CODES = [429];

const RRDApi = () => {
  const httpServiceInstances = HttpServiceInstances();

  // Returns true when the request must NOT be retried.
  const retryRestrictionFunc = (e) => {
    const statusCode = getErrorStatus(e);
    if (!Number.isFinite(statusCode)) {
      return true;
    }
    return !(RETRYABLE_STATUS_CODES.includes(statusCode) || (statusCode >= 500 && statusCode <= 599));
  };

  const setAuthToken = (authToken) => {
    return {
      ...(authToken
        ? {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        : {}),
    };
  };

  const search = async (queryBodyObject, authToken) => {
    const requestConfig = setAuthToken(authToken);

    return await executeRequest(
      httpServiceInstances.getSearchInstance(),
      'post',
      {
        queryPathString: '/mw/search',
        queryBody: queryBodyObject,
      },
      requestConfig,
      {
        ...DEFAULT_RETRY_OPTIONS,
        retryRestrictionFunc: retryRestrictionFunc,
      },
    );
  };

  const getCollections = async (authToken) => {
    // TODO: authToken for later.
    const requestConfig = setAuthToken(authToken);

    return await executeRequest(
      httpServiceInstances.getSearchInstance(),
      'get',
      {
        queryPathString: '/mw/collections',
      },
      requestConfig,
      {
        ...DEFAULT_RETRY_OPTIONS,
        retryRestrictionFunc: retryRestrictionFunc,
      },
    );
  };

  const getCart = async (authToken) => {
    const requestConfig = setAuthToken(authToken);

    return await executeRequest(
      httpServiceInstances.getCartInstance(),
      'get',
      {
        queryPathString: '/mw/getcart',
      },
      requestConfig,
      {
        ...DEFAULT_RETRY_OPTIONS,
        retryRestrictionFunc: retryRestrictionFunc,
      },
    );
  };

  // Not retried: addToCart is a non-idempotent POST, and retrying it could double-add an item.
  const addToCart = async (queryBodyObject, authToken) => {
    const requestConfig = setAuthToken(authToken);

    return await executeRequest(
      httpServiceInstances.getCartInstance(),
      'post',
      {
        queryPathString: '/mw/addtocart',
        queryBody: queryBodyObject,
      },
      requestConfig,
      {
        retryRestrictionFunc: retryRestrictionFunc,
      },
    );
  };

  // Not retried: removeFromCart is a non-idempotent POST, and retrying it could double-apply the removal.
  const removeFromCart = async (queryBodyObject, authToken) => {
    const requestConfig = setAuthToken(authToken);

    return await executeRequest(
      httpServiceInstances.getCartInstance(),
      'post',
      {
        queryPathString: '/mw/removeSceneId',
        queryBody: queryBodyObject,
      },
      requestConfig,
      {
        retryRestrictionFunc: retryRestrictionFunc,
      },
    );
  };

  const getProfile = async (authToken) => {
    const requestConfig = setAuthToken(authToken);

    return await executeRequest(
      httpServiceInstances.getCartInstance(),
      'get',
      {
        queryPathString: '/mw/getprofile',
      },
      requestConfig,
      {
        ...DEFAULT_RETRY_OPTIONS,
        retryRestrictionFunc: retryRestrictionFunc,
      },
    );
  };

  return { search, getCollections, getCart, addToCart, removeFromCart, getProfile };
};

const rrdApi = RRDApi();

export { rrdApi };
