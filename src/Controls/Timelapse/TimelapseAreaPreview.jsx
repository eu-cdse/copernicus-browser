import React, { useState, useEffect, useCallback, useRef } from 'react';
import { useMap, useMapEvents, Rectangle, Tooltip, Marker } from 'react-leaflet';
import L from 'leaflet';
import { t } from 'ttag';

import store, { modalSlice, timelapseSlice } from '../../store';
import { ModalId } from '../../const';

import './TimelapseAreaPreview.scss';
import { getTimelapseBounds } from './Timelapse.utils';

const TimelapseAreaPreview = ({ lat: initialLat, lng: initialLng, mapBounds: initialMapBounds }) => {
  const map = useMap();
  const isVisibleRef = useRef(false);
  const [lat, setLat] = useState(initialLat);
  const [lng, setLng] = useState(initialLng);
  const [mapBounds, setMapBounds] = useState(initialMapBounds);

  const handleGlobalClick = useCallback((event) => {
    const closeOnParentClasses = ['controls-wrapper', 'user-menu-button'];
    const foundElement = closeOnParentClasses.some((className) => event.target.closest(`.${className}`));
    if (isVisibleRef.current && foundElement) {
      isVisibleRef.current = false;
      store.dispatch(timelapseSlice.actions.setTimelapseAreaPreview(false));
    }
  }, []);

  useMapEvents({
    move: () => {
      const center = map.getCenter();
      setLat(center.lat);
      setLng(center.lng);
      setMapBounds(map.getBounds());
      map.fire('viewreset');
    },
  });

  useEffect(() => {
    document.addEventListener('click', handleGlobalClick);
    return () => {
      document.removeEventListener('click', handleGlobalClick);
    };
  }, [handleGlobalClick]);

  const startTimelapse = useCallback(() => {
    isVisibleRef.current = true;
    store.dispatch(modalSlice.actions.addModal({ modal: ModalId.TIMELAPSE }));
  }, []);

  return (
    <>
      <Rectangle bounds={getTimelapseBounds(mapBounds)} interactive={false}>
        <Marker
          eventHandlers={{ click: startTimelapse }}
          position={[lat, lng]}
          opacity={1}
          icon={L.divIcon({
            className: 'fas fa-play-circle timelapse-area-play-icon',
            iconAnchor: [20, 20],
          })}
        >
          <Tooltip className="timelapse-area-tooltip" permanent={true} opacity={1.0} direction={'center'}>
            <div className="timelapse-area-tooltip-content">{t`Create a timelapse of this area`}</div>
            <div className="timelapse-area-tooltip-content description">{t`To create a timelapse of a custom area, create AOI first`}</div>
          </Tooltip>
        </Marker>
      </Rectangle>
    </>
  );
};

export default TimelapseAreaPreview;
