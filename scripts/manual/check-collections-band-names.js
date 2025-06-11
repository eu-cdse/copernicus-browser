const { getAuthToken } = require('../utils/auth');
const { fetchCollections, fetchCollectionData } = require('../utils/byoc-api');
require('dotenv').config();

const tokenEndpointUrl = process.env.APP_ADMIN_AUTH_BASEURL;
const apiEndpoint = process.env.RRD_COLLECTION_BASE_URL;
const clientId = process.env.RRD_COLLECTION_CLIENT_ID;
const clientSecret = process.env.RRD_COLLECTION_CLIENT_SECRET;

const validBandNames = new Set([
  'nir',
  'red',
  'blue',
  'green',
  'pan',
  'VV',
  'HH',
  'HV',
  'VH',
  'nir08',
  'nir09',
  'yellow',
  'coastal',
  'rededge',
  'CH4',
  'VV_Phase',
  'VV_Amplitude',
  'HH_VV',
  'HH_HV',
  'Red',
  'Blue',
  'Green',
  'green05',
]);

async function main() {
  console.log('Validating band names...');
  const token = await getAuthToken(tokenEndpointUrl, clientId, clientSecret);
  const collections = await fetchCollections(apiEndpoint, token);

  let hasErrors = false;

  for (const collection of collections) {
    if (collection.id && collection.name) {
      const collectionData = await fetchCollectionData(collection.id, token);
      if (
        collectionData &&
        collectionData.data &&
        collectionData.data.additionalData &&
        collectionData.data.additionalData.bands
      ) {
        const bands = Object.keys(collectionData.data.additionalData.bands);
        const invalidBands = bands.filter((band) => !validBandNames.has(band));
        if (invalidBands.length > 0) {
          hasErrors = true;
          console.log(`Collection: ${collection.name}`);
          console.log(`  Invalid Bands: ${invalidBands.join(', ')}`);
        }
      }
    }
  }

  if (!hasErrors) {
    console.log('All band names are valid.');
  }
}

main();
