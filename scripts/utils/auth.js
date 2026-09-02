import axios from 'axios';

/**
 * Fetch an authentication token using client credentials.
 * @param {string} tokenEndpointUrl - The URL of the token endpoint.
 * @param {string} clientId - The client ID.
 * @param {string} clientSecret - The client secret.
 * @returns {Promise<string>} - The authentication token.
 */
export const getAuthToken = async (tokenEndpointUrl, clientId, clientSecret) => {
  try {
    const params = new URLSearchParams({
      grant_type: 'client_credentials',
      client_id: clientId,
      client_secret: clientSecret,
    });
    const response = await axios.post(tokenEndpointUrl, params, {
      headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    });
    return response.data.access_token;
  } catch (error) {
    console.error('Error fetching auth token:', error.message);
    throw error;
  }
};

/**
 * Decode a JWT's payload without verifying its signature.
 *
 * Node-side twin of `jwtDecode` (the `jwt-decode` package) used in src/Auth/authHelpers.js and
 * elsewhere in the browser app: same decode, but returns {} instead of throwing on malformed
 * input, which the callers below rely on. Not reused directly since it's an isomorphic package
 * that Node scripts could import too, but the swallow-on-failure contract is the actual value
 * added here, and this file otherwise has zero browser-only dependencies.
 * @param {string} token - A JWT access token.
 * @returns {Record<string, unknown>} - The decoded payload, or {} if decoding fails.
 */
const decodeJwtPayload = (token) => {
  try {
    return JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
  } catch {
    return {};
  }
};

/**
 * Decode the identity claims from a CDSE JWT access token (no verification).
 * Useful for confirming which service account / Sentinel Hub organization a
 * write will land in before acting against the live API.
 * @param {string} token - A JWT access token.
 * @returns {{clientId?: string, username?: string, sub?: string, organization?: string}}
 */
export const decodeTokenIdentity = (token) => {
  const payload = decodeJwtPayload(token);
  return {
    clientId: payload.client_id || payload.azp,
    username: payload.preferred_username,
    sub: payload.sub,
    // CDSE tokens expose the Sentinel Hub account/domain as `user_context` and `organizations`.
    organization: payload.user_context || payload.organizations?.[0],
  };
};

/**
 * Get a JWT's expiry time in epoch milliseconds.
 *
 * Node-side twin of `getTokenExpiration` in src/Auth/authHelpers.js: same `exp * 1000`
 * conversion, but takes a raw token string (not a `{ access_token }` object) and returns null
 * rather than 0 on failure, since `createAuthenticatedClient` below needs "no expiry known,
 * don't proactively refresh" to be distinguishable from "already expired".
 * @param {string} token - A JWT access token.
 * @returns {number | null} - The expiry time in epoch ms, or null if the token has no `exp` claim.
 */
const getTokenExpiryMs = (token) => {
  const { exp } = decodeJwtPayload(token);
  return typeof exp === 'number' ? exp * 1000 : null;
};

/**
 * Log a one-line summary of the account a token belongs to. Call this right
 * after authenticating so the operator can see the target before any write.
 * @param {string} token - A JWT access token.
 * @param {string} configurationsEndpoint - The endpoint writes will target.
 */
export const logTokenIdentity = (token, configurationsEndpoint) => {
  const { clientId, username, organization } = decodeTokenIdentity(token);
  console.log('Authenticated against:');
  console.log(`  endpoint:     ${configurationsEndpoint}`);
  console.log(`  client_id:    ${clientId || '(unknown)'}`);
  console.log(`  organization: ${organization || '(unknown)'}`);
  if (username) {
    console.log(`  account:      ${username}`);
  }
};

// Refresh this many ms before the token's actual expiry, so a request that starts just before
// expiry doesn't race the clock and get rejected mid-flight.
const REFRESH_BUFFER_MS = 60_000;

/**
 * Create an axios instance that authenticates itself with a client-credentials token, refreshing
 * it proactively (before it expires) and reactively (on a 401, refresh once and retry once).
 *
 * `createHttpClientWithCredentials`/`createHttpClient` in scripts/shared-functions.js mint a
 * single static token and never refresh it; `update-rrd-metadata-cache-bundle.js` and
 * `update-rrd-collections.js` each hand-roll their own 401-refresh-and-retry loop around that.
 * This is the superset of all three -- new callers should prefer this one. Not consolidated here
 * to keep this change scoped to the CCM sync scripts; left as a follow-up.
 * @param {string} tokenEndpointUrl - The URL of the token endpoint.
 * @param {string} clientId - The client ID.
 * @param {string} clientSecret - The client secret.
 * @param {{onTokenRefreshed?: (token: string) => void}} [options] - Called with the new token
 *   every time one is minted (initial mint included), e.g. to log token identity.
 * @returns {Promise<import('axios').AxiosInstance>} - An axios instance with auth wired up.
 */
export const createAuthenticatedClient = async (tokenEndpointUrl, clientId, clientSecret, options = {}) => {
  const { onTokenRefreshed } = options;
  let token;
  let expiresAtMs;

  const refreshToken = async () => {
    token = await getAuthToken(tokenEndpointUrl, clientId, clientSecret);
    expiresAtMs = getTokenExpiryMs(token);
    if (onTokenRefreshed) {
      onTokenRefreshed(token);
    }
  };

  const getValidToken = async () => {
    if (!token || (expiresAtMs != null && Date.now() >= expiresAtMs - REFRESH_BUFFER_MS)) {
      await refreshToken();
    }
    return token;
  };

  await refreshToken();

  const client = axios.create();

  client.interceptors.request.use(async (config) => {
    const validToken = await getValidToken();
    config.headers.Authorization = `Bearer ${validToken}`;
    return config;
  });

  client.interceptors.response.use(
    (response) => response,
    async (error) => {
      const { config, response } = error;
      if (response?.status !== 401 || !config || config._retriedAfter401) {
        throw error;
      }
      config._retriedAfter401 = true;
      await refreshToken();
      return client(config);
    },
  );

  return client;
};
