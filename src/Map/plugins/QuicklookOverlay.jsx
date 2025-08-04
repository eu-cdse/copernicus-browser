import React, { useMemo, useState, useEffect } from 'react';
import { ImageOverlay, Marker } from 'react-leaflet';
import L from 'leaflet';

import ReactDOMServer from 'react-dom/server';
import Loader from '../../Loader/Loader';
import { fetchPreviewImage } from '../../Tools/RapidResponseDesk/sections/Results/ResultsCard/results.utils';
import { connect } from 'react-redux';

const QuicklookOverlay = ({ quicklookOverlay, quicklookImages, user }) => {
  const [loading, setLoading] = useState(false);
  const [imageUrl, setImageUrl] = useState(null);

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
      if (quicklookImages[_internalId]) {
        setImageUrl(quicklookImages[_internalId]);
        return;
      }

      // Fetch the image if not already loaded
      if (!imageUrl) {
        setLoading(true);
        try {
          const fetchedImageUrl = await fetchPreviewImage(
            quicklookOverlay,
            user.access_token,
            imageType,
            isTaskingEnabled,
          );
          if (fetchedImageUrl) {
            setImageUrl(fetchedImageUrl);
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
        <Marker position={centerLatLng} icon={loaderIcon} interactive={false} zIndexOffset={2000} />
      )}
      {!loading && imageUrl && bounds && (
        <ImageOverlay url={imageUrl} bounds={bounds} opacity={1} zIndex={1200} />
      )}
    </>
  );
};

const mapStoreToProps = (store) => ({
  user: store.auth.user,
});

export default connect(mapStoreToProps, null)(QuicklookOverlay);
