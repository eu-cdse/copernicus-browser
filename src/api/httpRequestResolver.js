import axios from 'axios';
import { delay } from '../utils';
import { extractResponseErrorMessage } from './responseErrorMessageExtractor';

const defaultRequestOptions = {
  retriesLeft: 3,
  delayBetweenRetries: 1000,
};

const executeRequest = async (client, method, query, requestConfig, options = defaultRequestOptions) => {
  try {
    if (query.queryBody) {
      const { data } = await client[method](query.queryPathString, query.queryBody, requestConfig);
      return data;
    } else {
      const { data } = await client[method](query.queryPathString, requestConfig);
      return data;
    }
  } catch (e) {
    if (axios.isCancel(e)) {
      console.log(e.message);
      return;
    }

    if (options.retryRestrictionFunc && options.retryRestrictionFunc(e)) {
      throw e;
    }

    const { retriesLeft, delayBetweenRetries, updateProgress } = options;
    if (retriesLeft) {
      console.log(`Retrying in ${delayBetweenRetries}ms...`);
      if (updateProgress) {
        updateProgress(0);
      }
      await delay(delayBetweenRetries);
      return executeRequest(client, method, query, requestConfig, {
        ...options,
        retriesLeft: retriesLeft - 1,
        delayBetweenRetries: delayBetweenRetries * 2,
      });
    }
    const responseErrorMessage = await extractResponseErrorMessage(e);
    let errorMessage = e.message;
    if (responseErrorMessage) {
      errorMessage = `${errorMessage}:\n${responseErrorMessage}`;
    }
    if (query.queryBody) {
      console.error(
        'executeRequest %s with body failed with %s',
        query.queryPathString,
        query.queryBody,
        errorMessage,
      );
    } else {
      console.error('executeRequest %s failed with %s', query.queryPathString, errorMessage);
    }

    throw new Error(errorMessage);
  }
};

export { executeRequest };
