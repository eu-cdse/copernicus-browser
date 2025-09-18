/**
 * This is a deprecated (backup) script for updating metadata cache for default configurations.
 * It has been replaced by scripts/update-metadata-cache-bundle.js which
 * generates a single bundle file instead of multiple files.
 */

import {
  createHttpClient,
  fetchInstancesById,
  getArrayOfInstanceIds,
  getCsvFullPath,
  OGC_REQUEST_STATE,
  setOgcRequestsStates,
  cacheType,
  getCapabilities,
  getConfigurationLayers,
  printOut,
  removeExisting,
  save,
} from './shared-functions';
import { exit } from 'process';

const scriptParameters = process.argv.slice(2);

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
