import MockAdapter from 'axios-mock-adapter';
import axios from 'axios';
import { createAuthenticatedClient } from './auth';

const mockNetwork = new MockAdapter(axios);

const TOKEN_ENDPOINT = 'https://identity.example.com/token';
const CLIENT_ID = 'client-id';
const CLIENT_SECRET = 'client-secret';
const API_URL = 'https://api.example.com/resource';

// Same unsigned-JWT-builder shape as ccmProductTypeAccessRightsConfig.test.js's makeToken and
// the inline builder in CollectionSelection.test.jsx (both also use Buffer, not btoa -- only
// e2e/fixtures/helpers.ts's dismissAnonymousSession needs btoa, since that code is serialized
// into the page via page.addInitScript). Not extracted into a shared util since each is a
// three-line fixture with a different claim shape.
const makeJwt = (expInSeconds: number): string => {
  const payload = { exp: Math.floor(Date.now() / 1000) + expInSeconds };
  return `header.${Buffer.from(JSON.stringify(payload)).toString('base64url')}.sig`;
};

describe('createAuthenticatedClient', () => {
  beforeEach(() => {
    mockNetwork.reset();
    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it('mints a token, attaches it as a Bearer header, and fires onTokenRefreshed once before resolving', async () => {
    const token = makeJwt(3600);
    mockNetwork.onPost(TOKEN_ENDPOINT).reply(200, { access_token: token });
    mockNetwork.onGet(API_URL).reply(200, { ok: true });

    const onTokenRefreshed = jest.fn();
    const client = await createAuthenticatedClient(TOKEN_ENDPOINT, CLIENT_ID, CLIENT_SECRET, {
      onTokenRefreshed,
    });

    expect(onTokenRefreshed).toHaveBeenCalledTimes(1);
    expect(onTokenRefreshed).toHaveBeenCalledWith(token);

    const response = await client.get(API_URL);

    expect(response.data).toEqual({ ok: true });
    expect(mockNetwork.history.get[0].headers?.Authorization).toBe(`Bearer ${token}`);
    expect(mockNetwork.history.post.length).toBe(1);
  });

  it('reuses a still-valid token across requests instead of re-minting', async () => {
    const token = makeJwt(3600);
    mockNetwork.onPost(TOKEN_ENDPOINT).reply(200, { access_token: token });
    mockNetwork.onGet(API_URL).reply(200, { ok: true });

    const client = await createAuthenticatedClient(TOKEN_ENDPOINT, CLIENT_ID, CLIENT_SECRET);

    await client.get(API_URL);
    await client.get(API_URL);

    expect(mockNetwork.history.post.length).toBe(1);
    expect(mockNetwork.history.get.length).toBe(2);
    expect(mockNetwork.history.get[1].headers?.Authorization).toBe(`Bearer ${token}`);
  });

  it('proactively refreshes the token when its expiry is within the refresh buffer', async () => {
    const almostExpiredToken = makeJwt(30); // within the 60s refresh buffer
    const freshToken = makeJwt(3600);
    mockNetwork
      .onPost(TOKEN_ENDPOINT)
      .replyOnce(200, { access_token: almostExpiredToken })
      .onPost(TOKEN_ENDPOINT)
      .replyOnce(200, { access_token: freshToken });
    mockNetwork.onGet(API_URL).reply(200, { ok: true });

    const onTokenRefreshed = jest.fn();
    const client = await createAuthenticatedClient(TOKEN_ENDPOINT, CLIENT_ID, CLIENT_SECRET, {
      onTokenRefreshed,
    });

    await client.get(API_URL);

    expect(mockNetwork.history.post.length).toBe(2);
    expect(onTokenRefreshed).toHaveBeenCalledTimes(2);
    expect(onTokenRefreshed).toHaveBeenNthCalledWith(1, almostExpiredToken);
    expect(onTokenRefreshed).toHaveBeenNthCalledWith(2, freshToken);
    expect(mockNetwork.history.get[0].headers?.Authorization).toBe(`Bearer ${freshToken}`);
  });

  it('reactively refreshes once on a 401 and retries the original request, which then succeeds', async () => {
    const staleToken = makeJwt(3600);
    const newToken = makeJwt(3600);
    mockNetwork
      .onPost(TOKEN_ENDPOINT)
      .replyOnce(200, { access_token: staleToken })
      .onPost(TOKEN_ENDPOINT)
      .replyOnce(200, { access_token: newToken });
    mockNetwork.onGet(API_URL).replyOnce(401).onGet(API_URL).replyOnce(200, { ok: true });

    const client = await createAuthenticatedClient(TOKEN_ENDPOINT, CLIENT_ID, CLIENT_SECRET);

    const response = await client.get(API_URL);

    expect(response.data).toEqual({ ok: true });
    expect(mockNetwork.history.post.length).toBe(2);
    expect(mockNetwork.history.get.length).toBe(2);
    expect(mockNetwork.history.get[0].headers?.Authorization).toBe(`Bearer ${staleToken}`);
    expect(mockNetwork.history.get[1].headers?.Authorization).toBe(`Bearer ${newToken}`);
  });

  it('does not retry a second time if the retried request also 401s, and propagates the error', async () => {
    const staleToken = makeJwt(3600);
    const newToken = makeJwt(3600);
    mockNetwork
      .onPost(TOKEN_ENDPOINT)
      .replyOnce(200, { access_token: staleToken })
      .onPost(TOKEN_ENDPOINT)
      .replyOnce(200, { access_token: newToken });
    mockNetwork.onGet(API_URL).reply(401);

    const client = await createAuthenticatedClient(TOKEN_ENDPOINT, CLIENT_ID, CLIENT_SECRET);

    await expect(client.get(API_URL)).rejects.toMatchObject({ response: { status: 401 } });

    // One mint on client creation + one reactive refresh on the first 401 = 2 total, never more.
    expect(mockNetwork.history.post.length).toBe(2);
    expect(mockNetwork.history.get.length).toBe(2);
  });
});
