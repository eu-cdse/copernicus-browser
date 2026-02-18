import moment from 'moment';

import { getDataSourceHandler } from '../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { reqConfigMemoryCache } from '../const';
import { handleError } from '.';
import { generateAppropriateSearchBBox } from './coords';

export async function findLatestDateWithData({ datasetId, bounds, maxCloudCoverPercent, orbitDirection }) {
  if (!bounds) {
    return null;
  }

  try {
    const bbox = generateAppropriateSearchBBox(bounds);
    const results = await findLatestTileInArea({ bbox, datasetId, maxCloudCoverPercent, orbitDirection });

    if (results && results.tiles && results.tiles.length > 0) {
      return getLatestTile(results.tiles).sensingTime;
    }
    return null;
  } catch (e) {
    handleError(e, 'Unable to find latest date with data', (msg) => console.error(msg));
    throw e;
  }
}

async function findLatestTileInArea({ bbox, datasetId, maxCloudCoverPercent, orbitDirection }) {
  const datasourceHandler = getDataSourceHandler(datasetId);
  if (!datasourceHandler) {
    throw new Error(`No datasource handler for datasetId ${datasetId}`);
  }
  const { minDate, maxDate } = datasourceHandler.getMinMaxDates(datasetId);
  const minDateRange = minDate ? minDate : moment.utc('1970-01-01').toDate();
  const maxDateRange = maxDate ? maxDate : moment.utc().endOf('day').toDate();
  return await datasourceHandler.findTiles({
    datasetId: datasetId,
    bbox: bbox,
    fromTime: minDateRange,
    toTime: maxDateRange,
    nDates: 1,
    offset: 0,
    reqConfig: reqConfigMemoryCache,
    maxCloudCoverPercent,
    ...(orbitDirection && { orbitDirection: orbitDirection }),
  });
}

function getLatestTile(tiles) {
  return tiles.sort((a, b) => moment.utc(b.sensingTime).diff(moment.utc(a.sensingTime)))[0];
}

export function getQuarterlyInfo(dateString) {
  const date = new Date(dateString || undefined);

  if (isNaN(date.getTime())) {
    return 'latest';
  }

  const year = date.getFullYear();
  const month = date.getMonth();

  // Calculate the quarter
  let quarter = Math.floor(month / 3 + 1);

  // Define quarter start and end months
  const quarters = {
    1: 'Jan - Mar',
    2: 'Apr - Jun',
    3: 'Jul - Sep',
    4: 'Oct - Dec',
  };

  // Construct the output string
  const output = `${quarters[quarter]} ${year}`;
  return output;
}
