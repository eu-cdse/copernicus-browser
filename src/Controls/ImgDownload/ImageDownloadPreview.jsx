import { CancelToken } from '@sentinel-hub/sentinelhub-js';
import React, { useState, useEffect } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';
import moment from 'moment';
import { IMAGE_FORMATS } from './consts';
import {
  adjustClippingForAoi,
  fetchAndPatchImagesFromParams,
  fetchImageFromParams,
  getMapDimensions,
  capDimensionsToResolutionLimit,
} from './ImageDownload.utils';
import { getOrbitDirectionFromList } from '../../Tools/VisualizationPanel/VisualizationPanel.utils';
import { getGetMapAuthToken } from '../../App';
import { constructGetMapParamsEffects, getVisualizationEffectsFromStore } from '../../utils/effectsUtils';

import './ImageDownloadPreview.scss';
import { TABS } from './ImageDownloadForms';
import { CUSTOM_TAG } from './AnalyticalForm';
import Loader from '../../Loader/Loader';
import { PROCESSING_OPTIONS } from '../../const';
import ImageDownloadErrorPanel from './ImageDownloadErrorPanel';

async function fetchPreviewImage(props) {
  // setFetchingPreviewImage(true);
  const cancelToken = new CancelToken();
  const effectsParams = constructGetMapParamsEffects(props);
  const getMapAuthToken = getGetMapAuthToken(props.auth);

  let height, width;

  const bounds = props.cropToAoi ? props.aoiBounds : props.mapBounds;
  // Use pixel dimensions from the visible viewport instead of bounds-based dimensions
  ({ width, height } = getMapDimensions(props.pixelBounds));

  // Cap dimensions to ensure they meet the API's minimum meters-per-pixel requirement
  ({ width, height } = capDimensionsToResolutionLimit(width, height, bounds, props.datasetId));
  const params = {
    ...props,
    cancelToken,
    effects: effectsParams,
    getMapAuthToken,
    imageFormat: IMAGE_FORMATS.PNG,
    showCaptions: false,
    showLegend: false,
    showLogo: false,
    addMapOverlays: false,
    geometry: props.cropToAoi ? props.aoiGeometry : undefined,
    bounds: props.cropToAoi ? props.aoiBounds : props.mapBounds,
    width,
    height,
  };

  let blob;

  if (props.showComparePanel) {
    const adjustedClipping = props.cropToAoi
      ? adjustClippingForAoi(props.comparedClipping, props.aoiBounds, props.mapBounds)
      : props.comparedClipping;

    const response = await fetchAndPatchImagesFromParams({
      ...params,
      comparedClipping: adjustedClipping,
      comparedLayers: props.comparedLayers.map((cLayer) => {
        let newCLayer = Object.assign({}, cLayer);
        newCLayer.fromTime = cLayer.fromTime ? moment(cLayer.fromTime) : undefined;
        newCLayer.toTime = cLayer.toTime ? moment(cLayer.toTime) : undefined;
        newCLayer.effects = constructGetMapParamsEffects(cLayer);
        return newCLayer;
      }),
    }).catch((e) => {
      console.warn(e);
    });
    blob = response && response.finalImage;
  } else {
    const response = await fetchImageFromParams({
      ...params,
      layerId: props.layerId,
    }).catch((e) => {
      console.warn(e);
    });
    blob = response && response.blob;
  }

  return blob;
}

const ImageDownloadPreview = (props) => {
  const [previewUrl, setPreviewUrl] = useState(null);
  const [fetchingPreviewImage, setFetchingPreviewImage] = useState(false);
  const [previewError, setPreviewError] = useState(null);

  const { analyticalFormLayers, selectedTab, disabledDownload, auth, layerId, is3D, selectedProcessing } =
    props;

  useEffect(() => {
    setFetchingPreviewImage(true);
    setPreviewError(null);
    setPreviewUrl(null);

    let selectedLayer = layerId;
    if (analyticalFormLayers.length > 0 && selectedTab === TABS.ANALYTICAL) {
      selectedLayer = analyticalFormLayers[analyticalFormLayers.length - 1];
    } else if (props.customSelected && selectedProcessing === PROCESSING_OPTIONS.PROCESS_API) {
      selectedLayer = CUSTOM_TAG;
    }

    const options = {
      ...props,
      layerId: selectedLayer === CUSTOM_TAG ? null : selectedLayer,
      // We need to change the evalscript of the selected layer depending if it is a custom layer or not.
      // evalscript can be defined even if the custom layer is not selected in analytical
      evalscript: selectedLayer === CUSTOM_TAG ? props.evalscript : null,
      customSelected: selectedLayer === CUSTOM_TAG,
    };

    const runPreviewFetch = async () => {
      try {
        const blob = await fetchPreviewImage(options);
        if (blob instanceof Blob) {
          setPreviewUrl(URL.createObjectURL(blob));
        } else {
          const error = new Error(t`Preview unavailable. Try zooming in or adjusting your selection.`);
          setPreviewError(error);
        }
      } catch (e) {
        setPreviewError(e);
      } finally {
        setFetchingPreviewImage(false);
      }
    };

    runPreviewFetch();
  }, [analyticalFormLayers, auth, layerId, props, selectedTab, selectedProcessing]);

  if (disabledDownload || is3D) {
    return null;
  }

  return (
    <div className="image-download-preview-wrapper">
      <div className="image-download-preview-label">{t`Preview`}</div>
      {fetchingPreviewImage ? (
        <div className="image-download-preview-placeholder">
          <Loader />
        </div>
      ) : previewError ? (
        <ImageDownloadErrorPanel error={previewError} />
      ) : previewUrl ? (
        <img alt="download preview" className="image-download-preview" src={previewUrl} />
      ) : null}
    </div>
  );
};

const mapStoreToProps = (store) => ({
  lat: store.mainMap.lat,
  lng: store.mainMap.lng,
  zoom: store.mainMap.zoom,
  bounds: store.aoi.bounds ? store.aoi.bounds : store.mainMap.bounds,
  pixelBounds: store.mainMap.pixelBounds,
  enabledOverlaysId: store.mainMap.enabledOverlaysId,
  user: store.auth.user,
  aoiGeometry: store.aoi.geometry,
  loiGeometry: store.loi.geometry,
  layerId: store.visualization.layerId,
  evalscript: store.visualization.evalscript,
  evalscripturl: store.visualization.evalscripturl,
  dataFusion: store.visualization.dataFusion,
  visualizationUrl: store.visualization.visualizationUrl,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  datasetId: store.visualization.datasetId,
  customSelected: store.visualization.customSelected,
  cloudCoverage: store.visualization.cloudCoverage,
  selectedProcessing: store.visualization.selectedProcessing,
  ...getVisualizationEffectsFromStore(store),
  orbitDirection: getOrbitDirectionFromList(store.visualization.orbitDirection),
  selectedThemeId: store.themes.selectedThemeId,
  auth: store.auth,
  selectedTabIndex: store.tabs.selectedTabIndex,
  comparedLayers: store.compare.comparedLayers,
  comparedOpacity: store.compare.comparedOpacity,
  comparedClipping: store.compare.comparedClipping,
  aoiBounds: store.aoi.bounds,
  mapBounds: store.mainMap.bounds,
  is3D: store.mainMap.is3D,
});

export default connect(mapStoreToProps, null)(ImageDownloadPreview);
