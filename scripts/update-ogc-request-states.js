import { OGC_REQUEST_STATE, setOgcRequestsStates } from './shared-functions.js';
import { exit } from 'process';

// examples
// node -r esm scripts/update-ogc-request-states enable
// node -r esm scripts/update-ogc-request-states disable data.csv
const scriptParameters = process.argv.slice(2);

function setOgcRequestsParameters(scriptParameters) {
  if (scriptParameters.length === 1) {
    if (
      scriptParameters[0] === OGC_REQUEST_STATE.ENABLE ||
      scriptParameters[0] === OGC_REQUEST_STATE.DISABLE
    ) {
      return { newState: scriptParameters[0] };
    } else {
      console.error("Please pass 'enable' or 'disable' as parameter");
      exit(1);
    }
  } else if (scriptParameters.length === 2) {
    return { newState: scriptParameters[0], csvFullPath: scriptParameters[1] };
  } else {
    console.error('Incorrect number of parameters have been added.');
    exit(1);
  }
}

const { csvFullPath, newState } = setOgcRequestsParameters(scriptParameters);

setOgcRequestsStates(csvFullPath, newState)
  .then(() => console.log(`The disable attribute has been updated successfully for all instances`))
  .catch((error) => console.error(error));
