import { useEffect, useState } from 'react';
import { t } from 'ttag';
import { getErrorStatus, handleError } from '../utils';
import { RRD_REQUEST_TOO_HEAVY_STATUS } from '../api/RRD/RRDApi';

const AOI_CONSTRAINT_ERROR_MESSAGES = {
  ERR_MAX_AOI_AREA: (v) => t`AOI area exceeds the maximum allowed area of ${v} km²`,
  ERR_AOI_MAX_HEIGHT: (v) => t`AOI height exceeds the maximum allowed height of ${v} km`,
  ERR_AOI_MAX_WIDTH: (v) => t`AOI width exceeds the maximum allowed width of ${v} km`,
};

const PROVIDER_TIMED_OUT_MESSAGE = () =>
  t`The request to the imagery provider timed out. Please try again in a few minutes.`;

const PROVIDER_UNAVAILABLE_MESSAGE = () =>
  t`The imagery provider is temporarily unavailable. Please try again in a few minutes.`;

const NARROW_SEARCH_MESSAGE = () =>
  t`Your search couldn't be processed. This can happen when a search covers many providers or a large area. Try narrowing your search and searching again.`;

const NETWORK_ERROR_MESSAGE = () =>
  t`Unable to reach the imagery provider. Please check your internet connection and try again.`;

const RRD_STATUS_ERROR_MESSAGES = {
  429: () =>
    t`The imagery provider is currently receiving too many requests. Please wait a moment and try your search again.`,
  502: PROVIDER_UNAVAILABLE_MESSAGE,
  503: PROVIDER_UNAVAILABLE_MESSAGE,
};

// A 504 usually means the search itself (many providers/large area) is too heavy for the
// provider to process in time (see RRD_REQUEST_TOO_HEAVY_STATUS in RRDApi.js). That framing
// only makes sense for the search request, so it's kept out of RRD_STATUS_ERROR_MESSAGES and
// only applied when `isSearchAction` says so; a 504 on a cart action (addToCart/removeFromCart)
// falls back to the generic/body-based handling.
const getStatusErrorMessage = (error, { isSearchAction = false } = {}) => {
  const status = getErrorStatus(error);
  if (Number.isFinite(status) && RRD_STATUS_ERROR_MESSAGES[status]) {
    return RRD_STATUS_ERROR_MESSAGES[status]();
  }
  if (isSearchAction && status === RRD_REQUEST_TOO_HEAVY_STATUS) {
    return NARROW_SEARCH_MESSAGE();
  }
  if (error?.code === 'ECONNABORTED' || error?.code === 'ETIMEDOUT') {
    return PROVIDER_TIMED_OUT_MESSAGE();
  }
  if (error?.code === 'ERR_NETWORK') {
    return NETWORK_ERROR_MESSAGE();
  }
  return null;
};

export const handleRRDError = async (error, context = {}) => {
  try {
    const statusErrorMessage = getStatusErrorMessage(error, context);
    if (statusErrorMessage) {
      await handleError({ message: statusErrorMessage });
      return;
    }

    let errorData = error?.response?.data;

    if (errorData?.errors && Array.isArray(errorData.errors)) {
      const uniqueMessages = new Set(
        errorData.errors.map((err) => {
          const { reason, message } = err;
          return `${reason || 'Error'}: ${message || 'No details provided'}`;
        }),
      );

      const formattedMessages = Array.from(uniqueMessages).join('\n\n');

      await handleError({
        message: formattedMessages,
      });
      return;
    }

    if (errorData?.error && typeof errorData.error === 'string') {
      const aoiConstraintRegex = /\{code:\s*(\w+),\s*locator:\s*(\w+),\s*message:\s*([^}]+?)\s*\}/g;
      const aoiMatches = [...errorData.error.matchAll(aoiConstraintRegex)];
      if (aoiMatches.length > 0) {
        const prefixMatch = errorData.error.match(/^(.*?)\n\[/s);
        const prefix = prefixMatch ? prefixMatch[1].trim() : errorData.title || t`Error`;
        const entries = aoiMatches.map(([, code, locator, value]) => {
          const messageFn = AOI_CONSTRAINT_ERROR_MESSAGES[code];
          return messageFn ? messageFn(value) : `${locator}: ${code} (${value})`;
        });
        await handleError({ message: `${prefix}\n\n${entries.join('\n')}` });
        return;
      }

      const jsonMatch = errorData.error.match(/{.*}/);
      if (jsonMatch) {
        try {
          const jsonError = JSON.parse(jsonMatch[0]);

          const stringArrayEntry = Object.entries(jsonError).find(
            ([, value]) => Array.isArray(value) && value.every((item) => typeof item === 'string'),
          );

          if (stringArrayEntry) {
            const combinedMessage = `Error: ${stringArrayEntry[1].join('\n')}`;

            await handleError({
              message: combinedMessage,
            });
            return;
          }

          const combinedMessage = [
            errorData.title || 'Error',
            jsonError.message || jsonError.error || 'An unknown error occurred',
            jsonError.detail,
          ]
            .filter(Boolean)
            .join(': ');

          await handleError({
            message: combinedMessage,
          });
          return;
        } catch (parseError) {
          console.error('Failed to parse JSON error:', parseError);
        }
      } else {
        const combinedMessage = [errorData.title || 'Error', errorData.error].filter(Boolean).join(': ');

        await handleError({
          message: combinedMessage,
        });
        return;
      }
    }

    if (errorData?.error === true || errorData?.message) {
      const combinedMessage = [errorData.title || 'Error', errorData.message || 'An unknown error occurred']
        .filter(Boolean)
        .join(': ');

      await handleError({
        message: combinedMessage,
      });
      return;
    }

    const status = getErrorStatus(error);
    const errorCode = Number.isFinite(status) ? status : error?.code;
    const unknownErrorMessage = t`An unknown error occurred`;

    await handleError({
      message: errorCode ? `${unknownErrorMessage} (${errorCode})` : unknownErrorMessage,
    });
  } catch (e) {
    console.error('Error handling error:', e);

    await handleError({
      message: e.message || t`An unknown error occurred`,
    });
  }
};

export const useRRDHttpRequest = (onErrorCallback) => {
  const [requestInProgress, setRequestInProgress] = useState(false);
  const [httpRequest, setHttpRequest] = useState(null);

  useEffect(() => {
    const createHttpRequest = async () => {
      try {
        setRequestInProgress(true);

        if (httpRequest?.request) {
          let allRequests = [];
          if (Array.isArray(httpRequest.queryBody)) {
            allRequests = httpRequest.queryBody
              .filter((queryBody) => queryBody)
              .map((queryBody) => httpRequest.request(queryBody, httpRequest.authToken));
          } else {
            allRequests = [httpRequest.request(httpRequest.queryBody, httpRequest.authToken)];
          }

          const results = await Promise.all(allRequests);

          if (results.length > 1) {
            httpRequest.responseHandler(results);
          } else if (results.length === 1) {
            httpRequest.responseHandler(results?.at(0));
          }
        } else {
          console.error('Http request is undefined');
          await handleRRDError('Http request is undefined');
          onErrorCallback?.();
        }
      } catch (e) {
        console.error('useRRDHttpRequest caught:', e.response?.data?.error || e);
        await handleRRDError(e, { isSearchAction: httpRequest?.isSearchAction });
        onErrorCallback?.();
      } finally {
        setHttpRequest(null);
        setRequestInProgress(false);
      }
    };

    if (!requestInProgress && httpRequest) {
      createHttpRequest().catch((e) => console.error(e));
    }
  }, [requestInProgress, httpRequest, onErrorCallback]);

  return [requestInProgress, setHttpRequest];
};
