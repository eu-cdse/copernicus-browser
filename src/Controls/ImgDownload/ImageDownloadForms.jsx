import React from 'react';
import { CRS_EPSG3857, CRS_EPSG4326 } from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import BasicForm from './BasicForm';
import AnalyticalForm from './AnalyticalForm';
import PrintForm from './PrintForm';
import TerrainViewerForm from './TerrainViewerForm';
import { IMAGE_FORMATS, RESOLUTION_OPTIONS, RESOLUTION_DIVISORS, AVAILABLE_CRS } from './consts';
import { EOBButton } from '../../junk/EOBCommon/EOBButton/EOBButton';
import { constructBBoxFromBounds, getDimensionsInMeters, getImageDimensions } from './ImageDownload.utils';
import store, { notificationSlice } from '../../store';
import { MAX_SH_IMAGE_SIZE } from '../../const';
import { getUtmCrsFromBbox } from '../../utils/utm';
import ImageDownloadPreview from './ImageDownloadPreview';
import { getDataSourceHandler } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

export const TABS = {
  BASIC: 'basic',
  ANALYTICAL: 'analytical',
  PRINT: 'print',
  TERRAIN_VIEWER: '3d',
};

function checkZoomLevel(datasetId, zoom) {
  const dsh = getDataSourceHandler(datasetId);
  if (dsh) {
    const leafletZoomConfig = dsh.getLeafletZoomConfig(datasetId);
    return (
      leafletZoomConfig &&
      leafletZoomConfig.min !== null &&
      leafletZoomConfig.min !== undefined &&
      zoom >= leafletZoomConfig.min
    );
  }
  return false;
}

export function ImageDownloadForms(props) {
  const {
    selectedTab,
    hasLegendData,
    loading,
    allLayers,
    allBands,
    isCurrentLayerCustom,
    supportedImageFormats,
    addingMapOverlaysPossible,
    defaultWidth,
    defaultHeight,
    isDataFusionEnabled,
    allowShowLogoAnalytical,
    areEffectsSet,
    hasAoi,
    hasLoi,
    aoiBounds,
    mapBounds,
    isUserLoggedIn,
    basicFormState,
    analyticalFormState,
    printFormState,
    terrainViewerFormState,
    updateFormData,
    updateSelectedBands,
    updateSelectedLayers,
    setBasicFormState,
    setAnalyticalFormState,
    setPrintFormState,
    setTerrainViewerFormState,
    datasetId,
    zoom,
    showComparePanel,
  } = props;

  const bounds = hasAoi ? aoiBounds : mapBounds;
  const { width: imageWidth, height: imageHeight } = getImageSize();

  function onErrorMessage(message) {
    store.dispatch(notificationSlice.actions.displayError(message));
  }

  function getImageSize() {
    const { selectedCrs, customResolution, selectedResolution } = analyticalFormState;

    if (selectedResolution === RESOLUTION_OPTIONS.CUSTOM) {
      return getImageDimensions(bounds, customResolution, selectedCrs);
    }

    const { defaultWidth, defaultHeight } = props;
    const resolutionDivisor = RESOLUTION_DIVISORS[selectedResolution].value;
    return {
      width: Math.floor(defaultWidth / resolutionDivisor),
      height: Math.floor(defaultHeight / resolutionDivisor),
    };
  }

  function renderImageSize() {
    return `${imageWidth} x ${imageHeight} px`;
  }

  function renderCRSResolution(selectedResolution, selectedCrs) {
    const { defaultWidth, defaultHeight } = props;
    const resolutionDivisor = RESOLUTION_DIVISORS[selectedResolution].value;
    if (selectedCrs === CRS_EPSG4326.authId) {
      const widthDegrees = bounds.getEast() - bounds.getWest();
      const heightDegrees = bounds.getNorth() - bounds.getSouth();
      const resLat = (heightDegrees * resolutionDivisor) / defaultHeight;
      const resLng = (widthDegrees * resolutionDivisor) / defaultWidth;
      const resLatInMinAndSec =
        resLat * 60.0 > 1.0
          ? `${(resLat * 60).toFixed(1)}` + t`min/px`
          : `${(resLat * 3600).toFixed(1)}` + t`sec/px`;
      const resLngInMinAndSec =
        resLng * 60.0 > 1.0
          ? `${(resLng * 60).toFixed(1)}` + t`min/px`
          : `${(resLng * 3600).toFixed(1)}` + t`sec/px`;
      return (
        <div className="wgs84-resolution">
          <div>{t`Resolution`}:</div>
          <div className="lat-lng">
            {t`lat.`}: {resLat.toFixed(7)} {t`deg/px`} ({resLatInMinAndSec})
          </div>
          <div className="lat-lng">
            {t`long.`}: {resLng.toFixed(7)} {t`deg/px`} ({resLngInMinAndSec})
          </div>
        </div>
      );
    }
    const { width } = getDimensionsInMeters(bounds, selectedCrs);
    const resolution = (width * resolutionDivisor) / defaultWidth;
    const formattedResolution = resolution >= 2 ? Math.floor(resolution) : resolution.toFixed(1);
    return t`Projected resolution: ${formattedResolution} m/px`;
  }

  function onDownloadImage(selectedTab) {
    if (selectedTab === TABS.BASIC) {
      props.onDownloadBasic(basicFormState);
    }
    if (selectedTab === TABS.ANALYTICAL) {
      props.onDownloadAnalytical(analyticalFormState);
    }
    if (selectedTab === TABS.PRINT) {
      props.onDownloadPrint(printFormState);
    }
    if (selectedTab === TABS.TERRAIN_VIEWER) {
      props.onDownload3D(terrainViewerFormState);
    }
  }

  function isKMZ(imageFormat) {
    return imageFormat === IMAGE_FORMATS.KMZ_JPG || imageFormat === IMAGE_FORMATS.KMZ_PNG;
  }

  function isJPGorPNG(imageFormat) {
    return imageFormat === IMAGE_FORMATS.JPG || imageFormat === IMAGE_FORMATS.PNG;
  }

  function displayDataFusionWarning() {
    const { customSelected, imageFormat } = analyticalFormState;
    if (
      selectedTab === TABS.ANALYTICAL &&
      props.isDataFusionEnabled &&
      customSelected &&
      !isJPGorPNG(imageFormat)
    ) {
      if (isKMZ(imageFormat)) {
        return (
          <div className="image-download-warning">
            <i className="fa fa-exclamation-circle" />
            {t`Error: Data fusion does not support KMZ/JPG and KMZ/PNG formats.`}
          </div>
        );
      }
    }
    return null;
  }

  function displayEffectsWarning() {
    const { imageFormat } = analyticalFormState;
    if (selectedTab === TABS.ANALYTICAL && props.areEffectsSet && !isJPGorPNG(imageFormat)) {
      return (
        <div className="image-download-warning">
          <i className="fa fa-exclamation-circle" />
          {t`Error: You can only download visualisation with effects in JPEG or PNG formats.`}
        </div>
      );
    }
    return null;
  }

  function getCrsOptions() {
    const utmAuthId = getUtmCrsFromBbox(constructBBoxFromBounds(bounds));
    const availableCrs = [
      AVAILABLE_CRS[CRS_EPSG3857.authId],
      AVAILABLE_CRS[CRS_EPSG4326.authId],
      AVAILABLE_CRS[utmAuthId],
    ];
    return availableCrs;
  }

  const isAnalyticalModeAndNothingSelected =
    selectedTab === TABS.ANALYTICAL &&
    !analyticalFormState.customSelected &&
    analyticalFormState.selectedLayers.length === 0 &&
    analyticalFormState.selectedBands.length === 0;

  const isAnalyticalModeAndLayersNotLoaded = selectedTab === TABS.ANALYTICAL && allLayers.length === 0;

  const isAnalyticalModeAndOnlyRawBands =
    analyticalFormState.selectedLayers.length === 0 &&
    analyticalFormState.selectedBands.length > 0 &&
    selectedTab === TABS.ANALYTICAL &&
    !analyticalFormState.customSelected;

  const isDataFusionAndKMZSelected =
    selectedTab === TABS.ANALYTICAL &&
    isDataFusionEnabled &&
    analyticalFormState.customSelected &&
    isKMZ(analyticalFormState.imageFormat);

  const areEffectsSetAndFormatNotJpgPng =
    selectedTab === TABS.ANALYTICAL && areEffectsSet && !isJPGorPNG(analyticalFormState.imageFormat);

  const areImageDimensionsValid =
    selectedTab !== TABS.ANALYTICAL ||
    (imageWidth <= MAX_SH_IMAGE_SIZE &&
      imageHeight <= MAX_SH_IMAGE_SIZE &&
      imageWidth >= 1 &&
      imageHeight >= 1);

  const isZoomLevelOK = checkZoomLevel(datasetId, zoom) || selectedTab === TABS.PRINT;

  const disabledImagePreviewDownload =
    isAnalyticalModeAndNothingSelected ||
    isDataFusionAndKMZSelected ||
    isAnalyticalModeAndLayersNotLoaded ||
    areEffectsSetAndFormatNotJpgPng ||
    !isZoomLevelOK ||
    isAnalyticalModeAndOnlyRawBands;

  return (
    <div className="image-download-forms">
      {displayDataFusionWarning()}
      {displayEffectsWarning()}

      <h3>{t`Image download`}</h3>
      {selectedTab === TABS.BASIC && (
        <BasicForm
          {...basicFormState}
          updateFormData={(field, newValue) => updateFormData(field, newValue, setBasicFormState)}
          addingMapOverlaysPossible={addingMapOverlaysPossible}
          hasLegendData={hasLegendData}
          onErrorMessage={onErrorMessage}
          isUserLoggedIn={isUserLoggedIn}
          isBasicForm={true}
          hasAoi={hasAoi}
          hasLoi={hasLoi}
        />
      )}
      {selectedTab === TABS.ANALYTICAL && (
        <AnalyticalForm
          {...analyticalFormState}
          updateFormData={(field, newValue) => updateFormData(field, newValue, setAnalyticalFormState)}
          updateSelectedLayers={updateSelectedLayers}
          updateSelectedBands={updateSelectedBands}
          allLayers={allLayers}
          allBands={allBands}
          isCurrentLayerCustom={isCurrentLayerCustom}
          renderImageSize={renderImageSize}
          areImageDimensionsValid={areImageDimensionsValid}
          renderCRSResolution={renderCRSResolution}
          onErrorMessage={onErrorMessage}
          supportedImageFormats={supportedImageFormats}
          allowShowLogoAnalytical={allowShowLogoAnalytical}
          hasAoi={hasAoi}
          getCrsOptions={getCrsOptions}
        />
      )}
      {selectedTab === TABS.PRINT && (
        <PrintForm
          {...printFormState}
          updateFormData={(field, newValue) => updateFormData(field, newValue, setPrintFormState)}
          addingMapOverlaysPossible={addingMapOverlaysPossible}
          hasLegendData={hasLegendData}
          onErrorMessage={onErrorMessage}
          heightToWidthRatio={defaultHeight / defaultWidth}
          isUserLoggedIn={isUserLoggedIn}
        />
      )}
      {selectedTab === TABS.TERRAIN_VIEWER && (
        <TerrainViewerForm
          {...terrainViewerFormState}
          updateFormData={(field, newValue) => updateFormData(field, newValue, setTerrainViewerFormState)}
          addingMapOverlaysPossible={addingMapOverlaysPossible}
          hasLegendData={hasLegendData}
          onErrorMessage={onErrorMessage}
          heightToWidthRatio={defaultHeight / defaultWidth}
          isUserLoggedIn={isUserLoggedIn}
        />
      )}
      {!disabledImagePreviewDownload && (
        <ImageDownloadPreview
          analyticalFormLayers={analyticalFormState.selectedLayers}
          selectedTab={selectedTab}
          hasAoi={hasAoi}
          cropToAoi={selectedTab === TABS.BASIC ? basicFormState.cropToAoi : hasAoi}
          disabledDownload={disabledImagePreviewDownload}
          drawGeoToImg={selectedTab === TABS.BASIC ? basicFormState.drawGeoToImg : false}
          showComparePanel={showComparePanel}
          selectedCrs={CRS_EPSG4326.authId}
        />
      )}

      <EOBButton
        fluid
        loading={loading}
        disabled={
          loading ||
          !areImageDimensionsValid ||
          isAnalyticalModeAndNothingSelected ||
          isDataFusionAndKMZSelected ||
          isAnalyticalModeAndLayersNotLoaded ||
          areEffectsSetAndFormatNotJpgPng ||
          !isZoomLevelOK
        }
        onClick={() => onDownloadImage(selectedTab)}
        icon="download"
        text={t`Download`}
      />
    </div>
  );
}
