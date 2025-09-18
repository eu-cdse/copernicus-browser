/**
 * This is a deprecated (backup) script for updating metadata cache for RRD configurations.
 * It has been replaced by scripts/update-rrd-metadata-cache-bundle.js which
 * generates a single bundle file instead of multiple files.
 */

import path from 'path';
import fs from 'fs';
import axios from 'axios';
import dotenv from 'dotenv';
import {
  cacheType,
  getCapabilities,
  getConfigurationLayers,
  printOut,
  removeExisting,
  save,
} from './shared-functions';
import { RRD_THEMES } from '../src/assets/cache/rrdThemes';
import { getAuthToken } from './utils/auth';

dotenv.config();

const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const clientId = process.env.RRD_COLLECTION_CLIENT_ID;
const clientSecret = process.env.RRD_COLLECTION_CLIENT_SECRET;

const rrdThemesFilePath = path.join(__dirname, '../src/assets/cache/rrdThemes.js');

const RETRY_COUNT = 2;
const RETRY_DELAY = 500;

async function fetchInstances(client) {
  try {
    const response = await client.get('https://sh.dataspace.copernicus.eu/api/v2/configuration/instances');
    if (response.data && Array.isArray(response.data)) {
      console.log('Instances fetched successfully.');
      return response.data;
    } else {
      throw new Error('Invalid response structure: Expected a "data" object with an array.');
    }
  } catch (error) {
    console.error('Error fetching Instances:', error.message);
    throw error;
  }
}

async function createHttpClient(token) {
  return axios.create({
    headers: {
      Authorization: `Bearer ${token}`,
    },
  });
}

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

async function getCapabilitiesWithRetry(httpClient, instanceId) {
  for (let attempt = 1; attempt <= RETRY_COUNT; attempt++) {
    return await getCapabilities(httpClient, instanceId);
  }
}

async function updateRrdConfigurations() {
  if (RRD_THEMES !== undefined && RRD_THEMES[0].content !== undefined) {
    const oldInstances = RRD_THEMES[0].content.map((theme) =>
      theme.url.replace('https://sh.dataspace.copernicus.eu/ogc/wms/'),
    );
    removeExisting(oldInstances);
  }

  let token = await getAuthToken(tokenEndpointUrl, clientId, clientSecret);
  let httpClient = await createHttpClient(token);
  const instances = await fetchInstances(httpClient);
  const instanceIds = instances.map((instance) => instance.id);

  createRrdThemesFile(instances);

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
        save(cacheType.configuration, instanceId, configurationLayers);

        const capabilities = await getCapabilitiesWithRetry(httpClient, instanceId);
        save(cacheType.capabilities, instanceId, capabilities);

        success = true;
        successfulInstances++;
      } catch (err) {
        console.error(`Error processing instance ${instanceId} on attempt ${attempt}:`, err.message);
        if (err.response && err.response.status === 401) {
          console.log('Token expired. Fetching a new token...');
          token = await getAuthToken(tokenEndpointUrl, clientId, clientSecret);
          httpClient = await createHttpClient(token);
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
  console.log(
    `Summary: Successfully processed ${successfulInstances} out of ${instanceIds.length} instances.`,
  );
}

updateRrdConfigurations()
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
