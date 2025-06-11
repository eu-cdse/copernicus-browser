const axios = require('axios');
const dotenv = require('dotenv');
const { getAuthToken } = require('../utils/auth');

dotenv.config();

const configurationsEndpoint = process.env.RRD_CONFIGURATION_BASEURL;
const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const collectionsEndpoint = process.env.RRD_COLLECTION_BASE_URL;
const clientId = process.env.RRD_COLLECTION_CLIENT_ID;
const clientSecret = process.env.RRD_COLLECTION_CLIENT_SECRET;

const fetchAllData = async (endpoint, token) => {
  let allData = [];
  let nextPageUrl = `${endpoint}?count=100`;

  while (nextPageUrl) {
    const response = await axios.get(nextPageUrl, {
      headers: { Authorization: `Bearer ${token}` },
    });
    const { data, links } = response.data;
    allData = allData.concat(data);
    nextPageUrl = links && links.next ? links.next : null;
  }
  return allData;
};

const fetchCollections = async (token) => {
  try {
    const byocs = await fetchAllData(collectionsEndpoint, token);

    if (Array.isArray(byocs)) {
      console.log('Collections fetched successfully.');
      return byocs;
    } else {
      throw new Error('Invalid response structure: Expected a "data" object with an array.');
    }
  } catch (error) {
    console.error('Error fetching collections:', error.message);
    throw error;
  }
};

const fetchData = async (endpoint, token) => {
  try {
    const response = await axios.get(endpoint, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });
    return response.data;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error.message);
    throw error;
  }
};

const fetchLayersForInstance = async (instanceId, token) => {
  const layersEndpoint = `${configurationsEndpoint}/${instanceId}/layers`;
  const response = await axios.get(layersEndpoint, {
    headers: { Authorization: `Bearer ${token}` },
  });
  return response.data;
};

const main = async () => {
  try {
    const token = await getAuthToken(tokenEndpointUrl, clientId, clientSecret);

    // 1. Fetch all collections and get their IDs
    const collections = await fetchCollections(token);
    const collectionIds = collections.map((c) => c.id);

    // 2. Get all configurations
    const configurations = await fetchData(configurationsEndpoint, token);
    let invalidReferences = [];

    // 3. For each configuration, check each layer's collectionId
    for (const config of configurations) {
      const layers = await fetchLayersForInstance(config.id, token);
      for (const layer of layers) {
        const collectionId = layer.datasourceDefaults?.collectionId;
        if (collectionId && !collectionIds.includes(collectionId)) {
          invalidReferences.push({
            configName: config.name,
            configId: config.id,
            layerName: layer.name,
            layerId: layer.id,
            missingCollectionId: collectionId,
          });
        }
      }
    }

    // 4. Report
    if (invalidReferences.length > 0) {
      console.log('Configurations referencing missing collections:');
      invalidReferences.forEach((entry) => {
        console.log(
          `Config "${entry.configName}" (ID: ${entry.configId}), Layer "${entry.layerName}" (ID: ${entry.layerId}) references missing collectionId: ${entry.missingCollectionId}`,
        );
      });
      process.exit(2);
    } else {
      console.log('All configurations reference existing collections.');
      process.exit(0);
    }
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

main();
