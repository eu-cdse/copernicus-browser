import React, { Component } from 'react';
import { connect } from 'react-redux';
import Rodal from 'rodal';
import { t } from 'ttag';
import moment from 'moment';
import { isMobile } from 'react-device-detect';

import { CancelToken, isCancelled, MimeTypes, ProcessingDataFusionLayer } from '@sentinel-hub/sentinelhub-js';

import store, { modalSlice, timelapseSlice } from '../../store';
import { getAppropriateAuthToken, getGetMapAuthToken } from '../../App';
import { TimelapseControls } from './TimelapseControls';
import { TimelapseSidebarPins } from './TimelapseSidebarPins';
import { TimelapseImages } from './TimelapseImages';
import { TimelapsePreview } from './TimelapsePreview';
import { constructBBoxFromBounds, getLayerFromParams } from '../ImgDownload/ImageDownload.utils';
import { constructGetMapParamsEffects, getVisualizationEffectsFromStore } from '../../utils/effectsUtils';
import { TERRAIN_VIEWER_IDS, setTerrainViewerId } from '../../TerrainViewer/TerrainViewer.const';

import {
  getFlyoversToFetch,
  getMinMaxDates,
  findDefaultActiveImageIndex,
  isImageApplicable,
  findNextActiveImageIndex,
  generateTimelapseWithGifshot,
  fetchTimelapseImage,
  getTimelapseBounds,
  determineDefaultImageSize,
  determineDefaultImageSize3D,
  generateTimelapseWithFFMPEG,
  getFlyOverVisualization,
  DEFAULT_IMAGE_DIMENSION,
  isImageClearEnough,
  isImageCoverageEnough,
  resetNewLayersCount,
} from './Timelapse.utils';

import './Timelapse.scss';
import { applyFilterMonthsToDateRange } from '../../junk/EOBCommon/utils/filterDates';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';
import { EXPORT_FORMAT, TRANSITION } from '../../const';
import { NotificationPanel } from '../../Notification/NotificationPanel';
import { getOrbitDirectionFromList } from '../../Tools/VisualizationPanel/VisualizationPanel.utils';

import {
  GENERATION_CANCELLED,
  getTimelapseImagesFromTerrainViewer,
  getTimelapsePreviewsFromTerrainViewer,
} from '../../TerrainViewer/TerrainViewer.utils';
import md5 from '../../utils/md5';

const TIME_UNITS = {
  SECONDS: 'seconds',
  MILLISECONDS: 'milliseconds',
};

class Timelapse extends Component {
  state = {
    images: null,
    activeImageIndex: null,
    loadingLayer: true,
    loadingImages: false,
    canWeFilterByClouds: false,
    canWeFilterByCoverage: false,
    isPreviewPlaying: false,
    generatingTimelapse: false,
    generatingTimelapseProgress: null,
    supportsOrbitPeriod: false,
    showSidebar: true,
    sidebarPopup: null,
    errorMessage: null,
    generationCancelled: false,
  };
  fetchUnsuitablePreviewsTimeoutId = null;

  async componentDidMount() {
    const { fromTime, toTime, timelapseSharePreviewMode, auth, authToken, is3D } = this.props;

    this.cancelToken = new CancelToken();

    if (is3D) {
      store.dispatch(timelapseSlice.actions.setMaxCCPercentAllowed(50));
      store.dispatch(timelapseSlice.actions.setMinCoverageAllowed(80));
    }

    if (!authToken && !auth.anonToken) {
      return;
    }
    try {
      this.layer = await getLayerFromParams(
        { ...this.props, fromTime: undefined, toTime: undefined },
        this.cancelToken,
        authToken || auth.anonToken,
      );

      if (!fromTime || !toTime) {
        store.dispatch(
          timelapseSlice.actions.setInitialTime({
            time: this.props.visualizationToTime,
            interval: is3D ? 'week' : 'month',
          }),
        );
      }

      if (timelapseSharePreviewMode) {
        this.togglePreviewPlaying();
      }

      this.setState({ loadingLayer: false });

      // update size on first load or if the ratio changes
      const size = this.props.is3D
        ? determineDefaultImageSize3D(this.props.pixelBounds)
        : determineDefaultImageSize(this.props.mapBounds, this.props.aoi);
      if (!this.props.size || this.props.size.ratio.toFixed(3) !== size.ratio.toFixed(3)) {
        store.dispatch(timelapseSlice.actions.setSize(size));
      }

      this.searchDatesAndFetchImages();
    } catch (e) {
      console.warn(e.message);
    }

    resetNewLayersCount(this.props);
  }

  componentDidUpdate(prevProps) {
    if (prevProps.pins.length > this.props.pins.length) {
      this.searchDatesAndFetchImages();
    }
    if (prevProps.showBorders !== this.props.showBorders) {
      this.searchDatesAndFetchImages();
    }
    if (
      prevProps.timelapseSharePreviewMode !== this.props.timelapseSharePreviewMode &&
      prevProps.previewFileUrl !== this.props.previewFileUrl
    ) {
      this.searchDatesAndFetchImages();
    }

    if (prevProps.timelapseFPS !== this.props.timelapseFPS) {
      this.updatePreviewLoop();
    }

    if (
      prevProps.maxCCPercentAllowed !== this.props.maxCCPercentAllowed ||
      prevProps.minCoverageAllowed !== this.props.minCoverageAllowed
    ) {
      clearTimeout(this.fetchUnsuitablePreviewsTimeoutId);
      const newTimeout = setTimeout(() => this.fetchPreviouslyUnsuitable3DPreviews(), 1000);
      this.fetchUnsuitablePreviewsTimeoutId = newTimeout;
    }
  }

  componentWillUnmount() {
    clearTimeout(this.fetchUnsuitablePreviewsTimeoutId);
    if (this.props.is3D) {
      setTerrainViewerId(TERRAIN_VIEWER_IDS.MAIN);
      document.getElementById('terrain-map-container').setAttribute('style', `width:100%;height:100%;`);
      window.reload3DTextures(this.props.terrainViewerId);
    }
    this.cancelToken.cancel();
    this.timer && clearInterval(this.timer);
    resetNewLayersCount(this.props);
  }

  updateDate = (fromOrTo, date) => {
    if (fromOrTo === 'from') {
      store.dispatch(timelapseSlice.actions.setFromTime(date.clone().startOf('day')));
    }
    if (fromOrTo === 'to') {
      store.dispatch(timelapseSlice.actions.setToTime(date.clone().endOf('day')));
    }
  };

  setFilterMonths = (months) => {
    store.dispatch(timelapseSlice.actions.setFilterMonths(months));
  };

  onFetchAvailableDates = async (fromMoment, toMoment) => {
    if (!this.layer) {
      return [];
    }
    const { mapBounds, aoi } = this.props;
    const bbox = constructBBoxFromBounds(getTimelapseBounds(mapBounds, aoi));
    const dates = await this.layer.findDatesUTC(bbox, fromMoment.toDate(), toMoment.toDate());
    return dates;
  };

  onQueryDatesForActiveMonth = async (day) => {
    const monthStart = day.clone().startOf('month');
    const monthEnd = day.clone().endOf('month');
    const dates = await this.onFetchAvailableDates(monthStart, monthEnd);
    return dates;
  };

  setSelectedPeriod = (period) => {
    store.dispatch(timelapseSlice.actions.setSelectedPeriod(period));
  };

  getVisualizations = async () => {
    const { datasetId, pins, auth, customSelected } = this.props;

    // always include base layer visualization
    const visualizations = [
      {
        layer: this.layer,
        datasetId: datasetId,
        effects: constructGetMapParamsEffects(this.props),
        customSelected: customSelected,
      },
    ];

    // add visualizations from pins
    for (const pin of pins) {
      visualizations.push({
        layer: await getLayerFromParams(
          { ...pin, fromTime: undefined, toTime: undefined },
          this.cancelToken,
          getAppropriateAuthToken(auth, pin.themeId) || auth.anonToken,
        ),
        datasetId: pin.datasetId,
        effects: constructGetMapParamsEffects(pin),
        pin: pin,
      });
    }
    return visualizations;
  };

  shouldDisplayPreviewFile = () => {
    return this.props.timelapseSharePreviewMode && this.props.previewFileUrl;
  };

  searchDatesAndFetchImages = async () => {
    if (this.shouldDisplayPreviewFile()) {
      return;
    }

    const { selectedPeriod } = this.props;

    // Cancel any previous requests
    this.cancelToken.cancel();
    this.cancelToken = new CancelToken();

    const visualizations = await this.getVisualizations();

    let flyoversToFetch = [];
    let supportsOrbitPeriod = true;
    let canWeFilterByClouds = true;
    let canWeFilterByCoverage = true;

    for (const [index, visualization] of visualizations.entries()) {
      let { flyovers: layerFlyovers, supportsOrbitPeriod: layerSupportsOrbitPeriod } = await this.searchDates(
        visualization.layer,
      );

      if (layerFlyovers.length === 0) {
        continue;
      }

      const layerFlyoversToFetch = getFlyoversToFetch(layerFlyovers, selectedPeriod);

      flyoversToFetch = [
        ...flyoversToFetch,
        ...(await Promise.all(
          layerFlyoversToFetch.map(async (flyover) => ({
            ...flyover,
            visualization: await getFlyOverVisualization(visualization, flyover),
            visualizationIndex: index,
          })),
        )),
      ];

      supportsOrbitPeriod = supportsOrbitPeriod && layerSupportsOrbitPeriod;
      canWeFilterByClouds =
        canWeFilterByClouds &&
        !!(layerFlyovers[0].meta && layerFlyovers[0].meta.averageCloudCoverPercent !== undefined);
      canWeFilterByCoverage = canWeFilterByCoverage && layerFlyovers[0].coveragePercent !== undefined;
    }

    store.dispatch(timelapseSlice.actions.setIsSelectAllChecked(true));

    this.setState({
      supportsOrbitPeriod,
      canWeFilterByClouds,
      canWeFilterByCoverage,
    });

    await this.fetchImages({ flyoversToFetch: flyoversToFetch.sort((a, b) => a.toTime - b.toTime) });
  };

  searchDates = async (layer) => {
    this.setState({
      sidebarPopup: null,
      loadingImages: true,
      images: null,
      activeImageIndex: null,
    });
    const { mapBounds, fromTime, toTime, filterMonths, selectedPeriod, aoi } = this.props;

    const bbox = constructBBoxFromBounds(getTimelapseBounds(mapBounds, aoi));
    const intervals = applyFilterMonthsToDateRange(fromTime, toTime, filterMonths);

    const reqConfig = {
      cancelToken: this.cancelToken,
    };

    let flyovers = [];
    let supportsOrbitPeriod;
    let searchLayer = layer;
    if (layer instanceof ProcessingDataFusionLayer) {
      searchLayer = layer.layers[0].layer;
    }
    for (const interval of intervals) {
      try {
        flyovers = [
          ...flyovers,
          ...(await searchLayer.findFlyovers(
            bbox,
            interval.fromMoment,
            interval.toMoment,
            100,
            100,
            reqConfig,
          )),
        ];
        if (layer instanceof ProcessingDataFusionLayer) {
          flyovers = flyovers.map((flyover) => ({
            ...flyover,
            fromTime:
              selectedPeriod === 'orbit' ? flyover.fromTime : moment.utc(flyover.fromTime).startOf('day'),
            toTime: selectedPeriod === 'orbit' ? flyover.toTime : moment.utc(flyover.toTime).endOf('day'),
          }));
        }
        supportsOrbitPeriod = true;
      } catch (err) {
        try {
          const dates = await searchLayer.findDatesUTC(
            bbox,
            interval.fromMoment,
            interval.toMoment,
            reqConfig,
          );
          flyovers = [
            ...flyovers,
            ...dates.map((date) => ({
              fromTime: moment.utc(date).startOf('day'),
              toTime: moment.utc(date).endOf('day'),
            })),
          ];
          supportsOrbitPeriod = false;
        } catch (err) {
          flyovers = [...flyovers, interval];
        }
      }
    }
    return { flyovers, supportsOrbitPeriod };
  };

  onImageLoad = ({ img, flyover, setDeferredImages = false }) => {
    const { maxCCPercentAllowed, minCoverageAllowed, isSelectAllChecked } = this.props;
    const { canWeFilterByClouds, canWeFilterByCoverage, images: currentImages } = this.state;
    let images = currentImages || [];

    const flyoverHash = md5(JSON.stringify(flyover));

    if (setDeferredImages) {
      for (let i = 0; i < images.length; i++) {
        if (images[i].flyoverHash === flyoverHash) {
          images[i].url = img;
        }
      }
    } else {
      const augmentedImage = {
        url: img,
        layer: flyover.visualization.layer,
        datasetId: flyover.visualization.datasetId,
        fromTime: flyover.fromTime,
        toTime: flyover.toTime,
        effects: flyover.visualization.effects,
        customSelected: flyover.visualization.customSelected,
        pin: flyover.visualization.pin,
        isSelected: isSelectAllChecked,
        averageCloudCoverPercent: flyover.meta && flyover.meta.averageCloudCoverPercent,
        coveragePercent: flyover.coveragePercent,
        visualizationIndex: flyover.visualizationIndex,
        origFlyover: flyover,
        flyoverHash: flyoverHash,
      };
      images = [...images, augmentedImage].sort(
        (a, b) => a.toTime - b.toTime || a.visualizationIndex - b.visualizationIndex,
      );
    }

    this.setState((prevState) => {
      const activeImageIndex =
        prevState.activeImageIndex !== null &&
        isImageApplicable(
          images[prevState.activeImageIndex],
          canWeFilterByClouds,
          canWeFilterByCoverage,
          maxCCPercentAllowed,
          minCoverageAllowed,
        )
          ? prevState.activeImageIndex
          : findDefaultActiveImageIndex(
              images,
              canWeFilterByClouds,
              canWeFilterByCoverage,
              maxCCPercentAllowed,
              minCoverageAllowed,
            );

      return {
        images,
        activeImageIndex,
      };
    });
  };

  fetchPreviouslyUnsuitable3DPreviews = () => {
    const { images } = this.state;

    if (!images) {
      return;
    }

    const flyoversToFetch = images.filter((image) => image.url === null).map((image) => image.origFlyover);

    if (flyoversToFetch.length > 0) {
      this.fetchImages({ flyoversToFetch: flyoversToFetch, setDeferredImages: true });
    }
  };

  fetchImages = async ({ flyoversToFetch, setDeferredImages = false }) => {
    const { auth, showBorders, aoi, mapBounds, pixelBounds, is3D, maxCCPercentAllowed, minCoverageAllowed } =
      this.props;
    const { canWeFilterByClouds, canWeFilterByCoverage } = this.state;

    const size = is3D ? determineDefaultImageSize3D(pixelBounds) : determineDefaultImageSize(mapBounds, aoi);

    this.setState({
      loadingImages: true,
    });

    if (is3D) {
      const { terrainViewerSettings, terrainViewerId } = this.props;
      const { z, rotV, sunTime, settings } = terrainViewerSettings;

      const imagesToFetch = [];

      for (let flyover of flyoversToFetch) {
        this.onImageLoad({
          img: null,
          flyover: flyover,
          setDeferredImages: setDeferredImages,
        }); // We call the callback with `img: null` so the placeholder loader is rendered for applicable images that are loading
        const image = {
          layer: flyover.visualization.layer,
          datasetId: flyover.visualization.datasetId,
          bounds: getTimelapseBounds(mapBounds, aoi),
          fromTime: flyover.fromTime,
          toTime: flyover.toTime,
          width: size.width,
          height: size.height,
          imageFormat: MimeTypes.JPEG,
          cancelToken: this.cancelToken,
          geometry: aoi.geometry,
          effects: flyover.visualization.effects,
          getMapAuthToken: getGetMapAuthToken(auth),
          showBorders: showBorders && !(aoi && aoi.bounds),
          origFlyover: flyover,
        };
        if (
          isImageClearEnough(
            flyover?.meta?.averageCloudCoverPercent,
            canWeFilterByClouds,
            maxCCPercentAllowed,
          ) &&
          isImageCoverageEnough(flyover?.coveragePercent, canWeFilterByCoverage, minCoverageAllowed)
        ) {
          imagesToFetch.push(image);
        }
      }

      await new Promise(async (resolve) => {
        await getTimelapsePreviewsFromTerrainViewer({
          containerId: 'terrain-map-container',
          z: z,
          rotV: rotV,
          sunTime: sunTime,
          settings: settings,
          images: imagesToFetch,
          getMapParams: {
            ...this.props,
            format: MimeTypes.JPEG,
          },
          width: size.width,
          height: size.height,
          reqConfig: {
            cancelToken: this.cancelToken,
          },
          callback: (img, flyover) =>
            this.onImageLoad({ img: img, flyover: flyover, setDeferredImages: true }),
          progress: (percent) => {
            this.updateFetchAndEncodeProgress(percent, true);
          },
          timelapseTerrainViewerId: terrainViewerId,
        });
        resolve();
      });
    } else {
      await Promise.all(
        flyoversToFetch.map((flyover) =>
          fetchTimelapseImage({
            layer: flyover.visualization.layer,
            datasetId: flyover.visualization.datasetId,
            bounds: getTimelapseBounds(mapBounds, aoi),
            fromTime: flyover.fromTime,
            toTime: flyover.toTime,
            width: size.width,
            height: size.height,
            imageFormat: MimeTypes.JPEG,
            cancelToken: this.cancelToken,
            geometry: aoi.geometry,
            effects: flyover.visualization.effects,
            getMapAuthToken: getGetMapAuthToken(auth),
            showBorders: showBorders && !(aoi && aoi.bounds),
          })
            .then((image) => {
              return this.onImageLoad({ img: image.url, flyover: flyover });
            })
            .catch((err) => {
              if (!isCancelled(err)) {
                console.warn('Unable to fetch timelapse image', err);
                this.showErrorMessage(t`Unable to fetch timelapse image`);
              }
            }),
        ),
      );
    }
    this.setState({
      loadingImages: false,
    });
  };

  setMaxCCPercentAllowed = (ccPercent) => {
    const { minCoverageAllowed, is3D } = this.props;
    const { loadingImages } = this.state;

    if (is3D && loadingImages) {
      return;
    }

    store.dispatch(timelapseSlice.actions.setMaxCCPercentAllowed(ccPercent));

    this.setState((prevState) => {
      const { images, activeImageIndex, canWeFilterByClouds, canWeFilterByCoverage } = prevState;
      // If the currently active image doesn't fit new criteria, we selected the next possible one
      let newActiveImage;
      if (activeImageIndex && images[activeImageIndex].averageCloudCoverPercent <= ccPercent) {
        newActiveImage = activeImageIndex;
      } else {
        newActiveImage = findDefaultActiveImageIndex(
          images,
          canWeFilterByClouds,
          canWeFilterByCoverage,
          ccPercent,
          minCoverageAllowed,
        );
      }
      return {
        activeImageIndex: newActiveImage,
      };
    });
  };

  setMinCoverageAllowed = (coveragePercent) => {
    const { maxCCPercentAllowed, is3D } = this.props;
    const { loadingImages } = this.state;

    if (is3D && loadingImages) {
      return;
    }

    store.dispatch(timelapseSlice.actions.setMinCoverageAllowed(coveragePercent));

    this.setState((prevState) => {
      const { images, activeImageIndex, canWeFilterByClouds, canWeFilterByCoverage } = prevState;
      // If the currently active image doesn't fit new criteria, we selected the next possible one
      let newActiveImage;
      if (activeImageIndex && images[activeImageIndex].coveragePercent >= coveragePercent) {
        newActiveImage = activeImageIndex;
      } else {
        newActiveImage = findDefaultActiveImageIndex(
          images,
          canWeFilterByClouds,
          canWeFilterByCoverage,
          maxCCPercentAllowed,
          coveragePercent,
        );
      }
      return {
        activeImageIndex: newActiveImage,
      };
    });
  };

  toggleImageSelected = (index) => {
    const { maxCCPercentAllowed, minCoverageAllowed } = this.props;

    this.setState((prevState) => {
      const newImages = [...prevState.images];
      newImages[index].isSelected = !newImages[index].isSelected;

      const newActiveImageIndex = newImages[index].isSelected
        ? index
        : prevState.activeImageIndex === index
        ? findNextActiveImageIndex(
            newImages,
            prevState.canWeFilterByClouds,
            prevState.canWeFilterByCoverage,
            maxCCPercentAllowed,
            minCoverageAllowed,
            0,
          )
        : prevState.activeImageIndex;

      store.dispatch(
        timelapseSlice.actions.setIsSelectAllChecked(newImages.every((image) => image.isSelected)),
      );

      return {
        images: newImages,
        activeImageIndex: newActiveImageIndex,
      };
    });
  };

  toggleAllImagesSelected = () => {
    const { isSelectAllChecked, maxCCPercentAllowed, minCoverageAllowed } = this.props;
    const { canWeFilterByClouds, canWeFilterByCoverage } = this.state;

    store.dispatch(timelapseSlice.actions.setIsSelectAllChecked(!isSelectAllChecked));

    this.setState((prevState) => {
      const { images } = prevState;
      const newImages = images.map((image) => ({ ...image, isSelected: !isSelectAllChecked }));
      return {
        images: newImages,
        activeImageIndex: findDefaultActiveImageIndex(
          newImages,
          canWeFilterByClouds,
          canWeFilterByCoverage,
          maxCCPercentAllowed,
          minCoverageAllowed,
        ),
      };
    });
  };

  setImageToActive = (index) => {
    this.setState({
      activeImageIndex: index,
    });
  };

  toggleShowBorders = () => {
    store.dispatch(timelapseSlice.actions.setShowBorders(!this.props.showBorders));
  };

  togglePreviewPlaying = () => {
    this.setState(
      (prevState) => ({
        isPreviewPlaying: !prevState.isPreviewPlaying,
      }),
      this.updatePreviewLoop,
    );
  };

  calculateLastFrameDelay = (timelapseFPS, unit = TIME_UNITS.MILLISECONDS) => {
    const ms = parseInt(timelapseFPS) <= 1 ? 2000 : 1000;
    switch (unit) {
      case TIME_UNITS.MILLISECONDS:
        return ms;
      case TIME_UNITS.SECONDS:
        return ms / 1000;

      default:
        throw new Error(`Unit ${unit} is not supported`);
    }
  };

  updatePreviewLoop = () => {
    const { timelapseFPS, delayLastFrame, timelapseSharePreviewMode } = this.props;
    const { isPreviewPlaying, images } = this.state;

    this.timer = cancelAnimationFrame(this.timer);

    if (!isPreviewPlaying || timelapseSharePreviewMode) {
      return;
    }

    let currentFrameStartTime = Date.now();

    const animate = () => {
      let currentTime = Date.now();
      let elapsed = Math.ceil(currentTime - currentFrameStartTime);
      let isLastFrameImage = images ? this.state.activeImageIndex === images.length - 1 : false;
      let delay = this.calculateLastFrameDelay(timelapseFPS, TIME_UNITS.MILLISECONDS);
      let frameDuration = Math.ceil(1000 / timelapseFPS);

      const fpsInterval = delayLastFrame && isLastFrameImage ? delay : frameDuration;

      if (elapsed > fpsInterval) {
        currentFrameStartTime = currentTime - (elapsed % fpsInterval);

        this.iterateOverImages();
      }
      this.timer = requestAnimationFrame(animate);
    };

    animate();
  };

  iterateOverImages = () => {
    const { maxCCPercentAllowed, minCoverageAllowed } = this.props;

    this.setState((prevState) => {
      const { images, canWeFilterByClouds, canWeFilterByCoverage, activeImageIndex } = prevState;
      const nextActiveImageIndex = findNextActiveImageIndex(
        images,
        canWeFilterByClouds,
        canWeFilterByCoverage,
        maxCCPercentAllowed,
        minCoverageAllowed,
        activeImageIndex,
      );
      return {
        activeImageIndex: nextActiveImageIndex,
      };
    });
  };

  changetimelapseFPS = (fps) => {
    store.dispatch(timelapseSlice.actions.setTimelapseFPS(fps));
  };

  changeTransition = (transition) => {
    store.dispatch(timelapseSlice.actions.setTransition(transition));
  };

  extendImageUrlsLastFrame(imageUrls, timelapseFPS) {
    let extendImageUrlsLastFrame = [...imageUrls];
    const delay = this.calculateLastFrameDelay(timelapseFPS, TIME_UNITS.SECONDS);
    const extraFrameCount = delay * timelapseFPS;

    for (let i = 1; i <= extraFrameCount; i++) {
      extendImageUrlsLastFrame.push(imageUrls.at(-1));
    }

    return extendImageUrlsLastFrame;
  }

  generateTimelapse = async () => {
    const { maxCCPercentAllowed, minCoverageAllowed, is3D, size, timelapseFPS, delayLastFrame } = this.props;
    const { images, canWeFilterByClouds, canWeFilterByCoverage } = this.state;

    // Cancel any previous requests
    this.cancelToken.cancel();
    this.cancelToken = new CancelToken();

    this.setState({
      generatingTimelapse: true,
      generatingTimelapseProgress: null,
    });

    const filteredImages = images.filter((image) =>
      isImageApplicable(
        image,
        canWeFilterByClouds,
        canWeFilterByCoverage,
        maxCCPercentAllowed,
        minCoverageAllowed,
      ),
    );

    try {
      const applicableImageUrls = is3D
        ? await this.fetch3dImages(filteredImages, size)
        : await this.refetchImages(filteredImages, size);

      const imageUrls = delayLastFrame
        ? this.extendImageUrlsLastFrame(applicableImageUrls, timelapseFPS)
        : applicableImageUrls;

      return await this.encodeImages(imageUrls, size);
    } catch (error) {
      if (isCancelled(error) || this.state.generationCancelled || error?.message === GENERATION_CANCELLED) {
        this.setState({ generationCancelled: false });
      } else {
        this.showErrorMessage(
          t`Could not generate timelapse animation file. Try using lower resolution or fewer frames.`,
        );
      }
    } finally {
      this.setState({
        generatingTimelapse: false,
        generatingTimelapseProgress: null,
      });
    }
  };

  fetch3dImages = async (images, size) => {
    const { terrainViewerSettings, terrainViewerId } = this.props;
    const { z, sunTime, settings } = terrainViewerSettings;

    const imageUrls = await getTimelapseImagesFromTerrainViewer({
      containerId: 'terrain-map-container',
      z: z,
      sunTime: sunTime,
      settings: settings,
      images: images,
      getMapParams: {
        ...this.props,
        format: MimeTypes.JPEG,
      },
      outputWidth: size.width,
      outputHeight: size.height,
      creationWidth: size.width,
      creationHeight: size.height,
      reqConfig: {
        cancelToken: this.cancelToken,
      },
      timelapseTerrainViewerId: terrainViewerId,
      isGenerationCancelled: this.isGenerationCancelled,
      progress: (percent) => {
        this.updateFetchAndEncodeProgress(percent, true);
      },
    });

    return imageUrls;
  };

  setGenerationCancelled = (generationCancelled) => {
    this.cancelToken.cancel();
    this.setState({ generationCancelled });
  };

  isGenerationCancelled = () => {
    return this.state.generationCancelled;
  };

  shouldRefetchImages = () => {
    const { is3D, size } = this.props;
    return is3D || size.width !== DEFAULT_IMAGE_DIMENSION || size.height !== DEFAULT_IMAGE_DIMENSION;
  };

  refetchImages = async (images, size) => {
    const { mapBounds, aoi, auth, showBorders } = this.props;
    let resolvedCounter = 0;

    const imageUrls = await Promise.all(
      images.map(async (image) => {
        if (!this.shouldRefetchImages()) {
          return image.url;
        }

        // refetch images with custom size
        let response = await fetchTimelapseImage({
          layer: image.layer,
          datasetId: image.datasetId,
          bounds: getTimelapseBounds(mapBounds, aoi),
          fromTime: image.fromTime,
          toTime: image.toTime,
          width: size.width,
          height: size.height,
          imageFormat: MimeTypes.JPEG,
          cancelToken: this.cancelToken,
          geometry: aoi.geometry,
          effects: image.effects,
          getMapAuthToken: getGetMapAuthToken(auth),
          showBorders: showBorders && !(aoi && aoi.bounds),
        }).catch((err) => {
          console.warn('Unable to refetch timelapse image', err);
          throw err;
        });

        this.updateFetchAndEncodeProgress(++resolvedCounter / images.length, true);
        return response && response.url;
      }),
    );

    return imageUrls;
  };

  encodeImages = async (imageUrls, size) => {
    const { transition, datasetId, timelapseFPS, format, fadeDuration } = this.props;

    if (format === EXPORT_FORMAT.gif && transition === TRANSITION.none) {
      return generateTimelapseWithGifshot({
        imageUrls,
        datasetId,
        timelapseFPS,
        size,
        progress: (percent) => {
          this.updateFetchAndEncodeProgress(percent);
        },
      });
    } else {
      return generateTimelapseWithFFMPEG({
        imageUrls,
        datasetId,
        timelapseFPS,
        fadeDuration,
        transition,
        size,
        progress: (percent) => {
          this.updateFetchAndEncodeProgress(percent);
        },
      });
    }
  };

  // first 50% of the progress is fetching, the rest is encoding
  updateFetchAndEncodeProgress = (percent, isFetch) => {
    let progress = percent;

    if (this.shouldRefetchImages()) {
      progress = percent * 0.5 + (isFetch ? 0 : 0.5);
    }

    this.setState({
      generatingTimelapseProgress: progress,
    });
  };

  onSidebarPopupToggle = (content) => {
    this.setState({
      sidebarPopup: this.state.sidebarPopup === content ? null : content,
    });
  };

  onAddPin = (pin) => {
    store.dispatch(timelapseSlice.actions.addPin(pin));
  };

  onRemovePin = (pin) => {
    const { pins } = this.props;
    store.dispatch(timelapseSlice.actions.removePin(pins.indexOf(pin)));
  };

  toggleSidebar = () => {
    const { showSidebar } = this.state;

    this.setState({
      showSidebar: !showSidebar,
    });
  };

  timelapseSharePreviewModeDisable = () => {
    this.setState({ isPreviewPlaying: false }, this.updatePreviewLoop);
    store.dispatch(timelapseSlice.actions.setTimelapseSharePreviewMode(false));
    store.dispatch(timelapseSlice.actions.setPreviewFileUrl(null));
  };

  onCloseModal = () => {
    store.dispatch(modalSlice.actions.removeModal());
    this.timelapseSharePreviewModeDisable();
  };

  updateUploadingTimelapseProgress = (generatingTimelapse) => {
    this.setState({
      generatingTimelapse,
      ...(generatingTimelapse && { generatingTimelapseProgress: 1 }),
    });
  };

  updateSize = (size) => {
    store.dispatch(
      timelapseSlice.actions.setSize({
        width: size.width,
        height: size.height,
        ratio: this.props.size.ratio, // always keep initial ratio
      }),
    );
  };

  updateFormat = (format) => {
    store.dispatch(timelapseSlice.actions.setFormat(format));
  };

  updateFadeDuration = (fadeDuration) => {
    store.dispatch(timelapseSlice.actions.setFadeDuration(fadeDuration));
  };

  showErrorMessage = (errorMessage) => {
    this.setState({ errorMessage });
  };

  updateDelayLastFrame = (delayLastFrame) => {
    store.dispatch(timelapseSlice.actions.setDelayLastFrame(delayLastFrame));
  };

  render() {
    const {
      images,
      loadingLayer,
      loadingImages,
      canWeFilterByClouds,
      canWeFilterByCoverage,
      activeImageIndex,
      isPreviewPlaying,
      generatingTimelapse,
      generatingTimelapseProgress,
      supportsOrbitPeriod,
      showSidebar,
      sidebarPopup,
      errorMessage,
    } = this.state;

    const {
      datasetId,
      pinsItems,
      fromTime,
      toTime,
      filterMonths,
      selectedPeriod,
      maxCCPercentAllowed,
      minCoverageAllowed,
      isSelectAllChecked,
      showBorders,
      timelapseSharePreviewMode,
      previewFileUrl,
      timelapseFPS,
      transition,
      pins,
      customSelected,
      aoi,
      size,
      format,
      fadeDuration,
      delayLastFrame,
      is3D,
    } = this.props;

    let { minDate, maxDate } = getMinMaxDates(datasetId);

    pins.forEach((pin) => {
      const { minDate: pinMinDate, maxDate: pinMaxDate } = getMinMaxDates(pin.datasetId);
      if (pinMinDate.isBefore(minDate)) {
        minDate = pinMinDate;
      }
      if (pinMaxDate.isAfter(maxDate)) {
        maxDate = pinMaxDate;
      }
    });

    const sidebarPins = pinsItems.filter((pin) => {
      const dsh = getDataSourceHandler(pin.item.datasetId);
      return dsh && dsh.supportsTimelapse();
    });

    const screenCoverage = timelapseSharePreviewMode ? (isMobile ? 80 : 90) : 100;

    return (
      <Rodal
        animation="fade"
        visible={true}
        customStyles={{ height: screenCoverage + 'vh', width: screenCoverage + 'vw', padding: 0, border: 0 }}
        onClose={this.onCloseModal}
        closeOnEsc={true}
      >
        {errorMessage && (
          <Rodal
            visible={true}
            customStyles={{ height: '100px', width: '500px' }}
            onClose={() => {
              this.showErrorMessage(false);
            }}
          >
            <NotificationPanel msg={errorMessage} type="info" />
          </Rodal>
        )}
        <div className="timelapse">
          <div className="title">
            <h1>{t`Timelapse`}</h1>
          </div>

          <div className="timelapse-panel">
            {showSidebar && !timelapseSharePreviewMode ? (
              <>
                <div className="sidebar">
                  <TimelapseControls
                    fromTime={fromTime}
                    toTime={toTime}
                    minDate={minDate}
                    maxDate={maxDate}
                    filterMonths={filterMonths}
                    selectedPeriod={selectedPeriod}
                    supportsOrbitPeriod={supportsOrbitPeriod}
                    updateDate={this.updateDate}
                    setFilterMonths={this.setFilterMonths}
                    onQueryDatesForActiveMonth={this.onQueryDatesForActiveMonth}
                    setSelectedPeriod={this.setSelectedPeriod}
                    pins={pins}
                    layer={this.layer}
                    customSelected={customSelected}
                    datasetId={datasetId}
                    onRemovePin={this.onRemovePin}
                    onSidebarPopupToggle={this.onSidebarPopupToggle}
                    onSearch={this.searchDatesAndFetchImages}
                    loadingLayer={loadingLayer}
                    loadingImages={loadingImages}
                  />
                </div>

                <div className="sidebar-2">
                  <TimelapseImages
                    images={images}
                    loadingImages={loadingImages}
                    selectedPeriod={selectedPeriod}
                    canWeFilterByClouds={canWeFilterByClouds}
                    canWeFilterByCoverage={canWeFilterByCoverage}
                    maxCCPercentAllowed={maxCCPercentAllowed}
                    minCoverageAllowed={minCoverageAllowed}
                    isSelectAllChecked={isSelectAllChecked}
                    activeImageIndex={activeImageIndex}
                    enableBorders={!(aoi && aoi.bounds)}
                    showBorders={showBorders && !(aoi && aoi.bounds)}
                    setMaxCCPercentAllowed={this.setMaxCCPercentAllowed}
                    setMinCoverageAllowed={this.setMinCoverageAllowed}
                    toggleImageSelected={this.toggleImageSelected}
                    toggleAllImagesSelected={this.toggleAllImagesSelected}
                    setImageToActive={this.setImageToActive}
                    toggleShowBorders={this.toggleShowBorders}
                    is3D={is3D}
                  />
                  {sidebarPopup === 'pins' ? (
                    <TimelapseSidebarPins
                      pins={sidebarPins}
                      onAddPin={this.onAddPin}
                      onSidebarPopupToggle={this.onSidebarPopupToggle}
                    />
                  ) : null}
                </div>
              </>
            ) : null}

            <TimelapsePreview
              images={images}
              size={size}
              format={format}
              fadeDuration={fadeDuration}
              activeImageIndex={activeImageIndex}
              access_token={this.props.auth.user.access_token}
              shouldDisplayPreviewFile={this.shouldDisplayPreviewFile}
              previewFileUrl={previewFileUrl}
              isPreviewPlaying={isPreviewPlaying}
              timelapseFPS={timelapseFPS}
              transition={transition}
              canWeFilterByClouds={canWeFilterByClouds}
              canWeFilterByCoverage={canWeFilterByCoverage}
              maxCCPercentAllowed={maxCCPercentAllowed}
              minCoverageAllowed={minCoverageAllowed}
              selectedPeriod={selectedPeriod}
              loadingImages={loadingImages}
              generatingTimelapse={generatingTimelapse}
              generatingTimelapseProgress={generatingTimelapseProgress}
              togglePreviewPlaying={this.togglePreviewPlaying}
              changetimelapseFPS={this.changetimelapseFPS}
              changeTransition={this.changeTransition}
              setImageToActive={this.setImageToActive}
              generateTimelapse={this.generateTimelapse}
              updateUploadingTimelapseProgress={this.updateUploadingTimelapseProgress}
              timelapseSharePreviewModeDisable={this.timelapseSharePreviewModeDisable}
              updateSize={this.updateSize}
              updateFormat={this.updateFormat}
              updateFadeDuration={this.updateFadeDuration}
              searchDatesAndFetchImages={this.searchDatesAndFetchImages}
              showErrorMessage={this.showErrorMessage}
              delayLastFrame={delayLastFrame}
              updateDelayLastFrame={this.updateDelayLastFrame}
              is3D={is3D}
              setGenerationCancelled={this.setGenerationCancelled}
            />
          </div>
        </div>
      </Rodal>
    );
  }
}

const mapStoreToProps = (store) => ({
  zoom: store.mainMap.zoom,
  visualizationToTime: store.visualization.toTime,
  pixelBounds: store.mainMap.pixelBounds,
  mapBounds: store.mainMap.bounds,
  aoi: store.aoi,
  datasetId: store.visualization.datasetId,
  layerId: store.visualization.layerId,
  customSelected: store.visualization.customSelected,
  visualizationUrl: store.visualization.visualizationUrl,
  evalscript: store.visualization.evalscript,
  evalscripturl: store.visualization.evalscripturl,
  authToken: getAppropriateAuthToken(store.auth, store.themes.selectedThemeId),
  ...getVisualizationEffectsFromStore(store),
  orbitDirection: getOrbitDirectionFromList(store.visualization.orbitDirection),
  dataFusion: store.visualization.dataFusion,
  pinsItems: store.pins.items,
  auth: store.auth,
  selectedThemeId: store.themes.selectedThemeId,
  fromTime: store.timelapse.fromTime,
  toTime: store.timelapse.toTime,
  filterMonths: store.timelapse.filterMonths,
  selectedPeriod: store.timelapse.selectedPeriod,
  maxCCPercentAllowed: store.timelapse.maxCCPercentAllowed,
  minCoverageAllowed: store.timelapse.minCoverageAllowed,
  isSelectAllChecked: store.timelapse.isSelectAllChecked,
  showBorders: store.timelapse.showBorders,
  timelapseSharePreviewMode: store.timelapse.timelapseSharePreviewMode,
  previewFileUrl: store.timelapse.previewFileUrl,
  timelapseFPS: store.timelapse.timelapseFPS,
  transition: store.timelapse.transition,
  pins: store.timelapse.pins,
  size: store.timelapse.size,
  format: store.timelapse.format,
  terrainViewerSettings: store.terrainViewer.settings,
  terrainViewerId: store.terrainViewer.id,
  is3D: store.mainMap.is3D,
  fadeDuration: store.timelapse.fadeDuration,
  delayLastFrame: store.timelapse.delayLastFrame,
  newLayersCount: store.timelapse.newLayersCount,
});

export default connect(mapStoreToProps, null)(Timelapse);
