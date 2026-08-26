import React, { useMemo, useState, useEffect } from 'react';
import { ImageOverlay, Marker } from 'react-leaflet';
import L from 'leaflet';

import ReactDOMServer from 'react-dom/server';
import Loader from '../../Loader/Loader';
import { fetchPreviewImage } from '../../Tools/RapidResponseDesk/sections/Results/ResultsCard/results.utils';
import { connect } from 'react-redux';
import type { RootState } from '../../hooks';
import type { QuicklookOverlay as QuicklookOverlayData } from '../../store/slices/mainMapSlice';
import type { UserState } from '../../store/slices/authSlice';

type Props = {
  quicklookOverlay: QuicklookOverlayData;
  quicklookImages: RootState['resultsSection']['quicklookImages'];
  user: UserState;
};

// react-leaflet's MarkerProps/ImageOverlayProps derive from leaflet's own MarkerOptions/ImageOverlayOptions,
// but this project has no @types/leaflet package, so tsc can't see leaflet-specific props like icon/opacity.
// See src/Map/plugins/externalWmsLeafletLayer.tsx for the same workaround.
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const MarkerAny = Marker as any;
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const ImageOverlayAny = ImageOverlay as any;

const QuicklookOverlay = ({ quicklookOverlay, quicklookImages, user }: Props) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState<string | null>(null);

  const bounds = useMemo(() => {
    if (!quicklookOverlay) {
      return null;
    }
    return quicklookOverlay.bbox
      ? L.latLngBounds(
          L.latLng(quicklookOverlay.bbox[1], quicklookOverlay.bbox[0]),
          L.latLng(quicklookOverlay.bbox[3], quicklookOverlay.bbox[2]),
        )
      : L.geoJSON(quicklookOverlay.geometry).getBounds();
  }, [quicklookOverlay]);

  const centerLatLng = useMemo(() => {
    if (!bounds) {
      return null;
    }
    return bounds.getCenter();
  }, [bounds]);

  useEffect(() => {
    const loadQuicklookImage = async () => {
      if (!quicklookOverlay) {
        return;
      }

      const { _internalId, imageUrl, imageType, isTaskingEnabled } = quicklookOverlay;

      // Check if the image is already loaded
      const cached = quicklookImages[_internalId];
      if (cached) {
        if (!cached.isFallback) {
          setImageUrl(cached.url);
        }
        return;
      }

      // Fetch the image if not already loaded
      if (!imageUrl) {
        setLoading(true);
        try {
          const fetchedImage = await fetchPreviewImage(
            quicklookOverlay,
            user.access_token,
            imageType as string,
            !!isTaskingEnabled,
          );
          if (fetchedImage && !fetchedImage.isFallback) {
            setImageUrl(fetchedImage.url);
          }
        } catch (error) {
          console.error('Error fetching quicklook image:', error);
        } finally {
          setLoading(false);
        }
      }
    };

    loadQuicklookImage();
  }, [quicklookOverlay, quicklookImages, user.access_token]);

  if (!quicklookOverlay || (!quicklookOverlay.bbox && !quicklookOverlay.geometry)) {
    return null;
  }

  const loaderIcon = L.divIcon({
    className: 'loader-marker-icon',
    iconSize: [48, 48],
    html: ReactDOMServer.renderToString(<Loader />),
  });

  return (
    <>
      {loading && centerLatLng && (
        <MarkerAny position={centerLatLng} icon={loaderIcon} interactive={false} zIndexOffset={2000} />
      )}
      {!loading && imageUrl && bounds && (
        <ImageOverlayAny url={imageUrl} bounds={bounds} opacity={1} zIndex={1200} />
      )}
    </>
  );
};

const mapStoreToProps = (store: RootState) => ({
  user: store.auth.user,
  quicklookImages: store.resultsSection.quicklookImages,
});

export default connect(mapStoreToProps, null)(QuicklookOverlay);
