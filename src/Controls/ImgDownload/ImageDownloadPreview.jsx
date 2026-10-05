import { CancelToken } from '@sentinel-hub/sentinelhub-js';
import React, { useState, useEffect, useId } from 'react';
import { connect } from 'react-redux';
import { t } from 'ttag';
import { selectActiveExternalLayer } from '../../store/slices/externalLayersSlice';
import { SvgAoiClip, fetchExternalLayerBlob, getExternalWmsCropDimensions } from './WmsDownload.utils';
import { IMAGE_FORMATS, IMAGE_FORMATS_INFO } from './consts';
import {
  addStickerOverlays,
  adjustClippingForAoi,
  fetchAndPatchImagesFromParams,
  fetchImageFromParams,
  getMapDimensions,
  capDimensionsToResolutionLimit,
  finalizeExternalDownloadImage,
  getExternalLayerFetchDescriptor,
  normalizeComparedLayersForDownload,
  STICKER_WIDTH_PX,
  STICKER_HEIGHT_PX,
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
  // Sticker output is always composited onto a fixed-size canvas (see addStickerOverlays), so the
  // preview must be fetched at that same fixed size instead of the viewport/AOI-scaled dimensions
  // used by every other tab — otherwise the preview is cropped or padded relative to the real
  // download. downloadSticker also never polygon-clips to the AOI geometry (it only ever crops to
  // the AOI's rectangular bounding box, like every sticker path below), so the preview must not
  // request geometry clipping either, or it shows a shape the download will never produce.
  const isStickerTab = props.selectedTab === TABS.STICKER;

  if (props.activeExternalLayer) {
    // Sticker: match downloadSticker's bounds choice exactly (prefer the AOI's bounding box
    // whenever one exists, with no dependency on the "crop to AOI" checkbox the Sticker form
    // doesn't have). Other tabs: crop to the AOI bounds only when cropToAoi is checked.
    const bounds = isStickerTab
      ? (props.aoiBounds ?? props.mapBounds)
      : props.cropToAoi && props.aoiBounds
        ? props.aoiBounds
        : props.mapBounds;
    if (!bounds) {
      return null;
    }
    let width, height;
    if (isStickerTab) {
      width = STICKER_WIDTH_PX;
      height = STICKER_HEIGHT_PX;
    } else {
      const baseDims = getMapDimensions(props.pixelBounds);
      // Scale to the AOI's on-screen size so the WMS renders at the same scale as the map.
      ({ width, height } =
        props.cropToAoi && props.aoiBounds && props.mapBounds
          ? getExternalWmsCropDimensions(baseDims.width, baseDims.height, props.mapBounds, props.aoiBounds)
          : baseDims);
    }
    const blob = await fetchExternalLayerBlob(
      getExternalLayerFetchDescriptor(props.activeExternalLayer),
      bounds,
      width,
      height,
      // Always fetch PNG from the WMS — the preview never uses OSM or map overlays so
      // transparent nodata areas are safe, and WMS servers don't support WebP.
      true,
      'image/png',
    );
    return finalizeExternalDownloadImage(blob, {
      bounds,
      width,
      height,
      mimeType: 'image/png',
      baseTileUrl: undefined,
      aoiGeometry: isStickerTab ? undefined : props.aoiGeometry,
      cropToAoi: isStickerTab ? false : props.cropToAoi,
      drawGeoToImg: isStickerTab ? false : props.drawGeoToImg,
      lat: props.lat,
      lng: props.lng,
      zoom: props.zoom,
      enabledOverlaysId: props.enabledOverlaysId,
      addMapOverlays: false,
    });
  }

  const effectsParams = constructGetMapParamsEffects(props);
  const getMapAuthToken = getGetMapAuthToken(props.auth);

  let height, width;

  const bounds = isStickerTab
    ? (props.aoiBounds ?? props.mapBounds)
    : props.cropToAoi
      ? props.aoiBounds
      : props.mapBounds;
  if (isStickerTab) {
    width = STICKER_WIDTH_PX;
    height = STICKER_HEIGHT_PX;
  } else {
    // Use pixel dimensions from the visible viewport instead of bounds-based dimensions
    ({ width, height } = getMapDimensions(props.pixelBounds));
    // Cap dimensions to ensure they meet the API's minimum meters-per-pixel requirement
    ({ width, height } = capDimensionsToResolutionLimit(width, height, bounds, props.datasetId));
  }
  const params = {
    ...props,
    cancelToken: props.cancelToken,
    effects: effectsParams,
    getMapAuthToken,
    imageFormat: IMAGE_FORMATS.PNG,
    showCaptions: false,
    showLegend: false,
    showLogo: false,
    addMapOverlays: false,
    geometry: isStickerTab ? undefined : props.cropToAoi ? props.aoiGeometry : undefined,
    // Sticker never polygon-clips (see the function comment above). Without this override, a
    // hybrid compare (Sentinel Hub + external WMS layers) would still read `cropToAoi` off the
    // `...props` spread above and clip to the AOI geometry in fetchAndPatchImagesFromParams,
    // producing a composite the sticker download — which has no `cropToAoi` concept — never does.
    cropToAoi: isStickerTab ? false : props.cropToAoi,
    bounds,
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
      comparedLayers: normalizeComparedLayersForDownload(props.comparedLayers),
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
  const aoiClipId = useId();

  const {
    analyticalFormLayers,
    selectedTab,
    disabledDownload,
    auth,
    layerId,
    is3D,
    selectedProcessing,
    processGraph,
    evalscript,
    overlayVariant,
  } = props;

  useEffect(() => {
    let cancelled = false;
    const cancelToken = new CancelToken();
    setFetchingPreviewImage(true);
    setPreviewError(null);
    setPreviewUrl(null);

    const isAnalyticalTab = selectedTab === TABS.ANALYTICAL;
    const isOpenEOMode = selectedProcessing === PROCESSING_OPTIONS.OPENEO;

    let selectedLayer = layerId;
    let isCustomLayer = false;

    if (isAnalyticalTab && analyticalFormLayers.length > 0) {
      selectedLayer = analyticalFormLayers[analyticalFormLayers.length - 1];
      isCustomLayer = selectedLayer === CUSTOM_TAG;
    } else if (!isAnalyticalTab && props.customSelected) {
      selectedLayer = CUSTOM_TAG;
      isCustomLayer = true;
    }

    const options = {
      ...props,
      cancelToken,
      layerId: isCustomLayer ? layerId : selectedLayer,
      // Only pass custom evalscript/processGraph if it's a custom layer
      // For regular layers, nullify so the layer's own script is used
      evalscript: isCustomLayer && !isOpenEOMode ? evalscript : null,
      customSelected: isCustomLayer,
      processGraph: isCustomLayer && isOpenEOMode ? processGraph : null,
    };

    const runPreviewFetch = async () => {
      try {
        let blob = await fetchPreviewImage(options);
        if (cancelled) {
          return;
        }
        if (blob instanceof Blob) {
          if (selectedTab === TABS.STICKER) {
            blob = await addStickerOverlays(
              blob,
              IMAGE_FORMATS_INFO[IMAGE_FORMATS.PNG].mimeType,
              overlayVariant,
            );
            if (cancelled) {
              return;
            }
          }
          setPreviewUrl(URL.createObjectURL(blob));
        } else {
          const error = new Error(t`Preview unavailable. Try zooming in or adjusting your selection.`);
          setPreviewError(error);
        }
      } catch (e) {
        if (!cancelled) {
          setPreviewError(e);
        }
      } finally {
        if (!cancelled) {
          setFetchingPreviewImage(false);
        }
      }
    };

    runPreviewFetch();
    // The SH preview path reads many values off `props` (selectedTab, layerId, evalscript,
    // processGraph, selectedProcessing, overlayVariant, auth, analyticalFormLayers) via the
    // `options` spread, so `props` must stay in the deps or the preview freezes after open. The
    // external-WMS path's cropToAoi/drawGeoToImg are covered by the same `props` identity change.
    //
    // `cancelled` guards every state update above so a slower, stale run from a previous render
    // can never overwrite a result from a newer one (e.g. a toggled-off overlay "sticking" visually).
    // `cancelToken.cancel()` additionally aborts the in-flight SH request itself (the external-WMS
    // path has no such mechanism), so a stale run doesn't keep consuming network/API quota either.
    return () => {
      cancelled = true;
      cancelToken.cancel();
    };
  }, [
    analyticalFormLayers,
    auth,
    layerId,
    overlayVariant,
    props,
    selectedTab,
    selectedProcessing,
    processGraph,
    evalscript,
  ]);

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
        props.activeExternalLayer &&
        selectedTab !== TABS.STICKER &&
        props.cropToAoi &&
        props.aoiGeometry &&
        props.aoiBounds ? (
          <div style={{ position: 'relative', display: 'inline-block' }}>
            <SvgAoiClip
              geometry={props.aoiGeometry}
              bounds={props.aoiBounds}
              clipId={aoiClipId}
              webMercator={true}
            />
            <img
              alt="download preview"
              className="image-download-preview"
              src={previewUrl}
              style={{ clipPath: `url(#${aoiClipId})` }}
            />
          </div>
        ) : (
          <img alt="download preview" className="image-download-preview" src={previewUrl} />
        )
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
  dataFusion: store.visualization.dataFusion,
  visualizationUrl: store.visualization.visualizationUrl,
  fromTime: store.visualization.fromTime,
  toTime: store.visualization.toTime,
  datasetId: store.visualization.datasetId,
  customSelected: store.visualization.customSelected,
  cloudCoverage: store.visualization.cloudCoverage,
  selectedProcessing: store.visualization.selectedProcessing,
  processGraph: store.visualization.processGraph,
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
  activeExternalLayer: selectActiveExternalLayer(store),
});

export default connect(mapStoreToProps, null)(ImageDownloadPreview);
