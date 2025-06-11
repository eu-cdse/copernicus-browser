import axios from 'axios';
import { executeRequest } from '../httpRequestResolver';

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

const RRDApi = () => {
  const httpServiceInstances = HttpServiceInstances();

  const retryRestrictionFunc = (e) => {
    const statusCode = e.message.split(' ').pop();
    return !((Number(statusCode) >= 500 && Number(statusCode) <= 599) || statusCode === 429);
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
        retryRestrictionFunc: retryRestrictionFunc,
      },
    );
  };

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
        retryRestrictionFunc: retryRestrictionFunc,
      },
    );
  };

  return { search, getCollections, getCart, addToCart, removeFromCart, getProfile };
};

const rrdApi = RRDApi();

export { rrdApi };
