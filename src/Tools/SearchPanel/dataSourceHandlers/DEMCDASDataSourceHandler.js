import { DATASET_CDAS_DEM, DEMCDASLayer, DEMInstanceType } from '@sentinel-hub/sentinelhub-js';

import DEMDataSourceHandler from './DEMDataSourceHandler';
import {
  getCopernicus90Markdown,
  getCopernicus30Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/DEMTooltip';
import { DEM_COPERNICUS_30_CDAS, DEM_COPERNICUS_90_CDAS } from './dataSourceConstants';
import { DATASOURCES } from '../../../const';

export default class DEMCDASDataSourceHandler extends DEMDataSourceHandler {
  DATASETS = [DEM_COPERNICUS_30_CDAS, DEM_COPERNICUS_90_CDAS];

  datasetSearchLabels = {
    [DEM_COPERNICUS_30_CDAS]: 'Copernicus 30',
    [DEM_COPERNICUS_90_CDAS]: 'Copernicus 90',
  };

  datasetSearchIds = {
    [DEM_COPERNICUS_30_CDAS]: 'COPERNICUS_30',
    [DEM_COPERNICUS_90_CDAS]: 'COPERNICUS_90',
  };

  shLayer = DEMCDASLayer;
  shDataset = DATASET_CDAS_DEM;

  urls = { [DEM_COPERNICUS_30_CDAS]: [], [DEM_COPERNICUS_90_CDAS]: [] };
  datasource = DATASOURCES.DEM_CDAS;
  defaultPreselectedDataset = DEM_COPERNICUS_30_CDAS;

  getSentinelHubDataset = (datasetId) => {
    switch (datasetId) {
      case DEM_COPERNICUS_30_CDAS:
      case DEM_COPERNICUS_90_CDAS:
        return DATASET_CDAS_DEM;
      default:
        return null;
    }
  };

  getDatasetFromDEMInstance = (demInstance) => {
    switch (demInstance) {
      case DEMInstanceType.COPERNICUS_30:
        return DEM_COPERNICUS_30_CDAS;
      case DEMInstanceType.COPERNICUS_90:
        return DEM_COPERNICUS_90_CDAS;
      default:
        return DEM_COPERNICUS_30_CDAS;
    }
  };

  static getDatasetParams = (datasetId) => {
    switch (datasetId) {
      case DEM_COPERNICUS_30_CDAS:
        return {
          demInstance: DEMInstanceType.COPERNICUS_30,
        };
      case DEM_COPERNICUS_90_CDAS:
        return {
          demInstance: DEMInstanceType.COPERNICUS_90,
        };

      default:
        return { demInstance: DEMInstanceType.COPERNICUS_30 };
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case DEM_COPERNICUS_30_CDAS:
        return getCopernicus30Markdown();
      case DEM_COPERNICUS_90_CDAS:
        return getCopernicus90Markdown();
      default:
        return null;
    }
  };

  getDatasetParams = (datasetId) => {
    return DEMCDASDataSourceHandler.getDatasetParams(datasetId);
  };

  getLeafletZoomConfig() {
    return {
      min: 7,
    };
  }

  getSibling = (datasetId) => {
    switch (datasetId) {
      case DEM_COPERNICUS_90_CDAS:
        return { siblingId: DEM_COPERNICUS_30_CDAS };
      case DEM_COPERNICUS_30_CDAS:
        return { siblingId: DEM_COPERNICUS_90_CDAS };
      default:
        return {};
    }
  };
}
