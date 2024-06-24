import { useState, useEffect } from 'react';

import { Loader } from '@googlemaps/js-api-loader';

function GoogleAPIProvider({ children }) {
  const [googleAPI, setGoogleAPI] = useState(null);

  useEffect(() => {
    const loadGoogleApi = async () => {
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
    };

    loadGoogleApi();
    // eslint-disable-next-line
  }, []);

  return children({ googleAPI: googleAPI });
}

export default GoogleAPIProvider;
