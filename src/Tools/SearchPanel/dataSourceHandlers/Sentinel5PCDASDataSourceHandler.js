import { DATASET_CDAS_S5PL2, S5PL2CDASLayer } from '@sentinel-hub/sentinelhub-js';

import { t } from 'ttag';

import {
  S5_O3_CDAS,
  S5_NO2_CDAS,
  S5_SO2_CDAS,
  S5_CO_CDAS,
  S5_HCHO_CDAS,
  S5_CH4_CDAS,
  S5_AER_AI_CDAS,
  S5_CLOUD_CDAS,
  S5_OTHER_CDAS,
} from './dataSourceConstants';
import { DATASOURCES } from '../../../const';
import Sentinel5PDataSourceHandler from './Sentinel5PDataSourceHandler';
import {
  getS5AERAIMarkdown,
  getS5CH4Markdown,
  getS5COMarkdown,
  getS5CloudMarkdown,
  getS5HCHOMarkdown,
  getS5NO2Markdown,
  getS5O3Markdown,
  getS5SO2Markdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/Sentinel5Tooltip';

export default class Sentinel5PCDASDataSourceHandler extends Sentinel5PDataSourceHandler {
  S5PDATASETS = [
    S5_O3_CDAS,
    S5_NO2_CDAS,
    S5_SO2_CDAS,
    S5_CO_CDAS,
    S5_HCHO_CDAS,
    S5_CH4_CDAS,
    S5_AER_AI_CDAS,
    S5_CLOUD_CDAS,
  ];

  getDatasetSearchLabels = () => ({
    [S5_O3_CDAS]: t`O3 (Ozone)`,
    [S5_NO2_CDAS]: t`NO2 (Nitrogen dioxide)`,
    [S5_SO2_CDAS]: t`SO2 (Sulfur dioxide)`,
    [S5_CO_CDAS]: t`CO (Carbon monoxide)`,
    [S5_HCHO_CDAS]: t`HCHO (Formaldehyde)`,
    [S5_CH4_CDAS]: t`CH4 (Methane)`,
    [S5_AER_AI_CDAS]: t`AER AI (Aerosol Index)`,
    [S5_CLOUD_CDAS]: t`Cloud`,
    [S5_OTHER_CDAS]: t`Other`,
  });

  datasetSearchIds = {
    [S5_O3_CDAS]: 'O3',
    [S5_NO2_CDAS]: 'NO2',
    [S5_SO2_CDAS]: 'SO2',
    [S5_CO_CDAS]: 'CO',
    [S5_HCHO_CDAS]: 'HCHO',
    [S5_CH4_CDAS]: 'CH4',
    [S5_AER_AI_CDAS]: 'AER_AI',
    [S5_CLOUD_CDAS]: 'CLOUD',
    [S5_OTHER_CDAS]: 'Other',
  };

  datasource = DATASOURCES.S5_CDAS;
  defaultPreselectedDataset = S5_AER_AI_CDAS;

  shLayer = S5PL2CDASLayer;
  shDataset = DATASET_CDAS_S5PL2;
  OTHER_DATASETID = S5_OTHER_CDAS;
  NO2_DATASETID = S5_NO2_CDAS;
  CLOUD_DATASETID = S5_CLOUD_CDAS;
  AER_AI_DATASETID = S5_AER_AI_CDAS;

  getLeafletZoomConfig() {
    return {
      min: 3,
      max: 19,
    };
  }

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case S5_O3_CDAS:
        return getS5O3Markdown();
      case S5_NO2_CDAS:
        return getS5NO2Markdown();
      case S5_SO2_CDAS:
        return getS5SO2Markdown();
      case S5_CO_CDAS:
        return getS5COMarkdown();
      case S5_HCHO_CDAS:
        return getS5HCHOMarkdown();
      case S5_CH4_CDAS:
        return getS5CH4Markdown();
      case S5_AER_AI_CDAS:
        return getS5AERAIMarkdown();
      case S5_CLOUD_CDAS:
        return getS5CloudMarkdown();
      default:
        return null;
    }
  };

  supportsFindProductsForCurrentView = () => true;
}
