import React, { useRef, useState, useCallback } from 'react';
import LocationSearchBox from '../LocationSearchBox/LocationSearchBox';
import '@fortawesome/fontawesome-free/css/all.css';
import '@fortawesome/fontawesome-free/css/v4-shims.css';
import { withLeaflet } from 'react-leaflet';
import L from 'leaflet';
import store, { mainMapSlice } from '../store';
import { t } from 'ttag';
import { getBoundsZoomLevel } from '../utils/coords';
import proj4 from 'proj4';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
function SearchBox(props) {
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const ref = useRef();

  React.useEffect(() => {
    if (ref.current) {
      L.DomEvent.disableScrollPropagation(ref.current);
      L.DomEvent.disableClickPropagation(ref.current);
    }
  }, [ref]);

  const getCurrentZoom = useCallback(
    (bounds) => {
      const { minZoom, maxZoom } = props;
      let currentZoom = getBoundsZoomLevel(bounds);
      if (currentZoom < minZoom) {
        currentZoom = minZoom;
      }
      if (currentZoom > maxZoom) {
        currentZoom = maxZoom;
      }
      return currentZoom;
    },
    [props],
  );

  const setMapLocation = useCallback(
    (data) => {
      const { is3D, minZoom, maxZoom, zoom, onSelectLocationCallback } = props;
      const [lng, lat] = data.location;
      let currentZoom = zoom || 12;
      if (minZoom) {
        currentZoom = Math.max(currentZoom, minZoom);
      }
      if (maxZoom) {
        currentZoom = Math.min(currentZoom, maxZoom);
      }
      if (data.bounds) {
        currentZoom = getCurrentZoom(data.bounds);
      }
      store.dispatch(mainMapSlice.actions.setPosition({ lat, lng, zoom: currentZoom }));
      if (is3D) {
        const [x, y] = proj4('EPSG:4326', 'EPSG:3857', [lng, lat]);
        window.set3DLocation(x, y, currentZoom);
      }
      if (onSelectLocationCallback) {
        onSelectLocationCallback();
      }
    },
    [props, getCurrentZoom],
  );

  const handleClickOutside = useCallback(() => {
    setIsSearchVisible(false);
  }, []);
  useOnClickOutside(ref, handleClickOutside);

  const handleSearchClick = useCallback(() => {
    setIsSearchVisible((prev) => !prev);
  }, []);

  const { googleAPI, giscoAPI, is3D, className } = props;
  return (
    <div
      ref={ref}
      className={`search-box-wrapper ${isSearchVisible ? 'open' : 'close'}  ${
        is3D ? 'position-with-3d' : ''
      } ${className || ''}`}
    >
      <LocationSearchBox
        googleAPI={googleAPI}
        giscoAPI={giscoAPI}
        placeholder={t`Go to Place`}
        minChar={4}
        resultsShown={5}
        onSelect={setMapLocation}
        handleSearchClick={handleSearchClick}
        isSearchVisible={isSearchVisible}
      />
    </div>
  );
}

export default withLeaflet(SearchBox);
