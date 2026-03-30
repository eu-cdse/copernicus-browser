import { t } from 'ttag';
import moment from 'moment';

import DataSourceHandler from './DataSourceHandler';

import {
  COPERNICUS_CLMS_UA_LCU_2018_VECTOR,
  COPERNICUS_CLMS_UA_LCU_2018_RASTER,
  COPERNICUS_CLMS_UA_LCU_2021_VECTOR,
  COPERNICUS_CLMS_UA_LCU_2021_RASTER,
  COPERNICUS_CLMS_UA_LCUC_2018_2021_VECTOR,
  COPERNICUS_CLMS_UA_LCUC_2018_2021_RASTER,
  COPERNICUS_CLMS_UA_STL_2021_VECTOR,
  COPERNICUS_CLMS_UA_STL_2021_RASTER,
} from './dataSourceConstants';
import { DATASOURCES } from '../../../const';
import { filterLayers } from './filter';
import {
  getCLMSCollectionMarkdown,
  getClmsUaLcu2018VectorMarkdown,
  getClmsUaLcu2021VectorMarkdown,
  getClmsUaLcuc20182021VectorMarkdown,
  getClmsUaStl2021VectorMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/CLMSTooltip';

const LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS = {
  [COPERNICUS_CLMS_UA_LCU_2018_VECTOR]: {
    lowResolutionCollectionId: COPERNICUS_CLMS_UA_LCU_2018_RASTER,
    lowResolutionMetersPerPixelThreshold: 100,
  },
  [COPERNICUS_CLMS_UA_LCU_2021_VECTOR]: {
    lowResolutionCollectionId: COPERNICUS_CLMS_UA_LCU_2021_RASTER,
    lowResolutionMetersPerPixelThreshold: 100,
  },
  [COPERNICUS_CLMS_UA_LCUC_2018_2021_VECTOR]: {
    lowResolutionCollectionId: COPERNICUS_CLMS_UA_LCUC_2018_2021_RASTER,
    lowResolutionMetersPerPixelThreshold: 100,
  },
  [COPERNICUS_CLMS_UA_STL_2021_VECTOR]: {
    lowResolutionCollectionId: COPERNICUS_CLMS_UA_STL_2021_RASTER,
    lowResolutionMetersPerPixelThreshold: 100,
  },
};

export class CLMSVectorDataSourceHandler extends DataSourceHandler {
  datasets = [];
  allLayers = [];
  cachedCapabilities = null;
  // This handler is WMS-backed, not BYOC — it has no SentinelHub collection IDs.
  // getKnownCollectionsList() correctly returns [] via the base class default,
  // which means UnknownBYOCDataSourceHandler will not blacklist any collection for this handler,
  // and the BYOC layer creation path in sentinelhubLeafletLayer is never reached.
  datasource = DATASOURCES.CLMS_VECTOR;
  searchGroupLabel = 'Copernicus Land Monitoring Service';
  // limitMonthsSearch caps the calendar month picker, but for these timeless datasets
  // minDate === maxDate so the calendar always has exactly one valid date regardless of the window.
  // The value 12 is inherited from the base class default and is intentionally left as-is.
  limitMonthsSearch = 12;

  getDatasetSearchLabels = () => ({
    [COPERNICUS_CLMS_UA_LCU_2018_VECTOR]: t`UA LCU 3-yearly 2018`,
    [COPERNICUS_CLMS_UA_LCU_2021_VECTOR]: t`UA LCU 3-yearly 2021`,
    [COPERNICUS_CLMS_UA_LCUC_2018_2021_VECTOR]: t`UA LCUC 3-yearly 2018-2021`,
    [COPERNICUS_CLMS_UA_STL_2021_VECTOR]: t`UA STL 3-yearly 2021`,
  });

  urls = {
    [COPERNICUS_CLMS_UA_LCU_2018_VECTOR]: [],
    [COPERNICUS_CLMS_UA_LCU_2021_VECTOR]: [],
    [COPERNICUS_CLMS_UA_LCUC_2018_2021_VECTOR]: [],
    [COPERNICUS_CLMS_UA_STL_2021_VECTOR]: [],
  };

  getCapabilitiesDatasetIds = {
    [COPERNICUS_CLMS_UA_LCU_2018_VECTOR]: 'CLMS_UA_LCU_S2018_V025ha',
    [COPERNICUS_CLMS_UA_LCU_2021_VECTOR]: 'CLMS_UA_LCU_S2021_V025ha',
    [COPERNICUS_CLMS_UA_LCUC_2018_2021_VECTOR]: 'CLMS_UA_LCUC_C2018-2021_V010ha',
    [COPERNICUS_CLMS_UA_STL_2021_VECTOR]: 'CLMS_UA_STL_S2021_V005ha',
  };

  leafletZoomConfig = {
    [COPERNICUS_CLMS_UA_LCU_2018_VECTOR]: { min: 2, max: 25 },
    [COPERNICUS_CLMS_UA_LCU_2021_VECTOR]: { min: 2, max: 25 },
    [COPERNICUS_CLMS_UA_LCUC_2018_2021_VECTOR]: { min: 2, max: 25 },
    [COPERNICUS_CLMS_UA_STL_2021_VECTOR]: { min: 2, max: 25 },
  };

  MIN_MAX_DATES = {
    [COPERNICUS_CLMS_UA_LCU_2018_VECTOR]: {
      minDate: moment.utc('2018-01-01'),
      maxDate: moment.utc('2018-01-01'),
    },
    [COPERNICUS_CLMS_UA_LCU_2021_VECTOR]: {
      minDate: moment.utc('2021-01-01'),
      maxDate: moment.utc('2021-01-01'),
    },
    [COPERNICUS_CLMS_UA_LCUC_2018_2021_VECTOR]: {
      minDate: moment.utc('2021-01-01'),
      maxDate: moment.utc('2021-01-01'),
    },
    [COPERNICUS_CLMS_UA_STL_2021_VECTOR]: {
      minDate: moment.utc('2021-01-01'),
      maxDate: moment.utc('2021-01-01'),
    },
  };

  getKnownUrl = () =>
    global.window?.API_ENDPOINT_CONFIG?.VECTOR_DATA_BASEURL ??
    'https://mapserver.dataspace.copernicus.eu/ogc';

  willHandle(service, url, name, layers) {
    if (url !== this.getKnownUrl()) {
      return false;
    }
    this.datasets = [];
    this.allLayers = [];
    Object.keys(this.urls).forEach((key) => {
      this.urls[key] = [];
    });

    // Find layers whose layerId matches one of the getCapabilitiesDatasetIds values
    const validLayerIds = Object.values(this.getCapabilitiesDatasetIds);
    const matchingLayers = layers.filter((layer) => validLayerIds.includes(layer.layerId));

    if (matchingLayers.length === 0) {
      return false;
    }

    // Store the datasets that were found
    Object.entries(this.getCapabilitiesDatasetIds).forEach(([datasetKey, layerId]) => {
      if (matchingLayers.some((layer) => layer.layerId === layerId) && !this.datasets.includes(datasetKey)) {
        this.datasets.push(datasetKey);
        this.urls[datasetKey] = [url];
      }
    });

    this.allLayers = matchingLayers;
    return true;
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    let layers = data.filter(
      (layer) =>
        filterLayers(layer.layerId, layersExclude, layersInclude) &&
        this.filterLayersUrbanAtlas(layer.layerId, datasetId),
    );
    layers.forEach((l) => {
      l.url = url;
    });
    return layers;
  };

  filterLayersUrbanAtlas = (layerId, datasetId) => {
    return layerId.startsWith(this.getCapabilitiesDatasetIds[datasetId]);
  };

  getUrlsForDataset = (datasetId) => {
    const urls = this.urls[datasetId];
    if (!urls) {
      return [];
    }
    return urls;
  };

  getMinMaxDates(datasetId) {
    if (this.MIN_MAX_DATES[datasetId] == null) {
      return { minDate: null, maxDate: null };
    }
    return this.MIN_MAX_DATES[datasetId];
  }

  findTiles = ({ datasetId }) => {
    const minMax = this.getMinMaxDates(datasetId);
    // These datasets are timeless: minDate === maxDate, so there is exactly one
    // valid sensing time and the requested [fromTime, toTime] window is irrelevant.
    return Promise.resolve({ tiles: [{ sensingTime: minMax.minDate }] });
  };

  getDescription = () => getCLMSCollectionMarkdown();

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case COPERNICUS_CLMS_UA_LCU_2018_VECTOR:
        return getClmsUaLcu2018VectorMarkdown();
      case COPERNICUS_CLMS_UA_LCU_2021_VECTOR:
        return getClmsUaLcu2021VectorMarkdown();
      case COPERNICUS_CLMS_UA_LCUC_2018_2021_VECTOR:
        return getClmsUaLcuc20182021VectorMarkdown();
      case COPERNICUS_CLMS_UA_STL_2021_VECTOR:
        return getClmsUaStl2021VectorMarkdown();
      default:
        return null;
    }
  };

  getSentinelHubDataset = () => null;

  supportsCustomLayer = () => false;

  supportsLowResolutionAlternativeCollection = (collectionId) => {
    return !!LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS[collectionId];
  };

  getLowResolutionCollectionId = (collectionId) => {
    return LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS[collectionId]?.lowResolutionCollectionId;
  };

  getLowResolutionMetersPerPixelThreshold = (collectionId) => {
    return LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS[collectionId]?.lowResolutionMetersPerPixelThreshold;
  };

  supportsAnalyticalImgExport = () => false;

  supportsTimelapse = () => false;
}

export default CLMSVectorDataSourceHandler;
