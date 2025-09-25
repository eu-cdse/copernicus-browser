import { t } from 'ttag';
import { DATASOURCES } from '../../../const';
import {
  S1_MONTHLY_MOSAIC_DH,
  S1_MONTHLY_MOSAIC_DH_LR,
  S1_MONTHLY_MOSAIC_IW,
  S1_MONTHLY_MOSAIC_IW_LR,
} from './dataSourceConstants';
import moment from 'moment';
import MosaicDataSourceHandler from './MosaicDataSourceHandler';
import {
  getSentinel1IWMosaic,
  getSentinel1DHMosaic,
} from './DatasourceRenderingComponents/dataSourceTooltips/S1MosaicsTooltip';
import { S1_DH_MONTHLY_MOSAIC_BANDS, S1_IW_MONTHLY_MOSAIC_BANDS } from './datasourceAssets/MosaicsBands';

const LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS = {
  [S1_MONTHLY_MOSAIC_DH]: {
    lowResolutionCollectionId: S1_MONTHLY_MOSAIC_DH_LR,
    lowResolutionMetersPerPixelThreshold: 320,
  },
  [S1_MONTHLY_MOSAIC_IW]: {
    lowResolutionCollectionId: S1_MONTHLY_MOSAIC_IW_LR,
    lowResolutionMetersPerPixelThreshold: 320,
  },
};

export default class S1MosaicDataSourceHandler extends MosaicDataSourceHandler {
  datasource = DATASOURCES.S1_MOSAIC;
  searchGroupLabel = 'Sentinel-1 Mosaics';
  preselectedDatasets = new Set([S1_MONTHLY_MOSAIC_IW]);

  KNOWN_COLLECTIONS = {
    [S1_MONTHLY_MOSAIC_DH]: [S1_MONTHLY_MOSAIC_DH],
    [S1_MONTHLY_MOSAIC_IW]: [S1_MONTHLY_MOSAIC_IW],
  };

  MIN_MAX_DATES = {
    [S1_MONTHLY_MOSAIC_DH]: {
      minDate: moment.utc('2016-01-01'),
      maxDate: null,
    },
    [S1_MONTHLY_MOSAIC_IW]: {
      minDate: moment.utc('2016-01-01'),
      maxDate: null,
    },
  };

  leafletZoomConfig = {
    [S1_MONTHLY_MOSAIC_DH]: {
      min: 2,
      max: 25,
    },
    [S1_MONTHLY_MOSAIC_IW]: {
      min: 2,
      max: 25,
    },
  };

  getDatasetSearchLabels = () => ({
    [S1_MONTHLY_MOSAIC_DH]: t`Sentinel-1 DH Monthly Mosaics`,
    [S1_MONTHLY_MOSAIC_IW]: t`Sentinel-1 IW Monthly Mosaics`,
  });

  supportsLowResolutionAlternativeCollection = (collectionId) => {
    return !!LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS[collectionId];
  };

  getLowResolutionCollectionId = (collectionId) => {
    return LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS[collectionId]?.lowResolutionCollectionId;
  };

  getLowResolutionMetersPerPixelThreshold = (collectionId) => {
    return LOW_RESOLUTION_ALTERNATIVE_COLLECTIONS[collectionId]?.lowResolutionMetersPerPixelThreshold;
  };

  supportsFindProductsForCurrentView = () => true;

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case S1_MONTHLY_MOSAIC_DH:
        return getSentinel1DHMosaic();
      case S1_MONTHLY_MOSAIC_IW:
        return getSentinel1IWMosaic();
      default:
        return null;
    }
  };

  getBands = (datasetId) => {
    const collectionId = this.getCollectionByDatasetId(datasetId);
    switch (collectionId) {
      case S1_MONTHLY_MOSAIC_DH:
        return S1_DH_MONTHLY_MOSAIC_BANDS;
      case S1_MONTHLY_MOSAIC_IW:
        return S1_IW_MONTHLY_MOSAIC_BANDS;
      default:
        return [];
    }
  };
}
