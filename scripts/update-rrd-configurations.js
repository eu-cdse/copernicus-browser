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

async function updateRrdConfigurations() {
  if (RRD_THEMES !== undefined && RRD_THEMES[0].content !== undefined) {
    const oldInstances = RRD_THEMES[0].content.map((theme) =>
      theme.url.replace('https://sh.dataspace.copernicus.eu/ogc/wms/'),
    );
    removeExisting(oldInstances);
  }

  const token = await getAuthToken(tokenEndpointUrl, clientId, clientSecret);
  const httpClient = await createHttpClient(token);
  const instances = await fetchInstances(httpClient);
  const instanceIds = instances.map((instance) => instance.id);

  createRrdThemesFile(instances);

  for (let instanceId of instanceIds) {
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
}

updateRrdConfigurations()
  .then(() => {
    console.log('Done.');
  })
  .catch((ex) => {
    console.error(ex);
  })
  .finally(() => {
    process.exit(0);
  });
