import { DATASOURCES } from '../../../const';
import {
  CDSE_CCM_VHR_IMAGE_2018_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2021_COLLECTION,
  CDSE_CCM_VHR_IMAGE_2024_COLLECTION,
} from './dataSourceConstants';
import moment from 'moment';
import { LocationIdSHv3 } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import AbstractBYOCDataSourceHandler from './AbstractBYOCDataSourceHandler';
import {
  getCCMCollectionMarkdown,
  getCCMVHRImage2018Markdown,
  getCCMVHRImage2021Markdown,
  getCCMVHRImage2024Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/CCMTooltip';

import {
  CCM_VHR_IMAGE_2018_BANDS,
  CCM_VHR_IMAGE_2021_BANDS,
  CCM_VHR_IMAGE_2024_BANDS,
} from './datasourceAssets/CCMBands';

export default class CCMDataSourceHandler extends AbstractBYOCDataSourceHandler {
  getDatasetSearchLabels = () => ({
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: t`VHR Europe 2018`,
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: t`VHR Europe 2021`,
    [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: t`VHR Europe 2024`,
  });

  urls = {
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: [],
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: [],
    [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: [],
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
  };

  KNOWN_COLLECTIONS = {
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: ['4ab2c8f6-ef9e-4989-9c2e-3fae9c88da1e'], // collection id from byoc admin account
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: ['0c96598b-edb2-4a5b-afb0-4d35389ba098'],
    [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: ['b016cf66-b68e-472d-8421-1fe9d384762f'],
  };

  KNOWN_COLLECTIONS_LOCATIONS = {
    [CDSE_CCM_VHR_IMAGE_2018_COLLECTION]: LocationIdSHv3.cdse,
    [CDSE_CCM_VHR_IMAGE_2021_COLLECTION]: LocationIdSHv3.cdse,
    [CDSE_CCM_VHR_IMAGE_2024_COLLECTION]: LocationIdSHv3.cdse,
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
      default:
        return null;
    }
  };

  getCollectionByDatasetId(datasetId) {
    return Object.keys(this.KNOWN_COLLECTIONS).find((collection) =>
      this.KNOWN_COLLECTIONS[collection].includes(datasetId),
    );
  }

  getDefaultScalingFactor(_datasetId) {
    return 1 / 1000;
  }
}
