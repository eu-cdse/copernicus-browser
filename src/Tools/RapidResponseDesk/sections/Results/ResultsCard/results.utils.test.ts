import axios from 'axios';

import {
  isValidQuicklook,
  hasQuicklookAsset,
  getQuicklookAsset,
  fetchThumbnailImage,
  fetchPreviewImage,
} from './results.utils';
import { ProviderImageTypes } from '../../../rapidResponseProperties';

jest.mock('axios');

// getRrdCollectionId is mocked to be the identity of the constellation string, so tests can
// control the "matching mission" branch of findProviderLogo purely via item.properties.constellation.
jest.mock('../../../../../api/RRD/api.utils', () => ({
  getRrdCollectionId: jest.fn((constellation) => constellation),
}));

const MATCHING_MISSION_ID = 'MATCHING_MISSION';
const MOCK_LOGO = 'mock-logo.png';

jest.mock('../../ImageQualityAndProviderSection/Radar/Radar.utils', () => ({
  getActiveRadarProviders: jest.fn(),
}));

jest.mock('../../ImageQualityAndProviderSection/Optical/Optical.utils', () => ({
  getActiveOpticalProviders: jest.fn(),
}));

import { getActiveRadarProviders } from '../../ImageQualityAndProviderSection/Radar/Radar.utils';
import { getActiveOpticalProviders } from '../../ImageQualityAndProviderSection/Optical/Optical.utils';

const providersWithLogo = [
  {
    active: true,
    missions: [{ id: MATCHING_MISSION_ID, logo: MOCK_LOGO }],
  },
];

const providersWithoutMatch = [
  {
    active: true,
    missions: [{ id: 'SOME_OTHER_MISSION', logo: 'other-logo.png' }],
  },
];

beforeAll(() => {
  global.URL.createObjectURL = jest.fn(() => 'blob:mock-url');
});

beforeEach(() => {
  jest.clearAllMocks();
  (getActiveOpticalProviders as jest.Mock).mockReturnValue(providersWithLogo);
  (getActiveRadarProviders as jest.Mock).mockReturnValue(providersWithLogo);
});

describe('isValidQuicklook', () => {
  it('rejects an undefined href', () => {
    expect(isValidQuicklook(undefined, 'image/png')).toBeFalsy();
  });

  it('rejects an empty href', () => {
    expect(isValidQuicklook('', 'image/png')).toBeFalsy();
  });

  it("rejects the literal string 'null'", () => {
    expect(isValidQuicklook('null', 'image/png')).toBeFalsy();
  });

  it('rejects an image/tiff type', () => {
    expect(isValidQuicklook('https://example.com/quicklook.tiff', 'image/tiff')).toBeFalsy();
  });

  it('rejects an image/tif type', () => {
    expect(isValidQuicklook('https://example.com/quicklook.tif', 'image/tif')).toBeFalsy();
  });

  it('accepts a normal href/PNG type', () => {
    expect(isValidQuicklook('https://example.com/quicklook.png', 'image/png')).toBeTruthy();
  });
});

describe('hasQuicklookAsset', () => {
  it('is true for a valid quicklook-png asset', () => {
    const item = {
      assets: {
        'quicklook-png': { href: 'https://example.com/quicklook.png', type: 'image/png' },
      },
    };
    expect(hasQuicklookAsset(item)).toBe(true);
  });

  it('is true for a valid quicklook asset', () => {
    const item = {
      assets: {
        quicklook: { href: 'https://example.com/quicklook.png', type: 'image/png' },
      },
    };
    expect(hasQuicklookAsset(item)).toBe(true);
  });

  it('is false for a thumbnail-only item', () => {
    const item = {
      assets: {
        thumbnail: { href: 'https://example.com/thumbnail.png', type: 'image/png' },
      },
    };
    expect(hasQuicklookAsset(item)).toBeFalsy();
  });

  it('is false for a TIFF-only item', () => {
    const item = {
      assets: {
        'quicklook-png': { href: 'https://example.com/quicklook.tiff', type: 'image/tiff' },
      },
    };
    expect(hasQuicklookAsset(item)).toBeFalsy();
  });

  it('is false for an item with no assets', () => {
    expect(hasQuicklookAsset({})).toBeFalsy();
  });
});

describe('getQuicklookAsset', () => {
  it('prefers quicklook-png over quicklook when both are valid', () => {
    const item = {
      assets: {
        'quicklook-png': { href: 'https://example.com/quicklook.png', type: 'image/png' },
        quicklook: { href: 'https://example.com/quicklook2.png', type: 'image/png' },
      },
    };
    expect(getQuicklookAsset(item)).toEqual({
      href: 'https://example.com/quicklook.png',
      type: 'image/png',
    });
  });

  it('falls through to quicklook when quicklook-png is invalid, without mixing hrefs/types', () => {
    const item = {
      assets: {
        'quicklook-png': { href: 'https://example.com/quicklook.tiff', type: 'image/tiff' },
        quicklook: { href: 'https://example.com/quicklook.png', type: 'image/png' },
      },
    };
    expect(getQuicklookAsset(item)).toEqual({
      href: 'https://example.com/quicklook.png',
      type: 'image/png',
    });
  });

  it('is null when there is no valid quicklook asset', () => {
    expect(getQuicklookAsset({})).toBeNull();
  });
});

describe('fetchThumbnailImage', () => {
  it('returns { url, isFallback: false } on a successful blob fetch', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: new Blob(['thumb']) });
    const item = {
      _internalId: 'thumbnail-success',
      assets: { thumbnail: { href: 'https://example.com/thumbnail.png' } },
    };

    const result = await fetchThumbnailImage(item, 'token');

    expect(result).toEqual({ url: 'blob:mock-url', isFallback: false });
  });

  it('returns null when there is no thumbnail asset', async () => {
    const item = { _internalId: 'thumbnail-missing', assets: {} };

    const result = await fetchThumbnailImage(item, 'token');

    expect(result).toBeNull();
  });

  it('returns null when the blob fetch fails', async () => {
    (axios.get as jest.Mock).mockRejectedValueOnce(new Error('network error'));
    const item = {
      _internalId: 'thumbnail-failure',
      assets: { thumbnail: { href: 'https://example.com/thumbnail.png' } },
    };

    const result = await fetchThumbnailImage(item, 'token');

    expect(result).toBeNull();
  });
});

describe('fetchPreviewImage', () => {
  it('returns { isFallback: false } when the quicklook-png fetch succeeds', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: new Blob(['quicklook']) });
    const item = {
      _internalId: 'preview-quicklook-png-success',
      properties: { constellation: MATCHING_MISSION_ID, platform: 'platform' },
      assets: {
        'quicklook-png': { href: 'https://example.com/quicklook.png', type: 'image/png' },
      },
    };

    const result = await fetchPreviewImage(item, 'token', ProviderImageTypes.optical, false);

    expect(result).toEqual({ url: 'blob:mock-url', isFallback: false });
  });

  it('returns { isFallback: false } when the quicklook (non-png) fetch succeeds', async () => {
    (axios.get as jest.Mock).mockResolvedValueOnce({ data: new Blob(['quicklook']) });
    const item = {
      _internalId: 'preview-quicklook-success',
      properties: { constellation: MATCHING_MISSION_ID, platform: 'platform' },
      assets: {
        quicklook: { href: 'https://example.com/quicklook.png', type: 'image/png' },
      },
    };

    const result = await fetchPreviewImage(item, 'token', ProviderImageTypes.optical, false);

    expect(result).toEqual({ url: 'blob:mock-url', isFallback: false });
  });

  it('returns { isFallback: true } when both quicklook fetches fail and a provider logo exists', async () => {
    (axios.get as jest.Mock).mockRejectedValue(new Error('network error'));
    const item = {
      _internalId: 'preview-fallback-logo',
      properties: { constellation: MATCHING_MISSION_ID, platform: 'platform' },
      assets: {
        'quicklook-png': { href: 'https://example.com/quicklook.png', type: 'image/png' },
        quicklook: { href: 'https://example.com/quicklook2.png', type: 'image/png' },
      },
    };

    const result = await fetchPreviewImage(item, 'token', ProviderImageTypes.optical, false);

    expect(result).toEqual({ url: MOCK_LOGO, isFallback: true });
  });

  it('returns null when there is no quicklook and no matching provider logo either', async () => {
    (getActiveOpticalProviders as jest.Mock).mockReturnValue(providersWithoutMatch);
    const item = {
      _internalId: 'preview-no-logo',
      properties: { constellation: MATCHING_MISSION_ID, platform: 'platform' },
      assets: {},
    };

    const result = await fetchPreviewImage(item, 'token', ProviderImageTypes.optical, false);

    expect(result).toBeNull();
  });
});
