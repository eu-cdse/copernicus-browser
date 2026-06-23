import fs from 'fs';
import path from 'path';
import axios from 'axios';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { getAuthToken, logTokenIdentity } from '../utils/auth.js';
import { fetchData } from '../utils/byoc-api.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

/**
 * Script: rrd-create-configs-from-mapping.ts
 *
 * Description:
 * Creates RRD configurations for collections that currently have none, by cloning
 * an existing "template" configuration (and its layers) chosen by the caller.
 *
 * This generalises `generate-frtx-csesa-configs.js`: instead of deriving the
 * template from a name transform (FRTX_/CSESA_ -> GENERAL_), it reads an explicit
 * mapping where each missing collection is paired with the template configuration
 * to clone. The `add-rrd-config` agent produces this mapping using provider-aware
 * judgment so that GENERAL_* collections (which have no name-derived parent) are
 * also covered.
 *
 * Mapping file shape (default: scripts/rrd/rrd-config-mapping.json):
 * [
 *   {
 *     "collectionId":   "uuid-of-the-collection-needing-a-config",
 *     "collectionName": "GENERAL_LEGION_RGB",
 *     "templateConfigId":   "uuid-of-an-existing-configuration-to-clone",
 *     "templateConfigName": "GENERAL_WORLDVIEW_RGB"   // optional, for logging only
 *   },
 *   ...
 * ]
 *
 * Behaviour:
 * - For each entry, the new configuration is created with name = collectionName,
 *   cloned from the template config, and every template layer is re-pointed at the
 *   new configuration with datasourceDefaults.collectionId = collectionId.
 * - Entries whose collectionName already has a configuration are skipped.
 * - Pass --dry-run to validate the mapping (template exists, no name clash, layer
 *   count) without creating anything.
 *
 * Usage:
 *   npx tsx scripts/manual/rrd-create-configs-from-mapping.ts [mappingPath] [--dry-run]
 */

interface MappingEntry {
  collectionId: string;
  collectionName: string;
  templateConfigId: string;
  templateConfigName?: string;
}

interface Configuration {
  id: string;
  name: string;
  created?: string;
  lastUpdated?: string;
  [key: string]: unknown;
}

interface Layer {
  lastUpdated?: string;
  instanceId?: string;
  datasourceDefaults?: Record<string, unknown>;
  [key: string]: unknown;
}

const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const configurationsEndpoint = process.env.RRD_CONFIGURATION_BASEURL;
const clientId = process.env.RRD_COLLECTION_CLIENT_ID;
const clientSecret = process.env.RRD_COLLECTION_CLIENT_SECRET;

const requiredEnvVars: Record<string, string | undefined> = {
  APP_ADMIN_AUTH_BASEURL: tokenEndpointUrl,
  RRD_CONFIGURATION_BASEURL: configurationsEndpoint,
  RRD_COLLECTION_CLIENT_ID: clientId,
  RRD_COLLECTION_CLIENT_SECRET: clientSecret,
};

const args = process.argv.slice(2);
const isDryRun = args.includes('--dry-run');
const mappingPath =
  args.find((a) => !a.startsWith('--')) || path.join(__dirname, '../rrd/rrd-config-mapping.json');

const fetchLayersForInstance = async (instanceId: string, token: string): Promise<Layer[]> => {
  const layersEndpoint = `${configurationsEndpoint}/${instanceId}/layers`;
  const response = await axios.get(layersEndpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const addLayerToConfiguration = async (
  instanceId: string,
  layerData: Layer,
  token: string,
): Promise<Layer> => {
  const url = `${configurationsEndpoint}/${instanceId}/layers`;
  const response = await axios.post(url, layerData, {
    headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
  });
  return response.data;
};

// Strip per-instance fields and re-point the layer at the new configuration/collection.
const cleanLayerData = (layer: Layer, newInstanceId: string, newCollectionId: string): Layer => {
  const { lastUpdated: _lastUpdated, instanceId: _instanceId, ...cleanedLayerData } = layer;
  return {
    ...cleanedLayerData,
    instanceId: newInstanceId,
    datasourceDefaults: {
      ...cleanedLayerData.datasourceDefaults,
      collectionId: newCollectionId,
    },
  };
};

const createConfiguration = async (
  token: string,
  templateConfig: Configuration,
  entry: MappingEntry,
): Promise<{ newConfigId: string; layerCount: number }> => {
  const { id: _id, created: _created, lastUpdated: _lastUpdated, ...configData } = templateConfig;
  configData.name = entry.collectionName;

  const createResponse = await axios.post(configurationsEndpoint!, configData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const newConfig: Configuration = createResponse.data;
  console.log(`  Created configuration "${newConfig.name}" (ID: ${newConfig.id})`);

  const layers = await fetchLayersForInstance(templateConfig.id, token);
  for (const layer of layers) {
    const layerData = cleanLayerData(layer, newConfig.id, entry.collectionId);
    await addLayerToConfiguration(newConfig.id, layerData, token);
  }
  console.log(`  Added ${layers.length} layer(s).`);
  return { newConfigId: newConfig.id, layerCount: layers.length };
};

const main = async (): Promise<void> => {
  const missingEnv = Object.entries(requiredEnvVars)
    .filter(([, value]) => !value)
    .map(([key]) => key);
  if (missingEnv.length > 0) {
    console.error(`Missing required environment variable(s): ${missingEnv.join(', ')}`);
    process.exit(1);
  }

  if (!fs.existsSync(mappingPath)) {
    console.error(`Mapping file not found: ${mappingPath}`);
    process.exit(1);
  }

  let mapping: MappingEntry[];
  try {
    mapping = JSON.parse(fs.readFileSync(mappingPath, 'utf-8'));
  } catch (error) {
    console.error(`Failed to parse mapping file ${mappingPath}: ${(error as Error).message}`);
    process.exit(1);
  }
  if (!Array.isArray(mapping)) {
    console.error('Mapping file must contain a JSON array.');
    process.exit(1);
  }

  console.log(`${isDryRun ? '[DRY RUN] ' : ''}Processing ${mapping.length} mapping entr(ies).\n`);

  try {
    const token = await getAuthToken(tokenEndpointUrl!, clientId!, clientSecret!);
    logTokenIdentity(token, configurationsEndpoint!);
    console.log(`Mode: ${isDryRun ? 'DRY RUN (no writes)' : 'LIVE (will create configurations)'}\n`);
    const configurations: Configuration[] = await fetchData(configurationsEndpoint!, token);
    const configById = new Map(configurations.map((c) => [c.id, c]));
    const existingNames = new Set(configurations.map((c) => c.name.toLowerCase()));

    const results: {
      created: Array<MappingEntry | Record<string, unknown>>;
      skipped: Array<{ entry: MappingEntry; reason: string }>;
      failed: Array<{ entry: MappingEntry; reason: string }>;
    } = { created: [], skipped: [], failed: [] };

    for (const entry of mapping) {
      const label = entry.collectionName || entry.collectionId;
      const { collectionId, collectionName, templateConfigId } = entry;

      if (!collectionId || !collectionName || !templateConfigId) {
        console.warn(`SKIP "${label}": entry missing collectionId, collectionName, or templateConfigId.`);
        results.skipped.push({ entry, reason: 'incomplete entry' });
        continue;
      }

      if (existingNames.has(collectionName.toLowerCase())) {
        console.warn(`SKIP "${collectionName}": a configuration with this name already exists.`);
        results.skipped.push({ entry, reason: 'configuration already exists' });
        continue;
      }

      const templateConfig = configById.get(templateConfigId);
      if (!templateConfig) {
        console.error(`FAIL "${collectionName}": template config ${templateConfigId} not found.`);
        results.failed.push({ entry, reason: 'template config not found' });
        continue;
      }

      console.log(`${collectionName}  <-  template "${templateConfig.name}" (${templateConfigId})`);

      if (isDryRun) {
        const layers = await fetchLayersForInstance(templateConfig.id, token);
        console.log(`  [DRY RUN] Would create config and copy ${layers.length} layer(s).`);
        results.created.push({ entry, dryRun: true, layerCount: layers.length });
        continue;
      }

      try {
        const created = await createConfiguration(token, templateConfig, entry);
        results.created.push({ entry, ...created });
        // Guard against creating a duplicate later in the same run.
        existingNames.add(collectionName.toLowerCase());
      } catch (error) {
        const axiosError = error as { response?: { data?: { message?: string } }; message: string };
        console.error(
          `FAIL "${collectionName}": ${axiosError.response?.data?.message || axiosError.message}`,
        );
        results.failed.push({
          entry,
          reason: axiosError.response?.data?.message || axiosError.message,
        });
      }
    }

    console.log('\n--- Summary ---');
    console.log(`${isDryRun ? 'Would create' : 'Created'}: ${results.created.length}`);
    console.log(`Skipped: ${results.skipped.length}`);
    console.log(`Failed:  ${results.failed.length}`);

    if (results.failed.length > 0) {
      process.exit(2);
    }
  } catch (error) {
    console.error('Failed to create configurations:', (error as Error).message);
    process.exit(1);
  }
};

main();
