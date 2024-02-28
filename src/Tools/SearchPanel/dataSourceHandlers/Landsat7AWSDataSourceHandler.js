import React from 'react';
import { t } from 'ttag';
import { DATASET_AWS_LETML1, DATASET_AWS_LETML2 } from '@sentinel-hub/sentinelhub-js';

import LandsatDataSourceHandler from './LandsatDataSourceHandler';
import {
  getLandsat7ETMAWS_Markdown,
  AWS_LETML1_Markdown,
  AWS_LETML2_Markdown,
  Landsat7ETMAWSTooltip,
} from './DatasourceRenderingComponents/dataSourceTooltips/LandsatTooltip';
import { AWS_LETML1, AWS_LETML2 } from './dataSourceConstants';
import { getGroupedBands } from './datasourceAssets/landsatBands';
import { DATASOURCES } from '../../../const';

export default class Landsat7AWSETMDataSourceHandler extends LandsatDataSourceHandler {
  urls = { [AWS_LETML1]: [], [AWS_LETML2]: [] };
  datasource = DATASOURCES.AWS_LANDSAT7_ETM;
  searchGroupLabel = 'Landsat 7 ETM+';
  searchGroupKey = 'landsat7-aws';
  preselectedDatasets = new Set([AWS_LETML2]);
  datasetSearchLabels = {
    [AWS_LETML1]: t`Level 1`,
    [AWS_LETML2]: t`Level 2`,
  };

  knownDatasets = [
    { shDataset: DATASET_AWS_LETML1, datasetId: AWS_LETML1, urlId: AWS_LETML1 },
    { shDataset: DATASET_AWS_LETML2, datasetId: AWS_LETML2, urlId: AWS_LETML2 },
  ];
  defaultPreselectedDataset = AWS_LETML2;

  getDataSourceTooltip() {
    return <Landsat7ETMAWSTooltip />;
  }

  getSibling = (datasetId) => {
    switch (datasetId) {
      case AWS_LETML1:
        return { siblingId: AWS_LETML2 };
      case AWS_LETML2:
        return { siblingId: AWS_LETML1 };
      default:
        return {};
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case AWS_LETML1:
        return AWS_LETML1_Markdown();
      case AWS_LETML2:
        return AWS_LETML2_Markdown();
      default:
        return {};
    }
  };

  groupChannels = (datasetId) => {
    switch (datasetId) {
      case AWS_LETML1:
        return getGroupedBands(datasetId, ['B06_VCID_1', 'B06_VCID_2']);
      case AWS_LETML2:
        return getGroupedBands(datasetId, ['B06']);
      default:
        return null;
    }
  };

  getDescription = () => getLandsat7ETMAWS_Markdown();
}
