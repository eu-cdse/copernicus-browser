import * as wellknown from 'wellknown';
import { ODataFilterBuilder } from './ODataFilterBuilder';
import { ODataQueryBuilder } from './ODataQueryBuilder';
import { ODataEntity, ODataFilterOperator, OrderingDirection } from './ODataTypes';
import { ExpressionTreeOperator } from './ExpressionTree';
import {
  S1_CDAS_EW_HH,
  S1_CDAS_EW_HHHV,
  S1_CDAS_EW_VV,
  S1_CDAS_EW_VVVH,
  S1_CDAS_IW_VV,
  S1_CDAS_IW_VVVH,
  S1_CDAS_IW_HH,
  S1_CDAS_IW_HHHV,
  S1_CDAS_SM_HH,
  S1_CDAS_SM_HHHV,
  S1_CDAS_SM_VV,
  S1_CDAS_SM_VVVH,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  S3OLCI_CDAS,
  S3SLSTR_CDAS,
  S5_AER_AI_CDAS,
  S5_CH4_CDAS,
  S5_CLOUD_CDAS,
  S5_CO_CDAS,
  S5_HCHO_CDAS,
  S5_NO2_CDAS,
  S5_O3_CDAS,
  S5_SO2_CDAS,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  AttributeNames,
  AttributeOnlineValues,
  AttributeOperationalModeValues,
  AttributeOrbitDirectionValues,
  AttributePolarisationChannelsValues,
  FormatedAttributeNames,
  ODAtaAttributes,
} from './assets/attributes';
import Sentinel1DataSourceHandler from '../../Tools/SearchPanel/dataSourceHandlers/Sentinel1DataSourceHandler';
import { Polarization } from '@sentinel-hub/sentinelhub-js';
import { collections } from '../../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/collectionFormConfig';
import { FilterElement } from './FilterElement';

export const PAGE_SIZE = 50;

// S1 is not included as it's handled manually
const PRODUCT_TYPE_TO_DATASETID = {
  S2MSI1C: S2_L1C_CDAS,
  S2MSI2A: S2_L2A_CDAS,
  OL_1_EFR___: S3OLCI_CDAS,
  SL_1_RBT___: S3SLSTR_CDAS,
  L2__AER_AI: S5_AER_AI_CDAS,
  //L2__AER_LH
  L2__CH4___: S5_CH4_CDAS,
  L2__CLOUD_: S5_CLOUD_CDAS,
  L2__CO____: S5_CO_CDAS,
  L2__HCHO__: S5_HCHO_CDAS,
  L2__NO2___: S5_NO2_CDAS,
  L2__O3____: S5_O3_CDAS,
  L2__SO2___: S5_SO2_CDAS,
};

export const getDatasetIdFromProductType = (productType, attributes) => {
  if (!productType) {
    return null;
  }

  if (/(1S|1S-COG)$/.test(productType)) {
    const polarisationChannels = attributes.filter(
      (attribute) => attribute?.Name === AttributeNames.polarisationChannels,
    );
    if (/^IW_GRDH_1S/.test(productType)) {
      switch (polarisationChannels[0]?.Value) {
        case 'VV':
          return S1_CDAS_IW_VV;
        case 'VV&VH':
          return S1_CDAS_IW_VVVH;
        case 'HH':
          return S1_CDAS_IW_HH;
        case 'HH&HV':
          return S1_CDAS_IW_HHHV;
        default:
          return S1_CDAS_IW_VVVH;
      }
    }
    if (/^EW_GRDM_1S/.test(productType)) {
      switch (polarisationChannels[0]?.Value) {
        case 'HH':
          return S1_CDAS_EW_HH;
        case 'HH&HV':
          return S1_CDAS_EW_HHHV;
        case 'VV':
          return S1_CDAS_EW_VV;
        case 'VV&VH':
          return S1_CDAS_EW_VVVH;
        default:
          return S1_CDAS_EW_HHHV;
      }
    }
    if (/^S[1-6]_GRDH_1S/.test(productType)) {
      if (polarisationChannels[0]?.Value === 'HH') {
        return S1_CDAS_SM_HH;
      } else if (polarisationChannels[0]?.Value === 'VV') {
        return S1_CDAS_SM_VV;
      } else if (polarisationChannels[0]?.Value === 'VV&VH') {
        return S1_CDAS_SM_VVVH;
      } else {
        return S1_CDAS_SM_HHHV;
      }
    }
  }

  return PRODUCT_TYPE_TO_DATASETID[productType];
};

const getProductTypeFromDatasetId = (datasetId) => {
  if (!datasetId) {
    return null;
  }
  for (const [key, val] of Object.entries(PRODUCT_TYPE_TO_DATASETID)) {
    if (val === datasetId) {
      return key;
    }
  }
  return null;
};

export const getODataCollectionInfoFromDatasetId = (datasetId, { orbitDirection, maxCC }) => {
  const dsh = getDataSourceHandler(datasetId);
  if (!dsh) {
    return null;
  }

  if (/^S1/.test(datasetId)) {
    const datasetParams = Sentinel1DataSourceHandler.getDatasetParams(datasetId);
    return {
      id: 'S1',
      instrument: 'SAR',
      productType: 'GRD',
      selectedFilters: {
        operationalMode: [AttributeOperationalModeValues[datasetParams.acquisitionMode]],
        orbitDirection: [
          ...(orbitDirection?.length === 1 &&
          orbitDirection[0] === AttributeOrbitDirectionValues.ASCENDING.value
            ? [AttributeOrbitDirectionValues.ASCENDING]
            : []),
          ...(orbitDirection?.length === 1 &&
          orbitDirection[0] === AttributeOrbitDirectionValues.DESCENDING.value
            ? [AttributeOrbitDirectionValues.DESCENDING]
            : []),
        ],
        polarisationChannels: [
          ...(datasetParams.polarization === Polarization.SV ? [AttributePolarisationChannelsValues.VV] : []),
          ...(datasetParams.polarization === Polarization.DV
            ? [AttributePolarisationChannelsValues.VV_VH]
            : []),
          ...(datasetParams.polarization === Polarization.SH ? [AttributePolarisationChannelsValues.HH] : []),
          ...(datasetParams.polarization === Polarization.DH
            ? [AttributePolarisationChannelsValues.HH_HV]
            : []),
        ],
        [AttributeNames.online]: [AttributeOnlineValues.online],
      },
    };
  }

  if (/^S2/.test(datasetId)) {
    return {
      id: 'S2',
      instrument: 'MSI',
      productType: getProductTypeFromDatasetId(datasetId),
      maxCC,
      selectedFilters: {
        [AttributeNames.online]: [AttributeOnlineValues.online],
      },
    };
  }

  if (/^S3/.test(datasetId)) {
    return {
      id: 'S3',
      instrument: dsh.datasetSearchIds[datasetId],
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }

  if (/^S5/.test(datasetId)) {
    return {
      id: 'S5P',
      instrument: 'TROPOMI',
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }

  return null;
};

export const findCollectionConfigById = (id) => collections.find((collection) => collection.id === id);

export const findInstrumentConfigById = (id) =>
  collections.flatMap((collection) => collection.instruments).find((instrument) => instrument.id === id);

export const findProductTypeConfigById = (id) =>
  collections
    .flatMap((collection) => collection.instruments)
    .flatMap((instrument) => instrument.productTypes)
    .find((productType) => productType.id === id);

export const findAdditionalFiltersConfigById = (collectionId, id) => {
  const collection = collections.find((collection) => collection.id === collectionId);
  if (!collection || !collection.additionalFilters) {
    return null;
  }
  return collection.additionalFilters.find((af) => af.id === id);
};

export const checkInstrumentSupports = (instrumentId, supportedProperty) => {
  const instrument = findInstrumentConfigById(instrumentId);

  if (!instrument) {
    throw new Error(`No instrument ${instrumentId} found`);
  }

  // only instruments that don't support supportedProperty have it explicitly set
  return instrument[`supports${supportedProperty}`] !== false;
};

export const checkAllInstrumentsInCollectionSupport = (collectionId, supportedProperty) => {
  const collection = findCollectionConfigById(collectionId);

  return collection.instruments.every((instrument) =>
    checkInstrumentSupports(instrument.id, supportedProperty),
  );
};

export const checkProductTypeSupports = (productTypeId, supportedProperty) => {
  const productType = findProductTypeConfigById(productTypeId);

  if (!productType) {
    throw new Error(`No product type ${productTypeId} found`);
  }

  // only products that don't support supportedProperty have it explicitly set
  return productType[`supports${supportedProperty}`] !== false;
};

export const checkAllProductsInInstrumentSupport = (instrumentId, supportedProperty) => {
  const instrument = findInstrumentConfigById(instrumentId);

  return instrument.productTypes.every((productType) =>
    checkProductTypeSupports(productType.id, supportedProperty),
  );
};

export const checkAllProductsInCollectionSupport = (collectionId, supportedProperty) => {
  const collection = findCollectionConfigById(collectionId);

  return collection.instruments.every((instrument) =>
    checkAllProductsInInstrumentSupport(instrument.id, supportedProperty),
  );
};

//creates timeIntervals filter
//(((date>=interval1From && date<interval1To) or (date>=interval2From && date<interval2To))...)
const createTimeIntervalsFilter = (timeIntervals) => {
  if (!(timeIntervals && timeIntervals.length)) {
    return null;
  }
  const timeIntervalsFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
  timeIntervals.forEach((interval) => {
    const timeIntervalFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
    timeIntervalFilter.expression(AttributeNames.sensingTime, ODataFilterOperator.ge, interval.fromTime);
    timeIntervalFilter.expression(AttributeNames.sensingTime, ODataFilterOperator.lt, interval.toTime);
    timeIntervalsFilter.or(timeIntervalFilter.getTree());
  });

  return timeIntervalsFilter.getTree();
};

// creates product type filter with geometry filter for products that support it
// (productType=Type.1 and intersects..)
const createProductTypeFilter = ({ productType, geometry }) => {
  const productTypeFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
  const productTypeConfig = findProductTypeConfigById(productType.id);

  if (Array.isArray(productTypeConfig.name)) {
    productTypeConfig.name.forEach((name) => {
      productTypeFilter.contains(AttributeNames.productName, name, 'string');
    });
  } else {
    productTypeFilter.contains(AttributeNames.productName, productTypeConfig.name, 'string');
  }

  if (productTypeConfig.notName !== undefined) {
    if (Array.isArray(productTypeConfig.notName)) {
      productTypeConfig.notName.forEach((notName) => {
        productTypeFilter.notContains(AttributeNames.productName, notName, 'string');
      });
    } else {
      productTypeFilter.notContains(AttributeNames.productName, productTypeConfig.notName, 'string');
    }
  }

  if (geometry && checkProductTypeSupports(productType.id, SUPPORTED_PROPERTIES.Geometry)) {
    const wkt = wellknown.stringify(geometry);
    productTypeFilter.intersects(wkt);
  }

  return productTypeFilter.getTree();
};

//creates productType filter
// (productTypeFilter1 or productTypeFilter2 ... )
const createProductTypesFilter = ({ instrument, geometry }) => {
  const hasProductTypeFilter = instrument.productTypes && instrument.productTypes.length;
  const allProductsSupportGeometry = checkAllProductsInInstrumentSupport(
    instrument.id,
    SUPPORTED_PROPERTIES.Geometry,
  );
  const instrumentSupportsInstrumentName = checkInstrumentSupports(
    instrument.id,
    SUPPORTED_PROPERTIES.InstrumentName,
  );

  // optimisation: geometry constraint can be applied on top level when all product types share the same constraint
  if (!hasProductTypeFilter && instrumentSupportsInstrumentName && allProductsSupportGeometry && geometry) {
    const geometryFilter = new ODataFilterBuilder();
    const wkt = wellknown.stringify(geometry);
    geometryFilter.intersects(wkt);
    return geometryFilter.getTree();
  }

  const productTypes = hasProductTypeFilter
    ? instrument.productTypes
    : findInstrumentConfigById(instrument.id).productTypes;

  const productTypesFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
  productTypes.forEach((productType) => {
    const productTypeFilter = createProductTypeFilter({ productType, geometry });
    productTypesFilter.add(productTypeFilter);
  });

  return productTypesFilter.getTree();
};

//creates instrument filter
//(instrument=Instrument.id and cloudCover=value and productFilter)
const createInstrumentFilter = ({ instrument, geometry }) => {
  const instrumentFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);

  //add instrument
  if (checkInstrumentSupports(instrument.id, SUPPORTED_PROPERTIES.InstrumentName)) {
    instrumentFilter.attribute(ODAtaAttributes.instrument, ODataFilterOperator.eq, instrument.id);
  }

  //add cloud coverage if it is supported
  //ignore cc if it is 100%
  if (
    instrument.cloudCover !== undefined &&
    instrument.cloudCover !== null &&
    instrument.cloudCover !== 100
  ) {
    instrumentFilter.attribute(ODAtaAttributes.cloudCover, ODataFilterOperator.le, instrument.cloudCover);
  }

  //add level 3 - product types
  const productTypesFilter = createProductTypesFilter({ instrument, geometry });
  if (productTypesFilter) {
    instrumentFilter.add(productTypesFilter);
  }
  return instrumentFilter.getTree();
};

//creates instruments filter
//(instrumentFilter1 or instrumentFilter2...)
const createInstrumentsFilter = ({ collection, geometry }) => {
  const hasInstrumentFilter = collection.instruments && collection.instruments.length;
  const allProductsSupportGeometry = checkAllProductsInCollectionSupport(
    collection.id,
    SUPPORTED_PROPERTIES.Geometry,
  );
  const allInstrumentsSupportInstrumentName = checkAllInstrumentsInCollectionSupport(
    collection.id,
    SUPPORTED_PROPERTIES.InstrumentName,
  );

  // optimisation: geometry constraint can be applied on top level when all product types share the same constraint
  if (!hasInstrumentFilter && allInstrumentsSupportInstrumentName && allProductsSupportGeometry && geometry) {
    const geometryFilter = new ODataFilterBuilder();
    const wkt = wellknown.stringify(geometry);
    geometryFilter.intersects(wkt);
    return geometryFilter.getTree();
  }

  const instruments = hasInstrumentFilter
    ? collection.instruments
    : findCollectionConfigById(collection.id).instruments;

  const instrumentsFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
  instruments.forEach((instrument) => {
    const instrumentFilter = createInstrumentFilter({ instrument, geometry });
    instrumentsFilter.add(instrumentFilter);
  });

  return instrumentsFilter.getTree();
};

const applyAdditionalFilterElement = (filter, additionalFilterConfig, key, operator, value) => {
  const { filterElement } = additionalFilterConfig;

  switch (filterElement) {
    case FilterElement.Expression:
      filter.expression(key, operator, value);
      break;
    case FilterElement.CustomFilter:
      if (!additionalFilterConfig.customFilter) {
        throw new Error(`Property customFilter for attribute ${additionalFilterConfig.id} is not defined!`);
      }
      const optionFilter = additionalFilterConfig.customFilter(key, value);
      if (optionFilter) {
        filter.add(FilterElement.CustomFilter(optionFilter));
      }
      break;
    default:
      filter.attribute(ODAtaAttributes[key], operator, value);
  }
};

//creates additional filters
//(additionalFilter1 and  additionalFilter2...)
const createAdditionalFilters = (collectionId, additionalFilters) => {
  if (!additionalFilters) {
    return null;
  }

  const filter = new ODataFilterBuilder(ExpressionTreeOperator.AND);
  Object.keys(additionalFilters).forEach((key) => {
    if (additionalFilters[key] === null || additionalFilters[key] === undefined) {
      return;
    }

    if (Array.isArray(additionalFilters[key]) && additionalFilters[key].length === 0) {
      return;
    }

    const additionalFilterConfig = findAdditionalFiltersConfigById(collectionId, key);

    if (!additionalFilterConfig) {
      console.error(`Configuration for filter ${key} for collection ${collectionId} is missing`);
      return;
    }

    if (Array.isArray(additionalFilters[key])) {
      const multiValueFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
      additionalFilters[key].forEach((option) => {
        applyAdditionalFilterElement(
          multiValueFilter,
          additionalFilterConfig,
          key,
          ODataFilterOperator.eq,
          option.value,
        );
      });
      filter.add(multiValueFilter.getTree());
    } else {
      applyAdditionalFilterElement(
        filter,
        additionalFilterConfig,
        key,
        ODataFilterOperator.eq,
        additionalFilters[key],
      );
    }
  });
  return filter.getTree();
};

//create collection filter
//(collectionName=Name && InstrumentFilters)
const createCollectionFilter = ({ collection, geometry }) => {
  const collectionFilter = new ODataFilterBuilder();

  //add collection id
  const label = findCollectionConfigById(collection.id)?.label;
  collectionFilter.expression(AttributeNames.collectionName, ODataFilterOperator.eq, `'${label}'`);

  //level2 - instruments
  const instrumentsFilter = createInstrumentsFilter({ collection, geometry });
  if (instrumentsFilter) {
    collectionFilter.and(instrumentsFilter);
  }

  //additional filters
  const additionalFilters = createAdditionalFilters(collection.id, collection.additionalFilters);
  if (additionalFilters) {
    collectionFilter.and(additionalFilters);
  }

  //apply online filter for collections which don't support filtering by product availability
  if (collection.additionalFilters?.[AttributeNames.online] === undefined) {
    collectionFilter.expression(AttributeNames.online, ODataFilterOperator.eq, true);
  }

  return collectionFilter.getTree();
};

//create collection filters
//(collectionFilter1 or collectionFilter2 ...)
const createCollectionsFilter = ({ collections, geometry }) => {
  if (!(collections && collections.length)) {
    return null;
  }

  const collectionsFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
  //level1 - collections
  collections.forEach((collection) => {
    const collectionFilter = createCollectionFilter({ collection, geometry });
    collectionsFilter.add(collectionFilter);
  });

  return collectionsFilter.getTree();
};

const createProductFilter = ({ fromTime, toTime, geometry, name, collections, timeIntervals }) => {
  const oDataFilterBuilder = new ODataFilterBuilder(ExpressionTreeOperator.AND);

  if (name) {
    oDataFilterBuilder.contains(AttributeNames.productName, name, 'string');
  }

  const collectionsFilter = createCollectionsFilter({ collections, geometry: roundGeometryValues(geometry) });
  if (collectionsFilter) {
    oDataFilterBuilder.and(collectionsFilter);
  }

  if (fromTime) {
    oDataFilterBuilder.expression(AttributeNames.sensingTime, ODataFilterOperator.ge, fromTime);
  }

  if (toTime) {
    oDataFilterBuilder.expression(AttributeNames.sensingTime, ODataFilterOperator.lt, toTime);
  }

  const timeIntervalsFilter = createTimeIntervalsFilter(timeIntervals);
  if (timeIntervalsFilter) {
    oDataFilterBuilder.and(timeIntervalsFilter);
  }

  return oDataFilterBuilder.getQueryString();
};

// this is done exclusively to keep the length of GET request below browser limit
export const roundGeometryValues = (sourceGeometry) => {
  const geometry = JSON.parse(JSON.stringify(sourceGeometry));

  Object.keys(geometry).forEach((key) => {
    if (typeof geometry[key] === 'object') {
      geometry[key] = roundGeometryValues(geometry[key]);
    }
    if (typeof geometry[key] === 'number') {
      geometry[key] = Math.round(geometry[key] * 100) / 100;
    }
  });

  return geometry;
};

/*
Construct query for basic search
*/
const createBasicSearchQuery = ({ fromTime, toTime, orbitDirection, geometry, datasetId, maxCC }) => {
  const oDataCollectionInfo = getODataCollectionInfoFromDatasetId(datasetId, {
    orbitDirection,
    maxCC,
  });
  let collections = [];
  if (oDataCollectionInfo) {
    collections = [
      {
        id: oDataCollectionInfo.id,
        instruments: [
          {
            id: oDataCollectionInfo.instrument,
            ...(oDataCollectionInfo.productType
              ? { productTypes: [{ id: oDataCollectionInfo.productType }] }
              : {}),
          },
        ],
        additionalFilters: oDataCollectionInfo.selectedFilters,
      },
    ];
  }

  const params = {
    collections,
    fromTime,
    geometry,
    toTime,
  };
  return createAdvancedSearchQuery(params);
};

/*
Construct query for advanced search
*/
const createAdvancedSearchQuery = (params) => {
  const filter = createProductFilter(params);
  const oqb = new ODataQueryBuilder(ODataEntity.Products)
    .filter(filter)
    .orderBy(AttributeNames.sensingTime, OrderingDirection.desc)
    .attributes()
    .count()
    .top(PAGE_SIZE)
    .assets();

  return oqb;
};

const getAttributeValue = (result, attributeName) => {
  const attribute = result.Attributes.find((attr) => attr.Name === attributeName);
  return attribute?.Value;
};

const getPreviewUrl = (result) => {
  return result?.Assets?.[0]?.DownloadLink;
};

const formatFileSize = (size) => {
  if (size === null || size === undefined) {
    return '';
  }
  const sizeMb = Math.round(size / (1024 * 1024));
  if (sizeMb < 1) {
    return `< 1MB`;
  }
  return `${sizeMb}MB`;
};

const formatSearchResults = (results) => {
  if (!results) {
    return null;
  }

  const converted = results.map((result) => {
    return {
      id: result.Id,
      name: result.Name,
      geometry: result.Footprint && wellknown.parse(result.Footprint.replace('geography', '')),
      previewUrl: getPreviewUrl(result),
      sensingTime: result['ContentDate']['Start'],
      platformShortName: getAttributeValue(result, AttributeNames.platformShortName),
      instrumentShortName: getAttributeValue(result, AttributeNames.instrumentShortName),
      productType: getAttributeValue(result, AttributeNames.productType),
      size: formatFileSize(result.ContentLength),
      originDate: result.OriginDate,
      publicationDate: result.PublicationDate,
      modificationDate: result.ModificationDate,
      online: result.Online,
      S3Path: result.S3Path,
      attributes: result.Attributes,
      contentLength: result.ContentLength,
    };
  });
  return converted;
};

const formatAttributesNames = (attribute) => {
  return FormatedAttributeNames[attribute] ? FormatedAttributeNames[attribute]() : attribute;
};

const oDataHelpers = {
  createBasicSearchQuery: createBasicSearchQuery,
  createAdvancedSearchQuery: createAdvancedSearchQuery,
  formatSearchResults: formatSearchResults,
  formatAttributesNames: formatAttributesNames,
};

export const SUPPORTED_PROPERTIES = {
  Geometry: 'Geometry',
  InstrumentName: 'InstrumentName',
};

export default oDataHelpers;
