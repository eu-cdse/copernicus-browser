import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';
import {
  getArrayOfInstanceIds,
  getCsvFullPath,
  fetchInstances,
  getCapabilities,
  getConfigurationLayers,
  printOut,
  removeExisting,
  createHttpClientWithCredentials,
} from './shared-functions';

dotenv.config();

const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const clientId = process.env.RRD_COLLECTION_CLIENT_ID;
const clientSecret = process.env.RRD_COLLECTION_CLIENT_SECRET;

const rrdThemesFilePath = path.join(__dirname, '../src/assets/cache/rrdThemes.js');
const rootDir = path.join(__dirname, '../src/assets/cache/');
const configPath = path.join(rootDir, 'rrd_configuration.json');
const capsPath = path.join(rootDir, 'rrd_capabilities.json');

const RETRY_COUNT = 2;
const RETRY_DELAY = 500;

function createRrdThemesFile(items) {
  const themes_content = `export const RRD_THEMES = [
  {
    id: 'RRD',
    name: 'RRD',
    content: [${items.map(
      ({ id, name }, index) => `
      {
        name: '${name}',
        service: 'WMS',
        url: 'https://sh.dataspace.copernicus.eu/ogc/wms/${id}',
      }${index === items.length - 1 ? ',' : ''}`,
    )}
    ],
  },
];`;
  fs.writeFileSync(rrdThemesFilePath, themes_content + '\n');
}

function loadExistingCache() {
  let allConfigurations = {};
  let allCapabilities = {};
  if (fs.existsSync(configPath)) {
    try {
      allConfigurations = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse rrd_configuration.json, starting fresh.');
    }
  }
  if (fs.existsSync(capsPath)) {
    try {
      allCapabilities = JSON.parse(fs.readFileSync(capsPath, 'utf-8'));
    } catch (e) {
      console.warn('Could not parse rrd_capabilities.json, starting fresh.');
    }
  }
  return { allConfigurations, allCapabilities };
}

async function getCapabilitiesWithRetry(httpClient, instanceId) {
  for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
    try {
      return await getCapabilities(httpClient, instanceId);
    } catch (err) {
      if (attempt === RETRY_COUNT) {
        throw err;
      }
      await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
    }
  }
}

async function run(csvArg) {
  // Use shared getCsvFullPath and getArrayOfInstanceIds for CSV handling
  let csvInstanceIds = [];
  let csvFullPath = null;
  if (csvArg && csvArg.endsWith('.csv')) {
    csvFullPath = getCsvFullPath([csvArg]);
    csvInstanceIds = getArrayOfInstanceIds(csvFullPath);
  }

  let httpClient = await createHttpClientWithCredentials(tokenEndpointUrl, clientId, clientSecret);
  // Use shared fetchInstances for fetching all instances
  const instances = await fetchInstances(httpClient, []);
  const instanceIds = csvInstanceIds.length > 0 ? csvInstanceIds : instances.map((instance) => instance.id);

  // Remove old cache for these instances using shared removeExisting
  removeExisting(instanceIds);

  // Update RRD themes file
  createRrdThemesFile(instances);

  // Load existing cache if CSV is provided, otherwise start fresh
  let allConfigurations = {};
  let allCapabilities = {};
  if (csvArg && csvArg.endsWith('.csv')) {
    const { allConfigurations: loadedConfig, allCapabilities: loadedCaps } = loadExistingCache();
    allConfigurations = loadedConfig;
    allCapabilities = loadedCaps;
  } else {
    allConfigurations = {};
    allCapabilities = {};
  }

  let successfulInstances = 0;
  console.log(`Saving capabilities and configuration layers for ${instanceIds.length} instances...`);
  for (let instanceId of instanceIds) {
    printOut('Instance', instanceId);
    let success = false;
    let attempt = 0;
    while (!success && attempt < RETRY_COUNT) {
      attempt++;
      try {
        const configurationLayers = await getConfigurationLayers(httpClient, instanceId);
        allConfigurations[instanceId] = configurationLayers;
        const capabilities = await getCapabilitiesWithRetry(httpClient, instanceId);
        allCapabilities[instanceId] = capabilities;
        success = true;
        successfulInstances++;
      } catch (err) {
        console.error(`Error processing instance ${instanceId} on attempt ${attempt}:`, err.message);
        if (err.response && err.response.status === 401) {
          console.log('Token expired. Fetching a new token...');
          httpClient = await createHttpClientWithCredentials(tokenEndpointUrl, clientId, clientSecret);
          continue;
        }
        console.log(`Attempt ${attempt} failed for instance ${instanceId}. Retrying...`, err.message);
        if (attempt === RETRY_COUNT) {
          console.log(`Failed to process instance ${instanceId} after ${RETRY_COUNT} attempts.`);
        }
        await new Promise((resolve) => setTimeout(resolve, RETRY_DELAY));
      }
    }
  }
  // Sort entries alphabetically by instanceId before writing
  const sortedConfigurations = Object.keys(allConfigurations)
    .sort()
    .reduce((acc, key) => {
      acc[key] = allConfigurations[key];
      return acc;
    }, {});
  const sortedCapabilities = Object.keys(allCapabilities)
    .sort()
    .reduce((acc, key) => {
      acc[key] = allCapabilities[key];
      return acc;
    }, {});

  fs.writeFileSync(configPath, JSON.stringify(sortedConfigurations, null, 4));
  fs.writeFileSync(capsPath, JSON.stringify(sortedCapabilities, null, 4));
  console.log(
    `Summary: Successfully processed ${successfulInstances} out of ${instanceIds.length} instances.`,
  );
}

const csvArg = process.argv.slice(2)[0];
run(csvArg)
  .then(() => {
    console.log('Done.');
  })
  .catch((ex) => {
    console.log('An error occurred:', ex);
    process.exit(1);
  })
  .finally(() => {
    console.log('Script execution completed.');
    process.exit(0);
  });
