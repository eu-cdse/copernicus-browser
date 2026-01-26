import moment from 'moment';
import { BBox, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';

import { dataSourceHandlers } from '../../../SearchPanel/dataSourceHandlers/dataSourceHandlers';

import { t } from 'ttag';

export function applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths) {
  /*
    This function takes a date range and the months that are allowed, and returns an array
    of resulting (valid) date ranges.
  */
  if (filterMonths === null || filterMonths.length === 12) {
    return [{ fromMoment: fromMoment, toMoment: toMoment }];
  }

  // iterate from start till end, adding either a new date range or extending the old one
  // along the way:
  let intervals = [];
  let currentInterval = null;
  const fromMonth = fromMoment.clone().startOf('month');
  const toMonth = toMoment.clone().endOf('month');
  for (let month = fromMonth; fromMonth.isSameOrBefore(toMonth); month.add(1, 'month')) {
    // ignore months which are not in filterMonths:
    if (!filterMonths.includes(month.month())) {
      // if there was an interval we were extending, push it to the final list:
      if (currentInterval !== null) {
        intervals.push(currentInterval);
        currentInterval = null;
      }
      continue;
    }

    const intervalStart = moment.max(month.clone().startOf('month'), fromMoment);
    const intervalEnd = moment.min(month.clone().endOf('month'), toMoment);
    if (currentInterval === null) {
      // create a new interval:
      currentInterval = {
        fromMoment: intervalStart,
        toMoment: intervalEnd,
      };
    } else {
      // extend the existing interval:
      currentInterval.toMoment = intervalEnd;
    }
  }
  if (currentInterval !== null) {
    intervals.push(currentInterval);
  }
  return intervals;
}

export class Query {
  /*
    Creates and holds all IntervalSearchResults
  */
  searchIntervals = null;
  currentIntervalIndex = null;
  currentInterval = null;
  queryId = moment().format('x');

  prepareNewSearch(fromMoment, toMoment, bounds, filterMonths) {
    if (!dataSourceHandlers.filter((dsh) => dsh.isChecked).length) {
      return { success: false, message: t`Please select data source(s)!` };
    }
    this.searchIntervalsDates = applyFilterMonthsToDateRange(fromMoment, toMoment, filterMonths);
    if (!this.searchIntervalsDates.length) {
      return { success: false, message: t`Invalid time range!` };
    }
    this.searchIntervalsDates.reverse(); // we want most recent intervals first
    this.searchIntervals = this.searchIntervalsDates.map((interval) => {
      return new IntervalSearchResults(interval.fromMoment, interval.toMoment, bounds);
    });
    this.currentIntervalHasMore = false;
    this.currentIntervalIndex = 0;
    this.currentInterval = this.searchIntervals[0];
    this.allResults = [];
    this.hasMore = false;
    return { success: true };
  }

  async getNextNResults(nResults = 50) {
    let results = [];
    let nMissing = nResults;

    let runWhile = true;
    while (runWhile) {
      if (!this.currentInterval.hasMore) {
        this.currentInterval = this.getNextInterval();
        if (!this.currentInterval) {
          runWhile = false;
          break;
        }
      }
      const newResults = await this.currentInterval.nextNTiles(nMissing);
      results.push(...newResults);
      if (results.length === nResults) {
        runWhile = false;
        break;
      }
      nMissing -= newResults.length;
    }

    const hasMore = this.currentInterval ? this.currentInterval.hasMore : false;
    this.allResults.push(...results);
    this.hasMore = hasMore;
    return { results, hasMore };
  }

  getNextInterval() {
    if (this.currentIntervalIndex + 1 >= this.searchIntervals.length) {
      return null;
    }
    this.currentIntervalIndex += 1;
    return this.searchIntervals[this.currentIntervalIndex];
  }
}

class IntervalSearchResults {
  /*
    Holds all the fetching functions for all the datasets for a single interval
  */
  constructor(fromMoment, toMoment, bounds) {
    this.fromMoment = fromMoment;
    this.toMoment = toMoment;
    this.bounds = bounds;
    this.fetchingFunctions = this.getFetchingFunctions(fromMoment, toMoment, bounds);
    this.hasMore = true;
  }

  getFetchingFunctions(fromMoment, toMoment, bounds) {
    let fetchingFunctions = [];
    dataSourceHandlers
      .filter((dsh) => dsh.isHandlingAnyUrl())
      .forEach((dsh) => fetchingFunctions.push(...dsh.prepareNewSearch(fromMoment, toMoment, bounds)));
    return fetchingFunctions;
  }

  async nextNTiles(nResults = 50) {
    /*
      Returns next N tiles. It iterates over the fetching functions using .nextDate() to find the closest date available until it has enough
    */
    let tiles = [];
    for (let i = 0; i < nResults; i++) {
      // Not efficient, but there shouldn't be many fetching functions anyway
      const shouldContinue = await Promise.all(this.fetchingFunctions.map((ff) => ff.nextDate())).then(
        (dates) => {
          const mostRecent = Math.max(...dates);
          if (mostRecent === -Infinity) {
            this.hasMore = false;
            return false;
          }
          const mostRecentIndex = dates.indexOf(mostRecent);
          const tile = this.fetchingFunctions[mostRecentIndex].nextTile();
          tiles.push(tile);

          if (tiles.length === nResults) {
            return false;
          }
          return true;
        },
      );
      if (!shouldContinue) {
        break;
      }
    }
    return tiles;
  }
}

export class FetchingFunction {
  /*
    Holds all the results from a single fetching function. 
  */
  constructor(
    datasetId,
    searchLayer,
    fromMoment,
    toMoment,
    bounds,
    convertToStandardTiles,
    params = {},
    nResults = 50,
  ) {
    this.datasetId = datasetId;
    this.searchLayer = searchLayer;
    this.fromMoment = fromMoment;
    this.toMoment = toMoment;
    this.bounds = bounds;
    this.convertToStandardTiles = convertToStandardTiles;
    this.params = params;
    this.nResults = nResults;
    this.offset = 0;
    this.allResults = [];
    this.hasMore = true;
  }

  async fetch() {
    /*
      Gets the tiles sorted by date
    */
    const maxCount = this.nResults;
    const { tiles, hasMore } = await getTiles(
      this.searchLayer,
      this.bounds,
      this.fromMoment,
      this.toMoment,
      maxCount,
      this.offset,
      this.datasetId,
      this.convertToStandardTiles,
      this.params,
    ).catch((err) => {
      console.error(err);
      throw new Error(`There was an issue fetching data for ${this.datasetId}`);
    });
    this.hasMore = hasMore;
    this.allResults.push(...tiles);
    return tiles;
  }

  async nextDate() {
    /*
      Returns the date of the next tile in order
    */
    if (this.offset >= this.allResults.length && this.hasMore) {
      await this.fetch();
    }
    if (this.offset >= this.allResults.length && !this.hasMore) {
      return -Infinity;
    }

    return this.allResults[this.offset]
      ? new Date(this.allResults[this.offset].sensingTime).getTime()
      : -Infinity;
  }

  nextTile() {
    /*
     yields the next tile in order
    */
    this.offset += 1;
    return this.allResults[this.offset - 1];
  }
}

function getTiles(
  searchLayer,
  bounds,
  fromTime,
  toTime,
  maxCount,
  offset,
  datasetId,
  convertToStandardTiles,
  params,
) {
  if (searchLayer === null) {
    return new Promise((resolve, reject) => {
      const { searchFunction, url, searchParams } = params;
      searchFunction(
        url,
        bounds,
        fromTime,
        toTime,
        datasetId,
        convertToStandardTiles,
        maxCount,
        offset,
        searchParams,
      )
        .then((response) => resolve(response))
        .catch((e) => reject(e));
    });
  }
  return new Promise((resolve, reject) => {
    const bbox = new BBox(
      CRS_EPSG4326,
      bounds.getWest(),
      bounds.getSouth(),
      bounds.getEast(),
      bounds.getNorth(),
    );
    searchLayer
      .findTiles(bbox, fromTime, toTime, maxCount, offset)
      .then((response) => {
        const tiles = convertToStandardTiles(response.tiles, datasetId);
        resolve({
          tiles,
          hasMore: response.hasMore,
        });
      })
      .catch((e) => {
        reject(e);
      });
  });
}
