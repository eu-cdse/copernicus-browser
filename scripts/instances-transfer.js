import axios from 'axios';
import dotenv from 'dotenv';
import { getAuthTokens } from './instances-transfer.utils.js';

dotenv.config({ path: './.env' });

const platformsMapping = [
  {
    'Sentinel-hub': {
      endpoint: 'https://services.sentinel-hub.com',
      endpointToClone: 'https://sh.dataspace.copernicus.eu',
      httpClient: 'sentinelHubDashboard',
      httpClientToClone: 'copernicusDashboard',
      platformUserInfoRequiredForCopy: {
        uid: process.env.APP_CD_ADMIN_USER_ID,
        aid: process.env.APP_CD_ADMIN_ACCOUNT_ID,
      },
    },
  },
  {
    Copernicus: {
      endpoint: 'https://sh.dataspace.copernicus.eu',
      endpointToClone: 'https://services.sentinel-hub.com',
      httpClient: 'copernicusDashboard',
      httpClientToClone: 'sentinelHubDashboard',
      platformUserInfoRequiredForCopy: {
        uid: process.env.APP_SH_ADMIN_USER_ID,
        aid: process.env.APP_SH_ADMIN_ACCOUNT_ID,
      },
    },
  },
];

const createHttpClients = async (access_tokens) => {
  const [sentinelHubDashboard, copernicusDashboard] = await Promise.all(
    access_tokens.map((access_token) =>
      axios.create({
        headers: {
          Authorization: `Bearer ${access_token}`,
        },
      }),
    ),
  );

  return { sentinelHubDashboard, copernicusDashboard };
};

const fetchInstance = async (clients, platformsMapping, platform, ids) => {
  return Promise.all(
    platformsMapping.map(async (map) => {
      if (map[platform]) {
        const { endpoint, endpointToClone, httpClient, httpClientToClone } = map[platform];
        const { uid, aid } = map[platform].platformUserInfoRequiredForCopy;

        return Promise.all(
          ids.map(async (id) => {
            try {
              const response = await clients[httpClient].get(
                `${endpoint}/api/v2/configuration/instances/${id}`,
              );

              const {
                userId,
                domainAccountId,
                '@id': scrubbedId,
                layers,
                created,
                lastUpdated,
                ...rest
              } = response.data;

              return {
                platform: platform,
                endpoint: endpointToClone,
                httpClient: httpClient,
                httpClientToClone: httpClientToClone,
                instance: {
                  userId: uid,
                  domainAccountId: aid,
                  layers: await getLayersConfiguration(clients, endpoint, httpClient, rest),
                  ...rest,
                },
              };
            } catch (error) {
              console.error(error);
              return [];
            }
          }),
        );
      }
    }),
  ).then((refinedInstances) => refinedInstances.flat().filter((val) => val !== undefined));
};

const getLayersConfiguration = async (clients, endpoint, httpClient, instance) => {
  try {
    const { id } = instance;
    const response = await clients[httpClient].get(`${endpoint}/api/v2/configuration/instances/${id}/layers`);

    return Promise.all(
      response.data.map(async (d) => {
        const { '@id': scrubbedId, instance, lastUpdated, orderHint, datasetSource, ...rest } = d;
        const { data } = await clients[httpClient].get(datasetSource['@id']);

        return {
          instanceId: id,
          datasetSource: data,
          ...rest,
        };
      }),
    ).then((refinedLayers) => refinedLayers.flat());
  } catch (error) {
    console.error(error);
    return [];
  }
};

async function cloneInstances(clients, instancesConfiguration) {
  if (instancesConfiguration) {
    return Promise.all(
      instancesConfiguration.map(async (instanceConfiguration) => {
        const { endpoint, httpClientToClone, instance } = instanceConfiguration;
        const { layers, ...rest } = instance;

        try {
          const response = await clients[httpClientToClone].post(
            `${endpoint}/api/v2/configuration/instances`,
            rest,
          );

          console.log('Instances were cloned successfully:', response.status);
          return {
            endpoint: endpoint,
            httpClientToClone: httpClientToClone,
            layers: layers,
          };
        } catch (error) {
          console.error(error);
          return [];
        }
      }),
    );
  }
}

const cloneLayersConfiguration = (httpClients, clonedInstancesConfiguration) => {
  clonedInstancesConfiguration.map(async (c) => {
    const { endpoint, httpClientToClone, layers } = c;

    layers.forEach(async (layer) => {
      const { instanceId } = layer;

      try {
        const response = await httpClients[httpClientToClone].post(
          `${endpoint}/api/v2/configuration/instances/${instanceId}/layers`,
          layer,
        );

        console.log('Layers were cloned successfully:', response.status);
      } catch (error) {
        console.error(error);
        return [];
      }
    });
  });
};

const run = async () => {
  // Read terminal command
  const platform = process.argv[2];
  const instanceIds = process.argv[3].split(', ');

  // Copy instances and layers logic
  const access_tokens = await getAuthTokens();
  const httpClients = await createHttpClients(access_tokens);
  const instancesConfiguration = await fetchInstance(httpClients, platformsMapping, platform, instanceIds);
  const clonedInstancesConfiguration = await cloneInstances(httpClients, instancesConfiguration);
  cloneLayersConfiguration(httpClients, clonedInstancesConfiguration);
};

run();
