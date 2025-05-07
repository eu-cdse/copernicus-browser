import { DATASOURCES } from '../../../const';
import {
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
} from './dataSourceConstants';
import moment from 'moment';
import {
  BYOCLayer,
  BYOCSubTypes,
  CRS_EPSG4326,
  DATASET_BYOC,
  LocationIdSHv3,
} from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';
import { filterLayers } from './filter';
import DataSourceHandler from './DataSourceHandler';
import {
  getCCMCollectionMarkdown,
  getCCMVHRImage2018Markdown,
  getCCMVHRImage2021Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/CCMTooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { reprojectGeometry } from '../../../utils/reproject';
import { CCM_VHR_IMAGE_2018_BANDS, CCM_VHR_IMAGE_2021_BANDS } from './datasourceAssets/CCMBands';

export default class CCMDataSourceHandler extends DataSourceHandler {
  getDatasetSearchLabels = () => ({
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: t`VHR Europe 2018`,
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: t`VHR Europe 2021`,
  });

  urls = {
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: [],
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: [],
  };
  datasets = [];
  allLayers = [];
  datasource = DATASOURCES.CCM;
  searchGroupLabel = 'Copernicus Contributing Missions';

  leafletZoomConfig = {
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: {
      min: 8,
      max: 25,
    },
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: {
      min: 8,
      max: 25,
    },
  };

  KNOWN_COLLECTIONS = {
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: ['4ab2c8f6-ef9e-4989-9c2e-3fae9c88da1e'], // collection id from byoc admin account
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: ['0c96598b-edb2-4a5b-afb0-4d35389ba098'],
  };

  KNOWN_COLLECTIONS_LOCATIONS = {
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: LocationIdSHv3.cdse,
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: LocationIdSHv3.cdse,
  };

  MIN_MAX_DATES = {
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: {
      minDate: moment.utc('2017-01-01'),
      maxDate: moment.utc('2019-12-31'),
    },
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: {
      minDate: moment.utc('2020-01-01'),
      maxDate: moment.utc('2022-12-31'),
    },
  };

  willHandle(service, url, name, layers, preselected) {
    let handlesAny = false;

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
    this.saveFISLayers(url, layers);
    return handlesAny;
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  getKnownCollectionsList() {
    return Object.values(this.KNOWN_COLLECTIONS).flat();
  }

  getDescription = () => getCCMCollectionMarkdown();

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];

    const { selectedOptions } = this.searchFilters;
    selectedOptions.forEach((datasetId) => {
      const searchLayer = this.allLayers.find((l) =>
        this.KNOWN_COLLECTIONS[datasetId].includes(l.collectionId),
      );
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

  getUrlsForDataset = (datasetId) => {
    const urls = this.urls[datasetId];
    if (!urls) {
      return [];
    }
    return urls;
  };

  getSentinelHubDataset = () => DATASET_BYOC;

  getBands = (datasetId) => {
    switch (datasetId) {
      case CDSE_CCM_VHR_IMAGE_2018_COLLECTION:
        return CCM_VHR_IMAGE_2018_BANDS;
      case CDSE_CCM_VHR_IMAGE_2021_COLLECTION:
        return CCM_VHR_IMAGE_2021_BANDS;
      default:
        return null;
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case CDSE_CCM_VHR_IMAGE_2018_COLLECTION:
        return getCCMVHRImage2018Markdown();
      case CDSE_CCM_VHR_IMAGE_2021_COLLECTION:
        return getCCMVHRImage2021Markdown();
      default:
        return null;
    }
  };

  getCollectionByDatasetId(datasetId) {
    return Object.keys(this.KNOWN_COLLECTIONS).find((collection) =>
      this.KNOWN_COLLECTIONS[collection].includes(datasetId),
    );
  }

  getMinMaxDates(datasetId) {
    const collectionId = this.getCollectionByDatasetId(datasetId);
    if (!collectionId) {
      return { minDate: null, maxDate: null };
    }
    return this.MIN_MAX_DATES[collectionId];
  }

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    return data
      .filter(
        (layer) =>
          filterLayers(layer.layerId, layersExclude, layersInclude) &&
          this.KNOWN_COLLECTIONS[datasetId].includes(layer.collectionId),
      )
      .map((l) => ({ ...l, url: url }));
  };

  getBaseLayerForDatasetId = (datasetId) => {
    const collectionIds = this.KNOWN_COLLECTIONS[datasetId];
    if (collectionIds) {
      return new BYOCLayer({
        evalscript: true,
        collectionId: collectionIds[0],
        locationId: this.KNOWN_COLLECTIONS_LOCATIONS[datasetId],
      });
    }
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

  supportsFindProductsForCurrentView = () => true;

  areBandsClasses = (datasetId) => {
    return false;
  };

  supportsIndex = () => {
    return false;
  };

  generateEvalscript = (bands, datasetId, config) => {
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
