import {
  PROVIDER_TOO_MANY_REQUESTS_INDICATOR,
  isProviderTooManyRequestsMessage,
  getThrottledProviderName,
  extractRRDErrorMessage,
  isRRDStringErrorFlag,
  isRRDErrorResponse,
  isNoOpportunitiesMessage,
} from './searchResponse.utils';
import {
  RRD_SEARCH_PAYLOAD_2,
  RRD_SEARCH_PAYLOAD_3,
  RRD_SEARCH_PAYLOAD_4,
  RRD_SEARCH_PAYLOAD_5,
} from './searchResponse.fixtures';

describe('PROVIDER_TOO_MANY_REQUESTS_INDICATOR', () => {
  it('is the expected substring', () => {
    expect(PROVIDER_TOO_MANY_REQUESTS_INDICATOR).toBe('(429) Too Many Requests');
  });
});

describe('extractRRDErrorMessage', () => {
  it('strips the internal prefix and field-path prefix', () => {
    expect(extractRRDErrorMessage(RRD_SEARCH_PAYLOAD_2.message)).toBe(
      'The field MaxCloudCover must be between 0 and 100.',
    );
  });

  it('extracts the message from the embedded JSON non_field_errors array', () => {
    expect(extractRRDErrorMessage(RRD_SEARCH_PAYLOAD_3.message)).toBe(
      'End time must be less than 7 days from now, if given.',
    );
  });

  it('extracts the message from the embedded JSON errors array', () => {
    expect(extractRRDErrorMessage(RRD_SEARCH_PAYLOAD_4.message)).toBe(
      'No theoretical opportunities found with informed data',
    );
  });

  it('strips the internal prefix only when there is no field-path segment', () => {
    const message = 'Research XYZ: Something went wrong with the request';
    expect(extractRRDErrorMessage(message)).toBe('Something went wrong with the request');
  });

  it('falls through to prefix-stripping/trim logic when embedded JSON fails to parse', () => {
    const consoleErrorSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
    const message = '{not valid json} trailing text';

    expect(() => extractRRDErrorMessage(message)).not.toThrow();
    expect(extractRRDErrorMessage(message)).toBe(message.trim());

    consoleErrorSpy.mockRestore();
  });

  it('returns a plain message trimmed as-is', () => {
    expect(extractRRDErrorMessage('  Something simple went wrong.  ')).toBe('Something simple went wrong.');
  });

  it.each([
    ['empty string', ''],
    ['undefined', undefined],
    ['null', null],
    ['a number', 42],
  ])('returns null for %s input', (_label, value) => {
    expect(extractRRDErrorMessage(value)).toBeNull();
  });
});

describe('isProviderTooManyRequestsMessage / getThrottledProviderName', () => {
  it('detects the throttled provider from a full RRD message', () => {
    expect(isProviderTooManyRequestsMessage(RRD_SEARCH_PAYLOAD_5.message)).toBe(true);
    expect(getThrottledProviderName(RRD_SEARCH_PAYLOAD_5.message)).toBe('planetscope');
  });

  it('detects the 429 indicator without identifying a provider when the internal prefix is missing', () => {
    const message = 'The remote server returned an error: (429) Too Many Requests.';
    expect(isProviderTooManyRequestsMessage(message)).toBe(true);
    expect(getThrottledProviderName(message)).toBeNull();
  });

  it('returns false when the 429 indicator is absent', () => {
    expect(isProviderTooManyRequestsMessage('Everything went fine.')).toBe(false);
  });
});

describe('isRRDStringErrorFlag', () => {
  it.each([
    ['true', true],
    ['false', true],
    [true, false],
    [false, false],
    [undefined, false],
  ])('isRRDStringErrorFlag(%p) returns %p', (value, expected) => {
    expect(isRRDStringErrorFlag(value)).toBe(expected);
  });
});

describe('isRRDErrorResponse', () => {
  it.each([
    [{ error: 'true' }, true],
    [{ error: 'false' }, false],
    [{ error: true }, false],
    [{}, false],
  ])('isRRDErrorResponse(%p) returns %p', (data, expected) => {
    expect(isRRDErrorResponse(data)).toBe(expected);
  });
});

describe('isNoOpportunitiesMessage', () => {
  it('returns true for a message containing the no-opportunities indicator', () => {
    expect(isNoOpportunitiesMessage(RRD_SEARCH_PAYLOAD_4.message)).toBe(true);
  });

  it('returns false for a message without the no-opportunities indicator', () => {
    expect(isNoOpportunitiesMessage(RRD_SEARCH_PAYLOAD_3.message)).toBe(false);
  });
});
