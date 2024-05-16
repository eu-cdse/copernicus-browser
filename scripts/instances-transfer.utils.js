import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

const OAuthClientsCredentialsForAuthentication = [
  {
    tokenEndpointUrl: 'https://services.sentinel-hub.com/auth/realms/main/protocol/openid-connect/token',
    clientId: process.env.APP_SH_ADMIN_CLIENT_ID,
    clientSecret: process.env.APP_SH_ADMIN_CLIENT_SECRET,
  },
  {
    tokenEndpointUrl:
      'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token',
    clientId: process.env.APP_CD_ADMIN_CLIENT_ID,
    clientSecret: process.env.APP_CD_ADMIN_CLIENT_SECRET,
  },
];

export const getAuthTokens = async () =>
  Promise.all(
    OAuthClientsCredentialsForAuthentication.map(async (credential) => {
      const { tokenEndpointUrl, clientId, clientSecret } = credential;

      try {
        const response = await axios({
          method: 'post',
          url: tokenEndpointUrl,
          headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
          data: `grant_type=client_credentials&client_id=${encodeURIComponent(
            clientId,
          )}&client_secret=${encodeURIComponent(clientSecret)}`,
        });

        return response.data.access_token;
      } catch (error) {
        console.log(
          `${error.response.data.error_description}: provide credentials on instances-transfer.utils file`,
        );
      }
    }),
  );
