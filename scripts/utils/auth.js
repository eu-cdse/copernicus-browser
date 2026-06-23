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
 * Decode the identity claims from a CDSE JWT access token (no verification).
 * Useful for confirming which service account / Sentinel Hub organization a
 * write will land in before acting against the live API.
 * @param {string} token - A JWT access token.
 * @returns {{clientId?: string, username?: string, sub?: string, organization?: string}}
 */
export const decodeTokenIdentity = (token) => {
  try {
    const payload = JSON.parse(Buffer.from(token.split('.')[1], 'base64url').toString('utf8'));
    return {
      clientId: payload.client_id || payload.azp,
      username: payload.preferred_username,
      sub: payload.sub,
      // CDSE tokens expose the Sentinel Hub account/domain as `user_context` and `organizations`.
      organization: payload.user_context || payload.organizations?.[0],
    };
  } catch {
    return {};
  }
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
