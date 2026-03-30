import { ODataCollections } from '../api/OData/ODataTypes';
import {
  collections as collectionFormConfig,
  recursiveCollectionCLMS,
} from '../Tools/VisualizationPanel/CollectionSelection/AdvancedSearch/collectionFormConfig';

/**
 * STAC collection ID constants used to build collection IDs in the switch-case logic of
 * stacAvailability.js. These are NOT used for validation — unknown IDs are handled gracefully
 * at runtime via the live batch fetch (getAllStacCollections).
 *
 * Add new entries here when a new collection is added to the catalog AND needs to be surfaced
 * in availability messages. To list all current catalog IDs:
 *   curl https://stac.dataspace.copernicus.eu/v1/collections?limit=200 | jq '[.collections[].id]'
 */
export const STAC_COLLECTIONS = {
  // Sentinel-1
  SENTINEL_1_GRD: 'sentinel-1-grd',
  SENTINEL_1_SLC: 'sentinel-1-slc',
  SENTINEL_1_SLC_WV: 'sentinel-1-slc-wv',
  SENTINEL_1_ETAD: 'sentinel-1-etad',
  SENTINEL_1_GLOBAL_MOSAICS: 'sentinel-1-global-mosaics',

  // Sentinel-2
  SENTINEL_2_L1C: 'sentinel-2-l1c',
  SENTINEL_2_L2A: 'sentinel-2-l2a',
  SENTINEL_2_GRI_L1C: 'sentinel-2-gri-l1c',
  SENTINEL_2_GRI_L1C_GCP: 'sentinel-2-gri-l1c-gcp',
  SENTINEL_2_GLOBAL_MOSAICS: 'sentinel-2-global-mosaics',

  // Sentinel-3 OLCI
  SENTINEL_3_OLCI_1_EFR_NRT: 'sentinel-3-olci-1-efr-nrt',
  SENTINEL_3_OLCI_1_EFR_NTC: 'sentinel-3-olci-1-efr-ntc',
  SENTINEL_3_OLCI_1_ERR_NRT: 'sentinel-3-olci-1-err-nrt',
  SENTINEL_3_OLCI_1_ERR_NTC: 'sentinel-3-olci-1-err-ntc',
  SENTINEL_3_OLCI_2_LFR_NRT: 'sentinel-3-olci-2-lfr-nrt',
  SENTINEL_3_OLCI_2_LFR_NTC: 'sentinel-3-olci-2-lfr-ntc',
  SENTINEL_3_OLCI_2_LRR_NRT: 'sentinel-3-olci-2-lrr-nrt',
  SENTINEL_3_OLCI_2_LRR_NTC: 'sentinel-3-olci-2-lrr-ntc',
  SENTINEL_3_OLCI_2_WFR_NRT: 'sentinel-3-olci-2-wfr-nrt',
  SENTINEL_3_OLCI_2_WFR_NTC: 'sentinel-3-olci-2-wfr-ntc',
  SENTINEL_3_OLCI_2_WRR_NRT: 'sentinel-3-olci-2-wrr-nrt',
  SENTINEL_3_OLCI_2_WRR_NTC: 'sentinel-3-olci-2-wrr-ntc',

  // Sentinel-3 SLSTR
  SENTINEL_3_SL_1_RBT_NRT: 'sentinel-3-sl-1-rbt-nrt',
  SENTINEL_3_SL_1_RBT_NTC: 'sentinel-3-sl-1-rbt-ntc',
  SENTINEL_3_SL_2_AOD_NRT: 'sentinel-3-sl-2-aod-nrt',
  SENTINEL_3_SL_2_FRP_NRT: 'sentinel-3-sl-2-frp-nrt',
  SENTINEL_3_SL_2_FRP_NTC: 'sentinel-3-sl-2-frp-ntc',
  SENTINEL_3_SL_2_LST_NRT: 'sentinel-3-sl-2-lst-nrt',
  SENTINEL_3_SL_2_LST_NTC: 'sentinel-3-sl-2-lst-ntc',
  SENTINEL_3_SL_2_WST_NRT: 'sentinel-3-sl-2-wst-nrt',
  SENTINEL_3_SL_2_WST_NTC: 'sentinel-3-sl-2-wst-ntc',

  // Sentinel-3 SRAL
  SENTINEL_3_SR_1_SRA_NRT: 'sentinel-3-sr-1-sra-nrt',
  SENTINEL_3_SR_1_SRA_NTC: 'sentinel-3-sr-1-sra-ntc',
  SENTINEL_3_SR_1_SRA_STC: 'sentinel-3-sr-1-sra-stc',
  SENTINEL_3_SR_1_SRA_A_NRT: 'sentinel-3-sr-1-sra-a-nrt',
  SENTINEL_3_SR_1_SRA_A_NTC: 'sentinel-3-sr-1-sra-a-ntc',
  SENTINEL_3_SR_1_SRA_A_STC: 'sentinel-3-sr-1-sra-a-stc',
  SENTINEL_3_SR_2_LAN_NRT: 'sentinel-3-sr-2-lan-nrt',
  SENTINEL_3_SR_2_LAN_NTC: 'sentinel-3-sr-2-lan-ntc',
  SENTINEL_3_SR_2_LAN_STC: 'sentinel-3-sr-2-lan-stc',
  SENTINEL_3_SR_2_LAN_HY_NRT: 'sentinel-3-sr-2-lan-hy-nrt',
  SENTINEL_3_SR_2_LAN_HY_NTC: 'sentinel-3-sr-2-lan-hy-ntc',
  SENTINEL_3_SR_2_LAN_HY_STC: 'sentinel-3-sr-2-lan-hy-stc',
  SENTINEL_3_SR_2_LAN_SI_NRT: 'sentinel-3-sr-2-lan-si-nrt',
  SENTINEL_3_SR_2_LAN_SI_NTC: 'sentinel-3-sr-2-lan-si-ntc',
  SENTINEL_3_SR_2_LAN_SI_STC: 'sentinel-3-sr-2-lan-si-stc',
  SENTINEL_3_SR_2_LAN_LI_NRT: 'sentinel-3-sr-2-lan-li-nrt',
  SENTINEL_3_SR_2_LAN_LI_NTC: 'sentinel-3-sr-2-lan-li-ntc',
  SENTINEL_3_SR_2_LAN_LI_STC: 'sentinel-3-sr-2-lan-li-stc',
  SENTINEL_3_SR_2_WAT_NRT: 'sentinel-3-sr-2-wat-nrt',
  SENTINEL_3_SR_2_WAT_NTC: 'sentinel-3-sr-2-wat-ntc',
  SENTINEL_3_SR_2_WAT_STC: 'sentinel-3-sr-2-wat-stc',

  // Sentinel-3 SYNERGY
  SENTINEL_3_SYN_2_AOD_NTC: 'sentinel-3-syn-2-aod-ntc',
  SENTINEL_3_SYN_2_SYN_NTC: 'sentinel-3-syn-2-syn-ntc',
  SENTINEL_3_SYN_2_SYN_STC: 'sentinel-3-syn-2-syn-stc',
  SENTINEL_3_SYN_2_V10_NTC: 'sentinel-3-syn-2-v10-ntc',
  SENTINEL_3_SYN_2_V10_STC: 'sentinel-3-syn-2-v10-stc',
  SENTINEL_3_SYN_2_VG1_NTC: 'sentinel-3-syn-2-vg1-ntc',
  SENTINEL_3_SYN_2_VG1_STC: 'sentinel-3-syn-2-vg1-stc',
  SENTINEL_3_SYN_2_VGP_NTC: 'sentinel-3-syn-2-vgp-ntc',
  SENTINEL_3_SYN_2_VGP_STC: 'sentinel-3-syn-2-vgp-stc',

  // Sentinel-5P L1
  SENTINEL_5P_L1_RA_BD1_NRTI: 'sentinel-5p-l1-ra-bd1-nrti',
  SENTINEL_5P_L1_RA_BD1_OFFL: 'sentinel-5p-l1-ra-bd1-offl',
  SENTINEL_5P_L1_RA_BD1_RPRO: 'sentinel-5p-l1-ra-bd1-rpro',
  SENTINEL_5P_L1_RA_BD2_NRTI: 'sentinel-5p-l1-ra-bd2-nrti',
  SENTINEL_5P_L1_RA_BD2_OFFL: 'sentinel-5p-l1-ra-bd2-offl',
  SENTINEL_5P_L1_RA_BD2_RPRO: 'sentinel-5p-l1-ra-bd2-rpro',
  SENTINEL_5P_L1_RA_BD3_NRTI: 'sentinel-5p-l1-ra-bd3-nrti',
  SENTINEL_5P_L1_RA_BD3_OFFL: 'sentinel-5p-l1-ra-bd3-offl',
  SENTINEL_5P_L1_RA_BD3_RPRO: 'sentinel-5p-l1-ra-bd3-rpro',
  SENTINEL_5P_L1_RA_BD4_NRTI: 'sentinel-5p-l1-ra-bd4-nrti',
  SENTINEL_5P_L1_RA_BD4_OFFL: 'sentinel-5p-l1-ra-bd4-offl',
  SENTINEL_5P_L1_RA_BD4_RPRO: 'sentinel-5p-l1-ra-bd4-rpro',
  SENTINEL_5P_L1_RA_BD5_NRTI: 'sentinel-5p-l1-ra-bd5-nrti',
  SENTINEL_5P_L1_RA_BD5_OFFL: 'sentinel-5p-l1-ra-bd5-offl',
  SENTINEL_5P_L1_RA_BD5_RPRO: 'sentinel-5p-l1-ra-bd5-rpro',
  SENTINEL_5P_L1_RA_BD6_NRTI: 'sentinel-5p-l1-ra-bd6-nrti',
  SENTINEL_5P_L1_RA_BD6_OFFL: 'sentinel-5p-l1-ra-bd6-offl',
  SENTINEL_5P_L1_RA_BD6_RPRO: 'sentinel-5p-l1-ra-bd6-rpro',
  SENTINEL_5P_L1_RA_BD7_NRTI: 'sentinel-5p-l1-ra-bd7-nrti',
  SENTINEL_5P_L1_RA_BD7_OFFL: 'sentinel-5p-l1-ra-bd7-offl',
  SENTINEL_5P_L1_RA_BD7_RPRO: 'sentinel-5p-l1-ra-bd7-rpro',
  SENTINEL_5P_L1_RA_BD8_NRTI: 'sentinel-5p-l1-ra-bd8-nrti',
  SENTINEL_5P_L1_RA_BD8_OFFL: 'sentinel-5p-l1-ra-bd8-offl',
  SENTINEL_5P_L1_RA_BD8_RPRO: 'sentinel-5p-l1-ra-bd8-rpro',

  // Sentinel-5P L2
  SENTINEL_5P_L2_AER_AI_NRTI: 'sentinel-5p-l2-aer-ai-nrti',
  SENTINEL_5P_L2_AER_AI_OFFL: 'sentinel-5p-l2-aer-ai-offl',
  SENTINEL_5P_L2_AER_AI_RPRO: 'sentinel-5p-l2-aer-ai-rpro',
  SENTINEL_5P_L2_AER_LH_NRTI: 'sentinel-5p-l2-aer-lh-nrti',
  SENTINEL_5P_L2_AER_LH_OFFL: 'sentinel-5p-l2-aer-lh-offl',
  SENTINEL_5P_L2_AER_LH_RPRO: 'sentinel-5p-l2-aer-lh-rpro',
  SENTINEL_5P_L2_CH4_NRTI: 'sentinel-5p-l2-ch4-nrti',
  SENTINEL_5P_L2_CH4_OFFL: 'sentinel-5p-l2-ch4-offl',
  SENTINEL_5P_L2_CH4_RPRO: 'sentinel-5p-l2-ch4-rpro',
  SENTINEL_5P_L2_CLOUD_NRTI: 'sentinel-5p-l2-cloud-nrti',
  SENTINEL_5P_L2_CLOUD_OFFL: 'sentinel-5p-l2-cloud-offl',
  SENTINEL_5P_L2_CLOUD_RPRO: 'sentinel-5p-l2-cloud-rpro',
  SENTINEL_5P_L2_CO_NRTI: 'sentinel-5p-l2-co-nrti',
  SENTINEL_5P_L2_CO_OFFL: 'sentinel-5p-l2-co-offl',
  SENTINEL_5P_L2_CO_RPRO: 'sentinel-5p-l2-co-rpro',
  SENTINEL_5P_L2_HCHO_NRTI: 'sentinel-5p-l2-hcho-nrti',
  SENTINEL_5P_L2_HCHO_OFFL: 'sentinel-5p-l2-hcho-offl',
  SENTINEL_5P_L2_HCHO_RPRO: 'sentinel-5p-l2-hcho-rpro',
  SENTINEL_5P_L2_NO2_NRTI: 'sentinel-5p-l2-no2-nrti',
  SENTINEL_5P_L2_NO2_OFFL: 'sentinel-5p-l2-no2-offl',
  SENTINEL_5P_L2_NO2_RPRO: 'sentinel-5p-l2-no2-rpro',
  SENTINEL_5P_L2_NP_BD3_OFFL: 'sentinel-5p-l2-np-bd3-offl',
  SENTINEL_5P_L2_NP_BD3_RPRO: 'sentinel-5p-l2-np-bd3-rpro',
  SENTINEL_5P_L2_NP_BD6_OFFL: 'sentinel-5p-l2-np-bd6-offl',
  SENTINEL_5P_L2_NP_BD6_RPRO: 'sentinel-5p-l2-np-bd6-rpro',
  SENTINEL_5P_L2_NP_BD7_OFFL: 'sentinel-5p-l2-np-bd7-offl',
  SENTINEL_5P_L2_NP_BD7_RPRO: 'sentinel-5p-l2-np-bd7-rpro',
  SENTINEL_5P_L2_O3_NRTI: 'sentinel-5p-l2-o3-nrti',
  SENTINEL_5P_L2_O3_OFFL: 'sentinel-5p-l2-o3-offl',
  SENTINEL_5P_L2_O3_RPRO: 'sentinel-5p-l2-o3-rpro',
  SENTINEL_5P_L2_O3_TCL_NRTI: 'sentinel-5p-l2-o3-tcl-nrti',
  SENTINEL_5P_L2_O3_TCL_OFFL: 'sentinel-5p-l2-o3-tcl-offl',
  SENTINEL_5P_L2_O3_TCL_RPRO: 'sentinel-5p-l2-o3-tcl-rpro',
  SENTINEL_5P_L2_O3_PR_NRTI: 'sentinel-5p-l2-o3-pr-nrti',
  SENTINEL_5P_L2_O3_PR_OFFL: 'sentinel-5p-l2-o3-pr-offl',
  SENTINEL_5P_L2_O3_PR_RPRO: 'sentinel-5p-l2-o3-pr-rpro',
  SENTINEL_5P_L2_SO2_NRTI: 'sentinel-5p-l2-so2-nrti',
  SENTINEL_5P_L2_SO2_OFFL: 'sentinel-5p-l2-so2-offl',
  SENTINEL_5P_L2_SO2_RPRO: 'sentinel-5p-l2-so2-rpro',

  // Sentinel-6
  SENTINEL_6_P4_1B_NRT: 'sentinel-6-p4-1b-nrt',
  SENTINEL_6_P4_1B_NTC: 'sentinel-6-p4-1b-ntc',
  SENTINEL_6_P4_1B_STC: 'sentinel-6-p4-1b-stc',
  SENTINEL_6_P4_2_NRT: 'sentinel-6-p4-2-nrt',
  SENTINEL_6_P4_2_NTC: 'sentinel-6-p4-2-ntc',
  SENTINEL_6_P4_2_STC: 'sentinel-6-p4-2-stc',
  SENTINEL_6_AMR_C_NRT: 'sentinel-6-amr-c-nrt',
  SENTINEL_6_AMR_C_NTC: 'sentinel-6-amr-c-ntc',
  SENTINEL_6_AMR_C_STC: 'sentinel-6-amr-c-stc',

  // Landsat
  LANDSAT_C2_L1_OLI: 'landsat-c2-l1-oli',
  LANDSAT_C2_L1_TIRS: 'landsat-c2-l1-tirs',
  LANDSAT_C2_L1_OLI_TIRS: 'landsat-c2-l1-oli-tirs',

  // Copernicus DEM
  COP_DEM_GLO_30_DGED_COG: 'cop-dem-glo-30-dged-cog',
  COP_DEM_GLO_90_DGED_COG: 'cop-dem-glo-90-dged-cog',
  COP_DEM_EEA_10_LAEA_TIF: 'cop-dem-eea-10-laea-tif',

  // CCM
  CCM_OPTICAL: 'ccm-optical',
  CCM_SAR: 'ccm-sar',

  // CLMS
  CLMS_URBAN_ATLAS_LAND_COVER_USE: 'clms_urban-atlas_land-cover-use_europe_V025ha_vector_static_v01',
  CLMS_URBAN_ATLAS_LAND_COVER_USE_CHANGE:
    'clms_urban-atlas_land-cover-use-change_europe_V010ha_vector_static_v01',
  CLMS_URBAN_ATLAS_STREET_TREE: 'clms_urban-atlas_street-tree-layer_europe_V005ha_vector_static_v01',

  // OpenGeoHub
  OPENGEOHUB_LANDSAT_MOSAIC: 'opengeohub-landsat-bimonthly-mosaic-v1.0.1',
};

export const STAC_SUFFIX = {
  NRT: 'nrt',
  NTC: 'ntc',
  STC: 'stc',
  NRTI: 'nrti',
  OFFL: 'offl',
  RPRO: 'rpro',
};

export const STAC_FILTER_TOKEN = {
  NRTI: 'NRTI',
  OFFL: 'OFFL',
  RPRO: 'RPRO',
  NR: 'NR',
  ST: 'ST',
  NT: 'NT',
};

export const STAC_FILTER_TOKEN_LITERAL = Object.fromEntries(
  Object.entries(STAC_FILTER_TOKEN).map(([key, value]) => [key, `'${value}'`]),
);

export const STAC_TIMELINESS_SUFFIXES = [STAC_SUFFIX.NRT, STAC_SUFFIX.NTC, STAC_SUFFIX.STC];
export const STAC_PROCESSING_SUFFIXES = [STAC_SUFFIX.OFFL, STAC_SUFFIX.NRTI, STAC_SUFFIX.RPRO];
export const STAC_TIMELINESS_SUFFIXES_NRT_NTC = [STAC_SUFFIX.NRT, STAC_SUFFIX.NTC];
export const STAC_TIMELINESS_SUFFIXES_NRT_NTC_STC = [STAC_SUFFIX.NRT, STAC_SUFFIX.NTC, STAC_SUFFIX.STC];
export const STAC_TIMELINESS_SUFFIXES_NRT = [STAC_SUFFIX.NRT];
export const STAC_TIMELINESS_SUFFIXES_NTC = [STAC_SUFFIX.NTC];
export const STAC_TIMELINESS_SUFFIXES_NTC_STC = [STAC_SUFFIX.NTC, STAC_SUFFIX.STC];

export const STAC_SUFFIX_REGEX = new RegExp(`-(${Object.values(STAC_SUFFIX).join('|')})$`);

export const getStacBaseId = (collectionId) => collectionId.replace(STAC_SUFFIX_REGEX, '');

export const STAC_BASE_IDS = {
  S3_OLCI_1_EFR: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_OLCI_1_EFR_NRT),
  S3_OLCI_1_ERR: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_OLCI_1_ERR_NRT),
  S3_OLCI_2_LFR: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_OLCI_2_LFR_NRT),
  S3_OLCI_2_LRR: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_OLCI_2_LRR_NRT),
  S3_OLCI_2_WFR: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_OLCI_2_WFR_NRT),
  S3_OLCI_2_WRR: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_OLCI_2_WRR_NRT),
  S3_SR_1_SRA: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SR_1_SRA_NRT),
  S3_SR_1_SRA_A: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SR_1_SRA_A_NRT),
  S3_SR_2_LAN: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SR_2_LAN_NRT),
  S3_SR_2_LAN_HY: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SR_2_LAN_HY_NRT),
  S3_SR_2_LAN_SI: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SR_2_LAN_SI_NRT),
  S3_SR_2_LAN_LI: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SR_2_LAN_LI_NRT),
  S3_SR_2_WAT: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SR_2_WAT_NRT),
  S3_SL_1_RBT: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SL_1_RBT_NRT),
  S3_SL_2_AOD: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SL_2_AOD_NRT),
  S3_SL_2_FRP: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SL_2_FRP_NRT),
  S3_SL_2_LST: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SL_2_LST_NRT),
  S3_SL_2_WST: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SL_2_WST_NRT),
  S3_SYN_2_AOD: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SYN_2_AOD_NTC),
  S3_SYN_2_SYN: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SYN_2_SYN_NTC),
  S3_SYN_2_V10: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SYN_2_V10_NTC),
  S3_SYN_2_VG1: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SYN_2_VG1_NTC),
  S3_SYN_2_VGP: getStacBaseId(STAC_COLLECTIONS.SENTINEL_3_SYN_2_VGP_NTC),
  S6_P4_1B: getStacBaseId(STAC_COLLECTIONS.SENTINEL_6_P4_1B_NRT),
  S6_P4_2: getStacBaseId(STAC_COLLECTIONS.SENTINEL_6_P4_2_NRT),
  S6_AMR_C: getStacBaseId(STAC_COLLECTIONS.SENTINEL_6_AMR_C_NRT),
};

export const getCollectionNames = (filterString) => {
  if (!filterString) {
    return [];
  }

  const matches = [...filterString.matchAll(/Collection\/Name\s+eq\s+'([^']+)'/g)];
  if (!matches.length) {
    return [];
  }

  return matches.map((match) => match[1]);
};

export const getDatasetFullValues = (filterString) => {
  if (!filterString) {
    return [];
  }

  const matches = [
    ...filterString.matchAll(
      /att\/Name\s+eq\s+'datasetFull'\s+and\s+att\/OData\.CSC\.StringAttribute\/Value\s+eq\s+'([^']+)'/g,
    ),
  ];

  return matches.map((match) => match[1]);
};

export const getProductTypeAttributeValues = (filterString) => {
  if (!filterString) {
    return [];
  }

  const matches = [
    ...filterString.matchAll(
      /att\/Name\s+eq\s+'productType'\s+and\s+att\/OData\.CSC\.StringAttribute\/Value\s+eq\s+'([^']+)'/g,
    ),
  ];

  return matches.map((match) => match[1]);
};

export const getDatasetIdentifierAttributeValues = (filterString) => {
  if (!filterString) {
    return [];
  }

  const matches = [
    ...filterString.matchAll(
      /att\/Name\s+eq\s+'datasetIdentifier'\s+and\s+att\/OData\.CSC\.StringAttribute\/Value\s+eq\s+'([^']+)'/g,
    ),
  ];

  return matches.map((match) => match[1]);
};

export const getNominalDateAttributeValues = (filterString) => {
  if (!filterString) {
    return [];
  }

  const matches = [
    ...filterString.matchAll(
      /att\/Name\s+eq\s+'nominalDate'\s+and\s+att\/OData\.CSC\.DateTimeOffsetAttribute\/Value\s+eq\s+([^\s)]+)/g,
    ),
  ];

  return matches.map((match) => match[1]);
};

const CCM_COLLECTION_IDS = new Set([ODataCollections.OPTICAL.id, ODataCollections.CCM_SAR.id]);
export const CCM_COLLECTION_NAME = ODataCollections.OPTICAL.collection;
const ccmDatasetIndex = new Map();
export const ccmProductLabels = new Map();

for (const collection of collectionFormConfig) {
  if (!CCM_COLLECTION_IDS.has(collection.id)) {
    continue;
  }

  const stacId =
    collection.id === ODataCollections.OPTICAL.id ? STAC_COLLECTIONS.CCM_OPTICAL : STAC_COLLECTIONS.CCM_SAR;
  const labels = [];

  for (const instrument of collection.instruments || []) {
    for (const productType of instrument.productTypes || []) {
      if (productType.label) {
        labels.push(productType.label);
      }
      if (productType.id) {
        ccmDatasetIndex.set(productType.id, {
          collectionId: collection.id,
          label: productType.label,
        });
      }

      for (const aliasId of productType.productTypeIds || []) {
        ccmDatasetIndex.set(aliasId, {
          collectionId: collection.id,
          label: productType.label,
        });
      }
    }
  }

  ccmProductLabels.set(stacId, labels);
}

const getCcmCollectionIdsFromDatasetValues = (datasetValues) => {
  const matchedCollectionIds = new Set();

  for (const datasetValue of datasetValues) {
    const ccmMatch = ccmDatasetIndex.get(datasetValue);
    if (ccmMatch) {
      matchedCollectionIds.add(ccmMatch.collectionId);
    }
  }

  return matchedCollectionIds;
};

const getCcmLabelsFromDatasetValues = (datasetValues, collectionId) => {
  const matchedLabels = new Set();

  for (const datasetValue of datasetValues) {
    const ccmMatch = ccmDatasetIndex.get(datasetValue);
    if (ccmMatch?.label && (!collectionId || ccmMatch.collectionId === collectionId)) {
      matchedLabels.add(ccmMatch.label);
    }
  }

  return [...matchedLabels];
};

export const getCcmCollectionsFromDatasetValues = (datasetValues) => {
  const ccmCollections = [];
  const matchedCollectionIds = getCcmCollectionIdsFromDatasetValues(datasetValues);

  if (matchedCollectionIds.has(ODataCollections.OPTICAL.id)) {
    ccmCollections.push(STAC_COLLECTIONS.CCM_OPTICAL);
  }
  if (matchedCollectionIds.has(ODataCollections.CCM_SAR.id)) {
    ccmCollections.push(STAC_COLLECTIONS.CCM_SAR);
  }

  return ccmCollections;
};

export const getCcmAvailabilityLabels = ({ datasetFullValues, collectionId, fallbackLabel, allLabels }) => {
  const ccmLabels = getCcmLabelsFromDatasetValues(datasetFullValues, collectionId);

  if (ccmLabels.length > 0) {
    return ccmLabels;
  }
  if (allLabels && allLabels.length > 0) {
    return allLabels;
  }
  return [fallbackLabel];
};

export const getDemCollectionsFromDatasetValues = (datasetValues) => {
  const demCollections = [];

  const hasDemDataset = datasetValues.some((value) => value.startsWith('COP-DEM_'));
  if (!hasDemDataset) {
    return demCollections;
  }

  if (datasetValues.some((value) => value.includes('EEA-10'))) {
    demCollections.push(STAC_COLLECTIONS.COP_DEM_EEA_10_LAEA_TIF);
  }
  if (datasetValues.some((value) => value.includes('GLO-30'))) {
    demCollections.push(STAC_COLLECTIONS.COP_DEM_GLO_30_DGED_COG);
  }
  if (datasetValues.some((value) => value.includes('GLO-90'))) {
    demCollections.push(STAC_COLLECTIONS.COP_DEM_GLO_90_DGED_COG);
  }

  if (!demCollections.length) {
    demCollections.push(
      STAC_COLLECTIONS.COP_DEM_EEA_10_LAEA_TIF,
      STAC_COLLECTIONS.COP_DEM_GLO_30_DGED_COG,
      STAC_COLLECTIONS.COP_DEM_GLO_90_DGED_COG,
    );
  }

  return demCollections;
};

// Indexes built from recursiveCollectionCLMS at module load time.
// productType OData attribute value → { instrumentLabel, collectionLabel }
const clmsProductTypeIndex = new Map();
// productType OData attribute value → string[] (all leaf product type labels for that instrument)
const clmsProductTypeLabelsIndex = new Map();
// datasetIdentifier OData attribute value → { productTypeLabel, instrumentLabel, collectionLabel, instrumentProductType }
const clmsDatasetIdentifierIndex = new Map();

const CLMS_ATTR_VALUE_REGEX =
  /att\/Name\s+eq\s+'([^']+)'\s+and\s+att\/OData\.CSC\.(?:StringAttribute|DateTimeOffsetAttribute)\/Value\s+eq\s+'?([^'\s)]+)'?/;

const extractClmsFilterValue = (expr, attributeName) => {
  if (!expr) {
    return null;
  }
  const match = expr.match(CLMS_ATTR_VALUE_REGEX);
  return match && match[1] === attributeName ? match[2] : null;
};

const walkClmsItems = (items, collectionLabel, instrumentLabel, instrumentProductType) => {
  for (const item of items || []) {
    if (item.type === 'group') {
      walkClmsItems(item.items, collectionLabel, instrumentLabel, instrumentProductType);
    } else if (item.type === 'instrument') {
      const productTypeValue = extractClmsFilterValue(item.customFilterExpression, 'productType');
      if (productTypeValue) {
        clmsProductTypeIndex.set(productTypeValue, { instrumentLabel: item.label, collectionLabel });
        clmsProductTypeLabelsIndex.set(productTypeValue, []);
      }
      walkClmsItems(item.items, collectionLabel, item.label, productTypeValue);
    } else if (item.type === 'productType') {
      if (item.multiCustomFilterExpression) {
        // Items like UA LCU 2018/2021 share a datasetIdentifier but differ by nominalDate.
        // Index them under a composite key (datasetIdentifier_year) so each gets its own label.
        let datasetIdentifierValue = null;
        let nominalDateValue = null;
        for (const expr of item.multiCustomFilterExpression) {
          datasetIdentifierValue =
            datasetIdentifierValue ?? extractClmsFilterValue(expr, 'datasetIdentifier');
          nominalDateValue = nominalDateValue ?? extractClmsFilterValue(expr, 'nominalDate');
        }
        if (datasetIdentifierValue && nominalDateValue) {
          // Key uses only the year (first 4 chars) because the OData API returns nominalDate in
          // ISO-8601 format (e.g. "2018-01-01T00:00:00.000000Z") and products like UA LCU 2018
          // and 2021 share the same datasetIdentifier, distinguished solely by their reference year.
          clmsDatasetIdentifierIndex.set(`${datasetIdentifierValue}_${nominalDateValue.slice(0, 4)}`, {
            productTypeLabel: item.label,
            instrumentLabel,
            collectionLabel,
            instrumentProductType,
          });
          if (instrumentProductType && clmsProductTypeLabelsIndex.has(instrumentProductType)) {
            clmsProductTypeLabelsIndex.get(instrumentProductType).push(item.label);
          }
        }
      } else {
        const datasetIdentifierValue = extractClmsFilterValue(
          item.customFilterExpression,
          'datasetIdentifier',
        );
        if (datasetIdentifierValue) {
          clmsDatasetIdentifierIndex.set(datasetIdentifierValue, {
            productTypeLabel: item.label,
            instrumentLabel,
            collectionLabel,
            // The productType OData value of the parent instrument, or null for instruments
            // like Evapotranspiration that have no productType-based customFilterExpression.
            instrumentProductType,
          });
          if (instrumentProductType && clmsProductTypeLabelsIndex.has(instrumentProductType)) {
            clmsProductTypeLabelsIndex.get(instrumentProductType).push(item.label);
          }
        }
      }
    }
  }
};

for (const collection of recursiveCollectionCLMS) {
  walkClmsItems(collection.items, collection.label, null, null);
}

export const getClmsAvailabilityLabels = (filterString) => {
  const productTypeValues = getProductTypeAttributeValues(filterString);
  const datasetIdentifierValues = getDatasetIdentifierAttributeValues(filterString);
  const nominalDateValues = getNominalDateAttributeValues(filterString);

  if (productTypeValues.length === 0 && datasetIdentifierValues.length === 0) {
    return recursiveCollectionCLMS.map((c) => c.label);
  }

  const labels = [];

  // Per-productType decision: if the filter contains specific datasetIdentifiers that belong to
  // this productType's instrument, show only those (Case A). Otherwise show all leaf labels for
  // that productType (Case B). This ensures multiple concurrent selections (e.g. SNOW parent +
  // DynamicLandCover with one child) all appear — not just the one that has a specific leaf.
  for (const productTypeValue of productTypeValues) {
    const specificLabels = [];

    // Composite key lookup for multiCustomFilterExpression items (e.g. UA LCU 2018/2021) that
    // share a datasetIdentifier but are disambiguated by nominalDate. The OData API returns
    // nominalDate in ISO-8601 format (e.g. "2018-01-01T00:00:00.000000Z"), so slicing the first
    // 4 chars extracts the year, matching the key format used when building the index above.
    for (const datasetIdentifier of datasetIdentifierValues) {
      for (const nominalDate of nominalDateValues) {
        const info = clmsDatasetIdentifierIndex.get(`${datasetIdentifier}_${nominalDate.slice(0, 4)}`);
        if (info?.instrumentProductType === productTypeValue) {
          specificLabels.push(info.productTypeLabel || info.instrumentLabel || info.collectionLabel);
        }
      }
    }

    // Plain datasetIdentifier lookup for customFilterExpression items. Both paths can match
    // simultaneously when the filter mixes multi- and single-expression product types.
    for (const id of datasetIdentifierValues) {
      const info = clmsDatasetIdentifierIndex.get(id);
      if (info?.instrumentProductType === productTypeValue) {
        specificLabels.push(info.productTypeLabel || info.instrumentLabel || info.collectionLabel);
      }
    }

    if (specificLabels.length > 0) {
      labels.push(...specificLabels);
    } else {
      const productTypeLabels = clmsProductTypeLabelsIndex.get(productTypeValue) || [];
      labels.push(...productTypeLabels);
    }
  }

  // Instruments with no productType filter (e.g. Evapotranspiration): their datasetIdentifiers
  // appear in the filter directly. Show the specific leaf labels for those.
  for (const value of datasetIdentifierValues) {
    const info = clmsDatasetIdentifierIndex.get(value);
    if (info && !info.instrumentProductType) {
      labels.push(info.productTypeLabel || info.instrumentLabel || info.collectionLabel);
    }
  }

  if (labels.length > 0) {
    return labels;
  }

  return recursiveCollectionCLMS.map((c) => c.label);
};
