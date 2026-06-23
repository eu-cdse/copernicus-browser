import dotenv from 'dotenv';
import { getAuthToken } from './utils/auth.js';
import { fetchCollections, fetchData, fetchLayersFromConfiguration } from './utils/byoc-api.js';
import { findCollectionsWithoutConfiguration } from './utils/rrd-missing-configurations';
import { reportMissingConfigurations } from './utils/gitlab-issue-notifier';
import { SH_SERVICE_BASE_URL } from './shared-functions.js';

dotenv.config();

// Validate required environment variables
const requiredEnvVars = [
  'APP_ADMIN_AUTH_BASEURL',
  'RRD_COLLECTION_BASE_URL',
  'RRD_COLLECTION_CLIENT_ID',
  'RRD_COLLECTION_CLIENT_SECRET',
];
requiredEnvVars.forEach((envVar) => {
  if (!process.env[envVar]) {
    console.error(`Missing required environment variable: ${envVar}`);
    process.exit(1);
  }
});

const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL!;
const collectionsEndpoint = process.env.RRD_COLLECTION_BASE_URL!;
const configurationsEndpoint = `${SH_SERVICE_BASE_URL}/api/v2/configuration/instances`;
const clientId = process.env.RRD_COLLECTION_CLIENT_ID!;
const clientSecret = process.env.RRD_COLLECTION_CLIENT_SECRET!;

const checkMissingConfigurations = async (): Promise<void> => {
  try {
    const token = await getAuthToken(tokenEndpointUrl, clientId, clientSecret);
    console.log('Auth token fetched successfully.');

    // 1. Fetch all collections from the RRD collection account.
    const collections = await fetchCollections(collectionsEndpoint, token);
    console.log(`Collections fetched: ${collections.length}`);

    // 2. Fetch all configurations and collect the collection ids their layers reference.
    const configurations = await fetchData(configurationsEndpoint, token);
    console.log(`Configurations fetched: ${configurations.length}`);

    const allLayers = await Promise.all(
      configurations.map((config: { id: string }) =>
        fetchLayersFromConfiguration(config.id, token, configurationsEndpoint),
      ),
    );
    const referencedCollectionIds = new Set<string>(
      allLayers
        .flat()
        .map(
          (layer: { datasourceDefaults?: { collectionId?: string } }) =>
            layer.datasourceDefaults?.collectionId,
        )
        .filter((id): id is string => Boolean(id)),
    );

    // 3. Report collections that no configuration references.
    const missing = findCollectionsWithoutConfiguration(collections, referencedCollectionIds);

    if (missing.length > 0) {
      console.error(`Collections WITHOUT a configuration (${missing.length}):`);
      missing.forEach((collection) => console.error(`- ${collection.name} (${collection.id})`));
    } else {
      console.log('All collections have a configuration.');
    }

    // Surface the result as a GitLab tracking issue (no-op when not running in CI with a token).
    await reportMissingConfigurations(missing);

    // Exit 2 (not 1) when configurations are missing: the CI job marks exit code 2 as an allowed
    // failure, so the pipeline stays green while still flagging the job. A genuine error below
    // exits 1 and fails the pipeline, so a broken check is never silent.
    process.exit(missing.length > 0 ? 2 : 0);
  } catch (error) {
    console.error('Failed to check for missing configurations:', (error as Error).message);
    process.exit(1);
  }
};

checkMissingConfigurations();
