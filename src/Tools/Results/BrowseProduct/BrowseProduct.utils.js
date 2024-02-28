import { useEffect, useState } from 'react';
import { ODataEndpoints, extractResponseErrorMessage, oDataApi } from '../../../api/OData/ODataApi';
import { ODataEntity } from '../../../api/OData/ODataTypes';
import store, { notificationSlice } from '../../../store';
import { ODataQueryBuilder } from '../../../api/OData/ODataQueryBuilder';

export const getNodeValueUri = (node) => node.Nodes.uri.replace(/\/Nodes$/, '/$value');

export const handleError = async (e) => {
  const responseErrorMessage = await extractResponseErrorMessage(e);
  let errorMessage = e.message;
  if (responseErrorMessage) {
    errorMessage = `${errorMessage}:\n${responseErrorMessage}`;
  }
  console.error(errorMessage);
  store.dispatch(notificationSlice.actions.displayError(errorMessage));
};

export const useListNodes = () => {
  const [result, setResult] = useState();
  const [loading, setLoading] = useState(false);
  const [params, setParams] = useState();

  useEffect(() => {
    const listNode = async () => {
      const { token, nodeUri, isRoot = false } = params;
      try {
        setLoading(true);
        let uri = nodeUri;
        if (isRoot) {
          const result = await oDataApi.listNodes(token, uri);
          if (!result) {
            throw new Error('Unable to list root node');
          }
          const rootNode = result[0];
          uri = rootNode.Nodes.uri;
        }
        const data = await oDataApi.listNodes(token, uri);
        setResult(data);
      } catch (e) {
        await handleError(e);
      } finally {
        setLoading(false);
      }
    };
    if (params) {
      listNode();
    }
  }, [params]);

  return { result, loading, setParams };
};

export const getRootNodeUri = (product) => {
  const queryString = new ODataQueryBuilder(ODataEntity.Products).id(product.id).nodes().getQueryString();
  return `${ODataEndpoints.listNodes}${queryString}`;
};

export const getFileIcon = (name) => {
  const extension = name.split('.').pop();
  switch (extension) {
    case 'jpg':
    case 'jp2':
    case 'png':
      return 'fa-file-image-o';
    case 'xml':
    case 'html':
      return 'fa-file-code-o';
    default:
      return 'fa-file-o';
  }
};
