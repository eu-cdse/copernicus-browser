import React from 'react';
import {
  CacheTarget,
  LayersFactory,
  BYOCLayer,
  S1GRDAWSEULayer,
  DEMLayer,
  BYOCSubTypes,
} from '@sentinel-hub/sentinelhub-js';
import { XMLParser } from 'fast-xml-parser';
import { t } from 'ttag';

import store, { notificationSlice, themesSlice } from '../../../store';
import Sentinel1DataSourceHandler from './Sentinel1DataSourceHandler';
import Sentinel3DataSourceHandler from './Sentinel3DataSourceHandler';
import Sentinel5PDataSourceHandler from './Sentinel5PDataSourceHandler';
import ComplementaryDataDataSourceHandler from './ComplementaryDataDataSourceHandler';
import BYOCDataSourceHandler from './BYOCDataSourceHandler';
import DEMCDASDataSourceHandler from './DEMCDASDataSourceHandler';

import { getCollectionInformation } from '../../../utils/collections';

import { DATASOURCES, XmlParserOptions } from '../../../const';
import {
  S1_AWS_IW_VVVH,
  S1_AWS_IW_VV,
  S1_AWS_EW_HHHV,
  S1_AWS_EW_HH,
  S3SLSTR,
  S3OLCI,
  S5_O3,
  S5_NO2,
  S5_SO2,
  S5_CO,
  S5_HCHO,
  S5_CH4,
  S5_AER_AI,
  S5_CLOUD,
  S5_OTHER,
  AWS_L8L1C,
  COPERNICUS_CORINE_LAND_COVER,
  COPERNICUS_GLOBAL_LAND_COVER,
  COPERNICUS_WATER_BODIES,
  COPERNICUS_CLC_ACCOUNTING,
  AWS_LOTL1,
  AWS_LOTL2,
  AWS_LTML1,
  AWS_LTML2,
  AWS_LMSSL1,
  AWS_LETML1,
  AWS_LETML2,
  CUSTOM,
  S1_CDAS_IW_VVVH,
  S1_CDAS_IW_HHHV,
  S1_CDAS_IW_VV,
  S1_CDAS_IW_HH,
  S1_CDAS_EW_HHHV,
  S1_CDAS_EW_VVVH,
  S1_CDAS_EW_HH,
  S1_CDAS_EW_VV,
  S2_L1C_CDAS,
  S2_L2A_CDAS,
  S3SLSTR_CDAS,
  S3OLCI_CDAS,
  S5_O3_CDAS,
  S5_NO2_CDAS,
  S5_SO2_CDAS,
  S5_CO_CDAS,
  S5_HCHO_CDAS,
  S5_CH4_CDAS,
  S5_AER_AI_CDAS,
  S5_CLOUD_CDAS,
  S5_OTHER_CDAS,
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
  S1_CDAS_SM_VVVH,
  S1_CDAS_SM_VV,
  S1_CDAS_SM_HH,
  S1_CDAS_SM_HHHV,
  COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC,
  COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC,
  S1_MONTHLY_MOSAIC_DH,
  S1_MONTHLY_MOSAIC_IW,
  S3OLCIL2_WATER,
  S3OLCIL2_LAND,
  S3SYNERGY_L2_SYN,
  S3SYNERGY_L2_V10,
  S3SYNERGY_L2_VG1,
  S3SYNERGY_L2_VGP,
  S3SYNERGY_L2_AOD,
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
  COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL,
  COPERNICUS_CLMS_BURNT_AREA_DAILY,
  COPERNICUS_CLMS_BURNT_AREA_MONTHLY,
  COPERNICUS_CLMS_DMP_1KM_10DAILY,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_LAI_1KM_10DAILY,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_LAI_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT1,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT2,
  COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT6,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT0,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT1,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT2,
  COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT6,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT0,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT1,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT2,
  COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT6,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT0,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT1,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT2,
  COPERNICUS_CLMS_GPP_300M_10DAILY_RT6,
  COPERNICUS_CLMS_LAI_300M_10DAILY,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT0,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT1,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT2,
  COPERNICUS_CLMS_LAI_300M_10DAILY_RT6,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT0,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT1,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT2,
  COPERNICUS_CLMS_NPP_300M_10DAILY_RT6,
  COPERNICUS_CLMS_SWI_12_5KM_10DAILY,
  COPERNICUS_CLMS_SWI_12_5KM_DAILY,
  COPERNICUS_CLMS_SWI_1KM_DAILY,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT0,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT1,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT2,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT5,
  COPERNICUS_CLMS_DMP_300M_10DAILY_RT6,
  COPERNICUS_CLMS_LST_5KM_10DAILY_V1,
  COPERNICUS_CLMS_LST_5KM_10DAILY_V2,
  COPERNICUS_CLMS_NDVI_1KM_STATS_V2,
  COPERNICUS_CLMS_NDVI_1KM_STATS_V3,
  COPERNICUS_CLMS_NDVI_1KM_10DAILY_V2,
  COPERNICUS_CLMS_NDVI_300M_10DAILY_V1,
  COPERNICUS_CLMS_NDVI_300M_10DAILY_V2,
  COPERNICUS_CLMS_SSM_1KM_DAILY_V1,
  COPERNICUS_CLMS_LSP_300M_YEARLY_V1,
  COPERNICUS_CLMS_LSP_300M_YEARLY_V2,
  COPERNICUS_CLMS_LCC_100M_YEARLY_V3,
  COPERNICUS_CLMS_LST_5KM_HOURLY_V1,
  COPERNICUS_CLMS_LST_5KM_HOURLY_V2,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2,
  COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5,
  COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6,
  COPERNICUS_CLMS_WB_300M_10DAILY_V1,
  COPERNICUS_CLMS_WB_1KM_10DAILY_V2,
  COPERNICUS_CLMS_SWE_5KM_DAILY_V1,
  COPERNICUS_CLMS_SWE_5KM_DAILY_V2,
  COPERNICUS_CLMS_SCE_EUROPE_500M_DAILY_V1,
  COPERNICUS_CLMS_SCE_NH_1KM_DAILY_V1,
  COPERNICUS_CLMS_WB_300M_MONTHLY_V2,
  COPERNICUS_CLMS_LIE_500M_DAILY_V1,
  COPERNICUS_CLMS_LIE_250M_DAILY_V2,
  COPERNICUS_CLMS_WB_100M_MONTHLY_V1,
  COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1,
  COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2,
  COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2,
  COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1,
  COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1,
  COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1,
  COPERNICUS_CLMS_LCM_10M_YEARLY_V1,
  COPERNICUS_CLMS_TCD_10M_YEARLY_V1,
  COPERNICUS_CLMS_LIE_500M_DAILY_V2,
  COPERNICUS_CLMS_SWI_12_5KM_DAILY_V4,
  COPERNICUS_CLMS_SWI_1KM_DAILY_V2,
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
  COPERNICUS_CLMS_SWI_12_5KM_10DAILY_V4,
  COPERNICUS_CLMS_BURNT_AREA_DAILY_V4,
  COPERNICUS_CLMS_BURNT_AREA_MONTHLY_V4,
  COPERNICUS_CLMS_LIE_BALTIC_250M_DAILY_V1,
  CDAS_L8_L9_LOTL1,
  COPERNICUS_CLMS_ETA_GLOBAL_300M_10DAILY_V1,
  COPERNICUS_CLMS_HF_GLOBAL_300M_DAILY_V1,
  CDAS_LANDSAT_MOSAIC,
  COPERNICUS_CLMS_NDVI_300M_10DAILY_V3,
  COPERNICUS_CLMS_LSWT_NRT_GLOBAL_1KM_10DAILY_V1,
  COPERNICUS_CLMS_LSWT_OFFLINE_1KM_10DAILY_V1,
  COPERNICUS_CLMS_SCE_GLOBAL_1KM_DAILY_V1,
  COPERNICUS_CLMS_LWQ_NRT_GLOBAL_100M_10DAILY_V2,
} from './dataSourceConstants';

import Sentinel2CDASDataSourceHandler from './Sentinel2CDASDataSourceHandler';
import Sentinel3CDASDataSourceHandler from './Sentinel3CDASDataSourceHandler';
import Sentinel5PCDASDataSourceHandler from './Sentinel5PCDASDataSourceHandler';
import { DEMCDASLayer } from '@sentinel-hub/sentinelhub-js';
import MosaicDataSourceHandler from './MosaicDataSourceHandler';
import { QUOTA_ERROR_MESSAGE, isQuotaError } from '../../../utils';
import S1MosaicDataSourceHandler from './S1MosaicDataSourceHandler';

import { S2QuarterlyCloudlessMosaicsBaseLayerTheme } from '../../../assets/default_themes';
import AirbusDeDataSourceHandler from './RRDDataSources/AirbusDeDataSourceHandler';
import EUSIDataSourceHandler from './RRDDataSources/EUSIDataSourceHandler';
import GeosatDatasourceHandler from './RRDDataSources/GeosatDatasourceHandler';
import SkymedGen1DatasourceHandler from './RRDDataSources/SkymedGen1DatasourceHandler';
import SkymedGen2DatasourceHandler from './RRDDataSources/SkymedGen2DatasourceHandler';
import PlanetScopeDataSourceHandler from './RRDDataSources/PlanetScopeDatasourceHandler';
import SkySatDataSourceHandler from './RRDDataSources/SkySatDataSourceHandler';
import RadarSatDatasourceHandler from './RRDDataSources/RadarsatDatasourceHandler';
import PazDatasourceHandler from './RRDDataSources/PazDatasourceHandler';
import IceyeDatasourceHandler from './RRDDataSources/IceyeDatasourceHandler';
import AirbusFePleiades1DataSourceHandler from './RRDDataSources/AirbusFePleiades1DataSourceHandler';
import AirbusFeSpotDataSourceHandler from './RRDDataSources/AirbusFeSpotDataSourceHandler';
import AirbusFePleiadesNeoDataSourceHandler from './RRDDataSources/AirbusFePleiadesNeoDataSourceHandler';
import { datasourceForRRDDatasetId } from './dataSourceRRDHandlers';
import CLMSDataSourceHandler from './CLMSDataSourceHandler';
import CCMDataSourceHandler from './CCMDataSourceHandler';
import GHGSatDatasourceHandler from './RRDDataSources/GHGSatDatasourceHandler';
import EvolandDataSourceHandler from './EvolandDataSourceHandler';

export let dataSourceHandlers;
initializeDataSourceHandlers();

export function initializeDataSourceHandlers() {
  dataSourceHandlers = [
    new Sentinel1DataSourceHandler(),
    new S1MosaicDataSourceHandler(),
    new Sentinel2CDASDataSourceHandler(),
    new MosaicDataSourceHandler(),
    new Sentinel3DataSourceHandler(),
    new Sentinel3CDASDataSourceHandler(),
    new Sentinel5PDataSourceHandler(),
    new Sentinel5PCDASDataSourceHandler(),
    new DEMCDASDataSourceHandler(),
    new BYOCDataSourceHandler(),
    new AirbusDeDataSourceHandler(),
    new EUSIDataSourceHandler(),
    new GeosatDatasourceHandler(),
    new SkymedGen1DatasourceHandler(),
    new SkymedGen2DatasourceHandler(),
    new PlanetScopeDataSourceHandler(),
    new SkySatDataSourceHandler(),
    new RadarSatDatasourceHandler(),
    new PazDatasourceHandler(),
    new AirbusFeSpotDataSourceHandler(),
    new AirbusFePleiades1DataSourceHandler(),
    new AirbusFePleiadesNeoDataSourceHandler(),
    new IceyeDatasourceHandler(),
    new GHGSatDatasourceHandler(),
    new CLMSDataSourceHandler(),
    new CCMDataSourceHandler(),
    new EvolandDataSourceHandler(),
    new ComplementaryDataDataSourceHandler(),
  ];
}

export function registerHandlers(service, url, name, configs = [], preselected, onlyForBaseLayer = false) {
  const handledBy = dataSourceHandlers.filter((dsHandler) =>
    dsHandler.willHandle(service, url, name, configs, preselected, onlyForBaseLayer),
  );
  return handledBy.length !== 0;
}

export function renderDataSourcesInputs() {
  return dataSourceHandlers
    .filter((dsh) => dsh.isHandlingAnyUrl())
    .map((dsh, dshIndex) => <div key={dshIndex}>{dsh.getSearchFormComponents()}</div>);
}

export function getAllAvailableCollections() {
  return dataSourceHandlers
    .filter((dsh) => dsh.isHandlingAnyUrl())
    .map((dsh) => dsh.datasets)
    .flat();
}

function getDataSourceHandlerAndDatasetIdFromCollectionId(collectionId) {
  for (let dsh of dataSourceHandlers) {
    const knownCollections = dsh.KNOWN_COLLECTIONS;
    if (dsh.KNOWN_COLLECTIONS) {
      const datasetId = Object.keys(knownCollections).find(
        (c) => knownCollections[c] && knownCollections[c].indexOf(collectionId) > -1,
      );
      if (datasetId && dsh) {
        return { datasetId, dsh };
      }
    }
  }

  return { datasetId: null, dsh: null };
}

/*
BYOCLayer is an exception where lazy loading of service parameters is not sufficent. If we want to generate search form without
hardcoding collectionIds or without assuming there will always be only one different collection per instance, we need to have
collectionId and only way to get it is to query service.
*/
const collectionTitles = {};

async function updateLayersFromServiceIfNeeded(layers) {
  const updateLayersFromService = layers.filter(
    (l) =>
      l instanceof BYOCLayer ||
      l instanceof S1GRDAWSEULayer ||
      l instanceof DEMLayer ||
      l instanceof DEMCDASLayer,
  );

  await Promise.all(
    updateLayersFromService.map(async (l) => {
      try {
        await l.updateLayerFromServiceIfNeeded({
          timeout: 30000,
          cache: {
            expiresIn: Number.POSITIVE_INFINITY,
            targets: [CacheTarget.MEMORY],
          },
        });
        if (l instanceof BYOCLayer) {
          let availableBands = [];

          try {
            const { datasetId, dsh } = getDataSourceHandlerAndDatasetIdFromCollectionId(l.collectionId);
            availableBands = dsh.getBands(datasetId);
          } catch (err) {
            console.warn(
              `Could not find predefined bands for layer ${l.layerId} in instance ${l.instanceId}, fetching from dashboard...`,
            );
          }

          if (availableBands.length === 0) {
            try {
              availableBands = await l.getAvailableBands({
                timeout: 30000,
                cache: {
                  expiresIn: Number.POSITIVE_INFINITY,
                  targets: [CacheTarget.MEMORY],
                },
              });
            } catch (err) {
              console.error(err);
            }
          }
          l.availableBands = availableBands;
        }
      } catch (e) {
        console.error(`Error retrieving additional data for layer ${l.layerId} in instance ${l.instanceId}`);
        throw e;
      }
    }),
  );
  // update collection titles
  await updateCollectionsFromServiceIfNeeded(updateLayersFromService);
}

const updateLayersWithCollectionTitle = (layers, collectionId, collectionTitle) =>
  layers.filter((l) => l.collectionId === collectionId).forEach((l) => (l.collectionTitle = collectionTitle));

async function updateCollectionsFromServiceIfNeeded(layers) {
  const uniqueCollections = {};

  const byocLayers = layers.filter((l) => l instanceof BYOCLayer);

  // create dict of collections to avoid repeating request
  byocLayers.forEach((l) => {
    uniqueCollections[l.collectionId] = {
      collectionId: l.collectionId,
      locationId: l.locationId,
      subType: l.subType,
    };
  });

  await Promise.all(
    Object.keys(uniqueCollections).map(async (collectionId) => {
      const collection = uniqueCollections[collectionId];
      try {
        //check "cache"
        if (collectionTitles[collection.collectionId]) {
          updateLayersWithCollectionTitle(
            byocLayers,
            collectionId,
            collectionTitles[collection.collectionId],
          );
        } else {
          //check known collections
          const knownCollectionTitle = checkKnownCollections(collectionId);
          if (knownCollectionTitle) {
            updateLayersWithCollectionTitle(byocLayers, collectionId, knownCollectionTitle);
          } else {
            //get collection title from catalog
            if (collection.subType !== BYOCSubTypes.ZARR) {
              const collectionInfo = await getCollectionInformation(
                collection.collectionId,
                collection.locationId,
                collection.subType,
              ).then((r) => r.data);
              collectionTitles[collection.collectionId] = collectionInfo.title;
              updateLayersWithCollectionTitle(byocLayers, collectionId, collectionInfo.title);
            }
          }
        }
      } catch (e) {
        console.error(`Error retrieving additional data for collection ${collection.collectionId} `);
        throw e;
      }
    }),
  );
}

// try to get collection name from datasource handler for known collections (Copernicus&friends)
const checkKnownCollections = (collectionId) => {
  const datasourceHandlers = [
    new CLMSDataSourceHandler(),
    new CCMDataSourceHandler(),
    new MosaicDataSourceHandler(),
    new S1MosaicDataSourceHandler(),
  ];

  let collectionTitle;

  for (let dsh of datasourceHandlers) {
    const knownCollections = dsh.KNOWN_COLLECTIONS;
    const datasetId = Object.keys(knownCollections).find(
      (c) => knownCollections[c] && knownCollections[c].indexOf(collectionId) > -1,
    );
    if (datasetId && dsh.getDatasetSearchLabels) {
      collectionTitle = dsh.getDatasetSearchLabels()[datasetId];
      break;
    }
  }

  return collectionTitle;
};

const xmlParser = new XMLParser(XmlParserOptions);

async function prepareThemeDataSourceHandlers(theme) {
  const allLayers = await Promise.all(
    theme.content.map(async (dataSource) => {
      let dataSourceUrl = dataSource.url.replace(
        'https://services-uswest2.sentinel-hub.com/',
        'https://services.sentinel-hub.com/',
      );

      try {
        const layers = await LayersFactory.makeLayers(dataSourceUrl, null, null, {
          timeout: 30000,
          responseType: 'json',
          cache: {
            expiresIn: 0,
          },
        });
        await updateLayersFromServiceIfNeeded(layers);
        return layers;
      } catch (e) {
        if (isQuotaError({ status: e.status, code: e.code })) {
          store.dispatch(notificationSlice.actions.displayPanelError(QUOTA_ERROR_MESSAGE));
          return;
        }

        if (e?.response?.status === 403 && e?.response?.headers['content-type'] === 'application/xml') {
          const responseData = xmlParser.parse(e.response.data);

          const serviceException = responseData?.ServiceExceptionReport?.ServiceException;
          const responseText = serviceException[0]?.trim();
          store.dispatch(notificationSlice.actions.displayPanelError({ message: responseText }));
        }
        console.warn(e);
        return null;
      }
    }),
  );
  let failedThemeParts = [];
  theme.content.forEach(({ service, url, name, preselected, baseLayer }, i) => {
    if (allLayers[i] === null) {
      const errorText = !!baseLayer
        ? `Error retrieving additional data for ${service} service at ${url}, named ${name} in theme ${theme.name} used for base layer.`
        : `Error retrieving additional data for ${service} service at ${url} which is included in theme part ${name}, skipping.`;
      console.error(errorText);
      failedThemeParts.push(name);
      return;
    }
    const isHandled = registerHandlers(
      service,
      url,
      name ? name : theme.name,
      allLayers[i],
      preselected,
      baseLayer,
    );
    if (!isHandled) {
      console.error(
        `Ignoring entry, unsupported service: ${service} (only 'WMS' and 'WMTS' are currently supported) or url: ${url}`,
      );
    }
  });
  return failedThemeParts;
}

export async function prepareDataSourceHandlers(theme) {
  initializeDataSourceHandlers();

  // for S2 Quarterly Mosaics base layer
  const failedS2QuarterlyMosaicParts = await prepareThemeDataSourceHandlers(
    S2QuarterlyCloudlessMosaicsBaseLayerTheme,
  );

  if (failedS2QuarterlyMosaicParts.length > 0) {
    console.error(`Could not retrieve data for base layer: ${failedS2QuarterlyMosaicParts.toString()}`);
  }

  const failedThemeParts = await prepareThemeDataSourceHandlers(theme);
  console.error(`Could not retrieve data for theme: ${failedThemeParts}`);
  store.dispatch(themesSlice.actions.setDataSourcesInitialized(true));
  return failedThemeParts;
}

export function datasourceForDatasetId(datasetId) {
  const rrdDatasource = datasourceForRRDDatasetId(datasetId);
  if (rrdDatasource) {
    return rrdDatasource;
  }
  switch (datasetId) {
    case S1_AWS_IW_VVVH:
    case S1_AWS_IW_VV:
    case S1_AWS_EW_HHHV:
    case S1_AWS_EW_HH:
    case S1_CDAS_IW_VVVH:
    case S1_CDAS_IW_HHHV:
    case S1_CDAS_IW_VV:
    case S1_CDAS_IW_HH:
    case S1_CDAS_EW_HHHV:
    case S1_CDAS_EW_VVVH:
    case S1_CDAS_EW_HH:
    case S1_CDAS_EW_VV:
    case S1_CDAS_SM_VVVH:
    case S1_CDAS_SM_VV:
    case S1_CDAS_SM_HHHV:
    case S1_CDAS_SM_HH:
      return DATASOURCES.S1;
    case S2_L1C_CDAS:
    case S2_L2A_CDAS:
      return DATASOURCES.S2_CDAS;
    case S3SLSTR:
    case S3OLCI:
      return DATASOURCES.S3;
    case S3SLSTR_CDAS:
    case S3OLCI_CDAS:
    case S3OLCIL2_LAND:
    case S3OLCIL2_WATER:
    case S3SYNERGY_L2_SYN:
    case S3SYNERGY_L2_AOD:
    case S3SYNERGY_L2_VGP:
    case S3SYNERGY_L2_VG1:
    case S3SYNERGY_L2_V10:
      return DATASOURCES.S3_CDAS;
    case S5_O3:
    case S5_NO2:
    case S5_SO2:
    case S5_CO:
    case S5_HCHO:
    case S5_CH4:
    case S5_AER_AI:
    case S5_CLOUD:
    case S5_OTHER:
      return DATASOURCES.S5;
    case S5_O3_CDAS:
    case S5_NO2_CDAS:
    case S5_SO2_CDAS:
    case S5_CO_CDAS:
    case S5_HCHO_CDAS:
    case S5_CH4_CDAS:
    case S5_AER_AI_CDAS:
    case S5_CLOUD_CDAS:
    case S5_OTHER_CDAS:
      return DATASOURCES.S5_CDAS;
    case AWS_L8L1C:
    case AWS_LOTL1:
    case AWS_LOTL2:
      return DATASOURCES.AWS_LANDSAT8;
    case AWS_LTML1:
    case AWS_LTML2:
      return DATASOURCES.AWS_LANDSAT45;
    case AWS_LMSSL1:
      return DATASOURCES.AWS_LANDSAT15;
    case AWS_LETML1:
    case AWS_LETML2:
      return DATASOURCES.AWS_LANDSAT7_ETM;
    case CDAS_L8_L9_LOTL1:
    case CDAS_LANDSAT_MOSAIC:
      return DATASOURCES.COMPLEMENTARY_DATA;
    case DEM_COPERNICUS_30_CDAS:
    case DEM_COPERNICUS_90_CDAS:
      return DATASOURCES.DEM_CDAS;
    case COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC:
    case COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC:
      return DATASOURCES.MOSAIC;
    case S1_MONTHLY_MOSAIC_DH:
    case S1_MONTHLY_MOSAIC_IW:
      return DATASOURCES.S1_MOSAIC;
    case COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL:
    case COPERNICUS_CLMS_BURNT_AREA_DAILY:
    case COPERNICUS_CLMS_BURNT_AREA_MONTHLY:
    case COPERNICUS_CLMS_DMP_1KM_10DAILY:
    case COPERNICUS_CLMS_BURNT_AREA_DAILY_V4:
    case COPERNICUS_CLMS_BURNT_AREA_MONTHLY_V4:
    case COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0:
    case COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1:
    case COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2:
    case COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6:
    case COPERNICUS_CLMS_FAPAR_1KM_10DAILY:
    case COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT0:
    case COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT1:
    case COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT2:
    case COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT6:
    case COPERNICUS_CLMS_LAI_1KM_10DAILY:
    case COPERNICUS_CLMS_LAI_1KM_10DAILY_RT0:
    case COPERNICUS_CLMS_LAI_1KM_10DAILY_RT1:
    case COPERNICUS_CLMS_LAI_1KM_10DAILY_RT2:
    case COPERNICUS_CLMS_LAI_1KM_10DAILY_RT6:
    case COPERNICUS_CLMS_FAPAR_300M_10DAILY:
    case COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0:
    case COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT1:
    case COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT2:
    case COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT6:
    case COPERNICUS_CLMS_FCOVER_1KM_10DAILY:
    case COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT0:
    case COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT1:
    case COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT2:
    case COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT6:
    case COPERNICUS_CLMS_FCOVER_300M_10DAILY:
    case COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT0:
    case COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT1:
    case COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT2:
    case COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT6:
    case COPERNICUS_CLMS_GPP_300M_10DAILY_RT0:
    case COPERNICUS_CLMS_GPP_300M_10DAILY_RT1:
    case COPERNICUS_CLMS_GPP_300M_10DAILY_RT2:
    case COPERNICUS_CLMS_GPP_300M_10DAILY_RT6:
    case COPERNICUS_CLMS_LAI_300M_10DAILY:
    case COPERNICUS_CLMS_LAI_300M_10DAILY_RT0:
    case COPERNICUS_CLMS_LAI_300M_10DAILY_RT1:
    case COPERNICUS_CLMS_LAI_300M_10DAILY_RT2:
    case COPERNICUS_CLMS_LAI_300M_10DAILY_RT6:
    case COPERNICUS_CLMS_NPP_300M_10DAILY_RT0:
    case COPERNICUS_CLMS_NPP_300M_10DAILY_RT1:
    case COPERNICUS_CLMS_NPP_300M_10DAILY_RT2:
    case COPERNICUS_CLMS_NPP_300M_10DAILY_RT6:
    case COPERNICUS_CLMS_SWI_12_5KM_10DAILY:
    case COPERNICUS_CLMS_SWI_12_5KM_DAILY:
    case COPERNICUS_CLMS_SWI_1KM_DAILY:
    case COPERNICUS_CLMS_DMP_300M_10DAILY_RT0:
    case COPERNICUS_CLMS_DMP_300M_10DAILY_RT1:
    case COPERNICUS_CLMS_DMP_300M_10DAILY_RT2:
    case COPERNICUS_CLMS_DMP_300M_10DAILY_RT5:
    case COPERNICUS_CLMS_DMP_300M_10DAILY_RT6:
    case COPERNICUS_CLMS_LST_5KM_10DAILY_V1:
    case COPERNICUS_CLMS_LST_5KM_10DAILY_V2:
    case COPERNICUS_CLMS_NDVI_1KM_STATS_V2:
    case COPERNICUS_CLMS_NDVI_1KM_STATS_V3:
    case COPERNICUS_CLMS_NDVI_1KM_10DAILY_V2:
    case COPERNICUS_CLMS_NDVI_300M_10DAILY_V1:
    case COPERNICUS_CLMS_NDVI_300M_10DAILY_V2:
    case COPERNICUS_CLMS_SSM_1KM_DAILY_V1:
    case COPERNICUS_CLMS_LSP_300M_YEARLY_V1:
    case COPERNICUS_CLMS_LSP_300M_YEARLY_V2:
    case COPERNICUS_CLMS_LCC_100M_YEARLY_V3:
    case COPERNICUS_CLMS_LST_5KM_HOURLY_V1:
    case COPERNICUS_CLMS_LST_5KM_HOURLY_V2:
    case COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2:
    case COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0:
    case COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1:
    case COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2:
    case COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6:
    case COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0:
    case COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1:
    case COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2:
    case COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5:
    case COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6:
    case COPERNICUS_CLMS_WB_300M_10DAILY_V1:
    case COPERNICUS_CLMS_WB_1KM_10DAILY_V2:
    case COPERNICUS_CLMS_SWE_5KM_DAILY_V1:
    case COPERNICUS_CLMS_SWE_5KM_DAILY_V2:
    case COPERNICUS_CLMS_SCE_EUROPE_500M_DAILY_V1:
    case COPERNICUS_CLMS_SCE_NH_1KM_DAILY_V1:
    case COPERNICUS_CLMS_SCE_GLOBAL_1KM_DAILY_V1:
    case COPERNICUS_CLMS_WB_300M_MONTHLY_V2:
    case COPERNICUS_CLMS_LIE_500M_DAILY_V1:
    case COPERNICUS_CLMS_LIE_250M_DAILY_V2:
    case COPERNICUS_CLMS_WB_100M_MONTHLY_V1:
    case COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1:
    case COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2:
    case COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2:
    case COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1:
    case COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1:
    case COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1:
    case COPERNICUS_CLMS_LCM_10M_YEARLY_V1:
    case COPERNICUS_CLMS_TCD_10M_YEARLY_V1:
    case COPERNICUS_CLMS_LIE_500M_DAILY_V2:
    case COPERNICUS_CLMS_SWI_12_5KM_DAILY_V4:
    case COPERNICUS_CLMS_SWI_1KM_DAILY_V2:
    case COPERNICUS_CLMS_SWI_12_5KM_10DAILY_V4:
    case COPERNICUS_CLMS_LIE_BALTIC_250M_DAILY_V1:
    case COPERNICUS_CLMS_ETA_GLOBAL_300M_10DAILY_V1:
    case COPERNICUS_CLMS_HF_GLOBAL_300M_DAILY_V1:
    case COPERNICUS_CLMS_NDVI_300M_10DAILY_V3:
    case COPERNICUS_CLMS_LSWT_NRT_GLOBAL_1KM_10DAILY_V1:
    case COPERNICUS_CLMS_LSWT_OFFLINE_1KM_10DAILY_V1:
    case COPERNICUS_CLMS_LWQ_NRT_GLOBAL_100M_10DAILY_V2:
      return DATASOURCES.CLMS;
    case CDSE_CCM_VHR_IMAGE_2018_COLLECTION:
    case CDSE_CCM_VHR_IMAGE_2021_COLLECTION:
    case CDSE_CCM_VHR_IMAGE_2024_COLLECTION:
      return DATASOURCES.CCM;
    case EVOLAND_C01_CONTINUOUS_FOREST_MONITORING:
    case EVOLAND_C02_FOREST_DISTURBANCE:
    case EVOLAND_C03_FOREST_BIOMASS:
    case EVOLAND_C04_COVER_CROP_TYPE:
    case EVOLAND_C05_GRASSLAND_CROPLAND_GPP:
    case EVOLAND_C06_SMALL_LANDSCAPE_FEATURES:
    case EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING:
    case EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING:
    case EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING:
    case EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS:
    case EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING:
    case EVOLAND_C12_TREE_TYPES:
      return DATASOURCES.EVOLAND;
    default:
      return null;
  }
}

export function getDataSourceHandler(datasetId) {
  const datasource = datasourceForDatasetId(datasetId);
  if (datasource) {
    return dataSourceHandlers.find((d) => d.datasource === datasource);
  } else {
    return checkIfCustom(datasetId);
  }
}

export function checkIfCustom(datasetId) {
  const customDatasourceHandlers = dataSourceHandlers.filter((d) => d.datasource === DATASOURCES.CUSTOM);
  for (const dsh of customDatasourceHandlers) {
    if (dsh && dsh.datasets) {
      const isCustomDataset = dsh.datasets.includes(datasetId);
      if (isCustomDataset) {
        return dsh;
      }
    }
  }
  return null;
}

export const datasetLabels = {
  [S1_AWS_IW_VVVH]: 'Sentinel-1 AWS-IW-VVVH',
  [S1_AWS_IW_VV]: 'Sentinel-1 AWS-IW-VV',
  [S1_AWS_EW_HHHV]: 'Sentinel-1 AWS-EW-HHHV',
  [S1_AWS_EW_HH]: 'Sentinel-1 AWS-EW-HH',
  [S1_CDAS_IW_VVVH]: 'Sentinel-1 IW VV+VH',
  [S1_CDAS_IW_HHHV]: 'Sentinel-1 IW HH+HV',
  [S1_CDAS_IW_VV]: 'Sentinel-1 IW VV',
  [S1_CDAS_IW_HH]: 'Sentinel-1 IW HH',
  [S1_CDAS_EW_HHHV]: 'Sentinel-1 EW HH+HV',
  [S1_CDAS_EW_VVVH]: 'Sentinel-1 EW VV+VH',
  [S1_CDAS_EW_HH]: 'Sentinel-1 EW HH',
  [S1_CDAS_EW_VV]: 'Sentinel-1 EW VV',
  [S1_CDAS_SM_VVVH]: 'Sentinel-1 SM VV+VH',
  [S1_CDAS_SM_VV]: 'Sentinel-1 SM VV',
  [S1_CDAS_SM_HHHV]: 'Sentinel-1 SM HH+HV',
  [S1_CDAS_SM_HH]: 'Sentinel-1 SM HH',
  [S2_L1C_CDAS]: 'Sentinel-2 L1C',
  [S2_L2A_CDAS]: 'Sentinel-2 L2A',
  [S3SLSTR]: 'Sentinel-3 SLSTR',
  [S3OLCI]: 'Sentinel-3 OLCI',
  [S3SLSTR_CDAS]: 'Sentinel-3 SLSTR',
  [S3OLCI_CDAS]: 'Sentinel-3 OLCI',
  [S3OLCIL2_LAND]: 'Sentinel-3 OLCI L2 Land',
  [S3OLCIL2_WATER]: 'Sentinel-3 OLCI L2 Water',
  [S3SYNERGY_L2_SYN]: 'Sentinel-3 Synergy L2 SYN',
  [S3SYNERGY_L2_AOD]: 'Sentinel-3 Synergy L2 AOD',
  [S3SYNERGY_L2_VGP]: 'Sentinel-3 Synergy L2 VGP',
  [S3SYNERGY_L2_VG1]: 'Sentinel-3 Synergy L2 VG1',
  [S3SYNERGY_L2_V10]: 'Sentinel-3 Synergy L2 V10',
  [S5_O3]: 'Sentinel-5P O3',
  [S5_NO2]: 'Sentinel-5P NO2',
  [S5_SO2]: 'Sentinel-5P SO2',
  [S5_CO]: 'Sentinel-5P CO',
  [S5_HCHO]: 'Sentinel-5P HCHO',
  [S5_CH4]: 'Sentinel-5P CH4',
  [S5_AER_AI]: 'Sentinel-5P AER_AI',
  [S5_CLOUD]: 'Sentinel-5P CLOUD',
  [S5_OTHER]: 'Sentinel-5P Other',
  [S5_O3_CDAS]: 'Sentinel-5P O3',
  [S5_NO2_CDAS]: 'Sentinel-5P NO2',
  [S5_SO2_CDAS]: 'Sentinel-5P SO2',
  [S5_CO_CDAS]: 'Sentinel-5P CO',
  [S5_HCHO_CDAS]: 'Sentinel-5P HCHO',
  [S5_CH4_CDAS]: 'Sentinel-5P CH4',
  [S5_AER_AI_CDAS]: 'Sentinel-5P AER_AI',
  [S5_CLOUD_CDAS]: 'Sentinel-5P CLOUD',
  [S5_OTHER_CDAS]: 'Sentinel-5P Other',
  [CDAS_L8_L9_LOTL1]: t`Landsat 8-9 L1`,
  [CDAS_LANDSAT_MOSAIC]: 'Landsat Mosaics',
  [AWS_L8L1C]: 'Landsat 8 (USGS archive)',
  [AWS_LOTL1]: 'Landsat 8-9 L1',
  [AWS_LOTL2]: 'Landsat 8-9 L2',
  [AWS_LTML1]: 'Landsat 4-5 TM L1',
  [AWS_LTML2]: 'Landsat 4-5 TM L2',
  [AWS_LMSSL1]: 'Landsat 1-5 MSS L1',
  [AWS_LETML1]: 'Landsat 7 ETM+ L1',
  [AWS_LETML2]: 'Landsat 7 ETM+ L2',
  [CUSTOM]: 'CUSTOM',
  [DEM_COPERNICUS_30_CDAS]: 'DEM COPERNICUS 30',
  [DEM_COPERNICUS_90_CDAS]: 'DEM COPERNICUS 90',
  [COPERNICUS_CORINE_LAND_COVER]: 'CORINE Land Cover',
  [COPERNICUS_GLOBAL_LAND_COVER]: 'Global Land Cover',
  [COPERNICUS_WATER_BODIES]: 'Water Bodies',
  [COPERNICUS_CLC_ACCOUNTING]: 'CORINE Land Cover Accounting Layers',
  [COPERNICUS_WORLDCOVER_ANNUAL_CLOUDLESS_MOSAIC]: 'WorldCover Annual Cloudless Mosaics',
  [COPERNICUS_WORLDCOVER_QUARTERLY_CLOUDLESS_MOSAIC]: 'Sentinel-2 Quarterly Mosaics',
  [S1_MONTHLY_MOSAIC_DH]: 'Sentinel-1 DH',
  [S1_MONTHLY_MOSAIC_IW]: 'Sentinel-1 IW',
  [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: 'VHR Europe 2018',
  [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: 'VHR Europe 2021',
  [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: 'VHR Europe 2024',
  [COPERNICUS_CLMS_BURNT_AREA_DAILY]: t`BA 300m Daily V3`,
  [COPERNICUS_CLMS_BURNT_AREA_MONTHLY]: t`BA 300m Monthly V3`,
  [COPERNICUS_CLMS_BURNT_AREA_DAILY_V4]: t`BA 300m Daily V4`,
  [COPERNICUS_CLMS_BURNT_AREA_MONTHLY_V4]: t`BA 300m Monthly V4`,
  [COPERNICUS_CLMS_DMP_1KM_10DAILY]: t`DMP 1km 10-daily V2`,
  [COPERNICUS_CLMS_DMP_1KM_10DAILY_RT0]: t`DMP 1km 10-daily V2 RT0`,
  [COPERNICUS_CLMS_DMP_1KM_10DAILY_RT1]: t`DMP 1km 10-daily V2 RT1`,
  [COPERNICUS_CLMS_DMP_1KM_10DAILY_RT2]: t`DMP 1km 10-daily V2 RT2`,
  [COPERNICUS_CLMS_DMP_1KM_10DAILY_RT6]: t`DMP 1km 10-daily V2 RT6`,
  [COPERNICUS_CLMS_FAPAR_1KM_10DAILY]: t`FAPAR 1km 10-daily V2`,
  [COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT0]: t`FAPAR 1km 10-daily V2 RT0`,
  [COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT1]: t`FAPAR 1km 10-daily V2 RT1`,
  [COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT2]: t`FAPAR 1km 10-daily V2 RT2`,
  [COPERNICUS_CLMS_FAPAR_1KM_10DAILY_RT6]: t`FAPAR 1km 10-daily V2 RT6`,
  [COPERNICUS_CLMS_LAI_1KM_10DAILY]: t`LAI 1km 10-daily V2`,
  [COPERNICUS_CLMS_LAI_1KM_10DAILY_RT0]: t`LAI 1km 10-daily V2 RT0`,
  [COPERNICUS_CLMS_LAI_1KM_10DAILY_RT1]: t`LAI 1km 10-daily V2 RT1`,
  [COPERNICUS_CLMS_LAI_1KM_10DAILY_RT2]: t`LAI 1km 10-daily V2 RT2`,
  [COPERNICUS_CLMS_LAI_1KM_10DAILY_RT6]: t`LAI 1km 10-daily V2 RT6`,
  [COPERNICUS_CLMS_FAPAR_300M_10DAILY]: t`FAPAR 300m 10-daily V1`,
  [COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT0]: t`FAPAR 300m 10-daily V1 RT0`,
  [COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT1]: t`FAPAR 300m 10-daily V1 RT1`,
  [COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT2]: t`FAPAR 300m 10-daily V1 RT2`,
  [COPERNICUS_CLMS_FAPAR_300M_10DAILY_RT6]: t`FAPAR 300m 10-daily V1 RT6`,
  [COPERNICUS_CLMS_FCOVER_1KM_10DAILY]: t`FCOVER 1km 10-daily V2`,
  [COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT0]: t`FCOVER 1km 10-daily V2 RT0`,
  [COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT1]: t`FCOVER 1km 10-daily V2 RT1`,
  [COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT2]: t`FCOVER 1km 10-daily V2 RT2`,
  [COPERNICUS_CLMS_FCOVER_1KM_10DAILY_RT6]: t`FCOVER 1km 10-daily V2 RT6`,
  [COPERNICUS_CLMS_FCOVER_300M_10DAILY]: t`FCOVER 300m 10-daily V1`,
  [COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT0]: t`FCOVER 300m 10-daily V1 RT0`,
  [COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT1]: t`FCOVER 300m 10-daily V1 RT1`,
  [COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT2]: t`FCOVER 300m 10-daily V1 RT2`,
  [COPERNICUS_CLMS_FCOVER_300M_10DAILY_RT6]: t`FCOVER 300m 10-daily V1 RT6`,
  [COPERNICUS_CLMS_GPP_300M_10DAILY_RT0]: t`GPP 300m 10-daily V1`,
  [COPERNICUS_CLMS_GPP_300M_10DAILY_RT1]: t`GPP 300m 10-daily V1 RT1`,
  [COPERNICUS_CLMS_GPP_300M_10DAILY_RT2]: t`GPP 300m 10-daily V1 RT2`,
  [COPERNICUS_CLMS_GPP_300M_10DAILY_RT6]: t`GPP 300m 10-daily V1 RT6`,
  [COPERNICUS_CLMS_LAI_300M_10DAILY]: t`LAI 300m 10-daily V1`,
  [COPERNICUS_CLMS_LAI_300M_10DAILY_RT0]: t`LAI 300m 10-daily V1 RT0`,
  [COPERNICUS_CLMS_LAI_300M_10DAILY_RT1]: t`LAI 300m 10-daily V1 RT1`,
  [COPERNICUS_CLMS_LAI_300M_10DAILY_RT2]: t`LAI 300m 10-daily V1 RT2`,
  [COPERNICUS_CLMS_LAI_300M_10DAILY_RT6]: t`LAI 300m 10-daily V1 RT6`,
  [COPERNICUS_CLMS_NPP_300M_10DAILY_RT0]: t`NPP 300m 10-daily V1`,
  [COPERNICUS_CLMS_NPP_300M_10DAILY_RT1]: t`NPP 300m 10-daily V1 RT1`,
  [COPERNICUS_CLMS_NPP_300M_10DAILY_RT2]: t`NPP 300m 10-daily V1 RT2`,
  [COPERNICUS_CLMS_NPP_300M_10DAILY_RT6]: t`NPP 300m 10-daily V1 RT6`,
  [COPERNICUS_CLMS_SWI_12_5KM_10DAILY]: t`SWI Global 12.5km 10-daily V3`,
  [COPERNICUS_CLMS_SWI_12_5KM_DAILY]: t`SWI Global 12.5km Daily V3`,
  [COPERNICUS_CLMS_SWI_1KM_DAILY]: t`SWI Europe 1km Daily V1`,
  [COPERNICUS_CLMS_DMP_300M_10DAILY_RT0]: t`DMP 300m 10-daily V1`,
  [COPERNICUS_CLMS_DMP_300M_10DAILY_RT1]: t`DMP 300m 10-daily V1 RT1`,
  [COPERNICUS_CLMS_DMP_300M_10DAILY_RT2]: t`DMP 300m 10-daily V1 RT2`,
  [COPERNICUS_CLMS_DMP_300M_10DAILY_RT5]: t`DMP 300m 10-daily V1 RT5`,
  [COPERNICUS_CLMS_DMP_300M_10DAILY_RT6]: t`DMP 300m 10-daily V1 RT6`,
  [COPERNICUS_CLMS_LST_5KM_10DAILY_V1]: t`LST TCI 5km 10-daily V1`,
  [COPERNICUS_CLMS_LST_5KM_10DAILY_V2]: t`LST TCI 5km 10-daily V2`,
  [COPERNICUS_CLMS_NDVI_1KM_STATS_V2]: t`NDVI LTS 1km V2`,
  [COPERNICUS_CLMS_NDVI_1KM_STATS_V3]: t`NDVI LTS 1km V3`,
  [COPERNICUS_CLMS_VEGETATION_INDICES_NDVI_GLOBAL]: t`NDVI 1km 10-daily V3`,
  [COPERNICUS_CLMS_NDVI_1KM_10DAILY_V2]: t`NDVI 1km 10-daily V2`,
  [COPERNICUS_CLMS_NDVI_300M_10DAILY_V1]: t`NDVI 300m 10-daily V1`,
  [COPERNICUS_CLMS_NDVI_300M_10DAILY_V2]: t`NDVI 300m 10-daily V2`,
  [COPERNICUS_CLMS_NDVI_300M_10DAILY_V3]: t`NDVI 300m 10-daily V3`,
  [COPERNICUS_CLMS_SSM_1KM_DAILY_V1]: t`SSM 1km Daily V1`,
  [COPERNICUS_CLMS_LSP_300M_YEARLY_V1]: t`LSP 300m Yearly V1`,
  [COPERNICUS_CLMS_LSP_300M_YEARLY_V2]: t`LSP 300m Yearly V2`,
  [COPERNICUS_CLMS_LCC_100M_YEARLY_V3]: t`LCC 100m Yearly V3`,
  [COPERNICUS_CLMS_LST_5KM_HOURLY_V1]: t`LST 5km Hourly V1`,
  [COPERNICUS_CLMS_LST_5KM_HOURLY_V2]: t`LST 5km Hourly V2`,
  [COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2]: t`GDMP 1km 10-daily V2`,
  [COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT0]: t`GDMP 1km 10-daily V2 RT0`,
  [COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT1]: t`GDMP 1km 10-daily V2 RT1`,
  [COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT2]: t`GDMP 1km 10-daily V2 RT2`,
  [COPERNICUS_CLMS_GDMP_1KM_10DAILY_V2_RT6]: t`GDMP 1km 10-daily V2 RT6`,
  [COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT0]: t`GDMP 300m 10-daily V1`,
  [COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT1]: t`GDMP 300m 10-daily V1 RT1`,
  [COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT2]: t`GDMP 300m 10-daily V1 RT2`,
  [COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT5]: t`GDMP 300m 10-daily V1 RT5`,
  [COPERNICUS_CLMS_GDMP_300M_10DAILY_V1_RT6]: t`GDMP 300m 10-daily V1 RT6`,
  [COPERNICUS_CLMS_WB_300M_10DAILY_V1]: t`WB 300m 10-daily V1`,
  [COPERNICUS_CLMS_WB_1KM_10DAILY_V2]: t`WB 1km 10-daily V2`,
  [COPERNICUS_CLMS_SWE_5KM_DAILY_V1]: t`SWE 5km Daily V1`,
  [COPERNICUS_CLMS_SWE_5KM_DAILY_V2]: t`SWE 5km Daily V2`,
  [COPERNICUS_CLMS_SCE_EUROPE_500M_DAILY_V1]: t`SCE Europe 500m Daily V1`,
  [COPERNICUS_CLMS_SCE_NH_1KM_DAILY_V1]: t`SCE NH 1km Daily V1`,
  [COPERNICUS_CLMS_SCE_GLOBAL_1KM_DAILY_V1]: t`SCE Global 1km Daily V1`,
  [COPERNICUS_CLMS_WB_300M_MONTHLY_V2]: t`WB 300m Monthly V2`,
  [COPERNICUS_CLMS_LIE_500M_DAILY_V1]: t`LIE 500m Daily V1`,
  [COPERNICUS_CLMS_LIE_250M_DAILY_V2]: t`LIE 250m Daily V2`,
  [COPERNICUS_CLMS_WB_100M_MONTHLY_V1]: t`WB 100m Monthly V1`,
  [COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V1]: t`LST Daily-cycle 5km 10-daily V1`,
  [COPERNICUS_CLMS_LST_5KM_10DAILY_DAILY_CYCLE_V2]: t`LST Daily-cycle 5km 10-daily V2`,
  [COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V2]: t`LWQ NRT 300m 10-daily V2`,
  [COPERNICUS_CLMS_LWQ_300M_10DAILY_REPROC_V1]: t`LWQ REPROC 300m 10-daily V1`,
  [COPERNICUS_CLMS_LWQ_300M_10DAILY_NRT_V1]: t`LWQ NRT 300m 10-daily V1`,
  [COPERNICUS_CLMS_LWQ_100M_10DAILY_NRT_V1]: t`LWQ NRT 100m 10-daily V1`,
  [COPERNICUS_CLMS_LCM_10M_YEARLY_V1]: t`LCM Global 10m Yearly V1`,
  [COPERNICUS_CLMS_TCD_10M_YEARLY_V1]: t`TCD Pan-tropical 10m Yearly V1`,
  [COPERNICUS_CLMS_LIE_500M_DAILY_V2]: t`LIE 500m Daily V2`,
  [COPERNICUS_CLMS_SWI_12_5KM_DAILY_V4]: t`SWI Global 12.5km Daily V4`,
  [COPERNICUS_CLMS_SWI_1KM_DAILY_V2]: t`SWI Europe 1km Daily V2`,
  [COPERNICUS_CLMS_SWI_12_5KM_10DAILY_V4]: t`SWI Global 12.5km 10-daily V4`,
  [EVOLAND_C01_CONTINUOUS_FOREST_MONITORING]: t`C01 Forest`,
  [EVOLAND_C02_FOREST_DISTURBANCE]: t`C02 Forest Disturbance`,
  [EVOLAND_C03_FOREST_BIOMASS]: t`C03 Forest Biomass`,
  [EVOLAND_C04_COVER_CROP_TYPE]: t`C04 Cover Crop Type`,
  [EVOLAND_C05_GRASSLAND_CROPLAND_GPP]: t`C05 Forest Disturbance`,
  [EVOLAND_C06_SMALL_LANDSCAPE_FEATURES]: t`C06 Small Landscape Features`,
  [EVOLAND_C07_IMPROVED_WATER_BODIES_MAPPING]: t`C07 Improved Water Bodies Mapping`,
  [EVOLAND_C08_CONTINUOUS_IMPERVIOUSNESS_MONITORING]: t`C08 Continuous Imperviousness Monitoring`,
  [EVOLAND_C09_AUTOMATED_LAND_USE_MAPPING]: t`C09 Automated Land Use Mapping`,
  [EVOLAND_C10_LAND_SURFACE_CHARACTERISTICS]: t`C10 Land Surface Characteristics`,
  [EVOLAND_C11_ON_DEMAND_LAND_COVER_MAPPING]: t`C11 On-Demand Land Cover Mapping`,
  [EVOLAND_C12_TREE_TYPES]: t`C12 Tree Types`,
  [COPERNICUS_CLMS_LIE_BALTIC_250M_DAILY_V1]: t`LIE Baltic 250m Daily V1`,
  [COPERNICUS_CLMS_ETA_GLOBAL_300M_10DAILY_V1]: t`ETA Global 300m 10-daily V1`,
  [COPERNICUS_CLMS_HF_GLOBAL_300M_DAILY_V1]: t`HF Global 300m Daily V1`,
  [COPERNICUS_CLMS_LSWT_OFFLINE_1KM_10DAILY_V1]: t`LSWT Offline 1km 10-daily V1`,
  [COPERNICUS_CLMS_LSWT_NRT_GLOBAL_1KM_10DAILY_V1]: t`LSWT NRT Global 1km 10-daily V1`,
  [COPERNICUS_CLMS_LWQ_NRT_GLOBAL_100M_10DAILY_V2]: t`LWQ NRT 100m 10-daily V2`,
};

export function getDatasetLabel(datasetId) {
  let datasetLabel;
  const dataSourceHandler = getDataSourceHandler(datasetId);
  if (dataSourceHandler) {
    datasetLabel = dataSourceHandler.getDatasetLabel(datasetId);
  }
  return datasetLabel;
}

export function getEvalsource(datasetId) {
  switch (datasetId) {
    case S1_AWS_IW_VVVH:
    case S1_AWS_IW_VV:
    case S1_AWS_EW_HHHV:
    case S1_AWS_EW_HH:
    case S1_CDAS_IW_VVVH:
    case S1_CDAS_IW_HHHV:
    case S1_CDAS_IW_VV:
    case S1_CDAS_IW_HH:
    case S1_CDAS_EW_HHHV:
    case S1_CDAS_EW_VVVH:
    case S1_CDAS_EW_HH:
    case S1_CDAS_EW_VV:
    case S1_CDAS_SM_VVVH:
    case S1_CDAS_SM_VV:
    case S1_CDAS_SM_HHHV:
    case S1_CDAS_SM_HH:
      return 'S1GRD';
    case S2_L1C_CDAS:
      return 'S2_L1C_CDAS';
    case S2_L2A_CDAS:
      return 'S2_L2A_CDAS';
    case S3SLSTR:
      return 'S3SLSTR';
    case S3OLCI:
      return 'S3OLCI';
    case S3SLSTR_CDAS:
      return 'S3SLSTR_CDAS';
    case S3OLCI_CDAS:
      return 'S3OLCI_CDAS';
    case S5_O3:
    case S5_NO2:
    case S5_SO2:
    case S5_CO:
    case S5_HCHO:
    case S5_CH4:
    case S5_AER_AI:
    case S5_CLOUD:
    case S5_OTHER:
    case S5_O3_CDAS:
    case S5_NO2_CDAS:
    case S5_SO2_CDAS:
    case S5_CO_CDAS:
    case S5_HCHO_CDAS:
    case S5_CH4_CDAS:
    case S5_AER_AI_CDAS:
    case S5_CLOUD_CDAS:
    case S5_OTHER_CDAS:
      return 'S5P_L2';
    case AWS_L8L1C:
    case AWS_LOTL1:
    case AWS_LOTL2:
      return 'L8';
    default:
      return null;
  }
}

export function supportsFIS(visualizationUrl, datasetId, layerId, isCustom) {
  const dsh = getDataSourceHandler(datasetId);
  if (!dsh) {
    return false;
  }
  const hasFISLayer = !!dsh.getFISLayer(visualizationUrl, datasetId, layerId, isCustom);
  return hasFISLayer;
}

export function datasetHasAnyFISLayer(datasetId) {
  const dsh = getDataSourceHandler(datasetId);
  return dsh && !!Object.keys(dsh.FISLayers).length;
}

export function getDataSourceHashtags(datasetId) {
  switch (datasetId) {
    case S1_AWS_IW_VVVH:
    case S1_AWS_IW_VV:
    case S1_AWS_EW_HHHV:
    case S1_AWS_EW_HH:
    case S1_CDAS_IW_VVVH:
    case S1_CDAS_IW_HHHV:
    case S1_CDAS_IW_VV:
    case S1_CDAS_IW_HH:
    case S1_CDAS_EW_HHHV:
    case S1_CDAS_EW_VVVH:
    case S1_CDAS_EW_HH:
    case S1_CDAS_EW_VV:
    case S1_CDAS_SM_VVVH:
    case S1_CDAS_SM_VV:
    case S1_CDAS_SM_HHHV:
    case S1_CDAS_SM_HH:
      return 'Sentinel-1,Copernicus';
    case S2_L1C_CDAS:
    case S2_L2A_CDAS:
      return 'Sentinel-2,Copernicus';
    case S3SLSTR:
    case S3OLCI:
    case S3SLSTR_CDAS:
    case S3OLCI_CDAS:
    case S3OLCIL2_LAND:
    case S3OLCIL2_WATER:
    case S3SYNERGY_L2_SYN:
    case S3SYNERGY_L2_V10:
    case S3SYNERGY_L2_VG1:
    case S3SYNERGY_L2_VGP:
    case S3SYNERGY_L2_AOD:
      return 'Sentinel-3,Copernicus';
    case S5_O3:
    case S5_NO2:
    case S5_SO2:
    case S5_CO:
    case S5_HCHO:
    case S5_CH4:
    case S5_AER_AI:
    case S5_CLOUD:
    case S5_OTHER:
    case S5_O3_CDAS:
    case S5_NO2_CDAS:
    case S5_SO2_CDAS:
    case S5_CO_CDAS:
    case S5_HCHO_CDAS:
    case S5_CH4_CDAS:
    case S5_AER_AI_CDAS:
    case S5_CLOUD_CDAS:
    case S5_OTHER_CDAS:
      return 'Sentinel-5P,Copernicus';
    case AWS_L8L1C:
    case AWS_LOTL1:
    case AWS_LOTL2:
    case AWS_LMSSL1:
    case AWS_LETML1:
    case AWS_LETML2:
    case CDAS_L8_L9_LOTL1:
    case CDAS_LANDSAT_MOSAIC:
      return 'Landsat,NASA';
    default:
      if (checkIfCustom(datasetId)) {
        return 'BYOC';
      } else {
        return '';
      }
  }
}

export const getSHServiceRootUrl = () => `${global.window.API_ENDPOINT_CONFIG.SH_SERVICES_URL}/`;
