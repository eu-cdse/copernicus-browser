import {
  fetchInstances,
  getArrayOfInstanceIds,
  getCsvFullPath,
  OGC_REQUEST_STATE,
  setOgcRequestsStates,
  getCapabilities,
  getConfigurationLayers,
  printOut,
  createHttpClientWithCredentials,
} from './shared-functions';
import { exit } from 'process';
import fs from 'fs';
import path from 'path';

const scriptParameters = process.argv.slice(2);

async function run(scriptParameters) {
  const authBaseUrl = process.env.APP_ADMIN_AUTH_BASEURL;
  const clientId = process.env.APP_ADMIN_CLIENT_ID;
  const clientSecret = process.env.APP_ADMIN_CLIENT_SECRET;
  if (!authBaseUrl || !clientId || !clientSecret) {
    throw new Error('APP_ADMIN_AUTH_BASEURL, APP_ADMIN_CLIENT_ID, and APP_ADMIN_CLIENT_SECRET must be set');
  }

  // Use shared getCsvFullPath and getArrayOfInstanceIds for CSV handling
  const csvFullPath = getCsvFullPath(scriptParameters);
  let instances = csvFullPath ? getArrayOfInstanceIds(csvFullPath) : [];
  const httpClient = await createHttpClientWithCredentials(authBaseUrl, clientId, clientSecret);
  if (instances.length === 0) {
    instances = (await fetchInstances(httpClient, [])).map((instance) => instance.id);
  }

  await setOgcRequestsStates(csvFullPath, OGC_REQUEST_STATE.ENABLE, httpClient);

  // Prepare objects to collect all data
  const rootDir = './src/assets/cache/';
  if (!fs.existsSync(rootDir)) {
    fs.mkdirSync(rootDir, { recursive: true });
  }

  const configPath = path.join(rootDir, 'configuration.json');
  const capsPath = path.join(rootDir, 'capabilities.json');

  // Load existing files if CSV is provided, otherwise start fresh
  let allConfigurations = {};
  let allCapabilities = {};
  if (csvFullPath) {
    if (fs.existsSync(configPath)) {
      try {
        allConfigurations = JSON.parse(fs.readFileSync(configPath, 'utf-8'));
      } catch (e) {
        console.warn('Could not parse configuration.json, starting fresh.');
      }
    }
    if (fs.existsSync(capsPath)) {
      try {
        allCapabilities = JSON.parse(fs.readFileSync(capsPath, 'utf-8'));
      } catch (e) {
        console.warn('Could not parse capabilities.json, starting fresh.');
      }
    }
  } else {
    allConfigurations = {};
    allCapabilities = {};
  }

  for (let instanceId of instances) {
    printOut('Instance', instanceId);
    try {
      // Fetch configuration/layers
      const configurationLayers = await getConfigurationLayers(httpClient, instanceId);
      allConfigurations[instanceId] = configurationLayers;
    } catch (err) {
      console.error('Fetching configuration endpoint', instanceId, err);
    }
    try {
      // Fetch getCapabilities
      const capabilities = await getCapabilities(httpClient, instanceId);
      allCapabilities[instanceId] = capabilities;
    } catch (err) {
      console.error('Fetching getCapabilities', instanceId, err);
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

  await setOgcRequestsStates(csvFullPath, OGC_REQUEST_STATE.DISABLE, httpClient);
}

if (scriptParameters.length > 1) {
  console.error('Incorrect number of parameters have been added.');
  exit(1);
}

// examples
// node -r esm scripts/update-metadata-cache-v2
// node -r esm scripts/update-metadata-cache-v2 data.csv
run(scriptParameters)
  .then(() => {
    console.log('Done.');
  })
  .catch((ex) => {
    console.error(ex);
  })
  .finally(() => {
    process.exit(0);
  });
