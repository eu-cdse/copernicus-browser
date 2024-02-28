import React from 'react';
import LandsatDataSourceHandler from './LandsatDataSourceHandler';
import {
  getLandsat89AWS_Markdown,
  AWS_LOTL1_Markdown,
  AWS_LOTL2_Markdown,
  Landsat89AWSTooltip,
} from './DatasourceRenderingComponents/dataSourceTooltips/LandsatTooltip';
import { DATASET_AWS_L8L1C, DATASET_AWS_LOTL1, DATASET_AWS_LOTL2 } from '@sentinel-hub/sentinelhub-js';
import { AWS_L8L1C, AWS_LOTL1, AWS_LOTL2 } from './dataSourceConstants';
import { DATASOURCES } from '../../../const';

export default class Landsat8AWSDataSourceHandler extends LandsatDataSourceHandler {
  datasource = DATASOURCES.AWS_LANDSAT8;
  searchGroupLabel = 'Landsat 8-9';
  searchGroupKey = 'landsat8-aws';
  knownDatasets = [
    { shDataset: DATASET_AWS_L8L1C, datasetId: AWS_L8L1C, urlId: AWS_L8L1C },
    { shDataset: DATASET_AWS_LOTL1, datasetId: AWS_LOTL1, urlId: AWS_LOTL1 },
    { shDataset: DATASET_AWS_LOTL2, datasetId: AWS_LOTL2, urlId: AWS_LOTL2 },
  ];
  defaultPreselectedDataset = AWS_LOTL2;

  getDataSourceTooltip() {
    return <Landsat89AWSTooltip />;
  }

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case AWS_LOTL1:
        return AWS_LOTL1_Markdown();
      case AWS_LOTL2:
        return AWS_LOTL2_Markdown();
      default:
        return null;
    }
  };

  getDescription = () => getLandsat89AWS_Markdown();
}
