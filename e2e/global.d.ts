// Mirrors the Window.API_ENDPOINT_CONFIG shape declared in src/env.d.ts and the
// runtime values set in public/config/config.js. Duplicated here (not imported)
// because e2e code cannot import app-internal src/ modules — see e2e/fixtures/helpers.ts.
// Keep both declarations in sync when the config shape changes.
interface Window {
  API_ENDPOINT_CONFIG?: {
    SH_SERVICES_URL: string;
    AUTH_BASEURL: string;
    OPENEO_BASEURL: string;
    VECTOR_DATA_BASEURL: string;
    STAC_BASEURL: string;
  };
  // Fathom analytics. Loaded as a deferred third-party script (index.html), so it is
  // absent until it loads and permanently absent when blocked by an ad blocker.
  fathom?: {
    trackEvent: (name: string, options?: { _value?: number }) => void;
  };
}
