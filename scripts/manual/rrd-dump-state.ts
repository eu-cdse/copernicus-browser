import fs from 'fs';
import path from 'path';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { getAuthToken, logTokenIdentity } from '../utils/auth.js';
import { fetchCollections, fetchData } from '../utils/byoc-api.js';
import { Collection, SKIPPED_COLLECTION_NAMES } from '../utils/rrd-missing-configurations';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script: rrd-dump-state.ts
 *
 * Description:
 * Fetches all RRD collections and all RRD configurations from the live API and
 * writes a compact JSON snapshot to `scripts/rrd/rrd-state.json`. It also computes
 * the set of collections that have no same-named configuration (excluding umbrella
 * collections listed in SKIPPED_COLLECTION_NAMES that intentionally have none).
 *
 * This is the read-only first step used by the `add-rrd-config` agent: the agent
 * reads the snapshot, reasons about which existing configuration is the best
 * template for each missing collection, then feeds a mapping to
 * `rrd-create-configs-from-mapping.ts`.
 *
 * Output JSON shape:
 * {
 *   "collections":    [{ "id", "name" }, ...],
 *   "configurations": [{ "id", "name" }, ...],
 *   "missing":        [{ "id", "name" }, ...]   // collections with no config of the same name
 * }
 *
 * Usage:
 *   npx tsx scripts/manual/rrd-dump-state.ts [outputPath]
 */

interface Snapshot {
  collections: Collection[];
  configurations: Collection[];
  missing: Collection[];
}

const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const collectionsEndpoint = process.env.RRD_COLLECTION_BASE_URL;
const configurationsEndpoint = process.env.RRD_CONFIGURATION_BASEURL;
const clientId = process.env.RRD_COLLECTION_CLIENT_ID;
const clientSecret = process.env.RRD_COLLECTION_CLIENT_SECRET;

const requiredEnvVars: Record<string, string | undefined> = {
  APP_ADMIN_AUTH_BASEURL: tokenEndpointUrl,
  RRD_COLLECTION_BASE_URL: collectionsEndpoint,
  RRD_CONFIGURATION_BASEURL: configurationsEndpoint,
  RRD_COLLECTION_CLIENT_ID: clientId,
  RRD_COLLECTION_CLIENT_SECRET: clientSecret,
};

const outputPath = process.argv[2] || path.join(__dirname, '../rrd/rrd-state.json');

const main = async (): Promise<void> => {
  const missingEnv = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingEnv.length > 0) {
    console.error(`Missing required environment variable(s): ${missingEnv.join(', ')}`);
    process.exit(1);
  }

  try {
    const token = await getAuthToken(tokenEndpointUrl!, clientId!, clientSecret!);
    console.log('Auth token fetched.');
    logTokenIdentity(token, configurationsEndpoint!);

    const collectionsRaw: Array<{ id: string; name: string; [key: string]: unknown }> =
      await fetchCollections(collectionsEndpoint!, token);
    const configurationsRaw: Array<{ id: string; name: string; [key: string]: unknown }> = await fetchData(
      configurationsEndpoint!,
      token,
    );
    console.log(
      `Fetched ${collectionsRaw.length} collections and ${configurationsRaw.length} configurations.`,
    );

    const collections: Collection[] = collectionsRaw.map(({ id, name }) => ({ id, name }));
    const configurations: Collection[] = configurationsRaw.map(({ id, name }) => ({ id, name }));

    const configNames = new Set(configurations.map((c) => c.name.toLowerCase()));
    const skipped = new Set(SKIPPED_COLLECTION_NAMES);
    const missing = collections.filter((c) => !configNames.has(c.name.toLowerCase()) && !skipped.has(c.name));

    const snapshot: Snapshot = { collections, configurations, missing };
    fs.writeFileSync(outputPath, JSON.stringify(snapshot, null, 2) + '\n');

    console.log(`\nWrote snapshot to ${outputPath}`);
    console.log(`Collections without a configuration: ${missing.length}`);
  } catch (error) {
    console.error('Failed to dump RRD state:', (error as Error).message);
    process.exit(1);
  }
};

main();
