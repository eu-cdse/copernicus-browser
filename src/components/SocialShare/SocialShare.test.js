import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { getShortUrl, getAppropriateHashtags, getCustomDomainFullName } from './SocialShare.utils';
import { S2L1C, GIBS_MODIS_TERRA } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

const mockNetwork = new MockAdapter(axios);
const urlLocation =
  'https://browser.dataspace.copernicus.eu/?zoom=3&lat=26&lng=0&themeId=DEFAULT-THEME&visualizationUrl=https%3A%2F%2Fsh.dataspace.copernicus.eu%2Fogc%2Fwms%2Fa91f72-YOUR-INSTANCEID-HERE&datasetId=S2_L2A_CDAS&demSource3D=%22MAPZEN%22&cloudCoverage=30';

const customResponseMockData = [
  { type: 'USER', active: true, fullName: 'link.dataspace.copernicus.eu' },
  { type: 'SYSTEM', active: true, fullName: 'rebrand.ly' },
];
const inActiveCustomResponseMockData = [
  { type: 'USER', active: false, fullName: 'link.dataspace.copernicus.eu' },
  { type: 'SYSTEM', active: true, fullName: 'rebrand.ly' },
];
const defaultResponseMockData = [{ type: 'SYSTEM', active: true, fullName: 'rebrand.ly' }];

describe('URL Shortening Test Cases', () => {
  beforeEach(() => {
    mockNetwork.reset();

    mockNetwork.onPost('https://api.rebrandly.com/v1/links').replyOnce((config) => {
      if (JSON.parse(config.data).domain?.fullName === 'link.dataspace.copernicus.eu') {
        return [200, { shortUrl: 'link.dataspace.copernicus.eu/g5d' }];
      } else {
        return [200, { shortUrl: 'rebrand.ly/utqowfl' }];
      }
    });
  });

  test('Shortening URL link with custom domain configuration', async () => {
    mockNetwork.onGet(`https://api.rebrandly.com/v1/domains`).replyOnce(200, customResponseMockData);

    expect(await getShortUrl(urlLocation)).toBe('link.dataspace.copernicus.eu/g5d');
  });

  test('Shortening URL link with default domain configuration', async () => {
    mockNetwork.onGet(`https://api.rebrandly.com/v1/domains`).replyOnce(200, defaultResponseMockData);

    expect(await getShortUrl(urlLocation)).toBe('rebrand.ly/utqowfl');
  });

  test('Shortening URL link with inactive custom domain configuration', async () => {
    mockNetwork.onGet(`https://api.rebrandly.com/v1/domains`).replyOnce(200, inActiveCustomResponseMockData);

    expect(await getShortUrl(urlLocation)).toBe('rebrand.ly/utqowfl');
  });

  test('Domain Full Name response with custom domain configuration', async () => {
    mockNetwork.onGet(`https://api.rebrandly.com/v1/domains`).replyOnce(200, customResponseMockData);

    expect(await getCustomDomainFullName()).toBe('link.dataspace.copernicus.eu');
  });

  test('Domain Full Name response with default domain configuration', async () => {
    mockNetwork.onGet(`https://api.rebrandly.com/v1/domains`).replyOnce(200, defaultResponseMockData);

    expect(await getCustomDomainFullName()).toBe(undefined);
  });

  test('Inactive Domain Full Name response with custom domain configuration', async () => {
    mockNetwork.onGet(`https://api.rebrandly.com/v1/domains`).replyOnce(200, inActiveCustomResponseMockData);

    expect(await getCustomDomainFullName()).toBe(undefined);
  });
});

test.each([
  [S2L1C, false, 'Sentinel-2,Copernicus'],
  [GIBS_MODIS_TERRA, true, 'GIBS,NASA,EarthObservation,RemoteSensing'],
])('Getting appropriate hashtags', (datasetId, useDefault, expectedHashtags) => {
  const hashtags = getAppropriateHashtags(datasetId, useDefault);
  expect(hashtags).toBe(expectedHashtags);
});
