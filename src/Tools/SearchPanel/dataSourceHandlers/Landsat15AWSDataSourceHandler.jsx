import React from 'react';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';

import { DATASET_AWS_LMSSL1 } from '@sentinel-hub/sentinelhub-js';

import LandsatDataSourceHandler from './LandsatDataSourceHandler';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import {
  getLandsat15AWS_Markdown,
  Landsat15AWSTooltip,
} from './DatasourceRenderingComponents/dataSourceTooltips/LandsatTooltip';
import { AWS_LMSSL1 } from './dataSourceConstants';
import { DATASOURCES } from '../../../const';

export default class Landsat15AWSDataSourceHandler extends LandsatDataSourceHandler {
  urls = { [AWS_LMSSL1]: [] };
  datasource = DATASOURCES.AWS_LANDSAT15;
  searchGroupLabel = 'Landsat 1-5 MSS L1';
  searchGroupKey = 'landsat15-aws';
  defaultPreselectedDataset = AWS_LMSSL1;

  knownDatasets = [{ shDataset: DATASET_AWS_LMSSL1, datasetId: AWS_LMSSL1, urlId: AWS_LMSSL1 }];

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];

    const maxCC = this.searchFilters.maxCC;
    let searchLayer = this.allLayers.find((l) => l.dataset === this.getSentinelHubDataset(AWS_LMSSL1));
    searchLayer.maxCloudCoverPercent = maxCC;
    const ff = new FetchingFunction(
      AWS_LMSSL1,
      searchLayer,
      fromMoment,
      toMoment,
      queryArea,
      this.convertToStandardTiles,
    );
    fetchingFunctions.push(ff);

    return fetchingFunctions;
  }

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }
    return (
      <GenericSearchGroup
        key={this.searchGroupKey}
        label={this.searchGroupLabel}
        preselected={this.preselected}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={<Landsat15AWSTooltip />}
        saveFiltersValues={this.saveSearchFilters}
        options={[]}
        preselectedOptions={Array.from(this.preselectedDatasets)}
        hasMaxCCFilter={true}
      />
    );
  }

  getDescription = () => getLandsat15AWS_Markdown();

  groupChannels = () => {};

  isDisplayedAsGroup = () => true;
}
