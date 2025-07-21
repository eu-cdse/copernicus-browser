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
import { EDUCATION_THEMES } from './assets/education_themes.js';
import {
  DEM_COPERNICUS_30,
  DEM_COPERNICUS_90,
} from './Tools/SearchPanel/dataSourceHandlers/dataSourceConstants.js';

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
};

export const MODE_THEMES_LIST = 'mode';
export const URL_THEMES_LIST = 'url';
export const USER_INSTANCES_THEMES_LIST = 'user_instances';
export const RRD_INSTANCES_THEMES_LIST = 'RRD';

export const NO_THEME = 'no-theme-selected';

export const EDUCATION_MODE = {
  id: 'education',
  label: () => t`Education`,
  themes: EDUCATION_THEMES,
};

export const DEFAULT_MODE = {
  id: 'default',
  label: () => t`Normal`,
  themes: DEFAULT_THEMES, // TO-DO: do not show CCM for people without access
};

export const DEFAULT_THEME_ID = 'DEFAULT-THEME';

export const DEFAULT_LAT_LNG = {
  lat: 50.16282,
  lng: 20.78613,
};

export const DEFAULT_ZOOM = 5;

export const MODES = [DEFAULT_MODE];

export const EXPIRED_ACCOUNT = {
  instanceId: 'expired_account_dummy_instance_id',
  errorMessage: t`Your user instances could not be loaded as your Sentinel Hub account was not set up/expired. You can still use EO Browser but you will not be able to use personal user instances. To be able to set up personal user instances you can apply for a 30-days free trial or consider subscribing to one of the plans: `,
  errorLink: 'https://apps.sentinel-hub.com/dashboard/#/account/billing',
};

export const NOT_LOGGED_IN = {
  instanceId: 'not_logged_in_dummy_instance_id',
  errorMessage: () => t`Login to use custom configuration instances.`,
  errorLink: 'https://apps.sentinel-hub.com/dashboard/#/account/billing',
};

export const AOI_SHAPE = {
  polygon: 'Polygon',
  rectangle: 'Rectangle',
};

export const TRANSITION = {
  none: 'none',
  fade: 'fade',
};

export const EXPORT_FORMAT = {
  gif: 'GIF',
  mpeg4: 'MPEG4',
};

export const S1_DEFAULT_PARAMS = {
  polarization: Polarization.DV,
  acquisitionMode: AcquisitionMode.IW,
  resolution: Resolution.HIGH,
  orthorectification: DEMInstanceTypeOrthorectification.COPERNICUS,
  speckleFilter: { type: SpeckleFilterType.NONE },
  backscatterCoeff: BackscatterCoeff.GAMMA0_ELLIPSOID,
};

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

export const TABS = {
  VISUALIZE_TAB: 1,
  SEARCH_TAB: 2,
  RAPID_RESPONSE_DESK: 3,
  COMMERCIAL_TAB: 4,
};

export const DISABLED_ORTHORECTIFICATION = 'DISABLED';

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
  [DEMInstanceType.COPERNICUS_30]: DEM_COPERNICUS_30,
  [DEMInstanceType.COPERNICUS_90]: DEM_COPERNICUS_90,
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
  [MosaickingOrder.LEAST_CC]: () => t`Least cloud coverage`,
};

export const DEFAULT_DEM_SOURCE = DEMInstanceType.MAPZEN;

export const EQUATOR_LENGTH = 40075016.685578488;

export const DATASOURCES = {
  S1: 'Sentinel-1',
  S2: 'Sentinel-2',
  S2_CDAS: 'Sentinel-2 CDAS',
  S3: 'Sentinel-3',
  S3_CDAS: 'Sentinel-3 CDAS',
  S3_CDAS_L2: 'Sentinel-3 CDAS L2',
  S5: 'Sentinel-5P',
  S5_CDAS: 'Sentinel-5P CDAS',
  MODIS: 'MODIS',
  PROBAV: 'Proba-V',
  EOCLOUD_LANDSAT: 'LandsatEOCloud',
  AWS_LANDSAT8: 'Landsat8AWS',
  AWS_LANDSAT15: 'Landsat15AWS',
  AWS_LANDSAT45: 'Landsat45AWS',
  AWS_HLS: 'HLSAWS',
  ENVISAT_MERIS: 'Envisat Meris',
  AWS_LANDSAT7_ETM: 'Landsat7ETMAWS',
  GIBS: 'GIBS',
  DEM: 'DEM',
  DEM_CDAS: 'DEM CDAS',
  COPERNICUS_HRSI: 'Copernicus Snow & Ice',
  COPERNICUS_HRVPP: 'Copernicus Vegetation',
  PLANET_NICFI: 'Planet NICFI',
  CUSTOM: 'CUSTOM',
  OTHER: 'OTHER',
  MOSAIC: 'MOSAIC',
  S1_MOSAIC: 'Sentinel-1 Mosaic',
  GLOBAL_LAND_COVER: 'Global Land Cover',
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
  CCM: 'CCM',
};

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

export const DATAMASK_OUTPUT = 'dataMask';
export const EOBROWSERSTATS_OUTPUT = 'eobrowserStats';
export const ALL_BANDS_OUTPUT = 'bands';
export const STATISTICS_MANDATORY_OUTPUTS = [EOBROWSERSTATS_OUTPUT, DATAMASK_OUTPUT];

export const LOCAL_STORAGE_PRIVACY_CONSENT_KEY = 'eobrowser-privacy-consent';

export const TRANSACTION_TYPE = {
  ORDER: 'ORDER',
  SUBSCRIPTION: 'SUBSCRIPTION',
};

export const OrderType = {
  PRODUCTS: 'PRODUCTS',
  QUERY: 'QUERY',
};

export const FUNCTIONALITY_TEMPORARILY_UNAVAILABLE_MSG =
  'This functionality is temporarily unavailable due to updates. Please try again later.';

export const DEFAULT_CLOUD_COVER_PERCENT = 30;

export const BBOX_PADDING = 0.1;

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
export const MAX_CHARACTER_LIMIT_ERROR = {
  TYPE: 'InvalidMaxLength',
  MESSAGE: t`The evalscript you are using is too long and a short-URL cannot be generated.\n Please shorten your evalscript or save it to a website and use the “Load script from URL” functionality.`,
};

export const DATE_MODES = {
  SINGLE: {
    value: 'SINGLE',
    label: () => t`Single`,
  },
  MOSAIC: {
    value: 'MOSAIC',
    label: () => t`Mosaic`,
  },
  'TIME RANGE': {
    value: 'TIME RANGE',
    label: () => t`Time range`,
  },
};

export const SH_ACCOUNT_TYPE = {
  TRIAL: 11000,
  EXPLORATION: 12000,
  BASIC: 13000,
  ENTERPRISE: 14000,
  ENTERPRISE_S: 14001,
  ENTERPRISE_L: 14002,
};

export const SH_PAYING_ACCOUNT_TYPES = [
  SH_ACCOUNT_TYPE.EXPLORATION,
  SH_ACCOUNT_TYPE.BASIC,
  SH_ACCOUNT_TYPE.ENTERPRISE,
  SH_ACCOUNT_TYPE.ENTERPRISE_S,
  SH_ACCOUNT_TYPE.ENTERPRISE_L,
];

export const SHOW_TUTORIAL_LC = 'cdsebrowser_show_tutorial';
export const ADVANCED_SEARCH_CONFIG_SESSION_STORAGE_KEY = 'cdsebrowser_search_config';
