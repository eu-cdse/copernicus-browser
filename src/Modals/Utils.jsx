import React from 'react';
import Timelapse from '../Controls/Timelapse/Timelapse';
import ImageDownload from '../Controls/ImgDownload/ImageDownload';
import FIS from '../Controls/FIS/FIS';
import PinsStoryBuilder from '../Controls/PinsStoryBuilder/PinsStoryBuilder';
import SharePinsLink from '../Tools/Pins/SharePinsLink';
import TermsAndPrivacyConsentForm from '../TermsAndPrivacyConsent/TermsAndPrivacyConsentForm';
import ProductInfoModal from '../Tools/Results/ProductInfo/ProductInfoModal';
import { ModalId } from '../const';
import SpectralExplorer from '../Controls/SpectralExplorer/SpectralExplorer';
import ElevationProfile from '../Controls/ElevationProfile/ElevationProfile';
import BrowseProductModal from '../Tools/Results/BrowseProduct/BrowseProductModal';

export const Modals = {
  [ModalId.IMG_DOWNLOAD]: ({ showComparePanel }) => <ImageDownload showComparePanel={showComparePanel} />,
  [ModalId.ELEVATION_PROFILE]: () => <ElevationProfile />,
  [ModalId.TIMELAPSE]: () => <Timelapse />,
  [ModalId.FIS]: () => <FIS />,
  [ModalId.SHAREPINSLINK]: () => <SharePinsLink />,
  [ModalId.PINS_STORY_BUILDER]: () => <PinsStoryBuilder />,
  [ModalId.PRIVATE_THEMEID_LOGIN]: () => {},
  [ModalId.TERMS_AND_PRIVACY_CONSENT]: () => <TermsAndPrivacyConsentForm />,
  [ModalId.PRODUCT_DETAILS]: (params) => <ProductInfoModal params={params} />,
  [ModalId.SPECTRAL_EXPLORER]: ({ geometryType }) => <SpectralExplorer geometryType={geometryType} />,
  [ModalId.BROWSE_PRODUCT]: (params) => <BrowseProductModal params={params} />,
};

export function propsSufficientToRender(props) {
  const {
    visualizationUrl,
    datasetId,
    layerId,
    customSelected,
    pixelBounds,
    modalId,
    is3D,
    terrainViewerId,
  } = props;

  if (modalId === ModalId.TERRAIN_VIEWER) {
    const isDisabled = (!visualizationUrl && !datasetId && !layerId && !customSelected) || !pixelBounds;
    return !isDisabled;
  }
  if (modalId === ModalId.TIMELAPSE) {
    const isDisabled = is3D && !terrainViewerId;
    return !isDisabled;
  }
  return true;
}
