/**
 * copy-instances.js
 *
 * Copies Sentinel Hub configuration instances (including their layers) from one
 * Copernicus Data Space Ecosystem (CDSE) account to another within the same platform.
 *
 * ─── How to run ───────────────────────────────────────────────────────────────
 *
 * 1. Set up credentials in .env (scripts directory).
 *    Copy scripts/.env.copy-instances.example and fill in the values:
 *
 *      cp scripts/.env.copy-instances.example .env
 *
 * 2. Populate the INSTANCE_IDS array in this file with the instances to copy.
 *    Each entry is an object with a required `id` and an optional `name`:
 *
 *      { id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }               // keeps original name
 *      { id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', name: 'Foo' }  // renames on copy
 *
 *    Instance IDs can be found in the Copernicus Dashboard under
 *    Configuration Utility → Instances, or via:
 *      GET https://sh.dataspace.copernicus.eu/api/v2/configuration/instances
 *
 * 3. Run the script from the project root:
 *
 *      node scripts/copy-instances.js
 *
 * ─── What it does ─────────────────────────────────────────────────────────────
 *
 *   For each instance ID:
 *     1. Fetches the instance + layer configurations from the source account.
 *     2. POSTs to the /clone endpoint with the full payload (instance + layers)
 *        targeting the destination account via ?to_domain_account_id.
 *
 * ─── Environment variables ────────────────────────────────────────────────────
 *
 * ┌─────────────────────────────┬────────────────────────────────────────────────────────┐
 * │ Variable                    │ Description                                            │
 * ├─────────────────────────────┼────────────────────────────────────────────────────────┤
 * │ APP_SOURCE_CLIENT_ID        │ OAuth2 client ID of the SOURCE CDSE account.           │
 * │                             │ Must belong to a root (admin) account.                  │
 * │ APP_SOURCE_CLIENT_SECRET    │ OAuth2 client secret of the SOURCE CDSE account.       │
 * │                             │ Must belong to a root (admin) account.                  │
 * │ APP_DEST_ACCOUNT_ID         │ Domain account ID of the DESTINATION CDSE account.     │
 * │                             │ Used as the clone target and assigned to new instances. │
 * └─────────────────────────────┴────────────────────────────────────────────────────────┘
 *
 * OAuth2 credentials can be created in the Copernicus Dashboard under
 * User Settings → OAuth clients.
 * Account ID can be found in the dashboard profile or retrieved
 * via GET https://sh.dataspace.copernicus.eu/api/v2/configuration/profile
 */

import axios from 'axios';
import dotenv from 'dotenv';
import { getAuthToken } from './utils/auth.js';

dotenv.config({ path: './scripts/.env' });

// ─── Configuration ────────────────────────────────────────────────────────────

const COPERNICUS_ENDPOINT = 'https://sh.dataspace.copernicus.eu';
const COPERNICUS_TOKEN_URL =
  'https://identity.dataspace.copernicus.eu/auth/realms/CDSE/protocol/openid-connect/token';

/**
 * Instances to copy from the source account to the destination account.
 * Each entry requires an `id` and accepts an optional `name` to override
 * the instance name in the destination account. If `name` is omitted, the
 * original name from the source instance is preserved.
 *
 * ⚠️  For an instance to appear in the SH Dashboard instance creation dropdown,
 *     its name must contain the word "template" (case-sensitive).
 *
 * @example
 * { id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' }                                                   // keep original name
 * { id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', name: 'FAPAR Global 300m 10-Daily V2 template' }   // override name, visible in dropdown
 */
const INSTANCE_IDS = [
  // { id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx' },
  // { id: 'xxxxxxxx-xxxx-xxxx-xxxx-xxxxxxxxxxxx', name: 'FAPAR Global 300m 10-Daily V2 template' },
];

// ─── Auth ─────────────────────────────────────────────────────────────────────

const getSourceToken = async () => {
  try {
    return await getAuthToken(
      COPERNICUS_TOKEN_URL,
      process.env.APP_SOURCE_CLIENT_ID,
      process.env.APP_SOURCE_CLIENT_SECRET,
    );
  } catch (error) {
    console.error(
      'Failed to obtain token for source account:',
      error.response?.data?.error_description ?? error.message,
    );
    throw error;
  }
};

// ─── HTTP clients ─────────────────────────────────────────────────────────────

const createHttpClient = (token) => axios.create({ headers: { Authorization: `Bearer ${token}` } });

// ─── Fetch ────────────────────────────────────────────────────────────────────

const fetchInstances = async (sourceClient, instances) => {
  return Promise.all(
    instances.map(async ({ id, name: nameOverride }) => {
      try {
        const [instanceResponse, layersResponse] = await Promise.all([
          sourceClient.get(`${COPERNICUS_ENDPOINT}/api/v2/configuration/instances/${id}`),
          sourceClient.get(`${COPERNICUS_ENDPOINT}/api/v2/configuration/instances/${id}/layers`),
        ]);

        const {
          userId: _userId,
          domainAccountId: _domainAccountId,
          '@id': _scrubbedId,
          layers: _layers,
          created: _created,
          lastUpdated: _lastUpdated,
          ...rest
        } = instanceResponse.data;

        const layers = layersResponse.data.map(({ '@id': _id, instance: _instance, ...layer }) => layer);

        return {
          nameOverride,
          instance: {
            domainAccountId: process.env.APP_DEST_ACCOUNT_ID,
            layers,
            ...rest,
          },
        };
      } catch (error) {
        console.error(`Failed to fetch instance ${id}:`, error.response?.data ?? error.message);
        return null;
      }
    }),
  ).then((results) => results.filter(Boolean));
};

// ─── Clone ────────────────────────────────────────────────────────────────────

const cloneInstances = async (destClient, instancesConfiguration) => {
  return Promise.all(
    instancesConfiguration.map(async ({ instance, nameOverride }) => {
      const payload = nameOverride ? { ...instance, name: nameOverride } : instance;
      const cloneUrl = `${COPERNICUS_ENDPOINT}/api/v2/configuration/instances/${instance.id}/clone?to_domain_account_id=${process.env.APP_DEST_ACCOUNT_ID}`;

      try {
        const response = await destClient.post(cloneUrl, payload);
        console.log(`Instance cloned successfully (status ${response.status}):`, response.data?.id ?? '');
      } catch (error) {
        console.error('Failed to clone instance:', error.response?.data ?? error.message);
      }
    }),
  );
};

// ─── Entry point ──────────────────────────────────────────────────────────────

const run = async () => {
  if (INSTANCE_IDS.length === 0) {
    console.error('No instances provided. Add entries to the INSTANCE_IDS array at the top of the script.');
    process.exit(1);
  }

  console.log(`Copying ${INSTANCE_IDS.length} instance(s) between Copernicus accounts...`);

  const token = await getSourceToken();
  const sourceClient = createHttpClient(token);

  const instancesConfiguration = await fetchInstances(sourceClient, INSTANCE_IDS);
  await cloneInstances(sourceClient, instancesConfiguration);

  console.log('Done.');
};

run();
