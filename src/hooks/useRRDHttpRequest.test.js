import { handleError } from '../utils';
import { handleRRDError } from './useRRDHttpRequest';

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
      message: 'Error: Feasibility error: AOI too large',
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
      message: `Error: AOI size of 7392542 km² larger than maximum permitted ordering area size of 500 km² for taskingOrder for this user or project`,
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
      message: `Error: Internal Server Error`,
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
      message: 'Error: The database connection failed: The database server is unreachable',
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
      message: 'Error: ERROR: Token is expired',
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
        'Error: AOI size of 469740 km² larger than maximum permitted ordering area size of 500 km² for taskingOrder for this user or project',
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
      message: `Not Found: No theoretical opportunities found with informed data\n\nError: Second Error\n\nNot Found: Third repeated Error`,
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
      message: 'Bad Request: Research Feasibility: Geometry type must be "Polygon" for AOIs',
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
        'Research Feasibility: Error calling feasibility request:\n\nAOI area exceeds the maximum allowed area of 800.5 km²\nAOI height exceeds the maximum allowed height of 40.0 km\nAOI width exceeds the maximum allowed width of 18.9 km',
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
        'Research Feasibility: Error calling feasibility request:\n\nAOI: ERR_UNKNOWN_CONSTRAINT (99.9)',
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
        'Research Feasibility: Error calling feasibility request:\n\nAOI area exceeds the maximum allowed area of 800.5 km²\nAOI: ERR_UNKNOWN_CONSTRAINT (99.9)',
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
        'Research Feasibility: Error calling feasibility request:\n\nAOI area exceeds the maximum allowed area of INVALID_AREA_ID km²',
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
      message: 'Bad Request\n\nAOI area exceeds the maximum allowed area of 800.5 km²',
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
      message: 'Error: Start time must be at least 6 hours in the future, if given.',
    });
  });

  describe('status-based error messages (429/timeouts, 5xx falls back to generic handling)', () => {
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
          'The imagery provider is currently receiving too many requests. Please wait a moment and try your search again.',
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
          'The imagery provider is currently receiving too many requests. Please wait a moment and try your search again.',
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
          'The imagery provider is currently receiving too many requests. Please wait a moment and try your search again.',
      });
    });

    it.each([500, 502, 503, 504])(
      'should NOT use a status-based message for a %i with an empty body (falls back to the generic "unknown error" message — only 429 has a dedicated message)',
      async (status) => {
        const mockError = {
          response: {
            status,
            data: {},
          },
        };

        await handleRRDError(mockError);

        expect(handleError).toHaveBeenCalledWith({
          message: 'An unknown error occurred',
        });
      },
    );

    it('should fall back to the generic "unknown error" message when the error has no "response" but a "status" set directly on it', async () => {
      const mockError = {
        status: 504,
        message: 'Request failed with status code 504',
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'An unknown error occurred',
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

    it('should NOT use a status-based message for a 500 with a plain error string body (falls back to echoing the body instead of a friendly message)', async () => {
      const mockError = {
        response: {
          status: 500,
          data: { error: 'Internal Server Error' },
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'Error: Internal Server Error',
      });
    });

    it('should NOT use a status-based message for a 511 (token expired) — handled by the generic message-field branch instead', async () => {
      const mockError = {
        response: {
          status: 511,
          data: { error: true, message: 'ERROR: Token is expired', quote: null },
        },
      };

      await handleRRDError(mockError);

      expect(handleError).toHaveBeenCalledWith({
        message: 'Error: ERROR: Token is expired',
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
        message: 'Bad Request: Research Feasibility: Geometry type must be "Polygon" for AOIs',
      });
    });
  });
});
