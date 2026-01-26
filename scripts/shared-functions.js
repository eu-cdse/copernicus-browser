import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';
import axios from 'axios';
import { DEFAULT_THEMES } from '../src/assets/default_themes.js';
import dotenv from 'dotenv';
import { getAuthToken } from './utils/auth.js';

dotenv.config({ path: './.env' });

export const OGC_REQUEST_STATE = {
  ENABLE: 'enable',
  DISABLE: 'disable',
};
const ALL_THEMES = [...DEFAULT_THEMES];
export const SH_SERVICE_BASE_URL = 'https://sh.dataspace.copernicus.eu';

export function getArrayOfInstanceIds(fullPath) {
  let instancesMap = new Map();

  const csvData = fs.readFileSync(fullPath, 'utf-8');

  Papa.parse(csvData, {
    header: true,
    complete: (results) => {
      if (results.meta.fields.length === 1 && results.meta.fields[0] === 'INSTANCE') {
        results.data.forEach((currentData) => {
          // Filter out empty/null/undefined values
          if (currentData.INSTANCE && currentData.INSTANCE.trim()) {
            instancesMap.set(currentData.INSTANCE, currentData.INSTANCE);
          }
        });
        console.log('CSV file successfully processed.');
      } else {
        throw new Error('Use only header name INSTANCE');
      }
    },
    error: (error) => {
      throw new Error(`Error while reading the CSV file: ${error.message}`);
    },
  });

  return Array.from(instancesMap, ([, value]) => value);
}

export async function createHttpClientWithCredentials(authBaseUrl, clientId, clientSecret) {
  const authToken = await getAuthToken(authBaseUrl, clientId, clientSecret);
  return axios.create({
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
}

export async function createHttpClient(authBaseUrl) {
  if (!process.env.APP_ADMIN_CLIENT_ID || !process.env.APP_ADMIN_CLIENT_SECRET) {
    throw new Error('Env vars APP_ADMIN_CLIENT_ID and APP_ADMIN_CLIENT_SECRET are not set');
  }

  const clientId = process.env.APP_ADMIN_CLIENT_ID;
  const clientSecret = process.env.APP_ADMIN_CLIENT_SECRET;
  const authToken = await getAuthToken(authBaseUrl, clientId, clientSecret);

  return axios.create({
    headers: {
      Authorization: `Bearer ${authToken}`,
    },
  });
}

export async function fetchInstances(client, scriptParameters) {
  // If specific instance IDs are provided, fetch them individually
  if (scriptParameters && scriptParameters.length > 0) {
    const instances = [];
    for (const instanceId of scriptParameters) {
      try {
        const response = await client.get(
          `${SH_SERVICE_BASE_URL}/api/v2/configuration/instances/${instanceId}`,
        );
        instances.push(response.data);
      } catch (error) {
        console.warn(`Failed to fetch instance ${instanceId}: ${error.message}`);
      }
    }
    return instances;
  } else {
    // Fetch all instances (requires admin permissions)
    const response = await client.get(`${SH_SERVICE_BASE_URL}/api/v2/configuration/instances`);
    return response.data;
  }
}

export async function fetchInstancesById(client) {
  const response = await client.get(`${SH_SERVICE_BASE_URL}/api/v2/configuration/instances`);
  return response.data
    .map((instance) => instance.id)
    .filter((instanceId) =>
      ALL_THEMES.some((t) => t.content.find((themes) => themes.url.indexOf(instanceId) > -1)),
    );
}

async function changeOgcRequestsState(client, instances, isOgcRequestsDisable) {
  for (const instance of instances) {
    try {
      const { layers: _layers, ...instanceWithoutLayers } = instance;
      instanceWithoutLayers.additionalData.disabled = isOgcRequestsDisable;
      await client.put(
        `${SH_SERVICE_BASE_URL}/api/v2/configuration/instances/${instanceWithoutLayers.id}`,
        instanceWithoutLayers,
      );
    } catch (error) {
      throw new Error(`Failed to update instance ${instance.id}: ${error.message}`);
    }
  }
}

export function getCsvFullPath(scriptParameter) {
  if (scriptParameter.length === 0) {
    return null;
  }

  if (scriptParameter.length === 1 && scriptParameter[0].endsWith('.csv')) {
    const fullPath = path.resolve(scriptParameter[0]);
    if (!fs.existsSync(fullPath)) {
      throw new Error(`File not found: ${fullPath}`);
    } else {
      return fullPath;
    }
  } else {
    throw new Error('Please provide a valid .csv file path.');
  }
}

export async function setOgcRequestsStates(csvFullPath, newState, client = null) {
  const instanceIds = csvFullPath ? getArrayOfInstanceIds(csvFullPath) : [];

  const isOgcRequestsDisabled = newState === OGC_REQUEST_STATE.DISABLE;

  const authBaseUrl = process.env.APP_ADMIN_AUTH_BASEURL;
  if (!authBaseUrl) {
    throw new Error('APP_ADMIN_AUTH_BASEURL is not set');
  }

  if (!client) {
    client = await createHttpClient(authBaseUrl);
  }

  const instances = await fetchInstances(client, instanceIds);

  await changeOgcRequestsState(client, instances, isOgcRequestsDisabled);

  return null;
}

// Root directory for cache files
const rootDir = './src/assets/cache/';

export function printOut(title, value) {
  console.log(`\n${'='.repeat(10)}\n${title}`, JSON.stringify(value, null, 4));
}

export async function getConfigurationLayers(client, instanceId) {
  const { data } = await client.get(
    `${SH_SERVICE_BASE_URL}/api/v2/configuration/instances/${instanceId}/layers`,
  );

  if (data && data.length) {
    data.sort((a, b) => a.id.localeCompare(b.id));
  }

  return data;
}

export async function getCapabilities(client, instanceId) {
  const { data } = await client.get(
    `${SH_SERVICE_BASE_URL}/ogc/wms/${instanceId}?request=GetCapabilities&format=application%2Fjson&endpoint_filter=false`,
  );

  if (data && data.layers && data.layers.length) {
    data.layers.sort((a, b) => a.id.localeCompare(b.id));
  }

  return data;
}

export function save(projectSubDir, instanceId, backup) {
  const dir = `${rootDir}${projectSubDir}`;
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const outputFileName = `${dir}/${instanceId}.json`;
  fs.writeFileSync(outputFileName, JSON.stringify(backup, null, 4));
}

export const cacheType = {
  configuration: 'configuration',
  capabilities: 'capabilities',
};

export function removeExisting(instances) {
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
  [...ALL_THEMES].forEach((t) =>
    knownInstances.push(...t.content.map((theme) => theme.url.split('/').pop())),
  );
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
