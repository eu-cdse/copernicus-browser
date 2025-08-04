import axios from 'axios';
import { getActiveRadarProviders } from '../../ImageQualityAndProviderSection/Radar/Radar.utils';
import { getActiveOpticalProviders } from '../../ImageQualityAndProviderSection/Optical/Optical.utils';
import { ProviderImageTypes } from '../../../rapidResponseProperties';
import { getRrdCollectionId } from '../../../../../api/RRD/api.utils';

const imageCache = new Map();
const loadingStates = new Map();

const isValidQuicklook = (href, type) =>
  href && href !== 'null' && !type?.includes('tiff') && !type?.includes('image/tif');

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

// TODO: Remove this function when API is updated
const prependBaseUrl = (url) => {
  const baseURL = import.meta.env.VITE_RRD_BASE_URL;
  const baseUrl = `${baseURL}/sor/mw/quicklook?url=`;
  return url.startsWith('http') ? url : `${baseUrl}${encodeURI(url)}`;
};

const fetchImageBlob = async (url, accessToken) => {
  try {
    const response = await axios.get(url, {
      headers: {
        Authorization: `Bearer ${accessToken}`,
      },
      responseType: 'blob',
    });
    return response.data;
  } catch (error) {
    console.error('Error fetching image:', error);
    return null;
  }
};

export const isImageLoading = (itemId) => {
  return loadingStates.get(itemId) || false;
};

export const fetchThumbnailImage = async (item, accessToken, imageType, isTasking) => {
  const itemId = item._internalId;
  if (imageCache.has(itemId + '_thumbnail')) {
    return imageCache.get(itemId + '_thumbnail');
  }

  const thumbnailHref = item.assets?.thumbnail?.href;
  if (thumbnailHref) {
    const formatted = prependBaseUrl(thumbnailHref);
    const blob = await fetchImageBlob(formatted, accessToken);
    if (blob) {
      const imageUrl = URL.createObjectURL(blob);
      imageCache.set(itemId + '_thumbnail', imageUrl);
      return imageUrl;
    }
  }

  return null;
};

const fetchHDImage = async (url, accessToken) => {
  const blob = await fetchImageBlob(url, accessToken);
  return blob ? URL.createObjectURL(blob) : null;
};

export const fetchPreviewImage = async (item, accessToken, imageType, isTasking) => {
  const itemId = item._internalId;

  if (imageCache.has(itemId)) {
    return imageCache.get(itemId);
  }

  if (loadingStates.get(itemId)) {
    return null;
  }

  loadingStates.set(itemId, true);

  try {
    // 1. Try quicklook-png first
    const quicklookPng = item.assets?.['quicklook-png'];
    if (isValidQuicklook(quicklookPng?.href, quicklookPng?.type)) {
      const pngUrl = await fetchHDImage(quicklookPng.href, accessToken);
      if (pngUrl) {
        imageCache.set(itemId, pngUrl);
        return pngUrl;
      }
    }

    // 2. Then try regular quicklook
    const quicklook = item.assets?.quicklook;
    if (isValidQuicklook(quicklook?.href, quicklook?.type)) {
      const quicklookUrl = await fetchHDImage(quicklook.href, accessToken);
      if (quicklookUrl) {
        imageCache.set(itemId, quicklookUrl);
        return quicklookUrl;
      }
    }

    // 3. Fallback to logo
    const fallbackLogo = getLogoForItem(item, imageType, isTasking);
    if (fallbackLogo) {
      imageCache.set(itemId, fallbackLogo);
      return fallbackLogo;
    }

    return null;
  } catch (error) {
    console.error('Error in fetchPreviewImage:', error);
    return null;
  } finally {
    loadingStates.set(itemId, false);
  }
};
