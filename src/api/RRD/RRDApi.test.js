import { retryRestrictionFunc, RRD_SEARCH_RETRY_OPTIONS } from './RRDApi';
import { RRD_SEARCH_PAYLOAD_5 } from './searchResponse.fixtures';
import { DEFAULT_RETRY_OPTIONS } from '../httpRequestResolver';

describe('RRD_SEARCH_RETRY_OPTIONS', () => {
  it('does not retry a failed search, so the user is not kept waiting through several slow attempts', () => {
    expect(RRD_SEARCH_RETRY_OPTIONS.retriesLeft).toBe(0);
  });

  it('leaves the default retry options (used by cart and profile calls) unchanged', () => {
    expect(DEFAULT_RETRY_OPTIONS.retriesLeft).toBe(3);
  });
});

describe('retryRestrictionFunc', () => {
  it.each([429, 500, 502, 503])('allows retrying a %i', (status) => {
    expect(retryRestrictionFunc({ response: { status } })).toBe(false);
  });

  it('does NOT allow retrying a 504; usually means the request itself (e.g. too many providers/too large an area) is too heavy, so retrying the same request would not help', () => {
    expect(retryRestrictionFunc({ response: { status: 504 } })).toBe(true);
  });

  it.each([400, 401, 404])('does NOT allow retrying a %i', (status) => {
    expect(retryRestrictionFunc({ response: { status } })).toBe(true);
  });

  it('allows retrying a 511 (still within the retryable 5xx range; only 504 is carved out)', () => {
    expect(retryRestrictionFunc({ response: { status: 511 } })).toBe(false);
  });

  it('does NOT allow retrying when there is no status at all (e.g. a network error or CORS-blocked response)', () => {
    expect(retryRestrictionFunc({ code: 'ERR_NETWORK', message: 'Network Error' })).toBe(true);
  });

  it('does NOT allow retrying a 500 wrapping a provider-throttled (429) upstream response', () => {
    expect(retryRestrictionFunc({ response: { status: 500, data: RRD_SEARCH_PAYLOAD_5 } })).toBe(true);
  });

  it('allows retrying a plain 500 with an unrelated message', () => {
    expect(
      retryRestrictionFunc({
        response: { status: 500, data: { message: 'Internal Server Error' } },
      }),
    ).toBe(false);
  });
});
