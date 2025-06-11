import { useEffect, useState } from 'react';
import { handleError } from '../utils';

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
      const jsonMatch = errorData.error.match(/{.*}/);
      if (jsonMatch) {
        try {
          const jsonError = JSON.parse(jsonMatch[0]);

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
