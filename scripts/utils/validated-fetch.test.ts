import { fetchValidatedPage, isValidPage } from './validated-fetch';

// Short delay used by the fake-timer tests below -- kept independent of the real
// MAX_PAGE_ATTEMPTS/PAGE_RETRY_DELAY_MS defaults so this suite doesn't need updating if those change.
const PAGE_RETRY_DELAY_MS_FOR_TEST = 5000;

describe('isValidPage', () => {
  it('accepts an array of objects with a truthy id', () => {
    expect(isValidPage([{ id: 'a' }, { id: 'b' }])).toBe(true);
  });

  it('accepts an empty array', () => {
    expect(isValidPage([])).toBe(true);
  });

  it('rejects a non-array (e.g. a truncated-JSON string coerced by axios)', () => {
    expect(isValidPage('{"id":"a"}{"error":"unknown_error"')).toBe(false);
  });

  it('rejects an array containing an entry with no id', () => {
    expect(isValidPage([{ id: 'a' }, { username: 'no-id-here' }])).toBe(false);
  });

  it('rejects an array containing an entry with a falsy id', () => {
    expect(isValidPage([{ id: 'a' }, { id: '' }])).toBe(false);
  });
});

describe('fetchValidatedPage', () => {
  it('returns the data unchanged on a valid page', async () => {
    const fetchPage = jest.fn().mockResolvedValueOnce([{ id: 'a' }]);

    const result = await fetchValidatedPage(fetchPage, 'test-label');

    expect(result).toEqual([{ id: 'a' }]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('treats an empty array as valid, with no retry', async () => {
    const fetchPage = jest.fn().mockResolvedValueOnce([]);

    const result = await fetchValidatedPage(fetchPage, 'test-label');

    expect(result).toEqual([]);
    expect(fetchPage).toHaveBeenCalledTimes(1);
  });

  it('retries after a page fetch throws, then succeeds', async () => {
    jest.useFakeTimers();
    const fetchPage = jest
      .fn()
      .mockRejectedValueOnce(new Error('network error'))
      .mockResolvedValueOnce([{ id: 'a' }]);

    const promise = fetchValidatedPage(fetchPage, 'test-label');
    await jest.advanceTimersByTimeAsync(PAGE_RETRY_DELAY_MS_FOR_TEST);
    const result = await promise;

    expect(result).toEqual([{ id: 'a' }]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('retries after an invalid (non-array) page, then succeeds', async () => {
    jest.useFakeTimers();
    const fetchPage = jest
      .fn()
      .mockResolvedValueOnce('{"id":"a"}{"error":"unknown_error"')
      .mockResolvedValueOnce([{ id: 'a' }]);

    const promise = fetchValidatedPage(fetchPage, 'test-label');
    await jest.advanceTimersByTimeAsync(PAGE_RETRY_DELAY_MS_FOR_TEST);
    const result = await promise;

    expect(result).toEqual([{ id: 'a' }]);
    expect(fetchPage).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('throws after exhausting all attempts on a persistently invalid page', async () => {
    jest.useFakeTimers();
    const fetchPage = jest.fn().mockResolvedValue('garbage');

    const promise = fetchValidatedPage(fetchPage, 'test-label', 3, PAGE_RETRY_DELAY_MS_FOR_TEST);
    const expectation = expect(promise).rejects.toThrow(
      'test-label: page is not a valid array of objects with a truthy "id" (attempt 3/3)',
    );
    await jest.advanceTimersByTimeAsync(PAGE_RETRY_DELAY_MS_FOR_TEST * 2);
    await expectation;

    expect(fetchPage).toHaveBeenCalledTimes(3);
    jest.useRealTimers();
  });

  it('throws the original error after exhausting all attempts on a persistently failing fetch', async () => {
    jest.useFakeTimers();
    const fetchPage = jest.fn().mockRejectedValue(new Error('still down'));

    const promise = fetchValidatedPage(fetchPage, 'test-label', 2, PAGE_RETRY_DELAY_MS_FOR_TEST);
    const expectation = expect(promise).rejects.toThrow('still down');
    await jest.advanceTimersByTimeAsync(PAGE_RETRY_DELAY_MS_FOR_TEST * 2);
    await expectation;

    expect(fetchPage).toHaveBeenCalledTimes(2);
    jest.useRealTimers();
  });

  it('respects custom attempts and delayMs', async () => {
    jest.useFakeTimers();
    const fetchPage = jest.fn().mockResolvedValue('garbage');

    const promise = fetchValidatedPage(fetchPage, 'test-label', 5, 100);
    const expectation = expect(promise).rejects.toThrow('attempt 5/5');
    await jest.advanceTimersByTimeAsync(100 * 5);
    await expectation;

    expect(fetchPage).toHaveBeenCalledTimes(5);
    jest.useRealTimers();
  });
});
