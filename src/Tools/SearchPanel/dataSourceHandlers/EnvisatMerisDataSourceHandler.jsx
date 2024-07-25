import React from 'react';
import { DATASET_EOCLOUD_ENVISAT_MERIS, EnvisatMerisEOCloudLayer } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import DataSourceHandler from './DataSourceHandler';
import GenericSearchGroup from './DatasourceRenderingComponents/searchGroups/GenericSearchGroup';
import {
  EnvisatTooltip,
  getEnvisatMerisMarkdown,
} from './DatasourceRenderingComponents/dataSourceTooltips/EnvisatTooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { constructBasicEvalscript } from '../../../utils';
import { ENVISAT_MERIS } from './dataSourceConstants';
import { IMAGE_FORMATS } from '../../../Controls/ImgDownload/consts';
import { DATASOURCES } from '../../../const';

export default class EnvisatMerisDataSourceHandler extends DataSourceHandler {
  KNOWN_BANDS = [
    {
      name: 'B01',
      getDescription: () => t`Band 1 - Yellow substance and detrital pigments - 412.5 nm`,
      color: '#4900A5',
    },
    {
      name: 'B02',
      getDescription: () => t`Band 2 - Chlorophyll absorption maximum - 442 nm`,
      color: '#000AFF',
    },
    {
      name: 'B03',
      getDescription: () => t`Band 3 - Chlorophyll and other pigments - 490 nm`,
      color: '#00FFFF',
    },
    {
      name: 'B04',
      getDescription: () => t`Band 4 - Suspended sediment, red tides - 510 nm`,
      color: '#00FF00',
    },
    {
      name: 'B05',
      getDescription: () => t`Band 5 - Chlorophyll absorption minimum - 560 nm`,
      color: '#B6FF00',
    },
    {
      name: 'B06',
      getDescription: () => t`Band 6 - Suspended sediment - 620 nm`,
      color: '#FF6200',
    },
    {
      name: 'B07',
      getDescription: () => t`Band 7 - Chlorophyll absorption & fluo. reference - 665 nm`,
      color: '#FF0000',
    },
    {
      name: 'B08',
      getDescription: () => t`Band 8 - Chlorophyll fluorescence peak - 681 nm`,
      color: '#FF0000',
    },
    {
      name: 'B09',
      getDescription: () => t`Band 9 - Fluo. reference, atmosphere corrections - 709 nm`,
      color: '#EA0000',
    },
    {
      name: 'B10',
      getDescription: () => t`Band 10 - Vegetation, cloud - 753 nm`,
      color: '#880000',
    },
    {
      name: 'B11',
      getDescription: () => t`Band 11 - O2 R- branch absorption band - 761 nm`,
      color: '#880000',
    },
    {
      name: 'B12',
      getDescription: () => t`Band 12 - Atmosphere corrections - 779 nm`,
      color: '#4E0000',
    },
    {
      name: 'B13',
      getDescription: () => t`Band 13 - Vegetation, water vapour reference - 865 nm`,
      color: '#000',
    },
    {
      name: 'B14',
      getDescription: () => t`Band 14 - Atmosphere corrections - 885 nm`,
      color: '#000',
    },
    {
      name: 'B15',
      getDescription: () => t`Band 15 - Water vapour, land - 900 nm`,
      color: '#000',
    },
  ];
  urls = [];
  datasets = [];
  preselectedDatasets = new Set();
  searchFilters = {};
  preselected = false;
  isChecked = false;
  datasource = DATASOURCES.ENVISAT_MERIS;
  defaultPreselectedDataset = ENVISAT_MERIS;
  searchGroupLabel = 'Envisat Meris';
  datasetSearchLabels = {
    [ENVISAT_MERIS]: 'Envisat Meris',
  };

  leafletZoomConfig = {
    [ENVISAT_MERIS]: {
      min: 6,
      max: 18,
    },
  };

  willHandle(service, url, name, layers, preselected, onlyForBaseLayer) {
    const usesDataset = !!layers.find((l) => l.dataset && l.dataset === DATASET_EOCLOUD_ENVISAT_MERIS);
    if (!usesDataset) {
      return false;
    }
    this.datasets = [ENVISAT_MERIS];
    this.preselected |= preselected;
    this.urls.push(url);
    return true;
  }

  isHandlingAnyUrl() {
    return this.urls.length > 0;
  }

  getSearchFormComponents() {
    if (!this.isHandlingAnyUrl()) {
      return null;
    }
    return (
      <GenericSearchGroup
        key={`landsat-meris`}
        label={this.getSearchGroupLabel()}
        preselected={this.preselected}
        saveCheckedState={this.saveCheckedState}
        dataSourceTooltip={<EnvisatTooltip />}
        saveFiltersValues={this.saveSearchFilters}
        options={[]}
        preselectedOptions={Array.from(this.preselectedDatasets)}
        hasMaxCCFilter={false}
      />
    );
  }

  getDescription = () => getEnvisatMerisMarkdown();

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }
    let fetchingFunctions = [];

    // instanceId and layerId are required parameters, although we don't need them for findTiles
    const searchLayer = new EnvisatMerisEOCloudLayer({ instanceId: true, layerId: true });
    const ff = new FetchingFunction(
      ENVISAT_MERIS,
      searchLayer,
      fromMoment,
      toMoment,
      queryArea,
      this.convertToStandardTiles,
    );
    fetchingFunctions.push(ff);
    return fetchingFunctions;
  }

  convertToStandardTiles = (data, datasetId) => {
    const tiles = data.map((t) => ({
      sensingTime: t.sensingTime,
      geometry: t.geometry,
      datasource: this.datasource,
      datasetId,
      metadata: {
        EOCloudPath: this.getUrl(t.links, 'eocloud'),
      },
    }));
    return tiles;
  };

  getUrlsForDataset = () => {
    return this.urls;
  };

  getBands = () => {
    return this.KNOWN_BANDS;
  };

  getSentinelHubDataset = () => {
    return DATASET_EOCLOUD_ENVISAT_MERIS;
  };

  generateEvalscript = (bands, dataSetId, config) => {
    return constructBasicEvalscript(bands, config);
  };

  getResolutionLimits() {
    return { resolution: 300 };
  }

  supportsInterpolation() {
    return true;
  }

  supportsV3Evalscript() {
    return false;
  }

  getSupportedImageFormats() {
    return Object.values(IMAGE_FORMATS).filter(
      (f) => f !== IMAGE_FORMATS.KMZ_JPG && f !== IMAGE_FORMATS.KMZ_PNG,
    );
  }

  isDisplayedAsGroup = () => true;

  getBaseLayerForDatasetId = () => {
    return new EnvisatMerisEOCloudLayer({
      instanceId: true,
      layerId: true,
    });
  };
}
