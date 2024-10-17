import { DEFAULT_THEMES } from '../src/assets/default_themes';
import fs from 'fs';
import {
  createHttpClient,
  fetchInstancesById,
  getArrayOfInstanceIds,
  getCsvFullPath,
  OGC_REQUEST_STATE,
  setOgcRequestsStates,
  SH_SERVICE_BASE_URL,
} from './shared-functions';
import { exit } from 'process';

const rootDir = './src/assets/cache/';

const scriptParameters = process.argv.slice(2);

function printOut(title, value) {
  console.log(`\n${'='.repeat(10)}\n${title}`, JSON.stringify(value, null, 4));
}

async function getConfigurationLayers(client, instanceId) {
  const { data } = await client.get(
    `${SH_SERVICE_BASE_URL}/api/v2/configuration/instances/${instanceId}/layers`,
  );

  if (data && data.length) {
    data.sort((a, b) => a.id.localeCompare(b.id));
  }

  return data;
}

async function getCapabilities(client, instanceId) {
  const { data } = await client.get(
    `${SH_SERVICE_BASE_URL}/ogc/wms/${instanceId}?request=GetCapabilities&format=application%2Fjson`,
  );

  if (data && data.layers && data.layers.length) {
    data.layers.sort((a, b) => a.id.localeCompare(b.id));
  }

  return data;
}

function save(projectSubDir, instanceId, backup) {
  const dir = `${rootDir}${projectSubDir}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const outputFileName = `${dir}/${instanceId}.json`;
  fs.writeFileSync(outputFileName, JSON.stringify(backup, null, 4));
}

const cacheType = {
  configuration: 'configuration',
  capabilities: 'capabilities',
};

function removeExisting(instances) {
  //delete old files for list of instances
  instances.forEach((instanceId) => {
    Object.keys(cacheType).forEach((key) => {
      if (fs.existsSync(`${rootDir}${cacheType[key]}/${instanceId}.json`)) {
        fs.unlinkSync(`${rootDir}${cacheType[key]}/${instanceId}.json`);
      }
    });
  });

  // list of all instances in default theme
  const knownInstances = [];
  DEFAULT_THEMES.forEach((t) => knownInstances.push(...t.content.map((theme) => theme.url.split('/').pop())));
  //remove unused files from cache
  Object.keys(cacheType).forEach((key) => {
    const dir = `${rootDir}${cacheType[key]}`;
    if (fs.existsSync(dir)) {
      fs.readdirSync(dir).forEach((file) => {
        if (!knownInstances.some((instance) => new RegExp(instance).test(file))) {
          fs.unlinkSync(`${dir}/${file}`);
        }
      });
    }
  });
}

async function run(scriptParameters) {
  const authBaseUrl = process.env.APP_ADMIN_AUTH_BASEURL;
  if (!authBaseUrl) {
    throw new Error('APP_ADMIN_AUTH_BASEURL is not set');
  }

  const csvFullPath = getCsvFullPath(scriptParameters);

  let instances = csvFullPath ? getArrayOfInstanceIds(csvFullPath) : [];

  const httpClient = await createHttpClient(authBaseUrl);

  if (instances.length === 0) {
    //fetch instances from admin account
    instances = await fetchInstancesById(httpClient);
  }

  await setOgcRequestsStates(csvFullPath, OGC_REQUEST_STATE.ENABLE, httpClient);

  // remove existing cache
  removeExisting(instances);
  for (let instanceId of instances) {
    printOut('Instance', instanceId);
    try {
      //save response from configuration/layers endpoint
      const configurationLayers = await getConfigurationLayers(httpClient, instanceId);
      save(cacheType.configuration, instanceId, configurationLayers);
    } catch (err) {
      console.error('Saving response for configuration endpoint', instanceId, err);
    }
    try {
      //save response from getCapabilities
      const capabilities = await getCapabilities(httpClient, instanceId);
      save(cacheType.capabilities, instanceId, capabilities);
    } catch (err) {
      console.error('Saving response for getCapabilities ', instanceId, err);
    }
  }

  await setOgcRequestsStates(csvFullPath, OGC_REQUEST_STATE.DISABLE, httpClient);
}

if (scriptParameters.length > 1) {
  console.error('Incorrect number of parameters have been added.');
  exit(1);
}

// examples
// node -r esm scripts/update-metadata-cache
// node -r esm scripts/update-metadata-cache data.csv
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
