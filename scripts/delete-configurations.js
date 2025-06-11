const fs = require('fs');
const path = require('path');
const axios = require('axios');
const dotenv = require('dotenv');
const { getAuthToken } = require('./utils/auth');
dotenv.config();

// Determine the environment (training or production) based on the command-line argument
const environment = process.argv[2] || 'training';
const isTraining = environment === 'training';
console.log(`Running in ${isTraining ? 'training' : 'production'} mode.\n`);

const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const collectionsEndpoint = process.env.RRD_CONFIGURATION_BASEURL;
const RRD_CLIENT_ID = isTraining ? process.env.RRD_TRAINING_CLIENT_ID : process.env.RRD_PRODUCTION_CLIENT_ID;
const RRD_CLIENT_SECRET = isTraining
  ? process.env.RRD_TRAINING_CLIENT_SECRET
  : process.env.RRD_PRODUCTION_CLIENT_SECRET;

const insertedConfigurationsFile = path.join(__dirname, './rrd/configurations-to-delete.json');

/**
 * Script: delete-configurations.js
 *
 * Description:
 * This script deletes configurations from the RRD system. It reads a JSON file
 * (`rrd/configurations-to-delete.json`) containing an array of configurations with `id` and `name` fields.
 * Each configuration is deleted by making a DELETE request to the specified endpoint.
 *
 * You can use the response of the following URL to generate the `configurations-to-delete.json` file:
 * https://sh.dataspace.copernicus.eu/api/v2/configuration/instances?domainAccountId=<domainAccountId>
 *
 * **/

// Delete a configuration by ID
const deleteConfiguration = async (id, token) => {
  const url = `${collectionsEndpoint}/${id}`;

  await axios.delete(url, {
    headers: { Authorization: `Bearer ${token}` },
  });
};

// Main method to delete configurations in batches
const deleteInsertedConfigurations = async () => {
  try {
    const token = await getAuthToken(tokenEndpointUrl, RRD_CLIENT_ID, RRD_CLIENT_SECRET);

    if (!fs.existsSync(insertedConfigurationsFile)) {
      console.error(`File ${insertedConfigurationsFile} not found.`);
      return;
    }

    const insertedConfigurations = JSON.parse(fs.readFileSync(insertedConfigurationsFile, 'utf-8'));

    let deletedCount = 0;

    for (const configuration of insertedConfigurations) {
      console.log(`Deleting configuration: ${configuration.name} (ID: ${configuration.id})`);
      try {
        await deleteConfiguration(configuration.id, token);
        deletedCount++;
      } catch (error) {
        console.error(error.message);
      }
    }

    console.log(`Total configurations deleted successfully: ${deletedCount}`);
  } catch (error) {
    console.error('Failed to delete configurations:', error.message);
  }
};

deleteInsertedConfigurations();
