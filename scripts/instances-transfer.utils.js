import dotenv from 'dotenv';
import { getAuthToken } from './utils/auth';

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
        return await getAuthToken(tokenEndpointUrl, clientId, clientSecret);
      } catch (error) {
        console.log(
          `${error.response.data.error_description}: provide credentials on instances-transfer.utils file`,
        );
      }
    }),
  );
