import { ODataCollections } from '../api/OData/ODataTypes';
import { t } from 'ttag';
import moment from 'moment';
import {
  CCM_COLLECTION_NAME,
  STAC_BASE_IDS,
  STAC_COLLECTIONS,
  STAC_FILTER_TOKEN_LITERAL,
  STAC_PROCESSING_SUFFIXES,
  STAC_SUFFIX,
  STAC_TIMELINESS_SUFFIXES,
  STAC_TIMELINESS_SUFFIXES_NRT,
  STAC_TIMELINESS_SUFFIXES_NRT_NTC,
  STAC_TIMELINESS_SUFFIXES_NRT_NTC_STC,
  STAC_TIMELINESS_SUFFIXES_NTC,
  STAC_TIMELINESS_SUFFIXES_NTC_STC,
  getCcmAvailabilityLabels,
  getCcmCollectionsFromDatasetValues,
  getClmsAvailabilityLabels,
  getCollectionNames,
  getDatasetFullValues,
  getProductTypeAttributeValues,
  getDemCollectionsFromDatasetValues,
  ccmProductLabels,
} from './stac.utils';

const STAC_BASEURL =
  global.window?.API_ENDPOINT_CONFIG?.STAC_BASEURL || 'https://stac.dataspace.copernicus.eu';

const stacCollectionInfoCache = new Map();
const stacCollectionInfoInFlight = new Map();

const PRODUCT_TYPES = {
  S1: {
    SLC: 'SLC',
    WV: 'WV',
    GRD: 'GRD',
    GRD_COG: 'GRD-COG',
  },
  S2: {
    L1C: 'L1C',
    L2A: 'L2A',
    GRI: 'GRI',
  },
  GLOBAL_MOSAICS: {
    S1_IW_MOSAIC: '_IW_mosaic_',
    S2_L3_MCQ: 'S2MSI_L3__MCQ',
    S2_MSI: 'S2MSI',
  },
  LANDSAT: {
    OLI: 'OLI',
    TIRS: 'TIRS',
  },
};

const resolveRequestedTimelinessSuffixes = (filterContains) => {
  const requested = [];
  if (filterContains(STAC_FILTER_TOKEN_LITERAL.NR)) {
    requested.push(STAC_SUFFIX.NRT);
  }
  if (filterContains(STAC_FILTER_TOKEN_LITERAL.ST)) {
    requested.push(STAC_SUFFIX.STC);
  }
  if (filterContains(STAC_FILTER_TOKEN_LITERAL.NT)) {
    requested.push(STAC_SUFFIX.NTC);
  }
  return requested;
};

const resolveProcessingModeSuffixes = (filterContains) => {
  if (filterContains(STAC_FILTER_TOKEN_LITERAL.NRTI)) {
    return [STAC_SUFFIX.NRTI];
  }
  if (filterContains(STAC_FILTER_TOKEN_LITERAL.OFFL)) {
    return [STAC_SUFFIX.OFFL];
  }
  if (filterContains(STAC_FILTER_TOKEN_LITERAL.RPRO)) {
    return [STAC_SUFFIX.RPRO];
  }
  return STAC_PROCESSING_SUFFIXES;
};

const resolveTimelinessSuffixes = (filterContains) => {
  const requested = resolveRequestedTimelinessSuffixes(filterContains);
  return requested.length ? requested : STAC_TIMELINESS_SUFFIXES;
};

const filterAllowedTimelinessSuffixes = (filterContains, allowedSuffixes) => {
  const requested = resolveRequestedTimelinessSuffixes(filterContains);
  if (!requested.length) {
    return allowedSuffixes;
  }
  return requested.filter((suffix) => allowedSuffixes.includes(suffix));
};

// Dynamic STAC collection determination based on filter analysis
const getStacCollectionsFromFilter = (filterString) => {
  const collections = [];
  const collectionNames = getCollectionNames(filterString);
  const uniqueCollectionNames = [...new Set(collectionNames)];
  const datasetFullValues = getDatasetFullValues(filterString);
  const filterContains = (value) => !!filterString && filterString.includes(value);
  // Use exact attribute value matching for product types to avoid substring collisions
  // (e.g. 'GRD' must not match 'GRD-COG'). filterContains is kept for timeliness tokens
  // and Global Mosaics patterns which use different filter structures.
  const productTypeSet = new Set(getProductTypeAttributeValues(filterString));
  const hasProductType = (...productTypes) => productTypes.some((type) => productTypeSet.has(type));
  const addWithSuffixes = (baseId, suffixes) =>
    suffixes.forEach((suffix) => collections.push(`${baseId}-${suffix}`));

  for (const collectionName of uniqueCollectionNames) {
    switch (collectionName) {
      case ODataCollections.S1.label: {
        // SENTINEL-1
        const hasSLC = hasProductType(PRODUCT_TYPES.S1.SLC);
        const hasWV = hasProductType(PRODUCT_TYPES.S1.WV);
        const hasGRD = hasProductType(PRODUCT_TYPES.S1.GRD);
        const hasGRDCOG = hasProductType(PRODUCT_TYPES.S1.GRD_COG);
        const hasAnyGRD = hasGRD || hasGRDCOG;

        if (hasSLC && hasWV) {
          collections.push(STAC_COLLECTIONS.SENTINEL_1_SLC_WV);
        } else if (hasSLC) {
          collections.push(STAC_COLLECTIONS.SENTINEL_1_SLC);
        }
        if (hasAnyGRD) {
          collections.push(STAC_COLLECTIONS.SENTINEL_1_GRD);
        }
        if (!hasSLC && !hasAnyGRD) {
          collections.push(
            STAC_COLLECTIONS.SENTINEL_1_GRD,
            STAC_COLLECTIONS.SENTINEL_1_SLC,
            STAC_COLLECTIONS.SENTINEL_1_SLC_WV,
          );
        }
        break;
      }

      case ODataCollections.S2.label: {
        // SENTINEL-2
        const hasL1C = hasProductType(PRODUCT_TYPES.S2.L1C);
        const hasL2A = hasProductType(PRODUCT_TYPES.S2.L2A);

        if (hasL1C) {
          collections.push(STAC_COLLECTIONS.SENTINEL_2_L1C);
        }
        if (hasL2A) {
          collections.push(STAC_COLLECTIONS.SENTINEL_2_L2A);
        }
        if (!hasL1C && !hasL2A) {
          collections.push(STAC_COLLECTIONS.SENTINEL_2_L1C, STAC_COLLECTIONS.SENTINEL_2_L2A);
        }
        if (filterContains(PRODUCT_TYPES.S2.GRI)) {
          collections.push(STAC_COLLECTIONS.SENTINEL_2_GRI_L1C, STAC_COLLECTIONS.SENTINEL_2_GRI_L1C_GCP);
        }
        break;
      }

      case ODataCollections.S3.label: {
        // SENTINEL-3
        const addS3WithTimeliness = (baseId, allowedSuffixes) => {
          const suffixes = filterAllowedTimelinessSuffixes(filterContains, allowedSuffixes);
          addWithSuffixes(baseId, suffixes);
        };

        if (hasProductType('OL_1_EFR___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_OLCI_1_EFR, STAC_TIMELINESS_SUFFIXES_NRT_NTC);
        }
        if (hasProductType('OL_1_ERR___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_OLCI_1_ERR, STAC_TIMELINESS_SUFFIXES_NRT_NTC);
        }
        if (hasProductType('OL_2_LFR___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_OLCI_2_LFR, STAC_TIMELINESS_SUFFIXES_NRT_NTC);
        }
        if (hasProductType('OL_2_LRR___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_OLCI_2_LRR, STAC_TIMELINESS_SUFFIXES_NRT_NTC);
        }
        if (hasProductType('OL_2_WFR___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_OLCI_2_WFR, STAC_TIMELINESS_SUFFIXES_NRT_NTC);
        }
        if (hasProductType('OL_2_WRR___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_OLCI_2_WRR, STAC_TIMELINESS_SUFFIXES_NRT_NTC);
        }

        if (hasProductType('SR_1_SRA___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SR_1_SRA, STAC_TIMELINESS_SUFFIXES_NRT_NTC_STC);
        }
        if (hasProductType('SR_1_SRA_A_')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SR_1_SRA_A, STAC_TIMELINESS_SUFFIXES_NRT_NTC_STC);
        }
        if (hasProductType('SR_2_LAN___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SR_2_LAN, STAC_TIMELINESS_SUFFIXES_NRT_NTC_STC);
        }
        if (hasProductType('SR_2_LAN_HY')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SR_2_LAN_HY, STAC_TIMELINESS_SUFFIXES_NRT_NTC_STC);
        }
        if (hasProductType('SR_2_LAN_SI')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SR_2_LAN_SI, STAC_TIMELINESS_SUFFIXES_NRT_NTC_STC);
        }
        if (hasProductType('SR_2_LAN_LI')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SR_2_LAN_LI, STAC_TIMELINESS_SUFFIXES_NRT_NTC_STC);
        }
        if (hasProductType('SR_2_WAT___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SR_2_WAT, STAC_TIMELINESS_SUFFIXES_NRT_NTC_STC);
        }

        if (hasProductType('SL_1_RBT___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SL_1_RBT, STAC_TIMELINESS_SUFFIXES_NRT_NTC);
        }
        if (hasProductType('SL_2_AOD___')) {
          addWithSuffixes(STAC_BASE_IDS.S3_SL_2_AOD, STAC_TIMELINESS_SUFFIXES_NRT);
        }
        if (hasProductType('SL_2_FRP___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SL_2_FRP, STAC_TIMELINESS_SUFFIXES_NRT_NTC);
        }
        if (hasProductType('SL_2_LST___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SL_2_LST, STAC_TIMELINESS_SUFFIXES_NRT_NTC);
        }
        if (hasProductType('SL_2_WST___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SL_2_WST, STAC_TIMELINESS_SUFFIXES_NRT_NTC);
        }

        if (hasProductType('SY_2_AOD___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SYN_2_AOD, STAC_TIMELINESS_SUFFIXES_NTC);
        }
        if (hasProductType('SY_2_SYN___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SYN_2_SYN, STAC_TIMELINESS_SUFFIXES_NTC_STC);
        }
        if (hasProductType('SY_2_V10___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SYN_2_V10, STAC_TIMELINESS_SUFFIXES_NTC_STC);
        }
        if (hasProductType('SY_2_VG1___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SYN_2_VG1, STAC_TIMELINESS_SUFFIXES_NTC_STC);
        }
        if (hasProductType('SY_2_VGP___')) {
          addS3WithTimeliness(STAC_BASE_IDS.S3_SYN_2_VGP, STAC_TIMELINESS_SUFFIXES_NTC_STC);
        }

        break;
      }

      case ODataCollections.S5P.label: {
        // SENTINEL-5P
        const collectionsCountBeforeCollection = collections.length;
        const processingModes = resolveProcessingModeSuffixes(filterContains);
        const addS5P = (baseId) => addWithSuffixes(`sentinel-5p-${baseId}`, processingModes);

        if (hasProductType('L1B_RA_BD1')) {
          addS5P('l1-ra-bd1');
        }
        if (hasProductType('L1B_RA_BD2')) {
          addS5P('l1-ra-bd2');
        }
        if (hasProductType('L1B_RA_BD3')) {
          addS5P('l1-ra-bd3');
        }
        if (hasProductType('L1B_RA_BD4')) {
          addS5P('l1-ra-bd4');
        }
        if (hasProductType('L1B_RA_BD5')) {
          addS5P('l1-ra-bd5');
        }
        if (hasProductType('L1B_RA_BD6')) {
          addS5P('l1-ra-bd6');
        }
        if (hasProductType('L1B_RA_BD7')) {
          addS5P('l1-ra-bd7');
        }
        if (hasProductType('L1B_RA_BD8')) {
          addS5P('l1-ra-bd8');
        }

        if (hasProductType('L2__AER_AI')) {
          addS5P('l2-aer-ai');
        }
        if (hasProductType('L2__AER_LH')) {
          addS5P('l2-aer-lh');
        }
        if (hasProductType('L2__CH4___')) {
          addS5P('l2-ch4');
        }
        if (hasProductType('L2__CLOUD_')) {
          addS5P('l2-cloud');
        }
        if (hasProductType('L2__CO____')) {
          addS5P('l2-co');
        }
        if (hasProductType('L2__HCHO__')) {
          addS5P('l2-hcho');
        }
        if (hasProductType('L2__NO2___')) {
          addS5P('l2-no2');
        }
        if (hasProductType('L2__NP_BD3')) {
          addS5P('l2-np-bd3');
        }
        if (hasProductType('L2__NP_BD6')) {
          addS5P('l2-np-bd6');
        }
        if (hasProductType('L2__NP_BD7')) {
          addS5P('l2-np-bd7');
        }
        if (hasProductType('L2__O3____')) {
          addS5P('l2-o3');
        }
        if (hasProductType('L2__O3_TCL')) {
          addS5P('l2-o3-tcl');
        }
        if (hasProductType('L2__O3__PR')) {
          addS5P('l2-o3-pr');
        }
        if (hasProductType('L2__SO2___')) {
          addS5P('l2-so2');
        }

        if (collections.length === collectionsCountBeforeCollection) {
          // Keep broad S5P searches useful by defaulting to all mapped L2 products.
          [
            'l2-aer-ai',
            'l2-aer-lh',
            'l2-ch4',
            'l2-cloud',
            'l2-co',
            'l2-hcho',
            'l2-no2',
            'l2-np-bd3',
            'l2-np-bd6',
            'l2-np-bd7',
            'l2-o3',
            'l2-o3-tcl',
            'l2-o3-pr',
            'l2-so2',
          ].forEach(addS5P);
        }

        break;
      }

      case ODataCollections.S6.label: {
        // SENTINEL-6
        const timelinessSuffixes = resolveTimelinessSuffixes(filterContains);
        addWithSuffixes(STAC_BASE_IDS.S6_P4_1B, timelinessSuffixes);
        addWithSuffixes(STAC_BASE_IDS.S6_P4_2, timelinessSuffixes);
        addWithSuffixes(STAC_BASE_IDS.S6_AMR_C, timelinessSuffixes);
        break;
      }

      case ODataCollections.GLOBAL_MOSAICS.collection:
      case ODataCollections.GLOBAL_MOSAICS.label: {
        if (filterContains(PRODUCT_TYPES.GLOBAL_MOSAICS.S1_IW_MOSAIC)) {
          collections.push(STAC_COLLECTIONS.SENTINEL_1_GLOBAL_MOSAICS);
        }
        if (
          filterContains(PRODUCT_TYPES.GLOBAL_MOSAICS.S2_L3_MCQ) ||
          filterContains(PRODUCT_TYPES.GLOBAL_MOSAICS.S2_MSI)
        ) {
          collections.push(STAC_COLLECTIONS.SENTINEL_2_GLOBAL_MOSAICS);
        }
        if (
          !filterContains(PRODUCT_TYPES.GLOBAL_MOSAICS.S1_IW_MOSAIC) &&
          !filterContains(PRODUCT_TYPES.GLOBAL_MOSAICS.S2_L3_MCQ) &&
          !filterContains(PRODUCT_TYPES.GLOBAL_MOSAICS.S2_MSI)
        ) {
          collections.push(
            STAC_COLLECTIONS.SENTINEL_1_GLOBAL_MOSAICS,
            STAC_COLLECTIONS.SENTINEL_2_GLOBAL_MOSAICS,
          );
        }
        break;
      }

      case CCM_COLLECTION_NAME: {
        const demCollections = getDemCollectionsFromDatasetValues(datasetFullValues);
        if (demCollections.length > 0) {
          collections.push(...demCollections);
        }

        const ccmCollections = getCcmCollectionsFromDatasetValues(datasetFullValues);
        if (ccmCollections.length > 0) {
          collections.push(...ccmCollections);
        } else if (demCollections.length === 0) {
          collections.push(STAC_COLLECTIONS.CCM_OPTICAL, STAC_COLLECTIONS.CCM_SAR);
        }

        break;
      }

      case ODataCollections.DEM.label: {
        const demCollections = getDemCollectionsFromDatasetValues(datasetFullValues);
        if (demCollections.length > 0) {
          collections.push(...demCollections);
        } else {
          collections.push(
            STAC_COLLECTIONS.COP_DEM_EEA_10_LAEA_TIF,
            STAC_COLLECTIONS.COP_DEM_GLO_30_DGED_COG,
            STAC_COLLECTIONS.COP_DEM_GLO_90_DGED_COG,
          );
        }
        break;
      }

      case ODataCollections.LANDSAT8.collection:
      case ODataCollections.LANDSAT8.label:
      case ODataCollections.LANDSAT9.collection:
      case ODataCollections.LANDSAT9.label: {
        const hasOLI = hasProductType(PRODUCT_TYPES.LANDSAT.OLI);
        const hasTIRS = hasProductType(PRODUCT_TYPES.LANDSAT.TIRS);

        if (hasOLI && hasTIRS) {
          collections.push(STAC_COLLECTIONS.LANDSAT_C2_L1_OLI_TIRS);
        } else if (hasTIRS) {
          collections.push(STAC_COLLECTIONS.LANDSAT_C2_L1_TIRS);
        } else if (hasOLI) {
          collections.push(STAC_COLLECTIONS.LANDSAT_C2_L1_OLI);
        } else {
          collections.push(
            STAC_COLLECTIONS.LANDSAT_C2_L1_OLI,
            STAC_COLLECTIONS.LANDSAT_C2_L1_TIRS,
            STAC_COLLECTIONS.LANDSAT_C2_L1_OLI_TIRS,
          );
        }
        break;
      }

      case ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.collection:
      case ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.label:
      case ODataCollections.CLMS_PRIORITY_AREA_MONITORING.collection:
      case ODataCollections.CLMS_PRIORITY_AREA_MONITORING.label: {
        // No dedicated STAC collections exposed for these CLMS products yet
        break;
      }

      case ODataCollections.CLMS_LAND_COVER_AND_LAND_USE_MAPPING.collection:
      case ODataCollections.CLMS_LAND_COVER_AND_LAND_USE_MAPPING.label: {
        // CLMS Urban Atlas vector datasets are available in STAC
        collections.push(
          STAC_COLLECTIONS.CLMS_URBAN_ATLAS_LAND_COVER_USE,
          STAC_COLLECTIONS.CLMS_URBAN_ATLAS_LAND_COVER_USE_CHANGE,
          STAC_COLLECTIONS.CLMS_URBAN_ATLAS_STREET_TREE,
        );
        break;
      }

      case ODataCollections.COMPLEMENTARY_DATA.label:
        // Complementary Data has no dedicated STAC collections
        break;

      default:
        console.warn(`Unknown collection: ${collectionName}`);
    }
  }

  return [...new Set(collections)];
};

let allCollectionsCache = undefined; // undefined = not yet fetched, Map = success
let allCollectionsInFlight = null;

const fetchWithAuthFallback = async (fetchFn, authToken) => {
  let response;
  try {
    response = await fetchFn(Boolean(authToken));
  } catch (error) {
    if (!authToken) {
      throw error;
    }
    response = await fetchFn(false);
  }
  if ((response.status === 401 || response.status === 403) && authToken) {
    response = await fetchFn(false);
  }
  return response;
};

const getAllStacCollections = async (authToken) => {
  if (allCollectionsCache !== undefined) {
    return allCollectionsCache;
  }

  if (allCollectionsInFlight) {
    return allCollectionsInFlight;
  }

  const url = `${STAC_BASEURL}/v1/collections?limit=200`;
  const fetchAll = async (includeAuth) => {
    const headers = {};
    if (includeAuth && authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return fetch(url, { headers });
  };

  const requestPromise = (async () => {
    try {
      const response = await fetchWithAuthFallback(fetchAll, authToken);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const collections = data?.collections;

      if (!Array.isArray(collections)) {
        return null;
      }

      const collectionsMap = new Map();
      for (const collection of collections) {
        if (collection.id) {
          collectionsMap.set(collection.id, collection);
        }
      }

      allCollectionsCache = collectionsMap;
      return collectionsMap;
    } catch (error) {
      console.warn('Failed to fetch STAC collections list', error);
      return null;
    } finally {
      allCollectionsInFlight = null;
    }
  })();

  allCollectionsInFlight = requestPromise;
  return requestPromise;
};

const formatStacDate = (isoString, fallback = 'unknown') => {
  if (!isoString) {
    return fallback;
  }
  const m = moment.utc(isoString);
  if (!m.isValid()) {
    return fallback;
  }
  return m.format('D MMM YYYY');
};

// Get STAC temporal extent for a collection
const getStacCollectionInfo = async (collectionId, authToken) => {
  if (stacCollectionInfoCache.has(collectionId)) {
    return stacCollectionInfoCache.get(collectionId);
  }

  if (stacCollectionInfoInFlight.has(collectionId)) {
    return stacCollectionInfoInFlight.get(collectionId);
  }

  const url = `${STAC_BASEURL}/v1/collections/${collectionId}`;
  const fetchCollection = async (includeAuth) => {
    const headers = {};
    if (includeAuth && authToken) {
      headers.Authorization = `Bearer ${authToken}`;
    }
    return fetch(url, { headers });
  };

  const requestPromise = (async () => {
    try {
      const response = await fetchWithAuthFallback(fetchCollection, authToken);

      if (!response.ok) {
        return null;
      }

      const data = await response.json();
      const interval = data?.extent?.temporal?.interval?.[0];

      if (!interval) {
        return null;
      }

      const [start, end] = interval;
      const startDate = formatStacDate(start, t`unknown`);
      const endDate = formatStacDate(end, t`ongoing`);

      const info = {
        title: data?.title || collectionId,
        extent: `${startDate} to ${endDate}`,
      };

      stacCollectionInfoCache.set(collectionId, info);
      return info;
    } catch (error) {
      console.warn(`Failed to fetch STAC collection info for ${collectionId}`, error);
      return null;
    } finally {
      stacCollectionInfoInFlight.delete(collectionId);
    }
  })();

  stacCollectionInfoInFlight.set(collectionId, requestPromise);
  return requestPromise;
};

// Matches a processing/timeliness mode tag at the end of a STAC collection title, e.g. "(OFFL)" or "(NRT)"
const MODE_TAG_REGEX = /\s*\((NRTI|OFFL|RPRO|NRT|NTC|STC)\)$/;

const formatAvailabilityMessage = (availabilities) => {
  // Collapse processing/timeliness mode variants into one line per base product+date combination
  const modeGroups = new Map();
  for (const { label, extent } of availabilities) {
    const match = label.match(MODE_TAG_REGEX);
    const baseLabel = match ? label.slice(0, match.index) : label;
    const mode = match?.[1] ?? null;
    const key = `${baseLabel}::${extent ?? ''}`;
    if (!modeGroups.has(key)) {
      modeGroups.set(key, { baseLabel, extent, modes: [] });
    }
    if (mode) {
      modeGroups.get(key).modes.push(mode);
    }
  }

  // Group collapsed entries by date extent
  const dateGroups = new Map();
  for (const { baseLabel, extent, modes } of modeGroups.values()) {
    const extentKey = extent ?? '';
    if (!dateGroups.has(extentKey)) {
      dateGroups.set(extentKey, { extent, items: [] });
    }
    const modeTag = modes.length > 0 ? ` (${modes.join(' / ')})` : '';
    dateGroups.get(extentKey).items.push(`${baseLabel}${modeTag}`);
  }

  const header = t`Available data:`;
  const sections = [...dateGroups.values()].map(({ extent, items }) => {
    const content = items.join('  \n');
    return extent ? `**${extent}**  \n${content}` : content;
  });
  return `\n**${header}**\n\n${sections.join('\n\n')}`;
};

// Get availability info for collections in the query
export const getAvailabilityInfo = async (filterString, authToken) => {
  const stacCollections = getStacCollectionsFromFilter(filterString);
  const collectionNames = getCollectionNames(filterString);
  const isClms =
    collectionNames.includes(ODataCollections.CLMS_BIOGEOPHYSICAL_PARAMETERS.collection) ||
    collectionNames.includes(ODataCollections.CLMS_PRIORITY_AREA_MONITORING.collection);
  if (!stacCollections.length && !isClms) {
    return null;
  }

  const datasetFullValues = getDatasetFullValues(filterString);
  const availabilities = []; // { label: string, extent: string | null }[]
  const addedKeys = new Set();

  const addAvailability = (label, extent = null) => {
    if (!label) {
      return;
    }
    const key = `${label}::${extent ?? ''}`;
    if (!addedKeys.has(key)) {
      addedKeys.add(key);
      availabilities.push({ label, extent });
    }
  };

  const stacCollectionsSet = new Set(stacCollections);
  const hasCcmOptical = stacCollectionsSet.delete(STAC_COLLECTIONS.CCM_OPTICAL);
  const hasCcmSar = stacCollectionsSet.delete(STAC_COLLECTIONS.CCM_SAR);

  if (hasCcmOptical) {
    const labelsToUse = getCcmAvailabilityLabels({
      datasetFullValues,
      collectionId: ODataCollections.OPTICAL.id,
      fallbackLabel: ODataCollections.OPTICAL.label,
      allLabels: ccmProductLabels.get(STAC_COLLECTIONS.CCM_OPTICAL),
    });

    for (const label of labelsToUse) {
      addAvailability(label);
    }
  }

  if (hasCcmSar) {
    const labelsToUse = getCcmAvailabilityLabels({
      datasetFullValues,
      collectionId: ODataCollections.CCM_SAR.id,
      fallbackLabel: ODataCollections.CCM_SAR.label,
      allLabels: ccmProductLabels.get(STAC_COLLECTIONS.CCM_SAR),
    });

    for (const label of labelsToUse) {
      addAvailability(label);
    }
  }

  if (isClms) {
    const clmsLabels = getClmsAvailabilityLabels(filterString);
    for (const label of clmsLabels) {
      addAvailability(label);
    }
  }

  const stacIds = [...stacCollectionsSet];

  if (stacIds.length > 0) {
    const allCollections = await getAllStacCollections(authToken);
    const fallbackIds = [];

    for (const stacId of stacIds) {
      const collection = allCollections?.get(stacId);
      if (collection) {
        const interval = collection?.extent?.temporal?.interval?.[0];
        if (interval) {
          const [start, end] = interval;
          const startDate = formatStacDate(start, t`unknown`);
          const endDate = formatStacDate(end, t`ongoing`);
          const title = collection.title || stacId;
          addAvailability(title, `${startDate} to ${endDate}`);
          continue;
        }
      }
      fallbackIds.push(stacId);
    }

    if (fallbackIds.length > 0) {
      const fallbackInfos = await Promise.all(fallbackIds.map((id) => getStacCollectionInfo(id, authToken)));
      for (const [index, id] of fallbackIds.entries()) {
        const info = fallbackInfos[index];
        if (info?.extent) {
          const displayName = info.title || id;
          addAvailability(displayName, info.extent);
        }
      }
    }
  }

  if (availabilities.length === 0) {
    return null;
  }

  return formatAvailabilityMessage(availabilities);
};
