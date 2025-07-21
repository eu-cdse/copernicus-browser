import React, { useMemo } from 'react';
import { ImageOverlay } from 'react-leaflet';
import L from 'leaflet';

const QuicklookOverlay = ({ quicklookOverlay, quicklookImages, internalId }) => {
  const blobUrl = quicklookImages[internalId];

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

  if (!quicklookOverlay || (!quicklookOverlay.bbox && !quicklookOverlay.geometry)) {
    return null;
  }

  return <>{blobUrl && bounds && <ImageOverlay url={blobUrl} bounds={bounds} opacity={1} zIndex={1200} />}</>;
};

export default QuicklookOverlay;
