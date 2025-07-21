import axios from 'axios';
import { getActiveRadarProviders } from '../../ImageQualityAndProviderSection/Radar/Radar.utils';
import { getActiveOpticalProviders } from '../../ImageQualityAndProviderSection/Optical/Optical.utils';
import { ProviderImageTypes } from '../../../rapidResponseProperties';
import { getRrdCollectionId } from '../../../../../api/RRD/api.utils';

const imageCache = new Map();
const loadingStates = new Map();

const findProviderLogo = (item, providers, isTasking) => {
  for (const provider of providers) {
    const selectedMission = provider.missions.find((mission) => {
      const collectionId = getRrdCollectionId(
        item?.properties?.constellation,
        item?.properties?.platform,
        isTasking,
      );
      return collectionId === mission.id;
    });
    if (selectedMission) {
      return selectedMission.logo;
    }
  }
  return null;
};

const getLogoForItem = (item, imageType, isTasking) => {
  const providers =
    imageType === ProviderImageTypes.radar ? getActiveRadarProviders() : getActiveOpticalProviders();

  return findProviderLogo(item, providers, isTasking);
};

const fetchImageFromUrl = async (url, access_token) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${access_token}`,
      },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

const isValidQuicklook = (href, type) =>
  href && href !== 'null' && !type?.includes('tiff') && !type?.includes('image/tif');

export const fetchPreviewImage = async (item, access_token, imageType, isTasking) => {
  if (imageCache.has(item._internalId)) {
    return imageCache.get(item._internalId);
  }

  if (loadingStates.get(item._internalId)) {
    return null;
  }

  try {
    loadingStates.set(item._internalId, true);

    const quicklookPngHref = item.assets?.['quicklook-png']?.href;
    const quicklookPngType = item.assets?.['quicklook-png']?.type;

    if (isValidQuicklook(quicklookPngHref, quicklookPngType)) {
      const imageBlob = await fetchImageFromUrl(quicklookPngHref, access_token);
      if (imageBlob) {
        const imageUrl = URL.createObjectURL(imageBlob);
        if (imageUrl) {
          imageCache.set(item._internalId, imageUrl);
          return imageUrl;
        }
      }
    }

    const quicklookHref = item.assets?.quicklook?.href;
    const quicklookType = item.assets?.quicklook?.type;

    if (isValidQuicklook(quicklookHref, quicklookType)) {
      const imageBlob = await fetchImageFromUrl(quicklookHref, access_token);
      if (imageBlob) {
        const imageUrl = URL.createObjectURL(imageBlob);
        if (imageUrl) {
          imageCache.set(item._internalId, imageUrl);
          return imageUrl;
        }
      }
    }

    const logo = getLogoForItem(item, imageType, isTasking);
    if (logo) {
      imageCache.set(item._internalId, logo);
      return logo;
    }

    return null;
  } catch (error) {
    console.error('Error in fetchPreviewImage:', error);
    return null;
  } finally {
    loadingStates.set(item._internalId, false);
  }
};

export const isImageLoading = (itemId) => {
  return loadingStates.get(itemId) || false;
};

export const getPreviewImageDetails = async (item, access_token) => {
  if (imageCache.has(item._internalId)) {
    return {
      title: item.assets?.quicklook?.title || null,
      url: imageCache.get(item._internalId),
    };
  }

  if (loadingStates.get(item._internalId)) {
    return null;
  }

  try {
    loadingStates.set(item._internalId, true);

    // Check for valid quicklook first
    const quicklookHref = item.assets?.quicklook?.href;
    const quicklookType = item.assets?.quicklook?.type;

    if (isValidQuicklook(quicklookHref, quicklookType)) {
      const imageBlob = await fetchImageFromUrl(quicklookHref, access_token);
      if (imageBlob) {
        const imageUrl = URL.createObjectURL(imageBlob);
        if (imageUrl) {
          imageCache.set(item._internalId, imageUrl);
          return {
            title: item.assets?.quicklook?.title || null,
            url: imageUrl,
          };
        }
      }
    }

    // Fallback to quicklook-png
    const quicklookPngHref = item.assets?.['quicklook-png']?.href;
    const quicklookPngType = item.assets?.['quicklook-png']?.type;

    if (isValidQuicklook(quicklookPngHref, quicklookPngType)) {
      const imageBlob = await fetchImageFromUrl(quicklookPngHref, access_token);
      if (imageBlob) {
        const imageUrl = URL.createObjectURL(imageBlob);
        if (imageUrl) {
          imageCache.set(item._internalId, imageUrl);
          return {
            title: item.assets?.['quicklook-png']?.title || null,
            url: imageUrl,
          };
        }
      }
    }

    // Fallback to provider logo
    const logo = getLogoForItem(item, ProviderImageTypes.radar, false);
    if (logo) {
      imageCache.set(item._internalId, logo);
      return {
        title: null,
        url: logo,
      };
    }

    return null;
  } catch (error) {
    console.error('Error in getPreviewImageDetails:', error);
    return null;
  } finally {
    loadingStates.set(item._internalId, false);
  }
};
