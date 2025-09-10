const axios = require('axios');
const dotenv = require('dotenv');
const { getAuthToken } = require('../utils/auth');
const { fetchCollections, fetchData, fetchLayersFromConfiguration } = require('../utils/byoc-api');

dotenv.config();

// Determine the environment (training or production) based on the command-line argument
const environment = process.argv[2] || 'training';
const isTraining = environment === 'training';
console.log(`Running in ${isTraining ? 'training' : 'production'} mode.\n`);

const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const collectionsEndpoint = process.env.RRD_COLLECTION_BASE_URL;
const configurationsEndpoint = process.env.RRD_CONFIGURATION_BASEURL;

const RRD_COLLECTION_CLIENT_ID = process.env.RRD_COLLECTION_CLIENT_ID;
const RRD_COLLECTION_CLIENT_SECRET = process.env.RRD_COLLECTION_CLIENT_SECRET;

const RRD_CLIENT_ID = isTraining ? process.env.RRD_TRAINING_CLIENT_ID : process.env.RRD_PRODUCTION_CLIENT_ID;
const RRD_CLIENT_SECRET = isTraining
  ? process.env.RRD_TRAINING_CLIENT_SECRET
  : process.env.RRD_PRODUCTION_CLIENT_SECRET;
const DOMAIN_ACCOUNT_ID = isTraining
  ? process.env.RRD_TRAINING_DOMAIN_ACCOUNT_ID
  : process.env.RRD_PRODUCTION_DOMAIN_ACCOUNT_ID;

// Map collection names to their new IDs
const mapCollectionNamesToIds = (collections) =>
  collections.reduce((mapping, collection) => {
    mapping[collection.name.toUpperCase()] = collection.id;
    return mapping;
  }, {});

// Remove unnecessary fields data before adding a layer to a configuration
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

// Add a layer to a configuration
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

// Create a configuration and add layers
const createConfiguration = async (
  configuration,
  trainingToken,
  stagingToken,
  destinationCollectionMapping,
  stagingCollections,
) => {
  try {
    const { id, created, lastUpdated, ...cleanedConfigData } = configuration;

    const payload = {
      ...cleanedConfigData,
      domainAccountId: DOMAIN_ACCOUNT_ID,
    };

    const response = await axios.post(configurationsEndpoint, payload, {
      headers: { Authorization: `Bearer ${trainingToken}`, 'Content-Type': 'application/json' },
    });

    const createdConfig = response.data;
    console.log(`Configuration created successfully: ${createdConfig.name} (ID: ${createdConfig.id})`);

    const stagingLayers = await fetchLayersFromConfiguration(
      configuration.id,
      stagingToken,
      configurationsEndpoint,
    );

    for (const layer of stagingLayers) {
      try {
        const stagingCollectionId = layer.datasourceDefaults.collectionId;

        // Find the layer collection in staging
        const stagingCollection = stagingCollections.find(
          (collection) => collection.id === stagingCollectionId,
        );

        if (!stagingCollection) {
          console.warn(
            `Staging collection with ID ${stagingCollectionId} not found. Skipping layer ${
              layer.title || layer.id
            }.`,
          );
          continue;
        }

        // Use the collection name to find the corresponding destination collection ID
        const destinationCollectionId = destinationCollectionMapping[stagingCollection.name.toUpperCase()];

        if (!destinationCollectionId) {
          console.warn(
            `No matching collection ID found in training for staging collection name: ${stagingCollection.name}. ` +
              `Skipping layer ${layer.title || layer.id}.`,
          );
          continue;
        }

        const layerData = {
          ...cleanLayerData(layer, createdConfig.id),
          datasourceDefaults: {
            ...layer.datasourceDefaults,
            collectionId: destinationCollectionId,
          },
        };

        await addLayerToCollection(createdConfig.id, layerData, trainingToken);
      } catch (error) {
        console.error(
          `Failed to add layer ${layer.title || layer.id} to configuration ${createdConfig.name}:`,
          error.response?.data || error.message,
        );
      }
    }

    return createdConfig;
  } catch (error) {
    console.error(`Error creating configuration ${configuration.name}:`, error.message);
    throw error;
  }
};

// Main method to retrieve and process data
const retrieveAndProcessData = async () => {
  try {
    const stagingToken = await getAuthToken(
      tokenEndpointUrl,
      RRD_COLLECTION_CLIENT_ID,
      RRD_COLLECTION_CLIENT_SECRET,
    );
    const trainingToken = await getAuthToken(tokenEndpointUrl, RRD_CLIENT_ID, RRD_CLIENT_SECRET);

    const stagingCollections = await fetchCollections(collectionsEndpoint, stagingToken);
    console.log('Staging collections:', stagingCollections.length, 'items retrieved.');

    const trainingCollections = await fetchCollections(collectionsEndpoint, trainingToken);
    const destinationCollectionMapping = mapCollectionNamesToIds(trainingCollections);
    console.log('Destination collections:', trainingCollections.length, 'items retrieved.');

    // Find missing collections
    const stagingNames = stagingCollections.map((c) => c.name);
    const trainingNames = trainingCollections.map((c) => c.name);
    const missingCollections = stagingNames.filter((name) => !trainingNames.includes(name));

    const stagingConfigurations = await fetchData(configurationsEndpoint, stagingToken);
    console.log('Configurations from staging:', stagingConfigurations.length, 'items retrieved.');

    const trainingConfigurations = await fetchData(configurationsEndpoint, trainingToken);
    console.log('Configurations from training:', trainingConfigurations.length, 'items retrieved.');

    console.log(`Processing ${stagingConfigurations.length} configurations.`);

    const insertedConfigurations = [];
    const skippedDueToMissingCollection = [];

    for (const stagingConfiguration of stagingConfigurations) {
      const existingConfig = trainingConfigurations.find(
        (configuration) => configuration.name === stagingConfiguration.name,
      );

      if (existingConfig) {
        continue;
      }

      const stagingLayers = await fetchLayersFromConfiguration(
        stagingConfiguration.id,
        stagingToken,
        configurationsEndpoint,
      );

      // Check if layer collection exist
      const firstLayer = stagingLayers[0];
      let collectionExist = true;

      if (firstLayer) {
        const stagingCollectionId = firstLayer.datasourceDefaults.collectionId;
        const stagingCollection = stagingCollections.find(
          (collection) => collection.id === stagingCollectionId,
        );
        if (!stagingCollection) {
          collectionExist = false;
          skippedDueToMissingCollection.push(
            `Missing staging collection for layer ${firstLayer.name} (collectionId: ${stagingCollectionId})`,
          );
        } else {
          const destinationCollectionId = destinationCollectionMapping[stagingCollection.name.toUpperCase()];
          if (!destinationCollectionId) {
            collectionExist = false;
            skippedDueToMissingCollection.push(
              `Missing destination collection for layer ${firstLayer.name} (collectionName: ${stagingCollection.name})`,
            );
          }
        }
      } else {
        collectionExist = false;
        skippedDueToMissingCollection.push('No layers found in configuration.');
      }

      if (!collectionExist) {
        continue;
      }

      const newConfig = await createConfiguration(
        stagingConfiguration,
        trainingToken,
        stagingToken,
        destinationCollectionMapping,
        stagingCollections,
      );
      insertedConfigurations.push(newConfig.name);
    }

    console.log(`Missing collections in training: ${missingCollections.length}`);
    console.log(`Configurations created: ${insertedConfigurations.length}`);
    console.log(
      `Configurations skipped due to missing collection in layer: ${skippedDueToMissingCollection.length}`,
    );
    if (skippedDueToMissingCollection.length > 0) {
      skippedDueToMissingCollection.forEach((msg) => console.log('  -', msg));
    }
  } catch (error) {
    console.error('Failed to retrieve and process data:', error.message);
    process.exit(1);
  }

  console.log('All configurations processed successfully.');
};

retrieveAndProcessData();
