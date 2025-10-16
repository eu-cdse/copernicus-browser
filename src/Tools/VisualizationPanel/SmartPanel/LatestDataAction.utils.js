import moment from 'moment';
import { BBox, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';

import {
  getDataSourceHandler,
  getAllAvailableCollections,
} from '../../SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { getBoundsAndLatLng } from '../../CommercialDataPanel/commercialData.utils';
import { reqConfigMemoryCache, BBOX_PADDING } from '../../../const';
import { handleError } from '../../../utils';

export async function findLatestDateWithData({
  datasetId,
  bounds,
  pixelBounds,
  maxCloudCoverPercent,
  orbitDirection,
}) {
  if (!bounds) {
    return null;
  }

  try {
    const bbox = generateAppropriateSearchBBox(bounds, pixelBounds);
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

export async function getLatestTileLocation(datasetId) {
  // Returns the location and time of the latest tile globally
  const bbox = new BBox(CRS_EPSG4326, -180, -90, 180, 90);
  const results = await findLatestTileInArea({ bbox, datasetId });
  if (results && results.tiles && results.tiles.length > 0) {
    return constructLocationAndVisualizationParamsFromTile(getLatestTile(results.tiles), datasetId);
  }
  return null;
}

export async function getNearestLocationWithData(datasetId, bounds) {
  // This function doesn't find exactly the closest available tiles to the bounds area.
  // It simply doubles the width and height of the bounds on every step until the bbox is sufficiently large to produce a result
  while (bounds.getEast() - bounds.getWest() < 360 || bounds.getNorth() - bounds.getSouth() < 180) {
    bounds = bounds.pad(0.5);
    const bbox = new BBox(
      CRS_EPSG4326,
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    );
    const results = await findLatestTileInArea({ bbox, datasetId });
    if (results && results.tiles && results.tiles.length > 0) {
      return constructLocationAndVisualizationParamsFromTile(getLatestTile(results.tiles), datasetId);
    }
  }
  return null;
}

export async function findAvailableCollectionsWithData({
  bounds,
  pixelBounds,
  nCollectionsLimit,
  setAvailableCollectionsWithData,
  nDays,
  collectionsToSkip = [],
  setAlreadyCheckedAvailableCollections,
}) {
  const allThemeCollections = getAllAvailableCollections();
  const shuffledCollections = allThemeCollections
    .map((value) => ({ value, sort: Math.random() }))
    .sort((a, b) => a.sort - b.sort)
    .map(({ value }) => value)
    .filter((datasetId) => !collectionsToSkip.includes(datasetId));
  let nAvailableCollectionsWithData = 0;
  const toTime = moment.utc();
  const fromTime = toTime.clone().subtract(nDays, 'day');

  for (let i = 0; i < shuffledCollections.length; i++) {
    if (nAvailableCollectionsWithData >= nCollectionsLimit) {
      setAlreadyCheckedAvailableCollections(shuffledCollections.slice(0, i));
      break;
    }
    const results = await findLatestTileInTimeRange(
      shuffledCollections[i],
      bounds,
      pixelBounds,
      fromTime,
      toTime,
    );
    if (results && results.tiles && results.tiles.length > 0) {
      const dsh = getDataSourceHandler(shuffledCollections[i]);
      if (dsh) {
        nAvailableCollectionsWithData++;
        setAvailableCollectionsWithData((prevState) => [
          ...prevState,
          {
            datasetId: shuffledCollections[i],
            label: dsh.getDatasetLabel(shuffledCollections[i]),
            sensingTime: results.tiles[0].sensingTime,
          },
        ]);
      }
    }
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

async function findLatestTileInTimeRange(datasetId, bounds, pixelBounds, fromTime, toTime) {
  const datasourceHandler = getDataSourceHandler(datasetId);
  if (!datasourceHandler) {
    throw new Error(`No datasource handler for datasetId ${datasetId}`);
  }
  const bbox = generateAppropriateSearchBBox(bounds, pixelBounds);
  return await datasourceHandler.findTiles({
    datasetId: datasetId,
    bbox: bbox,
    fromTime: fromTime,
    toTime: toTime,
    nDates: 1,
    offset: 0,
    reqConfig: reqConfigMemoryCache,
  });
}

export function generateAppropriateSearchBBox(bounds, pixelBounds) {
  const minLng = bounds.getWest() + BBOX_PADDING * (bounds.getEast() - bounds.getWest());
  const maxLng = bounds.getEast() - BBOX_PADDING * (bounds.getEast() - bounds.getWest());

  // The following two are not correct  because resolution is not constant along a meridian, but I think it's good enough.
  // On a 1000 pixel screen at zoom 3 the top padding is then effectively ~130px
  const minLat = bounds.getSouth() + BBOX_PADDING * (bounds.getNorth() - bounds.getSouth());
  const maxLat = bounds.getNorth() - BBOX_PADDING * (bounds.getNorth() - bounds.getSouth());
  return new BBox(CRS_EPSG4326, minLng, minLat, maxLng, maxLat);
}

function constructLocationAndVisualizationParamsFromTile(tile, datasetId) {
  const { lat, lng, zoom } = getBoundsAndLatLng(tile.geometry);
  const fromTime = moment.utc(tile.sensingTime).startOf('day');
  const toTime = moment.utc(tile.sensingTime).endOf('day');
  return { lat: lat, lng: lng, zoom: zoom, fromTime: fromTime, toTime: toTime };
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
