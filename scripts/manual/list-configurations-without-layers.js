import dotenv from 'dotenv';
import { getAuthToken } from '../utils/auth.js';
import { fetchData, fetchLayersFromConfiguration } from '../utils/byoc-api.js';

dotenv.config();

const environment = process.argv[2] || 'staging';
const isTraining = environment === 'training';
const isProduction = environment === 'production';

console.log(`Running in ${environment} mode.\n`);

const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const configurationsEndpoint = process.env.RRD_CONFIGURATION_BASEURL;
let RRD_CLIENT_ID, RRD_CLIENT_SECRET;

if (isTraining) {
  RRD_CLIENT_ID = process.env.RRD_TRAINING_CLIENT_ID;
  RRD_CLIENT_SECRET = process.env.RRD_TRAINING_CLIENT_SECRET;
} else if (isProduction) {
  RRD_CLIENT_ID = process.env.RRD_PRODUCTION_CLIENT_ID;
  RRD_CLIENT_SECRET = process.env.RRD_PRODUCTION_CLIENT_SECRET;
} else {
  RRD_CLIENT_ID = process.env.RRD_COLLECTION_CLIENT_ID;
  RRD_CLIENT_SECRET = process.env.RRD_COLLECTION_CLIENT_SECRET;
}

const listConfigurationsWithoutLayers = async () => {
  try {
    const token = await getAuthToken(tokenEndpointUrl, RRD_CLIENT_ID, RRD_CLIENT_SECRET);

    const configurations = await fetchData(configurationsEndpoint, token);
    console.log(`Total configurations found: ${configurations.length}`);

    const configsWithoutLayers = [];
    const nameCount = {};

    for (const config of configurations) {
      // Count occurrences of each configuration name
      nameCount[config.name] = (nameCount[config.name] || 0) + 1;

      const layers = await fetchLayersFromConfiguration(config.id, token, configurationsEndpoint);
      if (!layers || layers.length === 0) {
        configsWithoutLayers.push({ id: config.id, name: config.name });
      }
    }

    // Check for repeated configuration names
    const repeatedNames = Object.entries(nameCount)
      .filter(([, count]) => count > 1)
      .map(([name, count]) => ({ name, count }));

    console.log('\n=== Configurations WITHOUT layers ===');
    if (configsWithoutLayers.length === 0) {
      console.log('All configurations have at least one layer.');
    } else {
      configsWithoutLayers.forEach((cfg) => console.log(`- ${cfg.name} (ID: ${cfg.id})`));
    }
    console.log(`Total without layers: ${configsWithoutLayers.length}`);
    console.log('====================================\n');

    // Report repeated configuration names
    if (repeatedNames.length > 0) {
      console.log('=== Repeated configuration names ===');
      repeatedNames.forEach((cfg) => console.log(`- ${cfg.name} (count: ${cfg.count})`));
      console.log('====================================\n');
    } else {
      console.log('No repeated configuration names found.\n');
    }
  } catch (error) {
    console.error('Error listing configurations without layers:', error.message);
    process.exit(1);
  }
};

listConfigurationsWithoutLayers();
