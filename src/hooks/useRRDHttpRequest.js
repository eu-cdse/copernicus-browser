import { useEffect, useState } from 'react';
import { t } from 'ttag';
import { handleError } from '../utils';

const AOI_CONSTRAINT_ERROR_MESSAGES = {
  ERR_MAX_AOI_AREA: (v) => t`AOI area exceeds the maximum allowed area of ${v} km²`,
  ERR_AOI_MAX_HEIGHT: (v) => t`AOI height exceeds the maximum allowed height of ${v} km`,
  ERR_AOI_MAX_WIDTH: (v) => t`AOI width exceeds the maximum allowed width of ${v} km`,
};

export const handleRRDError = async (error) => {
  try {
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

    await handleError({
      message: 'An unknown error occurred',
    });
  } catch (e) {
    console.error('Error handling error:', e);

    await handleError({
      message: e.message || 'An unknown error occurred',
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
          onErrorCallback();
        }
      } catch (e) {
        console.error('useRRDHttpRequest caught:', e.response?.data?.error || e);
        await handleRRDError(e);
        onErrorCallback();
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
