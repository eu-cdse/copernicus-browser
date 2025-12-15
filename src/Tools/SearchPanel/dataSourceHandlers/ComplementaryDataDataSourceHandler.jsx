import { t } from 'ttag';
import moment from 'moment';
import {
  BYOCLayer,
  BYOCSubTypes,
  CRS_EPSG4326,
  DATASET_BYOC,
  DATASET_CDAS_L8_L9_LOTL1,
  Landsat89CDASLOTL1Layer,
  LocationIdSHv3,
} from '@sentinel-hub/sentinelhub-js';

import { DATASOURCES } from '../../../const';
import { reprojectGeometry } from '../../../utils/reproject';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import DataSourceHandler from './DataSourceHandler';
import { CDAS_L8_L9_LOTL1, CDAS_LANDSAT_MOSAIC } from './dataSourceConstants';
import { filterLayers } from './filter';
import { getGroupedBands, getLandsatBandForDataset } from './datasourceAssets/landsatBands';
import { constructV3Evalscript } from '../../../utils';
import {
  getLandsat89Markdown,
  getLandsatMosaicMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/LandsatTooltip';
import { IMAGE_FORMATS } from '../../../Controls/ImgDownload/consts';
// import { getComplentaryDataMarkdown } from './DatasourceRenderingComponents/dataSourceTooltips/LandsatTooltip';

const LANDSAT_COPYRIGHT_TEXT = (number) =>
  `Credit: Landsat ${number} image courtesy of the U.S. Geological Survey, processed with Copernicus Browser`;

export default class ComplementaryDataDataSourceHandler extends DataSourceHandler {
  datasource = DATASOURCES.COMPLEMENTARY_DATA;
  searchGroupLabel = 'Complementary Data';
  allLayers = [];
  datasets = [];
  preselectedDatasets = new Set();
  datasetSearchLabels = {};
  datasetSearchIds = {};
  collections = {};
  urls = { [CDAS_LANDSAT_MOSAIC]: [], [CDAS_L8_L9_LOTL1]: [] };

  leafletZoomConfig = {
    [CDAS_LANDSAT_MOSAIC]: { min: 8, max: 18 },
    [CDAS_L8_L9_LOTL1]: { min: 7, max: 18 },
  };

  KNOWN_COLLECTIONS = {
    [CDAS_LANDSAT_MOSAIC]: ['13bdbc77-5719-4c22-a371-22661b433264'],
  };

  KNOWN_COLLECTIONS_LOCATIONS = {
    [CDAS_LANDSAT_MOSAIC]: LocationIdSHv3.cdse,
  };

  getDatasetSearchLabels = () => {
    return {
      [CDAS_LANDSAT_MOSAIC]: 'Landsat Mosaics',
      [CDAS_L8_L9_LOTL1]: t`Landsat 8-9 L1`,
    };
  };

  MIN_MAX_DATES = {
    [CDAS_LANDSAT_MOSAIC]: {
      minDate: moment.utc('1997-01-01'),
      maxDate: moment.utc('2024-12-31'),
    },
    [CDAS_L8_L9_LOTL1]: {
      minDate: moment.utc('2021-01-01'),
      maxDate: moment.utc(),
    },
  };

  SUPPORTS_FIND_PRODUCTS_FOR_CURRENT_VIEW = {
    [CDAS_LANDSAT_MOSAIC]: false,
    [CDAS_L8_L9_LOTL1]: true,
  };

  getSentinelHubDataset = (datasetId) => {
    switch (datasetId) {
      case CDAS_L8_L9_LOTL1:
        return DATASET_CDAS_L8_L9_LOTL1;
      case CDAS_LANDSAT_MOSAIC:
        return DATASET_BYOC;
      default:
        return null;
    }
  };

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  willHandle(service, url, name, layers, preselected) {
    let handlesAny = false;

    const usesL8L9Dataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_CDAS_L8_L9_LOTL1.id);

    if (usesL8L9Dataset && !this.datasets.includes(CDAS_L8_L9_LOTL1)) {
      this.datasets.push(CDAS_L8_L9_LOTL1);
      this.urls[CDAS_L8_L9_LOTL1].push(url);
    }
    if (preselected) {
      if (usesL8L9Dataset) {
        this.preselectedDatasets.add(CDAS_L8_L9_LOTL1);
      }
    }
    const l8l9Layers = layers.filter((l) => [DATASET_CDAS_L8_L9_LOTL1].includes(l.dataset));
    if (l8l9Layers.length > 0) {
      handlesAny = true;
      this.allLayers.push(...l8l9Layers);
    }

    for (let datasetId of Object.keys(this.KNOWN_COLLECTIONS)) {
      const layersWithDataset = layers.filter((l) =>
        this.KNOWN_COLLECTIONS[datasetId].includes(l.collectionId),
      );
      if (layersWithDataset.length > 0) {
        if (!this.urls[datasetId]?.includes(url)) {
          this.urls[datasetId].push(url);
        }
        if (!this.datasets.includes(datasetId)) {
          this.datasets.push(datasetId);
        }
        handlesAny = true;
        this.allLayers.push(...layersWithDataset);
      }
    }

    this.datasets = Array.from(new Set(this.datasets)); // make datasets unique
    this.saveFISLayers(url, layers);
    return handlesAny;
  }

  getKnownCollectionsList() {
    return Object.values(this.KNOWN_COLLECTIONS).flat();
  }

  // getDescription = () => getComplentaryDataMarkdown();

  supportsFindProductsForCurrentView = (datasetId) => this.SUPPORTS_FIND_PRODUCTS_FOR_CURRENT_VIEW[datasetId];

  areBandsClasses = (datasetId) => {
    return false;
  };

  supportsIndex = () => {
    return true;
  };

  supportsInterpolation = () => true;

  getSupportedImageFormats(datasetId) {
    return Object.values(IMAGE_FORMATS);
  }

  groupChannels = (datasetId) => getGroupedBands(datasetId);

  getCopyrightText = (datasetId) => {
    switch (datasetId) {
      case CDAS_L8_L9_LOTL1:
        return LANDSAT_COPYRIGHT_TEXT('8/9');
      case CDAS_LANDSAT_MOSAIC:
        return 'Credit: OpenGeoHub (2025), processed with Copernicus Browser';
      default:
        return '';
    }
  };

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];

    const { selectedOptions, maxCC } = this.searchFilters;
    selectedOptions.forEach((datasetId) => {
      const searchLayer = this.allLayers.find(
        (l) =>
          this.KNOWN_COLLECTIONS[datasetId].includes(l.collectionId) ||
          l.dataset === this.getSentinelHubDataset(datasetId),
      );

      if (!searchLayer) {
        return;
      }
      searchLayer.maxCloudCoverPercent = maxCC;

      const ff = new FetchingFunction(
        datasetId,
        searchLayer,
        fromMoment,
        toMoment,
        queryArea,
        this.convertToStandardTiles,
      );
      fetchingFunctions.push(ff);
    });
    return fetchingFunctions;
  }

  convertToStandardTiles = (data, datasetId) => {
    const tiles = data.map((t) => {
      if (t.geometry && t.geometry.crs && t.geometry.crs.properties.name !== CRS_EPSG4326.urn) {
        reprojectGeometry(t.geometry, { toCrs: CRS_EPSG4326.authId });
      }
      return {
        sensingTime: t.sensingTime,
        geometry: t.geometry,
        datasource: 'CUSTOM',
        datasetId: datasetId,
        metadata: {},
      };
    });
    return tiles;
  };

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    if (datasetId === CDAS_L8_L9_LOTL1) {
      return data
        .filter((layer) => filterLayers(layer.layerId, layersExclude, layersInclude))
        .map((l) => ({ ...l, url: url }));
    }

    return data
      .filter(
        (layer) =>
          filterLayers(layer.layerId, layersExclude, layersInclude) &&
          this.KNOWN_COLLECTIONS[datasetId].includes(layer.collectionId),
      )
      .map((l) => ({ ...l, url: url }));
  };

  getDatasetParams = (datasetId) => {
    const collectionIds = this.KNOWN_COLLECTIONS[datasetId];
    if (collectionIds) {
      return {
        collectionId: collectionIds[0],
        locationId: this.KNOWN_COLLECTIONS_LOCATIONS[datasetId],
        subType: BYOCSubTypes.BYOC,
      };
    }
    return {};
  };

  getUrlsForDataset = (datasetId) => {
    const urls = this.urls[datasetId];
    if (!urls) {
      return [];
    }
    return urls;
  };

  getBands = (datasetId) => {
    switch (datasetId) {
      case CDAS_LANDSAT_MOSAIC:
        return getLandsatBandForDataset(datasetId);
      case CDAS_L8_L9_LOTL1:
        return getLandsatBandForDataset(datasetId);
      default:
        return [];
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case CDAS_LANDSAT_MOSAIC:
        return getLandsatMosaicMarkdown();
      case CDAS_L8_L9_LOTL1:
        return getLandsat89Markdown();
      default:
        return '';
    }
  };

  tilesHaveCloudCoverage(datasetId) {
    switch (datasetId) {
      case CDAS_LANDSAT_MOSAIC:
        return false;
      case CDAS_L8_L9_LOTL1:
        return true;
      default:
        return false;
    }
  }

  getResolutionLimits(datasetId) {
    switch (datasetId) {
      case CDAS_L8_L9_LOTL1:
        return { resolution: 30, fisResolutionCeiling: 1490 };
      default:
        return {};
    }
  }

  getBaseLayerForDatasetId = (datasetId, maxCloudCoverPercent) => {
    switch (datasetId) {
      case CDAS_L8_L9_LOTL1:
        return new Landsat89CDASLOTL1Layer({ maxCloudCoverPercent, evalscript: true });
      case CDAS_LANDSAT_MOSAIC:
        const collectionIds = this.KNOWN_COLLECTIONS[datasetId];
        if (collectionIds) {
          return new BYOCLayer({
            evalscript: true,
            collectionId: collectionIds[0],
            locationId: this.KNOWN_COLLECTIONS_LOCATIONS[datasetId],
          });
        }
        return null;
      default:
        return null;
    }
  };

  isCopernicus = () => false;

  isSpectralExplorerSupported = () => true;

  generateEvalscript = (bands, datasetId, config) => {
    if (config) {
      return constructV3Evalscript(bands, config);
    }

    return this.defaultEvalscript(bands, 1 / 1000);
  };

  defaultEvalscript = (bands, factor) => {
    return `//VERSION=3
function setup() {
  return {
    input: ["${[...new Set(Object.values(bands))].join('","')}", "dataMask"],
    output: { bands: 4 }
  };
}
let factor = ${factor};
function evaluatePixel(sample) {
  // This comment is required for evalscript parsing to work
  return [${Object.values(bands)
    .map((e) => 'factor * sample.' + e)
    .join(',')}, sample.dataMask ];
}`;
  };
}
