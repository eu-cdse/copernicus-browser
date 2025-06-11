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
