import { useEffect, useState } from 'react';
import { t } from 'ttag';
import { getErrorStatus, handleError } from '../utils';
import { RRD_REQUEST_TOO_HEAVY_STATUS } from '../api/RRD/RRDApi';
import {
  extractRRDErrorMessage,
  getThrottledProviderName,
  isNoOpportunitiesMessage,
  isProviderTooManyRequestsMessage,
  isRRDErrorResponse,
  isRRDStringErrorFlag,
  parseEmbeddedJson,
} from '../api/RRD/searchResponse.utils';

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

const PROVIDER_TOO_MANY_REQUESTS_MESSAGE = (provider) =>
  t`Too many requests to ${provider}. Please wait a moment and try again, or narrow your search.`;

const PARTIAL_RESULTS_MESSAGE = (errorMessage) =>
  t`Showing the available results. Some sources did not respond, so more results may be available: ${errorMessage}`;

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

// The HTTP status is appended by getRRDErrorMessage; only a non-HTTP code (e.g. ERR_NETWORK) is added here.
const getUnknownErrorMessage = (error) => {
  const unknownErrorMessage = t`An unknown error occurred`;
  const status = getErrorStatus(error);
  if (Number.isFinite(status)) {
    return unknownErrorMessage;
  }
  return error?.code ? `${unknownErrorMessage} (${error.code})` : unknownErrorMessage;
};

const buildRRDErrorMessage = (error, context = {}) => {
  try {
    const responseMessage = error?.response?.data?.message;
    if (isProviderTooManyRequestsMessage(responseMessage)) {
      const provider = getThrottledProviderName(responseMessage);
      return provider ? PROVIDER_TOO_MANY_REQUESTS_MESSAGE(provider) : RRD_STATUS_ERROR_MESSAGES[429]();
    }

    const statusErrorMessage = getStatusErrorMessage(error, context);
    if (statusErrorMessage) {
      return statusErrorMessage;
    }

    let errorData = error?.response?.data;

    if (isRRDStringErrorFlag(errorData?.error)) {
      return extractRRDErrorMessage(errorData.message) || errorData.title || getUnknownErrorMessage(error);
    }

    if (errorData?.errors && Array.isArray(errorData.errors)) {
      const uniqueMessages = new Set(
        errorData.errors.map((err) => {
          const { reason, message } = err;
          return `${reason || 'Error'}: ${message || 'No details provided'}`;
        }),
      );

      return Array.from(uniqueMessages).join('\n\n');
    }

    // Legacy pre-unified-shape fallback (routed here when isRRDStringErrorFlag is false), kept
    // alongside extractRRDErrorMessage above which handles the new unified response shape.
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
        return `${prefix}\n\n${entries.join('\n')}`;
      }

      if (/{.*}/.test(errorData.error)) {
        const jsonError = parseEmbeddedJson(errorData.error, /{.*}/);
        if (jsonError) {
          const stringArrayEntry = Object.entries(jsonError).find(
            ([, value]) => Array.isArray(value) && value.every((item) => typeof item === 'string'),
          );

          if (stringArrayEntry) {
            return `Error: ${stringArrayEntry[1].join('\n')}`;
          }

          return [
            errorData.title || 'Error',
            jsonError.message || jsonError.error || t`An unknown error occurred`,
            jsonError.detail,
          ]
            .filter(Boolean)
            .join(': ');
        }
      } else {
        return [errorData.title || 'Error', errorData.error].filter(Boolean).join(': ');
      }
    }

    if (errorData?.error === true || errorData?.message) {
      return [errorData.title || 'Error', errorData.message || t`An unknown error occurred`]
        .filter(Boolean)
        .join(': ');
    }

    return getUnknownErrorMessage(error);
  } catch (e) {
    console.error('Error handling error:', e);
    return e.message || t`An unknown error occurred`;
  }
};

// Appends the HTTP status to every error message, e.g. "Error: Internal Server Error (HTTP 500)",
// so users can report the code. A provider 429 wrapped in a 500 shows the upstream 429.
// async only for interface consistency with its callers (and so `.resolves` works in tests);
// it does no I/O, so awaiting it in the settled-outcomes loop below never blocks on anything.
export const getRRDErrorMessage = async (error, context = {}) => {
  const message = buildRRDErrorMessage(error, context);
  const status = isProviderTooManyRequestsMessage(error?.response?.data?.message)
    ? 429
    : getErrorStatus(error);
  if (!Number.isFinite(status) || status < 400) {
    return message;
  }
  return `${message} (HTTP ${status})`;
};

export const handleRRDError = async (error, context = {}) => {
  await handleError({ message: await getRRDErrorMessage(error, context) });
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

          const settled = await Promise.allSettled(allRequests);
          const { isSearchAction } = httpRequest;
          const successes = [];
          const errorMessages = [];

          // Iterate in request (timespan) order, so joined messages stay deterministic.
          for (const outcome of settled) {
            if (outcome.status === 'fulfilled') {
              if (isSearchAction && isRRDErrorResponse(outcome.value)) {
                const errorMessage = await getRRDErrorMessage(
                  { response: { data: outcome.value, status: 200 } },
                  { isSearchAction },
                );
                // error: "true" with features means a partial failure (e.g. one provider timed out):
                // keep the results and warn that some may be missing, instead of hiding them all.
                if (outcome.value.features?.length > 0) {
                  successes.push(outcome.value);
                  errorMessages.push(PARTIAL_RESULTS_MESSAGE(errorMessage));
                } else {
                  errorMessages.push(errorMessage);
                }
              } else {
                successes.push(outcome.value);
                // The backend also sends messages on responses flagged error: "false": a failed source
                // (e.g. "ROLLING ARCHIVE ERROR : ...") next to results, or tasking comments with no results.
                // They are shown in the same message panel as errors.
                const message = isSearchAction ? extractRRDErrorMessage(outcome.value?.message) : null;
                if (message) {
                  errorMessages.push(
                    outcome.value.features?.length > 0 ? PARTIAL_RESULTS_MESSAGE(message) : message,
                  );
                }
              }
            } else if (isSearchAction && isNoOpportunitiesMessage(outcome.reason?.response?.data?.message)) {
              // Not a failure but an empty result: clear previous results and show the backend message.
              successes.push({ features: [] });
              errorMessages.push(await getRRDErrorMessage(outcome.reason, { isSearchAction }));
            } else {
              console.error(
                'useRRDHttpRequest caught:',
                outcome.reason?.response?.data?.error || outcome.reason,
              );
              errorMessages.push(await getRRDErrorMessage(outcome.reason, { isSearchAction }));
            }
          }

          const dedupe = (messages) => Array.from(new Set(messages));

          if (successes.length > 0) {
            httpRequest.responseHandler(successes.length > 1 ? successes : successes[0]);
          }

          if (errorMessages.length > 0) {
            await handleError({ message: dedupe(errorMessages).join('\n\n') });
          }

          // Scroll to the message panel unless there are results to look at.
          const hasResults = successes.some((success) => success?.features?.length > 0);
          if (errorMessages.length > 0 && !hasResults) {
            onErrorCallback?.();
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
