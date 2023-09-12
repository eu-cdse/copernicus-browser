import axios from 'axios';

import { getDataSourceHashtags } from '../../Tools/SearchPanel/dataSourceHandlers/dataSourceHandlers';

const DEFAULT_HASHTAGS = 'EarthObservation,RemoteSensing';

export function sendFirebaseRequest(urlLocation) {
  const url = `https://firebasedynamiclinks.googleapis.com/v1/shortLinks?key=${process.env.REACT_APP_FIREBASE_API_KEY}`;
  let longDynamicLink = 'https://sentinelshare.page.link/?link=' + encodeURIComponent(urlLocation);

  return axios({
    method: 'post',
    url: url,
    headers: { 'Content-Type': 'application/json' },
    data: {
      longDynamicLink: longDynamicLink,
      suffix: {
        option: 'SHORT',
      },
    },
  })
    .then((response) => {
      return response.data.shortLink;
    })
    .catch((err) => {
      console.error(err);
      return '';
    });
}

export function getAppropriateHashtags(datasetId, useDefault = true) {
  let hashtags = getDataSourceHashtags(datasetId);

  if (useDefault) {
    hashtags += `${hashtags.length ? ',' : ''}${DEFAULT_HASHTAGS}`;
  }
  return hashtags;
}
