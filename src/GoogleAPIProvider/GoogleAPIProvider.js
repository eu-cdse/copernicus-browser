import { useState, useRef } from 'react';
import { t } from 'ttag';

import { Loader } from '@googlemaps/js-api-loader';

import store, { notificationSlice } from '../store';

export const isGoogleApiConfigured = Boolean(import.meta.env.VITE_GOOGLE_TOKEN);

function GoogleAPIProvider({ children }) {
  const [googleAPI, setGoogleAPI] = useState(null);
  const [isGoogleApiLoading, setIsGoogleApiLoading] = useState(false);
  const loadStartedRef = useRef(false);

  const loadGoogleApi = async () => {
    if (loadStartedRef.current) {
      return;
    }
    loadStartedRef.current = true;
    setIsGoogleApiLoading(true);

    try {
      const loader = new Loader({
        apiKey: import.meta.env.VITE_GOOGLE_TOKEN,
        libraries: ['geocoding', 'places'],
      });
      const [placesLibrary, geocodingLibrary] = await Promise.all([
        loader.importLibrary('places'),
        loader.importLibrary('geocoding'),
      ]);
      const { AutocompleteService } = placesLibrary;
      const { Geocoder, GeocoderStatus } = geocodingLibrary;

      setGoogleAPI({
        maps: {
          places: { AutocompleteService: AutocompleteService },
          Geocoder: Geocoder,
          GeocoderStatus: GeocoderStatus,
        },
      });
    } catch (e) {
      console.error('Failed to load Google Maps API', e);
      store.dispatch(
        notificationSlice.actions.displayError(t`Failed to load Google Maps. Please try again.`),
      );
      loadStartedRef.current = false;
    } finally {
      setIsGoogleApiLoading(false);
    }
  };

  return children({
    googleAPI: googleAPI,
    loadGoogleApi: loadGoogleApi,
    isGoogleApiLoading: isGoogleApiLoading,
  });
}

export default GoogleAPIProvider;
