import { retryRestrictionFunc } from './RRDApi';

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
});
