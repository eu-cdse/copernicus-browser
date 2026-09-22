import {
  Polarization,
  AcquisitionMode,
  Resolution,
  CacheTarget,
  SpeckleFilterType,
  DEMInstanceTypeOrthorectification,
  BackscatterCoeff,
  DEMInstanceType,
  MosaickingOrder,
} from '@sentinel-hub/sentinelhub-js';
import { t } from 'ttag';

import { DEFAULT_THEMES } from './assets/default_themes.js';
import {
  DEM_COPERNICUS_30_CDAS,
  DEM_COPERNICUS_90_CDAS,
} from './Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

// --- Modals ---

export const ModalId = {
  ELEVATION_PROFILE: 'ElevationProfile',
  IMG_DOWNLOAD: 'ImgDownload',
  TIMELAPSE: 'Timelapse',
  FIS: 'FIS',
  SHAREPINSLINK: 'SharePinsLink',
  PINS_STORY_BUILDER: 'PinsStoryBuilder',
  TERRAIN_VIEWER: 'TerrainViewer',
  PRIVATE_THEMEID_LOGIN: 'PrivateThemeIdLogin',
  TERMS_AND_PRIVACY_CONSENT: 'TermsAndPrivacy',
  PRODUCT_DETAILS: 'ProductDetails',
  SPECTRAL_EXPLORER: 'SpectralExplorer',
  BROWSE_PRODUCT: 'BrowseProduct',
  RRD_PRODUCT_DETAILS: 'RRDProductDetails',
  FEATURE_INFO: 'FeatureInfo',
} as const;

// --- Themes & modes ---

export const MODE_THEMES_LIST = 'mode';
export const URL_THEMES_LIST = 'url';
export const USER_INSTANCES_THEMES_LIST = 'user_instances';
export const RRD_INSTANCES_THEMES_LIST = 'RRD';

export const NO_THEME = 'no-theme-selected';

export const DEFAULT_MODE = {
  id: 'default',
  label: () => t`Normal`,
  themes: DEFAULT_THEMES, // TO-DO: do not show CCM for people without access
};

export const DEFAULT_THEME_ID = 'DEFAULT-THEME';

// --- Map defaults ---

export const DEFAULT_LAT_LNG = {
  lat: 50.16282,
  lng: 20.78613,
};

export const DEFAULT_ZOOM = 5;

export const MODES = [DEFAULT_MODE];

export const EXPIRED_ACCOUNT = {
  instanceId: 'expired_account_dummy_instance_id',
  errorMessage: t`Your user instances could not be loaded as your Sentinel Hub account was not set up/expired. You can still use Copernicus Browser but you will not be able to use personal user instances. To be able to set up personal user instances you can apply for a 30-days free trial or consider subscribing to one of the plans: `,
  errorLink: 'https://shapps.dataspace.copernicus.eu/dashboard/#/',
};

export const NOT_LOGGED_IN = {
  instanceId: 'not_logged_in_dummy_instance_id',
  errorMessage: () => t`Login to use custom configuration instances.`,
  errorLink: 'https://shapps.dataspace.copernicus.eu/dashboard/#/',
};

// --- AOI ---

export const AOI_SHAPE = {
  polygon: 'Polygon',
  rectangle: 'Rectangle',
};

// --- Timelapse / export ---

export const TRANSITION = {
  none: 'none',
  fade: 'fade',
};

export const EXPORT_FORMAT = {
  gif: 'GIF',
  mpeg4: 'MPEG4',
};

// --- Sentinel-1 defaults ---

export const S1_DEFAULT_PARAMS = {
  polarization: Polarization.DV,
  acquisitionMode: AcquisitionMode.IW,
  resolution: Resolution.HIGH,
  orthorectification: DEMInstanceTypeOrthorectification.COPERNICUS,
  speckleFilter: { type: SpeckleFilterType.NONE },
  backscatterCoeff: BackscatterCoeff.GAMMA0_ELLIPSOID,
};

// --- Sentinel Hub request config ---

export const reqConfigMemoryCache = {
  cache: {
    expiresIn: Number.POSITIVE_INFINITY,
    targets: [CacheTarget.MEMORY],
  },
};

export const reqConfigGetMap = {
  cache: {
    expiresIn: 86400,
  },
};

export const MAX_SH_IMAGE_SIZE = 2500; // SH services have a limit for a max image size of 2500px*2500px

// --- Tabs ---

export const TABS = {
  VISUALIZE_TAB: 1,
  SEARCH_TAB: 2,
  RAPID_RESPONSE_DESK: 3,
} as const;

// --- Panels ---
// Sub-views within the Visualize tab (VisualizationPanel.jsx), independent of TABS above.
// COMPARE is included here so call sites can reference PANEL.COMPARE instead of a raw 'compare'
// string, but it's deliberately excluded from parsePanelParam's whitelist below: it can't be
// restored from a flat string like PANEL's other values, it needs the richer `compareShare` URL
// param (layers, mode, opacity) — see URLParamsParser.js and issue #1264.
// LAYERS is written explicitly (not left as an implicit/absent default) so a refresh can tell
// "the user was deliberately on Layers" apart from "no panel info at all" — see
// ThemeSelect.jsx's mount-time highlightsAvailable effect, which only auto-picks a panel in the
// latter case.
export const PANEL = {
  LAYERS: 'layers',
  HIGHLIGHTS: 'highlights',
  PINS: 'pins',
  WMS: 'wms',
  COMPARE: 'compare',
} as const;

// Whitelist for the `panel` URL param: any other value (including undefined) is not a known
// panel, so callers fall back to their own default (panelSlice's initialState opens Layers).
// COMPARE is deliberately excluded — see the comment on PANEL above.
export const parsePanelParam = (
  value: unknown,
): Exclude<(typeof PANEL)[keyof typeof PANEL], typeof PANEL.COMPARE> | undefined => {
  const panelValues: string[] = [PANEL.LAYERS, PANEL.HIGHLIGHTS, PANEL.PINS, PANEL.WMS];
  return typeof value === 'string' && panelValues.includes(value)
    ? (value as Exclude<(typeof PANEL)[keyof typeof PANEL], typeof PANEL.COMPARE>)
    : undefined;
};

export const DISABLED_ORTHORECTIFICATION = 'DISABLED';

// --- DEM / 3D ---

export const ORTHORECTIFICATION_OPTIONS = {
  [DISABLED_ORTHORECTIFICATION]: t`Disabled`,
  [DEMInstanceTypeOrthorectification.COPERNICUS]: t`Yes` + ' (Copernicus 10/30m DEM)',
  [DEMInstanceTypeOrthorectification.COPERNICUS_30]: t`Yes` + ' (Copernicus 30m DEM)',
  [DEMInstanceTypeOrthorectification.COPERNICUS_90]: t`Yes` + ' (Copernicus 90m DEM)',
};

export const BACK_COEF_OPTIONS = {
  [BackscatterCoeff.BETA0]: BackscatterCoeff.BETA0,
  [BackscatterCoeff.GAMMA0_ELLIPSOID]: BackscatterCoeff.GAMMA0_ELLIPSOID,
  [BackscatterCoeff.GAMMA0_TERRAIN]: BackscatterCoeff.GAMMA0_TERRAIN,
  [BackscatterCoeff.SIGMA0_ELLIPSOID]: BackscatterCoeff.SIGMA0_ELLIPSOID,
};

export const DEM_3D_SOURCES = {
  [DEMInstanceType.MAPZEN]: 'Mapzen DEM',
  NASA_ASTER_GDEM: 'NASA ASTER GDEM',
  [DEMInstanceType.COPERNICUS_30]: 'Copernicus 30m DEM',
  [DEMInstanceType.COPERNICUS_90]: 'Copernicus 90m DEM',
};

export const DEM_3D_CUSTOM_TO_DATASOURCE = {
  [DEMInstanceType.COPERNICUS_30]: DEM_COPERNICUS_30_CDAS,
  [DEMInstanceType.COPERNICUS_90]: DEM_COPERNICUS_90_CDAS,
};

export const DEM_3D_MAX_ZOOM = {
  [DEMInstanceType.MAPZEN]: 18,
  NASA_ASTER_GDEM: 18,
  [DEMInstanceType.COPERNICUS_30]: 14,
  [DEMInstanceType.COPERNICUS_90]: 14,
};

export const MOSAICKING_ORDER_OPTIONS = {
  [MosaickingOrder.MOST_RECENT]: () => t`Most recent`,
  [MosaickingOrder.LEAST_RECENT]: () => t`Least recent`,
};

export const DEFAULT_DEM_SOURCE = DEMInstanceType.MAPZEN;

export const EQUATOR_LENGTH = 40075016.685578488;

// --- Datasources ---

export const DATASOURCES = {
  S1: 'Sentinel-1',
  S2_CDAS: 'Sentinel-2 CDAS',
  S3_CDAS: 'Sentinel-3 CDAS',
  S3_CDAS_L2: 'Sentinel-3 CDAS L2',
  S5_CDAS: 'Sentinel-5P CDAS',
  LANDSAT_8_9_CDAS: 'Landsat 8-9 CDAS',
  LANDSAT_MOSAIC: 'Landsat Mosaics',
  COMPLEMENTARY_DATA: 'Complementary Data',
  DEM_CDAS: 'DEM CDAS',
  CUSTOM: 'CUSTOM',
  OTHER: 'OTHER',
  MOSAIC: 'MOSAIC',
  S1_MOSAIC: 'Sentinel-1 Mosaic',
  RRD_EUSI: 'EUSI',
  RRD_AIRBUS_DE: 'Airbus DE',
  RRD_AIRBUS_FE_SPOT: 'Airbus FE Spot',
  RRD_AIRBUS_FE_PLEIADAS: 'Airbus FE Pleiades 1A/B',
  RRD_AIRBUS_FE_PLEIADAS_NEO: 'Airbus FE Pleiades NEO',
  RRD_GEOSAT: 'GEOSAT',
  RRD_SKYMED_1: 'SkyMed Gen 1',
  RRD_SKYMED_2: 'SkyMed Gen 2',
  RRD_PLANET_SCOPE: 'PlanetScope',
  RRD_SKYSAT: 'SkySat',
  RRD_RADARSAT2: 'RADARSAT-2',
  RRD_PAZ: 'PAZ',
  RRD_ICEYE: 'ICEYE',
  RRD_GHGSAT: 'GHGSat',
  CLMS: 'CLMS',
  CLMS_VECTOR: 'CLMS Vector',
  CCM: 'CCM',
  EVOLAND: 'EVOLAND',
  EXTERNAL_WMS: 'EXTERNAL_WMS',
} as const;

// Placeholder value for the non-selectable hint appended to the Data collections dropdown when a
// curated configuration is active (issue #1221). It occupies the same `value` slot as the datasource
// and dataset ids above, so it is deliberately shaped so it can never collide with a real one —
// same reasoning as the NOT_LOGGED_IN / EXPIRED_ACCOUNT instance id placeholders.
export const ALL_COLLECTIONS_HINT_VALUE = 'all_collections_hint_dummy_option_value';

// --- Visualization effects ---

export const defaultEffects = {
  gainEffect: 1,
  gammaEffect: 1,
  redRangeEffect: [0, 1],
  greenRangeEffect: [0, 1],
  blueRangeEffect: [0, 1],
  minQa: 50,
  upsampling: '',
  downsampling: '',
  speckleFilter: '',
  orthorectification: '',
  demSource3D: DEMInstanceType.MAPZEN,
  mosaickingOrder: '',
};

// --- Evalscript outputs ---

export const DATAMASK_OUTPUT = 'dataMask';
export const EOBROWSERSTATS_OUTPUT = 'eobrowserStats'; // deprecated but preserved for backward compatibility of old evalscripts that use it
export const BROWSERSTATS_OUTPUT = 'browserStats'; // new name for eobrowserStats, should be used in new evalscripts
export const ALL_BANDS_OUTPUT = 'bands';
export const STATISTICS_MANDATORY_OUTPUTS: (string | string[])[] = [
  [BROWSERSTATS_OUTPUT, EOBROWSERSTATS_OUTPUT],
  DATAMASK_OUTPUT,
];

// --- Local storage & session keys ---

export const LOCAL_STORAGE_PRIVACY_CONSENT_KEY = 'eobrowser-privacy-consent';

export const PROCESSING_OPTIONS = {
  OPENEO: 'OpenEO',
  PROCESS_API: 'Process API',
};

export const FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG =
  'This functionality is temporarily unavailable due to updates. Please try again later.';

export const DEFAULT_CLOUD_COVER_PERCENT = 30;

export const BBOX_PADDING = 0.1;

// --- Compare ---

export const COMPARE_OPTIONS = {
  COMPARE_SPLIT: {
    value: 'split',
    label: () => t`Split`,
  },
  COMPARE_OPACITY: {
    value: 'opacity',
    label: () => t`Opacity`,
  },
};

export const MIN_SCREEN_HEIGHT_FOR_DATE_AND_COLLECTION_PANEL = 1080;

export const CDSE_GITHUB_PAGE_LINK = 'https://github.com/eu-cdse/copernicus-browser#multilanguage-support';

export const HTTPS = 'https://';

// --- URL & sharing ---

export const MAX_URL_LENGTH_FOR_SHORTENING = 2048;
export const MAX_CHARACTER_LIMIT_ERROR = {
  TYPE: 'InvalidMaxLength',
  MESSAGE: t`The evalscript you are using is too long and a short-URL cannot be generated.\n Please shorten your evalscript or save it to a website and use the “Load script from URL” functionality.`,
};

export const MAX_CHARACTER_LIMIT_PROCESS_GRAPH_ERROR = {
  TYPE: 'InvalidMaxLength',
  MESSAGE: t`The process graph you are using is too long and a short-URL cannot be generated.\n Please simplify your process graph to reduce the URL length.`,
};

// --- Search & date ---

export const DATE_MODES = {
  SINGLE: {
    value: 'SINGLE',
    label: () => t`Single`,
    description: () => t`Single Date`,
  },
  MOSAIC: {
    value: 'MOSAIC',
    label: () => t`Mosaic`,
    description: () => t`Mosaic`,
  },
  'TIME RANGE': {
    value: 'TIME RANGE',
    label: () => t`Time Range`,
    description: () => t`Time Range`,
  },
};

// --- Auth & account ---

export const UPDATE_BEFORE_EXPIRY_USER_TOKEN = 3 * 60 * 1000; //minutes*seconds*miliseconds
export const UPDATE_BEFORE_EXPIRY_ANON_TOKEN = 10 * 1000; //seconds*miliseconds
export const MAX_NUM_ANON_TOKEN_REQUESTS = 1;

// --- Misc ---

export const SHOW_TUTORIAL_LC = 'cdsebrowser_show_tutorial';
// Re-exported from the dependency-free storage-keys module so the e2e fixtures
// can share the exact same value without importing this heavy module.
export { ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY } from './constants/storageKeys';
export const DEFAULT_HASHTAGS = 'EarthObservation,RemoteSensing';
export const LOCAL_STORAGE_RECAPTCHA_CONSENT_KEY = 'cdsebrowser_recaptcha_consent';
export const LOCAL_STORAGE_SHARED_LINKS = 'cdsebrowser_shared_links';
export const LOCAL_STORAGE_ANON_AUTH_KEY = 'cdsebrowser_anon_auth';
export const OSM_BACKGROUND_NAME = 'osm-background';
export const STICKER_URL_PARAM_VALUE = 'active';
export const SELECTED_BASE_LAYER_KEY = 'selectedBaseLayerId';

// --- Analytics ---

// Fathom event names. Values appended by handleFathomTrackEvent as `${event}: ${value}`,
// which lines up with Fathom's wildcard grouping (e.g. "External service added: *").
// Naming mirrors EO Browser's FATHOM_TRACK_EVENT_LIST so both dashboards stay comparable.
export const FATHOM_TRACK_EVENT_LIST = {
  EXTERNAL_LAYERS_PANEL_BUTTON: 'External layers panel button clicked',
  EXTERNAL_SERVICE_ADDED: 'External service added',
  EXTERNAL_SERVICE_ADD_FAILED: 'External service add failed',
  EXTERNAL_LAYER_SELECTED: 'External layer selected',
  EXTERNAL_LAYER_ADD_TO_PINS: 'External layer added to Pins',
  EXTERNAL_LAYER_ADD_TO_COMPARE: 'External layer added to Compare',
};

export const XmlParserOptions = Object.freeze({
  attributesGroupName: '$',
  attributeNamePrefix: '',
  textNodeName: '_',
  ignoreAttributes: false,
  isArray: (name, jpath, isLeafNode, isAttribute) => {
    const isA = !isAttribute && !['Capabilities', 'WMS_Capabilities', 'WMT_MS_Capabilities'].includes(name);
    return isA;
  },
});
