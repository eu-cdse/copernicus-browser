import axios from 'axios';

export async function getAuthToken(authBaseUrl) {
  if (!process.env.APP_ADMIN_CLIENT_ID || !process.env.APP_ADMIN_CLIENT_SECRET) {
    throw new Error('Env vars APP_ADMIN_CLIENT_ID and APP_ADMIN_CLIENT_SECRET are not set');
  }

  const clientId = process.env.APP_ADMIN_CLIENT_ID;
  const clientSecret = process.env.APP_ADMIN_CLIENT_SECRET;
  console.log('Requesting auth token with client id from env vars:', clientId, 'using endpoint', authBaseUrl);

  const { data, error } = await axios({
    method: 'post',
    url: authBaseUrl,
    headers: { 'content-type': 'application/x-www-form-urlencoded' },
    data: `grant_type=client_credentials&client_id=${encodeURIComponent(
      clientId,
    )}&client_secret=${encodeURIComponent(clientSecret)}`,
  });

  if (error) {
    console.error(error);
    throw error;
  }

  if (!data.access_token) {
    throw new Error(`Unable to get access_token`);
  }

  return data.access_token;
}
