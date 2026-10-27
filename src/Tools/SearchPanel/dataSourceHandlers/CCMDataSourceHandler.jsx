import { DATASOURCES } from '../../../const';
import {
  CDSE_CCM_MR_THERMAL_LST_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
  CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION,
} from './dataSourceConstants';
import moment from 'moment';
import { LocationIdSHv3 } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import AbstractBYOCDataSourceHandler from './AbstractBYOCDataSourceHandler';
import {
  getCCMCollectionMarkdown,
  getCCMMRThermalLSTMarkdown,
  getCCMVHRImage2018Markdown,
  getCCMVHRImage2021Markdown,
  getCCMVHRImage2024Markdown,
  getCCMVHRImageMosaic2024Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/CCMTooltip';

import {
  CCM_MR_THERMAL_LST_BANDS,
  CCM_VHR_IMAGE_2018_BANDS,
  CCM_VHR_IMAGE_2021_BANDS,
  CCM_VHR_IMAGE_2024_BANDS,
  CCM_VHR_IMAGE_2024_MOSAIC_BANDS,
} from './datasourceAssets/CCMBands';
import { CCM_KNOWN_COLLECTIONS } from './knownCollections';

export default class CCMDataSourceHandler extends AbstractBYOCDataSourceHandler {
  getDatasetSearchLabels = () => ({
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: t`VHR Europe 2018`,
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: t`VHR Europe 2021`,
    [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: t`VHR Europe 2024`,
    [CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION]: t`VHR Europe 2024 Mosaic`,
    [CDSE_CCM_MR_THERMAL_LST_COLLECTION]: t`MR Thermal LST`,
  });

  urls = {
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: [],
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: [],
    [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: [],
    [CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION]: [],
    [CDSE_CCM_MR_THERMAL_LST_COLLECTION]: [],
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
    [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: {
      min: 8,
      max: 25,
    },
    [CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION]: {
      min: 7,
      max: 25,
    },
    [CDSE_CCM_MR_THERMAL_LST_COLLECTION]: {
      min: 6,
      max: 25,
    },
  };

  KNOWN_COLLECTIONS = CCM_KNOWN_COLLECTIONS;

  KNOWN_COLLECTIONS_LOCATIONS = {
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: LocationIdSHv3.cdse,
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: LocationIdSHv3.cdse,
    [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: LocationIdSHv3.cdse,
    [CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION]: LocationIdSHv3.cdse,
    [CDSE_CCM_MR_THERMAL_LST_COLLECTION]: LocationIdSHv3.cdse,
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
    [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: {
      minDate: moment.utc('2023-01-01'),
      maxDate: moment.utc('2025-12-31'),
    },
    [CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION]: {
      minDate: moment.utc('2024-01-01'),
      maxDate: moment.utc('2024-01-01'),
    },
    [CDSE_CCM_MR_THERMAL_LST_COLLECTION]: {
      minDate: moment.utc('2025-01-01'),
      maxDate: moment.utc('2025-12-31'),
    },
  };

  getDescription = () => getCCMCollectionMarkdown();

  getBands = (datasetId) => {
    switch (datasetId) {
      case CDSE_CCM_VHR_IMAGE_2018_COLLECTION:
        return CCM_VHR_IMAGE_2018_BANDS;
      case CDSE_CCM_VHR_IMAGE_2021_COLLECTION:
        return CCM_VHR_IMAGE_2021_BANDS;
      case CDSE_CCM_VHR_IMAGE_2024_COLLECTION:
        return CCM_VHR_IMAGE_2024_BANDS;
      case CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION:
        return CCM_VHR_IMAGE_2024_MOSAIC_BANDS;
      case CDSE_CCM_MR_THERMAL_LST_COLLECTION:
        return CCM_MR_THERMAL_LST_BANDS;
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
      case CDSE_CCM_VHR_IMAGE_2024_COLLECTION:
        return getCCMVHRImage2024Markdown();
      case CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION:
        return getCCMVHRImageMosaic2024Markdown();
      case CDSE_CCM_MR_THERMAL_LST_COLLECTION:
        return getCCMMRThermalLSTMarkdown();
      default:
        return null;
    }
  };

  getCollectionByDatasetId(datasetId) {
    return Object.keys(this.KNOWN_COLLECTIONS).find((collection) =>
      this.KNOWN_COLLECTIONS[collection].includes(datasetId),
    );
  }

  getDefaultScalingFactor(datasetId) {
    // V100 holds Kelvin × 100 (~24000-31000), so scale 310 K to 1
    if (datasetId === CDSE_CCM_MR_THERMAL_LST_COLLECTION) {
      return 1 / 31000;
    }
    return 1 / 1000;
  }

  supportsFindProductsForCurrentView = (datasetId) => {
    switch (datasetId) {
      case CDSE_CCM_VHR_IMAGE_MOSAIC_2024_COLLECTION:
        return false;
      default:
        return true;
    }
  };
}
