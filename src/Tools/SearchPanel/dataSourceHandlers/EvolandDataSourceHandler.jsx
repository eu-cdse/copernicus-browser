import {
  BYOCLayer,
  BYOCSubTypes,
  CRS_EPSG4326,
  DATASET_BYOC,
  LocationIdSHv3,
} from '@sentinel-hub/sentinelhub-js';
import {
  EVOLAND_C01_CONTINUOUS_FOREST_MONITORING,
  EVOLAND_C02_FOREST_DISTURBANCE,
  EVOLAND_C03_FOREST_BIOMASS,
  EVOLAND_C04_COVER_CROP_TYPE,
  EVOLAND_C05_GRASSLAND_CROPLAND_GPP,
  EVOLAND_C06_SMALL_LANDSCAPE_FEATURES,
  EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING,
  EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING,
  EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING,
  EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS,
  EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING,
  EVOLAND_C12_TREE_TYPES,
} from './dataSourceConstants';
import {
  EVOLAND_C01_CONTINUOUS_FOREST_MONITORING_BANDS,
  EVOLAND_C02_FOREST_DISTURBANCE_BANDS,
  EVOLAND_C03_FOREST_BIOMASS_BANDS,
  EVOLAND_C04_COVER_CROP_TYPE_BANDS,
  EVOLAND_C05_GRASSLAND_CROPLAND_GPP_BANDS,
  EVOLAND_C06_SMALL_LANDSCAPE_FEATURES_BANDS,
  EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING_BANDS,
  EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING_BANDS,
  EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING_BANDS,
  EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS_BANDS,
  EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING_BANDS,
  EVOLAND_C12_TREE_TYPES_BANDS,
} from './datasourceAssets/EvolandBands';
import DataSourceHandler from './DataSourceHandler';
import { reprojectGeometry } from '../../../utils/reproject';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { DATASOURCES } from '../../../const';
import moment from 'moment';

import { filterLayers } from './filter';
import {
  getC01ContinuousForestMonitoringDescription,
  getC02ForestDisturbanceDescription,
  getC03ForestBiomassDescription,
  getC04CoverCropTypeDescription,
  getC05GrasslandCroplandGPPDescription,
  getC06SmallLandscapeFeaturesDescription,
  getC07ImprovedWaterBodiesMappingDescription,
  getC08ContinuousImperviousnessMonitoringDescription,
  getC09AutomatedLandUseMappingDescription,
  getC10LandSurfaceCharacteristicsDescription,
  getC11OnDemandLandCoverMappingDescription,
  getC12TreeTypesDescription,
} from './DatasourceRenderingComponents/dataSourceTooltips/EvolandTooltip';

export default class EvolandDataSourceHandler extends DataSourceHandler {
  datasource = DATASOURCES.EVOLAND;
  searchGroupLabel = 'Evoland Prototypes';

  getDatasetSearchLabels = () => ({
    [EVOLAND_C01_CONTINUOUS_FOREST_MONITORING]: `C01 Continuous Forest Monitoring`,
    [EVOLAND_C02_FOREST_DISTURBANCE]: `C02 Forest Disturbance`,
    [EVOLAND_C03_FOREST_BIOMASS]: `C03 Forest Biomass`,
    [EVOLAND_C04_COVER_CROP_TYPE]: `C04 Cover Crop Type`,
    [EVOLAND_C05_GRASSLAND_CROPLAND_GPP]: `C05 Grassland Cropland GPP`,
    [EVOLAND_C06_SMALL_LANDSCAPE_FEATURES]: `C06 Small Landscape Features`,
    [EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING]: `C07 Improved Water Bodies Mapping`,
    [EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING]: `C08 Continuous Imperviousness Monitoring`,
    [EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING]: `C09 Automated Land Use Mapping`,
    [EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS]: `C10 Land Surface Characteristics`,
    [EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING]: `C11 On-Demand Land Cover Mapping`,
    [EVOLAND_C12_TREE_TYPES]: `C12 Tree Types`,
  });

  KNOWN_COLLECTIONS = {
    [EVOLAND_C01_CONTINUOUS_FOREST_MONITORING]: ['4c71e058-522a-4a6a-ba54-9fc865803579'], // collection id from byoc admin account (currenlty from evoland account)
    [EVOLAND_C02_FOREST_DISTURBANCE]: ['a982a4e2-0d66-4f3d-8a1d-def27d3c9a9e'],
    [EVOLAND_C03_FOREST_BIOMASS]: ['6f77ffbf-d8fe-471c-a582-307a0c2a56c4'],
    [EVOLAND_C04_COVER_CROP_TYPE]: ['d45077f9-c7bf-43e9-9fcf-6a62c1a330ba'],
    [EVOLAND_C05_GRASSLAND_CROPLAND_GPP]: ['aa56e54b-45e6-4b9e-9de7-f1ec3b81729e'],
    [EVOLAND_C06_SMALL_LANDSCAPE_FEATURES]: ['6f4bb075-5156-4de5-909a-1d130e9b1275'],
    [EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING]: ['8abdd7ff-79ed-4453-92de-d091c0bdd239'],
    [EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING]: ['8f8f94e1-4325-4dae-b7d3-2f523af7bc15'],
    [EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING]: ['26ca0c15-2a9e-4575-b762-00feb721db14'],
    [EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS]: ['116634f7-4624-41e6-ae3c-e17f34be51f9'],
    [EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING]: ['ec62cce8-e2ce-4e0b-bfc9-d12a654c40ba'],
    [EVOLAND_C12_TREE_TYPES]: ['970aa180-143a-40b2-800b-ba4ce5628915'],
  };

  KNOWN_COLLECTIONS_LOCATIONS = {
    [EVOLAND_C01_CONTINUOUS_FOREST_MONITORING]: LocationIdSHv3.cdse,
    [EVOLAND_C02_FOREST_DISTURBANCE]: LocationIdSHv3.cdse,
    [EVOLAND_C03_FOREST_BIOMASS]: LocationIdSHv3.cdse,
    [EVOLAND_C04_COVER_CROP_TYPE]: LocationIdSHv3.cdse,
    [EVOLAND_C05_GRASSLAND_CROPLAND_GPP]: LocationIdSHv3.cdse,
    [EVOLAND_C06_SMALL_LANDSCAPE_FEATURES]: LocationIdSHv3.cdse,
    [EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING]: LocationIdSHv3.cdse,
    [EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING]: LocationIdSHv3.cdse,
    [EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING]: LocationIdSHv3.cdse,
    [EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS]: LocationIdSHv3.cdse,
    [EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING]: LocationIdSHv3.cdse,
    [EVOLAND_C12_TREE_TYPES]: LocationIdSHv3.cdse,
  };

  leafletZoomConfig = {
    [EVOLAND_C01_CONTINUOUS_FOREST_MONITORING]: {
      min: 7,
      max: 21,
    },
    [EVOLAND_C02_FOREST_DISTURBANCE]: {
      min: 7,
      max: 21,
    },
    [EVOLAND_C03_FOREST_BIOMASS]: {
      min: 7,
      max: 21,
    },
    [EVOLAND_C04_COVER_CROP_TYPE]: {
      min: 7,
      max: 21,
    },
    [EVOLAND_C05_GRASSLAND_CROPLAND_GPP]: {
      min: 8,
      max: 21,
    },
    [EVOLAND_C06_SMALL_LANDSCAPE_FEATURES]: {
      min: 7,
      max: 21,
    },
    [EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING]: {
      min: 8,
      max: 21,
    },
    [EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING]: {
      min: 7,
      max: 21,
    },
    [EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING]: {
      min: 7,
      max: 21,
    },
    [EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS]: {
      min: 8,
      max: 21,
    },
    [EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING]: {
      min: 7,
      max: 21,
    },
    [EVOLAND_C12_TREE_TYPES]: {
      min: 5,
      max: 21,
    },
  };

  urls = {
    [EVOLAND_C01_CONTINUOUS_FOREST_MONITORING]: [],
    [EVOLAND_C02_FOREST_DISTURBANCE]: [],
    [EVOLAND_C03_FOREST_BIOMASS]: [],
    [EVOLAND_C04_COVER_CROP_TYPE]: [],
    [EVOLAND_C05_GRASSLAND_CROPLAND_GPP]: [],
    [EVOLAND_C06_SMALL_LANDSCAPE_FEATURES]: [],
    [EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING]: [],
    [EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING]: [],
    [EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING]: [],
    [EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS]: [],
    [EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING]: [],
    [EVOLAND_C12_TREE_TYPES]: [],
  };

  limitMonthsSearch = 12;

  MIN_MAX_DATES = {
    [EVOLAND_C01_CONTINUOUS_FOREST_MONITORING]: {
      minDate: moment.utc('2020-12-01'),
      maxDate: moment.utc('2023-01-01'),
    },
    [EVOLAND_C02_FOREST_DISTURBANCE]: {
      minDate: moment.utc('2021-11-01'),
      maxDate: moment.utc('2022-12-31'),
    },
    [EVOLAND_C03_FOREST_BIOMASS]: {
      minDate: moment.utc('2020-01-01'),
      maxDate: moment.utc('2022-01-02'),
    },
    [EVOLAND_C04_COVER_CROP_TYPE]: {
      minDate: moment.utc('2019-07-01'),
      maxDate: moment.utc('2020-07-02'),
    },
    [EVOLAND_C05_GRASSLAND_CROPLAND_GPP]: {
      minDate: moment.utc('2018-01-01'),
      maxDate: moment.utc('2022-12-22'),
    },
    [EVOLAND_C06_SMALL_LANDSCAPE_FEATURES]: {
      minDate: moment.utc('2020-09-01'),
      maxDate: moment.utc('2022-09-30'),
    },
    [EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING]: {
      minDate: moment.utc('2020-01-01'),
      maxDate: moment.utc('2022-12-31'),
    },
    [EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING]: {
      minDate: moment.utc('2020-04-01'),
      maxDate: moment.utc('2022-12-31'),
    },
    [EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING]: {
      minDate: moment.utc('2021-07-01'),
      maxDate: moment.utc('2022-07-31'),
    },
    [EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS]: {
      minDate: moment.utc('2020-01-01'),
      maxDate: moment.utc('2022-12-31'),
    },
    [EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING]: {
      minDate: moment.utc('2020-01-01'),
      maxDate: moment.utc('2020-01-02'),
    },
    [EVOLAND_C12_TREE_TYPES]: {
      minDate: moment.utc('2021-01-01'),
      maxDate: moment.utc('2021-01-02'),
    },
  };

  allLayers = [];

  getKnownCollectionsList() {
    return Object.values(this.KNOWN_COLLECTIONS).flat();
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  getSentinelHubDataset = () => DATASET_BYOC;

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

  getUrlsForDataset = (datasetId) => {
    const urls = this.urls[datasetId];
    if (!urls) {
      return [];
    }
    return urls;
  };

  getLayers = (data, datasetId, url, layersExclude, layersInclude) => {
    return data
      .filter(
        (layer) =>
          filterLayers(layer.layerId, layersExclude, layersInclude) &&
          this.KNOWN_COLLECTIONS[datasetId].includes(layer.collectionId),
      )
      .map((l) => ({ ...l, url: url }));
  };

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

  getMinMaxDates(datasetId) {
    if (this.MIN_MAX_DATES[datasetId] == null) {
      return { minDate: null, maxDate: null };
    }
    return this.MIN_MAX_DATES[datasetId];
  }

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

  getBands = (datasetId) => {
    switch (datasetId) {
      case EVOLAND_C01_CONTINUOUS_FOREST_MONITORING:
        return EVOLAND_C01_CONTINUOUS_FOREST_MONITORING_BANDS;
      case EVOLAND_C02_FOREST_DISTURBANCE:
        return EVOLAND_C02_FOREST_DISTURBANCE_BANDS;
      case EVOLAND_C03_FOREST_BIOMASS:
        return EVOLAND_C03_FOREST_BIOMASS_BANDS;
      case EVOLAND_C04_COVER_CROP_TYPE:
        return EVOLAND_C04_COVER_CROP_TYPE_BANDS;
      case EVOLAND_C05_GRASSLAND_CROPLAND_GPP:
        return EVOLAND_C05_GRASSLAND_CROPLAND_GPP_BANDS;
      case EVOLAND_C06_SMALL_LANDSCAPE_FEATURES:
        return EVOLAND_C06_SMALL_LANDSCAPE_FEATURES_BANDS;
      case EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING:
        return EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING_BANDS;
      case EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING:
        return EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING_BANDS;
      case EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING:
        return EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING_BANDS;
      case EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS:
        return EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS_BANDS;
      case EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING:
        return EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING_BANDS;
      case EVOLAND_C12_TREE_TYPES:
        return EVOLAND_C12_TREE_TYPES_BANDS;
      default:
        return [];
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case EVOLAND_C01_CONTINUOUS_FOREST_MONITORING:
        return getC01ContinuousForestMonitoringDescription();
      case EVOLAND_C02_FOREST_DISTURBANCE:
        return getC02ForestDisturbanceDescription();
      case EVOLAND_C03_FOREST_BIOMASS:
        return getC03ForestBiomassDescription();
      case EVOLAND_C04_COVER_CROP_TYPE:
        return getC04CoverCropTypeDescription();
      case EVOLAND_C05_GRASSLAND_CROPLAND_GPP:
        return getC05GrasslandCroplandGPPDescription();
      case EVOLAND_C06_SMALL_LANDSCAPE_FEATURES:
        return getC06SmallLandscapeFeaturesDescription();
      case EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING:
        return getC07ImprovedWaterBodiesMappingDescription();
      case EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING:
        return getC08ContinuousImperviousnessMonitoringDescription();
      case EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING:
        return getC09AutomatedLandUseMappingDescription();
      case EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS:
        return getC10LandSurfaceCharacteristicsDescription();
      case EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING:
        return getC11OnDemandLandCoverMappingDescription();
      case EVOLAND_C12_TREE_TYPES:
        return getC12TreeTypesDescription();
      default:
        return 'Evoland prototype service for Earth observation and land monitoring applications.';
    }
  };

  // Cache for loaded GeoJSON data
  _evolandSitesCache = null;

  /**
   * Get observation polygons for Evoland datasets
   * Returns GeoJSON features from evoland_site.geojson file filtered by dataset prototype
   */
  getDatasetLocationPolygons = async (datasetId) => {
    try {
      // Load GeoJSON data if not already cached
      if (!this._evolandSitesCache) {
        const response = await import(`../../../assets/sites/evoland_sites.json`);
        this._evolandSitesCache = response.default;
      }
      // Map datasetId to prototype abbreviations
      const datasetToPrototype = {
        [EVOLAND_C01_CONTINUOUS_FOREST_MONITORING]: 'C01',
        [EVOLAND_C02_FOREST_DISTURBANCE]: 'C02',
        [EVOLAND_C03_FOREST_BIOMASS]: 'C03',
        [EVOLAND_C04_COVER_CROP_TYPE]: 'C04',
        [EVOLAND_C05_GRASSLAND_CROPLAND_GPP]: 'C05',
        [EVOLAND_C06_SMALL_LANDSCAPE_FEATURES]: 'C06',
        [EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING]: 'C07',
        [EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING]: 'C08',
        [EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING]: 'C09',
        [EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS]: 'C10',
        [EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING]: 'C11',
        [EVOLAND_C12_TREE_TYPES]: 'C12',
      };

      const prototypeKey = datasetToPrototype[datasetId];
      if (!prototypeKey) {
        return [];
      }

      // Filter features that have the specific prototype in their prototype field
      const filteredFeatures = this._evolandSitesCache.features.filter((feature) => {
        const prototypeField = feature.properties.prototype;
        if (!prototypeField) {
          return false;
        }
        // Split by comma and trim whitespace, then check for exact match
        const prototypes = prototypeField.split(',').map((p) => p.trim());
        return prototypes.includes(prototypeKey);
      });

      // Transform the features to match expected format and add dataset-specific metadata
      return filteredFeatures.map((feature) => ({
        ...feature,
        id: `evoland_${prototypeKey.toLowerCase()}_${feature.properties.fid}`,
        properties: {
          ...feature.properties,
          id: `evoland_${prototypeKey.toLowerCase()}_${feature.properties.fid}`,
          name: feature.properties.location || `${prototypeKey} Site ${feature.properties.fid}`,
          dataset: this.getDatasetSearchLabels()[datasetId] || datasetId,
          description: `Evoland ${prototypeKey} prototype site in ${
            feature.properties.location || 'unknown location'
          }`,
          area: feature.properties.location,
          tile: feature.properties.tile,
          testing: feature.properties.testing,
          purpose: `${prototypeKey} prototype validation and testing`,
        },
      }));
    } catch (error) {
      console.warn('Could not load Evoland sites data:', error);
      return [];
    }
  };
}
