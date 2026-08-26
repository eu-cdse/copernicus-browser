/**
 * STAC collection ID constants, kept in a leaf module of their own.
 *
 * They live here rather than in stac.utils.js because that module imports (and iterates at
 * load time) the Advanced Search collectionFormConfig, which in turn needs these IDs to
 * declare which STAC collection each searchable collection maps to. Importing them from
 * stac.utils.js would make that a circular dependency; a dependency-free module breaks it.
 *
 * stac.utils.js re-exports STAC_COLLECTIONS, so existing importers are unaffected.
 */

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
