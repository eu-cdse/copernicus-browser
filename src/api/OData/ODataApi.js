import axios from 'axios';
import { ODataQueryBuilder } from './ODataQueryBuilder';
import { executeRequest } from '../httpRequestResolver';

const defaultRequestOptions = {
  retriesLeft: 3,
  delayBetweenRetries: 1000,
};

const ODataEndpoints = {
  search: 'https://catalogue.dataspace.copernicus.eu/odata/v1/',
  download: 'https://download.dataspace.copernicus.eu/odata/v1/',
  listNodes: 'https://download.dataspace.copernicus.eu/odata/v1/',
};

const HttpClients = () => {
  const clients = new Map();

  const getClient = (endpoint) => {
    if (!clients.has(endpoint)) {
      clients.set(
        endpoint,
        axios.create({
          baseURL: endpoint,
        }),
      );
    }

    return clients.get(endpoint);
  };

  return {
    getSearchClient: () => getClient(ODataEndpoints.search),
    getDownloadClient: () => getClient(ODataEndpoints.download),
  };
};

const ODataApi = () => {
  const httpClients = HttpClients();

  const search = async (entity, queryBuilder, authToken) => {
    if (!entity) {
      throw new Error('Entity is not defined');
    }

    let queryString;
    if (queryBuilder) {
      queryString = queryBuilder.getQueryString();
    } else {
      queryString = new ODataQueryBuilder(entity).getQueryString();
    }

    const requestConfig = {
      ...(authToken
        ? {
            headers: {
              Authorization: `Bearer ${authToken}`,
            },
          }
        : {}),
    };

    return await executeRequest(
      httpClients.getSearchClient(),
      'get',
      { queryPathString: queryString },
      requestConfig,
    );
  };

  const download = async (
    token,
    entity,
    id,
    nodeUri = null,
    updateProgress = () => {},
    cancelToken = null,
  ) => {
    if (!token) {
      throw new Error('Token is not defined');
    }

    if (!entity) {
      throw new Error('Entity is not defined');
    }

    if (!id) {
      throw new Error('Id is not defined');
    }

    let downloadUrl = nodeUri;

    if (!downloadUrl) {
      downloadUrl = new ODataQueryBuilder(entity).value(id).getQueryString();
    }

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      ...(cancelToken ? { signal: cancelToken.signal } : {}),
      responseType: 'blob',
      onDownloadProgress: (progressEvent) => {
        if (updateProgress) {
          const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
          updateProgress(percentCompleted);
        }
      },
    };
    return await executeRequest(
      httpClients.getDownloadClient(),
      'get',
      { queryPathString: downloadUrl },
      requestConfig,
      {
        ...defaultRequestOptions,
        updateProgress: updateProgress,
      },
    );
  };

  const listNodes = async (token, nodesUri, cancelToken = null) => {
    if (!token) {
      throw new Error('Token is not defined');
    }

    if (!nodesUri) {
      throw new Error('NodesUri is not defined');
    }

    const requestConfig = {
      headers: {
        Authorization: `Bearer ${token}`,
      },
      ...(cancelToken ? { cancelToken: cancelToken.token } : {}),
    };

    try {
      const { data } = await axios.get(nodesUri, requestConfig);

      return [
        ...data?.result?.filter((n) => n.ChildrenNumber > 0).sort((a, b) => a.Name.localeCompare(b.Name)),
        ...data?.result?.filter((n) => n.ChildrenNumber === 0).sort((a, b) => a.Name.localeCompare(b.Name)),
      ];
    } catch (e) {
      if (axios.isCancel(e)) {
        console.log(e.message);
        return;
      }

      console.error('listNodes %s failed with %s', nodesUri, e.message);
      throw e;
    }
  };

  return { search, download, listNodes };
};

const oDataApi = ODataApi();

export { oDataApi, ODataEndpoints };
