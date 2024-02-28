import { useState, useEffect } from 'react';

import { Loader } from '@googlemaps/js-api-loader';

function GoogleAPIProvider({ children }) {
  const [googleAPI, setGoogleAPI] = useState(null);

  useEffect(() => {
    const loader = new Loader({ apiKey: process.env.REACT_APP_GOOGLE_TOKEN, libraries: ['places'] });
    loader.load().then((g) => {
      setGoogleAPI(g);
    });
    // eslint-disable-next-line
  }, []);

  return children({ googleAPI: googleAPI });
}

export default GoogleAPIProvider;
