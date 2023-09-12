import axios from 'axios';
import MockAdapter from 'axios-mock-adapter';

import { sendFirebaseRequest, getAppropriateHashtags } from './SocialShare.utils';
import { S2L1C, GIBS_MODIS_TERRA } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceConstants';

const mockNetwork = new MockAdapter(axios);

test('Sending Firebase Dynamic Links request', () => {
  const urlLocation =
    'https://apps.sentinel-hub.com/eo-browser/?zoom=18&lat=46.02417&lng=14.53691&themeId=DEFAULT-THEME&datasetId=S2L2A&fromTime=2020-06-29T00%3A00%3A00.000Z&toTime=2020-06-29T23%3A59%3A59.999Z&layerId=1_TRUE_COLOR&visualizationUrl=https%3A%2F%2Fservices.sentinel-hub.com%2Fogc%2Fwms%2Fbd86bc-YOUR-INSTANCEID-HERE';

  const expectedRequestUrl = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.REACT_APP_FIREBASE_API_KEY}`;
  const expectedPayload = {
    longDynamicLink: 'https://sentinelshare.page.link/?link=' + encodeURIComponent(urlLocation),
    suffix: {
      option: 'SHORT',
    },
  };

  const responseData = { shortLink: 'https://sentinelshare.page.link/lmao' };

  mockNetwork.onPost(expectedRequestUrl).replyOnce(200, responseData);

  sendFirebaseRequest(urlLocation).then(() => {
    expect(mockNetwork.history.post.length).toBe(1);
    expect(mockNetwork.history.post[0].data).toBe(JSON.stringify(expectedPayload));
  });
});

test.each([
  [S2L1C, false, 'Sentinel-2,Copernicus'],
  [GIBS_MODIS_TERRA, true, 'GIBS,NASA,EarthObservation,RemoteSensing'],
])('Getting appropriate hashtags', (datasetId, useDefault, expectedHashtags) => {
  const hashtags = getAppropriateHashtags(datasetId, useDefault);
  expect(hashtags).toBe(expectedHashtags);
});
