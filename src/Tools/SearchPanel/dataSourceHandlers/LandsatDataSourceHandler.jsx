import { LinkType, Landsat89CDASLOTL1Layer, DATASET_CDAS_L8_L9_LOTL1 } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import DataSourceHandler from './DataSourceHandler';
import { getLandsat89Markdown } from './DatasourceRenderingComponents/dataSourceTooltips/LandsatTooltip';
import { FetchingFunction } from '../../VisualizationPanel/CollectionSelection/AdvancedSearch/search';
import { constructV3Evalscript } from '../../../utils';
import { CDAS_L8_L9_LOTL1 } from './dataSourceConstants';
import { getLandsatBandForDataset, getGroupedBands } from './datasourceAssets/landsatBands';
import { IMAGE_FORMATS } from '../../../Controls/ImgDownload/consts';
import { DATASOURCES } from '../../../const';

export const LANDSAT_COPYRIGHT_TEXT = (number) =>
  `Credit: Landsat ${number} image courtesy of the U.S. Geological Survey, processed with Copernicus Browser`;

export default class LandsatDataSourceHandler extends DataSourceHandler {
  urls = {
    [CDAS_L8_L9_LOTL1]: [],
  };
  getDatasetSearchLabels = () => ({
    [CDAS_L8_L9_LOTL1]: t`Landsat 8-9 L1`,
  });

  datasets = [];
  allLayers = [];
  datasource = DATASOURCES.LANDSAT_8_9_CDAS;
  searchGroupLabel = 'Landsat';
  limitMonthsSearch = 3;

  leafletZoomConfig = {
    [CDAS_L8_L9_LOTL1]: {
      min: 7,
      max: 18,
    },
  };

  willHandle(service, url, name, layers, preselected, _onlyForBaseLayer) {
    const usesL8L9Dataset = !!layers.find((l) => l.dataset && l.dataset.id === DATASET_CDAS_L8_L9_LOTL1.id);

    if (!usesL8L9Dataset) {
      return false;
    }
    if (usesL8L9Dataset && !this.datasets.includes(CDAS_L8_L9_LOTL1)) {
      this.datasets.push(CDAS_L8_L9_LOTL1);
      this.urls[CDAS_L8_L9_LOTL1].push(url);
    }
    if (preselected) {
      if (usesL8L9Dataset) {
        this.preselectedDatasets.add(CDAS_L8_L9_LOTL1);
      }
    }

    this.datasets = Array.from(new Set(this.datasets)); // make datasets unique
    this.allLayers.push(...layers.filter((l) => [DATASET_CDAS_L8_L9_LOTL1].includes(l.dataset)));
    this.saveFISLayers(url, layers);
    return true;
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  getNewFetchingFunctions(fromMoment, toMoment, queryArea = null) {
    if (!this.isChecked) {
      return [];
    }

    let fetchingFunctions = [];

    const datasets = this.searchFilters.selectedOptions;
    const maxCC = this.searchFilters.maxCC;

    datasets.forEach((datasetId) => {
      let searchLayer = this.allLayers.find((l) => l.dataset === this.getSentinelHubDataset(datasetId));
      if (!searchLayer) {
        return;
      }
      searchLayer.maxCloudCoverPercent = maxCC;

      const ff = new FetchingFunction(
        datasetId,
        searchLayer,
        fromMoment,
        toMoment,
        queryArea,
        this.convertToStandardTiles,
      );
      fetchingFunctions.push(ff);
    });

    return fetchingFunctions;
  }

  convertToStandardTiles = (data, datasetId) => {
    const tiles = data
      .filter((t) => (t.meta.projEpsg ? t.meta.projEpsg !== 3031 : true))
      .map((t) => ({
        sensingTime: t.sensingTime,
        geometry: t.geometry,
        datasource: this.datasource,
        datasetId,
        metadata: {
          previewUrl: this.getUrl(t.links, LinkType.PREVIEW),
          AWSPath: this.getUrl(t.links, LinkType.AWS),
          EOCloudPath: this.getUrl(t.links, LinkType.EOCLOUD),
          sunElevation: t.meta.sunElevation,
          cloudCoverage: t.meta.cloudCoverPercent,
        },
      }));
    return tiles;
  };

  getBands = (datasetId) => getLandsatBandForDataset(datasetId);

  getUrlsForDataset = (datasetId) => this.urls[datasetId] || [];

  getSentinelHubDataset = (datasetId) => {
    switch (datasetId) {
      case CDAS_L8_L9_LOTL1:
        return DATASET_CDAS_L8_L9_LOTL1;
      default:
        return null;
    }
  };

  getDescriptionForDataset = (datasetId) => {
    switch (datasetId) {
      case CDAS_L8_L9_LOTL1:
        return getLandsat89Markdown();
      default:
        return null;
    }
  };

  generateEvalscript = (bands, datasetId, config) => {
    return constructV3Evalscript(bands, config, this.getBands(datasetId));
  };

  tilesHaveCloudCoverage() {
    return true;
  }

  getResolutionLimits(datasetId) {
    switch (datasetId) {
      case CDAS_L8_L9_LOTL1:
        return { resolution: 30, fisResolutionCeiling: 1490 };
      default:
        return {};
    }
  }

  supportsInterpolation = () => true;

  supportsIndex = () => true;

  supportsV3Evalscript(datasetId) {
    if (datasetId === CDAS_L8_L9_LOTL1) {
      return true;
    }
    return false;
  }

  getSupportedImageFormats() {
    return Object.values(IMAGE_FORMATS);
  }

  groupChannels = (datasetId) => getGroupedBands(datasetId);

  getCopyrightText = (datasetId) => {
    switch (datasetId) {
      case CDAS_L8_L9_LOTL1:
        return LANDSAT_COPYRIGHT_TEXT('8/9');
      default:
        return '';
    }
  };

  getBaseLayerForDatasetId = (datasetId, maxCloudCoverPercent) => {
    switch (datasetId) {
      case CDAS_L8_L9_LOTL1:
        return new Landsat89CDASLOTL1Layer({ maxCloudCoverPercent, evalscript: true });
      default:
        return null;
    }
  };

  isCopernicus = () => false;

  isSentinelHub = () => true;

  supportsFindProductsForCurrentView = () => true;

  isSpectralExplorerSupported = () => true;
}
