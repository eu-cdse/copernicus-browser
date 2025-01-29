import * as wellknown from 'wellknown';
import { ODataFilterBuilder } from './ODataFilterBuilder';
import { ODataQueryBuilder } from './ODataQueryBuilder';
import { ODataCollections, ODataEntity, ODataFilterOperator, OrderingDirection } from './ODataTypes';
import { ExpressionTreeOperator } from './ExpressionTree';
import {
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
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
  COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
  S1_MONTHLY_MOSAIC_IW,
  S1_MONTHLY_MOSAIC_DH,
  S3OLCIL2_LAND,
  S3OLCIL2_WATER,
} from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import {
  AttributeNames,
  AttributeOnlineValues,
  AttributeOperationalModeValues,
  AttributeOrbitDirectionValues,
  AttributePlatformSerialIdentifierValues,
  AttributePolarisationChannelsValues,
  FormatedAttributeNames,
  ODataAttributes,
} from './assets/attributes';
import Sentinel1DataSourceHandler from '../../Tools/SearchPanel/dataSourceHandlers/Sentinel1DataSourceHandler';
import { Polarization } from '@sentinel-hub/sentinelhub-js';
import { collections } from '../../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/collectionFormConfig';
import { FilterElement } from './FilterElement';
import moment from 'moment';
import { isFunction } from '../../utils';

export const PAGE_SIZE = 50;

export const MIN_SEARCH_DATE = moment.utc('2000-01-01').startOf('day');

// S1 is not included as it's handled manually
const PRODUCT_TYPE_TO_DATASETID = {
  S2MSI1C: S2_L1C_CDAS,
  S2MSI2A: S2_L2A_CDAS,
  OL_1_EFR___: S3OLCI_CDAS,
  SL_1_RBT___: S3SLSTR_CDAS,
  OL_2_LFR___: S3OLCIL2_LAND,
  OL_2_WFR___: S3OLCIL2_WATER,
  L2__AER_AI: S5_AER_AI_CDAS,
  //L2__AER_LH
  L2__CH4___: S5_CH4_CDAS,
  L2__CLOUD_: S5_CLOUD_CDAS,
  L2__CO____: S5_CO_CDAS,
  L2__HCHO__: S5_HCHO_CDAS,
  L2__NO2___: S5_NO2_CDAS,
  L2__O3____: S5_O3_CDAS,
  L2__SO2___: S5_SO2_CDAS,
  'COP-DEM_GLO-30-DGED': DEM_COPERNICUS_30_CDAS,
  'COP-DEM_GLO-90-DGED': DEM_COPERNICUS_90_CDAS,
  S2MSI_L3__MCQ: COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
  S1SAR_L3_IW_MCM: S1_MONTHLY_MOSAIC_IW,
  S1SAR_L3_DH_MCM: S1_MONTHLY_MOSAIC_DH,
};

export const getDatasetIdFromProductType = (productType, attributes) => {
  if (!productType) {
    return null;
  }

  if (/(1S|1S-COG)$/.test(productType)) {
    const polarisationChannels = attributes.filter(
      (attribute) => attribute?.Name === AttributeNames.polarisationChannels,
    );

    const platformSerialIdentifier = attributes.find(
      (attribute) => attribute?.Name === AttributeNames.platformSerialIdentifier,
    );
    if (
      platformSerialIdentifier &&
      platformSerialIdentifier.Value === AttributePlatformSerialIdentifierValues.S1C.value
    ) {
      return null;
    }

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

  if (/^SAR_DGE_/.test(productType)) {
    if (/DGE_30/.test(productType)) {
      return PRODUCT_TYPE_TO_DATASETID['COP-DEM_GLO-30-DGED'];
    }
    if (/DGE_90/.test(productType)) {
      return PRODUCT_TYPE_TO_DATASETID['COP-DEM_GLO-90-DGED'];
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
      id: ODataCollections.S1.id,
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

  if (datasetId === S1_MONTHLY_MOSAIC_DH || datasetId === S1_MONTHLY_MOSAIC_IW) {
    return {
      id: ODataCollections.GLOBAL_MOSAICS.id,
      instrument: 'S1Mosaics',
      productType: datasetId === S1_MONTHLY_MOSAIC_DH ? '_DH_mosaic_' : '_IW_mosaic_',
    };
  }

  if (datasetId === COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC) {
    return {
      id: ODataCollections.GLOBAL_MOSAICS.id,
      instrument: 'S2Mosaics',
      productType: 'S2MSI_L3__MCQ',
    };
  }

  if (/^S2/.test(datasetId)) {
    return {
      id: ODataCollections.S2.id,
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
      id: ODataCollections.S3.id,
      instrument: dsh.datasetSearchIds[datasetId],
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }

  if (/^S5/.test(datasetId)) {
    return {
      id: ODataCollections.S5P.id,
      instrument: 'TROPOMI',
      productType: getProductTypeFromDatasetId(datasetId),
    };
  }

  if (/^DEM/.test(datasetId)) {
    return {
      id: 'DEM',
      instrument: 'open',
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

export const checkCollectionSupports = (collectionId, supportedProperty) => {
  const collection = findCollectionConfigById(collectionId);

  if (!collection) {
    throw new Error(`No collection ${collection} found`);
  }

  return collection[supportedProperty] !== false;
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

  return collection.instruments?.every((instrument) =>
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
const createProductTypeFilter = ({ productTypeId, productTypeConfig, geometry }) => {
  const productTypeFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);

  if (productTypeConfig.customFilterExpression) {
    productTypeFilter.addExpression(productTypeConfig.customFilterExpression);
  } else if (productTypeConfig.customFilterQueryByDatasetFull) {
    productTypeFilter.attribute(ODataAttributes.datasetFull, ODataFilterOperator.eq, productTypeId);
  } else if (productTypeConfig.customFilterQueryByProductType) {
    productTypeFilter.attribute(ODataAttributes.productType, ODataFilterOperator.eq, productTypeId);
  } else if (Array.isArray(productTypeConfig.name)) {
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

  if (geometry && checkProductTypeSupports(productTypeConfig.id, SUPPORTED_PROPERTIES.Geometry)) {
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
  productTypes.forEach((prodType) => {
    const productTypeConfig = findProductTypeConfigById(prodType.id);
    const productTypeIds =
      productTypeConfig.productTypeIds && productTypeConfig.productTypeIds.length > 0
        ? productTypeConfig.productTypeIds
        : [productTypeConfig.id];

    productTypeIds.forEach((productTypeId) => {
      const productTypeFilter = createProductTypeFilter({
        productTypeId,
        productTypeConfig,
        geometry,
      });
      productTypesFilter.add(productTypeFilter);
    });
  });

  return productTypesFilter.getTree();
};

//creates instrument filter
//(instrument=Instrument.id and cloudCover=value and productFilter)
const createInstrumentFilter = ({ instrument, geometry }) => {
  const instrumentFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);

  //add instrument
  if (checkInstrumentSupports(instrument.id, SUPPORTED_PROPERTIES.InstrumentName)) {
    const instrumentConfig = findInstrumentConfigById(instrument.id);
    instrumentFilter.addExpression(
      instrumentConfig?.customFilterExpression
        ? instrumentConfig.customFilterExpression
        : FilterElement.Attribute(ODataAttributes.instrument, ODataFilterOperator.eq, instrument.id),
    );
  }

  //add cloud coverage if it is supported
  //ignore cc if it is 100%
  if (
    instrument.cloudCover !== undefined &&
    instrument.cloudCover !== null &&
    instrument.cloudCover !== 100
  ) {
    instrumentFilter.attribute(ODataAttributes.cloudCover, ODataFilterOperator.le, instrument.cloudCover);
  }

  // add level 3 - product types
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
      filter.attribute(ODataAttributes[key], operator, value);
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

    let additionalFilter = Array.isArray(additionalFilters[key])
      ? [...additionalFilters[key]]
      : additionalFilters[key];
    const additionalFilterConfig = findAdditionalFiltersConfigById(collectionId, key);

    if (!additionalFilterConfig) {
      console.error(`Configuration for filter ${key} for collection ${collectionId} is missing`);
      return;
    }

    if (additionalFilterConfig.preProcessFilters && isFunction(additionalFilterConfig.preProcessFilters)) {
      additionalFilter = additionalFilterConfig.preProcessFilters(additionalFilter);
    }

    if (Array.isArray(additionalFilter)) {
      const multiValueFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);
      additionalFilter.forEach((option) => {
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
        additionalFilter,
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
  const collectionConfig = findCollectionConfigById(collection.id);
  if (collectionConfig?.supportsCollectionName === undefined || !!collectionConfig?.supportsCollectionName) {
    collectionFilter.addExpression(
      collectionConfig?.customFilterExpression
        ? collectionConfig?.customFilterExpression
        : FilterElement.Expression(
            AttributeNames.collectionName,
            ODataFilterOperator.eq,
            `'${
              collectionConfig?.collectionName ? collectionConfig?.collectionName : collectionConfig?.label
            }'`,
          ),
    );
  }

  // level 2 - instruments
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
  // level 1 - collections
  collections.forEach((collection) => {
    const collectionFilter = createCollectionFilter({ collection, geometry });
    collectionsFilter.add(collectionFilter);
  });

  return collectionsFilter.getTree();
};

const createCollectionGroupFilter = ({
  collections,
  geometry,
  fromTime,
  toTime,
  timeIntervals,
  supportsDates,
}) => {
  const collectionGroupFilter = new ODataFilterBuilder(ExpressionTreeOperator.AND);

  const collectionsFilter = createCollectionsFilter({ collections, geometry: roundGeometryValues(geometry) });
  if (collectionsFilter) {
    collectionGroupFilter.and(collectionsFilter);
  }

  if (supportsDates) {
    if (fromTime) {
      collectionGroupFilter.expression(AttributeNames.sensingTime, ODataFilterOperator.ge, fromTime);
    }

    if (toTime) {
      collectionGroupFilter.expression(AttributeNames.sensingTime, ODataFilterOperator.lt, toTime);
    }

    const timeIntervalsFilter = createTimeIntervalsFilter(timeIntervals);
    if (timeIntervalsFilter) {
      collectionGroupFilter.and(timeIntervalsFilter);
    }
  }

  return collectionGroupFilter.getTree();
};

const createCollectionGroupsFilter = (
  { collections, geometry, fromTime, toTime, timeIntervals },
  groupBy,
) => {
  if (!collections) {
    return null;
  }

  const collectionGroup = new Map();

  collections.forEach((collection) => {
    const supports = checkCollectionSupports(collection.id, groupBy);
    if (collectionGroup.has(supports)) {
      collectionGroup.get(supports).push(collection);
    } else {
      collectionGroup.set(supports, [collection]);
    }
  });

  const collectionGroupsFilter = new ODataFilterBuilder(ExpressionTreeOperator.OR);

  collectionGroup.forEach((collectionGroup, supports) => {
    const collectionGroupFilter = createCollectionGroupFilter({
      collections: collectionGroup,
      geometry,
      fromTime,
      toTime,
      timeIntervals,
      [groupBy]: supports,
    });
    if (collectionGroupFilter) {
      collectionGroupsFilter.or(collectionGroupFilter);
    }
  });

  return collectionGroupsFilter.getTree();
};

const createProductFilter = ({ fromTime, toTime, geometry, name, collections, timeIntervals }) => {
  const oDataFilterBuilder = new ODataFilterBuilder(ExpressionTreeOperator.AND);

  if (name) {
    oDataFilterBuilder.contains(AttributeNames.productName, name, 'string');
  }

  const collectionGroupsFilter = createCollectionGroupsFilter(
    {
      fromTime,
      toTime,
      geometry,
      collections,
      timeIntervals,
    },
    'supportsDates',
  );

  if (collectionGroupsFilter) {
    oDataFilterBuilder.and(collectionGroupsFilter);
  } else {
    // apply dates when no collection is selected - search by product name only
    if (fromTime) {
      oDataFilterBuilder.expression(AttributeNames.sensingTime, ODataFilterOperator.ge, fromTime);
    }

    if (toTime) {
      oDataFilterBuilder.expression(AttributeNames.sensingTime, ODataFilterOperator.lt, toTime);
    }

    if (geometry) {
      const wkt = wellknown.stringify(geometry);
      oDataFilterBuilder.intersects(wkt);
    }

    const timeIntervalsFilter = createTimeIntervalsFilter(timeIntervals);
    if (timeIntervalsFilter) {
      oDataFilterBuilder.and(timeIntervalsFilter);
    }
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
        ...(oDataCollectionInfo.instrument
          ? {
              instruments: oDataCollectionInfo.instrument
                ? [
                    {
                      id: oDataCollectionInfo.instrument,
                      ...(oDataCollectionInfo.maxCC ? { cloudCover: oDataCollectionInfo.maxCC } : {}),
                      ...(oDataCollectionInfo.productType
                        ? { productTypes: [{ id: oDataCollectionInfo.productType }] }
                        : {}),
                    },
                  ]
                : [],
            }
          : {}),
        additionalFilters: oDataCollectionInfo.selectedFilters,
      },
    ];
  }

  const params = {
    collections,
    geometry,
    fromTime,
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
