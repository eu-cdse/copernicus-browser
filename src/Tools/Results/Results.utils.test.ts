import {
  normalizeSTACResult,
  normalizeResult,
  normalizeResults,
  getResultType,
  ResultType,
  getPlatformShortName,
  extractODataIdFromAssets,
  getDownloadUrlFromAssets,
  getDownloadFileNameFromAssets,
  getPreviewUrlFromAssets,
} from './Results.utils';
import type { NormalizedSTACResult } from './Results.utils';

describe('getResultType', () => {
  test('returns odata for a tile with an attributes array', () => {
    const tile = { attributes: [{ Name: 'platformShortName', Value: 'SENTINEL-2' }] };
    expect(getResultType(tile)).toBe(ResultType.ODATA);
  });

  test('returns odata for a tile with an empty attributes array', () => {
    const tile = { attributes: [] };
    expect(getResultType(tile)).toBe(ResultType.ODATA);
  });

  test('returns stac for a tile with a properties object', () => {
    const tile = { properties: { datetime: '2024-01-01T00:00:00Z' } };
    expect(getResultType(tile)).toBe(ResultType.STAC);
  });

  test('returns odata as fallback when neither attributes nor properties are present', () => {
    expect(getResultType({})).toBe(ResultType.ODATA);
  });

  test('returns odata as fallback for null input', () => {
    expect(getResultType(null)).toBe(ResultType.ODATA);
  });

  test('returns odata as fallback for undefined input', () => {
    expect(getResultType(undefined)).toBe(ResultType.ODATA);
  });

  test('prefers odata when both attributes array and properties object are present', () => {
    const tile = { attributes: [], properties: { datetime: '2024-01-01T00:00:00Z' } };
    expect(getResultType(tile)).toBe(ResultType.ODATA);
  });

  test('returns odata when properties is not an object (e.g. a string)', () => {
    const tile = { properties: 'not-an-object' };
    expect(getResultType(tile)).toBe(ResultType.ODATA);
  });
});

describe('getPlatformShortName', () => {
  test('returns the platformShortName when present', () => {
    expect(getPlatformShortName({ platformShortName: 'SENTINEL-1' })).toBe('SENTINEL-1');
  });

  test('falls back to UNKNOWN when platformShortName is missing', () => {
    expect(getPlatformShortName({})).toBe('UNKNOWN');
  });

  test('falls back to UNKNOWN when platformShortName is an empty string', () => {
    expect(getPlatformShortName({ platformShortName: '' })).toBe('UNKNOWN');
  });
});

describe('extractODataIdFromAssets', () => {
  test('extracts the UUID from a Products(<uuid>)/$value href', () => {
    const assets = {
      product: {
        href: 'https://catalogue.dataspace.copernicus.eu/odata/v1/Products(3b1e6424-2b8b-4b3b-9b1a-123456789abc)/$value',
      },
    };
    expect(extractODataIdFromAssets(assets)).toBe('3b1e6424-2b8b-4b3b-9b1a-123456789abc');
  });

  test('extracts the UUID from a Products(<uuid>) href without a trailing $value', () => {
    const assets = {
      product: {
        href: 'https://catalogue.dataspace.copernicus.eu/odata/v1/Products(3b1e6424-2b8b-4b3b-9b1a-123456789abc)',
      },
    };
    expect(extractODataIdFromAssets(assets)).toBe('3b1e6424-2b8b-4b3b-9b1a-123456789abc');
  });

  test('returns null when assets is undefined', () => {
    expect(extractODataIdFromAssets(undefined)).toBeNull();
  });

  test('returns null when assets is null', () => {
    expect(extractODataIdFromAssets(null)).toBeNull();
  });

  test('returns null when assets has no product asset', () => {
    expect(extractODataIdFromAssets({})).toBeNull();
  });

  test('returns null when product asset has no href', () => {
    expect(extractODataIdFromAssets({ product: {} })).toBeNull();
  });

  test('returns null when href does not match the Products(...) pattern', () => {
    const assets = { product: { href: 'https://example.com/download/some-file.zip' } };
    expect(extractODataIdFromAssets(assets)).toBeNull();
  });
});

describe('getDownloadUrlFromAssets', () => {
  test('prefers the product asset href when present', () => {
    const assets = {
      product: { href: 'https://example.com/Products(uuid)/$value' },
      thumbnail: { href: 'https://example.com/thumbnail.png', type: 'image/png' },
    };
    expect(getDownloadUrlFromAssets(assets)).toBe('https://example.com/Products(uuid)/$value');
  });

  test('falls back to an asset with a downloadable MIME type when there is no product asset', () => {
    const assets = {
      thumbnail: { href: 'https://example.com/thumbnail.png', type: 'image/png' },
      archive: { href: 'https://example.com/archive.zip', type: 'application/zip' },
    };
    expect(getDownloadUrlFromAssets(assets)).toBe('https://example.com/archive.zip');
  });

  test.each([
    ['application/x-tar', 'application/x-tar'],
    ['application/gzip', 'application/gzip'],
    ['a type with parameters', 'application/zip; charset=binary'],
  ])('treats %s as downloadable when there is no product asset', (_label, type) => {
    const assets = {
      thumbnail: { href: 'https://example.com/thumbnail.png', type: 'image/png' },
      archive: { href: 'https://example.com/archive', type },
    };
    expect(getDownloadUrlFromAssets(assets)).toBe('https://example.com/archive');
  });

  test('falls back to the first asset with an href when nothing matches a downloadable MIME type', () => {
    const assets = {
      thumbnail: { href: 'https://example.com/thumbnail.png', type: 'image/png' },
    };
    expect(getDownloadUrlFromAssets(assets)).toBe('https://example.com/thumbnail.png');
  });

  test('returns null when assets is undefined', () => {
    expect(getDownloadUrlFromAssets(undefined)).toBeNull();
  });

  test('returns null when assets is null', () => {
    expect(getDownloadUrlFromAssets(null)).toBeNull();
  });

  test('returns null when assets is an empty object', () => {
    expect(getDownloadUrlFromAssets({})).toBeNull();
  });

  test('returns null when no asset has an href', () => {
    expect(getDownloadUrlFromAssets({ thumbnail: { type: 'image/png' } })).toBeNull();
  });
});

describe('getDownloadFileNameFromAssets', () => {
  const odataHref = 'https://download.dataspace.copernicus.eu/odata/v1/Products(uuid)/$value';

  test.each([
    ['a gzip archive', 'S6ACOMB24143.sp3.gz'],
    ['a tar archive', 'S6A_AX____POE__AX_20260928T215923_20260930T015923_SALP_OPE_NT_003.SEN6.tar'],
    ['an upper-case extension', 'S6A_OPER_AUX_GNSSRD_POD__20261025T123052.TGZ'],
    ['a zip archive', 'Sentinel-2_mosaic_2026_Q3_60XWF_1_0.zip'],
  ])("returns the product asset's file:local_path for %s, unchanged", (_label, localPath) => {
    const assets = { product: { href: odataHref, 'file:local_path': localPath } };
    expect(getDownloadFileNameFromAssets(assets)).toBe(localPath);
  });

  test('finds a capitalised `Product` asset', () => {
    const assets = { Product: { href: odataHref, 'file:local_path': 'mosaic.zip' } };
    expect(getDownloadFileNameFromAssets(assets)).toBe('mosaic.zip');
  });

  test('keeps only the base name when the path includes directories', () => {
    const assets = { product: { href: odataHref, 'file:local_path': 'some/dir/S6ACOMB24143.sp3.gz' } };
    expect(getDownloadFileNameFromAssets(assets)).toBe('S6ACOMB24143.sp3.gz');
  });

  test('names the file after the same asset the download URL comes from', () => {
    // No product asset: the download falls back to the first downloadable-type asset, so the
    // file name has to come from that asset too, not from the thumbnail listed before it.
    const assets = {
      thumbnail: { href: 'https://example.com/thumb.png', type: 'image/png', 'file:local_path': 'thumb.png' },
      archive: { href: odataHref, type: 'application/gzip', 'file:local_path': 'archive.gz' },
    };
    expect(getDownloadUrlFromAssets(assets)).toBe(odataHref);
    expect(getDownloadFileNameFromAssets(assets)).toBe('archive.gz');
  });

  test.each([
    ['the download asset has no file:local_path', { product: { href: odataHref } }],
    ['file:local_path is not a string', { product: { href: odataHref, 'file:local_path': 42 } }],
    ['file:local_path ends in a slash', { product: { href: odataHref, 'file:local_path': 'dir/' } }],
    ['assets is empty', {}],
    ['assets is undefined', undefined],
  ])('returns null when %s', (_label, assets) => {
    expect(getDownloadFileNameFromAssets(assets)).toBeNull();
  });
});

describe('getPreviewUrlFromAssets', () => {
  test('prefers the thumbnail asset href when present', () => {
    const assets = {
      product: { href: 'https://example.com/Products(uuid)/$value', type: 'application/zip' },
      thumbnail: { href: 'https://example.com/thumbnail.png', type: 'image/png' },
    };
    expect(getPreviewUrlFromAssets(assets)).toBe('https://example.com/thumbnail.png');
  });

  test('falls back to an asset declaring the thumbnail role when there is no thumbnail key', () => {
    const assets = {
      product: { href: 'https://example.com/Products(uuid)/$value', type: 'application/zip' },
      quicklook: { href: 'https://example.com/quicklook.png', roles: ['thumbnail', 'overview'] },
    };
    expect(getPreviewUrlFromAssets(assets)).toBe('https://example.com/quicklook.png');
  });

  test('falls back to an asset declaring only the overview role', () => {
    const assets = {
      preview: { href: 'https://example.com/overview.png', roles: ['overview'] },
    };
    expect(getPreviewUrlFromAssets(assets)).toBe('https://example.com/overview.png');
  });

  test('prefers a thumbnail-role asset over an overview-role asset', () => {
    const assets = {
      overview: { href: 'https://example.com/overview.png', roles: ['overview'] },
      quicklook: { href: 'https://example.com/quicklook.png', roles: ['thumbnail'] },
    };
    expect(getPreviewUrlFromAssets(assets)).toBe('https://example.com/quicklook.png');
  });

  test('returns null when assets is undefined', () => {
    expect(getPreviewUrlFromAssets(undefined)).toBeNull();
  });

  test('returns null when assets is null', () => {
    expect(getPreviewUrlFromAssets(null)).toBeNull();
  });

  test('returns null when assets is an empty object', () => {
    expect(getPreviewUrlFromAssets({})).toBeNull();
  });

  test('returns null when the thumbnail asset has no href', () => {
    expect(getPreviewUrlFromAssets({ thumbnail: { type: 'image/png' } })).toBeNull();
  });

  test('returns null when no asset carries a preview role', () => {
    const assets = {
      product: { href: 'https://example.com/Products(uuid)/$value', roles: ['data'] },
    };
    expect(getPreviewUrlFromAssets(assets)).toBeNull();
  });
});

describe('normalizeSTACResult / normalizeResult - STAC feature mapping', () => {
  const baseSentinel2Feature = {
    type: 'Feature',
    stac_version: '1.0.0',
    id: 'S2A_MSIL2A_20240115T100311_N0510_R122_T33TUL_20240115T134500',
    collection: 'sentinel-2-l2a',
    geometry: {
      type: 'Polygon',
      coordinates: [
        [
          [15.0, 45.0],
          [16.0, 45.0],
          [16.0, 46.0],
          [15.0, 46.0],
          [15.0, 45.0],
        ],
      ],
    },
    properties: {
      datetime: '2024-01-15T10:03:11.024Z',
      title: 'S2A_MSIL2A_20240115T100311_N0510_R122_T33TUL_20240115T134500.SAFE',
      platform: 'sentinel-2a',
      constellation: 'sentinel-2',
      instruments: ['msi'],
      'product:type': 'S2MSI2A',
      'eo:cloud_cover': 12.34,
      created: '2024-01-15T13:50:00.000Z',
      updated: '2024-01-16T08:00:00.000Z',
      published: '2024-01-15T14:00:00.000Z',
    },
    assets: {
      product: {
        href: 'https://catalogue.dataspace.copernicus.eu/odata/v1/Products(3b1e6424-2b8b-4b3b-9b1a-123456789abc)/$value',
        type: 'application/zip',
        'file:size': 754321098,
      },
      thumbnail: {
        href: 'https://catalogue.dataspace.copernicus.eu/quicklooks/S2A_MSIL2A.jpg',
        type: 'image/jpeg',
      },
    },
    links: [
      { rel: 'self', href: 'https://stac.dataspace.copernicus.eu/v1/collections/sentinel-2-l2a/items/foo' },
      {
        rel: 'enclosure',
        type: 'application/x-directory',
        href: 's3://eodata/Sentinel-2/MSI/L2A/2024/01/15/S2A_MSIL2A_20240115T100311.SAFE',
      },
    ],
  };

  test('detects the STAC shape and returns an OData-like tile via normalizeResult', () => {
    const result = normalizeResult(baseSentinel2Feature) as NormalizedSTACResult;

    expect(result.id).toBe(baseSentinel2Feature.id);
    expect(result.name).toBe('S2A_MSIL2A_20240115T100311_N0510_R122_T33TUL_20240115T134500.SAFE');
    expect(result.sensingTime).toBe('2024-01-15T10:03:11.024Z');
    expect(result.platformShortName).toBe('SENTINEL-2');
    expect(result.instrumentShortName).toBe('MSI');
    expect(result.productType).toBe('S2MSI2A');
    expect(result.modificationDate).toBe('2024-01-16T08:00:00.000Z');
    expect(result.originDate).toBe('2024-01-15T13:50:00.000Z');
    expect(result.publicationDate).toBe('2024-01-15T14:00:00.000Z');
    expect(result.online).toBe(true);
    expect(result.oDataProductId).toBe('3b1e6424-2b8b-4b3b-9b1a-123456789abc');
    expect(result.contentLength).toBe(754321098);
    expect(result.size).toBe('719.38 MB');
    expect(result.S3Path).toBe('s3://eodata/Sentinel-2/MSI/L2A/2024/01/15/S2A_MSIL2A_20240115T100311.SAFE');
    expect(result.geometry).toEqual(baseSentinel2Feature.geometry);
  });

  test('normalises a null geometry (product without a footprint) to undefined', () => {
    // PreviewLayer and the other geometry consumers guard against undefined (what OData results
    // without a footprint produce), but Object.keys(null) would throw.
    const result = normalizeSTACResult({ ...baseSentinel2Feature, geometry: null }) as NormalizedSTACResult;
    expect(result.geometry).toBeUndefined();
  });

  test('exposes the thumbnail asset href as previewUrl', () => {
    const result = normalizeSTACResult(baseSentinel2Feature) as NormalizedSTACResult;
    expect(result.previewUrl).toBe('https://catalogue.dataspace.copernicus.eu/quicklooks/S2A_MSIL2A.jpg');
  });

  test('sets previewUrl to null when the feature has no thumbnail asset', () => {
    const feature = {
      ...baseSentinel2Feature,
      assets: { product: baseSentinel2Feature.assets.product },
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    expect(result.previewUrl).toBeNull();
  });

  test('produces an attributes array covering the mapped STAC properties', () => {
    const result = normalizeSTACResult(baseSentinel2Feature) as NormalizedSTACResult;

    const attrByName = (name: string) => result.attributes.find((attr) => attr.Name === name)!;

    expect(attrByName('platformShortName').Value).toBe('SENTINEL-2');
    expect(attrByName('instrumentShortName').Value).toBe('MSI');
    expect(attrByName('productType').Value).toBe('S2MSI2A');
    expect(attrByName('cloudCover').Value).toBe(12.34);
    expect(attrByName('nominalDate').Value).toBe('2024-01-15T10:03:11.024Z');
    expect(attrByName('fileFormat').Value).toBe('ZIP');
    expect(attrByName('collectionName').Value).toBe('sentinel-2-l2a');
  });

  test('preserves original STAC properties/assets for backward compatibility', () => {
    const result = normalizeSTACResult(baseSentinel2Feature) as NormalizedSTACResult;
    expect(result.properties).toEqual(baseSentinel2Feature.properties);
    expect(result.assets).toEqual(baseSentinel2Feature.assets);
  });

  test('falls back to the feature id when properties.title is missing', () => {
    const feature = {
      ...baseSentinel2Feature,
      properties: { ...baseSentinel2Feature.properties, title: undefined },
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    expect(result.name).toBe(feature.id);
  });

  test('falls back to start_datetime when datetime is missing', () => {
    const feature = {
      ...baseSentinel2Feature,
      properties: {
        ...baseSentinel2Feature.properties,
        datetime: undefined,
        start_datetime: '2024-01-15T09:00:00.000Z',
      },
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    expect(result.sensingTime).toBe('2024-01-15T09:00:00.000Z');
  });

  test('uses "platform" property when "constellation" is absent', () => {
    const feature = {
      ...baseSentinel2Feature,
      properties: { ...baseSentinel2Feature.properties, constellation: undefined, platform: 'landsat-9' },
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    expect(result.platformShortName).toBe('LANDSAT-9');
  });

  test('uses "instrument" (singular) property when "instruments" array is absent', () => {
    const feature = {
      ...baseSentinel2Feature,
      properties: { ...baseSentinel2Feature.properties, instruments: undefined, instrument: 'oli_tirs' },
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    expect(result.instrumentShortName).toBe('OLI_TIRS');
  });

  test('uses "processing:level" property when "product:type" is absent', () => {
    const feature = {
      ...baseSentinel2Feature,
      properties: {
        ...baseSentinel2Feature.properties,
        'product:type': undefined,
        'processing:level': 'L1C',
      },
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    expect(result.productType).toBe('L1C');
  });

  test('falls back publicationDate to created when published is absent', () => {
    const feature = {
      ...baseSentinel2Feature,
      properties: { ...baseSentinel2Feature.properties, published: undefined },
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    expect(result.publicationDate).toBe(feature.properties.created);
  });

  test('returns the STAC result unchanged when properties are missing', () => {
    const feature = { id: 'no-properties-feature', assets: {} };
    const result = normalizeSTACResult(feature);
    expect(result).toBe(feature);
  });

  test('normalizeResult also returns the original object unchanged when properties are missing', () => {
    const feature = { id: 'no-properties-feature' };
    const result = normalizeResult(feature);
    expect(result).toBe(feature);
  });
});

describe('normalizeSTACResult - Landsat Mosaic thumbnail', () => {
  // Shape mirrors a real item from the opengeohub-landsat-bimonthly-mosaic-v1.0.1 collection,
  // whose thumbnails are served as WMS GetMap requests from thumbnails.dataspace.copernicus.eu.
  const landsatMosaicThumbnailHref =
    'https://thumbnails.dataspace.copernicus.eu/wms?SERVICE=WMS&VERSION=1.3.0&REQUEST=GetMap' +
    '&LAYERS=s3://eodata/Global-Mosaics/Landsat/OLM_SWA_ARD2/v1/2024/07/01/Landsat_mosaic_2024_07-08_49N002E_V1.0.1/' +
    '&CRS=EPSG:4326&BBOX=2,49,3,50&WIDTH=500&HEIGHT=500&FORMAT=image/png&TRANSPARENT=false';

  const landsatMosaicFeature = {
    id: 'Landsat_mosaic_2024_07-08_49N002E_V1.0.1',
    collection: 'opengeohub-landsat-bimonthly-mosaic-v1.0.1',
    geometry: { type: 'Polygon', coordinates: [] },
    properties: {
      datetime: '2024-07-01T00:00:00.000Z',
      title: 'Landsat_mosaic_2024_07-08_49N002E_V1.0.1',
    },
    assets: {
      product: { href: 'https://example.com/landsat-mosaic/product', type: 'application/zip' },
      thumbnail: {
        href: landsatMosaicThumbnailHref,
        type: 'image/png',
        title: 'Quicklook',
        roles: ['thumbnail', 'overview'],
      },
    },
    links: [],
  };

  test('exposes the WMS quicklook href as previewUrl', () => {
    const result = normalizeSTACResult(landsatMosaicFeature) as NormalizedSTACResult;
    expect(result.previewUrl).toBe(landsatMosaicThumbnailHref);
  });

  test('exposes previewUrl through normalizeResult as well', () => {
    const result = normalizeResult(landsatMosaicFeature) as NormalizedSTACResult;
    expect(result.previewUrl).toBe(landsatMosaicThumbnailHref);
  });
});

describe('normalizeSTACResult - Sentinel-1 SAR-specific attributes and orbit direction', () => {
  const sentinel1Feature = {
    id: 'S1A_IW_GRDH_1SDV_20240115T054112_20240115T054137_052113_064B21_1234',
    collection: 'sentinel-1-grd',
    geometry: { type: 'Polygon', coordinates: [] },
    properties: {
      datetime: '2024-01-15T05:41:12.000Z',
      title: 'S1A_IW_GRDH_1SDV_20240115T054112_20240115T054137_052113_064B21_1234.SAFE',
      platform: 'sentinel-1a',
      constellation: 'sentinel-1',
      instruments: ['c-sar'],
      'sar:polarizations': ['VV', 'VH'],
      'sar:mode': 'IW',
      'sat:orbit_state': 'descending',
      'product:type': 'IW_GRDH_1S',
    },
    assets: {
      product: {
        href: 'https://catalogue.dataspace.copernicus.eu/odata/v1/Products(9f8e7d6c-5b4a-3c2d-1e0f-abcdef012345)/$value',
        type: 'application/zip',
      },
    },
    links: [],
  };

  test('maps SAR polarisation channels, operational mode and orbit direction', () => {
    const result = normalizeSTACResult(sentinel1Feature) as NormalizedSTACResult;

    const attrByName = (name: string) => result.attributes.find((attr) => attr.Name === name)!;

    expect(attrByName('polarisationChannels').Value).toBe('VV, VH');
    expect(attrByName('operationalMode').Value).toBe('IW');
    expect(attrByName('orbitDirection').Value).toBe('descending');
    expect(result.platformShortName).toBe('SENTINEL-1');
    expect(result.instrumentShortName).toBe('C-SAR');
  });

  test('S3Path is null when there is no enclosure link', () => {
    const result = normalizeSTACResult(sentinel1Feature) as NormalizedSTACResult;
    expect(result.S3Path).toBeNull();
  });

  test('size is empty string and contentLength is 0 when assets have no file:size', () => {
    const result = normalizeSTACResult(sentinel1Feature) as NormalizedSTACResult;
    expect(result.size).toBe('');
    expect(result.contentLength).toBe(0);
  });

  test('handles a single string polarisation value without joining', () => {
    const feature = {
      ...sentinel1Feature,
      properties: { ...sentinel1Feature.properties, 'sar:polarizations': 'VV' },
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    const attr = result.attributes.find((a) => a.Name === 'polarisationChannels')!;
    expect(attr.Value).toBe('VV');
  });
});

describe('normalizeSTACResult - size calculation across multiple assets', () => {
  test('sums file:size across all assets when there is no dedicated product asset size', () => {
    const feature = {
      id: 'multi-asset-feature',
      properties: { datetime: '2024-01-01T00:00:00Z' },
      assets: {
        band1: { href: 'https://example.com/b1.tif', 'file:size': 1000 },
        band2: { href: 'https://example.com/b2.tif', 'file:size': 2000 },
        thumbnail: { href: 'https://example.com/thumb.png' },
      },
      links: [],
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    expect(result.contentLength).toBe(3000);
    expect(result.size).toBe('2.93 KB');
  });

  test('uses the product asset file:size directly when present, ignoring other asset sizes', () => {
    const feature = {
      id: 'product-asset-feature',
      properties: { datetime: '2024-01-01T00:00:00Z' },
      assets: {
        product: { href: 'https://example.com/Products(uuid)/$value', 'file:size': 5000 },
        band1: { href: 'https://example.com/b1.tif', 'file:size': 2000 },
      },
      links: [],
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    expect(result.contentLength).toBe(5000);
  });

  test('returns 0 size when assets is missing entirely', () => {
    const feature = {
      id: 'no-assets-feature',
      properties: { datetime: '2024-01-01T00:00:00Z' },
      links: [],
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    expect(result.contentLength).toBe(0);
    expect(result.size).toBe('');
    expect(result.oDataProductId).toBeNull();
  });

  test.each([
    ['application/x-tar is mapped', 'application/x-tar', 'TAR archive', 'TAR'],
    ['application/gzip is mapped', 'application/gzip', 'Gzipped TAR archive', 'GZIP'],
    [
      'a MIME type with parameters matches on its bare media type',
      'image/tiff; application=geotiff; profile=cloud-optimized',
      'Cloud-optimized GeoTIFF',
      'TIFF',
    ],
    ['MIME type matching is case-insensitive', 'Application/X-TAR', 'TAR archive', 'TAR'],
    ['a mapped MIME type wins over the title', 'application/zip', 'Zipped product', 'ZIP'],
    [
      'an unmapped MIME type falls back to the title',
      'application/octet-stream',
      'Binary archive',
      'Binary archive',
    ],
  ])('file format: %s', (_label, type, title, expected) => {
    const feature = {
      id: 'product-type-title-feature',
      properties: { datetime: '2024-01-01T00:00:00Z' },
      assets: {
        product: {
          href: 'https://download.dataspace.copernicus.eu/odata/v1/Products(uuid)/$value',
          type,
          title,
        },
      },
      links: [],
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    const fileFormatAttr = result.attributes.find((a) => a.Name === 'fileFormat')!;
    expect(fileFormatAttr.Value).toBe(expected);
  });

  test('no fileFormat attribute is added for an unmapped MIME type without a title', () => {
    // Before #1321 the extension-less OData `$value` href was split on '.' instead, producing the
    // chip "EU/ODATA/V1/PRODUCTS(UUID)/$VALUE".
    const feature = {
      id: 'unmapped-type-no-title-feature',
      properties: { datetime: '2024-01-01T00:00:00Z' },
      assets: {
        product: {
          href: 'https://download.dataspace.copernicus.eu/odata/v1/Products(uuid)/$value',
          type: 'application/octet-stream',
        },
      },
      links: [],
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    const fileFormatAttr = result.attributes.find((a) => a.Name === 'fileFormat');
    expect(fileFormatAttr).toBeUndefined();
  });

  test("a non-product asset's title is never used as the file format", () => {
    const feature = {
      id: 'band-title-feature',
      properties: { datetime: '2024-01-01T00:00:00Z' },
      assets: {
        B02: {
          href: 'https://example.com/B02.tif',
          title: 'Blue (band 2)',
          type: 'application/octet-stream',
        },
      },
      links: [],
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    const fileFormatAttr = result.attributes.find((a) => a.Name === 'fileFormat');
    expect(fileFormatAttr).toBeUndefined();
  });

  test('file format prefers the product asset even when other assets are listed first', () => {
    const feature = {
      id: 'product-not-first-feature',
      properties: { datetime: '2024-01-01T00:00:00Z' },
      assets: {
        B01: { href: 'https://example.com/B01.tif', type: 'image/tiff' },
        thumbnail: { href: 'https://example.com/thumb.jpg', type: 'image/jpeg' },
        product: { href: 'https://example.com/Products(uuid)/$value', type: 'application/zip' },
      },
      links: [],
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    const fileFormatAttr = result.attributes.find((a) => a.Name === 'fileFormat')!;
    expect(fileFormatAttr.Value).toBe('ZIP');
  });

  test('no fileFormat attribute is added when assets is empty', () => {
    const feature = {
      id: 'empty-assets-feature',
      properties: { datetime: '2024-01-01T00:00:00Z' },
      assets: {},
      links: [],
    };
    const result = normalizeSTACResult(feature) as NormalizedSTACResult;
    const fileFormatAttr = result.attributes.find((a) => a.Name === 'fileFormat');
    expect(fileFormatAttr).toBeUndefined();
  });
});

describe('normalizeResults', () => {
  test('returns an empty array for non-array input', () => {
    expect(normalizeResults(null)).toEqual([]);
    expect(normalizeResults(undefined)).toEqual([]);
    expect(normalizeResults('not-an-array')).toEqual([]);
    expect(normalizeResults({})).toEqual([]);
  });

  test('returns an empty array for an empty array input', () => {
    expect(normalizeResults([])).toEqual([]);
  });

  test('is a true no-op passthrough for already OData-shaped results (no mutation, no reshaping)', () => {
    const odataResults = [
      {
        Id: 'a1',
        Name: 'S2A_MSIL2A_TEST.SAFE',
        attributes: [{ Name: 'platformShortName', Value: 'SENTINEL-2' }],
      },
      {
        Id: 'a2',
        Name: 'S1A_IW_GRDH_TEST.SAFE',
        attributes: [{ Name: 'platformShortName', Value: 'SENTINEL-1' }],
      },
    ];
    const clone = JSON.parse(JSON.stringify(odataResults));

    const result = normalizeResults(odataResults);

    // Same object references are returned, not copies/reshaped objects
    expect(result[0]).toBe(odataResults[0]);
    expect(result[1]).toBe(odataResults[1]);
    // Original input array is untouched
    expect(odataResults).toEqual(clone);
    expect(result).toEqual(clone);
  });

  test('normalizes a mix of OData and STAC shaped results', () => {
    const odataTile = { attributes: [{ Name: 'platformShortName', Value: 'SENTINEL-2' }] };
    const stacFeature = {
      id: 'stac-1',
      properties: { datetime: '2024-01-01T00:00:00Z', title: 'stac-1.SAFE' },
      assets: {},
      links: [],
    };

    const result = normalizeResults([odataTile, stacFeature]);

    expect(result[0]).toBe(odataTile);
    expect(result[1]).not.toBe(stacFeature);
    expect((result[1] as NormalizedSTACResult).name).toBe('stac-1.SAFE');
    expect((result[1] as NormalizedSTACResult).attributes).toBeDefined();
  });
});

describe('STAC asset key casing', () => {
  // CDSE collections disagree on the casing of the product archive's asset key: the Landsat
  // mosaics use `product`, the Sentinel Global Mosaics use `Product`. An exact-match lookup
  // silently drops the OData product ID, the format and the size for the latter.
  const globalMosaicAssets = {
    userdata: {
      href: 's3://eodata/Global-Mosaics/Sentinel-1/S1SAR_L3_IW_MCM/userdata.json',
      type: 'application/xml',
      'file:size': 1276,
    },
    VV: {
      href: 's3://eodata/Global-Mosaics/Sentinel-1/S1SAR_L3_IW_MCM/VV.tif',
      type: 'image/tiff; application=geotiff; profile=cloud-optimized',
      'file:size': 106128657,
    },
    Product: {
      href: 'https://zipper.dataspace.copernicus.eu/odata/v1/Products(822299a0-afd0-4cf3-a8ea-10cbe6f37766)/$value',
      type: 'application/zip',
      'file:size': 219323585,
    },
  };

  test('extractODataIdFromAssets finds the UUID under a capitalised `Product` key', () => {
    expect(extractODataIdFromAssets(globalMosaicAssets)).toBe('822299a0-afd0-4cf3-a8ea-10cbe6f37766');
  });

  test('getDownloadUrlFromAssets prefers the capitalised `Product` archive over the band assets', () => {
    expect(getDownloadUrlFromAssets(globalMosaicAssets)).toBe(globalMosaicAssets.Product.href);
  });

  test('a lowercase `product` key still wins over a same-named asset later in the object', () => {
    const assets = {
      thumbnail: { href: 'https://example.test/thumb.jpg', type: 'image/jpeg' },
      product: { href: 'https://example.test/Products(abc-123)/$value', type: 'application/zip' },
    };
    expect(extractODataIdFromAssets(assets)).toBe('abc-123');
    expect(getDownloadUrlFromAssets(assets)).toBe(assets.product.href);
  });

  test('normalizeSTACResult reports the archive size and format, not the summed band assets', () => {
    const result = normalizeSTACResult({
      type: 'Feature',
      id: 'Sentinel-1_IW_mosaic_2026_M06_04UFG_0_0',
      collection: 'sentinel-1-global-mosaics',
      properties: {
        datetime: '2026-06-01T00:00:00Z',
        'product:type': 'S1SAR_L3_IW_MCM',
        constellation: 'sentinel-1',
        instruments: ['sar'],
      },
      assets: globalMosaicAssets,
    }) as NormalizedSTACResult;

    expect(result.oDataProductId).toBe('822299a0-afd0-4cf3-a8ea-10cbe6f37766');
    expect(result.contentLength).toBe(219323585);
    expect(result.productType).toBe('S1SAR_L3_IW_MCM');
  });
});
