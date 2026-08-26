/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_CDSE_BACKEND: string;
  readonly VITE_ROOT_URL: string;
  readonly VITE_GOOGLE_API_KEY: string;
  readonly VITE_MAPBOX_API_KEY: string;
  readonly VITE_SH_CLIENT_ID: string;
  readonly VITE_SH_DOMAIN_VALIDATION_URL: string;
  readonly VITE_JIRA_DOMAIN: string;
  readonly VITE_JIRA_PROJECT_KEY: string;
  readonly VITE_ANALYTICS_ENABLED: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}

// vite-plugin-svgr: `import Icon from './icon.svg?react'` returns a React component.
declare module '*.svg?react' {
  import * as React from 'react';
  const ReactComponent: React.FunctionComponent<React.SVGProps<SVGSVGElement> & { title?: string }>;
  export default ReactComponent;
}

// Mirrored in e2e/global.d.ts (e2e cannot import app-internal src/ modules) — keep both in sync.
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
