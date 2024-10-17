import path from 'path';
import fs from 'fs';
import Papa from 'papaparse';
import { getAuthToken } from './update-previews-utils';
import axios from 'axios';
import { DEFAULT_THEMES } from '../src/assets/default_themes';
import dotenv from 'dotenv';

dotenv.config({ path: './.env' });

export const OGC_REQUEST_STATE = {
  ENABLE: 'enable',
  DISABLE: 'disable',
};

export const SH_SERVICE_BASE_URL = 'https://sh.dataspace.copernicus.eu';

export function getArrayOfInstanceIds(fullPath) {
  let instancesMap = new Map();

  const csvData = fs.readFileSync(fullPath, 'utf-8');

  Papa.parse(csvData, {
    header: true,
    complete: (results) => {
      if (results.meta.fields.length === 1 && results.meta.fields[0] === 'INSTANCE') {
        results.data.forEach((currentData) => instancesMap.set(currentData.INSTANCE, currentData.INSTANCE));
        console.log('CSV file successfully processed.');
      } else {
        throw new Error('Use only header name INSTANCE');
      }
    },
    error: (error) => {
      throw new Error(`Error while reading the CSV file: ${error.message}`);
    },
  });

  return Array.from(instancesMap, ([name, value]) => value);
}

export async function createHttpClient(authBaseUrl) {
  const access_token = await getAuthToken(authBaseUrl);

  return axios.create({
    headers: {
      Authorization: `Bearer ${access_token}`,
    },
  });
}

export async function fetchInstances(client, scriptParameters) {
  const response = await client.get(`${SH_SERVICE_BASE_URL}/api/v2/configuration/instances`);
  // Removes enable | disable from script parameters
  if (scriptParameters && scriptParameters.length > 0) {
    return response.data.filter((utility) =>
      scriptParameters.some((instanceName) => instanceName === utility.id),
    );
  } else {
    return response.data;
  }
}

export async function fetchInstancesById(client) {
  const response = await client.get(`${SH_SERVICE_BASE_URL}/api/v2/configuration/instances`);
  return response.data
    .map((instance) => instance.id)
    .filter((instanceId) =>
      DEFAULT_THEMES.some((t) => t.content.find((themes) => themes.url.indexOf(instanceId) > -1)),
    );
}

async function changeOgcRequestsState(client, instances, isOgcRequestsDisable) {
  for (const instance of instances) {
    try {
      const { layers, ...instanceWithoutLayers } = instance;
      instanceWithoutLayers.additionalData.disabled = isOgcRequestsDisable;
      await client.put(
        `${SH_SERVICE_BASE_URL}/api/v2/configuration/instances/${instanceWithoutLayers.id}`,
        instanceWithoutLayers,
      );
    } catch (error) {
      throw error;
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
