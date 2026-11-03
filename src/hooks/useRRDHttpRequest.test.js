import { act, renderHook, waitFor } from '@testing-library/react';
import { handleError } from '../utils';
import { getRRDErrorMessage, handleRRDError, useRRDHttpRequest } from './useRRDHttpRequest';
import {
  RRD_SEARCH_PAYLOAD_2,
  RRD_SEARCH_PAYLOAD_3,
  RRD_SEARCH_PAYLOAD_4,
  RRD_SEARCH_PAYLOAD_5,
  RRD_SEARCH_PAYLOAD_6,
} from '../api/RRD/searchResponse.fixtures';

jest.mock('../utils', () => ({
  handleError: jest.fn(),
  getErrorStatus: (error) => Number(error?.response?.status ?? error?.status),
}));

describe('handleRRDError', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should handle a standard JSON within a "Body" section', async () => {
    const mockError = {
      response: {
        data: {
          error: `Error making HTTP request. Status code: 400, Reason: Bad Request.\nBody:\n{"error": "BadParameter", "message": "Feasibility error", "location": "feasibility", "detail": "AOI too large"}`,
        },
        status: 400,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message: 'Error: Feasibility error: AOI too large (HTTP 400)',
    });
  });

  it('should handle JSON with "message"', async () => {
    const mockError = {
      response: {
        data: {
          error: `Research Feasibility: Error calling feasibility request. Status code: 400, Reason: Bad Request.\nBody:\n{"tag":"WYbqBsKa","message":"AOI size of 7392542 km² larger than maximum permitted ordering area size of 500 km² for taskingOrder for this user or project"}`,
        },
        status: 400,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message: `Error: AOI size of 7392542 km² larger than maximum permitted ordering area size of 500 km² for taskingOrder for this user or project (HTTP 400)`,
    });
  });

  it('should handle a server-side error with standard JSON structure', async () => {
    const mockError = {
      response: {
        data: {
          error: `Error: Request failed with status code 500:\n{"timestamp":"2025-03-28T07:57:05.574+00:00","status":500,"error":"Internal Server Error","path":"/api/sor/mw/search"}`,
        },
        status: 500,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message: `Error: Internal Server Error (HTTP 500)`,
    });
  });

  it('should handle a server-side error with detail and message fields', async () => {
    const mockError = {
      response: {
        data: {
          error: `Error: Request failed with status code 500:\n{"timestamp":"2025-03-28T07:57:05.574+00:00","status":500,"error":"Internal Server Error", "message": "The database connection failed", "detail": "The database server is unreachable", "path":"/api/sor/mw/search"}`,
        },
        status: 500,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message: 'Error: The database connection failed: The database server is unreachable (HTTP 500)',
    });
  });

  it('should handle a token expired error', async () => {
    const mockError = {
      response: {
        data: {
          error: true,
          message: 'ERROR: Token is expired',
          quote: null,
        },
        status: 511,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message: 'Error: ERROR: Token is expired (HTTP 511)',
    });
  });

  it('should handle a single error with multiple bodies and use the first body', async () => {
    const mockError = {
      response: {
        data: {
          error: `"Research Feasibility: Error making HTTP request to EUSI provider backend: Error calling feasibility request for 0.5m, pan and [WV01,GE01,WV02,WV03,LG01,LG02]. Status code: 400, Reason: Bad Request.\nBody:\n{"tag":"i710wGqC","message":"AOI size of 469740 km² larger than maximum permitted ordering area size of 500 km² for taskingOrder for this user or project"}\n || Error making HTTP request to EUSI provider backend: Error calling feasibility request for 0.5m, pan_4ms and [GE01,WV02,WV03,LG01,LG02]. Status code: 400, Reason: Bad Request.\nBody:\n{"tag":"e2gbW04F","message":"AOI size of 469740 km² larger than maximum permitted ordering area size of 500 km² for taskingOrder for this user or project"}"`,
        },
        status: 400,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message:
        'Error: AOI size of 469740 km² larger than maximum permitted ordering area size of 500 km² for taskingOrder for this user or project (HTTP 400)',
    });
  });

  it('should handle an array of errors and display only unique messages', async () => {
    const mockError = {
      response: {
        data: {
          errors: [
            {
              code: 404,
              reason: 'Not Found',
              message: 'No theoretical opportunities found with informed data',
            },
            {
              code: 404,
              reason: null,
              message: 'Second Error',
            },
            {
              code: 404,
              reason: 'Not Found',
              message: 'Third repeated Error',
            },
            {
              code: 404,
              reason: 'Not Found',
              message: 'Third repeated Error',
            },
          ],
        },
        status: 404,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message: `Not Found: No theoretical opportunities found with informed data\n\nError: Second Error\n\nNot Found: Third repeated Error (HTTP 404)`,
    });
  });

  it('should handle a standard error with "error", "status", and "title" fields', async () => {
    const mockError = {
      response: {
        data: {
          error: 'Research Feasibility: Geometry type must be "Polygon" for AOIs',
          status: 400,
          title: 'Bad Request',
        },
        status: 400,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message: 'Bad Request: Research Feasibility: Geometry type must be "Polygon" for AOIs (HTTP 400)',
    });
  });

  it('should handle AOI constraint violations with known codes from Airbus FR Pleiades', async () => {
    const mockError = {
      response: {
        data: {
          error:
            'Research Feasibility: Error calling feasibility request:\n[{code: ERR_MAX_AOI_AREA, locator: AOI, message: 800.5}, {code: ERR_AOI_MAX_HEIGHT, locator: AOI, message: 40.0}, {code: ERR_AOI_MAX_WIDTH, locator: AOI, message: 18.9}]',
          status: 400,
          title: 'Bad Request',
        },
        status: 400,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message:
        'Research Feasibility: Error calling feasibility request:\n\nAOI area exceeds the maximum allowed area of 800.5 km²\nAOI height exceeds the maximum allowed height of 40.0 km\nAOI width exceeds the maximum allowed width of 18.9 km (HTTP 400)',
    });
  });

  it('should handle AOI constraint violations with unknown codes showing locator and raw values', async () => {
    const mockError = {
      response: {
        data: {
          error:
            'Research Feasibility: Error calling feasibility request:\n[{code: ERR_UNKNOWN_CONSTRAINT, locator: AOI, message: 99.9}]',
          status: 400,
          title: 'Bad Request',
        },
        status: 400,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message:
        'Research Feasibility: Error calling feasibility request:\n\nAOI: ERR_UNKNOWN_CONSTRAINT (99.9) (HTTP 400)',
    });
  });

  it('should handle mixed known and unknown AOI constraint codes', async () => {
    const mockError = {
      response: {
        data: {
          error:
            'Research Feasibility: Error calling feasibility request:\n[{code: ERR_MAX_AOI_AREA, locator: AOI, message: 800.5}, {code: ERR_UNKNOWN_CONSTRAINT, locator: AOI, message: 99.9}]',
          status: 400,
          title: 'Bad Request',
        },
        status: 400,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message:
        'Research Feasibility: Error calling feasibility request:\n\nAOI area exceeds the maximum allowed area of 800.5 km²\nAOI: ERR_UNKNOWN_CONSTRAINT (99.9) (HTTP 400)',
    });
  });

  it('should handle AOI constraint violations with non-numeric message values', async () => {
    const mockError = {
      response: {
        data: {
          error:
            'Research Feasibility: Error calling feasibility request:\n[{code: ERR_MAX_AOI_AREA, locator: AOI, message: INVALID_AREA_ID}]',
          status: 400,
          title: 'Bad Request',
        },
        status: 400,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message:
        'Research Feasibility: Error calling feasibility request:\n\nAOI area exceeds the maximum allowed area of INVALID_AREA_ID km² (HTTP 400)',
    });
  });

  it('should use errorData.title as prefix when error string has no newline before the constraint array', async () => {
    const mockError = {
      response: {
        data: {
          error: '[{code: ERR_MAX_AOI_AREA, locator: AOI, message: 800.5}]',
          status: 400,
          title: 'Bad Request',
        },
        status: 400,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message: 'Bad Request\n\nAOI area exceeds the maximum allowed area of 800.5 km² (HTTP 400)',
    });
  });

  it('should handle a fallback for unknown errors', async () => {
    const mockError = new Error('An unknown error occurred');

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message: 'An unknown error occurred',
    });
  });

  it('should extract ANY_KEY from JSON string in error body', async () => {
    const mockError = {
      response: {
        data: {
          error: `Research Feasibility: Error calling feasibility request. Status code: 400, Reason: Bad Request.\nBody:\n{"ANY_KEY":["Start time must be at least 6 hours in the future, if given."]}\n`,
        },
        status: 400,
      },
    };

    await handleRRDError(mockError);

    expect(handleError).toHaveBeenCalledWith({
      message: 'Error: Start time must be at least 6 hours in the future, if given. (HTTP 400)',
    });
  });

  describe('status-based error messages (429/502/503/504/timeouts/network, 401 and other 5xx fall back to generic handling)', () => {
    it('should show the rate-limit message for a 429 with an empty body', async () => {
      const mockError = {
        response: {
          status: 429,
          data: undefined,
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message:
          'The imagery provider is currently receiving too many requests. Please wait a moment and try your search again. (HTTP 429)',
      });
    });

    it('should show the rate-limit message for a 429 with a plain-text/HTML body', async () => {
      const mockError = {
        response: {
          status: 429,
          data: '<html>429 Too Many Requests</html>',
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message:
          'The imagery provider is currently receiving too many requests. Please wait a moment and try your search again. (HTTP 429)',
      });
    });

    it('should show the rate-limit message for a 429 even when the body has a structured "error" string that would otherwise match the shape-based branch', async () => {
      const mockError = {
        response: {
          status: 429,
          data: { error: 'some string body', status: 429 },
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message:
          'The imagery provider is currently receiving too many requests. Please wait a moment and try your search again. (HTTP 429)',
      });
    });

    it('should NOT use a status-based message for a 401 (regression guard; a 401 here can be caused by an overly broad search rather than an expired session, but this hook is shared with cart actions where that framing would not make sense, so it falls back to generic handling instead of a status-based message)', async () => {
      const mockError = {
        response: {
          status: 401,
          data: {},
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'An unknown error occurred (HTTP 401)',
      });
    });

    it('should show the "narrow your search" message for a 504 with an empty body, when the failing request is a search', async () => {
      const mockError = {
        response: {
          status: 504,
          data: {},
        },
      };

      await handleRRDError(mockError, { isSearchAction: true });

      expect(handleError).toHaveBeenCalledWith({
        message:
          "Your search couldn't be processed. This can happen when a search covers many providers or a large area. Try narrowing your search and searching again. (HTTP 504)",
      });
    });

    it('should NOT use the "narrow your search" message for a 504 when the failing request is not a search (e.g. a cart action); falls back to generic handling instead, since that advice would not apply', async () => {
      const mockError = {
        response: {
          status: 504,
          data: {},
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'An unknown error occurred (HTTP 504)',
      });
    });

    it.each([502, 503])(
      'should show the provider-unavailable message for a %i with an empty body',
      async (status) => {
        const mockError = {
          response: {
            status,
            data: {},
          },
        };

        await handleRRDError(mockError);

        expect(handleError).toHaveBeenCalledWith({
          message: `The imagery provider is temporarily unavailable. Please try again in a few minutes. (HTTP ${status})`,
        });
      },
    );

    it('should NOT use a status-based message for a 500 with an empty body (falls back to the generic "unknown error" message; 500 has no dedicated message)', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {},
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'An unknown error occurred (HTTP 500)',
      });
    });

    it('should show the "narrow your search" message when the error has no "response" but a "status" of 504 set directly on it, when the failing request is a search', async () => {
      const mockError = {
        status: 504,
        message: 'Request failed with status code 504',
      };

      await handleRRDError(mockError, { isSearchAction: true });

      expect(handleError).toHaveBeenCalledWith({
        message:
          "Your search couldn't be processed. This can happen when a search covers many providers or a large area. Try narrowing your search and searching again. (HTTP 504)",
      });
    });

    it('should show the timeout message for a connection-aborted error with no "response"', async () => {
      const mockError = {
        code: 'ECONNABORTED',
        message: 'timeout of 30000ms exceeded',
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'The request to the imagery provider timed out. Please try again in a few minutes.',
      });
    });

    it('should show the timeout message for an ETIMEDOUT error with no "response"', async () => {
      const mockError = {
        code: 'ETIMEDOUT',
        message: 'connect ETIMEDOUT',
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'The request to the imagery provider timed out. Please try again in a few minutes.',
      });
    });

    it('should show the network-error message for an ERR_NETWORK error with no "response" (e.g. offline, or a CORS-blocked gateway error page with no readable status)', async () => {
      const mockError = {
        code: 'ERR_NETWORK',
        message: 'Network Error',
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'Unable to reach the imagery provider. Please check your internet connection and try again.',
      });
    });

    it('should NOT use a status-based message for a 500 with a plain error string body (falls back to echoing the body instead of a friendly message)', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' },
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'Error: Internal Server Error (HTTP 500)',
      });
    });

    it('should NOT use a status-based message for a 511 (token expired); handled by the generic message-field branch instead', async () => {
      const mockError = {
        response: {
          status: 511,
          data: { error: true, message: 'ERROR: Token is expired', quote: null },
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'Error: ERROR: Token is expired (HTTP 511)',
      });
    });

    it('should NOT use a status-based message for a 400 (regression guard)', async () => {
      const mockError = {
        response: {
          data: {
            error: 'Research Feasibility: Geometry type must be "Polygon" for AOIs',
            status: 400,
            title: 'Bad Request',
          },
          status: 400,
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'Bad Request: Research Feasibility: Geometry type must be "Polygon" for AOIs (HTTP 400)',
      });
    });
  });

  describe('unified RRD error shape ({status, title, type, features, numberReturned, error, message})', () => {
    it('should extract the field-validation message from RRD_SEARCH_PAYLOAD_2 as a 400', async () => {
      const mockError = { response: { status: 400, data: RRD_SEARCH_PAYLOAD_2 } };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'The field MaxCloudCover must be between 0 and 100. (HTTP 400)',
      });
    });

    it('should extract the non_field_errors message from RRD_SEARCH_PAYLOAD_3 as a 400', async () => {
      const mockError = { response: { status: 400, data: RRD_SEARCH_PAYLOAD_3 } };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'End time must be less than 7 days from now, if given. (HTTP 400)',
      });
    });

    it('should show a provider-specific throttling message for RRD_SEARCH_PAYLOAD_5 as a 500', async () => {
      const mockError = { response: { status: 500, data: RRD_SEARCH_PAYLOAD_5 } };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message:
          'Too many requests to planetscope. Please wait a moment and try again, or narrow your search. (HTTP 429)',
      });
    });

    it('should fall back to the generic 429 message when the throttling message has no parsable provider segment', async () => {
      const mockError = {
        response: {
          status: 500,
          data: {
            ...RRD_SEARCH_PAYLOAD_5,
            message: 'The remote server returned an error: (429) Too Many Requests.',
          },
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message:
          'The imagery provider is currently receiving too many requests. Please wait a moment and try your search again. (HTTP 429)',
      });
    });

    it('should fall back to errorData.title when the string error flag is set but the message is empty', async () => {
      const mockError = {
        response: { status: 400, data: { error: 'true', message: '', title: 'Bad Request' } },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'Bad Request (HTTP 400)',
      });
    });

    it('should fall back to the generic unknown-error message when the string error flag is set but both message and title are empty', async () => {
      const mockError = {
        response: { status: 400, data: { error: 'true', message: '', title: '' } },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'An unknown error occurred (HTTP 400)',
      });
    });

    it('getRRDErrorMessage should resolve directly to the extracted message for RRD_SEARCH_PAYLOAD_2 as a 400', async () => {
      const mockError = { response: { status: 400, data: RRD_SEARCH_PAYLOAD_2 } };

      await expect(getRRDErrorMessage(mockError)).resolves.toBe(
        'The field MaxCloudCover must be between 0 and 100. (HTTP 400)',
      );
    });
  });
});

describe('useRRDHttpRequest', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should pass the single successful value to responseHandler and report the failing timespan error, without calling onErrorCallback', async () => {
    const bodyA = { timespan: 'A' };
    const bodyB = { timespan: 'B' };
    const successValue = { features: [{ id: 'feature-A' }], error: 'false' };

    const request = jest.fn().mockImplementation((queryBody) => {
      if (queryBody === bodyA) {
        return Promise.resolve(successValue);
      }
      return Promise.reject({ response: { status: 400, data: RRD_SEARCH_PAYLOAD_3 } });
    });
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [bodyA, bodyB],
        isSearchAction: true,
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(responseHandler).toHaveBeenCalled();
    });

    expect(responseHandler).toHaveBeenCalledTimes(1);
    expect(responseHandler).toHaveBeenCalledWith(successValue);
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith({
      message: 'End time must be less than 7 days from now, if given. (HTTP 400)',
    });
    expect(onErrorCallback).not.toHaveBeenCalled();
  });

  it('should deduplicate an identical error message coming from every rejected timespan and call onErrorCallback', async () => {
    const bodyA = { timespan: 'A' };
    const bodyB = { timespan: 'B' };

    const request = jest.fn().mockRejectedValue({ response: { status: 400, data: RRD_SEARCH_PAYLOAD_3 } });
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [bodyA, bodyB],
        isSearchAction: true,
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(handleError).toHaveBeenCalled();
    });

    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith({
      message: 'End time must be less than 7 days from now, if given. (HTTP 400)',
    });
    expect(onErrorCallback).toHaveBeenCalledTimes(1);
    expect(responseHandler).not.toHaveBeenCalled();
  });

  it('should join distinct error messages from both rejected timespans in request order', async () => {
    const bodyA = { timespan: 'A' };
    const bodyB = { timespan: 'B' };

    const request = jest.fn().mockImplementation((queryBody) => {
      if (queryBody === bodyA) {
        return Promise.reject({ response: { status: 400, data: RRD_SEARCH_PAYLOAD_2 } });
      }
      return Promise.reject({ response: { status: 400, data: RRD_SEARCH_PAYLOAD_3 } });
    });
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [bodyA, bodyB],
        isSearchAction: true,
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(handleError).toHaveBeenCalled();
    });

    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith({
      message:
        'The field MaxCloudCover must be between 0 and 100. (HTTP 400)\n\nEnd time must be less than 7 days from now, if given. (HTTP 400)',
    });
  });

  it('should clear the results for a "no opportunities" rejection and show its message in the message panel', async () => {
    const body = { timespan: 'A' };

    const request = jest.fn().mockRejectedValue({ response: { status: 400, data: RRD_SEARCH_PAYLOAD_4 } });
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [body],
        isSearchAction: true,
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(responseHandler).toHaveBeenCalled();
    });

    expect(responseHandler).toHaveBeenCalledTimes(1);
    expect(responseHandler).toHaveBeenCalledWith({ features: [] });
    expect(handleError).toHaveBeenCalledWith({
      message: 'No theoretical opportunities found with informed data (HTTP 400)',
    });
    expect(onErrorCallback).toHaveBeenCalledTimes(1);
  });

  it('should treat a resolved 2xx response carrying error: "true" as a search error, calling handleError and onErrorCallback instead of responseHandler', async () => {
    const body = { timespan: 'A' };

    const request = jest.fn().mockResolvedValue({ error: 'true', message: 'Research CCME: X.Y=Bad value' });
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [body],
        isSearchAction: true,
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(handleError).toHaveBeenCalled();
    });

    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith({ message: 'Bad value' });
    expect(onErrorCallback).toHaveBeenCalledTimes(1);
    expect(responseHandler).not.toHaveBeenCalled();
  });

  it('should keep the results of a resolved 2xx error: "true" response that has features, and show a message that more results may be available', async () => {
    const body = { timespan: 'A' };
    const partialValue = {
      type: 'FeatureCollection',
      features: [{ id: 'feature-A' }],
      numberReturned: 1,
      message: 'ROLLING ARCHIVE ERROR : Service timeout or unreachable \n',
      error: 'true',
    };

    const request = jest.fn().mockResolvedValue(partialValue);
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [body],
        isSearchAction: true,
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(responseHandler).toHaveBeenCalled();
    });

    expect(responseHandler).toHaveBeenCalledTimes(1);
    expect(responseHandler).toHaveBeenCalledWith(partialValue);
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith({
      message:
        'Showing the available results. Some sources did not respond, so more results may be available: ROLLING ARCHIVE ERROR : Service timeout or unreachable',
    });
    expect(onErrorCallback).not.toHaveBeenCalled();
  });

  it('should show the same partial-results message for an error: "false" response that has features and a message', async () => {
    const body = { timespan: 'A' };
    const partialValue = {
      type: 'FeatureCollection',
      features: [{ id: 'feature-A' }],
      numberReturned: 1,
      message: 'ROLLING ARCHIVE ERROR : Service timeout or unreachable \n',
      error: 'false',
    };

    const request = jest.fn().mockResolvedValue(partialValue);
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [body],
        isSearchAction: true,
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(responseHandler).toHaveBeenCalled();
    });

    expect(responseHandler).toHaveBeenCalledWith(partialValue);
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith({
      message:
        'Showing the available results. Some sources did not respond, so more results may be available: ROLLING ARCHIVE ERROR : Service timeout or unreachable',
    });
    expect(onErrorCallback).not.toHaveBeenCalled();
  });

  it('should not show any message for an error: "false" response that has features and an empty message', async () => {
    const body = { timespan: 'A' };
    const successValue = {
      type: 'FeatureCollection',
      features: [{ id: 'feature-A' }],
      numberReturned: 1,
      message: '',
      error: 'false',
    };

    const request = jest.fn().mockResolvedValue(successValue);
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [body],
        isSearchAction: true,
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(responseHandler).toHaveBeenCalled();
    });

    expect(responseHandler).toHaveBeenCalledWith(successValue);
    expect(handleError).not.toHaveBeenCalled();
  });

  it('should pass a "TASKING COMMENTS" payload (error: "false", no results) to responseHandler and show its message in the message panel', async () => {
    const body = { timespan: 'A' };

    const request = jest.fn().mockResolvedValue(RRD_SEARCH_PAYLOAD_6);
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [body],
        isSearchAction: true,
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(responseHandler).toHaveBeenCalled();
    });

    expect(responseHandler).toHaveBeenCalledTimes(1);
    expect(responseHandler).toHaveBeenCalledWith(RRD_SEARCH_PAYLOAD_6);
    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError.mock.calls[0][0].message).toContain(
      "Provider's mission '10' requires parameter instrumentMode",
    );
    expect(onErrorCallback).toHaveBeenCalledTimes(1);
  });

  it('should pass a resolved error:"true" payload through to responseHandler unchanged for a non-search (cart) action', async () => {
    const body = { timespan: 'A' };

    const request = jest.fn().mockResolvedValue({ error: 'true' });
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [body],
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(responseHandler).toHaveBeenCalled();
    });

    expect(responseHandler).toHaveBeenCalledTimes(1);
    expect(responseHandler).toHaveBeenCalledWith({ error: 'true' });
    expect(handleError).not.toHaveBeenCalled();
    expect(onErrorCallback).not.toHaveBeenCalled();
  });

  it('should still call handleError and onErrorCallback for a generic rejection on a non-search (cart) action', async () => {
    const body = { timespan: 'A' };

    const request = jest.fn().mockRejectedValue({ response: { status: 500, data: {} } });
    const responseHandler = jest.fn();
    const onErrorCallback = jest.fn();

    const { result } = renderHook(() => useRRDHttpRequest(onErrorCallback));

    act(() => {
      result.current[1]({
        request,
        queryBody: [body],
        responseHandler,
      });
    });

    await waitFor(() => {
      expect(handleError).toHaveBeenCalled();
    });

    expect(handleError).toHaveBeenCalledTimes(1);
    expect(handleError).toHaveBeenCalledWith({ message: 'An unknown error occurred (HTTP 500)' });
    expect(onErrorCallback).toHaveBeenCalledTimes(1);
    expect(responseHandler).not.toHaveBeenCalled();
  });
});
