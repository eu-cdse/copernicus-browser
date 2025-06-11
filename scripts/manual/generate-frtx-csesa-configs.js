const axios = require('axios');
const dotenv = require('dotenv');
const { getAuthToken } = require('../utils/auth');

dotenv.config();

const configurationsEndpoint = process.env.RRD_CONFIGURATION_BASEURL;
const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const collectionsEndpoint = process.env.RRD_COLLECTION_BASE_URL;
const clientId = process.env.RRD_COLLECTION_CLIENT_ID;
const clientSecret = process.env.RRD_COLLECTION_CLIENT_SECRET;

const parentConfigMapping = {
  PRISM_FRTX_GIS_PM4_OR_MS: 'PRISM_GENERAL_WV1_PM4_OR_MS',
  PRISM_FRTX_GIS_PM4_OR_PAN: 'PRISM_GENERAL_WV3_PM4_OR_PAN',
  PRISM_FRTX_PHR_BUN__3_PAN: 'PRISM_GENERAL_PHR_BUN_1A_PAN',
  PRISM_FRTX_WV6_PAN_OR: 'PRISM_GENERAL_WV3_PM4_OR_PAN',
  CSESA_Worldview_8MS: 'GENERAL_WORLDVIEW_4MS',
  PRISM_FRTX_WV6_PAN_SO: 'PRISM_GENERAL_WV3_PM4_SO_PAN',
  CSESA_GEOSAT_PS3: 'GENERAL_GEOSAT_PSH',
  PRISM_FRTX_PHR_BUN__3_MS: 'PRISM_GENERAL_PHR_BUN_1A_MS',
  CSESA_SKYSAT_MS_4: 'PRISM_GENERAL_SKY_CPS_3P',
  PRISM_FRTX_WV3_PSH_SO: 'PRISM_FRTX_WV3_PSH_OR',
  CSESA_WV1_PSH_OR: 'PRISM_GENERAL_WV1_PSH_OR',
};

const ignoreMapping = ['CSESA', 'FRTX', 'CSESA_GHGSAT_CH4'];

// Helper to remove FRTX or CSESA from name
function updateName(name) {
  return name.replace(/FRTX_|CSESA_/g, 'GENERAL_').replace(/PRISM_FRTX_|PRISM_CSESA_/g, 'PRISM_');
}

const fetchAllData = async (endpoint, token) => {
  try {
    let allData = [];
    let nextPageUrl = `${endpoint}?count=100`;

    while (nextPageUrl) {
      const response = await axios.get(nextPageUrl, {
        headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
      });

      const { data, links } = response.data;

      allData = allData.concat(data);

      nextPageUrl = links && links.next ? links.next : null;
    }

    return allData;
  } catch (error) {
    console.error(`Error fetching data from ${endpoint}:`, error.message);
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

const addLayerToCollection = async (instanceId, layerData, token) => {
  try {
    const url = `${configurationsEndpoint}/${instanceId}/layers`;
    const response = await axios.post(url, layerData, {
      headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'application/json' },
    });

    return response.data;
  } catch (error) {
    console.error(
      `Error adding layer to configuration ${instanceId}:`,
      error.response?.data || error.message,
    );
    throw error;
  }
};

const cleanLayerData = (layer, newInstanceId) => {
  const { lastUpdated, instanceId, ...cleanedLayerData } = layer;
  return {
    ...cleanedLayerData,
    instanceId: newInstanceId,
    datasourceDefaults: {
      ...cleanedLayerData.datasourceDefaults,
      collectionId: newInstanceId,
    },
  };
};

const createConfiguration = async (token, parentConfig, newCollection) => {
  // 1. Prepare new configuration data (remove fields that shouldn't be copied)
  const { id, created, lastUpdated, ...configData } = parentConfig;
  configData.name = newCollection.name;
  // Optionally update the name or other fields here if needed

  // 2. Create the new configuration
  const createResponse = await axios.post(configurationsEndpoint, configData, {
    headers: { Authorization: `Bearer ${token}` },
  });
  const newConfig = createResponse.data;
  console.log(`Created new configuration: ${newConfig.name} (ID: ${newConfig.id})`);

  // 3. Fetch layers from parent configuration
  const layers = await fetchLayersForInstance(parentConfig.id, token);

  // 4. Add each layer to the new configuration with updated collectionId
  for (const layer of layers) {
    const layerData = {
      ...cleanLayerData(layer, newConfig.id),
      datasourceDefaults: {
        ...layer.datasourceDefaults,
        collectionId: newCollection.id,
      },
    };
    await addLayerToCollection(newConfig.id, layerData, token);
  }
  console.log(`Added ${layers.length} layers to configuration ${newConfig.name}`);
};

const main = async () => {
  try {
    const token = await getAuthToken(tokenEndpointUrl, clientId, clientSecret);

    // 1. Get all collections
    const collections = await fetchCollections(token);

    // 2. Filter collections with FRTX or CSESA in name
    const specialCollections = collections.filter((c) => /FRTX|CSESA/.test(c.name));

    // 3. Get all configurations
    const configurations = await fetchData(configurationsEndpoint, token);
    console.log('Configurations from staging:', configurations.length, 'items retrieved.');

    // 4. Find config with same name but without FRTX/CSESA
    let counter = 0;
    let ignoreCount = 0;

    for (const collection of specialCollections) {
      if (ignoreMapping.includes(collection.name)) {
        ignoreCount++;
        continue;
      }
      const baseName = updateName(collection.name);
      let parentConfig = configurations.find((conf) => conf.name.toLowerCase() === baseName.toLowerCase());

      // Check if a config with the target collection name already exists
      const alreadyExists = configurations.some(
        (conf) => conf.name.toLowerCase() === collection.name.toLowerCase(),
      );

      // If a config with the target collection name already exists, skip this collection
      if (alreadyExists) {
        continue;
      }

      if (!parentConfig) {
        const mappedTemplateName = parentConfigMapping[collection.name];
        if (mappedTemplateName) {
          parentConfig = configurations.find(
            (conf) => conf.name.toLowerCase() === mappedTemplateName.toLowerCase(),
          );
          if (parentConfig) {
            console.warn(`Using mapped template "${mappedTemplateName}" for collection "${collection.name}"`);
          }
        }
      }

      if (!parentConfig) {
        console.warn(`--- No parent configuration ${baseName} found for collection ${collection.name}`);
        counter++;
      } else {
        // 5. Create new configuration based on the parent config
        await createConfiguration(token, parentConfig, collection);
      }
    }

    console.log(`Total collections with no parent configuration: ${counter}`);
    console.log(`Total collections ignored: ${ignoreCount}`);
  } catch (error) {
    console.error('Error:', error.message);
    process.exit(1);
  }
};

main();
