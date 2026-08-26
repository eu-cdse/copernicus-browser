import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';
import { executeRequest } from './httpRequestResolver';

describe('executeRequest', () => {
  const client = axios.create({ baseURL: 'http://test' });
  const mock = new MockAdapter(client);

  beforeEach(() => {
    mock.reset();
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  it('throws an error exposing status/response/code and an unchanged message format on terminal failure (no retriesLeft)', async () => {
    mock.onGet('/foo').reply(429, { msg: 'rate limited' });

    let caughtError;
    try {
      await executeRequest(client, 'get', { queryPathString: '/foo' }, {}, {});
    } catch (e) {
      caughtError = e;
    }

    expect(caughtError).toBeDefined();
    expect(caughtError.status).toBe(429);
    expect(caughtError.response).toBeDefined();
    expect(caughtError.response.status).toBe(429);
    expect(caughtError.response.data).toEqual({ msg: 'rate limited' });
    expect(caughtError.code).toBeUndefined();
    expect(caughtError.message).toBe('Request failed with status code 429:\n{"msg":"rate limited"}');
  });

  it('rethrows the raw axios error immediately (with its own native status/response) and does not retry when retryRestrictionFunc returns true', async () => {
    mock.onGet('/foo').reply(400, { msg: 'bad request' });

    let caughtError;
    try {
      await executeRequest(
        client,
        'get',
        { queryPathString: '/foo' },
        {},
        { retriesLeft: 3, delayBetweenRetries: 1000, retryRestrictionFunc: () => true },
      );
    } catch (e) {
      caughtError = e;
    }

    // The raw axios error is rethrown as-is (not wrapped into the terminal `requestError`),
    // so the message is axios's own plain message, without the appended extracted body.
    expect(caughtError.isAxiosError).toBe(true);
    expect(caughtError.status).toBe(400);
    expect(caughtError.response.status).toBe(400);
    expect(caughtError.message).toBe('Request failed with status code 400');
    expect(mock.history.get.length).toBe(1);
  });

  it('retries on a retryable status and eventually succeeds, using fake timers to avoid real waiting', async () => {
    jest.useFakeTimers();

    mock
      .onGet('/foo')
      .replyOnce(429, { msg: 'rate limited' })
      .onGet('/foo')
      .replyOnce(429, { msg: 'rate limited' })
      .onGet('/foo')
      .replyOnce(200, { ok: true });

    const retryRestrictionFunc = (e) => {
      const status = Number(e.response?.status ?? e.status);
      return !Number.isFinite(status) || !(status === 429 || (status >= 500 && status <= 599));
    };

    const resultPromise = executeRequest(
      client,
      'get',
      { queryPathString: '/foo' },
      {},
      { retriesLeft: 3, delayBetweenRetries: 1000, retryRestrictionFunc },
    );

    // First attempt fails immediately (429), triggering the first delayed retry.
    await jest.advanceTimersByTimeAsync(1000);
    // Second attempt fails (429) too, triggering the second delayed retry (backed off to 2000ms).
    await jest.advanceTimersByTimeAsync(2000);

    const result = await resultPromise;

    expect(result).toEqual({ ok: true });
    expect(mock.history.get.length).toBe(3);
  });

  it('does not retry when the options object omits retriesLeft, even without a retryRestrictionFunc', async () => {
    mock.onGet('/foo').reply(500, { msg: 'server error' });

    let caughtError;
    try {
      await executeRequest(client, 'get', { queryPathString: '/foo' }, {}, { delayBetweenRetries: 1000 });
    } catch (e) {
      caughtError = e;
    }

    expect(caughtError).toBeDefined();
    expect(caughtError.status).toBe(500);
    expect(mock.history.get.length).toBe(1);
  });

  it('resolves to undefined without throwing when the request is cancelled', async () => {
    mock
      .onGet('/foo')
      .reply(() => new Promise((resolve) => setTimeout(() => resolve([200, { ok: true }]), 50)));

    const controller = new AbortController();
    const resultPromise = executeRequest(
      client,
      'get',
      { queryPathString: '/foo' },
      { signal: controller.signal },
      {},
    );

    controller.abort();

    await expect(resultPromise).resolves.toBeUndefined();
  });
});
