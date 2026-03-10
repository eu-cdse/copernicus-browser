import { BYOCLayer } from '@sentinel-hub/sentinelhub-js';

import AbstractBYOCDataSourceHandler from '../AbstractBYOCDataSourceHandler';

import { getSHServiceRootUrl } from '../dataSourceHandlers';

import { t } from 'ttag';
import { filterLayers } from '../filter';

export default class AbstractRRDDataSourceHandler extends AbstractBYOCDataSourceHandler {
  datasetSearchLabels = {};
  datasetSearchIds = {};
  collections = {};

  urls = {};
  datasets = [];
  preselectedDatasets = new Set();
  allLayers = [];
  datasource = undefined;
  KNOWN_COLLECTIONS = {};

  leafletZoomConfig = {
    CUSTOM: { min: 0, max: 25 },
  };

  willHandle(service, url, name, layers, _preselected) {
    let handlesAny = false;

    for (let datasetId of Object.keys(this.KNOWN_COLLECTIONS)) {
      const layersWithDataset = layers.filter((l) =>
        this.KNOWN_COLLECTIONS[datasetId].includes(l.collectionId),
      );
      if (layersWithDataset.length > 0) {
        if (!this.urls[datasetId]?.includes(url)) {
          this.urls[datasetId] = [url];
        } else {
          this.urls[datasetId].push(url);
        }
        // if (!this.datasets.includes(datasetId)) {
        //   this.datasets.push(datasetId);
        // }
        handlesAny = true;
        this.allLayers.push(...layersWithDataset);
      }
      layersWithDataset.forEach((layer) => {
        this.collections[layer.collectionId] = {
          title: layer.collectionTitle || layer.title,
          url: url,
          themeName: name.replace(t`Based on: `, ''),
          availableBands: layer.availableBands,
          subType: layer.subType,
        };
        // Once collections endpoint will be working properly,
        // title should be replaced with actual collection name (if service will provide such information)
      });
    }
    this.datasets = Object.keys(this.collections);
    this.datasets.forEach((id) => {
      this.datasetSearchIds[id] = id;
      this.datasetSearchLabels[id] = this.collections[id].title.replaceAll('_', ' ');
      this.urls[id] = [...new Set([...(this.urls[id] ? this.urls[id] : []), url])];
    });
    this.saveFISLayers(url, layers);
    return handlesAny;
  }

  isHandlingAnyUrl() {
    return Object.values(this.urls).flat().length > 0;
  }

  supportsCustomLayer(datasetId) {
    const availableBands = this.collections[datasetId].availableBands;
    return availableBands && !!availableBands.length;
  }

  getBaseLayerForDatasetId = (datasetId) => {
    const layer = this.allLayers.find((l) => l.collectionId === datasetId);
    if (layer) {
      return new BYOCLayer({
        evalscript: true,
        collectionId: datasetId,
        subType: layer.subType,
        locationId: layer.locationId,
        shServiceRootUrl: getSHServiceRootUrl(),
      });
    }
  };

  getDatasetParams = (datasetId) => {
    const layer = this.allLayers.find((l) => l.collectionId === datasetId);
    if (layer) {
      return {
        collectionId: datasetId,
        subType: layer.subType,
        locationId: layer.locationId,
        shServiceRootUrl: getSHServiceRootUrl(),
      };
    }
    return {};
  };

  getLayers = (data, datasetId, url) => {
    let layers = data.filter((layer) => layer.collectionId === datasetId && filterLayers(layer.layerId));
    layers.forEach((l) => {
      l.url = url;
    });
    return layers;
  };

  getResolutionLimits() {
    return { resolution: 0.5 };
  }

  getDatasetLabel = (datasetId) => {
    let collectionLabel;
    const collectionData = this.collections[datasetId];
    if (collectionData) {
      //Use theme name as label if all layers in theme are based on same collection, otherwise use title( at the moment this represents layer name)
      collectionLabel = this.datasets.length === 1 ? collectionData.themeName : collectionData.title;
    }
    return collectionLabel || 'CUSTOM';
  };

  getBands = (datasetId) => {
    return this.collections[datasetId].availableBands;
  };

  getLeafletZoomConfig() {
    return this.leafletZoomConfig.CUSTOM;
  }

  getSearchGroupLabel = () => {
    return this.searchGroupLabel;
  };
}
