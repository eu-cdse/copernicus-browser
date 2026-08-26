import axios from 'axios';
import { getActiveRadarProviders } from '../../ImageQualityAndProviderSection/Radar/Radar.utils';
import { getActiveOpticalProviders } from '../../ImageQualityAndProviderSection/Optical/Optical.utils';
import { ProviderImageTypes } from '../../../rapidResponseProperties';
import { getRrdCollectionId } from '../../../../../api/RRD/api.utils';

export interface RRDAsset {
  href?: string;
  type?: string;
  title?: string;
}

// The item shapes passed in here (search results, RRD cart items, map quicklook overlays) all
// carry different extra fields, so only the properties this file actually reads are declared.
export interface RRDPreviewItem {
  _internalId?: string;
  assets?: {
    quicklook?: RRDAsset;
    'quicklook-png'?: RRDAsset;
    thumbnail?: RRDAsset;
  };
  properties?: {
    constellation?: string;
    platform?: string;
    [key: string]: unknown;
  };
}

interface RRDMission {
  id: string | number;
  logo: string;
}

interface RRDProvider {
  missions: RRDMission[];
}

export interface PreviewImage {
  url: string;
  isFallback: boolean;
}

const imageCache = new Map<string, PreviewImage>();
// TODO(cleanup): loadingStates is now only an in-flight fetch guard inside fetchPreviewImage
// (isImageLoading was removed). It is redundant with ResultsCard's own isFetchingRef, but is
// still the only in-flight dedup for the QuicklookOverlay.jsx caller. Replace with a
// Map<itemId, Promise<url>> so concurrent callers await the same fetch. See MR !1080.
const loadingStates = new Map<string, boolean>();

export const isValidQuicklook = (href: string | undefined, type: string | undefined) =>
  href && href !== 'null' && !type?.includes('tiff') && !type?.includes('image/tif');

// Ordered by preference: quicklook-png before the plain quicklook asset. Returns only the
// assets that pass isValidQuicklook, keeping each asset's href/type paired together so callers
// never mix one asset's href with another asset's type.
// A thumbnail is deliberately excluded: handleQuicklookOnMap never forwards a thumbnail
// href to the map overlay, so a thumbnail-only item can only ever produce a logo overlay.
export const getQuicklookAssets = (item: RRDPreviewItem): RRDAsset[] =>
  [item?.assets?.['quicklook-png'], item?.assets?.quicklook].filter(
    (asset): asset is RRDAsset => !!asset && !!isValidQuicklook(asset?.href, asset?.type),
  );

export const getQuicklookAsset = (item: RRDPreviewItem): RRDAsset | null =>
  getQuicklookAssets(item)[0] || null;

export const hasQuicklookAsset = (item: RRDPreviewItem): boolean => getQuicklookAssets(item).length > 0;

const findProviderLogo = (
  item: RRDPreviewItem,
  providers: RRDProvider[],
  isTasking: boolean,
): string | null => {
  for (const provider of providers) {
    const selectedMission = provider.missions.find((mission) => {
      const collectionId = getRrdCollectionId(
        item?.properties?.constellation as string,
        item?.properties?.platform as string,
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

const getLogoForItem = (item: RRDPreviewItem, imageType: string, isTasking: boolean): string | null => {
  const providers =
    imageType === ProviderImageTypes.radar ? getActiveRadarProviders() : getActiveOpticalProviders();
  return findProviderLogo(item, providers, isTasking);
};

// TODO: Remove this function when API is updated
const prependBaseUrl = (url: string): string => {
  const baseURL = import.meta.env.VITE_RRD_BASE_URL;
  const baseUrl = `${baseURL}/sor/mw/quicklook?url=`;
  return url.startsWith('http') ? url : `${baseUrl}${encodeURI(url)}`;
};

const fetchImageBlob = async (url: string, accessToken: string | null): Promise<Blob | null> => {
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

/**
 * Fetches the item's thumbnail image.
 * @returns `null` when there is no thumbnail or the fetch fails. A thumbnail is always a real
 * image, never a fallback logo.
 */
export const fetchThumbnailImage = async (
  item: RRDPreviewItem,
  accessToken: string | null,
): Promise<PreviewImage | null> => {
  const itemId = item._internalId as string;
  if (imageCache.has(itemId + '_thumbnail')) {
    return imageCache.get(itemId + '_thumbnail') as PreviewImage;
  }

  const thumbnailHref = item.assets?.thumbnail?.href;
  if (thumbnailHref) {
    const formatted = prependBaseUrl(thumbnailHref);
    const blob = await fetchImageBlob(formatted, accessToken);
    if (blob) {
      const image = { url: URL.createObjectURL(blob), isFallback: false };
      imageCache.set(itemId + '_thumbnail', image);
      return image;
    }
  }

  return null;
};

const fetchHDImage = async (url: string, accessToken: string | null): Promise<string | null> => {
  const blob = await fetchImageBlob(url, accessToken);
  return blob ? URL.createObjectURL(blob) : null;
};

/**
 * Fetches the item's quicklook image, falling back to the provider/mission logo.
 * @returns `isFallback` is `true` only for the provider/mission logo branch. `null` when there
 * is no quicklook and no logo either.
 */
export const fetchPreviewImage = async (
  item: RRDPreviewItem,
  accessToken: string | null,
  imageType: string,
  isTasking: boolean,
): Promise<PreviewImage | null> => {
  const itemId = item._internalId as string;

  if (imageCache.has(itemId)) {
    return imageCache.get(itemId) as PreviewImage;
  }

  if (loadingStates.get(itemId)) {
    return null;
  }

  loadingStates.set(itemId, true);

  try {
    // 1. Try each valid quicklook asset in preference order (quicklook-png, then quicklook)
    for (const asset of getQuicklookAssets(item)) {
      const url = await fetchHDImage(asset.href as string, accessToken);
      if (url) {
        const image = { url, isFallback: false };
        imageCache.set(itemId, image);
        return image;
      }
    }

    // 2. Fallback to logo
    const fallbackLogo = getLogoForItem(item, imageType, isTasking);
    if (fallbackLogo) {
      const image = { url: fallbackLogo, isFallback: true };
      imageCache.set(itemId, image);
      return image;
    }

    return null;
  } catch (error) {
    console.error('Error in fetchPreviewImage:', error);
    return null;
  } finally {
    loadingStates.set(itemId, false);
  }
};
