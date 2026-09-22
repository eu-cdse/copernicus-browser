import { AttributeNames } from '../../api/OData/assets/attributes';
import { formatByteSizeAuto } from '../../utils/formatByteSize';

export interface StacAsset {
  href?: string;
  type?: string;
  'file:size'?: number;
  [key: string]: unknown;
}

export interface StacLink {
  rel?: string;
  href?: string;
  type?: string;
  body?: { token?: string };
}

export interface StacProperties {
  title?: string;
  datetime?: string;
  start_datetime?: string;
  constellation?: string;
  platform?: string;
  instruments?: string[];
  instrument?: string;
  'product:type'?: string;
  'processing:level'?: string;
  'sar:polarizations'?: string | string[];
  'sar:mode'?: string;
  'sat:orbit_state'?: string;
  'eo:cloud_cover'?: number;
  'proj:code'?: string;
  gsd?: number;
  updated?: string;
  created?: string;
  published?: string;
  [key: string]: unknown;
}

// Loosely typed (rather than the strict 'geojson' Geometry union) since geometry is only ever
// passed through untouched here, and callers construct fixtures without GeoJSON literal typing.
export interface StacGeometry {
  type: string;
  coordinates: unknown;
  [key: string]: unknown;
}

export interface StacFeature {
  type?: string;
  stac_version?: string;
  id: string;
  collection?: string;
  geometry?: StacGeometry;
  properties?: StacProperties;
  assets?: Record<string, StacAsset>;
  links?: StacLink[];
  [key: string]: unknown;
}

export interface NormalizedAttribute {
  Name: string;
  Value: string | number;
}

export interface NormalizedSTACResult extends StacFeature {
  id: string;
  oDataProductId: string | null;
  name: string;
  sensingTime: string | undefined;
  platformShortName: string | undefined;
  instrumentShortName: string | undefined;
  productType: string | undefined;
  modificationDate: string | undefined;
  originDate: string | undefined;
  publicationDate: string | undefined;
  size: string;
  contentLength: number;
  S3Path: string | null;
  online: boolean;
  previewUrl: string | null;
  attributes: NormalizedAttribute[];
}

export const ResultType = {
  ODATA: 'odata',
  STAC: 'stac',
} as const;

export type ResultTypeValue = (typeof ResultType)[keyof typeof ResultType];

/**
 * Determines if a tile/result is from OData or STAC API
 */
export const getResultType = (tile: unknown): ResultTypeValue => {
  const candidate = tile as { attributes?: unknown; properties?: unknown } | null | undefined;
  // OData results have an 'attributes' array
  if (candidate && Array.isArray(candidate.attributes)) {
    return ResultType.ODATA;
  }
  // STAC results have a 'properties' object and potentially 'assets'
  if (candidate && candidate.properties && typeof candidate.properties === 'object') {
    return ResultType.STAC;
  }
  // Fallback to odata for backward compatibility
  return ResultType.ODATA;
};

interface StacToODataMappingConfig {
  attributeName: string;
  transform: (value: unknown) => string | number;
}

/**
 * Mapping configuration for STAC to OData property transformation
 */
const stacToODataMapping: Record<string, StacToODataMappingConfig> = {
  // Platform/Constellation mappings
  constellation: {
    attributeName: 'platformShortName',
    transform: (value) => String(value).toUpperCase(),
  },
  platform: {
    attributeName: 'platformShortName',
    transform: (value) => String(value).toUpperCase(),
  },
  // Instrument mappings
  instruments: {
    attributeName: 'instrumentShortName',
    transform: (value) =>
      Array.isArray(value) ? value.join(', ').toUpperCase() : String(value).toUpperCase(),
  },
  instrument: {
    attributeName: 'instrumentShortName',
    transform: (value) => String(value).toUpperCase(),
  },
  // Product type mappings
  'product:type': {
    attributeName: 'productType',
    transform: (value) => value as string,
  },
  'processing:level': {
    attributeName: 'productType',
    transform: (value) => value as string,
  },
  // SAR-specific mappings
  'sar:polarizations': {
    attributeName: 'polarisationChannels',
    transform: (value) => (Array.isArray(value) ? value.join(', ') : (value as string)),
  },
  'sar:mode': {
    attributeName: 'operationalMode',
    transform: (value) => value as string,
  },
  // Orbit direction
  'sat:orbit_state': {
    attributeName: 'orbitDirection',
    transform: (value) => value as string,
  },
  // Cloud cover
  'eo:cloud_cover': {
    attributeName: 'cloudCover',
    transform: (value) => value as number,
  },
  // Projection
  'proj:code': {
    attributeName: 'projection',
    transform: (value) => value as string,
  },
  // Ground sample distance
  gsd: {
    attributeName: 'gsd',
    transform: (value) => `${value} m`,
  },
  // Nominal date
  datetime: {
    attributeName: 'nominalDate',
    transform: (value) => value as string,
  },
};

/**
 * Maps STAC properties to OData attributes using the mapping configuration
 */
const mapSTACPropertiesToAttributes = (
  properties: StacProperties,
  stacResult: StacFeature,
): NormalizedAttribute[] => {
  const attributes: NormalizedAttribute[] = [];

  // Process mapped properties
  Object.entries(stacToODataMapping).forEach(([stacKey, config]) => {
    if (properties[stacKey] !== undefined) {
      const attributeName =
        (AttributeNames as Record<string, string>)[config.attributeName] || config.attributeName;
      const transformedValue = config.transform(properties[stacKey]);

      attributes.push({
        Name: attributeName,
        Value: transformedValue,
      });
    }
  });

  // Handle special cases not in the main mapping

  // File Format (from assets)
  const fileFormat = extractFormatFromAssets(stacResult.assets);
  if (fileFormat) {
    attributes.push({
      Name: AttributeNames.fileFormat,
      Value: fileFormat,
    });
  }

  // Collection name
  if (stacResult.collection) {
    attributes.push({
      Name: 'collectionName',
      Value: stacResult.collection,
    });
  }

  return attributes;
};

interface MainSTACProperties {
  name: string | undefined;
  sensingTime: string | undefined;
  platformShortName: string | undefined;
  instrumentShortName: string | undefined;
  productType: string | undefined;
  modificationDate: string | undefined;
  originDate: string | undefined;
  publicationDate: string | undefined;
}

/**
 * Extracts main properties from STAC using priority-based mapping
 */
const extractMainPropertiesFromSTAC = (properties: StacProperties): MainSTACProperties => {
  return {
    name: properties.title,
    sensingTime: properties.datetime || properties.start_datetime,
    platformShortName: properties.constellation?.toUpperCase() || properties.platform?.toUpperCase(),
    instrumentShortName: properties.instruments?.[0]?.toUpperCase() || properties.instrument?.toUpperCase(),
    productType: properties['product:type'] || properties['processing:level'],
    modificationDate: properties.updated,
    originDate: properties.created,
    publicationDate: properties.published || properties.created,
  };
};

/**
 * Converts STAC result to OData-like format for unified handling
 */
export const normalizeSTACResult = (stacResult: StacFeature): NormalizedSTACResult | StacFeature => {
  const { properties, assets, geometry, id } = stacResult;

  if (!properties) {
    return stacResult; // Return as-is if no properties
  }

  // Map STAC properties to OData attributes using the mapping configuration
  const attributes = mapSTACPropertiesToAttributes(properties, stacResult);

  // Extract main properties using the mapping
  const mainProperties = extractMainPropertiesFromSTAC(properties);

  // Extract S3 path from the enclosure link
  const s3Path = extractS3PathFromLinks(stacResult.links);

  // Calculate size from assets
  const totalSize = calculateTotalSizeFromAssets(assets);

  // Extract OData UUID from assets so OData API calls use the correct identifier
  const oDataProductId = extractODataIdFromAssets(assets);

  // Extract the quicklook image URL so the results list and product info can show a preview
  const previewUrl = getPreviewUrlFromAssets(assets);

  return {
    ...stacResult,
    // OData-like properties
    id: id,
    oDataProductId: oDataProductId,
    name: mainProperties.name || id,
    sensingTime: mainProperties.sensingTime,
    platformShortName: mainProperties.platformShortName,
    instrumentShortName: mainProperties.instrumentShortName,
    productType: mainProperties.productType,
    modificationDate: mainProperties.modificationDate,
    originDate: mainProperties.originDate,
    publicationDate: mainProperties.publicationDate,
    size: formatByteSizeAuto(totalSize),
    contentLength: totalSize,
    S3Path: s3Path,
    online: true, // STAC results are typically online
    previewUrl: previewUrl,
    geometry: geometry,
    attributes: attributes,
    // Keep original STAC properties for backward compatibility
    properties: properties,
    assets: assets,
  };
};

/**
 * Normalizes any result (OData or STAC) to a unified format
 */
export const normalizeResult = (result: unknown): unknown => {
  const resultType = getResultType(result);

  if (resultType === ResultType.STAC) {
    return normalizeSTACResult(result as StacFeature);
  }

  // OData results are already in the expected format
  return result;
};

/**
 * Normalizes an array of results (mixed OData and STAC)
 */
export const normalizeResults = (results: unknown): unknown[] => {
  if (!Array.isArray(results)) {
    return [];
  }

  return results.map(normalizeResult);
};

/**
 * Extracts platform short name from normalized tile
 */
export const getPlatformShortName = (tile: { platformShortName?: string }): string => {
  return tile.platformShortName || 'UNKNOWN';
};

const MIME_TO_FORMAT: Record<string, string> = {
  'application/zip': 'ZIP',
  'image/tiff': 'TIFF',
  'image/jpeg': 'JPEG',
  'image/png': 'PNG',
  'application/x-netcdf': 'NetCDF',
  'application/x-hdf': 'HDF',
};

/**
 * Looks up a STAC asset by key, case-insensitively.
 *
 * The STAC spec does not fix the casing of asset keys and CDSE collections disagree: the
 * Landsat mosaics expose the product archive as `product`, while the Sentinel Global Mosaics
 * expose it as `Product`. An exact-match lookup silently returns undefined for the latter,
 * which would drop the OData product id, the file format and the product size from results.
 */
const findAssetByKey = (
  assets: Record<string, StacAsset> | null | undefined,
  key: string,
): StacAsset | undefined => {
  if (!assets || typeof assets !== 'object') {
    return undefined;
  }
  if (assets[key]) {
    return assets[key];
  }
  const lowerCaseKey = key.toLowerCase();
  const matchingKey = Object.keys(assets).find((assetKey) => assetKey.toLowerCase() === lowerCaseKey);
  return matchingKey ? assets[matchingKey] : undefined;
};

/**
 * Extracts file format from STAC assets
 */
const extractFormatFromAssets = (assets: Record<string, StacAsset> | undefined): string | null => {
  if (!assets || typeof assets !== 'object') {
    return null;
  }

  // Prefer the 'product' asset first, consistent with calculateTotalSizeFromAssets and
  // getDownloadUrlFromAssets - otherwise asset key order (e.g. per-band assets listed
  // before the product archive) can produce the wrong format.
  const productAsset = findAssetByKey(assets, 'product');
  const otherAssets = Object.entries(assets).filter(([, asset]) => asset !== productAsset);
  const orderedAssets = productAsset ? [['product', productAsset] as const, ...otherAssets] : otherAssets;

  for (const [, asset] of orderedAssets) {
    if (asset.type) {
      if (MIME_TO_FORMAT[asset.type]) {
        return MIME_TO_FORMAT[asset.type];
      }
    }

    // Fallback to file extension
    if (asset.href) {
      const extension = asset.href.split('.').pop()?.toUpperCase();
      if (extension) {
        return extension;
      }
    }
  }

  return null;
};

/**
 * Extracts the S3 directory path from STAC links (rel=enclosure, application/x-directory)
 */
const extractS3PathFromLinks = (links: StacLink[] | undefined): string | null => {
  if (!Array.isArray(links)) {
    return null;
  }
  const enclosure = links.find((link) => link.rel === 'enclosure' && link.type === 'application/x-directory');
  return enclosure?.href ?? null;
};

/**
 * Calculates total size from STAC assets
 */
const calculateTotalSizeFromAssets = (assets: Record<string, StacAsset> | undefined): number => {
  if (!assets || typeof assets !== 'object') {
    return 0;
  }

  const productAsset = findAssetByKey(assets, 'product');
  if (productAsset?.['file:size']) {
    return productAsset['file:size'] as number;
  }

  let totalSize = 0;
  for (const [, asset] of Object.entries(assets)) {
    if (asset['file:size'] && typeof asset['file:size'] === 'number') {
      totalSize += asset['file:size'];
    }
  }

  return totalSize;
};

/**
 * Extracts the OData product UUID from STAC assets.
 * Looks for a URL of the form `.../Products(<uuid>)/$value` in assets.product.href.
 */
export const extractODataIdFromAssets = (
  assets: Record<string, StacAsset> | null | undefined,
): string | null => {
  const href = findAssetByKey(assets, 'product')?.href;
  if (!href) {
    return null;
  }
  const match = href.match(/Products\(([^)]+)\)/);
  return match ? match[1] : null;
};

const DOWNLOADABLE_MIME_TYPES = [
  'application/zip',
  'application/octet-stream',
  'application/x-netcdf',
  'application/x-hdf',
];

/**
 * Extracts the product download URL from STAC assets
 */
export const getDownloadUrlFromAssets = (
  assets: Record<string, StacAsset> | null | undefined,
): string | null => {
  if (!assets || typeof assets !== 'object') {
    return null;
  }

  // Prefer the 'product' asset key (common STAC convention)
  const productAsset = findAssetByKey(assets, 'product');
  if (productAsset?.href) {
    return productAsset.href;
  }

  // Look for an asset with a downloadable MIME type
  for (const [, asset] of Object.entries(assets)) {
    if (asset.href && asset.type && DOWNLOADABLE_MIME_TYPES.includes(asset.type)) {
      return asset.href;
    }
  }

  // Fall back to the first asset with an href
  for (const [, asset] of Object.entries(assets)) {
    if (asset.href) {
      return asset.href;
    }
  }

  return null;
};

// STAC asset roles that identify a browsable preview image, in order of preference.
const PREVIEW_ASSET_ROLES = ['thumbnail', 'overview'];

const assetHasRole = (asset: StacAsset, role: string): boolean =>
  Array.isArray(asset.roles) && asset.roles.includes(role);

/**
 * Extracts the preview (quicklook) image URL from STAC assets.
 * Prefers the 'thumbnail' asset key, then falls back to the first asset
 * declaring a 'thumbnail'/'overview' role.
 */
export const getPreviewUrlFromAssets = (
  assets: Record<string, StacAsset> | null | undefined,
): string | null => {
  if (!assets || typeof assets !== 'object') {
    return null;
  }

  // Prefer the 'thumbnail' asset key (used by all CDSE STAC collections)
  if (assets.thumbnail?.href) {
    return assets.thumbnail.href;
  }

  for (const role of PREVIEW_ASSET_ROLES) {
    for (const [, asset] of Object.entries(assets)) {
      if (asset.href && assetHasRole(asset, role)) {
        return asset.href;
      }
    }
  }

  return null;
};
