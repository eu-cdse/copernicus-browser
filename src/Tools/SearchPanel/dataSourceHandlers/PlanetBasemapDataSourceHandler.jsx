import React from 'react';
import moment from 'moment';
import bboxPolygon from '@turf/bbox-polygon';
import intersect from '@turf/intersect';
import L from 'leaflet';

import DataSourceHandler from './DataSourceHandler';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import {
  PlanetBasemapTooltip,
  getPlanetBasemapMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/PlanetBasemapTooltip';
import { PLANET_NICFI } from './dataSourceConstants';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { DATASOURCES } from '../../../const';
import { filterLayers } from './filter';
import { getLayersWithDate } from './planetNicfi.utils';
import { IMAGE_FORMATS } from '../../../Controls/ImgDownload/consts';

export const YYYY_MM_REGEX = /\d{4}-\d{2}/g;
const DATA_BOUNDS = [-179.9, -30.009514, 179.9, 30.102505];
const DATA_BOUNDS_GEOJSON = {
  type: 'Polygon',
  coordinates: [
    [
      [-179.9, -30.009514],
      [179.9, -30.009514],
      [179.9, 30.102505],
      [-179.9, 30.102505],
      [-179.9, -30.009514],
    ],
  ],
};

export default class PlanetBasemapDataSourceHandler extends DataSourceHandler {
  urls = [];
  searchGroupLabel = 'Planet NICFI';
  searchGroupKey = 'planet-nicfi';
  preselectedDatasets = new Set();
  searchFilters = {};
  isChecked = false;
  KNOWN_URL = `https://api.planet.com/basemaps/v1/mosaics/wmts?api_key=${
    import.meta.env.VITE_PLANET_API_KEY
  }`;
  allResults = null;
  datasource = DATASOURCES.PLANET_NICFI;
  availableLayersFromSearch = [];
  datasets = [];
  defaultPreselectedDataset = PLANET_NICFI;
  limitMonthsSearch = 6;

  leafletZoomConfig = {
    [PLANET_NICFI]: {
      min: 1,
      max: 18,
    },
  };
  leafletTileSizeConfig = {
    [PLANET_NICFI]: 256,
  };
  mosaicDateRanges = {};

  datasetSearchLabels = {
    [PLANET_NICFI]: 'Planet-NICFI',
  };

  willHandle(service, url, name, configs, preselected) {
    if (url !== this.KNOWN_URL) {
      return false;
    }
    this.urls.push(url);
    this.allLayers = configs;
    this.datasets = [PLANET_NICFI];
    this.initMosaicDateRanges();
    return true;
  }

  isHandlingAnyUrl() {
    return this.urls.length > 0;
  }

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }
    return (
      <GenericSearchGroup
        key={this.searchGroupKey}
        label={this.searchGroupLabel}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={<PlanetBasemapTooltip />}
        saveFiltersValues={this.saveSearchFilters}
        options={[]}
        optionsLabels={this.datasetSearchLabels}
        preselectedOptions={Array.from(this.preselectedDatasets)}
        hasMaxCCFilter={false}
      />
    );
  }

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];
    const func = this.getResultsFromPlanet;
    const ff = new FetchingFunction(
      PLANET_NICFI,
      null,
      fromMoment,
      toMoment,
      queryArea,
      this.convertToStandardTiles,
      {
        url: this.KNOWN_URL,
        searchFunction: func,
        searchParams: { datasetId: PLANET_NICFI },
      },
    );
    fetchingFunctions.push(ff);

    return fetchingFunctions;
  }

  getResultsFromPlanet = async (
    url,
    mapBounds,
    fromMoment,
    toMoment,
    datasetId,
    convertToStandardTiles,
    maxCount = 50,
    offset = 0,
    params = {},
  ) => {
    const mapBoundsIntersectsData = intersect(
      bboxPolygon(DATA_BOUNDS),
      bboxPolygon([
        mapBounds.getSouthWest().lng,
        mapBounds.getSouthWest().lat,
        mapBounds.getNorthEast().lng,
        mapBounds.getNorthEast().lat,
      ]),
    );
    if (!mapBoundsIntersectsData) {
      return { tiles: [], hasMore: false };
    }
    const sensingTimeRanges = [];
    // Get biannual or monthly mosaics
    // monthly mosaics only have 1 YYYY-MM date, and Biannual have a from and to datestamp
    Object.keys(this.mosaicDateRanges).forEach((key) => {
      if (
        this.mosaicDateRanges[key].fromTime.isBetween(fromMoment, toMoment) ||
        this.mosaicDateRanges[key].toTime.isBetween(fromMoment, toMoment)
      ) {
        sensingTimeRanges.push(this.mosaicDateRanges[key]);
      }
    });

    sensingTimeRanges.sort((a, b) => b.fromTime.diff(a));
    const foundIsoDates = sensingTimeRanges.map((d) => ({
      ...d,
      fromTime: d.fromTime.toISOString(),
      toTime: d.toTime.toISOString(),
    }));
    const datesForOffset = foundIsoDates.slice(offset, foundIsoDates.length);
    const tiles = convertToStandardTiles([...new Set(datesForOffset)], datasetId);
    const hasMore = foundIsoDates.length > offset + datesForOffset.length ? true : false;
    return { tiles, hasMore };
  };

  initMosaicDateRanges = () => {
    this.allLayers.forEach((l) => {
      const timeRangeArray = l.layerId.match(YYYY_MM_REGEX);
      if (timeRangeArray) {
        const fromToTimeObj = {
          fromTime: moment(timeRangeArray[0]).startOf('month'),
          toTime: timeRangeArray[1]
            ? moment(timeRangeArray[1]).endOf('month')
            : moment(timeRangeArray[0]).endOf('month'),
          layerIds: [l.layerId],
        };

        const foundMosaicKey = `${fromToTimeObj.fromTime.format('YYYY-MM')}-${fromToTimeObj.toTime.format(
          'YYYY-MM',
        )}`;
        if (!this.mosaicDateRanges[foundMosaicKey]) {
          this.mosaicDateRanges[foundMosaicKey] = fromToTimeObj;
        } else {
          this.mosaicDateRanges[foundMosaicKey].layerIds.push(l.layerId);
        }
      }
    });
  };

  getLayers = (data, datasetId, url, layersExclude, layersInclude, selectedDate) => {
    let layers = data.filter((layer) => filterLayers(layer.layerId, layersExclude, layersInclude));
    const layersWithSameDate = getLayersWithDate(layers, selectedDate);
    layersWithSameDate.forEach((l) => {
      l.url = url;
      l.title = l.title.replace('Planet Medres', 'PS Tropical');
    });
    return layersWithSameDate;
  };

  convertToStandardTiles = (data, datasetId) => {
    return data.map((d) => ({
      datasetId,
      datasource: this.datasource,
      sensingTime: d.toTime,
      geometry: DATA_BOUNDS_GEOJSON,
      metadata: {
        ...d.metadata,
        mosaicTimeRange: {
          fromTime: d.fromTime,
          toTime: d.toTime,
        },
      },
    }));
  };

  getMinMaxDates() {
    const mosaicDateRangeKeys = Object.keys(this.mosaicDateRanges);

    if (mosaicDateRangeKeys.length === 0) {
      return { minDate: null, maxDate: null };
    }
    const fromDates = mosaicDateRangeKeys.map((dateRangeKey) =>
      moment(this.mosaicDateRanges[dateRangeKey].fromTime).startOf('month'),
    );
    const toDates = mosaicDateRangeKeys.map((dateRangeKey) =>
      moment(this.mosaicDateRanges[dateRangeKey].toTime).endOf('month'),
    );

    const minDate = moment.min(fromDates);
    const maxDate = moment.max(toDates);
    return { minDate, maxDate };
  }

  getUrlsForDataset = () => {
    return this.urls;
  };

  getSentinelHubDataset = () => {
    return null;
  };

  supportsCustomLayer() {
    return false;
  }

  updateLayersOnVisualization() {
    return false;
  }

  supportsV3Evalscript() {
    return false;
  }

  supportsIndex = () => {
    return false;
  };

  getCopyrightText = () => '';

  isCopernicus = () => false;

  isSentinelHub = () => false;

  supportsTimelapse = () => false;
  supportsImgExport = () => false;

  isDisplayedAsGroup = () => true;

  getDescription = () => getPlanetBasemapMarkdown();

  getBaseLayerForDatasetId = () => {
    return this.allLayers[0];
  };

  findTiles = async ({ datasetId, bbox, fromTime, toTime, nDates, offset, reqConfig }) => {
    const bounds = L.latLngBounds(L.latLng(bbox.minY, bbox.minX), L.latLng(bbox.maxY, bbox.maxX));
    return await this.getResultsFromPlanet(
      this.KNOWN_URL,
      bounds,
      fromTime,
      toTime,
      datasetId,
      this.convertToStandardTiles,
      nDates,
      offset,
    );
  };

  findDates = async ({ datasetId, bbox, fromTime, toTime, reqConfig }) => {
    const { tiles } = await this.findTiles({ datasetId, bbox, fromTime, toTime, reqConfig });
    return tiles.map((t) => moment.utc(t.sensingTime).toDate());
  };

  supportsTimelapse = () => true;
  supportsImgExport = () => true;
  getSupportedImageFormats = () => [IMAGE_FORMATS.PNG, IMAGE_FORMATS.JPG];
  supportsAnalyticalImgExport = () => false;
}
