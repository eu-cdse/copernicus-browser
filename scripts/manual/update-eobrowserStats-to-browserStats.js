import {
  getArrayOfInstanceIds,
  getCsvFullPath,
  getConfigurationLayers,
  createHttpClientWithCredentials,
  fetchInstancesById,
  updateLayer,
} from '../shared-functions.js';
import { exit } from 'process';
import { createInterface } from 'readline';

const scriptParameters = process.argv.slice(2);

async function run(scriptParameters, dryRun) {
  const authBaseUrl = process.env.APP_ADMIN_AUTH_BASEURL;
  const clientId = process.env.APP_ADMIN_CLIENT_ID;
  const clientSecret = process.env.APP_ADMIN_CLIENT_SECRET;
  if (!authBaseUrl || !clientId || !clientSecret) {
    throw new Error('APP_ADMIN_AUTH_BASEURL, APP_ADMIN_CLIENT_ID, and APP_ADMIN_CLIENT_SECRET must be set');
  }

  // Use shared getCsvFullPath and getArrayOfInstanceIds for CSV handling
  const csvFullPath = getCsvFullPath(scriptParameters);
  let instances = csvFullPath ? getArrayOfInstanceIds(csvFullPath) : [];
  const httpClient = await createHttpClientWithCredentials(authBaseUrl, clientId, clientSecret);
  if (instances.length === 0) {
    instances = await fetchInstancesById(httpClient);
  }

  // Load existing files if CSV is provided, otherwise start fresh
  let allConfigurations = {};

  for (let instanceId of instances) {
    try {
      // Fetch configuration/layers
      const configurationLayers = await getConfigurationLayers(httpClient, instanceId);
      allConfigurations[instanceId] = configurationLayers;
    } catch (err) {
      console.error('Fetching configuration endpoint', instanceId, err);
    }
  }

  let totalInstancesUpdated = 0;
  let totalLayersUpdated = 0;

  // Print layer names for each instance and check for "eobrowserStats" in evalScript, replace with "browserStats" if found and call update API
  try {
    for (let instanceId in allConfigurations) {
      console.log(`\n${'='.repeat(10)}\nInstance ${instanceId}`);
      const layers = allConfigurations[instanceId];
      let instanceLayersUpdated = 0;
      for (const layer of layers) {
        if (!Array.isArray(layer.styles)) {
          continue;
        }
        let wasModified = false;
        for (const style of layer.styles) {
          if (typeof style.evalScript !== 'string') {
            continue;
          }

          const updatedStyle = style.evalScript.replace(/eobrowserStats/g, 'browserStats');

          wasModified = wasModified || updatedStyle !== style.evalScript; // accumulate
          style.evalScript = updatedStyle; // Update the original style object for API update
        }

        if (wasModified) {
          console.log(` Layer ${layer.id} - "eobrowserStats" found and replaced with "browserStats".`);
          instanceLayersUpdated++;
          if (dryRun) {
            console.log(`[dry-run] Would update layer ${layer.id} for instance ${instanceId}.`);
          } else {
            try {
              await updateLayer(httpClient, instanceId, layer);
            } catch (error) {
              console.error(`Failed to update layer ${layer.id} for instance ${instanceId}:`, error);
            }
          }
        }
      }

      if (instanceLayersUpdated > 0) {
        totalInstancesUpdated++;
        totalLayersUpdated += instanceLayersUpdated;
      }
      console.log(
        `Instance ${instanceId}: ${instanceLayersUpdated} layer(s) out of ${layers.length} updated.`,
      );
    }
  } catch (error) {
    console.error('Error processing instances:', error);
  }

  console.log(
    `\nSummary: ${totalInstancesUpdated} instance(s) updated, ${totalLayersUpdated} layer(s) updated.`,
  );
}

const dryRun = scriptParameters.includes('--dry-run');
const filteredParameters = scriptParameters.filter((p) => p !== '--dry-run');

if (filteredParameters.length > 1) {
  console.error('Incorrect number of parameters have been added.');
  exit(1);
}

// Usage:
//   node scripts/manual/update-eobrowserStats-to-browserStats.js
//     Fetches all instances and updates layers in all of them.
//
//   node scripts/manual/update-eobrowserStats-to-browserStats.js data.csv
//     Reads instance IDs from data.csv and updates layers only for those instances.
//
//   node scripts/manual/update-eobrowserStats-to-browserStats.js --dry-run
//   node scripts/manual/update-eobrowserStats-to-browserStats.js data.csv --dry-run
//     Same as above but skips actual API update calls (read-only preview).
function runWithChain(params, dry) {
  run(params, dry)
    .then(() => {
      console.log('Done.');
      process.exit(0);
    })
    .catch((ex) => {
      console.error(ex);
      process.exit(1);
    });
}

if (dryRun) {
  console.log('[dry-run] No API calls will be made.');
  runWithChain(filteredParameters, dryRun);
} else {
  const rl = createInterface({ input: process.stdin, output: process.stdout });
  rl.question('This will update all configurations, are you sure? (y/N)? ', (answer) => {
    rl.close();
    if (answer.toLowerCase() !== 'y') {
      console.log('Aborted.');
      process.exit(0);
    }
    runWithChain(filteredParameters, dryRun);
  });
}
