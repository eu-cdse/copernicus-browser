import moment from 'moment';
import {
  BBox,
  LayersFactory,
  CRS_EPSG4326,
  ApiType,
  MimeTypes,
  setAuthToken,
  setDebugEnabled,
  DATASET_S5PL2,
  DATASET_CDAS_S5PL2,
  DATASET_CDAS_S3OLCIL2,
  DATASET_CDAS_S3SYNERGYL2,
} from '@sentinel-hub/sentinelhub-js';
import { exit } from 'process';
import fs from 'fs';
import { DEFAULT_THEMES } from '../src/assets/default_themes.js';
import { filterLayers } from '../src/Tools/SearchPanel/dataSourceHandlers/filter.js';
import { getS5ProductType } from '../src/Tools/SearchPanel/dataSourceHandlers/datasourceAssets/getS5ProductType.js';
import { md5 } from 'js-md5';
import dotenv from 'dotenv';
import { getAuthToken } from './utils/auth.js';
import {
  getArrayOfInstanceIds,
  getCsvFullPath,
  OGC_REQUEST_STATE,
  setOgcRequestsStates,
  createHttpClientWithCredentials,
} from './shared-functions.js';

dotenv.config({ path: './.env' });

const scriptParameters = process.argv.slice(2);

const BBOX_SIZE = 0.03;
const interestingBBoxes = [
  // Central Europe - good coverage for CLMS data
  new BBox(CRS_EPSG4326, 14.4, 50.08, 14.4 + BBOX_SIZE * 8, 50.08 + BBOX_SIZE * 8), // Prague, Czech Republic
  new BBox(CRS_EPSG4326, 11.5, 48.1, 11.5 + BBOX_SIZE * 8, 48.1 + BBOX_SIZE * 8), // Bavaria, Germany
  new BBox(CRS_EPSG4326, 14.5, 46.05, 14.5 + BBOX_SIZE * 8, 46.05 + BBOX_SIZE * 8), // Slovenia/Austria
  new BBox(CRS_EPSG4326, 19.05, 47.5, 19.05 + BBOX_SIZE * 8, 47.5 + BBOX_SIZE * 8), // Hungary
  new BBox(CRS_EPSG4326, 16.37, 48.2, 16.37 + BBOX_SIZE * 8, 48.2 + BBOX_SIZE * 8), // Vienna, Austria

  // legacy interesting boxes for other datasets:
  new BBox(CRS_EPSG4326, -4.24, 57.5, -4.24 + BBOX_SIZE, 57.5 + BBOX_SIZE), // S-1 GRD SM HH+HV
  new BBox(CRS_EPSG4326, 15, 45.95, 15 + BBOX_SIZE, 45.95 + BBOX_SIZE),

  new BBox(CRS_EPSG4326, 39.06, -16.95, 39.1 + BBOX_SIZE, -16.87 + BBOX_SIZE), // S-1 GRD EW VV

  new BBox(CRS_EPSG4326, -69, 66.9, -69 + BBOX_SIZE, 66.9 + BBOX_SIZE), // S-1 GRD EW
  new BBox(CRS_EPSG4326, -62, -58.6, -62 + BBOX_SIZE, -58.6 + BBOX_SIZE), // S-1 GRD EW HH
  new BBox(CRS_EPSG4326, 123, 10.5, 123 + BBOX_SIZE, 10.5 + BBOX_SIZE), // S-1 GRD IW VV
  new BBox(CRS_EPSG4326, 145.75, 18.1, 145.75 + BBOX_SIZE, 18.1 + BBOX_SIZE), // S-1 GRD SM VV/VV+VH
  new BBox(CRS_EPSG4326, -88.75, 41.9, -88.75 + BBOX_SIZE, 41.9 + BBOX_SIZE), // S-1 GRD SM HH
  new BBox(CRS_EPSG4326, 13.7, 46.24, 13.7 + BBOX_SIZE, 46.24 + BBOX_SIZE), // CCM
];
const forceBBoxForDataset = {
  [DATASET_S5PL2.id]: new BBox(CRS_EPSG4326, 4, 47.5, 4.4, 47.9), // CH4
  [DATASET_CDAS_S5PL2.id]: new BBox(CRS_EPSG4326, 4, 47.5, 4.4, 47.9), // CH4
  [DATASET_CDAS_S3OLCIL2.id]: new BBox(CRS_EPSG4326, 22.615356, 59.407355, 24.55719, 60.356847), // WATER layers
  //[DATASET_CDAS_S3SYNERGYL2.id]: new BBox(CRS_EPSG4326, 28.115356, 62.107355, 30.05719, 63.056847),
  [DATASET_CDAS_S3SYNERGYL2.id]: new BBox(CRS_EPSG4326, 19, 44.5, 19 + 1, 44.5 + 1),
};
const globalMinDate = new Date(Date.UTC(1980, 1 - 1, 1));
const now = new Date();
const nowUtc = new Date(Date.UTC(now.getFullYear(), now.getMonth(), now.getDate(), 0, 0, 0));

async function findSomeResults(layer, nResults = 20) {
  const minDateDataset = layer.dataset && layer.dataset.minDate ? layer.dataset.minDate : globalMinDate;
  const maxDate = layer.dataset && layer.dataset.maxDate ? layer.dataset.maxDate : nowUtc;
  const minDate = moment.max(minDateDataset, moment.utc(maxDate).subtract(20, 'year'));
  const results = [];
  const bboxes =
    layer.dataset && forceBBoxForDataset[layer.dataset.id]
      ? [forceBBoxForDataset[layer.dataset.id]]
      : interestingBBoxes;
  for (let bbox of bboxes) {
    try {
      const tiles = await layer.findTiles(bbox, minDate, maxDate, 1, 0);
      if (tiles.tiles.length === 0) {
        // nothing found in this bbox, try next:
        continue;
      }
      for (let i = 0; i < tiles.tiles.length && i < nResults; i++) {
        results.push({
          bbox: bbox,
          fromTime: moment.utc(tiles.tiles[i].sensingTime).startOf('day'),
          toTime: moment.utc(tiles.tiles[i].sensingTime).endOf('day'),
        });
      }
      return results;
    } catch (ex) {
      console.warn(ex);
      const dates = await layer.findDatesUTC(bbox, minDate, maxDate);
      if (dates.length === 0) {
        continue;
      }
      for (let i = 1; i < dates.length && i < nResults; i++) {
        results.push({
          bbox: bbox,
          fromTime: moment.utc(dates[i]),
          toTime: moment.utc(dates[i]).add(1, 'day'),
        });
      }
      return results;
    }
  }
  return [];
}

async function updatePreviews(previewsDir, previewsIndexFile, scriptParameters) {
  const authBaseUrl = process.env.APP_ADMIN_AUTH_BASEURL;
  if (!authBaseUrl) {
    throw new Error('APP_ADMIN_AUTH_BASEURL is not set');
  }
  const csvFullPath = getCsvFullPath(scriptParameters);

  let instances = csvFullPath ? getArrayOfInstanceIds(csvFullPath) : [];

  if (!process.env.APP_ADMIN_CLIENT_ID || !process.env.APP_ADMIN_CLIENT_SECRET) {
    throw new Error('Env vars APP_ADMIN_CLIENT_ID and APP_ADMIN_CLIENT_SECRET are not set');
  }
  const clientId = process.env.APP_ADMIN_CLIENT_ID;
  const clientSecret = process.env.APP_ADMIN_CLIENT_SECRET;
  const httpClient = await createHttpClientWithCredentials(authBaseUrl, clientId, clientSecret);
  const authToken = await getAuthToken(authBaseUrl, clientId, clientSecret);

  setAuthToken(authToken);

  if (!fs.existsSync(previewsDir)) {
    fs.mkdirSync(previewsDir);
  }

  await setOgcRequestsStates(csvFullPath, OGC_REQUEST_STATE.ENABLE, httpClient);

  // Wait for OGC requests to be fully enabled (propagation delay)
  if (csvFullPath) {
    console.log('Waiting 5 seconds for OGC request state to propagate...');
    await new Promise((resolve) => setTimeout(resolve, 5000));
  }

  // fetch new previews:
  let previews = [];

  try {
    if (csvFullPath) {
      previews = JSON.parse(fs.readFileSync(previewsIndexFile, 'utf-8'));
    }
  } catch (error) {
    throw new Error(`Error while reading previews file, ${error}`);
  }

  try {
    for (let themes of [DEFAULT_THEMES]) {
      for (let theme of themes) {
        const themeId = theme.id;
        for (let contentPart of theme.content) {
          if (contentPart.url.includes('api.planet.com')) {
            console.warn('Temporarily skipping Planet layers - missing stitching of');
            continue;
          }

          if (instances.length > 0 && !instances.some((instance) => contentPart.url.includes(instance))) {
            continue;
          }

          let layers = await LayersFactory.makeLayers(contentPart.url, (layerId) =>
            filterLayers(layerId, contentPart.layersExclude, contentPart.layersInclude),
          );

          layers.sort((a, b) => a.layerId.localeCompare(b.layerId));

          if (!layers) {
            console.warn(`No layers for url: ${contentPart.url}`);
            continue;
          }

          const layer = layers[0];

          if (/(S5PL2)/.test(layer.dataset.id)) {
            layer.productType = getS5ProductType(layer.dataset);
          }

          // We need something that will help us save previews for the layers with the same name but from different datasets.
          // Ideally, we can use the first few chars of instanceId, otherwise we need to calculate the hash from the URL:
          const urlHash = layer.instanceId
            ? layer.instanceId.substr(0, 6)
            : md5(contentPart.url).substr(0, 8);

          // We assume that all the layers within the same group will be able to use the same bbox and time from/to:
          let candidates = [];
          try {
            candidates = await findSomeResults(layer);
          } catch (e) {
            console.warn(`Error occured for: ${contentPart.url} (${contentPart.name})`);
          }

          if (candidates.length === 0) {
            console.warn(`No results in the pre-defined areas for: ${contentPart.url} (${contentPart.name})`);
            continue;
          }

          // for each layer, download its image:
          setDebugEnabled(true);
          for (let layer of layers) {
            const fileName = `${themeId}-${urlHash}-${layer.layerId}.png`;
            const fullFileName = `${previewsDir}/${fileName}`;
            console.log(
              `Working on: ${themeId} / ${contentPart.url} / ${layer.layerId} (${layer.constructor.name}) / ${fileName}`,
            );

            if (fs.existsSync(fullFileName)) {
              if (!instances.length) {
                previews.push(fileName);
              }
              console.log('  ...exists, skipping.');
              continue;
            }

            const apiType = layer.supportsApiType(ApiType.PROCESSING) ? ApiType.PROCESSING : ApiType.WMS;
            let j;
            for (j = 0; j < candidates.length; j++) {
              let { bbox, fromTime, toTime } = candidates[j];

              const getMapParams = {
                bbox: bbox,
                fromTime: fromTime,
                toTime: toTime,
                width: 50,
                height: 50,
                format: MimeTypes.PNG,
              };
              try {
                const imageBytes = await layer.getMap(getMapParams, apiType);
                fs.writeFileSync(fullFileName, imageBytes);
                // sometimes even the valid dates return transparent images, let's remove them:
                const fileSizeInBytes = fs.statSync(fullFileName).size;
                if (fileSizeInBytes < 200) {
                  // exceptions which simply produce small images:
                  if (
                    !['TESTING-LAYER', '3-NDVI', 'FALSE_COLOR', 'RED_EDGE_1', 'RED_EDGE_2'].includes(
                      layer.layerId,
                    )
                  ) {
                    fs.unlinkSync(fullFileName);
                    console.log(`  ...image was empty (size ${fileSizeInBytes}), skipping...`);
                    continue;
                  }
                }
                previews.push(fileName);
                console.log('  ...ok.');
                break;
              } catch (err) {
                if (j === candidates.length - 1) {
                  console.log('  ...FAILED!');
                  throw err;
                }
                console.log('  ...failed, retrying with another date...', err);
                continue;
              }
            }
            if (j === candidates.length) {
              console.log('  ...FAILED!');
              console.error('No image found!');
            }
          }
          setDebugEnabled(false);
        }
      }
    }
  } finally {
    // Always write previews.json even if errors occurred, so we save partial progress
    fs.writeFileSync(previewsIndexFile, JSON.stringify(previews, null, 2).concat('\n'));

    // Always disable OGC requests even if errors occurred
    await setOgcRequestsStates(csvFullPath, OGC_REQUEST_STATE.DISABLE, httpClient);
  }
}

if (scriptParameters.length > 1) {
  console.error('Incorrect number of parameters have been added.');
  exit(1);
}

// examples
// node -r esm scripts/update-previews
// node -r esm scripts/update-previews data.csv
updatePreviews('./public/previews', './src/previews.json', scriptParameters)
  .then(() => console.log('DONE.'))
  .catch((err) => {
    console.error(err);
  })
  .finally(() => {
    process.exit(0);
  });
